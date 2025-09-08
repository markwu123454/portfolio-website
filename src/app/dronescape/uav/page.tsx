"use client";

import React from "react";
import {motion} from "framer-motion";
import {
    Plane,
    Workflow,
    CalendarClock,
    LineChart,
    CircuitBoard,
    Image as ImageIcon,
    ArrowRight, Cpu, RulerDimensionLine, Microchip
} from "lucide-react";

export default function AetheriusUAVPage() {
    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-background to-black/50 mt-24">
            <section className="relative overflow-hidden border-b border-white/5 bg-background/40 backdrop-blur-xl">
                {/* neon aura */}
                <div
                    className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,hsl(var(--primary)/0.25)_0%,transparent_70%)]"/>
                <div
                    className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-14 md:flex-row md:items-center md:justify-between">
                    <div className="max-w-2xl">
                        <motion.h1
                            initial={{opacity: 0, y: 8}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.4}}
                            className="text-3xl font-semibold tracking-tight md:text-4xl"
                        >
                            Aetherius UAV
                        </motion.h1>
                        <motion.p
                            initial={{opacity: 0, y: 8}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.45, delay: 0.05}}
                            className="mt-3 text-muted-foreground"
                        >
                            Autonomous fixed‑wing platform engineered for safe, fast mission execution.
                        </motion.p>
                        <motion.div
                            initial={{opacity: 0, y: 8}}
                            whileInView={{opacity: 1, y: 0}}
                            viewport={{once: true, amount: 0.5}}
                            transition={{duration: 0.5}}
                            className="mt-5 flex flex-wrap gap-2">
                            <BadgePill label="Avionics‑first" icon={<CircuitBoard className="h-3.5 w-3.5"/>}/>
                            <BadgePill label="Data‑oriented" icon={<LineChart className="h-3.5 w-3.5"/>}/>
                        </motion.div>
                    </div>
                    <motion.div
                        initial={{opacity: 0, y: 8}}
                        whileInView={{opacity: 1, y: 0}}
                        viewport={{once: true, amount: 0.5}}
                        transition={{duration: 0.5}}
                        className="flex items-center gap-3">
                        <LinkButton href="/dronescape/gcs" label="See the software half of this project"/>
                    </motion.div>
                </div>
            </section>
            <main className="mx-auto w-full max-w-6xl px-4 pb-24">
                <motion.div
                    initial={{opacity: 0, y: 8}}
                    whileInView={{opacity: 1, y: 0}}
                    viewport={{once: true, amount: 0.5}}
                    transition={{duration: 0.5}}>
                    <SectionHeader
                        title="Aetherius UAV"
                        subtitle="Fixed‑wing autonomous platform with modular avionics and rapid iteration."
                        icon={<Plane className="h-5 w-5"/>}
                    />
                </motion.div>

                <motion.div
                    initial={{opacity: 0, y: 8}}
                    whileInView={{opacity: 1, y: 0}}
                    viewport={{once: true, amount: 0.5}}
                    transition={{duration: 0.5}} className="mt-6 grid gap-6 md:grid-cols-3">
                    <MetricCard label="Wingspan" value="~1.8 m" note="foam & carbon fiber airframe"
                                icon={<RulerDimensionLine className="h-5 w-5"/>}/>
                    <MetricCard label="Flight Computer" value="Raspberry Pi 5" note="16GB RAM"
                                icon={<Cpu className="h-5 w-5"/>}/>
                    <MetricCard label="Flight Controller" value="PixHawk 6X" note="M10 GPS + PM02D"
                                icon={<Microchip className="h-5 w-5"/>}/>
                </motion.div>

                <motion.div
                    initial={{opacity: 0, y: 8}}
                    whileInView={{opacity: 1, y: 0}}
                    viewport={{once: true, amount: 0.5}}
                    transition={{duration: 0.5}}
                    className="mt-6 grid gap-6 md:grid-cols-2">
                    <GlassCard title="Architecture" icon={<Workflow className="h-5 w-5"/>}>
                        <ul className="list-disc pl-5 text-sm leading-6 text-muted-foreground">
                            <li>Centralized avionics bay; isolated power/signal.</li>
                            <li>Flight Controller: PixHawk 6X; MAVLink telemetry.</li>
                            <li>Flight Computer: Raspberry Pi 5; Websocket.</li>
                            <li>M10 GPS; PM02D power sensing.</li>
                        </ul>
                    </GlassCard>

                    <GlassCard title="Milestones" icon={<CalendarClock className="h-5 w-5"/>}>
                        <Milestone
                            label="M0 — Foundation"
                            percent={80}
                            bullets={["Build Airframe", "Build and validate electronics", "Ground sync with GCS"]}
                        />
                        <Milestone
                            label="M1 — FBW & autonomous flight"
                            percent={10}
                            bullets={["Demonstrate air worthiness", "Demonstrate autonomous flight", "Mission planning and execution"]}
                        />
                        <Milestone
                            label="M2 — Terrain Mapping"
                            percent={0}
                            bullets={["LiDAR integration", "Point cloud generation", "Automatic flight path generation"]}
                        />
                        <Milestone
                            label="M3 — AI Integration"
                            percent={0}
                            bullets={["Feature identification", "Landing zone identification", "Automatic Diagnostics"]}
                        />
                    </GlassCard>
                </motion.div>

                {/*<Gallery
                    title="UAV Gallery"
                    images={[
                        {alt: "Airframe bench setup", src: "/images/aetherius/bench.jpg"},
                        {alt: "Avionics bay WIP", src: "/images/aetherius/avionics.jpg"},
                        {alt: "Wing & servo routing", src: "/images/aetherius/wing.jpg"},
                    ]}
                />*/}

                <TechAndLinks
                    tech={["Pixhawk 6X", "Raspberry Pi", "LiDAR (planned)", "Camera (planned)"]}
                />
            </main>
        </div>
    );
}

function SectionHeader({title, subtitle, icon}: { title: string; subtitle: string; icon?: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div>
                <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">{icon} {title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            </div>
        </div>
    );
}

function MetricCard({label, value, note, icon}: {
    label: string;
    value: string;
    note?: string;
    icon?: React.ReactNode
}) {
    return (
        <div
            className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-xl [box-shadow:0_0_30px_-12px_hsl(var(--primary)/0.5)]">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">{icon} {label}</div>
            <div className="mt-1 text-2xl font-semibold">{value}</div>
            {note && <div className="mt-1 text-xs text-muted-foreground">{note}</div>}
        </div>
    );
}

function GlassCard({title, icon, children}: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
    return (
        <div
            className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.04)] [box-shadow:0_0_40px_-16px_hsl(var(--primary)/0.6)]">
            <div className="mb-3 flex items-center gap-2 text-base font-semibold">{icon} {title}</div>
            {children}
        </div>
    );
}

function Milestone({label, percent, bullets}: { label: string; percent: number; bullets?: string[] }) {
    return (
        <div className="mb-5">
            <div className="mb-2 flex items-center justify-between">
                <div className="font-medium">{label}</div>
                <div className="text-xs text-muted-foreground">{percent}%</div>
            </div>
            <ProgressBar value={percent}/>
            {bullets && (
                <ul className="mt-2 list-disc pl-5 text-xs text-muted-foreground">
                    {bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function ProgressBar({ value }: { value: number }) {
    const pct = Math.min(100, Math.max(0, Number(value) || 0));
    const color = 'hsl(var(--primary, 220 90% 55%))'; // fallback if --primary missing
    return (
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
            <div
                className="h-full rounded-full transition-[width] duration-300"
                style={{
                    width: `${pct}%`,
                    backgroundColor: color,
                    boxShadow: `0 0 15px ${color}`
                }}
            />
        </div>
    );
}


function Gallery({title, images}: { title: string; images: { alt: string; src: string }[] }) {
    return (
        <section className="mt-10">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold">{title}</h3>
                <div className="text-xs text-muted-foreground">Place screenshots/photos
                    in <code>/public/images/aetherius</code></div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((img, i) => (
                    <figure
                        key={i}
                        className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
                    >
                        <div
                            className="aspect-video w-full bg-gradient-to-br from-muted to-background flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground"/>
                        </div>
                        <figcaption className="p-2 text-xs text-muted-foreground">{img.alt}</figcaption>
                    </figure>
                ))}
            </div>
        </section>
    );
}

function TechAndLinks({tech}: { tech: string[] }) {
    return (
        <section className="mt-10">
            <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"/>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <div className="mb-2 text-lg font-semibold">Tech Stack</div>
                <div className="mt-2 flex flex-wrap gap-2">
                    {tech.map((t) => (
                        <span key={t}
                              className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-muted-foreground">{t}</span>
                    ))}
                </div>
            </div>
        </section>
    );
}

function BadgePill({label, icon}: { label: string; icon?: React.ReactNode }) {
    return (
        <span
            className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-muted-foreground backdrop-blur">
      {icon} {label}
    </span>
    );
}

function LinkButton({href, label}: { href: string; label: string }) {
    return (
        <a
            href={href}
            className="group inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/90 backdrop-blur hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/60"
        >
            {label}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"/>
        </a>
    );
}
