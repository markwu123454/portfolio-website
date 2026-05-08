import { Globe } from "lucide-react";

export default function PortfolioWebsitePage() {
    return (
        <>
            {/* ── ambient background ──────────────────────────────────── */}
            <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[#06080d]" />
                <div
                    className="absolute inset-0 animate-[gridPulse_8s_ease-in-out_infinite]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(0,220,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,220,255,0.03) 1px,transparent 1px)",
                        backgroundSize: "56px 56px",
                    }}
                />
                <div className="absolute -top-48 -right-48 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(0,220,255,0.06),transparent_70%)]" />
                <div className="absolute -bottom-40 -left-32 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.05),transparent_70%)]" />
            </div>

            <style>{`
        @keyframes gridPulse {
          0%,100%{opacity:0.02}
          50%{opacity:0.06}
        }
        @keyframes headingGlow {
          0%,100%{text-shadow:0 0 24px rgba(0,220,255,0.12)}
          50%{text-shadow:0 0 44px rgba(0,220,255,0.28)}
        }
      `}</style>

            <main className="relative z-[1] mx-auto w-full max-w-5xl px-6 py-16 mt-16">
                {/* ── header ────────────────────────────────────────────── */}
                <header className="mb-14">
                    <div className="font-mono text-[11px] tracking-[0.2em] text-white/40 uppercase mb-4">
                        <span className="text-cyan-400">■</span> META — THIS SITE
                    </div>

                    <h1 className="font-mono text-[clamp(30px,4.5vw,48px)] font-extrabold leading-[1.08] tracking-tight animate-[headingGlow_4s_ease-in-out_infinite]">
            <span className="bg-gradient-to-br from-cyan-400 to-violet-500 bg-clip-text text-transparent">
              MARKWU.ORG
            </span>
                    </h1>

                    <p className="mt-5 font-sans text-[15px] leading-[1.7] text-white/55 max-w-[520px]">
                        The site you&apos;re looking at. A unified hub for my projects,
                        teams, and ongoing work — built around a terminal-inspired design
                        system with monospace typography, cyan/violet accents, and
                        telemetry-style data presentation.
                    </p>
                </header>

                {/* ── stack ─────────────────────────────────────────────── */}
                <div className="flex items-center gap-3 mb-7">
                    <span className="font-mono text-[13px] font-bold text-cyan-400 tracking-[0.08em]">—</span>
                    <span className="relative inline-block w-2 h-2">
            <span className="absolute inset-0 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,220,255,0.35)]" />
          </span>
                    <span className="flex-1 h-px bg-gradient-to-r from-cyan-400/25 to-transparent" />
                    <span className="font-mono text-[11px] tracking-[0.14em] text-white/35 uppercase">STACK</span>
                </div>

                <div className="rounded-lg border border-cyan-400/[0.1] bg-[rgba(10,18,32,0.65)] backdrop-blur-xl overflow-hidden mb-14">
                    <div className="flex items-center gap-2.5 px-5 py-2.5 border-b border-cyan-400/[0.08] bg-black/25">
            <span className="flex gap-[5px]">
              <span className="w-2 h-2 rounded-full bg-[#ff5f57] opacity-70" />
              <span className="w-2 h-2 rounded-full bg-[#febc2e] opacity-70" />
              <span className="w-2 h-2 rounded-full bg-[#28c840] opacity-70" />
            </span>
                        <span className="font-mono text-[10px] tracking-[0.14em] text-white/50 uppercase">TECH.MANIFEST</span>
                    </div>
                    <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
                        {[
                            { l: "FRAMEWORK", v: "NEXT.JS (APP ROUTER)" },
                            { l: "STYLING", v: "TAILWIND" },
                            { l: "FONTS", v: "JETBRAINS MONO · IBM PLEX SANS" },
                            { l: "DEPLOY", v: "VERCEL" },
                            { l: "DNS", v: "CLOUDFLARE" },
                            { l: "DOMAIN", v: "MARKWU.ORG" },
                        ].map((t, i) => (
                            <div key={i}>
                                <div className="font-mono text-[9px] tracking-[0.16em] text-white/35 uppercase">{t.l}</div>
                                <div className="font-mono text-[12px] text-white/60 mt-0.5">{t.v}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── the joke ──────────────────────────────────────────── */}
                <div className="rounded-lg border border-cyan-400/[0.1] bg-[rgba(10,18,32,0.65)] backdrop-blur-xl p-5 flex items-center gap-3 mb-14">
                    <Globe className="h-4 w-4 text-cyan-400/50 shrink-0" />
                    <span className="font-mono text-sm text-white/50">
            You&apos;re already looking at it.
          </span>
                </div>

                {/* ── footer telemetry ──────────────────────────────────── */}
                <div className="border-t border-cyan-400/[0.1] pt-6 pb-10 flex flex-wrap gap-x-7 gap-y-1.5">
                    {[
                        { l: "SYS.STATUS", v: "LIVE" },
                        { l: "PAGES", v: "YOU'RE ON ONE" },
                    ].map((t, i) => (
                        <span key={i} className="font-mono text-[10px] tracking-[0.1em] text-white/35">
              <span className="text-white/50">{t.l}:</span>{" "}
                            <span className="text-cyan-400">{t.v}</span>
            </span>
                    ))}
                </div>
            </main>
        </>
    );
}