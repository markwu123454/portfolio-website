/**
 * Aetherius UAV — /work/aetherius
 *
 * Server component. Long-form case study layout: breadcrumbs, kicker
 * tag, h1 + subtitle, dek + chips on right, fact strip, big figure,
 * sidebar TOC + 4 sections, code block, FAILED/HOLDING stencil grid.
 *
 * If you generalise to /work/[slug]/page.tsx, lift the data block to
 * a content collection (MDX or JSON) and pass it in as a prop. For
 * now the content lives inline so it's easy to edit in one place.
 *
 * The two stencil colour conventions:
 *   STENCIL.A — `bad` (red)  — what failed
 *   STENCIL.B — `good` (green) — what holds
 */

import Link from 'next/link';
import {
    Page,
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
    title: 'Aetherius UAV',
    description:
        'Fixed-wing drone with custom MAVLink ground control. Four airframe revisions, three avionics rebuilds.',
};

export default function AetheriusPage() {
    return (
        <Page>
            <div className="pt-12">
                <Crumbs
                    items={[
                        { href: '/work', label: 'Work' },
                        { href: '/work?domain=Drones', label: 'Drones' },
                        { label: 'Aetherius UAV' },
                    ]}
                />

                <div className="font-mono text-[11px] tracking-kicker uppercase text-accent mb-4 flex items-center gap-2">
                    <span>PROJECT</span>
                    <span className="text-fg-soft">·</span>
                    <span>#04</span>
                    <span className="text-fg-soft">·</span>
                    <span>DRONES</span>
                </div>

                <div className="grid md:grid-cols-[minmax(0,1fr)_320px] gap-12 items-start mb-10">
                    <h1 className="m-0 font-semibold leading-[1.05] tracking-[-0.025em] text-[clamp(40px,5vw,64px)] max-w-[760px]">
                        Aetherius UAV —{' '}
                        <br />
                        <span className="text-fg-muted italic font-medium">
                            fixed-wing drone with custom GCS.
                        </span>
                    </h1>

                    <div>
                        <p className="m-0 mb-4 text-[15.5px] leading-[1.65] text-fg-muted max-w-[420px]">
                            Four airframe revisions, three avionics rebuilds, one
                            custom MAVLink ground control. Currently in build on rev 4
                            — twin-boom.
                        </p>
                        <div className="flex gap-2 flex-wrap">
                            <StatusPill tone="warn">Building rev 4</StatusPill>
                            <Tag>Fixed-wing</Tag>
                            <Tag>Pixhawk</Tag>
                        </div>
                    </div>
                </div>

                <StatStrip
                    cols={5}
                    items={[
                        { label: 'Year',      value: '2024 — present' },
                        { label: 'Avionics',  value: 'Pixhawk 6X · RPi 4' },
                        { label: 'GCS Stack', value: 'Tauri · React · Rust' },
                        { label: 'Materials', value: 'EPP · CF spar · 3D-printed mounts' },
                        { label: 'Next',      value: 'Maiden, rev 4 · 2026.06' },
                    ]}
                />

                <div className="mt-10">
                    <Figure caption="Fig. 1.0 — Aetherius rev 3 airframe pre-flight, March 2026. Tractor configuration; rev 4 will move to twin-boom.">
                        <FigurePlaceholder
                            label="[ rev 3 airframe — pre-flight photo ]"
                            aspect="16/9"
                        />
                    </Figure>
                </div>
            </div>

            <div className="grid md:grid-cols-[minmax(0,1fr)_240px] gap-12 mt-12">
                <article className="min-w-0">
                    <Section num="01" title="Why a fixed-wing">
                        <Prose>
                            Most student drone projects are quadcopters because they’re
                            forgiving — vertical takeoff, hover, no aerodynamic
                            surprises. Fixed-wing is harder by every measure: control
                            surfaces, stall behaviour, takeoff and landing, airframe
                            rigidity, the math of cruise vs. climb.{' '}
                            <strong className="text-fg font-semibold">
                                That difficulty is the point.
                            </strong>{' '}
                            Aetherius forces me to learn aerodynamics, controls, and
                            structural engineering in the same project.
                        </Prose>
                    </Section>

                    <Section num="02" title="Airframe revisions">
                        <RevisionList />
                    </Section>

                    <Section num="03" title="Ground control station">
                        <Prose>
                            Off-the-shelf GCS (Mission Planner, QGroundControl) work
                            but feel inherited from a different era. The custom GCS is
                            a Tauri app — React on the front, Rust on the back, MAVLink
                            protocol as the contract.
                        </Prose>
                        <CodeBlock
                            lang="rust"
                            code={`// MAVLink heartbeat handler — gcs/src/mav/heartbeat.rs
pub fn on_heartbeat(msg: &MavHeartbeat, state: &mut Telemetry) {
    state.last_heartbeat = Instant::now();
    state.armed = msg.base_mode.contains(MavModeFlag::SAFETY_ARMED);
    state.mode = FlightMode::from_custom(msg.custom_mode);
}`}
                        />
                        <Prose>
                            <strong className="text-fg font-semibold">Status:</strong>{' '}
                            GCS is single-vehicle only. Multi-vehicle support and a
                            proper mission-replay view are the next two milestones.
                        </Prose>
                    </Section>

                    <Section num="04" title="What’s failed, what’s working">
                        <StencilGrid />
                    </Section>
                </article>

                <Sidebar />
            </div>
        </Page>
    );
}

/* ═════════════════════════════════════════════════════════════════
   PROSE
   ═════════════════════════════════════════════════════════════════ */

function Prose({ children }: { children: ReactNode }) {
    return (
        <p className="m-0 mb-4 text-[15.5px] leading-[1.7] text-fg-muted max-w-[640px]">
            {children}
        </p>
    );
}

/* ═════════════════════════════════════════════════════════════════
   REVISION LIST
   ═════════════════════════════════════════════════════════════════ */

const REVS = [
    {
        rev: 'REV 1',
        date: '2024.08',
        title: 'EPP wing — proof of life',
        body: 'Foamboard fuselage, store-bought EPP wing. Pixhawk 4. First flight: 12 seconds, hard left roll into the field. Lesson: trim before launch.',
    },
    {
        rev: 'REV 2',
        date: '2025.01',
        title: 'Hand-cut CF-reinforced wing',
        body: 'Carbon-spar reinforcement of the EPP wing. New tail-dragger fuselage. Survived 12 flights before landing damage retired it.',
    },
    {
        rev: 'REV 3',
        date: '2025.07',
        title: 'Tractor config, RPi companion',
        body: 'First serious avionics stack — Pixhawk 6X + RPi 4 over MAVLink. Custom mount tray. Currently the flying revision.',
    },
    {
        rev: 'REV 4',
        date: '2026.05 (in build)',
        title: 'Twin-boom layout',
        body: 'Cleaner separation of payload pod and tail. Better access to the avionics bay. Pre-maiden — wiring loom finalised, MAVLink failsafes next.',
    },
];

function RevisionList() {
    return (
        <ol className="list-none m-0 p-0">
            {REVS.map((r) => (
                <li
                    key={r.rev}
                    className="grid grid-cols-[120px_minmax(0,1fr)] gap-6 py-5 border-t border-rule"
                >
                    <div className="font-mono text-[11px] text-fg-soft tracking-mono leading-[1.6]">
                        <div>{r.rev}</div>
                        <div>{r.date}</div>
                    </div>
                    <div>
                        <h3 className="m-0 text-[16px] font-semibold tracking-[-0.005em]">
                            {r.title}
                        </h3>
                        <p className="mt-1 mb-0 text-[14.5px] text-fg-muted leading-[1.55] max-w-[600px]">
                            {r.body}
                        </p>
                    </div>
                </li>
            ))}
        </ol>
    );
}

/* ═════════════════════════════════════════════════════════════════
   CODE BLOCK
   Plain pre/code in mono. No syntax highlighting yet — when you add
   shiki / prism later, swap the inner <code> for the highlighted
   version.
   ═════════════════════════════════════════════════════════════════ */

function CodeBlock({ lang, code }: { lang?: string; code: string }) {
    return (
        <div className="my-6 border border-rule rounded-md overflow-hidden bg-bg-elev">
            {lang && (
                <div className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft px-4 py-2 border-b border-rule">
                    {lang}
                </div>
            )}
            <pre className="m-0 p-4 overflow-x-auto">
                <code className="font-mono text-[12.5px] leading-[1.6] text-fg whitespace-pre">
                    {code}
                </code>
            </pre>
        </div>
    );
}

/* ═════════════════════════════════════════════════════════════════
   STENCIL GRID — failed / holding
   ═════════════════════════════════════════════════════════════════ */

const FAILED = [
    'Two airframes lost to landing damage.',
    'Original wiring loom flexed in flight, shorted ESC.',
    'First MAVLink failsafe config locked the controls.',
];

const HOLDING = [
    'Pixhawk 6X has been zero-failure across all of rev 3.',
    'GCS heartbeat-loss detection works as specified.',
    'CF-reinforced wing layup repeatable in 4-6 hours.',
];

function StencilGrid() {
    return (
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 mt-2">
            <Stencil label="FAILED — STENCIL.A" tone="bad" items={FAILED} />
            <Stencil label="HOLDING — STENCIL.B" tone="good" items={HOLDING} />
        </div>
    );
}

function Stencil({
                     label,
                     tone,
                     items,
                 }: {
    label: string;
    tone: 'bad' | 'good';
    items: string[];
}) {
    const color = tone === 'bad' ? 'text-bad' : 'text-good';
    return (
        <div>
            <div
                className={`font-mono text-[11px] tracking-kicker uppercase ${color} mb-3 pb-2 border-b border-rule`}
            >
                {label}
            </div>
            <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
                {items.map((it, i) => (
                    <li
                        key={i}
                        className="flex items-baseline gap-2 text-[14.5px] text-fg-muted leading-[1.55]"
                    >
                        <span aria-hidden className="text-fg-soft font-mono text-[11px]">
                            —
                        </span>
                        {it}
                    </li>
                ))}
            </ul>
        </div>
    );
}

/* ═════════════════════════════════════════════════════════════════
   SIDEBAR — on-this-page TOC + related
   Static for now; if you want active-section highlighting, convert
   this and the Section component to client + IntersectionObserver.
   ═════════════════════════════════════════════════════════════════ */

function Sidebar() {
    const toc = [
        { id: '01', label: 'Why a fixed-wing' },
        { id: '02', label: 'Airframe revisions' },
        { id: '03', label: 'Ground control station' },
        { id: '04', label: 'What’s failed' },
    ];
    const related = [
        { href: '/work/aetherius-gcs', label: 'Aetherius GCS' },
        { href: '/work/tempest', label: 'Project Tempest' },
    ];
    return (
        <aside className="md:sticky md:top-24 self-start text-[13px]">
            <div className="border-t border-rule pt-3 mb-8">
                <div className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft mb-3">
                    On this page
                </div>
                <ul className="list-none m-0 p-0 flex flex-col gap-1.5">
                    {toc.map((t, i) => (
                        <li key={t.id}>
                            <Link
                                href={`#${t.id}`}
                                className={`text-[13px] hover:text-accent transition-colors ${
                                    i === 0 ? 'text-accent' : 'text-fg-muted'
                                }`}
                            >
                                {t.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="border-t border-rule pt-3">
                <div className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft mb-3">
                    Related
                </div>
                <ul className="list-none m-0 p-0 flex flex-col gap-1.5">
                    {related.map((r) => (
                        <li key={r.href}>
                            <Link
                                href={r.href}
                                className="text-[13px] text-fg-muted hover:text-accent transition-colors flex items-baseline gap-2"
                            >
                                <span aria-hidden className="text-fg-soft font-mono text-[11px]">
                                    —
                                </span>
                                {r.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}