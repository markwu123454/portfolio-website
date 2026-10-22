"use client";

/**
 * Banner History — /experiments/banner-history
 *
 * A rerun-cadence tracker for Zenless Zone Zero. Data is extracted from 163's
 * bundle at build time (see scripts/banner-extractor) and enriched with agent
 * metadata + round icons (Enka.Network) and game-canonical accent colours.
 *
 * One lane per agent, ordered by debut. Each banner run is a horizontal bar
 * spanning its real live dates; the debut bar carries its patch number, each
 * rerun bar carries the day-gap since the previous run. Patch numbers stay
 * pinned to the top, the agent identity panel stays pinned to the right.
 *
 * All local, all static — no runtime server.
 */

import React, { useMemo, useState, useEffect } from "react";
import bannersRaw from "./data/banner.json";
import agentColors from "./data/agent-colors.json";
import metadata from "./data/metadata.json";

/* ───────────────────────────── types ───────────────────────────── */

type ResolvedAgent = {
    id: string | null;
    name: string;
    element: string | null;
    specialty: string | null;
    rarity: string | null;
    faction: string | null;
    raw: string;
};
type Banner = {
    version: string;
    phase: string;
    startDate: string;
    endDate: string;
    sRanks: ResolvedAgent[];
    aRanks: ResolvedAgent[];
    aWengines: string[];
};
type Appearance = { version: string; phase: string; start: string; end: string };
type Series = {
    id: string;
    agent: ResolvedAgent;
    apps: Appearance[];
    debutT: number;
    lastStartT: number;
    lastEndT: number;
    lastVersionIdx: number;
    count: number;
    versions: string[];
    rerunLastT: number; // last rerun start (−Inf if never reran)
    gaps: { days: number; versions: number }[];
};

const BANNERS = bannersRaw as unknown as Banner[];
const COLORS = agentColors as Record<
    string,
    { name: string; accent: string | null; accentExtra: string | null; mindscape: string | null }
>;

/* ─────────────────────────── date + version domain ─────────────────────────── */

const DAY = 86_400_000;
const parse = (s: string) => new Date(s + "T00:00:00Z").getTime();
const daysBetween = (a: number, b: number) => Math.round((b - a) / DAY);

const VERSIONS: string[] = (metadata as { versions: string[] }).versions;
const VERSION_IDX = new Map(VERSIONS.map((v, i) => [v, i]));
const LATEST_VERSION_IDX = VERSIONS.length - 1;
const versionFirstStart = new Map<string, number>();
for (const b of BANNERS) {
    const t = parse(b.startDate);
    const cur = versionFirstStart.get(b.version);
    if (cur === undefined || t < cur) versionFirstStart.set(b.version, t);
}

const T0 = Math.min(...BANNERS.map((b) => parse(b.startDate)));
const MAX_END = Math.max(...BANNERS.map((b) => parse(b.endDate)));
const T1 = Math.max(MAX_END, Date.now()) + 20 * DAY;

/* ─────────────────────────── build per-agent series ─────────────────────────── */

function buildSeries(rankKey: "sRanks" | "aRanks"): Series[] {
    const map = new Map<string, { agent: ResolvedAgent; apps: Appearance[] }>();
    for (const b of BANNERS) {
        for (const a of b[rankKey]) {
            if (!a.id) continue;
            if (!map.has(a.id)) map.set(a.id, { agent: a, apps: [] });
            map.get(a.id)!.apps.push({ version: b.version, phase: b.phase, start: b.startDate, end: b.endDate });
        }
    }
    const out: Series[] = [];
    for (const [id, { agent, apps }] of map) {
        apps.sort((x, y) => x.start.localeCompare(y.start));
        const gaps: { days: number; versions: number }[] = [];
        for (let i = 1; i < apps.length; i++) {
            gaps.push({
                days: daysBetween(parse(apps[i - 1].start), parse(apps[i].start)),
                versions: (VERSION_IDX.get(apps[i].version) ?? 0) - (VERSION_IDX.get(apps[i - 1].version) ?? 0),
            });
        }
        const last = apps[apps.length - 1];
        out.push({
            id,
            agent,
            apps,
            debutT: parse(apps[0].start),
            lastStartT: parse(last.start),
            lastEndT: parse(last.end),
            lastVersionIdx: VERSION_IDX.get(last.version) ?? 0,
            count: apps.length,
            versions: apps.map((a) => a.version),
            rerunLastT: apps.length > 1 ? parse(last.start) : -Infinity,
            gaps,
        });
    }
    return out;
}

const SERIES = { S: buildSeries("sRanks"), A: buildSeries("aRanks") };

/* ─────────────────────────── runtime since-label ─────────────────────────── */

type Since = { state: "live" | "upcoming" | "past"; label: string };
function since(s: Series, now: number): Since {
    const live = s.apps.some((a) => parse(a.start) <= now && now <= parse(a.end));
    const upcoming = !live && s.lastStartT > now;
    const days = now > s.lastEndT ? daysBetween(s.lastEndT, now) : 0;
    const versions = Math.max(0, LATEST_VERSION_IDX - s.lastVersionIdx);
    return {
        state: live ? "live" : upcoming ? "upcoming" : "past",
        label: live ? "live" : upcoming ? "soon" : `${versions}v · ${days}d`,
    };
}

/* ─────────────────────────── icon helpers ─────────────────────────── */

const slug = (s: string) => s.toLowerCase().replace(/ /g, "_");
const agentIcon = (id: string) => `/banner-history/icons/agents/${id}.avif`;
const elIcon = (e: string) => `/banner-history/icons/elements/${slug(e)}.avif`;
const spIcon = (sp: string) => `/banner-history/icons/specialties/${slug(sp)}.avif`;

function Ic({ src, alt, size = 16, className = "", style }: { src: string; alt: string; size?: number; className?: string; style?: React.CSSProperties }) {
    // plain <img> — tiny static AVIFs in /public
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} width={size} height={size} loading="lazy" className={className} style={style} />;
}

/* ─────────────────────────── geometry ─────────────────────────── */

const TRACK_W = 1560;
const IDENT_W = 300;
const SINCE_W = 62;
const ROW_H = 32;
const x = (t: number) => ((t - T0) / (T1 - T0)) * TRACK_W;

/* ─────────────────────────── page ─────────────────────────── */

type SortKey = "most" | "earliest" | "recent";
const SORTS: { key: SortKey; label: string }[] = [
    { key: "most", label: "Most reruns" },
    { key: "earliest", label: "Earliest first run" },
    { key: "recent", label: "Most recent rerun" },
];

export default function BannerHistoryPage() {
    const [mounted, setMounted] = useState(false);
    const [now, setNow] = useState(MAX_END);
    useEffect(() => {
        setMounted(true);
        setNow(Date.now());
    }, []);

    const [rank, setRank] = useState<"S" | "A">("S");
    const [sort, setSort] = useState<SortKey>("earliest");
    const [query, setQuery] = useState("");
    const [els, setEls] = useState<Set<string>>(new Set());
    const [sps, setSps] = useState<Set<string>>(new Set());
    const [vers, setVers] = useState<Set<string>>(new Set());
    const [sortOpen, setSortOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);

    const base = SERIES[rank];

    const opts = useMemo(() => {
        const e = new Set<string>(), s = new Set<string>(), v = new Set<string>();
        for (const it of base) {
            if (it.agent.element) e.add(it.agent.element);
            if (it.agent.specialty) s.add(it.agent.specialty);
            for (const ver of it.versions) v.add(ver);
        }
        return {
            elements: [...e].sort(),
            specialties: [...s].sort(),
            versions: [...v].sort((a, b) => VERSIONS.indexOf(a) - VERSIONS.indexOf(b)),
        };
    }, [base]);

    const rows = useMemo(() => {
        const q = query.trim().toLowerCase();
        const filtered = base.filter((s) => {
            const a = s.agent;
            if (q && !(a.name.toLowerCase().includes(q) || a.raw.toLowerCase().includes(q))) return false;
            if (els.size && !(a.element && els.has(a.element))) return false;
            if (sps.size && !(a.specialty && sps.has(a.specialty))) return false;
            if (vers.size && !s.versions.some((v) => vers.has(v))) return false;
            return true;
        });
        const cmp: Record<SortKey, (a: Series, b: Series) => number> = {
            most: (a, b) => b.count - a.count || a.debutT - b.debutT,
            earliest: (a, b) => a.debutT - b.debutT,
            recent: (a, b) => b.rerunLastT - a.rerunLastT || a.debutT - b.debutT,
        };
        return [...filtered].sort(cmp[sort]);
    }, [base, query, els, sps, vers, sort]);

    const toggle = (set: React.Dispatch<React.SetStateAction<Set<string>>>, v: string) =>
        set((prev) => {
            const n = new Set(prev);
            n.has(v) ? n.delete(v) : n.add(v);
            return n;
        });

    const activeFilters = els.size + sps.size + vers.size + (query ? 1 : 0);
    const reset = () => { setQuery(""); setEls(new Set()); setSps(new Set()); setVers(new Set()); };
    const closeMenus = () => { setSortOpen(false); setFilterOpen(false); };

    const nowX = x(now);
    const nowVisible = now >= T0 && now <= T1;

    return (
        <div className="mx-auto px-4 md:px-8 py-10">
            {/* header */}
            <header className="mb-7">
                <div className="font-mono text-[11px] tracking-kicker uppercase text-accent mb-2 flex items-center gap-2 flex-wrap">
                    <span>EXPERIMENT</span><span className="text-fg-soft">·</span><span>BANNER HISTORY</span>
                    <span className="text-fg-soft">·</span>
                    <span className="text-fg-muted normal-case tracking-normal">
                        {metadata.bannerCount} banners · {metadata.versionCount} versions
                    </span>
                </div>
                <h1 className="text-[clamp(28px,4vw,44px)] font-semibold tracking-[-0.025em] leading-[1.05] m-0">
                    ZZZ Banner History
                </h1>
            </header>

            {/* controls */}
            <div className="relative flex flex-wrap items-center gap-2 mb-3">
                <div className="inline-flex rounded-md border border-rule overflow-hidden">
                    {(["S", "A"] as const).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRank(r)}
                            className={`px-3 py-2 font-mono text-[11px] tracking-kicker uppercase font-semibold transition-colors ${rank === r ? "bg-fg text-bg" : "bg-transparent text-fg-muted hover:text-fg"}`}
                        >
                            {r}-rank
                        </button>
                    ))}
                </div>

                {/* sort */}
                <button
                    onClick={() => { setSortOpen((o) => !o); setFilterOpen(false); }}
                    className="px-3 py-2 border border-rule rounded-md font-mono text-[11px] tracking-kicker uppercase text-fg-muted hover:text-fg transition-colors inline-flex items-center gap-2"
                >
                    Sort: {SORTS.find((s) => s.key === sort)!.label} <span className="text-fg-soft">▾</span>
                </button>

                {/* filter */}
                <button
                    onClick={() => { setFilterOpen((o) => !o); setSortOpen(false); }}
                    className={`px-3 py-2 border border-rule rounded-md font-mono text-[11px] tracking-kicker uppercase transition-colors inline-flex items-center gap-2 ${activeFilters ? "text-accent" : "text-fg-soft hover:text-fg"}`}
                >
                    Filter{activeFilters ? ` (${activeFilters})` : "…"} <span className="text-fg-soft">▾</span>
                </button>

                <span className="font-mono text-[10px] text-fg-soft ml-1">{rows.length} agents</span>

                {/* sort menu */}
                {sortOpen && (
                    <>
                        <div className="fixed inset-0 z-[45]" onClick={closeMenus} />
                        <div className="absolute top-11 left-28 z-[46] min-w-48 bg-bg-elev border border-rule-strong rounded-lg p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.55)]">
                            {SORTS.map((o) => (
                                <button
                                    key={o.key}
                                    onClick={() => { setSort(o.key); setSortOpen(false); }}
                                    className={`w-full flex items-center justify-between gap-3 px-2.5 py-2 rounded font-mono text-[10px] tracking-kicker uppercase transition-colors ${sort === o.key ? "bg-fg/5 text-fg" : "text-fg-muted hover:text-fg"}`}
                                >
                                    {o.label}<span className="text-accent">{sort === o.key ? "✓" : ""}</span>
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* filter popover */}
                {filterOpen && (
                    <>
                        <div className="fixed inset-0 z-[45]" onClick={closeMenus} />
                        <div className="absolute top-11 left-0 z-[46] w-[342px] max-h-[430px] overflow-auto bg-bg-elev border border-rule-strong rounded-lg p-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.55)]">
                            <div className="flex items-baseline justify-between mb-1.5">
                                <span className="font-mono text-[8px] tracking-kicker uppercase text-fg-soft">Name</span>
                                <button onClick={reset} className="font-mono text-[8px] tracking-kicker uppercase text-accent">Clear all</button>
                            </div>
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search agent…"
                                className="w-full box-border bg-bg border border-rule rounded-md px-2.5 py-2 text-fg font-mono text-[11px] placeholder:text-fg-soft outline-none mb-3.5"
                            />
                            <FacetGroup label="Element" options={opts.elements} active={els} onToggle={(v) => toggle(setEls, v)} icon={elIcon} />
                            <FacetGroup label="Specialty" options={opts.specialties} active={sps} onToggle={(v) => toggle(setSps, v)} icon={spIcon} />
                            <FacetGroup label="Version" options={opts.versions} active={vers} onToggle={(v) => toggle(setVers, v)} mono />
                        </div>
                    </>
                )}
            </div>

            {/* chart */}
            {!mounted ? (
                <div className="min-h-[50vh] grid place-items-center font-mono text-[11px] tracking-kicker uppercase text-fg-soft">
                    loading…
                </div>
            ) : (
                <div className="border border-rule rounded-lg bg-bg overflow-auto">
                    <div className="relative" style={{ width: TRACK_W + IDENT_W }}>
                        {/* gridlines + now, behind rows */}
                        <div className="absolute top-0 bottom-0 left-0 pointer-events-none z-0" style={{ width: TRACK_W }}>
                            {VERSIONS.map((v) => {
                                const t = versionFirstStart.get(v);
                                if (t === undefined) return null;
                                return <div key={v} className="absolute top-0 bottom-0 w-px" style={{ left: x(t), background: "rgba(255,255,255,.05)" }} />;
                            })}
                            {nowVisible && <div className="absolute top-0 bottom-0 border-l border-dashed border-fg-soft" style={{ left: nowX }} />}
                        </div>

                        {/* header row — patch numbers pinned top, identity pinned right */}
                        <div className="flex sticky top-0 z-30" style={{ height: 32 }}>
                            <div className="relative shrink-0 bg-bg-elev border-b border-rule" style={{ width: TRACK_W }}>
                                {VERSIONS.map((v) => {
                                    const t = versionFirstStart.get(v);
                                    if (t === undefined) return null;
                                    return (
                                        <span key={v} className="absolute top-0.5 -translate-x-1/2 font-mono text-[10px] text-fg-muted" style={{ left: x(t) }}>
                                            {v}
                                        </span>
                                    );
                                })}
                                {nowVisible && <span className="absolute -translate-x-1/2 font-mono text-[9px] text-fg-soft" style={{ left: nowX, top: 17 }}>now</span>}
                            </div>
                            <div className="sticky right-0 z-[31] shrink-0 flex bg-bg-elev border-b border-l border-rule" style={{ width: IDENT_W }}>
                                <div className="shrink-0 border-r border-rule flex items-center justify-center font-mono text-[8px] tracking-kicker uppercase text-fg-soft" style={{ width: SINCE_W }}>Since</div>
                                <div className="flex-1 flex items-center pl-2.5 font-mono text-[8px] tracking-kicker uppercase text-fg-soft">Agent</div>
                            </div>
                        </div>

                        {/* agent rows */}
                        {rows.map((s) => (
                            <AgentRow key={s.id} s={s} sinceInfo={since(s, now)} />
                        ))}
                        {rows.length === 0 && (
                            <div className="px-4 py-10 text-center font-mono text-[12px] text-fg-soft">No agents match these filters.</div>
                        )}
                    </div>
                </div>
            )}

            <p className="mt-4 font-mono text-[10px] text-fg-soft">
                Scroll ↕ / ↔ — patch numbers and agents stay pinned · data auto-extracted from zzz.163.moe · icons
                Enka.Network · updated {new Date(metadata.generatedAt).toISOString().slice(0, 10)} · unofficial fan project
            </p>
        </div>
    );
}

/* ─────────────────────────── agent row ─────────────────────────── */

function AgentRow({ s, sinceInfo }: { s: Series; sinceInfo: Since }) {
    const c = COLORS[s.id];
    const accent = c?.accent ?? "var(--fg-muted)";
    const baseFromX = x(s.debutT);

    return (
        <div className="flex relative z-[1]" style={{ height: ROW_H, borderBottom: "1px solid rgba(255,255,255,.05)" }}>
            {/* timeline track */}
            <div className="relative shrink-0" style={{ width: TRACK_W }}>
                {/* dashed trail: debut → right edge */}
                <div className="absolute top-1/2 -translate-y-1/2 border-t border-dashed border-fg-soft" style={{ left: baseFromX, right: 0 }} />
                {/* run bars */}
                {s.apps.map((ap, i) => {
                    const startX = x(parse(ap.start));
                    const endX = x(parse(ap.end));
                    const w = Math.max(4, endX - startX);
                    const isDebut = i === 0;
                    const gap = i > 0 ? s.gaps[i - 1] : null;
                    const label = isDebut ? `v${ap.version}` : gap ? `${gap.days}d` : "";
                    return (
                        <div
                            key={i}
                            className="absolute -translate-y-1/2 rounded-[3px] z-2"
                            style={{
                                left: startX,
                                width: w,
                                top: "50%",
                                height: 18,
                                background: "var(--bg-elev)",
                                border: "1px solid var(--rule)",
                                boxShadow: `inset 3px 0 0 0 ${accent}`,
                            }}
                            title={`${ap.version} phase ${ap.phase} · ${ap.start} → ${ap.end}${gap ? ` · +${gap.versions}v / ${gap.days}d since last` : " · debut"}`}
                        >
                            <span className="absolute left-1.75 top-1/2 -translate-y-1/2 font-mono text-[8px] leading-none whitespace-nowrap text-fg-muted pointer-events-none">
                                {label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* identity (sticky right) */}
            <div className="sticky right-0 z-5 shrink-0 flex bg-bg border-l border-rule" style={{ width: IDENT_W }}>
                <div className="shrink-0 border-r border-rule flex items-center justify-center font-mono text-[9px] text-fg-muted" style={{ width: SINCE_W }}>
                    {sinceInfo.label}
                </div>
                <div className="flex-1 min-w-0 flex items-center gap-1.5 pl-2.5 pr-2.5">
                    <Ic src={agentIcon(s.id)} alt={s.agent.name} size={24} className="rounded-full shrink-0" style={{ background: "var(--bg-elev)", boxShadow: `0 0 0 2px ${accent}` }} />
                    {s.agent.element && <Ic src={elIcon(s.agent.element)} alt={s.agent.element} size={14} className="shrink-0 opacity-85" />}
                    {s.agent.specialty && <Ic src={spIcon(s.agent.specialty)} alt={s.agent.specialty} size={14} className="shrink-0 opacity-85" />}
                    <span className="flex-1 min-w-0 text-[12.5px] whitespace-nowrap overflow-hidden text-ellipsis">{s.agent.name}</span>
                    <span className="font-mono text-[9px] text-fg-soft shrink-0">{s.count}×</span>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────── filter facet group ─────────────────────────── */

function FacetGroup({
                        label, options, active, onToggle, icon, mono,
                    }: {
    label: string;
    options: string[];
    active: Set<string>;
    onToggle: (v: string) => void;
    icon?: (v: string) => string;
    mono?: boolean;
}) {
    if (options.length === 0) return null;
    return (
        <>
            <div className="font-mono text-[8px] tracking-kicker uppercase text-fg-soft mb-1.5">{label}</div>
            <div className="flex flex-wrap gap-1.5 mb-3.5 last:mb-0">
                {options.map((o) => {
                    const on = active.has(o);
                    return (
                        <button
                            key={o}
                            onClick={() => onToggle(o)}
                            className={`inline-flex items-center gap-1.5 cursor-pointer border transition-colors ${
                                mono ? "font-mono text-[10px] tracking-kicker uppercase px-2 py-1.5 rounded" : "text-[10.5px] pl-1.5 pr-2.5 py-1.5 rounded-full"
                            } ${on ? "bg-accent-soft border-accent text-fg" : "bg-transparent border-rule text-fg-muted hover:border-rule-strong hover:text-fg"}`}
                        >
                            {icon && <Ic src={icon(o)} alt="" size={14} className="opacity-90" />}
                            {o}
                        </button>
                    );
                })}
            </div>
        </>
    );
}
