/**
 * Sprocket — FRC CAD — /work/sprocket-frc
 *
 * Archive page. Shortest on the site by design. No sections, no
 * case-study prose. Just:
 *   - Crumbs
 *   - PageHeader with status + year in the tag, two-line lede
 *   - Two-row stat strip (the seasons)
 *   - Two figures (one per season)
 *   - Three external resource links
 *
 * Image paths are placeholders — drop real assets at the noted paths
 * and remove the `priority={false}` if you want the hero eager.
 */

import Image from 'next/image';
import {
    Page,
    PageHeader,
    Crumbs,
    StatStrip,
    Figure,
    ArrowLink,
    Tag,
} from '../../components/site/primitives';
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Sprocket — FRC CAD',
    description:
        'Two seasons of FRC CAD with Team 3473 Sprocket. Climb subsystem in 2025, full-bot ownership in 2026.',
};

export default function SprocketFrcPage() {
    return (
        <Page>
            <Crumbs
                items={[
                    { href: '/work', label: 'Work' },
                    { label: 'Sprocket — FRC CAD' },
                ]}
            />

            <PageHeader
                tag={['ARCHIVE', '2024–26', 'TEAM 3473']}
                title="Sprocket — FRC CAD."
                subtitle="Two seasons with Team 3473."
                dek={
                    <>
                        Climb subsystem in the 2025 Reefscape season, full-bot
                        ownership in the 2026 Rebuilt season.
                    </>
                }
                after={
                    <div className="flex flex-wrap gap-2.5">
                        <Tag variant="outline">Archive</Tag>
                        <Tag variant="outline">CAD · SolidWorks</Tag>
                    </div>
                }
            />

            <StatStrip
                cols={2}
                items={[
                    {
                        label: '2025 season — Reefscape',
                        value: 'Climb subsystem',
                    },
                    {
                        label: '2026 season — Rebuilt',
                        value: 'Storage/Indexer',
                    },
                ]}
            />

            <Figure caption="Fig. 1 — 2025 Reefscape · climb subsystem.">
                <Image
                    src="/sprocket/2025-reefscape.png"
                    alt="2025 Reefscape robot — climb subsystem detail"
                    width={1600}
                    height={1000}
                    className="w-full h-auto block"
                    priority={false}
                />
            </Figure>

            <Figure caption="Fig. 2 — 2026 Rebuilt · full-bot.">
                <Image
                    src="/sprocket/2026-rebuilt.png"
                    alt="2026 Rebuilt robot — Storage/Indexer"
                    width={1600}
                    height={1000}
                    className="w-full h-auto block"
                    priority={false}
                />
            </Figure>

            <Resources />
        </Page>
    );
}

/* ─────────────────────────────────────────────────────────────────
   Resources — three external links. Hairline-separated rows,
   matching the channel-row pattern used on /contact.
   ───────────────────────────────────────────────────────────────── */

interface Resource {
    kicker: string;
    label: string;
    meta: string;
    href: string;
}

const RESOURCES: Resource[] = [
    {
        kicker: 'TBA',
        label:  'thebluealliance.com/team/3473',
        meta:   'event history · results',
        href:   'https://www.thebluealliance.com/team/3473',
    },
    {
        kicker: 'GrabCAD',
        label:  'FRC Team 3473 — Reefscape (2025)',
        meta:   'release 1 · climb subsystem',
        href:   'https://grabcad.com/library/frc-team-3473-reefscape-cad-release-1',
    },
    {
        kicker: 'GrabCAD',
        label:  'FRC Team 3473 — Rebuilt (2026)',
        meta:   'release 1 · full-bot',
        href:   'https://grabcad.com/library/frc-team-3473-rebuilt-cad-release-1',
    },
];

function Resources() {
    return (
        <section className="mt-10">
            <header className="flex items-baseline justify-between gap-4 pb-2 border-b border-rule-strong mb-1">
                <span className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">
                    Resources
                </span>
                <span className="font-mono text-[10px] tracking-mono text-fg-soft">
                    3 external
                </span>
            </header>

            <ul className="list-none m-0 p-0">
                {RESOURCES.map((r) => (
                    <li key={r.href} className="border-t border-rule last:border-b">
                        <a
                            href={r.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="
                                grid grid-cols-[90px_minmax(0,1fr)_auto_24px]
                                gap-4 md:gap-6 py-4
                                text-fg no-underline items-baseline group
                            "
                        >
                            <span className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">
                                {r.kicker}
                            </span>
                            <span className="text-[15.5px] font-medium tracking-[-0.005em] group-hover:text-accent transition-colors duration-150 truncate">
                                {r.label}
                            </span>
                            <span className="hidden md:inline font-mono text-[11px] text-fg-soft tracking-mono whitespace-nowrap">
                                {r.meta}
                            </span>
                            <span
                                aria-hidden
                                className="font-mono text-accent text-sm text-right"
                            >
                                ↗
                            </span>
                        </a>
                    </li>
                ))}
            </ul>

            {/* Quiet single ArrowLink back up to the index. The archive
                framing means the user is most likely scanning, not deep-reading. */}
            <p className="mt-6 mb-0 text-[13px] text-fg-muted">
                <ArrowLink href="/work" glyph="←">
                    Back to all projects
                </ArrowLink>
            </p>
        </section>
    );
}