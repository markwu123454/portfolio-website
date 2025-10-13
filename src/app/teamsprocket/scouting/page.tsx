"use client";

import { useEffect, useState } from "react";
import AdminDashboardMock from "@/app/teamsprocket/scouting/adminMonitorMock";

// ---------- Types ----------
type Summary = {
    matches?: number;
    events?: number;
    teams?: number;
    median_sync?: number;
};

// ---------- Page ----------
export default function ScoutingPortfolioPage() {
    const [summary, setSummary] = useState<Summary | null>(null);

    useEffect(() => {
        fetch("/api/summary")
            .then((r) => r.json())
            .then(setSummary)
            .catch(() =>
                setSummary({ matches: 21, events: 2, teams: 9000, median_sync: 0.098 })
            );
    }, []);

    return (
        <main className="flex flex-col text-white bg-black">
            {/* ---------- HERO ---------- */}
            <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black h-screen">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/60" />
                <div className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-48">
                    <h1 className="text-5xl font-bold tracking-tight mb-4">
                        FRC Scouting Platform
                    </h1>
                    <p className="text-lg text-white/80 max-w-prose">
                        Distributed, <strong>online-first</strong> match and pit scouting
                        ecosystem with deterministic sync, admin control, and integrated
                        real-time analytics.
                    </p>

                    {/* --- Live Summary Cards --- */}
                    <dl className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
                        {[
                            { k: "Matches Logged", v: summary?.matches?.toLocaleString() },
                            { k: "Events", v: summary?.events },
                            { k: "Teams", v: summary?.teams },
                            { k: "Median Sync", v: summary?.median_sync + " s" },
                        ].map(({ k, v }) => (
                            <div
                                key={k}
                                className="rounded-2xl border border-white/10 bg-white/5 p-4"
                            >
                                <dt className="text-xs uppercase tracking-wide text-white/60">
                                    {k}
                                </dt>
                                <dd className="text-2xl font-semibold">{v ?? "—"}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* ---------- SYSTEM OVERVIEW ---------- */}
            <section className="px-6 py-24 bg-white/5 border-y border-white/10">
                <div className="mx-auto max-w-6xl">
                    <h2 className="text-3xl font-bold mb-4">System Overview</h2>
                    <p className="text-white/85 max-w-3xl mb-8">
                        Built for multi-client real-time synchronization, deterministic
                        database updates, and reliable analytics under network constraints.
                        Architecture emphasizes idempotent operations, typed data flow, and
                        online-first reliability.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8">
                        <TextTile title="Frontend">
                            React + TypeScript progressive web app with Dexie-based local
                            queue. Optimistic updates, atomic phase transitions, and full
                            offline operation.
                        </TextTile>
                        <TextTile title="Backend">
                            FastAPI + asyncpg backend with scikit learn and manually implemented algorithms.
                        </TextTile>
                        <TextTile title="Database">
                            PostgreSQL schema.
                        </TextTile>
                    </div>
                </div>
            </section>

            {/* ---------- ANALYTICS ---------- */}
            <section className="mx-auto max-w-6xl px-6 py-24 grid md:grid-cols-2 gap-10 items-center">
                <div>
                    <h2 className="text-3xl font-bold mb-4">Data Analytics</h2>
                    <p className="text-white/85 mb-6">
                        Integrated algorithms compute team performance trends and alliance
                        predictions.
                    </p>
                    <ul className="list-disc ml-5 space-y-2 text-white/75">
                        <li>
                            <strong>Bayesian Elo</strong>: adaptive rating using probabilistic
                            outcome inference.
                        </li>
                        <li>
                            <strong>Theil–Sen Estimator + Heuristics Scoring Algorithm</strong>: robust regression on
                            historical performance vectors.
                        </li>
                        <li>
                            <strong>Ranking K-Means Clustering</strong>: group and rank teams by offensive,
                            balanced, and support roles.
                        </li>
                        <li>
                            <strong>Random Forest Regressor</strong>: predicts alliance score
                            variance using composite features.
                        </li>
                    </ul>
                </div>

                <figure className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 flex items-center justify-center">
                    <div className="text-center text-sm text-white/70 p-4">
                        <p className="mb-2">Analytics Example:</p>
                        <pre className="text-xs bg-black/30 p-3 rounded-lg text-left">{`[
  {team: 1234, cycle_time: 6.4, barge: 1.21, cluster: "Coral cycle"},
  {team: 4920, cycle_time: 9.8, barge: 5.49, cluster: "Algae"}
]`}</pre>
                        <p className="mt-2 text-white/60">
                            TODO: add example data page
                        </p>
                    </div>
                </figure>
            </section>

            {/* ---------- ADMIN CONTROL ---------- */}
            <section className="mx-auto max-w-6xl px-6 py-24 grid md:grid-cols-2 gap-10 items-center">
                <figure className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 flex items-center justify-center">
                    <AdminDashboardMock />
                </figure>

                <div>
                    <h2 className="text-3xl font-bold mb-4">Admin Control</h2>
                    <ul className="list-disc ml-5 text-white/75 space-y-2">
                        <li>Role-based access and passcode hashing.</li>
                        <li>Live session tracking through https even in high latency environments.</li>
                        <li>Event-wide analytics refresh.</li>
                    </ul>
                </div>
            </section>

            {/* ---------- TAKEAWAYS ---------- */}
            <section className="px-6 py-24 bg-white/5 border-t border-white/10">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold mb-6">Engineering Highlights</h2>
                    <ul className="grid md:grid-cols-2 gap-4 text-white/85 list-disc ml-5">
                        <li>Asynchronous Python backend with FastAPI + asyncpg.</li>
                        <li>Typed React/TypeScript frontend with IndexedDB queueing.</li>
                        <li>Deterministic sync and conflict-free replication.</li>
                        <li>Offline-tolerant PWA using service workers.</li>
                        <li>Dynamic analytics with statistical + ML components.</li>
                        <li>Secure admin and role isolation model.</li>
                    </ul>

                    <p className="text-white/60 mt-10 text-sm">
                        *All analytics and visualizations on this page use anonymized or
                        synthetic data for privacy. No team-specific or strategy data is
                        included.*
                    </p>
                </div>
            </section>

            {/* ---------- LINKS ---------- */}
            <section className="mx-auto max-w-6xl px-6 py-24 text-center">
                <h2 className="text-3xl font-bold mb-3">Explore Further</h2>
                <p className="text-white/80 mb-6">
                    Try out the app(sorry, the team didn&#39;t let me share sources).
                </p>
                <div className="flex justify-center flex-wrap gap-3">
                    <a
                        href="https://sprocket-scouting-demo.vercel.app/"
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white border border-white/20 bg-white/5 hover:bg-white/10"
                    >
                        Open App
                    </a>
                </div>
            </section>
        </main>
    );
}

// ---------- Small UI helpers ----------
function TextTile({
                      title,
                      children,
                  }: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-white/80 text-sm">{children}</p>
        </div>
    );
}
