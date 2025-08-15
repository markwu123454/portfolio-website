"use client";
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
                Or more specifically Github is a file sharing and hosting website I use for most of my projects.
            </p>
        </div>
    ),
    sklearn: (
        <div className="p-5">
            <h3 className="font-semibold">scikit learn</h3>
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
                A general purpose programming language I use to host backend/server, data processing, and a variety of other programs.
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
            <p className="mt-1 text-sm text-white/80">A cading software I use in Team Sprocket for designing complex subsystems and robot assemblies</p>
        </div>
    ),
    fusion360: (
        <div className="p-5">
            <h3 className="font-semibold">Fusion 360</h3>
            <p className="mt-1 text-sm text-white/80">A cading software I use in various robotics projects for </p>
        </div>
    ),
    raspberrypi: (
        <div className="p-5">
            <h3 className="font-semibold">Raspberry Pi</h3>
            <p className="mt-1 text-sm text-white/80">A mini-computer or microcontroller I used in Dronescape and various other projects.</p>
        </div>
    ),
    bambulab: (
        <div className="p-5">
            <h3 className="font-semibold">Bambu Lab</h3>
            <p className="mt-1 text-sm text-white/80">A 3D printer brand which I utilised a lot in various projects.</p>
        </div>
    ),
    mavlink: (
        <div className="p-5">
            <h3 className="font-semibold">MAVLink</h3>
            <p className="mt-1 text-sm text-white/80">A communication protocol used in my Dronescape project, where I specifically used PyMavLink</p>
        </div>
    ),
};

function keyFromPath(p: string) {
    const base = p.split("/").pop() ?? "";
    return base.replace(/\.(png|jpg|jpeg|webp|svg)$/i, "").toLowerCase();
}

export default function Page() {
    const [activeKey, setActiveKey] = useState<string | null>(null);
    const doubled = useMemo(() => [...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS], []);

    const defaultCard = (
        <div className="p-5">
            <h3 className="text-base font-semibold">Tooling & Stack</h3>
            <p className="mt-1 text-sm text-white/80">
                These are the libraries and tools I have used in past projects.
            </p>
        </div>
    );

    return (
        <main className="bg-black text-white min-h-dvh">
            {/* Scrolling logos */}
            <section className="marquee select-none py-10 border-b border-white/10">
                <div className="track">
                    {doubled.map((src, i) => {
                        const k = keyFromPath(src);
                        return (
                            <div key={`${k}-${i}`} className="mx-10 flex items-center justify-center flex-none h-12">
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
            </section>

            {/* Full-width detail card */}
            <section className="w-full">
                <div className="rounded-none border-t border-white/10 backdrop-blur">
                    {activeKey && detailByKey[activeKey] ? detailByKey[activeKey] : defaultCard}
                </div>
            </section>
        </main>
    );
}
