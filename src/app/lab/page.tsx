/**
 * Lab — /lab
 *
 * Server component. Sketchbook of small interactive toys, in two
 * groups: READY (8) and WIP (2). Each tile has a category kicker,
 * title, and one-liner. Image area is a placeholder for now — when
 * you have screenshots, swap FigurePlaceholder for a real <img>.
 */

import Link from 'next/link';
import { Page, PageHeader, FigurePlaceholder } from '../components/site/primitives';

export const metadata = {
    title: 'Lab',
    description: 'Sketchbook — small interactive toys.',
};

interface Tile {
    num: string;
    href: string;
    category: string;
    title: string;
    blurb: string;
}

const READY: Tile[] = [
    { num: '01', href: '/lab/snake', category: 'GAMES', title: 'Snake', blurb: 'Classic snake. Keyboard, no AI.' },
    { num: '02', href: '/lab/collatz', category: 'MATH', title: 'Collatz Conjecture', blurb: 'Hailstone-sequence visualiser. Click for next.' },
    { num: '03', href: '/lab/hamiltonian', category: 'GRAPHS', title: 'Hamiltonian', blurb: 'Hamiltonian path explorer on small graphs.' },
    { num: '04', href: '/lab/mathpad', category: 'TOOLS', title: 'MathPad', blurb: 'Tiny calculator with history.' },
    { num: '05', href: '/lab/gatcha', category: 'STATS', title: 'Gatcha Simulator', blurb: 'Pity-curve sandbox. See what 0.6% really feels like.' },
    { num: '06', href: '/lab/tolerance', category: 'CAD', title: 'Tolerance Tester', blurb: 'Slop / fit-check tool for 3D-printed mating parts.' },
    { num: '07', href: '/lab/state-space', category: 'CONTROLS', title: 'State Space', blurb: 'Pendulum phase-portrait, scrubbable.' },
    { num: '08', href: '/lab/codeless-graphs', category: 'MATH', title: 'Codeless Graphs', blurb: 'Drag-to-plot — like Desmos but worse.' },
];

const WIP: Pick<Tile, 'title' | 'blurb'>[] = [
    { title: '3D Experiments', blurb: 'Three.js sandboxes — softbody, IK, particle.' },
    { title: 'YouTube Player', blurb: 'Custom queue UI for long-form lectures.' },
];

export default function LabPage() {
    return (
        <Page>
            <PageHeader
                tag={['LAB', '10 SKETCHES', '#006']}
                title="Sketchbook —"
                subtitle="small interactive toys."
                dek="Where I try out an idea in an afternoon. Most are toys; a few turned out useful enough to keep using."
            />

            <GroupHeader
                tone="good"
                count={READY.length}
                label="READY"
                aside="Click any tile to open"
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-8 mb-16">
                {READY.map((t) => (
                    <ReadyTile key={t.num} tile={t} />
                ))}
            </div>

            <GroupHeader
                tone="warn"
                count={WIP.length}
                label="WIP"
                aside="Not yet shipped"
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-8">
                {WIP.map((t, i) => (
                    <WipTile key={i} tile={t} />
                ))}
            </div>
        </Page>
    );
}

/* ─────────────────────────────────────────────────────────────────
   Group header — the "● READY · 8" row with hairline + aside.
   ───────────────────────────────────────────────────────────────── */

function GroupHeader({
                         tone,
                         count,
                         label,
                         aside,
                     }: {
    tone: 'good' | 'warn';
    count: number;
    label: string;
    aside: string;
}) {
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

/* ─────────────────────────────────────────────────────────────────
   Tiles
   ───────────────────────────────────────────────────────────────── */

function ReadyTile({ tile }: { tile: Tile }) {
    return (
        <Link
            href={tile.href}
            className="group block no-underline text-fg"
        >
            <div className="relative bg-bg-elev border border-rule rounded-md aspect-[4/3] overflow-hidden transition-colors duration-150 group-hover:border-rule-strong">
                <span className="absolute top-3 right-3 font-mono text-[10px] tracking-mono text-fg-soft">
                    {tile.num}
                </span>
                <span className="absolute bottom-3 left-3 font-mono text-[10px] tracking-kicker uppercase text-accent">
                    {tile.category}
                </span>
            </div>
            <h3 className="mt-3 mb-1 text-[15px] font-semibold tracking-[-0.005em] group-hover:text-accent transition-colors">
                {tile.title}
            </h3>
            <p className="m-0 text-[13px] text-fg-muted leading-snug">
                {tile.blurb}
            </p>
        </Link>
    );
}

function WipTile({ tile }: { tile: Pick<Tile, 'title' | 'blurb'> }) {
    return (
        <div className="block">
            <div className="bg-bg-elev/60 border border-dashed border-rule rounded-md aspect-[4/3]" />
            <h3 className="mt-3 mb-1 text-[15px] font-semibold tracking-[-0.005em] text-fg-muted">
                {tile.title}
            </h3>
            <p className="m-0 text-[13px] text-fg-soft leading-snug">
                {tile.blurb}
            </p>
        </div>
    );
}