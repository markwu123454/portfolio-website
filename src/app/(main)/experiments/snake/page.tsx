"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {InlineMath, BlockMath} from 'react-katex';
import {
    intC, intR,
    generateHamiltonianBasic, buildNextMap, buildPosMap,
    normalizeHamiltonian, reachabilityField, pathFromHeadToApple,
    randomFreeCell, isSubArc,
    sliderToSteps, digitsOnly, enforceGridRules,
} from "./snakeAlgo";
import type {StateMsg, BestMsg} from "./snakeAlgo";


function SnakePage() {
    const [rows, setRows] = useState(14);
    const [cols, setCols] = useState(16);
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
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [stepsPerSecond, setStepsPerSecond] = useState(3);

    const [rowsInput, setRowsInput] = useState(String(rows));
    const [colsInput, setColsInput] = useState(String(cols));
    const [techMode, setTechMode] = useState<"casual" | "formal">("casual");

    // ── Worker + run-loop plumbing ──
    // The search runs on a background thread (snake.worker). The UI samples its
    // latest best each tick; refs (not state) carry the live snake/apple so the
    // loop and the worker stay in sync without re-rendering.
    const workerRef = useRef<Worker | null>(null);
    const latestBestRef = useRef<{ cycle: number[]; generation: number } | null>(null);
    const generationRef = useRef(0);
    const snakeRef = useRef(snake);
    const appleRef = useRef(apple);
    const effortRef = useRef(0.5);


    const stepsPerSecondCalculated =
        stepsPerSecond >= 100 ? Infinity : sliderToSteps(stepsPerSecond);

    const effort = Math.max(0.02, triesSlider / 100);


    const heat = useMemo(() => {
        if (!showHeatmap) return null;
        const { dist, maxDist } = reachabilityField(apple, rows, cols, snake);
        return { dist, maxDist, snakeSet: new Set(snake) };
    }, [showHeatmap, apple, rows, cols, snake]);


    // Re-base the worker on the latest state + the cycle the UI currently holds
    // (its new incumbent). Effort is read from a ref so changing it doesn't
    // churn this callback's identity (which would reset the board).
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
            effort: effortRef.current,
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
        w.onmessage = (e: MessageEvent<BestMsg>) => {
            const m = e.data;
            if (m && m.type === "best") {
                latestBestRef.current = { cycle: m.cycle, generation: m.generation };
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


    // Push effort changes to the worker without resetting the board.
    useEffect(() => {
        effortRef.current = effort;
        if (workerRef.current) postState(snakeRef.current, appleRef.current);
    }, [effort, postState]);


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

                    <div className="bg-bg-elev border border-rule rounded-md p-3 grid grid-cols-3 gap-2 text-sm">
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
                        <label className="flex flex-col gap-1 font-mono text-[10px] tracking-kicker uppercase text-fg-soft">
                            <div className="flex justify-between">
                                <span>Effort</span>
                                <span className="text-zinc-500 text-xs">{Math.round(effort * 100)}%</span>
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
            <div className="max-w-275 mx-auto px-8 py-10 text-fg space-y-6 border-t border-rule mt-6">
                <section>
                    <h2 className="text-[22px] font-semibold tracking-tight-2 mb-2">Overview</h2>
                    <p className="leading-relaxed text-fg-muted">
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
                    <h2 className="text-[22px] font-semibold tracking-tight-2 mb-2">Controls</h2>
                    <ul className="list-disc list-inside space-y-1 text-fg-muted">
                        <li><strong>Run / Pause</strong> &mdash; start or halt the simulation</li>
                        <li><strong>Step</strong> &mdash; advance the simulation by one tick</li>
                        <li><strong>Speed</strong> &mdash; control steps per second (bounded by computation time)</li>
                        <li><strong>Hamiltonian Path</strong> &mdash; toggle the full cycle view</li>
                        <li><strong>Head &rarr; Apple</strong> &mdash; show the currently selected path</li>
                        <li><strong>Heatmap</strong> &mdash; shade each cell by its distance from the apple around the snake, revealing regions the body has walled off</li>
                        <li><strong>Rows / Cols</strong> &mdash; change grid dimensions <em>(resets the simulation)</em></li>
                        <li><strong>Effort</strong> &mdash; how hard the background search works between moves (higher = better cycles, more CPU)</li>
                    </ul>
                </section>

                <section>
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setTechMode("casual")}
                            className={`px-3 py-1 rounded font-mono text-[11px] tracking-kicker uppercase border transition-colors ${
                                techMode === "casual"
                                    ? "bg-fg text-bg"
                                    : "bg-bg-elev border border-rule text-fg-muted hover:border-rule-strong"
                            }`}
                        >
                            Intuition
                        </button>
                        <button
                            onClick={() => setTechMode("formal")}
                            className={`px-3 py-1 rounded font-mono text-[11px] tracking-kicker uppercase border transition-colors ${
                                techMode === "formal"
                                    ? "bg-accent text-bg"
                                    : "bg-bg-elev border border-rule text-fg-muted hover:border-rule-strong"
                            }`}
                        >
                            Formal / Math
                        </button>
                    </div>

                    <h2 className="text-[22px] font-semibold tracking-tight-2 mb-2">Technical Notes</h2>

                    {techMode === "casual" && (
                        <>
                            <p className="leading-relaxed text-fg-muted">
                                The core idea of using a hamiltonian cycle is to force the snake to always move along a
                                path that visits every grid cell exactly once.
                                Because as long as the snake never leaves this cycle, the head can always every square before looping, which makes failure impossible
                            </p>
                            <p className="leading-relaxed text-fg-muted mt-3">
                                At each time step, the current snake body is treated as a
                                locked-in segment of the cycle. The algorithm then attempts to
                                complete the rest of the cycle around this fixed segment using
                                randomized backbite operations that only modify the free tail
                                of the path. Any construction that would disturb the snake&apos;s
                                ordering is rejected immediately.
                            </p>
                            <p className="leading-relaxed text-fg-muted mt-3">
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
                            <p className="leading-relaxed text-fg-muted mt-3">
                                Among all valid candidates, the cycle that brings the apple
                                closest in forward cycle distance is selected. This allows the
                                snake to take short, direct routes to the apple when possible,
                                while still falling back to a slower but still safe cycle if
                                no improvement exists.
                            </p>
                            <p className="leading-relaxed text-fg-muted mt-3">
                                The result is a strategy that behaves greedily when it is safe
                                to do so, but defaults to a conservative traversal of the grid
                                whenever risk would be introduced. This balance makes the
                                snake appear intelligent without ever entering a losing state.
                            </p>
                        </>
                    )}

                    {techMode === "formal" && (
                        <>
                            <p className="leading-relaxed text-fg-muted">
                                The board is modeled as a rectangular grid graph
                                <InlineMath math="G = (V, E)"/>, where
                                <InlineMath math="|V| = N = \text{rows} \times \text{cols}"/> and
                                edges connect orthogonally adjacent cells.
                            </p>
                            <p className="leading-relaxed text-fg-muted mt-3">
                                At time step <InlineMath math="t"/>, the snake configuration
                                <InlineMath math="S_t = (v_0, \dots, v_k)"/> is a contiguous
                                subsequence of a Hamiltonian cycle
                                <InlineMath math="H_t = (h_0, \dots, h_{N-1})"/> over
                                <InlineMath math="G"/>:
                            </p>
                            <BlockMath math="S_t \subseteq H_t"/>
                            <p className="leading-relaxed text-fg-muted mt-3">
                                The cycle ordering induces a directed successor relation,
                                allowing the snake to advance by replacing its head with the
                                next vertex along <InlineMath math="H_t"/>.
                            </p>
                            <p className="leading-relaxed text-fg-muted mt-3">
                                At each step, the algorithm samples a finite set of candidate
                                Hamiltonian cycles:
                            </p>
                            <BlockMath math="\mathcal{C}_t = \{ H_t^{(1)}, \dots, H_t^{(k_t)} \}"/>
                            <p className="leading-relaxed text-fg-muted">
                                Each candidate cycle preserves the ordering of
                                <InlineMath math="S_t"/> and is generated by completing the
                                remaining vertices using randomized tail-restricted backbite
                                operations, ensuring that the fixed snake prefix is never
                                modified.
                            </p>
                            <p className="leading-relaxed text-fg-muted mt-3">
                                For any Hamiltonian cycle
                                <InlineMath math="H"/>, define the forward cycle distance
                                <InlineMath math="d_H(u, v)"/> as the number of edges traversed
                                when moving forward along <InlineMath math="H"/> from
                                <InlineMath math="u"/> to <InlineMath math="v"/>.
                            </p>
                            <p className="leading-relaxed text-fg-muted mt-3">
                                Let <InlineMath math="d^*_t = d_{\mathrm{BFS}}(\text{head}_t, \text{apple}_t \mid G \setminus S_t)"/>
                                {" "}denote the BFS shortest-path distance from head to apple on the
                                grid with the snake body removed. This serves as a lower bound:
                                <InlineMath math="d_H(\text{head}_t, \text{apple}_t) \geq d^*_t"/> for any
                                valid cycle <InlineMath math="H"/>.
                            </p>
                            <p className="leading-relaxed text-fg-muted mt-3">
                                The number of candidate cycles sampled is adaptive. Define the
                                optimality ratio:
                            </p>
                            <BlockMath math="\rho_t = \frac{d_{H_{\mathrm{best}}}(\text{head}_t, \text{apple}_t)}{d^*_t}"/>
                            <p className="leading-relaxed text-fg-muted">
                                When <InlineMath math="\rho_t \approx 1"/>, the current cycle is
                                near-optimal and sampling terminates early. As <InlineMath math="\rho_t"/>
                                {" "}grows, the search budget <InlineMath math="k_t"/> increases,
                                scaled by a user-controlled effort multiplier <InlineMath math="\mu"/>:
                            </p>
                            <BlockMath math="k_t = \left\lceil \mu \cdot f(\rho_t) \right\rceil, \quad f(\rho) = \begin{cases} 0 & \rho \leq 1 \\\\ 1 & \rho \leq 1.2 \\\\ 1 + 14 \cdot \frac{\rho - 1.2}{3.8} & \rho > 1.2 \end{cases}"/>
                            <p className="leading-relaxed text-fg-muted mt-3">
                                The selected cycle minimizes the distance from the snake&apos;s head
                                to the apple:
                            </p>
                            <BlockMath math="
            H_t \;=\;
            \arg\min_{H \in \mathcal{C}_t \cup \{H_{t-1}\}}
            d_H(\text{head}_t, \text{apple}_t)
            "/>
                            <p className="leading-relaxed text-fg-muted mt-3">
                                Because the snake always advances along a Hamiltonian cycle,
                                the tail remains reachable from the head at all times. As long
                                as a Hamiltonian cycle exists for the grid, the snake can never
                                enter a dead-end configuration.
                            </p>
                            <p className="leading-relaxed text-fg-muted mt-3">
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


export default function SnakePageRoute() {
    return <SnakePage />;
}
