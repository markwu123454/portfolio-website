/**
 * /sitemap.xml. Project pages come from content/projects, so a new
 * project shows up here on its own; add other new pages to STATIC_PATHS.
 */

import type { MetadataRoute } from 'next';
import { PROJECT_PAGES } from '@/content/projects';

const SITE = 'https://markwu.org';

const STATIC_PATHS = [
    '',
    '/projects',
    '/about',
    '/contact',
    '/experiments',
    '/experiments/banner-history',
    '/experiments/digital-footprint',
    '/experiments/pull-planner',
    '/experiments/snake',
    '/experiments/snake-versus',
    '/experiments/state-space',
];

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        ...STATIC_PATHS.map((path) => ({ url: `${SITE}${path}` })),
        ...PROJECT_PAGES.map((p) => ({ url: `${SITE}/projects/${p.slug}` })),
    ];
}
