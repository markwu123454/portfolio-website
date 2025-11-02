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

                        <p className="mt-4 text-lg text-white/80 max-w-prose">
                            I build robots and make apps.
                        </p>
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

                <section className="py-16 md:py-24 container mx-0 px-0 md:px-0">
                    <div className="flex items-baseline justify-between">
                        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                            Active Projects
                            <span className="ml-2 inline-block h-[2px] w-16 align-middle bg-white/20 rounded"/>
                        </h2>
                    </div>

                    <div className="mt-6 grid gap-6 md:grid-cols-3">

                        <div
                            className="group rounded-2xl p-5 md:p-6 bg-white/5 backdrop-blur border border-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] transition hover:bg-white/[0.07]">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Aetherius UAV</h3>
                                <span
                                    className="inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-medium bg-amber-500/20 text-amber-300 border-amber-400/30">On Hold</span>
                            </div>
                            <p className="mt-1 text-sm text-white/75">Fixed-wing UAV with Raspberry Pi avionics and
                                custom GCS</p>
                            <p className="mt-2 text-xs text-white/60"><span
                                className="text-white/70">Current:</span> Fixing electronic issues and preparing hardware-software testing.</p>
                            <p className="mt-1 text-xs text-white/50">Last updated Oct 28, 2025</p>
                            <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div className="h-full w-[19%] rounded-full bg-white/60"/>
                            </div>
                            <Link
                                href="/dronescape/uav"
                                className="mt-4 inline-flex items-center gap-2 text-sm font-medium rounded-xl px-3 py-1.5 border border-white/15 bg-black/40 hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/30"
                            >
                                Open →
                            </Link>
                        </div>

                        <div
                            className="group rounded-2xl p-5 md:p-6 bg-white/5 backdrop-blur border border-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] transition hover:bg-white/[0.07]">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">FRC Scouting</h3>
                                <span
                                    className="inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-medium bg-green-500/20 text-green-300 border-green-400/30">Active Development</span>
                            </div>
                            <p className="mt-1 text-sm text-white/75">React + FastAPI analytics platform with PWA</p>
                            <p className="mt-2 text-xs text-white/60"><span
                                className="text-white/70">Current:</span> Working on data presentation and integration. Starting to prepare for season rollover and kickoff into FRC Rebuilt.
                            </p>
                            <p className="mt-1 text-xs text-white/50">Last updated Oct 28, 2025</p>
                            <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div className="h-full w-[74%] rounded-full bg-white/60"/>
                            </div>
                            <Link
                                href="/teamsprocket/scouting"
                                className="mt-4 inline-flex items-center gap-2 text-sm font-medium rounded-xl px-3 py-1.5 border border-white/15 bg-black/40 hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/30"
                            >
                                Open →
                            </Link>
                        </div>

                        <div
                            className="group rounded-2xl p-5 md:p-6 bg-white/5 backdrop-blur border border-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] transition hover:bg-white/[0.07]">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">The Scavengers</h3>
                                <span
                                    className="inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-medium bg-green-500/20 text-green-300 border-green-400/30">Active Development</span>
                            </div>
                            <p className="mt-1 text-sm text-white/75">A JPL invention challenge team I captain.</p>
                            <p className="mt-2 text-xs text-white/60"><span
                                className="text-white/70">Current:</span>Reflection on internal competition result, regrouping after finals got canceled, planning for regional on Nov 8.</p>
                            <p className="mt-1 text-xs text-white/50">Last updated Oct 27, 2025</p>
                            <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div className="h-full w-[65%] rounded-full bg-white/60"/>
                            </div>
                            <Link
                                href="/misc/scavenger"
                                className="mt-4 inline-flex items-center gap-2 text-sm font-medium rounded-xl px-3 py-1.5 border border-white/15 bg-black/40 hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/30"
                            >
                                Open →
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Activity List */}
                <section className="py-16 md:py-2">
                    <div className="flex items-baseline justify-between mb-6">
                        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                            Activities & Contributions
                            <span className="ml-2 inline-block h-[2px] w-16 align-middle bg-white/20 rounded"/>
                        </h2>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
                        <table className="w-full text-sm md:text-base text-left border-collapse">
                            <thead className="bg-white/10 text-white/80">
                            <tr>
                                <th className="px-4 py-3 font-medium w-[28%]">Title</th>
                                <th className="px-4 py-3 font-medium w-[42%]">My Contribution</th>
                                <th className="px-4 py-3 font-medium w-[20%]">Awards / Recognition</th>
                                <th className="px-4 py-3 font-medium w-[10%]">Link</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                            {[
                                {
                                    title: "FRC – Team Sprocket",
                                    contribution:
                                        "Competition robot CAD, scouting app, various outreach project",
                                    awards: "2025 Impact Award, 2025 Imagery Award",
                                    link: "/teamsprocket",
                                },
                                {
                                    title: "Aetherius UAV",
                                    contribution:
                                        "Lead developer for UAV avionics software and custom Ground Control Station.",
                                    awards: "N/A",
                                    link: "/dronescape/uav",
                                },
                                {
                                    title: "The Scavengers – JPL Challenge",
                                    contribution:
                                        "Captain and CAD lead.",
                                    awards: "Qualified for Regionals(Finals are canceled)",
                                    link: "/misc/scavenger",
                                },
                                {
                                    title: "Team Infernope",
                                    contribution:
                                        "Founded and led a combat robotics team for 3 years. ",
                                    awards: "2024 End of year tornament champion",
                                    link: "/legacy/teaminfernope",
                                },
                                {
                                    title: "Projects pending documentation",
                                    contribution:
                                        "Portfolio website, Dronecape overview, SigmaCat Robotics, Project Temptest",
                                    awards: "",
                                    link: "/",
                                },
                            ].map((a) => (
                                <tr key={a.title} className="hover:bg-white/[0.04] transition">
                                    <td className="px-4 py-3 font-medium text-white">{a.title}</td>
                                    <td className="px-4 py-3 text-white/80">{a.contribution}</td>
                                    <td className="px-4 py-3 text-white/70">{a.awards}</td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={a.link}
                                            className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200 font-medium"
                                        >
                                            Open →
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </section>


                {/* Contact / Links */}
                <section className="max-w-4xl pb-10">
                    <SectionTitle>Links</SectionTitle>
                    <p className="mt-2 text-white/75">Contact me or browse the code.</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                        <a
                            href="https://mail.google.com/mail/?view=cm&fs=1&to=me@markwu.org"
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 border border-white/15 bg-black/40 hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/30"
                        >
                            <Image src="/gmail.png" alt="Gmail" width={20} height={20}/>
                            <span className="font-medium">Email Me</span>
                        </a>

                        <Link
                            href="https://github.com/markwu123454"
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 border border-white/15 bg-black/40 hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/30"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16"
                                 className="opacity-90">
                                <path
                                    fill="currentColor" fillRule="evenodd"
                                    d="M7.976 0A7.977 7.977 0 0 0 0 7.976c0 3.522 2.3 6.507 5.431 7.584c.392.049.538-.196.538-.392v-1.37c-2.201.49-2.69-1.076-2.69-1.076c-.343-.93-.881-1.175-.881-1.175c-.734-.489.048-.489.048-.489c.783.049 1.224.832 1.224.832c.734 1.223 1.859.88 2.3.685c.048-.538.293-.88.489-1.076c-1.762-.196-3.621-.881-3.621-3.964c0-.88.293-1.566.832-2.153c-.05-.147-.343-.978.098-2.055c0 0 .685-.196 2.201.832c.636-.196 1.322-.245 2.007-.245s1.37.098 2.006.245c1.517-1.027 2.202-.832 2.202-.832c.44 1.077.146 1.908.097 2.104a3.16 3.16 0 0 1 .832 2.153c0 3.083-1.86 3.719-3.62 3.915c.293.244.538.733.538 1.467v2.202c0 .196.146.44.538.392A7.984 7.984 0 0 0 16 7.976C15.951 3.572 12.38 0 7.976 0"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span className="font-medium">GitHub Profile</span>
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
        () => ({ duration, length, thickness, spawnPadding, maxConcurrent, colors }),
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
            const x = mt*mt*mt*x0 + 3*mt*mt*t*c1x + 3*mt*t*t*c2x + t*t*t*x1;
            const y = mt*mt*mt*y0 + 3*mt*mt*t*c1y + 3*mt*t*t*c2y + t*t*t*y1;
            return { x, y };
        };

        const p1 = at(0.3);
        const p2 = at(0.7);
        const inside = (p: {x:number;y:number}) =>
            p.x >= 0 && p.x <= rect.width && p.y >= 0 && p.y <= rect.height;

        // require at least one of the samples to be inside
        return inside(p1) || inside(p2);
    };

    // Spawn a single star
    const spawnStar = (rect: DOMRect) => {
        if (!isMountedRef.current) return () => {};

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