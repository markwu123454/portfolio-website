"use client";

import Link from "next/link";
import Image from "next/image";
import JsonLd from "@/components/JsonLD";
import {JSX, useEffect, useMemo, useRef, useState} from "react";
import {ArrowDown, ArrowRight} from "lucide-react"

// 1) Hardcode your PNGs (filenames in /public/logo)
const LOGOS = [
    // Languages
    "/logo/typescript.png",
    "/logo/python.png",
    "/logo/cs.png",

    // Frontend / Web
    "/logo/react.png",
    "/logo/next.png",
    "/logo/tailwind.png",
    "/logo/tauri.png",

    // Backend / Data
    "/logo/fastapi.png",
    "/logo/postgresql.png",
    "/logo/sklearn.png",
    "/logo/tensorflow.png",

    // CAD / Engineering
    "/logo/solidworks.png",
    "/logo/fusion360.png",
    "/logo/onshape.png",

    // Hardware / Robotics
    "/logo/raspberrypi.png",
    "/logo/mavlink.png",
    "/logo/bambulab.png",

    // Tooling
    "/logo/git.png",
] as const;

// 2) Per-logo JSX detail (keys = filename sans extension)
const detailByKey: Record<string, JSX.Element> = {
    // Languages
    typescript: (
        <div className="p-5">
            <h3 className="font-semibold">TypeScript</h3>
            <p className="mt-1 text-sm text-white/80">
                Primary web language in my projects, used for strict typing and safer refactoring.
            </p>
        </div>
    ),
    python: (
        <div className="p-5">
            <h3 className="font-semibold">Python</h3>
            <p className="mt-1 text-sm text-white/80">
                Go-to programming language I use for everything, including backend services, data processing,
                robotics control scripts, and ML experimentation.
            </p>
        </div>
    ),
    cs: (
        <div className="p-5">
            <h3 className="font-semibold">C#</h3>
            <p className="mt-1 text-sm text-white/80">
                Used for Windows desktop applications and tooling,
                primarily with WPF for native UI development.
            </p>
        </div>
    ),

    // Frontend / Web
    react: (
        <div className="p-5">
            <h3 className="font-semibold">React</h3>
            <p className="mt-1 text-sm text-white/80">
                Core UI framework I use to build interactive web interfaces,
                component systems, and dynamic dashboards.
            </p>
        </div>
    ),
    next: (
        <div className="p-5">
            <h3 className="font-semibold">Next.js</h3>
            <p className="mt-1 text-sm text-white/80">
                Full-stack React framework I use to combine frontend UI with API routes and server rendering on simpler projects that doesn&#39;t require persistent backend,
                including this site’s architecture.
            </p>
        </div>
    ),
    tailwind: (
        <div className="p-5">
            <h3 className="font-semibold">Tailwind CSS</h3>
            <p className="mt-1 text-sm text-white/80">
                A css replacement I use to make my life easier.
            </p>
        </div>
    ),
    tauri: (
        <div className="p-5">
            <h3 className="font-semibold">Tauri</h3>
            <p className="mt-1 text-sm text-white/80">
                Desktop app framework for packaging web UIs into lightweight native binaries, used when I can&#39;t get the level of UI quality I want with WPF.
            </p>
        </div>
    ),

    // Backend / Data
    fastapi: (
        <div className="p-5">
            <h3 className="font-semibold">FastAPI</h3>
            <p className="mt-1 text-sm text-white/80">
                Backend framework I use to build high-performance APIs instead of Next.js.
            </p>
        </div>
    ),
    postgresql: (
        <div className="p-5">
            <h3 className="font-semibold">PostgreSQL</h3>
            <p className="mt-1 text-sm text-white/80">
                Relational database used for structured project data storage, analytics outputs,
                and server-backed applications requiring reliable querying.
            </p>
        </div>
    ),
    sklearn: (
        <div className="p-5">
            <h3 className="font-semibold">SciKit Learn</h3>
            <p className="mt-1 text-sm text-white/80">
                Python ML toolkit used for classical models, data preprocessing, and evaluation pipelines,
                including regression and classification workflows.
            </p>
        </div>
    ),
    tensorflow: (
        <div className="p-5">
            <h3 className="font-semibold">TensorFlow</h3>
            <p className="mt-1 text-sm text-white/80">
                Machine learning framework I’ve used for training and evaluating neural network models,
                primarily for feature recognition and predictive tasks.
            </p>
        </div>
    ),

    // CAD / Engineering
    solidworks: (
        <div className="p-5">
            <h3 className="font-semibold">SolidWorks</h3>
            <p className="mt-1 text-sm text-white/80">
                Primary CAD tool for complex mechanical assemblies and subsystem design, used mainly in my FRC team.
            </p>
        </div>
    ),
    fusion360: (
        <div className="p-5">
            <h3 className="font-semibold">Fusion 360</h3>
            <p className="mt-1 text-sm text-white/80">
                Alternative CAD software I also know, used mainly in combat robotics.
            </p>
        </div>
    ),
    onshape: (
        <div className="p-5">
            <h3 className="font-semibold">Onshape</h3>
            <p className="mt-1 text-sm text-white/80">
                Browser-based CAD platform I use when rapid collaboration and shared component libraries are needed.
                Useful for sourcing and adapting community-built parametric designs.
            </p>
        </div>
    ),

    // Hardware / Robotics
    raspberrypi: (
        <div className="p-5">
            <h3 className="font-semibold">Raspberry Pi</h3>
            <p className="mt-1 text-sm text-white/80">
                Embedded computing platform used for onboard control, edge processing,
                and hardware-integrated project deployments, since I&#39;m not familiar with digital electronics(yet).
            </p>
        </div>
    ),
    mavlink: (
        <div className="p-5">
            <h3 className="font-semibold">MAVLink</h3>
            <p className="mt-1 text-sm text-white/80">
                Drone communication protocol used for telemetry and control integration,
                including PyMAVLink-based implementations.
            </p>
        </div>
    ),
    bambulab: (
        <div className="p-5">
            <h3 className="font-semibold">Bambu Lab</h3>
            <p className="mt-1 text-sm text-white/80">
                3D printing platform used for functional prototypes and production parts,
                with frequent iteration in robotics and hardware projects.
            </p>
        </div>
    ),

    // Tooling
    git: (
        <div className="p-5">
            <h3 className="font-semibold">Git</h3>
            <p className="mt-1 text-sm text-white/80">
                Primary version control system I use for all major projects, with GitHub for remote hosting,
                collaboration, and release management.
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

    const isMobile = useIsMobile();

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
        if (!el || !LOGOS.length) return;

        // Use total scrollable width divided by the number of times you repeated the list
        // If 'doubled' is 2x LOGOS, repeats is 2.
        const totalWidth = el.scrollWidth;
        const w = totalWidth / (doubled.length / LOGOS.length);

        if (w > 0) {
            unitWidthRef.current = w;
            // Normalize the current position so it stays within [0, -w]
            xRef.current = xRef.current % w;
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

            if (dt > 0.1) dt = 0.1; // Slightly more generous clamp

            const speed = speedRef.current;
            const w = unitWidthRef.current;

            // ONLY update if not paused and we have a width
            if (!paused && speed > 0 && w > 0) {
                xRef.current -= speed * dt;

                // The magic fix: Use modulo to keep xRef.current
                // always within the bounds of one "unit width"
                if (Math.abs(xRef.current) >= w) {
                    xRef.current = xRef.current % w;
                }

                if (trackRef.current) {
                    // Use floor or round to prevent sub-pixel "jittering"
                    // but keep the ref as a float for smooth math
                    trackRef.current.style.transform = `translate3d(${xRef.current}px, 0, 0)`;
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
                            <FeaturedModule
                                title="FRC - Team Sprocket"
                                href="/teamsprocket"
                                status="ACTIVE"
                                tag="ROBOTICS"
                            >
                                FRC team based in Diamond Bar. CAD, scouting app, and outreach initiatives.
                            </FeaturedModule>
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

                {isMobile && (
                    <div className="mb-6 mx-4 rounded-md border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
                        Some pages are not fully optimized for mobile yet.
                    </div>
                )}


                {/* Anchor target for scroll hint */}
                <div id="next" className="pt-16 md:pt-24"/>

                {/* Activity List */}
                <section className="py-16" id="catalog">
                    <h2 className="text-lg font-semibold tracking-[0.15em] text-white/90">
                        CATALOG
                        <span className="ml-3 inline-block h-px w-12 align-middle bg-cyan-400/60"/>
                    </h2>
                    <p className="mt-2 text-xs tracking-widest text-white/50">
                        PROJECT RECORD
                    </p>

                    <div className="relative overflow-x-auto rounded-xl border border-white/15 bg-black/70 backdrop-blur font-mono">
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:100%_3px]"
                        />

                        <table className="w-full text-sm md:text-base text-left border-collapse">
                            <thead className="bg-black/80 text-white/70 text-xs tracking-widest">
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
                                    className="group transition hover:bg-cyan-400/[0.06] cursor-default"
                                >
                                    <td className="px-4 py-4 text-white/80 text-md tracking-wide">{a.title}</td>
                                    <td className="px-4 py-4 text-white/60 text-sm">{a.competition || "—"}</td>
                                    <td className="px-4 py-4 text-white/60 text-sm">{a.contribution}</td>
                                    <td className="px-4 py-4 text-white/60 text-sm">{a.awards || "—"}</td>
                                    <td className="px-4 py-4 text-white/60 text-sm">
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
                >
                    <h2 className="text-lg font-semibold tracking-[0.15em] text-white/90">
                        TOOLING & STACK
                        <span className="ml-3 inline-block h-px w-12 align-middle bg-cyan-400/60"/>
                    </h2>
                    <p className="mt-2 text-xs tracking-widest text-white/50">
                        TOOLS AND SERVICES I USE EXTENSIVELY
                    </p>

                    {/* rail */}
                    <div
                        className="mt-4 overflow-x-hidden rounded-xl border border-white/15 bg-black/70 backdrop-blur relative">
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px)] [background-size:100%_4px]"
                        />

                        <div
                            ref={trackRef}
                            onMouseEnter={onEnter}
                            onMouseLeave={onLeave}
                            onFocus={onEnter}
                            onBlur={onLeave}
                            className="flex items-center will-change-transform py-4"
                            style={{transform: `translate3d(${xRef.current}px,0,0)`, animation: "none"}}
                        >
                            {doubled.map((src, i) => {
                                const k = keyFromPath(src);
                                return (
                                    <div
                                        key={`${k}-${i}`}
                                        className="px-6 md:px-8 flex items-center justify-center flex-none"
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
                                                className="h-16 w-auto opacity-80 group-hover:opacity-100 group-hover:scale-110 transition"
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

type FeaturedModuleProps = {
    title: string;
    href: string;
    status: string;
    tag: string;
    children: React.ReactNode;
};

function FeaturedModule({ title, href, status, tag, children }: FeaturedModuleProps) {
    return (
        <article className="group relative rounded-xl border border-white/15 bg-black/65 backdrop-blur p-5 font-mono transition hover:bg-black/80">

            {/* subtle grid texture */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.05]
        [background-image:linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px)]
        [background-size:100%_4px]"
            />

            <div className="relative flex items-center justify-between">
        <span className="text-xs tracking-widest text-white/70">
          {tag}
        </span>
                <span className="text-[10px] tracking-widest text-cyan-300">
          {status}
        </span>
            </div>

            <h3 className="relative mt-3 text-base tracking-wide text-white/90">
                {title}
            </h3>

            <p className="relative mt-2 text-xs text-white/60 leading-relaxed">
                {children}
            </p>

            <Link
                href={href}
                className="relative mt-4 inline-flex items-center gap-2 text-xs tracking-widest text-cyan-300 hover:text-cyan-200"
            >
                OPEN PROJECT →
            </Link>

            {/* corner tick */}
            <div className="absolute top-2 left-2 h-2 w-2 border-t border-l border-cyan-400/40" />
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

function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

        const update = () => setIsMobile(mq.matches);
        update();

        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, [breakpoint]);

    return isMobile;
}
