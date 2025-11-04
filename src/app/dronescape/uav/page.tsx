"use client"

import React, {useState} from "react"
import Image from "next/image"
import {AnimatePresence, motion} from "framer-motion"
import {
    Plane,
    Workflow,
    CalendarClock,
    Image as ImageIcon,
    ArrowRight,
    Cpu,
    RulerDimensionLine,
    Microchip, X,
} from "lucide-react"

export default function AetheriusUAVPage() {
    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-background to-black/60 mt-24">
            {/* ===== Hero Section ===== */}
            <section className="relative min-h-screen flex items-center overflow-hidden border-b border-white/10 bg-background/50 backdrop-blur-xl">
                {/* Background visual anchor */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-[url('/aetherius/dd2f2ce996d5ddd75e8cf7fc5e3e01f1.jpg')] bg-cover bg-center opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-background/60 to-background" />
                </div>

                <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 md:flex-row md:items-center md:justify-between">
                    <div className="max-w-2xl">
                        <motion.h1
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-5xl md:text-6xl font-semibold tracking-tight text-white"
                        >
                            Aetherius UAV
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55, delay: 0.1 }}
                            className="mt-4 text-base md:text-lg text-neutral-300 max-w-xl"
                        >
                            Autonomous fixed-wing platform engineered for safe, fast mission execution.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.15 }}
                            className="mt-6 flex flex-wrap gap-2"
                        >
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex items-center gap-3 mt-8 md:mt-0"
                    >
                        <LinkButton href="/dronescape/gcs" label="See the software half of this project" />
                    </motion.div>
                </div>
            </section>


            {/* ===== Main ===== */}
            <main className="mx-auto w-full max-w-6xl px-4 pb-24">
                <div className="my-12 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                {/* Overview */}
                <motion.div
                    initial={{opacity: 0, y: 10}}
                    whileInView={{opacity: 1, y: 0}}
                    viewport={{once: true, amount: 0.5}}
                    transition={{duration: 0.5}}
                >
                    <SectionHeader
                        title="Aetherius UAV"
                        subtitle="Fixed-wing autonomous platform with modular avionics and rapid iteration."
                        icon={<Plane className="h-5 w-5" />}
                    />
                </motion.div>

                <motion.div
                    initial={{opacity: 0, scale: 0.97}}
                    whileInView={{opacity: 1, scale: 1}}
                    viewport={{once: true, amount: 0.5}}
                    transition={{duration: 0.55, delay: 0.05}}
                    className="mt-8 grid gap-6 md:grid-cols-3"
                >
                    <MetricCard
                        label="Wingspan"
                        value="~1.8 m"
                        note="foam & carbon fiber airframe"
                        icon={<RulerDimensionLine className="h-5 w-5" />}
                    />
                    <MetricCard
                        label="Flight Computer"
                        value="Raspberry Pi 5"
                        note="16 GB RAM"
                        icon={<Cpu className="h-5 w-5" />}
                    />
                    <MetricCard
                        label="Flight Controller"
                        value="Pixhawk 6X"
                        note="M10 GPS + PM02D"
                        icon={<Microchip className="h-5 w-5" />}
                    />
                </motion.div>

                <div className="my-12 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                {/* Architecture + Milestones */}
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <motion.div
                        initial={{opacity: 0, y: 10}}
                        whileInView={{opacity: 1, y: 0}}
                        viewport={{once: true, amount: 0.4}}
                        transition={{duration: 0.55}}
                    >
                        <GlassCard title="Architecture" icon={<Workflow className="h-5 w-5" />}>
                            <ul className="list-disc pl-5 text-sm leading-6 text-muted-foreground">
                                <li>Centralized avionics bay; isolated power and signal.</li>
                                <li>Flight Controller — Pixhawk 6X (MAVLink telemetry).</li>
                                <li>Flight Computer — Raspberry Pi 5 (WebSocket bridge).</li>
                                <li>M10 GPS and PM02D for accurate sensing.</li>
                            </ul>
                        </GlassCard>
                    </motion.div>

                    <motion.div
                        initial={{opacity: 0, scale: 0.97}}
                        whileInView={{opacity: 1, scale: 1}}
                        viewport={{once: true, amount: 0.4}}
                        transition={{duration: 0.6, delay: 0.1}}
                    >
                        <GlassCard title="Milestones" icon={<CalendarClock className="h-5 w-5" />}>
                            <Milestone
                                label="M0 — Foundation"
                                percent={80}
                                bullets={["Build airframe", "Assemble electronics", "Ground sync with GCS"]}
                            />
                            <Milestone
                                label="M1 — FBW & Autonomous Flight"
                                percent={10}
                                bullets={[
                                    "Demonstrate air worthiness",
                                    "Demonstrate autonomous flight",
                                    "Mission planning and execution",
                                ]}
                            />
                            <Milestone
                                label="M2 — Terrain Mapping"
                                percent={0}
                                bullets={[
                                    "LiDAR integration",
                                    "Point cloud generation",
                                    "Automatic flight path generation",
                                ]}
                            />
                            <Milestone
                                label="M3 — AI Integration"
                                percent={0}
                                bullets={[
                                    "Feature identification",
                                    "Landing zone selection",
                                    "Automatic diagnostics",
                                ]}
                            />
                        </GlassCard>
                    </motion.div>
                </div>

                <div className="my-12 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                {/* Gallery */}
                <motion.div
                    initial={{opacity: 0, y: 12}}
                    whileInView={{opacity: 1, y: 0}}
                    viewport={{once: true, amount: 0.5}}
                    transition={{duration: 0.6}}
                >
                    <Gallery
                        title="UAV Gallery"
                        images={[
                            {alt: "Airframe bench setup", src: "/images/aetherius/bench.jpg"},
                            {alt: "Avionics bay WIP", src: "/images/aetherius/avionics.jpg"},
                            {alt: "Wing and servo routing", src: "/images/aetherius/wing.jpg"},
                        ]}
                    />
                </motion.div>

                <TechAndLinks tech={["Pixhawk 6X", "Raspberry Pi 5", "LiDAR (planned)", "Camera (planned)"]} />
            </main>
        </div>
    )
}

/* === Subcomponents === */

function SectionHeader({title, subtitle, icon}: {title: string; subtitle: string; icon?: React.ReactNode}) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div>
                <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">{icon} {title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            </div>
        </div>
    )
}

function MetricCard({label, value, note, icon}: {label: string; value: string; note?: string; icon?: React.ReactNode}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_0_30px_-12px_hsl(var(--primary)/0.5)] backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                {icon} {label}
            </div>
            <div className="mt-1 text-2xl font-semibold">{value}</div>
            {note && <div className="mt-1 text-xs text-muted-foreground">{note}</div>}
        </div>
    )
}

function GlassCard({title, icon, children}: {title: string; icon?: React.ReactNode; children: React.ReactNode}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_0_40px_-16px_hsl(var(--primary)/0.6)]">
            <div className="mb-3 flex items-center gap-2 text-base font-semibold">{icon} {title}</div>
            {children}
        </div>
    )
}

function Milestone({label, percent, bullets}: {label: string; percent: number; bullets?: string[]}) {
    return (
        <div className="mb-5">
            <div className="mb-2 flex items-center justify-between">
                <div className="font-medium">{label}</div>
                <div className="text-xs text-muted-foreground">{percent}%</div>
            </div>
            <ProgressBar value={percent} />
            {bullets && (
                <ul className="mt-2 list-disc pl-5 text-xs text-muted-foreground">
                    {bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                    ))}
                </ul>
            )}
        </div>
    )
}

function ProgressBar({value}: {value: number}) {
    const pct = Math.min(100, Math.max(0, Number(value) || 0))
    const color = "hsl(var(--primary, 220 90% 55%))"
    return (
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
            <div
                className="h-full rounded-full transition-[width] duration-300"
                style={{
                    width: `${pct}%`,
                    backgroundColor: color,
                    boxShadow: `0 0 15px ${color}`,
                }}
            />
        </div>
    )
}

function Gallery({title, images}: { title: string; images: { alt: string; src: string }[] }) {
    const [selected, setSelected] = useState<string | null>(null)
    const [errorSet, setErrorSet] = useState<Set<number>>(new Set())

    return (
        <section className="mt-8">
            <h3 className="mb-3 text-lg font-semibold">{title}</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((img, i) => (
                    <motion.figure
                        key={i}
                        initial={{opacity: 0, scale: 0.96}}
                        whileInView={{opacity: 1, scale: 1}}
                        viewport={{once: true, amount: 0.5}}
                        transition={{duration: 0.4, delay: i * 0.1}}
                        className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl cursor-pointer"
                        onClick={() => setSelected(img.src)}
                    >
                        <div className="aspect-video w-full bg-gradient-to-br from-muted to-background flex items-center justify-center">
                            <Image
                                src={img.src}
                                alt={img.alt}
                                onError={() => setErrorSet(prev => new Set([...prev, i]))}
                                className={`h-full w-full object-cover transition-transform duration-300 hover:scale-105 ${
                                    errorSet.has(i) ? "hidden" : ""
                                }`}
                            />
                            {errorSet.has(i) && (
                                <ImageIcon className="h-8 w-8 text-muted-foreground/60"/>
                            )}
                        </div>
                        <figcaption className="p-2 text-xs text-muted-foreground">{img.alt}</figcaption>
                    </motion.figure>
                ))}
            </div>

            {/* Fullscreen viewer */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setSelected(null)}
                    >
                        <div className="relative max-w-5xl w-full">
                            <Image
                                src={selected}
                                alt="Expanded view"
                                className="w-full h-auto max-h-[90vh] rounded-xl object-contain mx-auto"
                            />
                            <button
                                className="absolute top-3 right-3 rounded-full bg-black/60 p-2 hover:bg-black/80 transition"
                                onClick={() => setSelected(null)}
                            >
                                <X className="h-5 w-5 text-white"/>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    )
}

function TechAndLinks({tech}: {tech: string[]}) {
    return (
        <motion.section
            initial={{opacity: 0, y: 8}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.5}}
            transition={{duration: 0.5}}
            className="mt-10"
        >
            <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <div className="mb-2 text-lg font-semibold">Tech Stack</div>
                <div className="mt-2 flex flex-wrap gap-2">
                    {tech.map((t) => (
                        <span
                            key={t}
                            className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-muted-foreground"
                        >
              {t}
            </span>
                    ))}
                </div>
            </div>
        </motion.section>
    )
}

function LinkButton({href, label}: {href: string; label: string}) {
    return (
        <a
            href={href}
            className="group inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/90 backdrop-blur hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/60"
        >
            {label}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </a>
    )
}
