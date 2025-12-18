"use client";

import { useState } from "react";
import {DemoModule} from "@/app/misc/random/registry";

/* =======================
   CONFIG
======================= */

const ROWS = 6;
const COLS = 8;

/* =======================
   TYPES
======================= */

type Cell = { r: number; c: number };

/* =======================
   BASIC HAMILTONIAN
======================= */

function generateHamiltonianBasic(rows: number, cols: number): Cell[] {
    const path: Cell[] = [];

    for (let c = 0; c < cols; c++) {
        if (c % 2 === 0) {
            for (let r = 1; r < rows; r++) path.push({ r, c });
        } else {
            for (let r = rows - 1; r >= 1; r--) path.push({ r, c });
        }
    }

    for (let c = cols - 1; c >= 0; c--) {
        path.push({ r: 0, c });
    }

    return path;
}

/* =======================
   HELPERS
======================= */

const key = (c: Cell) => `${c.r},${c.c}`;
const isAdj = (a: Cell, b: Cell) =>
    Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;

function rotate<T>(arr: T[], k: number): T[] {
    const n = arr.length;
    k = ((k % n) + n) % n;
    return [...arr.slice(k), ...arr.slice(0, k)];
}

/* =======================
   PERMUTATION MOVES
======================= */

// 1️⃣ Rotate cycle (pure permutation)
function rotateCycle(path: Cell[]): Cell[] {
    console.log("rotateCycle");
    return rotate(path, Math.floor(Math.random() * path.length));
}

// 2️⃣ Reverse direction
function reverseCycle(path: Cell[]): Cell[] {
    console.log("reverseCycle");
    return [path[0], ...path.slice(1).reverse()];
}

// 3️⃣ TRUE 2×2 plaquette flip
function plaquetteFlip(path: Cell[]): Cell[] {
    const next = new Map<string, Cell>();
    const prev = new Map<string, Cell>();

    for (let i = 0; i < path.length; i++) {
        const a = path[i];
        const b = path[(i + 1) % path.length];
        next.set(key(a), b);
        prev.set(key(b), a);
    }

    const hasEdge = (u: Cell, v: Cell) =>
        (next.get(key(u))?.r === v.r && next.get(key(u))?.c === v.c) ||
        (prev.get(key(u))?.r === v.r && prev.get(key(u))?.c === v.c);

    // Try random plaquettes
    for (let tries = 0; tries < 100; tries++) {
        const r = Math.floor(Math.random() * (ROWS - 1));
        const c = Math.floor(Math.random() * (COLS - 1));

        const a = { r, c };
        const b = { r, c: c + 1 };
        const d = { r: r + 1, c };
        const e = { r: r + 1, c: c + 1 };

        const horiz = hasEdge(a, b) && hasEdge(d, e);
        const vert  = hasEdge(a, d) && hasEdge(b, e);
        if (!horiz && !vert) continue;

        if (horiz) {
            // remove a-b and d-e
            const pa = prev.get(key(a))!;
            const pb = next.get(key(b))!;
            const pd = prev.get(key(d))!;
            const pe = next.get(key(e))!;

            next.set(key(pa), b);
            prev.set(key(b), pa);

            next.set(key(a), d);
            prev.set(key(d), a);

            next.set(key(pd), e);
            prev.set(key(e), pd);

            next.set(key(d), pe);
            prev.set(key(pe), d);
        } else {
            // remove a-d and b-e
            const pa = prev.get(key(a))!;
            const pd = next.get(key(d))!;
            const pb = prev.get(key(b))!;
            const pe = next.get(key(e))!;

            next.set(key(pa), d);
            prev.set(key(d), pa);

            next.set(key(a), b);
            prev.set(key(b), a);

            next.set(key(pb), e);
            prev.set(key(e), pb);

            next.set(key(b), pe);
            prev.set(key(pe), b);
        }

        // rebuild
        const rebuilt: Cell[] = [];
        let cur = path[0];
        const seen = new Set<string>();

        while (!seen.has(key(cur))) {
            rebuilt.push(cur);
            seen.add(key(cur));
            cur = next.get(key(cur))!;
        }

        if (rebuilt.length === path.length) {
            return rebuilt;
        }
    }

    return path;
}


// 4️⃣ Guaranteed-visible random move
function randomShuffle(path: Cell[]): Cell[] {
    console.log("randomShuffle");
    let p = path;
    for (let i = 0; i < 5; i++) {
        p = plaquetteFlip(p);
        p = rotateCycle(p);
    }
    return p;
}

/* =======================
   PAGE
======================= */

function HamiltonianPermuter() {
    const [path, setPath] = useState<Cell[]>(
        generateHamiltonianBasic(ROWS, COLS)
    );

    const btn =
        "px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700";

    return (
        <div className="bg-black text-white min-h-screen flex flex-col mt-24">
            {/* Controls */}
            <div className="flex gap-3 p-4 border-b border-zinc-800">
                <button className={btn} onClick={() => setPath(p => rotateCycle(p))}>
                    Rotate
                </button>
                <button className={btn} onClick={() => setPath(p => reverseCycle(p))}>
                    Reverse
                </button>
                <button className={btn} onClick={() => setPath(p => plaquetteFlip(p))}>
                    2×2 Flip
                </button>
                <button className={btn} onClick={() => setPath(p => randomShuffle(p))}>
                    Random
                </button>
            </div>

            {/* Grid */}
            <div className="flex-1 grid place-items-center">
                <div
                    className="relative grid"
                    style={{
                        gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                        width: "min(90vw, 90vh)",
                        aspectRatio: `${COLS} / ${ROWS}`,
                    }}
                >
                    {/* Path */}
                    {path.map((cell, i) => {
                        const next = path[(i + 1) % path.length];
                        return (
                            <svg
                                key={i}
                                className="absolute inset-0 pointer-events-none"
                                viewBox={`0 0 ${COLS * 100} ${ROWS * 100}`}
                            >
                                <line
                                    x1={cell.c * 100 + 50}
                                    y1={cell.r * 100 + 50}
                                    x2={next.c * 100 + 50}
                                    y2={next.r * 100 + 50}
                                    stroke="#555"
                                    strokeWidth="4"
                                />
                            </svg>
                        );
                    })}

                    {/* Cells */}
                    {Array.from({ length: ROWS * COLS }).map((_, i) => (
                        <div
                            key={i}
                            className="border border-zinc-900 bg-zinc-950"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

/* =======================
   BUTTON STYLE
======================= */
// tailwind helper (optional)
const Page: React.FC = () => <HamiltonianPermuter/>;
const preview = <></>;

export const title = "Hamiltonian cycles";
export const description = "A hamiltonian cycle thing";

const mod: DemoModule = {title, description, preview, Page, presentable: false };
export default mod;
