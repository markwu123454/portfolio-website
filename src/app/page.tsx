"use client";

import {useState, useEffect, useRef, useCallback} from "react";
import Link from "next/link";
import {ArrowDown} from "lucide-react";

const PROJECTS = [
    {
        id: "frc-robot",
        title: "FRC Competition Robot",
        tag: "ROBOTICS · CAD · MECHANICAL",
        status: "ACTIVE",
        desc: "Competition robot CAD for FRC Team 3473 - Team Sprocket",
        img: "/sprocket/robot_cad_2026.png",
        link: "/teamsprocket/cad",
    },
    {
        id: "scouting",
        title: "SprocketStats Platform",
        tag: "SOFTWARE · FULLSTACK · ANALYTICS",
        status: "ACTIVE",
        desc: "React + FastAPI scouting and analytics platform with live match dashboards.",
        img: "/sprocket/scouting_2026.png",
        link: "/teamsprocket/scouting",
    },
    {
        id: "uav",
        title: "Aetherius UAV",
        tag: "HARDWARE · AVIONICS · MAVLINK",
        status: "ON_HOLD",
        desc: "Custom fixed-wing drone with Raspberry Pi avionics.",
        img: "/aetherius/dd2f2ce996d5ddd75e8cf7fc5e3e01f1.jpg",
        link: "/dronescape/uav",
    },
    {
        id: "gcs",
        title: "Aetherius GCS",
        tag: "SOFTWARE · EMBEDDED SYSTEMS · CONTROL SYSTEMS",
        status: "ON_HOLD",
        desc: "A modern ground control station for mavlink fixed wing.",
        img: "/aetherius/img.png",
        link: "/dronescape/gcs",
    },
    {
        id: "turret",
        title: "Harbinger",
        tag: "SOFTWARE · DIGITAL ELECTRONICS · CONTROL SYSTEMS",
        status: "ACTIVE",
        desc: "A turret using a differential mechanism.",
        img: "/harbinger/img.png",
        link: "/misc/harbinger",
    },
];

const STATUS_CLASS: Record<string, string> = {
    ACTIVE: "text-emerald-300 bg-emerald-400/10 border-emerald-400/25",
    ON_HOLD: "text-amber-300 bg-amber-400/10 border-amber-400/25",
    LEGACY: "text-white/50 bg-white/5 border-white/10",
};

const DURATION = 5000;


/* ═══════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════ */

const SKILLS = [
    {
        category: "LANGUAGES",
        icon: "λ",
        items: ["Python", "TypeScript", "C#", "C++"],
    },
    {
        category: "FRAMEWORKS",
        icon: "⚙",
        items: ["React / Next.js", "FastAPI", "TailwindCSS", "WPF", "Tauri"],
    },
    {
        category: "TOOLS & PLATFORMS",
        icon: "▸",
        items: ["SolidWorks / Fusion 360 / OnShape", "Git / GitHub", "MAVLink"],
    },
    {
        category: "HARDWARE",
        icon: "◈",
        items: ["Raspberry Pi", "Arduino", "ESP32", "3D Printing", "Soldering"],
    },
];

const ACHIEVEMENTS = [
    {
        year: "2025",
        title: "FRC Regional Impact Award",
        desc: "Team 3473 won regional impact award at Orange County Regional.",
        tag: "ROBOTICS",
    },
    {
        year: "2024",
        title: "Combat Robotics Tournament Champion",
        desc: "Led combat robotics team to win our school's end-of-year tournament.",
        tag: "ROBOTICS",
    },
    {
        year: "2025",
        title: "JPL Invention Challenge",
        desc: "Led a team that almost qualified for finals for the NASA JPL Invention Challenge.",
        tag: "LEADERSHIP",
    },
];

const CONTACT_LINKS = [
    {
        label: "GITHUB",
        href: "https://github.com/markwu123454",
        handle: "@markwu123454",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path
                    d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
        ),
    },
    {
        label: "PERSONAL EMAIL",
        href: "mailto:mark.wu123454@gmail.com",
        handle: "mark.wu123454@gmail.com",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                <path
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
            </svg>
        ),
    },
    {
        label: "PROFESSIONAL EMAIL",
        href: "mailto:me@markwu.org",
        handle: "me@markwu.org",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                <path
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
            </svg>
        ),
    },
    {
        label: "LINKEDIN",
        href: "https://www.linkedin.com/in/mark-mai-wu",
        handle: "/in/mark-mai-wu",
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path
                    d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
        ),
    },
];

/* ═══════════════════════════════════════════════════════
   REUSABLE PIECES
   ═══════════════════════════════════════════════════════ */

/** HUD-style section header */
function SectionHeader({label, title}: { label: string; title: string }) {
    return (
        <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
                <div className="h-[7px] w-[7px] rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]"/>
                <span className="text-xs tracking-[0.25em] text-cyan-400/70 font-mono">{label}</span>
                <div className="flex-1 h-px bg-gradient-to-r from-cyan-400/20 to-transparent"/>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white/90">{title}</h2>
        </div>
    );
}

/** Shared panel wrapper that matches the hero cards */
function Panel({
                   children,
                   className = "",
               }: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`relative rounded-xl border border-white/[0.08] bg-black/50 backdrop-blur-2xl overflow-hidden ${className}`}
        >
            {/* Scanlines */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.04]
                [background-image:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.1)_2px,rgba(255,255,255,0.1)_3px)]"
            />
            {/* Corner accents */}
            <div
                aria-hidden
                className="absolute top-0 left-0 w-4 h-4 border-t border-l border-cyan-400/15 rounded-tl-xl pointer-events-none z-10"
            />
            <div
                aria-hidden
                className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-violet-400/15 rounded-br-xl pointer-events-none z-10"
            />
            <div className="relative z-[1]">{children}</div>
        </div>
    );
}

/** Fade-in-on-scroll wrapper */
function Reveal({children, className = "", delay = 0}: {
    children: React.ReactNode;
    className?: string;
    delay?: number
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    obs.disconnect();
                }
            },
            {threshold: 0.15}
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={[
                "transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
                className,
            ].join(" ")}
            style={{transitionDelay: `${delay}ms`}}
        >
            {children}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   SECTION: ABOUT
   ═══════════════════════════════════════════════════════ */

function AboutSection() {
    return (
        <section className="px-6 lg:px-24 py-20" id="about">
            <Reveal>
                <SectionHeader label="01" title="About Me"/>
            </Reveal>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
                <Reveal delay={100}>
                    <Panel className="p-6 md:p-8">
                        {/* Terminal-style header bar */}
                        <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-white/[0.06]">
                            <div className="flex gap-[5px]">
                                {[0, 1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className="h-2 w-2 rounded-full bg-white/[0.06] border border-white/[0.1]"
                                    />
                                ))}
                            </div>
                            <span className="text-xs tracking-[0.15em] text-white/50 font-mono">
                                ABOUT.README
                            </span>
                        </div>

                        <div className="space-y-4 text-[15px] leading-relaxed text-white/65">
                            <p>
                                I&apos;m <span className="text-white/90 font-medium">Mark</span>, a high school
                                student engineer based in{" "}
                                <span className="text-cyan-300/80">Diamond Bar, California</span>. I build things
                                that move — robots, drones, and the software systems that power them.
                            </p>
                            <p>
                                As a core member of{" "}
                                <span className="text-white/90 font-medium">FRC Team 3473 — Team Sprocket</span>,
                                I lead our CAD and software divisions, designing competition robots in SolidWorks
                                and building full-stack analytics tools that give our alliance real-time strategic
                                data.
                            </p>
                            <p>
                                Outside of robotics, I&apos;m developing{" "}
                                <span className="text-white/90 font-medium">Aetherius</span> — a custom fixed-wing
                                UAV platform with Raspberry Pi-based avionics and a purpose-built ground control
                                station. I care about well-crafted systems, clean interfaces, and making complex
                                engineering accessible.
                            </p>
                            <p>
                                I also work on other smaller projects on and off,
                            </p>
                        </div>

                        {/* Bottom readout */}
                        <div
                            className="mt-6 pt-4 border-t border-white/[0.06] flex flex-wrap gap-x-6 gap-y-2 text-xs tracking-[0.12em] font-mono text-white/35">
                            <span>FOCUS: ROBOTICS + SOFTWARE</span>
                            <span>CLASS: 2026</span>
                        </div>
                    </Panel>
                </Reveal>

                {/* Side card: quick stats */}
                <Reveal delay={200}>
                    <Panel className="p-5 flex flex-col justify-between h-full">
                        <div>
                            <div className="text-xs tracking-[0.18em] text-cyan-400/70 font-mono mb-4">
                                QUICK_STATS
                            </div>
                            <div className="space-y-3">
                                {[
                                    {label: "PROJECTS", value: "3", sub: "Active builds"},
                                    {label: "FRC SEASONS", value: "2", sub: "Since junior year"},
                                    {label: "COMMITS", value: "500+", sub: "Open source"},
                                    {label: "COFFEES", value: "0", sub: "Somehow"},
                                ].map((stat) => (
                                    <div key={stat.label} className="flex items-baseline justify-between">
                                        <div>
                                            <span className="text-sm font-mono text-white/50">{stat.label}</span>
                                            <span
                                                className="block text-[11px] text-white/30 font-mono">{stat.sub}</span>
                                        </div>
                                        <span className="text-xl font-extrabold text-white/85 tabular-nums">
                                            {stat.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Decorative telemetry */}
                        <div
                            className="mt-6 pt-3 border-t border-white/[0.06] text-[11px] tracking-[0.12em] text-white/25 font-mono">
                            SYS.UPTIME: 18 YEARS
                        </div>
                    </Panel>
                </Reveal>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════
   SECTION: SKILLS
   ═══════════════════════════════════════════════════════ */

function SkillsSection() {
    return (
        <section className="px-6 lg:px-24 py-20" id="skills">
            <Reveal>
                <SectionHeader label="02" title="Tech Stack"/>
            </Reveal>

            <Reveal delay={100}>
                <Panel className="p-6 md:p-8">
                    {/* Terminal header bar */}
                    <div className="flex items-center gap-2.5 mb-8 pb-4 border-b border-white/[0.06]">
                        <div className="flex gap-[5px]">
                            {[0, 1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="h-2 w-2 rounded-full bg-white/[0.06] border border-white/[0.1]"
                                />
                            ))}
                        </div>
                        <span className="text-xs tracking-[0.15em] text-white/50 font-mono">
                            STACK.CONFIG
                        </span>
                        <div className="flex-1"/>
                        <span className="text-[11px] tracking-[0.15em] text-white/30 font-mono">
                            {SKILLS.reduce((sum, g) => sum + g.items.length, 0)} LOADED
                        </span>
                    </div>

                    <div className="space-y-8">
                        {SKILLS.map((group, gi) => (
                            <Reveal key={group.category} delay={gi * 80}>
                                <div>
                                    {/* Category label */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-base text-cyan-400/60 font-mono leading-none">
                                            {group.icon}
                                        </span>
                                        <span className="text-xs tracking-[0.2em] text-white/50 font-mono">
                                            {group.category}
                                        </span>
                                        <div className="flex-1 h-px bg-white/[0.04]"/>
                                    </div>

                                    {/* Chips */}
                                    <div className="flex flex-wrap gap-2">
                                        {group.items.map((item) => (
                                            <span
                                                key={item}
                                                className="inline-flex items-center px-3.5 py-1.5 rounded-md border border-white/[0.08]
                                                    bg-white/[0.02] text-sm text-white/70 font-mono tracking-wide
                                                    hover:border-cyan-400/25 hover:bg-cyan-400/[0.04] hover:text-white/90
                                                    transition-all duration-200 cursor-default select-none"
                                            >
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>

                    {/* Footer */}
                    <div
                        className="mt-8 pt-4 border-t border-white/[0.06] text-[11px] tracking-[0.12em] font-mono text-white/25">
                        ALWAYS_LEARNING: TRUE
                    </div>
                </Panel>
            </Reveal>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════
   SECTION: ACHIEVEMENTS
   ═══════════════════════════════════════════════════════ */

const TAG_COLORS: Record<string, string> = {
    ROBOTICS: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
    SOFTWARE: "text-cyan-300 bg-cyan-400/10 border-cyan-400/20",
    AVIONICS: "text-violet-300 bg-violet-400/10 border-violet-400/20",
    LEADERSHIP: "text-amber-300 bg-amber-400/10 border-amber-400/20",
};

function AchievementsSection() {
    return (
        <section className="px-6 lg:px-24 py-20" id="achievements">
            <Reveal>
                <SectionHeader label="03" title="Achievements"/>
            </Reveal>

            <div className="relative">
                {/* Vertical timeline line */}
                <div
                    aria-hidden
                    className="absolute left-[19px] md:left-[23px] top-0 bottom-0 w-px bg-gradient-to-b from-cyan-400/20 via-violet-400/15 to-transparent"
                />

                <div className="space-y-4">
                    {ACHIEVEMENTS.map((item, i) => (
                        <Reveal key={i} delay={i * 80}>
                            <div className="flex gap-4 md:gap-6 items-start">
                                {/* Timeline dot */}
                                <div className="relative flex-shrink-0 mt-5">
                                    <div
                                        className="h-[10px] w-[10px] md:h-3 md:w-3 rounded-full border-2 border-cyan-400/40 bg-black"/>
                                    <div
                                        aria-hidden
                                        className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping"
                                        style={{animationDuration: "3s", animationDelay: `${i * 0.5}s`}}
                                    />
                                </div>

                                {/* Card */}
                                <Panel className="flex-1 p-4 md:p-5 group hover:border-white/[0.12] transition-colors">
                                    <div
                                        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs tracking-[0.15em] text-white/35 font-mono">
                                                {item.year}
                                            </span>
                                            <h3 className="text-base font-semibold text-white/90 group-hover:text-white transition-colors">
                                                {item.title}
                                            </h3>
                                        </div>
                                        <span
                                            className={`text-[11px] tracking-[0.15em] px-2 py-0.5 rounded border font-mono flex-shrink-0 w-fit ${
                                                TAG_COLORS[item.tag] ?? "text-white/50 bg-white/5 border-white/10"
                                            }`}
                                        >
                                            {item.tag}
                                        </span>
                                    </div>
                                    <p className="text-sm text-white/55 leading-relaxed">{item.desc}</p>
                                </Panel>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════
   SECTION: CONTACT
   ═══════════════════════════════════════════════════════ */

function ContactSection() {
    return (
        <section className="px-6 lg:px-24 pt-20 pb-32" id="contact">
            <Reveal>
                <SectionHeader label="04" title="Get In Touch"/>
            </Reveal>

            <Reveal delay={100}>
                <Panel className="max-w-2xl mx-auto p-6 md:p-8">
                    {/* Header bar */}
                    <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-white/[0.06]">
                        <div className="flex gap-[5px]">
                            {[0, 1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="h-2 w-2 rounded-full bg-white/[0.06] border border-white/[0.1]"
                                />
                            ))}
                        </div>
                        <span className="text-xs tracking-[0.15em] text-white/50 font-mono">CONTACT.INIT</span>
                    </div>

                    <p className="text-[15px] text-white/60 leading-relaxed mb-8">
                        Interested in collaborating, have a question about my projects, or just want to say hi?
                        I&apos;m always open to connecting with fellow builders.
                    </p>

                    {/* Link cards */}
                    <div className="space-y-3">
                        {CONTACT_LINKS.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-4 rounded-lg border border-white/[0.06] bg-white/[0.02]
                                    px-5 py-4 hover:bg-white/[0.05] hover:border-cyan-400/20 transition-all"
                            >
                                <span className="text-white/40 group-hover:text-cyan-300 transition-colors">
                                    {link.icon}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <span
                                        className="block text-xs tracking-[0.18em] text-white/50 font-mono group-hover:text-white/60 transition-colors">
                                        {link.label}
                                    </span>
                                    <span
                                        className="block text-sm text-white/70 font-mono truncate mt-0.5 group-hover:text-white/90 transition-colors">
                                        {link.handle}
                                    </span>
                                </div>
                                <span
                                    className="text-sm text-cyan-400/50 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all font-mono">
                                    →
                                </span>
                            </a>
                        ))}
                    </div>

                    {/* Footer readout */}
                    <div
                        className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] tracking-[0.12em] font-mono text-white/25">
                        <span>RESPONSE_TIME: &lt; 24H</span>
                        <span>STATUS: ACCEPTING_MESSAGES</span>
                    </div>
                </Panel>
            </Reveal>
        </section>
    );
}

export default function HeroShowcase() {
    const [active, setActive] = useState(0);
    const [transitioning, setTransitioning] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [mounted, setMounted] = useState(false);

    const progressRef = useRef(0);
    const [progressDisplay, setProgressDisplay] = useState(0);
    const rafRef = useRef<number | null>(null);
    const lastTickRef = useRef<number | null>(null);

    useEffect(() => setMounted(true), []);

    const goTo = useCallback(
        (idx: number) => {
            if (idx === active || transitioning) return;
            setTransitioning(true);
            progressRef.current = 0;
            setProgressDisplay(0);
            lastTickRef.current = null;
            setTimeout(() => {
                setActive(idx);
                setTransitioning(false);
            }, 300);
        },
        [active, transitioning]
    );

    useEffect(() => {
        const tick = (now: number) => {
            if (hovered) {
                lastTickRef.current = null;
                rafRef.current = requestAnimationFrame(tick);
                return;
            }
            if (lastTickRef.current === null) lastTickRef.current = now;
            const dt = now - lastTickRef.current;
            lastTickRef.current = now;
            progressRef.current += dt / DURATION;
            setProgressDisplay(Math.min(progressRef.current, 1));

            if (progressRef.current >= 1) {
                progressRef.current = 0;
                setProgressDisplay(0);
                lastTickRef.current = null;
                setTransitioning(true);
                setTimeout(() => {
                    setActive((prev) => (prev + 1) % PROJECTS.length);
                    setTransitioning(false);
                }, 300);
            }
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [hovered]);

    const proj = PROJECTS[active];
    const statusClass = STATUS_CLASS[proj.status] ?? STATUS_CLASS.LEGACY;

    return (
        <>
            <section
                className="relative mt-24 flex min-h-[calc(100svh-6rem)] flex-col px-6 lg:px-24 pb-4"
                aria-labelledby="hero-heading"
            >
                <div
                    className={[
                        "w-full flex-1 flex flex-col transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
                        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                    ].join(" ")}
                >
                    {/* ════════ Side-by-side: identity + showcase ════════ */}
                    <div className="hero-layout flex-1 flex flex-col lg:flex-row lg:items-stretch gap-3 pt-4">

                        {/* ─── Left column: identity ─── */}
                        <div
                            className="relative lg:w-[280px] xl:w-[300px] flex-shrink-0 flex flex-col
                        rounded-xl border border-white/[0.08] bg-black/50 backdrop-blur-2xl overflow-hidden"
                        >
                            {/* Scanlines (matching showcase) */}
                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-0 opacity-[0.04]
                            [background-image:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.1)_2px,rgba(255,255,255,0.1)_3px)]"
                            />

                            <div className="relative z-[1] flex flex-col justify-between h-full p-5 lg:p-6">
                                {/* Top: identity info */}
                                <div>
                                    {/* Status dot */}
                                    <div className="mb-4 flex items-center gap-2.5">
                                        <div
                                            className="h-[7px] w-[7px] rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse"/>
                                        <span className="text-xs tracking-[0.2em] text-white/60 font-mono">
                                        SYSTEMS ONLINE
                                    </span>
                                    </div>

                                    {/* Name */}
                                    <h1
                                        id="hero-heading"
                                        className={[
                                            "text-3xl xl:text-4xl font-extrabold tracking-tight leading-[1.1]",
                                            "bg-[linear-gradient(90deg,theme(colors.cyan.300),white,theme(colors.violet.300),white,theme(colors.cyan.300))]",
                                            "bg-clip-text text-transparent",
                                            "[background-size:200%_100%] animate-[bg-pan_8s_linear_infinite]",
                                            "drop-shadow-[0_0_24px_rgba(167,139,250,0.25)]",
                                        ].join(" ")}
                                    >
                                        Hi! I&apos;m Mark.
                                    </h1>

                                    <p className="mt-1.5 text-[13px] tracking-[0.15em] text-white/70 font-mono">
                                        STUDENT ENGINEER
                                    </p>

                                    {/* Separator */}
                                    <div className="my-4 h-px bg-white/[0.06]"/>

                                    {/* Discipline list */}
                                    <div className="space-y-2">
                                        {["ROBOTICS", "SOFTWARE", "AVIONICS", "CAD"].map((tag) => (
                                            <div key={tag} className="flex items-center gap-2.5">
                                                <div className="h-1 w-1 rounded-full bg-cyan-400/40"/>
                                                <span className="text-xs tracking-[0.15em] text-white/60 font-mono">
                                                {tag}
                                            </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="my-4 h-px bg-white/[0.06]"/>

                                    {/* Key-value readouts */}
                                    <div className="space-y-1.5 text-xs tracking-[0.12em] font-mono">
                                        {[
                                            ["STATUS", "IN HIGHSCHOOL"],
                                            ["PROJECTS", `${PROJECTS.length} FEATURED`],
                                            ["LOCATION", "DIAMOND BAR, CA"],
                                        ].map(([k, v]) => (
                                            <div key={k} className="flex justify-between">
                                                <span className="text-white/50">{k}</span>
                                                <span className="text-white/70">{v}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Bottom: external links */}
                                <div className="mt-5 lg:mt-0 flex flex-col gap-1.5">
                                    {[
                                        {
                                            label: "SOURCE_REPO",
                                            href: "https://github.com/markwu123454",
                                            external: true,
                                        },
                                        {
                                            label: "CONTACT",
                                            href: "/contact",
                                            external: false,
                                        },
                                    ].map((link) => (
                                        <a
                                            key={link.label}
                                            href={link.href}
                                            {...(link.external && {target: "_blank", rel: "noopener noreferrer"})}
                                            className="group flex items-center justify-between rounded-md border border-white/[0.06]
                                    bg-white/[0.02] px-3 py-2 hover:bg-white/[0.05] transition"
                                        >
                                    <span className="text-xs tracking-[0.15em] text-white/60 font-mono">
                                {link.label}
                                    </span>
                                            <span
                                                className="text-xs text-cyan-400/70 group-hover:text-cyan-300 transition font-mono">
                                    →
                                    </span>
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Corner accent */}
                            <div aria-hidden
                                 className="absolute top-0 left-0 w-4 h-4 border-t border-l border-cyan-400/15 rounded-tl-xl pointer-events-none"/>
                            <div aria-hidden
                                 className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-violet-400/15 rounded-br-xl pointer-events-none"/>
                        </div>

                        {/* ─── Right column: showcase + tiles ─── */}
                        <div className="flex-1 flex flex-col min-w-0 min-h-0 gap-2">

                            {/* Showcase frame */}
                            <div
                                onMouseEnter={() => setHovered(true)}
                                onMouseLeave={() => setHovered(false)}
                                className="relative flex-1 flex flex-col rounded-xl border border-white/[0.08] bg-black/50 backdrop-blur-2xl overflow-hidden"
                            >
                                {/* Scanlines */}
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute inset-0 z-[5] opacity-[0.04] [background-image:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.1)_2px,rgba(255,255,255,0.1)_3px)]"
                                />

                                {/* Top bar */}
                                <div
                                    className="relative z-[6] flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-black/60">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex gap-[5px]">
                                            {[0, 1, 2].map((i) => (
                                                <div
                                                    key={i}
                                                    className="h-2 w-2 rounded-full bg-white/[0.06] border border-white/[0.1]"
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs tracking-[0.15em] text-white/50 font-mono">
                                        FEATURED_PROJECTS.VIEW
                                    </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                    <span className="text-[11px] tracking-[0.15em] text-white/45 font-mono">
                                        {String(active + 1).padStart(2, "0")}/{String(PROJECTS.length).padStart(2, "0")}
                                    </span>
                                        <span
                                            className={`text-[11px] tracking-[0.15em] px-2 py-0.5 rounded border font-mono ${statusClass}`}
                                        >
                                        {proj.status.replace("_", " ")}
                                    </span>
                                    </div>
                                </div>

                                {/* Image + info */}
                                <div
                                    className="showcase-inner relative flex-1 grid grid-cols-1 md:grid-cols-[1fr_260px]">
                                    {/* Image */}
                                    <div className="relative overflow-hidden">
                                        {PROJECTS.map((p, i) => (
                                            <div
                                                key={p.id}
                                                className="absolute inset-0 bg-cover bg-center transition-all duration-500 ease-out"
                                                style={{
                                                    backgroundImage: `url(${p.img})`,
                                                    opacity: i === active && !transitioning ? 1 : 0,
                                                    transform:
                                                        i === active && !transitioning
                                                            ? "scale(1)"
                                                            : "scale(1.04)",
                                                }}
                                            />
                                        ))}

                                        <div
                                            className="absolute inset-0 bg-gradient-to-t from-[rgba(6,8,12,0.7)] to-transparent z-[2]"/>

                                        {/* Image corner brackets */}
                                        <div aria-hidden
                                             className="absolute top-3 left-3 z-[3] h-4 w-4 border-t border-l border-cyan-400/30"/>
                                        <div aria-hidden
                                             className="absolute bottom-3 left-3 z-[3] h-4 w-4 border-b border-l border-cyan-400/30"/>
                                        <div aria-hidden
                                             className="absolute top-3 right-3 z-[3] h-4 w-4 border-t border-r border-cyan-400/30 md:hidden"/>
                                        <div aria-hidden
                                             className="absolute bottom-3 right-3 z-[3] h-4 w-4 border-b border-r border-violet-400/30 md:hidden"/>

                                        {/* Telemetry */}
                                        <div
                                            className="absolute bottom-4 left-4 z-[3] flex gap-4 text-[11px] tracking-[0.12em] text-white/40 font-mono select-none">
                                            <span>IDX:{String(active).padStart(3, "0")}</span>
                                            <span>PRG:{String(Math.round(progressDisplay * 100)).padStart(3, "0")}%</span>
                                            <span>{hovered ? "▮▮ HOLD" : "▶ CYCLE"}</span>
                                        </div>
                                    </div>

                                    {/* Info panel */}
                                    <div
                                        className="relative z-[6] flex flex-col justify-between p-5 border-t md:border-t-0 md:border-l border-white/[0.06] bg-black/30">
                                        <div>
                                            <div
                                                className="text-[11px] tracking-[0.18em] text-cyan-400/80 font-mono mb-2">
                                                {proj.tag}
                                            </div>
                                            <h2
                                                className={[
                                                    "text-xl font-semibold text-white/90 leading-tight transition-all duration-300",
                                                    transitioning
                                                        ? "opacity-0 translate-y-2"
                                                        : "opacity-100 translate-y-0",
                                                ].join(" ")}
                                            >
                                                {proj.title}
                                            </h2>
                                            <p
                                                className={[
                                                    "mt-3 text-sm text-white/65 leading-relaxed transition-all duration-300 delay-[50ms]",
                                                    transitioning
                                                        ? "opacity-0 translate-y-1.5"
                                                        : "opacity-100 translate-y-0",
                                                ].join(" ")}
                                            >
                                                {proj.desc}
                                            </p>
                                        </div>

                                        <Link
                                            href={proj.link}
                                            className={[
                                                "group mt-4 inline-flex items-center gap-2 text-[13px] tracking-[0.15em] text-cyan-300 hover:text-cyan-200 font-mono transition-all",
                                                transitioning ? "opacity-0" : "opacity-100",
                                            ].join(" ")}
                                        >
                                            OPEN PROJECT
                                            <svg
                                                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M5 12h14M12 5l7 7-7 7"/>
                                            </svg>
                                        </Link>
                                    </div>
                                </div>

                                {/* Bottom bar */}
                                <div
                                    className="relative z-[6] flex items-center gap-3 px-4 py-2.5 border-t border-white/[0.06] bg-black/60">
                                    <div className="flex gap-1">
                                        {PROJECTS.map((p, i) => (
                                            <button
                                                key={p.id}
                                                onClick={() => goTo(i)}
                                                className={[
                                                    "h-1 rounded-full border-none cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                                                    i === active
                                                        ? "w-7 bg-gradient-to-r from-cyan-400 to-violet-400"
                                                        : "w-3 bg-white/[0.12] hover:bg-white/20",
                                                ].join(" ")}
                                                aria-label={`Show ${p.title}`}
                                            />
                                        ))}
                                    </div>

                                    <div className="flex-1 h-0.5 bg-white/[0.06] rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${progressDisplay * 100}%`,
                                                background: hovered
                                                    ? "rgba(255,255,255,0.15)"
                                                    : "rgba(34,211,238,0.35)",
                                            }}
                                        />
                                    </div>

                                    <div className="flex gap-1">
                                        {([-1, 1] as const).map((dir) => (
                                            <button
                                                key={dir}
                                                onClick={() =>
                                                    goTo(
                                                        (active + dir + PROJECTS.length) % PROJECTS.length
                                                    )
                                                }
                                                className="h-7 w-7 rounded-md border border-white/10 bg-white/[0.02] text-white/40 hover:border-cyan-400/30 hover:text-cyan-300 flex items-center justify-center text-xs cursor-pointer transition-all"
                                            >
                                                {dir === -1 ? "←" : "→"}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Frame accents */}
                                <div aria-hidden
                                     className="absolute top-0 left-0 w-5 h-5 border-t border-l border-cyan-400/20 rounded-tl-xl z-10 pointer-events-none"/>
                                <div aria-hidden
                                     className="absolute bottom-0 right-0 w-5 h-5 border-b border-r border-violet-400/20 rounded-br-xl z-10 pointer-events-none"/>
                            </div>

                            {/* Quick-nav tiles */}
                            <div
                                className="showcase-tiles grid gap-2"
                                style={{
                                    gridTemplateColumns: `repeat(${Math.min(PROJECTS.length, 4)}, 1fr)`,
                                }}
                            >
                                {PROJECTS.map((p, i) => (
                                    <button
                                        key={p.id}
                                        onClick={() => goTo(i)}
                                        className={[
                                            "rounded-lg border px-3 py-2 text-left cursor-pointer transition-all duration-200 font-mono",
                                            i === active
                                                ? "border-cyan-400/20 bg-cyan-400/5"
                                                : "border-white/[0.06] bg-black/30 hover:bg-white/[0.03]",
                                        ].join(" ")}
                                    >
                                        <div
                                            className={[
                                                "text-xs font-medium tracking-[0.08em] truncate transition-colors",
                                                i === active ? "text-white/90" : "text-white/60",
                                            ].join(" ")}
                                        >
                                            {p.title}
                                        </div>
                                        <div
                                            className={[
                                                "text-[10px] tracking-[0.15em] mt-0.5 transition-colors",
                                                i === active ? "text-cyan-400/60" : "text-white/40",
                                            ].join(" ")}
                                        >
                                            {p.tag.split("·")[0].trim()}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ════════ Scroll hint ════════ */}
                    <button
                        onClick={() => {
                            document.getElementById("next")?.scrollIntoView({behavior: "smooth"});
                            history.replaceState(null, "", " ");
                        }}
                        className="group mx-auto mt-4 mb-2 flex items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                        aria-label="Scroll to content"
                    >
                    <span className="relative inline-flex h-10 w-10 items-center justify-center">
                        <span className="absolute inset-0 rounded-full border border-white/20 animate-pulse"/>
                        <ArrowDown
                            className="h-5 w-5 text-white/50 group-hover:text-white/80 animate-bounce transition"/>
                    </span>
                    </button>
                </div>

                {/* ════════ Responsive ════════ */}
                <style>{`
            @media (max-width: 1024px) {
            .hero-layout {
            flex-direction: column !important;
            }
          .hero-layout > div:first-child {
            width: 100% !important;
          }
          .showcase-inner {
            grid-template-columns: 1fr !important;
          }
          .showcase-tiles {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        `}</style>
            </section>
            <AboutSection/>
            <SkillsSection/>
            <AchievementsSection/>
            <ContactSection/>
        </>
    );
}