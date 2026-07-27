/**
 * Now — /now
 *
 * Server component. Monthly status report in the spirit of nownownow.com.
 * Three sections: Active, On the back burner, Currently learning.
 * Plus a small "last updated" / "next update" timestamp footer.
 */

import { Page, PageHeader, Section, ArrowLink } from '@/app/components/site/primitives';
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
                tag={['NOW', 'JUL 2026', '#005']}
                title="What I’m working on"
                subtitle="this month."
                dek={
                    <>
                        Updated monthly, in the spirit of{' '}
                        <ArrowLink href="https://nownownow.com" external glyph="↗">
                            nownownow.com
                        </ArrowLink>
                        . If you read this more than 30 days after the date above,
                        it’s stale, sorry.
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
        kicker: 'Caelifer',
        title: 'Coaxial EDF tailsitter drone',
        body: 'One of three projects in active development right now.',
    },
    {
        kicker: 'Aetherius',
        title: 'Twin-boom airframe + custom GCS',
        body: 'Airframe in ground/bench testing — avionics are in, switched from an RPi companion to a SiK radio, no flight yet. GCS is on its third revision (Tauri); full mission-sequence testing still in progress.',
    },
    {
        kicker: 'Femto',
        title: 'Native file-viewer suite',
        body: 'FemtoJSON, FemtoDot, FemtoNote on a shared Tauri + Svelte framework. Most recently active project.',
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
                        <h3 className="m-0 text-base font-semibold tracking-tight-1">
                            {a.title}
                        </h3>
                        <p className="mt-1 mb-0 text-[14.5px] leading-relaxed text-fg-muted max-w-170">
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
    'Harbinger — learned enough C++; next step is investing in electronics for the coilgun, which is on hold for now.',
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
            <span>— /now · last updated 2026.07.26</span>
            <span>Next update: 2026.08.01</span>
        </div>
    );
}