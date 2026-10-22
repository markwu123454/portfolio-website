import { Shot } from '@/app/components/project/media';
import { defineProject } from '../types';
import dashboard from './dashboard-riverside-plaza.png';
import egress from './egress.png';
import cpuDraft from './early-cpu-draft.png';

export default defineProject({
    slug: 'crowd-flow',
    title: 'Crowd Flow',
    subtitle: 'an idea I wrote down and then actually built.',
    summary: 'Shelved crowd-simulation prototype in Godot: an existing hybrid continuum and social-force model, with the per-agent work moved into GPU shaders.',
    domain: 'Software',
    status: 'archived',
    years: { start: 2026, end: 2026 },
    role: 'Solo',

    hero: <Shot src={dashboard} alt="Crowd Flow at 18:03: a top-down plaza with scattered green agents, a clock and occupancy panel, and a schedule bar." priority />,
    thumb: dashboard,

    stack: ['Godot', 'Python'],
    links: [{ kind: 'repo', label: 'CrowdFlow', href: 'https://github.com/markwu123454/CrowdFlow' }],
    stats: [
        { label: 'Engine', value: 'Godot' },
        { label: 'Model', value: 'Two papers, 2001 + 2011' },
        { label: 'Scale (informal)', value: '~2,000 agents · 60 fps at 2×' },
    ],

    highlights: [
        {
            media: <Shot src={egress} alt="Crowd Flow at 18:45: dense green crowds streaming toward four exits of the plaza." />,
            wide: true,
            caption: 'Egress at 18:45: 2,362 of 3,600 people still on site, draining through four exits.',
        },
        {
            media: <Shot src={cpuDraft} fit="contain" alt="The first CPU-only simulation: a dark window of orange and blue agent dots with a stats line along the bottom." />,
            wide: true,
            caption: 'The first version, CPU only: 1,000 agents at 13 fps with the density heatmap on, peaking at 15.2 people/m² in a corner due to a pathfinding bug.',
        },
    ],

    milestones: [
        {
            date: '2026', kind: 'milestone', label: 'Stopped', title: 'Shelved',
            body: 'Optimizations hid a block, I can’t get performance where I wanted it, and I didn’t think I could build a game I’d enjoy.',
        },
        { date: '2026', kind: 'release', title: 'Moved to Godot and the GPU', body: 'About 2,000 agents at 60 fps, running at 2× speed. Informal, single-machine numbers from different builds, not a controlled benchmark.' },
        { date: '2026', kind: 'release', title: 'Python prototype', body: 'Both papers implemented faithfully: about 1,000 agents at 13 fps.' },
    ],

    outlook: {
        now: 'What exists runs without bugs, but most of it is unfinished. The source is public to read; there are no setup docs and none are planned.',
    },
});
