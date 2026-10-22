import { CadRender, Shot } from '@/app/components/project/media';
import { defineShowcase } from './types';
import goodGameCad from '../projects/infernope/good-game-01.png';
import madParts from '../projects/infernope/mad-04.png';
import riptide from '../projects/infernope/riptide.png';
import thwack from '../projects/infernope/thwack-02.png';
import op from '../projects/infernope/op-01.png';
import helloKitty from '../projects/infernope/hello-kitty.png';
import reynolds from '../projects/infernope/reynolds-pamphlet.png';
import reefscape from '../projects/sprocket-frc/2025-reefscape.png';
import rebuilt from '../projects/sprocket-frc/2026-rebuilt.png';
import caelifer from '../projects/caelifer/cad-transparent.png';
import flowSim from '../projects/caelifer/flow-sim.png';

export default defineShowcase({
    slug: '3d-design',
    num: '#S01',
    topic: '3D design',
    title: 'Parts that get built.',
    subtitle: 'CAD from 300 g robots to FRC.',
    description: 'CAD work: combat robots, FRC subsystems for Team 3473, and the Caelifer drone airframe.',

    stats: [
        { label: 'Primary', value: 'SolidWorks' },
        { label: 'Also', value: 'Fusion 360 · Onshape' },
        { label: 'Designed', value: '12 combat · 5 FRC subsystems' },
        { label: 'Since', value: '2020' },
    ],

    feature: {
        title: 'Good Game',
        caption: 'Modular 1 lb vertical spinner. 1st place, end-of-year tournament.',
        media: <CadRender src={goodGameCad} alt="CAD of Good Game: a teal and white chassis with a vertical disk weapon and three front wedges." priority />,
        href: '/projects/infernope',
    },

    tiles: [
        {
            title: 'Reefscape intake + climb',
            caption: 'Intake and climb subsystems on Team 3473’s 2025 robot.',
            media: <CadRender src={reefscape} alt="CAD of Team 3473’s 2025 Reefscape robot: a tall elevator on purple bumpers." />,
            href: '/projects/sprocket-frc',
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
            title: 'Rebuilt indexer',
            caption: 'Indexer, storage and superstructure on the 2026 robot.',
            media: <CadRender src={rebuilt} alt="CAD of Team 3473’s 2026 Rebuilt robot with purple TEAM SPROCKET bumpers." />,
            href: '/projects/sprocket-frc',
        },
        {
            title: 'Flow Simulation',
            caption: 'Airflow over Caelifer’s nose and tube.',
            media: <Shot src={flowSim} fit="contain" alt="SolidWorks Flow Simulation: streamlines flowing past a cutaway of Caelifer’s nose and tube." />,
            href: '/projects/caelifer',
        },
        {
            title: 'MAD',
            caption: 'Every CAD iteration of a 6S bar spinner.',
            media: <CadRender src={madParts} alt="MAD’s parts laid out flat in CAD." />,
            href: '/projects/infernope',
        },
        {
            title: 'Riptide',
            caption: '3 lb egg-beater in UHMW and carbon fibre.',
            media: <CadRender src={riptide} alt="CAD of Riptide: a pocketed dark plate chassis with white sides and an egg-beater weapon." />,
            href: '/projects/infernope',
        },
        {
            title: 'Thwack!',
            caption: 'Swappable attachments on one chassis.',
            media: <CadRender src={thwack} alt="Thwack!’s swappable attachments laid out in CAD." />,
            href: '/projects/infernope',
        },
        {
            title: 'OP',
            caption: 'Vertical disk spinner storing over 200 J.',
            media: <CadRender src={op} alt="CAD of OP: a vertical disk spinner with large yellow and orange wheels." />,
            href: '/projects/infernope',
        },
        {
            title: 'Hello Kitty',
            caption: 'Egg-beater designed and built in 3 days.',
            media: <CadRender src={helloKitty} alt="CAD of Hello Kitty: a teal drum-style egg-beater with red wheels and a cat-shaped top plate." />,
            href: '/projects/infernope',
        },
        {
            title: 'The Reynolds Pamphlet',
            caption: 'Hammer bot on a torsion spring and herringbone sector gear.',
            media: <CadRender src={reynolds} alt="CAD of The Reynolds Pamphlet: a teal wedge-shaped hammer bot with an orange feather-shaped hammer." />,
            href: '/projects/infernope',
        },
    ],
});
