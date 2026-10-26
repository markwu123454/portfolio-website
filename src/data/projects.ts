/**
 * Single source of truth for every project on the site.
 *
 * Used by:
 *   - /projects        (projects/page.tsx)      — the full filterable index
 *   - /                (page.tsx, home)          — the "Featured work" list,
 *                                                   via the `featured` field
 *
 * To add, remove, or edit a project, change it here. Nothing else needs
 * to change in either page — both render straight off this array.
 */

import type { Tone } from '@/app/components/site/primitives';

export type Status = 'building' | 'shipped' | 'archive' | 'paused';
export type Domain = 'Robotics' | 'Drones' | 'Software';

export interface Project {
    num: string;
    href: string;
    title: string;
    blurb: string;
    status: Status;
    domain: Domain;
    year: string;
    /**
     * Last time the project or its page was updated, as 'YYYY-MM-DD'. /projects' sort=recent
     * shows the newest first, so bump this whenever you edit a project. Same-day ties keep
     * the order of this array.
     */
    updated: string;
    /** Set when href points off-site — renders a plain anchor, opens in a new tab. */
    external?: boolean;
    /**
     * Set to include this project in the homepage's "Featured work" list.
     * Lower number = shown first. Omit to leave it off the homepage.
     */
    featured?: number;
    /** Overrides the status word shown on the homepage only (the /projects index always shows `status` as-is). */
    homeLabel?: string;
    /** Overrides the status dot color shown on the homepage only. */
    homeTone?: Tone;
    /** Written for the retired /now page (archive/now-page.tsx). Not rendered anywhere now. */
    nowUpdate?: { title: string; body: string };
    /** Written for the retired /now page (archive/now-page.tsx). Not rendered anywhere now. */
    backBurnerNote?: string;
}

/** Status → dot color, shared by both pages. */
export const STATUS_TONE: Record<Status, Tone> = {
    building: 'warn',
    shipped: 'good',
    archive: 'neutral',
    paused: 'neutral',
};

export const PROJECTS: Project[] = [
    {
        num: '01',
        href: '/projects/aetherius',
        title: 'Aetherius UAV',
        blurb: 'Twin-boom fixed-wing. Flown on RC.',
        status: 'building',
        domain: 'Drones',
        year: '2025 – present',
        updated: '2026-10-21',
        featured: 1,
        homeLabel: 'flown',
        homeTone: 'good',
        nowUpdate: {
            title: 'Planning autonomous flight and mounting sensor arrays.',
            body: 'On August 18, after a week of attempts, the plane achieved stable flight, and at the same time demonstrated takeoff capability.',
        },
    },
    {
        num: '02',
        href: '/projects/aetherius-gcs',
        title: 'Aetherius GCS',
        blurb: 'Custom ArduPilot ground station. ArduCopter + ArduPlane, in-app firmware flashing, full calibration, missions, Lua IDE.',
        status: 'building',
        domain: 'Software',
        year: '2025 – present',
        updated: '2026-10-21',
        featured: 2,
        nowUpdate: {
            title: 'Ground station, third revision',
            body: 'Handled the real flight: firmware, calibration, failsafes, prearm, arming, mode switching, live dashboard. Covers ArduCopter and ArduPlane. Mission support works against SITL.',
        },
    },
    {
        num: '08',
        href: '/projects/caelifer',
        title: 'Caelifer',
        blurb: 'Tube-launchable coaxial EDF VTOL, steered by servo-actuated exhaust vanes. Bench tested only.',
        status: 'building',
        domain: 'Drones',
        year: '2026 – present',
        updated: '2026-10-25',
    },
    {
        num: '05',
        href: '/projects/mercedtime',
        title: 'MercedTime',
        blurb: 'Chrome extension on the Web Store (v1.2.1) that replaces the read side of UC Merced’s registration pages: class search, schedules, planning, degree roadmap.',
        status: 'shipped',
        domain: 'Software',
        year: '2026 – present',
        updated: '2026-10-21',
        featured: 3,
    },
    {
        num: '03',
        href: '/projects/sprocketstats',
        title: 'SprocketStats Scouting',
        blurb: 'Real-time scouting + analytics for FRC. React, FastAPI, Postgres. Used at 3 competitions, now handed off to the team.',
        status: 'archive',
        domain: 'Software',
        year: '2024–26',
        updated: '2026-10-21',
        nowUpdate: {
            title: 'Computer-vision rebuild',
            body: 'Rebuilding the scouting pipeline to integrate machine learning algorithms, currently building for the 2026 off-season.',
        },
    },
    {
        num: '04',
        href: '/projects/sprocketstats-com',
        title: 'sprocketstats.com',
        blurb: 'The team-facing platform. Scouting plus team operations.',
        status: 'shipped',
        domain: 'Software',
        year: '2024 – present',
        updated: '2026-10-21',
        homeLabel: 'live',
        nowUpdate: {
            title: 'Team operations and scouting platform.',
            body: 'In use by Team 3473.',
        },
    },
    {
        num: '07',
        href: '/projects/crowd-flow',
        title: 'Crowd Flow',
        blurb: 'Shelved Godot prototype: crowd simulation with the per-agent work moved onto the GPU.',
        status: 'archive',
        domain: 'Software',
        year: '2026',
        updated: '2026-10-21',
        backBurnerNote: 'Prototype. Not planning to revisit it, but it still works and it is still fun to watch.',
    },
    {
        num: '06',
        href: 'https://github.com/markwu123454/FemtoJSON',
        title: 'Femto',
        blurb: 'Three orders of magnitude smaller than pico, Femto is a native file-viewer suite: FemtoJSON, FemtoDot, and more to come.',
        status: 'paused',
        domain: 'Software',
        year: '2026 – present',
        updated: '2026-10-06',
        external: true,
        backBurnerNote: 'Source and release on GitHub.',
    },
    {
        num: '10',
        href: '/projects/sprocket-frc',
        title: 'FRC Team 3473: Team Sprocket',
        blurb: 'Two seasons on Team 3473’s CAD subteam.',
        status: 'archive',
        domain: 'Robotics',
        year: '2024–26',
        updated: '2026-10-21',
    },
    {
        num: '09',
        href: '/projects/harbinger',
        title: 'Harbinger',
        blurb: 'Embedded C++ turret with coilgun actuator and closed-loop pid control.',
        status: 'paused',
        domain: 'Robotics',
        year: '2025 – present',
        updated: '2026-10-21',
        backBurnerNote: 'only differential geared base, got advice to not build it into a turret.',
    },
    {
        num: '11',
        href: '/projects/infernope',
        title: 'Team Infernope',
        blurb: 'Three years and twelve combat robots later, I got 1st place at the end-of-year tournament.',
        status: 'archive',
        domain: 'Robotics',
        year: '2020–24',
        updated: '2026-10-06',
    },
];
