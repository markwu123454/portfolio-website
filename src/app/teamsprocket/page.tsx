"use client";

import {useEffect, useMemo, useRef, useState} from "react";

type BlobSpec = {
    id: number;
    size: number;         // px
    color: string;        // Tailwind bg-.../opacity class
    blur: string;         // Tailwind blur class
    // runtime
    x: number;            // px (center)
    y: number;            // px (center)
    vx: number;           // px/s
    vy: number;           // px/s
};

function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(false);
    useEffect(() => {
        const m = window.matchMedia("(prefers-reduced-motion: reduce)");
        const onChange = () => setReduced(m.matches);
        onChange();
        m.addEventListener?.("change", onChange);
        return () => m.removeEventListener?.("change", onChange);
    }, []);
    return reduced;
}

export default function ScoutingPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const blobsRef = useRef<BlobSpec[]>([]);
    const rafRef = useRef<number | null>(null);
    const lastTsRef = useRef<number | null>(null);
    const reducedMotion = usePrefersReducedMotion();

    // Define your blobs (sizes/colors/blur)
    const baseBlobs = useMemo(
        () => [
            { id: 1, size: 256, color: "bg-white/30",     blur: ""  },
            { id: 2, size: 224, color: "bg-indigo-600/40",blur: ""  },
            { id: 3, size: 160, color: "bg-pink-500/30",  blur: "blur-"  },
            { id: 4, size: 192, color: "bg-emerald-400/30", blur: "blur-"},
            { id: 5, size: 128, color: "bg-yellow-400/20",  blur: "blur-"},
        ],
        []
    );

    // Initialize positions/velocities once we know container size
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const init = () => {
            const { width, height } = el.getBoundingClientRect();
            const rnd = (min: number, max: number) => Math.random() * (max - min) + min;

            blobsRef.current = baseBlobs.map((b) => {
                const r = b.size / 2;
                // random position staying fully inside
                const x = rnd(r, width - r);
                const y = rnd(r, height - r);
                // gentle random velocity; scale with container
                const speed = rnd(20, 60); // px/s
                const angle = rnd(0, Math.PI * 2);
                return {
                    ...b,
                    x, y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                };
            });
        };

        init();
        const onResize = () => init();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [baseBlobs]);

    // Physics loop
    useEffect(() => {
        if (reducedMotion) return; // do not animate

        const el = containerRef.current;
        if (!el) return;

        const restitution = 0.98; // slight damping on wall hits
        const maxDt = 0.033; // cap step (33ms)

        const tick = (ts: number) => {
            const { width, height } = el.getBoundingClientRect();
            const blobs = blobsRef.current;

            // dt in seconds
            const last = lastTsRef.current ?? ts;
            let dt = (ts - last) / 1000;
            lastTsRef.current = ts;
            if (dt <= 0) dt = 0.016;
            if (dt > maxDt) dt = maxDt;

            // Integrate positions
            for (const b of blobs) {
                b.x += b.vx * dt;
                b.y += b.vy * dt;

                const r = b.size / 2;

                // Wall collisions (elastic-ish)
                if (b.x - r < 0) { b.x = r; b.vx = Math.abs(b.vx) * restitution; }
                else if (b.x + r > width) { b.x = width - r; b.vx = -Math.abs(b.vx) * restitution; }

                if (b.y - r < 0) { b.y = r; b.vy = Math.abs(b.vy) * restitution; }
                else if (b.y + r > height) { b.y = height - r; b.vy = -Math.abs(b.vy) * restitution; }
            }

            // Pairwise collisions (simple elastic for equal mass circles)
            for (let i = 0; i < blobs.length; i++) {
                for (let j = i + 1; j < blobs.length; j++) {
                    const a = blobs[i], b = blobs[j];
                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    const dist = Math.hypot(dx, dy);
                    const minDist = (a.size + b.size) / 2;

                    if (dist > 0 && dist < minDist) {
                        // Push them apart to resolve overlap
                        const overlap = (minDist - dist);
                        const nx = dx / dist;
                        const ny = dy / dist;
                        const push = overlap / 2;
                        a.x -= nx * push; a.y -= ny * push;
                        b.x += nx * push; b.y += ny * push;

                        // Relative velocity along normal
                        const rvx = b.vx - a.vx;
                        const rvy = b.vy - a.vy;
                        const vn = rvx * nx + rvy * ny;
                        if (vn < 0) {
                            // Elastic impulse for equal masses
                            const impulse = -(1.0) * vn;
                            const ix = impulse * nx;
                            const iy = impulse * ny;
                            a.vx -= ix; a.vy -= iy;
                            b.vx += ix; b.vy += iy;
                        }
                    }
                }
            }

            // Apply DOM transforms
            for (const b of blobs) {
                const node = document.getElementById(`blob-${b.id}`);
                if (node) {
                    const r = b.size / 2;
                    node.style.transform = `translate(${b.x - r}px, ${b.y - r}px)`;
                }
            }

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
            lastTsRef.current = null;
        };
    }, [reducedMotion]);

    return (
        <main className="flex flex-col">
            <section
                ref={containerRef}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black h-screen"
            >
                {/* Blobs: absolutely positioned; JS updates their transform */}
                {useMemo(
                    () =>
                        baseBlobs.map((b) => (
                            <div
                                key={b.id}
                                id={`blob-${b.id}`}
                                className={`absolute rounded-full ${b.blur} ${b.color} pointer-events-none [will-change:transform]`}
                                style={{
                                    width: b.size,
                                    height: b.size,
                                    transform: "translate(-9999px,-9999px)", // moved on first tick
                                }}
                            />
                        )),
                    [baseBlobs]
                )}

                {/* Optional static content overlay */}
                <div className="absolute inset-0">
                    {/* Add hero text/UI here */}
                </div>
            </section>
        </main>
    );
}
