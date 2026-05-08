"use client";

import type { Metadata } from "next";
import { useRef, useEffect, useState } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const SKILLS = [
    { label: "Programming", value: "Python, TypeScript, C++, Java" },
    { label: "TypeScript Frameworks", value: "React + Vite, Next.js, Tailwind, Tauri" },
    { label: "Python Libraries", value: "FastAPI, scikit-learn, pandas, TensorFlow" },
    { label: "CAD", value: "SolidWorks, Fusion 360, OnShape" },
    { label: "Hardware", value: "Pixhawk 6X, Raspberry Pi, Arduino" },
    { label: "Tooling", value: "JetBrains IDEs, Bambu Studio, Git, QGroundControl" },
];

const PROJECTS = [
    {
        title: "Aetherius UAV",
        tag: "Autonomy · Flight Software · GCS",
        desc: "Autonomous fixed-wing drone with mission-planning ground control station.",
        href: "/dronescape/uav",
        status: "ACTIVE",
    },
    {
        title: "Team Sprocket Scouting & Analytics",
        tag: "Full-Stack · ML · Data Science",
        desc: "Comprehensive FRC scouting and analytics system with real-time data, offline caching, ELO-based modeling, and performance predictions.",
        href: "/teamsprocket/scouting",
        status: "LEGACY",
    },
    {
        title: "Team Sprocket CAD",
        tag: "Mechanical · CAD",
        desc: "Competition robot designs and assemblies for FRC Team 3473, including drivetrain, intake, and manipulator subsystems.",
        href: "/teamsprocket/cad",
        status: "LEGACY",
    },
];

const CONTACT_LINKS = [
    { label: "PROFESSIONAL EMAIL", value: "me@markwu.org", href: "mailto:me@markwu.org" },
    { label: "PERSONAL EMAIL", value: "mark.wu123454@gmail.com", href: "mailto:mark.wu123454@gmail.com" },
    { label: "GITHUB", value: "github.com/markwu123454", href: "https://github.com/markwu123454" },
    { label: "LINKEDIN", value: "linkedin.com/in/mark-mai-wu", href: "https://www.linkedin.com/in/mark-mai-wu/" },
];

const MENTORS = [
    {
        name: "Mr. Mark Duffield",
        role: "Mentor & Teacher · SWIS Combat Robotics Club",
        note: "Introduced me to robotics, science, and the engineering cycle.",
    },
    {
        name: "Mr. Gabriel Aguilar",
        role: "Lead Mentor · FRC 3473(Team Sprocket)",
        note: "Supported team 3473 with logistics and mentoring, and helped greatly in engineering despite not being technical.",
    },
    {
        name: "Luis De La Cruz",
        role: "Mentor · FRC 3473(Team Sprocket)",
        note: "Supported team 3473 with mentoring and guidance, also guided me in designing the robot and using data from the scouting app.",
    },
];

// ─── REUSABLE PIECES ──────────────────────────────────────────────────────────

function SectionHeader({ index, title }: { index: string; title: string }) {
    return (
        <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
                <div className="h-[7px] w-[7px] rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                <span className="text-xs tracking-[0.25em] text-cyan-400/70 font-mono">{index}</span>
                <div className="flex-1 h-px bg-gradient-to-r from-cyan-400/20 to-transparent" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white/90">{title}</h2>
        </div>
    );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`relative rounded-xl border border-white/[0.08] bg-black/50 backdrop-blur-2xl overflow-hidden ${className}`}>
            {/* Subtle scanlines */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.1)_2px,rgba(255,255,255,0.1)_3px)]"
            />
            {/* Corner accents */}
            <div aria-hidden className="absolute top-0 left-0 w-4 h-4 border-t border-l border-cyan-400/15 rounded-tl-xl pointer-events-none z-10" />
            <div aria-hidden className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-violet-400/15 rounded-br-xl pointer-events-none z-10" />
            <div className="relative z-[1]">{children}</div>
        </div>
    );
}

function TerminalBar({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-white/[0.06]">
            <div className="flex gap-[5px]">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="h-2 w-2 rounded-full bg-white/[0.06] border border-white/[0.1]" />
                ))}
            </div>
            <span className="text-xs tracking-[0.15em] text-white/50 font-mono">{label}</span>
        </div>
    );
}

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold: 0.12 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={[
                "transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5",
                className,
            ].join(" ")}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
    return (
        <main className="bg-black text-neutral-200 min-h-screen">
            <div className="max-w-5xl mx-auto px-6 lg:px-12">

                {/* ── 1. Hero ── */}
                <section className="mt-24 pt-12 pb-20" aria-labelledby="hero-title">
                    <Reveal>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-[7px] w-[7px] rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse" />
                            <span className="text-xs tracking-[0.2em] text-white/50 font-mono">PROFILE.README</span>
                        </div>
                        <h1
                            id="hero-title"
                            className={[
                                "text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1]",
                                "bg-[linear-gradient(90deg,theme(colors.cyan.300),white,theme(colors.violet.300),white,theme(colors.cyan.300))]",
                                "bg-clip-text text-transparent",
                                "[background-size:200%_100%] animate-[bg-pan_8s_linear_infinite]",
                            ].join(" ")}
                        >
                            Mark Wu
                        </h1>
                        <p className="mt-3 text-sm tracking-[0.2em] text-white/50 font-mono">
                            STUDENT ENGINEER · ROBOTICS · SOFTWARE · AVIONICS
                        </p>
                        <p className="mt-6 text-base md:text-lg text-neutral-400 max-w-2xl leading-relaxed">
                            I design autonomous systems and intelligent software for robotics — from full-stack scouting
                            platforms to fixed-wing UAVs.
                        </p>
                    </Reveal>
                </section>

                {/* ── 2. Overview ── */}
                <section className="py-20" aria-labelledby="overview-title">
                    <Reveal>
                        <SectionHeader index="01" title="Overview" />
                    </Reveal>
                    <Reveal delay={100}>
                        <Panel className="p-6 md:p-8">
                            <TerminalBar label="ABOUT.README" />
                            <div className="space-y-4 text-[15px] leading-relaxed text-white/65">
                                <p>
                                    I&#39;m a high-school engineer focused on robotics, embedded systems, and AI-driven autonomy. I lead software and
                                    mechanical design on projects like{" "}
                                    <span className="text-white font-medium">Project Aetherius</span>{" "}
                                    (a fixed-wing UAV with a custom ground control station) and{" "}
                                    <span className="text-white font-medium">Team Sprocket&#39;s</span>{" "}
                                    FRC scouting analytics platform.
                                </p>
                                <p>
                                    My work spans full-stack web development, flight software, and mechanical systems design in SolidWorks and Fusion 360.
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-white/[0.06] flex flex-wrap gap-x-6 gap-y-2 text-xs tracking-[0.12em] font-mono text-white/30">
                                <span>LOCATION: DIAMOND BAR, CA</span>
                                <span>CLASS: 2026</span>
                                <span>FOCUS: ROBOTICS + SOFTWARE</span>
                            </div>
                        </Panel>
                    </Reveal>
                </section>

                {/* ── 3. Skills ── */}
                <section className="py-20" aria-labelledby="skills-title">
                    <Reveal>
                        <SectionHeader index="02" title="Skills & Tools" />
                    </Reveal>
                    <Reveal delay={100}>
                        <Panel className="p-6 md:p-8">
                            <TerminalBar label="STACK.CONFIG" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {SKILLS.map((skill, i) => (
                                    <Reveal key={skill.label} delay={i * 60}>
                                        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 hover:border-cyan-400/20 hover:bg-cyan-400/[0.03] transition-all duration-200">
                                            <div className="text-[11px] tracking-[0.18em] text-cyan-400/70 font-mono mb-1.5">
                                                {skill.label.toUpperCase()}
                                            </div>
                                            <div className="text-sm text-white/70">{skill.value}</div>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                            <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] tracking-[0.12em] font-mono text-white/25">
                                ALWAYS_LEARNING: TRUE
                            </div>
                        </Panel>
                    </Reveal>
                </section>

                {/* ── 4. Projects ── */}
                <section className="py-20" aria-labelledby="projects-title">
                    <Reveal>
                        <SectionHeader index="03" title="Featured Projects" />
                    </Reveal>
                    <div className="space-y-3">
                        {PROJECTS.map((p, i) => (
                            <Reveal key={p.title} delay={i * 80}>
                                <a href={p.href} className="block group">
                                    <Panel className="p-5 md:p-6 hover:border-white/[0.14] transition-colors duration-200">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                            <h3 className="text-base font-semibold text-white/90 group-hover:text-white transition-colors">
                                                {p.title}
                                            </h3>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="text-[11px] tracking-[0.12em] text-white/40 font-mono">{p.tag}</span>
                                                <span className="text-[11px] tracking-[0.15em] px-2 py-0.5 rounded border font-mono text-emerald-300 bg-emerald-400/10 border-emerald-400/25">
                                                    {p.status}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-white/55 leading-relaxed">{p.desc}</p>
                                        <div className="mt-3 text-xs tracking-[0.15em] text-cyan-400/60 font-mono group-hover:text-cyan-300 transition-colors">
                                            OPEN PROJECT →
                                        </div>
                                    </Panel>
                                </a>
                            </Reveal>
                        ))}
                    </div>
                </section>

                {/* ── 5. Engineering Approach ── */}
                <section className="py-20" aria-labelledby="approach-title">
                    <Reveal>
                        <SectionHeader index="04" title="Engineering Approach" />
                    </Reveal>
                    <Reveal delay={100}>
                        <Panel className="p-6 md:p-8">
                            <TerminalBar label="PHILOSOPHY.MD" />
                            <p className="text-[15px] leading-relaxed text-white/65 max-w-2xl">
                                Systems first. Define subsystems and integration, then develop each part in context of the whole.
                                Clean interfaces matter as much as what&#39;s underneath them: a well-crafted system should be
                                legible to the people who maintain it, not just the people who built it.
                            </p>
                        </Panel>
                    </Reveal>
                </section>

                {/* ── 6. Acknowledgments ── */}
                <section className="py-20" aria-labelledby="ack-title">
                    <Reveal>
                        <SectionHeader index="05" title="Special Thanks" />
                    </Reveal>
                    <Reveal delay={80}>
                        <p className="text-sm text-white/45 font-mono tracking-[0.12em] mb-6">
                            {"// people who shaped how i think and build"}
                        </p>
                    </Reveal>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {MENTORS.map((mentor, i) => (
                            <Reveal key={mentor.name} delay={i * 80}>
                                <Panel className="p-5 h-full">
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div>
                                            <div className="text-base font-semibold text-white/90">{mentor.name}</div>
                                            <div className="text-xs tracking-[0.12em] text-white/45 font-mono mt-0.5">{mentor.role}</div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-white/55 leading-relaxed">{mentor.note}</p>
                                </Panel>
                            </Reveal>
                        ))}
                    </div>
                </section>

                {/* ── 7. Contact ── */}
                <section className="py-20 mb-8" aria-labelledby="contact-title">
                    <Reveal>
                        <SectionHeader index="06" title="Get In Touch" />
                    </Reveal>
                    <Reveal delay={100}>
                        <Panel className="max-w-2xl p-6 md:p-8">
                            <TerminalBar label="CONTACT.INIT" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {CONTACT_LINKS.map((link) => (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex flex-col rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 hover:bg-white/[0.05] hover:border-cyan-400/20 transition-all"
                                    >
                                        <span className="text-[11px] tracking-[0.18em] text-white/45 font-mono group-hover:text-white/55 transition-colors">
                                            {link.label}
                                        </span>
                                        <span className="text-sm text-white/70 font-mono mt-1 group-hover:text-white/90 transition-colors truncate">
                                            {link.value}
                                        </span>
                                    </a>
                                ))}
                            </div>
                            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] tracking-[0.12em] font-mono text-white/25">
                                <span>RESPONSE_TIME: &lt; 24H</span>
                                <span>STATUS: ACCEPTING_MESSAGES</span>
                            </div>
                        </Panel>
                    </Reveal>
                </section>

            </div>

            <style>{`
                @keyframes bg-pan {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 200% 50%; }
                }
            `}</style>
        </main>
    );
}