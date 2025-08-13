"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";

type SubLink = { label: string; href: string };
type NavItem = {
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
                { label: "Programming", href: "/teamsprocket/scouting" },
            ],
            blurb: "Team Sprocket is a student-centered FIRST Robotics Competition team. I contribute as a member of the CAD subteam and lead the development and maintenance of the team’s scouting application. The team earned the Impact Award at regionals and advanced to the World Championships in both 2024 and 2025.",
        },
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
                { label: "My GCS", href: "/dronescape/gcs" },
            ],
            blurb: "Dronescape is a competitive FPV racing club that also includes engineering ",
        },
    },
    {
        label: "Past projects",
        href: "/legacy",
        menu: {
            heading: "LEGACY PROJECTS",
            links: [
                { label: "Team Infernope", href: "/legacy/teaminfernope" },
                { label: "SigmaCat Robotics", href: "/legacy/sigmacat" },
            ],
            blurb: "An archive of past teams, projects, and competitions I've contributed to.",
        },
    },
];

export function Header() {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState<NavItem | null>(null);

    const show = (item: NavItem | null) => {
        setActive(item?.menu ? item : null);
        setOpen(!!item?.menu);
    };

    return (
        <header
            className="sticky top-0 z-50 border-b border-white/10 bg-black text-white"
            onMouseLeave={() => show(null)}
        >
            <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <div className="h-6 w-6 bg-white" />
                    MARKWU
                </Link>

                {/* Center nav */}
                <nav className="hidden gap-6 md:flex">
                    {NAV.map((item) => (
                        <div
                            key={item.label}
                            className="relative"
                            onMouseEnter={() => show(item)}
                        >
                            <Link
                                href={item.href}
                                className="flex items-center gap-1 text-sm hover:opacity-80"
                                onFocus={() => show(item)}
                                aria-haspopup={!!item.menu}
                                aria-expanded={open && active?.label === item.label}
                            >
                                {item.label}
                                {item.menu && <span className="text-xs">+</span>}
                            </Link>
                        </div>
                    ))}
                </nav>

                {/* Right */}
                <div className="flex items-center gap-6">
                    <Link href="/contact" className="hidden text-sm hover:underline md:block">
                        Contact
                    </Link>
                    <button className="md:hidden">
                        <Menu size={20} />
                    </button>
                </div>

                {/* SINGLE mega panel: fixed position under header, same size/pos for all */}
                <div
                    className={[
                        "absolute left-1/2 top-full w-screen -translate-x-1/2",
                        "border border-white/10 bg-black transition-opacity duration-150",
                        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
                    ].join(" ")}
                    onMouseEnter={() => open && setOpen(true)}
                >
                    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-x-10 px-6 py-10 md:grid-cols-2">
                        {/* Left: heading + big links */}
                        <div className="border-b border-white/10 pb-8 md:border-b-0 md:pb-0 md:pr-10 md:border-r">
                            <p className="mb-4 text-xs tracking-widest text-white/60">
                                {active?.menu?.heading ?? ""}
                            </p>
                            <ul className="space-y-3 text-2xl font-semibold leading-tight">
                                {active?.menu?.links.map((l) => (
                                    <li key={l.href}>
                                        <Link
                                            href={l.href}
                                            className="hover:opacity-80"
                                            onClick={() => setOpen(false)}
                                        >
                                            {l.label}
                                        </Link>
                                    </li>
                                )) || null}
                            </ul>
                        </div>
                        {/* Right: blurb */}
                        <div className="pt-8 md:pt-0">
                            {active?.menu?.blurb && (
                                <p className="max-w-prose text-white/80 text-sm">
                                    {active.menu.blurb}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
