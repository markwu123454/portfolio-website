"use client";

import {useRef, useEffect} from "react";

export function Footer() {
    const overlayRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);
    const nextPos = useRef<{x:number; y:number} | null>(null);

    useEffect(() => {
        const tick = () => {
            if (nextPos.current && overlayRef.current) {
                const {x, y} = nextPos.current;
                const el = overlayRef.current;
                el.style.setProperty("--mx", `${x}px`);
                el.style.setProperty("--my", `${y}px`);
                nextPos.current = null;
            }
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        };
    }, []);

    const onMove: React.PointerEventHandler<HTMLElement> = (e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        nextPos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onLeave = () => {
        if (!overlayRef.current) return;
        overlayRef.current.style.setProperty("--mx", `-9999px`);
        overlayRef.current.style.setProperty("--my", `-9999px`);
    };

    return (
        <footer
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            className="group relative border-t border-white/[0.08] bg-black/50 backdrop-blur-2xl"
        >
            {/* Scanlines */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.04]
                [background-image:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.1)_2px,rgba(255,255,255,0.1)_3px)]"
            />

            {/* Neon hairline — cyan → violet gradient */}
            <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-400/50 via-violet-400/40 to-cyan-400/50"
            />

            {/* Corner accents */}
            <div
                aria-hidden
                className="absolute top-0 left-0 w-4 h-4 border-t border-l border-cyan-400/15 pointer-events-none z-10"
            />
            <div
                aria-hidden
                className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-violet-400/15 pointer-events-none z-10"
            />

            {/* Cursor-follow overlay */}
            <div
                aria-hidden
                ref={overlayRef}
                style={
                    {
                        "--mx": "-9999px",
                        "--my": "-9999px",
                        "--r": "clamp(72px, 10vw, 120px)",
                    } as React.CSSProperties
                }
                className={[
                    "pointer-events-none absolute inset-0",
                    "opacity-0 transition-opacity duration-120",
                    "group-hover:opacity-100 group-focus-within:opacity-100",
                    "[will-change:opacity,filter]",
                ].join(" ")}
            >
                {/* Cyan / violet glow */}
                <div
                    className={[
                        "absolute inset-0",
                        "[background:linear-gradient(90deg,#22d3ee_0%,#a78bfa_50%,#22d3ee_100%)]",
                        "[mask-image:radial-gradient(var(--r)_var(--r)_at_var(--mx)_var(--my),black,transparent_70%)]",
                        "opacity-15",
                        "blur-[2px]",
                    ].join(" ")}
                />

                <div
                    className={[
                        "absolute inset-0",
                        "[mask-image:radial-gradient(calc(var(--r)*0.75)_calc(var(--r)*0.75)_at_var(--mx)_var(--my),black,transparent_70%)]",
                        "backdrop-blur-[4px]",
                        "opacity-35",
                    ].join(" ")}
                />
            </div>

            {/* Reduced motion */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
          @media (prefers-reduced-motion: reduce) {
            footer .group:hover > div[aria-hidden] { opacity: 0 !important; }
          }
        `,
                }}
            />

            {/* Content */}
            <div className="relative z-[1] mx-auto max-w-5xl px-6 lg:px-24 py-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Left: signature */}
                    <div className="flex items-center gap-3">
                        <div className="h-[7px] w-[7px] rounded-full bg-cyan-400/40" />
                        <span className="text-xs tracking-[0.15em] text-white/50 font-mono">
                            DESIGNED & BUILT BY{" "}
                            <span className="text-white/70">MARK WU</span>
                        </span>
                    </div>

                    {/* Center: links */}
                    <div className="flex items-center gap-4">
                        <a
                            href="mailto:me@markwu.org"
                            className="text-xs tracking-[0.12em] text-white/40 font-mono
                                hover:text-cyan-300 transition-colors"
                        >
                            me@markwu.org
                        </a>
                        <div className="h-3 w-px bg-white/10" />
                        <a
                            href="https://creativecommons.org/licenses/by-nc-nd/4.0/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs tracking-[0.12em] text-white/40 font-mono
                                hover:text-cyan-300 transition-colors"
                        >
                            CC BY-NC-ND 4.0
                        </a>
                    </div>

                    {/* Right: year */}
                    <span className="text-xs tracking-[0.15em] text-white/30 font-mono">
                        © 2026
                    </span>
                </div>
            </div>
        </footer>
    );
}