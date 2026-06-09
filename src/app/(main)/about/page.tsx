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
                dek="Recruiters, professors, lab leads: read the top half. Friends and fellow students: read the bottom."
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
                <p className="m-0 text-[15.5px] leading-[1.65] text-fg-muted max-w-115">
                    Summer 2026 internships in{' '}
                    <strong className="text-fg font-semibold">
                        robotics, drones, embedded systems
                    </strong>
                    , or full-stack tooling. Comfortable with
                    hardware (Pixhawk, Arduino, ESP32, Pi) and software
                    (TypeScript, Python, C++).
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
            <p className="m-0 text-[15.5px] leading-[1.65] text-fg-muted max-w-115">
                Also open to{' '}
                <strong className="text-fg font-semibold">research lab</strong>{' '}
                applications, UROP, REU, equivalent. Most direct fit is autonomy,
                mechatronics, or controls.
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
    ['Workshop', ['3D printing', 'Soldering']],
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
    'Document while you build, not after.',
    'Rapid prototyping. Fail faster.',
    'Use everything available to you.',
    'Rather write more than less.',
    'Only make things with a purpose.',
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
            <div className="grid gap-4 max-w-155 text-[15.5px] leading-[1.7] text-fg-muted">
                <p className="m-0">
                    Diamond Bar, CA. Class of 2026. Started in VEX and LEGO in middle school,
                    moved into{' '}
                    <strong className="text-fg font-semibold">combat robotics</strong>{' '}
                    for three years (Team Infernope — twelve robots), then FRC with{' '}
                    <strong className="text-fg font-semibold">Team 3473</strong> —
                    first as CAD subteam, later also leading the scouting platform.
                </p>
                <p className="m-0">
                    UAVs are my current obsession: project{' '}
                    <strong className="text-fg font-semibold">Aetherius</strong>{' '}
                    is currently preparing for test flight. I write music occasionally.
                </p>
            </div>
            <Pullquote attribution="What this site is for">
                My project demonstrations, documented so
                recruiters, professors, and labs can see what I&#39;m capable of.
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
    ['Combat', 'Mark Duffield: three years of mentorship at Team Infernope.'],
    ['FRC', 'Gabriel Aguilar & Luis De La Cruz: Team 3473 Mentors.'],
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