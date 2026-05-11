/**
 * Work — /work
 *
 * Server component. Index of all 7 projects with a stats breakdown
 * row, domain filters, and sort. Filter + sort state lives in the
 * URL (?domain=robotics&sort=name) so the page stays server-rendered
 * and links are shareable.
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
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Work — 7 projects',
    description:
        'Seven projects. Filter by domain. Status reflects current activity, not completion year.',
};

/* ─────────────────────────────────────────────────────────────────
   DATA
   ───────────────────────────────────────────────────────────────── */

type Status = 'building' | 'shipped' | 'archive';
type Domain = 'Robotics' | 'Drones' | 'Software' | 'Combat';
type SortKey = 'recent' | 'name' | 'status';

interface Project {
    num: string;
    href: string;
    title: string;
    blurb: string;
    status: Status;
    domain: Domain;
    year: string;
    /** Numeric recency key — higher = more recent. Used by sort=recent. */
    recency: number;
}

const PROJECTS: Project[] = [
    { num: '01', href: '/work/harbinger',     title: 'Harbinger',               blurb: 'Embedded C++ turret with coilgun actuator and closed-loop heading control. Current main project.',          status: 'building', domain: 'Robotics', year: '2025 —',  recency: 100 },
    { num: '02', href: '/work/aetherius',     title: 'Aetherius UAV',           blurb: 'Fixed-wing drone — Pixhawk avionics, MAVLink telemetry. Twin-boom in build.',                              status: 'building', domain: 'Drones',   year: '2024 —',  recency: 95  },
    { num: '03', href: '/work/sprocketstats', title: 'SprocketStats',           blurb: 'Real-time scouting + analytics for FRC. React, FastAPI, Postgres. Used at events. AI transition ongoing.', status: 'shipped',  domain: 'Software', year: '2024 —',  recency: 90  },
    { num: '04', href: '/work/sprocket-frc',  title: 'Sprocket — FRC CAD',      blurb: 'Two seasons with Team 3473. Climb subsystem then full-bot ownership.',                                     status: 'archive',  domain: 'Robotics', year: '2024–26', recency: 80  },
    { num: '05', href: '/work/combat',        title: 'Team Infernope',          blurb: "Twelve combat robots over three years. 1st place, end-of-year tournament.",                               status: 'archive',  domain: 'Combat',   year: '2022–25', recency: 70  },
    { num: '07', href: '/work/scavenger',     title: 'JPL Invention Challenge', blurb: "Team captain. Reached regional finals. The machine was overcomplicated — the leadership lesson wasn't.",   status: 'archive',  domain: 'Robotics', year: '2024–25', recency: 60  },
    { num: '06', href: '/work/vex',           title: 'VEX',                     blurb: 'Pre-FRC robotics. Competition code, mechanisms.',                                                          status: 'archive',  domain: 'Robotics', year: '2021–23', recency: 50  },
];

const STATUS_TONE: Record<Status, Tone> = {
    building: 'warn',
    shipped:  'good',
    archive:  'neutral',
};

/* Order used by sort=status. Active first, archived last. */
const STATUS_ORDER: Record<Status, number> = {
    building: 0,
    shipped:  1,
    archive:  2,
};

const DOMAINS: Array<'all' | Domain> = ['all', 'Robotics', 'Drones', 'Software', 'Combat'];
const SORTS: Array<{ key: SortKey; label: string }> = [
    { key: 'recent', label: 'Recent' },
    { key: 'name',   label: 'A–Z'    },
    { key: 'status', label: 'Status' },
];

/* ─────────────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────────────── */

interface PageProps {
    searchParams: Promise<{ domain?: string; sort?: string }>;
}

export default async function WorkIndexPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const domain = parseDomain(params.domain);
    const sort   = parseSort(params.sort);

    const visible = applySort(applyFilter(PROJECTS, domain), sort);

    return (
        <Page>
            <PageHeader
                tag={['WORK', '7 PROJECTS', '#003']}
                title="Seven projects."
                subtitle="Filter by domain."
                dek="Status reflects current activity, not completion year. Click any row to read the case study."
            />

            <Breakdown />

            <FilterBar activeDomain={domain} activeSort={sort} />

            {visible.length > 0 ? (
                <ul className="list-none m-0 p-0">
                    {visible.map((p) => (
                        <ProjectRow key={p.href} project={p} />
                    ))}
                </ul>
            ) : (
                <EmptyState domain={domain} />
            )}

            {domain !== 'all' && visible.length > 0 && (
                <ResultMeta count={visible.length} domain={domain} />
            )}
        </Page>
    );
}

/* ─────────────────────────────────────────────────────────────────
   PARAMS + DERIVATIONS — kept narrow so bad input falls back safely.
   ───────────────────────────────────────────────────────────────── */

function parseDomain(raw: string | undefined): 'all' | Domain {
    if (!raw) return 'all';
    const lower = raw.toLowerCase();
    const match = DOMAINS.find((d) => d.toLowerCase() === lower);
    return match ?? 'all';
}

function parseSort(raw: string | undefined): SortKey {
    if (raw === 'name' || raw === 'status') return raw;
    return 'recent';
}

function applyFilter(list: Project[], domain: 'all' | Domain): Project[] {
    if (domain === 'all') return list;
    return list.filter((p) => p.domain === domain);
}

function applySort(list: Project[], key: SortKey): Project[] {
    const copy = [...list];
    switch (key) {
        case 'name':
            return copy.sort((a, b) => a.title.localeCompare(b.title));
        case 'status':
            return copy.sort((a, b) => {
                const s = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
                return s !== 0 ? s : b.recency - a.recency;
            });
        case 'recent':
        default:
            return copy.sort((a, b) => b.recency - a.recency);
    }
}

/** Build a URL preserving the other param. Drops `domain` when 'all' and
 *  `sort` when 'recent' so default URLs stay clean. */
function buildUrl(next: { domain?: 'all' | Domain; sort?: SortKey }): string {
    const sp = new URLSearchParams();
    if (next.domain && next.domain !== 'all') sp.set('domain', next.domain.toLowerCase());
    if (next.sort && next.sort !== 'recent') sp.set('sort', next.sort);
    const q = sp.toString();
    return q ? `/work?${q}` : '/work';
}

/* ═════════════════════════════════════════════════════════════════
   BREAKDOWN STRIP — counts derived from the data so they don't drift.
   ═════════════════════════════════════════════════════════════════ */

function Breakdown() {
    const counts: Array<{ status: Status; n: number; tone: Tone }> = [
        { status: 'building', n: PROJECTS.filter((p) => p.status === 'building').length, tone: 'warn'    },
        { status: 'shipped',  n: PROJECTS.filter((p) => p.status === 'shipped').length,  tone: 'good'    },
        { status: 'archive',  n: PROJECTS.filter((p) => p.status === 'archive').length,  tone: 'neutral' },
    ];
    const active = counts[0].n + counts[1].n;

    return (
        <section className="mt-2 mb-6">
            <header className="flex items-baseline justify-between gap-4 pb-2 border-b border-rule flex-wrap">
                <span className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">
                    Breakdown
                </span>
                <span className="font-mono text-[10px] tracking-mono text-fg-soft">
                    {PROJECTS.length} projects · {active} active · {counts[2].n} archived
                </span>
            </header>
            <dl className="grid grid-cols-3 gap-4 mt-4">
                {counts.map((c) => (
                    <div key={c.status} className="border-r border-rule last:border-r-0 pr-4 last:pr-0">
                        <dt className="flex items-center gap-1.5 font-mono text-[10px] tracking-kicker uppercase text-fg-soft">
                            <span
                                aria-hidden
                                className={`w-[5px] h-[5px] rounded-full shrink-0 ${
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
   FILTER BAR — Links, not buttons. Server-rendered. Active state
   derived from the current params.

   Mobile:  stacked — domain chips top row, sort row below.
   Desktop: side-by-side on one line (original layout).
   ═════════════════════════════════════════════════════════════════ */

function FilterBar({
                       activeDomain,
                       activeSort,
                   }: {
    activeDomain: 'all' | Domain;
    activeSort: SortKey;
}) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-6 mb-2">
            {/* Domain chips */}
            <div className="flex items-center gap-2 flex-wrap">
                {DOMAINS.map((d) => {
                    const isActive = d === activeDomain;
                    const label = d === 'all' ? 'All' : d;
                    return (
                        <Link
                            key={d}
                            href={buildUrl({ domain: d, sort: activeSort })}
                            scroll={false}
                            aria-current={isActive ? 'page' : undefined}
                            className={`
                                font-mono text-[11px] tracking-kicker uppercase
                                px-3 py-1.5 rounded border no-underline
                                transition-colors duration-150
                                ${isActive
                                ? 'border-accent text-accent bg-accent-soft'
                                : 'border-rule text-fg-muted hover:border-rule-strong hover:text-fg'}
                            `}
                        >
                            {label}
                        </Link>
                    );
                })}
            </div>

            {/* Sort controls */}
            <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-fg-soft tracking-kicker uppercase">Sort</span>
                {SORTS.map((s) => {
                    const isActive = s.key === activeSort;
                    return (
                        <Link
                            key={s.key}
                            href={buildUrl({ domain: activeDomain, sort: s.key })}
                            scroll={false}
                            aria-current={isActive ? 'page' : undefined}
                            className={`
                                px-3 py-1.5 rounded border no-underline tracking-kicker uppercase
                                transition-colors duration-150
                                ${isActive
                                ? 'border-accent text-accent bg-accent-soft'
                                : 'border-rule text-fg-muted hover:border-rule-strong hover:text-fg'}
                            `}
                        >
                            {s.label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

/* ═════════════════════════════════════════════════════════════════
   ROWS

   Desktop: 5-column grid  [40px · 1fr · 120px · 100px · 24px]
   Mobile:  flex column — title + blurb, then a metadata row
            (status · year · arrow) below. Index number hidden.
   ═════════════════════════════════════════════════════════════════ */

function ProjectRow({ project: p }: { project: Project }) {
    return (
        <li className="border-t border-rule last:border-b last:border-rule">
            <Link
                href={p.href}
                className="
                    py-4 text-fg no-underline group
                    flex flex-col gap-1.5
                    sm:grid sm:grid-cols-[40px_minmax(0,1fr)_120px_100px_24px] sm:gap-6 sm:items-baseline
                "
            >
                {/* Index number — desktop only */}
                <span className="hidden sm:block font-mono text-[12px] text-fg-soft tracking-mono">
                    {p.num}
                </span>

                {/* Title + blurb */}
                <div className="min-w-0">
                    <h3 className="m-0 text-[16px] font-semibold tracking-[-0.005em] group-hover:text-accent transition-colors">
                        {p.title}
                    </h3>
                    <p className="mt-1 mb-0 text-[13.5px] text-fg-muted leading-snug max-w-[640px]">
                        {p.blurb}
                    </p>
                </div>

                {/* Mobile: status + year + arrow on one inline row.
                    Desktop: sm:contents spreads these back into the grid as separate columns. */}
                <div className="flex items-center gap-3 sm:contents">
                    <StatusText tone={STATUS_TONE[p.status]}>{p.status}</StatusText>
                    <span className="font-mono text-[12px] text-fg-soft tracking-mono whitespace-nowrap">
                        {p.year}
                    </span>
                    <span
                        aria-hidden
                        className="font-mono text-fg-soft text-sm group-hover:text-accent transition-colors ml-auto sm:ml-0 sm:text-right"
                    >
                        ↗
                    </span>
                </div>
            </Link>
        </li>
    );
}

/* ═════════════════════════════════════════════════════════════════
   EMPTY STATE + RESULT META
   ═════════════════════════════════════════════════════════════════ */

function EmptyState({ domain }: { domain: 'all' | Domain }) {
    return (
        <div className="border-t border-b border-rule py-12 text-center">
            <p className="m-0 text-fg-muted text-[14.5px]">
                No projects in <span className="text-fg font-medium">{domain}</span> yet.
            </p>
            <Link
                href="/work"
                className="inline-block mt-3 font-mono text-[11px] tracking-kicker uppercase text-accent no-underline hover:underline underline-offset-4"
            >
                ← Show all
            </Link>
        </div>
    );
}

function ResultMeta({ count, domain }: { count: number; domain: Domain }) {
    return (
        <p className="font-mono text-[11px] text-fg-soft tracking-mono mt-4 mb-0">
            {count} of {PROJECTS.length} · filtered by{' '}
            <span className="text-fg-muted">{domain.toLowerCase()}</span>
            {' · '}
            <Link href="/work" className="text-accent no-underline hover:underline underline-offset-4">
                clear
            </Link>
        </p>
    );
}