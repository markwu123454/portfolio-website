import { Brief, CadRender, LoopVideo, Shot } from '@/app/components/project/media';
import { defineShowcase } from './types';
import airborne from '../projects/aetherius/flight-02-airborne.png';
import flyby from '../projects/aetherius/flight-flyby-houses.png';
import onField from '../projects/aetherius/flight-00-ground-test.png';
import airframe from '../projects/aetherius/hero-airframe.jpg';
import gcs from '../projects/aetherius-gcs/gcs-hardware.png';
import flashing from '../projects/aetherius-gcs/gcs-firmware.png';
import caelifer from '../projects/caelifer/cad-transparent.png';
import flowSim from '../projects/caelifer/flow-sim.png';

const FLIGHT_05 = 'https://assets.markwu.org/portfolio/flight%205.mp4';

export default defineShowcase({
    slug: 'uav',
    num: '#S05',
    topic: 'UAV',
    title: 'Drones that fly.',
    subtitle: 'A fixed-wing in the air, a tailsitter on the bench.',
    description: 'UAV work: the Aetherius fixed-wing, a custom ArduPilot ground station, and the Caelifer coaxial EDF tailsitter.',

    stats: [
        { label: 'First flight', value: '2026.08.18' },
        { label: 'Day one', value: '2 takeoffs · ~10 s' },
        { label: 'Autopilot', value: 'ArduPilot · Pixhawk 6X' },
        { label: 'Ground station', value: 'My own' },
    ],

    feature: {
        title: 'Aetherius UAV',
        caption: 'A later flight in FBWA, flown on RC with my own ground station in the loop.',
        media: <LoopVideo src={FLIGHT_05} poster={airborne} alt="Aetherius in the air over a grass park." sizes="(max-width: 768px) 100vw, 1100px" />,
        href: '/projects/aetherius',
    },

    tiles: [
        {
            title: 'Flight 02',
            caption: 'Climbing out, seconds before a prop broke.',
            media: <Shot src={airborne} alt="Aetherius small in the sky, climbing over a grass field with houses behind it." />,
            href: '/projects/aetherius',
            span: 'wide',
        },
        {
            title: 'Caelifer',
            caption: 'Coaxial EDF tailsitter in a 150 mm tube.',
            media: <CadRender src={caelifer} alt="Transparent CAD render of Caelifer: a tall tube with a rounded nose, the EDF pair and fins visible inside." />,
            href: '/projects/caelifer',
            span: 'tall',
        },
        {
            title: 'Low pass',
            caption: 'Aetherius over the edge of the park.',
            media: <Shot src={flyby} alt="Aetherius flying low in front of a row of houses at the edge of a park." />,
            href: '/projects/aetherius',
        },
        {
            title: 'Test day',
            caption: 'On the field during testing.',
            media: <Shot src={onField} alt="Aetherius sitting on the grass of a park field, with houses and trees behind." />,
            href: '/projects/aetherius',
        },
        {
            title: 'Aetherius GCS',
            caption: 'My own ground station, used on every flight.',
            media: <Shot src={gcs} alt="Aetherius GCS connected to the flight controller: console log, satellite map, prearm list and attitude indicator." />,
            href: '/projects/aetherius-gcs',
        },
        {
            title: 'Airframe',
            caption: 'Twin-boom kit with avionics I sourced and fitted.',
            media: <Shot src={airframe} alt="Aetherius’s white twin-boom airframe on a table, with wiring and parts around it." />,
            href: '/projects/aetherius',
        },
        {
            title: 'Firmware flashing',
            caption: 'Board setup as a checklist in the GCS.',
            media: <Shot src={flashing} alt="Aetherius GCS firmware installer: a checklist of steps from connecting the board to flashing, with a progress bar partway through." />,
            href: '/projects/aetherius-gcs',
        },
        {
            title: 'Flight log',
            caption: 'First day: two takeoffs, ~10 s combined, one aborted roll.',
            media: (
                <Brief
                    items={[
                        ['Flight 01', '~1 m · clean landing'],
                        ['Flight 02', '~5 m · prop split'],
                    ]}
                />
            ),
            href: '/projects/aetherius',
            span: 'wide',
        },
        {
            title: 'Flow Simulation',
            caption: 'Airflow over Caelifer’s nose.',
            media: <Shot src={flowSim} fit="contain" alt="SolidWorks Flow Simulation: streamlines flowing past a cutaway of Caelifer’s nose and tube." />,
            href: '/projects/caelifer',
        },
    ],
});
