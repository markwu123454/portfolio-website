"use client";

import { useId, useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";

export default function MusicPage() {
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
                        <span className="text-cyan-400">■</span> CREATIVE — MUSIC
                    </div>

                    <h1 className="font-mono text-[clamp(30px,4.5vw,48px)] font-extrabold leading-[1.08] tracking-tight animate-[headingGlow_4s_ease-in-out_infinite]">
            <span className="bg-gradient-to-br from-cyan-400 to-violet-500 bg-clip-text text-transparent">
              MUSIC
            </span>
                    </h1>

                    <p className="mt-5 font-sans text-[15px] leading-[1.7] text-white/55 max-w-[560px]">
                        Arranging and minimalist composition as structured creative
                        practice. Focus on multi-part remixing, motif-driven systems, and
                        process-based writing.
                    </p>

                    {/* musescore link */}
                    <a
                        href="https://musescore.com/user/50654162"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group mt-6 block"
                    >
                        <Panel className="transition-all duration-300 group-hover:border-cyan-400/30 group-hover:shadow-[0_0_22px_rgba(0,220,255,0.1)]">
                            <div className="p-5 flex items-center justify-between gap-4">
                                <div>
                                    <div className="font-mono text-[10px] tracking-[0.16em] text-cyan-400/60 uppercase">
                                        PUBLISHED SCORES
                                    </div>
                                    <div className="mt-1 font-mono text-lg font-bold text-white/85 tracking-tight">
                                        View All on MuseScore
                                    </div>
                                    <p className="mt-2 font-sans text-sm text-white/45 leading-[1.5]">
                                        Full catalog of published arrangements, remixes, and score uploads.
                                    </p>
                                </div>
                                <ExternalLink className="h-5 w-5 text-cyan-400/40 shrink-0 group-hover:text-cyan-400 transition-colors duration-200" />
                            </div>
                        </Panel>
                    </a>
                </header>

                {/* ════════════════════════════════════════════════════════
            ORIGINAL COMPOSITION
        ════════════════════════════════════════════════════════ */}
                <SectionDivider num="01" label="ORIGINAL.COMPOSITION" />

                <Panel className="mb-14">
                    <PanelBar label="COMPOSITION" />
                    <div className="p-5">
                        <h3 className="font-mono text-lg font-bold text-white/90 tracking-tight">
                            Music for Three Musicians
                        </h3>
                        <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1">
              <span className="font-mono text-[10px] tracking-[0.14em] text-white/40">
                <span className="text-white/55">YEAR:</span>{" "}
                  <span className="text-cyan-400">2024</span>
              </span>
                            <span className="font-mono text-[10px] tracking-[0.14em] text-white/40">
                <span className="text-white/55">DURATION:</span>{" "}
                                <span className="text-cyan-400">2 MIN</span>
              </span>
                            <span className="font-mono text-[10px] tracking-[0.14em] text-white/40">
                <span className="text-white/55">STYLE:</span>{" "}
                                <span className="text-cyan-400">MINIMALIST / PROCESS-BASED</span>
              </span>
                        </div>

                        <ExpandBlock
                            title="Composition Breakdown"
                            summary="Modal system design, phasing structure, additive/subtractive processes, interlocking rhythms."
                        >
                            {/* score embed */}
                            <div className="mb-6">
                                <div className="font-mono text-[10px] tracking-[0.14em] text-violet-400/60 uppercase mb-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400/50" />
                                    SCORE PREVIEW
                                </div>
                                <div className="rounded-md border border-cyan-400/[0.08] overflow-hidden">
                                    <iframe
                                        width="100%"
                                        height="750"
                                        src="https://musescore.com/user/50654162/scores/29403794/embed"
                                        allowFullScreen
                                        allow="autoplay; fullscreen"
                                    />
                                </div>
                            </div>

                            {/* section analysis */}
                            <div className="font-mono text-[10px] tracking-[0.14em] text-violet-400/60 uppercase mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-violet-400/50" />
                                SECTION-BY-SECTION ANALYSIS
                            </div>

                            <div className="space-y-4">
                                {[
                                    {
                                        section: "A",
                                        title: "Additive Buildup",
                                        desc: "Opening system built from C Lydian and C Dorian modal material. Two motifs\u2014one film-derived, one minimalist\u2014are incrementally assembled until the full cell is established.",
                                    },
                                    {
                                        section: "B",
                                        title: "Eighth-Note Phase Shift",
                                        desc: "A second voice shifts one 8th note forward every two measures. Because the motif includes rests and asymmetric durations, each shift creates distinct alignments.",
                                    },
                                    {
                                        section: "C",
                                        title: "Subtractive Filtering",
                                        desc: "At five-eighth offset the outer tones are removed, leaving only internal interlocking notes. Rhythmic identity remains while melodic identity dissolves.",
                                    },
                                    {
                                        section: "D",
                                        title: "Mode Pivot (4/4 \u2192 3/4)",
                                        desc: "Tempo relaxes and meter shifts to 3/4. Notes are individually altered to pivot from Lydian to Dorian while maintaining contour continuity.",
                                    },
                                    {
                                        section: "E",
                                        title: "Interlocking Syncopation",
                                        desc: "Multiple offset copies of a syncopated four-note cell create a composite rhythmic texture, similar to Electric Counterpoint. Vertical sonority arises from rhythmic offset, not block harmony.",
                                    },
                                    {
                                        section: "F",
                                        title: "Micro-Phasing (1/64 Note)",
                                        desc: "A derived motif shifts forward by one 64th note per measure, reverses, then undergoes a final modal pivot back to Lydian briefly before ending in Dorian.",
                                    },
                                ].map((s) => (
                                    <div
                                        key={s.section}
                                        className="rounded-md border border-cyan-400/[0.06] bg-black/20 p-4"
                                    >
                                        <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-[11px] font-bold text-cyan-400/70 tracking-[0.08em]">
                        {s.section}
                      </span>
                                            <span className="font-mono text-sm font-bold text-white/80 tracking-tight">
                        {s.title}
                      </span>
                                        </div>
                                        <p className="font-sans text-sm text-white/45 leading-[1.6]">
                                            {s.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </ExpandBlock>
                    </div>
                </Panel>

                {/* ════════════════════════════════════════════════════════
            ARRANGEMENTS
        ════════════════════════════════════════════════════════ */}
                <SectionDivider num="02" label="ARRANGEMENTS.REMIXES" />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-14">
                    {[
                        { title: "Viva la Vida", artist: "Coldplay", meta: "63 pages \u00b7 04:30 \u00b7 8 parts" },
                        { title: "When Stars and Salt Collide", artist: "The Piano Guys", meta: "49 pages \u00b7 04:05 \u00b7 16 parts" },
                        { title: "It\u2019s Gonna Be OKAY", artist: "The Piano Guys", meta: "43 pages \u00b7 03:44 \u00b7 10 parts" },
                        { title: "Payphone", artist: "Maroon 5", meta: "45 pages \u00b7 03:56 \u00b7 9 parts" },
                    ].map((a) => (
                        <Panel key={a.title}>
                            <div className="p-5">
                                <h3 className="font-mono text-base font-bold text-white/85 tracking-tight">
                                    {a.title}
                                </h3>
                                <div className="mt-0.5 font-sans text-sm text-white/45">{a.artist}</div>
                                <div className="mt-2 font-mono text-[10px] tracking-[0.12em] text-cyan-400/50 uppercase">
                                    {a.meta}
                                </div>
                            </div>
                        </Panel>
                    ))}
                </div>

                {/* ════════════════════════════════════════════════════════
            INSTRUMENTS
        ════════════════════════════════════════════════════════ */}
                <SectionDivider num="03" label="INSTRUMENTS" />

                <Panel className="mb-14">
                    <PanelBar label="BACKGROUND" />
                    <div className="p-5 space-y-3">
                        <p className="font-sans text-sm text-white/50 leading-[1.7] max-w-2xl">
                            I&apos;m familiar with various percussion instruments and played
                            drums for a rock band for four years. I also play clarinet and
                            bass clarinet.
                        </p>
                        <p className="font-sans text-sm text-white/50 leading-[1.7] max-w-2xl">
                            In composition I&apos;m most familiar with instruments in rock
                            bands, string ensembles, and concert bands — mainly because
                            I&apos;ve performed in them for multiple years.
                        </p>
                    </div>
                </Panel>

                {/* ── footer telemetry ──────────────────────────────────── */}
                <div className="border-t border-cyan-400/[0.1] pt-6 pb-10 flex flex-wrap gap-x-7 gap-y-1.5">
                    {[
                        { l: "COMPOSITIONS", v: "1" },
                        { l: "ARRANGEMENTS", v: "4" },
                        { l: "PLATFORM", v: "MUSESCORE" },
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
   PRIMITIVES
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

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`rounded-lg border border-cyan-400/[0.1] bg-[rgba(10,18,32,0.65)] backdrop-blur-xl overflow-hidden ${className}`}>
            {children}
        </div>
    );
}

function PanelBar({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-2.5 px-5 py-2.5 border-b border-cyan-400/[0.08] bg-black/25">
      <span className="flex gap-[5px]">
        <span className="w-2 h-2 rounded-full bg-[#ff5f57] opacity-70" />
        <span className="w-2 h-2 rounded-full bg-[#febc2e] opacity-70" />
        <span className="w-2 h-2 rounded-full bg-[#28c840] opacity-70" />
      </span>
            <span className="font-mono text-[10px] tracking-[0.14em] text-white/50 uppercase">{label}</span>
        </div>
    );
}

function ExpandBlock({
                         title,
                         summary,
                         children,
                     }: {
    title: string;
    summary: string;
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const id = useId();

    return (
        <div className="mt-5">
            <h4 className="font-mono text-sm font-bold text-white/80 tracking-tight">{title}</h4>
            <p className="mt-1 font-sans text-sm text-white/45 leading-[1.6]">{summary}</p>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls={id}
                className="mt-3 inline-flex items-center gap-2 rounded-md border border-cyan-400/15 bg-cyan-400/[0.04] px-3 py-2 font-mono text-[10px] tracking-[0.12em] text-cyan-400/70 uppercase hover:bg-cyan-400/[0.08] hover:text-cyan-400 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
            >
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
                {open ? "COLLAPSE" : "EXPAND"}
            </button>

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
    );
}