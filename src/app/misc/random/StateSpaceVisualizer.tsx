"use client";

import type { DemoModule } from "./registry";
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
                aix /= al; aiy /= al; aiz /= al;

                for (let jj = ii + 1; jj < k; jj++) {
                    const j = nu[jj];
                    let bjx = P[3 * j] - ux, bjy = P[3 * j + 1] - uy, bjz = P[3 * j + 2] - uz;
                    const bl = Math.hypot(bjx, bjy, bjz) + 1e-9;
                    bjx /= bl; bjy /= bl; bjz /= bl;

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

    function projectMinDistance(P: Float32Array, N: number, dMin: number, iters=6){
        const eps = 1e-12, d2Min = dMin*dMin;
        for (let k=0;k<iters;k++){
            for (let i=0;i<N;i++){
                const ix=3*i; const iy=ix+1; const iz=ix+2;
                for (let j=i+1;j<N;j++){
                    const jx=3*j, jy=jx+1, jz=jx+2;
                    let dx=P[jx]-P[ix], dy=P[jy]-P[iy], dz=P[jz]-P[iz];
                    let d2=dx*dx+dy*dy+dz*dz;
                    if (d2>=d2Min) continue;
                    if (d2<eps){ // coincident → deterministic nudge
                        dx=1; dy=0; dz=0; d2=1;
                    }
                    const d=Math.sqrt(d2), overlap=(dMin-d)*0.5; // split correction
                    const nx=dx/d, ny=dy/d, nz=dz/d;
                    const cx=nx*overlap, cy=ny*overlap, cz=nz*overlap;
                    P[ix]-=cx; P[iy]-=cy; P[iz]-=cz;
                    P[jx]+=cx; P[jy]+=cy; P[jz]+=cz;
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
    const [size, setSize] = useState<{ h: number; w: number }>({ h: H || 6, w: W || 6 })
    const [allowed, setAllowed] = useState<Set<string>>(new Set());

    // --- viz controls ---
    const [vizDepth, setVizDepth] = useState<number>(16);
    const [vizNodes, setVizNodes] = useState<number>(750);
    const [nodeSize, setNodeSize] = useState<number>(0.12);
    const [edgeAlpha, setEdgeAlpha] = useState<number>(0.35);

    // --- explorer (play) state tied to the graph ---
    const [selectedNode, setSelectedNode] = useState<number | null>(null);   // current pointer in graph
    const [playPath, setPlayPath] = useState<number[]>([]);                  // path of node indices

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
            setSize({ h: g.length, w: g[0]?.length ?? 0 });
            setSel(null);
        } catch {
            // ignore parse errors while typing
        }
    }

    // builder helpers
    function resizeGrid(newH: number, newW: number) {
        const h = Math.max(2, Math.min(30, newH | 0));
        const w = Math.max(2, Math.min(30, newW | 0));
        const g = Array.from({ length: h }, (_, r) =>
            Array.from({ length: w }, (_, c) => (r < H && c < W ? grid[r][c] : "."))
        );
        setGrid(g);
        setSize({ h, w });
        setSel(null);
        syncTextFromGrid(g);
    }
    function clearGrid() {
        const g = Array.from({ length: size.h }, () => Array(size.w).fill("."));
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
            setSel({ r, c });
            return;
        }
        const { r: r0, c: c0 } = sel;
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
        return { states: result.states.length, edges: edgeCount, avg, min, max };
    }, [result]);

    // run BFS
    function handleExplore() {
        try {
            setError(null);
            const { model, start } = parseBoard(boardText);
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
        <div className="mx-auto max-w-[1400px] p-6 pt-24">
            <h1 className="text-2xl font-bold mb-4">State-Space + Explorer (Rush Hour)</h1>

            {/* Desktop-first: 3 columns on lg */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT: Builder */}
                <section className="lg:col-span-4 rounded-2xl border p-4 space-y-4">
                    <h2 className="font-semibold">Interactive Board Builder</h2>
                    <div className="flex gap-3 items-center flex-wrap">
                        <div className="flex items-center gap-2">
                            <label className="text-sm">Rows</label>
                            <input
                                type="number"
                                className="w-20 p-2 rounded-lg border"
                                min={2}
                                max={30}
                                value={size.h}
                                onChange={(e) => resizeGrid(parseInt(e.target.value || "0", 10), size.w)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm">Cols</label>
                            <input
                                type="number"
                                className="w-20 p-2 rounded-lg border"
                                min={2}
                                max={30}
                                value={size.w}
                                onChange={(e) => resizeGrid(size.h, parseInt(e.target.value || "0", 10))}
                            />
                        </div>
                        <button onClick={clearGrid} className="px-3 py-2 rounded-xl border">Clear</button>
                        {sel ? (
                            <div className="text-xs px-2 py-1 rounded bg-yellow-100 text-black">Select end on same row/col</div>
                        ) : (
                            <div className="text-xs px-2 py-1 rounded bg-gray-900">Click empty to start; click car to delete</div>
                        )}
                    </div>

                    {/* Builder grid */}
                    <div
                        className="grid gap-1 select-none"
                        style={{ gridTemplateColumns: `repeat(${size.w}, minmax(0, 1fr))` }}
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
                                                setSel({ r, c });
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
                                        style={{ background: bg, opacity: isAllowed? 0.3 : 1 }}
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
                        <label className="text-sm font-medium">Board text</label>
                        <textarea
                            className="w-full h-15 font-mono text-sm p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring"
                            value={boardText}
                            onChange={(e) => {
                                const v = e.target.value;
                                setBoardText(v);
                                syncGridFromText(v);
                            }}
                        />
                        <div className="flex items-center gap-3">
                            <label className="text-sm">Max States</label>
                            <input
                                type="number"
                                className="w-28 p-2 rounded-lg border border-gray-300"
                                value={maxStates}
                                onChange={(e) => setMaxStates(parseInt(e.target.value || "0", 10))}
                                min={1}
                                step={1000}
                            />
                            <button
                                onClick={handleExplore}
                                className="ml-auto inline-flex items-center gap-2 p-3 rounded-xl
              bg-emerald-600 text-white font-semibold text-sm shadow-md
               hover:bg-emerald-500 active:bg-emerald-700
               focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2
               transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" strokeWidth="2"
                                     className="h-5 w-5">
                                    <path d="M5 12h14M12 5l7 7-7 7"/>
                                </svg>
                                Explore (BFS)
                            </button>

                        </div>
                        {error && <div className="mt-2 text-sm text-red-600 whitespace-pre-wrap">{error}</div>}
                    </div>

                    <p className="text-xs text-gray-500">
                        Rule: start+end on same row/col adds a car (length ≥2). Click car to delete.
                    </p>
                </section>

                {/* MIDDLE: 3D + Stats */}
                <section className="lg:col-span-5 rounded-2xl border p-4">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h2 className="font-semibold">3D Visualization</h2>
                        <label className="text-xs">Max depth</label>
                        <input type="number" className="w-20 p-1 rounded border" value={vizDepth} min={0}
                               onChange={(e) => setVizDepth(parseInt(e.target.value || "0", 10))} />
                        <label className="text-xs">Max nodes</label>
                        <input type="number" className="w-24 p-1 rounded border" value={vizNodes} min={1}
                               onChange={(e) => setVizNodes(parseInt(e.target.value || "0", 10))} />
                        <label className="text-xs">Node size</label>
                        <input type="number" className="w-24 p-1 rounded border" step={0.02} value={nodeSize} min={0.02} max={0.5}
                               onChange={(e) => setNodeSize(parseFloat(e.target.value || "0.1"))} />
                        <label className="text-xs">Edge α</label>
                        <input type="number" className="w-24 p-1 rounded border" step={0.05} value={edgeAlpha} min={0} max={1}
                               onChange={(e) => setEdgeAlpha(parseFloat(e.target.value || "0.3"))} />
                    </div>

                    <div className="w-full h-[480px] rounded-xl overflow-hidden bg-black/90">
                        {result && subset ? (
                            <Canvas camera={{ position: [6, 6, 6], fov: 50 }}>
                                <ambientLight intensity={0.6} />
                                <directionalLight position={[5, 10, 7]} intensity={0.8} />
                                <OrbitControls makeDefault enablePan enableZoom enableRotate />
                                {/* background edges */}
                                {subset.edges.map(([u, v], i) => {
                                    const pu = subset.pos.get(u);
                                    const pv = subset.pos.get(v);
                                    if (!pu || !pv) return null;
                                    return <Line key={`e-${i}`} points={[pu, pv]} transparent opacity={edgeAlpha} />;
                                })}
                                {/* path highlight edges */}
                                {subset &&
                                    pathEdges.map(([u, v], i) => {
                                        const pu = subset.pos.get(u);
                                        const pv = subset.pos.get(v);
                                        if (!pu || !pv) return null; // not in subset view
                                        return <Line key={`pe-${i}`} points={[pu, pv]} lineWidth={2} color="#ffcc00" transparent opacity={0.95} />;
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
                                            <sphereGeometry args={[nodeSize * (isSelected ? 1.25 : isVisited ? 1.1 : 1), 16, 16]} />
                                            <meshStandardMaterial
                                                color={isSelected ? "#ffcc00" : isVisited ? "#6aa92f" : "#6aa9ff"}
                                                emissive={isSelected ? "#664400" : isVisited ? "#123300" : "#001133"}
                                            />
                                        </mesh>
                                    );
                                })}
                            </Canvas>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                                Run BFS to view the graph.
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="rounded-xl border p-3 text-sm space-y-1">
                            <h3 className="font-semibold text-sm">Stats</h3>
                            {!result ? (
                                <p className="text-gray-600 text-sm">No results.</p>
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
                                    <div>Branching (avg/min/max): {stats!.avg.toFixed(3)} / {stats!.min} / {stats!.max}</div>
                                </>
                            )}
                        </div>
                        <div className="rounded-xl border p-3 text-xs text-gray-600">
                            <div>Path length: {Math.max(0, playPath.length - 1)}</div>
                            <div>Selected node: {selectedNode ?? "-"}</div>
                            {subset && (
                                <div className="mt-1 text-[11px] text-gray-500">
                                    Rendering {subset.nodes.length} nodes / {subset.edges.length} edges (depth ≤ {vizDepth}).<br />
                                    Click nodes to extend path; yellow edges = your moves.
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* RIGHT: Explorer (play board) */}
                <section className="lg:col-span-3 rounded-2xl border p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <h2 className="font-semibold">Explorer</h2>
                        <div className="ml-auto flex gap-2">
                            <button
                                className="px-3 py-1.5 rounded-lg border"
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
                                className="px-3 py-1.5 rounded-lg border"
                                onClick={undoStep}
                                disabled={playPath.length <= 1}
                                title="Undo last step"
                            >
                                Undo
                            </button>
                        </div>
                    </div>

                    {/* current board */}
                    <div className="rounded-xl border p-3">
                        {!result || !model || currentState == null ? (
                            <div className="text-sm text-gray-500">Run BFS, then pick a node.</div>
                        ) : (
                            <BoardPreview model={model} state={currentState} />
                        )}
                    </div>

                    {/* neighbors preview */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm">Neighbors</h3>
                        {!result || selectedNode == null ? (
                            <div className="text-xs text-gray-500">No node selected.</div>
                        ) : (
                            <div className="max-h-114 overflow-y-auto">
                                <div className="grid grid-cols-2 gap-2">
                                    {neighborsOf(selectedNode).map((nIdx) => (
                                        <button
                                            key={nIdx}
                                            onClick={() => jumpToNode(nIdx, "extend")}
                                            className="rounded-lg border hover:shadow-sm transition"
                                            title={`Go to node ${nIdx}`}
                                        >
                                            <MiniBoard model={model!} state={result.states[nIdx]} />
                                        </button>
                                    ))}
                                    {neighborsOf(selectedNode).length === 0 && (
                                        <div className="text-xs text-gray-500 col-span-2">No outgoing moves.</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

/** Large board preview for the Explorer current node */
function BoardPreview({ model, state }: { model: BoardModel; state: number[] }) {
    const lines = renderState(model, state);
    return (
        <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${model.W}, minmax(0, 1fr))` }}
        >
            {lines.map((row, r) =>
                row.split("").map((ch, c) => {
                    const bg = ch === "." ? "transparent" : colorForId(ch);
                    return (
                        <div
                            key={`${r}-${c}`}
                            className={`aspect-square rounded-md border ${ch === "." ? "border-dashed" : "border-solid"}`}
                            style={{ background: bg }}
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
function MiniBoard({ model, state }: { model: BoardModel; state: number[] }) {
    const lines = renderState(model, state);
    return (
        <div
            className="grid gap-[2px] p-2"
            style={{ gridTemplateColumns: `repeat(${model.W}, minmax(0, 1fr))` }}
        >
            {lines.map((row, r) =>
                row.split("").map((ch, c) => {
                    const bg = ch === "." ? "transparent" : colorForId(ch);
                    return (
                        <div
                            key={`${r}-${c}`}
                            className="aspect-square rounded-[3px] border"
                            style={{ background: bg }}
                        />
                    );
                })
            )}
        </div>
    );
}

// unchanged
function renderState(model: BoardModel, state: number[]): string[] {
    const grid: string[][] = Array.from({ length: model.H }, () => Array(model.W).fill("."));
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
            "......",
            "..BB..",
            "..AA..",
            "..CC..",
            "......",
            "......",
        ].join("\n"),

        [
            ".......",
            "..AA..",
            "..BCDD",
            "..BC..",
            "....EE",
            "......",
        ].join("\n"),

        [
            "......",
            ".BB...",
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
            "........",
            "..AA....",
            "..BB.CC.",
            "....EE..",
            "..DDD...",
            "........",
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
                className="grid h-full w-full gap-[2px]"
                style={{ gridTemplateColumns: `repeat(${W}, 1fr)`, gridTemplateRows: `repeat(${H}, 1fr)` }}
            >
                {g.map((row, r) =>
                    row.map((ch, c) => (
                        <div
                            key={`${r}-${c}`}
                            className={`rounded-[3px] border ${ch === "." ? "border-dashed border-zinc-500" : "border-solid border-zinc-300"}`}
                            style={{ background: ch === "." ? "transparent" : colorForId(ch) }}
                            aria-hidden
                        />
                    ))
                )}
            </div>
        </div>
    );
};

const Page: React.FC = () => <RushHourUnitStepExplorer/>;
const preview = <Preview1x1/>;

export const title = "State Space Visualizer";
export const description = "Explore state transitions in a board of a game of Rush Hour.";

const mod: DemoModule = { title, description, preview, Page, presentable: true };
export default mod;
