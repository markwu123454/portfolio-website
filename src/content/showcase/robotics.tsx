import { CadRender, Shot } from '@/app/components/project/media';
import { defineShowcase } from './types';
import goodGamePhoto from '../projects/infernope/good-game-03.jpg';
import madInAction from '../projects/infernope/mad-03.png';
import opCalc from '../projects/infernope/op-02.png';
import reynolds from '../projects/infernope/reynolds-pamphlet.png';
import bot300g from '../projects/infernope/300g-bot-02.png';
import helloKitty from '../projects/infernope/hello-kitty.png';
import rebuilt from '../projects/sprocket-frc/2026-rebuilt.png';
import robotPits from '../projects/sprocket-frc/robot-pits.webp';
import pitBanner from '../projects/sprocket-frc/pit-banner.webp';
import harbinger from '../projects/harbinger/turret-angle.webp';

export default defineShowcase({
    slug: 'robotics',
    num: '#S04',
    topic: 'Robotics',
    title: 'Robots that compete.',
    subtitle: 'From combat robots to FRC.',
    description: 'Robotics: twelve combat robots with Team Infernope, two FRC seasons with Team 3473, and an ESP32 turret with field-oriented control.',

    stats: [
        { label: 'Combat robots', value: '12' },
        { label: 'Best finish', value: '1st, end-of-year' },
        { label: 'FRC', value: '2 seasons · Team 3473' },
        { label: 'Started', value: 'FLL · VEX IQ, 2020' },
    ],

    feature: {
        title: 'Team 3473, 2026',
        caption: 'Rebuilt season. I designed its storage and indexer.',
        media: <CadRender src={rebuilt} alt="CAD of Team 3473’s 2026 Rebuilt robot with purple TEAM SPROCKET bumpers." priority sizes="(max-width: 768px) 100vw, 1100px" />,
        href: '/projects/sprocket-frc',
    },

    tiles: [
        {
            title: 'Harbinger',
            caption: 'Differential turret base on an ESP32 with FOC gimbal motors.',
            media: <Shot src={harbinger} alt="Harbinger’s yellow base at an angle: a black ring gear on bearings, driven by two blue pinions." />,
            href: '/projects/harbinger',
            span: 'wide',
        },
        {
            title: 'Team 3473, 2025',
            caption: 'I designed the climb subsystem.',
            media: <Shot src={robotPits} fit="contain" alt="Team 3473’s 2025 robot on the pit floor: a tall elevator, white intake rollers and blue 3473 bumpers." />,
            href: '/projects/sprocket-frc',
            span: 'tall',
        },
        {
            title: 'MAD',
            caption: '6S horizontal bar spinner. 2nd place.',
            media: <Shot src={madInAction} alt="MAD spinning on a checkered floor, its weapon blurred." />,
            href: '/projects/infernope',
        },
        {
            title: 'Good Game',
            caption: '1 lb vertical spinner. 1st place, my robots took the top four.',
            media: <Shot src={goodGamePhoto} alt="Good Game, 3D printed in white and teal, seen from above." />,
            href: '/projects/infernope',
        },
        {
            title: 'OP',
            caption: 'Weapon speed from a spectrogram: over 200 J stored.',
            media: <CadRender src={opCalc} alt="OP’s weapon test calculations: a spectrogram, then the working for weapon speed and stored energy." />,
            href: '/projects/infernope',
        },
        {
            title: 'The Reynolds Pamphlet',
            caption: 'Torsion-spring hammer bot. 4th place.',
            media: <CadRender src={reynolds} alt="CAD of The Reynolds Pamphlet: a teal wedge-shaped hammer bot with an orange feather-shaped hammer." />,
            href: '/projects/infernope',
        },
        {
            title: '300g Bot',
            caption: 'Beater-bar bot in the arena.',
            media: <Shot src={bot300g} alt="The 300g Bot, printed in white, driving in an arena with a blue light on." />,
            href: '/projects/infernope',
        },
        {
            title: 'Team 3473 pit',
            caption: 'Two seasons on the CAD subteam.',
            media: <Shot src={pitBanner} alt="Team Sprocket FRC 3473’s pit: purple banners showing every robot since 2013, a sponsor banner and a cardboard rocket." />,
            href: '/projects/sprocket-frc',
            span: 'wide',
        },
        {
            title: 'Hello Kitty',
            caption: 'Egg-beater built in 3 days. 3rd place.',
            media: <CadRender src={helloKitty} alt="CAD of Hello Kitty: a teal drum-style egg-beater with red wheels and a cat-shaped top plate." />,
            href: '/projects/infernope',
        },
    ],
});
