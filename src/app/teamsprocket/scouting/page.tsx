"use client";

import Image from "next/image";
import {useEffect, useMemo, useRef, useState} from "react";

type BlobSpec = {
    id: number;
    size: number;         // px
    color: string;        // Tailwind bg-.../opacity class
    blur: string;         // Tailwind blur class
    // runtime
    x: number;            // px (center)
    y: number;            // px (center)
    vx: number;           // px/s
    vy: number;           // px/s
};

function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(false);
    useEffect(() => {
        const m = window.matchMedia("(prefers-reduced-motion: reduce)");
        const onChange = () => setReduced(m.matches);
        onChange();
        m.addEventListener?.("change", onChange);
        return () => m.removeEventListener?.("change", onChange);
    }, []);
    return reduced;
}

export default function ScoutingPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const blobsRef = useRef<BlobSpec[]>([]);
    const rafRef = useRef<number | null>(null);
    const lastTsRef = useRef<number | null>(null);
    const reducedMotion = usePrefersReducedMotion();

    // Define your blobs (sizes/colors/blur)
    const baseBlobs = useMemo(
        () => {
            return [
                {id: 1, size: 256, color: "bg-white/30", blur: "blur-3xl"},
                {id: 2, size: 224, color: "bg-white/20", blur: "blur-3xl"},
                {id: 3, size: 160, color: "bg-white/10", blur: "blur-3xl"},
                {id: 4, size: 192, color: "bg-purple-400/30", blur: "blur-3xl"},
                {id: 5, size: 383, color: "bg-purple-400/20", blur: "blur-3xl"},
            ];
        },
        []
    );

    // Initialize positions/velocities once we know container size
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const init = () => {
            const {width, height} = el.getBoundingClientRect();
            const rnd = (min: number, max: number) => Math.random() * (max - min) + min;

            blobsRef.current = baseBlobs.map((b) => {
                const r = b.size / 2;
                // random position staying fully inside
                const x = rnd(r, width - r);
                const y = rnd(r, height - r);
                // gentle random velocity; scale with container
                const speed = rnd(20, 60); // px/s
                const angle = rnd(0, Math.PI * 2);
                return {
                    ...b,
                    x, y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                };
            });
        };

        init();
        const onResize = () => init();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [baseBlobs]);

    // Physics loop
    useEffect(() => {
        if (reducedMotion) return; // do not animate

        const el = containerRef.current;
        if (!el) return;

        const restitution = 0.98; // slight damping on wall hits
        const maxDt = 0.033; // cap step (33ms)

        const tick = (ts: number) => {
            const {width, height} = el.getBoundingClientRect();
            const blobs = blobsRef.current;

            // dt in seconds
            const last = lastTsRef.current ?? ts;
            let dt = (ts - last) / 1000;
            lastTsRef.current = ts;
            if (dt <= 0) dt = 0.016;
            if (dt > maxDt) dt = maxDt;

            // Integrate positions
            for (const b of blobs) {
                b.x += b.vx * dt;
                b.y += b.vy * dt;

                const r = b.size / 2;

                // Wall collisions (elastic-ish)
                if (b.x - r < 0) {
                    b.x = r;
                    b.vx = Math.abs(b.vx) * restitution;
                } else if (b.x + r > width) {
                    b.x = width - r;
                    b.vx = -Math.abs(b.vx) * restitution;
                }

                if (b.y - r < 0) {
                    b.y = r;
                    b.vy = Math.abs(b.vy) * restitution;
                } else if (b.y + r > height) {
                    b.y = height - r;
                    b.vy = -Math.abs(b.vy) * restitution;
                }
            }

            // Pairwise collisions (simple elastic for equal mass circles)
            for (let i = 0; i < blobs.length; i++) {
                for (let j = i + 1; j < blobs.length; j++) {
                    const a = blobs[i], b = blobs[j];
                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    const dist = Math.hypot(dx, dy);
                    const minDist = (a.size + b.size) / 2;

                    if (dist > 0 && dist < minDist) {
                        // Push them apart to resolve overlap
                        const overlap = (minDist - dist);
                        const nx = dx / dist;
                        const ny = dy / dist;
                        const push = overlap / 2;
                        a.x -= nx * push;
                        a.y -= ny * push;
                        b.x += nx * push;
                        b.y += ny * push;

                        // Relative velocity along normal
                        const rvx = b.vx - a.vx;
                        const rvy = b.vy - a.vy;
                        const vn = rvx * nx + rvy * ny;
                        if (vn < 0) {
                            // Elastic impulse for equal masses
                            const impulse = -(1.0) * vn;
                            const ix = impulse * nx;
                            const iy = impulse * ny;
                            a.vx -= ix;
                            a.vy -= iy;
                            b.vx += ix;
                            b.vy += iy;
                        }
                    }
                }
            }

            // Apply DOM transforms
            for (const b of blobs) {
                const node = document.getElementById(`blob-${b.id}`);
                if (node) {
                    const r = b.size / 2;
                    node.style.transform = `translate(${b.x - r}px, ${b.y - r}px)`;
                }
            }

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
            lastTsRef.current = null;
        };
    }, [reducedMotion]);

    return (
        <main className="flex flex-col">

            {/* Hero */}
            <section ref={containerRef}
                     className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black h-screen">
                {useMemo(
                    () =>
                        baseBlobs.map((b) => (
                            <div
                                key={b.id}
                                id={`blob-${b.id}`}
                                className={`absolute rounded-full ${b.blur} ${b.color} pointer-events-none [will-change:transform]`}
                                style={{
                                    width: b.size,
                                    height: b.size,
                                    transform: "translate(-9999px,-9999px)", // moved on first tick
                                }}
                            />
                        )),
                    [baseBlobs]
                )}

                <div className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-48">
                    <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">FRC Scouting App</h1>
                            <p className="mt-4 text-lg text-white/80 max-w-prose">
                                Real‑time match collection. Offline‑first reliability. Instant analytics that actually
                                drive pick lists.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                            </div>

                            {/* Quick facts */}
                            <dl className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
                                {[
                                    {k: "Teams", v: "80+"},
                                    {k: "Matches Logged", v: "1,500+"},
                                    {k: "Offline Sessions", v: "500+"},
                                    {k: "Median Sync", v: "<2s"},
                                ].map(({k, v}) => (
                                    <div key={k} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <dt className="text-xs uppercase tracking-wide text-white/60">{k}</dt>
                                        <dd className="text-2xl font-semibold">{v}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                        <div className="relative">
                            <div
                                className="aspect-[16/10] rounded-2xl border border-white/10 bg-zinc-950 overflow-hidden shadow-2xl flex items-center justify-center">
                                <span className="text-white/60 text-sm">Placeholder for demo preview</span>
                            </div>
                            <div className="mt-4 grid grid-cols-3 gap-3">
                                {[
                                    {label: "Match input"},
                                    {label: "Analytics"},
                                    {label: "Offline cache"},
                                ].map((s) => (
                                    <div key={s.label}
                                         className="aspect-[4/3] rounded-xl border border-white/10 bg-zinc-950 overflow-hidden flex items-center justify-center">
                                        <span className="text-white/50 text-xs">{s.label} placeholder</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Overview */}
            <section className="relative h-[100vh] flex items-center">
                <Image
                    src="/placeholders/texture-dark.png"
                    alt="Background"
                    fill
                    sizes="100vw"
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/0 to-black/0"
                     aria-hidden="true"/>
                <div className="absolute inset-0 bg-black/45" aria-hidden="true"/>
                <div className="relative z-10 mx-auto max-w-5xl px-6">
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-8 backdrop-blur">
                        <h2 className="text-3xl font-bold mb-4">Overview</h2>
                        <div className="space-y-3 text-white/85">
                            <p>Offline‑first PWA for field data collection. Deterministic sync. On‑device analytics for
                                pick lists and drive‑team briefs.</p>
                            <p>Stack: React + TypeScript + Tailwind, FastAPI, SQLite/Postgres, WebSocket + HTTP,
                                IndexedDB (Dexie).</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Demo: Match Input */}
            <section id="demo-input" className="mx-auto max-w-6xl px-6 py-24 grid md:grid-cols-2 gap-10 items-center">
                <figure className="relative aspect-[10/16] overflow-hidden rounded-2xl border border-white/10">
                    <PlaceholderFrame label="Match Input (Tap‑Zone UI)"/>
                </figure>
                <div>
                    <h2 className="text-3xl font-bold mb-4">Match input</h2>
                    <p className="text-white/85">
                        ± tap‑zones for atomic ops per metric (Auto/Teleop/End). Writes to local op‑queue (IndexedDB).
                        Optimistic UI. Batch push on sync.
                    </p>
                    <ul className="mt-4 list-disc ml-5 text-white/75 space-y-1">
                        <li>Own demo sim: IndexedDB + mock HTTP batch endpoint.</li>
                        <li>Idempotent keys: (event, match, team, phase, metric).</li>
                        <li>Accessibility: large hit targets; no-scroll, full-screen.</li>
                    </ul>
                </div>
            </section>

            {/* Demo: Analytics */}
            <section id="demo-analytics"
                     className="mx-auto max-w-6xl px-6 py-24 grid md:grid-cols-2 gap-10 items-center">
                <div>
                    <h2 className="text-3xl font-bold mb-4">Team analytics</h2>
                    <p className="text-white/85">
                        Using various algorithms to analyze data, give strategy suggestions, and alliance simulation.
                    </p>
                    <ul className="mt-4 list-disc ml-5 text-white/75 space-y-1">
                        <li>AI: Using KMeans and random forest regressor to classify and predict match outcome.</li>
                        <li>Heuristic: Using Theil-Sen estimator and score calculators to predict match scores.</li>
                        <li>Elo: Using Bayesian inference and featured Elo to classify and rank robot.</li>
                    </ul>
                </div>
                <figure className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10">
                    <PlaceholderFrame label="Team Analytics (Charts + Table)"/>
                </figure>
            </section>

            {/* Demo: Sync Visualizer */}
            <section id="demo-sync" className="mx-auto max-w-6xl px-6 py-24 grid md:grid-cols-2 gap-10 items-center">
                <figure className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10">
                    <PlaceholderFrame label="Sync Visualizer (Queue → Batch → Transport → Upsert → Delta)"/>
                </figure>
                <div>
                    <h2 className="text-3xl font-bold mb-4">Sync architecture</h2>
                    <p className="text-white/85">
                        Uses HTTPS polling for live sync, DexieDB(IndexedDB) for offline scouting.
                    </p>
                    <ul className="mt-4 list-disc ml-5 text-white/75 space-y-1">
                        <li>HTTPS Polling: more stable than websocket at worse internet.</li>
                        <li>live update: scouting data is uploaded live so admins get real time scouting data and basic analytics. </li>
                        <li>DexieDB & PWA: allows scouting with no internet, and data syncs on reconnect.</li>
                    </ul>
                </div>
            </section>

            {/* Architecture text block */}
            <section id="architecture" className="px-6 py-24 bg-white/5 border-y border-white/10">
                <div className="mx-auto max-w-6xl">
                    <h2 className="text-3xl font-bold mb-4">Architecture</h2>
                    <p className="text-white/80 max-w-2xl mb-8">
                        Client: React/TS, Tailwind, PWA. Storage: IndexedDB (Dexie). Transport: HTTP + WebSocket.
                        Server: FastAPI, SQLite (dev) / Postgres (prod), Alembic migrations.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8">
                        <TextTile title="Storage">
                            Client op‑queue + cache in IndexedDB; server tables keyed on (event, match, team, phase,
                            metric) for idempotence.
                        </TextTile>
                        <TextTile title="Sync">
                            Batch push with ULIDs; delta feed by cursor; retry with exponential backoff and jitter; live
                            updates via WS.
                        </TextTile>
                        <TextTile title="Auth">
                            JWT session cookies; role‑based access; kiosk API keys; edge allowlist + rate limiting.
                        </TextTile>
                    </div>
                </div>
            </section>

            {/* Data model & API */}
            <section id="model-api" className="mx-auto max-w-6xl px-6 py-24">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-3">Data model</h2>
                    <p className="text-white/85">Minimal event‑sourced ops schema. Derived metrics computed server‑side;
                        clients render aggregated series.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <CodeBlock title="TypeScript (client)">{`export type Phase = "pre" | "auto" | "teleop" | "end";
export interface MatchEvent {
  id: string;            // ulid
  eventKey: string;      // e.g. 2025marea
  matchKey: string;      // qm12, qf2m1, etc.
  team: number;          // 0000–9999
  phase: Phase;
  metric: string;        // e.g. coral.L3, algae.removed
  delta: number;         // +1/-1 atomic op
  ts: number;            // ms epoch
}`}</CodeBlock>
                    <CodeBlock title="SQL (server)">{`CREATE TABLE ops
                                                      (
                                                          ulid      TEXT PRIMARY KEY,
                                                          event_key TEXT    NOT NULL,
                                                          match_key TEXT    NOT NULL,
                                                          team      INTEGER NOT NULL,
                                                          phase     TEXT    NOT NULL,
                                                          metric    TEXT    NOT NULL,
                                                          delta     INTEGER NOT NULL,
                                                          ts        BIGINT  NOT NULL
                                                      );
                    CREATE INDEX ops_event_cursor ON ops (event_key, ts);`}</CodeBlock>
                </div>

                <div className="mt-12">
                    <h3 className="text-2xl font-semibold mb-4">API</h3>
                    <div className="overflow-x-auto rounded-2xl border border-white/10">
                        <table className="w-full text-sm">
                            <thead className="bg-white/5">
                            <tr>
                                <th className="text-left p-3">Method</th>
                                <th className="text-left p-3">Path</th>
                                <th className="text-left p-3">Description</th>
                            </tr>
                            </thead>
                            <tbody>
                            {[
                                ["POST", "/ops/batch", "Push queued ops (idempotent)"],
                                ["GET", "/ops/delta?since=ULID", "Stream new ops since cursor"],
                                ["GET", "/teams/:team/summary", "Computed metrics per team"],
                                ["GET", "/event/:key/export.csv", "CSV export (offline review)"],
                            ].map((r) => (
                                <tr key={r.join("-")} className="border-t border-white/10">
                                    <td className="p-3">{r[0]}</td>
                                    <td className="p-3 font-mono">{r[1]}</td>
                                    <td className="p-3 text-white/80">{r[2]}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section id="links" className="mx-auto max-w-6xl px-6 py-24">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-3">Try it / Read more</h2>
                        <p className="text-white/80">Open the live app, scan the docs, or fork the repo. Placeholders
                            become live components as demos are implemented.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <a href="/scouting"
                           className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white border border-white/20 bg-white/5 hover:bg-white/10">Open
                            App</a>
                        <a href="/docs/scouting"
                           className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white border border-white/20 bg-white/5 hover:bg-white/10">Docs</a>
                        <a href="https://github.com/markwu123454" target="_blank" rel="noopener noreferrer"
                           className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white border border-white/20 bg-black/40 hover:bg-black/60">Source</a>
                    </div>
                </div>
            </section>

        </main>
    );
}

/* ---------- minimal helpers ---------- */

function PlaceholderFrame({label}: { label: string }) {
    return (
        <div className="absolute inset-0 p-6">
            <div
                className="h-full w-full rounded-2xl border-2 border-dashed border-white/20 bg-white/[0.03] flex items-center justify-center text-center">
        <span className="text-white/70 text-sm">{label}

            This frame is intentionally empty. The demo mounts its own simulation (DB, HTTP, WS) when implemented.</span>
            </div>
        </div>
    );
}

function TextTile({title, children}: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-white/80 text-sm">{children}</p>
        </div>
    );
}

function CodeBlock({title, children}: { title: string; children: string }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <div className="text-sm text-white/70 mb-2">{title}</div>
            <pre className="overflow-x-auto text-xs leading-relaxed"><code>{children}</code></pre>
        </div>
    );
}
