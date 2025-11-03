import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: "About — Mark Wu",
    description: "Robotics engineer and software developer specializing in autonomy, embedded systems, and full-stack design.",
}

export default function AboutPage() {
    return (
        <main className="bg-black text-neutral-200 min-h-screen">
            <div className="max-w-5xl mx-auto px-6">
                {/* 1) Hero / Intro */}
                <section className="mt-24 pt-12" aria-labelledby="hero-title">
                    <h1 id="hero-title" className="text-3xl md:text-5xl font-semibold tracking-tight text-white">
                        Mark Wu — Robotics Engineer & Software Developer
                    </h1>
                    <p className="mt-4 text-base md:text-lg text-neutral-400 max-w-3xl">
                        I design autonomous systems and intelligent software for robotics — from full‑stack scouting
                        platforms to fixed‑wing UAVs.
                    </p>
                </section>

                {/* 2) Overview / Bio */}
                <section className="mt-24" aria-labelledby="overview-title">
                    <h2 id="overview-title" className="text-xl md:text-2xl font-medium text-white">Overview</h2>
                    <p className="mt-4 leading-relaxed text-neutral-300 max-w-3xl">
                        I’m a high‑school engineer focused on robotics, embedded systems, and AI‑driven autonomy. I lead software and
                        mechanical design on projects like <span className="text-white">Project Aetherius</span> (a fixed‑wing UAV with a custom ground control
                        station) and <span className="text-white">Team Sprocket’s</span> FRC scouting analytics platform. My work spans full‑stack web
                        development, flight software, and mechanical systems design in SolidWorks and Fusion 360.
                    </p>
                </section>

                {/* 3) Skills & Tools */}
                <section className="mt-24" aria-labelledby="skills-title">
                    <h2 id="skills-title" className="text-xl md:text-2xl font-medium text-white">Skills & Tools</h2>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-2xl border border-neutral-800 p-5">
                            <h3 className="text-sm uppercase tracking-wide text-neutral-500">Programming</h3>
                            <p className="mt-2 text-neutral-300">Python, TypeScript, C++, Java</p>
                        </div>
                        <div className="rounded-2xl border border-neutral-800 p-5">
                            <h3 className="text-sm uppercase tracking-wide text-neutral-500">TypeScript frameworks</h3>
                            <p className="mt-2 text-neutral-300">React + Vite, Next.js, Tailwind, Tauri</p>
                        </div>
                        <div className="rounded-2xl border border-neutral-800 p-5">
                            <h3 className="text-sm uppercase tracking-wide text-neutral-500">Python libraries</h3>
                            <p className="mt-2 text-neutral-300">FastAPI, scikit-learn, pandas, TensorFlow</p>
                        </div>
                        <div className="rounded-2xl border border-neutral-800 p-5">
                            <h3 className="text-sm uppercase tracking-wide text-neutral-500">CAD</h3>
                            <p className="mt-2 text-neutral-300">SolidWorks, Fusion 360, OnShape</p>
                        </div>
                        <div className="rounded-2xl border border-neutral-800 p-5">
                            <h3 className="text-sm uppercase tracking-wide text-neutral-500">Hardware</h3>
                            <p className="mt-2 text-neutral-300">Pixhawk 6X, Raspberry Pi, Arduino</p>
                        </div>
                        <div className="rounded-2xl border border-neutral-800 p-5">
                            <h3 className="text-sm uppercase tracking-wide text-neutral-500">Tooling</h3>
                            <p className="mt-2 text-neutral-300">JetBrains IDEs, Bambu Studio, Git, QGroundControl</p>
                        </div>
                    </div>
                </section>

                {/* 4) Featured Projects */}
                <section className="mt-24" aria-labelledby="projects-title">
                    <h2 id="projects-title" className="text-xl md:text-2xl font-medium text-white">Featured Projects</h2>
                    <ul className="mt-6 space-y-4">
                        <li className="rounded-2xl border border-neutral-800 p-5 hover:bg-neutral-950 transition">
                            <a href="/dronescape/uav" className="block">
                                <div className="flex items-baseline justify-between gap-4">
                                    <h3 className="text-lg text-white">Aetherius UAV</h3>
                                    <span className="text-xs text-neutral-500">Autonomy · Flight Software · GCS</span>
                                </div>
                                <p className="mt-2 text-neutral-300">Autonomous fixed‑wing drone with mission‑planning ground control station.</p>
                            </a>
                        </li>
                        <li className="rounded-2xl border border-neutral-800 p-5 hover:bg-neutral-950 transition">
                            <a href="/teamsprocket/scouting" className="block">
                                <div className="flex items-baseline justify-between gap-4">
                                    <h3 className="text-lg text-white">Team Sprocket Scouting & Analytics</h3>
                                    <span className="text-xs text-neutral-500">Full-Stack · ML · Data Science</span>
                                </div>
                                <p className="mt-2 text-neutral-300">
                                    Comprehensive FRC scouting and analytics system with real-time data, offline caching, ELO-based modeling, and
                                    performance predictions.
                                </p>
                            </a>
                        </li>

                        <li className="rounded-2xl border border-neutral-800 p-5 hover:bg-neutral-950 transition">
                            <a href="/teamsprocket/cad" className="block">
                                <div className="flex items-baseline justify-between gap-4">
                                    <h3 className="text-lg text-white">Team Sprocket CAD</h3>
                                    <span className="text-xs text-neutral-500">Mechanical · CAD</span>
                                </div>
                                <p className="mt-2 text-neutral-300">Competition robot designs and assemblies for FRC Team 3473, including drivetrain, intake, and manipulator subsystems.</p>
                            </a>
                        </li>
                    </ul>
                </section>

                {/* 5) Engineering Philosophy / Approach */}
                <section className="mt-24" aria-labelledby="approach-title">
                    <h2 id="approach-title" className="text-xl md:text-2xl font-medium text-white">Engineering Approach</h2>
                    <p className="mt-4 leading-relaxed text-neutral-300 max-w-3xl">
                        Systems first. Define subsystems and integration, and then develop each part in context of the whole system.
                    </p>
                </section>

                {/* 6) Contact / Links */}
                <section className="mt-24 mb-24" aria-labelledby="contact-title">
                    <h2 id="contact-title" className="text-xl md:text-2xl font-medium text-white">Contact</h2>
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                        <a href="mailto:me@markwu.org" className="rounded-2xl border border-neutral-800 p-5 hover:bg-neutral-950 transition">
                            <div className="text-white">Professional Email</div>
                            <div className="text-neutral-400 text-sm mt-1">me@markwu.org</div>
                        </a>
                        <a href="mailto:mark.wu123454@gmail.com" className="rounded-2xl border border-neutral-800 p-5 hover:bg-neutral-950 transition">
                            <div className="text-white">Personal Email</div>
                            <div className="text-neutral-400 text-sm mt-1">mark.wu123454@gmail.com</div>
                        </a>
                        <a href="https://github.com/markwu123454" className="rounded-2xl border border-neutral-800 p-5 hover:bg-neutral-950 transition">
                            <div className="text-white">GitHub</div>
                            <div className="text-neutral-400 text-sm mt-1">github.com/markwu123454</div>
                        </a>
                    </div>
                </section>
            </div>
        </main>
    )
}
