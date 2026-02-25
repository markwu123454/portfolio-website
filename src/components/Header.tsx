"use client";

import Link from "next/link";
import {Menu, X, ChevronRight} from "lucide-react";
import {useEffect, useRef, useState} from "react";
import {usePathname} from "next/navigation";

type SubLink = { label: string; href: string };
export type NavItem = {
    label: string;
    href: string;
    menu?: { heading: string; blurb?: string; links: SubLink[] };
};

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
                "Team Sprocket is a student-centered FIRST Robotics Competition team. I am a member of the CAD subteam and developed the team’s newest scouting application. The team earned the FIRST Impact Award at regionals and advanced to the World Championships in both 2024 and 2025."
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
                {label: "Project Tempest", href: "/misc/projecttempest"},
                {label: "Smaller Projects", href: "/misc/random"},
                {label: "The Scavengers", href: "/misc/scavenger"},
                {label: "Musical Compositions", href: "/misc/music"},
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
                {label: "The GradeBook", href: "/legacy/ratemyteacher"},
                {label: "Team Infernope", href: "/legacy/teaminfernope"},
                {label: "SigmaCat Robotics", href: "/legacy/sigmacat"}
            ],
            blurb: "An archive of past teams, projects, and competitions I've contributed to."
        }
    }
];

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

export function Header() {
    // Desktop mega menu
    const [megaOpen, setMegaOpen] = useState(false);
    const [active, setActive] = useState<NavItem | null>(null);

    // Mobile breakaway
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileActive, setMobileActive] = useState<string | null>(null);

    const [mounted, setMounted] = useState(false);
    const [armed, setArmed] = useState(false);
    const [hidden, setHidden] = useState(false);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const pathname = usePathname();

    useEffect(() => setMounted(true), []);

    // Hide-on-scroll (disabled while any menu is open)
    useEffect(() => {
        const el = document.getElementById("content-scroll");
        if (!el) return;

        let lastY = el.scrollTop;
        let ticking = false;
        const MIN_DELTA = 8;
        const MIN_START = 72;

        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const y = el.scrollTop;
                const dy = y - lastY;

                if (megaOpen || mobileOpen) {
                    setHidden(false);
                } else if (Math.abs(dy) > MIN_DELTA) {
                    if (y > MIN_START && dy > 0) setHidden(true);
                    else if (dy < 0) setHidden(false);
                }

                lastY = y <= 0 ? 0 : y;
                ticking = false;
            });
        };

        el.addEventListener("scroll", onScroll, {passive: true});
        return () => el.removeEventListener("scroll", onScroll);
    }, [megaOpen, mobileOpen, pathname]);

    // Desktop mega: defer unmount of content until fade-out completes
    useEffect(() => {
        const el = panelRef.current;
        if (!el) return;
        const onEnd = (e: TransitionEvent) => {
            if (e.propertyName !== "opacity") return;
            if (!megaOpen) setActive(null);
        };
        el.addEventListener("transitionend", onEnd as never);
        return () => el.removeEventListener("transitionend", onEnd as never);
    }, [megaOpen]);

    // Close menus on route change
    useEffect(() => {
        setMegaOpen(false);
        setActive(null);
        setMobileOpen(false);
        setMobileActive(null);
    }, [pathname]);

    const show = (item: NavItem | null) => {
        setActive(item?.menu ? item : null);
        setMegaOpen(!!item?.menu);
        setHidden(false);
    };

    const scheduleClose = () => setMegaOpen(false);

    const onKeyDown: React.KeyboardEventHandler<HTMLElement> = (e) => {
        if (e.key === "Escape") {
            setMegaOpen(false);
            setMobileOpen(false);
            setMobileActive(null);
        }
    };

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        const a = requestAnimationFrame(() =>
            requestAnimationFrame(() => setArmed(true))
        );
        return () => cancelAnimationFrame(a);
    }, []);

    const panelId = active
        ? `mega-${active.label.replace(/\s+/g, "-").toLowerCase()}`
        : undefined;

    return (
        <header
            className={[
                "fixed top-0 inset-x-0 z-50 h-24 border-b border-white/10",
                "bg-black/70 backdrop-blur supports-[backdrop-filter]:bg-black/60 text-white",
                "transform-gpu transition-transform duration-300 ease-out",
                hidden ? "-translate-y-full" : "translate-y-0"
            ].join(" ")}
            onKeyDown={onKeyDown}
            data-ui-ready={mounted ? "true" : "false"}
            data-armed={armed ? "true" : "false"}
            onMouseLeave={scheduleClose}
            onMouseEnter={() => setHidden(false)}
        >
            <div aria-hidden
                 className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-emerald-400 opacity-70"/>
            <div className="relative mx-auto flex h-24 items-center justify-between">
                {/* neon top accent */}
                <div aria-hidden
                     className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-emerald-400 opacity-70"/>

                {/* Logo */}
                <Link href="/"
                      className="flex items-center gap-2 font-semibold flex-shrink-0 fill-anim pl-4 h-full self-stretch pr-6">
                        <div
                            className="relative h-6 w-6 rounded-md bg-gradient-to-tr from-cyan-400 via-fuchsia-400 to-emerald-300">
                        <span aria-hidden
                              className="absolute inset-0 rounded-md blur-sm opacity-70 bg-gradient-to-tr from-cyan-400 via-fuchsia-400 to-emerald-300"/>
                    </div>
                    MARKWU
                </Link>


                {/* Divider */}
                <div className="mr-6 hidden w-px self-stretch bg-white/10 md:block" aria-hidden/>

                {/* Center nav — desktop only */}
                <nav
                    className="hidden md:flex flex-grow justify-start gap-12"
                    role="navigation"
                    aria-label="Primary"
                >
                    {NAV.map((item) => {
                        const isActive = megaOpen && active?.label === item.label;
                        const itemId = `trigger-${item.label.replace(/\s+/g, "-").toLowerCase()}`;
                        return (
                            <div key={item.label} className="relative" onMouseEnter={() => show(item)}>
                                <Link
                                    id={itemId}
                                    href={item.href}
                                    className={[
                                        "underline-swipe group relative inline-flex items-center gap-1 text-base font-medium text-white/90",
                                        "tracking-tight transition-colors hover:opacity-90 focus:outline-none"
                                    ].join(" ")}
                                    onFocus={() => show(item)}
                                    onClick={() => setMegaOpen(false)}
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
                <div className="hidden w-px self-stretch bg-white/10 md:block" aria-hidden/>

                {/* Right */}
                <Link
                    href="/about"
                    className="hidden md:flex h-full self-stretch items-center px-10 text-base fill-anim"
                >
                    About me
                </Link>

                {/* Divider */}
                <div className="hidden w-px self-stretch bg-white/10 md:block" aria-hidden/>

                {/* Right */}
                <div className="flex h-full self-stretch items-center flex-shrink-0">
                    {/* Contact block fills its own padding area */}
                    <Link
                        href="/contact"
                        className="hidden md:flex h-full self-stretch items-center px-10 text-base fill-anim"
                    >
                        Contact
                    </Link>

                    {/* Mobile toggle */}
                    <button
                        className="md:hidden px-4 h-full flex items-center"
                        aria-label="Toggle menu"
                        onClick={() => {
                            const next = !mobileOpen;
                            setMobileOpen(next);
                            if (next) {
                                setMegaOpen(false);
                                setHidden(false);
                            } else {
                                setMobileActive(null);
                            }
                        }}
                    >
                        {mobileOpen ? <X size={20}/> : <Menu size={20}/>}
                    </button>
                </div>

            </div>

            {/* DESKTOP MEGA PANEL */}
            <div
                ref={panelRef}
                id={panelId}
                role="region"
                aria-label={active?.label || undefined}
                className={[
                    "mega",
                    "absolute left-1/2 top-[calc(100%+1px)] w-screen -translate-x-1/2",
                    "hidden md:block transition-opacity duration-200",
                    // glass + border + glow
                    "rounded-b-2xl border border-white/10 bg-black backdrop-blur-md",
                    "shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_60px_-12px_rgba(0,255,255,0.12)]",
                    megaOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
                ].join(" ")}
                onMouseEnter={() => megaOpen && setMegaOpen(true)}
                onMouseLeave={scheduleClose}
            >
                {/* scanline film */}
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-b-2xl opacity-[0.06] [background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.8)_0,rgba(255,255,255,.8)_1px,transparent_2px,transparent_3px)]"
                />
                {/* corner bloom */}
                <span
                    aria-hidden
                    className="pointer-events-none absolute -right-14 -top-24 h-48 w-48 rounded-full bg-gradient-to-tr from-fuchsia-400 via-violet-400 to-cyan-400 blur-3xl opacity-30"
                />
                <span
                    aria-hidden
                    className="pointer-events-none absolute -left-14 -bottom-4 h-48 w-48 rounded-full bg-gradient-to-tr from-blue-400 via-cyan-400 to-teal-400 blur-3xl opacity-30"
                />

                <div className="mx-auto max-w-7xl px-6 py-10">
                    <div className="grid grid-cols-1 items-stretch gap-x-10 md:grid-cols-[1fr_auto_1fr]">
                        {/* Left column */}
                        <div className="pb-8 md:pb-0 md:pr-10">
                            <p className="mb-4 text-xs tracking-widest text-white">
                                {active?.menu?.heading ?? ""}
                            </p>
                            <ul className="space-y-3 text-2xl font-semibold leading-tight">
                                {active?.menu?.links.map((l) => (
                                    <li key={l.href}>
                                        <Link
                                            href={l.href}
                                            className="underline-swipe neon-swipe"
                                            onClick={() => setMegaOpen(false)}
                                        >
                                            {l.label}
                                        </Link>
                                    </li>
                                )) || null}
                            </ul>
                        </div>

                        {/* Middle divider */}
                        <div className="hidden h-full w-px bg-white/10 md:block"/>

                        {/* Right column */}
                        <div className="pt-8 md:pt-0">
                            {active?.menu?.blurb && (
                                <p className="max-w-prose text-sm text-zinc-200/90">{active.menu.blurb}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>


            {/* MOBILE BREAKAWAY PANEL (slides from header) */}
            <div
                className={[
                    "md:hidden fixed inset-x-0 top-0 z-40",
                    "transform transition-transform duration-300 ease-out will-change-transform",
                    mobileOpen ? "translate-y-0" : "-translate-y-full"
                ].join(" ")}
                aria-hidden={!mobileOpen}
            >
                <div className="pt-2 bg-black/90 backdrop-blur-md border-b border-white/10">

                    {/* Panel header row */}
                    <div className="px-4 pb-2 flex items-center justify-between border-b border-white/10">
                        <span className="text-lg tracking-widest text-white">MENU</span>
                        <button
                            onClick={() => {
                                setMobileOpen(false);
                                setMobileActive(null);
                            }}
                            className="p-2"
                            aria-label="Close menu"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <nav aria-label="Mobile Primary" className="px-4 py-2">
                        <ul className="divide-y divide-white/10">

                            {/* Expandable nav groups */}
                            {NAV.map((item) => {
                                const id = `m-${item.label.replace(/\s+/g, "-").toLowerCase()}`;
                                const expanded = mobileActive === id;

                                return (
                                    <li key={id} className="py-1">
                                        <button
                                            className="flex w-full items-center justify-between py-4 text-left text-lg font-semibold tracking-tight"
                                            aria-controls={`${id}-panel`}
                                            aria-expanded={expanded}
                                            onClick={() => setMobileActive(expanded ? null : id)}
                                        >
                                            <span className="inline-flex items-center gap-2">
                                                {item.label}
                                                {item.menu ? <PlusMinus active={expanded} /> : null}
                                            </span>

                                            <ChevronRight
                                                size={18}
                                                className={[
                                                    "transition-transform duration-200 opacity-70",
                                                    expanded ? "rotate-90" : "rotate-0"
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
                                                    <div className="pb-4 pl-1">

                                                        {item.menu.heading && (
                                                            <p className="mb-2 text-[10px] tracking-widest text-white/70">
                                                                {item.menu.heading}
                                                            </p>
                                                        )}

                                                        <ul className="space-y-2">
                                                            {item.menu.links.map((l) => (
                                                                <li key={l.href}>
                                                                    <Link
                                                                        href={l.href}
                                                                        className="block text-base font-medium hover:underline"
                                                                        onClick={() => {
                                                                            setMobileOpen(false);
                                                                            setMobileActive(null);
                                                                        }}
                                                                    >
                                                                        {l.label}
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>

                                                        {item.menu.blurb && (
                                                            <p className="mt-3 max-w-prose text-sm text-white/70">
                                                                {item.menu.blurb}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="pb-4 pl-1">
                                                        <Link
                                                            href={item.href}
                                                            className="inline-flex items-center gap-2 text-base font-medium hover:underline"
                                                            onClick={() => {
                                                                setMobileOpen(false);
                                                                setMobileActive(null);
                                                            }}
                                                        >
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
                            <li className="mt-3 pt-4 border-t border-white/15">
                                <p className="px-1 pb-2 text-[10px] tracking-widest text-white/60">
                                    GENERAL
                                </p>

                                <Link
                                    href="/about"
                                    className="block py-3 text-lg font-semibold hover:underline"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    About me
                                </Link>

                                <Link
                                    href="/contact"
                                    className="block py-3 text-lg font-semibold hover:underline"
                                    onClick={() => setMobileOpen(false)}
                                >
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
                    onClick={() => {
                        setMobileOpen(false);
                        setMobileActive(null);
                    }}
                />
            </div>


            <style jsx global>{`
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
                    height: 2px;
                    width: 100%;
                    background: currentColor;
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

                /* Neon variant augments the same ::after (no second pseudo-element needed) */
                header .underline-swipe.neon-swipe::after {
                    bottom: -3px;
                    background: linear-gradient(90deg, #f0abfc, #22d3ee, #34d399);
                    filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.6));
                }
                header .mega a.neon-swipe {
                    transition: text-shadow 200ms ease, color 200ms ease;
                }
                header .mega a.neon-swipe:hover {
                    color: #e5e7eb;
                    text-shadow: 0 0 12px rgba(34, 211, 238, 0.35);
                }

                /* Reduced motion */
                @media (prefers-reduced-motion: reduce) {
                    header .underline-swipe::after {
                        transition: none !important;
                        --uw-scale: 1 !important;
                        --uw-origin: left !important;
                    }
                }

                /* ============ Glass Fill + Swipe Sheen ============ */
                header[data-ui-ready] .fill-anim {
                    position: relative;
                    overflow: hidden;
                    border-radius: 0.75rem;
                    isolation: isolate;
                }

                /* soft background lift */
                header[data-ui-ready] .fill-anim::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    background: rgba(255, 255, 255, 0.03);
                    opacity: 0;
                    transition: opacity 160ms ease, box-shadow 160ms ease;
                    z-index: 0;
                }

                /* thin glass ring + faint neon glow */
                header[data-ui-ready] .fill-anim::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    pointer-events: none;
                    opacity: 0;
                    box-shadow:
                            inset 0 0 0 1px rgba(255, 255, 255, 0.05),
                            0 8px 22px -10px rgba(34, 211, 238, 0.08);
                    transition: opacity 160ms ease;
                    z-index: 0;
                }

                /* sheen swipe element */
                header[data-ui-ready] .fill-anim::marker,
                header[data-ui-ready] .fill-anim .sheen {
                    display: none; /* ensures no accidental rendering */
                }
                header[data-ui-ready] .fill-anim::selection { background: none; }

                header[data-ui-ready] .fill-anim::before,
                header[data-ui-ready] .fill-anim::after {
                    pointer-events: none;
                }

                /* separate pseudo for sheen */
                header[data-ui-ready] .fill-anim::part(sheen),
                header[data-ui-ready] .fill-anim::after-sheen {
                    display: none;
                }

                /* sheen implemented via an extra pseudo-element */
                header[data-ui-ready] .fill-anim::selection { background: none; }
                header[data-ui-ready] .fill-anim::placeholder { opacity: 0; }

                header[data-ui-ready] .fill-anim::before,
                header[data-ui-ready] .fill-anim::after {
                    pointer-events: none;
                }

                /* real sheen */
                header[data-ui-ready] .fill-anim::backdrop,
                header[data-ui-ready] .fill-anim:before-sheen {
                    display: none;
                }

                /* add a ::after sibling for sheen sweep */
                header[data-ui-ready] .fill-anim::after-sheen { display: none; }

                /* use an extra ::before sibling for sheen effect */
                header[data-ui-ready] .fill-anim::after,
                header[data-ui-ready] .fill-anim::before {
                    pointer-events: none;
                }

                /* --- Sheen using ::before overlay --- */
                header[data-ui-ready] .fill-anim::after-sheen { display: none; }

                header[data-ui-ready] .fill-anim::after,
                header[data-ui-ready] .fill-anim::before {
                    pointer-events: none;
                }

                header[data-ui-ready] .fill-anim::before,
                header[data-ui-ready] .fill-anim::after {
                    z-index: 0;
                }

                header[data-ui-ready] .fill-anim::before,
                header[data-ui-ready] .fill-anim::after {
                    transition: opacity 160ms ease;
                }

                /* create a third pseudo for the sheen sweep */
                header[data-ui-ready] .fill-anim::before,
                header[data-ui-ready] .fill-anim::after,
                header[data-ui-ready] .fill-anim::after-swipe {
                    pointer-events: none;
                }

                /* SWIPE: use ::before overlay to hold the sheen */
                header[data-ui-ready] .fill-anim::before-sheen {
                    content: "";
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    background: linear-gradient(
                            120deg,
                            transparent 0%,
                            rgba(255, 255, 255, 0.25) 25%,
                            transparent 50%
                    );
                    transform: translateX(-150%);
                    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
                    z-index: 1;
                    opacity: 0;
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
                header[data-ui-ready] .fill-anim:hover::before-sheen,
                header[data-ui-ready] .fill-anim:focus-visible::before-sheen {
                    opacity: 1;
                    transform: translateX(150%);
                }

                /* keep content above effects */
                header[data-ui-ready] .fill-anim > * {
                    position: relative;
                    z-index: 2;
                }

                /* Reduced motion: disable swipe, keep static lift */
                @media (prefers-reduced-motion: reduce) {
                    header .fill-anim::before-sheen {
                        transition: none !important;
                        transform: none !important;
                        opacity: 0 !important;
                    }
                }

            `}</style>


        </header>
    );
}
