/**
 * The one layout for every project page. Top to bottom:
 *   hero → awards → highlights → galleries → milestones → where it stands → prev/next
 * Order and headings are fixed; a section with no data is left out.
 */

import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { ArrowLeft, ArrowRight, ChevronRight, Link as LinkIcon } from 'lucide-react';
import { Page, StatusPill, Tag, type Tone } from '@/app/components/site/primitives';
import {
    sectionOf,
    type Award,
    type Gallery as GalleryData,
    type Highlight,
    type HighlightOptions,
    type Milestone,
    type MilestoneOptions,
    type Project,
    type ProjectStatus,
    type SectionOptions,
} from '@/content/projects/types';
import { Carousel } from './carousel';

const STATUS_TONE: Record<ProjectStatus, Tone> = {
    building: 'warn',
    live: 'good',
    paused: 'neutral',
    archived: 'neutral',
};

const DOT: Record<Tone, string> = {
    good: 'bg-good',
    warn: 'bg-warn',
    bad: 'bg-bad',
    neutral: 'bg-fg-soft',
};

const LABEL: Record<Tone, string> = {
    good: 'text-good',
    warn: 'text-warn',
    bad: 'text-bad',
    neutral: 'text-fg-muted',
};

/** Milestones shown before the rest fold into "Show N earlier", unless a project sets `shown`. */
const MILESTONES_SHOWN = 5;

const CONTACT_EMAIL = 'me@markwu.org';

type Neighbour = Pick<Project, 'slug' | 'title'>;

export function projectHref(slug: string) {
    return `/projects/${slug}`;
}

export function formatYears({ start, end }: Project['years']) {
    if (end === undefined) return `${start} – present`;
    if (end === start) return `${start}`;
    return `${start}–${String(end).slice(2)}`;
}

function formatDate(date?: string) {
    if (!date) return '—';
    return /^\d{4}-\d{2}(-\d{2})?$/.test(date) ? date.replace(/-/g, '.') : date;
}

export function ProjectLayout({
                                  project: p,
                                  prev,
                                  next,
                              }: {
    project: Project;
    prev: Neighbour;
    next: Neighbour;
}) {
    const awards = sectionOf(p.awards);
    const highlights = sectionOf(p.highlights);
    const milestones = sectionOf(p.milestones);
    return (
        <Page>
            <Hero p={p} />
            {awards && awards.items.length > 0 && <Awards s={awards} />}
            {highlights && highlights.items.length > 0 && <Highlights s={highlights} />}
            {p.galleries?.map((g) => <Gallery key={g.title} g={g} />)}
            {milestones && milestones.items.length > 0 && <Milestones s={milestones} />}
            <Outlook p={p} />
            <PrevNext prev={prev} next={next} />
        </Page>
    );
}

/* ─────────────────────────────────────────────────────────────────
   Hero. Desktop: title + media on the left, everything you read on
   the right, facts full width below. Phones: one column, reordered so
   the media comes right after the summary.
   ───────────────────────────────────────────────────────────────── */

function Hero({ p }: { p: Project }) {
    const status = p.statusNote ? `${p.status} · ${p.statusNote}` : p.status;
    return (
        <header className="pt-10 md:pt-14">
            <nav
                aria-label="Breadcrumb"
                className="font-mono text-[11px] tracking-mono text-fg-muted mb-6 md:mb-8 flex items-center gap-2"
            >
                <Link href="/projects" className="text-fg-muted hover:text-accent">
                    <span aria-hidden>← </span>Projects
                </Link>
                <span aria-hidden className="text-fg-soft">/</span>
                <Link href={`/projects?domain=${p.domain.toLowerCase()}`} className="text-fg hover:text-accent">
                    {p.domain}
                </Link>
            </nav>

            <div className="flex flex-col gap-3.5 md:grid md:grid-cols-[minmax(0,1fr)_320px] md:gap-x-12 md:gap-y-0 md:items-start">
                <div className="contents md:flex md:flex-col md:gap-7 md:min-w-0">
                    <h1 className="order-1 md:order-none m-0 font-semibold leading-[1.04] tracking-[-0.025em] text-[clamp(36px,5vw,60px)] text-balance">
                        {p.title}
                        <span className="block mt-1.5 text-fg-muted italic font-medium tracking-[-0.02em] leading-[1.15] text-[clamp(22px,2.8vw,34px)]">
                            {p.subtitle}
                        </span>
                    </h1>
                    <div className="order-4 md:order-none relative aspect-[4/3] md:aspect-video overflow-hidden rounded border border-rule bg-bg-elev mt-1.5 md:mt-0">
                        {p.hero}
                    </div>
                </div>

                <div className="contents md:flex md:flex-col md:gap-3.5 md:min-w-0">
                    <p className="order-3 md:order-none m-0 text-[15.5px] leading-[1.6] text-fg-muted">{p.summary}</p>
                    <div className="order-2 md:order-none flex flex-wrap gap-1.5">
                        <StatusPill tone={STATUS_TONE[p.status]}>{status}</StatusPill>
                    </div>
                    <dl className="order-6 md:order-none m-0 grid grid-cols-[84px_minmax(0,1fr)] gap-x-3 gap-y-1.5 pt-2.5 border-t border-rule text-[13.5px]">
                        <MetaRow label="Years">{formatYears(p.years)}</MetaRow>
                        <MetaRow label="Role">{p.role}</MetaRow>
                        {p.affiliation && <MetaRow label="Affiliation">{p.affiliation}</MetaRow>}
                    </dl>
                    {p.stack && p.stack.length > 0 && (
                        <div className="order-7 md:order-none flex flex-wrap gap-1.5" aria-label="Stack">
                            {p.stack.map((t) => (
                                <Tag key={t} variant="outline">{t}</Tag>
                            ))}
                        </div>
                    )}
                    {p.links && p.links.length > 0 && <Links links={p.links} />}
                </div>

                {p.stats && p.stats.length > 0 && (
                    <dl
                        className="order-5 md:order-none md:col-span-2 md:mt-8 m-0 grid grid-cols-2 gap-x-7 gap-y-4 py-4 border-t border-b border-rule md:[grid-template-columns:repeat(var(--n),minmax(0,1fr))]"
                        style={{ '--n': p.stats.length } as CSSProperties}
                    >
                        {p.stats.map((s) => (
                            <div key={s.label} className="min-w-0">
                                <dt className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft mb-1">{s.label}</dt>
                                <dd className="m-0 text-[14px] leading-snug tabular-nums">{s.value}</dd>
                            </div>
                        ))}
                    </dl>
                )}
            </div>
        </header>
    );
}

function MetaRow({ label, children }: { label: string; children: ReactNode }) {
    return (
        <>
            <dt className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft pt-0.5">{label}</dt>
            <dd className="m-0">{children}</dd>
        </>
    );
}

function Links({ links }: { links: NonNullable<Project['links']> }) {
    return (
        <ul className="order-8 md:order-none list-none m-0 p-0">
            {links.map((l) => {
                const internal = l.kind === 'related';
                const Icon = internal ? ArrowRight : LinkIcon;
                const className =
                    'group grid grid-cols-[58px_minmax(0,1fr)_16px] gap-2.5 items-center py-2 border-t border-rule text-fg no-underline text-[13.5px]';
                const inner = (
                    <>
                        <span className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">{l.kind}</span>
                        <span className="truncate transition-colors group-hover:text-accent">{l.label}</span>
                        <Icon aria-hidden size={15} className="justify-self-end text-fg-soft transition-colors group-hover:text-accent" />
                    </>
                );
                return (
                    <li key={l.href} className="last:border-b last:border-rule">
                        {internal ? (
                            <Link href={l.href} className={className}>{inner}</Link>
                        ) : (
                            <a href={l.href} target="_blank" rel="noopener noreferrer" className={className}>{inner}</a>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}

/* ─────────────────────────────────────────────────────────────────
   Sections
   ───────────────────────────────────────────────────────────────── */

const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

type Resolved<T, Extra = object> = SectionOptions & Partial<Extra> & { items: T[] };

/** Shared section template. `defaults` fill whatever the project's options leave out. */
function Section({
                     options,
                     defaults,
                     children,
                 }: {
    options: SectionOptions;
    defaults: { id: string; title: string; aside?: string };
    children: ReactNode;
}) {
    const title = options.title ?? defaults.title;
    const id = options.id ?? defaults.id;
    const aside = options.aside ?? defaults.aside;
    return (
        <section id={id} className="pt-12 md:pt-16 scroll-mt-24" aria-labelledby={`${id}-h`}>
            <header className="flex items-baseline justify-between gap-4 pb-3 mb-6 border-b border-rule-strong">
                <h2 id={`${id}-h`} className="m-0 text-[24px] font-semibold tracking-[-0.015em]">{title}</h2>
                {aside && (
                    <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-fg-soft">{aside}</span>
                )}
            </header>
            {options.description && (
                <p className="m-0 -mt-2 mb-6 text-[15px] leading-[1.6] text-fg-muted max-w-160">{options.description}</p>
            )}
            {children}
        </section>
    );
}

function Awards({ s }: { s: Resolved<Award> }) {
    return (
        <Section options={s} defaults={{ id: 'awards', title: 'Awards' }}>
            <ul className="list-none m-0 p-0">
                {s.items.map((a, i) => (
                    <li
                        key={i}
                        className="grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[190px_minmax(0,1fr)_auto_auto] gap-x-4 gap-y-0.5 items-center py-3 border-b border-rule first:pt-0"
                    >
                        <span className="col-start-1 font-mono text-[12px] font-semibold tracking-[0.02em] text-accent">{a.place}</span>
                        <span className="col-start-1 sm:col-start-auto text-[15px]">
                            {a.what}
                            {a.detail && <span className="block text-[13px] text-fg-muted">{a.detail}</span>}
                        </span>
                        <span className="col-start-1 sm:col-start-auto font-mono text-[11px] text-fg-soft">{a.when}</span>
                        {a.image ? (
                            <div className="col-start-2 row-start-1 row-span-3 sm:col-start-auto sm:row-start-auto sm:row-span-1 w-12 h-16 rounded-sm border border-rule bg-bg-elev overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element -- tiny static thumbnail, next/image adds nothing here */}
                                <img src={a.image.src} alt={a.imageAlt ?? ''} loading="lazy" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <span className="hidden sm:block" />
                        )}
                    </li>
                ))}
            </ul>
        </Section>
    );
}

function Highlights({ s }: { s: Resolved<Highlight, HighlightOptions> }) {
    const twoCol = (s.columns ?? 2) === 2;
    return (
        <Section options={s} defaults={{ id: 'highlights', title: 'Highlights' }}>
            <div className={`grid grid-cols-1 gap-x-6 gap-y-7 ${twoCol ? 'md:grid-cols-2' : ''}`}>
                {s.items.map((h, i) => {
                    const wide = !twoCol || h.wide;
                    return (
                        <figure key={i} className={`m-0 grid gap-2.5 content-start ${twoCol && h.wide ? 'md:col-span-2' : ''}`}>
                            <div
                                className={`relative overflow-hidden rounded border border-rule bg-bg-elev ${
                                    wide ? 'aspect-[4/3] md:aspect-[2/1]' : 'aspect-[4/3] md:aspect-video'
                                }`}
                            >
                                {h.media}
                            </div>
                            <figcaption className="text-[14px] leading-[1.55] text-fg-muted max-w-160">
                                {h.tag && (
                                    <span className="inline-block mr-2 px-2 py-px border border-current rounded-sm font-mono text-[10px] tracking-[0.08em] uppercase text-warn align-[1px]">
                                        {h.tag}
                                    </span>
                                )}
                                {h.caption}
                            </figcaption>
                        </figure>
                    );
                })}
            </div>
        </Section>
    );
}

function Gallery({ g }: { g: GalleryData }) {
    return (
        <Section
            options={g}
            defaults={{ id: `gallery-${slugify(g.title)}`, title: g.title, aside: `${g.slides.length} images` }}
        >
            <Carousel slides={g.slides} interval={g.interval} label={g.title} />
        </Section>
    );
}

function Milestones({ s }: { s: Resolved<Milestone, MilestoneOptions> }) {
    const count = s.shown ?? MILESTONES_SHOWN;
    const shown = s.items.slice(0, count);
    const rest = s.items.slice(count);
    return (
        <Section options={s} defaults={{ id: 'milestones', title: 'Milestones', aside: 'Newest first' }}>
            <ol className="list-none m-0 p-0">
                {shown.map((m, i) => <MilestoneRow key={i} m={m} />)}
            </ol>
            {rest.length > 0 && (
                <details className="group/more">
                    <summary className="flex items-center gap-2 py-3 cursor-pointer list-none font-mono text-[11.5px] tracking-mono text-accent [&::-webkit-details-marker]:hidden">
                        <ChevronRight aria-hidden size={15} className="transition-transform group-open/more:rotate-90 motion-reduce:transition-none" />
                        Show {rest.length} earlier
                    </summary>
                    <ol className="list-none m-0 p-0">
                        {rest.map((m, i) => <MilestoneRow key={i} m={m} />)}
                    </ol>
                </details>
            )}
        </Section>
    );
}

function MilestoneRow({ m }: { m: Milestone }) {
    const tone = m.tone ?? 'neutral';
    return (
        <li className="grid grid-cols-[14px_minmax(0,1fr)_auto] sm:grid-cols-[104px_14px_minmax(0,1fr)_auto] gap-x-3.5 py-3.5 border-b border-rule items-start">
            <span className="col-start-2 row-start-1 sm:col-start-auto sm:row-start-auto font-mono text-[11.5px] text-fg-soft tabular-nums pb-0.5 sm:pt-0.5 sm:pb-0">
                {formatDate(m.date)}
            </span>
            <span
                aria-hidden
                className={`col-start-1 row-start-1 row-span-2 sm:col-start-auto sm:row-start-auto sm:row-span-1 justify-self-center mt-[7px] w-1.5 h-1.5 rounded-full ${DOT[tone]}`}
            />
            <div className="col-start-2 sm:col-start-auto min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                    <strong className="text-[15px] font-semibold">{m.title}</strong>
                    {m.label && (
                        <span className={`font-mono text-[10px] tracking-[0.1em] uppercase ${LABEL[tone]}`}>{m.label}</span>
                    )}
                </div>
                <p className="mt-1 mb-0 text-[14px] leading-[1.55] text-fg-muted max-w-160">{m.body}</p>
            </div>
            {m.thumb ? (
                <div className="col-start-3 row-start-1 row-span-2 sm:col-start-auto sm:row-start-auto sm:row-span-1 relative w-16 h-12 rounded-sm border border-rule bg-bg-elev overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element -- tiny static thumbnail, next/image adds nothing here */}
                    <img src={m.thumb.src} alt="" loading="lazy" className="w-full h-full object-contain" />
                </div>
            ) : (
                <span />
            )}
        </li>
    );
}

function Outlook({ p }: { p: Project }) {
    const o = p.outlook;
    // No outlook written yet: skip the section and keep only the contact prompt.
    if (!o) {
        return (
            <div className="pt-12 md:pt-16">
                <AskPrompt />
            </div>
        );
    }
    const [title, defaultListTitle, list] =
        p.status === 'archived'
            ? ['How it ended', 'What I took from it', o.lessons]
            : p.status === 'paused'
                ? ['Why it’s paused', 'What would restart it', o.restart]
                : ['Where it’s at', 'Next', o.next];
    const listTitle = o.listTitle ?? defaultListTitle;
    return (
        <Section options={o} defaults={{ id: 'outlook', title }}>
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px] gap-x-12 gap-y-6">
                <p className="m-0 text-[15.5px] leading-[1.65] max-w-160">{o.now}</p>
                <div className="grid gap-5 content-start">
                    {list && list.length > 0 && <Bullets title={listTitle} items={list} />}
                    {o.helpWanted && o.helpWanted.length > 0 && <Bullets title="Help wanted" items={o.helpWanted} />}
                </div>
                <AskPrompt className="md:col-span-2" />
            </div>
        </Section>
    );
}

function AskPrompt({ className = '' }: { className?: string }) {
    return (
        <p className={`m-0 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 px-4 py-3.5 rounded-md bg-accent-soft text-[14.5px] ${className}`}>
            Want the details or the story behind it? Ask me:
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-mono text-[13px] text-accent hover:underline underline-offset-4">
                {CONTACT_EMAIL}
            </a>
        </p>
    );
}

function Bullets({ title, items }: { title: string; items: string[] }) {
    return (
        <div>
            <h3 className="m-0 mb-2 font-mono text-[10px] font-medium tracking-kicker uppercase text-fg-soft">{title}</h3>
            <ul className="list-none m-0 p-0 grid gap-1.5">
                {items.map((it) => (
                    <li key={it} className="grid grid-cols-[14px_1fr] gap-2 text-[14px] leading-normal text-fg-muted">
                        <span aria-hidden className="font-mono text-fg-soft">→</span>
                        {it}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function PrevNext({ prev, next }: { prev: Neighbour; next: Neighbour }) {
    const cls = 'group grid gap-1 py-4 border-t border-rule-strong text-fg no-underline';
    const kicker = 'font-mono text-[10px] tracking-kicker uppercase text-fg-soft';
    const name = 'text-[15px] md:text-[17px] font-semibold tracking-[-0.01em] transition-colors group-hover:text-accent';
    return (
        <nav aria-label="More projects" className="grid grid-cols-2 gap-4 mt-12 md:mt-16">
            <Link href={projectHref(prev.slug)} className={cls}>
                <span className={kicker}>Previous</span>
                <span className={`${name} inline-flex items-center gap-1.5`}>
                    <ArrowLeft aria-hidden size={16} className="shrink-0" />
                    {prev.title}
                </span>
            </Link>
            <Link href={projectHref(next.slug)} className={`${cls} text-right`}>
                <span className={kicker}>Next</span>
                <span className={`${name} inline-flex items-center justify-end gap-1.5`}>
                    {next.title}
                    <ArrowRight aria-hidden size={16} className="shrink-0" />
                </span>
            </Link>
        </nav>
    );
}
