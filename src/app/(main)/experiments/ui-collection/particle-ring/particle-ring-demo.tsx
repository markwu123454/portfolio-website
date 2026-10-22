"use client";

import { useEffect, useRef } from "react";
import { Controls, Stage, StageHint } from "../stage";
import { startParticleRing } from "./particleRing";

function Ring() {
    const ref = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = ref.current;
        const host = canvas?.parentElement;
        if (!canvas || !host) return;
        const ring = startParticleRing(canvas, host);
        return () => ring.destroy();
    }, []);
    return <canvas ref={ref} aria-hidden className="absolute inset-0 w-full h-full block" />;
}

export function ParticleRingDemo() {
    return (
        <div>
            <Stage background="#ffffff">
                <Ring />
                <StageHint items={["Move to steer the ring", "Rest and it wanders"]} color="rgba(60,64,72,0.6)" />
            </Stage>
            <Controls>
                <span className="font-mono text-[11px] text-fg-soft">Rest the pointer and it wanders off on its own after 2.5 s.</span>
            </Controls>
        </div>
    );
}
