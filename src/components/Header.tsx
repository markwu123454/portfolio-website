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
                {label: "My UAV", href: "/dronescape/uav"},
                {label: "My GCS", href: "/dronescape/gcs"}
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
                {label: "The GradeBook", href: "/misc/ratemyteacher"},
                {label: "Portfolio website(this)", href: "/misc/portfolio"},
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
                "fixed top-0 inset-x-0 z-50 h-24 border-b border-white bg-zinc-950 text-white",
                "transform-gpu transition-transform duration-300 ease-out",
                hidden ? "-translate-y-full" : "translate-y-0"
            ].join(" ")}
            onKeyDown={onKeyDown}
            data-ui-ready={mounted ? "true" : "false"}
            data-armed={armed ? "true" : "false"}
            onMouseLeave={scheduleClose}
            onMouseEnter={() => setHidden(false)}
        >
            <div className="relative mx-auto flex h-24 items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-semibold flex-shrink-0 fill-anim pl-4 h-full self-stretch pr-6">
                    <div className="h-6 w-6 bg-white"/>
                    MARKWU
                </Link>

                {/* Divider */}
                <div className="mr-6 hidden w-px self-stretch bg-white/80 md:block" aria-hidden/>

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
                                        "underline-swipe group relative inline-flex items-center gap-1 text-base font-medium",
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
                <div className="hidden w-px self-stretch bg-white/80 md:block" aria-hidden/>

                {/* Right */}
                <Link
                    href="/about"
                    className="hidden md:flex h-full self-stretch items-center px-10 text-base fill-anim"
                >
                    About me
                </Link>

                {/* Divider */}
                <div className="hidden w-px self-stretch bg-white/80 md:block" aria-hidden />

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
                        className="md:hidden ml-6"
                        aria-label="Toggle menu"
                        onClick={() => {
                            const next = !mobileOpen;
                            setMobileOpen(next);
                            if (next) { setMegaOpen(false); setHidden(false); }
                            else { setMobileActive(null); }
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
                    "border-b border-white bg-zinc-950 transition-opacity duration-150",
                    "hidden md:block",
                    megaOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
                ].join(" ")}
                onMouseEnter={() => megaOpen && setMegaOpen(true)}
                onMouseLeave={scheduleClose}
            >
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
                                            className="underline-swipe hover:opacity-80"   // ← add underline-swipe
                                            onClick={() => setMegaOpen(false)}
                                        >
                                            {l.label}
                                        </Link>
                                    </li>
                                )) || null}
                            </ul>
                        </div>

                        {/* Middle divider */}
                        <div className="hidden h-full w-px bg-white md:block"/>

                        {/* Right column */}
                        <div className="pt-8 md:pt-0">
                            {active?.menu?.blurb && (
                                <p className="max-w-prose text-sm text-white/80">{active.menu.blurb}</p>
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
                {/* Keep header visible above the panel */}
                <div className="pt-24 bg-zinc-950 border-b border-white">
                    <nav aria-label="Mobile Primary" className="px-4 py-2">
                        <ul className="divide-y divide-white/20">
                            {NAV.map((item) => {
                                const id = `m-${item.label.replace(/\s+/g, "-").toLowerCase()}`;
                                const expanded = mobileActive === id;
                                return (
                                    <li key={id} className="py-1">
                                        {/* Top-level: button only (no navigation) */}
                                        <button
                                            className="flex w-full items-center justify-between py-4 text-left text-lg font-semibold tracking-tight"
                                            aria-controls={`${id}-panel`}
                                            aria-expanded={expanded}
                                            onClick={() => setMobileActive(expanded ? null : id)}
                                        >
                                            <span className="inline-flex items-center gap-2">
                                                {item.label}
                                                {item.menu ? <PlusMinus active={expanded}/> : null}
                                            </span>
                                            {/* Optional: tiny chevron for affordance */}
                                            <ChevronRight
                                                size={18}
                                                className={[
                                                    "transition-transform duration-200",
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
                                                        {/* For items without a submenu, provide a dedicated link row */}
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

                            {/* Static link(s) at bottom */}
                            <li className="py-1">
                                <Link
                                    href="/contact"
                                    className="block py-4 text-lg font-semibold hover:underline"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>

                {/* Tap-to-close underlay (below header, above content) */}
                <button
                    aria-label="Close menu"
                    className="h-[calc(100dvh-6rem)] w-full bg-zinc-950/60 backdrop-blur-[1px]"
                    onClick={() => {
                        setMobileOpen(false);
                        setMobileActive(null);
                    }}
                />
            </div>

            {/* underline animations (kept) */}
            <style jsx global>{`
                /* Handles underline swipe of buttons */
                header[data-ui-ready] .underline-swipe {
                    position: relative;
                    display: inline-block;
                }
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

                header[data-ui-ready="true"][data-armed="true"] .underline-swipe::after {
                    transition: transform 300ms cubic-bezier(0.3, 1, 0.3, 1);
                }

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

                @media (prefers-reduced-motion: reduce) {
                    header .underline-swipe::after {
                        transition: none !important;
                        --uw-scale: 1 !important;
                        --uw-origin: left !important;
                    }
                }

                /* Handles background fill of logo, about, and contact */
                header[data-ui-ready] .fill-anim {
                    position: relative;
                    overflow: hidden;
                }

                header[data-ui-ready] .fill-anim::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background-color: rgba(255, 255, 255, 0.20);
                    z-index: 0;
                    transform: scaleY(0);
                    transform-origin: bottom;
                    transition: transform 0.25s ease-out;
                }

                /* Handles header collapse on scroll */
                header[data-ui-ready] .fill-anim:hover::before,
                header[data-ui-ready] .fill-anim:focus-within::before {
                    transform: scaleY(1);
                    transform-origin: bottom;
                    transition: transform 0.25s ease-out;
                }

                header[data-ui-ready] .fill-anim:not(:hover)::before {
                    transform: scaleY(0);
                    transform-origin: top;
                    transition: transform 0.25s ease-in;
                }

                header[data-ui-ready] .fill-anim > * {
                    position: relative;
                    z-index: 1;
                }
            `}</style>
        </header>
    );
}
