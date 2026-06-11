/**
 * Experiments — /experiments
 *
 * Hardcoded index. To add a new entry: add to READY or WIP below.
 * Server component.
 */

import Link from 'next/link';
import { Page, PageHeader } from '@/app/components/site/primitives';
import {Metadata} from "next";
import React from "react";

export const metadata: Metadata = {
    title: 'Experiments',
    description: 'Interactive toys and algorithm visualisers.',
};

interface Experiment {
    href: string;
    category: string;
    title: string;
    blurb: string;
    preview: React.ReactNode;
}

/* ─────────────────────────────────────────────────────────────────
   Previews
   ───────────────────────────────────────────────────────────────── */

const SNAKE_PREVIEW = (
    <svg viewBox="0 0 360 360" preserveAspectRatio="xMidYMid meet" className="w-full h-full" aria-hidden>
        {Array.from({ length: 36 }).map((_, i) => (
            <rect key={i} x={(i % 6) * 60} y={Math.floor(i / 6) * 60} width={60} height={60} fill="var(--bg)" stroke="var(--rule)" strokeWidth={1} />
        ))}
        <polyline fill="none" stroke="var(--rule-strong)" strokeWidth={2}
                  points="30,30 90,30 150,30 210,30 270,30 330,30 330,90 270,90 210,90 150,90 90,90 30,90 30,150 90,150 150,150 210,150 270,150 330,150 330,210 270,210 210,210 150,210 90,210 30,210 30,270 90,270 150,270 210,270 270,270 330,270 330,330 270,330 210,330 150,330 90,330 30,330 30,30" />
        <polyline fill="none" stroke="#facc15" strokeWidth={4} strokeLinecap="round"
                  points="150,150 210,150 270,150 270,210 210,210 150,210 150,270" />
        <polyline fill="none" stroke="#22c55e" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round"
                  points="150,150 90,150 90,90 150,90 210,90 270,90" />
        <circle cx={270} cy={90} r={13} fill="#16a34a" />
        <circle cx={150} cy={270} r={11} fill="#dc2626" />
    </svg>
);

// Rush Hour board preview — static 6×6 snapshot
const RUSH_HOUR_BOARD = [
    ['.','.','.','.','.','.' ],
    ['.','.','.','.','.','.'],
    ['.','.','.','.','.','.'],
    ['.','.','A','A','.','.'],
    ['.','.','C','B','.','.'],
    ['.','.','C','B','.','.'],
];

function hsl(id: string) {
    if (id === '.') return 'transparent';
    const h = (id.charCodeAt(0) * 57) % 360;
    return `hsl(${h} 65% 62%)`;
}

const STATE_SPACE_PREVIEW = (
    <div className="w-full h-full p-3 grid" style={{ gridTemplateRows: 'repeat(6,1fr)', gridTemplateColumns: 'repeat(6,1fr)', gap: 3 }} aria-hidden>
        {RUSH_HOUR_BOARD.map((row, r) =>
            row.map((ch, c) => (
                <div
                    key={`${r}-${c}`}
                    className={`rounded-[3px] border ${ch === '.' ? 'border-dashed border-rule' : 'border-rule'}`}
                    style={{ background: hsl(ch) }}
                />
            ))
        )}
    </div>
);

// Digital Footprint Mirror preview — a redacted paper record
const FOOTPRINT_PREVIEW = (
    <svg viewBox="0 0 360 270" preserveAspectRatio="xMidYMid slice" className="w-full h-full" aria-hidden>
        <rect width={360} height={270} fill="#E9E7E1" />
        {Array.from({ length: 9 }).map((_, i) => (
            <line key={i} x1={0} x2={360} y1={28 * (i + 1)} y2={28 * (i + 1)} stroke="#78766E" strokeOpacity={0.12} />
        ))}
        <rect x={26} y={22} width={308} height={58} fill="#F2F0EA" stroke="#1A1A18" strokeWidth={2} />
        <rect x={40} y={36} width={104} height={6} fill="#52514C" opacity={0.6} />
        <rect x={40} y={50} width={168} height={16} fill="#1A1A18" />
        <g transform="rotate(-9 286 50)">
            <rect x={246} y={36} width={80} height={26} rx={2} fill="none" stroke="#C0362C" strokeWidth={3} />
            <text x={286} y={54} textAnchor="middle" fontSize={12} fontWeight={700} fill="#C0362C"
                  fontFamily="system-ui, sans-serif" letterSpacing={1}>ON FILE</text>
        </g>
        {([[104, 96, 178], [134, 72, 188], [164, 88, 150], [194, 60, 196], [224, 92, 132]] as const).map(([y, lw, bw], i) => (
            <g key={i}>
                <rect x={26} y={y} width={lw} height={6} fill="#52514C" opacity={0.55} />
                <rect x={138} y={y - 5} width={bw} height={15} fill="#16150F" />
                <line x1={26} x2={334} y1={y + 14} y2={y + 14} stroke="#CFCCC3" />
            </g>
        ))}
    </svg>
);

/* ─────────────────────────────────────────────────────────────────
   Data
   ───────────────────────────────────────────────────────────────── */

const READY: Experiment[] = [
    {
        href: '/experiments/snake',
        category: 'ALGORITHM',
        title: 'Snake',
        blurb: 'Snake agent using an optimised Hamiltonian cycle, it is guaranteed to win.',
        preview: SNAKE_PREVIEW,
    },
    {
        href: '/experiments/state-space',
        category: 'ALGORITHM',
        title: 'State Space',
        blurb: 'Rush Hour board explorer, BFS over all reachable states, visualised in 3D.',
        preview: STATE_SPACE_PREVIEW,
    },
    {
        href: '/experiments/digital-footprint',
        category: 'PRIVACY',
        title: 'Digital Footprint Mirror',
        blurb: 'Everything you hand a site by just loading it, assembled into a disclosure record in front of you.',
        preview: FOOTPRINT_PREVIEW,
    },
];

const WIP: Pick<Experiment, 'title' | 'blurb'>[] = [
    { title: 'Collatz Conjecture',  blurb: 'Hailstone-sequence visualiser.'              },
    { title: 'Hamiltonian Path',    blurb: 'Path explorer on small graphs.'              },
    { title: 'MathPad',            blurb: 'Tiny calculator with history.'               },
    { title: 'Tolerance Checker',  blurb: 'Fit-check tool for 3D-printed mating parts.' },
];

/* ─────────────────────────────────────────────────────────────────
   Page
   ───────────────────────────────────────────────────────────────── */

export default function ExperimentsPage() {
    return (
        <Page>
            <PageHeader
                tag={['EXPERIMENTS', `${READY.length + WIP.length} TOTAL`]}
                title="Experiments —"
                subtitle="interactive toys and visualisers."
                dek="Online projects not as big as the others."
            />

            <GroupHeader tone="good" count={READY.length} label="READY" aside="Click to open" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-8 mb-16">
                {READY.map((e, i) => (
                    <ReadyTile key={e.href} num={String(i + 1).padStart(2, '0')} experiment={e} />
                ))}
            </div>

            <GroupHeader tone="warn" count={WIP.length} label="WIP" aside="Not yet shipped" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-8">
                {WIP.map((e, i) => (
                    <WipTile key={i} title={e.title} blurb={e.blurb} />
                ))}
            </div>
        </Page>
    );
}

/* ─────────────────────────────────────────────────────────────────
   Components
   ───────────────────────────────────────────────────────────────── */

function GroupHeader({ tone, count, label, aside }: { tone: 'good' | 'warn'; count: number; label: string; aside: string }) {
    const dotCls = tone === 'good' ? 'bg-good' : 'bg-warn';
    return (
        <header className="flex items-baseline justify-between gap-4 pb-3 mb-6 border-b border-rule">
            <div className="flex items-baseline gap-3 font-mono text-[12px] tracking-kicker uppercase">
                <span aria-hidden className={`w-2 h-2 rounded-full ${dotCls}`} />
                <span className="text-fg">{label}</span>
                <span className="text-fg-soft">·</span>
                <span className="text-fg">{count}</span>
            </div>
            <span className="font-mono text-[11px] text-fg-soft">{aside}</span>
        </header>
    );
}

function ReadyTile({ num, experiment: e }: { num: string; experiment: Experiment }) {
    return (
        <Link href={e.href} className="group block no-underline text-fg">
            <div className="relative bg-bg-elev border border-rule rounded-md aspect-4/3 overflow-hidden transition-colors duration-150 group-hover:border-rule-strong">
                <div className="absolute inset-0">{e.preview}</div>
                <span className="absolute top-2 right-2 font-mono text-[10px] tracking-mono text-fg-soft bg-bg/70 px-1 rounded">
                    {num}
                </span>
                <span className="absolute bottom-2 left-2 font-mono text-[10px] tracking-kicker uppercase text-accent">
                    {e.category}
                </span>
            </div>
            <h3 className="mt-3 mb-1 text-[15px] font-semibold tracking-tight-1 group-hover:text-accent transition-colors">
                {e.title}
            </h3>
            <p className="m-0 text-[13px] text-fg-muted leading-snug">{e.blurb}</p>
        </Link>
    );
}

function WipTile({ title, blurb }: { title: string; blurb: string }) {
    return (
        <div>
            <div className="bg-bg-elev/60 border border-dashed border-rule rounded-md aspect-4/3" />
            <h3 className="mt-3 mb-1 text-[15px] font-semibold tracking-tight-1 text-fg-muted">{title}</h3>
            <p className="m-0 text-[13px] text-fg-soft leading-snug">{blurb}</p>
        </div>
    );
}