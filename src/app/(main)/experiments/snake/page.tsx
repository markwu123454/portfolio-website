"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {
    intC, intR,
    generateHamiltonianBasic, buildNextMap, buildPosMap,
    normalizeHamiltonian, pathFromHeadToApple,
    randomFreeCell, isSubArc, simulateSafe,
    sliderToSteps, digitsOnly, enforceGridRules,
} from "./snakeAlgo";
import type {StateMsg, PlanMsg, StatsMsg, PreplanStateMsg, PreplanMsg} from "./snakeAlgo";


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
    // Deterministic initial apple so server and client hydrate identically (no
    // Math.random in render). resetBoard picks a real random cell on mount.
    const [apple, setApple] = useState<number>(() =>
        hamiltonian.current[hamiltonian.current.length - 1]
    );

    const [running, setRunning] = useState(false);
    const [showSnake, setShowSnake] = useState(true);
    const [showPath, setShowPath] = useState(true);
    const [highlightPath, setHighlightPath] = useState(true);
    const [showApproach, setShowApproach] = useState(false);
    const [showGrid, setShowGrid] = useState(true);
    const [stepsPerSecond, setStepsPerSecond] = useState(50);

    const [rowsInput, setRowsInput] = useState(String(rows));
    const [colsInput, setColsInput] = useState(String(cols));

    const [steps, setSteps] = useState(0);
    const [loopsSearched, setLoopsSearched] = useState(0);
    // The route the snake will actually walk to the apple — the executing plan's
    // remaining path, or the arc along the current cycle when just following it.
    const [route, setRoute] = useState<number[]>([]);
    // Index into `route` where the on-loop settle begins (the "start point"): the
    // stretch before it is the off-loop transition. 0 when just following the loop.
    const [routeStart, setRouteStart] = useState(0);
    // The full loop drawn in grey. During a re-home this is the target loop the
    // snake is settling onto; otherwise the loop it is currently riding.
    const [displayCycle, setDisplayCycle] = useState<number[]>(hamiltonian.current);

    // ── Worker + run-loop plumbing ──
    // The planner runs on a background thread (snake.worker). By default the UI
    // follows the cycle it currently holds (Phase A); when the worker posts a
    // faster, verified re-homing plan the UI executes it instead. Refs (not
    // state) carry the live snake/apple so the loop stays in sync without
    // re-rendering.
    const workerRef = useRef<Worker | null>(null);
    const latestPlanRef = useRef<PlanMsg | null>(null);
    // The re-homing plan currently being executed (off the current cycle). Null
    // means we are on-cycle; once we commit to a plan we run it to the eat.
    const execRef = useRef<{ path: number[]; index: number; cycle: number[]; entryIdx: number } | null>(null);
    const generationRef = useRef(0);
    // Bumped on every posted state (each step + reset). A plan is only adopted
    // when its serial still matches the state the UI last posted, so a plan
    // computed for a stale head/apple can never be executed.
    const stateSerialRef = useRef(0);
    const snakeRef = useRef(snake);
    const appleRef = useRef(apple);

    // ── Next-apple pre-planning ──
    // The instant the state the snake will be in when it finishes eating the
    // CURRENT apple becomes deterministic (a re-homing plan just got adopted, or
    // it's walking a fixed Phase-A cycle toward a fixed apple), we pick the NEXT
    // apple early and ask the worker to start re-homing for it right away — using
    // the whole remaining approach as lead time, so a fast route is normally
    // already sitting there the instant the real eat happens.
    const preplanTokenRef = useRef(0);
    const preplanRef = useRef<{ token: number; futureBody: number[]; apple: number; cycle: number[] } | null>(null);
    const latestPreplanRef = useRef<PreplanMsg | null>(null);
    // What future the current preplan request was computed against, so we only
    // re-issue it when that future actually changes (a fresh plan adoption, or a
    // new Phase-A apple) rather than every single step.
    const preplanBasisRef = useRef<
        | { kind: "exec"; path: number[] }
        | { kind: "phaseA"; cycle: number[]; apple: number }
        | null
    >(null);


    const stepsPerSecondCalculated =
        stepsPerSecond >= 100 ? Infinity : sliderToSteps(stepsPerSecond);

    const cellCount = rows * cols;
    const won = snake.length === cellCount;
    const apples = Math.max(0, snake.length - 2);
    const filledPct = Math.round((snake.length / cellCount) * 100);


    // Re-base the worker on the latest state + the cycle the UI currently holds
    // (its new incumbent).
    const postState = useCallback((snk: number[], app: number) => {
        const w = workerRef.current;
        if (!w) return;
        const serial = ++stateSerialRef.current;
        const msg: StateMsg = {
            type: "state",
            generation: generationRef.current,
            serial,
            rows, cols,
            snake: snk,
            apple: app,
            cycle: hamiltonian.current,
        };
        w.postMessage(msg);
    }, [rows, cols]);

    // Ask the worker to start re-homing for a deterministic FUTURE state — see
    // the preplan refs above.
    const postPreplan = useCallback((futureBody: number[], futureApple: number, cycle: number[]) => {
        const w = workerRef.current;
        if (!w) return;
        const token = ++preplanTokenRef.current;
        preplanRef.current = { token, futureBody, apple: futureApple, cycle };
        latestPreplanRef.current = null;
        const msg: PreplanStateMsg = {
            type: "preplanState",
            generation: generationRef.current,
            token,
            rows, cols,
            snake: futureBody,
            apple: futureApple,
            cycle,
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

        // 1. On-cycle (Phase A): consider adopting a faster re-homing plan. Once
        //    we start executing one we commit to it until the eat — mid-transition
        //    the snake is off any single cycle, so we never re-evaluate there.
        if (!execRef.current) {
            const pl = latestPlanRef.current;
            if (
                pl &&
                pl.generation === generationRef.current &&
                pl.serial === stateSerialRef.current &&
                pl.path.length >= 2 &&
                pl.path[0] === prev[0] &&
                isSubArc(hamiltonian.current, prev) &&
                simulateSafe(prev, curApple, pl.path, cols)
            ) {
                const pm = hamiltonianPosMap.current;
                const arc = ((pm[curApple] - pm[prev[0]]) % total + total) % total;
                if (pl.path.length - 1 < arc) {
                    // The settle arc is the last `prev.length` cells; the entry
                    // (start point where the route joins the loop) sits just before it.
                    execRef.current = {
                        path: pl.path, index: 0, cycle: pl.cycle,
                        entryIdx: pl.path.length - prev.length - 1,
                    };
                }
            }
        }

        // 2. Next head cell: the plan's next step if executing, else one step
        //    along the current cycle (the always-safe Phase-A fallback).
        const ex = execRef.current;
        let next: number;
        if (ex && ex.path[ex.index + 1] !== undefined) {
            next = ex.path[ex.index + 1];
        } else {
            execRef.current = null;
            next = nextMap.current[prev[0]];
        }

        // Final move that fills the board — finish before spawning an apple
        // onto a full grid (which would never find a free cell).
        if (prev.length === total - 1 && next === curApple) {
            finishedRef.current = true;
            const finalSnake = [next, ...prev];
            execRef.current = null;
            snakeRef.current = finalSnake;
            setSnake(finalSnake);
            setSteps(s => s + 1);
            setRoute([]);
            setRouteStart(0);
            return;
        }

        const eats = next === curApple;
        const nextSnake = [next, ...prev];
        if (!eats) nextSnake.pop();

        // 3. Advance / finish the executing plan.
        const exNow = execRef.current;
        if (exNow) {
            if (eats) {
                // Settled onto the plan's cycle — the snake is now a contiguous
                // sub-arc of it, so adopt it as the current cycle and go on-cycle.
                const norm = normalizeHamiltonian(exNow.cycle, nextSnake, cols);
                hamiltonian.current = norm;
                nextMap.current = buildNextMap(norm, cols);
                hamiltonianPosMap.current = buildPosMap(norm);
                execRef.current = null;
            } else {
                exNow.index++;
            }
        }

        let nextApple = curApple;
        if (eats) {
            // Prefer the apple we already pre-planned for: if the body we predicted
            // we'd have at this exact eat matches what actually happened, the
            // worker has (usually) had the whole approach to solve it, so a fast
            // plan can be adopted immediately instead of waiting a step.
            const pp = preplanRef.current;
            const ppMatches = !!pp && pp.futureBody.length === nextSnake.length &&
                pp.futureBody.every((c, i) => c === nextSnake[i]);

            if (ppMatches) {
                nextApple = pp!.apple;
                const lp = latestPreplanRef.current;
                if (
                    lp &&
                    lp.token === pp!.token &&
                    lp.path.length >= 2 &&
                    lp.path[0] === nextSnake[0] &&
                    simulateSafe(nextSnake, nextApple, lp.path, cols)
                ) {
                    execRef.current = {
                        path: lp.path, index: 0, cycle: lp.cycle,
                        entryIdx: lp.path.length - nextSnake.length - 1,
                    };
                }
            } else {
                nextApple = randomFreeCell(rows, cols, new Set(nextSnake));
            }
            appleRef.current = nextApple;
            setApple(nextApple);
        }

        if (nextSnake.length === total) finishedRef.current = true;

        snakeRef.current = nextSnake;
        setSnake(nextSnake);
        setSteps(s => s + 1);

        // Highlight the route the snake will actually walk to the apple, and the
        // point where it joins a loop to ride the rest of the way in.
        const exAfter = execRef.current;
        if (exAfter) {
            setRoute(exAfter.path.slice(exAfter.index));
            setRouteStart(Math.max(0, exAfter.entryIdx - exAfter.index));
            setDisplayCycle(exAfter.cycle);
        } else {
            setDisplayCycle(hamiltonian.current);
            // On the tick that eats, skip the route update: the naive head->apple
            // walk around the whole loop to the brand-new apple would flash huge
            // for one frame before the worker's re-homing plan (just requested
            // below) arrives and shrinks it back down. Leave the prior (already
            // mostly-consumed) route on screen until the next step resolves it.
            if (!eats) {
                setRoute(pathFromHeadToApple(hamiltonian.current, nextSnake, nextApple, cols, hamiltonianPosMap.current));
                setRouteStart(0);
            }
        }

        // 4. Hand the worker the new state + the cycle we now follow.
        postState(nextSnake, nextApple);

        // 5. Once the future state past THIS apple is deterministic — a plan just
        //    got committed, or we're walking a fixed Phase-A cycle toward a fixed
        //    apple — pre-pick the next apple and ask the worker to start solving
        //    for it now, so it has the rest of this approach as lead time. Skipped
        //    near the very end of the board, where there may be no room to pick a
        //    meaningful next apple at all.
        if (nextSnake.length < total - 1) {
            const exPost = execRef.current;
            if (exPost) {
                const basis = preplanBasisRef.current;
                if (basis?.kind !== "exec" || basis.path !== exPost.path) {
                    const s = nextSnake.length;
                    const futureBody = exPost.path.slice(-(s + 1)).reverse();
                    const futureApple = randomFreeCell(rows, cols, new Set(futureBody));
                    preplanBasisRef.current = { kind: "exec", path: exPost.path };
                    postPreplan(futureBody, futureApple, exPost.cycle);
                }
            } else {
                const basis = preplanBasisRef.current;
                if (basis?.kind !== "phaseA" || basis.cycle !== hamiltonian.current || basis.apple !== nextApple) {
                    const cyc = hamiltonian.current;
                    const pm = hamiltonianPosMap.current;
                    const ai = pm[nextApple];
                    const s = nextSnake.length;
                    const futureBody: number[] = [];
                    for (let i = 0; i <= s; i++) futureBody.push(cyc[((ai - i) % total + total) % total]);
                    const futureApple = randomFreeCell(rows, cols, new Set(futureBody));
                    preplanBasisRef.current = { kind: "phaseA", cycle: cyc, apple: nextApple };
                    postPreplan(futureBody, futureApple, cyc);
                }
            }
        }
    }, [rows, cols, postState, postPreplan]);


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
        setRoute(pathFromHeadToApple(newHamiltonian, initialSnake, initialApple, cols, hamiltonianPosMap.current));
        setRouteStart(0);
        setDisplayCycle(newHamiltonian);

        // New generation: stale worker plans (tagged with the old one) are
        // ignored until the worker catches up to this board.
        generationRef.current += 1;
        latestPlanRef.current = null;
        execRef.current = null;
        preplanRef.current = null;
        latestPreplanRef.current = null;
        preplanBasisRef.current = null;
        postState(initialSnake, initialApple);
    }, [rows, cols, postState]);


    // Create the worker once, on mount (declared before the reset effect so it
    // exists when the first state is posted).
    useEffect(() => {
        const w = new Worker(new URL("./snake.worker.ts", import.meta.url), { type: "module" });
        w.onmessage = (e: MessageEvent<PlanMsg | StatsMsg | PreplanMsg>) => {
            const m = e.data;
            if (!m) return;
            if (m.type === "plan") {
                latestPlanRef.current = m;
            } else if (m.type === "preplan") {
                if (preplanRef.current?.token === m.token && m.generation === generationRef.current) {
                    latestPreplanRef.current = m;
                }
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
        <div className="flex flex-col">
            <div className="flex flex-col lg:flex-row lg:min-h-[calc(100vh-53px)]">
                {/* ── Left control rail (concept B) ── */}
                <aside className="lg:w-[320px] lg:flex-none shrink-0 border-b lg:border-b-0 lg:border-r border-rule bg-bg-elev p-6 flex flex-col gap-5 box-border">
                    <div>
                        <div className="font-mono text-[11px] tracking-kicker uppercase text-accent flex items-center gap-2">
                            <span>EXPERIMENT</span><span className="text-fg-soft">·</span><span>SNAKE</span>
                        </div>
                        <h1 className="mt-2.5 mb-1 text-[28px] font-semibold tracking-[-0.025em]">Snake</h1>
                        <p className="m-0 text-[13px] text-fg-muted leading-snug">Optimised Hamiltonian cycle — it cannot lose.</p>
                        <a href="/experiments/snake-versus" className="inline-block mt-2 font-mono text-[11px] tracking-kicker uppercase text-accent hover:underline">Versus mode →</a>
                    </div>

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

                    {/* Layer checklist — the rail's signature control */}
                    <div>
                        <div className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft mb-2.5">Layers</div>
                        <div className="flex flex-col gap-0.5">
                            <LayerToggle on={showSnake} color="#22c55e" label="Snake" onClick={() => setShowSnake(s => !s)} />
                            <LayerToggle on={showPath} color="var(--fg)" label="Hamiltonian path" onClick={toggleShowPath} />
                            <LayerToggle on={highlightPath} color="#facc15" label="Head → apple" onClick={toggleHighlightPath} />
                            <LayerToggle on={showApproach} color="#fb923c" label="Loop approach" onClick={() => setShowApproach(a => !a)} />
                            <LayerToggle on={showGrid} color="var(--fg-soft)" label="Grid" onClick={() => setShowGrid(g => !g)} />
                        </div>
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

                    <div className="flex-1" />

                    {/* Telemetry */}
                    <div className="border-t border-rule pt-4 grid grid-cols-2 gap-x-6 gap-y-4">
                        <Stat label="Steps" value={steps.toLocaleString()} />
                        <Stat label="Apples" value={String(apples)} />
                        <Stat label="Filled" value={`${filledPct}%`} />
                        <Stat label="Cycles banked" value={loopsSearched.toLocaleString()} />
                    </div>
                    {won && (
                        <div className="font-mono text-[11px] tracking-kicker uppercase text-emerald-400 font-semibold">Solved · {steps.toLocaleString()} steps</div>
                    )}
                </aside>

                {/* ── Board ── */}
                <div className="flex-1 min-w-0 flex flex-col p-6 lg:p-8">
                    <div className="flex-1 grid place-items-center min-h-[60vh] lg:min-h-0">
                        <div
                            className="relative grid"
                            style={{
                                gridTemplateRows: `repeat(${rows}, 1fr)`,
                                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                                height: "82vh",
                                width: `calc(82vh * ${cols} / ${rows})`,
                                maxWidth: "100%",
                                maxHeight: "100%",
                                aspectRatio: `${cols} / ${rows}`,
                            }}
                        >
                            {Array.from({length: rows * cols}).map((_, idx) => (
                                <div key={idx} className={showGrid ? "border border-rule bg-bg" : "bg-bg"} />
                            ))}

                            <svg
                                className="absolute inset-0 pointer-events-none"
                                viewBox={`0 0 ${cols * 100} ${rows * 100}`}
                            >
                                {showPath && (
                                    <polyline
                                        fill="none" stroke="#333" strokeWidth="4"
                                        points={[...displayCycle, displayCycle[0]].map(ptInt).join(" ")}
                                    />
                                )}

                                {highlightPath && !won && route.length > 1 && (
                                    <polyline
                                        fill="none" stroke="#facc15" strokeWidth="8" strokeOpacity="0.5"
                                        strokeLinecap="round" strokeLinejoin="round"
                                        points={route.map(ptInt).join(" ")}
                                    />
                                )}

                                {showApproach && !won && route.length - routeStart > 1 && (
                                    <>
                                        <polyline
                                            fill="none" stroke="#fb923c" strokeWidth="8"
                                            strokeLinecap="round" strokeLinejoin="round"
                                            points={route.slice(routeStart).map(ptInt).join(" ")}
                                        />
                                        <circle
                                            cx={intC(route[routeStart], cols) * 100 + 50}
                                            cy={intR(route[routeStart], cols) * 100 + 50}
                                            r="20" fill="#fb923c"
                                        />
                                    </>
                                )}

                                {showSnake && (
                                    <polyline
                                        fill="none" stroke="#22c55e" strokeWidth="60"
                                        strokeLinecap="round" strokeLinejoin="round"
                                        points={snake.map(ptInt).join(" ")}
                                    />
                                )}

                                {!won && (
                                    <circle
                                        cx={intC(apple, cols) * 100 + 50}
                                        cy={intR(apple, cols) * 100 + 50}
                                        r="26" fill="#dc2626"
                                    />
                                )}

                                {showSnake && snake.length > 0 && (
                                    <circle
                                        cx={intC(snake[0], cols) * 100 + 50}
                                        cy={intR(snake[0], cols) * 100 + 50}
                                        r="34" fill="#16a34a"
                                    />
                                )}

                                {showSnake && snake.length > 1 && (
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
                        <div className="font-mono text-[11px] tracking-kicker uppercase text-fg-soft text-center mt-4">
                            {rows} × {cols} board · {cellCount} cells
                        </div>
                    </div>
                </div>
            </div>

            {/* Info / Documentation */}
            <div className="max-w-275 mx-auto px-8 py-10 text-fg space-y-6 border-t border-rule mt-6">
                <section>
                    <h2 className="text-[22px] font-semibold tracking-tight-2 mb-2">How it works</h2>
                    <p className="leading-relaxed text-fg-muted">
                        The snake always follows a <strong>Hamiltonian cycle</strong>, which is a
                        loop that passes through every square on the board exactly once. As long
                        as the snake never leaves that loop it can always reach its own tail, so it can
                        never trap itself: the game is impossible to lose.
                    </p>
                    <p className="leading-relaxed text-fg-muted mt-3">
                        A fixed loop is safe but slow, the snake would crawl through the whole
                        board to reach each apple. So a background thread keeps a <em>bank</em> of
                        many different loops, and each time an apple appears it looks for the
                        fastest way to hop onto a loop that reaches the apple sooner — planning the
                        whole route so that the moment it eats, the body is lined up along a real
                        loop again. Because it&rsquo;s not eating on the way there, the tail is
                        always sliding forward, and the planner routes right through the space the
                        tail is about to clear.
                    </p>
                    <p className="leading-relaxed text-fg-muted mt-3">
                        Every candidate route is checked by simulating it move-by-move before the
                        snake commits, and if none beats the loop it&rsquo;s already on, it simply
                        keeps following that — so it is never in danger, and it moves whether or not
                        the planner has found anything new.
                    </p>
                </section>

                <section>
                    <h2 className="text-[22px] font-semibold tracking-tight-2 mb-2">Controls</h2>
                    <ul className="list-disc list-inside space-y-1 text-fg-muted">
                        <li><strong>Run / Pause</strong> &mdash; start or halt the simulation</li>
                        <li><strong>Step</strong> &mdash; advance by a single move</li>
                        <li><strong>Reset</strong> &mdash; resets the game</li>
                        <li><strong>Speed</strong> &mdash; how many moves per second to play</li>
                        <li><strong>Snake</strong> &mdash; show or hide the snake itself (handy for seeing the loops underneath)</li>
                        <li><strong>Hamiltonian Path</strong> &mdash; show the full loop the snake is on</li>
                        <li><strong>Head &rarr; Apple</strong> &mdash; highlight the route to the next apple</li>
                        <li><strong>Loop approach</strong> &mdash; the part of that route which rides a Hamiltonian loop into the apple, with a dot where it joins the loop</li>
                        <li><strong>Rows / Cols</strong> &mdash; change the board size <em>(resets the game)</em></li>
                    </ul>
                </section>
            </div>
        </div>
    );
}


function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft mb-1">{label}</div>
            <div className="font-mono text-[21px] font-medium leading-none text-fg tabular-nums tracking-[-0.01em]">{value}</div>
        </div>
    );
}

function LayerToggle({ on, color, label, onClick }: { on?: boolean; color: string; label: string; onClick?: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={!onClick}
            className="flex items-center gap-2.5 px-2 py-1.75 rounded-md text-left transition-colors hover:bg-accent-soft disabled:cursor-default disabled:hover:bg-transparent"
        >
            <span
                className="grid place-items-center w-3.75 h-3.75 rounded-sm border-[1.5px] shrink-0"
                style={{ borderColor: on ? "var(--accent)" : "var(--rule-strong)", background: on ? "var(--accent)" : "transparent" }}
            >
                {on && (
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="var(--bg)" strokeWidth="2"><path d="M2 5l2 2 4-4" /></svg>
                )}
            </span>
            <span className="w-2.25 h-2.25 rounded-xs shrink-0" style={{ background: color, opacity: on ? 1 : 0.35 }} />
            <span className="text-[12.5px]" style={{ color: on ? "var(--fg)" : "var(--fg-soft)" }}>{label}</span>
        </button>
    );
}

export default function SnakePageRoute() {
    return <SnakePage />;
}
