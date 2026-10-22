"use client";

import { useEffect, useRef, useState } from "react";
import { Controls, ReplayButton, Stage, StageHint } from "../stage";
import { startLandingTexture } from "./landingTexture";

// The app's landing pane: its background, and the muted text colour the glyphs are inked in.
const PANE_BG = "#1b1b1a";
const INK = "#8d8c88";

function Texture() {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!ref.current) return;
        const texture = startLandingTexture(ref.current);
        return () => texture.destroy();
    }, []);
    return (
        <div
            ref={ref}
            aria-hidden
            // As in the app: pointer-events-none absolute inset-0, mono font, muted text colour.
            className="absolute inset-0 pointer-events-none [contain:strict] [&>canvas]:absolute [&>canvas]:block"
            style={{ fontFamily: 'ui-monospace, "Cascadia Mono", "SF Mono", Menlo, Consolas, monospace', color: INK }}
        />
    );
}

export function LandingTextureDemo() {
    // Each mount seeds a new wind: heading, speed, gust size and glyph set.
    const [run, setRun] = useState(0);
    return (
        <div>
            <Stage background={PANE_BG} style={{ colorScheme: "dark" }}>
                <Texture key={run} />
                <StageHint items={["Click for a ripple", "Sweep to warm the air"]} color="rgba(237,236,232,0.55)" />
            </Stage>
            <Controls>
                <span className="font-mono text-[11px] text-fg-soft">Each run seeds its own heading, gusts and glyph set.</span>
                <ReplayButton onClick={() => setRun((r) => r + 1)}>New wind</ReplayButton>
            </Controls>
        </div>
    );
}
