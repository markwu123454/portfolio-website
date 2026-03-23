"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// Message encoded in Base64
// Original: "You have the patience of a saint. Here's your reward: 🎉 The secret is that there are no secrets. Only time well spent."
const ENCODED_MESSAGE = btoa(
    "You have the patience of a saint. Heres your reward:  The secret is that there are no secrets. Only time well spent."
);

function decodeMessage(encoded: string): string {
    return atob(encoded);
}

const TOTAL_SECONDS = 600; // 10 minutes
const PUNISHMENT_CLICKS = 10;

export default function WaitPage() {
    const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
    const [revealed, setRevealed] = useState(false);
    const [clicks, setClicks] = useState(0);
    const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
    const [message, setMessage] = useState("");

    // Focus / visibility state
    const [isActive, setIsActive] = useState(true);
    const [punishmentLeft, setPunishmentLeft] = useState(0);
    const [punishmentRipples, setPunishmentRipples] = useState<{ id: number; x: number; y: number }[]>([]);
    const [leaveCount, setLeaveCount] = useState(0);
    const [showPunishment, setShowPunishment] = useState(false);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const rippleId = useRef(0);
    const isActiveRef = useRef(true);
    const revealedRef = useRef(false);

    // ── Timer ─────────────────────────────────────────────────────────────────
    const startTimer = useCallback(() => {
        if (intervalRef.current) return;
        intervalRef.current = setInterval(() => {
            if (!isActiveRef.current) return;
            setSecondsLeft((s) => {
                if (s <= 1) {
                    clearInterval(intervalRef.current!);
                    intervalRef.current = null;
                    return 0;
                }
                return s - 1;
            });
        }, 1000);
    }, []);

    const stopTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        startTimer();
        return () => stopTimer();
    }, [startTimer, stopTimer]);

    useEffect(() => {
        if (secondsLeft <= 0 && !revealedRef.current) {
            revealedRef.current = true;
            setRevealed(true);
            setMessage(decodeMessage(ENCODED_MESSAGE));
        }
    }, [secondsLeft]);

    // ── Focus / visibility detection ──────────────────────────────────────────
    const handleLeave = useCallback(() => {
        if (revealedRef.current) return;
        isActiveRef.current = false;
        setIsActive(false);
        setLeaveCount((c) => c + 1);
        setPunishmentLeft(PUNISHMENT_CLICKS);
        setShowPunishment(true);
    }, []);

    useEffect(() => {
        if (revealed) return;

        const onVisibilityChange = () => {
            if (document.hidden) handleLeave();
        };
        const onBlur = () => handleLeave();

        document.addEventListener("visibilitychange", onVisibilityChange);
        window.addEventListener("blur", onBlur);

        return () => {
            document.removeEventListener("visibilitychange", onVisibilityChange);
            window.removeEventListener("blur", onBlur);
        };
    }, [revealed, handleLeave]);

    // Resume after punishment complete
    useEffect(() => {
        if (punishmentLeft === 0 && showPunishment) {
            isActiveRef.current = true;
            setIsActive(true);
            setShowPunishment(false);
            startTimer();
        }
    }, [punishmentLeft, showPunishment, startTimer]);

    // ── Ripple helper ─────────────────────────────────────────────────────────
    const addRipple = (
        e: React.MouseEvent<HTMLButtonElement>,
        setter: React.Dispatch<React.SetStateAction<{ id: number; x: number; y: number }[]>>
    ) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const id = rippleId.current++;
        setter((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
        setTimeout(() => setter((r) => r.filter((rp) => rp.id !== id)), 700);
    };

    // ── Click handlers ────────────────────────────────────────────────────────
    const handleShortcutClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (revealed || showPunishment) return;
        setSecondsLeft((s) => Math.max(0, s - 1));
        setClicks((c) => c + 1);
        addRipple(e, setRipples);
    };

    const handlePunishmentClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        addRipple(e, setPunishmentRipples);
        setPunishmentLeft((p) => Math.max(0, p - 1));
    };

    // ── Derived values ────────────────────────────────────────────────────────
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const progress = ((TOTAL_SECONDS - secondsLeft) / TOTAL_SECONDS) * 100;
    const circumference = 2 * Math.PI * 120;
    const strokeDash = (progress / 100) * circumference;
    const punishmentProgress = ((PUNISHMENT_CLICKS - punishmentLeft) / PUNISHMENT_CLICKS) * 100;
    const timerActive = isActive && !showPunishment;

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white mt-24 flex flex-col items-center px-4 select-none">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=JetBrains+Mono:wght@300;400&display=swap');

        .font-display { font-family: 'Cormorant Garamond', serif; }
        .font-mono-custom { font-family: 'JetBrains Mono', monospace; }

        .grain::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 100;
          opacity: 0.4;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212,175,55,0); }
          50% { box-shadow: 0 0 30px 8px rgba(212,175,55,0.15); }
        }
        @keyframes ripple {
          from { transform: scale(0); opacity: 0.6; }
          to { transform: scale(4); opacity: 0; }
        }
        @keyframes redRipple {
          from { transform: scale(0); opacity: 0.8; }
          to { transform: scale(5); opacity: 0; }
        }
        @keyframes revealText {
          from { opacity: 0; letter-spacing: 0.5em; filter: blur(8px); }
          to { opacity: 1; letter-spacing: normal; filter: blur(0); }
        }
        @keyframes overlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pausedPulse {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.6; }
        }

        .btn-press:active { transform: scale(0.97); }
        .animate-ripple { animation: ripple 0.6s ease-out forwards; }
        .animate-red-ripple { animation: redRipple 0.65s ease-out forwards; }
        .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
        .animate-reveal { animation: revealText 1.5s ease-out forwards; }
        .animate-pulse-glow { animation: pulseGlow 3s ease-in-out infinite; }
        .animate-overlay-in { animation: overlayIn 0.25s ease-out forwards; }
        .animate-card-in { animation: cardIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards; }
        .animate-paused-pulse { animation: pausedPulse 1.4s ease-in-out infinite; }
        .paused-filter { filter: grayscale(0.5) brightness(0.65); }
      `}</style>

            <div className="grain" />

            {/* ── PUNISHMENT OVERLAY ─────────────────────────────────────── */}
            {showPunishment && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center animate-overlay-in"
                    style={{ background: "rgba(8,2,2,0.88)", backdropFilter: "blur(14px)" }}
                >
                    <div className="animate-card-in flex flex-col items-center gap-7 max-w-sm w-full px-8">
                        {/* Icon + heading */}
                        <div className="flex flex-col items-center gap-3">
                            <div
                                className="w-14 h-14 border border-red-800/50 flex items-center justify-center"
                                style={{ boxShadow: "0 0 40px rgba(160,20,20,0.25)" }}
                            >
                                <span className="font-mono-custom text-red-500 text-2xl leading-none">✕</span>
                            </div>
                            <h2 className="font-display text-4xl text-red-400/90 font-light tracking-widest">
                                you left.
                            </h2>
                            <p className="font-mono-custom text-[10px] text-red-800/70 tracking-[0.25em] uppercase text-center leading-relaxed">
                                {leaveCount === 1
                                    ? "the timer has paused. earn your way back."
                                    : leaveCount === 2
                                        ? "again? really? earn it back. again."
                                        : `offence #${leaveCount}. you never learn.`}
                            </p>
                        </div>

                        {/* Dot counter */}
                        <div className="flex flex-col items-center gap-3 w-full">
                            <p className="font-mono-custom text-[11px] text-white/35 tracking-widest">
                                {punishmentLeft > 0
                                    ? `${punishmentLeft} click${punishmentLeft !== 1 ? "s" : ""} remaining`
                                    : "releasing…"}
                            </p>
                            <div className="flex gap-2">
                                {Array.from({ length: PUNISHMENT_CLICKS }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-2 h-2 rounded-full transition-all duration-200"
                                        style={{
                                            background:
                                                i < PUNISHMENT_CLICKS - punishmentLeft
                                                    ? "#dc2626"
                                                    : "rgba(255,255,255,0.08)",
                                            boxShadow:
                                                i < PUNISHMENT_CLICKS - punishmentLeft
                                                    ? "0 0 8px rgba(220,38,38,0.7)"
                                                    : "none",
                                        }}
                                    />
                                ))}
                            </div>
                            <div className="w-full h-px bg-white/8 relative overflow-hidden rounded-full">
                                <div
                                    className="absolute left-0 top-0 h-full bg-red-700/70 transition-all duration-300"
                                    style={{ width: `${punishmentProgress}%` }}
                                />
                            </div>
                        </div>

                        {/* Punishment button */}
                        <button
                            onClick={handlePunishmentClick}
                            className="relative overflow-hidden btn-press w-48 py-4
                border border-red-800/40 text-red-400/80
                font-mono-custom text-xs tracking-[0.3em] uppercase
                hover:border-red-600/60 hover:text-red-300
                transition-all duration-200 bg-red-950/20 hover:bg-red-900/20
                select-none"
                            style={{ boxShadow: "0 0 24px rgba(140,20,20,0.12)" }}
                        >
                            {punishmentRipples.map((r) => (
                                <span
                                    key={r.id}
                                    className="animate-red-ripple absolute block w-4 h-4 rounded-full bg-red-600/25"
                                    style={{ left: r.x - 8, top: r.y - 8 }}
                                />
                            ))}
                            <span className="relative z-10">I&#39;m sorry</span>
                        </button>

                        <p className="font-mono-custom text-[9px] text-white/15 tracking-widest text-center">
                            timer is frozen until you atone
                        </p>
                    </div>
                </div>
            )}

            {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
            {!revealed ? (
                <div
                    className={`flex flex-col items-center gap-10 animate-fade-in transition-all duration-500 ${showPunishment ? "pointer-events-none select-none" : ""}`}
                >
                    {/* Title */}
                    <div className="text-center">
                        <h1 className="font-display text-5xl md:text-6xl font-light text-[#d4af37] tracking-widest mb-2">
                            patience
                        </h1>
                        <p
                            className={`font-mono-custom text-xs tracking-[0.3em] uppercase transition-all duration-500 ${!timerActive ? "animate-paused-pulse" : ""}`}
                            style={{ color: timerActive ? "rgba(255,255,255,0.3)" : "rgba(200,50,50,0.5)" }}
                        >
                            {timerActive ? "a message awaits" : "⏸  paused"}
                        </p>
                    </div>

                    {/* Timer ring */}
                    <div
                        className={`relative flex items-center justify-center transition-all duration-700 ${!timerActive ? "paused-filter" : ""}`}
                    >
                        <svg width="280" height="280" viewBox="0 0 280 280">
                            <circle cx="140" cy="140" r="120" fill="none"
                                    stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
                            <circle cx="140" cy="140" r="108" fill="none"
                                    stroke="rgba(212,175,55,0.07)" strokeWidth="0.5" />
                            <circle
                                cx="140" cy="140" r="120" fill="none"
                                strokeWidth="1" strokeLinecap="round"
                                style={{
                                    stroke: timerActive ? "#d4af37" : "#5a1010",
                                    strokeDasharray: `${strokeDash} ${circumference}`,
                                    strokeDashoffset: 0,
                                    transform: "rotate(-90deg)",
                                    transformOrigin: "center",
                                    transition: "stroke-dasharray 0.5s ease, stroke 0.6s ease",
                                }}
                            />
                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                  className="font-mono-custom text-5xl font-light tracking-tight transition-colors duration-500"
                  style={{ color: timerActive ? "white" : "rgba(140,40,40,0.7)" }}
              >
                {String(minutes).padStart(2, "0")}
                  <span style={{ color: timerActive ? "rgba(212,175,55,0.6)" : "rgba(100,20,20,0.5)" }}>:</span>
                  {String(seconds).padStart(2, "0")}
              </span>
                            <span
                                className={`font-mono-custom text-[10px] tracking-[0.4em] uppercase mt-2 transition-colors duration-500 ${!timerActive ? "animate-paused-pulse" : ""}`}
                                style={{ color: timerActive ? "rgba(255,255,255,0.25)" : "rgba(180,50,50,0.5)" }}
                            >
                {timerActive ? "remaining" : "paused"}
              </span>
                            {clicks > 0 && (
                                <span className="font-mono-custom text-[10px] text-[#d4af37]/40 tracking-widest mt-1">
                  −{clicks}s saved
                </span>
                            )}
                            {leaveCount > 0 && (
                                <span className="font-mono-custom text-[10px] text-red-900/50 tracking-widest mt-0.5">
                  {leaveCount} escape{leaveCount !== 1 ? "s" : ""}
                </span>
                            )}
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-64 h-px bg-white/10 relative overflow-hidden rounded-full">
                        <div
                            className="absolute left-0 top-0 h-full transition-all duration-500"
                            style={{
                                width: `${progress}%`,
                                background: timerActive
                                    ? "linear-gradient(to right, rgba(212,175,55,0.6), #d4af37)"
                                    : "rgba(100,20,20,0.4)",
                            }}
                        />
                    </div>

                    {/* Shortcut button */}
                    <div className="flex flex-col items-center gap-3">
                        <button
                            onClick={handleShortcutClick}
                            disabled={showPunishment}
                            className="relative overflow-hidden btn-press animate-pulse-glow
                w-48 py-4 border border-[#d4af37]/30 text-[#d4af37]/80
                font-mono-custom text-xs tracking-[0.3em] uppercase
                hover:border-[#d4af37]/70 hover:text-[#d4af37]
                transition-all duration-300 bg-[#d4af37]/5 hover:bg-[#d4af37]/10
                disabled:opacity-20 disabled:cursor-not-allowed
                select-none"
                        >
                            {ripples.map((r) => (
                                <span key={r.id}
                                      className="animate-ripple absolute block w-4 h-4 rounded-full bg-[#d4af37]/30"
                                      style={{ left: r.x - 8, top: r.y - 8 }} />
                            ))}
                            <span className="relative z-10">− 1 second</span>
                        </button>
                        <p className="font-mono-custom text-[10px] text-white/20 tracking-widest">
                            click to shorten the wait
                        </p>
                    </div>
                </div>
            ) : (
                /* ── REVEALED ─────────────────────────────────────────────── */
                <div className="flex flex-col items-center gap-8 max-w-xl text-center animate-fade-in">
                    <div>
                        <p className="font-mono-custom text-[10px] text-[#d4af37]/50 tracking-[0.5em] uppercase mb-6">
                            the message
                        </p>
                        <div className="w-12 h-px bg-[#d4af37]/30 mx-auto mb-8" />
                        <p className="font-display text-2xl md:text-3xl font-light text-white/90 leading-relaxed italic animate-reveal">
                            {message}
                        </p>
                        <div className="w-12 h-px bg-[#d4af37]/30 mx-auto mt-8" />
                    </div>

                    <div className="font-mono-custom text-[9px] text-white/20 tracking-widest mt-4 flex flex-col items-center gap-1">
                        {clicks > 0 && (
                            <span>you clicked {clicks.toLocaleString()} time{clicks !== 1 ? "s" : ""} to shorten it</span>
                        )}
                        {leaveCount > 0 && (
                            <span>you abandoned it {leaveCount} time{leaveCount !== 1 ? "s" : ""}</span>
                        )}
                        {leaveCount === 0 && clicks === 0 && <span>unwavering patience rewarded</span>}
                    </div>
                </div>
            )}
        </div>
    );
}