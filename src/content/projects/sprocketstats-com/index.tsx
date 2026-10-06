import { Shot } from '@/app/components/project/media';
import { defineProject } from '../types';
import signIn from './signin.png';
import oldSite from './2025-scoutingapp.png';

export default defineProject({
    slug: 'sprocketstats-com',
    title: 'sprocketstats.com',
    subtitle: 'the half that isn’t scouting.',
    summary: 'The team-facing platform: scouting plus team operations. In use by Team 3473.',
    domain: 'Software',
    status: 'live',
    years: { start: 2024 },
    role: 'Creator and alumni',
    affiliation: 'FRC Team 3473',

    // TODO: replace with a screenshot of the product; the sign-in screen only shows branding.
    hero: (
        <Shot
            src={signIn}
            alt="sprocketstats.com sign-in page: a dark map background with BIOCORE season art and a Continue with Google button."
            priority
        />
    ),
    thumb: signIn,

    stack: ['React', 'FastAPI', 'Postgres'],
    links: [
        { kind: 'site', label: 'sprocketstats.com', href: 'https://sprocketstats.com' },
        { kind: 'related', label: 'SprocketStats Scouting', href: '/projects/sprocketstats' },
    ],
    stats: [
        { label: 'Users', value: 'Team 3473' },
        { label: 'Licence', value: 'AGPL-3.0' },
        { label: 'Hardware', value: '40 tablets' },
    ],

    highlights: [
        {
            media: <Shot src={oldSite} alt="The old Sprocket Stats V2 site: a dark home page with an About box and a scouting schedule table." />,
            wide: true,
            caption: 'What it replaced: the old site that is essentially worse in every aspect, like ui, ux, latency, stability, security.',
        },
    ],

    // TODO: dates.
    milestones: [
        {
            kind: 'release', title: 'Sign-in moved to popup OAuth',
            body: 'Google’s sign-in button randomly failed to load, and redirect OAuth flashed the screen in the mobile app. The popup fixed both.',
        },
        {
            kind: 'release', title: 'Attendance moved in',
            body: 'At the team captain’s request, replacing a seperate Google Form we use to use. For a while there was an issue where the app freezes, which turns out to be a leaking database connection.',
        },
        {
            kind: 'release', title: 'Launched',
            body: 'Replaced the old site, with Google sign-in on school email.',
        },
    ],

    outlook: {
        now: 'Live and in use by Team 3473 for scouting and attendance.',
        next: [
            'RFID check-in and check-out',
            '8-digit backup codes that offline devices can verify with a checksum',
            'RFID access control on the new manufacturing machines',
        ],
    },
});
