"use client";

import React from "react";
import {motion} from "framer-motion";
import {
    Map,
    Gauge,
    Cpu,
    Radio,
    Wrench,
    LineChart,
    Image as ImageIcon,
    ArrowRight, Github
} from "lucide-react";

export default function AetheriusGCSPage() {
    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-background to-black/50 mt-24">
            <section className="relative overflow-hidden border-b border-white/5 bg-background/40 backdrop-blur-xl">
                <div
                    className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,hsl(var(--primary)/0.25)_0%,transparent_70%)]"/>
                <div
                    className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-14 md:flex-row md:items-center md:justify-between">
                    <div className="max-w-2xl">
                        <motion.h1 initial={{opacity: 0, y: 8}} animate={{opacity: 1, y: 0}}
                                   transition={{duration: 0.4}}
                                   className="text-3xl font-semibold tracking-tight md:text-4xl">Aetherius GCS
                        </motion.h1>
                        <motion.p initial={{opacity: 0, y: 8}} animate={{opacity: 1, y: 0}}
                                  transition={{duration: 0.45, delay: 0.05}}
                                  className="mt-3 text-muted-foreground">Mission
                            planning and live telemetry for the Aetherius UAV project.
                        </motion.p>
                    </div>
                    <motion.div
                        initial={{opacity: 0, y: 8}}
                        whileInView={{opacity: 1, y: 0}}
                        viewport={{once: true, amount: 0.5}}
                        transition={{duration: 0.5}}
                        className="items-center gap-3 grid">
                        <LinkButton href="/dronescape/uav" label="See the mechanical half of this project"/>
                        <LinkButton
                            href="https://github.com/markwu123454/aetherius-uav"
                            label={
                                <>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="h-4 w-4"
                                    >
                                        <title>GitHub</title>
                                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438
                                             9.8 8.205 11.385.6.113.82-.258.82-.577
                                             0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61
                                             -.546-1.387-1.333-1.757-1.333-1.757
                                             -1.089-.744.084-.729.084-.729
                                             1.205.084 1.84 1.237 1.84 1.237
                                             1.07 1.835 2.809 1.305 3.495.998
                                             .108-.776.418-1.305.76-1.605
                                             -2.665-.3-5.466-1.332-5.466-5.93
                                             0-1.31.465-2.38 1.235-3.22
                                             -.135-.303-.54-1.523.105-3.176
                                             0 0 1.005-.322 3.3 1.23
                                             .96-.267 1.98-.399 3-.405
                                             1.02.006 2.04.138 3 .405
                                             2.28-1.552 3.285-1.23 3.285-1.23
                                             .645 1.653.24 2.873.12 3.176
                                             .765.84 1.23 1.91 1.23 3.22
                                             0 4.61-2.805 5.625-5.475 5.92
                                             .43.372.81 1.096.81 2.22
                                             0 1.606-.015 2.896-.015 3.286
                                             0 .315.21.69.825.57
                                             C20.565 22.092 24 17.592 24 12.297
                                             c0-6.627-5.373-12-12-12"/>
                                    </svg>
                                    See Repository
                                </>
                            }
                        />
                    </motion.div>

                </div>
            </section>
            <main className="mx-auto w-full max-w-6xl px-4 pb-24">
                <motion.div
                    initial={{opacity: 0, y: 8}}
                    whileInView={{opacity: 1, y: 0}}
                    viewport={{once: true, amount: 0.5}}
                    transition={{duration: 0.5}}>
                    <SectionHeader title="Aetherius GCS"
                                   subtitle="Full‑stack mission planning + live telemetry dashboard. Hosted via LAN, support multi-display."
                                   icon={<Map className="h-5 w-5"/>}/>
                </motion.div>

                <motion.div
                    initial={{opacity: 0, y: 8}}
                    whileInView={{opacity: 1, y: 0}}
                    viewport={{once: true, amount: 0.5}}
                    transition={{duration: 0.5}}
                    className="mt-6 grid gap-6 md:grid-cols-3">
                    <MetricCard label="Frontend" value="React + Tailwind" note="Custom UI"
                                icon={<LineChart className="h-5 w-5"/>}/>
                    <MetricCard label="Backend" value="Python FastAPI" note="mission planning & control"
                                icon={<Cpu className="h-5 w-5"/>}/>
                    <MetricCard label="Protocols" value="MAVLink, WebSocket"
                                note="pixhawk <-> Raspberry Pi <-> Backend <-> Frontend"
                                icon={<Radio className="h-5 w-5"/>}/>
                </motion.div>

                <motion.div
                    initial={{opacity: 0, y: 8}}
                    whileInView={{opacity: 1, y: 0}}
                    viewport={{once: true, amount: 0.5}}
                    transition={{duration: 0.5}}
                    className="mt-6 grid gap-6 md:grid-cols-2"
                >
                    <GlassCard title="Delivered Features" icon={<Gauge className="h-5 w-5"/>}>
                        <ul className="list-disc pl-5 text-sm leading-6 text-muted-foreground">
                            <li>Mission editor: map + form, reordering, Dubins/straight legs.</li>
                            <li>Network: full end to end communication from flight controller to frontend.</li>
                            <li>Telemetry: fully automatic connection and data streaming.</li>
                            <li>Control panel: always visible control panel for pre/post mission commands.</li>
                        </ul>
                    </GlassCard>

                    <GlassCard title="Roadmap" icon={<Wrench className="h-5 w-5"/>}>
                        <ul className="list-disc pl-5 text-sm leading-6 text-muted-foreground">
                            <li>Mission upload/download.</li>
                            <li>Mission execution.</li>
                            <li>LiDAR implementation.</li>
                        </ul>
                    </GlassCard>
                </motion.div>


                {/*<motion.div
                    initial={{opacity: 0, y: 8}}
                    whileInView={{opacity: 1, y: 0}}
                    viewport={{once: true, amount: 0.5}}
                    transition={{duration: 0.5}}>
                    <Gallery title="GCS UI" images={[
                        {alt: "Mission planner UI", src: "/images/aetherius/gcs-mission.jpg"},
                        {alt: "Driver station bar", src: "/images/aetherius/gcs-driver.jpg"},
                        {alt: "Validation overlays", src: "/images/aetherius/gcs-validate.jpg"},
                    ]}/>
                </motion.div>*/}

                <motion.div
                    initial={{opacity: 0, y: 8}}
                    whileInView={{opacity: 1, y: 0}}
                    viewport={{once: true, amount: 0.5}}
                    transition={{duration: 0.5}}>
                    <TechAndLinks tech={["React", "Tailwind CSS", "Cesium", "PyMAVLink", "FastAPI"]}/>
                </motion.div>
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

function Gallery({title, images}: { title: string; images: { alt: string; src: string }[] }) {
    return (
        <section className="mt-8">
            <h3 className="mb-3 text-lg font-semibold">{title}</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((img, i) => (
                    <figure key={i}
                            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
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
            className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-muted-foreground backdrop-blur">{icon} {label}</span>
    );
}

function LinkButton({
                        href,
                        label,
                    }: {
    href: string;
    label: React.ReactNode;
}) {
    return (
        <a
            href={href}
            className="group inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/90 backdrop-blur hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/60 w-full"
        >
            <span className="inline-flex items-center gap-2">{label}</span>
            <ArrowRight className="ml-auto h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </a>
    );
}

