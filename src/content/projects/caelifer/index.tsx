import { Brief, CadRender, LoopVideo, Shot } from '@/app/components/project/media';
import { defineProject } from '../types';
import airframe from './cad-transparent.png';
import platformCad from './cad-frame.png';
import flowSim from './flow-sim.png';
import assembled from './build-assembled.webp';
import avionics from './build-avionics-top.webp';
import earlyBuild from './build-early.webp';
import benchRunPoster from './bench-run-poster.webp';

const BENCH_RUN = 'https://assets.markwu.org/portfolio/caelifer-bench-run.mp4';

/** Each half of the wide test platform tile: half the frame on phones, half the 1100px column on desktop. */
const HALF = '(max-width: 768px) 50vw, 550px';

export default defineProject({
    slug: 'caelifer',
    title: 'Caelifer',
    subtitle: 'A coaxcopter with EDF.',
    summary: 'Tube-launchable coaxial EDF tailsitter in a 150 mm finless airframe, steered by servo-actuated exhaust vanes with no external control surfaces.',
    domain: 'Drones',
    status: 'building',
    statusNote: 'bench testing',
    years: { start: 2026 },
    role: 'Solo, with help from Cody',

    hero: (
        <CadRender
            src={airframe}
            alt="Transparent CAD render of Caelifer: a tall tube with a rounded nose, the EDF pair and fins visible inside."
            priority
        />
    ),
    thumb: airframe,

    stack: ['SolidWorks', 'Pixhawk 6C Mini', 'ArduCopter', 'M10 GPS'],
    links: [{ kind: 'related', label: 'Aetherius GCS', href: '/projects/aetherius-gcs' }],
    stats: [
        { label: 'Airframe', value: '150 mm finless tube' },
        { label: 'Propulsion', value: '70 mm coaxial EDF · 6S' },
        { label: 'Test platform', value: '1327 g · no legs' },
        { label: 'Tested', value: 'Bench tested' },
    ],

    highlights: [
        {
            media: <Shot src={flowSim} fit="contain" alt="SolidWorks Flow Simulation: streamlines flowing past a cutaway of Caelifer’s nose and tube." />,
            caption: 'SolidWorks Flow Simulation, used qualitatively to catch geometry that would spike drag. Not for drag numbers: layer lines on the printed part would throw them off anyway.',
        },
        {
            media: <Shot src={earlyBuild} position="50% 30%" alt="Black EDF section on a blue ring with four servos around it, standing on blue legs." />,
            caption: 'EDF section on a blue servo ring, with the four vane servos and legs.',
        },
        {
            media: (
                <div className="absolute inset-0 grid grid-cols-2">
                    <div className="relative">
                        <CadRender
                            src={platformCad}
                            alt="SolidWorks render of the test platform: the EDF tube with vane servos and four legs at the base, battery and avionics rings above."
                            sizes={HALF}
                        />
                    </div>
                    <div className="relative border-l border-rule">
                        <Shot
                            src={assembled}
                            alt="The printed test platform on carpet: black EDF tube on blue legs, battery and wiring on the ring above, GPS and flight controller on top."
                            position="50% 30%"
                            sizes={HALF}
                        />
                    </div>
                </div>
            ),
            wide: true,
            caption: 'The test platform, designed for testing stuff while the drone is in early development.',
        },
        {
            media: <LoopVideo src={BENCH_RUN} poster={benchRunPoster} alt="The test platform on a desk, held down by hand during a bench run." />,
            caption: 'Bench test on 2026.10.25, held down by hand. Checking lift',
        },
        {
            media: <Shot src={avionics} position="50% 22%" alt="Top-down view of the test platform: a Pixhawk 6C Mini and an M10 GPS on the top ring, with XT90 leads and wiring around them." />,
            caption: 'From above: Pixhawk 6C Mini and M10 GPS on the test platform’s top ring.',
        },
    ],

    milestones: [
        {
            date: '2026-10-25', kind: 'test', title: 'Motor and servo bench test',
            body: 'On the test platform, held down by hand. [TODO: what was tested and how it went]',
        },
        {
            kind: 'build', title: 'Built a test platform', thumb: assembled,
            body: 'For testing while the drone is in early development. 1327 g without the legs.',
        },
        {
            date: '2026', kind: 'test', label: 'Bench', title: 'First bench tests',
            body: 'Propulsion and avionics run at low speed with props.',
        },
    ],

    outlook: {
        now: 'The drone is in early development, so the hardware right now is a test platform. Propulsion has been bench tested at low speeds. Current draw hasn’t been measured yet (the manufacturer lists 178 A at stall). Flight controller is a Pixhawk 6C Mini on ArduCopter, set up with my ground station.',
        next: ['fix motor polarity issue'],
    },
});
