import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Tag, StatusPill } from "@/app/components/site/primitives";

export const metadata: Metadata = {
    title: "Aetherius UAV",
    description:
        "Fixed-wing UAV build — twin-boom foam/CF airframe with self-sourced avionics. Pixhawk 6X, SiK telemetry, custom Tauri-based GCS. Flying since 2026.08.18.",
};

/* ─── Asset manifest ────────────────────────────────────────── */
const IMG = {
    plane:    { src: "/aetherius/hero-airframe.jpg",     w: 985,  h: 738  },
    airborne: { src: "/aetherius/flight-02-airborne.png", w: 1909, h: 1030 },
} as const;

const VIDEO = {
    flight5: "https://assets.markwu.org/portfolio/flight%205.mp4",
} as const;

/* ─── TOC source of truth ───────────────────────────────────── */
const TOC = [
    { id: "s01", num: "01", label: "Timeline" },
    { id: "s02", num: "02", label: "The companion-computer decision" },
    { id: "s03", num: "03", label: "Flight log" },
    { id: "s04", num: "04", label: "Ground control station" },
] as const;

/* ─── Timeline entries ───────────────────────────────────────── */
const TIMELINE = [
    { when: "Summer 2025", what: "Bought the airframe: a twin-boom kit that came with the servos and motor." },
    { when: "Summer 2025", what: "Reused a FlySky transmitter left over from combat robotics. Bought the GPS, PSU, battery, and flight controller separately to round out the build." },
    { when: "Summer 2025", what: "Initially used a Raspberry Pi as companion computer to relay telemetry to ground station, no strong reason beyond curiosity." },
    { when: "School year", what: "Entered into Dronescape, Diamond Bar High School's drone club, as engineering lead developing one of two flagship projects. Mostly had teammates take it around for displaying and tinkering." },
    { when: "Summer 2026", what: "Picked it back up after graduating. Spent the summer getting it flightworthy and learning the stack through the GCS." },
    { when: "2026.08.18", what: "First flight." },
] as const;

/* ─── Flight log ─────────────────────────────────────────────── */
interface FlightEntry {
    num: string;
    date: string;
    status: 'good' | 'warn';
    label: string;
    body: string;
    figure?: boolean;
    video?: boolean;
}

const FLIGHTS: FlightEntry[] = [
    {
        num: "00", date: "2026.08.13", status: "warn", label: "Test",
        body: "Skid across the basketball field just to show it has enough thrust to push itself, unfortunately crashed into concrete and broke an aileron.",
    },
    {
        num: "01", date: "2026.08.18", status: "good", label: "Flown",
        body: "Started on the sidewalk, downhill. Took off, climbed to about a metre, roughly 3 seconds of flight.",
    },
    {
        num: "02", date: "2026.08.18", status: "good", label: "Flown",
        body: "Found a stretch of dirt further down the field to use as a runway, grass is long enough that it snags the prop, so it needs a flat surface. Climbed to about 5 meter, then a prop broke in half mid-climb for unknown reasons. Barrel-rolled down, only minor damage to the nose.",
        figure: true,
    },
    {
        num: "03", date: "2026.08.19", status: "good", label: "Flown",
        body: "Clean takeoff, a U-turn, and the smoothest landing yet.",
    },
    {
        num: "04", date: "2026.08.19", status: "warn", label: "Aborted",
        body: "A wingtip caught the ground, causing the plane to roll and turn abruptly.",
    },
    {
        num: "05", date: "2026.08.19", status: "good", label: "Flown",
        body: "Overshot the runway before lifting off, so a prop clipped the grass but still managed to climb out and completed one and a half loops before the nut holding the prop on worked loose and the prop came off mid-air. Landed smoothly in the grass, no crash. About 20 seconds of total airtime.",
        video: true,
    },
];

export default function AetheriusPage() {
    return (
        <main className="max-w-295 mx-auto px-14 pt-14 pb-24 max-[720px]:px-6 max-[720px]:pt-8 max-[720px]:pb-16">
            {/* ─ Breadcrumbs ──────────────────────────────────────── */}
            <nav
                aria-label="Breadcrumb"
                className="font-mono text-[11px] tracking-[0.06em] text-fg-soft mb-7 flex flex-wrap items-center gap-2"
            >
                <Link href="/work" className="text-fg-muted no-underline hover:text-accent">Work</Link>
                <span className="text-fg-soft">/</span>
                <Link href="/work?domain=Drones" className="text-fg-muted no-underline hover:text-accent">Drones</Link>
                <span className="text-fg-soft">/</span>
                <span className="text-fg">Aetherius UAV</span>
            </nav>

            {/* ─ Kicker ───────────────────────────────────────────── */}
            <div className="font-mono text-[11px] tracking-kicker uppercase text-accent mb-4.5 flex items-center gap-2.5">
                <span>Project</span>
                <span className="text-fg-soft">·</span>
                <span>Drones</span>
                <span className="text-fg-soft">·</span>
                <span>2025 —</span>
            </div>

            {/* ─ Hero ─ two columns ──────────────────────────────── */}
            <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-12 items-start mb-10 max-[880px]:grid-cols-1 max-[880px]:gap-7">
                <h1 className="m-0 font-semibold leading-[1.05] tracking-[-0.025em] text-[clamp(40px,5vw,60px)] max-w-190">
                    Aetherius UAV —
                    <span className="block text-fg-muted italic font-medium">fixed-wing drone.</span>
                </h1>

                <div className="flex flex-col gap-3.5">
                    <p className="m-0 text-[15.5px] leading-[1.65] text-fg-muted max-w-105">
                        Off-the-shelf twin-boom foam and carbon fiber airframe with self-sourced
                        avionics. Five flight attempts since 2026.08.18 — four flown, one aborted.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        <StatusPill tone="good">Flown</StatusPill>
                        <Tag variant="outline">Fixed-wing</Tag>
                        <Tag variant="outline">Pixhawk 6X</Tag>
                    </div>
                </div>
            </div>

            {/* ─ Stat strip ───────────────────────────────────────── */}
            <div
                aria-label="Build specs"
                className="grid grid-cols-4 border border-rule rounded mb-10 overflow-hidden max-[720px]:grid-cols-2"
            >
                <div className="p-[22px_20px] flex flex-col gap-2 border-r border-rule max-[720px]:border-b">
                    <span className="font-mono font-medium text-[14.5px] tracking-tight-1 text-fg leading-[1.35]">
                        Twin-boom · foam + CF
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-fg-soft">Airframe</span>
                </div>
                <div className="p-[22px_20px] flex flex-col gap-2 border-r border-rule max-[720px]:border-r-0 max-[720px]:border-b">
                    <span className="font-mono font-medium text-[14.5px] tracking-tight-1 text-fg leading-[1.35]">
                        ~ 2 m
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-fg-soft">Wingspan</span>
                </div>
                <div className="p-[22px_20px] flex flex-col gap-2 border-r border-rule">
                    <span className="font-mono font-medium text-[14.5px] tracking-tight-1 text-fg leading-[1.35]">
                        Pixhawk 6X
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-fg-soft">Flight controller</span>
                </div>
                <div className="p-[22px_20px] flex flex-col gap-2">
                    <span className="font-mono font-medium text-[14.5px] tracking-tight-1 text-fg leading-[1.35]">
                        4 flown · 1 aborted
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-fg-soft">Flights</span>
                </div>
            </div>

            {/* ─ Hero figure ──────────────────────────────────────── */}
            <figure className="mt-2 py-4 border-t border-b border-rule">
                <div className="bg-bg-elev border border-rule relative overflow-hidden">
                    <Image
                        src={IMG.plane.src}
                        width={IMG.plane.w}
                        height={IMG.plane.h}
                        alt="Aetherius — twin-boom foam and carbon-fiber UAV airframe."
                        sizes="(max-width: 880px) 100vw, 1068px"
                        className="w-full h-auto block"
                        priority
                    />
                </div>
                <figcaption className="font-mono text-[11px] tracking-mono leading-[1.55] text-fg-soft mt-3">
                    <span className="text-fg-muted mr-1">Fig. 1 —</span>
                    Aetherius airframe: twin-boom, foam and carbon-fiber construction.
                    Off-the-shelf platform; avionics sourced separately.
                </figcaption>
            </figure>

            {/* ─ Body ─ article + sidebar ─────────────────────────── */}
            <div className="grid grid-cols-[minmax(0,1fr)_240px] gap-12 mt-14 max-[880px]:grid-cols-1 max-[880px]:gap-8">
                <article className="min-w-0">
                    {/* 01 — Timeline */}
                    <section className="mb-14 last:mb-0 scroll-mt-20" id="s01">
                        <div className="flex items-baseline gap-3 pb-3.5 mb-6 border-b border-rule">
                            <span className="font-mono text-xs tracking-[0.16em] text-accent font-medium shrink-0">01 —</span>
                            <h2 className="m-0 text-[26px] font-semibold tracking-tight-2 leading-[1.15]">Timeline</h2>
                            <span className="ml-auto font-mono text-[10px] tracking-kicker uppercase text-fg-soft self-center">~2025 → now</span>
                        </div>
                        <ul className="list-none m-0 p-0">
                            {TIMELINE.map((t, i) => (
                                <li
                                    key={i}
                                    className="grid grid-cols-[120px_minmax(0,1fr)] gap-4 py-3.5 border-t border-rule first:border-t-0 first:pt-0"
                                >
                                    <span className="font-mono text-[11px] tracking-mono text-fg-soft pt-0.5">{t.when}</span>
                                    <span className="text-[14.5px] leading-[1.6] text-fg-muted max-w-140">{t.what}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* 02 — The companion-computer decision */}
                    <section className="mb-14 last:mb-0 scroll-mt-20" id="s02">
                        <div className="flex items-baseline gap-3 pb-3.5 mb-6 border-b border-rule">
                            <span className="font-mono text-xs tracking-[0.16em] text-accent font-medium shrink-0">02 —</span>
                            <h2 className="m-0 text-[26px] font-semibold tracking-tight-2 leading-[1.15]">The companion-computer decision</h2>
                            <span className="ml-auto font-mono text-[10px] tracking-kicker uppercase text-fg-soft self-center">Pi → SiK</span>
                        </div>
                        <div>
                            <p className="mb-4 text-[15.5px] leading-[1.7] text-fg-muted max-w-160">
                                I wanted to use a companion computer because I was already familiar
                                with the Raspberry Pi, and couldn&#39;t think of a better way
                                to get the flight controller talking to the GCS computer than
                                routing it through a Pi and a router, which, reflecting back,
                                was pretty flawed logic. Regardless, I spent about two weeks
                                getting a headless Pi running Raspberry Pi OS Lite to work over
                                SSH, then another month writing a Python daemon that ran on
                                startup, pulled updated Python files from my laptop, and
                                restarted the service, so I could just power it on and it
                                would sync updates.
                            </p>
                            <p className="mb-4 text-[15.5px] leading-[1.7] text-fg-muted max-w-160">
                                On top of that I wrote my own GCS in Python: a WebSocket
                                connection to the Pi, and FastAPI serving a website locally.
                                I learned about SiK radios during the school year, and shortly
                                after summer started, bought one and ditched the Pi.
                            </p>
                            <p className="font-mono text-[12.5px] text-fg-muted">
                                Source: <a
                                    href="https://github.com/markwu123454/aetherius-gcs-v1"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-accent no-underline hover:underline underline-offset-4"
                                >
                                    markwu123454/aetherius-gcs-v1
                                </a> (archived, the Pi-era GCS)
                            </p>
                        </div>
                    </section>

                    {/* 03 — Flight log */}
                    <section className="mb-14 last:mb-0 scroll-mt-20" id="s03">
                        <div className="flex items-baseline gap-3 pb-3.5 mb-6 border-b border-rule">
                            <span className="font-mono text-xs tracking-[0.16em] text-accent font-medium shrink-0">03 —</span>
                            <h2 className="m-0 text-[26px] font-semibold tracking-tight-2 leading-[1.15]">Flight log</h2>
                            <span className="ml-auto font-mono text-[10px] tracking-kicker uppercase text-fg-soft self-center">6 attempts</span>
                        </div>
                        <ul className="list-none m-0 p-0">
                            {FLIGHTS.map((f) => (
                                <li key={f.num} className="py-4.5 border-t border-rule first:border-t-0 first:pt-0">
                                    <div className="flex items-baseline gap-2.5 mb-1.5 flex-wrap">
                                        <span className="font-mono text-[13px] text-accent font-medium">Flight {f.num}</span>
                                        <span className="font-mono text-[11px] text-fg-soft">{f.date}</span>
                                        <StatusPill tone={f.status}>{f.label}</StatusPill>
                                    </div>
                                    <p className="text-[14.5px] leading-[1.65] text-fg-muted max-w-155">{f.body}</p>
                                    {f.figure && (
                                        <figure className="mt-2 py-4 border-t border-b border-rule">
                                            <div className="bg-bg-elev border border-rule relative overflow-hidden">
                                                <Image
                                                    src={IMG.airborne.src}
                                                    width={IMG.airborne.w}
                                                    height={IMG.airborne.h}
                                                    alt="Aetherius airborne over a park, banking left, roughly five metres up."
                                                    sizes="(max-width: 880px) 100vw, 1068px"
                                                    className="w-full h-auto block"
                                                />
                                            </div>
                                            <figcaption className="font-mono text-[11px] tracking-mono leading-[1.55] text-fg-soft mt-3">
                                                <span className="text-fg-muted mr-1">Fig. 3.1 —</span>
                                                Flight 2, 2026.08.18. Roughly five metres up and climbing;
                                                moments later a prop broke and the flight ended.
                                            </figcaption>
                                        </figure>
                                    )}
                                    {f.video && (
                                        <video
                                            src={VIDEO.flight5}
                                            controls
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            preload="auto"
                                            className="block w-full max-w-155 mt-3.5 border border-rule rounded bg-bg-elev"
                                        />
                                    )}
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* 04 — Ground control station */}
                    <section className="mb-14 last:mb-0 scroll-mt-20" id="s04">
                        <div className="flex items-baseline gap-3 pb-3.5 mb-6 border-b border-rule">
                            <span className="font-mono text-xs tracking-[0.16em] text-accent font-medium shrink-0">04 —</span>
                            <h2 className="m-0 text-[26px] font-semibold tracking-tight-2 leading-[1.15]">Ground control station</h2>
                            <span className="ml-auto font-mono text-[10px] tracking-kicker uppercase text-fg-soft self-center">Own page →</span>
                        </div>
                        <div>
                            <p className="mb-4 text-[15.5px] leading-[1.7] text-fg-muted max-w-160">
                                A custom GCS was built in parallel, and it has handled every
                                flight so far: firmware, calibration, failsafes and trims
                                beforehand, then prearm checks, arming, mode switching and the
                                live dashboard on the day. The plane itself was flown on RC
                                sticks; the ground station did not fly it.
                            </p>
                            <p className="text-[15.5px] leading-[1.7] text-fg-muted max-w-160">
                                That grew into its own project.{" "}
                                <Link href="/work/aetherius-gcs" className="text-accent no-underline hover:underline underline-offset-4">
                                    Aetherius GCS →
                                </Link>
                            </p>
                        </div>
                    </section>
                </article>

                {/* ─ Sidebar TOC ──────────────────────────────────── */}
                <aside aria-label="On this page" className="self-start text-[13px] min-[881px]:sticky min-[881px]:top-24">
                    <div className="border-t border-rule pt-3.5">
                        <div className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft mb-3">On this page</div>
                        <ul className="list-none m-0 p-0 flex flex-col gap-1.5">
                            {TOC.map((t) => (
                                <li key={t.id}>
                                    <a
                                        href={`#${t.id}`}
                                        className="text-[13px] text-fg-muted no-underline transition-colors duration-150 hover:text-accent"
                                    >
                                        <span className="font-mono text-[10.5px] text-fg-soft mr-2 tracking-[0.06em]">{t.num}</span>
                                        {t.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>
            </div>
        </main>
    );
}
