/**
 * Contact — /contact
 *
 * Server component. Quiet, editorial. Email-forward.
 *
 * Everything below is inlined directly into ContactPage's return, in
 * layout order — nothing here is used more than once. Page/PageHeader/
 * Section/Tag/Button are shared primitives imported from the site
 * component library.
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
        'Email, GitHub, LinkedIn, resume. Open to research labs and internships for Summer 2027.',
};

export default function ContactPage() {
    return (
        <Page>
            <PageHeader
                tag={['CONTACT', '2026', '#005']}
                title="Write any time,"
                subtitle="anyone."
                dek={
                    <>
                        I prefer email, please don't use LinkedIn or phone number since I don't check them.
                    </>
                }
                after={
                    <div className="flex flex-wrap gap-2.5">
                        <Tag variant="accent">Open · internships + labs</Tag>
                        <Tag variant="outline">Available — Summer 2027</Tag>
                    </div>
                }
            />

            {/* ─ Primary slab — email is the headline; everything else
                is below. Hairlines, no card. Size hierarchy does the work. ─ */}
            <section className="border-t border-b border-rule-strong py-10 my-2 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-8 items-end">
                <div>
                    <div className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft mb-3">
                        Best way of contact:
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

            <Section num="01" title="Websites" kicker="MY ONLINE PRESENCE">
                <ul className="list-none m-0 p-0">
                    {(
                        [
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
                        ] as Array<{
                            kicker: string;
                            label: string;
                            meta: string;
                            href: string;
                            glyph: '↗' | '↓';
                            external: boolean;
                        }>
                    ).map((c) => (
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
            </Section>

            <Section num="02" title="Channels" kicker="WHERE TO REACH ME">
                <ul className="list-none m-0 p-0">
                    {(
                        [
                            {
                                kicker: 'Professional Email',
                                label: 'me@markwu.org',
                                meta: 'work related',
                                href: 'mailto:me@markwu.org',
                                glyph: '↗',
                                external: true,
                            },
                            {
                                kicker: 'Personal Email',
                                label: 'mark.wu123454@gmail.com',
                                meta: 'everything else',
                                href: 'mailto:mark.wu123454@gmail.com',
                                glyph: '↗',
                                external: true,
                            },
                            {
                                kicker: 'Resume',
                                label: 'resume.pdf',
                                meta: 'one page · updated 2026.08',
                                href: '/resume.pdf#view=FitV',
                                glyph: '↓',
                                external: true,
                            },
                        ] as Array<{
                            kicker: string;
                            label: string;
                            meta: string;
                            href: string;
                            glyph: '↗' | '↓';
                            external: boolean;
                        }>
                    ).map((c) => (
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
            </Section>

            {/* ─ 03 — Logistics — mono key/value strip: the kind of thing
                a careful sender wants to know, nobody else has to read. ─ */}
            <Section num="03" title="Logistics" kicker="THE FINE PRINT">
                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-12 items-start">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 m-0">
                        {(
                            [
                                ['Timezone', 'America/Los_Angeles · UTC−7 (PDT)'],
                                ['Based', 'Merced, CA'],
                                ['Languages', 'English · Mandarin'],
                                ['Last updated', '2026.08.20'],
                            ] as Array<[string, ReactNode]>
                        ).map(([k, v]) => (
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
                </div>
            </Section>
        </Page>
    );
}
