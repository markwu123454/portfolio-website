import { LoopVideo, Shot } from '@/app/components/project/media';
import { defineProject } from '../types';
import airframe from './hero-airframe.jpg';
import airborne from './flight-02-airborne.png';
import gcsConnected from '../aetherius-gcs/gcs-hardware.png';

const FLIGHT_05 = 'https://assets.markwu.org/portfolio/flight%205.mp4';

export default defineProject({
    slug: 'aetherius',
    title: 'Aetherius UAV',
    subtitle: 'fixed-wing drone.',
    summary: 'Off-the-shelf twin-boom airframe with self-sourced avionics. First flight 2026.08.18: two takeoffs, ~10 s combined. Flown more since in FBWA.',
    description:
        'Fixed-wing UAV build: twin-boom foam and carbon airframe with self-sourced avionics, Pixhawk 6X on ArduPlane 4.7.0, SiK telemetry and a custom ground station. First flight 2026.08.18 (two takeoffs, ~10 s combined airtime).',
    domain: 'Drones',
    status: 'building',
    statusNote: 'flown',
    years: { start: 2025 },
    role: 'Solo',
    affiliation: 'Dronescape(DBHS)',

    hero: <LoopVideo src={FLIGHT_05} poster={airborne} alt="Aetherius in the air over a grass park." />,
    thumb: airborne,

    stack: ['Pixhawk 6X', 'ArduPlane 4.7.0', 'SiK telemetry', 'FlySky'],
    links: [
        { kind: 'related', label: 'Aetherius GCS', href: '/projects/aetherius-gcs' },
    ],
    stats: [
        { label: 'First flight', value: '2026.08.18 · 2 takeoffs, ~10 s' },
        { label: 'Flown in', value: 'FBWA · on RC' },
        { label: 'Wingspan', value: '~2 m' },
        { label: 'Airframe', value: 'Twin-boom · foam + CF' },
    ],

    highlights: [
        {
            media: <Shot src={airborne} alt="Aetherius small in the sky, climbing over a grass field with houses behind it." />,
            wide: true,
            caption:
                'Flight 02, climbing on the way to about 5 m. The field ran out and a cheap knockoff prop split in flight, so it came down hard: minor airframe damage, no electronics damage.',
        },
        {
            media: <Shot src={airframe} alt="Aetherius’s white twin-boom airframe on a table, with wiring and parts around it." />,
            caption: 'Off-the-shelf twin-boom airframe. I sourced and fitted the flight controller, GPS, power and telemetry.',
        },
        {
            media: <Shot src={gcsConnected} alt="Aetherius GCS connected to the flight controller: console log, satellite map, prearm list and attitude indicator." />,
            caption:
                'Every flight is set up on my own ground station: flashing, calibration, failsafes and trims beforehand, then prearm checks, arming and mode switching on the flight day.',
        },
    ],

    milestones: [
        {
            date: 'Since 2026-08-18', kind: 'test', label: 'Flown', tone: 'good', title: 'More flights in FBWA',
            body: 'Longer and higher than the first day, in FBWA: a stabilized mode flown on the RC transmitter, not autonomy.',
        },
        {
            date: '2026-08-18', kind: 'test', label: 'Flown', tone: 'good', title: 'Flight 02',
            body: 'More ambitious, up to about 5 m. Ended in a crash: the field ran out of space and a cheap knockoff prop split in flight. Minor airframe damage, no electronics damage.',
        },
        {
            date: '2026-08-18', kind: 'test', label: 'Aborted', tone: 'warn', title: 'Aborted takeoff',
            body: 'A wing struck the ground during the takeoff roll and it turned sharply. Aborted before it was airborne.',
        },
        {
            date: '2026-08-18', kind: 'test', label: 'Flown', tone: 'good', title: 'Flight 01, first flight',
            body: 'Deliberately unambitious: downhill takeoff, about a metre up, gentle landing. Flights 01 and 02 together were about 10 s in the air.',
        },
        {
            date: '2026-08-13', kind: 'test', label: 'Test', tone: 'warn', title: 'Flight 00',
            body: 'A ground run across the court to prove it had enough thrust. Hit concrete and broke an aileron somehow, the aileron didnt even impact the concrete.',
        },
        {
            date: 'Summer 2026', kind: 'milestone', title: 'Back on it after graduating',
            body: 'Spent the summer getting it flightworthy, and learned the stack by building and rebuilding the ground station.',
        },
        {
            date: '[2025–26]', kind: 'milestone', title: 'Engineering lead in Dronescape',
            body: 'One of the club’s two flagship projects; teammates took it to displays; not much progress made.',
        },
        {
            date: 'Summer 2025', kind: 'milestone', title: 'Bought the airframe',
            body: 'A twin-boom kit with servos and motor. Sourced the flight controller, GPS, power and battery separately, and reused a FlySky transmitter from combat robotics.',
        },
    ],
    outlook: {
        now: 'Flying on RC sticks, with the ground station handling setup and arming. The next step is letting it fly itself and launched flights' +
            '.',
        next: ['Autonomous flight', 'Mount sensor arrays'],
    },
});
