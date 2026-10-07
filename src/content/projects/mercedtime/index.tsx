import { Shot } from '@/app/components/project/media';
import { defineProject } from '../types';
import banner from './banner.webp';
import findClasses from './find-classes.png';
import plan from './plan.png';
import schedule from './schedule.png';
import degree from './degree.png';

export default defineProject({
    slug: 'mercedtime',
    title: 'MercedTime',
    subtitle: 'UC Merced course lookup and planning, overhauled.',
    summary: 'A Chrome extension that replaces UC Merced’s registration pages: class search, schedules and degree progress in one place.',
    domain: 'Software',
    status: 'building',
    statusNote: 'v0.2',
    years: { start: 2026 },
    role: 'Solo',

    hero: <Shot src={banner} alt="The MercedTime wordmark and tagline next to a weekly class calendar and a registration countdown." priority />,
    thumb: banner,

    stack: ['React', 'Vite', 'Chrome MV3', 'IndexedDB'],
    links: [{ kind: 'site', label: 'Chrome Web Store', href: 'https://chromewebstore.google.com/detail/hjppipajfmgbkocbjejafmmdommjbnpg?utm_source=portfolio-website-project' }],
    stats: [
        { label: 'Platform', value: 'Chrome extension' },
        { label: 'Replaces', value: 'Banner + uAchieve' },
        { label: 'Writes to Banner', value: 'Never' },
        { label: 'Server', value: 'None' },
    ],

    highlights: {
        description: 'UC Merced’s registration and class lookup is slow, hard to use, and ugly, so I decided to redo it, and at the same time adding more features and quality of life improvements.',
        items: [
            {
                media: <Shot src={findClasses} alt="Find classes: a searchable course list with open seats, times and a section detail panel." />,
                wide: true,
                caption: 'Find classes: search by name, subject, number, CRN, or instructor, with seats, waitlists, exams and prerequisites in one view.',
            },
            {
                media: <Shot src={plan} alt="Plan: every semester listed with planned courses and unit totals." />,
                caption: 'Plan: every semester in one list, and schedules generated around your preferences: free time kept open, fewer days on campus, or evenly spread hours.',
            },
            {
                media: <Shot src={schedule} alt="Schedule: a weekly calendar of registered classes with free time between them." />,
                caption: 'Schedule: the week, free time between classes, and a one-click image export.',
            },
            {
                media: <Shot src={degree} alt="Degree: the degree audit with each requirement marked done, in progress, planned or needed." />,
                wide: true,
                caption: 'Degree: the uAchieve audit, integrated with you plan and taken courses.',
            },
        ],
    },

    milestones: [
        { date: '2026-10', kind: 'release', title: 'Submitted to the Chrome Web Store', label: 'v0.2', body: 'Plan and settings sync through Chrome sync; first-run data disclosure; privacy policy.' },
        { date: '2026-10', kind: 'build', title: 'First build', body: 'Mapped Banner’s 54 endpoints and the four ways its session dies, then built the read-only app on top.' },
    ],

    outlook: {
        now: 'Read-only on purpose: add, drop and submit stay on Banner’s own page behind a single “Register” button, because those endpoints are a state machine where a mistake costs a real seat.',
        next: ['Feedback from students in the registration window', 'Get more people to use it'],
    },
});
