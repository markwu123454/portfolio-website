import { Brief, CadRender, Shot } from '@/app/components/project/media';
import { defineProject } from '../types';
import airframe from './cad-transparent.png';
import flowSim from './flow-sim.png';

export default defineProject({
    slug: 'caelifer',
    title: 'Caelifer',
    subtitle: 'a target, three constraints, and whatever they force.',
    summary: 'Tube-launchable coaxial EDF tailsitter in a 150 mm finless airframe, steered by servo-actuated exhaust vanes with no external control surfaces.',
    domain: 'Drones',
    status: 'paused',
    statusNote: 'bench testing',
    years: { start: 2026 },
    role: 'Solo',

    hero: (
        <CadRender
            src={airframe}
            alt="Transparent CAD render of Caelifer: a tall tube with a rounded nose, the EDF pair and fins visible inside."
            priority
        />
    ),
    thumb: airframe,

    stack: ['SolidWorks', 'Pixhawk 6C', 'ArduCopter'],
    links: [{ kind: 'related', label: 'Aetherius GCS', href: '/projects/aetherius-gcs' }],
    stats: [
        { label: 'Airframe', value: '150 mm finless tube' },
        { label: 'Propulsion', value: '70 mm coaxial EDF · 6S' },
        { label: 'Weight', value: '~1.5 kg (estimated)' },
        { label: 'Tested', value: 'Bench only · no hover' },
    ],

    highlights: [
        {
            media: (
                <Brief
                    items={[
                        ['Optimise for', 'Cruise efficiency'],
                        ['Constraint 01', 'Must be hover capable'],
                        ['Constraint 02', 'Must be tube launchable'],
                    ]}
                />
            ),
            caption:
                'Requirements for the drone. Contra-rotating EDFs cancel each other’s torque and straighten out the airflow in the end, and servo-actuated vanes sit inside the exhaust because that’s where control authority comes from in a hover.',
        },
        {
            media: <Shot src={flowSim} fit="contain" alt="SolidWorks Flow Simulation: streamlines flowing past a cutaway of Caelifer’s nose and tube." />,
            caption: 'SolidWorks Flow Simulation, used qualitatively to catch geometry that would spike drag. Not for drag numbers: layer lines on the printed part would throw them off anyway.',
        },
    ],

    outlook: {
        now: 'Propulsion and avionics have been bench tested at low speed with props and at high speed without them, never high speed with props. Current draw hasn’t been measured yet (the manufacturer lists 178 A at stall). Flight controller is a Pixhawk 6C on ArduCopter, set up with my ground station.',
        restart: ['Backburner, working a bit at a time.'],
    },
});
