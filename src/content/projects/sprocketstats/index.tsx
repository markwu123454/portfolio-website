import { Shot } from '@/app/components/project/media';
import { defineProject } from '../types';
import scoutingApp from './scouting-app-2026-event2.png';
import matchReview from './scouting-2026.png';
import shotSlider from './shot-slider-closeup.png';
import tracking from './yolo-bytetrack-tracking.png';
import keypoints from './v3/hrnet-keypoints.png';
import trajectories from './v3/field-trajectories.png';

export default defineProject({
    slug: 'sprocketstats',
    title: 'SprocketStats Scouting',
    subtitle: 'real-time scouting for FRC.',
    summary: 'Scouting app, prediction and data sharing for Team 3473. Predicts match results as well as Statbotics does.',
    description:
        'A full-stack scouting platform for FRC: field-mapped input, ensemble match prediction, and guest sharing for alliance partners. Now adding automatic scouting from match video.',
    domain: 'Software',
    status: 'building',
    statusNote: 'v3 in development',
    years: { start: 2024 },
    role: 'Creator and alumni',
    affiliation: 'FRC Team 3473',

    hero: (
        <Shot
            src={scoutingApp}
            alt="Scouting app mid-match: task buttons on the left, field map in the middle, made and missed shot sliders on the right."
            priority
        />
    ),
    thumb: scoutingApp,

    stack: ['React', 'TypeScript', 'FastAPI', 'Tauri', 'Python'],
    links: [{ kind: 'related', label: 'sprocketstats.com', href: '/projects/sprocketstats-com' }],
    stats: [
        { label: 'Records', value: '411' },
        { label: 'Teams', value: '73' },
        { label: 'Events', value: '3' },
        { label: 'Win/loss', value: '~87% predicted' },
    ],

    highlights: [
        {
            media: <Shot src={matchReview} alt="Match review: red and blue bars comparing each robot’s scouted contributions." />,
            wide: true,
            caption:
                'Match review: scouted tasks and contributions per match.',
        },
        {
            media: <Shot src={shotSlider} fit="contain" alt="Close-up of the two shot sliders: green for made shots, red for missed." />,
            caption: 'Shot rates in 2026 were so high that tapping a +1 +5 or +10 button just isn’t practical, so we replaced it with one slider scouters can drag or tap quickly.',
        },
        {
            media: <Shot src={tracking} alt="Competition broadcast with a labelled box around every robot, such as “blue 0.82” and “red 0.86”." />,
            tag: 'v3 · early',
            caption: 'YOLO + ByteTrack identifies and tracks each robot. It only needs to see part of a robot, so it’s harder to lose one compared to other models.',
        },
        {
            media: <Shot src={keypoints} alt="Reefscape broadcast frame from the Curie Division, used for HRNet keypoint detection." />,
            tag: 'v3 · in development',
            caption: 'An HRNet model trained on labelled keypoints pinpoints geometric center of the robot.',
        },
        {
            media: <Shot src={trajectories} alt="Top-down field map covered in red and blue robot paths." />,
            tag: 'v3 · in development',
            caption: 'Robot positions from HRNet, transformed onto field coordinates.',
        },
    ],

    milestones: [
        {
            date: '2026', kind: 'milestone', label: 'In development', tone: 'warn', title: 'v3: automatic scouting from video',
            body: 'Camera solve, broadcast reading and robot tracking, aimed at the 2026 off-season and 2027.',
        },
        {
            date: '2026', kind: 'event', label: '~87%', tone: 'good', title: 'Prediction on par with Statbotics',
            body: 'Win/loss over about 90 late-qualification and playoff matches; no significant difference from EPA at 95% confidence.',
        },
        {
            date: '2026', kind: 'release', title: 'Updated for the Rebuilt season',
            body: 'Shot slider, field map, and task buttons changed from click to hold between events.',
        },
        {
            date: '2025', kind: 'release', title: 'Built for Reefscape, replacing the old app',
            body: 'The old one was a glorified Google Form with a ton of issues.',
        },
    ],

    outlook: {
        now: 'v3 is the focus: collecting data from match video instead of asking people to tap buttons. It’s mostly the new members working on it while I’m guiding the direction',
        next: [
            'Finish tracking',
            'An RNN that turns robot tracks into behaviour per match',
            'Alliance selection simulator',
        ],
    },
});
