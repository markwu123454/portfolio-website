"use client";

import UnderConstruction, { Stage } from "@/components/NotImplemented";

export default function Page() {
    const stages: Stage[] = [
        { label: "Preparing", status: "done" },
        { label: "Drafting", status: "done" },
        { label: "Reviewing", status: "in_progress" },
        { label: "Polishing", status: "in_progress" },
    ];

    return (
        <UnderConstruction
            name="Computed Aided Design"
            stages={stages}
            channelStatus="active"
            preview={<CADPage />}
        />
    );
}




import Image from "next/image";
import {useId, useState} from "react";
import {ChevronDown} from "lucide-react";

function CADPage() {
    const [p1Open, setP1Open] = useState(false);
    const [p2Open, setP2Open] = useState(false);
    const p1Id = useId();
    const p2Id = useId();

    return (
        <main className="flex flex-col">

            {/* Hero */}
            <section id="intro" className="pt-24 relative h-screen">
                <Image
                    src="/solidworks/{91143FAA-45E0-4EB9-A834-E05C1A57D44C}.png"
                    alt="Team Sprocket reefscape final cad"
                    fill
                    sizes="100vw"
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t to-black/50 via-black/0 from-black/0"
                     aria-hidden="true"/>
                <div className="absolute inset-0 bg-black/45" aria-hidden="true"/>
                <div className="relative z-10 mx-auto max-w-6xl h-full flex items-center">
                    <div className="px-6 pb-14">
                        <h1 className="text-5xl font-bold">FRC ReefScape</h1>
                        <p className="mt-4 max-w-xl text-white/80 text-lg">
                            How I learned SolidWorks.
                        </p>
                    </div>
                </div>
            </section>

            {/* Intro + Preseason (combined) */}
            <section className="relative h-[100vh] flex items-center">
                <Image
                    src="/solidworks/Screenshot 2025-01-01 190433.png"
                    alt="Early CAD attempts"
                    fill
                    sizes="100vw"
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/0 to-black/0"
                     aria-hidden="true"/>
                <div className="absolute inset-0 bg-black/45" aria-hidden="true"/>
                <div className="relative z-10 mx-auto max-w-5xl px-6">
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-8 backdrop-blur">
                        <h2 className="text-3xl font-bold mb-4">Intro to SolidWorks</h2>
                        <div className="space-y-3 text-white/85">
                            <p>I came from Fusion 360, and during preseason I learned solidworks, the most I can say is
                                I know how solidwork works.</p>
                            <p></p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Beginning of Build Season */}
            <section id="build-start" className="mx-auto max-w-6xl px-6 py-24 grid md:grid-cols-2 gap-10 items-center">
                <figure className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10">
                    <Image
                        src="/solidworks/Screenshot 2025-01-14 231204.png"
                        alt="Early subsystem attempt"
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                    />
                </figure>
                <div>
                    <h2 className="text-3xl font-bold mb-4">Season kickoff</h2>
                    <p className="text-white/85">
                        I started the season trying to design the intake, which after prototyping, resulted in this.
                        Thankfully this wasn&#39;t used in robot.
                    </p>
                </div>
            </section>

            {/* End of Build Season */}
            <section id="build-end" className="mx-auto max-w-6xl px-6 py-24">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-3">Build season</h2>
                    <p className="text-white/85">
                        After failing to design the intake, my main contribution is the climb subsystem, which is used
                        for the endgame scoring where the robot need to climb a &#34;cage&#34;.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <figure className="relative">
                        <Shot src="/solidworks/{C9458B6B-8225-4316-9C7E-309683CBDC82}.png"
                              alt="Climb subsystem—CAD concept"/>
                        <figcaption className="mt-3 text-sm text-white/70">CAD concept of the climb.</figcaption>
                    </figure>

                    <figure className="relative">
                        <Shot src="/solidworks/f805624e83623c87c7082c5fd1e75fba.jpg" alt="Drivebase climb test"/>
                        <figcaption className="mt-3 text-sm text-white/70">drivebase testing and iteration.</figcaption>
                    </figure>

                    <figure className="relative">
                        <Shot
                            src="/solidworks/58a88204ec28a905ad1667fe61e58dbe.jpg"
                            alt="Robot climbing at World Championships"
                            className="scale-200"
                        />
                        <figcaption className="mt-3 text-sm text-white/70">successful climb at Worlds.</figcaption>
                    </figure>
                </div>
            </section>

            {/* Design Iterations (clones) */}
            <section id="iterations" className="px-6 py-24 bg-white/5 border-y border-white/10">
                <div className="mx-auto max-w-6xl">
                    <h2 className="text-3xl font-bold mb-4">Practice builds</h2>
                    <p className="text-white/80 max-w-2xl mb-10">
                        I reverse-engineered top robots from reveal and match footage. These are planning-phase studies;
                        many parts are placeholders, so it will look less clean and polished than the referenced CAD.
                    </p>

                    {/* Practice #1 + comparison */}
                    <div className="mb-14">
                        <h3 className="text-2xl font-semibold mb-4">Practice #1</h3>
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <Shot src="/solidworks/{AE219238-8BB7-4E2D-B0AF-E17E795C96DA}.png" alt="first practice cad" />
                            <Shot src="/solidworks/{DE04C1FD-A281-4AEC-9A13-41A03C5B4156}.png" alt="orbit reefscape robot" />
                        </div>
                        <p className="mt-4 text-white/85">
                            Hybrid of Orbit (1690) and HighTide (4414): 2-stage elevator + long differential-driven arm, low ground intake.
                        </p>

                        {/* Inline expand/collapse */}
                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={() => setP1Open(v => !v)}
                                aria-expanded={p1Open}
                                aria-controls={p1Id}
                                className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
                            >
                                <ChevronDown className={`h-4 w-4 transition-transform ${p1Open ? "rotate-180" : ""}`} />
                                {p1Open ? "Hide details" : "Show details"}
                            </button>

                            {/* Smooth height transition using CSS grid rows trick */}
                            <div
                                id={p1Id}
                                data-open={p1Open}
                                aria-hidden={!p1Open}
                                className="mt-3 grid grid-rows-[0fr] transition-all duration-300 ease-in-out data-[open=true]:grid-rows-[1fr]"
                            >
                                <div className="overflow-hidden">
                                    <h3 className="text-lg font-semibold mb-2">Subsystems</h3>

                                    {/* Elevator — split L/R with stacked images */}
                                    <section className="mt-2 grid gap-6 md:grid-cols-5 items-start">
                                        <div className="md:col-span-3">
                                            <h4 className="text-lg font-semibold mb-1">Elevator</h4>
                                            <p className="mb-3 text-white/80">
                                                2-stage continuous with carriage; ultra-thin, low-mass. Rigging: cascading,
                                                differential belt-drive elevator powered by 2× Kraken X60 through 5:1 planetary gearbox.
                                            </p>
                                        </div>

                                        {/* side-by-side images */}
                                        <div className="md:col-span-2 grid grid-cols-2 gap-3">
                                            <Image
                                                src="/solidworks/{A7574BBF-A191-48AD-9BEF-CA605A55813A}.png"
                                                alt="Orbit copy elevator"
                                                width={480}
                                                height={360}
                                                sizes="(min-width: 768px) 260px, 50vw"
                                                className="rounded-xl border border-white/10 shadow-sm object-contain"
                                            />
                                            <Image
                                                src="/solidworks/Screenshot 2025-03-10 134357.png"
                                                alt="Orbit copy elevator rigging"
                                                width={480}
                                                height={360}
                                                sizes="(min-width: 768px) 260px, 50vw"
                                                className="rounded-xl border border-white/10 shadow-sm object-contain"
                                            />
                                        </div>
                                    </section>


                                    {/* Intake — float/wrap lead image + gallery */}
                                    <section className="mt-6">
                                        <div className="relative">
                                            <div
                                                className="float-left mr-4 mb-2 overflow-hidden rounded-xl border border-white/10"
                                                style={{ shapeOutside: "inset(0 round 12px)" }}
                                            >
                                                <Image
                                                    src="/solidworks/Screenshot 2025-03-14 142537.png"
                                                    alt="Intake geometry test"
                                                    width={420}
                                                    height={420}
                                                    className="block"
                                                />
                                            </div>
                                            <h4 className="text-lg font-semibold mb-1">Intake</h4>
                                            <p className="mb-3 text-white/80">
                                                Over-bumper coral intake with integrated indexer. 4-bar geometry enables intake and indexing from any orientation.
                                            </p>
                                            <ul className="mb-4 text-white/70 list-disc text-sm">
                                                <li className="ml-5">Front roller compliant; rear roller positive drive to indexer.</li>
                                                <li className="ml-5">Tip-in angle tuned to minimize bounce and jams.</li>
                                            </ul>
                                        </div>
                                        <div className="clear-both" />
                                        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            <Image
                                                src="/solidworks/{7F8C180E-E30A-4F7E-943C-4D3E5082E3C1}.png"
                                                alt="Orbit copy intake"
                                                width={960}
                                                height={720}
                                                className="rounded-xl border border-white/10 shadow-sm"
                                            />
                                            <Image
                                                src="/solidworks/{BF2AAED7-2041-4930-A4B5-7F1724DCF4A4}.png"
                                                alt="Orbit copy intake indexer"
                                                width={960}
                                                height={720}
                                                className="rounded-xl border border-white/10 shadow-sm"
                                            />
                                        </div>
                                    </section>

                                    {/* Arm — full-width with side spec note */}
                                    <section className="mt-6 grid gap-4 md:grid-cols-5">
                                        <div className="md:col-span-3">
                                            <h4 className="text-lg font-semibold mb-1">Arm</h4>
                                            <p className="mb-1 text-white/80">
                                                Long carbon-fiber arm; no dedicated pivot motor—differentially driven via elevator. Ultra-light with multi-tool at tip; Kraken X44. Handles coral and algae.
                                            </p>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Practice #2 + comparison */}
                    <div>
                        <h3 className="text-2xl font-semibold mb-4">Practice #2</h3>
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <Shot src="/solidworks/{8B2EC6D4-D0A4-4CB5-9F3B-1B1180A80D9E}.png" alt="second practice cad" />
                            <Shot src="/solidworks/{D227BF55-ACFA-44EA-AC0F-70747FB6BB4A}.png" alt="jack in the bot reefscape robot" />
                        </div>
                        <p className="mt-4 text-white/85">
                            Blend of Jack in the Bot (2910) and MadTown (1323): pivoting elevator with multi-tool at wrist.
                        </p>

                        {/* Inline expand/collapse */}
                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={() => setP2Open(v => !v)}
                                aria-expanded={p2Open}
                                aria-controls={p2Id}
                                className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
                            >
                                <ChevronDown className={`h-4 w-4 transition-transform ${p2Open ? "rotate-180" : ""}`} />
                                {p2Open ? "Hide details" : "Show details"}
                            </button>

                            <div
                                id={p2Id}
                                data-open={p2Open}
                                aria-hidden={!p2Open}
                                className="mt-3 grid grid-rows-[0fr] transition-all duration-300 ease-in-out data-[open=true]:grid-rows-[1fr]"
                            >
                                <div className="overflow-hidden">
                                    <h3 className="text-lg font-semibold mb-2">Subsystems</h3>

                                    {/* Elevator — split L/R */}
                                    <section className="mt-2 grid gap-6 md:grid-cols-5 items-start">
                                        <div className="md:col-span-3">
                                            <h4 className="text-lg font-semibold mb-1">Elevator</h4>
                                            <p className="mb-3 text-white/80">
                                                4-stage, short-and-wide continuous elevator using Dyneema rope; 6:1 custom gearbox. Pivot motor for the arm shares the stack. Pocketed rails for mass reduction. ~135″ total extension.
                                            </p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <Image
                                                src="/solidworks/{44F91A73-7658-4898-AE80-4C4A43AF14A0}.png"
                                                alt="JitB copy elevator"
                                                width={960}
                                                height={720}
                                                sizes="(min-width: 768px) 560px, 100vw"
                                                className="rounded-xl border border-white/10 shadow-sm"
                                            />
                                        </div>
                                    </section>

                                    {/* Pivot — wide text, compact visual */}
                                    <section className="mt-6 grid gap-4 md:grid-cols-5 items-start">
                                        <div className="md:col-span-3">
                                            <h4 className="text-lg font-semibold mb-1">Pivot</h4>
                                            <p className="mb-3 text-white/80">
                                                Gearbox embedded in the main superstructure (~500:1). Shoulder bearings captured both sides; absolute encoder on the final stage.
                                            </p>
                                        </div>
                                    </section>

                                    {/* Hand — float/wrap layout */}
                                    <section className="mt-6">
                                        <div className="relative">
                                            <div
                                                className="float-left mr-4 mb-2 overflow-hidden rounded-xl border border-white/10"
                                                style={{ shapeOutside: "inset(0 round 12px)" }}
                                            >
                                                <Image
                                                    src="/solidworks/{C2655D9F-F9C1-43DC-A1BF-22620025D351}.png"
                                                    alt="JitB copy hand"
                                                    width={420}
                                                    height={420}
                                                    className="block"
                                                />
                                            </div>
                                            <h4 className="text-lg font-semibold mb-1">Hand (end effector / multi-tool)</h4>
                                            <p className="mb-3 text-white/80">
                                                Ground intake from any orientation; compact package. Holds coral in two orientations (L1 vs L2–L4). Can ground-intake and scoree algae.
                                            </p>
                                            <ul className="mb-2 text-white/70 list-disc pl-5 text-sm">
                                                <li>~300 degrees pivot.</li>
                                                <li>Hard stops at floor-pickup.</li>
                                            </ul>
                                        </div>
                                        <div className="clear-both" />
                                    </section>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Worlds */}
            <section id="worlds" className="mx-auto max-w-6xl px-6 py-24 grid md:grid-cols-2 gap-10 items-center">
                <figure className="relative aspect-[0.8/1] overflow-hidden rounded-3xl border border-white/10">
                    <Image
                        src="/solidworks/rDdZRNT.jpeg"
                        alt="Final ReefScape robot"
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                    />
                </figure>
                <div>
                    <h2 className="text-3xl font-bold mb-4">Competition robot</h2>
                    <p className="text-white/85">
                        Team Sprocket’s final design — the robot we brought to World Championships.
                    </p>
                </div>
            </section>

        </main>
    );
}

/* ---------- minimal helpers (no frames, no captions) ---------- */

function Shot({src, alt, className}: { src: string; alt: string; className?: string }) {
    return (
        <div className="relative aspect-[1/1] overflow-hidden rounded-2xl border border-white/10">
            <Image src={src} alt={alt} fill className={`object-cover ${className ?? ""}`}/>
        </div>
    );
}
