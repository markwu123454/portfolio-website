/**
 * Every showcase page. /showcase/[topic] builds a static page for each entry.
 * To add a topic: create ./<slug>.tsx with defineShowcase(), then add it here.
 * Not linked from anywhere on the site, and not in the sitemap.
 */

import design3d from './3d-design';
import aiMl from './ai-ml';
import programming from './programming';
import robotics from './robotics';
import uav from './uav';
import type { Showcase } from './types';

export const SHOWCASES: Showcase[] = [design3d, aiMl, programming, robotics, uav];

export function getShowcase(slug: string): Showcase | undefined {
    return SHOWCASES.find((s) => s.slug === slug);
}
