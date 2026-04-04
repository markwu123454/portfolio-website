import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

/* ── fonts: ensure JetBrains Mono + IBM Plex Sans are loaded in layout ── */

export default function SprocketPage() {
    return (
        <>
            {/* ── ambient background ──────────────────────────────────── */}
            <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[#06080d]" />
                {/* breathing grid */}
                <div
                    className="absolute inset-0 animate-[gridPulse_8s_ease-in-out_infinite]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(0,220,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,220,255,0.03) 1px,transparent 1px)",
                        backgroundSize: "56px 56px",
                    }}
                />
                {/* gradient orbs */}
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

            <main className="relative z-[1] mx-auto w-full max-w-6xl px-6 py-16 mt-16">
                {/* ── header ────────────────────────────────────────────── */}
                <header className="mb-14">
                    <div className="font-mono text-[11px] tracking-[0.2em] text-white/40 uppercase mb-4">
                        <span className="text-cyan-400">■</span> FRC — TEAM ARCHIVE
                    </div>

                    <h1 className="font-mono text-[clamp(32px,5vw,52px)] font-extrabold leading-[1.08] tracking-tight animate-[headingGlow_4s_ease-in-out_infinite]">
                        TEAM SPROCKET
                        <br />
                        <span className="bg-gradient-to-br from-cyan-400 to-violet-500 bg-clip-text text-transparent">
              3473
            </span>
                    </h1>

                    <p className="mt-5 font-sans text-[15px] leading-[1.7] text-white/55 max-w-[520px]">
                        A FIRST Robotics Competition team located in Diamond Bar
                        High School, in LA.
                    </p>
                </header>

                {/* ── stat strip ────────────────────────────────────────── */}
                <SectionDivider num="—" label="OVERVIEW" />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-14">
                    <TelemetryStat
                        label="ROLE"
                        value="CAD SUBTEAM"
                        hint="Mainly responsible for competition robot design"
                    />
                    <TelemetryStat
                        label="SEASONS"
                        value="03"
                        hint="FLL City Shaper · FRC ReefScape · FRC Rebuilt"
                    />
                    <TelemetryStat
                        label="COMPETITIONS"
                        value="06"
                        hint="OCR · CVR · Worlds · SoCal · Port Hueneme · SGV"
                    />
                </div>

                {/* ── responsibilities ──────────────────────────────────── */}
                <SectionDivider num="01" label="ROLES.ACTIVE" />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-16">
                    <RoleLink
                        href="/teamsprocket/cad"
                        tag="CAD"
                        title="Robot Design"
                    />
                    <RoleLink
                        href="/teamsprocket/scouting"
                        tag="PROGRAMMING"
                        title="Scouting App"
                    />
                    <RoleCard tag="BUSINESS" title="Outreach Initiatives" />
                    <RoleCard tag="COMPETITION" title="Human Player / Technician" />
                </div>

                {/* ── seasons ───────────────────────────────────────────── */}
                <SectionDivider num="02" label="SEASONS.LOG" />

                <SeasonBlock
                    logo="/2025_logo_animation.gif"
                    title="ReefScape"
                    subtitle="FIRST DIVE · 2024-25"
                    records={[
                        "Orange County Regional — 3-9-0, rank 38/47",
                        "Central Valley Regional — 5-6-0, rank 24/42",
                        "World Champs Hopper — 6-4-0, rank 28/75",
                    ]}
                    offseason="SoCal Showdown — 5-6-0, rank 28/42"
                    awards={[
                        "Regional FIRST Impact Award @ OCR",
                        "Imagery Award in honor of Jack Kamen @ CVR",
                    ]}
                />

                <SeasonBlock
                    logo="/2026_logo_animation.gif"
                    title="Rebuilt"
                    subtitle="FIRST AGE · 2025-26"
                    records={[
                        "CA District Hueneme Port — 3-8-0, rank 37/42",
                        "CA District San Gabriel Valley — 3-9-0, rank 28/29",
                        "CA Southern State Championship — Engineering Inspiration team only",
                    ]}
                    awards={[
                        "District Engineering Inspiration Award @ SGV",
                    ]}
                />

                {/* ── footer telemetry ──────────────────────────────────── */}
                <div className="border-t border-cyan-400/[0.1] pt-6 pb-10 flex flex-wrap gap-x-7 gap-y-1.5 mt-8">
                    {[
                        { l: "TEAM.STATUS", v: "ACTIVE" },
                        { l: "SEASONS.LOADED", v: "3/3" },
                        { l: "PLATFORM", v: "FRC" },
                    ].map((t, i) => (
                        <span
                            key={i}
                            className="font-mono text-[10px] tracking-[0.1em] text-white/35"
                        >
              <span className="text-white/50">{t.l}:</span>{" "}
                            <span className="text-cyan-400">{t.v}</span>
            </span>
                    ))}
                </div>
            </main>
        </>
    );
}

/* ── primitives ──────────────────────────────────────────────────── */

function SectionDivider({ num, label }: { num: string; label: string }) {
    return (
        <div className="flex items-center gap-3 mb-7">
      <span className="font-mono text-[13px] font-bold text-cyan-400 tracking-[0.08em] min-w-[26px]">
        {num}
      </span>
            <span className="relative inline-block w-2 h-2">
        <span className="absolute inset-0 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,220,255,0.35)]" />
      </span>
            <span className="flex-1 h-px bg-gradient-to-r from-cyan-400/25 to-transparent" />
            <span className="font-mono text-[11px] tracking-[0.14em] text-white/35 uppercase">
        {label}
      </span>
        </div>
    );
}

function TelemetryStat({
                           label,
                           value,
                           hint,
                       }: {
    label: string;
    value: string;
    hint?: string;
}) {
    return (
        <div className="rounded-lg border border-cyan-400/[0.1] bg-[rgba(10,18,32,0.65)] backdrop-blur-xl p-5 transition-all duration-300 hover:border-cyan-400/25 hover:shadow-[0_0_18px_rgba(0,220,255,0.08)]">
            <div className="font-mono text-[10px] tracking-[0.16em] text-white/40 uppercase">
                {label}
            </div>
            <div className="mt-1.5 font-mono text-[26px] font-extrabold text-cyan-400 leading-none">
                {value}
            </div>
            {hint && (
                <div className="mt-2 font-sans text-[11px] leading-[1.5] text-white/40">
                    {hint}
                </div>
            )}
        </div>
    );
}

function RoleLink({
                      href,
                      tag,
                      title,
                  }: {
    href: string;
    tag: string;
    title: string;
}) {
    return (
        <Link href={href} className="group block">
            <div className="relative rounded-lg border border-cyan-400/[0.1] bg-[rgba(10,18,32,0.65)] backdrop-blur-xl p-5 pr-12 transition-all duration-300 group-hover:border-cyan-400/30 group-hover:shadow-[0_0_22px_rgba(0,220,255,0.1)]">
                <div className="font-mono text-[10px] tracking-[0.16em] text-cyan-400/70 uppercase">
                    {tag}
                </div>
                <div className="mt-1.5 font-mono text-lg font-bold text-white/90 tracking-tight">
                    {title}
                </div>
                <ArrowUpRight
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400/50 transition-all duration-200 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-[calc(50%+2px)]"
                    aria-hidden
                />
            </div>
        </Link>
    );
}

function RoleCard({ tag, title }: { tag: string; title: string }) {
    return (
        <div className="rounded-lg border border-cyan-400/[0.1] bg-[rgba(10,18,32,0.65)] backdrop-blur-xl p-5 transition-all duration-300 hover:border-cyan-400/20">
            <div className="font-mono text-[10px] tracking-[0.16em] text-violet-400/60 uppercase">
                {tag}
            </div>
            <div className="mt-1.5 font-mono text-lg font-bold text-white/90 tracking-tight">
                {title}
            </div>
        </div>
    );
}

function SeasonBlock({
                         logo,
                         title,
                         subtitle,
                         records,
                         offseason,
                         awards,
                     }: {
    logo: string;
    title: string;
    subtitle: string;
    records: string[];
    offseason?: string;
    awards: string[];
}) {
    return (
        <div className="mb-10 rounded-lg border border-cyan-400/[0.1] bg-[rgba(10,18,32,0.65)] backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-cyan-400/20 hover:shadow-[0_0_28px_rgba(0,220,255,0.06)]">
            {/* terminal bar */}
            <div className="flex items-center gap-2.5 px-5 py-2.5 border-b border-cyan-400/[0.08] bg-black/25">
        <span className="flex gap-[5px]">
          <span className="w-2 h-2 rounded-full bg-[#ff5f57] opacity-70" />
          <span className="w-2 h-2 rounded-full bg-[#febc2e] opacity-70" />
          <span className="w-2 h-2 rounded-full bg-[#28c840] opacity-70" />
        </span>
                <span className="font-mono text-[10px] tracking-[0.14em] text-white/50 uppercase">
          SEASON.LOG
        </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 p-6">
                {/* logo */}
                <div className="shrink-0 rounded-lg border border-white/10 bg-white overflow-hidden">
                    <Image
                        src={logo}
                        alt={`${title} logo`}
                        width={140}
                        height={140}
                        className="block"
                        unoptimized
                    />
                </div>

                {/* info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-mono text-2xl font-extrabold text-white/90 tracking-tight">
                        {title}
                    </h3>
                    <div className="mt-1 font-mono text-[11px] tracking-[0.14em] text-cyan-400/70 uppercase">
                        {subtitle}
                    </div>

                    {/* records */}
                    <div className="mt-4 space-y-1">
                        {records.map((r, i) => (
                            <div
                                key={i}
                                className="font-mono text-[11px] leading-[1.6] text-white/50"
                            >
                                <span className="text-white/25 mr-2">›</span>
                                {r}
                            </div>
                        ))}
                        {offseason && (
                            <div className="font-mono text-[11px] leading-[1.6] text-white/40 italic">
                                <span className="text-white/25 mr-2">›</span>
                                OFF-SEASON: {offseason}
                            </div>
                        )}
                    </div>

                    {/* awards */}
                    {awards.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-cyan-400/[0.08]">
              <span className="font-mono text-[9px] tracking-[0.16em] text-violet-400/60 uppercase">
                AWARDS
              </span>
                            {awards.map((a, i) => (
                                <div
                                    key={i}
                                    className="mt-1 font-mono text-[11px] leading-[1.5] text-violet-300/60"
                                >
                                    {a}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}