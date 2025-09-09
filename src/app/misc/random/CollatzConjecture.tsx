'use client';

import React, { useMemo, useState } from 'react';
import type { DemoModule } from '@/app/misc/random/registry';

type NumFn = (n: number) => number;

type Trajectory = {
    start: number;
    seq: number[];
    loop?: number[];
    truncated: boolean;
    invalid: boolean;
};

// ---------- Validation & Builder ----------
function validateExpr(expr: string): string | null {
    const ok = /^(\s*(?:n|Math\.[a-zA-Z]+|\d+(?:\.\d+)?|[\+\-\*\/%&\|\^<>\(\),]+)\s*)+$/u.test(expr);
    if (!ok) return 'Expression contains disallowed characters.';
    if (/\.\./.test(expr) || /(constructor|Function|=>|new\s)/.test(expr)) return 'Unsafe token.';
    return null;
}

function buildFn(expr: string): NumFn | string {
    const err = validateExpr(expr);
    if (err) return err;
    try {
        // eslint-disable-next-line no-new-func
        const f = new Function('n', 'Math', `return (${expr});`) as (n: number, m: Math) => number;
        const test = f(4, Math);
        if (!Number.isFinite(test)) return 'Expression does not return a finite number.';
        const wrapped: NumFn = (n: number) => f(n, Math);
        return wrapped;
    } catch {
        return 'Failed to parse expression.';
    }
}

// ---------- Simulation ----------
function simulate(
    start: number,
    fEven: NumFn,
    fOdd: NumFn,
    maxSteps: number
): Trajectory {
    const seen = new Map<number, number>();
    const seq: number[] = [start];
    let n = start;
    let invalid = false;

    for (let i = 0; i < maxSteps; i++) {
        seen.set(n, i);

        const nextRaw = (n % 2 === 0 ? fEven : fOdd)(n);
        const next = Number(nextRaw);
        if (!Number.isFinite(next) || !Number.isInteger(next) || next <= 0) {
            invalid = true;
            break;
        }

        seq.push(next);

        const prevIdx = seen.get(next);
        if (prevIdx !== undefined) {
            const loop = seq.slice(prevIdx, seq.length - 1);
            return { start, seq, loop, truncated: false, invalid };
        }

        n = next;
    }
    return { start, seq, truncated: seq.length - 1 >= maxSteps, invalid };
}

// ---------- Cycle canonicalization ----------
function canonicalCycleNumeric(cycle: number[]): number[] {
    const k = cycle.length;
    if (k <= 1) return cycle.slice();
    let best = cycle.slice();
    for (let i = 1; i < k; i++) {
        const rot = cycle.slice(i).concat(cycle.slice(0, i));
        for (let j = 0; j < k; j++) {
            if (rot[j]! < best[j]!) { best = rot; break; }
            if (rot[j]! > best[j]!) { break; }
        }
    }
    return best;
}

function CollatzPage() {
    const [rangeStart, setRangeStart] = useState(2);
    const [rangeEnd, setRangeEnd] = useState(200);
    const [maxSteps, setMaxSteps] = useState(2000);
    const [sampleCount, setSampleCount] = useState(25);
    const [logY, setLogY] = useState(true);

    const [evenExpr, setEvenExpr] = useState('n/2');
    const [oddExpr, setOddExpr] = useState('3*n+1');

    const [runKey, setRunKey] = useState(0);

    const builtFns = useMemo(() => {
        const e = buildFn(evenExpr);
        const o = buildFn(oddExpr);
        return { e, o };
    }, [evenExpr, oddExpr]);

    const results = useMemo(() => {
        if (typeof builtFns.e === 'string' || typeof builtFns.o === 'string') {
            return { trajs: [] as Trajectory[], loops: [] as number[][] };
        }

        const eFn: NumFn = builtFns.e;
        const oFn: NumFn = builtFns.o;

        const trajs: Trajectory[] = [];
        const loopSet = new Map<string, number[]>();

        const a = Math.max(1, rangeStart);
        const b = Math.max(rangeStart, rangeEnd);

        for (let n = a; n <= b; n++) {
            const tr = simulate(n, eFn, oFn, maxSteps);
            trajs.push(tr);
            if (tr.loop && tr.loop.length > 0) {
                const can = canonicalCycleNumeric(tr.loop);
                const key = can.join(',');
                if (!loopSet.has(key)) loopSet.set(key, can);
            }
        }

        const loops = Array.from(loopSet.values()).sort(
            (x, y) => x.length - y.length || x[0]! - y[0]!
        );

        return { trajs, loops };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [runKey]);

    const samples = useMemo(() => {
        const { trajs } = results;
        if (trajs.length === 0) return [] as Trajectory[];
        const count = Math.min(sampleCount, trajs.length);
        if (count <= 0) return [];
        const step = (trajs.length - 1) / Math.max(1, count - 1);
        const picks: Trajectory[] = [];
        for (let i = 0; i < count; i++) {
            picks.push(trajs[Math.round(i * step)]!);
        }
        return picks;
    }, [results, sampleCount]);

    const { maxLen, maxVal } = useMemo(() => {
        let len = 0;
        let val = 0;
        for (const t of samples) {
            len = Math.max(len, t.seq.length);
            for (const x of t.seq) val = Math.max(val, x);
        }
        return { maxLen: Math.max(2, len), maxVal: Math.max(2, val) };
    }, [samples]);

    // ---------- Layout ----------
    const width = 980;
    const height = 460;
    const pad = 48;

    function xScale(i: number) {
        return pad + (i / (maxLen - 1)) * (width - 2 * pad);
    }
    function yScale(v: number) {
        const yVal = logY ? Math.log10(v) : v;
        const yMax = logY ? Math.log10(maxVal) : maxVal;
        return height - pad - (yVal / yMax) * (height - 2 * pad);
    }

    const errorMsg =
        typeof builtFns.e === 'string'
            ? `Even fn error: ${builtFns.e}`
            : typeof builtFns.o === 'string'
                ? `Odd fn error: ${builtFns.o}`
                : null;

    return (
        <div className="mt-24 min-h-[100vh] bg-[radial-gradient(1200px_600px_at_70%_-10%,rgba(59,130,246,0.15),transparent),radial-gradient(1000px_500px_at_-10%_20%,rgba(168,85,247,0.1),transparent)] text-zinc-200">
            <div className="mx-auto max-w-6xl px-6 py-10">
                {/* Header */}
                <header className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Hailstone Visualizer + Loop Finder</h1>
                        <p className="text-sm text-zinc-400">Dark UI • Safe eval • Loop de-duplication</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="inline-flex select-none items-center gap-2 text-sm text-zinc-300">
                            <input
                                type="checkbox"
                                checked={logY}
                                onChange={(e) => setLogY(e.target.checked)}
                                className="h-4 w-4 rounded border-zinc-700 bg-zinc-900/50"
                            />
                            Log-scale Y
                        </label>
                        <button
                            className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-[0_0_30px_rgba(99,102,241,0.25)] hover:bg-indigo-400"
                            onClick={() => setRunKey((k) => k + 1)}
                        >
                            Run
                        </button>
                    </div>
                </header>

                {/* Controls */}
                <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 backdrop-blur">
                        <label className="mb-2 block text-xs uppercase tracking-wide text-zinc-400">Even n formula</label>
                        <input
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-sm outline-none ring-0 placeholder:text-zinc-500 focus:border-indigo-500"
                            value={evenExpr}
                            onChange={(e) => setEvenExpr(e.target.value)}
                            placeholder="e.g., n/2"
                        />
                        <div className="mt-3 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <label className="mt-3 mb-2 block text-xs uppercase tracking-wide text-zinc-400">Odd n formula</label>
                        <input
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-sm outline-none ring-0 placeholder:text-zinc-500 focus:border-indigo-500"
                            value={oddExpr}
                            onChange={(e) => setOddExpr(e.target.value)}
                            placeholder="e.g., 3*n+1"
                        />
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 backdrop-blur">
                        <label className="mb-2 block text-xs uppercase tracking-wide text-zinc-400">Start n</label>
                        <input
                            type="number"
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                            value={rangeStart}
                            onChange={(e) => setRangeStart(Number.parseInt(e.target.value || '1'))}
                            min={1}
                        />
                        <label className="mt-3 mb-2 block text-xs uppercase tracking-wide text-zinc-400">End n</label>
                        <input
                            type="number"
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                            value={rangeEnd}
                            onChange={(e) => setRangeEnd(Number.parseInt(e.target.value || '1'))}
                            min={1}
                        />
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 backdrop-blur">
                        <label className="mb-2 block text-xs uppercase tracking-wide text-zinc-400">Max steps</label>
                        <input
                            type="number"
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                            value={maxSteps}
                            onChange={(e) => setMaxSteps(Number.parseInt(e.target.value || '10'))}
                            min={10}
                        />
                        <label className="mt-3 mb-2 block text-xs uppercase tracking-wide text-zinc-400">Sample trajectories</label>
                        <input
                            type="number"
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                            value={sampleCount}
                            onChange={(e) => setSampleCount(Number.parseInt(e.target.value || '1'))}
                            min={1}
                        />
                    </div>
                </section>

                {errorMsg && (
                    <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-mono text-sm text-red-300">
                        Error: {errorMsg}
                    </div>
                )}

                {/* Chart Card */}
                <section className="mb-8 rounded-2xl border border-white/10 bg-zinc-900/60 shadow-[0_0_60px_rgba(59,130,246,0.08)] backdrop-blur">
                    <div className="border-b border-white/10 px-5 py-3 text-xs uppercase tracking-wide text-zinc-400">
                        Trajectories ({samples.length})
                    </div>
                    <div className="overflow-x-auto p-4">
                        <svg width={width} height={height} className="mx-auto block">
                            {/* Axes */}
                            <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#5b5b5b" />
                            <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#5b5b5b" />
                            <text x={width / 2} y={height - 12} fontSize={12} textAnchor="middle" fill="#a1a1aa">
                                Iteration
                            </text>
                            <text x={14} y={pad - 14} fontSize={12} textAnchor="start" fill="#a1a1aa">
                                {logY ? 'Value (log10)' : 'Value'}
                            </text>

                            {/* Grid */}
                            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                                <line
                                    key={t}
                                    x1={pad}
                                    x2={width - pad}
                                    y1={pad + t * (height - 2 * pad)}
                                    y2={pad + t * (height - 2 * pad)}
                                    stroke="#2b2b2b"
                                />
                            ))}

                            {/* Trajectories */}
                            {samples.map((t, idx) => {
                                const d = t.seq.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(v)}`).join(' ');
                                return (
                                    <path
                                        key={idx}
                                        d={d}
                                        fill="none"
                                        stroke="hsl(220, 70%, 65%)"
                                        strokeWidth={1.4}
                                        opacity={0.9}
                                    />
                                );
                            })}
                        </svg>
                    </div>
                </section>

                {/* Loops */}
                <section className="rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur">
                    <div className="border-b border-white/10 px-5 py-3">
                        <h2 className="text-lg font-medium text-zinc-100">
                            Loops found in [{rangeStart}, {rangeEnd}]
                        </h2>
                    </div>
                    <div className="px-5 py-4">
                        {results.loops.length === 0 ? (
                            <div className="text-sm text-zinc-400">None detected (within max steps).</div>
                        ) : (
                            <ul className="list-disc space-y-1 pl-6">
                                {results.loops.map((loop, i) => (
                                    <li key={`${loop.join('-')}-${i}`} className="font-mono text-sm text-zinc-300">
                                        length {loop.length}: {loop.join(' → ')}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <p className="mt-3 text-xs text-zinc-500">
                            Notes: Only strictly positive integers are accepted at each step. Any non-integer or non-positive output
                            marks a start as invalid and its sequence stops.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}

const Page: React.FC = () => <CollatzPage />;
const preview = <div />;

export const title = 'Collatz Conjecture Visualizer';
export const description = 'WORK IN PROGRESS. Explore different versions of the Collatz conjecture.';

const mod: DemoModule = { title, description, preview, Page };
export default mod;
