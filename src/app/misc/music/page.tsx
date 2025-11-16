"use client";

import Link from "next/link";
import Image from "next/image";
import {ChevronDown, ArrowUpRight} from "lucide-react";
import {useId, useState} from "react";

export default function MusicPage() {
    return (
        <>
            {/* ---------- BACKDROP ---------- */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                <div
                    className="absolute inset-0 opacity-[0.20] bg-[radial-gradient(900px_560px_at_12%_-8%,#22d3ee,transparent_50%),radial-gradient(900px_560px_at_88%_12%,#a78bfa,transparent_45%)]"
                />
                <div
                    className="absolute inset-0 mix-blend-overlay [mask-image:linear-gradient(to_bottom,black,transparent_72%)]"
                >
                    <div
                        className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.1)_1px,transparent_1px)] bg-[size:48px_48px]"
                    />
                </div>
            </div>

            {/* ---------- MAIN ---------- */}
            <main className="mx-auto w-full max-w-7xl px-6 py-16 mt-16">

                {/* ---------- HEADER ---------- */}
                <header className="mb-10">
                    <h1 className="mt-3 text-5xl font-bold tracking-tight">Music</h1>
                    <p className="mt-3 max-w-2xl text-white/75">
                        Arranging and minimalist composition as structured creative practice.
                        Focus on multi-part remixing, motif-driven systems, and process-based writing.
                    </p>
                    {/* MAIN PROFILE LINK CARD */}
                    <Link href="https://musescore.com/user/50654162" className="group block my-8">
                        <Card className="p-6 relative transition-colors group-hover:bg-white/10">
                            <div className="text-xs uppercase tracking-wide text-white/60">
                                Published Scores
                            </div>
                            <div className="mt-1 text-2xl font-semibold">
                                View All on MuseScore
                            </div>
                            <ArrowUpRight
                                className="absolute right-5 top-1/2 -translate-y-1/2 h-6 w-6 text-white/70"
                            />
                            <p className="mt-3 max-w-xl text-white/70">
                                Full catalog of published arrangements, remixes, and score uploads.
                            </p>
                        </Card>
                    </Link>
                </header>

                {/* ---------- ORIGINAL ---------- */}
                <section className="mb-16">
                    <h2 className="p-3 font-bold text-3xl">Original Composition</h2>

                    <Card>
                        <h3 className="text-2xl font-semibold">Music for Three Musicians (2025)</h3>
                        <p className="mt-1 text-white/70 text-sm">
                            2 minutes • Minimalist / Process-based
                        </p>

                        <PracticeBlock
                            title="Composition Breakdown"
                            summary="Modal system design, phasing structure, additive/subtractive processes, interlocking rhythms."
                            gallery={[]}
                        >
                            <div className="space-y-8 text-white/80 text-sm leading-relaxed">

                                {/* ---------- IFRAME BLOCK ---------- */}
                                <div>
                                    <h4 className="font-semibold mb-2">Score Preview</h4>
                                    <iframe id="score-iframe" width="100%" height="750"
                                            src="https://musescore.com/user/50654162/scores/29403794/embed"
                                            allowFullScreen allow="autoplay; fullscreen"/>
                                </div>

                                {/* ---------- ANALYSIS BLOCKS ---------- */}
                                <h4 className="font-semibold text-2xl mb-1">Section by section analysis</h4>
                                <div>
                                    <h4 className="font-semibold mb-1">A — Additive Buildup</h4>
                                    <p>
                                        Opening system built from C Lydian and C Dorian modal material. Two motifs—one
                                        film-derived, one minimalist—are incrementally assembled until the full cell is
                                        established.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-1">B — Eighth-Note Phase Shift</h4>
                                    <p>
                                        A second voice shifts one 8th note forward every two measures. Because the motif
                                        includes rests and asymmetric durations, each shift creates distinct alignments.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-1">C — Subtractive Filtering</h4>
                                    <p>
                                        At five-eighth offset the outer tones are removed, leaving only internal
                                        interlocking
                                        notes. Rhythmic identity remains while melodic identity dissolves.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-1">D — Mode Pivot (4/4 → 3/4)</h4>
                                    <p>
                                        Tempo relaxes and meter shifts to 3/4. Notes are individually altered to pivot
                                        from
                                        Lydian to Dorian while maintaining contour continuity.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-1">E — Interlocking Syncopation</h4>
                                    <p>
                                        Multiple offset copies of a syncopated four-note cell create a composite
                                        rhythmic
                                        texture, similar to Electric Counterpoint. Vertical sonority arises from
                                        rhythmic
                                        offset, not block harmony.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-1">F — Micro-Phasing (1/64 Note)</h4>
                                    <p>
                                        A derived motif shifts forward by one 64th note per measure, reverses, then
                                        undergoes
                                        a final modal pivot back to Lydian briefly before ending in Dorian.
                                    </p>
                                </div>

                            </div>
                        </PracticeBlock>
                    </Card>
                </section>

                {/* ---------- ARRANGEMENTS ---------- */}
                <section className="mb-16">
                    <h2 className="p-3 font-bold text-3xl">Arrangements & Remixes</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <MusicCard
                            title="Viva la Vida — Coldplay"
                            meta="63 pages • 04:30 • 8 parts"
                            desc=""
                        />

                        <MusicCard
                            title="When Stars and Salt Collide — The Piano Guys"
                            meta="49 pages • 04:05 • 16 parts"
                            desc=""
                        />

                        <MusicCard
                            title="It's Gonna Be OKAY — The Piano Guys"
                            meta="43 pages • 03:44 • 10 parts"
                            desc=""
                        />

                        <MusicCard
                            title="Payphone — Maroon 5"
                            meta="45 pages • 03:56 • 9 parts"
                            desc=""
                        />

                    </div>
                </section>

                {/* ---------- PROCESS ---------- */}
                <section className="mb-16 max-w-3xl">
                    <h2 className="p-3 font-bold text-3xl">About instruments</h2>

                    <p className="text-white/75 text-base leading-relaxed">
                        I&#39;m familiar with various percussion instruments, and played drums for a rock band for four
                        years, I also know how to play clarinet and bass clarinet.
                    </p>

                    <p className="mt-4 text-white/75 text-base leading-relaxed">
                        In music composition I&#39;m most familiar with instruments in rock bands, string ensembles, and
                        concert bands, mainly because I&#39;ve performed in them for multiple years,
                    </p>
                </section>
            </main>
        </>
    );
}

/* ---------- COMPONENTS ---------- */

function Card({children, className = ""}: { children: React.ReactNode; className?: string; }) {
    return (
        <section className={`rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur ${className}`}>
            {children}
        </section>
    );
}

function MusicCard({title, meta, desc}: {
    title: string;
    meta: string;
    desc: string;
}) {
    return (
        <Card>
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="mt-1 text-white/60 text-sm">{meta}</p>
            <p className="mt-3 text-white/75 text-sm">{desc}</p>
        </Card>
    );
}

function PracticeBlock({title, summary, gallery, children}: {
    title: string;
    summary: string;
    gallery: [string, string][];
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const id = useId();

    return (
        <div className="mt-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start">
                <div className="md:w-1/2">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="mt-1 text-white/75">{summary}</p>
                    <button
                        onClick={() => setOpen(!open)}
                        aria-expanded={open}
                        aria-controls={id}
                        className="mt-3 inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                    >
                        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}/>
                        {open ? "Hide details" : "Show details"}
                    </button>
                </div>

                <div className="md:w-1/2 grid grid-cols-2 gap-3">
                    {gallery.map(([src, alt]) => (
                        <Shot key={src} src={src} alt={alt}/>
                    ))}
                </div>
            </div>

            <div
                id={id}
                data-open={open}
                aria-hidden={!open}
                className="mt-5 grid grid-rows-[0fr] transition-all duration-300 ease-in-out data-[open=true]:grid-rows-[1fr]"
            >
                <div className="overflow-hidden border-t border-white/10 pt-4">
                    {children}
                </div>
            </div>
        </div>
    );
}

function Shot({src, alt}: { src: string; alt: string }) {
    return (
        <div className="relative overflow-hidden rounded-xl border border-white/10 aspect-square">
            <Image src={src} alt={alt} fill className="object-cover rounded-xl"/>
        </div>
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
