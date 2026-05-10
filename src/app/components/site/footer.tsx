/**
 * Site footer — four-column block above the EOF line.
 *
 * Appears on every page via the root layout. Prose-style links, no
 * underline at rest, accent on hover. Structured as:
 *
 *   [ name + locale ]   [ work links ]   [ writing links ]   [ contact ]
 *
 * The EOF line below it (— MARK WU · 2026 · v1 / EOF) is the
 * existing `Footnote` component in layout.tsx. Keep both.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';

export function Footer() {
    return (
        <footer className="w-full max-w-[1100px] mx-auto px-8 pt-12 pb-2 mt-24 border-t border-rule">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10 text-[13px]">
                <Column>
                    <Identity />
                </Column>

                <Column heading="Work">
                    <FLink href="/work">All projects</FLink>
                    <FLink href="/lab">Lab</FLink>
                    <FLink href="/now">Now</FLink>
                </Column>

                <Column heading="Writing">
                    <FLink href="/music">Music</FLink>
                    <FLink href="/about">About</FLink>
                    <FLink href="/resume.pdf" external>Resume.pdf</FLink>
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
        <div className="flex flex-col gap-1.5">
            {heading && (
                <div className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft mb-2">
                    {heading}
                </div>
            )}
            {children}
        </div>
    );
}

function Identity() {
    return (
        <div className="font-mono text-[11px] text-fg-muted leading-relaxed">
            <div className="text-fg mb-2 tracking-mono">MARK WU · 2026</div>
            <div>Diamond Bar, CA</div>
            <div>Class of 2026</div>
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