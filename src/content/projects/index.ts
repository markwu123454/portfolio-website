/**
 * Every project page, in display order. Order drives previous/next links.
 * To add a project: create ./<slug>/index.tsx with defineProject(), then
 * add it here. /projects/[slug] builds a static page for each entry.
 */

import aetherius from './aetherius';
import aetheriusGcs from './aetherius-gcs';
import sprocketstats from './sprocketstats';
import sprocketstatsCom from './sprocketstats-com';
import mercedtime from './mercedtime';
import crowdFlow from './crowd-flow';
import caelifer from './caelifer';
import harbinger from './harbinger';
import sprocketFrc from './sprocket-frc';
import infernope from './infernope';
import type { Project } from './types';

export const PROJECT_PAGES: Project[] = [
    aetherius,
    aetheriusGcs,
    sprocketstats,
    sprocketstatsCom,
    mercedtime,
    crowdFlow,
    caelifer,
    harbinger,
    sprocketFrc,
    infernope,
];

export function getProject(slug: string): Project | undefined {
    return PROJECT_PAGES.find((p) => p.slug === slug);
}

/** Previous and next project, wrapping around at the ends. */
export function getNeighbours(slug: string) {
    const i = PROJECT_PAGES.findIndex((p) => p.slug === slug);
    const n = PROJECT_PAGES.length;
    return { prev: PROJECT_PAGES[(i - 1 + n) % n], next: PROJECT_PAGES[(i + 1) % n] };
}
