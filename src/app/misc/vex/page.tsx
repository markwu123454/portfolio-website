"use client";
import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";

/* ── types ────────────────────────────────────────────────────── */
interface MediaItem {
    type: "image" | "video" | "code";
    src: string;
    alt: string;
    lang?: string;
}

interface Spec {
    label: string;
    value: string;
}

interface Project {
    id: string;
    num: string;
    title: string;
    tag: string;
    status: string;
    statusColor: string;
    ringColor: string;
    description: string;
    specs: Spec[];
    media: MediaItem[];
}

/* ── project data ─────────────────────────────────────────────── */
const projects: Project[] = [
    {
        id: "swerve",
        num: "01",
        title: "Coaxial Swerve Module",
        tag: "DRIVETRAIN.MODULE",
        status: "COMPLETE",
        statusColor: "bg-emerald-400",
        ringColor: "bg-emerald-400/25",
        description:
            "A classical coaxial swerve module designed for omnidirectional maneuverability. The module stacks the steering and drive motors concentrically, routing power through a central axis — minimizing footprint while maximizing rotational freedom. Precision-machined gearing ensures zero-backlash steering response.",
        specs: [
            { label: "TYPE", value: "COAXIAL / CLASSICAL" },
            { label: "DOF", value: "2 (DRIVE + STEER)" },
            { label: "MEDIA", value: "IMAGES" },
        ],
        media: [
            { type: "image", src: "/vex/Weixin Image_20260323085943_108_27.jpg", alt: "swerve side view" },
        ],
    },
    {
        id: "drivebase",
        num: "02",
        title: "4-Module Swerve Drivebase",
        tag: "CHASSIS.ASSEMBLY",
        status: "COMPLETE",
        statusColor: "bg-emerald-400",
        ringColor: "bg-emerald-400/25",
        description:
            "Full chassis integrating four coaxial swerve modules into a unified drivebase. Features a lightweight frame with precise module mounting geometry, centralized wiring channels, and a low center of gravity. Capable of holonomic movement — translation in any direction independent of robot heading.",
        specs: [
            { label: "MODULES", value: "4x COAXIAL SWERVE" },
            { label: "DRIVE MODE", value: "HOLONOMIC / OMNI" },
            { label: "MEDIA", value: "IMAGES · VIDEO · CODE" },
        ],
        media: [
            { type: "image", src: "/vex/460009ce3012e597a7fe9ec5c57b6284.jpg", alt: "Drivebase side view" },
            { type: "video", src: "https://assets.markwu.org/portfolio/Video%20Project%201.mp4", alt: "Drivebase in motion" },
            { type: "code", src: "/vex/swerve_code", alt: "Drivebase C++ source", lang: "C++ / VEX V5 PRO" },
        ],
    },
    {
        id: "elevator",
        num: "03",
        title: "Cascading Elevator + Pivot Arm",
        tag: "MECHANISM.LIFT",
        status: "COMPLETE",
        statusColor: "bg-emerald-400",
        ringColor: "bg-emerald-400/25",
        description:
            "A multi-stage cascading elevator paired with a pivoting arm end-effector. All motors are mounted at the base of the mechanism, reducing moving mass and lowering the system's center of gravity. The cascade stages deploy sequentially via a continuous rigging system, while the arm pivots at the top for precise object placement.",
        specs: [
            { label: "STAGES", value: "CASCADING MULTI-STAGE" },
            { label: "END EFFECTOR", value: "PIVOT ARM" },
            { label: "MOTOR MOUNT", value: "BASE-MOUNTED" },
            { label: "MEDIA", value: "IMAGES · VIDEO" },
        ],
        media: [
            { type: "image", src: "/vex/70639b7f3a4a114b1e279cdd0c9e5e29.jpg", alt: "Elevator extended" },
            { type: "image", src: "/vex/Weixin Image_20260323085639_102_27.jpg", alt: "Elevator retracted" },
            { type: "video", src: "https://assets.markwu.org/portfolio/b5865dcd2f1c9763a503876f53a89bf9.mp4", alt: "Elevator in action" },
        ],
    },
    {
        id: "sim",
        num: "04",
        title: "FRC Rebuilt simulator",
        tag: "SIMULATOR",
        status: "INCOMPLETE",
        statusColor: "bg-amber-400",
        ringColor: "bg-amber-400/25",
        description:
            "Simulating a frc Rebuilt match using a custom rendering engine made in vex v5 c++",
        specs: [
            { label: "AA", value: "ANALYTICAL ANTI-ALIASING" },
            { label: "CONTROL", value: "ROBOT ORIENTED DRIVING" },
            { label: "PHYSICS", value: "2D PHYSICS" },
            { label: "MEDIA", value: "IMAGES · CODE" },
        ],
        media: [
            { type: "image", src: "/projects/elevator-1.jpg", alt: "Simulator screenshot" },
            { type: "code", src: "/vex/sim_code", alt: "Simulator source", lang: "C++ / VEX V5" },
        ],
    },
];

/* ── intersection observer hook ───────────────────────────────── */
function useReveal(): [React.RefObject<HTMLDivElement | null>, boolean] {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    setVisible(true);
                    obs.unobserve(el);
                }
            },
            { threshold: 0.12 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return [ref, visible];
}

/* ── small components ─────────────────────────────────────────── */

function CornerBrackets({ children, className = "" }: { children: ReactNode; className?: string }) {
    return (
        <div className={`relative ${className}`}>
            <span className="absolute -top-px -left-px w-[18px] h-[18px] border-t-2 border-l-2 border-cyan-400 rounded-tl opacity-70" />
            <span className="absolute -bottom-px -right-px w-[18px] h-[18px] border-b-2 border-r-2 border-violet-500 rounded-br opacity-50" />
            {children}
        </div>
    );
}

function TerminalBar({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-cyan-400/[0.12] bg-black/25">
      <span className="flex gap-[5px]">
        <span className="w-[9px] h-[9px] rounded-full bg-[#ff5f57] opacity-75" />
        <span className="w-[9px] h-[9px] rounded-full bg-[#febc2e] opacity-75" />
        <span className="w-[9px] h-[9px] rounded-full bg-[#28c840] opacity-75" />
      </span>
            <span className="font-mono text-[11px] tracking-[0.12em] text-white/60 uppercase">
        {label}
      </span>
        </div>
    );
}

function StatusDot({ statusColor, ringColor, label }: { statusColor: string; ringColor: string; label: string }) {
    return (
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] text-white/60 uppercase">
      <span className="relative inline-block w-2 h-2">
        <span className={`absolute inset-0 rounded-full ${statusColor} animate-pulse`} />
        <span className={`absolute -inset-[3px] rounded-full ${ringColor} animate-pulse`} />
      </span>
            {label}
    </span>
    );
}

function SectionHeader({ num, title }: { num: string; title: string }) {
    const [ref, vis] = useReveal();
    return (
        <div
            ref={ref}
            className={`flex items-center gap-3.5 mb-7 transition-all duration-700 ease-out ${
                vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[18px]"
            }`}
        >
      <span className="font-mono text-[13px] font-bold text-cyan-400 tracking-[0.08em] min-w-[26px]">
        {num}
      </span>
            <span className="relative inline-block w-2 h-2">
        <span className="absolute inset-0 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,220,255,0.35)]" />
      </span>
            <span className="flex-1 h-px bg-gradient-to-r from-cyan-400/25 to-transparent" />
            <span className="font-mono text-[11px] tracking-[0.14em] text-white/40 uppercase">
        {title}
      </span>
        </div>
    );
}

function TelemetryLine({ items }: { items: Spec[] }) {
    return (
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 px-4 py-2.5 border-t border-cyan-400/[0.12] bg-black/20">
            {items.map((item, i) => (
                <span key={i} className="font-mono text-[10px] tracking-[0.1em] text-white/40">
          <span className="text-white/60">{item.label}:</span>{" "}
                    <span className="text-cyan-400">{item.value}</span>
        </span>
            ))}
        </div>
    );
}

/* ── media type badges ────────────────────────────────────────── */
function MediaTypeBadge({ type }: { type: MediaItem["type"] }) {
    if (type === "code") {
        return (
            <span className="inline-flex items-center gap-[5px] px-2 py-[2px] rounded border border-cyan-400/20 bg-cyan-400/5 font-mono text-[9px] tracking-[0.1em] text-cyan-400 uppercase">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
        CODE
      </span>
        );
    }
    if (type === "video") {
        return (
            <span className="inline-flex items-center gap-[5px] px-2 py-[2px] rounded border border-violet-500/25 bg-violet-500/5 font-mono text-[9px] tracking-[0.1em] text-violet-400 uppercase">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        VIDEO
      </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-[5px] px-2 py-[2px] rounded border border-white/10 bg-white/5 font-mono text-[9px] tracking-[0.1em] text-white/50 uppercase">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      IMAGE
    </span>
    );
}

/* ── minimal C++ syntax highlighting ──────────────────────────── */
function syntaxHighlight(line: string): ReactNode {
    if (line.trimStart().startsWith("//")) {
        return <span className="text-white/30 italic">{line}</span>;
    }

    const preprocessor = /^(\s*#\w+)/;
    if (preprocessor.test(line)) {
        return <span className="text-violet-400">{line}</span>;
    }

    const combined =
        /(".*?"|'.*?')|\b(int|void|float|double|bool|char|long|short|unsigned|signed|const|static|return|if|else|for|while|do|switch|case|break|continue|class|struct|enum|namespace|using|public|private|protected|virtual|override|auto|true|false|nullptr|include|define|pragma)\b|(\b\d+\.?\d*f?\b)/g;

    const parts: ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = combined.exec(line)) !== null) {
        if (match.index > lastIndex) {
            parts.push(<span key={`t${lastIndex}`}>{line.slice(lastIndex, match.index)}</span>);
        }
        if (match[1]) {
            parts.push(<span key={`s${match.index}`} className="text-emerald-400/80">{match[0]}</span>);
        } else if (match[2]) {
            parts.push(<span key={`k${match.index}`} className="text-cyan-400/90 font-medium">{match[0]}</span>);
        } else if (match[3]) {
            parts.push(<span key={`n${match.index}`} className="text-amber-400/80">{match[0]}</span>);
        }
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < line.length) {
        parts.push(<span key={`e${lastIndex}`}>{line.slice(lastIndex)}</span>);
    }

    return parts.length > 0 ? <>{parts}</> : line;
}

/* ── image media item ─────────────────────────────────────────── */
function ImageMedia({ item, index }: { item: MediaItem; index: number }) {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
        <div className="group relative rounded-lg overflow-hidden border border-cyan-400/[0.12] bg-black/40 transition-all duration-300 hover:border-cyan-400/40 hover:shadow-[0_0_20px_rgba(0,220,255,0.15)]">
            {/* scanlines overlay */}
            <div className="absolute inset-0 pointer-events-none z-[2] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,220,255,0.015)_2px,rgba(0,220,255,0.015)_4px)]" />

            {/* index badge */}
            <span className="absolute top-2 left-2.5 z-[3] font-mono text-[9px] tracking-[0.1em] text-white/50 bg-black/60 px-1.5 py-0.5 rounded-sm backdrop-blur-sm">
        {String(index + 1).padStart(2, "0")}
      </span>

            {/* type badge */}
            <span className="absolute top-2 right-2.5 z-[3]">
        <MediaTypeBadge type="image" />
      </span>

            {!error ? (
                <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    onLoad={() => setLoaded(true)}
                    onError={() => setError(true)}
                    className={`w-full aspect-[4/3] object-cover transition-all duration-500 ${
                        loaded ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]"
                    }`}
                />
            ) : null}

            {/* loading / error fallback */}
            {(!loaded || error) && (
                <div className={`${error ? "" : "absolute inset-0"} aspect-[4/3] flex items-center justify-center bg-black/40`}>
                    <div className="text-center">
                        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" className="opacity-35 mx-auto">
                            <rect x="4" y="4" width="36" height="36" rx="4" stroke="#00dcff" strokeWidth="1.5" />
                            <circle cx="16" cy="17" r="4" stroke="#00dcff" strokeWidth="1.2" />
                            <polyline points="4,34 16,22 26,30 32,24 40,32" stroke="#00dcff" strokeWidth="1.2" fill="none" />
                        </svg>
                        <div className="mt-2 font-mono text-[9px] tracking-[0.16em] text-white/40 uppercase">
                            {error ? "FAILED TO LOAD" : "LOADING..."} — {item.alt}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── video media item ─────────────────────────────────────────── */
function VideoMedia({ item, index }: { item: MediaItem; index: number }) {
    const [playing, setPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (playing) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setPlaying(!playing);
    };

    return (
        <div className="group relative rounded-lg overflow-hidden border border-violet-500/[0.15] bg-black/40 transition-all duration-300 hover:border-violet-500/40 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] col-span-full">
            {/* scanlines overlay */}
            <div className="absolute inset-0 pointer-events-none z-[2] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(139,92,246,0.01)_2px,rgba(139,92,246,0.01)_4px)]" />

            {/* index badge */}
            <span className="absolute top-2 left-2.5 z-[3] font-mono text-[9px] tracking-[0.1em] text-white/50 bg-black/60 px-1.5 py-0.5 rounded-sm backdrop-blur-sm">
        {String(index + 1).padStart(2, "0")}
      </span>

            {/* type badge */}
            <span className="absolute top-2 right-2.5 z-[3]">
        <MediaTypeBadge type="video" />
      </span>

            <div className="relative aspect-video cursor-pointer" onClick={togglePlay}>
                <video
                    ref={videoRef}
                    src={item.src}
                    className="w-full h-full object-cover"
                    playsInline
                    loop
                    muted
                    preload="metadata"
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                />

                {/* play/pause overlay */}
                <div
                    className={`absolute inset-0 z-[1] flex items-center justify-center bg-black/30 transition-opacity duration-300 ${
                        playing ? "opacity-0 hover:opacity-100" : "opacity-100"
                    }`}
                >
                    <div className="w-16 h-16 rounded-full border-2 border-violet-400/60 bg-black/40 backdrop-blur-sm flex items-center justify-center transition-transform duration-200 hover:scale-110">
                        {playing ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <rect x="6" y="4" width="4" height="16" rx="1" fill="#a78bfa" />
                                <rect x="14" y="4" width="4" height="16" rx="1" fill="#a78bfa" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <polygon points="8,4 20,12 8,20" fill="#a78bfa" />
                            </svg>
                        )}
                    </div>
                </div>
            </div>

            {/* video label */}
            <div className="px-3 py-2 border-t border-violet-500/[0.1] bg-black/30">
                <span className="font-mono text-[9px] tracking-[0.14em] text-white/40 uppercase">
                    {item.alt}
                </span>
            </div>
        </div>
    );
}

/* ── code media item ──────────────────────────────────────────── */
function CodeMedia({ item, index }: { item: MediaItem; index: number }) {
    const [code, setCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [error, setError] = useState(false);

    const loadCode = useCallback(() => {
        if (code || loading || !item.src) return;
        setLoading(true);
        fetch(item.src)
            .then((r) => r.text())
            .then((t) => setCode(t))
            .catch(() => {
                setCode("// Failed to load source");
                setError(true);
            })
            .finally(() => setLoading(false));
    }, [item.src, code, loading]);

    useEffect(() => {
        loadCode();
    }, [loadCode]);

    const normalizedCode = code
        ?.replace(/\\n/g, "\n")   // convert escaped newlines
        .replace(/\r\n/g, "\n"); // normalize Windows endings

    const lines = normalizedCode ? normalizedCode.split("\n") : [];
    const displayLines = expanded ? lines : lines.slice(0, 18);

    return (
        <div className="group relative rounded-lg overflow-hidden border border-cyan-400/[0.12] bg-black/50 transition-all duration-300 hover:border-cyan-400/30 hover:shadow-[0_0_20px_rgba(0,220,255,0.1)] col-span-full">
            {/* index badge */}
            <span className="absolute top-[42px] left-2.5 z-[3] font-mono text-[9px] tracking-[0.1em] text-white/50 bg-black/60 px-1.5 py-0.5 rounded-sm backdrop-blur-sm">
        {String(index + 1).padStart(2, "0")}
      </span>

            {/* header bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-cyan-400/[0.08] bg-black/30">
                <div className="flex items-center gap-3">
                    <span className="flex gap-[5px]">
            <span className="w-[9px] h-[9px] rounded-full bg-[#ff5f57] opacity-75" />
            <span className="w-[9px] h-[9px] rounded-full bg-[#febc2e] opacity-75" />
            <span className="w-[9px] h-[9px] rounded-full bg-[#28c840] opacity-75" />
          </span>
                    <span className="font-mono text-[10px] tracking-[0.12em] text-white/50 uppercase">
            {item.alt} — <span className="text-cyan-400">{lines.length} LINES</span>
          </span>
                </div>
                <div className="flex items-center gap-3">
                    <MediaTypeBadge type="code" />
                    <span className="font-mono text-[9px] tracking-[0.1em] text-white/30 uppercase">
            {item.lang || "C++"}
          </span>
                </div>
            </div>

            {/* code body */}
            {loading ? (
                <div className="p-5 font-mono text-[11px] text-white/40 animate-pulse">
                    LOADING SOURCE...
                </div>
            ) : (
                <div className="overflow-auto p-4" style={{ maxHeight: expanded ? "600px" : "none" }}>
          <pre className="text-[12px] leading-[1.65] font-mono text-white/75 whitespace-pre overflow-x-auto">
            <code>
              {displayLines.map((line, i) => (
                  <div key={i} className="flex">
                  <span className="inline-block w-10 shrink-0 text-right pr-4 text-white/20 select-none text-[11px]">
                    {i + 1}
                  </span>
                      <span className="flex-1">{syntaxHighlight(line)}</span>
                  </div>
              ))}
            </code>
          </pre>
                </div>
            )}

            {/* expand / collapse */}
            {lines.length > 18 && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full px-4 py-2 border-t border-cyan-400/[0.08] bg-black/30 font-mono text-[10px] tracking-[0.14em] text-cyan-400/70 uppercase cursor-pointer hover:text-cyan-400 hover:bg-cyan-400/5 transition-colors duration-200"
                >
                    {expanded ? "▲ COLLAPSE" : `▼ EXPAND ALL ${lines.length} LINES`}
                </button>
            )}
        </div>
    );
}

/* ── project card ─────────────────────────────────────────────── */
function ProjectCard({ project, delay = 0 }: { project: Project; delay?: number }) {
    const [ref, vis] = useReveal();
    const [activeTab, setActiveTab] = useState("gallery");

    const galleryMedia = project.media.filter((m) => m.type === "image");
    const videoMedia = project.media.filter((m) => m.type === "video");
    const codeMedia = project.media.filter((m) => m.type === "code");

    const hasGallery = galleryMedia.length > 0;
    const hasVideo = videoMedia.length > 0;
    const hasCode = codeMedia.length > 0;

    /* Collect unique badge types from media */
    const mediaTypes = [...new Set(project.media.map((m) => m.type))];

    const tabs = [
        ...(hasGallery ? [{ key: "gallery", label: "GALLERY" }] : []),
        ...(hasVideo ? [{ key: "video", label: "VIDEO" }] : []),
        ...(hasCode ? [{ key: "code", label: "CODE" }] : []),
    ];

    return (
        <div
            ref={ref}
            className={`transition-all duration-[850ms] ease-out ${
                vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-9"
            }`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            <CornerBrackets>
                <div className="rounded-[10px] border border-cyan-400/[0.12] bg-[rgba(10,18,32,0.72)] backdrop-blur-xl overflow-hidden shadow-[0_2px_40px_rgba(0,0,0,0.4)]">
                    <TerminalBar label={project.tag} />

                    <div className="px-7 pt-6 pb-5">
                        {/* header */}
                        <div className="flex justify-between items-start mb-4 flex-wrap gap-2.5">
                            <h3 className="font-mono text-[22px] font-extrabold text-white/[0.93] tracking-tight leading-tight">
                                {project.title}
                            </h3>
                            <div className="flex gap-2 items-center flex-wrap">
                                {mediaTypes.map((type) => (
                                    <MediaTypeBadge key={type} type={type} />
                                ))}
                                <StatusDot
                                    statusColor={project.statusColor}
                                    ringColor={project.ringColor}
                                    label={project.status}
                                />
                            </div>
                        </div>

                        {/* description */}
                        <p className="mb-5 font-sans text-sm leading-[1.7] text-white/60 max-w-[700px]">
                            {project.description}
                        </p>

                        {/* tabs */}
                        <div className="flex gap-0.5 mb-[18px] border-b border-cyan-400/[0.12]">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`bg-transparent border-b-2 px-4 py-2 font-mono text-[10px] tracking-[0.14em] uppercase cursor-pointer transition-all duration-200 ${
                                        activeTab === tab.key
                                            ? "border-cyan-400 text-cyan-400"
                                            : "border-transparent text-white/40 hover:text-white/60"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* tab content */}
                        {activeTab === "gallery" && (
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
                                {galleryMedia.map((item, i) => (
                                    <ImageMedia key={i} item={item} index={i} />
                                ))}
                            </div>
                        )}

                        {activeTab === "video" && (
                            <div className="grid grid-cols-1 gap-3 max-w-[560px]">
                                {videoMedia.map((item, i) => (
                                    <VideoMedia key={i} item={item} index={i} />
                                ))}
                            </div>
                        )}

                        {activeTab === "code" && (
                            <div className="flex flex-col gap-4">
                                {codeMedia.map((item, i) => (
                                    <CodeMedia key={i} item={item} index={i} />
                                ))}
                            </div>
                        )}
                    </div>

                    <TelemetryLine items={project.specs} />
                </div>
            </CornerBrackets>
        </div>
    );
}

/* ── page ─────────────────────────────────────────────────────── */
export default function Page() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

        @keyframes hero-glow {
          0%, 100% { text-shadow: 0 0 30px rgba(0,220,255,0.15); }
          50% { text-shadow: 0 0 50px rgba(0,220,255,0.3); }
        }
        @keyframes grid-fade {
          0% { opacity: 0.02; }
          50% { opacity: 0.05; }
          100% { opacity: 0.02; }
        }
      `}</style>

            <div className="min-h-screen bg-[#06080d] text-white/[0.93] relative overflow-hidden">
                {/* background grid */}
                <div
                    className="fixed inset-0 z-0 pointer-events-none animate-[grid-fade_8s_ease-in-out_infinite]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(0,220,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,220,255,0.03) 1px, transparent 1px)",
                        backgroundSize: "60px 60px",
                    }}
                />

                {/* gradient orbs */}
                <div className="fixed -top-[200px] -right-[200px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(0,220,255,0.05),transparent_70%)] pointer-events-none z-0" />
                <div className="fixed -bottom-[200px] -left-[100px] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.04),transparent_70%)] pointer-events-none z-0" />

                {/* content */}
                <div className="relative z-[1] mx-auto px-6">
                    {/* hero */}
                    <div
                        className={`pt-[120px] pb-[70px] transition-all duration-[900ms] ease-out ${
                            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                        }`}
                    >
                        <div className="font-mono text-[11px] tracking-[0.2em] text-white/40 uppercase mb-4">
                            <span className="text-cyan-400">■</span> VEX ROBOTICS — PROJECT ARCHIVE
                        </div>

                        <h1 className="font-mono text-[clamp(36px,5.5vw,56px)] font-extrabold leading-[1.1] tracking-tight animate-[hero-glow_4s_ease-in-out_infinite]">
                            VEX
                            <br />
                            <span className="bg-gradient-to-br from-cyan-400 to-violet-500 bg-clip-text text-transparent">
                PROJECTS
              </span>
                        </h1>

                        <p className="mt-5 font-sans text-[15px] leading-[1.7] text-white/60 max-w-[520px]">
                            Mechanisms, drivetrains, and control systems — engineered for
                            competition. Each project documented with media, specs, and source
                            code where available.
                        </p>

                        {/* stats */}
                        <div
                            className={`flex gap-8 mt-8 flex-wrap transition-all duration-[900ms] ease-out delay-200 ${
                                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                            }`}
                        >
                            {[
                                { val: "04", label: "PROJECTS" },
                                { val: "08", label: "MODULES" },
                                { val: "02", label: "CODEBASES" },
                            ].map((s, i) => (
                                <div key={i}>
                                    <div className="font-mono text-[28px] font-extrabold text-cyan-400 leading-none">
                                        {s.val}
                                    </div>
                                    <div className="font-mono text-[10px] tracking-[0.16em] text-white/40 mt-1">
                                        {s.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* projects */}
                    <div className="flex flex-col gap-[52px] pb-[120px]">
                        {projects.map((project, i) => (
                            <div key={project.id}>
                                <SectionHeader num={project.num} title={project.tag} />
                                <ProjectCard project={project} delay={i * 80} />
                            </div>
                        ))}
                    </div>

                    {/* footer telemetry */}
                    <div className="border-t border-cyan-400/[0.12] pt-6 pb-12 flex flex-wrap gap-x-7 gap-y-1.5">
                        {[
                            { l: "SYS.STATUS", v: "OPERATIONAL" },
                            { l: "PROJECTS.LOADED", v: "4/4" },
                            { l: "BUILD.TARGET", v: "VEX V5" },
                        ].map((t, i) => (
                            <span key={i} className="font-mono text-[10px] tracking-[0.1em] text-white/40">
                <span className="text-white/60">{t.l}:</span>{" "}
                                <span className="text-cyan-400">{t.v}</span>
              </span>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}