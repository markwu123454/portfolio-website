"use client";

import Link from "next/link";
import {Menu, X, ChevronRight} from "lucide-react";
import {useCallback, useEffect, useReducer, useRef, useState} from "react";
import {usePathname} from "next/navigation";

/* ─── Types ─── */

type SubLink = { label: string; href: string };
export type NavItem = {
    label: string;
    href: string;
    menu?: { heading: string; blurb?: string; links: SubLink[] };
};

/* ─── Nav data ─── */

const NAV: NavItem[] = [
    {
        label: "Team Sprocket",
        href: "/teamsprocket",
        menu: {
            heading: "TEAM SPROCKET 3473",
            links: [
                {label: "Overview", href: "/teamsprocket"},
                {label: "Official Website", href: "https://www.team3473.com/"},
                {label: "Cad", href: "/teamsprocket/cad"},
                {label: "Scouting", href: "/teamsprocket/scouting"}
            ],
            blurb:
                "Team Sprocket is a student-centered FIRST Robotics Competition team. I am a member of the CAD subteam and developed the team's newest scouting application. The team earned the FIRST Impact Award at regionals and advanced to the World Championships in both 2024 and 2025."
        }
    },
    {
        label: "Dronescape",
        href: "/dronescape",
        menu: {
            heading: "DRONESCAPE CLUB",
            links: [
                {label: "Overview", href: "/dronescape"},
                {label: "Official Website", href: "https://www.dronescapeclub.org/"},
                {label: "Aetherius UAV", href: "/dronescape/uav"},
                {label: "Aetherius GCS", href: "/dronescape/gcs"}
            ],
            blurb:
                "Dronescape is a competitive FPV racing club with a cinematic, racing, and engineering subteam. I lead an engineering project to step the club into fixed wing UAVs beyond multi-rotor or racing drones."
        }
    },
    {
        label: "Other projects",
        href: "/misc",
        menu: {
            heading: "OTHER PROJECTS",
            links: [
                {label: "Portfolio website(this)", href: "/misc/portfolio"},
                //{label: "Project Tempest", href: "/misc/projecttempest"},
                {label: "Smaller Projects", href: "/misc/random"},
                //{label: "The Scavengers", href: "/misc/scavenger"},
                {label: "Musical Compositions", href: "/misc/music"},
                {label: "Vex V5 Projects", href: "/misc/vex"},
                {label: "Harbinger", href: "/misc/harbinger"},
            ],
            blurb: "A list of other smaller projects or ones I contributed less."
        }
    },
    {
        label: "Past projects",
        href: "/legacy",
        menu: {
            heading: "LEGACY PROJECTS",
            links: [
                //{label: "The GradeBook", href: "/legacy/ratemyteacher"},
                {label: "Team Infernope", href: "/legacy/teaminfernope"},
                //{label: "SigmaCat Robotics", href: "/legacy/sigmacat"}
            ],
            blurb: "An archive of past teams, projects, and competitions I've contributed to."
        }
    }
];

/* ─── Shared decorative components ─── */

function Scanlines() {
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.04]
            [background-image:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.1)_2px,rgba(255,255,255,0.1)_3px)]"
        />
    );
}

function PlusMinus({active}: { active: boolean }) {
    return (
        <span className="relative ml-0.5 inline-flex h-3 w-3 items-center justify-center">
            <span className="absolute h-[2px] w-full bg-current"/>
            <span
                className={[
                    "absolute w-[2px] h-full bg-current origin-center transform",
                    "transition-transform duration-150 ease-out",
                    active ? "scale-y-0" : "scale-y-100"
                ].join(" ")}
            />
        </span>
    );
}

/* ─── Menu state reducer ─── */

type MenuState = {
    megaOpen: boolean;
    active: NavItem | null;
    mobileOpen: boolean;
    mobileActive: string | null;
    hidden: boolean;
};

type MenuAction =
    | { type: "SHOW_MEGA"; item: NavItem }
    | { type: "CLOSE_MEGA" }
    | { type: "CLEAR_ACTIVE" }
    | { type: "TOGGLE_MOBILE" }
    | { type: "CLOSE_MOBILE" }
    | { type: "SET_MOBILE_ACTIVE"; id: string | null }
    | { type: "HIDE" }
    | { type: "REVEAL" }
    | { type: "RESET" };

const initialMenuState: MenuState = {
    megaOpen: false,
    active: null,
    mobileOpen: false,
    mobileActive: null,
    hidden: false,
};

function menuReducer(state: MenuState, action: MenuAction): MenuState {
    switch (action.type) {
        case "SHOW_MEGA":
            return {
                ...state,
                megaOpen: true,
                active: action.item,
                mobileOpen: false,
                mobileActive: null,
                hidden: false,
            };
        case "CLOSE_MEGA":
            return {...state, megaOpen: false};
        case "CLEAR_ACTIVE":
            return {...state, active: null};
        case "TOGGLE_MOBILE": {
            const next = !state.mobileOpen;
            return {
                ...state,
                mobileOpen: next,
                megaOpen: next ? false : state.megaOpen,
                mobileActive: next ? state.mobileActive : null,
                hidden: next ? false : state.hidden,
            };
        }
        case "CLOSE_MOBILE":
            return {...state, mobileOpen: false, mobileActive: null};
        case "SET_MOBILE_ACTIVE":
            return {...state, mobileActive: action.id};
        case "HIDE":
            return {...state, hidden: true};
        case "REVEAL":
            return {...state, hidden: false};
        case "RESET":
            return initialMenuState;
        default:
            return state;
    }
}

/* ─── Helpers & constants ─── */

const toSlug = (s: string) => s.replace(/\s+/g, "-").toLowerCase();

const SCROLL_MIN_DELTA = 8;
const SCROLL_MIN_START = 72;
const MEGA_FADE_MS = 200; // matches duration-200 on the panel

/* ═══════════════════════════════════════════
   Header
   ═══════════════════════════════════════════ */

export function Header() {
    const [state, dispatch] = useReducer(menuReducer, initialMenuState);
    const {megaOpen, active, mobileOpen, mobileActive, hidden} = state;

    const [armed, setArmed] = useState(false);

    const panelRef = useRef<HTMLDivElement | null>(null);
    const pathname = usePathname();

    // Refs so the scroll handler doesn't need to re-bind on menu changes
    const megaOpenRef = useRef(megaOpen);
    const mobileOpenRef = useRef(mobileOpen);
    megaOpenRef.current = megaOpen;
    mobileOpenRef.current = mobileOpen;

    // ── Hydration gate: single rAF to arm animations after paint ──
    useEffect(() => {
        const id = requestAnimationFrame(() => setArmed(true));
        return () => cancelAnimationFrame(id);
    }, []);

    // ── Hide-on-scroll (stable listener, reads refs) ──
    useEffect(() => {
        const el = document.getElementById("content-scroll");
        if (!el) return;

        let lastY = el.scrollTop;
        let ticking = false;

        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const y = el.scrollTop;
                const dy = y - lastY;

                if (megaOpenRef.current || mobileOpenRef.current) {
                    dispatch({type: "REVEAL"});
                } else if (Math.abs(dy) > SCROLL_MIN_DELTA) {
                    if (y > SCROLL_MIN_START && dy > 0) dispatch({type: "HIDE"});
                    else if (dy < 0) dispatch({type: "REVEAL"});
                }

                lastY = y <= 0 ? 0 : y;
                ticking = false;
            });
        };

        el.addEventListener("scroll", onScroll, {passive: true});
        return () => el.removeEventListener("scroll", onScroll);
    }, [pathname]); // re-bind only on route change (scroll element might remount)

    // ── Deferred active clear after mega fade-out ──
    useEffect(() => {
        const el = panelRef.current;
        if (!el || megaOpen) return;

        let cleared = false;
        const onEnd = (e: TransitionEvent) => {
            if (e.propertyName !== "opacity") return;
            cleared = true;
            dispatch({type: "CLEAR_ACTIVE"});
        };
        el.addEventListener("transitionend", onEnd);

        // Fallback if transitionend never fires (interrupted, display:none, etc.)
        const fallback = setTimeout(() => {
            if (!cleared) dispatch({type: "CLEAR_ACTIVE"});
        }, MEGA_FADE_MS + 50);

        return () => {
            el.removeEventListener("transitionend", onEnd);
            clearTimeout(fallback);
        };
    }, [megaOpen]);

    // ── Close everything on route change ──
    useEffect(() => {
        dispatch({type: "RESET"});
    }, [pathname]);

    // ── Handlers ──

    const showMega = useCallback((item: NavItem) => {
        if (!item.menu) return;
        dispatch({type: "SHOW_MEGA", item});
    }, []);

    const closeMega = useCallback(() => {
        dispatch({type: "CLOSE_MEGA"});
    }, []);

    const closeMobile = useCallback(() => {
        dispatch({type: "CLOSE_MOBILE"});
    }, []);

    const onKeyDown: React.KeyboardEventHandler<HTMLElement> = (e) => {
        if (e.key === "Escape") dispatch({type: "RESET"});
    };

    const panelId = active
        ? `mega-${toSlug(active.label)}`
        : undefined;

    // armed implies mounted — no separate mounted state needed
    const mounted = armed;

    return (
        <header
            className={[
                "fixed top-0 inset-x-0 z-50 h-24",
                "border-b border-white/[0.08]",
                "bg-black/50 backdrop-blur-2xl text-white",
                "transform-gpu transition-transform duration-300 ease-out",
                hidden ? "-translate-y-full" : "translate-y-0"
            ].join(" ")}
            onKeyDown={onKeyDown}
            data-ui-ready={mounted ? "true" : "false"}
            data-armed={armed ? "true" : "false"}
            onMouseLeave={closeMega}
            onMouseEnter={() => dispatch({type: "REVEAL"})}
        >
            {/* Scanlines overlay */}
            <Scanlines/>

            {/* Top accent line — subtle cyan/violet */}
            <div aria-hidden
                 className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-400/40 via-violet-400/20 to-cyan-400/40"/>
            {/* Bottom accent line */}
            <div aria-hidden
                 className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-cyan-400/20 via-transparent to-violet-400/20"/>

            {/* Corner accents */}
            <div aria-hidden
                 className="absolute top-0 left-0 w-4 h-4 border-t border-l border-cyan-400/20 pointer-events-none"/>
            <div aria-hidden
                 className="absolute top-0 right-0 w-4 h-4 border-t border-r border-violet-400/20 pointer-events-none"/>

            <div className="relative z-[1] mx-auto flex h-24 items-center justify-between">

                {/* Logo */}
                <Link href="/"
                      className="group flex items-center gap-2.5 flex-shrink-0 fill-anim pl-4 h-full self-stretch pr-6">
                    <div
                        className="relative h-5 w-5 rounded-sm border border-cyan-400/30 bg-cyan-400/10 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.5)]"/>
                    </div>
                    <span
                        className="text-[11px] tracking-[0.2em] font-mono font-semibold text-white/80 group-hover:text-white transition-colors">
                        MARKWU
                    </span>
                </Link>

                {/* Divider */}
                <div className="mr-6 hidden w-px self-stretch bg-white/[0.06] md:block" aria-hidden/>

                {/* Center nav — desktop only */}
                <nav
                    className="hidden md:flex flex-grow justify-start gap-10"
                    role="navigation"
                    aria-label="Primary"
                >
                    {NAV.map((item) => {
                        const isActive = megaOpen && active?.label === item.label;
                        const itemId = `trigger-${toSlug(item.label)}`;
                        return (
                            <div key={item.label} className="relative"
                                 onMouseEnter={() => showMega(item)}>
                                <Link
                                    id={itemId}
                                    href={item.href}
                                    className={[
                                        "underline-swipe group relative inline-flex items-center gap-1.5",
                                        "text-[11px] tracking-[0.12em] font-mono font-medium uppercase",
                                        isActive ? "text-cyan-300" : "text-white/55",
                                        "transition-colors hover:text-white/90 focus:outline-none"
                                    ].join(" ")}
                                    onFocus={() => showMega(item)}
                                    onClick={closeMega}
                                    aria-haspopup={!!item.menu}
                                    aria-expanded={isActive}
                                    aria-controls={isActive ? panelId : undefined}
                                    data-underline={!mounted ? "idle" : isActive ? "on" : "off"}
                                >
                                    {item.label}
                                    {item.menu && <PlusMinus active={isActive}/>}
                                </Link>
                            </div>
                        );
                    })}
                </nav>

                {/* Divider */}
                <div className="hidden w-px self-stretch bg-white/[0.06] md:block" aria-hidden/>

                {/* Right: About */}
                <Link
                    href="/about"
                    className="hidden md:flex h-full self-stretch items-center px-8 text-[11px] tracking-[0.12em] font-mono uppercase text-white/55 hover:text-white/90 transition-colors fill-anim"
                >
                    About me
                </Link>

                {/* Divider */}
                <div className="hidden w-px self-stretch bg-white/[0.06] md:block" aria-hidden/>

                {/* Right: Contact + Mobile toggle */}
                <div className="flex h-full self-stretch items-center flex-shrink-0">
                    <Link
                        href="/contact"
                        className="hidden md:flex h-full self-stretch items-center px-8 text-[11px] tracking-[0.12em] font-mono uppercase text-white/55 hover:text-white/90 transition-colors fill-anim"
                    >
                        Contact
                    </Link>

                    {/* Mobile toggle */}
                    <button
                        className="md:hidden px-4 h-full flex items-center text-white/50 hover:text-white/80 transition-colors"
                        aria-label="Toggle menu"
                        onClick={() => dispatch({type: "TOGGLE_MOBILE"})}
                    >
                        {mobileOpen ? <X size={20}/> : <Menu size={20}/>}
                    </button>
                </div>

            </div>

            {/* ════════ DESKTOP MEGA PANEL ════════ */}
            <div
                ref={panelRef}
                id={panelId}
                role="region"
                aria-label={active?.label || undefined}
                className={[
                    "mega",
                    "absolute left-1/2 top-[calc(100%+1px)] w-screen -translate-x-1/2",
                    "hidden md:block transition-opacity duration-200",
                    "rounded-b-xl border border-white/[0.08] bg-black/80 backdrop-blur-2xl",
                    "shadow-[0_24px_60px_-12px_rgba(0,0,0,0.5)]",
                    megaOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
                ].join(" ")}
                onMouseEnter={() => megaOpen && dispatch({type: "REVEAL"})}
                onMouseLeave={closeMega}
            >
                {/* Scanlines */}
                <Scanlines/>

                {/* Subtle corner glows */}
                <span
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-400/10 blur-3xl"
                />
                <span
                    aria-hidden
                    className="pointer-events-none absolute -left-10 -bottom-4 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl"
                />

                {/* Corner brackets */}
                <div aria-hidden
                     className="absolute top-3 left-3 h-4 w-4 border-t border-l border-cyan-400/20 pointer-events-none"/>
                <div aria-hidden
                     className="absolute bottom-3 right-3 h-4 w-4 border-b border-r border-violet-400/20 pointer-events-none"/>

                <div className="mx-auto max-w-7xl px-8 py-10">
                    <div
                        className="grid grid-cols-1 items-stretch gap-x-10 md:grid-cols-[1fr_auto_1fr]">
                        {/* Left column: links */}
                        <div className="pb-8 md:pb-0 md:pr-10">
                            <p className="mb-5 text-[9px] tracking-[0.2em] text-cyan-400/60 font-mono">
                                {active?.menu?.heading ?? ""}
                            </p>
                            <ul className="space-y-3">
                                {active?.menu?.links.map((l) => (
                                    <li key={l.href}>
                                        <Link
                                            href={l.href}
                                            className="underline-swipe neon-swipe group flex items-center gap-2.5 text-lg font-semibold text-white/80 hover:text-white transition-colors"
                                            onClick={closeMega}
                                        >
                                            <div
                                                className="h-1 w-1 rounded-full bg-cyan-400/40 group-hover:bg-cyan-400 transition-colors"/>
                                            {l.label}
                                        </Link>
                                    </li>
                                )) || null}
                            </ul>
                        </div>

                        {/* Middle divider */}
                        <div className="hidden h-full w-px bg-white/[0.06] md:block"/>

                        {/* Right column: blurb */}
                        <div className="pt-8 md:pt-0 flex flex-col justify-between">
                            {active?.menu?.blurb && (
                                <>
                                    <p className="mb-3 text-[9px] tracking-[0.2em] text-white/35 font-mono">
                                        DESCRIPTION
                                    </p>
                                    <p className="max-w-prose text-xs leading-relaxed text-white/55">
                                        {active.menu.blurb}
                                    </p>
                                </>
                            )}

                            {/* Telemetry readout */}
                            <div
                                className="mt-6 flex gap-4 text-[9px] tracking-[0.12em] text-white/25 font-mono select-none">
                                <span>NAV:{active?.label.toUpperCase().replace(/\s/g, "_") ?? "---"}</span>
                                <span>LINKS:{String(active?.menu?.links.length ?? 0).padStart(2, "0")}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* ════════ MOBILE BREAKAWAY PANEL ════════ */}
            <div
                className={[
                    "md:hidden fixed inset-x-0 top-0 z-40",
                    "transform transition-transform duration-300 ease-out will-change-transform",
                    mobileOpen ? "translate-y-0" : "-translate-y-full"
                ].join(" ")}
                aria-hidden={!mobileOpen}
            >
                <div className="pt-2 bg-black/90 backdrop-blur-2xl border-b border-white/[0.08]">

                    {/* Scanlines */}
                    <Scanlines/>

                    {/* Panel header row */}
                    <div
                        className="relative z-[1] px-4 pb-2 flex items-center justify-between border-b border-white/[0.06]">
                        <div className="flex items-center gap-2.5">
                            <div
                                className="h-[7px] w-[7px] rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)] animate-pulse"/>
                            <span className="text-[10px] tracking-[0.2em] text-white/50 font-mono">
                                NAVIGATION
                            </span>
                        </div>
                        <button
                            onClick={closeMobile}
                            className="p-2 text-white/40 hover:text-white/80 transition-colors"
                            aria-label="Close menu"
                        >
                            <X size={18}/>
                        </button>
                    </div>

                    <nav aria-label="Mobile Primary" className="relative z-[1] px-4 py-2">
                        <ul className="divide-y divide-white/[0.06]">

                            {/* Expandable nav groups */}
                            {NAV.map((item) => {
                                const id = `m-${toSlug(item.label)}`;
                                const expanded = mobileActive === id;

                                return (
                                    <li key={id} className="py-1">
                                        <button
                                            className={[
                                                "flex w-full items-center justify-between py-4 text-left",
                                                "text-[11px] tracking-[0.12em] font-mono font-semibold uppercase",
                                                expanded ? "text-cyan-300" : "text-white/55"
                                            ].join(" ")}
                                            aria-controls={`${id}-panel`}
                                            aria-expanded={expanded}
                                            onClick={() =>
                                                dispatch({
                                                    type: "SET_MOBILE_ACTIVE",
                                                    id: expanded ? null : id,
                                                })
                                            }
                                        >
                                            <span className="inline-flex items-center gap-2">
                                                <div className={[
                                                    "h-1 w-1 rounded-full transition-colors",
                                                    expanded ? "bg-cyan-400" : "bg-white/20"
                                                ].join(" ")}/>
                                                {item.label}
                                                {item.menu ? <PlusMinus active={expanded}/> : null}
                                            </span>

                                            <ChevronRight
                                                size={14}
                                                className={[
                                                    "transition-transform duration-200",
                                                    expanded ? "rotate-90 text-cyan-400/60" : "rotate-0 text-white/25"
                                                ].join(" ")}
                                                aria-hidden
                                            />
                                        </button>

                                        {/* Collapsible sublinks */}
                                        <div
                                            id={`${id}-panel`}
                                            className={[
                                                "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
                                                expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                            ].join(" ")}
                                        >
                                            <div className="min-h-0 overflow-hidden">
                                                {item.menu ? (
                                                    <div
                                                        className="pb-4 pl-4 border-l border-white/[0.06] ml-1">

                                                        {item.menu.heading && (
                                                            <p className="mb-3 text-[9px] tracking-[0.2em] text-cyan-400/50 font-mono">
                                                                {item.menu.heading}
                                                            </p>
                                                        )}

                                                        <ul className="space-y-2.5">
                                                            {item.menu.links.map((l) => (
                                                                <li key={l.href}>
                                                                    <Link
                                                                        href={l.href}
                                                                        className="group flex items-center gap-2 text-[11px] tracking-[0.08em] font-mono text-white/50 hover:text-white/90 transition-colors"
                                                                        onClick={closeMobile}
                                                                    >
                                                                        <span
                                                                            className="text-cyan-400/40 group-hover:text-cyan-400 transition-colors">→</span>
                                                                        {l.label}
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>

                                                        {item.menu.blurb && (
                                                            <p className="mt-3 max-w-prose text-[10px] leading-relaxed text-white/35 font-mono">
                                                                {item.menu.blurb}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="pb-4 pl-4 ml-1">
                                                        <Link
                                                            href={item.href}
                                                            className="inline-flex items-center gap-2 text-[11px] tracking-[0.08em] font-mono text-white/50 hover:text-white/90 transition-colors"
                                                            onClick={closeMobile}
                                                        >
                                                            <span className="text-cyan-400/40">→</span>
                                                            Open {item.label}
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}

                            {/* Standalone links section */}
                            <li className="mt-3 pt-4 border-t border-white/[0.06]">
                                <p className="px-1 pb-2 text-[9px] tracking-[0.2em] text-white/30 font-mono">
                                    GENERAL
                                </p>

                                <Link
                                    href="/about"
                                    className="group flex items-center gap-2.5 py-3 text-[11px] tracking-[0.12em] font-mono font-semibold uppercase text-white/55 hover:text-white/90 transition-colors"
                                    onClick={closeMobile}
                                >
                                    <div
                                        className="h-1 w-1 rounded-full bg-white/20 group-hover:bg-cyan-400 transition-colors"/>
                                    About me
                                </Link>

                                <Link
                                    href="/contact"
                                    className="group flex items-center gap-2.5 py-3 text-[11px] tracking-[0.12em] font-mono font-semibold uppercase text-white/55 hover:text-white/90 transition-colors"
                                    onClick={closeMobile}
                                >
                                    <div
                                        className="h-1 w-1 rounded-full bg-white/20 group-hover:bg-cyan-400 transition-colors"/>
                                    Contact
                                </Link>
                            </li>

                        </ul>
                    </nav>
                </div>

                {/* Tap-to-close underlay */}
                <button
                    aria-label="Close menu"
                    className="h-[calc(100dvh-6rem)] w-full bg-black/60 backdrop-blur-[2px]"
                    onClick={closeMobile}
                />
            </div>


            <style>{`
                /* =========================
                   Underline & Neon Sweep
                   ========================= */
                header[data-ui-ready] .underline-swipe {
                    position: relative;
                    display: inline-block;
                }
                /* base underline (driven by CSS vars) */
                header[data-ui-ready] .underline-swipe::after {
                    content: "";
                    position: absolute;
                    left: 0;
                    bottom: -2px;
                    height: 1px;
                    width: 100%;
                    background: rgba(34, 211, 238, 0.5);
                    pointer-events: none;

                    --uw-scale: 0;
                    --uw-origin: left;

                    transform: scaleX(var(--uw-scale));
                    transform-origin: var(--uw-origin);
                    transition: none;
                }
                /* enable animation only when ready & armed */
                header[data-ui-ready="true"][data-armed="true"] .underline-swipe::after {
                    transition: transform 300ms cubic-bezier(0.3, 1, 0.3, 1);
                }
                /* turn on/off via data attr or hover/focus in mega */
                header[data-ui-ready="true"][data-armed="true"] .underline-swipe[data-underline="on"]::after,
                header[data-ui-ready="true"] .mega a.underline-swipe:hover::after,
                header[data-ui-ready="true"] .mega a.underline-swipe:focus-visible::after {
                    --uw-scale: 1;
                    --uw-origin: left;
                }
                header[data-ui-ready="true"][data-armed="true"] .underline-swipe[data-underline="off"]::after,
                header[data-ui-ready="true"] .mega a.underline-swipe:not(:hover):not(:focus-visible)::after {
                    --uw-scale: 0;
                    --uw-origin: right;
                }

                /* Neon variant — cyan/violet gradient matching HUD style */
                header .underline-swipe.neon-swipe::after {
                    bottom: -3px;
                    background: linear-gradient(90deg, rgba(34,211,238,0.6), rgba(167,139,250,0.6));
                    filter: drop-shadow(0 0 4px rgba(34, 211, 238, 0.4));
                }
                header .mega a.neon-swipe {
                    transition: text-shadow 200ms ease, color 200ms ease;
                }
                header .mega a.neon-swipe:hover {
                    color: rgba(255, 255, 255, 0.95);
                    text-shadow: 0 0 10px rgba(34, 211, 238, 0.25);
                }

                /* Reduced motion */
                @media (prefers-reduced-motion: reduce) {
                    header .underline-swipe::after {
                        transition: none !important;
                        --uw-scale: 1 !important;
                        --uw-origin: left !important;
                    }
                }

                /* ============ Glass Fill ============ */
                header[data-ui-ready] .fill-anim {
                    position: relative;
                    overflow: hidden;
                    border-radius: 0;
                    isolation: isolate;
                }

                /* soft background lift */
                header[data-ui-ready] .fill-anim::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    background: rgba(255, 255, 255, 0.02);
                    opacity: 0;
                    transition: opacity 160ms ease;
                    z-index: 0;
                    pointer-events: none;
                }

                /* thin glass ring */
                header[data-ui-ready] .fill-anim::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    pointer-events: none;
                    opacity: 0;
                    box-shadow:
                            inset 0 0 0 1px rgba(255, 255, 255, 0.04),
                            0 4px 16px -8px rgba(34, 211, 238, 0.06);
                    transition: opacity 160ms ease;
                    z-index: 0;
                }

                /* hover/focus states */
                header[data-ui-ready] .fill-anim:hover::before,
                header[data-ui-ready] .fill-anim:focus-visible::before {
                    opacity: 1;
                }
                header[data-ui-ready] .fill-anim:hover::after,
                header[data-ui-ready] .fill-anim:focus-visible::after {
                    opacity: 1;
                }

                /* keep content above effects */
                header[data-ui-ready] .fill-anim > * {
                    position: relative;
                    z-index: 2;
                }

                /* Reduced motion */
                @media (prefers-reduced-motion: reduce) {
                    header .fill-anim::before,
                    header .fill-anim::after {
                        transition: none !important;
                    }
                }

            `}</style>


        </header>
    );
}