"use client";

import { useEffect, useRef, useState } from "react";
import { Controls, ReplayButton, Segmented, Stage } from "../stage";
import { defineRsAsciiLogo, EFFECTS, PALETTES, RAMPS, type EffectName, type PaletteName, type RampName } from "./asciiLogoElement";

const PALETTE_NAMES = Object.keys(PALETTES) as PaletteName[];
const RAMP_NAMES = Object.keys(RAMPS) as RampName[];

/** Mounts one <rs-ascii-logo> and keeps its attributes in sync. */
function AsciiLogo({ palette, ramp, effect }: { palette: PaletteName; ramp: RampName; effect: EffectName }) {
    const host = useRef<HTMLDivElement>(null);
    const el = useRef<HTMLElement | null>(null);

    useEffect(() => {
        defineRsAsciiLogo();
        const logo = document.createElement("rs-ascii-logo");
        logo.setAttribute("src", "/ui-collection/rs-logo.jpg");
        el.current = logo;
        host.current?.append(logo);
        return () => { logo.remove(); el.current = null; };
    }, []);

    useEffect(() => {
        const logo = el.current;
        if (!logo) return;
        logo.setAttribute("palette", palette);
        logo.setAttribute("ramp", ramp);
        logo.setAttribute("effect", effect);
    }, [palette, ramp, effect]);

    return <div ref={host} className="absolute inset-0" />;
}

export function AsciiLogoDemo() {
    const [palette, setPalette] = useState<PaletteName>("Logo");
    const [ramp, setRamp] = useState<RampName>("Classic");
    const [effect, setEffect] = useState<EffectName>("Scramble");
    const [run, setRun] = useState(0);

    return (
        <div>
            <Stage background={PALETTES[palette].bg}>
                <AsciiLogo key={run} palette={palette} ramp={ramp} effect={effect} />
            </Stage>
            <Controls>
                <Segmented label="Palette" options={PALETTE_NAMES} value={palette} onChange={setPalette} />
                <Segmented label="Ramp" options={RAMP_NAMES} value={ramp} onChange={setRamp} />
                <Segmented label="Hover" options={EFFECTS} value={effect} onChange={setEffect} />
                <ReplayButton onClick={() => setRun((r) => r + 1)} />
            </Controls>
        </div>
    );
}
