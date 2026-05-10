/**
 * Home — /
 *
 * Server component. Pure content — Header and Footnote come from the
 * root layout. Tailwind classes resolve to design tokens via the
 * @theme inline bridge in globals.css, so colour/typography auto-flip
 * with prefers-color-scheme.
 *
 * Layout:
 *   Hero (intro + telemetry side-card)
 *   01 — Featured work
 *   02 — Recently
 *   03 — Currently
 *   04 — Get in touch
 *
 * Structural primitives (Section, ProjectListing, StatusPill, Tag,
 * Button) are inlined at the bottom — lift to /components/primitives
 * once a second page needs them.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';

export const metadata = {
    title: 'Mark Wu — student engineer',
    description:
        'I build robots, drones, and the software that runs them. Class of 2026, FRC 3473, looking for internships Summer ’26.',
};

export default function HomePage() {
    return (
        <main className="max-w-[1100px] mx-auto px-8 pb-24">
            <Hero />

            <Section num="01" title="Featured work">
                <FeaturedWork />
                <SectionFooter>
                    <ArrowLink href="/work">All 11 projects</ArrowLink>
                </SectionFooter>
            </Section>

            <Section num="02" title="Recently">
                <Timeline />
                <SectionFooter>
                    <ArrowLink href="/now">What I’m doing now</ArrowLink>
                </SectionFooter>
            </Section>

            <Section num="03" title="Currently">
                <Currently />
            </Section>

            <Section
                num="04"
                title="Recruiters, professors, lab leads — and other student engineers — write any time."
                kicker="GET IN TOUCH"
            >
                <Contact />
            </Section>
        </main>
    );
}

/* ═════════════════════════════════════════════════════════════════
   HERO
   ═════════════════════════════════════════════════════════════════ */

function Hero() {
    return (
        <section className="pt-16 pb-12 border-b border-rule grid grid-cols-[minmax(0,1fr)_280px] gap-12 items-start">
            <div>
                <div className="flex gap-2.5 mb-8 flex-wrap">
                    <Tag variant="accent">Open · Summer ’26</Tag>
                    <Tag variant="outline">
                        Mark Wu · Diamond Bar, CA · Class of 2026 · #001
                    </Tag>
                </div>

                <h1 className="m-0 font-semibold leading-[1.05] tracking-[-0.025em] max-w-[760px] text-[clamp(36px,5vw,56px)]">
                    Student engineer.{' '}
                    <span className="text-fg-muted font-medium">
                        I build robots, drones, and the software that runs them.
                    </span>
                </h1>

                <div className="mt-8 grid gap-2 max-w-[620px] text-base leading-[1.65] text-fg-muted">
                    <p className="m-0">
                        <strong className="text-fg font-semibold">FRC Team 3473</strong>{' '}
                        — CAD subteam, lead developer of the scouting platform.
                    </p>
                    <p className="m-0">
                        <strong className="text-fg font-semibold">Aetherius</strong>{' '}
                        — fixed-wing UAV with custom MAVLink GCS.
                    </p>
                    <p className="m-0">
                        Three years of combat robotics before that. Smaller controls
                        projects on the side.
                    </p>
                </div>

                <div className="mt-10 flex gap-3 flex-wrap items-center">
                    <Button href="/work" variant="primary" arrow>See work</Button>
                    <Button href="/resume.pdf" variant="ghost" external>Resume.pdf</Button>
                    <span className="font-mono text-xs text-fg-soft ml-1">
                        — me@markwu.org · response &lt; 24h
                    </span>
                </div>
            </div>

            <Telemetry />
        </section>
    );
}

function Telemetry() {
    const ITEMS: Array<[string, string]> = [
        ['Internships', 'Open · Summer ’26'],
        ['Active projects', '4'],
        ['Lifetime robots', '12 + 1 in build'],
        ['Last shipped', 'SprocketStats v3.4'],
    ];
    return (
        <aside className="border border-rule rounded-md p-[18px] bg-bg-elev font-mono text-[11.5px]">
            <div className="flex justify-between items-baseline pb-3 mb-3 border-b border-rule text-fg-soft tracking-[0.16em] uppercase text-[10px]">
                <span>Telemetry</span>
                <span>2026.05.04 · 14:02 PST</span>
            </div>
            <dl className="m-0 grid gap-2.5">
                {ITEMS.map(([k, v]) => (
                    <div key={k} className="flex justify-between items-baseline gap-3">
                        <dt className="text-fg-soft tracking-mono">{k}</dt>
                        <dd className="m-0 text-fg text-right">{v}</dd>
                    </div>
                ))}
            </dl>
        </aside>
    );
}

/* ═════════════════════════════════════════════════════════════════
   01 — FEATURED WORK
   ═════════════════════════════════════════════════════════════════ */

interface FeaturedItem {
    num: string;
    href: string;
    title: string;
    dek: string;
    status: string;
    tone: 'good' | 'warn' | 'bad' | 'neutral';
    year: string;
}

const FEATURED: FeaturedItem[] = [
    {
        num: '01',
        href: '/work/aetherius',
        title: 'Aetherius UAV',
        dek: 'Fixed-wing drone with Pixhawk avionics, custom MAVLink ground control. Twin-boom revision in build.',
        status: 'building', tone: 'warn', year: '2024 —',
    },
    {
        num: '02',
        href: '/work/sprocketstats',
        title: 'SprocketStats',
        dek: 'Real-time scouting + analytics platform for FRC. React, FastAPI, Postgres. Used at Worlds ’25.',
        status: 'shipped', tone: 'good', year: '2024 —',
    },
    {
        num: '03',
        href: '/work/sprocket-frc',
        title: 'Sprocket — FRC CAD',
        dek: 'Two seasons with Team 3473 — Climb subsystem owner ’24-25, full-bot involvement ’25-26.',
        status: 'competing', tone: 'warn', year: '2025 —',
    },
    {
        num: '04',
        href: '/work/combat',
        title: 'Team Infernope',
        dek: 'Twelve combat robots over three years. 1st place, end-of-year tournament ’25.',
        status: 'archive', tone: 'neutral', year: '2022–25',
    },
];

function FeaturedWork() {
    return (
        <ul className="list-none m-0 p-0">
            {FEATURED.map((p) => <ProjectListing key={p.num} item={p} />)}
        </ul>
    );
}

function ProjectListing({ item }: { item: FeaturedItem }) {
    return (
        <li className="border-t border-rule">
            <Link
                href={item.href}
                className="grid grid-cols-[40px_minmax(0,1fr)_auto_auto_24px] gap-6 py-5 items-baseline text-fg no-underline group"
            >
                <span className="font-mono text-xs tracking-[0.16em] text-accent">
                    {item.num}
                </span>
                <div className="min-w-0">
                    <h3 className="m-0 text-[19px] font-semibold tracking-[-0.01em] group-hover:text-accent transition-colors duration-150">
                        {item.title}
                    </h3>
                    <p className="mt-1 mb-0 text-[14.5px] leading-relaxed text-fg-muted max-w-[540px]">
                        {item.dek}
                    </p>
                </div>
                <StatusPill tone={item.tone}>{item.status}</StatusPill>
                <span className="font-mono text-[11px] text-fg-soft whitespace-nowrap">
                    {item.year}
                </span>
                <span aria-hidden className="font-mono text-fg-soft text-sm text-right group-hover:text-accent transition-colors duration-150">
                    ↗
                </span>
            </Link>
        </li>
    );
}

/* ═════════════════════════════════════════════════════════════════
   02 — TIMELINE
   ═════════════════════════════════════════════════════════════════ */

const RECENT = [
    {
        date: '2026.05.04',
        title: 'Aetherius rev 4 — twin-boom layout finalised',
        body: 'Wiring loom and MAVLink failsafes next. Target: maiden flight before SoCal Champs.',
    },
    {
        date: '2026.04.22',
        title: 'SprocketStats hit 200+ active scouters',
        body: 'Schedule view shipped. Post-Worlds debrief filed.',
    },
    {
        date: '2026.03.30',
        title: 'Music — finished composition analysis',
        body: 'Walkthrough of "Music for Three Musicians" with notes on the eighth-note phase shift.',
    },
];

function Timeline() {
    return (
        <ul className="list-none m-0 p-0">
            {RECENT.map((r) => (
                <li
                    key={r.date}
                    className="grid grid-cols-[120px_minmax(0,1fr)] gap-6 py-[18px] border-t border-rule"
                >
                    <span className="font-mono text-xs text-fg-soft tracking-mono pt-0.5">
                        {r.date}
                    </span>
                    <div>
                        <h3 className="m-0 text-base font-semibold tracking-[-0.005em]">
                            {r.title}
                        </h3>
                        <p className="mt-1 mb-0 text-[14.5px] leading-relaxed text-fg-muted max-w-[580px]">
                            {r.body}
                        </p>
                    </div>
                </li>
            ))}
        </ul>
    );
}

/* ═════════════════════════════════════════════════════════════════
   03 — CURRENTLY
   ═════════════════════════════════════════════════════════════════ */

function Currently() {
    const ROWS: Array<[string, ReactNode]> = [
        ['Class of 2026', 'Diamond Bar HS'],
        ['Looking', 'Internships, Summer ’26'],
        ['Stack', 'TypeScript · Python · C++'],
        ['Hardware', 'Pixhawk · RPi · ESP32'],
        ['CAD', 'SolidWorks · Onshape'],
        ['Last seen', 'FRC SoCal Champs'],
    ];
    return (
        <dl className="grid grid-cols-2 gap-x-12 m-0">
            {ROWS.map(([k, v]) => (
                <div
                    key={k}
                    className="grid grid-cols-[110px_minmax(0,1fr)] gap-4 py-3 border-t border-rule items-baseline"
                >
                    <dt className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">
                        {k}
                    </dt>
                    <dd className="m-0 text-[15px] text-fg">{v}</dd>
                </div>
            ))}
        </dl>
    );
}

/* ═════════════════════════════════════════════════════════════════
   04 — CONTACT
   ═════════════════════════════════════════════════════════════════ */

function Contact() {
    const LINES: Array<{
        kicker: string;
        label: string;
        href: string;
        glyph: '↗' | '↓';
        external?: boolean;
    }> = [
        { kicker: 'Email', label: 'me@markwu.org', href: 'mailto:me@markwu.org', glyph: '↗', external: true },
        { kicker: 'GitHub', label: 'github.com/markwu123454', href: 'https://github.com/markwu123454', glyph: '↗', external: true },
        { kicker: 'LinkedIn', label: 'linkedin.com/in/mark-mai-wu', href: 'https://linkedin.com/in/mark-mai-wu', glyph: '↗', external: true },
        { kicker: 'Resume', label: 'resume.pdf', href: '/resume.pdf', glyph: '↓', external: true },
    ];

    return (
        <div>
            <p className="mt-0 mb-6 text-base text-fg-muted max-w-[620px] leading-relaxed">
                Email is best. Usually reply within a day. Resume on file; happy to
                send the latest version.
            </p>

            <ul className="list-none m-0 p-0">
                {LINES.map((l) => (
                    <li key={l.kicker} className="border-t border-rule">
                        <a
                            href={l.href}
                            target={l.external ? '_blank' : undefined}
                            rel={l.external ? 'noopener noreferrer' : undefined}
                            className="grid grid-cols-[110px_minmax(0,1fr)_24px] gap-4 py-3.5 text-fg no-underline items-baseline group"
                        >
                            <span className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">
                                {l.kicker}
                            </span>
                            <span className="text-base text-fg font-medium group-hover:text-accent transition-colors duration-150">
                                {l.label}
                            </span>
                            <span aria-hidden className="font-mono text-accent text-sm text-right">
                                {l.glyph}
                            </span>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/* ═════════════════════════════════════════════════════════════════
   PRIMITIVES (inlined for self-containment)
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
        <section className="pt-16 mt-2">
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
                    <h2 className={`m-0 font-semibold tracking-[-0.015em] max-w-[720px] leading-tight ${kicker ? 'text-[22px]' : 'text-[28px]'}`}>
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
        <div className="mt-[18px] pt-3.5 border-t border-rule flex justify-end font-mono text-xs">
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

type Tone = 'good' | 'warn' | 'bad' | 'neutral';

const TONE_DOT: Record<Tone, string> = {
    good: 'bg-good',
    warn: 'bg-warn',
    bad: 'bg-bad',
    neutral: 'bg-fg-soft',
};

function StatusPill({ tone, children }: { tone: Tone; children: ReactNode }) {
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-px border border-rule rounded-full font-mono text-[10px] tracking-[0.1em] uppercase text-fg-muted whitespace-nowrap">
            <span aria-hidden className={`w-[5px] h-[5px] rounded-full ${TONE_DOT[tone]}`} />
            {children}
        </span>
    );
}

function Tag({
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
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm border font-mono text-[11px] tracking-mono ${cls}`}>
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
            <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
                {inner}
            </a>
        );
    }
    return <Link href={href} className={className}>{inner}</Link>;
}