/**
 * Home — /
 *
 * Server component. Pure content — Header and Footnote come from the
 * root layout. Tailwind classes resolve to design tokens via the
 * @theme inline bridge in globals.css, so color/typography auto-flip
 * with prefers-color-scheme.
 *
 * Everything below is inlined directly into HomePage's return, in
 * layout order — both JSX and the data behind it — since nothing here
 * is used from more than one place. Section/SectionFooter/ArrowLink/
 * Tag/Button are genuinely reused, so those stay as functions, and
 * PROJECTS stays in data/projects.ts since /work and /now use it too.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';
import {Metadata} from "next";
import { PROJECTS, STATUS_TONE } from '@/data/projects';

export const metadata: Metadata = {
    title: 'Mark Wu',
    description:
        'I design and build robots, drones, and the software that powers them. Looking for internships and lab I can contribute to.',
};

/* ═════════════════════════════════════════════════════════════════
   PAGE
   ═════════════════════════════════════════════════════════════════ */

export default function HomePage() {
    return (
        <main className="max-w-275 mx-auto px-4 sm:px-8 pb-16 sm:pb-24">
            {/* ─ Hero ─────────────────────────────────────────────── */}
            <section className="
                pt-10 sm:pt-16 pb-10 sm:pb-12 border-b border-rule
                grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_280px]
                gap-8 md:gap-12 items-start
            ">
                <div>
                    <div className="flex gap-2.5 mb-6 sm:mb-8 flex-wrap">
                        <Tag variant="accent">Open · internships + labs</Tag>
                        {/* Drop the long identity tag on mobile — redundant with h1 context */}
                        <Tag variant="outline" className="hidden sm:inline-flex">
                            Mark Wu · Merced, CA · UC Merced 2030
                        </Tag>
                    </div>

                    <h1 className="m-0 font-semibold leading-[1.05] tracking-[-0.025em] max-w-190 text-[clamp(30px,5vw,56px)]">
                        I make robots, drones, and the software that powers them.
                    </h1>

                    <div className="mt-6 sm:mt-8 grid gap-2 max-w-155 text-base leading-[1.65] text-fg-muted">
                        <strong className="text-fg text-lg font-semibold">What I&#39;m most proud of: </strong>
                        <p className="m-0">
                            <strong className="text-fg font-semibold">SprocketStats</strong>
                            : FRC scouting website live at sprocketstats.com. Handles team operations and scouting.
                        </p>
                        <p className="m-0">
                            <strong className="text-fg font-semibold">Project Aetherius</strong>
                            : A Unmanned Flying Vehicle(UAV) and Ground Control Station(GCS).
                        </p>
                    </div>

                    <div className="mt-8 sm:mt-10 flex gap-3 flex-wrap items-center">
                        <Button href="/work" variant="primary" arrow>See work</Button>
                        <Button href="/resume.pdf#view=FitV" variant="ghost" external>Resume.pdf</Button>
                        {/* Email hint — only meaningful where there's room */}
                        <span className="hidden sm:inline font-mono text-xs text-fg-soft ml-1">
                            me@markwu.org
                        </span>
                    </div>
                </div>

                {/* Telemetry card — hide on mobile, the tags above cover the same info */}
                <aside className="hidden md:block border border-rule rounded-md p-4.5 bg-bg-elev font-mono text-[11.5px]">
                    <div className="flex justify-between items-baseline pb-3 mb-3 border-b border-rule text-fg-soft tracking-[0.16em] uppercase text-[10px]">
                        <span>Now</span>
                        <span>2026.08 · Merced</span>
                    </div>
                    <dl className="m-0 grid gap-2.5">
                        {(
                            [
                                ['Status', 'Open · internships + labs'],
                                ['Active projects', '4'],
                                ['Robots built', '12 combat + 2 FRC'],
                                ['Last shipped', 'sprocketstats.com'],
                            ] as Array<[string, string]>
                        ).map(([k, v]) => (
                            <div key={k} className="flex justify-between items-baseline gap-3">
                                <dt className="text-fg-soft tracking-mono">{k}</dt>
                                <dd className="m-0 text-fg text-right">{v}</dd>
                            </div>
                        ))}
                    </dl>
                </aside>
            </section>

            {/* ─ 01 — Featured work ───────────────────────────────── */}
            <Section num="01" title="Featured work">
                <ul className="list-none m-0 p-0">
                    {PROJECTS
                        .filter((p) => p.featured !== undefined)
                        .sort((a, b) => a.featured! - b.featured!)
                        .map((p, i) => {
                            const num = String(i + 1).padStart(2, '0');
                            const tone = p.homeTone ?? STATUS_TONE[p.status];
                            const label = p.homeLabel ?? p.status;
                            const dot = { good: 'bg-good', warn: 'bg-warn', bad: 'bg-bad', neutral: 'bg-fg-soft' }[tone];
                            return (
                                <li key={p.href} className="border-t border-rule">
                                    <Link
                                        href={p.href}
                                        className="
                                            py-4 sm:py-5 text-fg no-underline group
                                            flex flex-col gap-2
                                            sm:grid sm:grid-cols-[40px_minmax(0,1fr)_auto_auto_24px] sm:gap-6 sm:items-baseline
                                        "
                                    >
                                        {/* Index number — hidden on mobile, shown on desktop */}
                                        <span className="hidden sm:block font-mono text-xs tracking-[0.16em] text-accent">
                                            {num}
                                        </span>

                                        <div className="min-w-0">
                                            <h3 className="m-0 text-[17px] sm:text-[19px] font-semibold tracking-[-0.01em] group-hover:text-accent transition-colors duration-150">
                                                {p.title}
                                            </h3>
                                            <p className="mt-1 mb-0 text-[14px] sm:text-[14.5px] leading-relaxed text-fg-muted max-w-135">
                                                {p.blurb}
                                            </p>
                                        </div>

                                        {/* Status + year inline on mobile, separate cols on desktop */}
                                        <div className="flex items-center gap-3 sm:contents">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-px border border-rule rounded-full font-mono text-[10px] tracking-widest uppercase text-fg-muted whitespace-nowrap">
                                                <span aria-hidden className={`w-1.25 h-1.25 rounded-full ${dot}`} />
                                                {label}
                                            </span>
                                            <span className="font-mono text-[11px] text-fg-soft whitespace-nowrap">
                                                {p.year}
                                            </span>
                                            <span aria-hidden className="font-mono text-fg-soft text-sm sm:text-right group-hover:text-accent transition-colors duration-150 ml-auto sm:ml-0">
                                                ↗
                                            </span>
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                </ul>
                <SectionFooter>
                    <ArrowLink href="/work">All projects</ArrowLink>
                </SectionFooter>
            </Section>

            {/* ─ 02 — Recently ────────────────────────────────────── */}
            <Section num="02" title="Recently">
                <ul className="list-none m-0 p-0">
                    {[
                        {
                            date: '2026.08',
                            title: 'Aetherius UAV: Successful flight',
                            body: 'Aetherius successfully took off and flew on the 18 and 19 of August, demonstrating air worthiness of the aircraft and flight readiness of the ground control station.',
                        },
                        {
                            date: '2026.08',
                            title: 'Starting at UC Merced',
                            body: 'Mechanical engineering, aerospace emphasis. Class of 2030.',
                        },
                        {
                            date: '2026.03',
                            title: 'Engineering Inspiration Award @ CA District San Gabriel Valley Event',
                            body: 'Team 3473 won EI (sponsored by SpaceX) at the SGV event. SprocketStats used across both CA district events.',
                        },
                    ].map((r) => (
                        <li
                            key={r.title}
                            className="
                                py-4 sm:py-4.5 border-t border-rule
                                /* Mobile: date above content. Desktop: side-by-side */
                                flex flex-col gap-1
                                sm:grid sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-6
                            "
                        >
                            <span className="font-mono text-xs text-fg-soft tracking-mono sm:pt-0.5">
                                {r.date}
                            </span>
                            <div>
                                <h3 className="m-0 text-base  font-semibold tracking-tight-1">
                                    {r.title}
                                </h3>
                                <p className="mt-1 mb-0 text-[14.5px] leading-relaxed text-fg-muted max-w-145">
                                    {r.body}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
                <SectionFooter>
                    <ArrowLink href="/now">What I&#39;m doing now</ArrowLink>
                </SectionFooter>
            </Section>

            {/* ─ 03 — Currently ───────────────────────────────────── */}
            <Section num="03" title="Currently">
                {/* Mobile: single column. Desktop: 2-column grid */}
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 m-0">
                    {(
                        [
                            ['School', 'UC Merced · ME w/ AE emphasis · 2030'],
                            ['Looking', 'Research labs · internships'],
                            ['Building', 'Aetherius UAV + GCS · SprocketStats'],
                            ['Stack', 'TypeScript · Python'],
                            ['Hardware', 'Pixhawk · RPi · ESP32 · Arduino'],
                            ['CAD', 'SolidWorks · Fusion 360'],
                        ] as Array<[string, string]>
                    ).map(([k, v]) => (
                        <div
                            key={k}
                            className="grid grid-cols-[100px_minmax(0,1fr)] sm:grid-cols-[110px_minmax(0,1fr)] gap-3 sm:gap-4 py-3 border-t border-rule items-baseline"
                        >
                            <dt className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">
                                {k}
                            </dt>
                            <dd className="m-0 text-[14px] sm:text-[15px] text-fg">{v}</dd>
                        </div>
                    ))}
                </dl>
            </Section>

            {/* ─ 04 — Contact ─────────────────────────────────────── */}
            <Section
                num="04"
                title="Reach out any time."
                kicker="GET IN TOUCH"
            >
                <div>
                    <p className="mt-0 mb-6 text-base text-fg-muted max-w-155 leading-relaxed">
                        Email preferably, you can check out this website or my github while you wait.
                    </p>

                    <ul className="list-none m-0 p-0">
                        {(
                            [
                                { kicker: 'Email', label: 'me@markwu.org', href: 'mailto:me@markwu.org', glyph: '↗', external: true },
                                { kicker: 'GitHub', label: 'github.com/markwu123454', href: 'https://github.com/markwu123454', glyph: '↗', external: true },
                                { kicker: 'LinkedIn', label: 'linkedin.com/in/mark-mai-wu', href: 'https://linkedin.com/in/mark-mai-wu', glyph: '↗', external: true },
                                { kicker: 'Resume', label: 'resume.pdf', href: '/resume.pdf#view=FitV', glyph: '↓', external: true },
                            ] as Array<{ kicker: string; label: string; href: string; glyph: '↗' | '↓'; external?: boolean }>
                        ).map((l) => (
                            <li key={l.kicker} className="border-t border-rule">
                                <a
                                    href={l.href}
                                    target={l.external ? '_blank' : undefined}
                                    rel={l.external ? 'noopener noreferrer' : undefined}
                                    className="
                                        py-3.5 text-fg no-underline items-baseline group
                                        flex flex-col gap-0.5
                                        sm:grid sm:grid-cols-[110px_minmax(0,1fr)_24px] sm:gap-4
                                    "
                                >
                                    <span className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">
                                        {l.kicker}
                                    </span>
                                    <span className="text-[15px] sm:text-base text-fg font-medium group-hover:text-accent transition-colors duration-150">
                                        {l.label}
                                    </span>
                                    <span aria-hidden className="hidden sm:block font-mono text-accent text-sm text-right">
                                        {l.glyph}
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </Section>
        </main>
    );
}

/* ═════════════════════════════════════════════════════════════════
   PRIMITIVES — reused more than once, so these stay as functions.
   ═════════════════════════════════════════════════════════════════ */

function Section({
                     num,
                     title,
                     kicker,
                     children,
                 }: {
    num: string;
    title: string;
    kicker?: string;
    children: ReactNode;
}) {
    return (
        <section className="pt-12 sm:pt-16 mt-2">
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
                    <h2 className={`m-0 font-semibold tracking-tight-2 max-w-180 leading-tight ${kicker ? 'text-[18px] sm:text-[22px]' : 'text-[22px] sm:text-[28px]'}`}>
                        {title}
                    </h2>
                </div>
            </header>
            {children}
        </section>
    );
}

function SectionFooter({ children }: { children: ReactNode }) {
    return (
        <div className="mt-4.5 pt-3.5 border-t border-rule flex justify-end font-mono text-xs">
            {children}
        </div>
    );
}

function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
    return (
        <Link
            href={href}
            className="text-accent no-underline tracking-mono hover:underline underline-offset-4"
        >
            {children} ↗
        </Link>
    );
}

function Tag({
                 children,
                 variant = 'filled',
                 className = '',
             }: {
    children: ReactNode;
    variant?: 'filled' | 'outline' | 'accent';
    className?: string;
}) {
    const cls = {
        filled:  'bg-bg-elev border-rule text-fg-muted',
        outline: 'bg-transparent border-rule text-fg-muted',
        accent:  'bg-accent-soft border-accent text-accent',
    }[variant];
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm border font-mono text-[11px] tracking-mono ${cls} ${className}`}>
            {children}
        </span>
    );
}

function Button({
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
        primary:   'bg-fg text-bg border-fg hover:opacity-90',
        secondary: 'bg-transparent text-fg border-rule-strong hover:bg-bg-elev',
        ghost:     'bg-transparent text-fg border-rule hover:bg-bg-elev',
        link:      'bg-transparent text-accent border-transparent hover:underline underline-offset-4',
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
            <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
                {inner}
            </a>
        );
    }
    return <Link href={href} className={className}>{inner}</Link>;
}
