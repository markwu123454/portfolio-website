import { CadRender, Shot } from '@/app/components/project/media';
import { defineProject } from '../types';
import goodGameCad from './good-game-01.png';
import goodGamePhoto from './good-game-03.jpg';
import madPhoto from './mad-02.jpg';
import madInAction from './mad-03.png';
import opCalc from './op-02.png';
import thwackCad from './thwack-01.png';
import op from './op-01.png';
import madCad from './mad-01.png';
import helloKitty from './hello-kitty.png';
import reynolds from './reynolds-pamphlet.png';
import oneAndTwo from './one-and-two.png';
import riptide from './riptide.png';
import bot300g from './300g-bot-01.png';
import rightAngle from './right-angle.png';
import doomstone from './doomstone.png';
import vert from './vert.png';
import shellSpinners from './shell-spinners-01.png';
import horizontalSpinner from './horizontal-spinner.png';
import goodGameCad2 from './good-game-02.png';
import goodGameInternals from './good-game-04.jpg';
import madParts from './mad-04.png';
import thwackCad2 from './thwack-02.png';
import bot300g2 from './300g-bot-02.png';
import shellSpinners2 from './shell-spinners-02.png';
import flameLogo from './flame-icon.png';
import awardFll2021 from './award-leadership-2021.jpg';
import awardVexIq2022 from './award-vex-iq-2022.jpg';
import awardRobotics2023 from './award-robotics-2023.jpg';
import awardHsRobotics2024 from './award-hs-robotics-2024.jpg';

export default defineProject({
    slug: 'infernope',
    title: 'Team Infernope',
    subtitle: 'three years, twelve robots.',
    summary: 'My combat robotics for 3 years.',
    description: 'Three years of combat robotics. Twelve robots, one end-of-year tournament win.',
    domain: 'Robotics',
    status: 'archived',
    years: { start: 2020, end: 2024 },
    role: 'Founder & Captain',

    hero: <CadRender src={goodGameCad} alt="CAD of Good Game: a teal and white chassis with a vertical disk weapon and three front wedges." priority />,
    thumb: goodGameCad,

    stack: ['Fusion 360', 'TinkerCAD', '3D printing'],
    links: [
        { kind: 'blog', label: 'teaminfernope.wordpress.com', href: 'https://teaminfernope.wordpress.com/' },
        { kind: 'video', label: 'youtube.com/@TeamInfernope', href: 'https://www.youtube.com/@TeamInfernope/featured' },
    ],
    stats: [
        { label: 'Robots', value: '12' },
        { label: 'Classes', value: '300 g · 1 lb' },
        { label: 'Best', value: '1st, final year' },
        { label: 'Duration', value: '3 years' },
    ],

    awards: [
        { place: '1st place', what: 'End-of-year tournament', detail: 'with Good Game: a vertical spinner', when: 'Year 3' },
        {
            place: 'Outstanding Contribution', what: 'SWIS HS Robotics', when: '2023–24',
            image: awardHsRobotics2024, imageAlt: 'SWIS HS Robotics Outstanding Contribution plaque, Mark Wu, 2023–2024.',
        },
        {
            place: 'Outstanding Contribution', what: 'SWIS Robotics', when: '2022–23',
            image: awardRobotics2023, imageAlt: 'SWIS Robotics Outstanding Contribution plaque, Mark Wu, 2022–2023.',
        },
        {
            place: 'Outstanding Contribution', what: 'SWIS VEX IQ', when: '2021–22',
            image: awardVexIq2022, imageAlt: 'SWIS VEX IQ Outstanding Contribution plaque, Mark Wu, 2021–2022.',
        },
        {
            place: 'Leadership Award', what: 'SWIS FLL', when: '2020–21',
            image: awardFll2021, imageAlt: 'SWIS FLL Leadership Award plaque, Mark Wu, 2020–2021.',
        },
    ],

    highlights: [
        {
            media: <Shot src={goodGamePhoto} alt="Good Game, 3D printed in white and teal, seen from above." />,
            wide: true,
            caption: 'Good Game. Modular wheels, weapons, wheel guard and wedge let me adapt to each opponent.',
        },
        {
            media: <Shot src={madInAction} alt="MAD spinning on a checkered floor, its weapon blurred." />,
            caption: 'MAD. A 6S system instead of 3S doubled the voltage for more energy.',
        },
        {
            media: <Shot src={madPhoto} alt="MAD printed in white and teal, sitting on a tiled floor." />,
            caption: 'MAD. A faulty belt system limited the weapon to not being able to spin very fast.',
        },
        {
            media: <Shot src={opCalc} fit="contain" alt="OP’s weapon test calculations: a spectrogram, then the working for weapon speed and stored energy." />,
            caption: 'OP’s weapon calculations: over 200 J stored, which resuts in creating too much gyroscopic procession to be able to drive properly at high speeds.',
        },
        {
            media: <CadRender src={riptide} alt="CAD of Riptide: a pocketed dark plate chassis with white sides and an egg-beater weapon." />,
            caption: 'Riptide, egg beater in fusion 360',
        },
    ],

    galleries: [
        {
            title: 'Build archive',
            description: 'Random pictures of my robots.',
            slides: [
                { media: <CadRender src={op} alt="CAD of OP: a vertical disk spinner with large yellow and orange wheels." />, caption: "OP · CAD" },
                { media: <CadRender src={opCalc} alt="OP’s weapon test calculations: a spectrogram, then the working for weapon speed and stored energy." />, caption: 'OP · weapon calculations from weapon sound' },
                { media: <CadRender src={goodGameCad} alt="CAD of Good Game: a teal and white chassis with a vertical disk weapon and three front wedges." />, caption: 'Good Game · CAD(Disk configuration)' },
                { media: <CadRender src={goodGameCad2} alt="CAD of Good Game from another angle, showing the weapon disk and wedges." />, caption: 'Good Game · CAD(Bar configuration)' },
                { media: <CadRender src={goodGamePhoto} alt="Good Game, 3D printed in white and teal, seen from above." />, caption: 'Good Game · Robot photo' },
                { media: <CadRender src={goodGameInternals} alt="Good Game’s printed parts, motors and wiring laid out on a white board." />, caption: 'Good Game· Laid out all parts' },
                { media: <CadRender src={madCad} alt="CAD of MAD: a white horizontal bar spinner with a long teal bar." />, caption: 'MAD · CAD' },
                { media: <CadRender src={madPhoto} alt="MAD printed in white and teal, sitting on a tiled floor." />, caption: 'MAD · Robot photo' },
                { media: <CadRender src={madInAction} alt="MAD spinning on a checkered floor, its weapon blurred." />, caption: 'MAD · Weapon test' },
                { media: <CadRender src={madParts} alt="MAD’s parts laid out flat in CAD." />, caption: 'MAD · All CAD iterations' },
                { media: <CadRender src={helloKitty} alt="CAD of Hello Kitty: a teal drum-style egg-beater with red wheels and a cat-shaped top plate." />, caption: 'Hello Kitty · CAD' },
                { media: <CadRender src={reynolds} alt="CAD of The Reynolds Pamphlet: a teal wedge-shaped hammer bot with an orange feather-shaped hammer." />, caption: 'The Reynolds Pamphlet · CAD' },
                { media: <CadRender src={oneAndTwo} alt="CAD of one of the One and Two wedges: a teal wedge with a clear lid." />, caption: 'One and Two · CAD' },
                { media: <CadRender src={riptide} alt="CAD of Riptide: a pocketed dark plate chassis with white sides and an egg-beater weapon." />, caption: 'Riptide · CAD(Fusion 360)' },
                { media: <CadRender src={bot300g} alt="CAD of the 300g Bot: a teal chassis with an orange beater bar between two front forks." />, caption: '300g Bot · CAD' },
                { media: <CadRender src={bot300g2} alt="The 300g Bot, printed in white, driving in an arena with a blue light on." />, caption: '300g Bot · Robot photo' },
                { media: <CadRender src={rightAngle} alt="CAD of Right Angle: an orange horizontal disk under a teal frame." />, caption: 'Right Angle · CAD' },
                { media: <CadRender src={doomstone} alt="CAD of Doomstone: a teal chassis with a long orange horizontal bar weapon." />, caption: 'Doomstone · CAD' },
                { media: <CadRender src={vert} alt="CAD of Vert: a blue wedge robot with two orange vertical disks." />, caption: 'Vert · CAD' },
                { media: <CadRender src={thwackCad} alt="CAD of Thwack!: a teal box chassis with its internals and orange wheels visible." />, caption: 'Thwack! · CAD' },
                { media: <CadRender src={thwackCad2} alt="Thwack!’s swappable attachments laid out in CAD." />, caption: 'Thwack! · Configurations' },
                { media: <CadRender src={shellSpinners} alt="Concept CAD of shell spinner parts: several round shells and a central hub laid out." />, caption: 'Shell spinners · CAD concept' },
                { media: <CadRender src={shellSpinners2} alt="Concept CAD of a shell spinner: an orange and red body with a vertical post." />, caption: 'Shell spinners · CAD concept' },
                { media: <CadRender src={horizontalSpinner} alt="CAD of the first Horizontal Spinner: a red chassis with orange wheels and a green bar weapon." />, caption: 'Horizontal Spinner · CAD' },
                { media: <CadRender src={flameLogo} alt="Team Infernope logo: a blue flame on black." />, caption: 'Team Infernope Logo' },
            ],
        },
    ],
    milestones: {
        title: 'Robot list',
        items: [
            { date: 'After Y3', kind: 'build', label: 'Never competed', thumb: op, title: 'OP', body: 'Vertical disk spinner storing over 200 Jouels of energy.' },
            { date: 'Y3 · S2', kind: 'build', label: '1st place', tone: 'good', thumb: goodGameCad, title: 'Good Game', body: 'Modular weapon, wedges, wheels, and wheel guard.' },
            { date: 'Y3 · S2', kind: 'build', label: '2nd place', tone: 'good', thumb: madCad, title: 'MAD', body: 'Horizontal bar spinner on steroids(6S).' },
            { date: 'Y3 · S2', kind: 'build', label: '3rd place', tone: 'good', thumb: helloKitty, title: 'Hello Kitty', body: 'Egg beater robot in 3 days.' },
            { date: 'Y3 · S2', kind: 'build', label: '4th place', thumb: reynolds, title: 'The Reynolds Pamphlet', body: 'Hammer bot on a torsion spring and sector herringbone gear.' },
            { date: 'Y3 · S2', kind: 'build', label: '6th place', thumb: oneAndTwo, title: 'One and Two', body: 'Two 225 g wedges as a multibot.' },
            { date: 'Y3 · S2', kind: 'build', label: 'CAD only', thumb: riptide, title: 'Riptide', body: 'A 3 lb egg-beater in UHMW and carbon fiber; never made.' },
            { date: 'Y3 · S1', kind: 'build', label: 'Out in quals', thumb: bot300g, title: '300g Bot', body: 'Vertical beater bar with a pocketed chassis.' },
            { date: 'Y3 · S1', kind: 'build', label: 'Round of 32', thumb: rightAngle, title: 'Right Angle', body: 'Bristle-drive horizontal spinner.' },
            { date: 'Y2–3', kind: 'build', label: 'Practice', thumb: doomstone, title: 'Doomstone', body: 'My first fully working robot with an active weapon.' },
            { date: 'Y2–3', kind: 'build', label: 'Practice', thumb: vert, title: 'Vert', body: 'Dual-disk vertical spinner.' },
            { date: 'Y2', kind: 'build', label: '1–0–2', thumb: thwackCad, title: 'Thwack!', body: 'Thwack bot with swappable attachments.' },
            { date: 'Y1–2', kind: 'build', label: 'CAD only', thumb: shellSpinners, title: 'Shell spinner', body: "Concept CAD; didn't make." },
            { date: 'Y1', kind: 'build', label: 'Didn’t work', tone: 'bad', thumb: horizontalSpinner, title: 'Horizontal Spinner', body: 'The first attempt.' },
        ],
    },
});
