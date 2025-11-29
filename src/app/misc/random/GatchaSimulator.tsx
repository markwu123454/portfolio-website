"use client";

import React, { useMemo, useState } from "react";
import type { DemoModule } from "@/app/misc/random/registry";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    Legend,
} from "recharts";
import Image from "next/image";

/* ---------- Types & Constants ---------- */

type BannerType = "agent" | "weapon";
type Mode = "targetCopies" | "fixedPulls";

interface ProgressRow {
    pull: number;
    limited: number[];
    any: number[];
}

const HARD_PITY: Record<BannerType, number> = {
    agent: 90,
    weapon: 80,
};

const FEATURED_RATE: Record<BannerType, number> = {
    agent: 0.5,
    weapon: 0.75,
};

/* ---------- Rate Function ---------- */

function getSRate(type: BannerType, pullIndexSinceLastS: number): number {
    if (type === "agent") {
        if (pullIndexSinceLastS <= 73) return 0.006;
        if (pullIndexSinceLastS <= 89) {
            return Math.min(1, 0.006 + 0.06 * (pullIndexSinceLastS - 73));
        }
        return 1;
    } else {
        if (pullIndexSinceLastS <= 65) return 0.008;
        if (pullIndexSinceLastS <= 79) {
            return Math.min(1, 0.008 + 0.07 * (pullIndexSinceLastS - 65));
        }
        return 1;
    }
}

/* ---------- Distribution Core ---------- */

function computeDistribution(
    type: BannerType,
    startPullIndex: number,
    startOnGuarantee: boolean,
    maxCopies: number,
    mode: Mode,
    opts: { targetCopies: number; availablePulls: number; tolerance?: number; maxSimulatedPulls?: number }
): ProgressRow[] {
    const tolerance = opts.tolerance ?? 1e-8;
    const maxSimulatedPulls = opts.maxSimulatedPulls ?? 2000;
    const hard = HARD_PITY[type];
    const featuredRate = FEATURED_RATE[type];

    const targetCopies = Math.min(opts.targetCopies, maxCopies);
    const maxPulls = mode === "fixedPulls" ? opts.availablePulls : maxSimulatedPulls;

    type StateKey = string;

    const makeKey = (
        pullIndex: number,
        guarantee: boolean,
        limited: number,
        any: number,
    ): StateKey => `${pullIndex}|${guarantee ? 1 : 0}|${limited}|${any}`;

    const parseKey = (key: StateKey) => {
        const [pStr, gStr, lStr, aStr] = key.split("|");
        return {
            pullIndex: Number(pStr),
            guarantee: gStr === "1",
            limited: Number(lStr),
            any: Number(aStr),
        };
    };

    const clampCopies = (x: number) => (x > maxCopies ? maxCopies : x);

    let state = new Map<StateKey, number>();
    const initialPullIndex = Math.min(Math.max(startPullIndex, 1), hard);
    state.set(makeKey(initialPullIndex, startOnGuarantee, 0, 0), 1);

    const rows: ProgressRow[] = [];

    for (let totalPulls = 1; totalPulls <= maxPulls; totalPulls++) {
        const nextState = new Map<StateKey, number>();
        const cumLimited = new Array(maxCopies + 1).fill(0);
        const cumAny = new Array(maxCopies + 1).fill(0);

        for (const [key, mass] of state.entries()) {
            if (mass === 0) continue;
            const { pullIndex, guarantee, limited, any } = parseKey(key);

            const sRate = getSRate(type, pullIndex);
            const pS = mass * sRate;
            const pNoS = mass * (1 - sRate);

            if (pNoS > 0) {
                const nextPullIndex = pullIndex < hard ? pullIndex + 1 : hard;
                const k = makeKey(nextPullIndex, guarantee, limited, any);
                nextState.set(k, (nextState.get(k) ?? 0) + pNoS);
            }

            if (pS > 0) {
                const newAny = clampCopies(any + 1);
                if (guarantee) {
                    const newLimited = clampCopies(limited + 1);
                    const k = makeKey(1, false, newLimited, newAny);
                    nextState.set(k, (nextState.get(k) ?? 0) + pS);
                } else {
                    const pFeatured = pS * featuredRate;
                    const pOff = pS * (1 - featuredRate);

                    if (pFeatured > 0) {
                        const newLimited = clampCopies(limited + 1);
                        const kFeat = makeKey(1, false, newLimited, newAny);
                        nextState.set(kFeat, (nextState.get(kFeat) ?? 0) + pFeatured);
                    }

                    if (pOff > 0) {
                        const kOff = makeKey(1, true, limited, newAny);
                        nextState.set(kOff, (nextState.get(kOff) ?? 0) + pOff);
                    }
                }
            }
        }

        for (const [key, mass] of nextState.entries()) {
            if (mass === 0) continue;
            const { limited, any } = parseKey(key);
            for (let k = 1; k <= maxCopies; k++) {
                if (limited >= k) cumLimited[k] += mass;
                if (any >= k) cumAny[k] += mass;
            }
        }

        rows.push({ pull: totalPulls, limited: cumLimited, any: cumAny });
        state = nextState;

        if (mode === "targetCopies" && cumLimited[targetCopies] >= 1 - tolerance) break;
    }

    return rows;
}

/* ---------- Format ---------- */

function formatPercent(x: number): string {
    return (x * 100).toFixed(2) + "%";
}

/* ---------- UI ---------- */

function GatchaSimulator() {
    const [bannerType, setBannerType] = useState<BannerType>("agent");
    const [mode, setMode] = useState<Mode>("targetCopies");
    const [guaranteeIn, setGuaranteeIn] = useState<number>(HARD_PITY["agent"]);
    const [onGuarantee, setOnGuarantee] = useState(false);

    const [targetCopies, setTargetCopies] = useState(1);
    const [availablePulls, setAvailablePulls] = useState(90);
    const [maxCopiesDisplay, setMaxCopiesDisplay] = useState(3);

    const safeHard = HARD_PITY[bannerType];
    const safeGuaranteeIn = Math.min(Math.max(guaranteeIn, 1), safeHard);
    const startPullIndex = safeHard - safeGuaranteeIn + 1;

    const rows = useMemo(
        () =>
            computeDistribution(
                bannerType,
                startPullIndex,
                onGuarantee,
                maxCopiesDisplay,
                mode,
                {
                    targetCopies,
                    availablePulls,
                    tolerance: 1e-8,
                    maxSimulatedPulls: 2000,
                }
            ),
        [bannerType, startPullIndex, onGuarantee, maxCopiesDisplay, mode, targetCopies, availablePulls]
    );

    const chartData = useMemo(() => {
        return rows.map((row) => {
            const obj: any = { pull: row.pull };
            for (let k = 1; k <= maxCopiesDisplay; k++) {
                obj[`limited${k}`] = row.limited[k] ?? 0;
                obj[`any${k}`] = row.any[k] ?? 0;
            }
            return obj;
        });
    }, [rows, maxCopiesDisplay]);

    const lastRow = rows[rows.length - 1];
    const highlightedLimited = lastRow?.limited[targetCopies] ?? 0;
    const highlightedAny = lastRow?.any[targetCopies] ?? 0;

    return (
        <div className="w-screen min-h-[100dvh-24] bg-black text-gray-100 p-8 mt-24">
            <div className="mx-auto grid gap-6">

                {/* Controls */}
                <div className="rounded-2xl border border-gray-700 shadow-sm p-4 grid gap-4 bg-[#111]">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Banner type */}
                        <div className="grid gap-1">
                            <label className="text-xs font-medium uppercase tracking-wide text-gray-300">Banner type</label>
                            <select
                                value={bannerType}
                                onChange={(e) => setBannerType(e.target.value as BannerType)}
                                className="w-full h-10 border border-gray-700 rounded-2xl px-3 text-sm bg-black text-gray-100 focus:outline-none focus:ring-1 focus:ring-white"
                            >
                                <option value="agent">Agent (character)</option>
                                <option value="weapon">Weapon (75% limited)</option>
                            </select>
                        </div>

                        {/* Mode */}
                        <div className="grid gap-1">
                            <label className="text-xs font-medium uppercase tracking-wide text-gray-300">Mode</label>
                            <select
                                value={mode}
                                onChange={(e) => setMode(e.target.value as Mode)}
                                className="w-full h-10 border border-gray-700 rounded-2xl px-3 text-sm bg-black text-gray-100 focus:outline-none focus:ring-1 focus:ring-white"
                            >
                                <option value="targetCopies">Target copies (run to ~100%)</option>
                                <option value="fixedPulls">Fixed pulls window</option>
                            </select>
                        </div>

                        {/* Guarantee */}
                        <div className="grid gap-1">
                            <label className="text-xs font-medium uppercase tracking-wide text-gray-300 flex items-center justify-between">
                                <span>Pulls until guaranteed 5★</span>
                                <span className="text-[10px] text-gray-500">1–{safeHard}</span>
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={safeHard}
                                value={safeGuaranteeIn}
                                onChange={(e) => setGuaranteeIn(Number(e.target.value))}
                                className="w-full h-10 border border-gray-700 rounded-2xl px-3 text-sm bg-black text-gray-100 focus:outline-none focus:ring-1 focus:ring-white"
                            />
                        </div>

                        {/* On guarantee */}
                        <div className="grid gap-1">
                            <label className="text-xs font-medium uppercase tracking-wide text-gray-300">Next 5★ is guaranteed limited</label>
                            <div className="flex items-center h-10">
                                <input
                                    type="checkbox"
                                    checked={onGuarantee}
                                    onChange={() => setOnGuarantee((prev) => !prev)}
                                    className="h-4 w-4 border border-gray-600 rounded mr-2 bg-black"
                                />
                                <span className="text-xs text-gray-400">
                                    {onGuarantee
                                        ? "Yes (next 5★ will be the limited unit)"
                                        : bannerType === "agent"
                                            ? "No (50/50 limited vs standard)"
                                            : "No (75% limited, 25% standard)"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        {/* Copies */}
                        <div className="grid gap-1">
                            <label className="text-xs font-medium uppercase tracking-wide text-gray-300">Copies to highlight</label>
                            <select
                                value={String(targetCopies)}
                                onChange={(e) => setTargetCopies(Number(e.target.value))}
                                className="w-full h-10 border border-gray-700 rounded-2xl px-3 text-sm bg-black text-gray-100 focus:outline-none focus:ring-1 focus:ring-white"
                            >
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <option key={i} value={i}>{i}</option>
                                ))}
                            </select>
                        </div>

                        {/* Available pulls */}
                        <div className="grid gap-1">
                            <label className="text-xs font-medium uppercase tracking-wide text-gray-300 flex items-center justify-between">
                                <span>Available pulls</span>
                                <span className="text-[10px] text-gray-500">fixed-pulls only</span>
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={300}
                                value={availablePulls}
                                onChange={(e) => setAvailablePulls(Number(e.target.value))}
                                className="w-full h-10 border border-gray-700 rounded-2xl px-3 text-sm bg-black text-gray-100 focus:outline-none focus:ring-1 focus:ring-white"
                            />
                        </div>

                        {/* Max copies */}
                        <div className="grid gap-1">
                            <label className="text-xs font-medium uppercase tracking-wide text-gray-300">Max copies to graph</label>
                            <select
                                value={String(maxCopiesDisplay)}
                                onChange={(e) => setMaxCopiesDisplay(Number(e.target.value))}
                                className="w-full h-10 border border-gray-700 rounded-2xl px-3 text-sm bg-black text-gray-100 focus:outline-none focus:ring-1 focus:ring-white"
                            >
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <option key={i} value={i}>{i}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {lastRow && (
                        <div className="text-xs md:text-sm text-gray-300 mt-2">
                            {mode === "targetCopies" ? (
                                <>
                                    After <span className="font-semibold text-gray-100">{lastRow.pull}</span> pulls, chance of at least{" "}
                                    <span className="font-semibold text-gray-100">{targetCopies}</span> limited copy/copies:{" "}
                                    <span className="font-semibold text-gray-100">{formatPercent(highlightedLimited)}</span>.
                                    Chance of at least{" "}
                                    <span className="font-semibold text-gray-100">{targetCopies}</span> any 5★:{" "}
                                    <span className="font-semibold text-gray-100">{formatPercent(highlightedAny)}</span>.
                                </>
                            ) : (
                                <>
                                    Within <span className="font-semibold text-gray-100">{availablePulls}</span> pulls, chance of at least{" "}
                                    <span className="font-semibold text-gray-100">{targetCopies}</span> limited copy/copies:{" "}
                                    <span className="font-semibold text-gray-100">{formatPercent(highlightedLimited)}</span>.
                                    Chance of at least{" "}
                                    <span className="font-semibold text-gray-100">{targetCopies}</span> any 5★:{" "}
                                    <span className="font-semibold text-gray-100">{formatPercent(highlightedAny)}</span>.
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* ---------- Chart ---------- */}
                <div className="w-full h-96 border border-gray-700 rounded-2xl bg-[#111] p-4 shadow-sm">
                    <div className="text-sm font-medium mb-2 text-gray-200">
                        Probability over pulls (solid = limited, dashed = any 5★)
                    </div>

                    <ResponsiveContainer>
                        <LineChart data={chartData} margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="pull" tick={{ fill: "#ccc" }} tickMargin={8} axisLine={{ stroke: "#666" }} />
                            <YAxis
                                domain={[0, 1]}
                                tickFormatter={(v) => `${Math.round(v * 100)}%`}
                                tick={{ fill: "#ccc" }}
                                axisLine={{ stroke: "#666" }}
                            />
                            <Tooltip
                                contentStyle={{ background: "#222", border: "1px solid #444", color: "#eee" }}
                                formatter={(value: any) => `${(value as number * 100).toFixed(2)}%`}
                                labelFormatter={(label) => `Pulls: ${label}`}
                            />
                            <Legend wrapperStyle={{ color: "#ddd" }} />

                            {Array.from({ length: maxCopiesDisplay }, (_, i) => {
                                const k = i + 1;
                                return (
                                    <React.Fragment key={k}>
                                        <Line
                                            type="monotone"
                                            dataKey={`limited${k}`}
                                            strokeWidth={2}
                                            dot={false}
                                            stroke="#4ade80"
                                            name={`≥${k} limited`}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey={`any${k}`}
                                            strokeWidth={1.5}
                                            dot={false}
                                            strokeDasharray="4 4"
                                            stroke="#60a5fa"
                                            name={`≥${k} any 5★`}
                                        />
                                    </React.Fragment>
                                );
                            })}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

const Page: React.FC = () => <GatchaSimulator />;
const preview = <Image src="/zzz.png" height="300" width="300" alt="zzz logo"/>;

export const title = "Zenless Zone Zero gatcha calculator";
export const description = "Deterministically calculate pull outcomes.";

const mod: DemoModule = { title, description, preview, Page };
export default mod;
