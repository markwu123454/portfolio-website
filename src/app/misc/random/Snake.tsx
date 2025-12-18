"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {DemoModule} from "@/app/misc/random/registry";


type Cell = { r: number; c: number };


function generateHamiltonianBasic(rows: number, cols: number): Cell[] {
    const path: Cell[] = [];

    for (let c = 0; c < cols; c++) {
        if (c % 2 === 0) {
            for (let r = 1; r < rows; r++) {
                path.push({r, c});
            }
        } else {
            for (let r = rows - 1; r >= 1; r--) {
                path.push({r, c});
            }
        }
    }

    for (let c = cols - 1; c >= 0; c--) {
        path.push({r: 0, c});
    }

    return path;
}


function distanceToApple(path: Cell[], apple: Cell): number {
    const idx = path.findIndex(
        c => c.r === apple.r && c.c === apple.c
    )
    return idx === -1 ? Infinity : idx
}



function zipsToApple(
    path: Cell[],
    snake: Cell[],
    apple: Cell
): boolean {
    const head = snake[0]

    // Find where the head and apple are in the path
    const headIndex = path.findIndex(
        c => c.c === head.c && c.r === head.r
    )
    const appleIndex = path.findIndex(
        c => c.c === apple.c && c.r === apple.r
    )

    if (headIndex === -1 || appleIndex === -1) return false
    if (appleIndex <= headIndex) return false

    let prev = path[headIndex]

    for (let i = headIndex + 1; i <= appleIndex; i++) {
        const cur = path[i]

        const dx = cur.c - prev.c
        const dy = cur.r - prev.r

        // Must move in exactly one direction
        if (Math.abs(dx) + Math.abs(dy) !== 1) return false

        // Must not move away from apple
        if (
            Math.abs(cur.c - apple.c) > Math.abs(prev.c - apple.c) ||
            Math.abs(cur.r - apple.r) > Math.abs(prev.r - apple.r)
        ) {
            return false
        }

        prev = cur
    }

    return true
}


function generateHamiltonianBest(
    rows: number,
    cols: number,
    lastPath: Cell[],
    snake: Cell[],   // [head ... tail]
    apple: Cell,
    tries: number
): Cell[] {

    // Early exit if current path already zips to apple
    if (lastPath.length > 0 && zipsToApple(lastPath, snake, apple)) {
        return lastPath
    }

    let bestPath: Cell[] | null = null
    let bestScore = Infinity

    function consider(path: Cell[]) {
        // Ignore failed generations
        if (path.length === 0) return

        const normalized = normalizeHamiltonian(path, snake)
        const score = distanceToApple(normalized, apple)

        if (score < bestScore) {
            bestScore = score
            bestPath = normalized
        }
    }

    // Only consider lastPath if it exists
    consider(lastPath)

    for (let i = 0; i < tries; i++) {
        const raw = generateHamiltonian(rows, cols, snake)

        // raw may be []
        consider(raw)
    }

    // Guaranteed safe fallback
    return bestPath ?? lastPath
}


function normalizeHamiltonian(
    path: Cell[],
    snake: Cell[] // [head ... tail]
): Cell[] {
    const head = snake[0]
    const neck = snake.length > 1 ? snake[1] : null

    // rotate so head is at index 0
    const idx = path.findIndex(
        c => c.r === head.r && c.c === head.c
    )
    if (idx === -1) return path

    let rotated = [
        ...path.slice(idx),
        ...path.slice(0, idx),
    ]

    // if next step goes into the neck, reverse direction
    if (
        neck &&
        rotated[1].r === neck.r &&
        rotated[1].c === neck.c
    ) {
        rotated = [
            rotated[0],
            ...rotated.slice(1).reverse(),
        ]
    }

    return rotated
}


function generateHamiltonian(
    rows: number,
    cols: number,
    snake: Cell[],   // [head ... tail] fixed segment on the cycle
    seed?: number,
): Cell[] {
    const total = rows * cols
    if (rows < 2 || cols < 2) throw new Error("Need rows, cols >= 2 for a cycle.")
    if ((rows % 2 === 1) && (cols % 2 === 1)) {
        throw new Error("No Hamiltonian cycle exists on an odd×odd grid.")
    }
    if (snake.length < 1) throw new Error("snake must have at least one cell.")

    const dirs = [
        {r: 1, c: 0},
        {r: -1, c: 0},
        {r: 0, c: 1},
        {r: 0, c: -1},
    ] as const

    const inBounds = (r: number, c: number) => r >= 0 && r < rows && c >= 0 && c < cols
    const isAdj = (a: Cell, b: Cell) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c) + 0 === 1
    const idx = (c: Cell) => c.r * cols + c.c

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
            const c = snake[i]
            if (!inBounds(c.r, c.c)) throw new Error("Snake cell out of bounds.")
            const k = idx(c)
            if (seen.has(k)) throw new Error("Snake contains duplicates.")
            seen.add(k)
            if (i > 0 && !isAdj(snake[i - 1], snake[i])) {
                throw new Error("Snake must be 4-neighbor adjacent along its length.")
            }
        }
    }

    const head = snake[0]
    const headNeck = snake.length > 1 ? snake[1] : null

    // Try multiple independent runs (snake can make constraints impossible)
    const MAX_RESTARTS = 200
    for (let restart = 0; restart < MAX_RESTARTS; restart++) {
        // Path representation: path[0..n-1] are visited in order.
        // We keep snake as a fixed PREFIX: path[0..snake.length-1] == snake.
        const path: Cell[] = new Array(total)
        const pos = new Int32Array(total).fill(-1) // pos[cellIndex] = index in path, -1 if not in path

        let n = 0
        for (let i = 0; i < snake.length; i++) {
            path[n] = {r: snake[i].r, c: snake[i].c}
            pos[idx(path[n])] = n
            n++
        }

        // Helper: reverse suffix segment [i1..i2] in place (updates pos)
        function reverseSegment(i1: number, i2: number) {
            while (i1 < i2) {
                const a = path[i1]
                const b = path[i2]
                path[i1] = b
                path[i2] = a
                pos[idx(path[i1])] = i1
                pos[idx(path[i2])] = i2
                i1++;
                i2--
            }
        }

        // Backbite at the FREE end only (the tail end), so the snake prefix stays intact.
        // This is the key trick to keep the snake segment fixed without expensive constraints.
        function backbiteAtTailOnce(): void {
            const tail = path[n - 1]
            if (!tail || tail.r == null || tail.c == null) return
            const d = dirs[randInt(4)]
            const neigh = {r: tail.r + d.r, c: tail.c + d.c}
            if (!inBounds(neigh.r, neigh.c)) return

            const k = idx(neigh)
            const j = pos[k]
            if (j === -1) {
                // Not in path: extend
                path[n] = neigh
                pos[k] = n
                n++
                return
            }

            // In path: do the “backbite” reversal, BUT we must not disturb the fixed snake prefix.
            // The classic move is: reverse path[j+1 .. n-1].
            // This is safe iff j+1 >= snake.length  (i.e., we don’t touch the snake prefix).
            if (j + 1 < snake.length) return
            if (j === n - 2) return // would be a no-op (neighbor is the previous vertex)

            reverseSegment(j + 1, n - 1)
        }

        // Grow until Hamiltonian path (fills grid)
        // Heuristic steps ~ O(N log^2 N) like the original code; you can tune q.
        const q = 1.0
        const attemptsPerPhase = Math.max(
            200,
            Math.floor(q * 10 * total * Math.log(2 + total) * Math.log(2 + total)),
        )

        // Because we restrict to tail-only backbite, growth can stall; we interleave “mixing”
        // and occasional random nudges by trying multiple times.
        let growthBudget = attemptsPerPhase
        while (n < total && growthBudget-- > 0) backbiteAtTailOnce()
        if (n < total) continue // restart

        // Now we have a Hamiltonian path that contains the snake prefix.

        // Mix for randomness (still respecting fixed snake prefix)
        for (let i = 0; i < attemptsPerPhase; i++) backbiteAtTailOnce()

        // Try to “close” into a cycle by further mixing until tail adjacent to head,
        // and avoid tail adjacent to headNeck (common snake-game constraint to avoid degree-3-like conflicts).
        const closeBudget = attemptsPerPhase * 2
        let closed = false
        for (let i = 0; i < closeBudget; i++) {
            const tail = path[total - 1]
            if (isAdj(tail, head) && (!headNeck || !isAdj(tail, headNeck))) {
                closed = true
                break
            }
            backbiteAtTailOnce()
        }
        if (!closed) continue // restart

        // Return the cycle order as a list of cells of length total.
        // Interpret edges as consecutive + (last -> first).
        return path.slice(0, total)
    }

    return []
}


function buildNextMap(path: Cell[]): Map<string, Cell> {
    const map = new Map<string, Cell>();
    for (let i = 0; i < path.length; i++) {
        const a = path[i];
        const b = path[(i + 1) % path.length];
        map.set(`${a.r},${a.c}`, b);
    }
    return map;
}


function randomFreeCell(
    rows: number,
    cols: number,
    occupied: Set<string>
): Cell {
    while (true) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);
        const key = `${r},${c}`;
        if (!occupied.has(key)) {
            return {r, c};
        }
    }
}


function pathFromHeadToApple(
    path: Cell[],
    snake: Cell[],
    apple: Cell
): Cell[] {
    if (path.length === 0) return [];

    const head = snake[0];
    const headIndex = path.findIndex(
        c => c.r === head.r && c.c === head.c
    );
    const appleIndex = path.findIndex(
        c => c.r === apple.r && c.c === apple.c
    );

    if (headIndex === -1 || appleIndex === -1) return [];

    // Walk forward along the Hamiltonian cycle
    const result: Cell[] = [];
    let i = headIndex;

    while (true) {
        result.push(path[i]);
        if (i === appleIndex) break;
        i = (i + 1) % path.length;

        // safety guard (should never trigger)
        if (result.length > path.length) break;
    }

    return result;
}


function SnakePage() {
    const [rows, setRows] = useState(18);
    const [cols, setCols] = useState(22);
    const [tries, setTries] = useState(3);

    const hamiltonian = useRef<Cell[]>(generateHamiltonianBasic(rows, cols));
    const nextMap = useRef<Map<string, Cell>>(buildNextMap(hamiltonian.current));

    const [snake, setSnake] = useState<Cell[]>([
        hamiltonian.current[0], hamiltonian.current[1]
    ]);
    const [apple, setApple] = useState<Cell>(() => {
        const occupied = new Set(
            hamiltonian.current
                .slice(0, 2)
                .map(c => `${c.r},${c.c}`)
        );
        return randomFreeCell(rows, cols, occupied);
    });

    const [running, setRunning] = useState(false);
    const [showPath, setShowPath] = useState(true);
    const [highlightPath, setHighlightPath] = useState(true);
    const [stepsPerSecond, setStepsPerSecond] = useState(3);

    useEffect(() => {
        console.log("Apple updated:", apple);
    }, [apple]);


    const stepOnce = useCallback(() => {
        let shouldStop = false;

        setSnake(prev => {
            const newHamiltonian = generateHamiltonianBest(
                rows,
                cols,
                hamiltonian.current,
                prev,
                apple,
                tries
            );

            hamiltonian.current = newHamiltonian;
            nextMap.current = buildNextMap(newHamiltonian);

            const head = prev[0];
            const next = nextMap.current.get(`${head.r},${head.c}`)!;
            const tail = prev[prev.length - 1];

            if (next.r === tail.r && next.c === tail.c) {
                shouldStop = true;
                return prev;
            }

            const eats =
                next.r === apple.r &&
                next.c === apple.c;

            const nextSnake = [next, ...prev];
            if (!eats) nextSnake.pop();
            else spawnApple(nextSnake);

            return nextSnake;
        });

        if (shouldStop) setRunning(false);
    }, [apple, rows, cols, tries]);


    useEffect(() => {
        if (!running) return;

        let cancelled = false;
        const interval = 1000 / stepsPerSecond;
        let nextTime = performance.now();

        const tick = () => {
            if (cancelled) return;

            const now = performance.now();

            if (now >= nextTime) {
                stepOnce();
                nextTime += interval;

                // catch up if we're very behind
                if (now > nextTime + interval) {
                    nextTime = now + interval;
                }
            }

            const delay = Math.max(0, nextTime - performance.now());
            setTimeout(tick, delay);
        };

        tick();

        return () => {
            cancelled = true;
        };
    }, [running, stepsPerSecond, stepOnce]);



    useEffect(() => {
        setRunning(false);

        const newHamiltonian = generateHamiltonianBasic(rows, cols);
        hamiltonian.current = newHamiltonian;
        nextMap.current = buildNextMap(newHamiltonian);

        const initialSnake = [
            newHamiltonian[1],
            newHamiltonian[0],
        ];

        setSnake(initialSnake);
        spawnApple(initialSnake);
    }, [rows, cols]);


    function spawnApple(currentSnake: Cell[]) {
        const occupied = new Set(
            currentSnake.map(c => `${c.r},${c.c}`)
        );

        // Grid-based random apple (no Hamiltonian dependency)
        const cell = randomFreeCell(rows, cols, occupied);
        setApple(cell);
    }


    function reset() {
        setRunning(false);
        const initialSnake = [
            hamiltonian.current[0],
            hamiltonian.current[1],
        ];
        setSnake(initialSnake);
        spawnApple(initialSnake);
    }


    function toggleShowPath() {
        setShowPath(!showPath);
    }

    function toggleHighlightPath() {
        setHighlightPath(p => !p);
    }


    return (
        <div className="bg-black text-white flex flex-col mt-24 pb-4">
            {/* Controls */}
            <div className="flex items-center gap-4 px-6 py-4 border-b border-zinc-800">
                <button
                    onClick={() => setRunning((r) => !r)}
                    className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700"
                >
                    {running ? "Pause" : "Run"}
                </button>

                <button
                    onClick={stepOnce}
                    className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700"
                >
                    Step
                </button>

                <button
                    onClick={reset}
                    className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700"
                >
                    Reset
                </button>

                {/* Steps/sec */}
                <div className="flex items-center gap-2 ml-6">
                    <span className="text-sm text-zinc-400">Steps/sec</span>
                    <input
                        type="range"
                        min={1}
                        max={180}
                        value={stepsPerSecond}
                        onChange={(e) => setStepsPerSecond(Number(e.target.value))}
                    />
                    <span className="w-10 text-right">{stepsPerSecond}</span>
                </div>

                <button
                    onClick={toggleShowPath}
                    className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700"
                >
                    {showPath ? "Hide path" : "Show path"}
                </button>
                <button
                    onClick={toggleHighlightPath}
                    className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700"
                >
                    {highlightPath ? "hide highlight" : "Show highlight"}
                </button>

                {/* Grid / Algorithm controls */}
                <div className="flex items-center gap-3 ml-6">
                    <label className="flex items-center gap-1 text-sm text-zinc-400">
                        Rows
                        <input
                            type="number"
                            min={2}
                            max={50}
                            value={rows}
                            onChange={(e) => setRows(Number(e.target.value))}
                            className="w-14 px-1 bg-zinc-900 border border-zinc-700 rounded"
                        />
                    </label>

                    <label className="flex items-center gap-1 text-sm text-zinc-400">
                        Cols
                        <input
                            type="number"
                            min={2}
                            max={50}
                            value={cols}
                            onChange={(e) => setCols(Number(e.target.value))}
                            className="w-14 px-1 bg-zinc-900 border border-zinc-700 rounded"
                        />
                    </label>

                    <label className="flex items-center gap-1 text-sm text-zinc-400">
                        Tries
                        <input
                            type="number"
                            min={1}
                            max={50}
                            value={tries}
                            onChange={(e) => setTries(Number(e.target.value))}
                            className="w-14 px-1 bg-zinc-900 border border-zinc-700 rounded"
                        />
                    </label>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 grid place-items-center">
                <div
                    className="relative grid"
                    style={{
                        gridTemplateRows: `repeat(${rows}, 1fr)`,
                        gridTemplateColumns: `repeat(${cols}, 1fr)`,
                        width: "min(90vw, 90vh)",
                        aspectRatio: `${cols} / ${rows}`,
                    }}
                >
                    {/* Grid background */}
                    {Array.from({ length: rows * cols }).map((_, idx) => {
                        const r = Math.floor(idx / cols);
                        const c = idx % cols;

                        return (
                            <div
                                key={`${r},${c}`}
                                className="border border-zinc-900 bg-zinc-950"
                            />
                        );
                    })}

                    {/* SVG overlay */}
                    <svg
                        className="absolute inset-0 pointer-events-none"
                        viewBox={`0 0 ${cols * 100} ${rows * 100}`}
                    >
                        {/* Hamiltonian path */}
                        {showPath && (
                            <polyline
                                fill="none"
                                stroke="#333"
                                strokeWidth="4"
                                points={[
                                    ...hamiltonian.current,
                                    hamiltonian.current[0],
                                ]
                                    .map(cell => `${cell.c * 100 + 50},${cell.r * 100 + 50}`)
                                    .join(" ")}
                            />
                        )}

                        {/* Highlight path */}
                        {highlightPath && (
                            <polyline
                                fill="none"
                                stroke="#facc15"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points={pathFromHeadToApple(
                                    hamiltonian.current,
                                    snake,
                                    apple
                                )
                                    .map(cell => `${cell.c * 100 + 50},${cell.r * 100 + 50}`)
                                    .join(" ")}
                            />
                        )}

                        {/* Snake body */}
                        <polyline
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="60"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={snake
                                .map(cell => `${cell.c * 100 + 50},${cell.r * 100 + 50}`)
                                .join(" ")}
                        />

                        {/* Snake head */}
                        {snake.length > 0 && (
                            <circle
                                cx={snake[0].c * 100 + 50}
                                cy={snake[0].r * 100 + 50}
                                r="34"
                                fill="#16a34a"
                            />
                        )}

                        {/* Snake tail */}
                        {snake.length > 1 && (
                            <circle
                                cx={snake[snake.length - 1].c * 100 + 50}
                                cy={snake[snake.length - 1].r * 100 + 50}
                                r="24"
                                fill="#15803d"
                            />
                        )}

                        {/* Apple */}
                        <circle
                            cx={apple.c * 100 + 50}
                            cy={apple.r * 100 + 50}
                            r="26"
                            fill="#dc2626"
                        />
                    </svg>


                </div>
            </div>
        </div>
    );
}


const Page: React.FC = () => <SnakePage/>;
const preview = (() => {
    const rows = 6;
    const cols = 6;

    // Generate Hamiltonian
    const H6_VARIANTS: Cell[][] = [
        // Variant 0
        [
            { c: 0, r: 1 },
            { c: 0, r: 2 },
            { c: 0, r: 3 },
            { c: 0, r: 4 },
            { c: 0, r: 5 },
            { c: 1, r: 5 },
            { c: 1, r: 4 },
            { c: 1, r: 3 },
            { c: 1, r: 2 },
            { c: 1, r: 1 },
            { c: 2, r: 1 },
            { c: 2, r: 2 },
            { c: 2, r: 3 },
            { c: 2, r: 4 },
            { c: 2, r: 5 },
            { c: 3, r: 5 },
            { c: 3, r: 4 },
            { c: 3, r: 3 },
            { c: 3, r: 2 },
            { c: 3, r: 1 },
            { c: 4, r: 1 },
            { c: 4, r: 2 },
            { c: 4, r: 3 },
            { c: 4, r: 4 },
            { c: 4, r: 5 },
            { c: 5, r: 5 },
            { c: 5, r: 4 },
            { c: 5, r: 3 },
            { c: 5, r: 2 },
            { c: 5, r: 1 },
            { c: 5, r: 0 },
            { c: 4, r: 0 },
            { c: 3, r: 0 },
            { c: 2, r: 0 },
            { c: 1, r: 0 },
            { c: 0, r: 0 },
        ],

        // Variant 1
        [
            { c: 2, r: 4 },
            { c: 2, r: 5 },
            { c: 3, r: 5 },
            { c: 4, r: 5 },
            { c: 5, r: 5 },
            { c: 5, r: 4 },
            { c: 4, r: 4 },
            { c: 3, r: 4 },
            { c: 3, r: 3 },
            { c: 4, r: 3 },
            { c: 5, r: 3 },
            { c: 5, r: 2 },
            { c: 5, r: 1 },
            { c: 5, r: 0 },
            { c: 4, r: 0 },
            { c: 3, r: 0 },
            { c: 3, r: 1 },
            { c: 4, r: 1 },
            { c: 4, r: 2 },
            { c: 3, r: 2 },
            { c: 2, r: 2 },
            { c: 1, r: 2 },
            { c: 1, r: 1 },
            { c: 2, r: 1 },
            { c: 2, r: 0 },
            { c: 1, r: 0 },
            { c: 0, r: 0 },
            { c: 0, r: 1 },
            { c: 0, r: 2 },
            { c: 0, r: 3 },
            { c: 0, r: 4 },
            { c: 0, r: 5 },
            { c: 1, r: 5 },
            { c: 1, r: 4 },
            { c: 1, r: 3 },
            { c: 2, r: 3 },
        ],

        // Variant 2
        [
            { c: 5, r: 2 },
            { c: 5, r: 1 },
            { c: 5, r: 0 },
            { c: 4, r: 0 },
            { c: 3, r: 0 },
            { c: 2, r: 0 },
            { c: 1, r: 0 },
            { c: 0, r: 0 },
            { c: 0, r: 1 },
            { c: 0, r: 2 },
            { c: 1, r: 2 },
            { c: 1, r: 1 },
            { c: 2, r: 1 },
            { c: 2, r: 2 },
            { c: 3, r: 2 },
            { c: 3, r: 1 },
            { c: 4, r: 1 },
            { c: 4, r: 2 },
            { c: 4, r: 3 },
            { c: 3, r: 3 },
            { c: 2, r: 3 },
            { c: 2, r: 4 },
            { c: 1, r: 4 },
            { c: 1, r: 3 },
            { c: 0, r: 3 },
            { c: 0, r: 4 },
            { c: 0, r: 5 },
            { c: 1, r: 5 },
            { c: 2, r: 5 },
            { c: 3, r: 5 },
            { c: 3, r: 4 },
            { c: 4, r: 4 },
            { c: 4, r: 5 },
            { c: 5, r: 5 },
            { c: 5, r: 4 },
            { c: 5, r: 3 },
        ],
    ];


    const path = H6_VARIANTS[Math.floor(Math.random() * H6_VARIANTS.length)];



    // Random snake length 3–5
    const snakeLen = 3 + Math.floor(Math.random() * 15);
    const start = Math.floor(Math.random() * (path.length - snakeLen));
    const snake = path.slice(start, start + snakeLen);

    // Random apple (not on snake)
    const occupied = new Set(snake.map(c => `${c.r},${c.c}`));
    const apple = randomFreeCell(rows, cols, occupied);

    const highlight = pathFromHeadToApple(path, snake, apple);

    const size = 360;
    const cell = size / cols;

    const pt = (c: Cell) =>
        `${c.c * cell + cell / 2},${c.r * cell + cell / 2}`;

    return (
        <svg
            viewBox={`0 0 ${size} ${size}`}
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full rounded bg-zinc-950 border border-zinc-800"
        >
        {/* Grid */}
            {Array.from({ length: rows * cols }).map((_, i) => {
                const r = Math.floor(i / cols);
                const c = i % cols;
                return (
                    <rect
                        key={i}
                        x={c * cell}
                        y={r * cell}
                        width={cell}
                        height={cell}
                        fill="#09090b"
                        stroke="#18181b"
                        strokeWidth="1"
                    />
                );
            })}

            {/* Hamiltonian cycle */}
            <polyline
                fill="none"
                stroke="#3f3f46"
                strokeWidth="2"
                points={[...path, path[0]].map(pt).join(" ")}
            />

            {/* Highlight path */}
            <polyline
                fill="none"
                stroke="#facc15"
                strokeWidth="4"
                strokeLinecap="round"
                points={highlight.map(pt).join(" ")}
            />

            {/* Snake body */}
            <polyline
                fill="none"
                stroke="#22c55e"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={snake.map(pt).join(" ")}
            />

            {/* Snake head */}
            <circle
                cx={snake[snake.length - 1].c * cell + cell / 2}
                cy={snake[snake.length - 1].r * cell + cell / 2}
                r={cell * 0.22}
                fill="#16a34a"
            />

            {/* Apple */}
            <circle
                cx={apple.c * cell + cell / 2}
                cy={apple.r * cell + cell / 2}
                r={cell * 0.18}
                fill="#dc2626"
            />
        </svg>
    );
})();


export const title = "Snake";
export const description = "A snake game that uses an optimised hamiltonian cycle algorithm.";

const mod: DemoModule = {title, description, preview, Page, presentable: true};
export default mod;
