/**
 * UI Collection — /experiments/ui-collection
 *
 * Interface details found in the wild, each running live with credit to
 * where it shipped. To add one: drop its code in a folder here, give it a
 * client demo component that renders a <Stage>, and add it to SPECIMENS.
 *
 * Server component; the demos are client components.
 */

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Page, PageHeader } from '@/app/components/site/primitives';
import { AsciiLogoDemo } from './ascii-logo/ascii-logo-demo';
import { LandingTextureDemo } from './landing-texture/landing-texture-demo';
import { ParticleFieldDemo } from './particle-field/particle-field-demo';
import { ParticleRingDemo } from './particle-ring/particle-ring-demo';

export const metadata: Metadata = {
    title: 'UI Collection',
    description: 'Interface details found in the wild, each running live with credit to where it shipped.',
};

interface Specimen {
    id: string;
    title: string;
    /** Short mono label for what kind of thing it is. */
    kind: string;
    source: { name: string; where: string; href: string };
    about: ReactNode;
    builtWith: string;
    tryIt: string;
    note?: string;
    demo: ReactNode;
}

const SPECIMENS: Specimen[] = [
    {
        id: 'ascii-logo',
        title: 'Rotating ASCII Logo',
        kind: 'Web component',
        source: {
            name: 'UC Merced Robotics Society',
            where: 'home page',
            href: 'https://robotics-society-ucmerced.angelavargas0831.workers.dev/',
        },
        about: (
            <>
                The club&apos;s logo, turned into a solid you can spin. The image is sampled at 190×190: blue pixels
                become the gear, gold pixels the letters, and both are extruded into a point cloud with side walls.
                Every frame the points are rotated, z-buffered into a character grid and Lambert-shaded onto a
                character ramp. The gear and letters are two stacked <code>&lt;pre&gt;</code> layers so each keeps
                its own colour. It draws in with a scanline the first time it scrolls into view.
            </>
        ),
        builtWith: 'Custom element · two <pre> layers · no canvas',
        tryIt: 'Drag to orbit · click to spin the gear · hover to scramble or repel',
        note: 'Recovered from the site bundle and de-minified; logic unchanged.',
        demo: <AsciiLogoDemo />,
    },
    {
        id: 'landing-texture',
        title: 'Wind Texture',
        kind: 'WebGL2 shader',
        source: {
            name: 'Claude Code desktop',
            where: 'new-session background',
            href: 'https://claude.com/claude-code',
        },
        about: (
            <>
                A field of monospace characters that gusts of wind pass over. One shader works out the wind on a
                coarse grid (layered gradient noise, a slowly bending path, eddies that drag each gust&apos;s
                outline), and a second draws one quad per character cell from a glyph atlas, lit where the gust
                is. Strokes facing into the wind catch more light, so a still frame still shows which way it
                blows. A click sends out a ripple that shoves the air outward; every third one is a heart.
            </>
        ),
        builtWith: 'WebGL2 · wind pass + glyph pass · ~25 fps',
        tryIt: 'Click for a ripple · sweep the pointer across to warm the air',
        note: 'Shaders and tuning copied from the app. The middle isn\'t dimmed here, since there\'s no prompt box over it. It settles after three idle minutes and backs off if the GPU falls behind.',
        demo: <LandingTextureDemo />,
    },
    {
        id: 'particle-ring',
        title: 'Particle Ring',
        kind: 'Canvas 2D',
        source: {
            name: 'Google Antigravity',
            where: 'hero section',
            href: 'https://antigravity.google/',
        },
        about: (
            <>
                A jittered grid of faint grey specks with a ring moving through it. Inside the ring&apos;s band the
                specks are pushed outward and redrawn as short radial dashes, longer and more opaque toward the
                middle of the band. The radius wobbles with three sine harmonics per angle, so the ring never reads
                as a drawn circle, and the colour runs blue through violet, pink, red and orange to yellow and back,
                slowly turning. It eases toward the pointer and drifts on its own once you stop.
            </>
        ),
        builtWith: 'Canvas 2D · one fillRect or stroke per particle',
        tryIt: 'Move the pointer over it · leave it still to watch it wander',
        note: 'Originally full-window; here it sizes to the stage and follows the pointer only inside it.',
        demo: <ParticleRingDemo />,
    },
    {
        id: 'particle-field',
        title: 'Particle Field',
        kind: 'WebGL · three.js',
        source: {
            name: 'Google Antigravity',
            where: 'closing section, above the footer',
            href: 'https://antigravity.google/',
        },
        about: (
            <>
                A second ring from the same site, built as a GPU particle sim. Several thousand points, spread by Poisson-disk sampling,
                live in a float texture. Each frame one shader pass moves every point with layered simplex noise
                and a ring band that swells the points near it and pulls them toward its centre; the results
                ping-pong between two render targets. A second pass draws each point as a small rounded bar turned
                to face the ring, coloured by slow noise across a three-colour gradient.
            </>
        ),
        builtWith: 'three.js · float render targets · two shader passes',
        tryIt: 'Move the pointer over it · switch the theme',
        note: 'Originally full-window; here it sizes to the stage and follows the pointer only inside it.',
        demo: <ParticleFieldDemo />,
    },
];

export default function UiCollectionPage() {
    return (
        <Page>
            <PageHeader
                tag={['EXPERIMENT', 'UI COLLECTION', `${SPECIMENS.length} SPECIMENS`]}
                title="UI Collection —"
                subtitle="things I found and kept."
                dek="Interface details from around the web, each running live here with credit to where it shipped."
                after={<SpecimenIndex />}
            />

            {SPECIMENS.map((s, i) => (
                <SpecimenBlock key={s.id} num={String(i + 1).padStart(2, '0')} specimen={s} />
            ))}
        </Page>
    );
}

function SpecimenIndex() {
    return (
        <nav aria-label="Specimens" className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[12px]">
            {SPECIMENS.map((s, i) => (
                <a key={s.id} href={`#${s.id}`} className="text-fg-muted hover:text-accent">
                    <span className="text-fg-soft mr-2">{String(i + 1).padStart(2, '0')}</span>
                    {s.title}
                </a>
            ))}
        </nav>
    );
}

function SpecimenBlock({ num, specimen: s }: { num: string; specimen: Specimen }) {
    return (
        <section id={s.id} className="scroll-mt-20 mb-24">
            <header className="flex items-baseline justify-between gap-4 pb-3 mb-5 border-b border-rule">
                <div className="flex items-baseline gap-3 font-mono text-[12px] tracking-kicker uppercase">
                    <span className="text-fg-soft">{num}</span>
                    <span className="text-accent">{s.kind}</span>
                </div>
                <a
                    href={s.source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] text-fg-muted hover:text-accent truncate"
                >
                    via {s.source.name} ↗
                </a>
            </header>

            {s.demo}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px] gap-x-12 gap-y-8">
                <div>
                    <h2 className="m-0 mb-3 text-[24px] font-semibold tracking-tight-2">{s.title}</h2>
                    <p className="m-0 text-[15px] leading-[1.7] text-fg-muted max-w-measure [&_code]:font-mono [&_code]:text-[13px] [&_code]:text-fg">
                        {s.about}
                    </p>
                </div>
                <dl className="m-0 grid grid-cols-[88px_minmax(0,1fr)] gap-x-4 gap-y-3 text-[13px] leading-snug content-start">
                    <Term>Found on</Term>
                    <dd className="m-0">
                        <a href={s.source.href} target="_blank" rel="noopener noreferrer">
                            {s.source.name}
                        </a>
                        <span className="text-fg-muted">, {s.source.where}</span>
                    </dd>
                    <Term>Built with</Term>
                    <dd className="m-0 text-fg-muted">{s.builtWith}</dd>
                    <Term>Try</Term>
                    <dd className="m-0 text-fg-muted">{s.tryIt}</dd>
                    {s.note && (
                        <>
                            <Term>Note</Term>
                            <dd className="m-0 text-fg-soft">{s.note}</dd>
                        </>
                    )}
                </dl>
            </div>
        </section>
    );
}

function Term({ children }: { children: ReactNode }) {
    return <dt className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft pt-[3px]">{children}</dt>;
}
