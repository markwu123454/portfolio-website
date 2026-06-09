"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    intC, intR,
    generateHamiltonianBasic, buildNextMap, buildPosMap,
    normalizeHamiltonian, reachabilityField, pathFromHeadToApple,
    randomFreeCell, isSubArc,
    sliderToSteps, digitsOnly, enforceGridRules,
} from "./snakeAlgo";
import type {StateMsg, BestMsg, StatsMsg} from "./snakeAlgo";


function SnakePage() {
    const [rows, setRows] = useState(14);
    const [cols, setCols] = useState(16);

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
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [stepsPerSecond, setStepsPerSecond] = useState(3);

    const [rowsInput, setRowsInput] = useState(String(rows));
    const [colsInput, setColsInput] = useState(String(cols));

    const [steps, setSteps] = useState(0);
    const [loopsSearched, setLoopsSearched] = useState(0);

    // ── Worker + run-loop plumbing ──
    // The search runs on a background thread (snake.worker). The UI samples its
    // latest best each tick; refs (not state) carry the live snake/apple so the
    // loop and the worker stay in sync without re-rendering.
    const workerRef = useRef<Worker | null>(null);
    const latestBestRef = useRef<{ cycle: number[]; generation: number } | null>(null);
    const generationRef = useRef(0);
    const snakeRef = useRef(snake);
    const appleRef = useRef(apple);


    const stepsPerSecondCalculated =
        stepsPerSecond >= 100 ? Infinity : sliderToSteps(stepsPerSecond);

    const cellCount = rows * cols;
    const won = snake.length === cellCount;
    const apples = Math.max(0, snake.length - 2);
    const filledPct = Math.round((snake.length / cellCount) * 100);


    const heat = useMemo(() => {
        if (!showHeatmap) return null;
        const { dist, maxDist } = reachabilityField(apple, rows, cols, snake);
        return { dist, maxDist, snakeSet: new Set(snake) };
    }, [showHeatmap, apple, rows, cols, snake]);


    // Re-base the worker on the latest state + the cycle the UI currently holds
    // (its new incumbent).
    const postState = useCallback((snk: number[], app: number) => {
        const w = workerRef.current;
        if (!w) return;
        const msg: StateMsg = {
            type: "state",
            generation: generationRef.current,
            rows, cols,
            snake: snk,
            apple: app,
            cycle: hamiltonian.current,
        };
        w.postMessage(msg);
    }, [rows, cols]);


    const stepOnce = useCallback(() => {
        if (finishedRef.current) {
            setRunning(false);
            return;
        }

        const total = rows * cols;
        const prev = snakeRef.current;
        const curApple = appleRef.current;

        if (prev.length === total) {
            finishedRef.current = true;
            return;
        }

        // 1. Adopt the worker's latest best, but only if it is still a valid
        //    Hamiltonian cycle for the current snake. Otherwise keep the cycle
        //    we hold (still valid — the snake just slid along it).
        const lb = latestBestRef.current;
        if (lb && lb.generation === generationRef.current && isSubArc(lb.cycle, prev)) {
            const norm = normalizeHamiltonian(lb.cycle, prev, cols);
            hamiltonian.current = norm;
            nextMap.current = buildNextMap(norm, cols);
            hamiltonianPosMap.current = buildPosMap(norm);
        }

        const head = prev[0];
        const next = nextMap.current[head];

        // Final move that fills the board — finish before spawning an apple
        // onto a full grid (which would never find a free cell).
        if (prev.length === total - 1 && next === curApple) {
            finishedRef.current = true;
            const finalSnake = [next, ...prev];
            snakeRef.current = finalSnake;
            setSnake(finalSnake);
            setSteps(s => s + 1);
            return;
        }

        const eats = next === curApple;
        const nextSnake = [next, ...prev];
        if (!eats) nextSnake.pop();

        let nextApple = curApple;
        if (eats) {
            nextApple = randomFreeCell(rows, cols, new Set(nextSnake));
            appleRef.current = nextApple;
            setApple(nextApple);
        }

        if (nextSnake.length === total) finishedRef.current = true;

        snakeRef.current = nextSnake;
        setSnake(nextSnake);
        setSteps(s => s + 1);

        // 2. Hand the worker the new state + the cycle we now hold to refine.
        postState(nextSnake, nextApple);
    }, [rows, cols, postState]);


    const resetBoard = useCallback(() => {
        finishedRef.current = false;
        setRunning(false);

        const newHamiltonian = generateHamiltonianBasic(rows, cols);
        hamiltonian.current = newHamiltonian;
        nextMap.current = buildNextMap(newHamiltonian, cols);
        hamiltonianPosMap.current = buildPosMap(newHamiltonian);

        const initialSnake = [newHamiltonian[1], newHamiltonian[0]];
        const initialApple = randomFreeCell(rows, cols, new Set(initialSnake));
        snakeRef.current = initialSnake;
        appleRef.current = initialApple;
        setSnake(initialSnake);
        setApple(initialApple);
        setSteps(0);
        setLoopsSearched(0);

        // New generation: stale worker results (tagged with the old one) are
        // ignored until the worker catches up to this board.
        generationRef.current += 1;
        latestBestRef.current = null;
        postState(initialSnake, initialApple);
    }, [rows, cols, postState]);


    // Create the worker once, on mount (declared before the reset effect so it
    // exists when the first state is posted).
    useEffect(() => {
        const w = new Worker(new URL("./snake.worker.ts", import.meta.url), { type: "module" });
        w.onmessage = (e: MessageEvent<BestMsg | StatsMsg>) => {
            const m = e.data;
            if (!m) return;
            if (m.type === "best") {
                latestBestRef.current = { cycle: m.cycle, generation: m.generation };
            } else if (m.type === "stats" && m.generation === generationRef.current) {
                setLoopsSearched(m.generated);
            }
        };
        workerRef.current = w;
        return () => {
            w.terminate();
            workerRef.current = null;
        };
    }, []);


    // Reset the board on mount and whenever the grid changes.
    useEffect(() => { resetBoard(); }, [resetBoard]);


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


    useEffect(() => { setRowsInput(String(rows)); }, [rows]);
    useEffect(() => { setColsInput(String(cols)); }, [cols]);


    function reset() {
        resetBoard();
    }

    function toggleShowPath() { setShowPath(!showPath); }
    function toggleHighlightPath() { setHighlightPath(p => !p); }

    // Rendering helper: int cell -> SVG coordinate string
    const ptInt = (v: number) =>
        `${intC(v, cols) * 100 + 50},${intR(v, cols) * 100 + 50}`;


    return (
        <div className="flex flex-col pb-4">
            {/* Control Panel */}
            <div className="sticky top-0 z-20 bg-[color-mix(in_srgb,var(--bg)_95%,transparent)] backdrop-blur-md border-b border-rule">
                <div className="mx-auto px-8 py-4 grid grid-cols-1 lg:grid-cols-4 gap-4">

                    <div className="flex items-center gap-2 bg-bg-elev border border-rule rounded-md p-3">
                        <button
                            onClick={() => setRunning(r => !r)}
                            className="px-4 py-2 rounded border border-fg bg-fg text-bg hover:opacity-90 font-mono text-[11px] tracking-kicker uppercase transition-opacity"
                        >
                            {running ? "Pause" : "Run"}
                        </button>
                        <button
                            onClick={stepOnce}
                            className="px-3 py-2 rounded border border-rule bg-bg-elev hover:border-rule-strong font-mono text-[11px] tracking-kicker uppercase transition-colors"
                        >
                            Step
                        </button>
                        <button
                            onClick={reset}
                            className="px-3 py-2 rounded border border-rule bg-bg-elev hover:border-rule-strong font-mono text-[11px] tracking-kicker uppercase transition-colors"
                        >
                            Reset
                        </button>
                    </div>

                    <div className="bg-bg-elev border border-rule rounded-md p-3 flex flex-col justify-center">
                        <div className="flex justify-between font-mono text-[10px] tracking-kicker uppercase text-fg-soft mb-1">
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

                    <div className="bg-bg-elev border border-rule rounded-md p-3 flex flex-wrap gap-2">
                        <button
                            onClick={toggleShowPath}
                            className={`flex-1 min-w-24 px-3 py-2 rounded-md text-sm ${
                                showPath
                                    ? "bg-fg text-bg hover:opacity-90"
                                    : "bg-zinc-800 hover:bg-zinc-700"
                            }`}
                        >
                            Hamiltonian Path
                        </button>
                        <button
                            onClick={toggleHighlightPath}
                            className={`flex-1 min-w-24 px-3 py-2 rounded-md text-sm ${
                                highlightPath
                                    ? "bg-warn text-bg hover:opacity-90"
                                    : "bg-zinc-800 hover:bg-zinc-700"
                            }`}
                        >
                            Head &rarr; Apple
                        </button>
                        <button
                            onClick={() => setShowHeatmap(h => !h)}
                            className={`flex-1 min-w-24 px-3 py-2 rounded-md text-sm ${
                                showHeatmap
                                    ? "bg-linear-to-r from-emerald-500 to-rose-500 text-bg hover:opacity-90"
                                    : "bg-zinc-800 hover:bg-zinc-700"
                            }`}
                        >
                            Heatmap
                        </button>
                    </div>

                    <div className="bg-bg-elev border border-rule rounded-md p-3 grid grid-cols-2 gap-2 text-sm">
                        <label className="flex flex-col gap-1 font-mono text-[10px] tracking-kicker uppercase text-fg-soft">
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
                                className="px-2 py-1 bg-bg border border-rule rounded font-mono text-[11px] text-fg disabled:opacity-40"
                            />
                        </label>
                        <label className="flex flex-col gap-1 font-mono text-[10px] tracking-kicker uppercase text-fg-soft">
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
                                className="px-2 py-1 bg-bg border border-rule rounded font-mono text-[11px] text-fg disabled:opacity-40"
                            />
                        </label>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="mx-auto w-full px-8 pt-3">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-[11px] tracking-kicker uppercase text-fg-soft">
                    <span>Steps <span className="text-fg">{steps.toLocaleString()}</span></span>
                    <span>Apples <span className="text-fg">{apples}</span></span>
                    <span>Filled <span className="text-fg">{filledPct}%</span></span>
                    <span>Loops searched <span className="text-fg">{loopsSearched.toLocaleString()}</span></span>
                    {won && <span className="text-emerald-400 font-semibold">Solved</span>}
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 grid place-items-center mt-2 px-8">
                <div
                    className="relative grid"
                    style={{
                        gridTemplateRows: `repeat(${rows}, 1fr)`,
                        gridTemplateColumns: `repeat(${cols}, 1fr)`,
                        height: "min(75vw, 75vh)",
                        aspectRatio: `${cols} / ${rows}`,
                    }}
                >
                    {Array.from({length: rows * cols}).map((_, idx) => {
                        let bg: string | undefined;
                        if (heat && !heat.snakeSet.has(idx)) {
                            const d = heat.dist[idx];
                            const t = d < 0 ? 1 : heat.maxDist > 0 ? d / heat.maxDist : 0;
                            bg = `hsla(${Math.round(120 * (1 - t))}, 70%, 50%, 0.2)`;
                        }
                        return (
                            <div
                                key={idx}
                                className="border border-rule bg-bg"
                                style={bg ? { backgroundColor: bg } : undefined}
                            />
                        );
                    })}

                    <svg
                        className="absolute inset-0 pointer-events-none"
                        viewBox={`0 0 ${cols * 100} ${rows * 100}`}
                    >
                        {showPath && (
                            <polyline
                                fill="none" stroke={showHeatmap ? "#d4d4d8" : "#333"} strokeWidth="4"
                                points={[...hamiltonian.current, hamiltonian.current[0]].map(ptInt).join(" ")}
                            />
                        )}

                        {highlightPath && !won && (
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

                        {!won && (
                            <circle
                                cx={intC(apple, cols) * 100 + 50}
                                cy={intR(apple, cols) * 100 + 50}
                                r="26" fill="#dc2626"
                            />
                        )}

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

                    {won && (
                        <div className="absolute inset-0 grid place-items-center pointer-events-none">
                            <div className="px-5 py-3 rounded-lg border border-emerald-500 bg-[color-mix(in_srgb,var(--bg)_80%,transparent)] backdrop-blur-sm text-emerald-400 font-mono text-sm tracking-kicker uppercase text-center">
                                Solved
                                <div className="text-fg-soft text-[11px] mt-1">{steps.toLocaleString()} steps</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Info / Documentation */}
            <div className="max-w-275 mx-auto px-8 py-10 text-fg space-y-6 border-t border-rule mt-6">
                <section>
                    <h2 className="text-[22px] font-semibold tracking-tight-2 mb-2">How it works</h2>
                    <p className="leading-relaxed text-fg-muted">
                        The snake always follows a <strong>Hamiltonian cycle</strong> &mdash; a single
                        loop that passes through every square on the board exactly once. As long
                        as it never leaves that loop it can always reach its own tail, so it can
                        never trap itself: the game is impossible to lose.
                    </p>
                    <p className="leading-relaxed text-fg-muted mt-3">
                        A fixed loop is safe but slow &mdash; the snake would crawl through the whole
                        board to reach each apple. So instead of sticking to one loop, the agent
                        constantly searches for <em>different</em> loops: ones that reach the apple
                        sooner, and that leave the most open space behind so the next apple is easy
                        to get to as well.
                    </p>
                    <p className="leading-relaxed text-fg-muted mt-3">
                        That search runs on a background thread, continuously improving its best
                        loop while the page stays responsive. Each move, the snake hops onto the
                        best loop found so far and steps one square along it &mdash; playing greedily
                        when it&apos;s safe, and falling back to a slower but safe loop whenever it isn&apos;t.
                    </p>
                </section>

                <section>
                    <h2 className="text-[22px] font-semibold tracking-tight-2 mb-2">Controls</h2>
                    <ul className="list-disc list-inside space-y-1 text-fg-muted">
                        <li><strong>Run / Pause</strong> &mdash; start or halt the simulation</li>
                        <li><strong>Step</strong> &mdash; advance by a single move</li>
                        <li><strong>Speed</strong> &mdash; how many moves per second to play</li>
                        <li><strong>Hamiltonian Path</strong> &mdash; show the full loop the snake is on</li>
                        <li><strong>Head &rarr; Apple</strong> &mdash; highlight the route to the next apple</li>
                        <li><strong>Heatmap</strong> &mdash; shade each square by how far it is from the apple around the snake, revealing space the body has walled off</li>
                        <li><strong>Rows / Cols</strong> &mdash; change the board size <em>(resets the game)</em></li>
                    </ul>
                </section>
            </div>
        </div>
    );
}


export default function SnakePageRoute() {
    return <SnakePage />;
}
