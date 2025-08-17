
import Image from "next/image";

export default function CADPage() {
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
                <div className="absolute inset-0 bg-gradient-to-t to-black/50 via-black/0 from-black/0" aria-hidden="true" />
                <div className="absolute inset-0 bg-black/45" aria-hidden="true" />
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
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/0 to-black/0" aria-hidden="true" />
                <div className="absolute inset-0 bg-black/45" aria-hidden="true" />
                <div className="relative z-10 mx-auto max-w-5xl px-6">
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-8 backdrop-blur">
                        <h2 className="text-3xl font-bold mb-4">Intro to SolidWorks</h2>
                        <div className="space-y-3 text-white/85">
                            <p>I came from Fusion 360, and during preseason I learned solidworks, the most I can say is I know how solidwork works.</p>
                            <p> </p>
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
                        I started the season trying to design the intake, which after prototyping, resulted in this. Thankfully this wasn&#39;t used in robot.
                    </p>
                </div>
            </section>

            {/* End of Build Season */}
            <section id="build-end" className="mx-auto max-w-6xl px-6 py-24">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-3">Build season</h2>
                    <p className="text-white/85">
                        After failing to design the intake, my main contribution is the climb subsystem, which is used for the endgame scoring where the robot need to climb a &#34;cage&#34;.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <figure className="relative">
                        <Shot src="/solidworks/{C9458B6B-8225-4316-9C7E-309683CBDC82}.png" alt="Climb subsystem—CAD concept" />
                        <figcaption className="mt-3 text-sm text-white/70">CAD concept of the climb.</figcaption>
                    </figure>

                    <figure className="relative">
                        <Shot src="/solidworks/f805624e83623c87c7082c5fd1e75fba.jpg" alt="Drivebase climb test" />
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
                        I reverse-engineered top robots from reveal and match footage. These are planning-phase studies; many parts are placeholders, so it will look less clean and polished than the referenced cad.
                    </p>

                    {/* Clone #1 + comparison */}
                    <div className="mb-14">
                        <h3 className="text-2xl font-semibold mb-4">Practice #1</h3>
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <Shot src="/solidworks/{AE219238-8BB7-4E2D-B0AF-E17E795C96DA}.png" alt="first practice cad" />
                            <Shot src="/solidworks/{DE04C1FD-A281-4AEC-9A13-41A03C5B4156}.png" alt="orbit reefscape robot" />
                        </div>
                        <p className="mt-4 text-white/85">
                            Hybrid design of Orbit (1690) and HighTide (4414): elevator with long differential driven arm and low ground intake.
                        </p>
                    </div>

                    {/* Clone #2 + comparison */}
                    <div>
                        <h3 className="text-2xl font-semibold mb-4">Practice #2</h3>
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <Shot src="/solidworks/{8B2EC6D4-D0A4-4CB5-9F3B-1B1180A80D9E}.png" alt="second practice cad" />
                            <Shot src="/solidworks/{D227BF55-ACFA-44EA-AC0F-70747FB6BB4A}.png" alt="jack in the bot reefscape robot" />
                        </div>
                        <p className="mt-4 text-white/85">
                            Blend of Jack in the Bot (2910) and MadTown (1323): pivoting elevator with pivoting multitool on the end.
                        </p>
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
