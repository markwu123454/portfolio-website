/**
 * Crowd Flow — /work/crowd-flow
 *
 * Content is from Mark directly (Aug 2026). Do not invent rationale here.
 * If a "why" isn't in that account, leave it out.
 *
 * Voice: no em dashes in prose. Short declaratives, joined with "so" and
 * "which is why". Plain, not writerly.
 *
 * Claim discipline:
 *   • Godot is named as the engine this was built in, never as a skill.
 *   • ~2,000 agents at 60fps at 2x is on his workstation and he considers
 *     it barely acceptable. Never present it as a benchmark or a win.
 *   • He stopped for two stated reasons: he didn't think he could build a
 *     game he'd enjoy, and performance. Say both.
 *   • Source papers are "one from 2001, one from 2011". He doesn't recall
 *     which. Do not guess at titles or authors.
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
    title: 'Crowd Flow',
    description:
        'A crowd simulation prototype built in Godot from an idea in my notes. Faithful implementations of two crowd dynamics papers, then moved onto the GPU. Shelved.',
};

const REPO = 'https://github.com/markwu123454/CrowdFlow';

const IMG = {
    egress: { src: '/crowd-flow/egress.png', w: 2559, h: 1599 },
    draft: { src: '/crowd-flow/early-cpu-draft.png', w: 969, h: 1089 },
} as const;

export default function CrowdFlowPage() {
    return (
        <Page>
            <Crumbs
                items={[
                    { href: '/work', label: 'Work' },
                    { href: '/work?domain=Software', label: 'Software' },
                    { label: 'Crowd Flow' },
                ]}
            />

            <PageHeader
                tag={['PROJECT', 'SOFTWARE', '2026']}
                title="Crowd Flow"
                subtitle="an idea I wrote down and then actually built."
                dek="A crowd simulation prototype in Godot, built on faithful implementations of two crowd dynamics papers and then moved onto the GPU. I've stopped working on it, but it runs and I still think it's cool."
                after={
                    <div className="flex gap-3 flex-wrap">
                        <Button href={REPO} variant="primary" arrow external>
                            Source on GitHub
                        </Button>
                    </div>
                }
            />

            <StatStrip
                items={[
                    { label: 'Engine', value: 'Godot' },
                    { label: 'Model', value: 'Two published papers, 2001 + 2011' },
                    { label: 'Scale', value: '~2,000 agents at 60fps, 2× speed' },
                    { label: 'Status', value: 'Shelved' },
                ]}
            />

            <Section num="01" title="Where it came from">
                <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                    <p className="m-0">
                        A few years ago I started a habit of collecting ideas, since I
                        noticed I daydream a lot and go into rabbit holes about stuff, so I
                        started writing them down.
                    </p>
                    <p className="m-0">
                        This one came from watching a video about a crowd crush tragedy,
                        where I had the idea of what if it was made into a game, fictional and
                        counterfactual of course, so I wrote it down. Later during summer
                        break when I had time I was revisiting them, and I thought it had
                        potential, so I started writing the algorithm in Python.
                    </p>
                </div>
            </Section>

            <Section num="02" title="Accuracy, then speed">
                <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                    <p className="m-0">
                        To keep accuracy I decided to fully implement two papers studying
                        crowd dynamics, one from 2001 and one from 2011, and faithfully
                        implement the algorithm, which is why it ran so slowly at first, at
                        around a thousand agents at thirteen frames a second.
                    </p>
                    <p className="m-0">
                        Later I decided to use Godot, since it&#39;s similar to Python and
                        has a smaller learning curve than Unity or Unreal. The GPU is mostly
                        the individual agent calculations and the field calculations, and with
                        that it gets to around two thousand agents at 60fps running at 2×
                        speed on my workstation.
                    </p>
                </div>

                <Figure
                    caption={
                        <>
                            <span className="text-fg-muted">Fig. 2.1 —</span> The first
                            version, CPU only. 1,000 agents at 13fps with the density heatmap
                            on, peaking at 15.2 people/m² in the corner.
                        </>
                    }
                >
                    <div className="bg-bg-elev border border-rule overflow-hidden max-w-100 mx-auto">
                        <Image
                            src={IMG.draft.src}
                            width={IMG.draft.w}
                            height={IMG.draft.h}
                            alt="Early CPU only crowd simulation window: coloured agent dots over a dark field with a red density heatmap, readouts showing 1000 agents and 13 fps."
                            sizes="(max-width: 720px) 100vw, 400px"
                            className="w-full h-auto block"
                        />
                    </div>
                </Figure>
            </Section>

            <Section num="03" title="The game part">
                <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                    <p className="m-0">
                        For a while I struggled with the game dev part, since I didn&#39;t
                        want it to feel like a cheap game, so I had to think about how real
                        life limitations and relations could be translated into game mechanics.
                        That&#39;s where the venue capacity, the schedule running from doors to
                        curfew, and the areas with no camera coverage come from.
                    </p>
                    <p className="m-0">
                        It&#39;s also one of the reasons I lost interest, because I
                        don&#39;t think I can build a game that I would enjoy.
                    </p>
                </div>

                <Figure
                    caption={
                        <>
                            <span className="text-fg-muted">Fig. 3.1 —</span> Egress at 18:45,
                            2,362 of 3,600 still on site and draining through four exits.
                        </>
                    }
                >
                    <div className="bg-bg-elev border border-rule overflow-hidden">
                        <Image
                            src={IMG.egress.src}
                            width={IMG.egress.w}
                            height={IMG.egress.h}
                            alt="Top down plaza view with thousands of green agent dots streaming toward four labelled exits, an occupancy readout of 2,362 of 3,600, and a phase timeline along the bottom."
                            sizes="(max-width: 880px) 100vw, 1080px"
                            className="w-full h-auto block"
                            priority
                        />
                    </div>
                </Figure>
            </Section>

            <Section num="04" title="Why I stopped">
                <div className="max-w-160 text-[15.5px] leading-[1.7] text-fg-muted grid gap-4">
                    <p className="m-0">
                        The other reason is performance, where after about two weeks of
                        trying optimisations I could barely get acceptable performance on my
                        workstation, so that two thousand agent figure is the ceiling I got to
                        rather than a benchmark.
                    </p>
                    <p className="m-0">
                        It also hasn&#39;t been validated against real measurements. It
                        implements published models faithfully, but nobody has checked it
                        against a real crowd.
                    </p>
                    <p className="m-0">
                        What&#39;s there runs without bugs. Most of it is unfinished, and I&#39;m
                        not going to write up how to run it, so the source is there to read
                        rather than to install.
                    </p>
                </div>

                <div className="mt-6 flex gap-3 flex-wrap">
                    <Button href={REPO} variant="ghost" arrow external>
                        github.com/markwu123454/CrowdFlow
                    </Button>
                </div>
            </Section>
        </Page>
    );
}
