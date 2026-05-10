/**
 * Music — /music
 *
 * Server component. Composition study, served on the warm-paper
 * "manuscript" palette via data-theme="manuscript" on the outer
 * wrapper. tokens.css sets serif font + claret accent on this theme.
 *
 * Three sections (A, B, C) instead of the usual numbered ones — feels
 * more like a programme note than an engineering doc.
 *
 * NOTE: tokens.css comment says manuscript stays light "because the
 * MuseScore embed only renders cleanly on a light background." If you
 * want to enforce that even for users with prefers-color-scheme dark,
 * pin it with data-color-scheme="light" alongside data-theme.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';

export const metadata = {
    title: 'Music — composition study no. 2',
    description: 'A walkthrough of Music for Three Musicians.',
};

export default function MusicPage() {
    return (
        <div data-theme="manuscript" data-color-scheme="light">
            <main className="max-w-[860px] mx-auto px-8 pb-24">
                <Header />

                <div className="font-mono text-[11px] tracking-kicker uppercase text-accent mt-12 mb-6">
                    MANUSCRIPT · OP. 02 · #007
                </div>

                <h1 className="m-0 font-serif font-medium text-[clamp(36px,5vw,56px)] leading-[1.1] tracking-[-0.01em] max-w-[760px]">
                    Notes from the practice room —{' '}
                    <span className="italic">composition study no. 2.</span>
                </h1>

                <p className="mt-8 mb-10 font-serif text-[17px] leading-[1.65] text-fg-muted max-w-[640px]">
                    A walkthrough of <em>Music for Three Musicians</em>, with a long
                    aside on the eighth-note phase shift in mvt. III. Written 2026.03
                    for myself; cleaned up here.
                </p>

                <FactGrid />

                <hr className="border-0 border-t border-rule-strong my-12" />

                <Movement letter="A" title="On the phase shift">
                    <Dropcap>T</Dropcap>he eighth-note phase shift is a familiar
                    Reichian device — two voices drift out of alignment by a single
                    subdivision and the listener experiences the rhythmic frame
                    collapsing and reforming. Here it carries an additional weight
                    because the voices share a pitch class until the shift; the
                    texture is harmonically static and rhythmically active, and the
                    displacement is the only thing that <em>moves</em>.

                    <Pullquote
                        attribution="Reich, 1968 — paraphrased"
                    >
                        What happens to two identical patterns slowly going out of
                        phase with each other? The pattern stays the same; the
                        relationship is the music.
                    </Pullquote>

                    <p className="mt-6">
                        What I take from this for my own writing: rhythmic identity
                        can carry harmonic intent. You don’t always need a chord
                        change to imply movement.
                    </p>
                </Movement>

                <Movement letter="B" title="Score excerpt — mvt. III, mm. 24-32">
                    {/* MuseScore embed will live here. Placeholder paper-toned panel. */}
                    <div
                        className="my-8 bg-bg-elev border border-rule rounded-md flex items-center justify-center"
                        style={{ aspectRatio: '16/7' }}
                    >
                        <span className="font-mono text-[11px] text-fg-soft">
                            [ MuseScore embed — mvt. III, mm. 24-32 ]
                        </span>
                    </div>
                    <p className="font-mono text-[11px] tracking-mono text-fg-soft">
                        Fig. B.1 — Vibraphone (top stave) and piano (lower two
                        staves) at the moment of the shift.
                    </p>
                </Movement>

                <Movement letter="C" title="What I’m trying next">
                    <ol className="list-none m-0 p-0">
                        {[
                            'Open my own piece (op. 02) with a phase shift instead of building to one.',
                            'Use cello to interrupt the cycle rather than join it.',
                            'Resolve into rhythmic unison rather than out of it.',
                        ].map((t, i) => (
                            <li
                                key={i}
                                className="grid grid-cols-[36px_minmax(0,1fr)] gap-3 py-3 border-t border-rule items-baseline font-serif text-[16px]"
                            >
                                <span className="font-mono text-[11px] text-fg-soft tracking-mono">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <span>{t}</span>
                            </li>
                        ))}
                    </ol>
                </Movement>
            </main>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────────────────────────── */

/**
 * The site-wide Header in the layout uses the dark/light palette;
 * on the manuscript page we want a header rendered in the manuscript
 * palette. Easiest: hide the layout header at /music with a small
 * CSS rule, or just visually accept it. For now we let the layout
 * Header show through — tokens.css's serif font kicks in for the
 * .notebook root only when data-theme="manuscript" is on .notebook,
 * which it isn't here. If that bothers you, lift the data-theme up
 * to <body> or to <html> via a route group.
 */
function Header() {
    /* Intentionally empty — site Header comes from layout.tsx. */
    return null;
}

function FactGrid() {
    const facts: Array<[string, ReactNode]> = [
        ['Key', 'C major, modulating to A minor'],
        ['Form', 'Three movements, ~16 minutes'],
        ['Tempo', '♩ = 92'],
        ['Scoring', 'vibraphone · piano · cello'],
    ];
    return (
        <dl className="grid grid-cols-2 gap-x-12 gap-y-4 border-t border-b border-rule py-6 font-serif text-[15px]">
            {facts.map(([k, v]) => (
                <div key={k}>
                    <dt className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft mb-1">
                        {k}
                    </dt>
                    <dd className="m-0 text-fg">{v}</dd>
                </div>
            ))}
        </dl>
    );
}

function Movement({
                      letter,
                      title,
                      children,
                  }: {
    letter: string;
    title: string;
    children: ReactNode;
}) {
    return (
        <section className="mt-14">
            <header className="flex items-baseline gap-3 pb-3 mb-6 border-b border-rule">
                <span
                    aria-hidden
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-accent text-accent font-mono text-[11px] shrink-0"
                >
                    {letter}
                </span>
                <h2 className="m-0 font-serif font-medium text-[24px] tracking-[-0.005em]">
                    {title}
                </h2>
            </header>
            <div className="font-serif text-[17px] leading-[1.7] text-fg max-w-[680px]">
                {children}
            </div>
        </section>
    );
}

function Dropcap({ children }: { children: ReactNode }) {
    return (
        <span
            aria-hidden
            className="float-left font-serif italic text-[68px] leading-[0.85] mr-2 mt-1 text-fg"
        >
            {children}
        </span>
    );
}

function Pullquote({
                       children,
                       attribution,
                   }: {
    children: ReactNode;
    attribution: string;
}) {
    return (
        <blockquote className="my-8 pl-6 border-l-2 border-accent font-serif italic text-[19px] leading-[1.55] text-fg">
            {children}
            <footer className="mt-3 not-italic font-mono text-[11px] tracking-mono text-fg-soft">
                — {attribution}
            </footer>
        </blockquote>
    );
}