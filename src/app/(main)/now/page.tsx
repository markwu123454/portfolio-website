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
                tag={['NOW', 'AUG 2026', '#006']}
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
        kicker: 'Aetherius UAV',
        title: 'First flight done, now make it fly properly',
        body: 'Flew on the 18th: two self-propelled takeoffs, about ten seconds of airtime combined, second one ended in a hard landing after a prop split. Airframe repairable, electronics fine. Next is longer flights and an actual tuning pass.',
    },
    {
        kicker: 'Aetherius GCS',
        title: 'Ground station, third revision',
        body: 'Handled the real flight: firmware, calibration, failsafes, prearm, arming, mode switching, live dashboard. Covers ArduCopter and ArduPlane. Mission support works against SITL; flying a real autonomous mission is the next thing to prove.',
    },
    {
        kicker: 'SprocketStats Scouting',
        title: 'Computer-vision rebuild',
        body: 'Homography field mapping, HRNet pose estimation, YOLO + ByteTrack detection and tracking, broadcast alignment by audio and template matching, and an RNN for path categorization. Standalone modules right now, wiring them together is the work.',
    },
    {
        kicker: 'sprocketstats.com',
        title: 'Team platform, still live',
        body: 'In use by Team 3473. Has grown past scouting into team operations: member ID cards and manufacturing machine authorization.',
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
    'Caelifer — bench stage, untouched for a while. No thrust measurement or hover test yet.',
    'Harbinger — next step is investing in electronics for the coilgun, which is on hold for now.',
    'Femto — the file-viewer suite ships from GitHub; no site page, and I am too lazy to write one.',
    'Crowd Flow — finished as a prototype. Not planning to revisit it, but it still works and it is still fun to watch.',
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
    ['Starting', 'Mechanical engineering at UC Merced — aerospace emphasis'],
    ['Practicing', 'Electronics — power circuits, high-voltage drivers for coilgun'],
    ['Practicing', 'Rust — working knowledge, mostly through the GCS backend'],
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
            <span>— /now · last updated 2026.08.18</span>
            <span>Next update: 2026.09.01</span>
        </div>
    );
}