'use client';

/**
 * Header — site nav bar.
 *
 * Sticky, hairline-bottomed, token-driven. Auto-derives the active
 * nav item from the current pathname so callers don't pass it.
 *
 *   [ MW · Mark Wu — student engineer ]   [ Work▾ Lab Music Now About Contact | ⌘K ]
 *
 * The Work item embeds the megamenu trigger from ./menu. Everything
 * else is a plain link.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { WorkMegamenuTrigger } from './menu';

export function Header() {
    const active = routeToKey(usePathname());

    return (
        <header
            className="
                sticky top-0 z-40
                border-b border-rule
                bg-[color-mix(in_srgb,var(--bg)_92%,transparent)]
                backdrop-saturate-150 backdrop-blur-md
            "
        >
            <div className="max-w-[1100px] mx-auto px-8 py-[14px] flex items-center justify-between gap-6">
                <Wordmark />

                <nav className="flex items-center gap-[22px]">
                    <WorkMegamenuTrigger active={active === 'work'} />
                    <NavLink href="/lab" active={active === 'lab'}>Lab</NavLink>
                    <NavLink href="/music" active={active === 'music'}>Music</NavLink>
                    <NavLink href="/now" active={active === 'now'}>Now</NavLink>
                    <NavLink href="/about" active={active === 'about'}>About</NavLink>
                    <NavLink href="/contact" active={active === 'contact'}>Contact</NavLink>

                    <SearchHint />
                    <AvailabilityPill />
                </nav>
            </div>
        </header>
    );
}

/* ─────────────────────────────────────────────────────────────────
   Routing → active-key resolver. Longest-prefix match so
   /work/aetherius still highlights "Work".
   ───────────────────────────────────────────────────────────────── */

type ActiveKey = 'home' | 'work' | 'lab' | 'music' | 'now' | 'about' | 'contact';

function routeToKey(pathname: string | null): ActiveKey {
    if (!pathname || pathname === '/') return 'home';
    if (pathname.startsWith('/work')) return 'work';
    if (pathname.startsWith('/lab')) return 'lab';
    if (pathname.startsWith('/music')) return 'music';
    if (pathname.startsWith('/now')) return 'now';
    if (pathname.startsWith('/about')) return 'about';
    if (pathname.startsWith('/contact')) return 'contact';
    return 'home';
}

/* ─────────────────────────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────────────────────────── */

function Wordmark() {
    return (
        <Link
            href="/"
            aria-label="Mark Wu — home"
            className="inline-flex items-baseline gap-[10px] no-underline text-fg"
        >
            <span
                aria-hidden
                className="font-mono text-[11px] tracking-kicker text-accent border border-rule-strong rounded-sm px-[6px] py-[3px]"
            >
                MW
            </span>
            <span className="text-sm font-semibold tracking-[-0.01em]">Mark Wu</span>
            <span className="text-[13px] text-fg-muted font-normal">— student engineer</span>
        </Link>
    );
}

function NavLink({
                     href,
                     active,
                     children,
                 }: {
    href: string;
    active?: boolean;
    children: ReactNode;
}) {
    return (
        <Link
            href={href}
            className={`
                relative
                font-mono text-xs tracking-[0.08em] uppercase
                py-1 no-underline
                transition-colors duration-150
                hover:text-accent
                ${active ? 'text-fg font-semibold' : 'text-fg-muted'}
            `}
        >
            {children}
            {active && <ActiveIndicator />}
        </Link>
    );
}

/* Short accent-coloured underline beneath the active nav item.
   Sits inside the link via an absolute span so it spans the link's
   text width via left:0 right:0. The 2px offset below the baseline
   matches the design's "tight underline" look.

   Duplicated in menu.tsx for the Work trigger. If you ever change
   the look, update both. */
function ActiveIndicator() {
    return (
        <span
            aria-hidden
            className="absolute left-0 right-0 -bottom-[2px] h-[2px] bg-accent rounded-full"
        />
    );
}

function SearchHint() {
    return (
        <button
            type="button"
            aria-label="Search (⌘K)"
            className="
                inline-flex items-center gap-2
                ml-2 pl-3 pr-1.5 py-1
                bg-bg-elev border border-rule rounded
                font-mono text-[11px] text-fg-soft
                transition-colors duration-150
                hover:border-rule-strong
            "
        >
            <span>Search</span>
            <span className="flex items-center gap-1">
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
            </span>
        </button>
    );
}

/* Live availability indicator. Greens dot + label, sitting at the
   far right of the nav. Status is hardcoded for now — when you wire
   up real availability state, swap `OPEN · SUMMER '26` for a value
   pulled from a config or CMS, and toggle the dot tone accordingly. */
function AvailabilityPill() {
    return (
        <span
            className="
                inline-flex items-center gap-2
                pl-2 pr-2.5 py-1
                border border-rule rounded-full
                font-mono text-[10px] tracking-[0.08em] uppercase
                text-fg-muted
            "
        >
            <span aria-hidden className="relative inline-flex w-[6px] h-[6px]">
                {/* ping animation — purely cosmetic, indicates "live" */}
                <span className="absolute inset-0 rounded-full bg-good opacity-60 animate-ping" />
                <span className="relative inline-block w-[6px] h-[6px] rounded-full bg-good" />
            </span>
            Open · Summer ’26
        </span>
    );
}

function Kbd({ children }: { children: ReactNode }) {
    return (
        <kbd className="inline-flex items-center justify-center min-w-[18px] px-[5px] py-px font-mono text-[11px] text-fg-muted bg-bg-elev border border-rule border-b-rule-strong rounded-sm">
            {children}
        </kbd>
    );
}