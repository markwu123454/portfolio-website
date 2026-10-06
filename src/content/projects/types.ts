/**
 * Shape of a project page. Every page under /projects/[slug] is one of
 * these objects rendered by <ProjectLayout>; nothing about the layout is
 * per-project. Sections with no data are left out.
 */

import type { StaticImageData } from 'next/image';
import type { ReactNode } from 'react';
import type { Tone } from '@/app/components/site/primitives';

export type Domain = 'Robotics' | 'Drones' | 'Software';
export type ProjectStatus = 'building' | 'live' | 'paused' | 'archived';

export interface ProjectLink {
    /** `related` links to another project page and gets an arrow instead of the link icon. */
    kind: 'repo' | 'site' | 'cad' | 'video' | 'blog' | 'results' | 'related';
    label: string;
    href: string;
}

export interface Stat {
    label: string;
    value: string;
}

/**
 * Every section below the hero is a template: pass just its items to get
 * the defaults, or `{ items, …options }` to change the heading, add a
 * description, relabel the side note, or set the anchor id.
 */
export interface SectionOptions {
    /** Heading. Each section has its own default. */
    title?: string;
    /** Short text under the heading. */
    description?: ReactNode;
    /** Small uppercase note at the right of the heading. '' hides a default one. */
    aside?: string;
    /** Anchor id for #links. Defaults to one based on the section. */
    id?: string;
}

export type SectionData<T, Extra = object> = T[] | (SectionOptions & Extra & { items: T[] });

/** Normalises either form of a section to `{ items, …options }`. */
export function sectionOf<T, Extra = object>(
    data: SectionData<T, Extra> | undefined,
): (SectionOptions & Partial<Extra> & { items: T[] }) | undefined {
    if (!data) return undefined;
    return Array.isArray(data) ? ({ items: data } as SectionOptions & Partial<Extra> & { items: T[] }) : data;
}

export interface Award {
    place: string;
    what: string;
    detail?: string;
    when?: string;
    /** Small photo shown at the end of the row, e.g. the plaque or trophy. */
    image?: StaticImageData;
    /** Required with `image`. */
    imageAlt?: string;
}

export interface Highlight {
    /** Any JSX that fills a fixed-ratio frame: <Shot>, <CadRender>, <LoopVideo>, <Brief>, … */
    media: ReactNode;
    caption: ReactNode;
    /** Span both columns. A lone tile on the last row should usually be wide. */
    wide?: boolean;
    /** Small label before the caption, e.g. 'v3 · in development'. */
    tag?: string;
}

export interface HighlightOptions {
    /** 2 (default) puts tiles side by side on desktop; 1 stacks them full width. */
    columns?: 1 | 2;
}

export interface Gallery extends SectionOptions {
    /** Heading, e.g. 'The fleet'. Required so each gallery gets its own section. */
    title: string;
    /** Each slide fills the same frame as the hero: <Shot>, <CadRender>, <LoopVideo>, any JSX. */
    slides: Array<{ media: ReactNode; caption?: ReactNode }>;
    /** Milliseconds between slides. 0 turns auto-advance off. Default 5000. */
    interval?: number;
}

export interface Milestone {
    /** '2026-08-19', '2026-08', '2026', or a loose label like 'Summer 2025' / 'Y3 · S2'. */
    date?: string;
    kind: 'test' | 'release' | 'build' | 'event' | 'milestone';
    title: string;
    /** Short outcome shown next to the title: 'Flown', '1st place', 'v3'. */
    label?: string;
    tone?: Tone;
    body: ReactNode;
    thumb?: StaticImageData;
}

export interface MilestoneOptions {
    /** Entries shown before the rest fold into "Show N earlier". Default 5. */
    shown?: number;
}

/**
 * Closing section. The heading and which list is shown follow `status`:
 * building/live → "Where it's at" + next · paused → "Why it's paused" + restart
 * · archived → "How it ended" + lessons.
 */
export interface Outlook extends SectionOptions {
    now: ReactNode;
    /** Overrides the heading of the list next to `now` ("Next", "What would restart it", …). */
    listTitle?: string;
    next?: string[];
    helpWanted?: string[];
    restart?: string[];
    lessons?: string[];
}

export interface Project {
    slug: string;
    title: string;
    subtitle: string;
    /** One or two sentences. Also the card text and the default meta description. */
    summary: string;
    /** Meta description override when the summary reads badly out of context. */
    description?: string;
    domain: Domain;
    status: ProjectStatus;
    /** Appended to the status pill: 'building · flown'. */
    statusNote?: string;
    years: { start: number; end?: number };
    role: string;
    affiliation?: string;

    /** Fills the hero frame (16:9, 4:3 on phones). */
    hero: ReactNode;
    /** Plain image for cards and link previews, since `hero` can be anything. */
    thumb: StaticImageData;

    stack?: string[];
    links?: ProjectLink[];
    stats?: Stat[];

    awards?: SectionData<Award>;
    highlights?: SectionData<Highlight, HighlightOptions>;
    /** Each gallery is its own section, placed after the highlights. */
    galleries?: Gallery[];
    milestones?: SectionData<Milestone, MilestoneOptions>;
    /** Optional. When left out, the page ends with just the contact prompt. */
    outlook?: Outlook;
}

const MAX_STATS = 4;
const MAX_SUMMARY = 170;

/** Identity function that also checks the rules the type system can't. Throws at build time. */
export function defineProject(p: Project): Project {
    const fail = (msg: string) => {
        throw new Error(`[project:${p.slug}] ${msg}`);
    };
    if (!/^[a-z0-9-]+$/.test(p.slug)) fail('slug must be lowercase kebab-case');
    if ((p.stats?.length ?? 0) > MAX_STATS) fail(`at most ${MAX_STATS} stats`);
    p.galleries?.forEach((g) => {
        if (g.slides.length === 0) fail(`gallery "${g.title}" has no slides`);
    });
    if (p.summary.length > MAX_SUMMARY) fail(`summary is ${p.summary.length} chars; keep it under ${MAX_SUMMARY}`);
    if (p.years.end !== undefined && p.years.end < p.years.start) fail('years.end is before years.start');
    return p;
}
