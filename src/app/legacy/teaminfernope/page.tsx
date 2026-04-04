"use client";

import {useState, useEffect, useRef} from "react";
import Image from "next/image";
import {TriangleAlert, Lightbulb, ExternalLink} from "lucide-react";

/* ══════════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════════ */
export default function TeamInfernope() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

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

            <main className="relative z-[1] mx-auto w-full max-w-5xl px-6 py-16 mt-16 scroll-smooth">
                {/* ── header ────────────────────────────────────────────── */}
                <header
                    className={`mb-6 transition-all duration-[900ms] ease-out ${
                        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                    }`}
                >
                    <div className="font-mono text-[11px] tracking-[0.2em] text-white/40 uppercase mb-4">
                        <span className="text-cyan-400">■</span> COMBAT ROBOTICS — PROJECT ARCHIVE
                    </div>

                    <div className="flex items-center gap-5 mb-5">
                        {/* logo */}
                        <div
                            className="shrink-0 w-20 h-20 rounded-lg border border-cyan-400/[0.1] bg-black/40 overflow-hidden">
                            <img
                                src="/infernope/image (3).png"
                                alt="Team Infernope Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div>
                            <h1 className="font-mono text-[clamp(30px,4.5vw,48px)] font-extrabold leading-[1.08] tracking-tight animate-[headingGlow_4s_ease-in-out_infinite]">
                                TEAM{" "}
                                <span
                                    className="bg-gradient-to-br from-cyan-400 to-violet-500 bg-clip-text text-transparent">
                  INFERNOPE
                </span>
                            </h1>
                        </div>
                    </div>

                    <p className="font-sans text-[15px] leading-[1.7] text-white/55 max-w-[580px]">
                        A three-year evolution of combat robots — each testing new
                        engineering principles from voltage scaling to modular chassis and
                        energy efficiency. Every robot was a deliberate step in mechanical
                        and electrical design.
                    </p>

                    {/* links */}
                    <div className="mt-5 flex gap-3 flex-wrap">
                        <ExtLink href="https://teaminfernope.wordpress.com/" label="LEGACY SITE"/>
                        <ExtLink href="https://www.youtube.com/@TeamInfernope/featured" label="YOUTUBE"/>
                    </div>
                </header>

                {/* ── timeline nav ──────────────────────────────────────── */}
                <Timeline/>

                {/* ════════════════════════════════════════════════════════
            YEAR 1
        ════════════════════════════════════════════════════════ */}
                <SectionDivider num="Y1" label="YEAR-1" id="year1"/>

                <RobotCard
                    title="Horizontal Spinner"
                    type="Horizontal Spinner"
                    result="Non-functional design"
                    images={["/infernope/Screenshot 2025-10-27 201510.png"]}
                    description="The first attempt at a combat robot. It never operated successfully but marked the start of experimentation with chassis and drive systems."
                    downsides={["No functional drivetrain or weapon.", "Lacked understanding of assembly fundamentals."]}
                    lessons={["Use proper fasteners and alignments.", "Begin testing small subsystems before full assembly."]}
                />

                {/* ════════════════════════════════════════════════════════
            BETWEEN 1 & 2
        ════════════════════════════════════════════════════════ */}
                <SectionDivider num="—" label="BETWEEN-Y1-Y2" id="between1and2"/>

                <RobotCard
                    title="Experimental Shell Spinners"
                    type="Shell Spinner"
                    result="CAD Practice"
                    images={[
                        "/infernope/Screenshot 2025-10-27 210335.png",
                        "/infernope/Screenshot 2025-10-27 205318.png",
                    ]}
                    description="Concept CADs of shell spinners developed between Year 1 and 2, focusing on rotational stability and 3D printing feasibility."
                    downsides={["None were completed due to impractical manufacturing constraints."]}
                    lessons={["Learned part balancing and assembly alignment in Fusion 360 and TinkerCAD."]}
                />

                {/* ════════════════════════════════════════════════════════
            YEAR 2
        ════════════════════════════════════════════════════════ */}
                <SectionDivider num="Y2" label="YEAR-2" id="year2"/>

                <RobotCard
                    title="Thwack!"
                    type="Thwack Bot"
                    result="1-0-2 at end of year double elim."
                    images={[
                        "/infernope/Screenshot 2025-10-27 220111.png",
                        "/infernope/Screenshot 2025-10-27 220153.png",
                    ]}
                    description="A simple thwack bot with interchangeable attachments designed for impact-based defense."
                    downsides={["No active weapon.", "Incorrect gear ratio made the drive too slow for effective hits."]}
                    lessons={["Learned to design 3D-printed wheel hubs with strong mounting interfaces and high traction.", "Learned basic modular design."]}
                />

                {/* ════════════════════════════════════════════════════════
            BETWEEN 2 & 3
        ════════════════════════════════════════════════════════ */}
                <SectionDivider num="—" label="BETWEEN-Y2-Y3" id="between2and3"/>

                <RobotCard
                    title="Doomstone"
                    type="Horizontal Bar Spinner"
                    result="Practice build"
                    images={["/infernope/Screenshot 2025-10-27 215736.png"]}
                    description="A heavy horizontal bar spinner optimized for kinetic impact. The first fully functional robot with an active weapon."
                    downsides={["Slow weapon spin-up due to power limits."]}
                    lessons={["Always test electrical systems individually to prevent damage from miswiring."]}
                />

                <RobotCard
                    title="Vert"
                    type="Dual-Disk Vertical Spinner"
                    result="Practice build"
                    images={["/infernope/Screenshot 2025-10-27 205543.png"]}
                    description="A large dual-blade vertical spinner, emphasizing upward impact and wedge-driven control."
                    downsides={["Hard to balance.", "3D printing defects caused inconsistent wedge performance."]}
                    lessons={["Introduced balancing methods for high-speed weapons and modular wedge interfaces."]}
                />

                {/* ════════════════════════════════════════════════════════
            YEAR 3 SEMESTER 1
        ════════════════════════════════════════════════════════ */}
                <SectionDivider num="Y3.1" label="YEAR-3.SEM-1" id="year3a"/>

                <RobotCard
                    title="300g Bot"
                    type="Vertical Beater Bar (300g)"
                    result="Eliminated at quals"
                    images={[
                        "/infernope/Screenshot 2025-10-27 202823.png",
                        "/infernope/Screenshot 2025-10-27 222440.png",
                    ]}
                    description="A 300g beater bar bot designed for weight efficiency while maintaining striking capability."
                    downsides={["Strong design but unlucky tournament placement."]}
                    lessons={["Learned to reduce print weight and utilize weapon vortex for cooling."]}
                />

                <RobotCard
                    title="90 Degrees"
                    type="Bristledrive Horizontal Disk Spinner (300g)"
                    result="Eliminated at round of 32"
                    images={["/infernope/Screenshot 2025-10-27 202504.png"]}
                    description="A bristle-drive horizontal spinner without wheels, relying on vibrations for movement. Exploited weight bonus for a heavier weapon."
                    downsides={["Extremely slow and hard to control.", "Excessive vibration caused instability."]}
                    lessons={["Gained insight into vibration damping and energy absorption in chassis design."]}
                />

                {/* ════════════════════════════════════════════════════════
            YEAR 3 SEMESTER 2
        ════════════════════════════════════════════════════════ */}
                <SectionDivider num="Y3.2" label="YEAR-3.SEM-2" id="year3b"/>

                <RobotCard
                    title="Good Game"
                    type="Vertical Disk/Bar Spinner"
                    result="1st place @ End-of-Year Tournament"
                    resultHighlight
                    images={[
                        "/infernope/Screenshot 2025-10-27 221114.png",
                        "/infernope/Screenshot 2025-10-27 221553.png",
                        "/infernope/Weixin Image_20251027221936_84_27.jpg",
                        "/infernope/Weixin Image_20251027221938_85_27.jpg",
                    ]}
                    description="My flagship vertical disk spinner with swappable wheels, weapons, and attachments for opponent-specific optimization."
                    downsides={["Underestimated weapon forces led to broken bolts and bearings."]}
                    lessons={["Discovered modular part design and belt-driven isolation for motor protection."]}
                />

                <RobotCard
                    title="MAD"
                    type="Horizontal Bar Spinner"
                    result="2nd place @ End-of-Year Tournament"
                    images={[
                        "/infernope/Screenshot 2025-10-27 215322.png",
                        "/infernope/Weixin Image_20251027221940_87_27.jpg",
                        "/infernope/Screenshot 2025-10-27 222312.png",
                        "/infernope/Screenshot 2025-10-27 215647.png",
                    ]}
                    description="An upgraded horizontal spinner running a 6S system instead of 3S, doubling voltage for higher energy output."
                    downsides={["Faulty belt system limited weapon to 30% power."]}
                    lessons={["Learned multi-voltage integration: 12V drive and 24V weapon systems."]}
                />

                <RobotCard
                    title="Hello Kitty"
                    type="Drum Spinner"
                    result="3rd place @ End-of-Year Tournament"
                    images={["/infernope/Screenshot 2025-10-27 220835.png"]}
                    description="A small egg-beater robot built in 3 days for a rapid design challenge."
                    downsides={["Weapon spun in the wrong direction initially.", "Later failed due to incorrect print orientation."]}
                    lessons={["Experience in designing under time constraints without prototype testing."]}
                />

                <RobotCard
                    title="The Reynolds Pamphlet"
                    type="Hammer Bot"
                    result="4th place @ End-of-Year Tournament"
                    images={["/infernope/Screenshot 2025-10-27 220655.png"]}
                    description="A hammer bot using a torsion spring and sector gear for automatic release. Focused equally on aesthetics and function."
                    downsides={["Torsion spring too weak, causing low strike energy."]}
                    lessons={["Learned brushed DC motor weapon control and integrated gearbox packaging."]}
                />

                <RobotCard
                    title="One and Two"
                    type="Multibot Wedge"
                    result="6th place @ End-of-Year Tournament"
                    images={["/infernope/Screenshot 2025-10-28 124532.png"]}
                    description="Two smaller 225g wedge robots in a multi-bot configuration."
                    downsides={["No active weapon."]}
                    lessons={["Designing multiple independent systems."]}
                />

                <RobotCard
                    title="Riptide"
                    type="Egg Beater (3lb)"
                    result="CAD Practice"
                    images={["/infernope/Screenshot 2025-10-27 223235.png"]}
                    description="A 3lb egg-beater inspired by Riptide (BattleBots) and Ares (NHRL)."
                    downsides={["Never manufactured due to time constraints."]}
                    lessons={["First robot fully designed in Fusion 360 using mixed materials: UHMW and carbon fiber."]}
                />

                {/* ════════════════════════════════════════════════════════
            AFTER YEAR 3
        ════════════════════════════════════════════════════════ */}
                <SectionDivider num="POST" label="AFTER-Y3" id="after3"/>

                <RobotCard
                    title="OP"
                    type="Vertical Disk Spinner"
                    result="Practice Build"
                    images={[
                        "/infernope/Screenshot 2025-10-27 203121.png",
                        "/infernope/img.png",
                    ]}
                    description="A final post-transfer project. Optimized for rotational inertia, storing 200+J of kinetic energy in the weapon."
                    downsides={["Never competed.", "Gyroscopic forces effectively prevent turning at >50% weapon speed."]}
                    lessons={["Learned to use hub motors for drive and implemented rubber band-linked 4WD system."]}
                />

                {/* ── footer telemetry ──────────────────────────────────── */}
                <div className="border-t border-cyan-400/[0.1] pt-6 pb-10 mt-10 flex flex-wrap gap-x-7 gap-y-1.5">
                    {[
                        {l: "ROBOTS.BUILT", v: "12"},
                        {l: "SPAN", v: "3 YEARS"},
                        {l: "BEST.RESULT", v: "1ST PLACE"},
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
   TIMELINE NAV
══════════════════════════════════════════════════════════════════ */

const timelineItems = [
    {id: "year1", label: "Year 1"},
    {id: "between1and2", label: "1 → 2"},
    {id: "year2", label: "Year 2"},
    {id: "between2and3", label: "2 → 3"},
    {id: "year3a", label: "Y3 Sem 1"},
    {id: "year3b", label: "Y3 Sem 2"},
    {id: "after3", label: "After Y3"},
];

function Timeline() {
    return (
        <div className="relative mb-14 mt-8 overflow-x-auto">
            {/* track line */}
            <div
                className="absolute top-[7px] left-0 right-0 h-px bg-gradient-to-r from-cyan-400/20 via-cyan-400/10 to-transparent"/>
            <div className="flex justify-between items-start relative min-w-[600px]">
                {timelineItems.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => {
                            const el = document.getElementById(t.id);
                            if (el) el.scrollIntoView({behavior: "smooth", block: "start"});
                        }}
                        className="group relative flex flex-col items-center text-center flex-1 cursor-pointer focus:outline-none"
                    >
                        <span
                            className="w-[14px] h-[14px] rounded-full border-2 border-cyan-400/30 bg-[#06080d] group-hover:border-cyan-400 group-hover:bg-cyan-400/20 transition-all duration-200 mb-2 shrink-0"/>
                        <span
                            className="font-mono text-[10px] tracking-[0.1em] text-white/35 group-hover:text-white/70 transition-colors duration-200 leading-snug max-w-[6rem] uppercase">
              {t.label}
            </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION DIVIDER
══════════════════════════════════════════════════════════════════ */

function SectionDivider({num, label, id}: { num: string; label: string; id: string }) {
    return (
        <div id={id} className="scroll-mt-24 flex items-center gap-3 mb-7 mt-14">
            <span className="font-mono text-[13px] font-bold text-cyan-400 tracking-[0.08em] min-w-[32px]">{num}</span>
            <span className="relative inline-block w-2 h-2">
        <span className="absolute inset-0 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,220,255,0.35)]"/>
      </span>
            <span className="flex-1 h-px bg-gradient-to-r from-cyan-400/25 to-transparent"/>
            <span className="font-mono text-[11px] tracking-[0.14em] text-white/35 uppercase">{label}</span>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   ROBOT CARD
══════════════════════════════════════════════════════════════════ */

function RobotCard({
                       title,
                       type,
                       result,
                       resultHighlight,
                       images,
                       description,
                       downsides,
                       lessons,
                   }: {
    title: string;
    type: string;
    result: string;
    resultHighlight?: boolean;
    images: string[];
    description: string;
    downsides: string[];
    lessons: string[];
}) {
    const [ref, vis] = useReveal();
    const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

    return (
        <>
            <div
                ref={ref}
                className={`mb-6 transition-all duration-[850ms] ease-out ${
                    vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
            >
                <Panel>
                    <PanelBar label={type.toUpperCase()} result={result} highlight={resultHighlight}/>
                    <div className="p-5">
                        <h3 className="font-mono text-lg font-bold text-white/90 tracking-tight mb-1">
                            {title}
                        </h3>
                        <p className="font-sans text-sm text-white/50 leading-[1.6] max-w-2xl mb-4">
                            {description}
                        </p>

                        {/* images */}
                        <div className={`grid gap-3 mb-5 ${
                            images.length === 1
                                ? "grid-cols-1 max-w-md"
                                : images.length === 2
                                    ? "grid-cols-2"
                                    : images.length === 3
                                        ? "grid-cols-3"
                                        : "grid-cols-2 sm:grid-cols-4"
                        }`}>
                            {images.map((src, i) => (
                                <button
                                    key={i}
                                    onClick={() => setLightboxIdx(i)}
                                    className="relative overflow-hidden rounded-md border border-cyan-400/[0.08] bg-black/30 cursor-pointer transition-all duration-300 hover:border-cyan-400/25 hover:shadow-[0_0_14px_rgba(0,220,255,0.08)] group"
                                >
                                    <img
                                        src={src}
                                        alt={`${title} ${i + 1}`}
                                        className="w-full h-auto object-contain"
                                        loading="lazy"
                                    />
                                    {/* scanline */}
                                    <div
                                        className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,220,255,0.012)_2px,rgba(0,220,255,0.012)_4px)]"/>
                                    {/* index */}
                                    <span
                                        className="absolute top-1.5 left-2 font-mono text-[9px] tracking-[0.1em] text-white/40 bg-black/50 px-1 py-0.5 rounded-sm backdrop-blur-sm">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                                </button>
                            ))}
                        </div>

                        {/* downsides + lessons side by side */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {/* downsides */}
                            <div className="rounded-md border border-red-500/15 bg-red-500/[0.03] p-3">
                                <div className="mb-1.5 flex items-center gap-1.5">
                                    <TriangleAlert className="h-3 w-3 text-red-400/70"/>
                                    <span
                                        className="font-mono text-[9px] tracking-[0.14em] text-red-400/70 uppercase font-bold">
                    DOWNSIDES
                  </span>
                                </div>
                                <div className="space-y-0.5">
                                    {downsides.map((d, i) => (
                                        <div key={i} className="font-mono text-[11px] leading-[1.5] text-red-300/45">
                                            <span className="text-red-400/30 mr-1.5">›</span>{d}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* lessons */}
                            <div className="rounded-md border border-emerald-500/15 bg-emerald-500/[0.03] p-3">
                                <div className="mb-1.5 flex items-center gap-1.5">
                                    <Lightbulb className="h-3 w-3 text-emerald-400/70"/>
                                    <span
                                        className="font-mono text-[9px] tracking-[0.14em] text-emerald-400/70 uppercase font-bold">
                    LESSONS LEARNED
                  </span>
                                </div>
                                <div className="space-y-0.5">
                                    {lessons.map((l, i) => (
                                        <div key={i}
                                             className="font-mono text-[11px] leading-[1.5] text-emerald-300/45">
                                            <span className="text-emerald-400/30 mr-1.5">›</span>{l}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </Panel>
            </div>

            {/* ── lightbox ─────────────────────────────────────────────── */}
            {lightboxIdx !== null && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-zoom-out backdrop-blur-sm"
                    onClick={() => setLightboxIdx(null)}
                >
                    <img
                        src={images[lightboxIdx]}
                        alt={`${title} enlarged`}
                        className="max-h-[90vh] max-w-[90vw] rounded-md border border-cyan-400/20 shadow-[0_0_40px_rgba(0,220,255,0.1)] object-contain"
                    />
                    <span
                        className="absolute top-6 right-6 font-mono text-[10px] tracking-[0.14em] text-white/40 uppercase">
            ESC TO CLOSE
          </span>
                </div>
            )}
        </>
    );
}

/* ══════════════════════════════════════════════════════════════════
   PRIMITIVES
══════════════════════════════════════════════════════════════════ */

function useReveal(): [React.RefObject<HTMLDivElement | null>, boolean] {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    setVisible(true);
                    obs.unobserve(el);
                }
            },
            {threshold: 0.1}
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return [ref, visible];
}

function Panel({children, className = ""}: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={`rounded-lg border border-cyan-400/[0.1] bg-[rgba(10,18,32,0.65)] backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-cyan-400/20 hover:shadow-[0_0_22px_rgba(0,220,255,0.07)] ${className}`}>
            {children}
        </div>
    );
}

function PanelBar({label, result, highlight}: { label: string; result: string; highlight?: boolean }) {
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
            <span className={`font-mono text-[9px] tracking-[0.12em] uppercase ${
                highlight ? "text-emerald-400/80" : "text-white/35"
            }`}>
        {result}
      </span>
        </div>
    );
}

function ExtLink({href, label}: { href: string; label: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-cyan-400/15 bg-cyan-400/[0.04] px-3 py-2 font-mono text-[10px] tracking-[0.12em] text-cyan-400/60 uppercase hover:bg-cyan-400/[0.08] hover:text-cyan-400 transition-colors duration-200"
        >
            <ExternalLink className="h-3 w-3"/>
            {label}
        </a>
    );
}