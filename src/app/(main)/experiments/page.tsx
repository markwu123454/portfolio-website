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

import { generateHamiltonianBasic } from './snake/snakeAlgo';

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

/* ── 01 · Snake — real Hamiltonian cycle ─────────────────────────── */

const SNAKE_ROWS = 9, SNAKE_COLS = 12, SNAKE_CELL = 30;
const SNAKE_CYCLE = generateHamiltonianBasic(SNAKE_ROWS, SNAKE_COLS);
const SNAKE_N = SNAKE_CYCLE.length;
const SNAKE_HEAD = 58 % SNAKE_N;                 // any index — picks where the head sits
const snakeXY = (v: number): [number, number] => [
    (v % SNAKE_COLS) * SNAKE_CELL + SNAKE_CELL / 2,
    Math.floor(v / SNAKE_COLS) * SNAKE_CELL + SNAKE_CELL / 2,
];
const snakePts = (cells: number[]) => cells.map(snakeXY).map(([x, y]) => `${x},${y}`).join(' ');
// body = contiguous arc trailing the head; route = forward arc head→apple
const SNAKE_BODY = Array.from({ length: 34 }, (_, i) => SNAKE_CYCLE[((SNAKE_HEAD - i) % SNAKE_N + SNAKE_N) % SNAKE_N]);
const SNAKE_ROUTE = Array.from({ length: 10 }, (_, i) => SNAKE_CYCLE[(SNAKE_HEAD + i) % SNAKE_N]);
const SNAKE_HEAD_XY = snakeXY(SNAKE_CYCLE[SNAKE_HEAD]);
const SNAKE_TAIL_XY = snakeXY(SNAKE_BODY[SNAKE_BODY.length - 1]);
const SNAKE_APPLE_XY = snakeXY(SNAKE_CYCLE[(SNAKE_HEAD + 9) % SNAKE_N]);

const SNAKE_PREVIEW = (
    <svg viewBox={`0 0 ${SNAKE_COLS * SNAKE_CELL} ${SNAKE_ROWS * SNAKE_CELL}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full" aria-hidden>
        {Array.from({ length: SNAKE_ROWS * SNAKE_COLS }).map((_, i) => (
            <rect key={i} x={(i % SNAKE_COLS) * SNAKE_CELL} y={Math.floor(i / SNAKE_COLS) * SNAKE_CELL}
                  width={SNAKE_CELL} height={SNAKE_CELL} fill="var(--bg)" stroke="var(--rule)" strokeWidth={1} />
        ))}
        <polyline fill="none" stroke="var(--rule-strong)" strokeWidth={2} strokeLinejoin="round"
                  points={snakePts([...SNAKE_CYCLE, SNAKE_CYCLE[0]])} />
        <polyline fill="none" stroke="#facc15" strokeWidth={SNAKE_CELL * 0.22} strokeLinecap="round" strokeLinejoin="round"
                  points={snakePts(SNAKE_ROUTE)} />
        <polyline fill="none" stroke="#22c55e" strokeWidth={SNAKE_CELL * 0.6} strokeLinecap="round" strokeLinejoin="round"
                  points={snakePts(SNAKE_BODY)} />
        <circle cx={SNAKE_APPLE_XY[0]} cy={SNAKE_APPLE_XY[1]} r={SNAKE_CELL * 0.3} fill="#dc2626" />
        <circle cx={SNAKE_HEAD_XY[0]} cy={SNAKE_HEAD_XY[1]} r={SNAKE_CELL * 0.4} fill="#16a34a" />
        <circle cx={SNAKE_TAIL_XY[0]} cy={SNAKE_TAIL_XY[1]} r={SNAKE_CELL * 0.28} fill="#15803d" />
    </svg>
);

/* ── 02 · State Space — projected 3D BFS state graph ─────────────── */

function ssRng(seed: number) { let a = seed >>> 0; return () => { a ^= a << 13; a ^= a >>> 17; a ^= a << 5; a >>>= 0; return a / 4294967296; }; }
const SS_W = 360, SS_H = 270;
const SS_NODES = (() => {
    const r = ssRng(4117), n = 150;
    const out: { parent: number; depth: number; x: number; y: number; z: number }[] = [];
    for (let i = 0; i < n; i++) {
        const parent = i === 0 ? -1 : Math.floor(r() * Math.max(1, i * 0.55));
        const depth = parent < 0 ? 0 : out[parent].depth + 1;
        const rad = 0.7 + depth * 0.66 + r() * 0.35;
        const th = r() * Math.PI * 2, ph = Math.acos(2 * r() - 1);
        out.push({ parent, depth, x: rad * Math.sin(ph) * Math.cos(th), y: rad * Math.sin(ph) * Math.sin(th), z: rad * Math.cos(ph) });
    }
    return out;
})();
const SS_PROJ = (() => {
    const scale = 27, rotY = 0.7, rotX = 0.34, persp = 9, cx = SS_W / 2, cy = SS_H / 2;
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY), cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    return SS_NODES.map((nd) => {
        const x1 = nd.x * cosY + nd.z * sinY, z1 = -nd.x * sinY + nd.z * cosY;
        const y2 = nd.y * cosX + z1 * sinX, z2 = -nd.y * sinX + z1 * cosX;
        const f = persp / (persp - z2);
        return { sx: cx + x1 * scale * f, sy: cy + y2 * scale * f, f, z2 };
    });
})();
const SS_MAXD = Math.max(...SS_NODES.map((n) => n.depth));
const SS_PATH = (() => { const p: number[] = []; let cur = SS_NODES.length - 1; while (cur >= 0) { p.unshift(cur); cur = SS_NODES[cur].parent; } return p; })();
const SS_PATHSET = new Set(SS_PATH);
const SS_ORDER = SS_NODES.map((_, i) => i).sort((a, b) => SS_PROJ[a].z2 - SS_PROJ[b].z2);

const STATE_SPACE_PREVIEW = (
    <svg viewBox={`0 0 ${SS_W} ${SS_H}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full" aria-hidden>
        {SS_NODES.map((nd, i) => {
            if (nd.parent < 0) return null;
            const on = SS_PATHSET.has(i) && SS_PATHSET.has(nd.parent);
            return <line key={`e${i}`} x1={SS_PROJ[nd.parent].sx} y1={SS_PROJ[nd.parent].sy} x2={SS_PROJ[i].sx} y2={SS_PROJ[i].sy}
                         stroke={on ? 'var(--accent)' : 'var(--rule)'} strokeWidth={on ? 1.6 : Math.max(0.4, SS_PROJ[i].f * 0.5)} opacity={on ? 0.85 : 1} />;
        })}
        {SS_ORDER.map((i) => {
            const onPath = SS_PATHSET.has(i), goal = i === SS_NODES.length - 1, root = i === 0;
            return <circle key={i} cx={SS_PROJ[i].sx} cy={SS_PROJ[i].sy} r={Math.max(1.2, SS_PROJ[i].f * (onPath ? 3 : 2))}
                           fill={goal ? 'var(--good)' : 'var(--accent)'}
                           fillOpacity={goal || onPath ? 1 : 0.95 - (SS_NODES[i].depth / SS_MAXD) * 0.5}
                           stroke={root ? 'var(--fg)' : 'none'} strokeWidth={root ? 1.5 : 0} />;
        })}
    </svg>
);

/* ── 03 · Digital Footprint — themed signal readout ──────────────── */

const FOOT_ROWS: Array<[string, number, string?]> = [
    ['IP ADDR', 0.62], ['LOCATION', 0.5], ['BROWSER', 0.74],
    ['SCREEN', 0, '1512×982'], ['TIMEZONE', 0.44], ['BATTERY', 0.3], ['FONTS', 0.66],
];

const FOOTPRINT_PREVIEW = (
    <svg viewBox="0 0 360 270" preserveAspectRatio="xMidYMid meet" className="w-full h-full" aria-hidden>
        <text x={22} y={16} fontFamily="var(--font-mono)" fontSize={9.5} letterSpacing={2} fill="var(--fg-soft)">PASSIVE SIGNALS · 7</text>
        {FOOT_ROWS.map(([label, frac, live], i) => {
            const y = 26 + i * 30, x0 = 22, lw = 96;
            return (
                <g key={i}>
                    <line x1={x0} x2={338} y1={y + 22} y2={y + 22} stroke="var(--rule)" />
                    <text x={x0} y={y + 6} fontFamily="var(--font-mono)" fontSize={10} letterSpacing={1.5} fill="var(--fg-muted)">{label}</text>
                    {live
                        ? <text x={x0 + lw} y={y + 6} fontFamily="var(--font-mono)" fontSize={11} fill="var(--accent)">{live}</text>
                        : <rect x={x0 + lw} y={y - 6} width={(338 - x0 - lw) * frac} height={13} rx={2} fill="var(--fg)" opacity={0.82} />}
                </g>
            );
        })}
    </svg>
);

/* ── 04 · Pull Planner — rising probability curve ───────────────── */

const PP_W = 360, PP_H = 270, PP_PL = 20, PP_PR = 14, PP_PT = 18, PP_PB = 20;
const PP_IW = PP_W - PP_PL - PP_PR, PP_IH = PP_H - PP_PT - PP_PB;
// a logistic-ish saving curve: flat, then soft-pity ramp, then plateau near 1
const PP_CDF = (k: number) => 1 / (1 + Math.exp(-11 * (k - 0.62)));
const PP_N = 60;
const ppX = (t: number) => PP_PL + t * PP_IW;
const ppY = (p: number) => PP_PT + (1 - p) * PP_IH;
const PP_PTS = Array.from({length: PP_N + 1}, (_, i) => {
    const t = i / PP_N;
    return `${ppX(t).toFixed(1)},${ppY(PP_CDF(t)).toFixed(1)}`;
}).join(" ");
const PP_NOW = 0.44, PP_DL = 0.78;   // "now" and "deadline" points along x

const PULL_PATIENCE_PREVIEW = (
    <svg viewBox={`0 0 ${PP_W} ${PP_H}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full" aria-hidden>
        {[0, 0.5, 1].map((p) => (
            <line key={p} x1={PP_PL} x2={PP_W - PP_PR} y1={ppY(p)} y2={ppY(p)} stroke="var(--rule)" />
        ))}
        <polygon points={`${PP_PL},${PP_PT + PP_IH} ${PP_PTS} ${(PP_PL + PP_IW).toFixed(1)},${PP_PT + PP_IH}`} fill="var(--accent-soft)" />
        <polyline points={PP_PTS} fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeLinejoin="round" />
        {/* now */}
        <line x1={ppX(PP_NOW)} x2={ppX(PP_NOW)} y1={PP_PT} y2={PP_PT + PP_IH} stroke="var(--fg-soft)" strokeWidth={1.5} />
        <circle cx={ppX(PP_NOW)} cy={ppY(PP_CDF(PP_NOW))} r={4} fill="var(--fg)" />
        {/* deadline */}
        <line x1={ppX(PP_DL)} x2={ppX(PP_DL)} y1={PP_PT} y2={PP_PT + PP_IH} stroke="var(--good)" strokeWidth={1.5} />
        <circle cx={ppX(PP_DL)} cy={ppY(PP_CDF(PP_DL))} r={4} fill="var(--good)" />
        <text x={ppX(PP_DL) + 6} y={ppY(PP_CDF(PP_DL)) - 6} fontFamily="var(--font-mono)" fontSize={13} fill="var(--good)">78%</text>
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
    {
        href: '/experiments/pull-planner',
        category: 'PROBABILITY',
        title: 'Pull Planner',
        blurb: 'A local tracker for gacha savers: your pity, stash, and saving rate become a live chance of hitting the target by your deadline.',
        preview: PULL_PATIENCE_PREVIEW,
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