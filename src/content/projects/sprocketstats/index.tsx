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
        'A full-stack scouting platform for FRC: field-mapped input, ensemble match prediction, and guest sharing for alliance partners. Handed off to Team 3473 with a computer-vision rebuild partway done.',
    domain: 'Software',
    status: 'archived',
    statusNote: 'handed off',
    years: { start: 2024, end: 2026 },
    role: 'Architect · de facto technical lead',
    affiliation: 'FRC Team 3473',

    hero: (
        <Shot
            src={scoutingApp}
            alt="Scouting app mid-match: task buttons on the left, field map in the middle, made and missed shot sliders on the right."
            priority
        />
    ),
    thumb: scoutingApp,

    stack: ['React', 'TypeScript', 'Tailwind', 'FastAPI', 'PostgreSQL (Neon)', 'Fly.io'],
    links: [{ kind: 'related', label: 'sprocketstats.com', href: '/projects/sprocketstats-com' }],
    stats: [
        { label: 'Matches', value: '218' },
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
            tag: 'v3 · unfinished',
            caption: 'YOLO + ByteTrack robot detection and tracking. Still in development when I handed the project off.',
        },
        {
            media: <Shot src={keypoints} alt="Reefscape broadcast frame from the Curie Division, used for HRNet keypoint detection." />,
            tag: 'v3 · unfinished',
            caption: 'HRNet pose estimation, trained on labelled keypoints to find each robot’s geometric centre. Still in development at handoff.',
        },
        {
            media: <Shot src={trajectories} alt="Top-down field map covered in red and blue robot paths." />,
            tag: 'v3 · in development',
            caption: 'Robot positions mapped onto field coordinates through the homography, which is finished; the HRNet positions feeding it were not.',
        },
    ],

    milestones: [
        {
            date: '2026', kind: 'milestone', label: 'Handed off', title: 'Handed off to the team',
            body: 'I’m now an alumnus; the remaining team members have the project.',
        },
        {
            date: '2026', kind: 'milestone', label: 'Partly done', tone: 'warn', title: 'v3: automatic scouting from video',
            body: 'Done: webcast matching, audio alignment, custom template-matching OCR for the broadcast, and homography field mapping. Unfinished at handoff: HRNet pose estimation, YOLO + ByteTrack detection and tracking, and an RNN for path categorization.',
        },
        {
            date: '2026', kind: 'event', label: '~87%', tone: 'good', title: 'Prediction on par with Statbotics',
            body: 'Random Forest + K-Means ensemble, trained only on earlier matches from the event. Win/loss over about 90 late-qualification and playoff matches; no significant difference from Statbotics EPA at 95% confidence.',
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
        now: 'I architected it and wrote the majority of the code; three teammates contributed with my direction and code review. It ran live at 3 competitions, including both 2026 CA district events, logging 218 matches across 73 teams. Since graduating I’ve handed it to the team and don’t expect to work on it further.',
    },
});
