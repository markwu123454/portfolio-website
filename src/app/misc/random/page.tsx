"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { demos, demoList, type DemoSlug } from "./registry";
import type { DemoModule } from "./registry";

export default function Page() {
    const [items, setItems] = useState<Array<{ slug: DemoSlug; mod: DemoModule }>>([]);

    useEffect(() => {
        let alive = true;
        (async () => {
            const loaded = await Promise.all(
                demoList.map(async (slug) => ({ slug, mod: await demos[slug]() }))
            );
            if (alive) setItems(loaded);
        })();
        return () => {
            alive = false;
        };
    }, []);

    /* ── loading skeleton ─────────────────────────────────────────── */
    if (!items.length) {
        return (
            <>
                <Background />
                <div className="relative z-[1] max-w-6xl mx-auto px-6 py-16 mt-16">
                    <div className="mb-10">
                        <div className="h-6 w-48 rounded bg-cyan-400/[0.06] animate-pulse" />
                        <div className="mt-3 h-4 w-80 max-w-full rounded bg-cyan-400/[0.04] animate-pulse" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="rounded-lg border border-cyan-400/[0.08] bg-[rgba(10,18,32,0.5)] p-3 animate-pulse flex flex-col"
                            >
                                <div className="mb-3 aspect-square rounded-md bg-cyan-400/[0.04]" />
                                <div className="h-3.5 w-2/3 rounded bg-cyan-400/[0.06] mb-2" />
                                <div className="h-3 w-full rounded bg-cyan-400/[0.04]" />
                            </div>
                        ))}
                    </div>
                </div>
            </>
        );
    }

    const ready = items.filter(({ mod }) => mod.presentable);
    const wip = items.filter(({ mod }) => !mod.presentable);

    return (
        <>
            <Background />

            <main className="relative z-[1] max-w-6xl mx-auto px-6 py-16 mt-16">
                {/* ── header ────────────────────────────────────────────── */}
                <header className="mb-12">
                    <div className="font-mono text-[11px] tracking-[0.2em] text-white/40 uppercase mb-4">
                        <span className="text-cyan-400">■</span> MISC — EXPERIMENTS
                    </div>

                    <h1 className="font-mono text-[clamp(26px,4vw,40px)] font-extrabold leading-[1.1] tracking-tight">
                        RANDOM{" "}
                        <span className="bg-gradient-to-br from-cyan-400 to-violet-500 bg-clip-text text-transparent">
              EXPERIMENTS
            </span>
                    </h1>

                    <p className="mt-4 font-sans text-[15px] leading-[1.7] text-white/50 max-w-lg">
                        Small interactive demos, visual ideas, and some stuff I find useful.
                    </p>
                </header>

                {/* ── ready demos ───────────────────────────────────────── */}
                <DemoGrid data={ready} />

                {/* ── wip section ───────────────────────────────────────── */}
                {wip.length > 0 && (
                    <>
                        <div className="flex items-center gap-3 my-14">
                            <span className="font-mono text-[11px] font-bold text-amber-400/70 tracking-[0.08em]">WIP</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400/50" />
                            <span className="flex-1 h-px bg-gradient-to-r from-amber-400/15 to-transparent" />
                            <span className="font-mono text-[10px] tracking-[0.14em] text-white/30 uppercase">
                WORK IN PROGRESS
              </span>
                        </div>

                        <DemoGrid data={wip} />
                    </>
                )}

                {/* ── footer telemetry ──────────────────────────────────── */}
                <div className="border-t border-cyan-400/[0.1] pt-6 pb-10 mt-14 flex flex-wrap gap-x-7 gap-y-1.5">
                    {[
                        { l: "DEMOS.READY", v: String(ready.length) },
                        { l: "DEMOS.WIP", v: String(wip.length) },
                        { l: "TOTAL", v: String(items.length) },
                    ].map((t, i) => (
                        <span key={i} className="font-mono text-[10px] tracking-[0.1em] text-white/35">
              <span className="text-white/50">{t.l}:</span>{" "}
                            <span className="text-cyan-400">{t.v}</span>
            </span>
                    ))}
                </div>
            </main>
        </>
    );
}

/* ══════════════════════════════════════════════════════════════════
   DEMO GRID
══════════════════════════════════════════════════════════════════ */

function DemoGrid({ data }: { data: Array<{ slug: DemoSlug; mod: DemoModule }> }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.map(({ slug, mod }) => (
                <Link
                    key={slug}
                    href={`/misc/random/${slug}`}
                    className="group rounded-lg border border-cyan-400/[0.1] bg-[rgba(10,18,32,0.65)] backdrop-blur-xl overflow-hidden
                     transition-all duration-300 hover:border-cyan-400/25 hover:shadow-[0_0_22px_rgba(0,220,255,0.07)]
                     flex flex-col"
                >
                    {/* preview */}
                    <div className="aspect-square overflow-hidden border-b border-cyan-400/[0.08] bg-black/40 flex items-center justify-center">
                        {mod.preview}
                    </div>

                    {/* info */}
                    <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-mono text-sm font-bold text-white/85 tracking-tight leading-tight">
                            {mod.title}
                        </h3>

                        <p className="mt-1.5 font-sans text-[12px] text-white/45 leading-[1.5] line-clamp-2 flex-1">
                            {mod.description}
                        </p>

                        {/* cta */}
                        <div className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] text-cyan-400/60 uppercase group-hover:text-cyan-400 transition-colors duration-200">
                            OPEN
                            <svg
                                viewBox="0 0 24 24"
                                className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5"
                                aria-hidden
                            >
                                <path
                                    d="M7 17L17 7M17 7H9M17 7v8"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="none"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   BACKGROUND
══════════════════════════════════════════════════════════════════ */

function Background() {
    return (
        <>
            <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[#06080d]" />
                <div
                    className="absolute inset-0 animate-[gridPulse_8s_ease-in-out_infinite]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(0,220,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,220,255,0.03) 1px,transparent 1px)",
                        backgroundSize: "56px 56px",
                    }}
                />
                <div className="absolute -top-48 -right-48 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(0,220,255,0.06),transparent_70%)]" />
                <div className="absolute -bottom-40 -left-32 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.05),transparent_70%)]" />
            </div>
            <style>{`
        @keyframes gridPulse {
          0%,100%{opacity:0.02}
          50%{opacity:0.06}
        }
      `}</style>
        </>
    );
}