"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
                { label: "Overview", href: "/teamsprocket" },
                { label: "Team Website", href: "https://www.team3473.com/" },
                { label: "Cad", href: "/teamsprocket/cad" },
                { label: "Programming", href: "/teamsprocket/scouting" }
            ],
            blurb:
                "Team Sprocket is a student-centered FIRST Robotics Competition team. I contribute as a member of the CAD subteam and lead the development and maintenance of the team’s scouting application. The team earned the Impact Award at regionals and advanced to the World Championships in both 2024 and 2025."
        }
    },
    {
        label: "Dronescape",
        href: "/dronescape",
        menu: {
            heading: "DRONESCAPE CLUB",
            links: [
                { label: "Overview", href: "/dronescape" },
                { label: "Club Website", href: "https://www.dronescapeclub.org/" },
                { label: "My UAV", href: "/dronescape/uav" },
                { label: "My GCS", href: "/dronescape/gcs" }
            ],
            blurb: "Dronescape is a competitive FPV racing club that also includes engineering."
        }
    },
    {
        label: "Past projects",
        href: "/legacy",
        menu: {
            heading: "LEGACY PROJECTS",
            links: [
                { label: "Team Infernope", href: "/legacy/teaminfernope" },
                { label: "SigmaCat Robotics", href: "/legacy/sigmacat" }
            ],
            blurb: "An archive of past teams, projects, and competitions I've contributed to."
        }
    }
];

function PlusMinus({ active }: { active: boolean }) {
    return (
        <span className="relative ml-0.5 inline-flex h-3 w-3 items-center justify-center">
      <span className="absolute h-[2px] w-full bg-current" />
      <span
          className={[
              "absolute w-[2px] bg-current origin-center will-change-transform",
              "transition-transform duration-150 ease-out",
              active ? "scale-y-0" : "scale-y-100"
          ].join(" ")}
      />
    </span>
    );
}

export function Header() {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState<NavItem | null>(null);
    const [mounted, setMounted] = useState(false);
    const panelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => setMounted(true), []);

    // Defer unmount of content until the fade-out completes to avoid disappearing text.
    useEffect(() => {
        const el = panelRef.current;
        if (!el) return;
        const onEnd = (e: TransitionEvent) => {
            if (e.propertyName !== "opacity") return;
            if (!open) setActive(null);
        };
        el.addEventListener("transitionend", onEnd as any);
        return () => el.removeEventListener("transitionend", onEnd as any);
    }, [open]);

    const show = (item: NavItem | null) => {
        setActive(item?.menu ? item : null);
        setOpen(!!item?.menu);
    };

    const scheduleClose = () => {
        setOpen(false); // let transition run; active cleared on transitionend
    };

    const onKeyDown: React.KeyboardEventHandler<HTMLElement> = (e) => {
        if (e.key === "Escape") setOpen(false);
    };

    const panelId = active ? `mega-${active.label.replace(/\s+/g, "-").toLowerCase()}` : undefined;

    return (
        <header
            className="sticky top-0 z-50 border-b border-white bg-black text-white"
            onKeyDown={onKeyDown}
            data-ui-ready={mounted}
            onMouseLeave={scheduleClose}
        >
            <div className="relative mx-auto flex h-24 max-w-7xl items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <div className="h-6 w-6 bg-white" />
                    MARKWU
                </Link>

                {/* Divider */}
                <div className="mx-6 hidden w-px self-stretch bg-white/80 md:block" aria-hidden />

                {/* Center nav */}
                <nav className="hidden gap-7 md:flex" role="navigation" aria-label="Primary">
                    {NAV.map((item) => {
                        const isActive = open && active?.label === item.label;
                        const itemId = `trigger-${item.label.replace(/\s+/g, "-").toLowerCase()}`;
                        return (
                            <div key={item.label} className="relative" onMouseEnter={() => show(item)}>
                                <Link
                                    id={itemId}
                                    href={item.href}
                                    className={[
                                        "nav-link group relative inline-flex items-center gap-1 text-base font-medium",
                                        "tracking-tight transition-colors hover:opacity-90 focus:outline-none",
                                        "underline-swipe"
                                    ].join(" ")}
                                    onFocus={() => show(item)}
                                    onClick={() => {
                                        setOpen(false); // don't clear active here; let fade handle it
                                    }}
                                    aria-haspopup={!!item.menu}
                                    aria-expanded={isActive}
                                    aria-controls={isActive ? panelId : undefined}
                                    data-underline={!mounted ? "idle" : isActive ? "on" : "off"}
                                >
                                    {item.label}
                                    {item.menu && <PlusMinus active={isActive} />}
                                </Link>
                            </div>
                        );
                    })}
                </nav>

                {/* Divider */}
                <div className="mx-6 hidden w-px self-stretch bg-white/80 md:block" aria-hidden />

                {/* Right */}
                <div className="flex items-center gap-6">
                    <Link href="/contact" className="hidden text-base hover:underline md:block">
                        Contact
                    </Link>
                    <button className="md:hidden" aria-label="Toggle menu">
                        {open ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* MEGA PANEL */}
            <div
                ref={panelRef}
                id={panelId}
                role="region"
                aria-label={active?.label || undefined}
                className={[
                    "absolute left-1/2 top-[calc(100%+1px)] w-screen -translate-x-1/2",
                    "border-b border-white bg-black transition-opacity duration-150",
                    open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
                ].join(" ")}
                onMouseEnter={() => open && setOpen(true)}
                onMouseLeave={scheduleClose}
            >
                <div className="mx-auto max-w-7xl px-6 py-10">
                    <div className="grid grid-cols-1 items-stretch gap-x-10 md:grid-cols-[1fr_auto_1fr]">
                        {/* Left column */}
                        <div className="pb-8 md:pb-0 md:pr-10">
                            <p className="mb-4 text-xs tracking-widest text-white">{active?.menu?.heading ?? ""}</p>
                            <ul className="space-y-3 text-2xl font-semibold leading-tight">
                                {active?.menu?.links.map((l) => (
                                    <li key={l.href}>
                                        <Link
                                            href={l.href}
                                            className="hover:opacity-80"
                                            onClick={() => {
                                                setOpen(false); // fade then unmount via transitionend
                                            }}
                                        >
                                            {l.label}
                                        </Link>
                                    </li>
                                )) || null}
                            </ul>
                        </div>

                        {/* Middle divider */}
                        <div className="hidden h-full w-px bg-white md:block" />

                        {/* Right column */}
                        <div className="pt-8 md:pt-0">
                            {active?.menu?.blurb && (
                                <p className="max-w-prose text-sm text-white/80">{active.menu.blurb}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* underline animations gated by data attributes */}
            <style jsx global>{`
                /* Scope underline animation to this header to avoid leakage */
                header[data-ui-ready] .underline-swipe { position: relative; }
                header[data-ui-ready] .underline-swipe::after {
                    content: "";
                    position: absolute;
                    left: 0;
                    bottom: -2px;
                    height: 2px;
                    width: 100%;
                    background: currentColor;
                    transform: scaleX(0);
                    transform-origin: left;
                    pointer-events: none;
                }
                header[data-ui-ready="true"] .underline-swipe[data-underline="on"]::after {
                    animation: uw-in 300ms cubic-bezier(0.3, 1, 0.3, 1) forwards;
                }
                header[data-ui-ready="true"] .underline-swipe[data-underline="off"]::after {
                    animation: uw-out 300ms cubic-bezier(0.3, 1, 0.3, 1) forwards;
                }
                @keyframes uw-in { from { transform: scaleX(0); } to { transform: scaleX(1); } }
                @keyframes uw-out { from { transform: translateX(0) scaleX(1); } to { transform: translateX(100%) scaleX(0); } }
                /* Respect reduced motion */
                @media (prefers-reduced-motion: reduce) {
                    header[data-ui-ready="true"] .underline-swipe[data-underline]::after { animation: none; transform: scaleX(1); }
                }
                .underline-swipe:focus-visible::after { transform: scaleX(1); animation: none; }
            `}</style>
        </header>
    );
}
