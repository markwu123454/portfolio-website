"use client";

import { useEffect, useRef, useState } from "react";
import { Controls, Segmented, Stage, StageHint } from "../stage";
import { startParticleField, type ParticleFieldTheme } from "./particleField";

const THEMES = ["Dark", "Light"] as const;
type Theme = (typeof THEMES)[number];

/** The three.js renderer appends its own canvas into this div. */
function Field({ theme }: { theme: ParticleFieldTheme }) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!ref.current) return;
        const field = startParticleField(ref.current, theme);
        return () => field.destroy();
    }, [theme]);
    return <div ref={ref} className="absolute inset-0" />;
}

export function ParticleFieldDemo() {
    const [theme, setTheme] = useState<Theme>("Dark");
    return (
        <div>
            <Stage background={theme === "Dark" ? "#000000" : "#ffffff"}>
                <Field theme={theme === "Dark" ? "dark" : "light"} />
                <StageHint
                    items={["Move to pull the ring", "Leave and it drifts"]}
                    color={theme === "Dark" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)"}
                />
            </Stage>
            <Controls>
                <Segmented label="Theme" options={THEMES} value={theme} onChange={setTheme} />
                <span className="font-mono text-[11px] text-fg-soft">The ring eases after the pointer and wanders once it leaves.</span>
            </Controls>
        </div>
    );
}
