/**
 * Work — /work
 *
 * Server component. Index of all projects with a stats breakdown row,
 * domain filters, and sort. Filter + sort state lives in the URL
 * (?domain=robotics&sort=name) so the page stays server-rendered and
 * links are shareable.
 *
 * Everything below is inlined directly into WorkIndexPage — nothing
 * here is used more than once, except `buildUrl` and `DOMAINS`, which
 * each have two call sites in the filter bar. PROJECTS lives in
 * data/projects.ts, the single source of truth shared with home and now.
 */

import Link from 'next/link';
import {
    Page,
    PageHeader,
    StatusText,
    type Tone,
} from '@/app/components/site/primitives';
import { PROJECTS, STATUS_TONE, type Domain, type Status } from '@/data/projects';
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Work',
    description:
        'Every project, filterable by domain. Status reflects current activity, not completion year.',
};

type SortKey = 'recent' | 'name' | 'status';

const DOMAINS: Array<'all' | Domain> = ['all', 'Robotics', 'Drones', 'Software'];

/** Build a URL preserving the other param. Drops `domain` when 'all' and
 *  `sort` when 'recent' so default URLs stay clean. */
function buildUrl(next: { domain?: 'all' | Domain; sort?: SortKey }): string {
    const sp = new URLSearchParams();
    if (next.domain && next.domain !== 'all') sp.set('domain', next.domain.toLowerCase());
    if (next.sort && next.sort !== 'recent') sp.set('sort', next.sort);
    const q = sp.toString();
    return q ? `/work?${q}` : '/work';
}

interface PageProps {
    searchParams: Promise<{ domain?: string; sort?: string }>;
}

export default async function WorkIndexPage({searchParams}: PageProps) {
    const params = await searchParams;

    // Domain/sort parsed narrowly so bad input falls back to defaults.
    const domain: 'all' | Domain = params.domain
        ? DOMAINS.find((d) => d.toLowerCase() === params.domain!.toLowerCase()) ?? 'all'
        : 'all';
    const sort: SortKey = params.sort === 'name' || params.sort === 'status' ? params.sort : 'recent';

    const statusRank: Record<Status, number> = {building: 0, shipped: 1, paused: 2, archive: 3};
    const filtered = domain === 'all' ? PROJECTS : PROJECTS.filter((p) => p.domain === domain);
    const visible = [...filtered].sort((a, b) => {
        if (sort === 'name') return a.title.localeCompare(b.title);
        if (sort === 'status') {
            const s = statusRank[a.status] - statusRank[b.status];
            return s !== 0 ? s : b.recency - a.recency;
        }
        return b.recency - a.recency;
    });

    // Active = building or shipped — i.e. currently getting work. Paused and
    // archive are their own buckets. These three always sum to PROJECTS.length.
    const counts: Array<{ label: string; n: number; tone: Tone }> = [
        {label: 'active', n: PROJECTS.filter((p) => p.status === 'building' || p.status === 'shipped').length, tone: 'good'},
        {label: 'paused', n: PROJECTS.filter((p) => p.status === 'paused').length, tone: 'neutral'},
        {label: 'archive', n: PROJECTS.filter((p) => p.status === 'archive').length, tone: 'neutral'},
    ];

    return (
        <Page>
            <PageHeader
                tag={['WORK', `${PROJECTS.length} PROJECTS`, '#003']}
                title={`${PROJECTS.length} projects.`}
                subtitle="Take a look."
                dek="This page may lag behind actual progress, so if you want to know the most up to date info, reach out to me directly."
            />

            {/* ─ Breakdown strip — counts derived from the data so they
                don't drift. ─ */}
            <section className="mt-2 mb-6">
                <header className="flex items-baseline justify-between gap-4 pb-2 border-b border-rule flex-wrap">
                    <span className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">
                        Breakdown
                    </span>
                    <span className="font-mono text-[10px] tracking-mono text-fg-soft">
                        {PROJECTS.length} projects · {counts[0].n} active · {counts[1].n} paused · {counts[2].n} archived
                    </span>
                </header>
                <dl className="grid grid-cols-3 gap-4 mt-4">
                    {counts.map((c) => (
                        <div key={c.label} className="border-r border-rule last:border-r-0 pr-4 last:pr-0">
                            <dt className="flex items-center gap-1.5 font-mono text-[10px] tracking-kicker uppercase text-fg-soft">
                                <span
                                    aria-hidden
                                    className={`w-1.25 h-1.25 rounded-full shrink-0 ${
                                        {
                                            good: 'bg-good',
                                            warn: 'bg-warn',
                                            bad: 'bg-bad',
                                            neutral: 'bg-fg-soft',
                                        }[c.tone]
                                    }`}
                                />
                                {c.label}
                            </dt>
                            <dd className="m-0 mt-1 text-[22px] font-semibold tracking-[-0.01em]">
                                {c.n}
                            </dd>
                        </div>
                    ))}
                </dl>
            </section>

            {/* ─ Filter bar — links, not buttons. Active state derived
                from the current params. Mobile: stacked. Desktop: one line. ─ */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-6 mb-2">
                {/* Domain chips */}
                <div className="flex items-center gap-2 flex-wrap">
                    {DOMAINS.map((d) => {
                        const isActive = d === domain;
                        const label = d === 'all' ? 'All' : d;
                        return (
                            <Link
                                key={d}
                                href={buildUrl({domain: d, sort})}
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
                    {(
                        [
                            {key: 'recent', label: 'Recent'},
                            {key: 'name', label: 'A–Z'},
                            {key: 'status', label: 'Status'},
                        ] as Array<{ key: SortKey; label: string }>
                    ).map((s) => {
                        const isActive = s.key === sort;
                        return (
                            <Link
                                key={s.key}
                                href={buildUrl({domain, sort: s.key})}
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

            {/* ─ Rows — desktop: 5-col grid [40px·1fr·120px·100px·24px].
                Mobile: flex column, status/year/arrow collapse onto one row. ─ */}
            {visible.length > 0 ? (
                <ul className="list-none m-0 p-0">
                    {visible.map((p) => {
                        const Wrapper = p.external ? 'a' : Link;
                        const linkProps = p.external
                            ? {href: p.href, target: '_blank', rel: 'noopener noreferrer'}
                            : {href: p.href};
                        return (
                            <li key={p.num} className="border-t border-rule last:border-b last:border-rule">
                                <Wrapper
                                    {...linkProps}
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
                                        <h3 className="m-0 text-[16px] font-semibold tracking-tight-1 group-hover:text-accent transition-colors">
                                            {p.title}
                                        </h3>
                                        <p className="mt-1 mb-0 text-[13.5px] text-fg-muted leading-snug max-w-160">
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
                                </Wrapper>
                            </li>
                        );
                    })}
                </ul>
            ) : (
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
            )}

            {domain !== 'all' && visible.length > 0 && (
                <p className="font-mono text-[11px] text-fg-soft tracking-mono mt-4 mb-0">
                    {visible.length} of {PROJECTS.length} · filtered by{' '}
                    <span className="text-fg-muted">{domain.toLowerCase()}</span>
                    {' · '}
                    <Link href="/work" className="text-accent no-underline hover:underline underline-offset-4">
                        clear
                    </Link>
                </p>
            )}
        </Page>
    );
}
