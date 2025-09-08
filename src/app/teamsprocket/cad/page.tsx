"use client";

import Image from "next/image";
import { useId, useState } from "react";
import {ChevronDown, ChevronRight, TriangleAlert} from "lucide-react";

/**
 * CAD – Case Study Page (dark, card-driven, fast)
 * - No background/hero images; content-first.
 * - Tight rhythm: 24 / 16 spacing, consistent borders.
 * - Collapsible “Practice” blocks; simple gallery; clear timeline.
 */

export default function CADPage() {
    return (
        <>
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute inset-0 opacity-[0.20] bg-[radial-gradient(900px_560px_at_12%_-8%,#22d3ee,transparent_70%),radial-gradient(900px_560px_at_88%_12%,#a78bfa,transparent_65%)]" />
                <div className="absolute inset-0 mix-blend-overlay [mask-image:linear-gradient(to_bottom,black,transparent_72%)]">
                    <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.2)_1px,transparent_1px)] bg-[size:48px_48px]" />
                </div>
            </div>
        <main className="mx-auto w-full max-w-7xl px-6 py-16 mt-16">
            {/* Header */}
            <header className="mb-10">
                <h1 className="mt-3 text-4xl font-bold tracking-tight">FRC CAD Subteam</h1>
                <p className="mt-3 max-w-2xl text-white/75">
                    My journey so far from first introduction of SolidWorks to making full subsystems to making full robots.
                </p>
            </header>

            {/* Summary strip */}
            <section aria-labelledby="summary" className="mb-12">
                <h2 id="summary" className="sr-only">Summary</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <Stat label="CAD Platform" value="SolidWorks" hint="Fusion → SW transition" />
                    <Stat label="Core Subsystem" value="Climb" hint="Used at Worlds" />
                    <Stat label="Full Bot Practices" value="2" hint="1690&4414 + 2910&1323" />
                    <Stat label="Season(s) survived" value="1" hint="ReefScape" />
                </div>
            </section>

            <section className="mb-16">
                <h2 className="text-4xl font-bold">ReefScape</h2>
                <p className="mt-2 text-lg text-white/70">
                    First Dive(2024-25)
                </p>
                <p className="mt-2 text-sm text-white/70">
                Competitions: Orange County Regional(3-9-0), Central Valley Regional(5-6-0), World Championships(6-4-0), SoCal ShowDown(Oct 11-12)
                </p>
            </section>

            {/* Hero asset row (content-first, no full-bleed) */}
            <section className="mb-14 grid grid-cols-1 gap-6 md:grid-cols-12">
                <Card className="md:col-span-7">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
                        <Image
                            src="/solidworks/{91143FAA-45E0-4EB9-A834-E05C1A57D44C}.png"
                            alt="Final CAD assembly"
                            fill
                            sizes="(min-width: 768px) 60vw, 100vw"
                            className="object-cover"
                            priority
                        />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">Final assembly snapshot</h3>
                    <p className="mt-1 text-sm text-white/70">Lastest cad of our
                        robot before world championships.</p>
                </Card>

                <Card className="md:col-span-5">
                    <h3 className="text-lg font-semibold">Pre-Season</h3>
                    <ul className="mt-3 space-y-2 text-sm text-white/75">
                        <li>• First learning Solidworks.</li>
                        <li>• Don&#39;t understand the assembly first ideology.</li>
                        <li>• Never worked on robots like this.</li>
                        <li>• Don&#39;t know how to do anything.</li>
                    </ul>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <Shot src="/solidworks/Screenshot 2025-01-01 190433.png" alt="Early attempt" ratio="1/1" />
                    </div>
                </Card>
            </section>

            {/* Build season – Intake miss + Climb hit */}
            <section className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-12">
                <Card className="md:col-span-5">
                    <h3 className="text-xl font-semibold">Kickoff intake (scrapped)</h3>
                    <p className="mt-2 text-white/75 pb-3">
                        Looked plausible in CAD, failed in prototyping: poor tolerance to off-axis corals and rebound.
                    </p>
                    <Shot src="/solidworks/Screenshot 2025-01-14 231204.png" alt="Kickoff intake try" ratio="1/1" />
                    <BadTake label="Why it failed" points={[
                        "Too big.",
                        "Structurally unsound, multiple weak connectors.",
                        "Doesn't integrate with the rest of the bot.",
                    ]}/>
                </Card>

                <Card className="md:col-span-7">
                    <h3 className="text-xl font-semibold">Climb subsystem (shipped)</h3>
                    <p className="mt-2 text-white/75">
                        Endgame cage climb: this subsystem&#39;s job is to latch onto a hanging cage at the end of the game, and lift the robot off the ground. This is the sybsystem I found myself working on the most by the end of the season
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <Shot src="/solidworks/{C9458B6B-8225-4316-9C7E-309683CBDC82}.png" alt="Climb concept CAD" />
                        <Shot src="/solidworks/f805624e83623c87c7082c5fd1e75fba.jpg" alt="Drivebase climb test" />
                        <Shot src="/solidworks/58a88204ec28a905ad1667fe61e58dbe.jpg" alt="Worlds climb success" />
                    </div>

                    <SpecList
                        title="Design notes"
                        items={[
                            "Clear load paths transferring force directly into drivebase.",
                            "Existing proven geometry for latch.",
                            "125:1 gearbox plus winch provides necessary force to climb.",
                            "Includes heavy modifications and iterations because the rest of the robot isn't designed with this subsystem in mind.",
                        ]}
                    />
                </Card>
            </section>

            {/* Practice studies (collapsible deep-dives) */}
            <section className="mb-16">
                <h2 className="text-2xl font-bold">Practice studies (reverse engineering)</h2>
                <p className="mt-2 max-w-2xl text-white/70">
                    Cadding practice of other team&#39;s robots purely from robot reveal and match recordings.
                </p>

                <div className="mt-6 space-y-4">
                    <PracticeBlock
                        title="Practice #1 — 1690 × 4414 hybrid"
                        summary="Elements taken from 1690: 4 bar ground intake, ultra-light differential elevator and arm. Elements taken from 4414: motor driven grabber."
                        gallery={[
                            ["/solidworks/{AE219238-8BB7-4E2D-B0AF-E17E795C96DA}.png", "Practice #1 CAD"],
                            ["/solidworks/{DE04C1FD-A281-4AEC-9A13-41A03C5B4156}.png", "Reference robot"],
                        ]}
                    >
                        <Subsys title="Elevator">
                            <p className="text-white/80">
                                2-stage continuous; cascading rigging; differential belt drive with 2× Kraken X60 @ ~5:1.
                            </p>
                            <div className="mt-3 grid grid-cols-2 gap-3">
                                <InlineImg src="/solidworks/{A7574BBF-A191-48AD-9BEF-CA605A55813A}.png" alt="Elevator view" />
                                <InlineImg src="/solidworks/Screenshot 2025-03-10 134357.png" alt="Rigging detail" />
                            </div>
                        </Subsys>
                        <Subsys title="Intake">
                            <p className="text-white/80">
                                Over-bumper with integrated indexer; 4-bar geometry admits messy approaches, compliant structure and rollers.
                            </p>
                            <div className="mt-3 grid grid-cols-2 gap-3">
                                <InlineImg src="/solidworks/{7F8C180E-E30A-4F7E-943C-4D3E5082E3C1}.png" alt="Intake" />
                                <InlineImg src="/solidworks/{BF2AAED7-2041-4930-A4B5-7F1724DCF4A4}.png" alt="Indexer" />
                            </div>
                        </Subsys>
                        <Subsys title="Arm">
                            <p className="text-white/80">
                                Long carbon arm, differentially driven via elevator (no dedicated pivot motor). Handles coral + algae.
                            </p>
                        </Subsys>
                        <BadTake label="What's bad about this design" points={[
                            "Intake geometry deviate a lot from the reference, thus making it untested.",
                            "Elevator carriage and integration with arm not finished.",
                            "No climb.",
                        ]}/>
                    </PracticeBlock>

                    <PracticeBlock
                        title="Practice #2 — 2910 × 1323 blend"
                        summary="Elements taken from 2910: multi-tool hand for algae and coral, capable of ground intake. Elements taken from 1323: elevator, and elevator pivot."
                        gallery={[
                            ["/solidworks/{8B2EC6D4-D0A4-4CB5-9F3B-1B1180A80D9E}.png", "Practice #2 CAD"],
                            ["/solidworks/{D227BF55-ACFA-44EA-AC0F-70747FB6BB4A}.png", "Reference robot"],
                        ]}
                    >
                        <Subsys title="Elevator">
                            <p className="text-white/80">
                                4-stage continuous with Dyneema; 6:1 custom gearbox; pocketed rails; ~135″ total extension.
                            </p>
                            <div className="mt-3">
                                <InlineImg src="/solidworks/{44F91A73-7658-4898-AE80-4C4A43AF14A0}.png" alt="Short-wide elevator" />
                            </div>
                        </Subsys>
                        <Subsys title="Elevator Pivot">
                            <p className="text-white/80">
                                Planetary gearbox + sprockets(~500:1 gear ratio); main superstructure, worst subsystem(working on update that rethinks plate placement, integrated gearbox, and switching unrealistic 0.5in hex shaft with 2in circular shaft).
                            </p>
                        </Subsys>
                        <Subsys title="Hand">
                            <p className="text-white/80">
                                Ground-intake any orientation; holds coral in two orientations (L1 vs L2–L4); algae capable.
                            </p>
                            <div className="mt-3">
                                <InlineImg src="/solidworks/{C2655D9F-F9C1-43DC-A1BF-22620025D351}.png" alt="End effector" />
                            </div>
                        </Subsys>
                        <BadTake label="What's bad about this design" points={[
                            "Overreliance on programming to intake(requires manual indexing to take coral at all), which requires 4 beambreak and a fairly complex algorithm.",
                            "Pivot's shaft is an unrealistic 0.5in hex shaft.",
                            "No electronics apart from motors included.",
                            "No climb.",
                        ]}/>
                    </PracticeBlock>
                </div>
            </section>

            {/* Competition robot */}
            <section className="mb-4 grid grid-cols-1 gap-6 md:grid-cols-12">
                <Card className="md:col-span-5">
                    <h2 className="text-2xl font-bold">Competition robot</h2>
                    <p className="mt-2 text-white/75">The design we brought to the World Championship.</p>
                    <SpecList
                        title="What held up"
                        items={[
                            "Demonstrated climb... at least in our last match.",
                            "Capable of reliably scoring in L2 and L3.",
                            "Capable of defense.",
                        ]}
                    />
                </Card>
                <Card className="md:col-span-7">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
                        <Image
                            src="/solidworks/rDdZRNT.jpeg"
                            alt="Competition robot photo"
                            fill
                            sizes="(min-width: 768px) 60vw, 100vw"
                            className="object-cover"
                        />
                    </div>
                </Card>
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
        <section className={`rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur rounded-xl ${className}`}>
            {children}
        </section>
    );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur rounded-xl">
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
            <Image src={src} alt={alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
        </div>
    );
}

function InlineImg({ src, alt }: { src: string; alt: string }) {
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

function SpecList({ title, items }: { title: string; items: string[] }) {
    return (
        <div className="mt-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <ChevronRight className="h-4 w-4" />
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
                        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
                        {open ? "Hide details" : "Show details"}
                    </button>
                </div>

                <div className="md:w-1/2">
                    <div className="grid grid-cols-2 gap-3">
                        {gallery.map(([src, alt]) => (
                            <Shot key={src} src={src} alt={alt} />
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

function Subsys({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="mt-4">
            <h4 className="text-base font-semibold">{title}</h4>
            <div className="mt-2 space-y-2">{children}</div>
        </section>
    );
}

function BadTake({ label, points }: { label: string; points: string[] }) {
    return (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-400">
                <TriangleAlert className="scale-[0.75]" /> {label}
            </div>
            <ul className="space-y-1 text-sm text-red-200/80">
                {points.map((p, i) => (
                    <li key={i}>• {p}</li>
                ))}
            </ul>
        </div>
    );
}
