'use client';

/**
 * Header — site nav bar.
 *
 * Sticky, hairline-bottomed, token-driven. Auto-derives the active
 * nav item from the current pathname so callers don't pass it.
 *
 * Desktop:
 *   [ MW · Mark Wu — student engineer ]   [ Work▾ Lab Now About Contact | ● Open ]
 *
 * Mobile:
 *   [ MW · Mark Wu ]   [ ● Open | ☰ ]
 *   → hamburger opens a full-screen drawer with all nav links
 *
 * Music removed from nav — it's a small single page, accessible via
 * /work or direct URL. Search hint removed — no implementation behind it.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { WorkMegamenuTrigger } from './menu';

export function Header() {
    const active = routeToKey(usePathname());
    const [drawerOpen, setDrawerOpen] = useState(false);
    const drawerRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    // Close drawer on route change
    useEffect(() => { setDrawerOpen(false); }, [pathname]);

    // Close on Escape
    useEffect(() => {
        if (!drawerOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [drawerOpen]);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        document.body.style.overflow = drawerOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [drawerOpen]);

    return (
        <>
            <header
                className="
                    sticky top-0 z-40
                    border-b border-rule
                    bg-[color-mix(in_srgb,var(--bg)_92%,transparent)]
                    backdrop-saturate-150 backdrop-blur-md
                "
            >
                <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-[14px] flex items-center justify-between gap-6">
                    <Wordmark />

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-[22px]">
                        <WorkMegamenuTrigger active={active === 'work'} />
                        <NavLink href="/experiments" active={active === 'experiments'}>Experiments</NavLink>
                        <NavLink href="/now"     active={active === 'now'}>Now</NavLink>
                        <NavLink href="/about"   active={active === 'about'}>About</NavLink>
                        <NavLink href="/contact" active={active === 'contact'}>Contact</NavLink>
                        <AvailabilityPill />
                    </nav>

                    {/* Mobile right side */}
                    <div className="flex md:hidden items-center gap-3">
                        <AvailabilityPill />
                        <button
                            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={drawerOpen}
                            aria-controls="mobile-drawer"
                            onClick={() => setDrawerOpen((v) => !v)}
                            className="
                                inline-flex items-center justify-center
                                w-8 h-8 rounded
                                text-fg-muted hover:text-fg
                                transition-colors duration-150
                                focus:outline-none focus-visible:ring-2 focus-visible:ring-accent
                            "
                        >
                            {/* Animated hamburger → X */}
                            <span className="relative flex flex-col gap-[5px] w-[18px]">
                                <span className={`block h-[1.5px] w-full bg-current rounded-full origin-center transition-transform duration-200 ${drawerOpen ? 'translate-y-[6.5px] rotate-45' : ''}`} />
                                <span className={`block h-[1.5px] w-full bg-current rounded-full transition-opacity duration-200 ${drawerOpen ? 'opacity-0' : ''}`} />
                                <span className={`block h-[1.5px] w-full bg-current rounded-full origin-center transition-transform duration-200 ${drawerOpen ? '-translate-y-[6.5px] -rotate-45' : ''}`} />
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile drawer overlay */}
            <div
                aria-hidden={!drawerOpen}
                onClick={() => setDrawerOpen(false)}
                className={`
                    fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden
                    transition-opacity duration-200
                    ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
                `}
            />

            {/* Mobile drawer panel */}
            <div
                id="mobile-drawer"
                ref={drawerRef}
                aria-hidden={!drawerOpen}
                className={`
                    fixed top-0 right-0 bottom-0 z-50 w-[min(320px,100vw)]
                    bg-bg border-l border-rule
                    flex flex-col
                    md:hidden
                    transition-transform duration-300 ease-out
                    ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}
                `}
            >
                {/* Drawer header */}
                <div className="flex items-center justify-between px-5 py-[14px] border-b border-rule">
                    <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-fg-soft">
                        Navigation
                    </span>
                    <button
                        aria-label="Close menu"
                        onClick={() => setDrawerOpen(false)}
                        className="text-fg-muted hover:text-fg transition-colors duration-150 focus:outline-none"
                    >
                        <span className="font-mono text-base leading-none">✕</span>
                    </button>
                </div>

                {/* Drawer links */}
                <nav className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-1">
                    <DrawerLink href="/work" active={active === 'work'} onClick={() => setDrawerOpen(false)}>
                        Work
                    </DrawerLink>
                    <DrawerLink href="/experiments" active={active === 'experiments'} onClick={() => setDrawerOpen(false)}>
                        Experiments
                    </DrawerLink>
                    <DrawerLink href="/now" active={active === 'now'} onClick={() => setDrawerOpen(false)}>
                        Now
                    </DrawerLink>
                    <DrawerLink href="/about" active={active === 'about'} onClick={() => setDrawerOpen(false)}>
                        About
                    </DrawerLink>
                    <DrawerLink href="/contact" active={active === 'contact'} onClick={() => setDrawerOpen(false)}>
                        Contact
                    </DrawerLink>
                </nav>

                {/* Drawer footer */}
                <div className="px-5 py-4 border-t border-rule">
                    <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-fg-soft">
                        v1 · 2026.05
                    </span>
                </div>
            </div>
        </>
    );
}

/* ─────────────────────────────────────────────────────────────────
   Routing → active-key resolver. Longest-prefix match so
   /work/harbinger still highlights "Work".
   ───────────────────────────────────────────────────────────────── */

type ActiveKey = 'home' | 'work' | 'experiments' | 'now' | 'about' | 'contact';

function routeToKey(pathname: string | null): ActiveKey {
    if (!pathname || pathname === '/') return 'home';
    if (pathname.startsWith('/work'))        return 'work';
    if (pathname.startsWith('/experiments')) return 'experiments';
    if (pathname.startsWith('/now'))         return 'now';
    if (pathname.startsWith('/about'))       return 'about';
    if (pathname.startsWith('/contact'))     return 'contact';
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
            {/* Hide tagline on very small screens */}
            <span className="hidden sm:inline text-[13px] text-fg-muted font-normal">— student engineer</span>
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

function DrawerLink({
                        href,
                        active,
                        onClick,
                        children,
                    }: {
    href: string;
    active?: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`
                flex items-center justify-between
                px-3 py-3 rounded
                font-mono text-xs tracking-[0.08em] uppercase
                no-underline transition-colors duration-150
                ${active
                ? 'text-fg font-semibold bg-accent-soft'
                : 'text-fg-muted hover:text-fg hover:bg-accent-soft'}
            `}
        >
            {children}
            {active && (
                <span aria-hidden className="w-[5px] h-[5px] rounded-full bg-accent shrink-0" />
            )}
        </Link>
    );
}

function ActiveIndicator() {
    return (
        <span
            aria-hidden
            className="absolute left-0 right-0 -bottom-[2px] h-[2px] bg-accent rounded-full"
        />
    );
}

/* Live availability indicator. Pulsing green dot signals open status. */
function AvailabilityPill() {
    return (
        <span
            className="
                inline-flex items-center gap-2
                pl-2 pr-2.5 py-1
                border border-rule rounded-full
                font-mono text-[10px] tracking-[0.08em] uppercase
                text-fg-muted whitespace-nowrap
            "
        >
            <span aria-hidden className="relative inline-flex w-[6px] h-[6px]">
                <span className="absolute inset-0 rounded-full bg-good opacity-60 animate-ping" />
                <span className="relative inline-block w-[6px] h-[6px] rounded-full bg-good" />
            </span>
            {/* Shorten label on very small screens */}
            <span className="hidden sm:inline">Open · Summer &#39;26</span>
            <span className="sm:hidden">Open</span>
        </span>
    );
}