/**
 * Now — /now
 *
 * Server component. Monthly status report in the spirit of nownownow.com.
 * Everything below is inlined directly into NowPage's return, in layout
 * order — nothing here is used more than once. Active and Back-burner
 * pull from data/projects.ts (nowUpdate / backBurnerNote) rather than
 * duplicating project identity here.
 */

import { Page, PageHeader, Section, ArrowLink } from '@/app/components/site/primitives';
import { PROJECTS } from '@/data/projects';
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Now',
    description: "What I'm working on this month.",
};

export default function NowPage() {
    return (
        <Page>
            <PageHeader
                tag={['NOW', 'AUG 2026', '#006']}
                title="What I’m working on"
                subtitle="this month."
                dek={
                    <>
                        Updated monthly, in the spirit of{' '}
                        <ArrowLink href="https://nownownow.com" external glyph="↗">
                            nownownow.com
                        </ArrowLink>
                        . If you read this more than 30 days after the date above, it’s stale, sorry.
                    </>
                }
            />

            {/* ─ 01 — Active ───────────────────────────────────────── */}
            <Section num="01" title="Active">
                <ul className="list-none m-0 p-0">
                    {PROJECTS.filter((p) => p.nowUpdate).map((p) => (
                        <li
                            key={p.href}
                            className="grid grid-cols-[160px_minmax(0,1fr)] gap-6 py-5 border-t border-rule"
                        >
                            <span className="font-mono text-[11px] text-fg-soft tracking-mono pt-0.5">
                                {p.title}
                            </span>
                            <div>
                                <h3 className="m-0 text-base font-semibold tracking-tight-1">
                                    {p.nowUpdate!.title}
                                </h3>
                                <p className="mt-1 mb-0 text-[14.5px] leading-relaxed text-fg-muted max-w-170">
                                    {p.nowUpdate!.body}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </Section>

            <div className="grid md:grid-cols-2 gap-x-12">
                {/* ─ 02 — On the back burner ──────────────────────── */}
                <Section num="02" title="On the back burner">
                    <ol className="list-none m-0 p-0">
                        {PROJECTS.filter((p) => p.backBurnerNote).map((p, i) => (
                            <li
                                key={p.href}
                                className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 py-3 border-t border-rule items-baseline"
                            >
                                <span className="font-mono text-[11px] tracking-mono text-fg-soft">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <span className="text-[14.5px] text-fg-muted">
                                    {p.title}: {p.backBurnerNote}
                                </span>
                            </li>
                        ))}
                    </ol>
                </Section>

                {/* ─ 03 — Currently learning ──────────────────────── */}
                <Section num="03" title="Currently learning">
                    <dl className="m-0">
                        {(
                            [
                                ['Starting', 'Mechanical engineering at UC Merced, aerospace emphasis'],
                                ['Practicing', 'Rust'],
                                ['Considering', 'C++'],
                            ] as Array<[string, string]>
                        ).map(([k, v], i) => (
                            <div
                                key={i}
                                className="grid grid-cols-[110px_minmax(0,1fr)] gap-4 py-3 border-t border-rule items-baseline"
                            >
                                <dt className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">
                                    {k}
                                </dt>
                                <dd className="m-0 text-[14.5px] text-fg">{v}</dd>
                            </div>
                        ))}
                    </dl>
                </Section>
            </div>

            {/* ─ Update meta ───────────────────────────────────────── */}
            <div className="mt-16 flex justify-between font-mono text-[11px] tracking-mono text-fg-soft">
                <span>/now · last updated 2026.08.20</span>
                <span>Next update: 2026.10.01</span>
            </div>
        </Page>
    );
}
