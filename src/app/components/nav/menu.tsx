'use client';

/**
 * Megamenu — opens off the "Work" nav item in the site Header.
 *
 * Hover-open with a 120ms close-delay so a fast cursor doesn't flicker.
 * Closes on outside click, on Escape, and on route change. ArrowDown
 * on the trigger opens it for keyboard users.
 *
 *   <WorkMegamenuTrigger active={pathname.startsWith('/work')} />
 *
 * Three categorised columns (Robotics / Drones / Software), each
 * item a Link with a StatusPill. Footer rule with "All work →" and
 * "Lab →" shortcuts.
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
   Data — single source of truth for the panel.
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
        label: 'Robotics',
        kicker: 'C.01',
        items: [
            {
                href: '/work/sprocket-frc',
                title: 'Sprocket — FRC CAD',
                blurb: 'Climb subsystem ’24-25, full-bot ’25-26.',
                status: 'competing',
                tone: 'warn',
                year: '2024 —',
            },
            {
                href: '/work/combat',
                title: 'Team Infernope',
                blurb: 'Twelve combat robots, three years. 1st EOY ’25.',
                status: 'archive',
                tone: 'neutral',
                year: '2022–25',
            },
            {
                href: '/work/harbinger',
                title: 'Harbinger Turret',
                blurb: 'Differential-drive turret, closed-loop heading.',
                status: 'shelved',
                tone: 'neutral',
                year: '2025',
            },
        ],
    },
    {
        label: 'Drones',
        kicker: 'C.02',
        items: [
            {
                href: '/work/aetherius',
                title: 'Aetherius UAV',
                blurb: 'Fixed-wing, Pixhawk, custom MAVLink GCS.',
                status: 'building',
                tone: 'warn',
                year: '2024 —',
            },
            {
                href: '/work/aetherius-gcs',
                title: 'Aetherius GCS',
                blurb: 'Tauri-based ground station. MAVLink over UDP/serial.',
                status: 'building',
                tone: 'warn',
                year: '2025 —',
            },
        ],
    },
    {
        label: 'Software',
        kicker: 'C.03',
        items: [
            {
                href: '/work/sprocketstats',
                title: 'SprocketStats',
                blurb: 'Real-time scouting + analytics. React · FastAPI · Postgres.',
                status: 'shipped',
                tone: 'good',
                year: '2024 —',
            },
            {
                href: '/work/match-replay',
                title: 'Match Replay',
                blurb: 'FRC match video annotator. Browser-only, ffmpeg-wasm.',
                status: 'shipped',
                tone: 'good',
                year: '2025',
            },
            {
                href: '/work/portfolio',
                title: 'This site',
                blurb: 'Tokenised, hand-rolled, three palettes.',
                status: 'shipped',
                tone: 'good',
                year: '2026',
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

    // Close on outside click.
    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [open]);

    // Close on Escape.
    useEffect(() => {
        if (!open) return;
        const onKey = (e: globalThis.KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    // Close on route change.
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
                w-[760px] max-w-[calc(100vw-32px)]
                bg-bg-elev border border-rule rounded-md
                px-7 pt-6 pb-5
                shadow-[0_1px_0_var(--rule),_0_24px_48px_-12px_rgba(0,0,0,0.32)]
                transition-[opacity,transform] duration-200 ease-out
                ${open
                ? 'opacity-100 -translate-x-1/2 translate-y-0 scale-100 pointer-events-auto'
                : 'opacity-0 -translate-x-1/2 -translate-y-1 scale-[0.985] pointer-events-none'}
            `}
        >
            <div className="grid grid-cols-3 gap-8">
                {COLUMNS.map((col) => (
                    <Column key={col.label} column={col} onItemClick={onClose} />
                ))}
            </div>

            <hr className="border-0 border-t border-rule my-5 mb-3" />

            <div className="flex justify-between items-center font-mono text-[11px] tracking-mono text-fg-soft">
                <span>11 projects · indexed 2026.05</span>
                <span className="flex gap-[18px]">
                    <FooterLink href="/lab" onClick={onClose}>Lab →</FooterLink>
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
    good: 'bg-good',
    warn: 'bg-warn',
    bad: 'bg-bad',
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