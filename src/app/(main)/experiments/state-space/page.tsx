"use client";

import React, {useEffect, useMemo, useState} from "react";
import {Canvas} from "@react-three/fiber";
import {OrbitControls, Line} from "@react-three/drei";

// Rush Hour – Unit-Step Explorer + Interactive Board Builder
// Fixes:
// - Removed malformed multiline strings (used template literals or "\n").
// - Fixed gridToText (was referencing undefined vars).
// - Restored colorForId function.
// - Added lightweight self-tests (see bottom pane) so regressions surface quickly.

// ----------------------------- Types -----------------------------

type Vehicle = {
    name: string; // single-character id
    orient: "H" | "V";
    fixed: number; // row if H, col if V
    length: number; // >= 2
    index: number; // stable index in vehicles[] order
};

type BoardModel = {
    H: number;
    W: number;
    vehicles: Vehicle[];
};

// ----------------------------- Helpers: grid <-> text -----------------------------

function normalizeBoardLines(lines: string[]): string[] {
    const trimmed = [...lines];
    while (trimmed.length && trimmed[0].trim() === "") trimmed.shift();
    while (trimmed.length && trimmed[trimmed.length - 1].trim() === "") trimmed.pop();
    if (!trimmed.length) throw new Error("No board data provided.");
    const W = Math.max(...trimmed.map((r) => r.length));
    // Replace spaces with '.' and right-pad with '.' to make a rectangle.
    return trimmed.map((r) => r.replace(/ /g, ".").padEnd(W, "."));
}

function textToGrid(text: string): string[][] {
    const lines = text.split(/\r?\n/);
    if (!lines.length) return [[]];
    const norm = normalizeBoardLines(lines);
    return norm.map((row) => row.split(""));
}

function gridToText(grid: string[][]): string {
    return grid.map((row) => row.join("")).join("\n");
}

function cloneGrid(grid: string[][]): string[][] {
    return grid.map((r) => r.slice());
}

function usedIds(grid: string[][]): Set<string> {
    const s = new Set<string>();
    for (const row of grid) for (const ch of row) if (ch !== ".") s.add(ch);
    return s;
}

function nextId(grid: string[][]): string {
    const used = usedIds(grid);
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (const ch of alphabet) if (!used.has(ch)) return ch;
    for (let code = 33; code < 127; code++) {
        const ch = String.fromCharCode(code);
        if (ch !== "." && !used.has(ch)) return ch;
    }
    throw new Error("Ran out of identifiers.");
}

// ----------------------------- Parsing -> model -----------------------------

function parseBoard(text: string): { model: BoardModel; start: number[] } {
    const lines = normalizeBoardLines(text.split(/\r?\n/));
    const H = lines.length;
    const W = lines[0].length;
    if (H === 0 || W === 0) throw new Error("Empty board.");

    const cells: Record<string, Array<[number, number]>> = {};
    for (let r = 0; r < H; r++) {
        if (lines[r].length !== W) throw new Error("Jagged board; unequal row lengths.");
        for (let c = 0; c < W; c++) {
            const ch = lines[r][c];
            if (ch === ".") continue;
            (cells[ch] ??= []).push([r, c]);
        }
    }
    const names = Object.keys(cells).sort();
    if (names.length === 0) throw new Error("No vehicles found.");

    const vehicles: Vehicle[] = [];
    const occupied = new Set<string>();

    for (let idx = 0; idx < names.length; idx++) {
        const name = names[idx];
        const coords = cells[name]!;
        if (coords.length < 2) throw new Error(`Vehicle '${name}' has length < 2.`);
        const rows = new Set(coords.map(([r]) => r));
        const cols = new Set(coords.map(([, c]) => c));

        if (rows.size === 1 && cols.size >= 2) {
            const r = [...rows][0];
            const sortedCols = [...cols].sort((a, b) => a - b);
            for (let x = sortedCols[0]; x <= sortedCols[sortedCols.length - 1]; x++) {
                if (!coords.some(([rr, cc]) => rr === r && cc === x))
                    throw new Error(`Vehicle '${name}' not contiguous horizontally.`);
            }
            const length = coords.length;
            const fixed = r;
            const left = Math.min(...coords.map(([, c]) => c));
            vehicles.push({name, orient: "H", fixed, length, index: idx});
            cells[name] = [];
            for (let c = left; c < left + length; c++) cells[name]!.push([fixed, c]);
        } else if (cols.size === 1 && rows.size >= 2) {
            const c = [...cols][0];
            const sortedRows = [...rows].sort((a, b) => a - b);
            for (let y = sortedRows[0]; y <= sortedRows[sortedRows.length - 1]; y++) {
                if (!coords.some(([rr, cc]) => rr === y && cc === c))
                    throw new Error(`Vehicle '${name}' not contiguous vertically.`);
            }
            const length = coords.length;
            const fixed = c;
            const top = Math.min(...coords.map(([r]) => r));
            vehicles.push({name, orient: "V", fixed, length, index: idx});
            cells[name] = [];
            for (let r0 = top; r0 < top + length; r0++) cells[name]!.push([r0, fixed]);
        } else {
            throw new Error(`Vehicle '${name}' is not a 1×x straight block.`);
        }

        for (const [r, c] of cells[name]!) {
            const key = `${r},${c}`;
            if (occupied.has(key)) throw new Error(`Overlap detected at cell (${r},${c}).`);
            occupied.add(key);
        }
    }

    const start = new Array(vehicles.length).fill(0);
    for (const v of vehicles) {
        const occ = cells[v.name]!;
        if (v.orient === "H") {
            const left = Math.min(...occ.map(([, c]) => c));
            if (!(0 <= left && left <= W - v.length))
                throw new Error(`Vehicle '${v.name}' out of bounds horizontally.`);
            start[v.index] = left;
        } else {
            const top = Math.min(...occ.map(([r]) => r));
            if (!(0 <= top && top <= H - v.length))
                throw new Error(`Vehicle '${v.name}' out of bounds vertically.`);
            start[v.index] = top;
        }
    }

    return {model: {H, W, vehicles}, start};
}

// ----------------------------- Neighbors (unit step) -----------------------------

function buildOccupancy(model: BoardModel, state: number[]): number[][] {
    const grid = Array.from({length: model.H}, () => Array(model.W).fill(-1));
    for (const v of model.vehicles) {
        const pos = state[v.index];
        if (v.orient === "H") {
            const r = v.fixed;
            for (let dc = 0; dc < v.length; dc++) grid[r][pos + dc] = v.index;
        } else {
            const c = v.fixed;
            for (let dr = 0; dr < v.length; dr++) grid[pos + dr][c] = v.index;
        }
    }
    return grid;
}

function neighborsUnitStep(model: BoardModel, state: number[]): number[][] {
    const H = model.H, W = model.W;
    const grid = buildOccupancy(model, state);
    const nbrs: number[][] = [];

    for (const v of model.vehicles) {
        const pos = state[v.index];
        if (v.orient === "H") {
            const r = v.fixed;
            if (pos - 1 >= 0 && grid[r][pos - 1] === -1) {
                const s = state.slice();
                s[v.index] = pos - 1;
                nbrs.push(s);
            }
            const rightAfter = pos + v.length;
            if (rightAfter < W && grid[r][rightAfter] === -1) {
                const s = state.slice();
                s[v.index] = pos + 1;
                nbrs.push(s);
            }
        } else {
            const c = v.fixed;
            if (pos - 1 >= 0 && grid[pos - 1][c] === -1) {
                const s = state.slice();
                s[v.index] = pos - 1;
                nbrs.push(s);
            }
            const belowAfter = pos + v.length;
            if (belowAfter < H && grid[belowAfter][c] === -1) {
                const s = state.slice();
                s[v.index] = pos + 1;
                nbrs.push(s);
            }
        }
    }
    return nbrs;
}

// ----------------------------- BFS -----------------------------

type ExploreResult = {
    states: number[][];
    edges: number[][];
};

function bfsExplore(model: BoardModel, start: number[], maxStates: number): ExploreResult {
    const key = (s: number[]) => s.join(",");
    const idOf = new Map<string, number>();
    const states: number[][] = [];
    const edges: number[][] = [];
    const q: number[] = [];

    idOf.set(key(start), 0);
    states.push(start.slice());
    edges.push([]);
    q.push(0);

    for (let qi = 0; qi < q.length; qi++) {
        const u = q[qi];
        const s = states[u];
        const nbrs = neighborsUnitStep(model, s);
        const out: number[] = [];
        for (const t of nbrs) {
            const k = key(t);
            let j = idOf.get(k);
            if (j === undefined) {
                j = states.length;
                idOf.set(k, j);
                states.push(t);
                edges.push([]);
                q.push(j);
                if (states.length >= maxStates) {
                    out.push(j);
                    continue;
                }
            }
            out.push(j);
        }
        edges[u] = out;
        if (states.length >= maxStates) break;
    }

    return {states, edges};
}

function colorForId(id: string): string {
    if (id === ".") return "transparent";
    const code = id.charCodeAt(0);
    const h = (code * 57) % 360;
    const s = 70;
    const l = 70;
    return `hsl(${h} ${s}% ${l}%)`;
}

type GraphSubset = {
    nodes: number[];
    depth: Map<number, number>;
    pos: Map<number, [number, number, number]>;
    edges: Array<[number, number]>;
};

function computeDepths(edges: number[][], start = 0): Map<number, number> {
    const depth = new Map<number, number>();
    const q = [start];
    depth.set(start, 0);
    for (let i = 0; i < q.length; i++) {
        const u = q[i];
        for (const v of edges[u] ?? []) if (!depth.has(v)) {
            depth.set(v, (depth.get(u) || 0) + 1);
            q.push(v);
        }
    }
    return depth;
}

function buildSubset(result: ExploreResult, maxDepth: number, maxNodes: number): GraphSubset {
    const depth = computeDepths(result.edges, 0);
    const byDepth = new Map<number, number[]>();
    for (const [n, d] of depth) if (d <= maxDepth) (byDepth.get(d) ?? byDepth.set(d, []).get(d)!).push(n);

    const nodes: number[] = [];
    for (let d = 0; d <= maxDepth && nodes.length < maxNodes; d++) {
        const arr = (byDepth.get(d) ?? []);
        for (let i = 0; i < arr.length && nodes.length < maxNodes; i++) nodes.push(arr[i]);
    }
    const include = new Set(nodes);

    const edges: Array<[number, number]> = [];
    for (const u of nodes) for (const v of result.edges[u] ?? []) if (include.has(v)) edges.push([u, v]);

    const pos = forceDirectedLayout(nodes, edges, {
        iterations: 220,
        L: 1.2,
        kSpring: 0.05,
        kRepel: 0.08,
        kAngle: 0.06,
        gravity: 0.002,
        dt: 0.9
    });
    return {nodes, depth, pos, edges};
}

function forceDirectedLayout(
    nodes: number[],
    edges: Array<[number, number]>,
    opts: {
        iterations: number;
        L: number;
        kSpring: number;
        kRepel: number;
        kAngle: number;
        gravity: number;
        dt: number
    }
): Map<number, [number, number, number]> {
    const {iterations, L, kSpring, kRepel, kAngle, gravity, dt} = opts;

    // Index map
    const idx = new Map<number, number>();
    nodes.forEach((n, i) => idx.set(n, i));
    const N = nodes.length;

    // Adjacency for angle forces
    const nbrs: number[][] = Array.from({length: N}, () => []);
    for (const [a, b] of edges) {
        const ia = idx.get(a);
        const ib = idx.get(b);
        if (ia === undefined || ib === undefined) continue;
        nbrs[ia].push(ib);
        nbrs[ib].push(ia);
    }

    // Init positions in a small ball; velocities zero
    const P = new Float32Array(N * 3);
    const V = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
        const r = 0.5, th = Math.random() * 2 * Math.PI, ph = Math.acos(2 * Math.random() - 1);
        P[3 * i] = r * Math.sin(ph) * Math.cos(th);
        P[3 * i + 1] = r * Math.sin(ph) * Math.sin(th);
        P[3 * i + 2] = r * Math.cos(ph);
    }

    const F = new Float32Array(N * 3);
    const step = (i: number, fx: number, fy: number, fz: number) => {
        F[3 * i] += fx;
        F[3 * i + 1] += fy;
        F[3 * i + 2] += fz;
    };

    // Helper: add spring forces for edges (equalize length to L)
    const springs = () => {
        for (const [a, b] of edges) {
            const ia = idx.get(a)!;
            const ib = idx.get(b)!;
            const ax = P[3 * ia], ay = P[3 * ia + 1], az = P[3 * ia + 2];
            const bx = P[3 * ib], by = P[3 * ib + 1], bz = P[3 * ib + 2];
            let dx = bx - ax, dy = by - ay, dz = bz - az;
            const d2 = dx * dx + dy * dy + dz * dz + 1e-9;
            const d = Math.sqrt(d2);
            const m = kSpring * (d - L) / d;
            dx *= m;
            dy *= m;
            dz *= m;
            step(ia, dx, dy, dz);
            step(ib, -dx, -dy, -dz);
        }
    };

    // Approx repulsion: simple O(N^2) with soft cap; good enough up to ~1k nodes
    const repulsion = () => {
        for (let i = 0; i < N; i++) {
            const ax = P[3 * i], ay = P[3 * i + 1], az = P[3 * i + 2];
            for (let j = i + 1; j < N; j++) {
                const dx = P[3 * j] - ax, dy = P[3 * j + 1] - ay, dz = P[3 * j + 2] - az;
                const d2 = dx * dx + dy * dy + dz * dz + 1e-9;
                // soften extremely close pairs
                const inv = 1 / (d2);
                const mag = kRepel * inv;
                step(i, -dx * mag, -dy * mag, -dz * mag);
                step(j, dx * mag, dy * mag, dz * mag);
            }
        }
    };

    // Angle spreading: keep your <90° cap, plus a gentle "aim for 90°" nudge near orthogonality.
    const angleCapDeg = 90; // repel if angle < cap
    const cosCap = Math.cos((angleCapDeg * Math.PI) / 180);

// NEW: near-orthogonality nudge
// Apply only when |dot| <= orthoBand: this softly drives dot -> 0 (≈90°) from either side.
// Pick small kOrtho; increase gradually if you need more structure.
    const kOrtho = 0.02;     // strength of 90° nudge (very gentle)
    const orthoBand = 0.30;  // act when |cosθ| ≤ 0.30  (≈ 72°–108° window)

    const angleSpreading = () => {
        for (let u = 0; u < N; u++) {
            const nu = nbrs[u];
            const ux = P[3 * u], uy = P[3 * u + 1], uz = P[3 * u + 2];
            const k = nu.length;
            if (k < 2) continue;

            for (let ii = 0; ii < k; ii++) {
                const i = nu[ii];
                let aix = P[3 * i] - ux, aiy = P[3 * i + 1] - uy, aiz = P[3 * i + 2] - uz;
                const al = Math.hypot(aix, aiy, aiz) + 1e-9;
                aix /= al;
                aiy /= al;
                aiz /= al;

                for (let jj = ii + 1; jj < k; jj++) {
                    const j = nu[jj];
                    let bjx = P[3 * j] - ux, bjy = P[3 * j + 1] - uy, bjz = P[3 * j + 2] - uz;
                    const bl = Math.hypot(bjx, bjy, bjz) + 1e-9;
                    bjx /= bl;
                    bjy /= bl;
                    bjz /= bl;

                    const dot = aix * bjx + aiy * bjy + aiz * bjz; // cos between incident edges

                    // 1) Keep your "< cap" repulsion (angle < 90° if cap=90)
                    if (dot > cosCap) {
                        const s = kAngle * (dot - cosCap);
                        const fix = -s * bjx, fiy = -s * bjy, fiz = -s * bjz;
                        const fjx = -s * aix, fjy = -s * aiy, fjz = -s * aiz;

                        step(i, fix, fiy, fiz);
                        step(j, fjx, fjy, fjz);
                        step(u, -(fix + fjx), -(fiy + fjy), -(fiz + fjz));
                        continue;
                    }

                    // 2) NEW: near-orthogonality nudge (pull dot toward 0 when close to 90°)
                    // Gradient of (1/2)*dot^2 wrt directions gives forces:
                    //   F_i += -kOrtho * dot * b
                    //   F_j += -kOrtho * dot * a
                    //   F_u += -(F_i + F_j)
                    const absDot = Math.abs(dot);
                    if (absDot <= orthoBand) {
                        const s = kOrtho * dot; // sign matters: pushes dot toward 0 from either side
                        const fix = -s * bjx, fiy = -s * bjy, fiz = -s * bjz;
                        const fjx = -s * aix, fjy = -s * aiy, fjz = -s * aiz;

                        step(i, fix, fiy, fiz);
                        step(j, fjx, fjy, fjz);
                        step(u, -(fix + fjx), -(fiy + fjy), -(fiz + fjz));
                    }
                }
            }
        }
    };


    // Minimum allowed distance between nodes
    const dMin = 3;      // adjust to taste
    const kMin = 1;      // stiffness of the pushback

    const minDistanceConstraint = () => {
        for (let i = 0; i < N; i++) {
            const ax = P[3 * i], ay = P[3 * i + 1], az = P[3 * i + 2];
            for (let j = i + 1; j < N; j++) {
                let dx = P[3 * j] - ax,
                    dy = P[3 * j + 1] - ay,
                    dz = P[3 * j + 2] - az;
                const d2 = dx * dx + dy * dy + dz * dz + 1e-12;
                const d = Math.sqrt(d2);
                if (d >= dMin) continue;

                // normalized vector
                dx /= d;
                dy /= d;
                dz /= d;

                // penetration depth
                const overlap = dMin - d;
                const f = kMin * overlap;  // linear penalty

                // apply equal and opposite forces
                step(i, -dx * f, -dy * f, -dz * f);
                step(j, dx * f, dy * f, dz * f);
            }
        }
    };

    function projectMinDistance(P: Float32Array, N: number, dMin: number, iters = 6) {
        const eps = 1e-12, d2Min = dMin * dMin;
        for (let k = 0; k < iters; k++) {
            for (let i = 0; i < N; i++) {
                const ix = 3 * i;
                const iy = ix + 1;
                const iz = ix + 2;
                for (let j = i + 1; j < N; j++) {
                    const jx = 3 * j, jy = jx + 1, jz = jx + 2;
                    let dx = P[jx] - P[ix], dy = P[jy] - P[iy], dz = P[jz] - P[iz];
                    let d2 = dx * dx + dy * dy + dz * dz;
                    if (d2 >= d2Min) continue;
                    if (d2 < eps) { // coincident → deterministic nudge
                        dx = 1;
                        dy = 0;
                        dz = 0;
                        d2 = 1;
                    }
                    const d = Math.sqrt(d2), overlap = (dMin - d) * 0.5; // split correction
                    const nx = dx / d, ny = dy / d, nz = dz / d;
                    const cx = nx * overlap, cy = ny * overlap, cz = nz * overlap;
                    P[ix] -= cx;
                    P[iy] -= cy;
                    P[iz] -= cz;
                    P[jx] += cx;
                    P[jy] += cy;
                    P[jz] += cz;
                }
            }
        }
    }


    // Mild gravity to the origin
    const gravityPull = () => {
        for (let i = 0; i < N; i++) {
            const x = P[3 * i], y = P[3 * i + 1], z = P[3 * i + 2];
            step(i, -gravity * x, -gravity * y, -gravity * z);
        }
    };

    // Integrate
    const damp = 0.9;
    for (let t = 0; t < iterations; t++) {
        F.fill(0);
        springs();
        repulsion();
        angleSpreading();
        gravityPull();
        minDistanceConstraint();

        // Euler with damping
        for (let i = 0; i < N; i++) {
            V[3 * i] = (V[3 * i] + F[3 * i] * dt) * damp;
            V[3 * i + 1] = (V[3 * i + 1] + F[3 * i + 1] * dt) * damp;
            V[3 * i + 2] = (V[3 * i + 2] + F[3 * i + 2] * dt) * damp;

            P[3 * i] += V[3 * i] * dt;
            P[3 * i + 1] += V[3 * i + 1] * dt;
            P[3 * i + 2] += V[3 * i + 2] * dt;
        }
    }

    // Scale to a reasonable viewing size
    let maxR = 1e-6;
    for (let i = 0; i < N; i++) {
        const x = P[3 * i], y = P[3 * i + 1], z = P[3 * i + 2];
        maxR = Math.max(maxR, Math.hypot(x, y, z));
    }
    const s = 1 / maxR;
    const out = new Map<number, [number, number, number]>();
    for (let i = 0; i < N; i++) out.set(nodes[i], [P[3 * i] * s * 6, P[3 * i + 1] * s * 6, P[3 * i + 2] * s * 6]);
    return out;
}


// ----------------------------- UI: Interactive Board Builder -----------------------------
const SAMPLE = [
    "......",
    "......",
    "......",
    "..AA..",
    "..CB..",
    "..CB..",
].join("\n");

function RushHourUnitStepExplorer() {
    // --- builder / I/O ---
    const [boardText, setBoardText] = useState<string>(SAMPLE);
    const [grid, setGrid] = useState<string[][]>(() => textToGrid(SAMPLE));
    const [H, W] = [grid.length, grid[0]?.length ?? 0];
    const [maxStates, setMaxStates] = useState<number>(50_000);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ExploreResult | null>(null);
    const [model, setModel] = useState<BoardModel | null>(null);
    const [sel, setSel] = useState<{ r: number; c: number } | null>(null);
    const [size, setSize] = useState<{ h: number; w: number }>({h: H || 6, w: W || 6})
    const [allowed, setAllowed] = useState<Set<string>>(new Set());

    // --- viz controls ---
    const [vizDepth, setVizDepth] = useState<number>(16);
    const [vizNodes, setVizNodes] = useState<number>(750);
    const [nodeSize, setNodeSize] = useState<number>(0.12);
    const [edgeAlpha, setEdgeAlpha] = useState<number>(0.35);

    // --- explorer (play) state tied to the graph ---
    const [selectedNode, setSelectedNode] = useState<number | null>(null);   // current pointer in graph
    const [playPath, setPlayPath] = useState<number[]>([]);                  // path of node indices

    // --- collapsible panel state ---
    const [builderOpen, setBuilderOpen] = useState<boolean>(true);
    const [explorerOpen, setExplorerOpen] = useState<boolean>(true);

    const subset = useMemo(
        () => (result ? buildSubset(result, vizDepth, vizNodes) : null),
        [result, vizDepth, vizNodes]
    );

    // keep textarea in sync with grid
    function syncTextFromGrid(g: string[][]) {
        setBoardText(gridToText(g));
    }

    // adopt grid from textarea while typing (best effort)
    function syncGridFromText(txt: string) {
        try {
            const g = textToGrid(txt);
            setGrid(g);
            setSize({h: g.length, w: g[0]?.length ?? 0});
            setSel(null);
        } catch {
            // ignore parse errors while typing
        }
    }

    // builder helpers
    function resizeGrid(newH: number, newW: number) {
        const h = Math.max(2, Math.min(30, newH | 0));
        const w = Math.max(2, Math.min(30, newW | 0));
        const g = Array.from({length: h}, (_, r) =>
            Array.from({length: w}, (_, c) => (r < H && c < W ? grid[r][c] : "."))
        );
        setGrid(g);
        setSize({h, w});
        setSel(null);
        syncTextFromGrid(g);
    }

    function clearGrid() {
        const g = Array.from({length: size.h}, () => Array(size.w).fill("."));
        setGrid(g);
        setSel(null);
        syncTextFromGrid(g);
    }

    function deleteVehicleAt(r: number, c: number) {
        const id = grid[r][c];
        if (id === ".") return;
        const g = cloneGrid(grid);
        for (let cc = 0; cc < size.w; cc++) if (g[r][cc] === id) g[r][cc] = ".";
        for (let rr = 0; rr < size.h; rr++) if (g[rr][c] === id) g[rr][c] = ".";
        setGrid(g);
        syncTextFromGrid(g);
    }

    function pathIsEmptyRow(r: number, c1: number, c2: number): boolean {
        const [a, b] = c1 <= c2 ? [c1, c2] : [c2, c1];
        for (let c = a; c <= b; c++) if (grid[r][c] !== ".") return false;
        return b - a + 1 >= 2;
    }

    function pathIsEmptyCol(c: number, r1: number, r2: number): boolean {
        const [a, b] = r1 <= r2 ? [r1, r2] : [r2, r1];
        for (let r = a; r <= b; r++) if (grid[r][c] !== ".") return false;
        return b - a + 1 >= 2;
    }

    function placeVehicleRow(r: number, c1: number, c2: number) {
        const [a, b] = c1 <= c2 ? [c1, c2] : [c2, c1];
        const id = nextId(grid);
        const g = cloneGrid(grid);
        for (let c = a; c <= b; c++) g[r][c] = id;
        setGrid(g);
        syncTextFromGrid(g);
    }

    function placeVehicleCol(c: number, r1: number, r2: number) {
        const [a, b] = r1 <= r2 ? [r1, r2] : [r2, r1];
        const id = nextId(grid);
        const g = cloneGrid(grid);
        for (let r = a; r <= b; r++) g[r][c] = id;
        setGrid(g);
        syncTextFromGrid(g);
    }

    function onCellClick(r: number, c: number) {
        setError(null);
        if (!sel) {
            if (grid[r][c] !== ".") {
                deleteVehicleAt(r, c);
                return;
            }
            setSel({r, c});
            return;
        }
        const {r: r0, c: c0} = sel;
        if (r === r0 && c === c0) {
            setSel(null);
            return;
        }
        if (r === r0 && c !== c0) {
            if (pathIsEmptyRow(r, c0, c)) placeVehicleRow(r, c0, c);
            else setError("Cells along the chosen row are not empty or length < 2.");
            setSel(null);
            return;
        }
        if (c === c0 && r !== r0) {
            if (pathIsEmptyCol(c, r0, r)) placeVehicleCol(c, r0, r);
            else setError("Cells along the chosen column are not empty or length < 2.");
            setSel(null);
            return;
        }
        setError("Start and end must share a row or a column.");
        setSel(null);
    }

    // stats
    const stats = useMemo(() => {
        if (!result) return null;
        const edges = result.edges;
        const degs = edges.map((e) => e.length);
        const edgeCount = degs.reduce((a, b) => a + b, 0);
        const avg = degs.length ? edgeCount / degs.length : 0;
        const min = degs.length ? Math.min(...degs) : 0;
        const max = degs.length ? Math.max(...degs) : 0;
        return {states: result.states.length, edges: edgeCount, avg, min, max};
    }, [result]);

    // run BFS
    function handleExplore() {
        try {
            setError(null);
            const {model, start} = parseBoard(boardText);
            setModel(model);
            const res = bfsExplore(model, start, Math.max(1, maxStates));
            setResult(res);
        } catch (e: unknown) {
            if (e instanceof Error) setError(e.message);
            else setError(String(e));
        }
    }

    // initialize explorer when new result arrives
    useEffect(() => {
        if (!result) return;
        setSelectedNode(0);
        setPlayPath([0]);
    }, [result]);

    // explorer helpers
    const currentState = useMemo<number[] | null>(() => {
        if (!result || selectedNode == null) return null;
        return result.states[selectedNode] ?? null;
    }, [result, selectedNode]);

    function neighborsOf(idx: number): number[] {
        if (!result) return [];
        return result.edges[idx] ?? [];
    }

    function jumpToNode(idx: number, mode: "extend" | "reset" = "extend") {
        if (!result) return;
        if (selectedNode == null) {
            setSelectedNode(idx);
            setPlayPath([idx]);
            return;
        }
        if (mode === "reset") {
            setSelectedNode(idx);
            setPlayPath([idx]);
            return;
        }
        const last = playPath[playPath.length - 1];
        if (last != null && neighborsOf(last).includes(idx)) {
            setSelectedNode(idx);
            setPlayPath((p) => [...p, idx]);
        } else {
            // not adjacent; start a new path from this node
            setSelectedNode(idx);
            setPlayPath([idx]);
        }
    }

    function undoStep() {
        if (playPath.length <= 1) return;
        const next = playPath.slice(0, -1);
        setPlayPath(next);
        setSelectedNode(next[next.length - 1] ?? null);
    }

    // edges along the path (for highlighting)
    const pathEdges = useMemo<[number, number][]>(() => {
        const out: [number, number][] = [];
        for (let i = 1; i < playPath.length; i++) out.push([playPath[i - 1], playPath[i]]);
        return out;
    }, [playPath]);

    // --- layout ---
    return (
        <div className="flex flex-col">
            {/* ── Immersive 3D explorer (concept B) ── */}
            <section className="relative w-full h-[calc(100vh-53px)] min-h-165 bg-bg overflow-hidden border-b border-rule">
                {/* top strip */}
                <div className="absolute top-0 left-0 right-0 z-20 flex items-center gap-4 flex-wrap px-6 py-4 pointer-events-none bg-linear-to-b from-bg to-transparent">
                    <div className="font-mono text-[11px] tracking-kicker uppercase text-accent flex items-center gap-2">
                        <span>STATE SPACE</span><span className="text-fg-soft">·</span><span>3D EXPLORER</span>
                    </div>
                    <div className="flex-1" />
                    {stats && (
                        <div className="flex items-center gap-x-6 gap-y-1 flex-wrap font-mono text-[11px] tracking-kicker uppercase text-fg-soft">
                            <span>States <span className="text-fg">{stats.states.toLocaleString()}</span></span>
                            <span>Edges <span className="text-fg">{stats.edges.toLocaleString()}</span></span>
                            <span>Branching <span className="text-fg">{stats.avg.toFixed(1)}</span></span>
                        </div>
                    )}
                </div>

                {/* floating builder panel (top-left) */}
                <section className="absolute z-10 top-16 left-3 lg:left-5 w-[min(300px,calc(100%-24px))] max-h-[calc(100%-150px)] overflow-y-auto rounded-xl border border-rule bg-[color-mix(in_srgb,var(--bg-elev)_82%,transparent)] backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
                    {/* header row */}
                    <button
                        type="button"
                        onClick={() => setBuilderOpen((o) => !o)}
                        aria-expanded={builderOpen}
                        className="w-full flex items-center gap-2 px-5 py-3.5 border-b border-rule text-left hover:bg-[color-mix(in_srgb,var(--bg-elev)_50%,transparent)] transition-colors"
                    >
                        <h2 className="font-mono text-[11px] tracking-kicker uppercase text-fg-soft">Board Builder</h2>
                        <svg
                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2"
                            className={`ml-auto h-4 w-4 text-fg-soft transition-transform ${builderOpen ? "" : "-rotate-90"}`}
                        >
                            <path d="M6 9l6 6 6-6"/>
                        </svg>
                    </button>

                    {/* collapsible body */}
                    <div className={`${builderOpen ? "block" : "hidden"} p-5 space-y-4`}>
                        <div className="flex gap-3 items-center flex-wrap">
                            <div className="flex items-center gap-2">
                                <label className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">Rows</label>
                                <input
                                    type="number"
                                    className="w-20 px-2 py-1.5 rounded border border-rule bg-bg font-mono text-[12px] text-fg"
                                    min={2}
                                    max={30}
                                    value={size.h}
                                    onChange={(e) => resizeGrid(parseInt(e.target.value || "0", 10), size.w)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">Cols</label>
                                <input
                                    type="number"
                                    className="w-20 px-2 py-1.5 rounded border border-rule bg-bg font-mono text-[12px] text-fg"
                                    min={2}
                                    max={30}
                                    value={size.w}
                                    onChange={(e) => resizeGrid(size.h, parseInt(e.target.value || "0", 10))}
                                />
                            </div>
                            <button onClick={clearGrid}
                                    className="px-3 py-2 rounded border border-rule bg-bg hover:border-rule-strong font-mono text-[11px] tracking-kicker uppercase transition-colors">Clear
                            </button>

                        </div>
                        {sel ? (
                            <div
                                className="font-mono text-[10px] px-2 py-1 rounded bg-accent-soft text-accent border border-accent">Select
                                end cell</div>
                        ) : (
                            <div
                                className="font-mono text-[10px] px-2 py-1 rounded border border-rule text-fg-soft">Click
                                empty to start · click car to delete</div>
                        )}
                        {/* Builder grid */}
                        <div
                            className="grid gap-1 select-none"
                            style={{gridTemplateColumns: `repeat(${size.w}, minmax(0, 1fr))`}}
                        >
                            {grid.map((row, r) =>
                                row.map((ch, c) => {
                                    const isSel = sel && sel.r === r && sel.c === c;
                                    const isAllowed = allowed.has(`${r}-${c}`);
                                    const bg =
                                        ch === "." && isSel ? "#fde68a" :
                                            ch === "." && isAllowed ? "#fef3c7" :
                                                colorForId(ch);

                                    return (
                                        <div
                                            key={`${r}-${c}`}
                                            onClick={() => {
                                                // --- DELETE path: clicking a non-empty cell always triggers your handler immediately
                                                if (grid[r][c] !== ".") {
                                                    onCellClick(r, c);          // your existing delete logic
                                                    // also clear any pending selection/highlights
                                                    setSel(null);
                                                    setAllowed(new Set());
                                                    return;
                                                }

                                                // --- PLACE path
                                                // First click: start selection from an empty cell and compute allowed targets inline
                                                if (!sel) {
                                                    const ok = new Set<string>();
                                                    // left
                                                    for (let cc = c - 1; cc >= 0; cc--) {
                                                        if (grid[r][cc] !== ".") break;
                                                        ok.add(`${r}-${cc}`);
                                                    }
                                                    // right
                                                    for (let cc = c + 1; cc < grid[0].length; cc++) {
                                                        if (grid[r][cc] !== ".") break;
                                                        ok.add(`${r}-${cc}`);
                                                    }
                                                    // up
                                                    for (let rr = r - 1; rr >= 0; rr--) {
                                                        if (grid[rr][c] !== ".") break;
                                                        ok.add(`${rr}-${c}`);
                                                    }
                                                    // down
                                                    for (let rr = r + 1; rr < grid.length; rr++) {
                                                        if (grid[rr][c] !== ".") break;
                                                        ok.add(`${rr}-${c}`);
                                                    }
                                                    setSel({r, c});
                                                    setAllowed(ok);
                                                    return;
                                                }

                                                // Second click: place only if clicking a highlighted empty cell; otherwise cancel
                                                if (allowed.has(`${r}-${c}`)) onCellClick(r, c);
                                                setSel(null);
                                                setAllowed(new Set());
                                            }}
                                            className={`aspect-square rounded-md border flex items-center justify-center cursor-pointer ${
                                                ch === "." ? "border-dashed" : "border-solid"
                                            } ${isAllowed ? "ring-1 ring-amber-300/70" : ""}`}
                                            style={{background: bg, opacity: isAllowed ? 0.3 : 1}}
                                            title={`(${r},${c}) ${ch === "." ? "empty" : ch}`}
                                            data-allowed={isAllowed ? "1" : "0"}
                                        >
                                            <span className="text-xs font-mono opacity-60">{ch === "." ? "" : ch}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>


                        {/* Text + Explore trigger */}
                        <div className="space-y-2">
                            {/*<label className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">Board
                                text</label>
                            <textarea
                                className="w-full h-24 font-mono text-[12px] p-3 rounded border border-rule bg-bg text-fg focus:outline-none focus:border-rule-strong"
                                value={boardText}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setBoardText(v);
                                    syncGridFromText(v);
                                }}
                            />*/}
                            <div className="flex items-center gap-3">
                                <label className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">Max
                                    States</label>
                                <input
                                    type="number"
                                    className="w-28 px-2 py-1.5 rounded border border-rule bg-bg font-mono text-[12px] text-fg"
                                    value={maxStates}
                                    onChange={(e) => setMaxStates(parseInt(e.target.value || "0", 10))}
                                    min={1}
                                    step={1000}
                                />
                            </div>
                            <button
                                onClick={handleExplore}
                                className="ml-auto inline-flex items-center gap-2 px-4 py-2.5 rounded border border-fg bg-fg text-bg hover:opacity-90 font-mono text-[11px] tracking-kicker uppercase transition-opacity"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" strokeWidth="2"
                                     className="h-5 w-5">
                                    <path d="M5 12h14M12 5l7 7-7 7"/>
                                </svg>
                                Explore (BFS)
                            </button>
                            {error &&
                                <div className="mt-2 font-mono text-[11px] text-bad whitespace-pre-wrap">{error}</div>}
                        </div>
                    </div>
                </section>

                {/* floating view controls (bottom-right) */}
                {/*<div className="absolute z-10 bottom-5 right-3 lg:right-5 w-[260px] max-w-[calc(100%-24px)] rounded-xl border border-rule bg-[color-mix(in_srgb,var(--bg-elev)_82%,transparent)] backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.35)] p-4">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h2 className="font-mono text-[11px] tracking-kicker uppercase text-fg-soft">View</h2>
                        <label className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">Depth</label>
                        <input type="number"
                               className="w-20 px-2 py-1 rounded border border-rule bg-bg font-mono text-[11px] text-fg"
                               value={vizDepth} min={0}
                               onChange={(e) => setVizDepth(parseInt(e.target.value || "0", 10))}/>
                        <label className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">Nodes</label>
                        <input type="number"
                               className="w-24 px-2 py-1 rounded border border-rule bg-bg font-mono text-[11px] text-fg"
                               value={vizNodes} min={1}
                               onChange={(e) => setVizNodes(parseInt(e.target.value || "0", 10))}/>
                        <label className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">Node sz</label>
                        <input type="number"
                               className="w-24 px-2 py-1 rounded border border-rule bg-bg font-mono text-[11px] text-fg"
                               step={0.02} value={nodeSize} min={0.02} max={0.5}
                               onChange={(e) => setNodeSize(parseFloat(e.target.value || "0.1"))}/>
                        <label className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">Edge α</label>
                        <input type="number"
                               className="w-24 px-2 py-1 rounded border border-rule bg-bg font-mono text-[11px] text-fg"
                               step={0.05} value={edgeAlpha} min={0} max={1}
                               onChange={(e) => setEdgeAlpha(parseFloat(e.target.value || "0.3"))}/>
                    </div>
                </div>*/}

                {/* full-bleed 3D graph */}
                <div className="absolute inset-0 z-0">
                    <div className="w-full h-full">
                        {result && subset ? (
                            <Canvas camera={{position: [6, 6, 6], fov: 50}}>
                                <ambientLight intensity={0.6}/>
                                <directionalLight position={[5, 10, 7]} intensity={0.8}/>
                                <OrbitControls makeDefault enablePan enableZoom enableRotate/>
                                {/* background edges */}
                                {subset.edges.map(([u, v], i) => {
                                    const pu = subset.pos.get(u);
                                    const pv = subset.pos.get(v);
                                    if (!pu || !pv) return null;
                                    return <Line key={`e-${i}`} points={[pu, pv]} transparent opacity={edgeAlpha}/>;
                                })}
                                {/* path highlight edges */}
                                {subset &&
                                    pathEdges.map(([u, v], i) => {
                                        const pu = subset.pos.get(u);
                                        const pv = subset.pos.get(v);
                                        if (!pu || !pv) return null; // not in subset view
                                        return <Line key={`pe-${i}`} points={[pu, pv]} lineWidth={2} color="#ffcc00"
                                                     transparent opacity={0.95}/>;
                                    })}
                                {/* nodes */}
                                {subset.nodes.map((idx) => {
                                    const p = subset.pos.get(idx)!;
                                    const isVisited = playPath.includes(idx);
                                    const isSelected = selectedNode === idx;
                                    return (
                                        <mesh
                                            key={`n-${idx}`}
                                            position={p}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                jumpToNode(idx, "extend"); // clicking viz extends path if adjacent; else resets to start at idx
                                            }}
                                        >
                                            <sphereGeometry
                                                args={[nodeSize * (isSelected ? 1.25 : isVisited ? 1.1 : 1), 16, 16]}/>
                                            <meshStandardMaterial
                                                color={isSelected ? "#ffcc00" : isVisited ? "#6aa92f" : "#6aa9ff"}
                                                emissive={isSelected ? "#664400" : isVisited ? "#123300" : "#001133"}
                                            />
                                        </mesh>
                                    );
                                })}
                            </Canvas>
                        ) : (
                            <div
                                className="w-full h-full flex items-center justify-center font-mono text-[11px] text-fg-soft">
                                Run BFS to view the graph.
                            </div>
                        )}
                    </div>
                </div>

                {/* legend / stats (bottom-left) */}
                {/*<div
                    className="absolute z-10 bottom-5 left-5 w-[420px] max-w-[calc(100%-40px)] hidden lg:grid grid-cols-2 gap-3 rounded-xl border border-rule bg-[color-mix(in_srgb,var(--bg-elev)_82%,transparent)] backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.35)] p-4">
                    <div className="rounded border border-rule bg-bg p-3 text-[13px] space-y-1">
                        <h3 className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft mb-2">Stats</h3>
                        {!result ? (
                            <p className="text-fg-soft text-[12px]">Run BFS first.</p>
                        ) : (
                            <>
                                <div>Grid: {model!.H}×{model!.W}</div>
                                <div>
                                    Vehicles: {model!.vehicles.length}
                                    <span className="text-gray-500">
                                            {" "}
                                        {model!.vehicles.map((v) => `${v.name}:${v.orient}${v.length}`).join(" ")}
                                        </span>
                                </div>
                                <div>Reachable states: {stats!.states}</div>
                                <div>Total edges: {stats!.edges}</div>
                                <div>Branching
                                    (avg/min/max): {stats!.avg.toFixed(3)} / {stats!.min} / {stats!.max}</div>
                            </>
                        )}
                    </div>
                    <div className="rounded border border-rule bg-bg p-3 font-mono text-[11px] text-fg-muted">
                        <div>Path length: {Math.max(0, playPath.length - 1)}</div>
                        <div>Selected node: {selectedNode ?? "-"}</div>
                        {subset && (
                            <div className="mt-2 text-[10px] text-fg-soft">
                                Rendering {subset.nodes.length} nodes / {subset.edges.length} edges (depth
                                ≤ {vizDepth}).<br/>
                                Click nodes to extend path; yellow edges = your moves.
                            </div>
                        )}
                    </div>
                </div>*/}
                {/* floating explorer (top-right) */}
                <section className="absolute z-10 top-16 right-5 w-75 max-h-[calc(100%-150px)] overflow-y-auto hidden lg:block rounded-xl border border-rule bg-[color-mix(in_srgb,var(--bg-elev)_82%,transparent)] backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
                    {/* header row */}
                    <button
                        type="button"
                        onClick={() => setExplorerOpen((o) => !o)}
                        aria-expanded={explorerOpen}
                        className="w-full flex items-center gap-2 px-5 py-3.5 border-b border-rule text-left hover:bg-[color-mix(in_srgb,var(--bg-elev)_50%,transparent)] transition-colors"
                    >
                        <h2 className="font-mono text-[11px] tracking-kicker uppercase text-fg-soft">Explorer</h2>
                        <svg
                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2"
                            className={`ml-auto h-4 w-4 text-fg-soft transition-transform ${explorerOpen ? "" : "-rotate-90"}`}
                        >
                            <path d="M6 9l6 6 6-6"/>
                        </svg>
                    </button>

                    {/* collapsible body */}
                    <div className={`${explorerOpen ? "block" : "hidden"} p-5 space-y-3`}>
                        <div className="flex items-center gap-2">
                            <div className="ml-auto flex gap-2">
                                <button
                                    className="px-3 py-1.5 rounded border border-rule bg-bg hover:border-rule-strong font-mono text-[11px] tracking-kicker uppercase transition-colors"
                                    onClick={() => {
                                        if (!result) return;
                                        jumpToNode(0, "reset");
                                    }}
                                    disabled={!result}
                                    title="Reset to start"
                                >
                                    Reset
                                </button>
                                <button
                                    className="px-3 py-1.5 rounded border border-rule bg-bg hover:border-rule-strong font-mono text-[11px] tracking-kicker uppercase transition-colors disabled:opacity-40"
                                    onClick={undoStep}
                                    disabled={playPath.length <= 1}
                                    title="Undo last step"
                                >
                                    Undo
                                </button>
                            </div>
                        </div>

                        {/* current board */}
                        <div className="rounded border border-rule bg-bg p-3">
                            {!result || !model || currentState == null ? (
                                <div className="font-mono text-[11px] text-fg-soft">Run BFS, then pick a node.</div>
                            ) : (
                                <BoardPreview model={model} state={currentState}/>
                            )}
                        </div>

                        {/* neighbors preview */}
                        <div className="space-y-2">
                            <h3 className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">Neighbors</h3>
                            {!result || selectedNode == null ? (
                                <div className="font-mono text-[11px] text-fg-soft">No node selected.</div>
                            ) : (
                                <div className="max-h-114 overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-2">
                                        {neighborsOf(selectedNode).map((nIdx) => (
                                            <button
                                                key={nIdx}
                                                onClick={() => jumpToNode(nIdx, "extend")}
                                                className="rounded border border-rule bg-bg hover:border-rule-strong transition-colors"
                                                title={`Go to node ${nIdx}`}
                                            >
                                                <MiniBoard model={model!} state={result.states[nIdx]}/>
                                            </button>
                                        ))}
                                        {neighborsOf(selectedNode).length === 0 && (
                                            <div className="font-mono text-[11px] text-fg-soft col-span-2">No outgoing
                                                moves.</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </section>

            {/* docs below the immersive view */}
            <div className="mx-auto max-w-275 px-8 pb-16">
                {/* ── How to use ──────────────────────────────────────────── */}
                <div className="mt-10 border-t border-rule pt-8 grid md:grid-cols-3 gap-8">
                    <HowToStep num="01" title="Build a board">
                        Click any empty cell to start placing a vehicle, then click a second cell on the
                        same row or column to set its length. Click an existing vehicle to delete it.
                        Resize the grid with the Rows / Cols inputs.
                    </HowToStep>
                    <HowToStep num="02" title="Run BFS">
                        Hit <Mono>Explore (BFS)</Mono> to enumerate every board configuration reachable
                        from your starting layout by sliding vehicles one step at a time. Max States caps
                        the search — lower it if the graph is slow to compute.
                    </HowToStep>
                    <HowToStep num="03" title="Explore the graph">
                        Each node in the 3D graph is one board configuration. Drag to rotate, scroll to
                        zoom. Click a node to jump to it in the Explorer panel — the board on the right
                        updates to show that state. Neighbour thumbnails show every valid one-step move.
                        Yellow edges trace your path through the graph.
                    </HowToStep>
                </div>

                <dl className="mt-6 border-t border-rule">
                    <GlossaryItem term="State">
                        One complete snapshot of the board — the position of every vehicle. Two states
                        are the same if and only if all vehicles occupy identical positions.
                    </GlossaryItem>
                    <GlossaryItem term="Edge">
                        A directed connection between two states that differ by exactly one vehicle
                        moving one cell. The graph is symmetric: every move is reversible.
                    </GlossaryItem>
                    <GlossaryItem term="Depth / Max depth">
                        BFS depth from the starting state. Depth 0 = your initial board. Depth 1 = all
                        boards reachable in one move. Raising the depth slider shows more of the graph
                        but can get slow above ~1000 nodes.
                    </GlossaryItem>
                    <GlossaryItem term="Branching factor">
                        Average number of edges per node — how many valid moves exist from a typical
                        board. Shown in Stats after BFS completes.
                    </GlossaryItem>
                </dl>
            </div>
        </div>

    );
}

function HowToStep({num, title, children}: { num: string; title: string; children: React.ReactNode }) {
    return (
        <div>
            <div className="flex items-baseline gap-3 mb-2 pb-2 border-b border-rule">
                <span className="font-mono text-[11px] tracking-kicker text-accent">{num} —</span>
                <h3 className="font-semibold text-[15px] tracking-[-0.005em]">{title}</h3>
            </div>
            <p className="text-[14px] text-fg-muted leading-[1.65]">{children}</p>
        </div>
    );
}

function GlossaryItem({term, children}: { term: string; children: React.ReactNode }) {
    return (
        <div className="flex gap-8 py-3 border-b border-rule items-baseline">
            <dt className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft shrink-0 w-[160px]">{term}</dt>
            <dd className="m-0 text-[13.5px] text-fg-muted leading-[1.55]">{children}</dd>
        </div>
    );
}

function Mono({children}: { children: React.ReactNode }) {
    return <span
        className="font-mono text-[11px] bg-bg-elev border border-rule rounded px-1.5 py-0.5 text-fg">{children}</span>;
}

/** Large board preview for the Explorer current node */
function BoardPreview({model, state}: { model: BoardModel; state: number[] }) {
    const lines = renderState(model, state);
    return (
        <div
            className="grid gap-1"
            style={{gridTemplateColumns: `repeat(${model.W}, minmax(0, 1fr))`}}
        >
            {lines.map((row, r) =>
                row.split("").map((ch, c) => {
                    const bg = ch === "." ? "transparent" : colorForId(ch);
                    return (
                        <div
                            key={`${r}-${c}`}
                            className={`aspect-square rounded-md border ${ch === "." ? "border-dashed" : "border-solid"}`}
                            style={{background: bg}}
                            title={`(${r},${c}) ${ch === "." ? "empty" : ch}`}
                        >
                            <span className="sr-only">{ch}</span>
                        </div>
                    );
                })
            )}
        </div>
    );
}

/** Tiny board thumbnail used in the Neighbors list */
function MiniBoard({model, state}: { model: BoardModel; state: number[] }) {
    const lines = renderState(model, state);
    return (
        <div
            className="grid gap-0.5 p-2"
            style={{gridTemplateColumns: `repeat(${model.W}, minmax(0, 1fr))`}}
        >
            {lines.map((row, r) =>
                row.split("").map((ch, c) => {
                    const bg = ch === "." ? "transparent" : colorForId(ch);
                    return (
                        <div
                            key={`${r}-${c}`}
                            className="aspect-square rounded-[3px] border"
                            style={{background: bg}}
                        />
                    );
                })
            )}
        </div>
    );
}

// unchanged
function renderState(model: BoardModel, state: number[]): string[] {
    const grid: string[][] = Array.from({length: model.H}, () => Array(model.W).fill("."));
    for (const v of model.vehicles) {
        const pos = state[v.index];
        if (v.orient === "H") {
            const r = v.fixed;
            for (let dc = 0; dc < v.length; dc++) grid[r][pos + dc] = v.name;
        } else {
            const c = v.fixed;
            for (let dr = 0; dr < v.length; dr++) grid[pos + dr][c] = v.name;
        }
    }
    return grid.map((row) => row.join(""));
}


const Preview1x1: React.FC = () => {
    const BOARDS = [
        [
            "......",
            "......",
            "......",
            "..AA..",
            "..CB..",
            "..CB..",
        ].join("\n"),

        [
            ".....A",
            "..BB.A",
            ".....A",
            "..CC..",
            "......",
            "......",
        ].join("\n"),

        [
            "......",
            "..AA..",
            "..BCDD",
            "..BC..",
            "....EE",
            "......",
        ].join("\n"),

        [
            "......",
            "......",
            ".AACC.",
            "......",
            "..DDDE",
            ".....E",
        ].join("\n"),

        [
            "......",
            "..AA..",
            ".BBC..",
            "...CDD",
            "......",
            "......",
        ].join("\n"),

        [
            "......",
            "AA....",
            "...CC.",
            "..EE..",
            "DDD...",
            "......",
        ].join("\n"),
    ];

    const boardText = React.useMemo(
        () => BOARDS[Math.floor(Math.random() * BOARDS.length)],
        []
    );
    const g = textToGrid(boardText);                 // or any board text you want
    const H = g.length;
    const W = g[0]?.length ?? 0;

    return (
        <div className="aspect-square w-full rounded-xl overflow-hidden p-1">
            <div
                className="grid h-full w-full gap-0.5"
                style={{gridTemplateColumns: `repeat(${W}, 1fr)`, gridTemplateRows: `repeat(${H}, 1fr)`}}
            >
                {g.map((row, r) =>
                    row.map((ch, c) => (
                        <div
                            key={`${r}-${c}`}
                            className={`rounded-[3px] border ${ch === "." ? "border-dashed border-rule" : "border-solid border-rule"}`}
                            style={{background: ch === "." ? "transparent" : colorForId(ch)}}
                            aria-hidden
                        />
                    ))
                )}
            </div>
        </div>
    );
};


export default function StateSpacePage() {
    return <RushHourUnitStepExplorer/>;
}