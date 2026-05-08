"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { ChevronDown, ChevronRight, TriangleAlert } from "lucide-react";

/*
 * IMAGE DIMENSIONS (measured):
 * {91143FAA...}.png       1430×691   2.07:1
 * Screenshot ...190433    1918×1030  1.86:1
 * Screenshot ...231204     653×572   1.14:1
 * {C9458B6B...}.png        802×722   1.11:1
 * f805624e...jpg           1706×1279  1.33:1
 * 58a88204...jpg           1706×1279  1.33:1
 * {AE219238...}.png       1059×852   1.24:1
 * {DE04C1FD...}.png        647×670   0.97:1
 * {A7574BBF...}.png        466×633   0.74:1
 * Screenshot ...134357     397×845   0.47:1
 * {7F8C180E...}.png        970×756   1.28:1
 * {BF2AAED7...}.png        971×785   1.24:1
 * {8B2EC6D4...}.png        939×826   1.14:1
 * {D227BF55...}.png        790×715   1.10:1
 * {44F91A73...}.png        632×718   0.88:1
 * {C2655D9F...}.png        758×503   1.51:1
 * rDdZRNT.jpeg            1080×1436  0.75:1
 */

export default function CADPage() {
    return (
        <>
            {/* ── ambient background ──────────────────────────────────── */}
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
        @keyframes headingGlow {
          0%,100%{text-shadow:0 0 24px rgba(0,220,255,0.12)}
          50%{text-shadow:0 0 44px rgba(0,220,255,0.28)}
        }
      `}</style>

            <main className="relative z-[1] mx-auto w-full max-w-5xl px-6 py-16 mt-16">
                {/* ── header ────────────────────────────────────────────── */}
                <header className="mb-14">
                    <div className="font-mono text-[11px] tracking-[0.2em] text-white/40 uppercase mb-4">
                        <span className="text-cyan-400">■</span> TEAM 3473 — CAD ARCHIVE
                    </div>

                    <h1 className="font-mono text-[clamp(30px,4.5vw,48px)] font-extrabold leading-[1.08] tracking-tight animate-[headingGlow_4s_ease-in-out_infinite]">
                        FRC CAD{" "}
                        <span className="bg-gradient-to-br from-cyan-400 to-violet-500 bg-clip-text text-transparent">
              SUBTEAM
            </span>
                    </h1>

                    <p className="mt-5 font-sans text-[15px] leading-[1.7] text-white/55 max-w-[540px]">
                        My journey so far from first introduction of SolidWorks to making
                        full subsystems to making full robots.
                    </p>
                </header>

                {/* ════════════════════════════════════════════════════════
            SEASON 1: REEFSCAPE
        ════════════════════════════════════════════════════════ */}
                <SectionDivider num="S1" label="SEASON.REEFSCAPE" />

                <SeasonHeader
                    title="ReefScape"
                    subtitle="FIRST DIVE · 2024-25"
                    records={[
                        "Orange County Regional — 3-9-0, rank 38/47",
                        "Central Valley Regional — 5-6-0, rank 24/42",
                        "World Champs Hopper — 6-4-0, rank 28/75",
                        "OFF-SEASON: SoCal Showdown — 5-6-0, rank 28/42",
                    ]}
                />

                {/* ── 1.1  pre-season ──────────────────────────────────── */}
                <PhaseDivider num="1.1" label="PRE-SEASON" />

                <Panel className="mb-10">
                    <PanelBar label="ONBOARDING" />
                    <div className="p-5">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto]">
                            <div>
                                <h3 className="font-mono text-base font-bold text-white/85 tracking-tight mb-3">
                                    Starting from zero
                                </h3>
                                <div className="space-y-1.5">
                                    {[
                                        "First learning SolidWorks.",
                                        "Don\u2019t understand the assembly-first ideology.",
                                        "Never worked on robots like this.",
                                        "Don\u2019t know how to do anything.",
                                    ].map((line, i) => (
                                        <div key={i} className="font-mono text-[11px] leading-[1.5] text-white/50">
                                            <span className="text-cyan-400/40 mr-2">›</span>{line}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* 1918×1030 → 1.86:1 */}
                            <Img
                                src="/solidworks/Screenshot 2025-01-01 190433.png"
                                alt="Early SolidWorks attempt"
                                w={1918} h={1030}
                                className="md:w-[320px]"
                            />
                        </div>
                    </div>
                </Panel>

                {/* ── 1.2  build season ─────────────────────────────────── */}
                <PhaseDivider num="1.2" label="BUILD-SEASON.SUBSYSTEMS" />

                {/* intake (scrapped) */}
                <Panel className="mb-4">
                    <PanelBar label="SUBSYS.INTAKE" status="SCRAPPED" statusColor="amber" />
                    <div className="p-5 grid grid-cols-1 gap-5 md:grid-cols-[1fr_260px]">
                        <div>
                            <h3 className="font-mono text-base font-bold text-white/85 tracking-tight">
                                Kickoff intake
                            </h3>
                            <p className="mt-2 font-sans text-sm text-white/50 leading-[1.6]">
                                Looked plausible in CAD, failed in prototyping: poor tolerance to
                                off-axis corals and rebound.
                            </p>
                            <FailureBlock
                                label="Why it failed"
                                points={[
                                    "Too big.",
                                    "Structurally unsound, multiple weak connectors.",
                                    "Doesn\u2019t integrate with the rest of the bot.",
                                ]}
                            />
                        </div>
                        {/* 653×572 → 1.14:1 */}
                        <Img
                            src="/solidworks/Screenshot 2025-01-14 231204.png"
                            alt="Kickoff intake CAD"
                            w={653} h={572}
                        />
                    </div>
                </Panel>

                {/* climb (shipped) */}
                <Panel className="mb-10">
                    <PanelBar label="SUBSYS.CLIMB" status="SHIPPED" statusColor="emerald" />
                    <div className="p-5">
                        <h3 className="font-mono text-base font-bold text-white/85 tracking-tight">
                            Climb subsystem
                        </h3>
                        <p className="mt-2 font-sans text-sm text-white/50 leading-[1.6] max-w-2xl">
                            Endgame cage climb: this subsystem&apos;s job is to latch onto a
                            hanging cage at the end of the game and lift the robot off the
                            ground. The subsystem I found myself working on the most by the
                            end of the season.
                        </p>

                        {/* 802×722(1.11), 1706×1279(1.33), 1706×1279(1.33) */}
                        <div className="mt-4 grid grid-cols-3 gap-3">
                            <Img src="/solidworks/{C9458B6B-8225-4316-9C7E-309683CBDC82}.png" alt="Climb concept CAD" w={802} h={722} />
                            <Img src="/solidworks/f805624e83623c87c7082c5fd1e75fba.jpg" alt="Drivebase climb test" w={1706} h={1279} />
                            <Img src="/solidworks/58a88204ec28a905ad1667fe61e58dbe.jpg" alt="Worlds climb success" w={1706} h={1279} />
                        </div>

                        <SpecBlock
                            title="Design notes"
                            items={[
                                "Clear load paths transferring force directly into drivebase.",
                                "Existing proven geometry for latch.",
                                "125:1 gearbox plus winch provides necessary force to climb.",
                                "Includes heavy modifications and iterations because the rest of the robot isn\u2019t designed with this subsystem in mind.",
                            ]}
                        />
                    </div>
                </Panel>

                {/* ── 1.3  practice studies ─────────────────────────────── */}
                <PhaseDivider num="1.3" label="PRACTICE.REVERSE-ENGINEERING" />

                <p className="mb-6 font-sans text-sm text-white/45 max-w-2xl">
                    CAD practice of other teams&apos; robots purely from robot reveal and
                    match recordings.
                </p>

                <div className="space-y-4 mb-10">
                    {/* practice 1 */}
                    <PracticeBlock
                        num="P1"
                        title="1690 × 4414 hybrid"
                        summary="Elements taken from 1690: 4 bar ground intake, ultra-light differential elevator and arm. Elements taken from 4414: motor driven grabber."
                        gallery={[
                            { src: "/solidworks/{AE219238-8BB7-4E2D-B0AF-E17E795C96DA}.png", alt: "Practice #1 CAD", w: 1059, h: 852 },
                            { src: "/solidworks/{DE04C1FD-A281-4AEC-9A13-41A03C5B4156}.png", alt: "Reference robot", w: 647, h: 670 },
                        ]}
                    >
                        <SubsystemSection title="Elevator">
                            <p className="font-sans text-sm text-white/50 leading-[1.6]">
                                2-stage continuous; cascading rigging; differential belt drive
                                with 2× Kraken X60 @ ~5:1.
                            </p>
                            {/* 466×633(0.74) + 397×845(0.47) — both portrait */}
                            <div className="mt-3 grid grid-cols-2 gap-3 max-w-md">
                                <Img src="/solidworks/{A7574BBF-A191-48AD-9BEF-CA605A55813A}.png" alt="Elevator view" w={466} h={633} />
                                <Img src="/solidworks/Screenshot 2025-03-10 134357.png" alt="Rigging detail" w={397} h={845} />
                            </div>
                        </SubsystemSection>
                        <SubsystemSection title="Intake">
                            <p className="font-sans text-sm text-white/50 leading-[1.6]">
                                Over-bumper with integrated indexer; 4-bar geometry admits messy
                                approaches, compliant structure and rollers.
                            </p>
                            {/* 970×756(1.28) + 971×785(1.24) — similar landscape */}
                            <div className="mt-3 grid grid-cols-2 gap-3">
                                <Img src="/solidworks/{7F8C180E-E30A-4F7E-943C-4D3E5082E3C1}.png" alt="Intake" w={970} h={756} />
                                <Img src="/solidworks/{BF2AAED7-2041-4930-A4B5-7F1724DCF4A4}.png" alt="Indexer" w={971} h={785} />
                            </div>
                        </SubsystemSection>
                        <SubsystemSection title="Arm">
                            <p className="font-sans text-sm text-white/50 leading-[1.6]">
                                Long carbon arm, differentially driven via elevator (no dedicated
                                pivot motor). Handles coral + algae.
                            </p>
                        </SubsystemSection>
                        <FailureBlock
                            label="What's bad about this design"
                            points={[
                                "Intake geometry deviates a lot from the reference, thus making it untested.",
                                "Elevator carriage and integration with arm not finished.",
                                "No climb.",
                            ]}
                        />
                    </PracticeBlock>

                    {/* practice 2 */}
                    <PracticeBlock
                        num="P2"
                        title="2910 × 1323 blend"
                        summary="Elements taken from 2910: multi-tool hand for algae and coral, capable of ground intake. Elements taken from 1323: elevator, and elevator pivot."
                        gallery={[
                            { src: "/solidworks/{8B2EC6D4-D0A4-4CB5-9F3B-1B1180A80D9E}.png", alt: "Practice #2 CAD", w: 939, h: 826 },
                            { src: "/solidworks/{D227BF55-ACFA-44EA-AC0F-70747FB6BB4A}.png", alt: "Reference robot", w: 790, h: 715 },
                        ]}
                    >
                        <SubsystemSection title="Elevator">
                            <p className="font-sans text-sm text-white/50 leading-[1.6]">
                                4-stage continuous with Dyneema; 6:1 custom gearbox; pocketed
                                rails; ~135″ total extension.
                            </p>
                            {/* 632×718 → 0.88:1 portrait */}
                            <div className="mt-3 max-w-xs">
                                <Img src="/solidworks/{44F91A73-7658-4898-AE80-4C4A43AF14A0}.png" alt="Short-wide elevator" w={632} h={718} />
                            </div>
                        </SubsystemSection>
                        <SubsystemSection title="Elevator Pivot">
                            <p className="font-sans text-sm text-white/50 leading-[1.6]">
                                Planetary gearbox + sprockets (~500:1 gear ratio); main
                                superstructure, worst subsystem (working on update that rethinks
                                plate placement, integrated gearbox, and switching unrealistic
                                0.5in hex shaft with 2in circular shaft).
                            </p>
                        </SubsystemSection>
                        <SubsystemSection title="Hand">
                            <p className="font-sans text-sm text-white/50 leading-[1.6]">
                                Ground-intake any orientation; holds coral in two orientations
                                (L1 vs L2–L4); algae capable.
                            </p>
                            {/* 758×503 → 1.51:1 landscape */}
                            <div className="mt-3 max-w-md">
                                <Img src="/solidworks/{C2655D9F-F9C1-43DC-A1BF-22620025D351}.png" alt="End effector" w={758} h={503} />
                            </div>
                        </SubsystemSection>
                        <FailureBlock
                            label="What's bad about this design"
                            points={[
                                "Overreliance on programming to intake (requires manual indexing to take coral at all), which requires 4 beambreaks and a fairly complex algorithm.",
                                "Pivot\u2019s shaft is an unrealistic 0.5in hex shaft.",
                                "No electronics apart from motors included.",
                                "No climb.",
                            ]}
                        />
                    </PracticeBlock>
                </div>

                {/* ── 1.4  competition result ──────────────────────────── */}
                <PhaseDivider num="1.4" label="COMPETITION.RESULT" />

                <Panel className="mb-14">
                    <PanelBar label="EVAL.FINAL" status="COMPETED" statusColor="emerald" />
                    <div className="p-5 grid grid-cols-1 gap-6 md:grid-cols-[1fr_280px]">
                        <div>
                            <h3 className="font-mono text-base font-bold text-white/85 tracking-tight">
                                Competition robot
                            </h3>
                            <p className="mt-2 font-sans text-sm text-white/50 leading-[1.6]">
                                The design we brought to the World Championship.
                            </p>

                            {/* 1430×691 → 2.07:1 ultra-wide */}
                            <div className="mt-4">
                                <Img
                                    src="/solidworks/{91143FAA-45E0-4EB9-A834-E05C1A57D44C}.png"
                                    alt="Final CAD assembly"
                                    w={1430} h={691}
                                />
                            </div>

                            <SpecBlock
                                title="What held up"
                                items={[
                                    "Demonstrated climb\u2026 at least in our last match.",
                                    "Capable of reliably scoring in L2 and L3.",
                                    "Capable of defense.",
                                ]}
                            />
                        </div>

                        {/* 1080×1436 → 0.75:1 portrait photo */}
                        <Img
                            src="/solidworks/rDdZRNT.jpeg"
                            alt="Competition robot photo"
                            w={1080} h={1436}
                            className="md:self-start"
                        />
                    </div>
                </Panel>

                {/* ════════════════════════════════════════════════════════
            SEASON 2: REBUILT
        ════════════════════════════════════════════════════════ */}
                <SectionDivider num="S2" label="SEASON.REBUILT" />

                <SeasonHeader
                    title="Rebuilt"
                    subtitle="FIRST AGE · 2025-26"
                    records={[
                        "CA District Hueneme Port — 3-8-0, rank 37/42",
                        "CA District San Gabriel Valley — 3-9-0, rank 28/29",
                        "CA Southern State Championship — Engineering Inspiration team only",
                    ]}
                />

                <Panel className="mb-14">
                    <PanelBar label="STATUS.PENDING" />
                    <div className="p-5 flex items-center gap-3">
            <span className="relative inline-block w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-amber-400 animate-pulse" />
              <span className="absolute -inset-[3px] rounded-full bg-amber-400/25 animate-pulse" />
            </span>
                        <span className="font-mono text-sm text-white/50">
              2026 robot will be posted after SoCal Champs.
            </span>
                    </div>
                </Panel>

                {/* ── footer telemetry ──────────────────────────────────── */}
                <div className="border-t border-cyan-400/[0.1] pt-6 pb-10 flex flex-wrap gap-x-7 gap-y-1.5">
                    {[
                        { l: "SYS.STATUS", v: "OPERATIONAL" },
                        { l: "PHASES", v: "4 LOADED" },
                        { l: "PLATFORM", v: "SOLIDWORKS" },
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

function SectionDivider({ num, label }: { num: string; label: string }) {
    return (
        <div className="flex items-center gap-3 mb-7">
            <span className="font-mono text-[13px] font-bold text-cyan-400 tracking-[0.08em] min-w-[26px]">{num}</span>
            <span className="relative inline-block w-2 h-2">
        <span className="absolute inset-0 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,220,255,0.35)]" />
      </span>
            <span className="flex-1 h-px bg-gradient-to-r from-cyan-400/25 to-transparent" />
            <span className="font-mono text-[11px] tracking-[0.14em] text-white/35 uppercase">{label}</span>
        </div>
    );
}

function PhaseDivider({ num, label }: { num: string; label: string }) {
    return (
        <div className="flex items-center gap-3 mb-5 mt-2">
            <span className="font-mono text-[11px] font-bold text-violet-400/70 tracking-[0.08em] min-w-[26px]">{num}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400/50" />
            <span className="flex-1 h-px bg-gradient-to-r from-violet-400/15 to-transparent" />
            <span className="font-mono text-[10px] tracking-[0.14em] text-white/30 uppercase">{label}</span>
        </div>
    );
}

function SeasonHeader({ title, subtitle, records }: { title: string; subtitle: string; records: string[] }) {
    return (
        <div className="mb-8">
            <h2 className="font-mono text-2xl font-extrabold text-white/90 tracking-tight">{title}</h2>
            <div className="mt-1 font-mono text-[11px] tracking-[0.14em] text-cyan-400/70 uppercase">{subtitle}</div>
            <div className="mt-3 space-y-0.5">
                {records.map((r, i) => (
                    <div key={i} className="font-mono text-[11px] leading-[1.6] text-white/45">
                        <span className="text-white/20 mr-2">›</span>{r}
                    </div>
                ))}
            </div>
        </div>
    );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`rounded-lg border border-cyan-400/[0.1] bg-[rgba(10,18,32,0.65)] backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-cyan-400/20 hover:shadow-[0_0_22px_rgba(0,220,255,0.07)] ${className}`}>
            {children}
        </div>
    );
}

function PanelBar({ label, status, statusColor }: { label: string; status?: string; statusColor?: "emerald" | "amber" | "red" }) {
    const dots: Record<string, string> = { emerald: "bg-emerald-400", amber: "bg-amber-400", red: "bg-red-400" };
    const rings: Record<string, string> = { emerald: "bg-emerald-400/25", amber: "bg-amber-400/25", red: "bg-red-400/25" };

    return (
        <div className="flex items-center justify-between gap-2.5 px-5 py-2.5 border-b border-cyan-400/[0.08] bg-black/25">
            <div className="flex items-center gap-2.5">
        <span className="flex gap-[5px]">
          <span className="w-2 h-2 rounded-full bg-[#ff5f57] opacity-70" />
          <span className="w-2 h-2 rounded-full bg-[#febc2e] opacity-70" />
          <span className="w-2 h-2 rounded-full bg-[#28c840] opacity-70" />
        </span>
                <span className="font-mono text-[10px] tracking-[0.14em] text-white/50 uppercase">{label}</span>
            </div>
            {status && statusColor && (
                <span className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.14em] text-white/50 uppercase">
          <span className="relative inline-block w-[6px] h-[6px]">
            <span className={`absolute inset-0 rounded-full ${dots[statusColor]} animate-pulse`} />
            <span className={`absolute -inset-[2px] rounded-full ${rings[statusColor]} animate-pulse`} />
          </span>
                    {status}
        </span>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   IMAGE — uses real w/h so Next.js renders correct aspect ratio
══════════════════════════════════════════════════════════════════ */
function Img({ src, alt, w, h, className = "" }: { src: string; alt: string; w: number; h: number; className?: string }) {
    return (
        <div className={`relative overflow-hidden rounded-md border border-cyan-400/[0.08] bg-black/30 transition-all duration-300 hover:border-cyan-400/25 hover:shadow-[0_0_14px_rgba(0,220,255,0.08)] ${className}`}>
            <Image src={src} alt={alt} width={w} height={h} sizes="(min-width:768px) 50vw, 100vw" className="w-full h-auto object-contain" />
            <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,220,255,0.012)_2px,rgba(0,220,255,0.012)_4px)]" />
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   CONTENT PRIMITIVES
══════════════════════════════════════════════════════════════════ */

function SpecBlock({ title, items }: { title: string; items: string[] }) {
    return (
        <div className="mt-5 pt-4 border-t border-cyan-400/[0.08]">
            <div className="mb-2 flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-cyan-400/60" />
                <span className="font-mono text-[10px] tracking-[0.14em] text-cyan-400/70 uppercase font-bold">{title}</span>
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

function FailureBlock({ label, points }: { label: string; points: string[] }) {
    return (
        <div className="mt-5 rounded-md border border-red-500/20 bg-red-500/[0.04] p-4">
            <div className="mb-2 flex items-center gap-2">
                <TriangleAlert className="h-3.5 w-3.5 text-red-400/80" />
                <span className="font-mono text-[10px] tracking-[0.14em] text-red-400/80 uppercase font-bold">{label}</span>
            </div>
            <div className="space-y-1">
                {points.map((p, i) => (
                    <div key={i} className="font-mono text-[11px] leading-[1.6] text-red-300/50">
                        <span className="text-red-400/30 mr-2">›</span>{p}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   PRACTICE BLOCK (collapsible)
══════════════════════════════════════════════════════════════════ */

interface GalleryItem { src: string; alt: string; w: number; h: number }

function PracticeBlock({ num, title, summary, gallery, children }: { num: string; title: string; summary: string; gallery: GalleryItem[]; children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const id = useId();

    return (
        <Panel>
            <PanelBar label={`PRACTICE.${num}`} />
            <div className="p-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                        <h3 className="font-mono text-base font-bold text-white/85 tracking-tight">{title}</h3>
                        <p className="mt-2 font-sans text-sm text-white/50 leading-[1.6]">{summary}</p>
                        <button
                            type="button"
                            onClick={() => setOpen((v) => !v)}
                            aria-expanded={open}
                            aria-controls={id}
                            className="mt-3 inline-flex items-center gap-2 rounded-md border border-cyan-400/15 bg-cyan-400/[0.04] px-3 py-2 font-mono text-[10px] tracking-[0.12em] text-cyan-400/70 uppercase hover:bg-cyan-400/[0.08] hover:text-cyan-400 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
                        >
                            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
                            {open ? "COLLAPSE" : "EXPAND DETAILS"}
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {gallery.map((item) => (
                            <Img key={item.src} src={item.src} alt={item.alt} w={item.w} h={item.h} />
                        ))}
                    </div>
                </div>

                <div
                    id={id}
                    data-open={open}
                    aria-hidden={!open}
                    className="mt-5 grid grid-rows-[0fr] transition-all duration-300 ease-in-out data-[open=true]:grid-rows-[1fr]"
                >
                    <div className="overflow-hidden">
                        <div className="border-t border-cyan-400/[0.08] pt-4">{children}</div>
                    </div>
                </div>
            </div>
        </Panel>
    );
}

function SubsystemSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="mt-5">
            <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400/50" />
                <h4 className="font-mono text-[11px] tracking-[0.14em] text-violet-400/70 uppercase font-bold">{title}</h4>
            </div>
            <div className="space-y-2">{children}</div>
        </section>
    );
}