/**
 * Caelifer — /work/caelifer
 *
 * Content is from Mark directly (Aug 2026 interview). Do not invent
 * rationale here. If a "why" isn't in that account, leave it out.
 *
 * Claim discipline (see claims reference):
 *   • 180A peak, never 200A.
 *   • Weight ~1.5kg is ESTIMATED, not measured.
 *   • No measured thrust. No hover test. Flow Sim was a qualitative
 *     geometry check, not a source of validated drag numbers.
 */

import Image from 'next/image';
import type { Metadata } from 'next';
import {
    Page,
    PageHeader,
    Section,
    Crumbs,
    StatStrip,
    ArrowLink,
    Figure,
} from '@/app/components/site/primitives';

export const metadata: Metadata = {
    title: 'Caelifer',
    description:
        'Coaxial contra-rotating EDF VTOL. An optimisation target, cruise efficiency, against three constraints: hover capable, tube launchable, no exposed propellers.',
};

export default function CaeliferPage() {
    return (
        <Page>
            <Crumbs
                items={[
                    { href: '/work', label: 'Work' },
                    { href: '/work?domain=Drones', label: 'Drones' },
                    { label: 'Caelifer' },
                ]}
            />

            <PageHeader
                tag={['PROJECT', 'DRONES', '2026 —']}
                title="Caelifer"
                subtitle="a target, three constraints, and whatever they force."
                dek="Another one out of my idea list. Unconventional airframes are what I end up thinking about, and what I like to do is pick something to optimise for and a set of limitations, and the less conventional the combination is the better."
            />

            <StatStrip
                items={[
                    { label: 'Airframe', value: '100mm finless tube' },
                    { label: 'Propulsion', value: '70mm coaxial EDF pair · 6S' },
                    { label: 'Peak draw', value: '180A · ~4.0kW' },
                    { label: 'Stage', value: 'Bench · paused' },
                ]}
            />

            <Section num="01" title="The brief I set myself">
                <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                    <p className="m-0">
                        For planes, I like to find an optimisation target and a set of
                        limitations, and the less conventional the combination is the
                        better. For this one:
                    </p>
                </div>

                <dl className="m-0 mt-2 mb-6">
                    {(
                        [
                            ['Optimise for', 'Cruise efficiency'],
                            ['Constraint 01', 'Must be hover capable'],
                            ['Constraint 02', 'Must be tube launchable']
                        ] as Array<[string, string]>
                    ).map(([k, v]) => (
                        <div
                            key={k}
                            className="grid grid-cols-[130px_minmax(0,1fr)] gap-4 py-3 border-t border-rule items-baseline"
                        >
                            <dt className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">
                                {k}
                            </dt>
                            <dd className="m-0 text-[14.5px] text-fg">{v}</dd>
                        </div>
                    ))}
                </dl>

                <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                    <p className="m-0">
                        What I landed on is a hollow tube with two contra rotating EDFs and
                        internal fins on the exhaust. Contra rotating so the pair cancel each
                        other&#39;s torque and swirl, and the fins are internal because
                        external fins don&#39;t do much when you&#39;re hovering anyway, and
                        it still needs control authority in hover, so that has to come off
                        the exhaust.
                    </p>
                    <p className="m-0">
                        The airframe is fully modelled in SolidWorks. I ran Flow Simulation
                        across it as a qualitative check for geometry that would obviously
                        spike drag. A 3D printed shell has layer lines and imperfections
                        that would make precise numbers meaningless anyway. No validated drag
                        figures came out of it, and none are claimed.
                    </p>
                </div>

                <Figure
                    caption={
                        <>
                            <span className="text-fg-muted">Fig. 1.1: </span> Full airframe,
                            transparent render.
                        </>
                    }
                >
                    <div className="bg-bg-elev border border-rule overflow-hidden max-w-100 mx-auto">
                        <Image
                            src="/caelifer/cad-transparent.png"
                            width={671}
                            height={1040}
                            alt="Caelifer airframe CAD, transparent render showing the internal contra-rotating EDF pair and exhaust fins."
                            sizes="(max-width: 720px) 100vw, 400px"
                            className="w-full h-auto block"
                        />
                    </div>
                </Figure>

                <Figure
                    caption={
                        <>
                            <span className="text-fg-muted">Fig. 1.2: </span> Flow Simulation
                            over the airframe.
                        </>
                    }
                >
                    <div className="bg-bg-elev border border-rule overflow-hidden max-w-100 mx-auto">
                        <Image
                            src="/caelifer/flow-sim.png"
                            width={1017}
                            height={1104}
                            alt="SolidWorks Flow Simulation airflow visualization over the Caelifer airframe, qualitative only."
                            sizes="(max-width: 720px) 100vw, 400px"
                            className="w-full h-auto block"
                        />
                    </div>
                </Figure>
            </Section>

            <Section num="02" title="Where it actually stands">
                <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                    <p className="m-0">
                        Propulsion and avionics are on the bench. The EDF pair pulls{' '}
                        <strong className="text-fg font-semibold">180A</strong> peak off a 6S
                        pack, roughly 4.0kW. The flight controller is a Pixhawk 6C running
                        ArduCopter, flashed and configured with my own{' '}
                        <ArrowLink href="/work/aetherius-gcs">ground station</ArrowLink>.
                    </p>
                    <p className="m-0">
                        It&#39;s paused because I like the other two more at the moment, so
                        I&#39;ve been doing those instead.{' '}
                        <ArrowLink href="/work/aetherius">Aetherius</ArrowLink> and{' '}
                        <ArrowLink href="/work/sprocketstats">SprocketStats</ArrowLink> are
                        both moving faster and approaching milestones, and university is
                        starting with a lot of coursework and a potential lab lined up.
                    </p>
                </div>
            </Section>
        </Page>
    );
}
