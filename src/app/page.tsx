"use client";

import Link from "next/link";
import Image from "next/image";
import JsonLd from "@/components/JsonLD";
import {JSX, useEffect, useMemo, useRef, useState} from "react";
import {ArrowDown, ArrowRight} from "lucide-react"

// 1) Hardcode your PNGs (filenames in /public/logo)
const LOGOS = [
    "/logo/typescript.png",
    "/logo/solidworks.png",
    "/logo/react.png",
    "/logo/mavlink.png",
    "/logo/next.png",
    "/logo/raspberrypi.png",
    "/logo/sklearn.png",
    "/logo/postgresql.png",
    "/logo/tensorflow.png",
    "/logo/bambulab.png",
    "/logo/python.png",
    "/logo/tailwind.png",
    "/logo/git.png",
    "/logo/fusion360.png",
    "/logo/fastapi.png",
    "/logo/onshape.png",
    "/logo/tauri.png",
] as const;

// 2) Per-logo JSX detail (keys = filename sans extension)
const detailByKey: Record<string, JSX.Element> = {
    onshape: (
        <div className="p-5">
            <h3 className="font-semibold">Onshape</h3>
            <p className="mt-1 text-sm text-white/80">
                Browser based CAD software, used in various smaller projects.
            </p>
        </div>
    ),
    tensorflow: (
        <div className="p-5">
            <h3 className="font-semibold">TensorFlow</h3>
            <p className="mt-1 text-sm text-white/80">
                TensorFlow is an ai training library developed by Google, in the past smaller projects I have utilised
                it in training feature recognition, regression, and classification models.
            </p>
        </div>
    ),
    git: (
        <div className="p-5">
            <h3 className="font-semibold">Git</h3>
            <p className="mt-1 text-sm text-white/80">
                Or more specifically Github is a file sharing and hosting website I use for most of my projects.
            </p>
        </div>
    ),
    sklearn: (
        <div className="p-5">
            <h3 className="font-semibold">SciKit Learn</h3>
            <p className="mt-1 text-sm text-white/80">
                A python ml library I used in the Team Sprocket Scouting app to process data using various models.
            </p>
        </div>
    ),
    postgresql: (
        <div className="p-5">
            <h3 className="font-semibold">PostGreSQL</h3>
            <p className="mt-1 text-sm text-white/80">
                Opensource database I used in the Team Sprocket Scouting app to store and retrieve generated data.
            </p>
        </div>
    ),
    next: (
        <div className="p-5">
            <h3 className="font-semibold">Next.js</h3>
            <p className="mt-1 text-sm text-white/80">
                A typescript framework that incorporate frontend and backend that I used for this website.
            </p>
        </div>
    ),
    typescript: (
        <div className="p-5">
            <h3 className="font-semibold">TypeScript</h3>
            <p className="mt-1 text-sm text-white/80">
                A popular programming language that is commonly used in web development.
            </p>
        </div>
    ),
    react: (
        <div className="p-5">
            <h3 className="font-semibold">React</h3>
            <p className="mt-1 text-sm text-white/80">
                A typescript framework I used in multiple other projects.
            </p>
        </div>
    ),
    tailwind: (
        <div className="p-5">
            <h3 className="font-semibold">Tailwind CSS</h3>
            <p className="mt-1 text-sm text-white/80">
                A useful css replacement tool I use on all my web projects to improve ui and presentation.
            </p>
        </div>
    ),
    python: (
        <div className="p-5">
            <h3 className="font-semibold">Python</h3>
            <p className="mt-1 text-sm text-white/80">
                A general purpose programming language I use to host backend/server, data processing, and a variety of
                other programs.
            </p>
        </div>
    ),
    fastapi: (
        <div className="p-5">
            <h3 className="font-semibold">FastAPI</h3>
            <p className="mt-1 text-sm text-white/80">
                A Python backend library I commonly use with React.
            </p>
        </div>
    ),
    solidworks: (
        <div className="p-5">
            <h3 className="font-semibold">SolidWorks</h3>
            <p className="mt-1 text-sm text-white/80">
                A cading software I use in Team Sprocket for designing complex subsystems and robot assemblies.
            </p>
        </div>
    ),
    fusion360: (
        <div className="p-5">
            <h3 className="font-semibold">Fusion 360</h3>
            <p className="mt-1 text-sm text-white/80">A 3D designing software I use in various robotics projects.</p>
        </div>
    ),
    raspberrypi: (
        <div className="p-5">
            <h3 className="font-semibold">Raspberry Pi</h3>
            <p className="mt-1 text-sm text-white/80">
                A mini-computer or microcontroller I used in Dronescape and various other projects.
            </p>
        </div>
    ),
    bambulab: (
        <div className="p-5">
            <h3 className="font-semibold">Bambu Lab</h3>
            <p className="mt-1 text-sm text-white/80">
                A 3D printer brand which I utilised a lot in various projects.
            </p>
        </div>
    ),
    mavlink: (
        <div className="p-5">
            <h3 className="font-semibold">MAVLink</h3>
            <p className="mt-1 text-sm text-white/80">
                A communication protocol used in my Dronescape project, where I specifically used PyMavLink.
            </p>
        </div>
    ),
    tauri: (
        <div className="p-5">
            <h3 className="font-semibold">Tauri</h3>
            <p className="mt-1 text-sm text-white/80">
                A cross-platform web framework I used in some smaller prototypes and projects.
            </p>
        </div>
    ),
};

function keyFromPath(p: string) {
    const base = p.split("/").pop() ?? "";
    return base.replace(/\.(png|jpg|jpeg|webp|svg)$/i, "").toLowerCase();
}

export default function HomePage() {
    const person = {
        "@context": "https://schema.org",
        "@type": "Person",
        name: "Mark Wu",
        url: "https://markwu.org",
        sameAs: ["https://github.com/markwu123454"],
        jobTitle: "Student Engineer",
    };

    const [activeKey, setActiveKey] = useState<string | null>(null);
    const doubled = useMemo(() => [...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS], []);

    // --- Marquee controller ---
    const trackRef = useRef<HTMLDivElement | null>(null);
    const [paused, setPaused] = useState(false);
    const xRef = useRef(0);
    const lastRef = useRef<number | null>(null);
    const unitWidthRef = useRef(0);
    const speedRef = useRef(80); // px/s

    // Reduced motion → stop marquee
    useEffect(() => {
        if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            speedRef.current = 0;
        }
    }, []);

    // compute repeats once (you repeat 4x)
    const repeats = useMemo(() => (LOGOS.length ? doubled.length / LOGOS.length : 1), [doubled.length]);

    // robust measurement using child positions: distance between item 0 and item[LOGOS.length]
    const measureUnitWidth = () => {
        const el = trackRef.current;
        if (!el) return;
        const children = el.children;
        if (children.length < LOGOS.length + 1) return;
        const a = (children[0] as HTMLElement).getBoundingClientRect();
        const b = (children[LOGOS.length] as HTMLElement).getBoundingClientRect();
        const dx = b.left - a.left;
        if (dx > 0) {
            unitWidthRef.current = dx;
            // Keep x in [-w, 0)
            const w = unitWidthRef.current;
            const canonical = ((xRef.current % w) + w) % w;
            xRef.current = -canonical;
            if (trackRef.current) {
                trackRef.current.style.transform = `translate3d(${xRef.current}px,0,0)`;
            }
        }
    };

    // initial measure + on repeats change
    useEffect(() => {
        measureUnitWidth();
    }, [repeats]);

    // re-measure after images load
    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;
        const imgs = Array.from(el.querySelectorAll("img"));
        if (imgs.length === 0) return;
        let remaining = imgs.length;
        const done = () => {
            remaining -= 1;
            if (remaining <= 0) measureUnitWidth();
        };
        imgs.forEach((img) => {
            if ((img as HTMLImageElement).complete) done();
            else {
                img.addEventListener("load", done, {once: true});
                img.addEventListener("error", done, {once: true});
            }
        });
    }, [doubled.length]);

    // re-measure on resize
    useEffect(() => {
        const onR = () => measureUnitWidth();
        window.addEventListener("resize", onR);
        return () => window.removeEventListener("resize", onR);
    }, []);

    // rAF loop with true pause + dt clamp
    useEffect(() => {
        let raf = 0;
        const step = (t: number) => {
            if (lastRef.current == null) lastRef.current = t;
            let dt = (t - lastRef.current) / 1000;
            lastRef.current = t;

            if (dt > 0.05) dt = 0.05; // clamp after background tab, etc.

            const speed = speedRef.current;
            const w = unitWidthRef.current;

            if (!paused && speed > 0 && w > 0) {
                let x = xRef.current - speed * dt;
                if (x <= -w) x += w; // seamless wrap
                xRef.current = x;
                if (trackRef.current) {
                    trackRef.current.style.transform = `translate3d(${x}px,0,0)`;
                }
            }
            raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [paused]);

    const onEnter = () => setPaused(true);
    const onLeave = () => {
        setPaused(false);
        lastRef.current = null; // reset clock to avoid resume jump
    };

    type SystemStatus = {
        deploymentTime?: number;
        isBuilding: boolean;
        commitSha?: string;
        commitUrl?: string;
    };

    type DeploymentStatusResponse = {
        this: SystemStatus;
        sprocketstatfrontend: SystemStatus;
        sprocketstatbackend: SystemStatus;
        updatedAt: number;
    };

    const LIVE_SYSTEMS = [
        {key: "this", name: "Portfolio Website"},
        {key: "sprocketstatfrontend", name: "SprocketStats Frontend"},
        {key: "sprocketstatbackend", name: "SprocketStats Backend"},
    ] as const;

    const [deployments, setDeployments] =
        useState<DeploymentStatusResponse | null>(null);
    const [deploymentsError, setDeploymentsError] = useState(false);

    useEffect(() => {
        let alive = true;

        const load = async () => {
            try {
                const res = await fetch("/api/deployment-status", {
                    cache: "no-store",
                });
                if (!res.ok) throw new Error();
                const json = (await res.json()) as DeploymentStatusResponse;
                if (alive) setDeployments(json);
            } catch {
                if (alive) setDeploymentsError(true);
            }
        };

        load();
        const id = setInterval(load, 90_000);
        return () => {
            alive = false;
            clearInterval(id);
        };
    }, []);


    return (
        <div className="relative min-h-screen text-white space-y-8">
            <JsonLd id="person-jsonld" data={person}/>

            {/* atmospherics */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                {/* existing radial blobs */}
                <div
                    className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(900px_560px_at_12%_-8%,#22d3ee,transparent_70%),radial-gradient(900px_560px_at_88%_12%,#a78bfa,transparent_65%)]"/>
                {/* animated background effect */}
                <ShootingStars className="absolute inset-0 opacity-[0.3]" rate={0.5}/>

                {/* grid */}
                <div
                    className="absolute inset-0 mix-blend-overlay [mask-image:linear-gradient(to_bottom,black,transparent_72%)]">
                    <div
                        className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.06)_1px,transparent_1px)] bg-[size:48px_48px]"/>
                </div>
                {/* noise */}
                <div
                    className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:3px_3px]"/>
            </div>


            <main className="container mx-auto">

                {/* HERO (full screen) */}
                <section
                    aria-labelledby="hero-heading"
                    className="relative h-[100svh] min-h-[640px] flex flex-col justify-center items-start px-6 md:px-8 pt-24"
                >


                    <div className="max-w-5xl">
                        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight
                                       bg-[linear-gradient(90deg,theme(colors.cyan.300),white,theme(colors.violet.300),white,theme(colors.cyan.300))]
                                       bg-clip-text text-transparent
                                       [background-size:200%_100%] animate-[bg-pan_8s_linear_infinite]
                                       drop-shadow-[0_0_24px_rgba(167,139,250,0.25)]">
                            Hi! I&apos;m Mark.
                        </h1>

                        <p className="mt-2 text-sm tracking-widest text-white/60">
                            STUDENT ENGINEER · ROBOTICS · SOFTWARE
                        </p>

                        <div className="mt-4 text-xs text-white/50">
                            SYSTEM STATUS: IN HIGHSCHOOL
                        </div>
                    </div>

                    {/* Featured projects inline */}
                    <div className="mt-10 w-full" aria-labelledby="featured-heading">
                        <h2 id="featured-heading" className="text-xl md:text-2xl font-semibold tracking-tight">
                            Featured Projects
                        </h2>
                        <div className="mt-4 grid gap-6 md:grid-cols-3">
                            {/*<FeaturedCard title="Aetherius UAV" href="/dronescape/uav">
                                Fixed-wing UAV with Raspberry Pi avionics and a custom GCS. MAVLink telemetry, offline
                                planning, terrain mapping.
                            </FeaturedCard>*/}

                            <FeaturedCard title="FRC - Team Sprocket" href="/teamsprocket">
                                A FRC Team based in Diamond bar, LA. We build decent robots and win impact awards. I do
                                CAD, scouting app, and outreach initiatives.
                            </FeaturedCard>

                            {/*<div className="rounded-2xl p-5 md:p-6 border border-dashed border-white/10 text-white/60">
                                Coming soon
                            </div>*/}
                        </div>
                    </div>

                    {/* Scroll hint (smooth + animated) */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById("next")?.scrollIntoView({behavior: "smooth"});
                            history.replaceState(null, "", " "); // removes #next from URL
                        }}
                        className="group absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                        aria-label="Scroll to content"
                    >
                        <span className="relative inline-flex h-10 w-10 items-center justify-center">
                            {/* pulse ring */}
                            <span className="absolute inset-0 rounded-full border border-white/20 animate-pulse"/>
                            {/* chevron */}
                            <ArrowDown
                                className="h-5 w-5 text-white/70 transition group-hover:text-white/90 animate-bounce"/>
                        </span>
                    </button>

                </section>

                {/* Anchor target for scroll hint */}
                <div id="next" className="pt-16 md:pt-24"/>

                {/* Activity List */}
                <section className="py-16" id="catalog">
                    <div className="flex items-baseline justify-between mb-6">
                        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                            Catalog
                            <span className="ml-2 inline-block h-[2px] w-16 align-middle bg-white/20 rounded"/>
                        </h2>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
                        <table className="w-full text-sm md:text-base text-left border-collapse">
                            <thead className="bg-white/10 text-white/80">
                            <tr>
                                <th className="px-4 py-3 font-medium w-[25%]">Title</th>
                                <th className="px-4 py-3 font-medium w-[15%]">Competition</th>
                                <th className="px-4 py-3 font-medium w-[35%]">My Contribution</th>
                                <th className="px-4 py-3 font-medium w-[15%]">Awards / Recognition</th>
                                <th className="px-4 py-3 font-medium w-[10%]">Link</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                            {[
                                {
                                    title: "Team Sprocket (Robot Design)",
                                    competition: "FRC",
                                    contribution: "Responsible for CAD design and mechanical system integration for competition robot.",
                                    awards: "",
                                    link: "/teamsprocket/cad",
                                },
                                {
                                    title: "Team Sprocket (Scouting App)",
                                    competition: "FRC",
                                    contribution: "Designed and implemented full-stack scouting and analytics platform.",
                                    awards: "",
                                    link: "/teamsprocket/scouting",
                                },
                                {
                                    title: "Team Sprocket (Outreach)",
                                    competition: "FRC",
                                    contribution: "Led development of STEM demos and assisted others in various community outreaches.",
                                    awards: "2025 Impact Award, 2025 Imagery Award",
                                    link: null,
                                },
                                {
                                    title: "Aetherius UAV",
                                    competition: "",
                                    contribution: "Lead engineer for a fixed wing UAV.",
                                    awards: "",
                                    link: "/dronescape/uav",
                                },
                                {
                                    title: "Aetherius GCS",
                                    competition: "",
                                    contribution: "Lead developer for UAV avionics software and custom Ground Control Station.",
                                    awards: "",
                                    link: "/dronescape/gcs",
                                },
                                {
                                    title: "The Scavengers – JPL Challenge",
                                    competition: "JPL Invention Challenge",
                                    contribution: "Captain and CAD lead.",
                                    awards: "Qualified for Regionals (Finals canceled)",
                                    link: null,
                                },
                                {
                                    title: "Team Infernope",
                                    competition: "Combat Robotics",
                                    contribution: "Founded and led a combat robotics team for 3 years.",
                                    awards: "2024 End-of-Year Tournament Champion",
                                    link: "/legacy/teaminfernope",
                                },
                                {
                                    title: "Portfolio Website",
                                    competition: "",
                                    contribution: "This website where I keep track of and document projects.",
                                    awards: "",
                                    link: null,
                                },
                                {
                                    title: "SigmaCat Robotics",
                                    competition: "RIVAL Robotics",
                                    contribution: "Designed the robot and created vision and path planning software.",
                                    awards: "",
                                    link: null,
                                },
                                {
                                    title: "Project Temptest",
                                    competition: "",
                                    contribution: "A heavy-lift drone project I mentor.",
                                    awards: "",
                                    link: null,
                                },
                                {
                                    title: "Music composition",
                                    competition: "",
                                    contribution: "Played in rock bands, concert bands, ensembles, and musical productions",
                                    awards: "SWIS ARTS - Secondary Music Dedicated Service (22-23)",
                                    link: "/misc/music",
                                },
                            ].map((a) => (
                                <tr
                                    key={a.title}
                                    className="group transition hover:bg-white/[0.04] cursor-default"
                                >
                                    <td className="px-4 py-4 font-medium text-white text-base">{a.title}</td>
                                    <td className="px-4 py-4 text-white/70">{a.competition || "—"}</td>
                                    <td className="px-4 py-4 text-white/80">{a.contribution}</td>
                                    <td className="px-4 py-4 text-white/70">{a.awards || "—"}</td>
                                    <td className="px-4 py-4">
                                        {a.link ? (
                                            <Link
                                                href={a.link}
                                                className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200 font-medium transition"
                                            >
                                                Open →
                                            </Link>
                                        ) : (
                                            <span className="text-white/40 italic">Not yet documented</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Logos + Details — keeps YOUR marquee loop, only styling/layout changed */}
                <section
                    className="select-none"
                    onMouseEnter={onEnter}
                    onMouseLeave={onLeave}
                    onFocus={onEnter}
                    onBlur={onLeave}
                >
                    <SectionTitle>Tooling & Stack</SectionTitle>

                    {/* rail */}
                    <div
                        className="mt-4 overflow-x-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur">
                        <div
                            ref={trackRef}
                            className="flex items-center will-change-transform py-4"
                            style={{transform: `translate3d(${xRef.current}px,0,0)`, animation: "none"}}
                        >
                            {doubled.map((src, i) => {
                                const k = keyFromPath(src);
                                return (
                                    <div
                                        key={`${k}-${i}`}
                                        className="px-8 md:px-10 flex items-center justify-center flex-none min-h-24"
                                    >
                                        <button
                                            className="group rounded-md outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                                            onMouseEnter={() => setActiveKey(k)}
                                            onFocus={() => setActiveKey(k)}
                                            onMouseLeave={() => setActiveKey(null)}
                                            onBlur={() => setActiveKey(null)}
                                            aria-label={k}
                                        >
                                            <Image
                                                src={src}
                                                alt={k}
                                                width={96}
                                                height={96}
                                                priority={false}
                                                className="h-16 w-auto md:h-20 opacity-90 transition group-hover:opacity-100 group-hover:scale-110"
                                                draggable={false}
                                            />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* detail panel */}
                    <div
                        className="mt-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur
                     transition data-[active=false]:opacity-80"
                        data-active={!!activeKey}
                        aria-live="polite"
                    >
                        {activeKey && detailByKey[activeKey] ? detailByKey[activeKey] : (
                            <div className="p-5">
                                <h3 className="text-base font-semibold">Tooling & Stack</h3>
                                <p className="mt-1 text-sm text-white/80">
                                    Libraries and tools I actively use across projects.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Active projects */}
                <section className="py-12 border-t border-white/10 font-mono">
                    <h2 className="text-lg font-semibold tracking-[0.15em] text-white/90">
                        ACTIVE PROJECTS
                        <span className="ml-3 inline-block h-px w-12 align-middle bg-cyan-400/60"/>
                    </h2>

                    <p className="mt-2 text-xs tracking-widest text-white/50">
                        CURRENTLY MAINTAINED SYSTEMS
                    </p>

                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                        {/* Aetherius UAV */}
                        <div className="relative rounded-xl border border-white/15 bg-black/70 p-4 backdrop-blur">
                            {/* scanlines */}
                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-0 rounded-xl opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:100%_3px]"
                            />

                            <div className="relative flex items-center justify-between">
                                <span className="text-xs tracking-wider text-white/80">
                                    AETHERIUS_UAV
                                </span>
                                <span className="text-[10px] tracking-widest text-amber-300">
                                    ON_HOLD
                                </span>
                            </div>

                            <div className="relative mt-3 space-y-2 text-xs">
                                <div className="flex gap-2">
                                    <span className="text-white/40 w-24">DESC</span>
                                    <span className="text-white/70">
                                        Fixed-wing UAV with custom avionics
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <span className="text-white/40 w-24">STATE</span>
                                    <span className="text-white/70">
                                        Electrical debugging & HW/SW validation
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <span className="text-white/40 w-24">UPDATED</span>
                                    <span className="text-white/50">
                                        2025-11-23
                                    </span>
                                </div>
                            </div>

                            {/* load bar */}
                            <div className="mt-3 h-1.5 bg-white/10 rounded overflow-hidden">
                                <div className="h-full w-[19%] bg-white/60"/>
                            </div>

                            <Link
                                href="/dronescape/uav"
                                className="mt-3 inline-block text-xs tracking-widest text-cyan-300 hover:text-cyan-200"
                            >
                                OPEN →
                            </Link>

                            {/* corner accent */}
                            <div
                                aria-hidden
                                className="absolute top-2 right-2 h-2 w-2 border-t border-r border-cyan-400/40"
                            />
                        </div>

                        {/* FRC Scouting */}
                        <div className="relative rounded-xl border border-white/15 bg-black/70 p-4 backdrop-blur">
                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-0 rounded-xl opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:100%_3px]"
                            />

                            <div className="relative flex items-center justify-between">
                                <span className="text-xs tracking-wider text-white/80">
                                    FRC_SCOUTING
                                </span>
                                <span className="text-[10px] tracking-widest text-emerald-300">
                                    ACTIVE
                                </span>
                            </div>

                            <div className="relative mt-3 space-y-2 text-xs">
                                <div className="flex gap-2">
                                    <span className="text-white/40 w-24">DESC</span>
                                    <span className="text-white/70">
                                        React + FastAPI analytics platform
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <span className="text-white/40 w-24">STATE</span>
                                    <span className="text-white/70">
                                        Post kickoff: work on scouting UI and questions
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <span className="text-white/40 w-24">UPDATED</span>
                                    <span className="text-white/50">
                                        2026-1-14
                                    </span>
                                </div>
                            </div>

                            <div className="mt-3 h-1.5 bg-white/10 rounded overflow-hidden">
                                <div className="h-full w-[78%] bg-white/60"/>
                            </div>

                            <Link
                                href="/teamsprocket/scouting"
                                className="mt-3 inline-block text-xs tracking-widest text-cyan-300 hover:text-cyan-200"
                            >
                                OPEN →
                            </Link>

                            <div
                                aria-hidden
                                className="absolute top-2 right-2 h-2 w-2 border-t border-r border-cyan-400/40"
                            />
                        </div>

                        {/* FRC Outreach */}
                        <div className="relative rounded-xl border border-white/15 bg-black/70 p-4 backdrop-blur">
                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-0 rounded-xl opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:100%_3px]"
                            />

                            <div className="relative flex items-center justify-between">
                                <span className="text-xs tracking-wider text-white/80">
                                    FRC_OUTREACH
                                </span>
                                <span className="text-[10px] tracking-widest text-emerald-300">
                                    ACTIVE
                                </span>
                            </div>

                            <div className="relative mt-3 space-y-2 text-xs">
                                <div className="flex gap-2">
                                    <span className="text-white/40 w-24">DESC</span>
                                    <span className="text-white/70">
                                        Outreach & education initiatives
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <span className="text-white/40 w-24">STATE</span>
                                    <span className="text-white/70">
                                        Approved, started prototyping
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <span className="text-white/40 w-24">UPDATED</span>
                                    <span className="text-white/50">
                                        2026-1-14
                                    </span>
                                </div>
                            </div>

                            <div className="mt-3 h-1.5 bg-white/10 rounded overflow-hidden">
                                <div className="h-full w-[5%] bg-white/60"/>
                            </div>

                            <Link
                                href="/teamsprocket"
                                className="mt-3 inline-block text-xs tracking-widest text-cyan-300 hover:text-cyan-200"
                            >
                                OPEN →
                            </Link>

                            <div
                                aria-hidden
                                className="absolute top-2 right-2 h-2 w-2 border-t border-r border-cyan-400/40"
                            />
                        </div>
                    </div>
                </section>


                {/* System status */}
                <section
                    className="py-16 font-mono"
                    style={{fontVariantNumeric: "tabular-nums"}}
                >
                    <h2 className="text-lg font-semibold tracking-[0.15em] text-white/90">
                        LIVE SYSTEMS
                        <span className="ml-3 inline-block h-px w-12 align-middle bg-cyan-400/60"/>
                    </h2>

                    <p className="mt-2 text-xs tracking-widest text-white/50">
                        DEPLOYMENT TELEMETRY STREAM
                    </p>

                    <div
                        className="mt-6 grid gap-4 md:grid-cols-3 "
                    >
                        {LIVE_SYSTEMS.map((s) => {
                            const d = deployments?.[s.key];

                            return (
                                <div
                                    key={s.key}
                                    className="relative rounded-xl border border-white/15 bg-black/70 backdrop-blur p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] hover:bg-black/80 transition"
                                >
                                    {/* scanlines */}
                                    <div
                                        aria-hidden
                                        className="pointer-events-none absolute inset-0 rounded-xl opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:100%_3px]"
                                    />

                                    {/* header */}
                                    <div className="relative flex items-center justify-between">
                                        <span className="text-xs tracking-wider text-white/80">
                                            {s.name.toUpperCase()}
                                        </span>

                                        <span
                                            className={`text-[10px] tracking-widest ${
                                                deploymentsError
                                                    ? "text-white/40"
                                                    : d?.isBuilding
                                                        ? "text-amber-300"
                                                        : "text-emerald-300"
                                            }`}
                                        >
                                            {deploymentsError
                                                ? "UNKNOWN"
                                                : d?.isBuilding
                                                    ? "BUILDING" : "STABLE"}
                                        </span>
                                    </div>

                                    {/* body */}
                                    <div className="relative mt-3 space-y-2 text-xs">
                                        <div className="flex gap-2">
                                            <span className="text-white/40 w-28">
                                                DEPLOYED_AT
                                            </span>
                                            <span className="text-white/70 break-all">
                                                {d?.deploymentTime
                                                    ? new Date(d.deploymentTime).toISOString()
                                                    : "—"}
                                            </span>
                                        </div>

                                        <div className="flex gap-2">
                                            <span className="text-white/40 w-28">
                                                COMMIT_SHA
                                            </span>
                                            {d?.commitUrl && d?.commitSha ? (
                                                <Link
                                                    href={d.commitUrl}
                                                    target="_blank"
                                                    className="text-cyan-300 hover:text-cyan-200 break-all"
                                                >
                                                    {d.commitSha}
                                                </Link>
                                            ) : (
                                                <span className="text-white/30">—</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* corner accent */}
                                    <div
                                        aria-hidden
                                        className="absolute top-2 right-2 h-2 w-2 border-t border-r border-cyan-400/40"
                                    />
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* External Links */}
                <section className="py-12 border-t border-white/10 font-mono max-w-4xl">
                    <h2 className="text-sm tracking-[0.2em] text-white/70">
                        EXTERNAL_LINKS
                    </h2>

                    <p className="mt-2 text-xs tracking-widest text-white/40">
                        COMMUNICATION & SOURCE ACCESS
                    </p>

                    <div className="mt-6 space-y-3">
                        {/* Email */}
                        <a
                            href="https://mail.google.com/mail/?view=cm&fs=1&to=me@markwu.org"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between
                       rounded-md border border-white/15
                       bg-black/60 px-4 py-3
                       hover:bg-black/80 transition"
                        >
                            <span className="text-xs tracking-widest text-white/70">
                                EMAIL_INTERFACE
                            </span>

                            <span className="text-xs tracking-widest text-cyan-300
                             group-hover:translate-x-0.5 transition">
                                OPEN →
                            </span>
                        </a>

                        {/* GitHub */}
                        <Link
                            href="https://github.com/markwu123454"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between
                       rounded-md border border-white/15
                       bg-black/60 px-4 py-3
                       hover:bg-black/80 transition"
                        >
                            <span className="text-xs tracking-widest text-white/70">
                                SOURCE_REPOSITORY
                            </span>

                            <span className="text-xs tracking-widest text-cyan-300
                             group-hover:translate-x-0.5 transition">
                                OPEN →
                            </span>
                        </Link>
                    </div>
                </section>

            </main>
        </div>
    );
}

function SectionTitle({children}: { children: React.ReactNode }) {
    return (
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {children}
            <span className="ml-2 inline-block h-[2px] w-16 align-middle bg-white/20 rounded"/>
        </h2>
    );
}

type FeaturedCardProps = {
    title: string;
    href: string;
    children: React.ReactNode;
    className?: string;
};

function FeaturedCard({title, href, children, className}: FeaturedCardProps) {
    const id = title.toLowerCase().replace(/\s+/g, "-");
    return (
        <article
            className={[
                "group relative rounded-2xl p-5 md:p-6 overflow-hidden",
                // glass base
                "bg-white/[0.04] backdrop-blur",
                // gradient ring (outer)
                "ring-1 ring-white/10",
                // inner highlight ring
                "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]",
                // lift + scale
                "transition-transform duration-300 will-change-transform",
                "hover:-translate-y-0.5 hover:scale-[1.01]",
                className ?? "",
            ].join(" ")}
            aria-labelledby={`${id}-title`}
        >
            {/* gradient border overlay */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-90"
                // subtle cyan→violet animated border via masked background
                style={{
                    background:
                        "linear-gradient(135deg, rgba(34,211,238,0.25), rgba(167,139,250,0.25)) border-box",
                    WebkitMask:
                        "linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                    border: "1px solid transparent",
                }}
            />

            {/* sheen sweep */}
            <div
                aria-hidden
                className="absolute inset-0 -translate-x-full opacity-0 transition-transform duration-700 ease-out
                   group-hover:translate-x-full group-hover:opacity-100"
                style={{
                    background:
                        "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.08), transparent 70%)",
                }}
            />

            {/* soft glow on hover */}
            <div
                aria-hidden
                className="absolute -inset-8 rounded-[28px] opacity-0 blur-2xl transition
                   group-hover:opacity-40"
                style={{
                    background:
                        "radial-gradient(40% 40% at 50% 0%, rgba(167,139,250,0.20), transparent 60%), radial-gradient(40% 40% at 0% 100%, rgba(34,211,238,0.18), transparent 60%)",
                }}
            />

            <h3 id={`${id}-title`} className="text-lg md:text-xl font-semibold tracking-tight">
                {title}
            </h3>

            <p className="mt-2 text-sm md:text-base text-white/75 transition-transform duration-300 group-hover:-translate-y-0.5">
                {children}
            </p>

            <div className="mt-4 flex items-center justify-between">
                <Link
                    href={href}
                    aria-describedby={`${id}-title`}
                    className="relative inline-flex items-center gap-2 text-sm font-medium rounded-xl px-3 py-1.5
                     border border-white/15 bg-black/40 hover:bg-white/15
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                    See more
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5"/>
                </Link>

                {/* optional tiny badge; remove if unwanted */}
                <span className="text-[11px] px-2 py-1 rounded-lg bg-white/5 ring-1 ring-white/10 text-white/60">
          Project
        </span>
            </div>

            {/* make whole card clickable without duplicate focus targets */}
            <Link
                href={href}
                aria-label={title}
                className="absolute inset-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                tabIndex={-1}
            />
        </article>
    );
}

interface Star {
    id: number;
    dur: number;
    len: number;
    thick: number;
    delay: number;
    path: string;
    color: string;
}

interface Props {
    className?: string;
    rate?: number; // Stars per second
    duration?: [number, number]; // Min/max duration in seconds
    length?: [number, number]; // Min/max length in pixels
    thickness?: [number, number]; // Min/max thickness in pixels
    spawnPadding?: number; // Offscreen spawn padding
    maxConcurrent?: number; // Max stars on screen
    colors?: string[]; // Array of possible star colors
}

// Utility function for random numbers
const rand = (min: number, max: number) => min + Math.random() * (max - min);

const ShootingStars: React.FC<Props> = ({
                                            className = '',
                                            rate = 0.8,
                                            duration = [1.6, 2.8],
                                            length = [90, 170],
                                            thickness = [1, 2],
                                            spawnPadding = 140,
                                            maxConcurrent = 14,
                                            colors = ['#ffffff', '#B090F0', '#87ceeb'],
                                        }) => {
    const [stars, setStars] = useState<Star[]>([]);
    const boxRef = useRef<HTMLDivElement>(null);
    const pathMap = useRef<Map<number, string>>(new Map());
    const idRef = useRef(0);
    const loopTimerRef = useRef<number | null>(null);
    const isMountedRef = useRef(true);

    // Memoize config to prevent unnecessary effect runs
    const config = useMemo(
        () => ({duration, length, thickness, spawnPadding, maxConcurrent, colors}),
        [duration, length, thickness, spawnPadding, maxConcurrent, colors.join(',')]
    );

    // Replace your generateStarPath with this:
    const generateStarPath = (rect: DOMRect | DOMRectReadOnly, pad: number): string => {
        const W = Math.max(1, rect.width);
        const H = Math.max(1, rect.height);

        // Upward shift by ~1/3 screen height
        const yShift = -H / 3;

        // Offscreen endpoints: RIGHT -> LEFT
        const x0 = rand(W + pad, W + pad * 2);    // start offscreen right
        const y0 = rand(-pad * 0.2, H * 0.35);

        const x1 = rand(-pad * 2, -pad);          // end offscreen left
        const y1 = rand(H * 0.55, H + pad * 0.2);

        // Interior guide points (before shift)
        const g1x = rand(W * 0.55, W * 0.85);
        const g1y = rand(H * 0.15, H * 0.40);
        const g2x = rand(W * 0.15, W * 0.45);
        const g2y = rand(H * 0.45, H * 0.75);

        // Jitter near the guides
        const jitter = (v: number, j: number) => v + rand(-j, j);
        const c1x = jitter(g1x, W * 0.05);
        const c1y = jitter(g1y, H * 0.05);
        const c2x = jitter(g2x, W * 0.05);
        const c2y = jitter(g2y, H * 0.05);

        // Apply linear upward shift to all Y's
        return `M ${x0} ${y0 + yShift} C ${c1x} ${c1y + yShift}, ${c2x} ${c2y + yShift}, ${x1} ${y1 + yShift}`;
    };


// Optional: ensure path meaningfully crosses the viewport (retry up to N)
    const generateCrossingPath = (rect: DOMRect | DOMRectReadOnly, pad: number, tries = 6): string => {
        for (let i = 0; i < tries; i++) {
            const p = generateStarPath(rect, pad);
            if (roughlyCrossesViewport(p, rect)) return p;
        }
        // Fallback—last generated path
        return generateStarPath(rect, pad);
    };

// Cheap viewport-crossing heuristic: sample at t=.3 and t=.7
    const roughlyCrossesViewport = (d: string, rect: DOMRect | DOMRectReadOnly): boolean => {
        const cmd = d.match(/[-\d.]+/g)?.map(Number) ?? [];
        if (cmd.length < 12) return true;
        const [x0, y0, c1x, c1y, c2x, c2y, x1, y1] = [cmd[0], cmd[1], cmd[2], cmd[3], cmd[4], cmd[5], cmd[6], cmd[7]];

        // cubic Bezier point
        const at = (t: number) => {
            const mt = 1 - t;
            const x = mt * mt * mt * x0 + 3 * mt * mt * t * c1x + 3 * mt * t * t * c2x + t * t * t * x1;
            const y = mt * mt * mt * y0 + 3 * mt * mt * t * c1y + 3 * mt * t * t * c2y + t * t * t * y1;
            return {x, y};
        };

        const p1 = at(0.3);
        const p2 = at(0.7);
        const inside = (p: { x: number; y: number }) =>
            p.x >= 0 && p.x <= rect.width && p.y >= 0 && p.y <= rect.height;

        // require at least one of the samples to be inside
        return inside(p1) || inside(p2);
    };

    // Spawn a single star
    const spawnStar = (rect: DOMRect) => {
        if (!isMountedRef.current) return () => {
        };

        const id = idRef.current++;
        const path = generateCrossingPath(rect, config.spawnPadding);
        const star: Star = {
            id,
            dur: rand(config.duration[0], config.duration[1]),
            len: rand(config.length[0], config.length[1]),
            thick: rand(config.thickness[0], config.thickness[1]),
            delay: rand(0, 0.5),
            path,
            color: config.colors[Math.floor(rand(0, config.colors.length))],
        };

        pathMap.current.set(id, path);

        // Update stars safely
        setStars((prev) => {
            if (prev.length >= config.maxConcurrent) {
                const oldestId = prev[0]?.id;
                if (oldestId !== undefined) pathMap.current.delete(oldestId);
                return [...prev.slice(1), star];
            }
            return [...prev, star];
        });

        // Cleanup
        const timeout = window.setTimeout(() => {
            if (isMountedRef.current) {
                pathMap.current.delete(id);
                setStars((prev) => prev.filter((s) => s.id !== id));
            }
        }, (star.dur + star.delay) * 1000 + 200);

        return () => clearTimeout(timeout);
    };

    useEffect(() => {
        const box = boxRef.current;
        if (!box) return;

        isMountedRef.current = true;

        const loop = () => {
            if (!isMountedRef.current || !box) return;

            const rect = box.getBoundingClientRect();
            const cleanup = spawnStar(rect);
            const intervalMs = rate > 0 ? 1000 / rate : 999999;
            const skew = rand(0.7, 1.3);

            loopTimerRef.current = window.setTimeout(() => {
                cleanup?.();
                loop();
            }, intervalMs * skew) as unknown as number;
        };

        loop();

        return () => {
            isMountedRef.current = false;
            if (loopTimerRef.current) {
                clearTimeout(loopTimerRef.current);
                loopTimerRef.current = null;
            }
            pathMap.current.clear();
        };
    }, [rate]); // Only depend on rate, as config is memoized

    return (
        <div
            ref={boxRef}
            className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
        >
            {stars.map((star) => (
                <div
                    key={star.id}
                    className="absolute will-change-transform"
                    style={{
                        width: `${star.len}px`,
                        height: `${star.thick}px`,
                        background: `linear-gradient(to right, transparent, ${star.color})`,
                        borderRadius: `${star.thick}px`,
                        filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.5))',
                        offsetPath: `path('${pathMap.current.get(star.id) || 'M0 0'}')`,
                        offsetRotate: 'auto',
                        offsetAnchor: '100% 50%',
                        animation: `shoot-path ${star.dur}s linear ${star.delay}s both`,
                    }}
                />
            ))}
            <style jsx global>{`
                @keyframes shoot-path {
                    0% {
                        opacity: 0;
                        offset-distance: 0%;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        opacity: 0;
                        offset-distance: 100%;
                    }
                }
            `}</style>
        </div>
    );
};