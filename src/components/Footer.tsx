"use client";

import {useRef, useEffect} from "react";

export function Footer() {
    const overlayRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);
    const nextPos = useRef<{x:number; y:number} | null>(null);

    // rAF loop to throttle pointer updates
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
            className="group relative border-t border-white/10 bg-black/80 backdrop-blur-sm"
        >
            {/* neon hairline */}
            <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-emerald-400 opacity-70" />

            {/* cursor-follow overlay (throttled, subtle) */}
            <div
                aria-hidden
                ref={overlayRef}
                // init vars once; rAF updates them
                style={
                    {
                        "--mx": "-9999px",
                        "--my": "-9999px",
                        // Smaller, clamped radius for cheaper masks
                        "--r": "clamp(72px, 10vw, 120px)",
                    } as React.CSSProperties
                }
                className={[
                    "pointer-events-none absolute inset-0",
                    // only show on hover/focus to avoid constant compositing
                    "opacity-0 transition-opacity duration-120",
                    "group-hover:opacity-100 group-focus-within:opacity-100",
                    // hint to GPU/compositor
                    "[will-change:opacity,filter]"
                ].join(" ")}
            >
                {/* Color glow (cheap) */}
                <div
                    className={[
                        "absolute inset-0",
                        "[background:linear-gradient(90deg,#f0abfc_0%,#22d3ee_50%,#10b981_100%)]",
                        "[mask-image:radial-gradient(var(--r)_var(--r)_at_var(--mx)_var(--my),black,transparent_70%)]",
                        "opacity-20",        // lower for subtlety
                        "blur-[2px]"         // tiny blur for softness
                    ].join(" ")}
                />

                {/* Tiny localized backdrop blur (expensive → keep very small and subtle) */}
                <div
                    className={[
                        "absolute inset-0",
                        // smaller, tighter mask than the color glow
                        "[mask-image:radial-gradient(calc(var(--r)*0.75)_calc(var(--r)*0.75)_at_var(--mx)_var(--my),black,transparent_70%)]",
                        "backdrop-blur-[4px]", // lighter blur than 8px
                        "opacity-35"           // modest intensity
                    ].join(" ")}
                />
            </div>

            {/* reduced motion: disable the effect */}
            <style
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                    __html: `
          @media (prefers-reduced-motion: reduce) {
            footer .group:hover > div[aria-hidden] { opacity: 0 !important; }
          }
        `,
                }}
            />

            <div className="mx-auto max-w-5xl py-6 px-4 text-center text-sm text-zinc-500">
        <span className="block">
          © 2025 <span className="text-zinc-300">Mark Wu</span>.
        </span>
                <span className="block">
          Licensed under{" "}
                    <a
                        href="https://creativecommons.org/licenses/by-nc-nd/4.0/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-cyan-300 transition-colors"
                    >
            CC BY-NC-ND 4.0
          </a>
          .
        </span>
                <span className="block mt-1">
          <a
              href="mailto:me@markwu.org"
              className="text-zinc-400 hover:text-fuchsia-300 underline decoration-dotted transition-colors"
          >
            me@markwu.org
          </a>
        </span>
            </div>
        </footer>
    );
}
