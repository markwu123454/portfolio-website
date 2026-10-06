import { Shot } from '@/app/components/project/media';
import { defineProject } from '../types';
import connected from './gcs-hardware.png';
import flashing from './gcs-firmware.png';

export default defineProject({
    slug: 'aetherius-gcs',
    title: 'Aetherius GCS',
    subtitle: 'a modern ground station for ArduPilot.',
    summary: 'Desktop ground station for ArduCopter and ArduPlane.',
    domain: 'Software',
    status: 'building',
    years: { start: 2025 },
    role: 'Solo',

    hero: (
        <Shot
            src={connected}
            alt="Aetherius GCS: console log on the left, satellite map in the centre, prearm failures on the right, attitude indicator and telemetry below."
            priority
        />
    ),
    thumb: connected,

    stack: ['Tauri', 'Rust', 'React', 'MAVLink'],
    links: [
        { kind: 'repo', label: 'Aetherius-GCS-v3 · releases', href: 'https://github.com/markwu123454/Aetherius-GCS-v3' },
        { kind: 'related', label: 'Aetherius UAV', href: '/projects/aetherius' },
    ],
    stats: [
        { label: 'Scope', value: 'Windows · Copter + Plane' },
        { label: 'Revision', value: 'v3' },
        { label: 'Flown with', value: '2026.08.18' },
        { label: 'Telemetry', value: '20 Hz' },
    ],

    highlights: [
        {
            media: <Shot src={flashing} alt="Aetherius GCS firmware installer: a checklist of steps from connecting the board to flashing, with a progress bar partway through." />,
            wide: true,
            caption:
                'Firmware flashing as a step-by-step checklist, so steps are transparent and each step is illustrated.',
        },
    ],

    milestones: [
        {
            date: '2026-08-18', kind: 'milestone', label: 'Flown', tone: 'good', title: 'Ran the first Aetherius flight',
            body: 'Firmware, calibration and failsafes during setup; prearm, arming, mode switching and the live dashboard on the day.',
        },
        // TODO: dates for the three revisions.
        {
            kind: 'release', label: 'v3', title: 'Tauri with React frontend',
            body: 'Fully on Tauri: a Rust backend over IPC with the React UI. Public, with releases.',
        },
        {
            kind: 'release', label: 'v2', title: 'Tauri with a Python sidecar',
            body: 'Reused the Python MAVLink code from v1, plus a fully reconfigurable panel system that turned out to be a too complicated. Not public.',
        },
        {
            kind: 'release', label: 'v1', title: 'Python on localhost',
            body: 'Depended on a Raspberry Pi companion computer next to the flight controller, and was never flown.',
        },
    ],

    outlook: {
        now: 'v3 has handled every Aetherius flight so far. Mission support works against the simulator (SITL) but yet to test it in flight.',
    },
});
