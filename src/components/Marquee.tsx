"use client";
import {useEffect, useMemo, useRef, useState} from "react";

type Props = { logos: string[] }; // or hardcode in page and pass here

export default function Marquee({ logos }: Props) {
    const [rowW, setRowW] = useState(0);
    const rowRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    // duplicate for seamless loop
    const row = useMemo(() => [...logos], [logos]);

    useEffect(() => {
        const measure = () => {
            if (!rowRef.current) return;
            setRowW(rowRef.current.scrollWidth);
            if (trackRef.current) {
                trackRef.current.style.setProperty("--shift", `${rowRef.current.scrollWidth}px`);
            }
        };
        measure();

        // re-measure on resize/content load
        const ro = new ResizeObserver(measure);
        rowRef.current && ro.observe(rowRef.current);
        window.addEventListener("resize", measure);
        // re-measure when images load
        const imgs = rowRef.current?.querySelectorAll("img") ?? [];
        imgs.forEach(img => {
            if (!img.complete) img.addEventListener("load", measure, { once: true });
        });
        return () => {
            window.removeEventListener("resize", measure);
            ro.disconnect();
        };
    }, [logos]);

    return (
        <section className="marquee select-none py-8 border-b border-white/10">
            <div
                ref={trackRef}
                className="track"
                // Duration proportional to content width (slower for longer rows)
                style={{ ["--dur" as never]: `${Math.max(16, Math.min(48, rowW / 100))}s` }}
            >
                {/* Row A (measured) */}
                <div ref={rowRef} className="row">
                    {row.map((src, i) => (
                        <Logo key={`a-${i}`} src={src} />
                    ))}
                </div>
                {/* Row B (clone) */}
                <div className="row" aria-hidden="true">
                    {row.map((src, i) => (
                        <Logo key={`b-${i}`} src={src} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function Logo({ src }: { src: string }) {
    return (
        <div className="item">
            <img
                src={src}
                alt=""
                draggable={false}
                className="h-14 w-auto object-contain opacity-90"
            />
        </div>
    );
}
