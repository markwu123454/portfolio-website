import { Mail, FileText, ExternalLink } from "lucide-react";
import { SiGithub, SiLinkedin } from "react-icons/si";

export default function ContactPage() {
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

            <main className="relative z-[1] mx-auto w-full max-w-4xl px-6 py-16 mt-16">
                {/* ── header ────────────────────────────────────────────── */}
                <header className="mb-12">
                    <div className="font-mono text-[11px] tracking-[0.2em] text-white/40 uppercase mb-4">
                        <span className="text-cyan-400">■</span> GENERAL — CONTACT
                    </div>

                    <h1 className="font-mono text-[clamp(30px,4.5vw,48px)] font-extrabold leading-[1.08] tracking-tight animate-[headingGlow_4s_ease-in-out_infinite]">
            <span className="bg-gradient-to-br from-cyan-400 to-violet-500 bg-clip-text text-transparent">
              CONNECT
            </span>
                    </h1>

                    <p className="mt-5 font-sans text-[15px] leading-[1.7] text-white/50 max-w-md">
                        Collaborations, projects, or a quick chat.
                    </p>
                </header>

                {/* ── contact grid ──────────────────────────────────────── */}
                <div className="grid gap-3 sm:grid-cols-2 mb-14">
                    <ContactCard
                        href="mailto:me@markwu.org"
                        icon={<Mail className="h-4 w-4" />}
                        tag="EMAIL"
                        title="Professional Email"
                        subtitle="me@markwu.org"
                    />
                    <ContactCard
                        href="https://github.com/markwu123454"
                        icon={<SiGithub className="h-4 w-4" />}
                        tag="CODE"
                        title="GitHub"
                        subtitle="Explore my code and projects"
                        external
                    />
                    <ContactCard
                        href="https://www.linkedin.com/in/mark-mai-wu/"
                        icon={<SiLinkedin className="h-4 w-4" />}
                        tag="PROFESSIONAL"
                        title="LinkedIn"
                        subtitle="Professional profile and experience"
                        external
                    />
                    <ContactCard
                        href="mailto:mark.wu123454@gmail.com"
                        icon={<Mail className="h-4 w-4" />}
                        tag="EMAIL"
                        title="Personal Email"
                        subtitle="mark.wu123454@gmail.com"
                    />
                    <ContactCard
                        href="/resume"
                        icon={<FileText className="h-4 w-4" />}
                        tag="RESUME"
                        title="Resume"
                        subtitle="/resume"
                        highlight
                    />
                </div>

                {/* ── footer telemetry ──────────────────────────────────── */}
                <div className="border-t border-cyan-400/[0.1] pt-6 pb-10 flex flex-wrap gap-x-7 gap-y-1.5">
                    {[
                        { l: "CHANNELS", v: "5" },
                        { l: "STATUS", v: "OPEN" },
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

/* ══════════════════════════════════════════════════════════════════
   CONTACT CARD
══════════════════════════════════════════════════════════════════ */

function ContactCard({
                         href,
                         icon,
                         tag,
                         title,
                         subtitle,
                         external,
                         highlight,
                     }: {
    href: string;
    icon: React.ReactNode;
    tag: string;
    title: string;
    subtitle: string;
    external?: boolean;
    highlight?: boolean;
}) {
    return (
        <a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className={`group block rounded-lg border bg-[rgba(10,18,32,0.65)] backdrop-blur-xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_22px_rgba(0,220,255,0.08)] ${
                highlight
                    ? "border-cyan-400/25 hover:border-cyan-400/40"
                    : "border-cyan-400/[0.1] hover:border-cyan-400/25"
            }`}
        >
            {/* scanline */}
            <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,220,255,0.008)_2px,rgba(0,220,255,0.008)_4px)]" />

            <div className="p-5 flex items-start gap-4">
                {/* icon */}
                <div className={`shrink-0 mt-0.5 flex items-center justify-center w-9 h-9 rounded-md border transition-colors duration-200 ${
                    highlight
                        ? "border-cyan-400/30 bg-cyan-400/[0.08] text-cyan-400"
                        : "border-cyan-400/[0.1] bg-cyan-400/[0.04] text-cyan-400/60 group-hover:text-cyan-400 group-hover:border-cyan-400/25"
                }`}>
                    {icon}
                </div>

                {/* text */}
                <div className="flex-1 min-w-0">
                    <div className="font-mono text-[9px] tracking-[0.16em] text-white/35 uppercase">
                        {tag}
                    </div>
                    <div className="mt-0.5 font-mono text-sm font-bold text-white/85 tracking-tight">
                        {title}
                    </div>
                    <div className="mt-0.5 font-sans text-[12px] text-white/40 leading-[1.4] truncate">
                        {subtitle}
                    </div>
                </div>

                {/* arrow */}
                <ExternalLink className="shrink-0 mt-1 h-3.5 w-3.5 text-white/15 group-hover:text-cyan-400/50 transition-colors duration-200" />
            </div>
        </a>
    );
}