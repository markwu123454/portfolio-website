/**
 * Site footer — four-column block above the EOF line.
 *
 * Appears on every page via the root layout. Prose-style links, no
 * underline at rest, accent on hover. Structured as:
 *
 *   [ name + locale ]   [ work links ]   [ writing links ]   [ contact ]
 *
 * The version / EOF line sits in the same block, under a hairline.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';

export function Footer() {
    return (
        <footer className="w-full max-w-275 mx-auto px-4 sm:px-8 pt-6 pb-6 mt-3 border-t border-rule">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6 text-[13px] leading-snug">
                <Column>
                    <div className="font-mono text-[11px] text-fg-muted leading-relaxed">
                        <div className="text-fg mb-1 tracking-mono">MARK WU · 2026</div>
                        <div>Merced, CA</div>
                        <div>UC Merced · 2030</div>
                    </div>
                </Column>

                <Column heading="Work">
                    <FLink href="/projects">All projects</FLink>
                    <FLink href="/experiments">Experiments</FLink>
                </Column>

                <Column heading="Writing">
                    <FLink href="/about">About</FLink>
                    <FLink href="/resume.pdf#view=FitV" external>Resume.pdf</FLink>
                </Column>

                <Column heading="Contact">
                    <a
                        href="mailto:me@markwu.org"
                        className="text-fg hover:text-accent transition-colors"
                    >
                        me@markwu.org
                    </a>
                    <FLink href="https://github.com/markwu123454" external>
                        github / markwu123454
                    </FLink>
                    <FLink href="https://linkedin.com/in/mark-mai-wu" external>
                        linkedin / mark-mai-wu
                    </FLink>
                </Column>
            </div>

            <div className="flex justify-between items-baseline mt-6 pt-3 border-t border-rule font-mono text-[11px] tracking-mono text-fg-soft">
                <span>— v1 · 2026.05</span>
                <span>EOF</span>
            </div>
        </footer>
    );
}

function Column({
                    heading,
                    children,
                }: {
    heading?: string;
    children: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1">
            {heading && (
                <div className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft mb-1">
                    {heading}
                </div>
            )}
            {children}
        </div>
    );
}

function FLink({
                   href,
                   children,
                   external,
               }: {
    href: string;
    children: ReactNode;
    external?: boolean;
}) {
    const cls = 'text-fg-muted hover:text-accent transition-colors w-fit';
    if (external) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
                {children}
            </a>
        );
    }
    return (
        <Link href={href} className={cls}>
            {children}
        </Link>
    );
}