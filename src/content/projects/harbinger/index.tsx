import { Shot } from '@/app/components/project/media';
import { defineProject } from '../types';
import electronicsBay from './electronics-bay.png';

export default defineProject({
    slug: 'harbinger',
    title: 'Harbinger',
    subtitle: 'differential turret with a coilgun actuator.',
    summary: 'Closed-loop heading control on an ESP32, a programmable high-voltage coil driver, and a Qt app over Bluetooth.',
    domain: 'Robotics',
    status: 'paused',
    years: { start: 2025 },
    role: 'Solo',

    hero: (
        <Shot
            src={electronicsBay}
            alt="Harbinger’s yellow base from above, full of wiring, a mesh-covered power supply, the ESP32 board and motor drivers."
            priority
        />
    ),
    thumb: electronicsBay,

    stack: ['ESP32', 'SimpleFOC', 'C++', 'Qt', 'Bluetooth'],
    links: [
        { kind: 'repo', label: 'Harbinger', href: 'https://github.com/markwu123454/Harbinger' },
        { kind: 'repo', label: 'HarbingerApp', href: 'https://github.com/markwu123454/HarbingerApp' },
    ],
    stats: [
        { label: 'MCU', value: 'ESP32' },
        { label: 'Drive', value: 'Gimbal motors · FOC' },
        { label: 'Actuator', value: 'Coilgun · 3–5 stage' },
        { label: 'Projectile', value: 'Steel bearings' },
    ],

    // No highlights yet: the only other photo is a duplicate of the hero.

    outlook: {
        now: 'Only the differential geared base is built, and the Qt app can enable it and move it by hand. Haven’t gotten to mounting anything on it, or tuning the voltage and speed of the motors.',
    },
});
