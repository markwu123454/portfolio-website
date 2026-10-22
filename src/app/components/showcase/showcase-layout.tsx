/**
 * The one layout for every showcase page. Top to bottom:
 *   header + stats → featured tile → media wall → contact
 * Built to be scanned in about 15 seconds: media carries the page, and
 * each tile gets a title and a one-line caption overlaid on it.
 */

import Link from 'next/link';
import { Button, Page, PageHeader, StatStrip } from '@/app/components/site/primitives';
import type { Showcase, ShowcaseTile } from '@/content/showcase/types';

const CONTACT_EMAIL = 'me@markwu.org';

export function ShowcaseLayout({ showcase: s }: { showcase: Showcase }) {
    return (
        <Page>
            <PageHeader
                tag={['SHOWCASE', s.topic.toUpperCase(), s.num]}
                title={s.title}
                subtitle={s.subtitle}
                after={<StatStrip items={s.stats} />}
            />

            <div className="relative aspect-[4/3] md:aspect-video overflow-hidden rounded border border-rule bg-bg-elev">
                {s.feature.media}
                <Overlay tile={s.feature} large />
            </div>

            {/* Mobile: one column of 4:3 tiles. Desktop: three columns on fixed
                rows, so wide and tall tiles line up with the rest. */}
            <ul className="list-none m-0 mt-3 p-0 grid grid-cols-1 gap-3 md:grid-cols-3 md:auto-rows-[240px] md:grid-flow-dense">
                {s.tiles.map((t) => (
                    <li
                        key={t.title}
                        className={`relative overflow-hidden rounded border border-rule bg-bg-elev aspect-[4/3] md:aspect-auto ${
                            t.span === 'wide' ? 'md:col-span-2' : t.span === 'tall' ? 'md:row-span-2' : ''
                        }`}
                    >
                        {t.media}
                        <Overlay tile={t} />
                    </li>
                ))}
            </ul>

            <div className="mt-12 pt-6 border-t border-rule flex items-center justify-between gap-4 flex-wrap">
                <span className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">Contact</span>
                <div className="flex gap-3 flex-wrap">
                    <Button href="/resume.pdf#view=FitV" variant="primary" arrow external>
                        Resume.pdf
                    </Button>
                    <Button href={`mailto:${CONTACT_EMAIL}`} variant="ghost" external>
                        {CONTACT_EMAIL}
                    </Button>
                </div>
            </div>
        </Page>
    );
}

/** Title and caption on a dark gradient along the bottom edge. The whole tile is the link. */
function Overlay({ tile: t, large }: { tile: ShowcaseTile; large?: boolean }) {
    const className = `absolute inset-0 flex flex-col justify-end text-white no-underline group
        bg-linear-to-t from-black/80 via-black/15 via-40% to-transparent
        ${large ? 'p-5 md:p-7' : 'p-3.5'}`;
    const inner = (
        <>
            <span className={`font-semibold tracking-tight-1 ${large ? 'text-[20px] md:text-[26px]' : 'text-[15px]'}`}>
                {t.title}
                {t.href && (
                    <span aria-hidden className="font-mono text-sm ml-2 opacity-70 group-hover:opacity-100">
                        ↗
                    </span>
                )}
            </span>
            <span className={`mt-0.5 text-white/80 leading-snug ${large ? 'text-[14px] md:text-[15px]' : 'text-[12.5px]'}`}>
                {t.caption}
            </span>
        </>
    );

    if (!t.href) return <div className={className}>{inner}</div>;
    if (t.external) {
        return (
            <a href={t.href} target="_blank" rel="noopener noreferrer" className={className}>
                {inner}
            </a>
        );
    }
    return (
        <Link href={t.href} className={className}>
            {inner}
        </Link>
    );
}
