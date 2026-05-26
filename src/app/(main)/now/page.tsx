/**
 * Now — /now
 *
 * Server component. Monthly status report in the spirit of nownownow.com.
 * Three sections: Active, On the back burner, Currently learning.
 * Plus a small "last updated" / "next update" timestamp footer.
 */

import { Page, PageHeader, Section, ArrowLink } from '../components/site/primitives';
import type { ReactNode } from 'react';
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Now',
    description: "What I'm working on this month.",
};

export default function NowPage() {
    return (
        <Page>
            <PageHeader
                tag={['NOW', 'MAY 2026', '#005']}
                title="What I’m working on"
                subtitle="this month."
                dek={
                    <>
                        Updated monthly, in the spirit of{' '}
                        <ArrowLink href="https://nownownow.com" external glyph="↗">
                            nownownow.com
                        </ArrowLink>
                        . If you read this more than 30 days after the date above,
                        it’s stale — sorry.
                    </>
                }
            />

            <Section num="01" title="Active">
                <Active />
            </Section>

            <div className="grid md:grid-cols-2 gap-x-12">
                <Section num="02" title="On the back burner">
                    <BackBurner />
                </Section>
                <Section num="03" title="Currently learning">
                    <Learning />
                </Section>
            </div>

            <UpdateMeta />
        </Page>
    );
}

/* ═════════════════════════════════════════════════════════════════
   ACTIVE
   ═════════════════════════════════════════════════════════════════ */

const ACTIVE = [
    {
        kicker: 'Harbinger',
        title: 'Differential turret — getting absolute encoders to register, then differential PID',
        body: 'Current main project. Gimbal motors on SimpleFOC, ESP32, Qt app over Bluetooth. Coilgun is in planning.',
    },
    {
        kicker: 'Aetherius UAV',
        title: 'Twin-boom airframe — picking it back up for a summer maiden',
        body: 'Avionics are in. Switched from RPi companion to SiK radio. One crash on the first attempt. Next flight this summer.',
    },
];

function Active() {
    return (
        <ul className="list-none m-0 p-0">
            {ACTIVE.map((a) => (
                <li
                    key={a.kicker}
                    className="grid grid-cols-[160px_minmax(0,1fr)] gap-6 py-5 border-t border-rule"
                >
                    <span className="font-mono text-[11px] text-fg-soft tracking-mono pt-0.5">
                        {a.kicker}
                    </span>
                    <div>
                        <h3 className="m-0 text-base font-semibold tracking-[-0.005em]">
                            {a.title}
                        </h3>
                        <p className="mt-1 mb-0 text-[14.5px] leading-relaxed text-fg-muted max-w-[680px]">
                            {a.body}
                        </p>
                    </div>
                </li>
            ))}
        </ul>
    );
}

/* ═════════════════════════════════════════════════════════════════
   BACK BURNER
   ═════════════════════════════════════════════════════════════════ */

const BACK_BURNER = [
    'SprocketStats — down for maintenance, AI pivot being considered for next season.',
    'Aetherius GCS — v1 Python/FastAPI, v2 Tauri + Python, both shelved while airframe takes priority.',
];

function BackBurner() {
    return (
        <ol className="list-none m-0 p-0">
            {BACK_BURNER.map((b, i) => (
                <li
                    key={i}
                    className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 py-3 border-t border-rule items-baseline"
                >
                    <span className="font-mono text-[11px] tracking-mono text-fg-soft">
                        {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[14.5px] text-fg-muted">{b}</span>
                </li>
            ))}
        </ol>
    );
}

/* ═════════════════════════════════════════════════════════════════
   LEARNING
   ═════════════════════════════════════════════════════════════════ */

const LEARNING: Array<[string, ReactNode]> = [
    ['Practicing', 'C++ — embedded, on ESP32'],
    ['Practicing', 'Electronics — power circuits, high-voltage drivers for coilgun'],
    ['Considering', 'KiCad or Solidworks Electronics — if coilgun PCB design gets serious'],
    ['Considering', 'Betaflight'],
];

function Learning() {
    return (
        <dl className="m-0">
            {LEARNING.map(([k, v], i) => (
                <div
                    key={i}
                    className="grid grid-cols-[110px_minmax(0,1fr)] gap-4 py-3 border-t border-rule items-baseline"
                >
                    <dt className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">
                        {k}
                    </dt>
                    <dd className="m-0 text-[14.5px] text-fg">{v}</dd>
                </div>
            ))}
        </dl>
    );
}

/* ═════════════════════════════════════════════════════════════════
   UPDATE META
   ═════════════════════════════════════════════════════════════════ */

function UpdateMeta() {
    return (
        <div className="mt-16 flex justify-between font-mono text-[11px] tracking-mono text-fg-soft">
            <span>— /now · last updated 2026.05.10</span>
            <span>Next update: 2026.06.01</span>
        </div>
    );
}