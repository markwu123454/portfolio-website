"use client";

import React, {useEffect, useMemo, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {Wrench, ArrowLeft, Rocket, Mail, House, EyeOff, Eye} from "lucide-react";
import Link from "next/link";

export type StageStatus = "done" | "in_progress" | "todo";
export type Stage = { label: string; status: StageStatus };

export type UnderConstructionProps = {
    name: string;
    stages: Stage[];
    progress?: number;
    backHref?: string;
    channelStatus?: "active" | "inactive" | "hold";
    passphrase?: string;
    preview?: React.ReactNode;
};


export default function UnderConstruction({
                                              name,
                                              stages,
                                              progress,
                                              backHref,
                                              channelStatus = "active",
                                              passphrase,
                                              preview,
                                          }: UnderConstructionProps) {
    const router = useRouter();

    const [typed, setTyped] = useState("");
    const [unlocked, setUnlocked] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const computed = useMemo(() => {
        if (typeof progress === "number") return Math.max(0, Math.min(100, progress));
        if (!stages?.length) return 0;
        const score = stages.reduce(
            (acc, s) => acc + (s.status === "done" ? 1 : s.status === "in_progress" ? 0.5 : 0),
            0
        );
        return Math.round((score / stages.length) * 100);
    }, [progress, stages]);

    const statusCfg = useMemo(() => {
        switch (channelStatus) {
            case "active":
                return {
                    label: "Active development",
                    dot: "bg-emerald-400/90",
                    dotPing: "bg-emerald-400/60",
                    ring: "border-white/10 bg-black/60",
                };
            case "hold":
                return {
                    label: "On hold",
                    dot: "bg-amber-400/90",
                    dotPing: "bg-amber-400/60",
                    ring: "border-white/10 bg-black/60",
                };
            case "inactive":
            default:
                return {
                    label: "Inactive",
                    dot: "bg-neutral-400/90",
                    dotPing: "bg-neutral-400/50",
                    ring: "border-white/10 bg-black/60",
                };
        }
    }, [channelStatus]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === "b") {
                if (backHref) window.location.assign(backHref);
                else router.back();
            }
            if (e.key === "/") {
                e.preventDefault();
                const el = document.getElementById("notify-input");
                if (el) (el as HTMLInputElement).focus();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [router, backHref]);

    useEffect(() => {
        if (passphrase && typed === passphrase) setUnlocked(true);
    }, [typed, passphrase]);

    if (unlocked && preview) {
        // no wrappers, no backgrounds — full takeover
        return <>{preview}</>;
    }

    return (
        <main className="relative min-h-[calc(100vh-209px)] overflow-hidden bg-black text-white">
            <Stars/>
            <GridGlow/>

            <section
                className="relative z-10 mx-auto flex max-w-3xl flex-col gap-8 px-6 pt-16 md:pt-20 min-h-[calc(100vh-209px)] mt-24">
                <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
                    <div
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] text-white/70 shadow-lg backdrop-blur ${statusCfg.ring}`}
                        style={{ pointerEvents: "auto" }}
                    >
                        <span className={`relative inline-flex h-2 w-2 overflow-hidden rounded-full ${statusCfg.dot}`}>
                            <span className={`absolute inset-0 animate-ping rounded-full ${statusCfg.dotPing}`} />
                        </span>
                        {statusCfg.label}
                    </div>
                </div>

                <header className="space-y-4">
                    <div
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur">
                        <Wrench className="h-3.5 w-3.5"/>
                        <span className="font-semibold text-white/90">{name}</span>
                    </div>

                    <p className="text-balance text-4xl font-black tracking-tight md:text-6xl">
                        <GradientText>Under construction</GradientText>
                    </p>

                    <p className="text-pretty text-sm leading-relaxed text-white/70 md:text-base">
                        This route exists. The feature doesn’t... yet.
                    </p>
                </header>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur md:p-6">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-white/80">
                            <Rocket className="h-4 w-4"/>
                            <span>Build progress</span>
                        </div>
                        <span className="tabular-nums text-xs text-white/60">{Math.round(computed)}%</span>
                    </div>
                    <Progress value={computed}/>
                    <ul className="mt-4 space-y-2 text-sm text-white/70">
                        {stages?.map((s, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <Dot ok={s.status === "done"} half={s.status === "in_progress"}/>
                                {s.label}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex flex-wrap gap-3">
                    {backHref ? (
                        <Link
                            href={backHref}
                            className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 disabled:opacity-50 disabled:pointer-events-none bg-gradient-to-tr from-emerald-400 via-cyan-300 to-blue-300 hover:brightness-110"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4"/> Back
                        </Link>
                    ) : (
                        <button
                            onClick={() => router.back()}
                            className="cursor-pointer inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 disabled:opacity-50 disabled:pointer-events-none bg-gradient-to-tr from-emerald-400 via-cyan-300 to-blue-300 hover:brightness-110"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4"/> Back
                        </button>
                    )}

                    <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 shadow-sm backdrop-blur transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        <House className="mr-2 h-4 w-4"/> Home
                    </Link>

                    <Link
                        href="/contact"
                        className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 shadow-sm backdrop-blur transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        <Mail className="mr-2 h-4 w-4"/> Contact
                    </Link>
                </div>

                {preview && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur md:p-6">
                        <p className="mb-3 text-sm text-white/80">
                            Developer preview available. {passphrase ? "Enter password to view." : "Click to view."}
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                            {passphrase ? (
                                <div className="relative">
                                    <input
                                        id="preview-pass"
                                        type={showPass ? "text" : "password"}
                                        autoComplete="off"
                                        value={typed}
                                        onChange={(e) => setTyped(e.target.value)}
                                        placeholder="Password"
                                        className="w-64 rounded-xl border border-white/15 bg-black/40 px-3 py-2 pr-10 text-sm text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-emerald-400/60"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
                                    >
                                        {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setUnlocked(true)}
                                    className="rounded-xl border border-white/15 bg-black/40 px-4 py-2 text-sm text-white/80 hover:bg-white/10 focus:ring-2 focus:ring-emerald-400/60"
                                >
                                    See Preview
                                </button>
                            )}

                            {passphrase && typed && typed !== passphrase && (
                                <span className="text-xs text-red-400/90">Incorrect password.</span>
                            )}
                        </div>
                    </div>
                )}


            </section>
        </main>
    );
}

/* ---------------------------- UI bits ---------------------------- */

function GradientText({children}: { children: React.ReactNode }) {
    return (
        <span
            className="bg-gradient-to-br from-white via-white to-white/60 bg-clip-text text-transparent [text-shadow:0_0_32px_rgba(255,255,255,0.15)]">
      {children}
    </span>
    );
}

function Dot({ ok = false, half = false }: { ok?: boolean; half?: boolean }) {
    let color = "bg-white/30"; // default (to do)
    if (half) color = "bg-amber-300"; // lighter green
    if (ok) color = "bg-emerald-400";   // full green

    return <span className={`inline-block h-1.5 w-1.5 rounded-full ${color}`} />;
}

function Progress({value}: { value: number }) {
    return (
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400"
                style={{width: `${Math.max(0, Math.min(100, value))}%`}}
            />
        </div>
    );
}

/* ---------------------- Background: Stars + Grid ---------------------- */

function Stars() {
    const ref = useRef<HTMLCanvasElement>(null);
    const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", {alpha: true});
        if (!ctx) return;

        let w = 0, h = 0;
        const stars: { x: number; y: number; r: number; s: number; tw: number }[] = [];

        const resize = () => {
            const {innerWidth, innerHeight} = window;
            const W = Math.ceil(innerWidth * dpr);
            const H = Math.ceil(innerHeight * dpr);
            w = W;
            h = H;
            canvas.width = W;
            canvas.height = H;
            canvas.style.width = `${innerWidth}px`;
            canvas.style.height = `${innerHeight}px`;

            stars.length = 0;
            const count = Math.floor((innerWidth * innerHeight) / 5000);
            for (let i = 0; i < count; i++) {
                const r = Math.random() * 1.4 + 0.3; // star radius
                stars.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    r,
                    s: (r * (Math.random() * 0.6 + 0.8)) * 0.5,
                    tw: Math.random() * Math.PI * 2,
                });
            }

        };

        const draw = () => {
            const ctx2 = canvas?.getContext("2d", {alpha: true});
            if (!ctx2) return;
            ctx2.clearRect(0, 0, w, h);
            ctx2.fillStyle = "#000";
            ctx2.fillRect(0, 0, w, h);

            for (const st of stars) {
                st.y += st.s;
                if (st.y > h) st.y = 0;
                st.tw += 0.02;
                const a = 0.5 + 0.5 * Math.sin(st.tw);
                ctx2.globalAlpha = 0.3 + 0.7 * a;
                ctx2.beginPath();
                ctx2.arc(st.x, st.y, st.r * dpr, 0, Math.PI * 2);
                ctx2.fillStyle = "#ffffff";
                ctx2.fill();
            }
            ctx2.globalAlpha = 1;
            requestAnimationFrame(draw);
        };

        resize();
        const onResize = () => resize();
        const id = requestAnimationFrame(draw);
        window.addEventListener("resize", onResize);
        return () => {
            cancelAnimationFrame(id);
            window.removeEventListener("resize", onResize);
        };
    }, [dpr]);

    return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-0"/>;
}

function GridGlow() {
    return (
        <>
            <div
                className="pointer-events-none absolute inset-0 z-0 [background:radial-gradient(60%_50%_at_50%_40%,rgba(32,149,243,0.25)_0%,rgba(0,0,0,0.0)_60%),radial-gradient(60%_50%_at_50%_80%,rgba(16,185,129,0.15)_0%,rgba(0,0,0,0.0)_60%)]"/>
            <div
                className="pointer-events-none absolute inset-0 z-0 opacity-20 [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:40px_40px]"/>
        </>
    );
}
