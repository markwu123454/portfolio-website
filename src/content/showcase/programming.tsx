import { Brief, Shot } from '@/app/components/project/media';
import { defineShowcase } from './types';
import gcs from '../projects/aetherius-gcs/gcs-hardware.png';
import flashing from '../projects/aetherius-gcs/gcs-firmware.png';
import scoutingApp from '../projects/sprocketstats/scouting-app-2026-event2.png';
import matchReview from '../projects/sprocketstats/scouting-2026.png';
import findClasses from '../projects/mercedtime/find-classes.png';
import schedule from '../projects/mercedtime/schedule.png';
import degree from '../projects/mercedtime/degree.png';
import signIn from '../projects/sprocketstats-com/signin.png';
import crowd from '../projects/crowd-flow/egress.png';

export default defineShowcase({
    slug: 'programming',
    num: '#S03',
    topic: 'Programming',
    title: 'Software people use.',
    subtitle: 'Tools I built because I needed them.',
    description: 'Software projects: a ground station for ArduPilot, a scouting platform used at competitions, a Chrome extension and a GPU crowd simulation.',

    stats: [
        { label: 'Daily', value: 'TypeScript · Python' },
        { label: 'Also', value: 'Rust · C++' },
        { label: 'In real use', value: 'GCS · SprocketStats · MercedTime' },
        { label: 'Shipped to', value: 'Desktop · web · Chrome' },
    ],

    feature: {
        title: 'Aetherius GCS',
        caption: 'ArduPilot ground station in Rust and React. It has run every flight of my drone.',
        media: (
            <Shot
                src={gcs}
                alt="Aetherius GCS: console log on the left, satellite map in the centre, prearm failures on the right, attitude indicator and telemetry below."
                priority
            />
        ),
        href: '/projects/aetherius-gcs',
    },

    tiles: [
        {
            title: 'SprocketStats Scouting',
            caption: 'Real-time FRC scouting, used at three competitions.',
            media: <Shot src={scoutingApp} alt="Scouting app mid-match: task buttons on the left, field map in the middle, made and missed shot sliders on the right." />,
            href: '/projects/sprocketstats',
            span: 'wide',
        },
        {
            title: 'Firmware flashing',
            caption: 'Step-by-step flashing inside the GCS.',
            media: <Shot src={flashing} alt="Aetherius GCS firmware installer: a checklist of steps from connecting the board to flashing, with a progress bar partway through." />,
            href: '/projects/aetherius-gcs',
        },
        {
            title: 'MercedTime',
            caption: 'Chrome extension replacing UC Merced’s registration pages.',
            media: <Shot src={findClasses} alt="Find classes: a searchable course list with open seats, times and a section detail panel." />,
            href: '/projects/mercedtime',
            span: 'wide',
        },
        {
            title: 'Schedules',
            caption: 'Weekly schedule with one-click image export.',
            media: <Shot src={schedule} alt="Schedule: a weekly calendar of registered classes with free time between them." />,
            href: '/projects/mercedtime',
        },
        {
            title: 'Degree audit',
            caption: 'Degree progress merged with your plan.',
            media: <Shot src={degree} alt="Degree: the degree audit with each requirement marked done, in progress, planned or needed." />,
            href: '/projects/mercedtime',
        },
        {
            title: 'Match review',
            caption: 'Per-robot contributions from scouted data.',
            media: <Shot src={matchReview} alt="Match review: red and blue bars comparing each robot’s scouted contributions." />,
            href: '/projects/sprocketstats',
        },
        {
            title: 'sprocketstats.com',
            caption: 'Team platform with sign-in and attendance.',
            media: <Shot src={signIn} alt="sprocketstats.com sign-in page: a dark map background with season art and a Continue with Google button." />,
            href: '/projects/sprocketstats-com',
        },
        {
            title: 'Crowd Flow',
            caption: 'About 2,000 agents at 60 fps on the GPU in Godot.',
            media: <Shot src={crowd} alt="Crowd Flow at 18:45: dense green crowds streaming toward four exits of the plaza." />,
            href: '/projects/crowd-flow',
            span: 'wide',
        },
        {
            title: 'Experiments',
            caption: 'Algorithm toys on this site.',
            media: (
                <Brief
                    items={[
                        ['Snake', 'Hamiltonian agent that always wins'],
                        ['State Space', 'Rush Hour BFS in 3D'],
                    ]}
                />
            ),
            href: '/experiments',
        },
    ],
});
