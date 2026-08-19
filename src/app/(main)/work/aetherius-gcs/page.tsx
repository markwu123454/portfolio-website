/**
 * Aetherius GCS — /work/aetherius-gcs
 *
 * Content is from Mark directly (Aug 2026). Do not invent rationale here.
 * If a "why" isn't in that account, leave it out.
 *
 * Voice: no em dashes in prose. Long sentences joined with commas, "so",
 * "because", "which is why". No two-sentence antithesis, no aphoristic
 * headings, no summary zinger at the end of a paragraph. State the thing
 * and stop.
 *
 * Claim discipline:
 *   • v3 IS public with multiple releases. v2's repo is NOT public.
 *   • It ran a real flight on 2026-08-18: setup, calibration, prearm,
 *     arming, mode switching, live dashboard. It did NOT fly the plane,
 *     pilot input was RC.
 *   • Mission support exists in software. No autonomous mission flown.
 *   • Transport is Tauri IPC, not raw serial/UDP from the frontend.
 */

import Image from 'next/image';
import type { Metadata } from 'next';
import {
    Page,
    PageHeader,
    Section,
    Crumbs,
    StatStrip,
    Figure,
    Button,
} from '@/app/components/site/primitives';

export const metadata: Metadata = {
    title: 'Aetherius GCS',
    description:
        'A ground control station for ArduPilot. Windows desktop, ArduCopter and ArduPlane only. Firmware flashing, calibration, missions, and an embedded Lua IDE. Third revision.',
};

const REPO = 'https://github.com/markwu123454/Aetherius-GCS-v3';

const IMG = {
    hardware: { src: '/aetherius/gcs-hardware.png', w: 2559, h: 1599 },
    firmware: { src: '/aetherius/gcs-firmware.png', w: 2559, h: 1599 },
} as const;

const CATEGORIES: Array<[string, string]> = [
    [
        'Menus',
        'The top strip with the menu and stats readout, plus the connection, arm and mode overlays. They stay visible the whole time the app is open, because those are the only things people need at any time, so they have to be accessible all the time.',
    ],
    [
        'Panels',
        'Floating or docked windows you open and close in the main window, which has the map as its background. Panels are what you use in flight or doing general vehicle work, so that covers prearm checks, console, servo outputs, telemetry and the mission monitor.',
    ],
    [
        'Pages',
        'Full screen, with only the menus still visible. When something needs more space than a panel can give, or doesn’t require as much situational awareness while you’re using it, it goes in a page: calibration, mission planning, flashing, parameters, logs and analysis, the Lua IDE, preferences.',
    ],
];

export default function AetheriusGcsPage() {
    return (
        <Page>
            <Crumbs
                items={[
                    { href: '/work', label: 'Work' },
                    { href: '/work?domain=Software', label: 'Software' },
                    { label: 'Aetherius GCS' },
                ]}
            />

            <PageHeader
                tag={['PROJECT', 'SOFTWARE', '2025 —']}
                title="Aetherius GCS"
                subtitle="a ground station for ArduPilot, third revision."
                dek="QGroundControl and Mission Planner both work, and both feel old to use. I'm not trying to replicate either of them, so the scope is narrow on purpose: Windows only, desktop only, ArduCopter and ArduPlane only."
                after={
                    <div className="flex gap-3 flex-wrap">
                        <Button href={REPO} variant="primary" arrow external>
                            Source and releases
                        </Button>
                    </div>
                }
            />

            <StatStrip
                items={[
                    { label: 'Stack', value: 'Tauri · Rust · React' },
                    { label: 'Scope', value: 'Windows · Copter + Plane' },
                    { label: 'Revision', value: 'v3 · public, with releases' },
                    { label: 'Flown with', value: '2026.08.18' },
                ]}
            />

            <Section num="01" title="Why I built it">
                <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                    <p className="m-0">
                        Using QGC and Mission Planner, the UI feels old, and you can see a
                        lot of signs of legacy infrastructure. QGC did update recently and it
                        brought a lot of improvements, but I still think I can make something
                        better, meaning more modern and more targeted.
                    </p>
                    <p className="m-0">
                        I&#39;m not replicating QGC, because I don&#39;t have the capability
                        to, so I need differentiation instead. That&#39;s why I laid out a
                        scope before building anything: Windows only, desktop app, ArduCopter
                        and ArduPlane only, and only once this is finished would I consider
                        expanding to more ArduPilot vehicle types.
                    </p>
                </div>
            </Section>

            <Section num="02" title="v1 and v2">
                <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                    <p className="m-0">
                        <strong className="text-fg font-semibold">v1</strong> was Python on
                        localhost, and a lot of the code depended on a companion computer
                        existing next to the flight controller on the plane, which was a
                        Raspberry Pi in my case and is pretty rare in general. I also only
                        used Aetherius as the reference when designing it, so everything was
                        built around my own setup, and since I never test flew it, all of it
                        was basically bloat without the actual capabilities of a GCS.
                    </p>
                    <p className="m-0">
                        <strong className="text-fg font-semibold">v2</strong> was Tauri with
                        a Python sidecar, because I wasn&#39;t familiar with Rust or
                        didn&#39;t trust it yet, so I took the MAVLink Python class from v1
                        and plastered it in. I also wanted it modular and customisable, so I
                        designed a panel system where you could reconfigure everything, which
                        turned out to be hard to implement and not a good idea, and I decided
                        that fairly early on. That repo isn&#39;t public.
                    </p>
                    <p className="m-0">
                        <strong className="text-fg font-semibold">v3</strong> is the current
                        one and the most polished. It fully uses what Tauri gives you, a Rust
                        backend and the IPC, with a React frontend so I still get the modern
                        web UI ecosystem.
                    </p>
                </div>
            </Section>

            <Section num="03" title="Menus, panels and pages">
                <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                    <p className="m-0">
                        v3 has a modular main display like v2 did, where you have panels you
                        can move around and set in different positions and sizes, but unlike
                        v2 I limited what the system can do to only what&#39;s plausible and
                        what I judged people would want, so I don&#39;t end up building an
                        overly complicated modular system that&#39;s broken and also
                        impossible to use.
                    </p>
                    <p className="m-0">
                        Features split into three categories. Panels and pages cover most of
                        the app, and menus exist because a few things don&#39;t fit
                        conceptually in either of the others.
                    </p>
                </div>

                <dl className="m-0 mt-2">
                    {CATEGORIES.map(([k, v]) => (
                        <div
                            key={k}
                            className="grid grid-cols-1 sm:grid-cols-[120px_minmax(0,1fr)] gap-2 sm:gap-6 py-4 border-t border-rule"
                        >
                            <dt className="font-mono text-[11px] tracking-mono text-fg-soft sm:pt-1">
                                {k}
                            </dt>
                            <dd className="m-0 text-[14.5px] leading-[1.6] text-fg-muted max-w-160">
                                {v}
                            </dd>
                        </div>
                    ))}
                </dl>
            </Section>

            <Section num="04" title="Why IPC">
                <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                    <p className="m-0">
                        I used IPC because that&#39;s what Tauri is designed around and it
                        works well for my situation. I currently don&#39;t have large data
                        streaming like camera feeds, and with telemetry defaulting to 20 Hz it
                        isn&#39;t so much information that IPC can&#39;t handle it. IPC also
                        guarantees delivery, which matters for commands and acks.
                    </p>
                    <p className="m-0">
                        If camera streaming or other large data streaming gets implemented,
                        I&#39;ll probably implement serial or UDP on the side just for that.
                    </p>
                </div>
            </Section>

            <Section num="05" title="Prearm panel">
                <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                    <p className="m-0">
                        This one is purely a quality of life feature. In QGC prearm just goes
                        into the console alongside everything else, so what this does instead
                        is request prearm state every 3 seconds, changeable in preferences,
                        and display the errors individually. The console then filters prearm
                        messages into its debug category so they&#39;re normally hidden and
                        don&#39;t clutter it.
                    </p>
                </div>

                <Figure
                    caption={
                        <>
                            <span className="text-fg-muted">Fig. 5.1 —</span> Prearm panel on
                            the right, each failure listed on its own. Console on the left with
                            prearm messages filtered out.
                        </>
                    }
                >
                    <div className="bg-bg-elev border border-rule overflow-hidden">
                        <Image
                            src={IMG.hardware.src}
                            width={IMG.hardware.w}
                            height={IMG.hardware.h}
                            alt="Aetherius GCS connected to a flight controller over serial. Console log at left, satellite map centre, prearm failure list at right, telemetry and artificial horizon below."
                            sizes="(max-width: 880px) 100vw, 1080px"
                            className="w-full h-auto block"
                            priority
                        />
                    </div>
                </Figure>
            </Section>

            <Section num="06" title="Firmware flashing">
                <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                    <p className="m-0">
                        I debated a lot about whether to do this one, because when I first
                        started with QGC and working with Pixhawk, flashing was a very nervous
                        step, since QGC is rather opaque about it and you don&#39;t know if
                        the board bricked after you reboot and pray it opens a COM port.
                    </p>
                    <p className="m-0">
                        I eventually decided to add flashing but was really careful about it,
                        since it has a lot of potential to go wrong, which is also why the
                        majority of the tests are on the flashing scripts.
                    </p>
                    <p className="m-0">
                        The step by step checklist UI is there to guide new users through the
                        flow, with an advanced user toggle so you can further customise the
                        firmware you&#39;re flashing. Showing each step is so I&#39;m as
                        transparent as possible, exposing newer users to what&#39;s actually
                        happening under the hood, and hopefully removing some of the anxiety.
                    </p>
                </div>

                <Figure
                    caption={
                        <>
                            <span className="text-fg-muted">Fig. 6.1 —</span> Mid write, with
                            verify, reboot and reconnect still to come.
                        </>
                    }
                >
                    <div className="bg-bg-elev border border-rule overflow-hidden">
                        <Image
                            src={IMG.firmware.src}
                            width={IMG.firmware.w}
                            height={IMG.firmware.h}
                            alt="Firmware installer: connect board, select vehicle type, select version, download firmware, then a stepped reboot and flash sequence with a progress bar."
                            sizes="(max-width: 880px) 100vw, 1080px"
                            className="w-full h-auto block"
                        />
                    </div>
                </Figure>
            </Section>

            <Section num="07" title="Lua IDE">
                <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                    <p className="m-0">
                        I decided the Lua IDE should be a big feature because it&#39;s one of
                        the bigger benefits of being ArduPilot only. Scripting on QGC is
                        virtually non existent and most users use VS Code instead, so a
                        powerful IDE directly inside the GCS is a new feature.
                    </p>
                </div>
            </Section>

            <Section num="08" title="What it has and hasn't done">
                <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                    <p className="m-0">
                        On 2026.08.18 it did the setup for a real flight, so that was firmware
                        for both boards, full calibration of radio, gyro, accel and compass,
                        failsafes, servo assignment and trims beforehand, then gyro
                        calibration, prearm checks, arming, mode switching and the dashboard
                        across two flights.
                    </p>
                    <p className="m-0">
                        It didn&#39;t fly the aircraft, that was RC. Mission support works
                        against SITL but no autonomous mission has been flown on real hardware
                        yet. Board support comes from the same device list QGC uses, so
                        whatever QGC supports this supports too, and it runs against SITL as
                        well as real hardware.
                    </p>
                </div>
            </Section>
        </Page>
    );
}
