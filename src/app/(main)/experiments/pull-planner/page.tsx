"use client";

/**
 * Pull Planner — /experiments/pull-planner
 *
 * A local-only companion for gacha savers. On creation you lock the facts that
 * don't change (game, target, current pity, starting stash). After that you
 * only ever *check in*: enter how many banner tickets and how much currency you
 * have right now. The difference between check-ins is your real saving rate.
 *
 * The page plots that over time — your actual stash, the game's expected F2P
 * income, and a best-fit line through your recent check-ins — then projects the
 * best-fit to the deadline and shows the full outcome distribution if you spend
 * everything there. Nothing leaves the device; state lives in localStorage.
 */

import React, {useEffect, useMemo, useState} from "react";
import {
    GAMES, gameById, successCurve, outcomeDistribution,
    availablePulls, linreg, dayKey, dayDiff, daysUntil,
    type CheckIn, type Outcome,
} from "./pullMath";

// ----------------------------- Tracker (UI state) -----------------------------

type Tracker = {
    id: string;
    name: string;
    created: boolean;      // false = still in setup
    createdAt: string;     // YYYY-MM-DD (t = 0)
    // locked once created:
    gameId: string;
    target: string;
    copiesNeeded: number;
    startPity: number;
    startGuaranteed: boolean;
    // editable planning horizon:
    deadline: string;
    // saving log — checkIns[0] is the starting stash captured at creation:
    checkIns: CheckIn[];
    // scratch, used only during setup:
    initTicket: number;
    initCurrency: number;
};

const STORE_KEY = "pull-patience:v2";
const CHART_CAP = 2000;
const RECENT = 20; // check-ins used for the best-fit trend

// ----------------------------- factory / storage -----------------------------

let idSeq = 0;
const freshId = () => `t${Date.now().toString(36)}${idSeq++}`;

function defaultDeadline(): string {
    const d = new Date();
    d.setDate(d.getDate() + 28);
    return dayKey(d);
}

function newDraft(): Tracker {
    return {
        id: freshId(),
        name: "",
        created: false,
        createdAt: "",
        gameId: "zzz-agent",
        target: "",
        copiesNeeded: 1,
        startPity: 0,
        startGuaranteed: false,
        deadline: defaultDeadline(),
        checkIns: [],
        initTicket: 0,
        initCurrency: 0,
    };
}

function load(): Tracker[] {
    try {
        const raw = localStorage.getItem(STORE_KEY);
        const arr = raw ? JSON.parse(raw) : null;
        return Array.isArray(arr) ? (arr as Tracker[]) : [];
    } catch {
        return [];
    }
}
function save(list: Tracker[]) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch { /* storage off */ }
}

// ----------------------------- root -----------------------------

export default function PullPatiencePage() {
    const [trackers, setTrackers] = useState<Tracker[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const list = load();
        const seeded = list.length ? list : [newDraft()];
        setTrackers(seeded);
        setActiveId(seeded[0].id);
        setMounted(true);
    }, []);

    useEffect(() => { if (mounted) save(trackers); }, [trackers, mounted]);

    const active = trackers.find((t) => t.id === activeId) ?? null;
    const patch = (id: string, p: Partial<Tracker>) =>
        setTrackers((ts) => ts.map((t) => (t.id === id ? {...t, ...p} : t)));

    const addTracker = () => {
        const t = newDraft();
        setTrackers((ts) => [...ts, t]);
        setActiveId(t.id);
    };
    const removeTracker = (id: string) =>
        setTrackers((ts) => {
            const rest = ts.filter((t) => t.id !== id);
            if (id === activeId) setActiveId(rest[0]?.id ?? null);
            return rest.length ? rest : [newDraft()];
        });

    if (!mounted) {
        return <div className="min-h-[60vh] grid place-items-center font-mono text-[11px] tracking-kicker uppercase text-fg-soft">loading…</div>;
    }

    return (
        <div className="flex flex-col lg:flex-row lg:min-h-[calc(100vh-53px)]">
            <aside className="lg:w-62.5 lg:flex-none shrink-0 border-b lg:border-b-0 lg:border-r border-rule bg-bg-elev p-5 flex flex-col gap-4 box-border">
                <div>
                    <div className="font-mono text-[11px] tracking-kicker uppercase text-accent flex items-center gap-2">
                        <span>EXPERIMENT</span><span className="text-fg-soft">·</span><span>PULL PLANNER</span>
                    </div>
                    <h1 className="mt-2.5 mb-1 text-[23px] font-semibold tracking-[-0.025em]">Pull Planner</h1>
                    <p className="m-0 text-[12.5px] text-fg-muted leading-snug">Track your stash, project your rate, see your odds.</p>
                </div>

                <div className="flex flex-col gap-1">
                    {trackers.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setActiveId(t.id)}
                            className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-md text-left transition-colors border ${
                                t.id === activeId ? "border-rule-strong bg-bg" : "border-transparent hover:bg-bg"
                            }`}
                        >
                            <span className="min-w-0">
                                <span className="block text-[13px] font-medium truncate">{t.name || (t.created ? "Untitled" : "New tracker…")}</span>
                                <span className="block font-mono text-[10px] tracking-mono text-fg-soft truncate">
                                    {t.created ? gameById(t.gameId).kind : "setup"} · {t.created ? (t.target || "no target") : "not started"}
                                </span>
                            </span>
                            <span
                                role="button" tabIndex={0}
                                onClick={(e) => { e.stopPropagation(); removeTracker(t.id); }}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); removeTracker(t.id); } }}
                                className="opacity-0 group-hover:opacity-100 text-fg-soft hover:text-bad font-mono text-[13px] leading-none px-1 transition-opacity"
                                aria-label="Remove tracker"
                            >×</span>
                        </button>
                    ))}
                </div>

                <button
                    onClick={addTracker}
                    className="px-3 py-2 rounded border border-dashed border-rule hover:border-rule-strong font-mono text-[11px] tracking-kicker uppercase text-fg-muted hover:text-fg transition-colors"
                >+ New tracker</button>

                <div className="flex-1" />
                <div className="border-t border-rule pt-3 font-mono text-[10px] leading-relaxed text-fg-soft">
                    Local only. No login, no upload. Clearing site data resets everything.
                </div>
            </aside>

            <main className="flex-1 min-w-0 p-5 sm:p-8">
                {active
                    ? active.created
                        ? <TrackerView key={active.id} t={active} patch={(p) => patch(active.id, p)} />
                        : <SetupForm key={active.id} t={active} patch={(p) => patch(active.id, p)}
                                     existing={trackers.filter((x) => x.id !== active.id).map((x) => x.name)} />
                    : <div className="min-h-[40vh] grid place-items-center text-fg-soft">No tracker selected.</div>}
            </main>
        </div>
    );
}

// ----------------------------- setup (locked-once-created) -----------------------------

function SetupForm({t, patch, existing}: {t: Tracker; patch: (p: Partial<Tracker>) => void; existing: string[]}) {
    const game = gameById(t.gameId);

    const create = () => {
        const today = dayKey();
        patch({
            created: true,
            createdAt: today,
            name: t.name.trim() || firstFreeName(existing),
            target: t.target.trim() || "-",
            checkIns: [{date: today, ticket: t.initTicket, currency: t.initCurrency}],
        });
    };

    const startingPulls = availablePulls({date: "", ticket: t.initTicket, currency: t.initCurrency}, game);

    return (
        <div className="max-w-160 flex flex-col gap-9">
            <div>
                <div className="font-mono text-[10px] tracking-kicker uppercase text-accent mb-2">New tracker · set-up</div>
                <h2 className="text-[24px] font-semibold tracking-[-0.02em]">Lock in the facts</h2>
                <p className="text-[13.5px] text-fg-muted mt-1.5 leading-snug">
                    Where you are today and what you&apos;re after. From here on you only check in with your stash.
                </p>
            </div>

            <SetupGroup n="1" title="The basics">
                <SetupField label="Tracker name" hint="Optional. Defaults to Tracker 1, 2, 3…">
                    <input value={t.name} onChange={(e) => patch({name: e.target.value})} placeholder="e.g. Miyabi rerun" className={setupInput} />
                </SetupField>
                <SetupField label="Game & banner" hint="Only Zenless Zone Zero for now.">
                    <select value={t.gameId} onChange={(e) => patch({gameId: e.target.value})} className={setupInput}>
                        {GAMES.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
                    </select>
                </SetupField>
                <SetupField label="Target" hint={`The ${game.kind.toLowerCase()} you're saving for. Optional.`}>
                    <input value={t.target} onChange={(e) => patch({target: e.target.value})} placeholder="e.g. Miyabi" className={setupInput} />
                </SetupField>
                <SetupField label="Copies wanted" hint="1 for the agent, more for dupes.">
                    <input type="number" min={1} max={7} value={t.copiesNeeded}
                           onChange={(e) => patch({copiesNeeded: clampi(numOr0(e.target.value), 1, 7)})} className={setupInput} />
                </SetupField>
            </SetupGroup>

            <SetupGroup n="2" title="Where your pity sits">
                <SetupField label="Current pity" hint={`Your in-game counter, 0 to ${game.system.hardPity}.`}>
                    <input type="number" min={0} max={game.system.hardPity} value={t.startPity}
                           onChange={(e) => patch({startPity: clampi(numOr0(e.target.value), 0, game.system.hardPity)})} className={setupInput} />
                </SetupField>
                <SetupField label="Next 5★ status" hint="Guaranteed if you lost your last 50/50.">
                    <button
                        onClick={() => patch({startGuaranteed: !t.startGuaranteed})}
                        className={`mt-1 w-full px-3.5 py-2.5 rounded-md border text-left font-mono text-[13px] transition-colors ${
                            t.startGuaranteed ? "border-good/60 bg-good/10 text-good" : "border-rule-strong bg-bg-elev text-fg-muted hover:border-accent"
                        }`}
                    >{t.startGuaranteed ? "Guaranteed" : "Not guaranteed"}</button>
                </SetupField>
            </SetupGroup>

            <SetupGroup n="3" title="Your stash right now">
                <SetupField label={t.gameId === "zzz-weapon" ? "Boopons" : "Encrypted Master Tapes"} hint="Banner pulls you already have.">
                    <input type="number" min={0} value={t.initTicket}
                           onChange={(e) => patch({initTicket: Math.max(0, numOr0(e.target.value))})} className={setupInput} />
                </SetupField>
                <SetupField label={game.currencyName} hint={`${game.currencyPerPull} ${game.currencyName} makes one pull.`}>
                    <input type="number" min={0} value={t.initCurrency}
                           onChange={(e) => patch({initCurrency: Math.max(0, numOr0(e.target.value))})} className={setupInput} />
                </SetupField>
                <div className="md:col-span-2 -mt-1 text-[13px] text-fg-muted">
                    That&apos;s <b className="text-fg font-mono">{fmtPulls(startingPulls)}</b> pulls to start.
                </div>
            </SetupGroup>

            <SetupGroup n="4" title="Deadline">
                <SetupField label="Target date" hint="Banner end, or a date you set yourself.">
                    <input type="date" value={t.deadline} onChange={(e) => patch({deadline: e.target.value})} className={setupInput} />
                </SetupField>
            </SetupGroup>

            <div className="flex items-center gap-3 pt-1">
                <button
                    onClick={create}
                    className="px-5 py-2.5 rounded border border-fg bg-fg text-bg hover:opacity-90 font-mono text-[11px] tracking-kicker uppercase transition-opacity"
                >Create tracker</button>
                <span className="text-[12px] text-fg-soft">A blank name or target fills in automatically.</span>
            </div>
        </div>
    );
}

/** A numbered setup section: a bold anchor title over a two-column field grid. */
function SetupGroup({n, title, children}: {n: string; title: string; children: React.ReactNode}) {
    return (
        <section>
            <div className="flex items-baseline gap-2.5 pb-2 mb-4 border-b border-rule">
                <span className="font-mono text-[12px] text-accent">{n}</span>
                <h3 className="text-[15px] font-semibold tracking-tight-1 text-fg">{title}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">{children}</div>
        </section>
    );
}

/** Scannable field: bright label, dim one-line hint, then the input. */
function SetupField({label, hint, children}: {label: string; hint?: string; children: React.ReactNode}) {
    return (
        <label className="flex flex-col">
            <span className="text-[14px] font-medium text-fg leading-tight">{label}</span>
            {hint && <span className="text-[12px] text-fg-muted leading-snug mt-0.5">{hint}</span>}
            {children}
        </label>
    );
}

// ----------------------------- created tracker -----------------------------

function TrackerView({t, patch}: {t: Tracker; patch: (p: Partial<Tracker>) => void}) {
    const game = gameById(t.gameId);
    const sys = game.system;
    const today = dayKey();
    const [editing, setEditing] = useState(false);

    // ---- saving series ----
    const pts = t.checkIns
        .map((ci) => ({x: dayDiff(t.createdAt, ci.date), y: availablePulls(ci, game), date: ci.date}))
        .sort((a, b) => a.x - b.x);
    const startPulls = pts.length ? pts[0].y : 0;
    const currentPulls = pts.length ? pts[pts.length - 1].y : 0;
    const nowX = Math.max(0, dayDiff(t.createdAt, today));
    const deadX = Math.max(1, dayDiff(t.createdAt, t.deadline));
    const daysLeft = Math.max(0, daysUntil(t.deadline, today));

    const reg = linreg(pts.slice(-RECENT).map((p) => ({x: p.x, y: p.y})));
    const bfAt = (x: number) => (reg ? reg.intercept + reg.slope * x : startPulls + game.expectedRate * x);
    const bfRate = reg ? reg.slope : game.expectedRate;
    const expAt = (x: number) => startPulls + game.expectedRate * x;

    const projectedPulls = Math.max(0, bfAt(deadX));
    const expectedPulls = Math.max(0, expAt(deadX));

    // ---- gacha maths ----
    // A-rank refunds stretch each raw pull into ~refund effective pulls against
    // pity, so probabilities run in effective-pull space. The engine is discrete
    // (floored); reference counts convert back to the raw stash you must save.
    const refund = game.refundFactor;
    const eff = (raw: number) => raw * refund;
    const projEff = eff(projectedPulls), expEff = eff(expectedPulls), nowEff = eff(currentPulls);
    const maxB = Math.min(CHART_CAP, Math.ceil(Math.max(projEff, expEff, sys.hardPity * t.copiesNeeded + sys.hardPity, 200)));
    const curve = useMemo(
        () => successCurve(sys, {pity: t.startPity, guaranteed: t.startGuaranteed, copiesNeeded: t.copiesNeeded}, maxB),
        [sys, t.startPity, t.startGuaranteed, t.copiesNeeded, maxB],
    );
    const pAt = (b: number) => curve.cdf[Math.max(0, Math.min(maxB, Math.floor(b)))];
    const pullsFor = (p: number) => { for (let k = 0; k <= maxB; k++) if (curve.cdf[k] >= p) return k; return null; };

    const pProjected = pAt(projEff);
    const pExpected = pAt(expEff);
    const pNow = pAt(nowEff);
    const outcome = useMemo(
        () => outcomeDistribution(sys, {pity: t.startPity, guaranteed: t.startGuaranteed, copiesNeeded: t.copiesNeeded}, Math.min(projEff, maxB)),
        [sys, t.startPity, t.startGuaranteed, t.copiesNeeded, projEff, maxB],
    );

    // reference counts, converted from effective pulls back to raw stash saved
    const p50e = pullsFor(0.5), p90e = pullsFor(0.9);
    const p50 = p50e == null ? null : p50e / refund;
    const p90 = p90e == null ? null : p90e / refund;

    // ---- check-in form ----
    const last = t.checkIns[t.checkIns.length - 1];
    const [ticket, setTicket] = useState<number>(last?.ticket ?? 0);
    const [currency, setCurrency] = useState<number>(last?.currency ?? 0);
    const checkedToday = t.checkIns.some((c) => c.date === today);

    const logCheckIn = () => {
        const entry: CheckIn = {date: today, ticket: Math.max(0, ticket), currency: Math.max(0, currency)};
        const rest = t.checkIns.filter((c) => c.date !== today);
        patch({checkIns: [...rest, entry].sort((a, b) => a.date.localeCompare(b.date))});
    };

    const tone = pProjected >= 0.75 ? "good" : pProjected >= 0.4 ? "warn" : "bad";
    const toneCls = {good: "text-good", warn: "text-warn", bad: "text-bad"}[tone];

    return (
        <div className="flex flex-col gap-8 max-w-260">
            {/* header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <div className="font-mono text-[10px] tracking-kicker uppercase text-accent mb-1.5 flex items-center gap-2 flex-wrap">
                        <span>{game.label}</span><span className="text-fg-soft">·</span>
                        <span>{t.copiesNeeded > 1 ? `${t.copiesNeeded}× ` : ""}{t.target}</span>
                    </div>
                    <h2 className="text-[26px] font-semibold tracking-[-0.02em]">{t.name}</h2>
                    <div className="mt-2 flex flex-wrap gap-2 font-mono text-[10px] tracking-mono">
                        <InfoChip>pity {t.startPity}{t.startGuaranteed ? " · guaranteed" : " · not guaranteed"}</InfoChip>
                        <InfoChip>{t.copiesNeeded > 1 ? `${t.copiesNeeded} copies` : "1 copy"}</InfoChip>
                        <InfoChip>by {t.deadline}</InfoChip>
                        <InfoChip>started {t.createdAt} · {fmtPulls(startPulls)} pulls</InfoChip>
                    </div>
                </div>
                <button
                    onClick={() => setEditing((e) => !e)}
                    className="px-3 py-2 rounded border border-rule-strong hover:bg-bg font-mono text-[11px] tracking-kicker uppercase text-fg-muted hover:text-fg transition-colors shrink-0"
                >{editing ? "Close" : "Edit settings"}</button>
            </div>

            {/* edit panel — everything but the game/banner */}
            {editing && (
                <section className="rounded-lg border border-rule-strong bg-bg-elev p-5">
                    <div className="flex items-baseline justify-between mb-4">
                        <span className="font-mono text-[11px] tracking-kicker uppercase text-fg">Edit settings</span>
                        <span className="font-mono text-[10px] text-fg-soft">{game.label} · locked</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Tracker name">
                            <input value={t.name} onChange={(e) => patch({name: e.target.value})} className={`${inputCls} w-full`} />
                        </Field>
                        <Field label="Target">
                            <input value={t.target} onChange={(e) => patch({target: e.target.value})} className={`${inputCls} w-full`} />
                        </Field>
                        <Field label="Deadline">
                            <input type="date" value={t.deadline} onChange={(e) => patch({deadline: e.target.value})} className={`${inputCls} w-full`} />
                        </Field>
                        <NumField label="Copies wanted" value={t.copiesNeeded} min={1} max={7} onChange={(v) => patch({copiesNeeded: clampi(v, 1, 7)})} />
                        <NumField label={`Current pity (0–${sys.hardPity})`} value={t.startPity} min={0} max={sys.hardPity}
                                  onChange={(v) => patch({startPity: clampi(v, 0, sys.hardPity)})} />
                        <Field label="Next 5★ status">
                            <button
                                onClick={() => patch({startGuaranteed: !t.startGuaranteed})}
                                className={`w-full px-3 py-2 rounded border font-mono text-[12px] text-left transition-colors ${
                                    t.startGuaranteed ? "border-good/50 bg-good/10 text-good" : "border-rule bg-bg text-fg-muted hover:border-rule-strong"
                                }`}
                            >{t.startGuaranteed ? "Guaranteed" : "Not guaranteed"}</button>
                        </Field>
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={() => setEditing(false)}
                            className="px-4 py-2 rounded border border-fg bg-fg text-bg hover:opacity-90 font-mono text-[11px] tracking-kicker uppercase transition-opacity"
                        >Done</button>
                    </div>
                </section>
            )}

            {/* check-in bar */}
            <section className="rounded-lg border border-rule bg-bg-elev p-5">
                <div className="flex flex-wrap items-end gap-5">
                    <div className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft w-full">
                        Check in: enter what you have on hand right now
                    </div>
                    <label className="flex flex-col gap-1.5">
                        <span className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">{t.gameId === "zzz-weapon" ? "Boopons" : "Encrypted Master Tapes"}</span>
                        <input type="number" min={0} value={ticket} onChange={(e) => setTicket(numOr0(e.target.value))} className={`${inputCls} w-35`} />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <span className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">{game.currencyName}</span>
                        <input type="number" min={0} value={currency} onChange={(e) => setCurrency(numOr0(e.target.value))} className={`${inputCls} w-40`} />
                    </label>
                    <div className="font-mono text-[11px] text-fg-soft pb-2.5">
                        = {fmtPulls(availablePulls({date: "", ticket, currency}, game))} pulls
                    </div>
                    <button
                        onClick={logCheckIn}
                        className="px-4 py-2.5 rounded border border-fg bg-fg text-bg hover:opacity-90 font-mono text-[11px] tracking-kicker uppercase transition-opacity ml-auto"
                    >{checkedToday ? "Update today" : "Log check-in"}</button>
                </div>
                <div className="mt-3 font-mono text-[10px] text-fg-soft">
                    {t.checkIns.length} check-in{t.checkIns.length === 1 ? "" : "s"} logged
                    {reg ? ` · trend from last ${Math.min(RECENT, t.checkIns.length)}` : " · log a second check-in for your own trend"}
                </div>
            </section>

            {/* graph + outcome */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-6">
                <section className="rounded-lg border border-rule bg-bg-elev p-5">
                    <div className="flex items-baseline justify-between mb-1">
                        <span className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">Stash over time</span>
                        <span className="font-mono text-[10px] text-fg-soft">pulls vs. days</span>
                    </div>
                    <TimeGraph
                        pts={pts} xMax={Math.max(deadX, nowX, 1)} startPulls={startPulls}
                        expAt={expAt} bfAt={bfAt} hasReg={!!reg}
                        deadX={deadX} nowX={nowX} p50={p50} p90={p90}
                        projectedPulls={projectedPulls} expectedPulls={expectedPulls}
                    />
                    <Legend />
                </section>

                <section className="rounded-lg border border-rule bg-bg-elev p-5 flex flex-col">
                    <div className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft mb-1">If your pace holds</div>
                    <div className={`font-mono text-[40px] font-semibold leading-none tabular-nums ${toneCls}`}>{pct(pProjected)}</div>
                    <div className="text-[12px] text-fg-muted mt-1 mb-4">chance of {t.target || "your target"} by the deadline</div>
                    <OutcomeBar outcome={outcome} />
                </section>
            </div>

            {/* stats */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-5 border-t border-rule pt-6">
                <Stat label="Projected (your pace)" value={pct(pProjected)} sub={`~${fmtPulls(projectedPulls)} pulls`} />
                <Stat label="At F2P-average income" value={pct(pExpected)} sub={`~${fmtPulls(expectedPulls)} pulls`} />
                <Stat label="Right now" value={pct(pNow)} sub={`${fmtPulls(currentPulls)} pulls banked`} />
                <Stat label="Saving rate" value={`${bfRate >= 0 ? "+" : ""}${round(bfRate, 2)}/day`} sub={reg ? "best-fit trend" : "F2P estimate"} />
                <Stat label="Days to deadline" value={String(daysLeft)} sub={t.deadline} />
                <Stat label="Coin-flip odds at" value={p50 == null ? "—" : `${Math.round(p50)} pulls`} sub="50% chance" />
                <Stat label="Safe-ish at" value={p90 == null ? "—" : `${Math.round(p90)} pulls`} sub="90% chance" />
                <Stat label="Avg. pulls to target" value={curve.meanReliable > 0.999 ? `${Math.round(curve.mean / refund)}` : "—"} sub="if you kept pulling" />
            </section>

            {/* how it works */}
            <section className="border-t border-rule pt-6 text-[13.5px] text-fg-muted leading-relaxed space-y-3 max-w-190">
                <h3 className="text-[17px] font-semibold text-fg tracking-tight-1">How this is computed</h3>
                <p>
                    Each check-in records your stash; {game.currencyPerPull} {game.currencyName} makes one pull, and tickets and
                    currency simply add together. The <b className="text-fg">best-fit line</b> is a least-squares trend through your
                    last {RECENT} check-ins, extended to the deadline to give your projected pull budget. The{" "}
                    <b className="text-fg">expected line</b> is a flat F2P-average income for comparison.
                </p>
                <p>
                    From your current pity ({t.startPity}{t.startGuaranteed ? ", guaranteed" : ", not guaranteed"}) the engine walks
                    the banner one pull at a time: {pctRaw(sys.baseRate)} base, climbing from pull {sys.softPity} to a guaranteed{" "}
                    {sys.hardPity}, with a {pctRaw(sys.featuredChance)} rate-up. A-rank refunds stretch every saved pull to about{" "}
                    {round(refund, 2)} effective pulls. Spending the whole projected budget gives the outcome bar; the headline is
                    the chance of at least {t.copiesNeeded > 1 ? `${t.copiesNeeded} copies` : "your target"}.
                </p>
            </section>
        </div>
    );
}

// ----------------------------- time graph -----------------------------

function TimeGraph({
    pts, xMax, startPulls, expAt, bfAt, hasReg, deadX, nowX, p50, p90, projectedPulls, expectedPulls,
}: {
    pts: Array<{x: number; y: number}>; xMax: number; startPulls: number;
    expAt: (x: number) => number; bfAt: (x: number) => number; hasReg: boolean;
    deadX: number; nowX: number; p50: number | null; p90: number | null;
    projectedPulls: number; expectedPulls: number;
}) {
    const W = 640, H = 260, padL = 38, padR = 44, padT = 14, padB = 26;
    const iw = W - padL - padR, ih = H - padT - padB;

    const yMax = Math.max(
        10, currentMax(pts), startPulls, expAt(xMax), bfAt(xMax), projectedPulls, expectedPulls, p90 ?? 0,
    ) * 1.12;

    const X = (x: number) => padL + (x / xMax) * iw;
    const Y = (y: number) => padT + (1 - clampf(y, 0, yMax) / yMax) * ih;

    const actual = pts.map((p) => `${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join(" ");
    const expLine = `${X(0)},${Y(expAt(0))} ${X(xMax)},${Y(expAt(xMax))}`;
    const bfLine = `${X(0)},${Y(bfAt(0))} ${X(xMax)},${Y(bfAt(xMax))}`;

    const yticks = niceTicks(yMax, 4);

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full mt-2" preserveAspectRatio="xMidYMid meet">
            {/* y grid + labels */}
            {yticks.map((v) => (
                <g key={v}>
                    <line x1={padL} x2={W - padR} y1={Y(v)} y2={Y(v)} stroke="var(--rule)" />
                    <text x={padL - 6} y={Y(v) + 3} textAnchor="end" fontFamily="var(--font-mono)" fontSize={9} fill="var(--fg-soft)">{v}</text>
                </g>
            ))}

            {/* probability reference lines (in pull-space) */}
            {p50 != null && p50 <= yMax && <RefLine y={Y(p50)} x1={padL} x2={W - padR} label="50%" />}
            {p90 != null && p90 <= yMax && <RefLine y={Y(p90)} x1={padL} x2={W - padR} label="90%" />}

            {/* deadline + today verticals */}
            <line x1={X(deadX)} x2={X(deadX)} y1={padT} y2={padT + ih} stroke="var(--good)" strokeWidth={1.5} strokeDasharray="4 3" />
            <text x={X(deadX)} y={padT + 9} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={8} fill="var(--good)">deadline</text>
            {nowX > 0 && nowX < xMax && (
                <>
                    <line x1={X(nowX)} x2={X(nowX)} y1={padT} y2={padT + ih} stroke="var(--fg-soft)" strokeWidth={1} strokeDasharray="2 3" />
                    <text x={X(nowX)} y={padT + ih + 16} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={8} fill="var(--fg-soft)">today</text>
                </>
            )}

            {/* expected (flat F2P) */}
            <polyline points={expLine} fill="none" stroke="var(--fg-soft)" strokeWidth={1.5} />
            {/* best-fit projection (dotted) */}
            {hasReg && <polyline points={bfLine} fill="none" stroke="var(--accent)" strokeWidth={1.5} strokeDasharray="3 3" />}
            {/* actual */}
            {pts.length > 1 && <polyline points={actual} fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeLinejoin="round" />}
            {pts.map((p, i) => <circle key={i} cx={X(p.x)} cy={Y(p.y)} r={3} fill="var(--accent)" />)}

            {/* projected endpoint */}
            <circle cx={X(deadX)} cy={Y(bfAt(deadX))} r={3.5} fill="var(--good)" />

            {/* x labels */}
            <text x={padL} y={H - 6} fontFamily="var(--font-mono)" fontSize={9} fill="var(--fg-soft)">day 0</text>
            <text x={W - padR} y={H - 6} textAnchor="end" fontFamily="var(--font-mono)" fontSize={9} fill="var(--fg-soft)">day {xMax} →</text>
        </svg>
    );
}

function RefLine({y, x1, x2, label}: {y: number; x1: number; x2: number; label: string}) {
    return (
        <g>
            <line x1={x1} x2={x2} y1={y} y2={y} stroke="var(--warn)" strokeWidth={1} strokeDasharray="1 4" opacity={0.7} />
            <text x={x2 + 3} y={y + 3} fontFamily="var(--font-mono)" fontSize={8} fill="var(--warn)">{label}</text>
        </g>
    );
}

function Legend() {
    const items = [
        {c: "var(--accent)", d: "solid", label: "your stash"},
        {c: "var(--accent)", d: "dot", label: "best-fit → deadline"},
        {c: "var(--fg-soft)", d: "solid", label: "F2P-average"},
    ];
    return (
        <div className="flex flex-wrap gap-4 mt-3 font-mono text-[10px] text-fg-soft">
            {items.map((it) => (
                <span key={it.label} className="flex items-center gap-1.5">
                    <svg width="18" height="6"><line x1="0" y1="3" x2="18" y2="3" stroke={it.c} strokeWidth="2" strokeDasharray={it.d === "dot" ? "3 3" : undefined} /></svg>
                    {it.label}
                </span>
            ))}
        </div>
    );
}

// ----------------------------- outcome stacked bar -----------------------------

const OUTCOME_SEGMENTS = [
    {key: "moreRated", label: "Extra rate-up copies", color: "#c084fc"},
    {key: "moreFive", label: "Target + extra 5★", color: "var(--accent)"},
    {key: "target", label: "Exactly on target", color: "var(--good)"},
    {key: "lessRated", label: "Short, lost rate-ups", color: "var(--warn)"},
    {key: "lessFive", label: "Short, unlucky on 5★", color: "var(--bad)"},
] as const;

function OutcomeBar({outcome}: {outcome: Outcome}) {
    return (
        <div className="flex gap-3 flex-1">
            <div className="w-10 shrink-0 rounded-md overflow-hidden border border-rule flex flex-col-reverse min-h-45">
                {[...OUTCOME_SEGMENTS].reverse().map((s) => {
                    const v = outcome[s.key] ?? 0;
                    return <div key={s.key} style={{height: `${v * 100}%`, background: s.color}} title={`${s.label}: ${pct(v)}`} />;
                })}
            </div>
            <ul className="flex flex-col gap-1.5 text-[11.5px] flex-1 min-w-0">
                {OUTCOME_SEGMENTS.map((s) => {
                    const v = outcome[s.key] ?? 0;
                    return (
                        <li key={s.key} className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{background: s.color}} />
                            <span className="text-fg-muted truncate flex-1">{s.label}</span>
                            <span className="font-mono tabular-nums text-fg">{pct(v)}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

// ----------------------------- small parts -----------------------------

const inputCls =
    "px-3 py-2 bg-bg border border-rule rounded font-mono text-[12.5px] text-fg focus:border-rule-strong focus:outline-none";

// Setup form: taller, clearly-bordered, lifted input. Higher contrast so the
// eye lands on the box, not just the label.
const setupInput =
    "mt-1.5 w-full px-3.5 py-2.5 bg-bg-elev border border-rule-strong rounded-md font-mono text-[13px] text-fg placeholder:text-fg-soft focus:border-accent focus:outline-none transition-colors";

function Field({label, children}: {label: string; children: React.ReactNode}) {
    return (
        <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">{label}</span>
            {children}
        </label>
    );
}

function NumField({label, value, onChange, min, max, step}: {
    label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number;
}) {
    return (
        <Field label={label}>
            <input type="number" value={value} min={min} max={max} step={step ?? 1}
                   onChange={(e) => onChange(numOr0(e.target.value))} className={`${inputCls} w-full`} />
        </Field>
    );
}

function Stat({label, value, sub}: {label: string; value: string; sub?: string}) {
    return (
        <div>
            <div className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft mb-1">{label}</div>
            <div className="font-mono text-[19px] font-medium leading-none text-fg tabular-nums">{value}</div>
            {sub && <div className="font-mono text-[10px] text-fg-soft mt-1 truncate">{sub}</div>}
        </div>
    );
}

function InfoChip({children}: {children: React.ReactNode}) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border border-rule text-fg-soft">
            {children}
        </span>
    );
}

// ----------------------------- helpers -----------------------------

function pct(x: number): string {
    if (x >= 0.9995) return "100%";
    if (x > 0 && x < 0.001) return "<0.1%";
    if (x < 0.1) return `${(x * 100).toFixed(1)}%`;
    return `${Math.round(x * 100)}%`;
}
function pctRaw(x: number): string {
    const v = x * 100;
    return `${v < 1 ? v.toFixed(1) : Math.round(v)}%`;
}
function round(x: number, dp: number): number { const f = 10 ** dp; return Math.round(x * f) / f; }
function fmtPulls(x: number): string { return round(x, 1).toLocaleString(undefined, {maximumFractionDigits: 1}); }
function firstFreeName(taken: string[]): string {
    const set = new Set(taken);
    let n = 1;
    while (set.has(`Tracker ${n}`)) n++;
    return `Tracker ${n}`;
}
function numOr0(s: string): number { const v = s === "" ? 0 : Number(s); return Number.isNaN(v) ? 0 : v; }
function clampi(x: number, lo: number, hi: number): number { x = Math.round(x); return x < lo ? lo : x > hi ? hi : x; }
function clampf(x: number, lo: number, hi: number): number { return x < lo ? lo : x > hi ? hi : x; }
function currentMax(pts: Array<{y: number}>): number { return pts.reduce((m, p) => Math.max(m, p.y), 0); }
function niceTicks(max: number, count: number): number[] {
    const raw = max / count;
    const mag = 10 ** Math.floor(Math.log10(raw || 1));
    const step = [1, 2, 2.5, 5, 10].map((s) => s * mag).find((s) => s >= raw) ?? mag;
    const out: number[] = [];
    for (let v = 0; v <= max; v += step) out.push(Math.round(v));
    return out;
}
