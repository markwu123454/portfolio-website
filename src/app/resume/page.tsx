import { Mail, Globe, FileDown } from "lucide-react";
import { SiGithub } from "react-icons/si";

export default function ResumePage() {
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
                <header className="mb-10">
                    <div className="font-mono text-[11px] tracking-[0.2em] text-white/40 uppercase mb-4">
                        <span className="text-cyan-400">■</span> DOCUMENT — RESUME
                    </div>

                    <h1 className="font-mono text-[clamp(36px,5vw,56px)] font-extrabold leading-[1.05] tracking-tight animate-[headingGlow_4s_ease-in-out_infinite]">
                        MARK{" "}
                        <span className="bg-gradient-to-br from-cyan-400 to-violet-500 bg-clip-text text-transparent">
              WU
            </span>
                    </h1>

                    {/* contact row */}
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                        <ContactLink href="mailto:me@markwu.org" icon={<Mail className="h-3 w-3" />} label="me@markwu.org" />
                        <ContactLink href="https://markwu.org" icon={<Globe className="h-3 w-3" />} label="markwu.org" />
                        <ContactLink href="https://github.com/markwu123454" icon={<SiGithub className="h-3 w-3" />} label="github.com/markwu123454" external />
                    </div>

                    {/* pdf download */}
                    <div className="mt-5">
                        <a
                            href="/resume.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-md border border-cyan-400/20 bg-cyan-400/[0.05] px-4 py-2.5 font-mono text-[11px] tracking-[0.12em] text-cyan-400/70 uppercase hover:bg-cyan-400/[0.1] hover:text-cyan-400 transition-colors duration-200"
                        >
                            <FileDown className="h-3.5 w-3.5" />
                            DOWNLOAD PDF
                        </a>
                    </div>
                </header>

                {/* ════════════════════════════════════════════════════════
            EDUCATION
        ════════════════════════════════════════════════════════ */}
                <SectionDivider label="EDUCATION" />

                <div className="space-y-3 mb-12">
                    <EntryCard
                        title="Diamond Bar High School"
                        location="Diamond Bar, CA"
                        role="Expected Graduation: June 2026"
                        dates="2024 — Present"
                        points={[
                            "Relevant Coursework: AP Physics C: Mechanics, AP Calculus BC, AP Computer Science A, AP Microeconomics, AP Macroeconomics, AP Precalculus, PLTW",
                            "Currently Taking: AP Chemistry, AP Statistics",
                        ]}
                    />
                    <EntryCard
                        title="ShenWai International School"
                        location="Shenzhen, China"
                        role="IB Middle Years Programme"
                        dates="2019 — 2024"
                        points={[
                            "Received IB MYP Bilingual Diploma",
                        ]}
                    />
                </div>

                {/* ════════════════════════════════════════════════════════
            PROJECTS
        ════════════════════════════════════════════════════════ */}
                <SectionDivider label="PROJECTS" />

                <div className="space-y-3 mb-12">
                    <ProjectCard
                        title="Project Aetherius"
                        tech="ArduPilot · MAVLink · Python · TypeScript"
                        dates="2024 — Present"
                        points={[
                            "Independently designed and built a 2m fixed-wing UAV, covering airframe construction and avionics integration",
                            "Developed a custom multiplatform full-stack ground control system (GCS) built entirely from scratch",
                            "Successfully completed first flight; ongoing tuning and iteration with a small team of collaborators",
                        ]}
                    />
                    <ProjectCard
                        title="SprocketStats"
                        tech="TypeScript · Python · C# · SQL · PWA"
                        dates="2024 — Present"
                        points={[
                            "Built and maintain a PWA integrated scouting app",
                            "Implemented competition scouting features deployed at 3 FRC competitions",
                            "Sole technical lead managing full development and deployment lifecycle for FRC Team Sprocket 3473",
                        ]}
                    />
                </div>

                {/* ════════════════════════════════════════════════════════
            EXPERIENCE & ACTIVITIES
        ════════════════════════════════════════════════════════ */}
                <SectionDivider label="EXPERIENCE.ACTIVITIES" />

                <div className="space-y-3 mb-12">
                    <EntryCard
                        title="FRC Team Sprocket 3473"
                        location="Diamond Bar, CA"
                        role="CAD Member · Scouting App Technical Lead · Outreach · Driveteam"
                        dates="2024 — 2026"
                        points={[
                            "Design and model robot components using SolidWorks and Fusion 360 as part of the CAD sub-team",
                            "Lead outreach initiatives to engage the local community and promote STEM involvement",
                        ]}
                    />
                    <EntryCard
                        title="Dronescape Club — Engineering Lead"
                        location="Diamond Bar, CA"
                        role="Diamond Bar High School"
                        dates="2025 — Present"
                        points={[
                            "Lead engineering direction for the school drone club, overseeing technical projects and mentoring 4–5 members",
                            "Guide members through hands-on UAV design, build, and flight processes",
                        ]}
                    />
                    <EntryCard
                        title="Team Infernope — Captain"
                        location="Shenzhen, CN"
                        role="Combat Robotics"
                        dates="2021 — 2024"
                        points={[
                            "Founded and captained a combat robotics team, managing design, build, and competition strategy",
                            "Won the 2024 school combat robotics tournament",
                        ]}
                    />
                    <EntryCard
                        title="FTA Volunteer — SoCal FTC Qualifiers"
                        location="Diamond Bar, CA"
                        role="FIRST Tech Challenge"
                        dates="January 2026"
                        points={[
                            "Served as FIRST Technical Advisor (FTA) at two consecutive SoCal FTC Qualifier events hosted at Diamond Bar High School",
                            "Responsible for field hardware, software, and ensuring matches ran smoothly for competing teams",
                        ]}
                    />
                </div>

                {/* ════════════════════════════════════════════════════════
            AWARDS
        ════════════════════════════════════════════════════════ */}
                <SectionDivider label="AWARDS.RECOGNITION" />

                <div className="space-y-3 mb-14">
                    <ProjectCard
                        title="JPL Invention Challenge"
                        tech="The Scavengers"
                        dates="2025"
                        points={[
                            "Competed in the JPL Invention Challenge, designing a fluid transport system without pumps; placed one spot from finals",
                        ]}
                    />
                    <ProjectCard
                        title="FRC Team Sprocket 3473"
                        dates="2024, 2025, 2026"
                        points={[
                            "FIRST Impact Award recipient at regionals in 2024 and 2025",
                            "Engineering Inspiration Award recipient at regionals and districts in 2024 and 2026",
                        ]}
                    />
                    <ProjectCard
                        title="Team Infernope"
                        dates="2024"
                        points={[
                            "Won 2024 school combat robotics tournament, Shenzhen, China",
                        ]}
                    />
                </div>

                {/* ── footer telemetry ──────────────────────────────────── */}
                <div className="border-t border-cyan-400/[0.1] pt-6 pb-10 flex flex-wrap gap-x-7 gap-y-1.5">
                    {[
                        { l: "DOCUMENT", v: "RESUME" },
                        { l: "STATUS", v: "CURRENT" },
                        { l: "FORMAT", v: "WEB + PDF" },
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
   PRIMITIVES
══════════════════════════════════════════════════════════════════ */

function SectionDivider({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-3 mb-5">
      <span className="relative inline-block w-2 h-2">
        <span className="absolute inset-0 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,220,255,0.35)]" />
      </span>
            <span className="flex-1 h-px bg-gradient-to-r from-cyan-400/25 to-transparent" />
            <span className="font-mono text-[11px] tracking-[0.14em] text-white/35 uppercase">{label}</span>
        </div>
    );
}

function EntryCard({
                       title,
                       location,
                       role,
                       dates,
                       points,
                   }: {
    title: string;
    location: string;
    role: string;
    dates: string;
    points: string[];
}) {
    return (
        <div className="rounded-lg border border-cyan-400/[0.1] bg-[rgba(10,18,32,0.65)] backdrop-blur-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2">
                <div>
                    <h3 className="font-mono text-sm font-bold text-white/85 tracking-tight">{title}</h3>
                    <div className="font-sans text-[12px] text-white/40 italic">{role}</div>
                </div>
                <div className="sm:text-right shrink-0">
                    <div className="font-mono text-[10px] tracking-[0.12em] text-cyan-400/60 uppercase">{dates}</div>
                    <div className="font-mono text-[10px] tracking-[0.1em] text-white/30">{location}</div>
                </div>
            </div>
            <div className="space-y-0.5">
                {points.map((p, i) => (
                    <div key={i} className="font-mono text-[11px] leading-[1.6] text-white/45">
                        <span className="text-cyan-400/30 mr-2">›</span>{p}
                    </div>
                ))}
            </div>
        </div>
    );
}

function ProjectCard({
                         title,
                         tech,
                         dates,
                         points,
                     }: {
    title: string;
    tech?: string;
    dates: string;
    points: string[];
}) {
    return (
        <div className="rounded-lg border border-cyan-400/[0.1] bg-[rgba(10,18,32,0.65)] backdrop-blur-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2">
                <div>
                    <h3 className="font-mono text-sm font-bold text-white/85 tracking-tight">{title}</h3>
                    {tech && (
                        <div className="font-mono text-[10px] tracking-[0.1em] text-violet-400/50 uppercase mt-0.5">{tech}</div>
                    )}
                </div>
                <div className="shrink-0">
                    <div className="font-mono text-[10px] tracking-[0.12em] text-cyan-400/60 uppercase">{dates}</div>
                </div>
            </div>
            <div className="space-y-0.5">
                {points.map((p, i) => (
                    <div key={i} className="font-mono text-[11px] leading-[1.6] text-white/45">
                        <span className="text-cyan-400/30 mr-2">›</span>{p}
                    </div>
                ))}
            </div>
        </div>
    );
}

function ContactLink({
                         href,
                         icon,
                         label,
                         external,
                     }: {
    href: string;
    icon: React.ReactNode;
    label: string;
    external?: boolean;
}) {
    return (
        <a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] text-cyan-400/60 hover:text-cyan-400 transition-colors duration-200"
        >
            {icon}
            {label}
        </a>
    );
}