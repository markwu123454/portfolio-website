export const metadata = {
    title: "JPL Team — Portfolio",
    description: "Quick status page for the JPL team with the upcoming competition date.",
};

export default function Page() {
    return (
        <main className="relative mx-auto max-w-6xl px-4 py-16 text-white mt-24">
            {/* Background (dark mode, subtle grid + vignette) */}
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(99,102,241,0.15),transparent),radial-gradient(800px_400px_at_90%_10%,rgba(56,189,248,0.12),transparent)]" />
            <div className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-b from-black via-zinc-950 to-black" />

            <section className="relative rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
                <header className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <h1 className="text-3xl font-bold tracking-tight">JPL Team</h1>
                    <span className="rounded-full border border-white/10 bg-white/10 px-4 py-1 text-sm/6 font-medium">
            Competition — Oct 13
          </span>
                </header>

                {/* Leadership */}
                <section className="mb-6 rounded-2xl border border-white/10 bg-black/30 p-6">
                    <h2 className="text-lg font-semibold">Leadership</h2>
                    <ul className="mt-3 grid grid-cols-1 gap-2 text-sm text-white/70 sm:grid-cols-2">
                        <li>Captain — <span className="font-medium text-white">Mark Wu</span></li>
                        <li>CAD Lead — <span className="font-medium text-white">Mark Wu</span></li>
                        <li>Mechanical Lead — <span className="font-medium text-white">Kyle</span></li>
                        <li>Electrical Lead — <span className="font-medium text-white">Adam</span></li>
                        <li>Programming Lead — <span className="font-medium text-white">Joshua</span></li>
                        <li>Publicity Lead — <span className="font-medium text-white">Brista</span></li>
                    </ul>
                </section>

                {/* Blurb */}
                <p className="mb-6 text-sm text-white/70">
                    We are 1 week in and 3 weeks away from the competition on Oct 13. Currently finalizing CAD, electrical systems, drafting program, and preparing to manufacture. Learn more about the event on the official site:{' '}
                    <a
                        href="https://www.jpl.nasa.gov/jpl-and-the-community/team-competitions/invention-challenge/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-white/40 underline-offset-4 hover:text-white"
                    >
                        JPL Invention Challenge
                    </a>.
                </p>

                {/* This Week by Subteam */}
                <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
                    <h2 className="text-lg font-semibold">This Week</h2>
                    <div className="mt-3 grid grid-cols-1 gap-4 text-sm text-white/70 md:grid-cols-2">
                        <div>
                            <h3 className="font-medium text-white">CAD</h3>
                            <ul className="mt-2 list-disc space-y-1 pl-5">
                                <li>Finalize part models</li>
                                <li>Review assembly clearances</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-medium text-white">Mechanical</h3>
                            <ul className="mt-2 list-disc space-y-1 pl-5">
                                <li>Prep jigs for manufacturing</li>
                                <li>Check machining tolerances</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-medium text-white">Electrical</h3>
                            <ul className="mt-2 list-disc space-y-1 pl-5">
                                <li>Finalize wiring layout</li>
                                <li>Order missing components</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-medium text-white">Programming</h3>
                            <ul className="mt-2 list-disc space-y-1 pl-5">
                                <li>Draft program structure</li>
                                <li>Integrate with hardware mockups</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-medium text-white">Publicity</h3>
                            <ul className="mt-2 list-disc space-y-1 pl-5">
                                <li>Create build log content</li>
                                <li>Update team portfolio entry</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">=
                    <div className="flex gap-2">
                        <a
                            href="https://www.jpl.nasa.gov/jpl-and-the-community/team-competitions/invention-challenge/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
                        >
                            Invention Challenge
                        </a>
                    </div>
                </footer>
            </section>
        </main>
    );
}
