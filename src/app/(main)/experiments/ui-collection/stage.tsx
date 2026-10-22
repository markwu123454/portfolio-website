"use client";

/**
 * Stage — the framed box a specimen runs in, plus the small controls that sit
 * under it.
 *
 * A stage only mounts its demo while it is on (or near) screen, so a page of
 * many WebGL and rAF loops only ever runs the one or two you're looking at.
 * Scrolling back mounts it fresh, which also replays its intro.
 */

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

function useNearViewport<T extends Element>() {
    const ref = useRef<T>(null);
    const [near, setNear] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: "200px 0px" });
        io.observe(el);
        return () => io.disconnect();
    }, []);
    return [ref, near] as const;
}

export function Stage({ background, style, children }: { background: string; style?: CSSProperties; children: ReactNode }) {
    const [ref, near] = useNearViewport<HTMLDivElement>();
    return (
        <div
            ref={ref}
            className="relative w-full aspect-4/3 md:aspect-video min-h-[320px] overflow-hidden rounded-md border border-rule"
            style={{ background, ...style }}
        >
            {near && children}
        </div>
    );
}

/**
 * Interaction hints along the bottom of a stage, styled like the ones built
 * into the ASCII logo. They fade out once the visitor clicks, or has moved
 * the pointer far enough across the stage to have found the effect.
 */
export function StageHint({ items, color, moveToDismiss = 160 }: { items: string[]; color: string; moveToDismiss?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const [shown, setShown] = useState(true);
    useEffect(() => {
        const host = ref.current?.parentElement;
        if (!host || !shown) return;
        let travelled = 0, last: { x: number; y: number } | null = null;
        const onMove = (e: PointerEvent) => {
            if (last) travelled += Math.hypot(e.clientX - last.x, e.clientY - last.y);
            last = { x: e.clientX, y: e.clientY };
            if (travelled > moveToDismiss) setShown(false);
        };
        const onLeave = () => { last = null; };
        const onDown = () => setShown(false);
        host.addEventListener("pointermove", onMove, { passive: true });
        host.addEventListener("pointerleave", onLeave);
        host.addEventListener("pointerdown", onDown);
        return () => {
            host.removeEventListener("pointermove", onMove);
            host.removeEventListener("pointerleave", onLeave);
            host.removeEventListener("pointerdown", onDown);
        };
    }, [shown, moveToDismiss]);
    return (
        <div
            ref={ref}
            aria-hidden
            className="absolute inset-x-0 bottom-3 sm:bottom-6 z-10 flex justify-center gap-4 sm:gap-7 text-[12px] sm:text-[15px] tracking-[0.16em] uppercase whitespace-nowrap pointer-events-none transition-opacity duration-600"
            style={{ color, opacity: shown ? 1 : 0, fontFamily: "'Barlow Condensed', sans-serif" }}
        >
            {items.map((t) => <span key={t}>{t}</span>)}
        </div>
    );
}

/** A labelled row of mutually exclusive options. */
export function Segmented<T extends string>({
    label, options, value, onChange,
}: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
    return (
        <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">{label}</span>
            <div role="radiogroup" aria-label={label} className="inline-flex rounded-md border border-rule overflow-hidden">
                {options.map((o) => (
                    <button
                        key={o}
                        type="button"
                        role="radio"
                        aria-checked={o === value}
                        onClick={() => onChange(o)}
                        className={`px-2.5 py-1.5 font-mono text-[11px] tracking-mono transition-colors ${
                            o === value ? "bg-fg text-bg" : "bg-transparent text-fg-muted hover:text-fg"
                        }`}
                    >
                        {o}
                    </button>
                ))}
            </div>
        </div>
    );
}

export function ReplayButton({ onClick, children = "Replay" }: { onClick: () => void; children?: ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="ml-auto px-2.5 py-1.5 rounded-md border border-rule font-mono text-[11px] tracking-mono text-fg-muted hover:text-fg hover:border-rule-strong transition-colors"
        >
            ↻ {children}
        </button>
    );
}

export function Controls({ children }: { children: ReactNode }) {
    return <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">{children}</div>;
}
