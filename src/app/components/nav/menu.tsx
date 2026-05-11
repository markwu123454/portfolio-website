'use client';

/**
 * Megamenu — opens off the "Work" nav item in the site Header.
 *
 * Desktop: hover-open 3-column panel anchored below the trigger.
 * Mobile: not used directly — Work links are in the drawer instead.
 *         But if the megamenu IS rendered on mobile (e.g. via direct
 *         nav), the panel becomes a full-width stacked list.
 *
 * Hover-open with a 120ms close-delay so a fast cursor doesn't flicker.
 * Closes on outside click, on Escape, and on route change.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type KeyboardEvent as ReactKeyboardEvent,
} from 'react';

/* ─────────────────────────────────────────────────────────────────
   Data
   ───────────────────────────────────────────────────────────────── */

type Tone = 'good' | 'warn' | 'bad' | 'neutral';

interface MenuItem {
    href: string;
    title: string;
    blurb: string;
    status: string;
    tone: Tone;
    year: string;
}

interface MenuColumn {
    label: string;
    kicker: string;
    items: MenuItem[];
}

const COLUMNS: MenuColumn[] = [
    {
        label: 'Active',
        kicker: 'C.01',
        items: [
            {
                href: '/work/harbinger',
                title: 'Harbinger',
                blurb: 'Embedded C++ turret. Coilgun actuator, closed-loop heading.',
                status: 'building',
                tone: 'warn',
                year: '2025 —',
            },
            {
                href: '/work/aetherius',
                title: 'Aetherius UAV',
                blurb: 'Fixed-wing, rev 4. Pixhawk 6X, MAVLink, RPi companion.',
                status: 'building',
                tone: 'warn',
                year: '2024 —',
            },
            {
                href: '/work/sprocketstats',
                title: 'SprocketStats',
                blurb: 'FRC scouting + analytics. AI transition in progress.',
                status: 'shipped',
                tone: 'good',
                year: '2024 —',
            },
        ],
    },
    {
        label: 'Robotics + CAD',
        kicker: 'C.02',
        items: [
            {
                href: '/work/sprocket-frc',
                title: 'Sprocket — FRC CAD',
                blurb: 'Two FRC seasons with Team 3473. Climb subsystem + full-bot.',
                status: 'archive',
                tone: 'neutral',
                year: '2024–26',
            },
            {
                href: '/work/combat',
                title: 'Team Infernope',
                blurb: 'Twelve combat robots, three years. 1st place EOY \'25.',
                status: 'archive',
                tone: 'neutral',
                year: '2022–25',
            },
        ],
    },
    {
        label: 'Software + Other',
        kicker: 'C.03',
        items: [
            {
                href: '/work/sprocketstats',
                title: 'SprocketStats',
                blurb: 'React · FastAPI · Postgres. Used at events.',
                status: 'shipped',
                tone: 'good',
                year: '2024 —',
            },
            {
                href: '/experiments',
                title: 'Experiments',
                blurb: 'tools, algorithms, experiments.',
                status: 'ongoing',
                tone: 'neutral',
                year: 'various',
            },
        ],
    },
];

/* ─────────────────────────────────────────────────────────────────
   Trigger + panel
   ───────────────────────────────────────────────────────────────── */

interface WorkMegamenuTriggerProps {
    active?: boolean;
}

export function WorkMegamenuTrigger({ active = false }: WorkMegamenuTriggerProps) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pathname = usePathname();

    const scheduleClose = useCallback(() => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => setOpen(false), 120);
    }, []);

    const cancelClose = useCallback(() => {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
    }, []);

    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: globalThis.KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    useEffect(() => { setOpen(false); }, [pathname]);

    const onTriggerKey = (e: ReactKeyboardEvent<HTMLAnchorElement>) => {
        if (e.key === 'ArrowDown' || (e.key === 'Enter' && !open)) {
            e.preventDefault();
            setOpen(true);
        }
    };

    return (
        <div
            ref={containerRef}
            // Desktop: hover to open. On touch/mobile the drawer handles nav,
            // but keep click-toggle as a fallback if rendered on small screens.
            onMouseEnter={() => { cancelClose(); setOpen(true); }}
            onMouseLeave={scheduleClose}
            className="relative inline-block"
        >
            <Link
                href="/work"
                onClick={() => setOpen(false)}
                onFocus={() => setOpen(true)}
                onKeyDown={onTriggerKey}
                aria-haspopup="true"
                aria-expanded={open}
                aria-controls="work-megamenu"
                className={`
                    relative
                    inline-flex items-center gap-1
                    py-1 no-underline
                    font-mono text-xs tracking-[0.08em] uppercase
                    transition-colors duration-150
                    hover:text-accent
                    ${active ? 'text-fg font-semibold' : 'text-fg-muted'}
                `}
            >
                Work
                <span
                    aria-hidden
                    className={`
                        inline-block text-[10px] opacity-70
                        transition-transform duration-200
                        ${open ? 'rotate-180' : 'rotate-0'}
                    `}
                >
                    ▾
                </span>
                {active && (
                    <span
                        aria-hidden
                        className="absolute left-0 right-0 -bottom-[2px] h-[2px] bg-accent rounded-full"
                    />
                )}
            </Link>

            <MegamenuPanel open={open} onClose={() => setOpen(false)} />
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────
   Panel
   ───────────────────────────────────────────────────────────────── */

function MegamenuPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
    return (
        <div
            id="work-megamenu"
            role="menu"
            aria-hidden={!open}
            className={`
                absolute top-[calc(100%+12px)] left-1/2 z-50
                w-[min(780px,calc(100vw-32px))]
                bg-bg-elev border border-rule rounded-md
                px-4 sm:px-7 pt-5 sm:pt-6 pb-4 sm:pb-5
                shadow-[0_1px_0_var(--rule),_0_24px_48px_-12px_rgba(0,0,0,0.32)]
                transition-[opacity,transform] duration-200 ease-out
                ${open
                ? 'opacity-100 -translate-x-1/2 translate-y-0 scale-100 pointer-events-auto'
                : 'opacity-0 -translate-x-1/2 -translate-y-1 scale-[0.985] pointer-events-none'}
            `}
        >
            {/*
                Desktop: 3-column grid.
                Tablet/mobile: single stacked column (panel is unlikely
                to show on phones since header uses the drawer, but handles
                edge cases like landscape phones or narrow tablets).
            */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8">
                {COLUMNS.map((col) => (
                    <Column key={col.label} column={col} onItemClick={onClose} />
                ))}
            </div>

            <hr className="border-0 border-t border-rule my-4 sm:my-5 mb-3" />

            <div className="flex justify-between items-center font-mono text-[11px] tracking-mono text-fg-soft">
                <span>indexed 2026.05</span>
                <span className="flex gap-[18px]">
                    <FooterLink href="/now"  onClick={onClose}>Now →</FooterLink>
                    <FooterLink href="/work" onClick={onClose}>All work →</FooterLink>
                </span>
            </div>
        </div>
    );
}

function Column({ column, onItemClick }: { column: MenuColumn; onItemClick: () => void }) {
    return (
        <div>
            <div className="flex items-baseline gap-2 pb-2 mb-2.5 border-b border-rule">
                <span className="font-mono text-[10px] tracking-[0.16em] text-accent">
                    {column.kicker}
                </span>
                <span className="font-mono text-[11px] tracking-kicker uppercase text-fg-soft">
                    {column.label}
                </span>
            </div>

            <ul className="list-none m-0 p-0 flex flex-col gap-0.5">
                {column.items.map((item) => (
                    <li key={item.href}>
                        <MenuLink item={item} onClick={onItemClick} />
                    </li>
                ))}
            </ul>
        </div>
    );
}

function MenuLink({ item, onClick }: { item: MenuItem; onClick: () => void }) {
    return (
        <Link
            href={item.href}
            onClick={onClick}
            role="menuitem"
            className="
                block py-2.5 pl-3 pr-2.5 -mx-2.5 rounded
                no-underline text-fg
                transition-colors duration-150
                hover:bg-accent-soft focus:bg-accent-soft focus:outline-none
            "
        >
            <div className="flex justify-between items-baseline gap-3">
                <span className="font-sans text-sm font-semibold text-fg tracking-[-0.005em]">
                    {item.title}
                </span>
                <span className="font-mono text-[10px] text-fg-soft whitespace-nowrap">
                    {item.year}
                </span>
            </div>

            <p className="mt-[3px] mb-1.5 text-[12.5px] text-fg-muted leading-snug">
                {item.blurb}
            </p>

            <StatusPill tone={item.tone}>{item.status}</StatusPill>
        </Link>
    );
}

function FooterLink({
                        href,
                        onClick,
                        children,
                    }: {
    href: string;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="text-accent no-underline tracking-mono hover:underline underline-offset-4"
        >
            {children}
        </Link>
    );
}

/* ─────────────────────────────────────────────────────────────────
   Inline StatusPill — duplicated so menu.tsx is self-contained.
   ───────────────────────────────────────────────────────────────── */

const TONE_DOT: Record<Tone, string> = {
    good:    'bg-good',
    warn:    'bg-warn',
    bad:     'bg-bad',
    neutral: 'bg-fg-soft',
};

function StatusPill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-1.5 px-2 py-px border border-rule rounded-full font-mono text-[10px] tracking-[0.08em] uppercase text-fg-muted">
            <span aria-hidden className={`w-[5px] h-[5px] rounded-full shrink-0 ${TONE_DOT[tone]}`} />
            {children}
        </span>
    );
}