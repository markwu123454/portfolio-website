/**
 * Shared design primitives.
 *
 * These were inlined in each page file during the earlier passes;
 * once a second page needed them they got lifted here. Every primitive
 * is server-component-safe (no hooks, no event handlers in the
 * default exports) so pages can stay server components.
 *
 * Anything visual that appears on more than one page lives here.
 * Page-specific bits (the Aetherius rev list, the combat fleet grid,
 * the Lab tile grid, etc.) stay in the relevant page file.
 */

import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';

/* ─────────────────────────────────────────────────────────────────
   PageHeader — the "kicker · year · #num" tagline + h1 + dek block
   that opens every content page.
   ───────────────────────────────────────────────────────────────── */

interface PageHeaderProps {
    /** Mono uppercase tagline tokens, e.g. ['ABOUT','2026','#002']. */
    tag: string[];
    /** Big h1 title. Can include a span-as-second-line via `subtitle`. */
    title: ReactNode;
    /** Italic muted second line, rendered as part of the h1. */
    subtitle?: ReactNode;
    /** Right-side standfirst paragraph. */
    dek?: ReactNode;
    /** Optional extra row below the title (chips, byline, etc.). */
    after?: ReactNode;
}

export function PageHeader({ tag, title, subtitle, dek, after }: PageHeaderProps) {
    return (
        <header className="pt-16 pb-12">
            <div className="font-mono text-[11px] tracking-kicker uppercase text-accent mb-6 flex items-center gap-2 flex-wrap">
                {tag.map((t, i) => (
                    <span key={i} className="contents">
                        {i > 0 && <span className="text-fg-soft">·</span>}
                        <span>{t}</span>
                    </span>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px] gap-12 items-start">
                <h1 className="m-0 font-semibold leading-[1.05] tracking-[-0.025em] text-[clamp(40px,5vw,64px)] max-w-[760px]">
                    {title}
                    {subtitle && (
                        <>
                            <br />
                            <span className="text-fg-muted italic font-medium">
                                {subtitle}
                            </span>
                        </>
                    )}
                </h1>
                {dek && (
                    <p className="m-0 text-base leading-[1.65] text-fg-muted max-w-[420px]">
                        {dek}
                    </p>
                )}
            </div>

            {after && <div className="mt-8">{after}</div>}
        </header>
    );
}

/* ─────────────────────────────────────────────────────────────────
   Section — a numbered + titled content block.
   Reused from the home page; same shape.
   ───────────────────────────────────────────────────────────────── */

interface SectionProps {
    num: string;
    title: string;
    /** Optional small uppercase eyebrow above the title. */
    kicker?: string;
    children: ReactNode;
}

export function Section({ num, title, kicker, children }: SectionProps) {
    return (
        <section className="pt-14 mt-2">
            <header className="flex items-baseline gap-4 pb-3.5 mb-6 border-b border-rule-strong">
                <span className="font-mono text-xs tracking-[0.16em] text-accent shrink-0">
                    {num} —
                </span>
                <div className="min-w-0 flex-1">
                    {kicker && (
                        <div className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft mb-1.5">
                            {kicker}
                        </div>
                    )}
                    <h2
                        className={`m-0 font-semibold tracking-[-0.015em] max-w-[720px] leading-tight ${
                            kicker ? 'text-[22px]' : 'text-[28px]'
                        }`}
                    >
                        {title}
                    </h2>
                </div>
            </header>
            {children}
        </section>
    );
}

/* ─────────────────────────────────────────────────────────────────
   ArrowLink — `Read more ↗` style.
   ───────────────────────────────────────────────────────────────── */

export function ArrowLink({
                              href,
                              children,
                              external,
                              glyph = '↗',
                          }: {
    href: string;
    children: ReactNode;
    external?: boolean;
    glyph?: '↗' | '↓' | '←';
}) {
    const cls =
        'text-accent no-underline tracking-mono hover:underline underline-offset-4';
    if (external) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={cls}
            >
                {children} {glyph}
            </a>
        );
    }
    return (
        <Link href={href} className={cls}>
            {children} {glyph}
        </Link>
    );
}

/* ─────────────────────────────────────────────────────────────────
   StatusPill — used in nav, project lists, telemetry.
   ───────────────────────────────────────────────────────────────── */

export type Tone = 'good' | 'warn' | 'bad' | 'neutral';

const TONE_DOT: Record<Tone, string> = {
    good: 'bg-good',
    warn: 'bg-warn',
    bad: 'bg-bad',
    neutral: 'bg-fg-soft',
};

export function StatusPill({
                               tone,
                               children,
                           }: {
    tone: Tone;
    children: ReactNode;
}) {
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-px border border-rule rounded-full font-mono text-[10px] tracking-[0.1em] uppercase text-fg-muted whitespace-nowrap">
            <span aria-hidden className={`w-[5px] h-[5px] rounded-full ${TONE_DOT[tone]}`} />
            {children}
        </span>
    );
}

/* ─────────────────────────────────────────────────────────────────
   StatusText — italic-coloured status label, used in the work index.
   `building` → warn (amber), `shipped` → good (green), etc.
   ───────────────────────────────────────────────────────────────── */

export function StatusText({ tone, children }: { tone: Tone; children: ReactNode }) {
    const colorClass = {
        good: 'text-good',
        warn: 'text-warn',
        bad: 'text-bad',
        neutral: 'text-fg-soft',
    }[tone];
    return (
        <span className={`font-sans italic text-[14px] ${colorClass}`}>
            {children}
        </span>
    );
}

/* ─────────────────────────────────────────────────────────────────
   Tag — small mono-uppercase chip. Three variants.
   ───────────────────────────────────────────────────────────────── */

export function Tag({
                        children,
                        variant = 'filled',
                    }: {
    children: ReactNode;
    variant?: 'filled' | 'outline' | 'accent';
}) {
    const cls = {
        filled: 'bg-bg-elev border-rule text-fg-muted',
        outline: 'bg-transparent border-rule text-fg-muted',
        accent: 'bg-accent-soft border-accent text-accent',
    }[variant];
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-sm border font-mono text-[11px] tracking-mono ${cls}`}
        >
            {children}
        </span>
    );
}

/* ─────────────────────────────────────────────────────────────────
   Button — primary / secondary / ghost / link.
   ───────────────────────────────────────────────────────────────── */

export function Button({
                           href,
                           children,
                           variant = 'primary',
                           arrow,
                           external,
                       }: {
    href: string;
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'link';
    arrow?: boolean;
    external?: boolean;
}) {
    const variants = {
        primary: 'bg-fg text-bg border-fg hover:opacity-90',
        secondary: 'bg-transparent text-fg border-rule-strong hover:bg-bg-elev',
        ghost: 'bg-transparent text-fg border-rule hover:bg-bg-elev',
        link: 'bg-transparent text-accent border-transparent hover:underline underline-offset-4',
    }[variant];
    const padding = variant === 'link' ? 'py-1.5 px-0' : 'py-2.5 px-4';
    const className = `
        inline-flex items-center gap-2
        font-sans text-[13.5px] font-medium tracking-tight-1
        rounded no-underline border
        transition-[background-color,border-color,opacity] duration-150
        ${padding} ${variants}
    `;
    const inner = (
        <>
            {children}
            {arrow && <span aria-hidden className="font-mono">↗</span>}
        </>
    );
    if (external) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
            >
                {inner}
            </a>
        );
    }
    return (
        <Link href={href} className={className}>
            {inner}
        </Link>
    );
}

/* ─────────────────────────────────────────────────────────────────
   Page — top-level wrapper. Sets max width + horizontal padding.
   Pages compose: <Page><PageHeader/>... <Section/>... </Page>
   ───────────────────────────────────────────────────────────────── */

export function Page({ children }: { children: ReactNode }) {
    return (
        <main className="max-w-[1100px] mx-auto px-8 pb-24">{children}</main>
    );
}

/* ─────────────────────────────────────────────────────────────────
   Crumbs — small breadcrumb row used by case-study pages.
   ───────────────────────────────────────────────────────────────── */

export function Crumbs({ items }: { items: { href?: string; label: string }[] }) {
    return (
        <nav
            aria-label="Breadcrumb"
            className="font-mono text-[11px] tracking-mono text-fg-muted mb-6 flex items-center gap-2"
        >
            {items.map((c, i) => (
                <span key={i} className="contents">
                    {i > 0 && <span aria-hidden className="text-fg-soft">/</span>}
                    {c.href ? (
                        <Link href={c.href} className="text-fg-muted hover:text-accent">
                            {i === 0 && <span aria-hidden>← </span>}
                            {c.label}
                        </Link>
                    ) : (
                        <span className="text-fg">{c.label}</span>
                    )}
                </span>
            ))}
        </nav>
    );
}

/* ─────────────────────────────────────────────────────────────────
   StatStrip — horizontal row of label/value pairs.
   Used for case-study facts, telemetry rows, project meta.
   ───────────────────────────────────────────────────────────────── */

export function StatStrip({
                              items,
                              cols,
                          }: {
    items: Array<{ label: string; value: ReactNode }>;
    cols?: number;
}) {
    const gridCols = cols ?? items.length;
    const style = { '--strip-cols': gridCols } as CSSProperties;
    return (
        <dl
            className="grid gap-x-8 border-t border-b border-rule py-4"
            style={{
                ...style,
                gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            }}
        >
            {items.map((it, i) => (
                <div key={i} className="min-w-0">
                    <dt className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft mb-1">
                        {it.label}
                    </dt>
                    <dd className="m-0 text-[14px] text-fg">{it.value}</dd>
                </div>
            ))}
        </dl>
    );
}

/* ─────────────────────────────────────────────────────────────────
   Figure — labelled image/visual block with caption.
   ───────────────────────────────────────────────────────────────── */

export function Figure({
                           children,
                           caption,
                       }: {
    children: ReactNode;
    caption: ReactNode;
}) {
    return (
        <figure className="m-0 my-6">
            {children}
            <figcaption className="mt-3 font-mono text-[11px] text-fg-soft tracking-mono">
                {caption}
            </figcaption>
        </figure>
    );
}

/* ─────────────────────────────────────────────────────────────────
   FigurePlaceholder — flat-toned panel for visuals you'll drop in
   later. Useful while content is being shot/rendered.
   ───────────────────────────────────────────────────────────────── */

export function FigurePlaceholder({
                                      label,
                                      aspect = '16/9',
                                  }: {
    label: string;
    aspect?: string;
}) {
    return (
        <div
            className="bg-bg-elev border border-rule rounded-md flex items-center justify-center"
            style={{ aspectRatio: aspect }}
        >
            <span className="font-mono text-[11px] tracking-mono text-fg-soft">
                {label}
            </span>
        </div>
    );
}