/**
 * Single source of truth for every project on the site.
 *
 * Used by:
 *   - /work            (work/page.tsx)          — the full filterable index
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
    /** Numeric recency key — higher = more recent. Used by /work's sort=recent. */
    recency: number;
    /** Set when href points off-site — renders a plain anchor, opens in a new tab. */
    external?: boolean;
    /**
     * Set to include this project in the homepage's "Featured work" list.
     * Lower number = shown first. Omit to leave it off the homepage.
     */
    featured?: number;
    /** Overrides the status word shown on the homepage only (the /work index always shows `status` as-is). */
    homeLabel?: string;
    /** Overrides the status dot color shown on the homepage only. */
    homeTone?: Tone;
    /** Set to include this project in /now's "Active" section. */
    nowUpdate?: { title: string; body: string };
    /** Set to include this project in /now's "On the back burner" section. */
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
        href: '/work/aetherius',
        title: 'Aetherius UAV',
        blurb: 'Twin-boom fixed-wing. It actually flies!',
        status: 'building',
        domain: 'Drones',
        year: '2024 —',
        recency: 100,
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
        href: '/work/aetherius-gcs',
        title: 'Aetherius GCS',
        blurb: 'Custom ArduPilot ground station. ArduCopter + ArduPlane, in-app firmware flashing, full calibration, missions, Lua IDE.',
        status: 'building',
        domain: 'Software',
        year: '2025 —',
        recency: 99,
        featured: 2,
        nowUpdate: {
            title: 'Ground station, third revision',
            body: 'Handled the real flight: firmware, calibration, failsafes, prearm, arming, mode switching, live dashboard. Covers ArduCopter and ArduPlane. Mission support works against SITL.',
        },
    },
    {
        num: '03',
        href: '/work/sprocketstats',
        title: 'SprocketStats Scouting',
        blurb: 'Real-time scouting + analytics for FRC. React, FastAPI, Postgres. Used at 3 competitions.',
        status: 'building',
        domain: 'Software',
        year: '2024 —',
        recency: 95,
        featured: 3,
        nowUpdate: {
            title: 'Computer-vision rebuild',
            body: 'Rebuilding the scouting pipeline to integrate machine learning algorithms, currently building for the 2026 off-season.',
        },
    },
    {
        num: '04',
        href: '/work/sprocketstats-com',
        title: 'sprocketstats.com',
        blurb: 'The team-facing platform. Scouting plus team operations.',
        status: 'shipped',
        domain: 'Software',
        year: '2024 —',
        recency: 94,
        featured: 4,
        homeLabel: 'live',
        nowUpdate: {
            title: 'Team operations and scouting platform.',
            body: 'In use by Team 3473.',
        },
    },
    {
        num: '05',
        href: 'https://github.com/markwu123454/FemtoJSON',
        title: 'Femto',
        blurb: 'Three orders of magnitude smaller than pico, Femto is a native file-viewer suite: FemtoJSON, FemtoDot, and more to come.',
        status: 'paused',
        domain: 'Software',
        year: '2026 —',
        recency: 85,
        external: true,
        backBurnerNote: 'Source and release on GitHub.',
    },
    {
        num: '06',
        href: '/work/crowd-flow',
        title: 'Crowd Flow',
        blurb: 'Crowd simulation game in Godot.',
        status: 'archive',
        domain: 'Software',
        year: '2026',
        recency: 88,
        backBurnerNote: 'Prototype. Not planning to revisit it, but it still works and it is still fun to watch.',
    },
    {
        num: '07',
        href: '/work/caelifer',
        title: 'Caelifer',
        blurb: 'Coaxial EDF tailsitter drone with a novel control system.',
        status: 'paused',
        domain: 'Drones',
        year: '2026 —',
        recency: 85,
        backBurnerNote: 'bench testing, will revisit after Aetherius, probably.',
    },
    {
        num: '08',
        href: '/work/harbinger',
        title: 'Harbinger',
        blurb: 'Embedded C++ turret with coilgun actuator and closed-loop pid control.',
        status: 'paused',
        domain: 'Robotics',
        year: '2025 —',
        recency: 60,
        backBurnerNote: 'only differential geared base, got advice to not build it into a turret.',
    },
    {
        num: '09',
        href: '/work/sprocket-frc',
        title: 'FRC Team 3473: Team Sprocket',
        blurb: 'Two seasons of robot design with Team 3473.',
        status: 'archive',
        domain: 'Robotics',
        year: '2024–26',
        recency: 80,
    },
    {
        num: '10',
        href: '/work/combat',
        title: 'Team Infernope',
        blurb: 'Three years and twelve combat robots later, I got 1st place at the end-of-year tournament.',
        status: 'archive',
        domain: 'Robotics',
        year: '2020–24',
        recency: 20,
        featured: 5,
    },
];
