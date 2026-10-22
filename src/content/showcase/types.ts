/**
 * Shape of a showcase page. A showcase is one topic (UAV, robotics, …)
 * cut across every project, as a media companion to a resume: a reader
 * spends about 15 seconds on it, so it is images and video with one-line
 * captions. Every page under /showcase/[topic] is one of these objects
 * rendered by <ShowcaseLayout>; nothing about the layout is per-topic.
 */

import type { ReactNode } from 'react';

export interface ShowcaseStat {
    label: string;
    value: string;
}

export interface ShowcaseTile {
    title: string;
    /** One line, overlaid on the media. */
    caption: string;
    /** Fills the tile: <Shot>, <CadRender>, <LoopVideo>, <Brief>, … */
    media: ReactNode;
    /** Usually the full project page. External links open in a new tab. */
    href?: string;
    external?: boolean;
    /** Desktop grid only: wide spans two columns, tall spans two rows. */
    span?: 'wide' | 'tall';
}

export interface Showcase {
    slug: string;
    /** Tagline number, e.g. '#S01'. */
    num: string;
    /** Short topic name used in the tagline and the tab title. */
    topic: string;
    title: string;
    subtitle: string;
    /** Meta description. */
    description: string;
    stats: ShowcaseStat[];
    /** Full-width tile at the top. */
    feature: ShowcaseTile;
    /** The media wall below it, three columns on desktop. */
    tiles: ShowcaseTile[];
}

const MAX_STATS = 4;
const MAX_CAPTION = 80;

/** Identity function that also checks the rules the type system can't. Throws at build time. */
export function defineShowcase(s: Showcase): Showcase {
    const fail = (msg: string) => {
        throw new Error(`[showcase:${s.slug}] ${msg}`);
    };
    if (!/^[a-z0-9-]+$/.test(s.slug)) fail('slug must be lowercase kebab-case');
    if (s.stats.length > MAX_STATS) fail(`at most ${MAX_STATS} stats`);
    [s.feature, ...s.tiles].forEach((t) => {
        if (t.caption.length > MAX_CAPTION) fail(`caption on "${t.title}" is ${t.caption.length} chars; keep it under ${MAX_CAPTION}`);
    });
    return s;
}
