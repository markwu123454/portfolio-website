/**
 * Contact — /contact
 *
 * Server component. Quiet, editorial. Email-forward.
 *
 * Per DIRECTION §6: "Single column. Four links: email, GitHub, LinkedIn,
 * resume.pdf. Drop the heavy cyan card grid and animated headings.
 * Add response-time line."
 *
 * Layout:
 *   PageHeader  (kicker · title · dek)
 *   Primary slab: email + response time (the actual call to action)
 *   01 — Channels       (the four links, expanded with meta)
 *   02 — Logistics      (timezone, location, last updated, fingerprint)
 */

import type { ReactNode } from 'react';
import {
    Page,
    PageHeader,
    Section,
    Tag,
    Button,
} from '@/app/components/site/primitives';
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Contact — Mark Wu',
    description:
        'Email, GitHub, LinkedIn, resume. Open to internships and lab placements for Summer 2026.',
};

export default function ContactPage() {
    return (
        <Page>
            <PageHeader
                tag={['CONTACT', '2026', '#005']}
                title="Write any time."
                subtitle="Recruiters, professors, and other student."
                dek={
                    <>
                        Email is best. I read and reply within a day,
                        usually faster. No form to fill out, please just send
                        the message you want me to read.
                    </>
                }
                after={
                    <div className="flex flex-wrap gap-2.5">
                        <Tag variant="accent">Open · internships + labs</Tag>
                        <Tag variant="outline">Available — Summer 2026</Tag>
                    </div>
                }
            />

            <PrimarySlab />

            <Section num="01" title="Channels" kicker="WHERE TO REACH ME">
                <Channels />
            </Section>

            <Section num="02" title="Logistics" kicker="THE FINE PRINT">
                <Logistics />
            </Section>
        </Page>
    );
}

/* ═════════════════════════════════════════════════════════════════
   PRIMARY SLAB — email is the headline; everything else is below.
   Hairlines, no card. Size hierarchy does the work.
   ═════════════════════════════════════════════════════════════════ */

function PrimarySlab() {
    return (
        <section className="border-t border-b border-rule-strong py-10 my-2 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-8 items-end">
            <div>
                <div className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft mb-3">
                    Best — by a wide margin
                </div>
                <a
                    href="mailto:me@markwu.org?subject=Hello%20Mark"
                    className="
                        block no-underline text-fg
                        font-mono font-medium
                        text-[clamp(28px,4.4vw,44px)]
                        tracking-[-0.01em]
                        leading-[1.05]
                        hover:text-accent
                        transition-colors duration-150
                    "
                >
                    me@markwu.org
                </a>
                <p className="mt-4 mb-0 text-[14.5px] text-fg-muted leading-relaxed max-w-140">
                    I read every message. Typical reply{' '}
                    <span className="text-fg font-medium">under 24 hours</span>{' '}
                    on weekdays, longer during competition weekends.
                </p>
            </div>

            <div className="flex gap-2.5 flex-wrap">
                <Button
                    href="mailto:me@markwu.org?subject=Hello%20Mark"
                    variant="primary"
                    arrow
                    external
                >
                    Compose
                </Button>
                <Button href="/resume.pdf#view=FitV" variant="ghost" external>
                    Resume.pdf
                </Button>
            </div>
        </section>
    );
}

/* ═════════════════════════════════════════════════════════════════
   01 — CHANNELS
   Same row pattern as home, with one extra column: a mono meta
   field (handle, signature, repo count) so each row earns the row.
   ═════════════════════════════════════════════════════════════════ */

interface Channel {
    kicker: string;
    label: string;
    meta: string;
    href: string;
    glyph: '↗' | '↓';
    external: boolean;
}

const CHANNELS: Channel[] = [
    {
        kicker: 'Email',
        label: 'me@markwu.org',
        meta: 'usually < 24h',
        href: 'mailto:me@markwu.org',
        glyph: '↗',
        external: true,
    },
    {
        kicker: 'GitHub',
        label: 'github.com/markwu123454',
        meta: 'code · some CAD',
        href: 'https://github.com/markwu123454',
        glyph: '↗',
        external: true,
    },
    {
        kicker: 'LinkedIn',
        label: 'linkedin.com/in/mark-mai-wu',
        meta: 'work history · mutuals',
        href: 'https://linkedin.com/in/mark-mai-wu',
        glyph: '↗',
        external: true,
    },
    {
        kicker: 'GrabCAD',
        label: 'grabcad.com/mark.wu-20',
        meta: 'CAD',
        href: 'https://grabcad.com/mark.wu-20',
        glyph: '↗',
        external: true,
    },
    {
        kicker: 'MuseScore',
        label: 'musescore.com/user/50654162',
        meta: 'remixes · original compositions',
        href: 'https://musescore.com/user/50654162',
        glyph: '↗',
        external: true,
    },
    {
        kicker: 'Resume',
        label: 'resume.pdf',
        meta: 'one page · updated 2026.05',
        href: '/resume.pdf#view=FitV',
        glyph: '↓',
        external: true,
    },
];

function Channels() {
    return (
        <ul className="list-none m-0 p-0">
            {CHANNELS.map((c) => (
                <li key={c.kicker} className="border-t border-rule last:border-b">
                    <a
                        href={c.href}
                        target={c.external ? '_blank' : undefined}
                        rel={c.external ? 'noopener noreferrer' : undefined}
                        className="
                            grid grid-cols-[110px_minmax(0,1fr)_auto_24px]
                            gap-4 md:gap-6 py-4
                            text-fg no-underline items-baseline group
                        "
                    >
                        <span className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">
                            {c.kicker}
                        </span>
                        <span className="text-[16px] text-fg font-medium tracking-tight-1 group-hover:text-accent transition-colors duration-150 truncate">
                            {c.label}
                        </span>
                        <span className="hidden md:inline font-mono text-[11px] text-fg-soft tracking-mono whitespace-nowrap">
                            {c.meta}
                        </span>
                        <span
                            aria-hidden
                            className="font-mono text-accent text-sm text-right"
                        >
                            {c.glyph}
                        </span>
                    </a>
                </li>
            ))}
        </ul>
    );
}

/* ═════════════════════════════════════════════════════════════════
   02 — LOGISTICS
   Mono key/value strip. The kind of thing a careful sender wants to
   know (timezone, identity proof) and nobody else has to read.
   ═════════════════════════════════════════════════════════════════ */

function Logistics() {
    const ROWS: Array<[string, ReactNode]> = [
        ['Timezone',    'America/Los_Angeles · UTC−7 (PDT)'],
        ['Based',       'Merced, CA'],
        ['Reply window','Weekdays · usually < 24h'],
        ['Languages',   'English · Mandarin'],
        ['Last updated','2026.06.09'],
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-12 items-start">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 m-0">
                {ROWS.map(([k, v]) => (
                    <div
                        key={k}
                        className="grid grid-cols-[120px_minmax(0,1fr)] gap-4 py-3 border-t border-rule items-baseline"
                    >
                        <dt className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">
                            {k}
                        </dt>
                        <dd className="m-0 text-[14.5px] text-fg">{v}</dd>
                    </div>
                ))}
            </dl>

            <Provenance />
        </div>
    );
}

/* A small "is this really Mark" panel. Helps with cold outreach where
   the receiver wants confidence the address isn't spoofed. Sized as a
   sibling to the dl, mono only, no visual weight. */
function Provenance() {
    return (
        <aside className="border border-rule rounded-md p-4 bg-bg-elev w-full md:w-70 font-mono text-[11px] leading-relaxed">
            <div className="flex justify-between items-baseline pb-2 mb-2 border-b border-rule text-fg-soft tracking-kicker uppercase text-[10px]">
                <span>Identity</span>
                <span>verified channels</span>
            </div>
            <ul className="m-0 p-0 list-none grid gap-1.5 text-fg-muted">
                <li>
                    <span className="text-fg-soft">site →</span>{' '}
                    <span className="text-fg">markwu.org</span>
                </li>
                <li>
                    <span className="text-fg-soft">git →</span>{' '}
                    <span className="text-fg">markwu123454</span>
                </li>
                <li>
                    <span className="text-fg-soft">in →</span>{' '}
                    <span className="text-fg">mark-mai-wu</span>
                </li>
            </ul>
            <p className="mt-3 mb-0 text-fg-soft text-[10.5px] leading-snug">
                Anyone claiming to be me from a different address, it
                isn&rsquo;t. Cross-check here.
            </p>
        </aside>
    );
}