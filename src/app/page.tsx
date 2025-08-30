"use client";

import Link from "next/link";
import Image from "next/image";
import JsonLd from "@/components/JsonLD";
import {JSX, useEffect, useMemo, useRef, useState} from "react";
import {ArrowDown} from "lucide-react"

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
                <div className="absolute inset-0 opacity-[0.050] bg-[radial-gradient(900px_560px_at_12%_-8%,#22d3ee,transparent_70%),radial-gradient(900px_560px_at_88%_12%,#a78bfa,transparent_65%)]" />
                <div className="absolute inset-0 mix-blend-overlay [mask-image:linear-gradient(to_bottom,black,transparent_72%)]">
                    <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.06)_1px,transparent_1px)] bg-[size:48px_48px]" />
                </div>
            </div>

            <main className="container mx-auto">

                {/* HERO (full screen) */}
                <section
                    aria-labelledby="hero-heading"
                    className="relative h-[100svh] min-h-[640px] flex flex-col justify-center items-start px-6 md:px-8 pt-24"
                >


                    <div className="max-w-5xl">
                        <h1 id="hero-heading" className="text-6xl md:text-7xl font-extrabold tracking-tight">
                            Hi! I&apos;m Mark.
                        </h1>
                        <p className="mt-4 text-lg text-white/80 max-w-prose">
                            I build robots and apps.
                        </p>
                    </div>

                    {/* Featured projects inline */}
                    <div className="mt-10 w-full" aria-labelledby="featured-heading">
                        <h2 id="featured-heading" className="text-xl md:text-2xl font-semibold tracking-tight">
                            Featured Projects
                        </h2>
                        <div className="mt-4 grid gap-6 md:grid-cols-3">
                            <FeaturedCard title="Aetherius UAV" href="/dronescape/uav">
                                Fixed-wing UAV with Raspberry Pi avionics and a custom GCS. MAVLink telemetry, offline
                                planning, terrain mapping.
                            </FeaturedCard>

                            <FeaturedCard title="FRC Scouting App" href="/teamsprocket/scouting">
                                React + FastAPI platform for match data and analytics. Offline-first PWA, HTTPS sync,
                                ML-powered data processor.
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
                            <ArrowDown className="h-5 w-5 text-white/70 transition group-hover:text-white/90 animate-bounce"/>
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
                                className="text-white/70">Current:</span> Waiting for fund allocation and hardware issue
                                fixes.</p>
                            <p className="mt-1 text-xs text-white/50">Updated Aug 17, 2025</p>
                            <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div className="h-full w-[17%] rounded-full bg-white/60"/>
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
                                    className="inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-medium bg-blue-500/20 text-blue-300 border-blue-400/30">Testing</span>
                            </div>
                            <p className="mt-1 text-sm text-white/75">React + FastAPI analytics platform with
                                offline-first PWA</p>
                            <p className="mt-2 text-xs text-white/60"><span
                                className="text-white/70">Current:</span> Preparing for off season competition end to end testing. Migrating database from local PostGre to Neon PostGre.
                            </p>
                            <p className="mt-1 text-xs text-white/50">Updated Aug 18, 2025</p>
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
                                <h3 className="text-lg font-semibold">Portfolio Website</h3>
                                <span
                                    className="inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-medium bg-green-500/20 text-green-300 border-green-400/30">Active Development</span>
                            </div>
                            <p className="mt-1 text-sm text-white/75">Next.js serverless website, this one :D</p>
                            <p className="mt-2 text-xs text-white/60"><span
                                className="text-white/70">Current:</span> Preparing documentation for projects.</p>
                            <p className="mt-1 text-xs text-white/50">Updated Aug 30, 2025</p>
                            <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div className="h-full w-[26%] rounded-full bg-white/60"/>
                            </div>
                            <Link
                                href="/misc/portfolio"
                                className="mt-4 inline-flex items-center gap-2 text-sm font-medium rounded-xl px-3 py-1.5 border border-white/15 bg-black/40 hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/30"
                            >
                                Open →
                            </Link>
                        </div>
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

function FeaturedCard({
                          title,
                          href,
                          children,
                      }: { title: string; href: string; children: React.ReactNode }) {
    return (
        <div className="group rounded-2xl p-5 md:p-6 bg-white/5 backdrop-blur border border-white/10
                    shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] transition
                    hover:bg-white/[0.07] hover:shadow-[0_14px_40px_-18px_rgba(0,0,0,0.6)]">
            <h3 className="text-lg md:text-xl font-semibold">{title}</h3>
            <p className="mt-2 text-sm md:text-base text-white/75">{children}</p>
            <Link
                href={href}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium rounded-xl px-3 py-1.5
                   border border-white/15 bg-black/40 hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/30"
            >
                See more →
            </Link>
        </div>
    );
}