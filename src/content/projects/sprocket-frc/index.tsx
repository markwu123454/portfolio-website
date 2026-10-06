import { CadRender, Shot } from '@/app/components/project/media';
import { defineProject } from '../types';
import rebuilt from './2026-rebuilt.png';
import reefscape from './2025-reefscape.png';
import robotPits from './robot-pits.webp';
import robotOnField from './robot-on-field.png';
import pitBanner from './pit-banner.webp';

export default defineProject({
    slug: 'sprocket-frc',
    title: 'Team Sprocket',
    subtitle: 'two seasons with Team 3473.',
    summary: 'CAD member for Team 3473 in the Reefscape and Rebuilt seasons.',
    description: 'Two seasons of FRC CAD with Team 3473 Sprocket. ',
    domain: 'Robotics',
    status: 'archived',
    years: { start: 2024, end: 2026 },
    role: 'CAD: climb (2025), indexer (2026)',
    affiliation: 'FRC Team 3473',

    hero: (
        <Shot
            src={pitBanner}
            alt="Team Sprocket FRC 3473’s pit: purple banners showing every robot since 2013, a sponsor banner and a cardboard rocket."
            priority
        />
    ),
    thumb: pitBanner,

    stack: ['SolidWorks'],
    links: [
        { kind: 'results', label: 'thebluealliance.com/team/3473', href: 'https://www.thebluealliance.com/team/3473' },
        { kind: 'cad', label: 'Reefscape CAD (2025)', href: 'https://grabcad.com/library/frc-team-3473-reefscape-cad-1' },
        { kind: 'cad', label: 'Rebuilt CAD (2026)', href: 'https://grabcad.com/library/frc-team-3473-rebuilt-cad-1' },
    ],
    stats: [
        { label: '2025 · Reefscape', value: 'Climb subsystem' },
        { label: '2026 · Rebuilt', value: 'Storage / indexer' },
    ],

    awards: [
        { place: 'Impact Award', what: 'Team award', detail: 'Won by Team 3473 in 2025' },
        { place: 'Engineering Inspiration', what: 'Team award', detail: 'Won by Team 3473 in 2026' },
    ],

    // Two rows, one per season: CAD on the left, the built robot on the right.
    highlights: [
        {
            media: <CadRender src={reefscape} alt="CAD of Team 3473’s 2025 Reefscape robot: a tall elevator on purple bumpers." />,
            caption: '2025 robot CAD.',
        },
        {
            media: <Shot src={robotPits} fit="contain" alt="Team 3473’s 2025 robot on the pit floor: a tall elevator, white intake rollers and blue 3473 bumpers." />,
            caption: '2025 robot IRL.',
        },
        {
            media: <CadRender src={rebuilt} alt="CAD of Team 3473’s 2026 Rebuilt robot with purple TEAM SPROCKET bumpers." />,
            caption: '2026 robot CAD',
        },
        {
            // Source is only 248×170, so it looks soft at tile size. Swap in a larger frame if there is one.
            media: <Shot src={robotOnField} alt="Team 3473’s 2026 robot on the field, surrounded by yellow balls." />,
            caption: '2026 robot IRL',
        },
    ],

    milestones: [
        { date: '2026', kind: 'event', title: 'Rebuilt season', body: 'Designed the storage and indexer subsystem.' },
        { date: '2025', kind: 'event', title: 'Reefscape season', body: 'Designed the climb subsystem.' },
    ],
});
