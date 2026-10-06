import Image from 'next/image';
import type { Metadata } from 'next';
import {
    Page,
    PageHeader,
    Section,
    Crumbs,
    StatStrip,
    Tag,
    StatusPill,
    Button,
    Figure,
    TOCLayout,
} from '@/app/components/site/primitives';

export const metadata: Metadata = {
    title: 'Harbinger',
    description:
        'Differential turret with a coilgun actuator. ESP32 + SimpleFOC control, programmable high-voltage driver, Qt desktop app over Bluetooth.',
};

const TOC = [
    { id: 's01', num: '01', label: 'What it is' },
    { id: 's02', num: '02', label: 'Coilgun design' },
    { id: 's03', num: '03', label: 'Control system' },
    { id: 's04', num: '04', label: 'Qt app' },
] as const;

export default function HarbingerPage() {
    return (
        <Page>
            <Crumbs
                items={[
                    { href: '/work', label: 'Work' },
                    { href: '/work?domain=Robotics', label: 'Robotics' },
                    { label: 'Harbinger' },
                ]}
            />

            <PageHeader
                tag={['PROJECT', 'ROBOTICS', '2025 —']}
                title="Harbinger"
                subtitle="differential turret with a coilgun actuator."
                dek="Closed-loop heading control on an ESP32, programmable high-voltage driver, Qt desktop app over Bluetooth."
                after={
                    <div className="flex flex-col gap-3.5">
                        <div className="flex flex-wrap gap-1.5">
                            <StatusPill tone="warn">Paused</StatusPill>
                            <Tag variant="outline">ESP32</Tag>
                            <Tag variant="outline">SimpleFOC</Tag>
                            <Tag variant="outline">C++</Tag>
                            <Tag variant="outline">Qt</Tag>
                            <Tag variant="outline">Bluetooth</Tag>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            <Button href="https://github.com/markwu123454/Harbinger" variant="ghost" arrow external>
                                Harbinger
                            </Button>
                            <Button href="https://github.com/markwu123454/HarbingerApp" variant="ghost" arrow external>
                                HarbingerApp
                            </Button>
                        </div>
                    </div>
                }
            />

            <StatStrip
                items={[
                    { label: 'MCU', value: 'ESP32' },
                    { label: 'Drive', value: 'Gimbal motors · SimpleFOC' },
                    { label: 'Actuator', value: 'Coilgun · 3–5 stage' },
                    { label: 'Projectile', value: 'Steel ball bearings' },
                ]}
            />

            <Figure
                caption={
                    <>
                        <span className="text-fg-muted">Fig. 1: </span> Electronics
                        bay. ESP32 control board, motor drivers, and the rest of the
                        low-voltage stack; coilgun driver lives separately.
                    </>
                }
            >
                <div className="bg-bg-elev border border-rule overflow-hidden">
                    <Image
                        src="/harbinger/electronics-bay.png"
                        width={2880}
                        height={2160}
                        alt="Harbinger electronics bay — ESP32 control board, motor drivers, and supporting electronics."
                        sizes="(max-width: 880px) 100vw, 1080px"
                        className="w-full h-auto block"
                        priority
                    />
                </div>
            </Figure>

            <TOCLayout toc={TOC}>
                <Section num="01" id="s01" title="What it is">
                    <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                        <p className="m-0">
                            A differential turret driven by gimbal motors, controlled by
                            an <strong className="text-fg font-semibold">ESP32</strong> running{' '}
                            <em className="text-fg-muted italic">SimpleFOC</em>. A Qt
                            desktop app connects over Bluetooth, currently handles
                            enable/disable and manual turret movement, with PID tuning
                            and settings management coming next.
                        </p>
                        <p className="m-0">
                            The coilgun sits on top as the actuator: a programmable
                            electromagnetic linear actuator with variable output energy.
                        </p>
                    </div>
                </Section>

                <Section num="02" id="s02" title="Coilgun design">
                    <div className="flex items-center gap-2 mb-4">
                        <StatusPill tone="warn">Planning, not built</StatusPill>
                    </div>
                    <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                        <p className="m-0">
                            Three- or five-stage coilgun. Projectile is a steel ball
                            bearing. The power supply is a programmable voltage
                            converter running 25-200&nbsp;V, varying output voltage is
                            the mechanism for controlling muzzle energy.
                        </p>
                        <p className="m-0">
                            Electronic components are mostly specified. Still in
                            planning; no build started yet.
                        </p>
                    </div>
                </Section>

                <Section num="03" id="s03" title="Control system">
                    <div className="flex items-center gap-2 mb-4">
                        <StatusPill tone="bad">Blocked, encoders</StatusPill>
                    </div>
                    <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                        <p className="m-0">
                            Absolute encoders feeding a PID heading controller. Current
                            blocker: getting the encoders to register reliably. Once
                            that is resolved, the plan is a more complex control loop
                            beyond basic PID. Gimbal motors were chosen for their torque
                            characteristics at low speed.
                        </p>
                    </div>
                </Section>

                <Section num="04" id="s04" title="Qt app">
                    <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                        <p className="m-0">
                            Windows desktop app. Connects to the ESP32 over Bluetooth.
                            Current features: enable/disable subsystems, manual turret
                            movement. In progress: PID tuning interface, settings
                            management.
                        </p>
                    </div>
                </Section>
            </TOCLayout>
        </Page>
    );
}
