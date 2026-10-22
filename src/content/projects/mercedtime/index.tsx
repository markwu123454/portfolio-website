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
    summary: 'Chrome extension that replaces the read side of UC Merced’s registration pages: class search, schedules, planning and a degree roadmap.',
    domain: 'Software',
    status: 'live',
    statusNote: 'v1.2.1',
    years: { start: 2026 },
    role: 'Solo',

    hero: <Shot src={banner} alt="The MercedTime wordmark and tagline next to a weekly class calendar and a registration countdown." priority />,
    thumb: banner,

    stack: ['React', 'Vite', 'Chrome MV3', 'IndexedDB', 'Next.js', 'Neon Postgres'],
    links: [
        { kind: 'site', label: 'Chrome Web Store', href: 'https://chromewebstore.google.com/detail/hjppipajfmgbkocbjejafmmdommjbnpg?utm_source=portfolio-website-project' },
        { kind: 'site', label: 'mercedtime.com', href: 'https://mercedtime.com' },
    ],
    stats: [
        { label: 'Users', value: '19 (2026-10-17)' },
        { label: 'Replaces', value: 'Banner, read side' },
        { label: 'Writes to Banner', value: 'Never' },
        { label: 'Backend', value: 'Next.js on Vercel · Neon' },
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
                caption: 'Plan: a multi-semester board with prerequisite-chain tracing and unit-load warnings, plus every clash-free schedule for your planned courses, with locks and sorting.',
            },
            {
                media: <Shot src={schedule} alt="Schedule: a weekly calendar of registered classes with free time between them." />,
                caption: 'Schedule: the week, free time between classes, and a one-click image export.',
            },
            {
                media: <Shot src={degree} alt="Degree: the degree audit with each requirement marked done, in progress, planned or needed." />,
                wide: true,
                caption: 'Degree: an unofficial roadmap built from your uAchieve audit, plan and taken courses, with Explore across every major and minor. My Degree Path stays the official record.',
            },
        ],
    },

    milestones: [
        { date: '2026-10', kind: 'release', title: 'Published on the Chrome Web Store', label: 'v1.2.1', body: '19 users as of 2026-10-17. Backed by my own API on Vercel and Neon, which pulls Banner’s public class data daily and serves 182 requirement documents for the 2026-27 catalog.' },
        { date: '2026-10', kind: 'release', title: 'Submitted to the Chrome Web Store', label: 'v0.2', body: 'Plan and settings sync through Chrome sync; first-run data disclosure; privacy policy.' },
        { date: '2026-10', kind: 'build', title: 'First build', body: 'Mapped Banner’s 54 endpoints and the four ways its session dies, then built the read-only app on top.' },
    ],

    outlook: {
        now: 'Read-only on purpose: add, drop and submit stay on Banner’s own page behind a single “Register” button, because those endpoints are a state machine where a mistake costs a real seat.',
        next: ['Feedback from students in the registration window', 'Get more people to use it'],
    },
});
