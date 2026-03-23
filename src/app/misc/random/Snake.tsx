"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {InlineMath, BlockMath} from 'react-katex';
import {DemoModule} from "@/app/misc/random/registry";


type Cell = { r: number; c: number };

// ── Int-encoded cell helpers ──
// A cell (r, c) is stored as the single integer r * cols + c.
// This eliminates object allocations in the hot path.

function toInt(r: number, c: number, cols: number): number {
    return r * cols + c;
}
function intR(v: number, cols: number): number {
    return (v / cols) | 0;
}
function intC(v: number, cols: number): number {
    return v % cols;
}
function intAdj(a: number, b: number, cols: number): boolean {
    const dr = intR(a, cols) - intR(b, cols);
    const dc = intC(a, cols) - intC(b, cols);
    return (dr === 0 && (dc === 1 || dc === -1)) || (dc === 0 && (dr === 1 || dr === -1));
}


function generateHamiltonianBasic(rows: number, cols: number): number[] {
    const path: number[] = [];

    if (cols % 2 === 0) {
        for (let c = 0; c < cols; c++) {
            if (c % 2 === 0) {
                for (let r = 1; r < rows; r++) path.push(toInt(r, c, cols));
            } else {
                for (let r = rows - 1; r >= 1; r--) path.push(toInt(r, c, cols));
            }
        }
        for (let c = cols - 1; c >= 0; c--) path.push(toInt(0, c, cols));
    } else {
        for (let r = 0; r < rows; r++) {
            if (r % 2 === 0) {
                for (let c = 1; c < cols; c++) path.push(toInt(r, c, cols));
            } else {
                for (let c = cols - 1; c >= 1; c--) path.push(toInt(r, c, cols));
            }
        }
        for (let r = rows - 1; r >= 0; r--) path.push(toInt(r, 0, cols));
    }

    return path;
}


function zipsToApple(
    path: number[],
    posMap: Int32Array,
    snake: number[],
    apple: number,
    cols: number
): boolean {
    const headIndex = posMap[snake[0]];
    const appleIndex = posMap[apple];

    if (headIndex === -1 || appleIndex === -1) return false;
    if (appleIndex <= headIndex) return false;

    let prev = path[headIndex];

    for (let i = headIndex + 1; i <= appleIndex; i++) {
        const cur = path[i];

        const dc = intC(cur, cols) - intC(prev, cols);
        const dr = intR(cur, cols) - intR(prev, cols);

        if (Math.abs(dc) + Math.abs(dr) !== 1) return false;

        const ac = intC(apple, cols);
        const ar = intR(apple, cols);
        if (
            Math.abs(intC(cur, cols) - ac) > Math.abs(intC(prev, cols) - ac) ||
            Math.abs(intR(cur, cols) - ar) > Math.abs(intR(prev, cols) - ar)
        ) {
            return false;
        }

        prev = cur;
    }

    return true;
}


function generateHamiltonianBest(
    rows: number,
    cols: number,
    lastPath: number[],
    snake: number[],
    apple: number,
    triesMultiplier: number
): number[] {

    let bestPath: number[] | null = null;
    let bestScore = Infinity;

    const bfsDist = bfsDistance(snake[0], apple, rows, cols, snake);
    const lowerBound = Number.isFinite(bfsDist) ? Math.max(bfsDist, 1) : 1;

    function consider(rawPath: number[]) {
        if (rawPath.length === 0) return;

        const rawPm = buildPosMap(rawPath);
        let path = normalizeHamiltonian(rawPath, snake, cols, rawPm);

        path = optimizeHamiltonianByBumps(path, snake, apple, cols);

        const pm = buildPosMap(path);
        const score = patternDistance(path, apple, pm);
        if (score < bestScore) {
            bestScore = score;
            bestPath = path;
        }
    }

    if (lastPath.length > 0) {
        const lastPm = buildPosMap(lastPath);
        const normalized = normalizeHamiltonian(lastPath, snake, cols, lastPm);
        const pm = buildPosMap(normalized);

        if (zipsToApple(normalized, pm, snake, apple, cols)) {
            return normalized;
        }

        consider(normalized);
    }

    const BASE_MIN = 1;
    const BASE_MAX = 15;

    function computeBudget(): number {
        const ratio = bestScore / lowerBound;
        if (ratio <= 1.0) return 0;
        if (ratio <= 1.2) return Math.ceil(BASE_MIN * triesMultiplier);

        const t = Math.min((ratio - 1.2) / (5.0 - 1.2), 1.0);
        const base = BASE_MIN + t * (BASE_MAX - BASE_MIN);
        return Math.ceil(base * triesMultiplier);
    }

    let budget = computeBudget();
    let spent = 0;

    while (spent < budget) {
        const raw = generateHamiltonian(rows, cols, snake, apple);
        consider(raw);
        spent++;

        budget = Math.max(spent, computeBudget());

        if (bestScore <= lowerBound) break;
    }

    return bestPath ?? lastPath;
}



function generateHamiltonian(
    rows: number,
    cols: number,
    snake: number[],
    apple: number,
    seed?: number,
): number[] {
    const total = rows * cols
    if (rows < 2 || cols < 2) throw new Error("Need rows, cols >= 2 for a cycle.")
    if ((rows % 2 === 1) && (cols % 2 === 1)) {
        throw new Error("No Hamiltonian cycle exists on an odd*odd grid.")
    }
    if (snake.length < 1) throw new Error("snake must have at least one cell.")

    // Direction offsets as flat int deltas
    const dirs = [cols, -cols, 1, -1] as const  // down, up, right, left

    const inBounds = (v: number, d: number): boolean => {
        const r = (v / cols) | 0;
        const c = v % cols;
        if (d === cols) return r + 1 < rows;
        if (d === -cols) return r - 1 >= 0;
        if (d === 1) return c + 1 < cols;
        /* d === -1 */ return c - 1 >= 0;
    }

    // --- Seedable RNG (xorshift32) ---
    let state = (seed ?? ((Math.random() * 0xffffffff) >>> 0)) >>> 0
    const rnd = () => {
        state ^= state << 13
        state ^= state >>> 17
        state ^= state << 5
        return (state >>> 0) / 0xffffffff
    }
    const randInt = (n: number) => Math.floor(rnd() * n)

    // Validate snake
    {
        const seen = new Set<number>()
        for (let i = 0; i < snake.length; i++) {
            const v = snake[i]
            if (v < 0 || v >= total) throw new Error("Snake cell out of bounds.")
            if (seen.has(v)) throw new Error("Snake contains duplicates.")
            seen.add(v)
            if (i > 0 && !intAdj(snake[i - 1], snake[i], cols)) {
                throw new Error("Snake must be 4-neighbor adjacent along its length.")
            }
        }
    }

    const snakeTailNeck = snake.length > 1 ? snake[snake.length - 2] : -1

    // -- Forward-only biting --
    // Snake is a fixed SUFFIX. Head arm grows leftward.
    //
    //   [... head arm ...] [snake[0] snake[1] ... snake[L-1]]
    //    lo                 snakeStart                        hi-1

    const MAX_RESTARTS = 200
    for (let restart = 0; restart < MAX_RESTARTS; restart++) {
        const cap = total * 2
        const path = new Int32Array(cap)
        const pos = new Int32Array(total).fill(-1)

        const snakeStart = (cap / 2) | 0
        let lo = snakeStart

        for (let i = 0; i < snake.length; i++) {
            path[snakeStart + i] = snake[i]
            pos[snake[i]] = snakeStart + i
        }

        const hi = snakeStart + snake.length
        const n = () => hi - lo

        function reverseSegment(i1: number, i2: number) {
            while (i1 < i2) {
                const tmp = path[i1]
                path[i1] = path[i2]
                path[i2] = tmp
                pos[path[i1]] = i1
                pos[path[i2]] = i2
                i1++
                i2--
            }
        }

        function forwardBiteOnce(): void {
            const headEnd = path[lo]
            const d = dirs[randInt(4)]
            if (!inBounds(headEnd, d)) return
            const neigh = headEnd + d

            const j = pos[neigh]
            if (j === -1) {
                lo--
                path[lo] = neigh
                pos[neigh] = lo
                return
            }

            if (j - 1 >= snakeStart) return
            if (j === lo + 1) return

            reverseSegment(lo, j - 1)
        }

        const q = 1.0
        const attemptsPerPhase = Math.max(
            200,
            Math.floor(q * 10 * total * Math.log(2 + total) * Math.log(2 + total)),
        )

        let growthBudget = attemptsPerPhase
        while (n() < total && growthBudget-- > 0) forwardBiteOnce()
        if (n() < total) continue

        for (let i = 0; i < attemptsPerPhase; i++) forwardBiteOnce()

        const closeBudget = attemptsPerPhase * 2
        let closed = false
        for (let i = 0; i < closeBudget; i++) {
            const headEnd = path[lo]
            const tailEnd = path[hi - 1]
            if (
                intAdj(headEnd, tailEnd, cols) &&
                (snakeTailNeck === -1 || !intAdj(headEnd, snakeTailNeck, cols))
            ) {
                closed = true
                break
            }
            forwardBiteOnce()
        }
        if (!closed) continue

        const result: number[] = new Array(hi - lo)
        for (let i = lo; i < hi; i++) result[i - lo] = path[i]
        return result
    }

    return []
}


function normalizeHamiltonian(
    path: number[],
    snake: number[],
    cols: number,
    posMap?: Int32Array
): number[] {
    const head = snake[0]
    const neck = snake.length > 1 ? snake[1] : -1

    const idx = posMap
        ? posMap[head]
        : path.indexOf(head)
    if (idx === -1) return path

    let rotated = [
        ...path.slice(idx),
        ...path.slice(0, idx),
    ]

    if (neck !== -1 && rotated[1] === neck) {
        rotated = [
            rotated[0],
            ...rotated.slice(1).reverse(),
        ]
    }

    return rotated
}


function buildNextMap(path: number[], cols: number): Int32Array {
    const total = path.length;
    const map = new Int32Array(total).fill(-1);
    for (let i = 0; i < total; i++) {
        map[path[i]] = path[(i + 1) % total];
    }
    return map;
}

/** Build position lookup: posMap[v] = index in path. Unvisited = -1. */
function buildPosMap(path: number[]): Int32Array {
    const total = path.length;
    const map = new Int32Array(total).fill(-1);
    for (let i = 0; i < total; i++) {
        map[path[i]] = i;
    }
    return map;
}

function patternDistance(path: number[], apple: number, posMap?: Int32Array): number {
    const ai = posMap ? posMap[apple] : path.indexOf(apple);
    return ai === -1 ? Infinity : ai;
}

function is2x2Square(a: number, b: number, c: number, d: number, cols: number): boolean {
    const rs = new Set([intR(a, cols), intR(b, cols), intR(c, cols), intR(d, cols)]);
    const cs = new Set([intC(a, cols), intC(b, cols), intC(c, cols), intC(d, cols)]);
    return rs.size === 2 && cs.size === 2;
}

function extend(from: number, to: number, cols: number, rows: number): number {
    const dr = intR(to, cols) - intR(from, cols);
    const dc = intC(to, cols) - intC(from, cols);
    const nr = intR(to, cols) + dr;
    const nc = intC(to, cols) + dc;
    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return -1;
    return toInt(nr, nc, cols);
}

function spliceByRemoveInsert(
    path: number[],
    indexMap: Int32Array,
    cols: number,
    A: number,
    B: number,
    C: number,
    D: number,
    Bp: number,
    Cp: number
): number[] | null {

    const iB = indexMap[B];
    const iC = indexMap[C];
    const iBp = indexMap[Bp];
    const iCp = indexMap[Cp];

    if (iB === -1 || iC === -1 || iBp === -1 || iCp === -1) return null;

    if (Math.abs(iB - iC) !== 1) return null;
    if (Math.abs(iBp - iCp) !== 1) return null;

    const removed = path.filter((_, i) => i !== iB && i !== iC);

    const idxBp = removed.indexOf(Bp);
    const idxCp = removed.indexOf(Cp);

    if (idxBp === -1 || idxCp === -1) return null;

    const insertAt = Math.min(idxBp, idxCp) + 1;

    return [
        ...removed.slice(0, insertAt),
        C,
        B,
        ...removed.slice(insertAt),
    ];
}



function optimizeHamiltonianByBumps(
    rawPath: number[],
    snake: number[],
    apple: number,
    cols: number
): number[] {
    if (rawPath.length === 0) return rawPath;

    const rows = (rawPath.length / cols) | 0;
    const rawPm = buildPosMap(rawPath);
    let path = normalizeHamiltonian(rawPath, snake, cols, rawPm);
    const N = path.length;

    const snakeSet = new Set<number>();
    for (let i = 1; i < snake.length; i++) {
        snakeSet.add(snake[i]);
    }

    while (true) {
        let improved = false;

        const indexMap = new Int32Array(N).fill(-1);
        for (let i = 0; i < N; i++) indexMap[path[i]] = i;

        const baseDist = patternDistance(path, apple, indexMap);

        const segment = pathFromHeadToApple(path, snake, apple, cols, indexMap);

        for (let si = 0; si + 3 < segment.length; si++) {
            const A = segment[si];
            const B = segment[si + 1];
            const C = segment[si + 2];
            const D = segment[si + 3];

            if (!is2x2Square(A, B, C, D, cols)) continue;

            const Bp = extend(A, B, cols, rows);
            const Cp = extend(D, C, cols, rows);

            if (Bp === -1 || Cp === -1) continue;

            if (snakeSet.has(Bp) || snakeSet.has(Cp)) continue;

            const newPath = spliceByRemoveInsert(
                path, indexMap, cols,
                A, B, C, D, Bp, Cp
            );

            if (!newPath) continue;

            const newPosMap = buildPosMap(newPath);
            const newDist = patternDistance(newPath, apple, newPosMap);

            if (newDist === baseDist - 2) {
                path = newPath;
                improved = true;
                break;
            }
        }

        if (!improved) break;
    }

    return path;
}


function randomFreeCell(
    rows: number,
    cols: number,
    occupied: Set<number>
): number {
    while (true) {
        const v = Math.floor(Math.random() * rows * cols);
        if (!occupied.has(v)) return v;
    }
}


function bfsDistance(
    from: number,
    to: number,
    rows: number,
    cols: number,
    snake: number[]
): number {
    if (from === to) return 0;

    const total = rows * cols;
    const blocked = new Uint8Array(total);
    for (let i = 1; i < snake.length; i++) {
        blocked[snake[i]] = 1;
    }

    const dist = new Int32Array(total).fill(-1);
    dist[from] = 0;

    const queue: number[] = [from];
    let qi = 0;

    while (qi < queue.length) {
        const cur = queue[qi++];
        const cr = (cur / cols) | 0;
        const cc = cur % cols;
        const nd = dist[cur] + 1;

        if (cc + 1 < cols) { const n = cur + 1;    if (dist[n] === -1 && !blocked[n]) { if (n === to) return nd; dist[n] = nd; queue.push(n); } }
        if (cc - 1 >= 0)   { const n = cur - 1;    if (dist[n] === -1 && !blocked[n]) { if (n === to) return nd; dist[n] = nd; queue.push(n); } }
        if (cr + 1 < rows) { const n = cur + cols;  if (dist[n] === -1 && !blocked[n]) { if (n === to) return nd; dist[n] = nd; queue.push(n); } }
        if (cr - 1 >= 0)   { const n = cur - cols;  if (dist[n] === -1 && !blocked[n]) { if (n === to) return nd; dist[n] = nd; queue.push(n); } }
    }

    return Infinity;
}


function pathFromHeadToApple(
    path: number[],
    snake: number[],
    apple: number,
    cols: number,
    posMap?: Int32Array
): number[] {
    if (path.length === 0) return [];

    const head = snake[0];
    const headIndex = posMap ? posMap[head] : path.indexOf(head);
    const appleIndex = posMap ? posMap[apple] : path.indexOf(apple);

    if (headIndex === -1 || appleIndex === -1) return [];

    const result: number[] = [];
    let i = headIndex;

    while (true) {
        result.push(path[i]);
        if (i === appleIndex) break;
        i = (i + 1) % path.length;

        if (result.length > path.length) break;
    }

    return result;
}


function sliderToSteps(slider: number) {
    if (slider >= 100) return Infinity;
    const min = 1;
    const max = 30;
    const gamma = 0.6;
    const t = Math.pow(slider / 100, gamma);
    return Math.round(min * Math.pow(max / min, t));
}


function digitsOnly(value: string) {
    return value.replace(/\D+/g, "");
}

function snapEven(n: number) {
    if (n <= 2) return 2;
    return n % 2 === 0 ? n : n - 1;
}

function enforceGridRules(
    r: number,
    c: number,
    changed: "rows" | "cols"
) {
    if (r % 2 === 0 || c % 2 === 0) {
        return { rows: r, cols: c };
    }
    if (changed === "rows") {
        return { rows: snapEven(r), cols: c };
    } else {
        return { rows: r, cols: snapEven(c) };
    }
}




function SnakePage() {
    const [rows, setRows] = useState(16);
    const [cols, setCols] = useState(20);
    const [triesSlider, setTriesSlider] = useState(50);

    const hamiltonian = useRef<number[]>(generateHamiltonianBasic(rows, cols));
    const nextMap = useRef<Int32Array>(buildNextMap(hamiltonian.current, cols));
    const hamiltonianPosMap = useRef<Int32Array>(buildPosMap(hamiltonian.current));
    const finishedRef = useRef(false);

    const [snake, setSnake] = useState<number[]>([
        hamiltonian.current[0], hamiltonian.current[1]
    ]);
    const [apple, setApple] = useState<number>(() => {
        const occupied = new Set(hamiltonian.current.slice(0, 2));
        return randomFreeCell(rows, cols, occupied);
    });

    const [running, setRunning] = useState(false);
    const [showPath, setShowPath] = useState(true);
    const [highlightPath, setHighlightPath] = useState(true);
    const [stepsPerSecond, setStepsPerSecond] = useState(3);

    const [rowsInput, setRowsInput] = useState(String(rows));
    const [colsInput, setColsInput] = useState(String(cols));
    const [techMode, setTechMode] = useState<"casual" | "formal">("casual");


    const stepsPerSecondCalculated =
        stepsPerSecond >= 100 ? Infinity : sliderToSteps(stepsPerSecond);

    const triesMultiplier = (triesSlider / 100) * 3.0;


    const stepOnce = useCallback(() => {
        if (finishedRef.current) {
            setRunning(false);
            return;
        }

        setSnake(prev => {
            const total = rows * cols;

            if (prev.length === total) {
                finishedRef.current = true;
                return prev;
            }

            const head = prev[0];
            const nextOnCurrent = nextMap.current[head];

            if (
                prev.length === total - 1 &&
                nextOnCurrent === apple
            ) {
                finishedRef.current = true;
                return [nextOnCurrent, ...prev];
            }

            const newHamiltonian = generateHamiltonianBest(
                rows, cols,
                hamiltonian.current,
                prev,
                apple,
                triesMultiplier
            );

            hamiltonian.current = newHamiltonian;
            nextMap.current = buildNextMap(newHamiltonian, cols);
            hamiltonianPosMap.current = buildPosMap(newHamiltonian);

            const next = nextMap.current[head];
            const eats = next === apple;

            const nextSnake = [next, ...prev];
            if (!eats) nextSnake.pop();
            else spawnApple(nextSnake);

            if (nextSnake.length === total) {
                finishedRef.current = true;
            }

            return nextSnake;
        });
    }, [apple, rows, cols, triesMultiplier]);

    useEffect(() => {
        if (!running) return;

        if (stepsPerSecondCalculated === Infinity) {
            let rafId: number;
            const loop = () => {
                if (finishedRef.current) return;
                stepOnce();
                rafId = requestAnimationFrame(loop);
            };
            rafId = requestAnimationFrame(loop);
            return () => cancelAnimationFrame(rafId);
        }

        let cancelled = false;
        const interval = 1000 / stepsPerSecondCalculated;
        let nextTime = performance.now();

        const tick = () => {
            if (cancelled) return;
            const now = performance.now();
            if (now >= nextTime) {
                stepOnce();
                nextTime += interval;
                if (now > nextTime + interval) {
                    nextTime = now + interval;
                }
            }
            const delay = Math.max(0, nextTime - performance.now());
            setTimeout(tick, delay);
        };

        tick();
        return () => { cancelled = true; };
    }, [running, stepsPerSecondCalculated, stepOnce]);


    useEffect(() => {
        finishedRef.current = false;
        setRunning(false);

        const newHamiltonian = generateHamiltonianBasic(rows, cols);
        hamiltonian.current = newHamiltonian;
        nextMap.current = buildNextMap(newHamiltonian, cols);
        hamiltonianPosMap.current = buildPosMap(newHamiltonian);

        const initialSnake = [newHamiltonian[1], newHamiltonian[0]];
        setSnake(initialSnake);
        spawnApple(initialSnake);
    }, [rows, cols]);


    useEffect(() => { setRowsInput(String(rows)); }, [rows]);
    useEffect(() => { setColsInput(String(cols)); }, [cols]);


    function spawnApple(currentSnake: number[]) {
        const occupied = new Set(currentSnake);
        const cell = randomFreeCell(rows, cols, occupied);
        setApple(cell);
    }

    function reset() {
        setRunning(false);
        finishedRef.current = false;
        const initialSnake = [hamiltonian.current[0], hamiltonian.current[1]];
        setSnake(initialSnake);
        spawnApple(initialSnake);
    }

    function toggleShowPath() { setShowPath(!showPath); }
    function toggleHighlightPath() { setHighlightPath(p => !p); }

    // Rendering helper: int cell -> SVG coordinate string
    const ptInt = (v: number) =>
        `${intC(v, cols) * 100 + 50},${intR(v, cols) * 100 + 50}`;


    return (
        <div className="bg-black text-white flex flex-col mt-24 pb-4">
            {/* Control Panel */}
            <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-1 lg:grid-cols-4 gap-4">

                    <div className="flex items-center gap-2 bg-zinc-900 rounded-lg p-3">
                        <button
                            onClick={() => setRunning(r => !r)}
                            className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-sm font-medium"
                        >
                            {running ? "Pause" : "Run"}
                        </button>
                        <button
                            onClick={stepOnce}
                            className="px-3 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-sm"
                        >
                            Step
                        </button>
                        <button
                            onClick={reset}
                            className="px-3 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-sm"
                        >
                            Reset
                        </button>
                    </div>

                    <div className="bg-zinc-900 rounded-lg p-3 flex flex-col justify-center">
                        <div className="flex justify-between text-xs text-zinc-400 mb-1">
                            <span>Simulation speed</span>
                            <span>
                                {stepsPerSecondCalculated === Infinity
                                    ? "Max "
                                    : `${stepsPerSecondCalculated} `}steps/sec
                            </span>
                        </div>
                        <input
                            type="range" min={0} max={100}
                            value={stepsPerSecond}
                            onChange={(e) => setStepsPerSecond(Number(e.target.value))}
                            className="accent-emerald-500"
                        />
                    </div>

                    <div className="bg-zinc-900 rounded-lg p-3 flex gap-2">
                        <button
                            onClick={toggleShowPath}
                            className={`flex-1 px-3 py-2 rounded-md text-sm ${
                                showPath
                                    ? "bg-indigo-600 hover:bg-indigo-500"
                                    : "bg-zinc-800 hover:bg-zinc-700"
                            }`}
                        >
                            Hamiltonian Path
                        </button>
                        <button
                            onClick={toggleHighlightPath}
                            className={`flex-1 px-3 py-2 rounded-md text-sm ${
                                highlightPath
                                    ? "bg-yellow-500 text-black hover:bg-yellow-400"
                                    : "bg-zinc-800 hover:bg-zinc-700"
                            }`}
                        >
                            Head &rarr; Apple
                        </button>
                    </div>

                    <div className="bg-zinc-900 rounded-lg p-3 grid grid-cols-3 gap-2 text-sm">
                        <label className="flex flex-col gap-1 text-zinc-400">
                            Rows
                            <input
                                type="text" inputMode="numeric" pattern="[0-9]*"
                                disabled={running} value={rowsInput}
                                onChange={(e) => setRowsInput(digitsOnly(e.target.value))}
                                onBlur={() => {
                                    const parsed = Number(rowsInput || rows);
                                    const r = Math.max(2, parsed);
                                    const { rows: newRows, cols: newCols } = enforceGridRules(r, cols, "rows");
                                    setRows(newRows);
                                    setCols(newCols);
                                }}
                                className="px-2 py-1 bg-zinc-950 border border-zinc-700 rounded disabled:opacity-50"
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-zinc-400">
                            Cols
                            <input
                                type="text" inputMode="numeric" pattern="[0-9]*"
                                disabled={running} value={colsInput}
                                onChange={(e) => setColsInput(digitsOnly(e.target.value))}
                                onBlur={() => {
                                    const parsed = Number(colsInput || cols);
                                    const c = Math.max(2, parsed);
                                    const { rows: newRows, cols: newCols } = enforceGridRules(rows, c, "cols");
                                    setRows(newRows);
                                    setCols(newCols);
                                }}
                                className="px-2 py-1 bg-zinc-950 border border-zinc-700 rounded disabled:opacity-50"
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-zinc-400">
                            <div className="flex justify-between">
                                <span>Effort</span>
                                <span className="text-zinc-500 text-xs">{triesMultiplier.toFixed(1)}&times;</span>
                            </div>
                            <input
                                type="range" min={0} max={100}
                                value={triesSlider}
                                onChange={(e) => setTriesSlider(Number(e.target.value))}
                                className="accent-emerald-500"
                            />
                        </label>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 grid place-items-center mt-2">
                <div
                    className="relative grid"
                    style={{
                        gridTemplateRows: `repeat(${rows}, 1fr)`,
                        gridTemplateColumns: `repeat(${cols}, 1fr)`,
                        height: "min(75vw, 75vh)",
                        aspectRatio: `${cols} / ${rows}`,
                    }}
                >
                    {Array.from({length: rows * cols}).map((_, idx) => (
                        <div key={idx} className="border border-zinc-900 bg-zinc-950" />
                    ))}

                    <svg
                        className="absolute inset-0 pointer-events-none"
                        viewBox={`0 0 ${cols * 100} ${rows * 100}`}
                    >
                        {showPath && (
                            <polyline
                                fill="none" stroke="#333" strokeWidth="4"
                                points={[...hamiltonian.current, hamiltonian.current[0]].map(ptInt).join(" ")}
                            />
                        )}

                        {highlightPath && (
                            <polyline
                                fill="none" stroke="#facc15" strokeWidth="8"
                                strokeLinecap="round" strokeLinejoin="round"
                                points={pathFromHeadToApple(
                                    hamiltonian.current, snake, apple, cols, hamiltonianPosMap.current
                                ).map(ptInt).join(" ")}
                            />
                        )}

                        <polyline
                            fill="none" stroke="#22c55e" strokeWidth="60"
                            strokeLinecap="round" strokeLinejoin="round"
                            points={snake.map(ptInt).join(" ")}
                        />

                        <circle
                            cx={intC(apple, cols) * 100 + 50}
                            cy={intR(apple, cols) * 100 + 50}
                            r="26" fill="#dc2626"
                        />

                        {snake.length > 0 && (
                            <circle
                                cx={intC(snake[0], cols) * 100 + 50}
                                cy={intR(snake[0], cols) * 100 + 50}
                                r="34" fill="#16a34a"
                            />
                        )}

                        {snake.length > 1 && (
                            <circle
                                cx={intC(snake[snake.length - 1], cols) * 100 + 50}
                                cy={intR(snake[snake.length - 1], cols) * 100 + 50}
                                r="24" fill="#15803d"
                            />
                        )}
                    </svg>
                </div>
            </div>

            {/* Info / Documentation */}
            <div className="max-w-4xl mx-auto px-6 py-10 text-zinc-300 space-y-6">
                <section>
                    <h2 className="text-xl font-semibold text-white mb-2">Overview</h2>
                    <p className="leading-relaxed">
                        This visualization demonstrates a Snake agent that uses Hamiltonian
                        cycles to guarantee survival, while dynamically searching for faster
                        routes instead of following a single fixed cycle.
                    </p>
                    <p className="leading-relaxed mt-3">
                        Rather than committing to one precomputed Hamiltonian cycle, the
                        algorithm continuously generates alternative cycles that are compatible
                        with the snake&apos;s current position. Because the snake always remains on a
                        valid Hamiltonian cycle, it can never trap itself or reach an unwinnable
                        state.
                    </p>
                    <p className="leading-relaxed mt-3">
                        By evaluating multiple candidate cycles and selecting the one that
                        reaches the apple in the fewest steps, the snake often outperforms
                        traditional &ldquo;static&rdquo; Hamiltonian strategies, which blindly traverse the
                        entire grid.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-2">Controls</h2>
                    <ul className="list-disc list-inside space-y-1 text-zinc-400">
                        <li><strong>Run / Pause</strong> &mdash; start or halt the simulation</li>
                        <li><strong>Step</strong> &mdash; advance the simulation by one tick</li>
                        <li><strong>Speed</strong> &mdash; control steps per second (bounded by computation time)</li>
                        <li><strong>Hamiltonian Path</strong> &mdash; toggle the full cycle view</li>
                        <li><strong>Head &rarr; Apple</strong> &mdash; show the currently selected path</li>
                        <li><strong>Rows / Cols</strong> &mdash; change grid dimensions <em>(resets the simulation)</em></li>
                        <li><strong>Effort</strong> &mdash; multiplier on how hard the algorithm searches for a shorter cycle</li>
                    </ul>
                </section>

                <section>
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setTechMode("casual")}
                            className={`px-3 py-1 rounded text-sm ${
                                techMode === "casual"
                                    ? "bg-emerald-600 text-white"
                                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                            }`}
                        >
                            Intuition
                        </button>
                        <button
                            onClick={() => setTechMode("formal")}
                            className={`px-3 py-1 rounded text-sm ${
                                techMode === "formal"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                            }`}
                        >
                            Formal / Math
                        </button>
                    </div>

                    <h2 className="text-xl font-semibold text-white mb-2">Technical Notes</h2>

                    {techMode === "casual" && (
                        <>
                            <p className="leading-relaxed text-zinc-400">
                                The core idea of using a hamiltonian cycle is to force the snake to always move along a
                                path that visits every grid cell exactly once.
                                Because as long as the snake never leaves this cycle, the head can always every square before looping, which makes failure impossible
                            </p>
                            <p className="leading-relaxed text-zinc-400 mt-3">
                                At each time step, the current snake body is treated as a
                                locked-in segment of the cycle. The algorithm then attempts to
                                complete the rest of the cycle around this fixed segment using
                                randomized backbite operations that only modify the free tail
                                of the path. Any construction that would disturb the snake&apos;s
                                ordering is rejected immediately.
                            </p>
                            <p className="leading-relaxed text-zinc-400 mt-3">
                                Since many valid Hamiltonian cycles are possible, the algorithm
                                samples several candidates per step. The number of candidates
                                is determined adaptively: a BFS shortest-path distance from head
                                to apple (avoiding the snake body) provides a lower bound, and
                                the ratio of the current cycle distance to this lower bound
                                determines how many more cycles to try. When the ratio is close
                                to 1:1, the current path is near-optimal and searching stops
                                early. When the ratio is high, more candidates are evaluated.
                                The Effort slider scales this budget linearly.
                            </p>
                            <p className="leading-relaxed text-zinc-400 mt-3">
                                Among all valid candidates, the cycle that brings the apple
                                closest in forward cycle distance is selected. This allows the
                                snake to take short, direct routes to the apple when possible,
                                while still falling back to a slower but still safe cycle if
                                no improvement exists.
                            </p>
                            <p className="leading-relaxed text-zinc-400 mt-3">
                                The result is a strategy that behaves greedily when it is safe
                                to do so, but defaults to a conservative traversal of the grid
                                whenever risk would be introduced. This balance makes the
                                snake appear intelligent without ever entering a losing state.
                            </p>
                        </>
                    )}

                    {techMode === "formal" && (
                        <>
                            <p className="leading-relaxed text-zinc-400">
                                The board is modeled as a rectangular grid graph
                                <InlineMath math="G = (V, E)"/>, where
                                <InlineMath math="|V| = N = \text{rows} \times \text{cols}"/> and
                                edges connect orthogonally adjacent cells.
                            </p>
                            <p className="leading-relaxed text-zinc-400 mt-3">
                                At time step <InlineMath math="t"/>, the snake configuration
                                <InlineMath math="S_t = (v_0, \dots, v_k)"/> is a contiguous
                                subsequence of a Hamiltonian cycle
                                <InlineMath math="H_t = (h_0, \dots, h_{N-1})"/> over
                                <InlineMath math="G"/>:
                            </p>
                            <BlockMath math="S_t \subseteq H_t"/>
                            <p className="leading-relaxed text-zinc-400 mt-3">
                                The cycle ordering induces a directed successor relation,
                                allowing the snake to advance by replacing its head with the
                                next vertex along <InlineMath math="H_t"/>.
                            </p>
                            <p className="leading-relaxed text-zinc-400 mt-3">
                                At each step, the algorithm samples a finite set of candidate
                                Hamiltonian cycles:
                            </p>
                            <BlockMath math="\mathcal{C}_t = \{ H_t^{(1)}, \dots, H_t^{(k_t)} \}"/>
                            <p className="leading-relaxed text-zinc-400">
                                Each candidate cycle preserves the ordering of
                                <InlineMath math="S_t"/> and is generated by completing the
                                remaining vertices using randomized tail-restricted backbite
                                operations, ensuring that the fixed snake prefix is never
                                modified.
                            </p>
                            <p className="leading-relaxed text-zinc-400 mt-3">
                                For any Hamiltonian cycle
                                <InlineMath math="H"/>, define the forward cycle distance
                                <InlineMath math="d_H(u, v)"/> as the number of edges traversed
                                when moving forward along <InlineMath math="H"/> from
                                <InlineMath math="u"/> to <InlineMath math="v"/>.
                            </p>
                            <p className="leading-relaxed text-zinc-400 mt-3">
                                Let <InlineMath math="d^*_t = d_{\mathrm{BFS}}(\text{head}_t, \text{apple}_t \mid G \setminus S_t)"/>
                                {" "}denote the BFS shortest-path distance from head to apple on the
                                grid with the snake body removed. This serves as a lower bound:
                                <InlineMath math="d_H(\text{head}_t, \text{apple}_t) \geq d^*_t"/> for any
                                valid cycle <InlineMath math="H"/>.
                            </p>
                            <p className="leading-relaxed text-zinc-400 mt-3">
                                The number of candidate cycles sampled is adaptive. Define the
                                optimality ratio:
                            </p>
                            <BlockMath math="\rho_t = \frac{d_{H_{\mathrm{best}}}(\text{head}_t, \text{apple}_t)}{d^*_t}"/>
                            <p className="leading-relaxed text-zinc-400">
                                When <InlineMath math="\rho_t \approx 1"/>, the current cycle is
                                near-optimal and sampling terminates early. As <InlineMath math="\rho_t"/>
                                {" "}grows, the search budget <InlineMath math="k_t"/> increases,
                                scaled by a user-controlled effort multiplier <InlineMath math="\mu"/>:
                            </p>
                            <BlockMath math="k_t = \left\lceil \mu \cdot f(\rho_t) \right\rceil, \quad f(\rho) = \begin{cases} 0 & \rho \leq 1 \\\\ 1 & \rho \leq 1.2 \\\\ 1 + 14 \cdot \frac{\rho - 1.2}{3.8} & \rho > 1.2 \end{cases}"/>
                            <p className="leading-relaxed text-zinc-400 mt-3">
                                The selected cycle minimizes the distance from the snake&apos;s head
                                to the apple:
                            </p>
                            <BlockMath math="
            H_t \;=\;
            \arg\min_{H \in \mathcal{C}_t \cup \{H_{t-1}\}}
            d_H(\text{head}_t, \text{apple}_t)
            "/>
                            <p className="leading-relaxed text-zinc-400 mt-3">
                                Because the snake always advances along a Hamiltonian cycle,
                                the tail remains reachable from the head at all times. As long
                                as a Hamiltonian cycle exists for the grid, the snake can never
                                enter a dead-end configuration.
                            </p>
                            <p className="leading-relaxed text-zinc-400 mt-3">
                                The expected runtime for generating a single candidate cycle
                                using randomized backbite operations is
                                <InlineMath math="\mathcal{O}(N \log^2 N)"/>, with a pessimistic
                                upper bound of
                                <InlineMath math="\mathcal{O}(N^2 \log^2 N)"/> under repeated
                                restarts.
                            </p>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}


const Page: React.FC = () => <SnakePage/>;
const preview = (() => {
    const rows = 6;
    const cols = 6;

    const H6_VARIANTS: number[][] = [
        [
            toInt(1,0,6), toInt(2,0,6), toInt(3,0,6), toInt(4,0,6), toInt(5,0,6),
            toInt(5,1,6), toInt(4,1,6), toInt(3,1,6), toInt(2,1,6), toInt(1,1,6),
            toInt(1,2,6), toInt(2,2,6), toInt(3,2,6), toInt(4,2,6), toInt(5,2,6),
            toInt(5,3,6), toInt(4,3,6), toInt(3,3,6), toInt(2,3,6), toInt(1,3,6),
            toInt(1,4,6), toInt(2,4,6), toInt(3,4,6), toInt(4,4,6), toInt(5,4,6),
            toInt(5,5,6), toInt(4,5,6), toInt(3,5,6), toInt(2,5,6), toInt(1,5,6),
            toInt(0,5,6), toInt(0,4,6), toInt(0,3,6), toInt(0,2,6), toInt(0,1,6),
            toInt(0,0,6),
        ],
        [
            toInt(4,2,6), toInt(5,2,6), toInt(5,3,6), toInt(5,4,6), toInt(5,5,6),
            toInt(4,5,6), toInt(4,4,6), toInt(4,3,6), toInt(3,3,6), toInt(3,4,6),
            toInt(3,5,6), toInt(2,5,6), toInt(1,5,6), toInt(0,5,6), toInt(0,4,6),
            toInt(0,3,6), toInt(1,3,6), toInt(1,4,6), toInt(2,4,6), toInt(2,3,6),
            toInt(2,2,6), toInt(2,1,6), toInt(1,1,6), toInt(1,2,6), toInt(0,2,6),
            toInt(0,1,6), toInt(0,0,6), toInt(1,0,6), toInt(2,0,6), toInt(3,0,6),
            toInt(4,0,6), toInt(5,0,6), toInt(5,1,6), toInt(4,1,6), toInt(3,1,6),
            toInt(3,2,6),
        ],
        [
            toInt(2,5,6), toInt(1,5,6), toInt(0,5,6), toInt(0,4,6), toInt(0,3,6),
            toInt(0,2,6), toInt(0,1,6), toInt(0,0,6), toInt(1,0,6), toInt(2,0,6),
            toInt(2,1,6), toInt(1,1,6), toInt(1,2,6), toInt(2,2,6), toInt(2,3,6),
            toInt(1,3,6), toInt(1,4,6), toInt(2,4,6), toInt(3,4,6), toInt(3,3,6),
            toInt(3,2,6), toInt(4,2,6), toInt(4,1,6), toInt(3,1,6), toInt(3,0,6),
            toInt(4,0,6), toInt(5,0,6), toInt(5,1,6), toInt(5,2,6), toInt(5,3,6),
            toInt(4,3,6), toInt(4,4,6), toInt(5,4,6), toInt(5,5,6), toInt(4,5,6),
            toInt(3,5,6),
        ],
    ];

    const path = H6_VARIANTS[Math.floor(Math.random() * H6_VARIANTS.length)];

    const snakeLen = 3 + Math.floor(Math.random() * 15);
    const start = Math.floor(Math.random() * (path.length - snakeLen));
    const snake = path.slice(start, start + snakeLen);

    const occupied = new Set(snake);
    const apple = randomFreeCell(rows, cols, occupied);

    const previewPosMap = buildPosMap(path);
    const highlight = pathFromHeadToApple(path, snake, apple, cols, previewPosMap);

    const size = 360;
    const cell = size / cols;

    const pt = (v: number) =>
        `${intC(v, cols) * cell + cell / 2},${intR(v, cols) * cell + cell / 2}`;

    return (
        <svg
            viewBox={`0 0 ${size} ${size}`}
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full rounded bg-zinc-950 border border-zinc-800"
        >
            {Array.from({length: rows * cols}).map((_, i) => {
                const r = Math.floor(i / cols);
                const c = i % cols;
                return (
                    <rect
                        key={i} x={c * cell} y={r * cell}
                        width={cell} height={cell}
                        fill="#09090b" stroke="#18181b" strokeWidth="1"
                    />
                );
            })}
            <polyline
                fill="none" stroke="#3f3f46" strokeWidth="2"
                points={[...path, path[0]].map(pt).join(" ")}
            />
            <polyline
                fill="none" stroke="#facc15" strokeWidth="4" strokeLinecap="round"
                points={highlight.map(pt).join(" ")}
            />
            <polyline
                fill="none" stroke="#22c55e" strokeWidth="10"
                strokeLinecap="round" strokeLinejoin="round"
                points={snake.map(pt).join(" ")}
            />
            <circle
                cx={intC(snake[snake.length - 1], cols) * cell + cell / 2}
                cy={intR(snake[snake.length - 1], cols) * cell + cell / 2}
                r={cell * 0.22} fill="#16a34a"
            />
            <circle
                cx={intC(apple, cols) * cell + cell / 2}
                cy={intR(apple, cols) * cell + cell / 2}
                r={cell * 0.18} fill="#dc2626"
            />
        </svg>
    );
})();

export const title = "Snake";
export const description = "A snake game that uses an optimised hamiltonian cycle algorithm.";

const mod: DemoModule = {title, description, preview, Page, presentable: true};
export default mod;