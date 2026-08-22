/**
 * About — /about
 *
 * Server component. Five sections, each inlined directly into
 * AboutPage's return in layout order — nothing here is used more
 * than once. Page/PageHeader/Section/Button are shared primitives
 * imported from the site component library.
 */

import {
    Page,
    PageHeader,
    Section,
    Button,
} from '@/app/components/site/primitives';
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'About',
    description:
        'Student engineer. What I am looking for, how I work, short biography.',
};

export default function AboutPage() {
    return (
        <Page>
            <PageHeader
                tag={['ABOUT', '2026', '#002']}
                title="About me"
                subtitle={<></>}
                dek=""
            />

            {/* ─ 01 — What I'm looking for ────────────────────────── */}
            <Section num="01" title="What I’m looking for">
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <p className="m-0 text-[15.5px] leading-[1.65] text-fg-muted max-w-115">
                            Research lab positions during the semester, and Summer 2027
                            internships in robotics, drones, embedded systems, or full-stack tooling. Comfortable with
                            hardware (Pixhawk, Arduino, ESP32, Pi) and software (TypeScript, Python, Rust).
                        </p>
                        <div className="mt-6 flex gap-3 flex-wrap">
                            <Button href="/resume.pdf#view=FitV" variant="primary" arrow external>
                                Resume.pdf
                            </Button>
                            <Button href="mailto:me@markwu.org" variant="ghost" external>
                                me@markwu.org
                            </Button>
                            <Button href="/work" variant="link" arrow>
                                See work
                            </Button>
                        </div>
                    </div>
                </div>
            </Section>

            {/* ─ 02 — Skills ───────────────────────────────────────── */}
            <Section num="02" title="Skills, in order of frequency">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-10">
                    {(
                        [
                            ['Software', ['TypeScript', 'Python', 'React / Next.js', 'FastAPI', 'Tauri']],
                            ['Familiar', ['Rust', 'C++']],
                            ['Hardware', ['Pixhawk 6X + 6C', 'Raspberry Pi 4', 'ESP32', 'Arduino', 'MAVLink']],
                            ['CAD', ['SolidWorks (primary)', 'Onshape', 'Fusion 360']],
                            ['Workshop', ['3D printing', 'Soldering']],
                        ] as Array<[string, string[]]>
                    ).map(([heading, items]) => (
                        <div key={heading}>
                            <div className="font-mono text-[11px] tracking-kicker uppercase text-accent mb-4 pb-2 border-b border-rule">
                                {heading}
                            </div>
                            <ul className="list-none m-0 p-0 flex flex-col gap-1.5">
                                {items.map((s) => (
                                    <li
                                        key={s}
                                        className="text-[14.5px] text-fg flex items-baseline gap-2"
                                    >
                                        <span aria-hidden className="text-fg-soft font-mono text-[11px]">
                                            —
                                        </span>
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </Section>

            {/* ─ 03 — How I work ──────────────────────────────────── */}
            <Section num="03" title="How I work">
                <ol className="list-none m-0 p-0">
                    {[
                        'Justify what you build, always have a reason.',
                        'Rapid prototyping, fail faster.',
                        "Prototypes aren't supposed to be perfect.",
                        'Software iteration is faster than hardware.',
                    ].map((p, i) => (
                        <li
                            key={i}
                            className="grid grid-cols-[44px_minmax(0,1fr)] gap-4 py-4 border-t border-rule items-baseline"
                        >
                            <span className="font-mono text-[11px] text-fg-soft tracking-mono">
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            <span className="text-[15px] text-fg leading-[1.55]">{p}</span>
                        </li>
                    ))}
                </ol>
            </Section>

            {/* ─ 04 — Biography ───────────────────────────────────── */}
            <Section num="04" title="A short biography">
                <div className="grid md:grid-cols-[minmax(0,1fr)_320px] gap-12 items-start">
                    <div className="grid gap-4 max-w-155 text-[15.5px] leading-[1.7] text-fg-muted">
                        <p className="m-0">
                            Incoming mechanical engineering student at UC Merced, aerospace emphasis, class
                            of 2030. I started engineering with VEX IQ and LEGO EV3 in middle school, moved on to combat robotics
                            for three years, then FRC with Team 3473, first as CAD subteam, later also leading the scouting platform.
                        </p>
                        <p className="m-0">
                            My current obsession is with drones and autonomous programs. I remix music occasionally.
                        </p>
                    </div>
                    <blockquote className="m-0 pl-5 border-l-2 border-accent italic text-[16px] leading-[1.6] text-fg-muted">
                        I take pride in what I build.
                    </blockquote>
                </div>
            </Section>

            {/* ─ 05 — Acknowledgements ────────────────────────────── */}
            <Section num="05" title="Acknowledgements">
                <dl className="m-0">
                    {(
                        [
                            ['Combat', 'Mark Duffield: mentor of Team Infernope.'],
                            ['FRC', 'Gabriel Aguilar & Luis De La Cruz: mentors of Team 3473.'],
                        ] as Array<[string, string]>
                    ).map(([k, v]) => (
                        <div
                            key={k}
                            className="grid grid-cols-[140px_minmax(0,1fr)] gap-6 py-3 border-t border-rule items-baseline"
                        >
                            <dt className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">
                                {k}
                            </dt>
                            <dd className="m-0 text-[14.5px] text-fg-muted leading-[1.55]">
                                {v}
                            </dd>
                        </div>
                    ))}
                </dl>
            </Section>
        </Page>
    );
}
