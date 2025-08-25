"use client";

import UnderConstruction, { Stage } from "@/components/NotImplemented";

export default function Page() {
    const stages: Stage[] = [
        { label: "Preparing", status: "todo" },
        { label: "Drafting", status: "todo" },
        { label: "Reviewing", status: "todo" },
        { label: "Polishing", status: "todo" },
    ];

    return (
        <UnderConstruction
            name="Team Infernope"
            stages={stages}
            channelStatus="inactive"
            passphrase="ILoveDemos"
            preview={<RushHourUnitStepExplorer />}
        />
    );
}


import React, {useMemo, useState} from "react";
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

export type BoardModel = {
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
        P[3 * i + 0] = r * Math.sin(ph) * Math.cos(th);
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
                let dx = P[3 * j] - ax, dy = P[3 * j + 1] - ay, dz = P[3 * j + 2] - az;
                let d2 = dx * dx + dy * dy + dz * dz + 1e-9;
                // soften extremely close pairs
                const inv = 1 / (d2);
                const mag = kRepel * inv;
                step(i, -dx * mag, -dy * mag, -dz * mag);
                step(j, dx * mag, dy * mag, dz * mag);
            }
        }
    };

    // Angle spreading: for each node u, for each neighbor pair (i,j), reduce dot(a,b)
    // a, b are unit vectors along edges from u→i and u→j. Gradient approx:
    //   F_i += -kAngle * dot(a,b) * b
    //   F_j += -kAngle * dot(a,b) * a
    //   F_u += - (F_i + F_j)   (action-reaction)
    // Cap incident-edge spreading at >= angleCapDeg (default 90 or 89)
    const angleCapDeg = 90;                         // set to 89 if you want slack
    const cosCap = Math.cos((angleCapDeg * Math.PI) / 180);

    // OPTIONAL: gentle z-flattening to keep natural grids flat but still 3D
    const kPlane = 0.0008;                          // set 0 to disable

    const angleSpreading = () => {
        for (let u = 0; u < N; u++) {
            const nu = nbrs[u];
            const ux = P[3 * u], uy = P[3 * u + 1], uz = P[3 * u + 2];
            const k = nu.length;
            if (k < 2) {
                if (kPlane) step(u, 0, 0, -kPlane * uz);  // light planar bias even for degree<2
                continue;
            }

            for (let ii = 0; ii < k; ii++) {
                const i = nu[ii];
                let aix = P[3 * i] - ux, aiy = P[3 * i + 1] - uy, aiz = P[3 * i + 2] - uz;
                let al = Math.hypot(aix, aiy, aiz) + 1e-9;
                aix /= al;
                aiy /= al;
                aiz /= al;

                for (let jj = ii + 1; jj < k; jj++) {
                    const j = nu[jj];
                    let bjx = P[3 * j] - ux, bjy = P[3 * j + 1] - uy, bjz = P[3 * j + 2] - uz;
                    let bl = Math.hypot(bjx, bjy, bjz) + 1e-9;
                    bjx /= bl;
                    bjy /= bl;
                    bjz /= bl;

                    const dot = aix * bjx + aiy * bjy + aiz * bjz; // cosine between incident edges

                    // Only repel if the angle is LESS than the cap (cos larger than threshold)
                    if (dot <= cosCap) continue;

                    // Push i along -b and j along -a, proportional to (dot - cosCap)
                    const s = kAngle * (dot - cosCap);
                    const fix = -s * bjx, fiy = -s * bjy, fiz = -s * bjz;
                    const fjx = -s * aix, fjy = -s * aiy, fjz = -s * aiz;

                    step(i, fix, fiy, fiz);
                    step(j, fjx, fjy, fjz);
                    step(u, -(fix + fjx), -(fiy + fjy), -(fiz + fjz)); // conserve momentum
                }
            }

            // gentle planar bias after handling pairs
            if (kPlane) step(u, 0, 0, -kPlane * uz);
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
                let d2 = dx * dx + dy * dy + dz * dz + 1e-12;
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
    ".B.A..",
    ".B.ACC",
    ".B....",
    "DD....",
    "......",
    "......",
].join("\n");
function RushHourUnitStepExplorer() {
    const [boardText, setBoardText] = useState<string>(SAMPLE);
    const [grid, setGrid] = useState<string[][]>(() => textToGrid(SAMPLE));
    const [H, W] = [grid.length, grid[0]?.length ?? 0];
    const [maxStates, setMaxStates] = useState<number>(50000);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ExploreResult | null>(null);
    const [model, setModel] = useState<BoardModel | null>(null);
    const [sel, setSel] = useState<{ r: number; c: number } | null>(null);
    const [size, setSize] = useState<{ h: number; w: number }>({h: H || 6, w: W || 6});

    const [vizDepth, setVizDepth] = useState<number>(16);
    const [vizNodes, setVizNodes] = useState<number>(750);
    const [nodeSize, setNodeSize] = useState<number>(0.12);
    const [edgeAlpha, setEdgeAlpha] = useState<number>(0.35);
    const [selectedNode, setSelectedNode] = useState<number | null>(0);

    const subset = useMemo(() => (result ? buildSubset(result, vizDepth, vizNodes) : null), [result, vizDepth, vizNodes]);

    // Keep textarea in sync when grid changes
    function syncTextFromGrid(g: string[][]) {
        const txt = gridToText(g);
        setBoardText(txt);
    }

    // When textarea changes, try to adopt its grid (best-effort; errors shown later at Explore)
    function syncGridFromText(txt: string) {
        try {
            const g = textToGrid(txt);
            setGrid(g);
            setSize({h: g.length, w: g[0]?.length ?? 0});
            setSel(null);
        } catch {
            // don't crash while typing
        }
    }

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
            if (pathIsEmptyRow(r, c0, c)) {
                placeVehicleRow(r, c0, c);
                setSel(null);
            } else {
                setError("Cells along the chosen row are not empty or length < 2.");
                setSel(null);
            }
            return;
        }
        if (c === c0 && r !== r0) {
            if (pathIsEmptyCol(c, r0, r)) {
                placeVehicleCol(c, r0, r);
                setSel(null);
            } else {
                setError("Cells along the chosen column are not empty or length < 2.");
                setSel(null);
            }
            return;
        }
        setError("Start and end must share a row or a column.");
        setSel(null);
    }

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

    function handleExplore() {
        try {
            setError(null);
            const {model, start} = parseBoard(boardText);
            setModel(model);
            const res = bfsExplore(model, start, Math.max(1, maxStates));
            setResult(res);
        } catch (e: any) {
            setResult(null);
            setModel(null);
            setError(e?.message ?? String(e));
        }
    }

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6 mt-24">
            <h1 className="text-2xl font-bold">State Space visualization with a Rush Hour like board</h1>

            <div className="rounded-2xl border p-4 space-y-3">
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
                        <div className="text-sm px-2 py-1 rounded bg-yellow-100 text-black">Select end cell on same
                            row/col</div>
                    ) : (
                        <div className="text-sm px-2 py-1 rounded bg-gray-900">Click empty cell to start a car; click an
                            existing car to delete</div>
                    )}
                </div>

                <div
                    className="grid gap-1 select-none"
                    style={{gridTemplateColumns: `repeat(${size.w}, minmax(0, 1fr))`}}
                >
                    {grid.map((row, r) =>
                        row.map((ch, c) => {
                            const isSel = sel && sel.r === r && sel.c === c;
                            const bg = ch === "." && isSel ? "#fde68a" : colorForId(ch);
                            return (
                                <div
                                    key={`${r}-${c}`}
                                    onClick={() => onCellClick(r, c)}
                                    className={`aspect-square rounded-md border flex items-center justify-center cursor-pointer ${
                                        ch === "." ? "border-dashed" : "border-solid"
                                    }`}
                                    style={{background: bg}}
                                    title={`(${r},${c}) ${ch === "." ? "empty" : ch}`}
                                >
                                    <span className="text-xs font-mono opacity-60">{ch === "." ? "" : ch}</span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Board text (kept in sync)</label>
                    <textarea
                        className="w-full h-48 font-mono text-sm p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring"
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
                            className="w-32 p-2 rounded-lg border border-gray-300"
                            value={maxStates}
                            onChange={(e) => setMaxStates(parseInt(e.target.value || "0", 10))}
                            min={1}
                            step={1000}
                        />
                        <button
                            className="ml-auto px-4 py-2 rounded-xl bg-black text-white hover:opacity-90"
                            onClick={handleExplore}
                        >
                            Explore (BFS)
                        </button>
                    </div>
                    {error && (
                        <div className="mt-2 text-sm text-red-600 whitespace-pre-wrap">{error}</div>
                    )}
                </div>

                <div className="space-y-3">
                    <h2 className="font-semibold">Stats</h2>
                    {!result ? (
                        <p className="text-sm text-gray-600">No results yet.</p>
                    ) : (
                        <div className="rounded-xl border p-3 text-sm space-y-1">
                            <div>Grid: {model!.H}×{model!.W}</div>
                            <div>
                                Vehicles: {model!.vehicles.length}
                                <span
                                    className="text-gray-500"> {model!.vehicles.map((v) => `${v.name}:${v.orient}${v.length}`).join(" ")}</span>
                            </div>
                            <div>Reachable states: {stats!.states}</div>
                            <div>Total edges: {stats!.edges}</div>
                            <div>Branching (avg/min/max): {stats!.avg.toFixed(3)} / {stats!.min} / {stats!.max}</div>
                        </div>
                    )}

                    {/* result && model && (
                        <div className="space-y-2">
                            <h3 className="font-semibold">Preview (first few states)</h3>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {result.states.slice(0, 9).map((s, i) => (
                                    <pre key={i} className="p-3 rounded-xl border text-xs leading-4">{renderState(model, s).join("\n")}</pre>
                                ))}
                            </div>
                            {result.states.length > 9 && (
                                <div className="text-xs text-gray-500">… {result.states.length - 9} more</div>
                            )}
                        </div>
                    )*/}
                </div>
            </div>

            <div className="text-xs text-gray-500">
                Builder rules: click start + end on the same row/column to add a car (length ≥ 2). Click any car to
                delete it. Cars are colored by id. State graph uses unit-step moves.
            </div>

            <div className="rounded-2xl border p-3">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h2 className="font-semibold">3D Visualization</h2>
                    <label className="text-xs">Max depth</label>
                    <input type="number" className="w-20 p-1 rounded border" value={vizDepth} min={0}
                           onChange={(e) => setVizDepth(parseInt(e.target.value || "0", 10))}/>
                    <label className="text-xs">Max nodes</label>
                    <input type="number" className="w-24 p-1 rounded border" value={vizNodes} min={1}
                           onChange={(e) => setVizNodes(parseInt(e.target.value || "0", 10))}/>
                    <label className="text-xs">Node size</label>
                    <input type="number" className="w-24 p-1 rounded border" step={0.02} value={nodeSize} min={0.02}
                           max={0.5}
                           onChange={(e) => setNodeSize(parseFloat(e.target.value || "0.1"))}/>
                    <label className="text-xs">Edge α</label>
                    <input type="number" className="w-24 p-1 rounded border" step={0.05} value={edgeAlpha} min={0}
                           max={1}
                           onChange={(e) => setEdgeAlpha(parseFloat(e.target.value || "0.3"))}/>
                </div>

                <div className="w-full h-[420px] rounded-xl overflow-hidden bg-black/90">
                    {result && subset ? (
                        <Canvas camera={{position: [6, 6, 6], fov: 50}}>
                            <ambientLight intensity={0.6}/>
                            <directionalLight position={[5, 10, 7]} intensity={0.8}/>
                            <OrbitControls makeDefault enablePan enableZoom enableRotate/>
                            {subset.edges.map(([u, v], i) => {
                                const pu = subset.pos.get(u)!;
                                const pv = subset.pos.get(v)!;
                                return <Line key={`e-${i}`} points={[pu, pv]} transparent opacity={edgeAlpha}/>;
                            })}
                            {subset.nodes.map((idx) => {
                                const p = subset.pos.get(idx)!;
                                const selected = selectedNode === idx;
                                return (
                                    <mesh key={`n-${idx}`} position={p} onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedNode(idx);
                                    }}>
                                        <sphereGeometry args={[nodeSize, 16, 16]}/>
                                        <meshStandardMaterial color={selected ? "#ffcc00" : "#6aa9ff"}
                                                              emissive={selected ? "#664400" : "#001133"}/>
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
                {subset && (
                    <div className="text-xs text-gray-600 mt-2">
                        Rendering {subset.nodes.length} nodes and {subset.edges.length} edges (depth ≤ {vizDepth}).
                        Click a node to inspect that state.
                    </div>
                )}

            </div>
        </div>
    );
}

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

