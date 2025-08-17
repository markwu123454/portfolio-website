"use client";
// from-black via-zinc-700 to-zinc-200
import Link from "next/link";
import JsonLd from "@/components/JsonLD";
import {JSX, useMemo, useState} from "react";

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
] as const;

// 2) Per-logo JSX detail (keys = filename sans extension)
const detailByKey: Record<string, JSX.Element> = {
    tensorflow: (
        <div className="p-5">
            <h3 className="font-semibold">TensorFlow</h3>
            <p className="mt-1 text-sm text-white/80">
                TensorFlow is an ai training library developed by Google, in the past smaller projects I have utilised it in training feature recognition, regression, and classification models.
            </p>
        </div>
    ),
    git: (
        <div className="p-5">
            <h3 className="font-semibold">Git</h3>
            <p className="mt-1 text-sm text-white/80">
                Or more specifically Github is a file sharing and hosting website I use for most of my projects. Git(Github) is used in all my projects.
            </p>
        </div>
    ),
    sklearn: (
        <div className="p-5">
            <h3 className="font-semibold">SciKit Learn</h3>
            <p className="mt-1 text-sm text-white/80">
                A python ml library I used in the Team Sprocket Scouting app to process data using various models. SKLearn is used in the Scouting App.
            </p>
        </div>
    ),
    postgresql: (
        <div className="p-5">
            <h3 className="font-semibold">PostGreSQL</h3>
            <p className="mt-1 text-sm text-white/80">
                Opensource database I used in the Team Sprocket Scouting app to store and retrieve generated data. PostGre is used in the Scouting App and The Gradebook.
            </p>
        </div>
    ),
    next: (
        <div className="p-5">
            <h3 className="font-semibold">Next.js</h3>
            <p className="mt-1 text-sm text-white/80">
                A typescript framework that incorporate frontend and backend that I used for this website. Next.js(and vercel) is used in The GradeBook and this website.
            </p>
        </div>
    ),
    typescript: (
        <div className="p-5">
            <h3 className="font-semibold">TypeScript</h3>
            <p className="mt-1 text-sm text-white/80">
                A popular programming language that is commonly used in web development. TS is used in The GradeBook, this website, Aetherius GCS, and the Scouting App.
            </p>
        </div>
    ),
    react: (
        <div className="p-5">
            <h3 className="font-semibold">React</h3>
            <p className="mt-1 text-sm text-white/80">
                A typescript framework I used in multiple other projects. React is used in The GradeBook, this website, Aetherius GCS, and the Scouting App.
            </p>
        </div>
    ),
    tailwind: (
        <div className="p-5">
            <h3 className="font-semibold">Tailwind CSS</h3>
            <p className="mt-1 text-sm text-white/80">
                A useful css replacement tool I use on all my web projects to improve ui and presentation. TailWind is used in The GradeBook, this website, Aetherius GCS, and the Scouting App.
            </p>
        </div>
    ),
    python: (
        <div className="p-5">
            <h3 className="font-semibold">Python</h3>
            <p className="mt-1 text-sm text-white/80">
                A general purpose programming language I use to host backend/server, data processing, and a variety of other programs. Python is used in Aetherius GCS and the Scouting App.
            </p>
        </div>
    ),
    fastapi: (
        <div className="p-5">
            <h3 className="font-semibold">FastAPI</h3>
            <p className="mt-1 text-sm text-white/80">
                A Python backend library I commonly use with React. Fastapi(and uvicorn) is used in Aetherius GCS and the Scouting App.
            </p>
        </div>
    ),
    solidworks: (
        <div className="p-5">
            <h3 className="font-semibold">SolidWorks</h3>
            <p className="mt-1 text-sm text-white/80">A cading software I use in Team Sprocket for designing complex subsystems and robot assemblies. SolidWorks is used in Team Sprocket and SigmaCat Robotics.</p>
        </div>
    ),
    fusion360: (
        <div className="p-5">
            <h3 className="font-semibold">Fusion 360</h3>
            <p className="mt-1 text-sm text-white/80">A cading software I use in various robotics projects. </p>
        </div>
    ),
    raspberrypi: (
        <div className="p-5">
            <h3 className="font-semibold">Raspberry Pi</h3>
            <p className="mt-1 text-sm text-white/80">A mini-computer or microcontroller I used in Dronescape and various other projects. Raspberry pi is used in Aetherius UAV</p>
        </div>
    ),
    bambulab: (
        <div className="p-5">
            <h3 className="font-semibold">Bambu Lab</h3>
            <p className="mt-1 text-sm text-white/80">A 3D printer brand which I utilised a lot in various projects. BambuLab (specifically A1 & X1C, and studio) is used in Team Sprocket, Aetherius UAV, and Team Infernope.</p>
        </div>
    ),
    mavlink: (
        <div className="p-5">
            <h3 className="font-semibold">MAVLink</h3>
            <p className="mt-1 text-sm text-white/80">A communication protocol used in my Dronescape project, where I specifically used PyMavLink. Mavlink(and PixHawk and ArduPilot) is used in Aetherius UAV & GCS.</p>
        </div>
    ),
};

const defaultCard = (
    <div className="p-5">
        <h3 className="text-base font-semibold">Tooling & Stack</h3>
        <p className="mt-1 text-sm text-white/80">
            These are the libraries and tools I have used in past projects.
        </p>
    </div>
);

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

    return (
        <div
            className="flex flex-col justify-start min-h-screen pt-10 space-y-8 bg-gradient-to-b text-white">
            <JsonLd id="person-jsonld" data={person}/>
            {/* Hero Section */}
            <section className="pt-24 max-w-5xl px-10">
                <h1 className="text-5xl font-extrabold tracking-tight">
                    Hi! I&#39;m Mark.
                </h1>
                <p className="mt-4 text-lg text-gray-300">
                    This website is a showcase of my teams and projects. Explore my work in
                    software development, and robotics.
                </p>
            </section>

            {/* Featured Projects Placeholder */}
            <section className="max-w-6xl px-10">
                <h2 className="text-2xl font-bold mb-4">Featured Projects</h2>
                <div className="grid gap-6 md:grid-cols-3">
                    <div
                        className="rounded-lg bg-zinc-900/80 border border-white/10 p-4 hover:bg-zinc-800 transition-colors"
                    >
                        <h3 className="text-xl font-semibold">Aetherius UAV</h3>
                        <p className="mt-2 text-gray-400">
                            A twin bloom drone for long duration mission, mainly terrain mapping, using a onboard raspberry pi to communicate to a custom ground control station.
                        </p>
                        <a className="mt-3 text-sm font-medium text-white/80 hover:text-white underline" href="/dronescape/uav">
                            See more →
                        </a>
                    </div>

                    <div
                        className="rounded-lg bg-zinc-900/80 border border-white/10 p-4 hover:bg-zinc-800 transition-colors"
                    >
                        <h3 className="text-xl font-semibold">FRC Scouting App</h3>
                        <p className="mt-2 text-gray-400">
                            A scouting app for FRC that I developed, which use a react frontend and python FastAPI backend, it features live sync over HTTPS, live AI powered data analytics, and full offline scouting.
                        </p>
                        <a className="mt-3 text-sm font-medium text-white/80 hover:text-white underline" href="/teamsprocket/scouting">
                            See more →
                        </a>
                    </div>

                    <div
                        className="rounded-lg bg-zinc-900/80 border border-white/10 p-4 hover:bg-zinc-800 transition-colors"
                    >
                        <h3 className="text-xl font-semibold">The GradeBook</h3>
                        <p className="mt-2 text-gray-400">
                            Following the footsteps of the BerkeleyTime project made by students in UC Berkeley, The GradeBook aims to help students with course selection in Diamond Bar High School.
                        </p>
                        <a className="mt-3 text-sm font-medium text-white/80 hover:text-white underline" href="/misc/ratemyteacher">
                            See more →
                        </a>
                    </div>
                </div>
            </section>

            <section className="select-none py-10 border-b border-white/10">
                <div className="marquee">
                    <div className="track flex items-center overflow-x-hidden overflow-y-visible">
                        {doubled.map((src, i) => {
                            const k = keyFromPath(src);
                            return (
                                <div
                                    key={`${k}-${i}`}
                                    className="px-10 flex items-center justify-center flex-none min-h-28 logo-tile"  // was h-12
                                >
                                    <button
                                        className="group rounded-md outline-none focus-visible:ring-2 focus-visible:ring-white/40 flex-none"
                                        onMouseEnter={() => setActiveKey(k)}
                                        onFocus={() => setActiveKey(k)}
                                        onMouseLeave={() => setActiveKey(null)}
                                        onBlur={() => setActiveKey(null)}
                                    >
                                        <img
                                            src={src}
                                            alt={k}
                                            draggable={false}
                                            className="h-20 w-auto opacity-90 transition group-hover:opacity-100 select-none flex-none shrink-0 hover:scale-120"
                                        />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-none border-t border-white/10 backdrop-blur mt-4">
                    {activeKey && detailByKey[activeKey] ? detailByKey[activeKey] : defaultCard}
                </div>
            </section>


            {/* Contact Section */}
            <section className="max-w-4xl space-y-3 px-10">
                <h2 className="text-2xl font-bold">Links</h2>
                <p className="text-gray-300">
                    Interested in collaborating or learning more about my work?
                    Reach out via the contact form.
                </p>
                <div className="flex gap-4">
                    <a
                        href="https://mail.google.com/mail/?view=cm&fs=1&to=me@markwu.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white
             border border-white/20 bg-black/40 backdrop-blur
             hover:bg-white/20 transition focus:outline-none focus:ring-2 focus:ring-white/30"
                    >
                        <img
                            src="/gmail.png"
                            alt="Gmail"
                            className="scale-120"
                            width={20}
                            height={20}
                        />
                        <span className="font-medium">Email Me</span>
                    </a>

                    <Link
                        href="https://github.com/markwu123454"
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-white
                 border border-white/20 bg-black/40 backdrop-blur
                 hover:bg-white/20 transition focus:outline-none focus:ring-2 focus:ring-white/30"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16">
                            <path fill="currentColor" fillRule="evenodd"
                                  d="M7.976 0A7.977 7.977 0 0 0 0 7.976c0 3.522 2.3 6.507 5.431 7.584c.392.049.538-.196.538-.392v-1.37c-2.201.49-2.69-1.076-2.69-1.076c-.343-.93-.881-1.175-.881-1.175c-.734-.489.048-.489.048-.489c.783.049 1.224.832 1.224.832c.734 1.223 1.859.88 2.3.685c.048-.538.293-.88.489-1.076c-1.762-.196-3.621-.881-3.621-3.964c0-.88.293-1.566.832-2.153c-.05-.147-.343-.978.098-2.055c0 0 .685-.196 2.201.832c.636-.196 1.322-.245 2.007-.245s1.37.098 2.006.245c1.517-1.027 2.202-.832 2.202-.832c.44 1.077.146 1.908.097 2.104a3.16 3.16 0 0 1 .832 2.153c0 3.083-1.86 3.719-3.62 3.915c.293.244.538.733.538 1.467v2.202c0 .196.146.44.538.392A7.984 7.984 0 0 0 16 7.976C15.951 3.572 12.38 0 7.976 0"
                                  clipRule="evenodd"/>
                        </svg>
                        <span className="font-medium">GitHub Profile</span>
                    </Link>
                </div>
            </section>
        </div>
    );
}
