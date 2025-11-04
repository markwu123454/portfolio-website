"use client"

import React, {useState} from "react"
import {AnimatePresence, motion} from "framer-motion"
import {
    Map,
    Gauge,
    Cpu,
    Radio,
    Wrench,
    LineChart,
    Image as ImageIcon,
    ArrowRight, X,
} from "lucide-react"

export default function AetheriusGCSPage() {
    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-background to-black/60 mt-24">
            {/* ===== Hero Section ===== */}
            <section
                className="relative min-h-screen flex items-center overflow-hidden border-b border-white/10 bg-background/50 backdrop-blur-xl">
                {/* Background visual anchor */}
                <div className="absolute inset-0 -z-10">
                    <div
                        className="absolute inset-0 bg-[url('/aetherius/Screenshot_2025-11-02_164821.png')] bg-cover bg-center opacity-60"/>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-background/60 to-background"/>
                </div>

                <div
                    className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 md:flex-row md:items-center md:justify-between">
                    <div className="max-w-2xl">
                        <motion.h1
                            initial={{opacity: 0, y: 16}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.5}}
                            className="text-5xl md:text-6xl font-semibold tracking-tight text-white"
                        >
                            Aetherius GCS
                        </motion.h1>
                        <motion.p
                            initial={{opacity: 0, y: 16}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.55, delay: 0.1}}
                            className="mt-4 text-base md:text-lg text-neutral-300 max-w-xl"
                        >
                            Mission planning and live telemetry for the Aetherius UAV project.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{opacity: 0, y: 16}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.6, delay: 0.15}}
                        className="grid gap-3 mt-8 md:mt-0"
                    >
                        <LinkButton href="/dronescape/uav" label="See the mechanical half of this project"/>
                        <LinkButton
                            href="https://github.com/markwu123454/aetherius-uav"
                            label="See Repository"
                        />
                    </motion.div>
                </div>
            </section>

            {/* ===== Main ===== */}
            <main className="mx-auto w-full max-w-6xl px-4 pb-24">

                {/* Section divider */}
                <div className="my-12 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"/>

                {/* Overview */}
                <motion.div
                    initial={{opacity: 0, y: 10}}
                    whileInView={{opacity: 1, y: 0}}
                    viewport={{once: true, amount: 0.5}}
                    transition={{duration: 0.5}}
                >
                    <SectionHeader
                        title="Aetherius GCS"
                        subtitle="Full-stack mission planning + live telemetry dashboard. Hosted via LAN, supports multi-display."
                        icon={<Map className="h-5 w-5"/>}
                    />
                </motion.div>

                <motion.div
                    initial={{opacity: 0, scale: 0.97}}
                    whileInView={{opacity: 1, scale: 1}}
                    viewport={{once: true, amount: 0.5}}
                    transition={{duration: 0.55, delay: 0.05}}
                    className="mt-8 grid gap-6 md:grid-cols-3"
                >
                    <MetricCard label="Frontend" value="React + Tailwind" note="Custom UI"
                                icon={<LineChart className="h-5 w-5"/>}/>
                    <MetricCard label="Backend" value="Python FastAPI" note="Mission planning & control"
                                icon={<Cpu className="h-5 w-5"/>}/>
                    <MetricCard label="Protocols" value="MAVLink, WebSocket"
                                note="Pixhawk ↔ Pi ↔ Backend ↔ Frontend"
                                icon={<Radio className="h-5 w-5"/>}/>
                </motion.div>

                <div className="my-12 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"/>

                {/* Feature Cards with tone rhythm */}
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <motion.div
                        initial={{opacity: 0, y: 10}}
                        whileInView={{opacity: 1, y: 0}}
                        viewport={{once: true, amount: 0.4}}
                        transition={{duration: 0.55}}
                    >
                        <GlassCard title="Delivered Features" icon={<Gauge className="h-5 w-5"/>}>
                            <ul className="list-disc pl-5 text-sm leading-6 text-muted-foreground">
                                <li>Mission editor: map + form, reordering, Dubins/straight legs.</li>
                                <li>Network: full end-to-end link from flight controller to frontend.</li>
                                <li>Telemetry: automatic connection and data streaming.</li>
                                <li>Control panel: persistent pre/post-mission command bar.</li>
                            </ul>
                        </GlassCard>
                    </motion.div>

                    <motion.div
                        initial={{opacity: 0, scale: 0.97}}
                        whileInView={{opacity: 1, scale: 1}}
                        viewport={{once: true, amount: 0.4}}
                        transition={{duration: 0.6, delay: 0.1}}
                    >
                        <div
                            className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-xl shadow-[0_0_30px_-12px_hsl(var(--primary)/0.4)]">
                            <div className="mb-3 flex items-center gap-2 text-base font-semibold">
                                <Wrench className="h-5 w-5"/> Roadmap
                            </div>
                            <ul className="list-disc pl-5 text-sm leading-6 text-muted-foreground">
                                <li>Mission upload/download</li>
                                <li>Mission execution</li>
                                <li>LiDAR integration</li>
                            </ul>
                        </div>
                    </motion.div>
                </div>

                {/* Divider */}
                <div className="my-12 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"/>

                {/* Gallery (populated) */}
                <motion.div
                    initial={{opacity: 0, y: 12}}
                    whileInView={{opacity: 1, y: 0}}
                    viewport={{once: true, amount: 0.5}}
                    transition={{duration: 0.6}}
                >
                    <Gallery
                        title="GCS Interface Previews"
                        images={[
                            {alt: "Mission planner UI", src: "/aetherius/Screenshot_2025-11-02_164907.png"},
                            {alt: "Raspberry Pi Sync", src: "/aetherius/8094f91330b25fa234de7f78a18b714c.jpg"},
                            {alt: "Validation overlays", src: "/images/aetherius/gcs-validate.jpg"},
                        ]}
                    />
                </motion.div>
            </main>
        </div>
    )
}

/* === Components === */

function SectionHeader({title, subtitle, icon}: { title: string; subtitle: string; icon?: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div>
                <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                    {icon} {title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            </div>
        </div>
    )
}

function MetricCard({label, value, note, icon}: {
    label: string;
    value: string;
    note?: string;
    icon?: React.ReactNode
}) {
    return (
        <div
            className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_0_30px_-12px_hsl(var(--primary)/0.5)] backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                {icon} {label}
            </div>
            <div className="mt-1 text-2xl font-semibold">{value}</div>
            {note && <div className="mt-1 text-xs text-muted-foreground">{note}</div>}
        </div>
    )
}

function GlassCard({title, icon, children}: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
    return (
        <div
            className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_0_40px_-16px_hsl(var(--primary)/0.6)]">
            <div className="mb-3 flex items-center gap-2 text-base font-semibold">
                {icon} {title}
            </div>
            {children}
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
                            <img
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
                            <img
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

function LinkButton({href, label}: { href: string; label: React.ReactNode }) {
    return (
        <a
            href={href}
            className="group inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/90 backdrop-blur hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/60 w-full"
        >
            <span className="inline-flex items-center gap-2">{label}</span>
            <ArrowRight className="ml-auto h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"/>
        </a>
    )
}
