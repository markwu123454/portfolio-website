"use client";

import Image from "next/image";
import {useId, useState} from "react";
import {ArrowUpRight, ChevronDown, ChevronRight} from "lucide-react";
import Link from "next/link";

/**
 * CAD – Case Study Page (dark, card-driven, fast)
 * - No background/hero images; content-first.
 * - Tight rhythm: 24 / 16 spacing, consistent borders.
 * - Collapsible “Practice” blocks; simple gallery; clear timeline.
 */

export default function SprocketPage() {
    return (
        <>
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                <div
                    className="absolute inset-0 opacity-[0.20] bg-[radial-gradient(900px_560px_at_12%_-8%,#22d3ee,transparent_50%),radial-gradient(900px_560px_at_88%_12%,#a78bfa,transparent_45%)]"/>
                <div
                    className="absolute inset-0 mix-blend-overlay [mask-image:linear-gradient(to_bottom,black,transparent_72%)]">
                    <div
                        className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.1)_1px,transparent_1px)] bg-[size:48px_48px]"/>
                </div>
            </div>
            <main className="mx-auto w-full max-w-7xl px-6 py-16 mt-16">
                {/* Header */}
                <header className="mb-10">
                    <h1 className="mt-3 text-5xl font-bold tracking-tight">Team Sprocket</h1>
                    <p className="mt-3 max-w-2xl text-white/75">
                        A FIRST Robotics Competition team located in Diamond Bar High School, in LA.
                    </p>
                </header>

                {/* Summary strip */}
                <section aria-labelledby="summary" className="mb-12">
                    <h2 id="summary" className="sr-only">Summary</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Stat label="My Role" value="CAD Subteam member"
                              hint="Resposible for various design needs of the team"/>
                        <Stat label="FIRST Seasons Survived" value="2" hint="FLL - City Shaper, FRC - ReefScape"/>
                        <Stat label="Competitions" value="3" hint="2025 OCR, 2025 CVR, 2025 Worlds, 2025 SoCal Showdown"/>
                    </div>
                </section>

                <section aria-labelledby="summary" className="mb-12">
                    <h2 id="summary" className="sr-only">My Roles</h2>
                    <h2 className="p-3 font-bold text-3xl">My Responsibilities</h2>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Link href="teamsprocket/cad" className="group block">
                            <div className="relative rounded-2xl border border-white/10 bg-white/5 p-4 pr-10 backdrop-blur transition-colors duration-200 group-hover:bg-white/10">
                                <div className="text-xs uppercase tracking-wide text-white/60">CAD</div>
                                <div className="mt-1 text-2xl font-semibold">Competition Robot CAD</div>
                                <ArrowUpRight
                                    className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70"
                                    aria-hidden="true"
                                />
                            </div>
                        </Link>

                        <Link href="teamsprocket/scouting" className="group block">
                            <div className="relative rounded-2xl border border-white/10 bg-white/5 p-4 pr-10 backdrop-blur transition-colors duration-200 group-hover:bg-white/10">
                                <div className="text-xs uppercase tracking-wide text-white/60">Programming</div>
                                <div className="mt-1 text-2xl font-semibold">Scouting App</div>
                                <ArrowUpRight
                                    className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70"
                                    aria-hidden="true"
                                />
                            </div>
                        </Link>
                    </div>
                </section>

                <h2 className="p-3 font-bold text-3xl">Seasons</h2>
                <section className="mb-16 flex items-center gap-6">

                    <Image src="/2025_logo_animation.gif" alt="ReefScape logo animated" width="200" height="200"
                           className="bg-white rounded-2xl"/>
                    <div>
                        <h2 className="text-4xl font-bold">ReefScape</h2>
                        <p className="mt-2 text-lg text-white/70">
                            First Dive(2024-25)
                        </p>
                        <p className="mt-2 text-sm text-white/70">
                            Competitions: Orange County Regional(3-9-0), Central Valley Regional(5-6-0), World
                            Championships Hopper Division(6-4-0), SoCal ShowDown(Oct 11-12)
                        </p>
                        <p className="mt-2 text-sm text-white/70">
                            Awards: Regional FIRST Impact Award @ OCR, Imagery Award in honor of Jack Kamen @ CVR
                        </p>
                    </div>
                </section>

                <section className="mb-16 flex items-center gap-6">
                    <Image src="/2026_logo_animation.gif" alt="Rebuilt logo animated" width="200" height="200"
                           className="bg-white rounded-2xl"/>
                    <div>
                        <h2 className="text-4xl font-bold">Rebuilt</h2>
                        <p className="mt-2 text-lg text-white/70">
                            First Age(2025-26)
                        </p>
                        <p className="mt-2 text-sm text-white/70">
                            Competitions: TBD
                        </p>
                        <p className="mt-2 text-sm text-white/70">
                            Awards: TBD
                        </p>
                    </div>
                </section>
            </main>
        </>
    );
}

/* ---------- primitives ---------- */

function Card({
                  children,
                  className = "",
              }: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <section className={`rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur ${className}`}>
            {children}
        </section>
    );
}

function Stat({label, value, hint}: { label: string; value: string; hint?: string }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <div className="text-xs uppercase tracking-wide text-white/60">{label}</div>
            <div className="mt-1 text-2xl font-semibold">{value}</div>
            {hint && <div className="mt-1 text-xs text-white/60">{hint}</div>}
        </div>
    );
}

function Shot({
                  src,
                  alt,
                  ratio = "1/1",
              }: {
    src: string;
    alt: string;
    ratio?: "1/1" | "16/10" | "4/5";
}) {
    const ratioClass =
        ratio === "16/10" ? "aspect-[16/10]" : ratio === "4/5" ? "aspect-[4/5]" : "aspect-square";
    return (
        <div className={`relative overflow-hidden rounded-xl border border-white/10 ${ratioClass}`}>
            <Image src={src} alt={alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover"/>
        </div>
    );
}

function InlineImg({src, alt}: { src: string; alt: string }) {
    return (
        <Image
            src={src}
            alt={alt}
            width={960}
            height={720}
            className="rounded-xl border border-white/10 object-contain"
        />
    );
}

function SpecList({title, items}: { title: string; items: string[] }) {
    return (
        <div className="mt-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <ChevronRight className="h-4 w-4"/>
                {title}
            </div>
            <ul className="space-y-1 text-sm text-white/75">
                {items.map((t, i) => (
                    <li key={i}>• {t}</li>
                ))}
            </ul>
        </div>
    );
}

/* ---------- collapsible practice blocks ---------- */

function PracticeBlock({
                           title,
                           summary,
                           gallery,
                           children,
                       }: {
    title: string;
    summary: string;
    gallery: [string, string][];
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const id = useId();

    return (
        <Card>
            <div className="flex flex-col gap-4 md:flex-row md:items-start">
                <div className="md:w-1/2">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="mt-1 text-white/75">{summary}</p>
                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        aria-expanded={open}
                        aria-controls={id}
                        className="mt-3 inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
                    >
                        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}/>
                        {open ? "Hide details" : "Show details"}
                    </button>
                </div>

                <div className="md:w-1/2">
                    <div className="grid grid-cols-2 gap-3">
                        {gallery.map(([src, alt]) => (
                            <Shot key={src} src={src} alt={alt}/>
                        ))}
                    </div>
                </div>
            </div>

            <div
                id={id}
                data-open={open}
                aria-hidden={!open}
                className="mt-5 grid grid-rows-[0fr] transition-all duration-300 ease-in-out data-[open=true]:grid-rows-[1fr]"
            >
                <div className="overflow-hidden">
                    <div className="border-t border-white/10 pt-4">{children}</div>
                </div>
            </div>
        </Card>
    );
}

function Subsys({title, children}: { title: string; children: React.ReactNode }) {
    return (
        <section className="mt-4">
            <h4 className="text-base font-semibold">{title}</h4>
            <div className="mt-2 space-y-2">{children}</div>
        </section>
    );
}

function BadTake({label, points}: { label: string; points: string[] }) {
    return (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-400">
                ⚠ {label}
            </div>
            <ul className="space-y-1 text-sm text-red-200/80">
                {points.map((p, i) => (
                    <li key={i}>• {p}</li>
                ))}
            </ul>
        </div>
    );
}
