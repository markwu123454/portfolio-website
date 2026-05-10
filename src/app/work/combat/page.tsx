/**
 * Team Infernope — /work/combat
 *
 * Server component. Combat-robotics retrospective on the "hazard"
 * palette (amber + red). The hazard-stripe band at top and bottom is
 * the signature visual — provided by tokens.css's .hazard-stripe
 * class, which auto-flips colors with the theme.
 *
 * data-theme="hazard" wraps the whole page so amber/red replace the
 * default sky accent on every nested utility (.text-accent, etc.).
 */

import {
    Section,
    StatusPill,
    Tag,
    Crumbs,
    StatStrip,
    Figure,
    FigurePlaceholder,
} from '../../components/site/primitives';
import type { ReactNode } from 'react';

export const metadata = {
    title: 'Team Infernope',
    description:
        'Twelve combat robots, three years. 1st place, end-of-year tournament ’25.',
};

export default function CombatPage() {
    return (
        <div data-theme="hazard">
            <div className="hazard-stripe" />

            <main className="max-w-[1100px] mx-auto px-8 pb-12">
                <div className="pt-12">
                    <Crumbs
                        items={[
                            { href: '/work', label: 'Work' },
                            { href: '/work?domain=Combat', label: 'Combat' },
                            { label: 'Team Infernope' },
                        ]}
                    />

                    <div className="font-mono text-[11px] tracking-kicker uppercase text-accent-2 mb-4 flex items-center gap-2">
                        <span>ARCHIVE</span>
                        <span className="text-fg-soft">·</span>
                        <span>12 ROBOTS</span>
                        <span className="text-fg-soft">·</span>
                        <span>3 YEARS</span>
                        <span className="text-fg-soft">·</span>
                        <span>#008</span>
                    </div>

                    <div className="grid md:grid-cols-[minmax(0,1fr)_320px] gap-12 items-start mb-10">
                        <h1 className="m-0 font-mono uppercase font-semibold leading-[1.05] tracking-[0] text-[clamp(36px,4.5vw,52px)] max-w-[760px]">
                            Team Infernope —{' '}
                            <br />
                            twelve robots, three years.
                        </h1>

                        <div>
                            <p className="m-0 mb-4 text-[15.5px] leading-[1.65] text-fg-muted max-w-[420px]">
                                Combat robotics, 1lb and 3lb classes. Run by Mark
                                Duffield. End-of-year tournament ’25 — first place.
                                This page is the after-action report; the team is
                                closed for now.
                            </p>
                            <div className="flex gap-2 flex-wrap">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-sm border border-accent bg-accent text-bg font-mono text-[11px] tracking-mono uppercase">
                                    1st · EOY ’25
                                </span>
                                <Tag>1lb · 3lb</Tag>
                                <Tag>2022 — 2025</Tag>
                            </div>
                        </div>
                    </div>

                    <StatStrip
                        cols={4}
                        items={[
                            { label: 'Bots built', value: '12'              },
                            { label: 'Events',     value: '9'               },
                            { label: 'Wins',       value: '1 · EOY ’25'    },
                            { label: 'Years',      value: '3'               },
                        ]}
                    />
                </div>

                <Section num="01" title="The fleet">
                    <FleetGrid />
                </Section>

                <Section num="02" title="After-action — what combat actually teaches">
                    <Stencils />
                </Section>

                <Section num="03" title="Final season — EOY ’25">
                    <Figure caption="Fig. 3.1 — Mk.IX (1lb drum) post-tournament. Drum still spins.">
                        <FigurePlaceholder
                            label="[ Mk.IX post-tournament — drum cross-section ]"
                            aspect="16/9"
                        />
                    </Figure>
                    <p className="m-0 text-[15.5px] leading-[1.7] text-fg-muted max-w-[640px]">
                        We took two robots into the end-of-year. Both won their
                        weight class.{' '}
                        <strong className="text-fg font-semibold">Mk.IX</strong>{' '}
                        took 1lb on a 4-0 bracket;{' '}
                        <strong className="text-fg font-semibold">Mk.X</strong>{' '}
                        took 3lb after a controlled draw on the bench. The team
                        closed at the end of the season.
                    </p>
                </Section>
            </main>

            <div className="hazard-stripe mt-12" />
        </div>
    );
}

/* ═════════════════════════════════════════════════════════════════
   FLEET GRID — 12 robots, 4 columns
   ═════════════════════════════════════════════════════════════════ */

interface Bot {
    mark: string;
    spec: string;
    /** Outcome — drives both badge text and color. */
    outcome: 'destroyed' | 'retired' | 'scrapped' | 'winner';
}

const FLEET: Bot[] = [
    { mark: 'Mk.I',    spec: '1lb · vertical spinner',  outcome: 'destroyed' },
    { mark: 'Mk.II',   spec: '1lb · drum',              outcome: 'retired'   },
    { mark: 'Mk.III',  spec: '3lb · horizontal',        outcome: 'retired'   },
    { mark: 'Mk.IV',   spec: '3lb · drum',              outcome: 'destroyed' },
    { mark: 'Mk.V',    spec: '1lb · undercut',          outcome: 'retired'   },
    { mark: 'Mk.VI',   spec: '3lb · vertical',          outcome: 'retired'   },
    { mark: 'Mk.VII',  spec: '1lb · wedge',             outcome: 'retired'   },
    { mark: 'Mk.VIII', spec: '3lb · horizontal',        outcome: 'destroyed' },
    { mark: 'Mk.IX',   spec: '1lb · drum (revised)',    outcome: 'winner'    },
    { mark: 'Mk.X',    spec: '3lb · vertical',          outcome: 'winner'    },
    { mark: 'Mk.XI',   spec: '1lb · lifter (concept)',  outcome: 'scrapped'  },
    { mark: 'Mk.XII',  spec: '3lb · drum (concept)',    outcome: 'scrapped'  },
];

function FleetGrid() {
    return (
        <ul className="list-none m-0 p-0 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {FLEET.map((b) => (
                <li
                    key={b.mark}
                    className={`
                        border rounded p-3
                        ${b.outcome === 'winner'
                        ? 'border-accent bg-accent-soft'
                        : 'border-rule bg-bg-elev'}
                    `}
                >
                    <div className="font-mono text-[14px] text-fg mb-1">{b.mark}</div>
                    <div className="text-[12px] text-fg-muted mb-2 font-mono">
                        {b.spec}
                    </div>
                    <OutcomeLabel outcome={b.outcome} />
                </li>
            ))}
        </ul>
    );
}

function OutcomeLabel({ outcome }: { outcome: Bot['outcome'] }) {
    const cfg = {
        destroyed: { text: 'DESTROYED',  cls: 'text-accent-2' }, // hazard red
        retired:   { text: 'RETIRED',    cls: 'text-fg-soft'  },
        scrapped:  { text: 'SCRAPPED',   cls: 'text-fg-soft'  },
        winner:    { text: '1ST EOY ’25',cls: 'text-accent'   }, // hazard amber
    }[outcome];
    return (
        <div className={`font-mono text-[10px] tracking-kicker uppercase ${cfg.cls}`}>
            {cfg.text}
        </div>
    );
}

/* ═════════════════════════════════════════════════════════════════
   STENCILS — failed (red) and learned (amber/accent)
   ═════════════════════════════════════════════════════════════════ */

const FAILED = [
    'Fragile components survive the bench but not the arena.',
    'Six of twelve bots lost wiring before they lost weapons.',
    'Three months of CAD beats nothing without the parts in hand.',
    'Battery bays you can’t reach in 30 seconds aren’t battery bays.',
];

const LEARNED = [
    'Build to fail predictably; failures should be replaceable, not catastrophic.',
    'Wire looms, strain relief, connector quality — these are the real engineering.',
    'Fast iteration > perfect prints. The tournament is the spec.',
    'Document destruction. The post-fight teardown teaches more than the build.',
];

function Stencils() {
    return (
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 mt-2">
            <StencilCol label="FAILED — STENCIL.A" tone="red" items={FAILED} />
            <StencilCol label="LEARNED — STENCIL.B" tone="amber" items={LEARNED} />
        </div>
    );
}

function StencilCol({
                        label,
                        tone,
                        items,
                    }: {
    label: string;
    tone: 'red' | 'amber';
    items: string[];
}) {
    const color = tone === 'red' ? 'text-accent-2' : 'text-accent';
    return (
        <div>
            <div className={`font-mono text-[11px] tracking-kicker uppercase ${color} mb-3 pb-2 border-b border-rule`}>
                {label}
            </div>
            <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
                {items.map((it, i) => (
                    <li
                        key={i}
                        className="flex items-baseline gap-2 text-[14.5px] text-fg-muted leading-[1.55]"
                    >
                        <span aria-hidden className="text-fg-soft font-mono text-[11px]">—</span>
                        {it}
                    </li>
                ))}
            </ul>
        </div>
    );
}