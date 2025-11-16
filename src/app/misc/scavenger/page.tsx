import Image from "next/image";

const timeline = [
    {
        week: "Week 1 — Kickoff & Planning",
        date: "Sept 15–19",
        summary: [
            "Brainstormed initial design concepts.",
            "Finalized core mechanism idea.",
            "Started CAD for mechanism.",
        ],
        images: ["/scavenger/img.png", "/scavenger/img_1.png"],
    },
    {
        week: "Week 2 — CAD & Prototyping",
        date: "Sept 22–26",
        summary: [
            "Finished initial CAD.",
            "Started ordering materials.",
            "Started planning electronics and programming.",
        ],
        images: [],
    },
    {
        week: "Week 3 — Waiting",
        date: "Sept 29-Oct 3",
        summary: [
            "Waiting for ordered parts to ship.",
            "Started clearing and preparing workshop.",
        ],
        images: [],
    },
    {
        week: "Week 4 — Manufacturing",
        date: "Oct 6–10",
        summary: [
            "Started 3d printing and laser cutting parts.",
            "Cut our aluminum parts.",
            "Tested linear rails.",
        ],
        images: [],
    },
    {
        week: "Week 5 — Assembly",
        date: "Oct 13–17",
        summary: [
            "Cut pvc pipes for water transport.",
            "Built first elevator.",
        ],
        images: [],
    },
    {
        week: "Week 6 — Assembly & Testing",
        date: "Oct 20–24",
        summary: [
            "Programmed the first elevator.",
            "Rigged elevator.",
            "Tested motor torque and speed under load.",
        ],
        images: [],
    },
    {
        week: "Week 7 — Rebuild",
        date: "Oct 27–31",
        summary: [
            "Fixing damages made during incorrect handling.",
            "Remaking parts.",
            "Preparing to build second elevator.",
        ],
        images: [],
    },
    {
        week: "Week 8 — Final Preparation",
        date: "Nov 3–7",
        summary: [
            "Rebuild both elevators.",
            "Modify program to coordinate 2 elevators.",
            "Make backup parts.",
        ],
        images: [],
    },
];

export default function Page() {
    return (
        <main className="relative mx-auto max-w-5xl px-4 py-16 text-white mt-24">
            {/* Background */}
            <div
                className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1000px_600px_at_50%_-10%,rgba(99,102,241,0.15),transparent)]"/>
            <div
                className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-b from-black via-zinc-950 to-black"/>

            {/* Header */}
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold tracking-tight">JPL Invention Challenge Team</h1>
                <p className="mt-2 text-white/70 text-sm">
                    An overview
                </p>
            </header>

            {/* Team Introduction */}
            <section className="mb-16 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
                <div className="flex flex-col gap-8 md:flex-row md:items-center">
                    <div className="flex-1">
                        <h2 className="text-2xl font-semibold mb-3">About the Team</h2>
                        <p className="text-sm text-white/70 leading-relaxed">
                            &#34;The JPL Invention Challenge combines the skills of creativity, team building, designing,
                            fabrication, testing, and solving complex problems into a fun and satisfying contest.&#34;
                        </p>
                        <ul className="mt-5 grid grid-cols-1 gap-2 text-sm text-white/70 sm:grid-cols-2">
                            <li>Captain — <span className="font-medium text-white">Mark, Adam</span></li>
                            <li>CAD Lead — <span className="font-medium text-white">Mark</span></li>
                            <li>Mechanical Lead — <span className="font-medium text-white">Kyle</span></li>
                            <li>Electrical Lead — <span className="font-medium text-white">Adam</span></li>
                            <li>Programming Lead — <span className="font-medium text-white">Andrew</span></li>
                            <li>Publicity Lead — <span className="font-medium text-white">Brista</span></li>
                        </ul>
                    </div>

                    {/* Optional Team Photo */}
                    <div
                        className="relative mx-auto mt-6 w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 md:mt-0 md:max-w-xs">
                        <Image
                            src="/scavenger/image_3.png"
                            alt="JPL Team Photo"
                            width={600}
                            height={400}
                            className="object-cover w-full h-64 md:h-72"
                        />
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="relative border-l border-white/10 pl-6 space-y-12">
                {timeline.map((item, idx) => (
                    <article key={idx} className="relative">
                        {/* Connector dot */}
                        <div
                            className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border border-white/20 bg-white/10"/>

                        {/* Week Header */}
                        <h2 className="text-xl font-semibold">{item.week}</h2>
                        <p className="text-sm text-white/50 mb-2">{item.date}</p>

                        {/* Summary */}
                        <ul className="list-disc pl-5 space-y-1 text-sm text-white/70">
                            {item.summary.map((line, i) => (
                                <li key={i}>{line}</li>
                            ))}
                        </ul>

                        {/* Images */}
                        {item.images && (
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {item.images.map((src, i) => (
                                    <div key={i} className="overflow-hidden rounded-xl border border-white/10">
                                        <Image
                                            src={src}
                                            alt={`${item.week} photo ${i + 1}`}
                                            width={800}
                                            height={600}
                                            className="object-cover w-full h-64 hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </article>
                ))}
            </section>
        </main>
    );
}
