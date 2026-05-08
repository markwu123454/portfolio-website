"use client";

import {useEffect, useState} from "react";
import Image from "next/image";
import {ChevronRight, ExternalLink} from "lucide-react";

/* ── types ─────────────────────────────────────────────────────── */
type Summary = {
    matches?: number;
    events?: number;
    teams?: number;
    median_sync?: number;
};

/* ── page ──────────────────────────────────────────────────────── */
export default function ScoutingPortfolioPage() {
    const [summary, setSummary] = useState<Summary | null>(null);

    useEffect(() => {
        fetch("/api/summary")
            .then((r) => r.json())
            .then(setSummary)
            .catch(() =>
                setSummary({matches: 153, events: 3, teams: 50, median_sync: 0.238})
            );
    }, []);

    return (
        <>
            {/* ── ambient background ──────────────────────────────────── */}
            <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[#06080d]"/>
                <div
                    className="absolute inset-0 animate-[gridPulse_8s_ease-in-out_infinite]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(0,220,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,220,255,0.03) 1px,transparent 1px)",
                        backgroundSize: "56px 56px",
                    }}
                />
                <div
                    className="absolute -top-48 -right-48 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(0,220,255,0.06),transparent_70%)]"/>
                <div
                    className="absolute -bottom-40 -left-32 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.05),transparent_70%)]"/>
            </div>

            <style>{`
        @keyframes gridPulse {
          0%,100%{opacity:0.02}
          50%{opacity:0.06}
        }
        @keyframes headingGlow {
          0%,100%{text-shadow:0 0 24px rgba(0,220,255,0.12)}
          50%{text-shadow:0 0 44px rgba(0,220,255,0.28)}
        }
      `}</style>

            <main className="relative z-[1] mx-auto w-full max-w-5xl px-6 py-16 mt-16">
                {/* ── header ────────────────────────────────────────────── */}
                <header className="mb-14">
                    <div className="font-mono text-[11px] tracking-[0.2em] text-white/40 uppercase mb-4">
                        <span className="text-cyan-400">■</span> TEAM 3473 — SOFTWARE
                    </div>

                    <h1 className="font-mono text-[clamp(30px,4.5vw,48px)] font-extrabold leading-[1.08] tracking-tight animate-[headingGlow_4s_ease-in-out_infinite]">
                        FRC SCOUTING{" "}
                        <span className="bg-gradient-to-br from-cyan-400 to-violet-500 bg-clip-text text-transparent">
              PLATFORM
            </span>
                    </h1>

                    <p className="mt-5 font-sans text-[15px] leading-[1.7] text-white/55 max-w-[580px]">
                        A full-stack scouting ecosystem built to replace our team&apos;s
                        legacy system — from a glorified Google Form to a real-time PWA
                        with field-level tracking, iterative UI design across 5 major
                        redesigns, and an analysis engine that hits 97% match prediction
                        accuracy.
                    </p>

                    {/* live stats */}
                    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-2xl">
                        {[
                            {label: "MATCHES", value: summary?.matches?.toLocaleString() ?? "—"},
                            {label: "EVENTS", value: summary?.events?.toString() ?? "—"},
                            {label: "TEAMS", value: summary?.teams?.toLocaleString() ?? "—"},
                            {label: "SYNC", value: summary?.median_sync ? `${summary.median_sync}s` : "—"},
                        ].map((s) => (
                            <div key={s.label}
                                 className="rounded-lg border border-cyan-400/[0.1] bg-[rgba(10,18,32,0.65)] backdrop-blur-xl p-4">
                                <div
                                    className="font-mono text-[9px] tracking-[0.16em] text-white/40 uppercase">{s.label}</div>
                                <div
                                    className="mt-1 font-mono text-xl font-extrabold text-cyan-400 leading-none">{s.value}</div>
                            </div>
                        ))}
                    </div>
                </header>

                {/* ════════════════════════════════════════════════════════
            1 — THE PROBLEM
        ════════════════════════════════════════════════════════ */}
                <SectionDivider num="01" label="PROBLEM"/>

                <Panel className="mb-12">
                    <PanelBar label="CONTEXT.LEGACY"/>
                    <div className="p-5">
                        <h3 className="font-mono text-base font-bold text-white/85 tracking-tight mb-3">
                            Why build from scratch?
                        </h3>
                        <p className="font-sans text-sm text-white/50 leading-[1.7] max-w-2xl">
                            Our team&apos;s existing scouting app was a website wrapping Google
                            Forms. The security was nonexistent — I was able to download every
                            login credential and all scouting data from an exposed endpoint.
                            The UI was worse than the Forms it replaced. Nobody wanted to use
                            it, and the data it collected was too shallow to be useful for
                            match strategy.
                        </p>
                        <div className="mt-4 space-y-1">
                            {[
                                "Exposed API endpoints leaking credentials and match data.",
                                "UI worse than Google Forms — scouts avoided using it.",
                                "Data too shallow for meaningful strategy decisions.",
                                "No offline support — unreliable at competition venues.",
                            ].map((line, i) => (
                                <div key={i} className="font-mono text-[11px] leading-[1.5] text-white/45">
                                    <span className="text-red-400/50 mr-2">✕</span>{line}
                                </div>
                            ))}
                        </div>
                    </div>
                </Panel>

                {/* ════════════════════════════════════════════════════════
            2 — ARCHITECTURE
        ════════════════════════════════════════════════════════ */}
                <SectionDivider num="02" label="ARCHITECTURE"/>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3 mb-12">
                    <ArchCard
                        tag="FRONTEND"
                        title="Web PWA"
                        details={[
                            "React + TypeScript",
                            "Dexie-based local queue",
                            "Offline-first with service workers",
                            "Optimistic UI updates",
                        ]}
                    />
                    <ArchCard
                        tag="BACKEND"
                        title="FastAPI"
                        details={[
                            "Async Python + asyncpg",
                            "PostgreSQL database",
                            "Role-based access + passcode hashing",
                            "Deterministic sync protocol",
                        ]}
                    />
                    <ArchCard
                        tag="ANALYSIS"
                        title="Engine"
                        details={[
                            "C# WPF desktop app on Python",
                            "scikit-learn + custom algorithms",
                            "97% match winner accuracy",
                            "Outperforms Statbotics (~80%)",
                        ]}
                    />
                </div>

                <div className="mb-12 grid grid-cols-1 gap-3 sm:grid-cols-4">
                    <TelemetryStat label="TEAM" value="04" hint="1 lead + 3 members"/>
                    <TelemetryStat label="REDESIGNS" value="05" hint="Major UI iterations"/>
                    <TelemetryStat label="DEPLOYED" value="2025+" hint="Off-season + 2026 season"/>
                    <TelemetryStat label="ACCURACY" value="97%" hint="Match winner prediction"/>
                </div>

                {/* ════════════════════════════════════════════════════════
            3 — SCOUTING UI
        ════════════════════════════════════════════════════════ */}
                <SectionDivider num="03" label="SCOUTING.UI"/>

                <p className="mb-6 font-sans text-sm text-white/45 max-w-2xl">
                    The core challenge: turning scouting from a form-filling chore into
                    something scouts can operate at match speed. The 2026 game is a
                    mass-shooter format — exact ball counts are unrealistic, so we
                    designed around approximation and spatial tracking.
                </p>

                {/* ── 3.1  field + cycle tracking ──────────────────────── */}
                <PhaseDivider num="3.1" label="FIELD.TRACKING"/>

                <Panel className="mb-4">
                    <PanelBar label="FEATURE.FIELD-VIEW" status="SHIPPED" statusColor="emerald"/>
                    <div className="p-5">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_1fr]">
                            <div>
                                <h3 className="font-mono text-base font-bold text-white/85 tracking-tight">
                                    Interactive field map
                                </h3>
                                <p className="mt-2 font-sans text-sm text-white/50 leading-[1.6]">
                                    A field image with robot state buttons — shooting, intaking,
                                    traversing — that track cycle times. Scouts tap where the robot
                                    is and what it&apos;s doing, giving us both position and timing data.
                                </p>
                                <SpecBlock
                                    title="What we capture"
                                    items={[
                                        "Exact shooting position on field for shot heatmaps.",
                                        "Cycle times between intake → shoot transitions.",
                                        "Robot state timeline across the full match.",
                                    ]}
                                />
                            </div>
                            <div
                                className="relative aspect-[16/10] overflow-hidden rounded-md border border-cyan-400/[0.08]">
                                <Image src="/sprocket/Screenshot 2026-04-03 205309.png" alt="Match scouting UI" fill
                                       className="object-contain"/>
                            </div>
                        </div>
                    </div>
                </Panel>

                {/* ── 3.2  shot slider ─────────────────────────────────── */}
                <PhaseDivider num="3.2" label="INPUT.SLIDER"/>

                <Panel className="mb-4">
                    <PanelBar label="FEATURE.SHOT-SLIDER" status="UNCHANGED" statusColor="emerald"/>
                    <div className="p-5">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_1fr]">
                            <div>
                                <h3 className="font-mono text-base font-bold text-white/85 tracking-tight">
                                    Shot count slider
                                </h3>
                                <p className="mt-2 font-sans text-sm text-white/50 leading-[1.6]">
                                    With the volume of balls in the 2026 game, exact counting is
                                    unrealistic. A slider lets scouts approximate shot count
                                    quickly without losing match focus. This was one of the first
                                    features designed and survived all 5 redesigns basically
                                    unchanged — it just worked.
                                </p>
                            </div>
                            <div className="relative aspect-[16/10] overflow-hidden rounded-md border border-cyan-400/[0.08]">
                                <Image src="/sprocket/img.png" alt="match scouting fuel made and fuel miss slider" fill className="object-contain" />
                            </div>
                        </div>
                    </div>
                </Panel>

                {/* ── 3.3  interaction model iteration ─────────────────── */}
                <PhaseDivider num="3.3" label="ITERATION.INTERACTION-MODEL"/>

                <Panel className="mb-12">
                    <PanelBar label="REDESIGN.LOG"/>
                    <div className="p-5">
                        <h3 className="font-mono text-base font-bold text-white/85 tracking-tight mb-3">
                            5 redesigns: from tap-to-toggle to hold-to-activate
                        </h3>
                        <p className="font-sans text-sm text-white/50 leading-[1.6] max-w-2xl mb-4">
                            The original interaction model used press-to-activate: tap a
                            state button and the robot stays in that state until you tap
                            another. After our first event we found this required too many
                            interactions — scouts were falling behind. We switched to
                            hold-to-activate: hold the button for the duration of the action,
                            release when it ends. Fewer taps, more intuitive mapping to
                            what&apos;s actually happening on the field.
                        </p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <IterationCard
                                version="V1–V3"
                                model="PRESS TO ACTIVATE"
                                desc="Tap a state → robot stays in that state until a different button is pressed."
                                status="REPLACED"
                                statusColor="amber"
                            />
                            <IterationCard
                                version="V4–V5"
                                model="HOLD TO ACTIVATE"
                                desc="Hold button for duration of action, release when done. Fewer interactions, maps to real-time observation."
                                status="CURRENT"
                                statusColor="emerald"
                            />
                        </div>
                        <div className="mt-4 space-y-1">
                            {[
                                "Field layout, timer display, and button placement changed across redesigns.",
                                "Shot slider remained stable from V1 — validated by real usage.",
                                "Hold model reduced scout error rate at Port Hueneme event.",
                            ].map((line, i) => (
                                <div key={i} className="font-mono text-[11px] leading-[1.5] text-white/45">
                                    <span className="text-cyan-400/40 mr-2">›</span>{line}
                                </div>
                            ))}
                        </div>
                    </div>
                </Panel>

                {/* ════════════════════════════════════════════════════════
            4 — ANALYSIS ENGINE
        ════════════════════════════════════════════════════════ */}
                <SectionDivider num="04" label="ANALYSIS.ENGINE"/>

                <p className="mb-6 font-sans text-sm text-white/45 max-w-2xl">
                    The analysis layer is what justifies the platform over alternatives
                    like Lovat. We built algorithms that outperform established
                    benchmarks — 97% match winner accuracy vs Statbotics&apos; ~80%.
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-6">
                    <AlgorithmCard
                        name="Bayesian Elo"
                        desc="Adaptive team rating using probabilistic outcome inference. Updates after every match with confidence weighting."
                    />
                    <AlgorithmCard
                        name="Theil–Sen + Heuristics"
                        desc="Robust regression on historical performance vectors, combined with domain-specific scoring heuristics."
                    />
                    <AlgorithmCard
                        name="Ranking K-Means"
                        desc="Clusters teams into offensive, balanced, and support roles. Used for alliance composition recommendations."
                    />
                    <AlgorithmCard
                        name="Random Forest Regressor"
                        desc="Predicts alliance score variance using composite features. Powers the playoff bracket simulation."
                    />
                </div>

                <PhaseDivider num="4.1" label="DATA.OUTPUTS"/>

                <Panel className="mb-12">
                    <PanelBar label="REPORTS"/>
                    <div className="p-5">
                        <h3 className="font-mono text-base font-bold text-white/85 tracking-tight mb-3">
                            What the data becomes
                        </h3>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {[
                                {tag: "PER TEAM", desc: "Full performance profile with trend lines across matches."},
                                {tag: "PER MATCH", desc: "Predictive pre-match report + post-match reflection."},
                                {tag: "RANKINGS", desc: "Custom team rankings using composite scoring."},
                                {tag: "ALLIANCE SIM", desc: "Alliance prediction and full playoff bracket simulation."},
                                {tag: "GUEST ACCESS", desc: "Shareable read-only views for allied teams."},
                                {tag: "PIT SCOUTING", desc: "Robot capability survey linked to match performance."},
                            ].map((item) => (
                                <div key={item.tag}
                                     className="rounded-md border border-cyan-400/[0.08] bg-black/20 p-3">
                                    <span
                                        className="font-mono text-[9px] tracking-[0.14em] text-cyan-400/60 uppercase">{item.tag}</span>
                                    <p className="mt-1 font-sans text-[12px] text-white/50 leading-[1.5]">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </Panel>

                {/* ════════════════════════════════════════════════════════
            5 — ADMIN + OPS
        ════════════════════════════════════════════════════════ */}
                <SectionDivider num="05" label="ADMIN.OPS"/>

                <Panel className="mb-12">
                    <PanelBar label="TEAM.OPS"/>
                    <div className="p-5">
                        <h3 className="font-mono text-base font-bold text-white/85 tracking-tight mb-3">
                            Beyond scouting
                        </h3>
                        <p className="font-sans text-sm text-white/50 leading-[1.6] max-w-2xl">
                            The platform also handles team operations — inventory tracking,
                            attendance logging, and other organizational tools that the team
                            uses day-to-day outside of competition.
                        </p>
                    </div>
                </Panel>

                {/* ════════════════════════════════════════════════════════
            6 — LINK
        ════════════════════════════════════════════════════════ */}
                <SectionDivider num="06" label="ACCESS"/>

                <Panel className="mb-14">
                    <PanelBar label="LIVE.APP"/>
                    <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex-1">
                            <h3 className="font-mono text-base font-bold text-white/85 tracking-tight">
                                Try it live
                            </h3>
                            <p className="mt-1 font-sans text-sm text-white/40 leading-[1.5]">
                                Scouting UI and detailed reports are permission-gated. Public
                                pages are accessible without login.
                            </p>
                        </div>
                        <a
                            href="https://sprocketstats.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-md border border-cyan-400/20 bg-cyan-400/[0.05] px-4 py-2.5 font-mono text-[11px] tracking-[0.12em] text-cyan-400/80 uppercase hover:bg-cyan-400/[0.1] hover:text-cyan-400 transition-colors duration-200"
                        >
                            <ExternalLink className="h-3.5 w-3.5"/>
                            SPROCKETSTATS.COM
                        </a>
                    </div>
                </Panel>

                {/* ── footer telemetry ──────────────────────────────────── */}
                <div className="border-t border-cyan-400/[0.1] pt-6 pb-10 flex flex-wrap gap-x-7 gap-y-1.5">
                    {[
                        {l: "SYS.STATUS", v: "DEPLOYED"},
                        {l: "STACK", v: "REACT · FASTAPI · POSTGRES · C#"},
                        {l: "ACCURACY", v: "97%"},
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
   LAYOUT PRIMITIVES
══════════════════════════════════════════════════════════════════ */

function SectionDivider({num, label}: { num: string; label: string }) {
    return (
        <div className="flex items-center gap-3 mb-7">
            <span className="font-mono text-[13px] font-bold text-cyan-400 tracking-[0.08em] min-w-[26px]">{num}</span>
            <span className="relative inline-block w-2 h-2">
        <span className="absolute inset-0 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,220,255,0.35)]"/>
      </span>
            <span className="flex-1 h-px bg-gradient-to-r from-cyan-400/25 to-transparent"/>
            <span className="font-mono text-[11px] tracking-[0.14em] text-white/35 uppercase">{label}</span>
        </div>
    );
}

function PhaseDivider({num, label}: { num: string; label: string }) {
    return (
        <div className="flex items-center gap-3 mb-5 mt-2">
            <span
                className="font-mono text-[11px] font-bold text-violet-400/70 tracking-[0.08em] min-w-[26px]">{num}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400/50"/>
            <span className="flex-1 h-px bg-gradient-to-r from-violet-400/15 to-transparent"/>
            <span className="font-mono text-[10px] tracking-[0.14em] text-white/30 uppercase">{label}</span>
        </div>
    );
}

function Panel({children, className = ""}: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={`rounded-lg border border-cyan-400/[0.1] bg-[rgba(10,18,32,0.65)] backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-cyan-400/20 hover:shadow-[0_0_22px_rgba(0,220,255,0.07)] ${className}`}>
            {children}
        </div>
    );
}

function PanelBar({label, status, statusColor}: { label: string; status?: string; statusColor?: "emerald" | "amber" }) {
    const dots: Record<string, string> = {emerald: "bg-emerald-400", amber: "bg-amber-400"};
    const rings: Record<string, string> = {emerald: "bg-emerald-400/25", amber: "bg-amber-400/25"};

    return (
        <div
            className="flex items-center justify-between gap-2.5 px-5 py-2.5 border-b border-cyan-400/[0.08] bg-black/25">
            <div className="flex items-center gap-2.5">
        <span className="flex gap-[5px]">
          <span className="w-2 h-2 rounded-full bg-[#ff5f57] opacity-70"/>
          <span className="w-2 h-2 rounded-full bg-[#febc2e] opacity-70"/>
          <span className="w-2 h-2 rounded-full bg-[#28c840] opacity-70"/>
        </span>
                <span className="font-mono text-[10px] tracking-[0.14em] text-white/50 uppercase">{label}</span>
            </div>
            {status && statusColor && (
                <span
                    className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.14em] text-white/50 uppercase">
          <span className="relative inline-block w-[6px] h-[6px]">
            <span className={`absolute inset-0 rounded-full ${dots[statusColor]} animate-pulse`}/>
            <span className={`absolute -inset-[2px] rounded-full ${rings[statusColor]} animate-pulse`}/>
          </span>
                    {status}
        </span>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   CONTENT COMPONENTS
══════════════════════════════════════════════════════════════════ */

function TelemetryStat({label, value, hint}: { label: string; value: string; hint?: string }) {
    return (
        <div className="rounded-lg border border-cyan-400/[0.1] bg-[rgba(10,18,32,0.65)] backdrop-blur-xl p-4">
            <div className="font-mono text-[9px] tracking-[0.16em] text-white/40 uppercase">{label}</div>
            <div className="mt-1 font-mono text-xl font-extrabold text-cyan-400 leading-none">{value}</div>
            {hint && <div className="mt-1.5 font-sans text-[11px] text-white/35">{hint}</div>}
        </div>
    );
}

function ArchCard({tag, title, details}: { tag: string; title: string; details: string[] }) {
    return (
        <Panel>
            <PanelBar label={tag}/>
            <div className="p-5">
                <h3 className="font-mono text-lg font-bold text-white/85 tracking-tight">{title}</h3>
                <div className="mt-3 space-y-1">
                    {details.map((d, i) => (
                        <div key={i} className="font-mono text-[11px] leading-[1.5] text-white/45">
                            <span className="text-cyan-400/40 mr-2">›</span>{d}
                        </div>
                    ))}
                </div>
            </div>
        </Panel>
    );
}

function AlgorithmCard({name, desc}: { name: string; desc: string }) {
    return (
        <Panel>
            <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400/50"/>
                    <h4 className="font-mono text-[11px] tracking-[0.14em] text-violet-400/70 uppercase font-bold">{name}</h4>
                </div>
                <p className="font-sans text-[12px] text-white/45 leading-[1.6]">{desc}</p>
            </div>
        </Panel>
    );
}

function IterationCard({
                           version,
                           model,
                           desc,
                           status,
                           statusColor,
                       }: {
    version: string;
    model: string;
    desc: string;
    status: string;
    statusColor: "emerald" | "amber";
}) {
    const dots: Record<string, string> = {emerald: "bg-emerald-400", amber: "bg-amber-400"};
    const rings: Record<string, string> = {emerald: "bg-emerald-400/25", amber: "bg-amber-400/25"};

    return (
        <div className="rounded-md border border-cyan-400/[0.08] bg-black/20 p-4">
            <div className="flex items-center justify-between mb-2">
                <span
                    className="font-mono text-[10px] tracking-[0.14em] text-cyan-400/60 uppercase font-bold">{version}</span>
                <span
                    className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.14em] text-white/45 uppercase">
          <span className="relative inline-block w-[5px] h-[5px]">
            <span className={`absolute inset-0 rounded-full ${dots[statusColor]}`}/>
            <span className={`absolute -inset-[2px] rounded-full ${rings[statusColor]}`}/>
          </span>
                    {status}
        </span>
            </div>
            <h4 className="font-mono text-sm font-bold text-white/80 tracking-tight">{model}</h4>
            <p className="mt-1 font-sans text-[12px] text-white/40 leading-[1.5]">{desc}</p>
        </div>
    );
}

function SpecBlock({title, items}: { title: string; items: string[] }) {
    return (
        <div className="mt-5 pt-4 border-t border-cyan-400/[0.08]">
            <div className="mb-2 flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-cyan-400/60"/>
                <span
                    className="font-mono text-[10px] tracking-[0.14em] text-cyan-400/70 uppercase font-bold">{title}</span>
            </div>
            <div className="space-y-1">
                {items.map((t, i) => (
                    <div key={i} className="font-mono text-[11px] leading-[1.6] text-white/50">
                        <span className="text-cyan-400/30 mr-2">›</span>{t}
                    </div>
                ))}
            </div>
        </div>
    );
}