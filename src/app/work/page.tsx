/**
 * Work — /work
 *
 * Server component. Index of all 11 projects with a stats breakdown
 * row, domain filters, and a sortable list. Filters and sort are
 * design-only (static markup) for now — when you wire them up,
 * convert this to a client component or split the list into a
 * <WorkList /> client child.
 *
 * The PROJECTS array is the source of truth — share it with the
 * megamenu data in menu.tsx if you decide to consolidate later.
 */

import Link from 'next/link';
import {
    Page,
    PageHeader,
    StatusText,
    type Tone,
} from '../components/site/primitives';
import type { ReactNode } from 'react';

export const metadata = {
    title: 'Work — 11 projects',
    description:
        'Eleven projects. Filter by domain. Status reflects current activity, not completion year.',
};

type Status = 'building' | 'shipped' | 'competing' | 'shelved' | 'archive' | 'concept';
type Domain = 'Robotics' | 'Drones' | 'Software' | 'Combat';

interface Project {
    num: string;
    href: string;
    title: string;
    blurb: string;
    status: Status;
    domain: Domain;
    year: string;
}

const PROJECTS: Project[] = [
    { num: '01', href: '/work/aetherius',     title: 'Aetherius UAV',     blurb: 'Fixed-wing drone — Pixhawk avionics, custom MAVLink GCS. Twin-boom rev 4 in build.', status: 'building',  domain: 'Drones',   year: '2024 —'   },
    { num: '02', href: '/work/sprocketstats', title: 'SprocketStats',     blurb: 'Real-time scouting + analytics. React, FastAPI, Postgres. Used at Worlds ’25.',     status: 'shipped',   domain: 'Software', year: '2024 —'   },
    { num: '03', href: '/work/sprocket-frc',  title: 'Sprocket — FRC CAD',blurb: 'Two seasons with Team 3473 — Climb subsystem ’24-25, full-bot ’25-26.',              status: 'competing', domain: 'Robotics', year: '2025 —'   },
    { num: '04', href: '/work/aetherius-gcs', title: 'Aetherius GCS',     blurb: 'Custom MAVLink ground control station. Tauri, React, Rust.',                           status: 'building',  domain: 'Software', year: '2024 —'   },
    { num: '05', href: '/work/combat',        title: 'Team Infernope',    blurb: 'Twelve combat robots over three years. 1st place, end-of-year tournament ’25.',     status: 'archive',   domain: 'Combat',   year: '2022–25'  },
    { num: '06', href: '/work/harbinger',     title: 'Harbinger Turret',  blurb: 'Differential-drive turret with closed-loop heading. Tuning paused.',                  status: 'shelved',   domain: 'Robotics', year: '2025'     },
    { num: '07', href: '/work/take-or-double',title: 'Take or Double',    blurb: 'Game theory toy — minimax over a coin-stake game.',                                    status: 'shipped',   domain: 'Software', year: '2025'     },
    { num: '08', href: '/work/scavenger',     title: 'Scavenger',         blurb: 'Scoped-down scavenger-hunt prototype.',                                                status: 'shelved',   domain: 'Software', year: '2024'     },
    { num: '09', href: '/work/tempest',       title: 'Project Tempest',   blurb: 'Concept airframe study. CAD only, no build.',                                          status: 'concept',   domain: 'Drones',   year: '2025'     },
    { num: '10', href: '/work/vex',           title: 'VEX archive',       blurb: 'Pre-FRC robotics. Kept for completeness.',                                             status: 'archive',   domain: 'Robotics', year: '2021–23'  },
    { num: '11', href: '/work/portfolio',     title: 'This site',         blurb: 'You’re looking at it. Restructure of the previous portfolio.',                         status: 'shipped',   domain: 'Software', year: '2026'     },
];

const STATUS_TONE: Record<Status, Tone> = {
    building:  'warn',
    shipped:   'good',
    competing: 'warn',
    shelved:   'neutral',
    archive:   'neutral',
    concept:   'neutral',
};

export default function WorkIndexPage() {
    return (
        <Page>
            <PageHeader
                tag={['WORK', '11 PROJECTS', '#003']}
                title="Eleven projects."
                subtitle="Filter by domain."
                dek="Status reflects current activity, not completion year. Click any row to read the case study."
            />

            <Breakdown />

            <FilterBar />

            <ul className="list-none m-0 p-0">
                {PROJECTS.map((p) => (
                    <ProjectRow key={p.num} project={p} />
                ))}
            </ul>
        </Page>
    );
}

/* ═════════════════════════════════════════════════════════════════
   BREAKDOWN STRIP
   ═════════════════════════════════════════════════════════════════ */

function Breakdown() {
    const counts: Array<{ status: Status; n: number; tone: Tone }> = [
        { status: 'building',  n: 2, tone: 'warn'    },
        { status: 'shipped',   n: 3, tone: 'good'    },
        { status: 'competing', n: 1, tone: 'warn'    },
        { status: 'shelved',   n: 2, tone: 'neutral' },
        { status: 'archive',   n: 3, tone: 'neutral' },
    ];
    return (
        <section className="mt-2 mb-6">
            <header className="flex items-baseline justify-between gap-4 pb-2 border-b border-rule">
                <span className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">
                    Breakdown
                </span>
                <span className="font-mono text-[10px] tracking-mono text-fg-soft">
                    11 projects · 5 active · 4 archived
                </span>
            </header>
            <dl className="grid grid-cols-5 gap-4 mt-4">
                {counts.map((c) => (
                    <div key={c.status} className="border-r border-rule last:border-r-0 pr-4 last:pr-0">
                        <dt className="flex items-center gap-1.5 font-mono text-[10px] tracking-kicker uppercase text-fg-soft">
                            <span
                                aria-hidden
                                className={`w-[5px] h-[5px] rounded-full ${
                                    {
                                        good: 'bg-good',
                                        warn: 'bg-warn',
                                        bad: 'bg-bad',
                                        neutral: 'bg-fg-soft',
                                    }[c.tone]
                                }`}
                            />
                            {c.status}
                        </dt>
                        <dd className="m-0 mt-1 text-[22px] font-semibold tracking-[-0.01em]">
                            {c.n}
                        </dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}

/* ═════════════════════════════════════════════════════════════════
   FILTER BAR
   ═════════════════════════════════════════════════════════════════ */

function FilterBar() {
    const filters = ['All', 'Robotics', 'Drones', 'Software', 'Combat'];
    return (
        <div className="flex items-center justify-between gap-4 pb-6 mb-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
                {filters.map((f, i) => (
                    <button
                        key={f}
                        type="button"
                        className={`
                            font-mono text-[11px] tracking-kicker uppercase
                            px-3 py-1.5 rounded border
                            transition-colors duration-150
                            ${i === 0
                            ? 'border-accent text-accent bg-accent-soft'
                            : 'border-rule text-fg-muted hover:border-rule-strong hover:text-fg'}
                        `}
                    >
                        {f}
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-fg-soft tracking-kicker uppercase">Sort</span>
                <button
                    type="button"
                    className="px-3 py-1.5 rounded border border-rule text-fg flex items-center gap-1.5 tracking-kicker uppercase hover:border-rule-strong"
                >
                    Recent
                    <span aria-hidden className="text-fg-soft">↓</span>
                </button>
            </div>
        </div>
    );
}

/* ═════════════════════════════════════════════════════════════════
   ROWS
   ═════════════════════════════════════════════════════════════════ */

function ProjectRow({ project: p }: { project: Project }) {
    return (
        <li className="border-t border-rule last:border-b last:border-rule">
            <Link
                href={p.href}
                className="grid grid-cols-[40px_minmax(0,1fr)_120px_100px_24px] gap-6 py-4 items-baseline text-fg no-underline group"
            >
                <span className="font-mono text-[12px] text-fg-soft tracking-mono">
                    {p.num}
                </span>
                <div className="min-w-0">
                    <h3 className="m-0 text-[16px] font-semibold tracking-[-0.005em] group-hover:text-accent transition-colors">
                        {p.title}
                    </h3>
                    <p className="mt-1 mb-0 text-[13.5px] text-fg-muted leading-snug max-w-[640px]">
                        {p.blurb}
                    </p>
                </div>
                <StatusText tone={STATUS_TONE[p.status]}>{p.status}</StatusText>
                <span className="font-mono text-[12px] text-fg-soft tracking-mono whitespace-nowrap">
                    {p.year}
                </span>
                <span aria-hidden className="font-mono text-fg-soft text-sm text-right group-hover:text-accent transition-colors">
                    ↗
                </span>
            </Link>
        </li>
    );
}