'use client';

import React, { useMemo, useState } from 'react';
import type {DemoModule} from "@/app/misc/random/registry";

type Trajectory = {
    start: number;
    seq: number[];
    loop?: number[]; // cycle if found
    truncated: boolean;
    invalid: boolean;
};

// 1) Validator (from earlier reply, included for completeness)
function validateExpr(expr: string): string | null {
    const ok = /^(\s*(?:n|Math\.[a-zA-Z]+|\d+(?:\.\d+)?|[\+\-\*\/%&\|\^<>\(\),]+)\s*)+$/u.test(expr);
    if (!ok) return 'Expression contains disallowed characters.';
    if (/\.\./.test(expr) || /(constructor|Function|=>|new\s)/.test(expr)) return 'Unsafe token.';
    return null;
}



function buildFn(expr: string): ((n: number) => number) | string {
    const err = validateExpr(expr);
    if (err) return err;
    try {
        // eslint-disable-next-line no-new-func
        const f = new Function('n', 'Math', `return (${expr});`) as (n: number, m: Math) => number;
        // quick sanity
        const test = f(4, Math);
        if (!Number.isFinite(test)) return 'Expression does not return a finite number.';
        return (n: number) => f(n, Math);
    } catch (e) {
        return 'Failed to parse expression.';
    }
}

// 2) Correct cycle extraction (exclude the closing repeat)
function simulate(
    start: number,
    fEven: (n: number) => number,
    fOdd: (n: number) => number,
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

        if (seen.has(next)) {
            const from = seen.get(next)!;
            // exclude the just-pushed repeat at the tail
            const loop = seq.slice(from, seq.length - 1);
            return { start, seq, loop, truncated: false, invalid };
        }

        n = next;
    }
    return { start, seq, truncated: seq.length - 1 >= maxSteps, invalid };
}



// 3) Robust numeric canonicalization (rotation-min, numeric compare)
function canonicalCycleNumeric(cycle: number[]): number[] {
    const k = cycle.length;
    if (k <= 1) return cycle.slice();
    let best = cycle.slice();
    for (let i = 1; i < k; i++) {
        const rot = cycle.slice(i).concat(cycle.slice(0, i));
        // numeric lexicographic compare
        for (let j = 0; j < k; j++) {
            if (rot[j] < best[j]) { best = rot; break; }
            if (rot[j] > best[j]) { break; }
        }
    }
    return best;
}
function canonicalKey(cycle: number[]): string {
    return canonicalCycleNumeric(cycle).join(',');
}



function CollatzPage() {
    const [rangeStart, setRangeStart] = useState(2);
    const [rangeEnd, setRangeEnd] = useState(200);
    const [maxSteps, setMaxSteps] = useState(2000);
    const [sampleCount, setSampleCount] = useState(25);
    const [logY, setLogY] = useState(true);

    const [evenExpr, setEvenExpr] = useState('n/2');       // default Collatz even
    const [oddExpr, setOddExpr] = useState('3*n+1');       // default Collatz odd

    const [runKey, setRunKey] = useState(0);

    const builtFns = useMemo(() => {
        const e = buildFn(evenExpr);
        const o = buildFn(oddExpr);
        return { e, o };
    }, [evenExpr, oddExpr]);

    // 4) Loop collection (dedupe by canonical key)
    const results = useMemo(() => {
        if (typeof builtFns.e === 'string' || typeof builtFns.o === 'string')
            return { trajs: [] as Trajectory[], loops: [] as number[][] };

        const trajs: Trajectory[] = [];
        const loopSet = new Map<string, number[]>();

        const a = Math.max(1, rangeStart);
        const b = Math.max(rangeStart, rangeEnd);

        for (let n = a; n <= b; n++) {
            const tr = simulate(n, builtFns.e as any, builtFns.o as any, maxSteps);
            trajs.push(tr);
            if (tr.loop && tr.loop.length > 0) {
                const can = canonicalCycleNumeric(tr.loop);
                const key = can.join(',');
                if (!loopSet.has(key)) loopSet.set(key, can);
            }
        }

        return {
            trajs,
            loops: Array.from(loopSet.values()).sort(
                (x, y) => x.length - y.length || x[0] - y[0]
            ),
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [runKey]);


    // choose sample trajectories spaced across range
    const samples = useMemo(() => {
        const { trajs } = results;
        if (trajs.length === 0) return [] as Trajectory[];
        const count = Math.min(sampleCount, trajs.length);
        if (count <= 0) return [];
        const step = (trajs.length - 1) / Math.max(1, count - 1);
        const picks: Trajectory[] = [];
        for (let i = 0; i < count; i++) {
            picks.push(trajs[Math.round(i * step)]);
        }
        return picks;
    }, [results, sampleCount]);

    // compute scales for SVG
    const { maxLen, maxVal } = useMemo(() => {
        let len = 0;
        let val = 0;
        for (const t of samples) {
            len = Math.max(len, t.seq.length);
            for (const x of t.seq) val = Math.max(val, x);
        }
        return { maxLen: Math.max(2, len), maxVal: Math.max(2, val) };
    }, [samples]);

    const width = 900;
    const height = 420;
    const pad = 40;

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
        <div className="p-6 space-y-6 font-sans mt-24">
            <h1 className="text-2xl font-bold">Hailstone Visualizer + Loop Finder</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex flex-col gap-1">
                    <span className="text-sm text-gray-600">Even n formula</span>
                    <input
                        className="border rounded px-3 py-2"
                        value={evenExpr}
                        onChange={(e) => setEvenExpr(e.target.value)}
                        placeholder="e.g., n/2"
                    />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-sm text-gray-600">Odd n formula</span>
                    <input
                        className="border rounded px-3 py-2"
                        value={oddExpr}
                        onChange={(e) => setOddExpr(e.target.value)}
                        placeholder="e.g., 3*n+1"
                    />
                </label>
                <div className="flex items-end gap-3">
                    <button
                        className="px-4 py-2 rounded bg-black text-white"
                        onClick={() => setRunKey((k) => k + 1)}
                    >
                        Run
                    </button>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={logY} onChange={(e) => setLogY(e.target.checked)} />
                        Log-scale Y
                    </label>
                </div>

                <label className="flex flex-col gap-1">
                    <span className="text-sm text-gray-600">Start n</span>
                    <input
                        type="number"
                        className="border rounded px-3 py-2"
                        value={rangeStart}
                        onChange={(e) => setRangeStart(parseInt(e.target.value || '1'))}
                        min={1}
                    />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-sm text-gray-600">End n</span>
                    <input
                        type="number"
                        className="border rounded px-3 py-2"
                        value={rangeEnd}
                        onChange={(e) => setRangeEnd(parseInt(e.target.value || '1'))}
                        min={1}
                    />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-sm text-gray-600">Max steps</span>
                    <input
                        type="number"
                        className="border rounded px-3 py-2"
                        value={maxSteps}
                        onChange={(e) => setMaxSteps(parseInt(e.target.value || '1'))}
                        min={10}
                    />
                </label>

                <label className="flex flex-col gap-1">
                    <span className="text-sm text-gray-600">Sample trajectories shown</span>
                    <input
                        type="number"
                        className="border rounded px-3 py-2"
                        value={sampleCount}
                        onChange={(e) => setSampleCount(parseInt(e.target.value || '1'))}
                        min={1}
                    />
                </label>
            </div>

            {errorMsg && (
                <div className="text-red-600 text-sm font-mono">Error: {errorMsg}</div>
            )}

            <div className="rounded border bg-white overflow-x-auto">
                <svg width={width} height={height}>
                    {/* axes */}
                    <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#888" />
                    <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#888" />
                    <text x={width / 2} y={height - 8} fontSize={12} textAnchor="middle" fill="#444">
                        Iteration
                    </text>
                    <text
                        x={12}
                        y={pad - 10}
                        fontSize={12}
                        textAnchor="start"
                        fill="#444"
                    >
                        {logY ? 'Value (log10)' : 'Value'}
                    </text>

                    {/* grid */}
                    {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
                        <g key={i}>
                            <line
                                x1={pad}
                                x2={width - pad}
                                y1={pad + t * (height - 2 * pad)}
                                y2={pad + t * (height - 2 * pad)}
                                stroke="#eee"
                            />
                        </g>
                    ))}

                    {/* trajectories */}
                    {samples.map((t, idx) => {
                        const path = t.seq
                            .map((v, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(v)}`)
                            .join(' ');
                        return <path key={idx} d={path} fill="none" stroke="hsl(210,30%,45%)" strokeWidth={1.2} opacity={0.9} />;
                    })}
                </svg>
            </div>

            <div className="space-y-2">
                <h2 className="text-xl font-semibold">Loops found in [{rangeStart}, {rangeEnd}]</h2>
                {results.loops.length === 0 ? (
                    <div className="text-sm text-gray-600">None detected (within max steps).</div>
                ) : (
                    <ul className="list-disc pl-6 space-y-1">
                        {results.loops.map((loop, i) => (
                            <li key={i} className="font-mono text-sm">
                                length {loop.length}: {loop.join(' → ')}
                            </li>
                        ))}
                    </ul>
                )}

                <div className="text-xs text-gray-500">
                    Notes: Only strictly positive integers are accepted at each step. Any non-integer or non-positive output marks a start as invalid and its sequence stops.
                </div>
            </div>
        </div>
    );
}

const Page: React.FC = () => <CollatzPage/>;
const preview = <div/>;

export const title = "Collatz Conjecture Visualizer";
export const description = "WORK IN PROGRESS. Explore different versions of the collatz conjecture.";

const mod: DemoModule = { title, description, preview, Page };
export default mod;
