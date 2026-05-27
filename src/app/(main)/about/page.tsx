/**
 * About — /about
 *
 * Server component. Five-section page: looking-for, skills, how I
 * work, biography, acknowledgements. Note the leading line — it's a
 * deliberate framing device: "I lead with what I'm looking for —
 * biography is at the bottom."
 */

import {
    Page,
    PageHeader,
    Section,
    Button,
} from '@/app/components/site/primitives';
import type { ReactNode } from 'react';
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
                title="I lead with what I’m"
                subtitle={<>looking for — biography is at the bottom.</>}
                dek="Recruiters, professors, lab leads — read the top half. Friends and fellow students — read the bottom. Either way, the contact box on the home page works."
            />

            <Section num="01" title="What I’m looking for">
                <LookingFor />
            </Section>

            <Section num="02" title="Skills, in order of frequency">
                <Skills />
            </Section>

            <Section num="03" title="How I work">
                <HowIWork />
            </Section>

            <Section num="04" title="A short biography">
                <Biography />
            </Section>

            <Section num="05" title="Acknowledgements">
                <Acknowledgements />
            </Section>
        </Page>
    );
}

/* ═════════════════════════════════════════════════════════════════
   01 — LOOKING FOR
   ═════════════════════════════════════════════════════════════════ */

function LookingFor() {
    return (
        <div className="grid md:grid-cols-2 gap-8">
            <div>
                <p className="m-0 text-[15.5px] leading-[1.65] text-fg-muted max-w-[460px]">
                    Summer 2026 internships in{' '}
                    <strong className="text-fg font-semibold">
                        robotics, drones, embedded systems
                    </strong>
                    , or full-stack tooling that supports them. Comfortable on
                    hardware (Pixhawk, Arduino, ESP32, Pi) and software
                    (TypeScript, Python, C++). Comfortable shipping things
                    end-to-end.
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
            <p className="m-0 text-[15.5px] leading-[1.65] text-fg-muted max-w-[460px]">
                Also open to{' '}
                <strong className="text-fg font-semibold">research lab</strong>{' '}
                applications — UROP, REU, equivalent. Most direct fit is autonomy,
                mechatronics, or controls. I take notes seriously and document.
            </p>
        </div>
    );
}

/* ═════════════════════════════════════════════════════════════════
   02 — SKILLS
   ═════════════════════════════════════════════════════════════════ */

const SKILLS: Array<[string, string[]]> = [
    ['Software', ['TypeScript', 'Python', 'C++', 'React / Next.js', 'FastAPI', 'Tauri']],
    ['Hardware', ['Pixhawk 6X', 'Raspberry Pi 4', 'ESP32', 'Arduino', 'MAVLink']],
    ['CAD', ['SolidWorks (primary)', 'Onshape', 'Fusion 360']],
    ['Workshop', ['3D printing', 'CNC (basic)', 'Soldering', 'Wiring looms']],
];

function Skills() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
            {SKILLS.map(([heading, items]) => (
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
    );
}

/* ═════════════════════════════════════════════════════════════════
   03 — HOW I WORK
   ═════════════════════════════════════════════════════════════════ */

const PRINCIPLES = [
    'Document while you build, not after. The notes are part of the work.',
    'Prototype to fail. The intake that didn’t survive bench testing taught more than the one that did.',
    'Read other people’s CAD trees. The fastest way to learn an assembly is to take one apart.',
    'Write more than you think you should. Code, READMEs, season debriefs, after-action reports.',
    'Ship things that other people use. SprocketStats only mattered when 200 scouters relied on it.',
];

function HowIWork() {
    return (
        <ol className="list-none m-0 p-0">
            {PRINCIPLES.map((p, i) => (
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
    );
}

/* ═════════════════════════════════════════════════════════════════
   04 — BIOGRAPHY
   ═════════════════════════════════════════════════════════════════ */

function Biography() {
    return (
        <div className="grid md:grid-cols-[minmax(0,1fr)_320px] gap-12 items-start">
            <div className="grid gap-4 max-w-[620px] text-[15.5px] leading-[1.7] text-fg-muted">
                <p className="m-0">
                    Diamond Bar, CA. Class of 2026. Started in VEX in middle school,
                    moved into{' '}
                    <strong className="text-fg font-semibold">combat robotics</strong>{' '}
                    for three years (Team Infernope — twelve robots), then FRC with{' '}
                    <strong className="text-fg font-semibold">Team 3473</strong> —
                    first as CAD subteam, now also leading the scouting platform.
                </p>
                <p className="m-0">
                    Fixed-wing UAVs are my current obsession — the{' '}
                    <strong className="text-fg font-semibold">Aetherius</strong>{' '}
                    programme is in its fourth airframe revision. I write music when
                    I’m not building.
                </p>
            </div>
            <Pullquote attribution="What this site is for">
                The case for one student engineer, documented carefully enough that
                recruiters, professors, and labs can read it without asking
                follow-up questions.
            </Pullquote>
        </div>
    );
}

function Pullquote({
                       children,
                       attribution,
                   }: {
    children: ReactNode;
    attribution: string;
}) {
    return (
        <blockquote className="m-0 pl-5 border-l-2 border-accent italic text-[16px] leading-[1.6] text-fg-muted">
            {children}
            <footer className="mt-3 not-italic font-mono text-[10px] tracking-kicker uppercase text-fg-soft">
                — {attribution}
            </footer>
        </blockquote>
    );
}

/* ═════════════════════════════════════════════════════════════════
   05 — ACKNOWLEDGEMENTS
   ═════════════════════════════════════════════════════════════════ */

const ACKS: Array<[string, string]> = [
    ['Combat', 'Mark Duffield — three years of mentorship at Infernope.'],
    ['FRC', 'Gabriel Aguilar & Luis De La Cruz — Team 3473 leadership.'],
    ['Aetherius', 'Self-directed; built on top of Pixhawk and the ArduPilot community.'],
    ['This site', 'Built in a week to replace the previous one. Apologies if anything is broken.'],
];

function Acknowledgements() {
    return (
        <dl className="m-0">
            {ACKS.map(([k, v]) => (
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
    );
}