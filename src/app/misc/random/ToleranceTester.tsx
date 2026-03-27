"use client"

import {useState, useEffect, CSSProperties} from "react";
import type {DemoModule} from "@/app/misc/random/registry";
import {NeonDriveScene} from "@/app/misc/random/ThreeDExperiments";

// ── Type definitions ──────────────────────────────────────────────

type UnitKey = "mm" | "cm" | "in" | "ft";
type FitType = "inside" | "outside";
type MethodKey = "3d_print";
type FeedbackKey = "too_tight" | "tight" | "just_right" | "loose" | "too_loose";
type SessionStatus = "active" | "complete";
type ViewName = "home" | "new" | "testing" | "detail" | "history";
type Phase = "starting" | "exploring" | "narrowing" | "converging";

interface Unit {
    key: UnitKey;
    label: string;
    precision: number;
}

interface Method {
    key: MethodKey;
    label: string;
    icon: string;
    description: string;
    insideOffset: number;
    outsideOffset: number;
    initialStepScale: number;
}

interface FeedbackOption {
    key: FeedbackKey;
    label: string;
    color: string;
    icon: string;
}

interface HistoryEntry {
    testValue: number;
    feedback: FeedbackKey;
    timestamp: number;
    step: number;
}

interface Session {
    id: string;
    name: string;
    nominal: number;
    fitType: FitType;
    unit: UnitKey;
    method: MethodKey;
    history: HistoryEntry[];
    createdAt: number;
    updatedAt: number;
    status: SessionStatus;
    currentTestValue: number;
}

interface BeliefState {
    belief: number;
    uncertainty: number;
    phase: Phase;
}

type PushMap = Record<FeedbackKey, number>;
type ShrinkMap = Record<FeedbackKey, number>;

interface Styles {
    app: CSSProperties;
    topBar: CSSProperties;
    logo: CSSProperties;
    logoMark: CSSProperties;
    logoText: CSSProperties;
    nav: CSSProperties;
    navBtn: (active: boolean) => CSSProperties;
    content: CSSProperties;
    h1: CSSProperties;
    sub: CSSProperties;
    card: CSSProperties;
    input: CSSProperties;
    select: CSSProperties;
    label: CSSProperties;
    fg: CSSProperties;
    btnPrimary: CSSProperties;
    btnSec: CSSProperties;
    fitBtn: (active: boolean) => CSSProperties;
    methodBtn: (active: boolean) => CSSProperties;
    bigVal: CSSProperties;
    unitBadge: CSSProperties;
    fbGrid: CSSProperties;
    fbBtn: (color: string) => CSSProperties;
    histRow: (fb: FeedbackKey) => CSSProperties;
    sessionRow: CSSProperties;
    badge: (status: SessionStatus) => CSSProperties;
    methodBadge: CSSProperties;
    infoRow: CSSProperties;
    infoL: CSSProperties;
    infoV: CSSProperties;
    empty: CSSProperties;
    dangerBtn: CSSProperties;
    completeBox: CSSProperties;
    offsetNote: CSSProperties;
}

// ── Constants ─────────────────────────────────────────────────────

const STORAGE_KEY = "tolerance-tester-sessions-v2";

const UNITS: Unit[] = [
    {key: "mm", label: "mm", precision: 3},
    {key: "cm", label: "cm", precision: 3},
    {key: "in", label: "in", precision: 4},
    {key: "ft", label: "ft", precision: 4},
];

const METHODS: Method[] = [
    {
        key: "3d_print",
        label: "3D Print (FDM)",
        icon: "▦",
        description: "FDM printers tend to produce holes slightly undersized and shafts slightly oversized due to bulging, shrinkage, and first-layer squish.",
        insideOffset: 0.004,
        outsideOffset: -0.004,
        initialStepScale: 2,
    },
];

const FEEDBACK_OPTIONS: FeedbackOption[] = [
    {key: "too_tight", label: "Too Tight", color: "#e74c3c", icon: "⊘"},
    {key: "tight", label: "Tight", color: "#e67e22", icon: "◉"},
    {key: "just_right", label: "Just Right", color: "#27ae60", icon: "◎"},
    {key: "loose", label: "Loose", color: "#3498db", icon: "○"},
    {key: "too_loose", label: "Too Loose", color: "#9b59b6", icon: "◌"},
];

// ── Utility functions ─────────────────────────────────────────────

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function loadSessions(): Session[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as Session[]) : [];
    } catch {
        return [];
    }
}

function saveSessions(sessions: Session[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
        console.error("Failed to save:", e);
    }
}

function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
}

function formatVal(val: number, unitKey: UnitKey): number {
    const u = UNITS.find(u => u.key === unitKey);
    return parseFloat(val.toFixed(u?.precision || 3));
}

// ── Algorithm ─────────────────────────────────────────────────────

function getInitialValue(nominal: number, fitType: FitType, methodKey: MethodKey): number {
    const method = METHODS.find(m => m.key === methodKey);
    if (!method) return nominal;
    const offset = fitType === "inside" ? method.insideOffset : method.outsideOffset;
    return parseFloat((nominal * (1 + offset)).toFixed(6));
}

function getStepScale(methodKey: MethodKey): number {
    const method = METHODS.find(m => m.key === methodKey);
    return method?.initialStepScale || 1;
}

// Belief-based search: maintains a running estimate of the ideal value
// and an uncertainty radius. Each feedback nudges the belief and adjusts
// uncertainty. Contradictory feedback naturally widens uncertainty, which
// makes the algorithm take bigger steps and explore past old values.
// No bounds, no clamping, no contradiction detection needed.

function computeNext(history: HistoryEntry[], nominal: number, fitType: FitType, methodKey: MethodKey): number {
    if (history.length === 0) return getInitialValue(nominal, fitType, methodKey);

    const last = history[history.length - 1];
    if (last.feedback === "just_right") return last.testValue;

    const scale = getStepScale(methodKey);

    // Direction mapping: which way does each feedback push the value?
    // Inside (hole): tight → need bigger, loose → need smaller
    // Outside (shaft): tight → need smaller, loose → need bigger
    const sign = fitType === "inside" ? 1 : -1;
    const pushMap: PushMap = {
        too_tight: sign * 1.0,
        tight: sign * 0.4,
        just_right: 0,
        loose: sign * -0.4,
        too_loose: sign * -1.0,
    };

    // Walk through history, building a belief.
    // Start belief at the initial value, uncertainty at a % of nominal.
    let belief = getInitialValue(nominal, fitType, methodKey);
    let uncertainty = Math.max(nominal * 0.02 * scale, 0.01);

    // Exponential recency weighting: recent data pulls harder
    const n = history.length;
    const decay = 0.55; // older entries fade fast

    for (let i = 0; i < n; i++) {
        const h = history[i];
        const recency = Math.pow(decay, n - 1 - i); // 1.0 for newest
        const push = pushMap[h.feedback];

        // The observation says: "the ideal value is probably [push direction]
        // from where we tested." Move belief toward that.
        // How far? Proportional to uncertainty (bigger uncertainty = bigger moves)
        const moveAmount = push * uncertainty * recency;
        belief = h.testValue + moveAmount;

        // Update uncertainty based on what we learned:
        // - "just right" shrinks uncertainty a lot
        // - "tight"/"loose" (close) shrinks it a little
        // - "too tight"/"too loose" (far off) grows it — we're not close yet
        const shrinkMap: ShrinkMap = {
            too_tight: 1.15,   // grow: we're far off, widen search
            tight: 0.8,        // shrink: we're getting close
            just_right: 0.3,   // shrink a lot
            loose: 0.8,        // shrink: getting close
            too_loose: 1.15,   // grow: far off
        };
        uncertainty *= shrinkMap[h.feedback];

        // Floor: don't let uncertainty collapse to zero
        uncertainty = Math.max(uncertainty, nominal * 0.001);
        // Ceiling: don't let it explode beyond a reasonable range
        uncertainty = Math.min(uncertainty, nominal * 0.15);
    }

    // The next test value IS the current belief.
    // Uncertainty is reflected in the state display, not in clamping.

    // Anti-stall: if belief is very close to the last tested value,
    // nudge it by the uncertainty amount in the push direction
    const lastPush = pushMap[last.feedback];
    if (Math.abs(belief - last.testValue) < uncertainty * 0.1) {
        belief = last.testValue + lastPush * uncertainty;
    }

    return parseFloat(belief.toFixed(6));
}

// Compute the current belief state for display purposes
function getBeliefState(history: HistoryEntry[], nominal: number, fitType: FitType, methodKey: MethodKey): BeliefState {
    if (history.length === 0) return {belief: nominal, uncertainty: nominal * 0.02, phase: "starting"};

    const scale = getStepScale(methodKey);
    const sign = fitType === "inside" ? 1 : -1;
    const pushMap: PushMap = {
        too_tight: sign * 1.0, tight: sign * 0.4, just_right: 0,
        loose: sign * -0.4, too_loose: sign * -1.0,
    };
    const shrinkMap: ShrinkMap = {
        too_tight: 1.15, tight: 0.8, just_right: 0.3,
        loose: 0.8, too_loose: 1.15,
    };

    let belief = getInitialValue(nominal, fitType, methodKey);
    let uncertainty = Math.max(nominal * 0.02 * scale, 0.01);
    const n = history.length;
    const decay = 0.55;

    for (let i = 0; i < n; i++) {
        const h = history[i];
        const recency = Math.pow(decay, n - 1 - i);
        belief = h.testValue + pushMap[h.feedback] * uncertainty * recency;
        uncertainty *= shrinkMap[h.feedback];
        uncertainty = Math.max(uncertainty, nominal * 0.001);
        uncertainty = Math.min(uncertainty, nominal * 0.15);
    }

    // Phase is derived from uncertainty relative to nominal
    const relUncertainty = uncertainty / nominal;
    const phase: Phase = relUncertainty > 0.015 ? "exploring" : relUncertainty > 0.005 ? "narrowing" : "converging";

    return {belief: parseFloat(belief.toFixed(6)), uncertainty: parseFloat(uncertainty.toFixed(6)), phase};
}

// ── Component ─────────────────────────────────────────────────────

function ToleranceTester(): React.JSX.Element {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [view, setView] = useState<ViewName>("home");
    const [activeSession, setActiveSession] = useState<Session | null>(null);
    const [newName, setNewName] = useState<string>("");
    const [newNominal, setNewNominal] = useState<string>("");
    const [newFitType, setNewFitType] = useState<FitType>("inside");
    const [newUnit, setNewUnit] = useState<UnitKey>("mm");
    const [newMethod, setNewMethod] = useState<MethodKey>("3d_print");
    const [mounted, setMounted] = useState<boolean>(false);

    useEffect(() => {
        setSessions(loadSessions());
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) saveSessions(sessions);
    }, [sessions, mounted]);

    const createSession = (): void => {
        const nom = parseFloat(newNominal);
        if (!newName.trim() || isNaN(nom)) return;
        const initVal = getInitialValue(nom, newFitType, newMethod);
        const session: Session = {
            id: generateId(),
            name: newName.trim(),
            nominal: nom,
            fitType: newFitType,
            unit: newUnit,
            method: newMethod,
            history: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            status: "active",
            currentTestValue: formatVal(initVal, newUnit),
        };
        setSessions(prev => [session, ...prev]);
        setActiveSession(session);
        setView("testing");
        setNewName("");
        setNewNominal("");
    };

    const submitFeedback = (sessionId: string, feedback: FeedbackKey): void => {
        setSessions(prev => prev.map(s => {
            if (s.id !== sessionId) return s;
            const newHistory: HistoryEntry[] = [...s.history, {
                testValue: s.currentTestValue,
                feedback,
                timestamp: Date.now(),
                step: s.history.length + 1,
            }];
            const isDone = feedback === "just_right";
            const raw = isDone ? s.currentTestValue : computeNext(newHistory, s.nominal, s.fitType, s.method);
            const nextVal = formatVal(raw, s.unit);
            const updated: Session = {
                ...s,
                history: newHistory,
                currentTestValue: nextVal,
                updatedAt: Date.now(),
                status: isDone ? "complete" : "active",
            };
            setActiveSession(updated);
            return updated;
        }));
    };

    const deleteSession = (id: string): void => {
        setSessions(prev => prev.filter(s => s.id !== id));
        if (activeSession?.id === id) {
            setActiveSession(null);
            setView("home");
        }
    };

    const reopenSession = (session: Session): void => {
        const updated: Session = session.status === "complete" ? {...session, status: "active"} : session;
        if (session.status === "complete") setSessions(prev => prev.map(s => s.id === session.id ? updated : s));
        setActiveSession(updated);
        setView("testing");
    };

    const resetSession = (sessionId: string): void => {
        setSessions(prev => prev.map(s => {
            if (s.id !== sessionId) return s;
            const initVal = getInitialValue(s.nominal, s.fitType, s.method);
            const updated: Session = {
                ...s,
                history: [],
                currentTestValue: formatVal(initVal, s.unit),
                status: "active",
                updatedAt: Date.now()
            };
            setActiveSession(updated);
            return updated;
        }));
    };

    const S: Styles = {
        app: {
            minHeight: "100vh",
            background: "#08080a",
            color: "#d4d4d8",
            fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', ui-monospace, monospace",
            fontSize: "13px"
        },
        topBar: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            borderBottom: "1px solid #18181b",
            background: "#0a0a0d",
            position: "sticky",
            top: 0,
            zIndex: 100
        },
        logo: {display: "flex", alignItems: "center", gap: "10px", cursor: "pointer"},
        logoMark: {
            width: "26px",
            height: "26px",
            background: "#e2a832",
            borderRadius: "3px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: 800,
            color: "#08080a"
        },
        logoText: {
            fontSize: "13px",
            fontWeight: 600,
            color: "#e4e4e7",
            letterSpacing: "0.3px",
            textTransform: "uppercase"
        },
        nav: {display: "flex", gap: "2px"},
        navBtn: (a: boolean): CSSProperties => ({
            padding: "5px 12px",
            fontSize: "10px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "1.2px",
            background: a ? "#18181b" : "transparent",
            color: a ? "#fafafa" : "#52525b",
            border: `1px solid ${a ? "#27272a" : "transparent"}`,
            borderRadius: "3px",
            cursor: "pointer",
            fontFamily: "inherit"
        }),
        content: {maxWidth: "680px", margin: "0 auto", padding: "28px 20px 60px"},
        h1: {fontSize: "26px", fontWeight: 300, color: "#fafafa", margin: "0 0 6px", letterSpacing: "-0.5px"},
        sub: {fontSize: "12px", color: "#3f3f46", margin: "0 0 28px", lineHeight: 1.6},
        card: {
            background: "#0e0e11",
            border: "1px solid #18181b",
            borderRadius: "6px",
            padding: "20px",
            marginBottom: "10px"
        },
        input: {
            width: "100%",
            padding: "9px 12px",
            background: "#08080a",
            border: "1px solid #27272a",
            borderRadius: "4px",
            color: "#fafafa",
            fontSize: "13px",
            fontFamily: "inherit",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.15s"
        },
        select: {
            width: "100%",
            padding: "9px 12px",
            background: "#08080a",
            border: "1px solid #27272a",
            borderRadius: "4px",
            color: "#fafafa",
            fontSize: "13px",
            fontFamily: "inherit",
            outline: "none",
            boxSizing: "border-box",
            cursor: "pointer",
            appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2352525b'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 12px center",
            paddingRight: "32px"
        },
        label: {
            fontSize: "9px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            color: "#52525b",
            marginBottom: "5px",
            display: "block"
        },
        fg: {marginBottom: "16px"},
        btnPrimary: {
            padding: "11px 24px",
            background: "#e2a832",
            color: "#08080a",
            border: "none",
            borderRadius: "4px",
            fontSize: "11px",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            cursor: "pointer",
            fontFamily: "inherit",
            width: "100%"
        },
        btnSec: {
            padding: "6px 14px",
            background: "transparent",
            color: "#a1a1aa",
            border: "1px solid #27272a",
            borderRadius: "3px",
            fontSize: "10px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "1px",
            cursor: "pointer",
            fontFamily: "inherit"
        },
        fitBtn: (a: boolean): CSSProperties => ({
            flex: 1,
            padding: "9px",
            background: a ? "#18181b" : "transparent",
            border: `1px solid ${a ? "#e2a832" : "#27272a"}`,
            borderRadius: "4px",
            color: a ? "#e2a832" : "#52525b",
            fontSize: "10px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1px",
            cursor: "pointer",
            fontFamily: "inherit",
            textAlign: "center"
        }),
        methodBtn: (a: boolean): CSSProperties => ({
            flex: 1,
            padding: "12px 10px",
            background: a ? "#18181b" : "transparent",
            border: `1px solid ${a ? "#e2a832" : "#27272a"}`,
            borderRadius: "4px",
            color: a ? "#e4e4e7" : "#52525b",
            fontSize: "10px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            textAlign: "center",
            lineHeight: 1.5
        }),
        bigVal: {fontSize: "52px", fontWeight: 200, color: "#fafafa", letterSpacing: "-2px", margin: 0, lineHeight: 1},
        unitBadge: {
            display: "inline-block",
            padding: "2px 8px",
            background: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "3px",
            fontSize: "11px",
            color: "#71717a",
            marginTop: "8px",
            textTransform: "uppercase",
            letterSpacing: "1px"
        },
        fbGrid: {display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: "5px", marginTop: "20px"},
        fbBtn: (c: string): CSSProperties => ({
            padding: "12px 2px",
            background: "#0e0e11",
            border: `1px solid ${c}30`,
            borderRadius: "5px",
            color: c,
            fontSize: "9px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.3px",
            cursor: "pointer",
            fontFamily: "inherit",
            textAlign: "center",
            lineHeight: 1.4,
            transition: "all 0.12s"
        }),
        histRow: (fb: FeedbackKey): CSSProperties => {
            const f = FEEDBACK_OPTIONS.find(x => x.key === fb);
            return {
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 12px",
                background: "#0a0a0d",
                borderRadius: "3px",
                borderLeft: `3px solid ${f?.color || "#333"}`,
                marginBottom: "3px",
                fontSize: "11px"
            };
        },
        sessionRow: {
            background: "#0e0e11",
            border: "1px solid #18181b",
            borderRadius: "6px",
            padding: "14px 16px",
            marginBottom: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            transition: "border-color 0.12s"
        },
        badge: (st: SessionStatus): CSSProperties => ({
            padding: "2px 7px",
            borderRadius: "3px",
            fontSize: "8px",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "1px",
            background: st === "complete" ? "#27ae6015" : "#e2a83215",
            color: st === "complete" ? "#27ae60" : "#e2a832",
            border: `1px solid ${st === "complete" ? "#27ae6030" : "#e2a83230"}`
        }),
        methodBadge: {
            padding: "2px 7px",
            borderRadius: "3px",
            fontSize: "8px",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "1px",
            background: "#3b82f615",
            color: "#60a5fa",
            border: "1px solid #3b82f630"
        },
        infoRow: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "7px 0",
            borderBottom: "1px solid #141416",
            fontSize: "11px"
        },
        infoL: {color: "#3f3f46", textTransform: "uppercase", fontSize: "9px", letterSpacing: "1.2px"},
        infoV: {color: "#d4d4d8"},
        empty: {textAlign: "center", padding: "50px 20px", color: "#27272a"},
        dangerBtn: {
            padding: "5px 10px",
            background: "transparent",
            color: "#52525b",
            border: "1px solid #27272a",
            borderRadius: "3px",
            fontSize: "9px",
            cursor: "pointer",
            fontFamily: "inherit",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
        },
        completeBox: {
            textAlign: "center",
            padding: "28px 16px",
            background: "#27ae600a",
            borderRadius: "6px",
            border: "1px solid #27ae6025"
        },
        offsetNote: {
            fontSize: "10px",
            color: "#52525b",
            background: "#0a0a0d",
            borderLeft: "2px solid #e2a83244",
            padding: "8px 12px",
            marginTop: "8px",
            borderRadius: "0 3px 3px 0",
            lineHeight: 1.6
        },
    };

    const methodObj = METHODS.find(m => m.key === newMethod);

    const renderHome = (): React.JSX.Element => (
        <div style={S.content}>
            <h1 style={S.h1}>Tolerance Tests</h1>
            <p style={S.sub}>Noise-tolerant search for the perfect fit. Handles inconsistent feedback from real-world
                testing.</p>
            <button style={{...S.btnPrimary, marginBottom: "28px"}} onClick={() => setView("new")}>+ New Test</button>
            {sessions.length === 0 ? (
                <div style={S.empty}>
                    <div style={{fontSize: "40px", marginBottom: "12px"}}>◎</div>
                    <div style={{fontSize: "12px", color: "#3f3f46"}}>No tests yet</div>
                </div>
            ) : sessions.slice(0, 15).map(s => (
                <div key={s.id} style={S.sessionRow} onClick={() => {
                    setActiveSession(s);
                    setView("detail");
                }}
                     onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.borderColor = "#27272a"}
                     onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.borderColor = "#18181b"}>
                    <div>
                        <div style={{display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px"}}>
                            <span style={{fontSize: "13px", fontWeight: 500, color: "#fafafa"}}>{s.name}</span>
                            <span style={S.badge(s.status)}>{s.status}</span>
                            <span
                                style={S.methodBadge}>{METHODS.find(m => m.key === s.method)?.label || s.method}</span>
                        </div>
                        <div style={{
                            fontSize: "10px",
                            color: "#3f3f46"
                        }}>{s.nominal} {s.unit} · {s.fitType} · {s.history.length} step{s.history.length !== 1 ? "s" : ""}</div>
                    </div>
                    <div style={{fontSize: "10px", color: "#27272a"}}>{formatDate(s.updatedAt)}</div>
                </div>
            ))}
        </div>
    );

    const renderNew = (): React.JSX.Element => {
        const nom = parseFloat(newNominal);
        const hasNom = !isNaN(nom);
        const preview = hasNom ? formatVal(getInitialValue(nom, newFitType, newMethod), newUnit) : null;
        const diff = hasNom && preview !== null ? formatVal(preview - nom, newUnit) : null;

        return (
            <div style={S.content}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px"
                }}>
                    <h1 style={{...S.h1, marginBottom: 0}}>New Test</h1>
                    <button style={S.btnSec} onClick={() => setView("home")}>Cancel</button>
                </div>
                <p style={S.sub}>Define your part, method, and nominal size.</p>
                <div style={S.card}>
                    <div style={S.fg}>
                        <label style={S.label}>Test Name</label>
                        <input style={S.input} value={newName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)}
                               placeholder="e.g. Bearing Housing Bore"
                               onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.style.borderColor = "#e2a832"}
                               onBlur={(e: React.FocusEvent<HTMLInputElement>) => e.target.style.borderColor = "#27272a"}/>
                    </div>

                    <div style={S.fg}>
                        <label style={S.label}>Manufacturing Method</label>
                        <div style={{display: "flex", gap: "6px"}}>
                            {METHODS.map(m => (
                                <button key={m.key} style={S.methodBtn(newMethod === m.key)}
                                        onClick={() => setNewMethod(m.key)}>
                                    <div style={{fontSize: "18px", marginBottom: "3px"}}>{m.icon}</div>
                                    {m.label}
                                </button>
                            ))}
                        </div>
                        {methodObj && <div style={S.offsetNote}>{methodObj.description}</div>}
                    </div>

                    <div style={{display: "flex", gap: "10px", ...S.fg}}>
                        <div style={{flex: 3}}>
                            <label style={S.label}>Nominal Size</label>
                            <input style={S.input} type="number" step="any" value={newNominal}
                                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewNominal(e.target.value)} placeholder="25.000"
                                   onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.style.borderColor = "#e2a832"}
                                   onBlur={(e: React.FocusEvent<HTMLInputElement>) => e.target.style.borderColor = "#27272a"}/>
                        </div>
                        <div style={{flex: 1}}>
                            <label style={S.label}>Unit</label>
                            <select style={S.select} value={newUnit} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewUnit(e.target.value as UnitKey)}>
                                {UNITS.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={S.fg}>
                        <label style={S.label}>Fit Type</label>
                        <div style={{display: "flex", gap: "6px"}}>
                            <button style={S.fitBtn(newFitType === "inside")} onClick={() => setNewFitType("inside")}>⊞
                                Inside (Hole)
                            </button>
                            <button style={S.fitBtn(newFitType === "outside")}
                                    onClick={() => setNewFitType("outside")}>⊡ Outside (Shaft)
                            </button>
                        </div>
                        <div style={{fontSize: "9px", color: "#3f3f46", marginTop: "6px", lineHeight: 1.6}}>
                            {newFitType === "inside" ? 'Testing a hole or cavity. "Too tight" → hole too small → value increases.' : 'Testing a shaft or pin. "Too tight" → shaft too big → value decreases.'}
                        </div>
                    </div>

                    {hasNom && preview !== null && preview !== nom && (
                        <div style={{
                            background: "#e2a83208",
                            border: "1px solid #e2a83220",
                            borderRadius: "4px",
                            padding: "10px 14px",
                            marginBottom: "16px",
                            fontSize: "11px",
                            color: "#a1a1aa"
                        }}>
                            <span style={{color: "#52525b"}}>Start value: </span>
                            <span style={{color: "#e2a832", fontWeight: 600}}>{preview} {newUnit}</span>
                            <span
                                style={{color: "#3f3f46"}}> ({diff !== null && diff > 0 ? "+" : ""}{diff} {newUnit} offset for {methodObj?.label})</span>
                        </div>
                    )}

                    <button style={{
                        ...S.btnPrimary,
                        opacity: (!newName.trim() || !newNominal) ? 0.35 : 1,
                        cursor: (!newName.trim() || !newNominal) ? "not-allowed" : "pointer"
                    }}
                            onClick={createSession} disabled={!newName.trim() || !newNominal}>Start Testing →
                    </button>
                </div>
            </div>
        );
    };

    const renderTesting = (): React.JSX.Element | null => {
        if (!activeSession) return null;
        const s = activeSession;
        const isComplete = s.status === "complete";
        const methodLabel = METHODS.find(m => m.key === s.method)?.label || s.method;

        const beliefState = getBeliefState(s.history, s.nominal, s.fitType, s.method);

        return (
            <div style={S.content}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "20px"
                }}>
                    <div>
                        <div style={{
                            fontSize: "9px",
                            textTransform: "uppercase",
                            letterSpacing: "1.5px",
                            color: "#3f3f46",
                            marginBottom: "2px"
                        }}>
                            {isComplete ? "Complete" : `Step ${s.history.length + 1}`}
                        </div>
                        <h1 style={{...S.h1, fontSize: "20px", marginBottom: "3px"}}>{s.name}</h1>
                        <div style={{
                            fontSize: "10px",
                            color: "#3f3f46",
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                            flexWrap: "wrap"
                        }}>
                            <span>Nominal: {s.nominal} {s.unit}</span><span style={{color: "#1e1e22"}}>|</span>
                            <span>{s.fitType}</span><span style={{color: "#1e1e22"}}>|</span>
                            <span style={S.methodBadge}>{methodLabel}</span>
                        </div>
                    </div>
                    <div style={{display: "flex", gap: "4px"}}>
                        <button style={S.dangerBtn} onClick={() => resetSession(s.id)}>Reset</button>
                        <button style={S.btnSec} onClick={() => setView("home")}>Close</button>
                    </div>
                </div>

                {isComplete ? (
                    <div style={S.completeBox}>
                        <div style={{
                            fontSize: "9px",
                            textTransform: "uppercase",
                            letterSpacing: "2px",
                            color: "#27ae60"
                        }}>◎ Ideal Value Found
                        </div>
                        <div style={{
                            fontSize: "46px",
                            fontWeight: 200,
                            color: "#27ae60",
                            margin: "6px 0"
                        }}>{s.currentTestValue}</div>
                        <div style={S.unitBadge}>{s.unit}</div>
                        <div style={{fontSize: "10px", color: "#3f3f46", marginTop: "10px"}}>
                            Found in {s.history.length} step{s.history.length !== 1 ? "s" : ""} ·
                            Offset: {formatVal(s.currentTestValue - s.nominal, s.unit) > 0 ? "+" : ""}{formatVal(s.currentTestValue - s.nominal, s.unit)} {s.unit}
                        </div>
                        <div style={{marginTop: "16px"}}>
                            <button style={S.btnSec} onClick={() => reopenSession(s)}>Continue Testing</button>
                        </div>
                    </div>
                ) : (
                    <div style={S.card}>
                        <div style={{textAlign: "center", padding: "32px 16px"}}>
                            <div style={{
                                fontSize: "9px",
                                textTransform: "uppercase",
                                letterSpacing: "2px",
                                color: "#3f3f46",
                                marginBottom: "10px"
                            }}>Test this value
                            </div>
                            <div style={S.bigVal}>{s.currentTestValue}</div>
                            <div style={S.unitBadge}>{s.unit}</div>
                        </div>
                        <div style={{textAlign: "center", marginBottom: "8px"}}>
                            <div style={{fontSize: "10px", color: "#27272a", marginBottom: "6px"}}>How does it fit?
                            </div>
                            <div style={S.fbGrid}>
                                {FEEDBACK_OPTIONS.map(fb => (
                                    <button key={fb.key} style={S.fbBtn(fb.color)}
                                            onClick={() => submitFeedback(s.id, fb.key)}
                                            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                                                e.currentTarget.style.background = fb.color + "15";
                                                e.currentTarget.style.borderColor = fb.color + "55";
                                            }}
                                            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                                                e.currentTarget.style.background = "#0e0e11";
                                                e.currentTarget.style.borderColor = fb.color + "30";
                                            }}>
                                        <div style={{fontSize: "16px", marginBottom: "2px"}}>{fb.icon}</div>
                                        {fb.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {s.history.length > 0 && (
                    <div style={{...S.card, padding: "12px 16px"}}>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "10px"
                        }}>
                            <div style={{
                                fontSize: "9px",
                                textTransform: "uppercase",
                                letterSpacing: "1.5px",
                                color: "#3f3f46"
                            }}>Belief State
                            </div>
                            <span style={{
                                padding: "2px 7px", borderRadius: "3px", fontSize: "8px", fontWeight: 800,
                                textTransform: "uppercase", letterSpacing: "1px",
                                background: beliefState.phase === "converging" ? "#27ae6015" : beliefState.phase === "narrowing" ? "#e2a83215" : "#3b82f615",
                                color: beliefState.phase === "converging" ? "#27ae60" : beliefState.phase === "narrowing" ? "#e2a832" : "#60a5fa",
                                border: `1px solid ${beliefState.phase === "converging" ? "#27ae6030" : beliefState.phase === "narrowing" ? "#e2a83230" : "#3b82f630"}`,
                            }}>{beliefState.phase}</span>
                        </div>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "11px",
                            marginBottom: "6px"
                        }}>
                            <span style={{color: "#a1a1aa"}}>Estimate: <span
                                style={{color: "#fafafa", fontWeight: 500}}>{beliefState.belief} {s.unit}</span></span>
                        </div>
                        <div style={{display: "flex", alignItems: "center", gap: "8px", fontSize: "11px"}}>
                            <span style={{color: "#52525b"}}>Uncertainty:</span>
                            <div style={{
                                flex: 1,
                                height: "4px",
                                background: "#18181b",
                                borderRadius: "2px",
                                overflow: "hidden"
                            }}>
                                <div style={{
                                    height: "100%", borderRadius: "2px",
                                    background: beliefState.phase === "converging" ? "#27ae60" : beliefState.phase === "narrowing" ? "#e2a832" : "#3b82f6",
                                    width: `${Math.min(100, Math.max(5, (beliefState.uncertainty / (s.nominal * 0.03)) * 100))}%`,
                                    transition: "width 0.3s ease",
                                }}/>
                            </div>
                            <span
                                style={{color: "#52525b", fontSize: "10px"}}>±{beliefState.uncertainty} {s.unit}</span>
                        </div>
                    </div>
                )}

                {s.history.length > 0 && (
                    <div style={{marginTop: "16px"}}>
                        <div style={{
                            fontSize: "9px",
                            textTransform: "uppercase",
                            letterSpacing: "1.5px",
                            color: "#3f3f46",
                            marginBottom: "8px"
                        }}>History ({s.history.length})
                        </div>
                        {[...s.history].reverse().map((h, i) => {
                            const fb = FEEDBACK_OPTIONS.find(f => f.key === h.feedback);
                            return (
                                <div key={i} style={S.histRow(h.feedback)}>
                                    <span style={{color: "#27272a", fontSize: "9px", minWidth: "14px"}}>#{h.step}</span>
                                    <span style={{
                                        color: "#fafafa",
                                        fontWeight: 500,
                                        flex: 1
                                    }}>{h.testValue} {s.unit}</span>
                                    <span style={{
                                        color: fb?.color,
                                        fontSize: "9px",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px"
                                    }}>{fb?.icon} {fb?.label}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    const renderDetail = (): React.JSX.Element | null => {
        if (!activeSession) return null;
        const s = activeSession;
        const justRightVal = s.history.find(h => h.feedback === "just_right")?.testValue;
        const methodLabel = METHODS.find(m => m.key === s.method)?.label || s.method;

        return (
            <div style={S.content}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "20px"
                }}>
                    <div>
                        <h1 style={{...S.h1, fontSize: "20px", marginBottom: "3px"}}>{s.name}</h1>
                        <div style={{display: "flex", gap: "6px", alignItems: "center"}}>
                            <span style={S.badge(s.status)}>{s.status}</span>
                            <span style={S.methodBadge}>{methodLabel}</span>
                        </div>
                    </div>
                    <div style={{display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "flex-end"}}>
                        <button style={S.btnSec}
                                onClick={() => reopenSession(s)}>{s.status === "complete" ? "Re-open" : "Continue"}</button>
                        <button style={{...S.dangerBtn, color: "#ef4444", borderColor: "#ef444430"}}
                                onClick={() => {
                                    if (confirm("Delete this test?")) deleteSession(s.id);
                                }}>Delete
                        </button>
                        <button style={S.btnSec} onClick={() => setView("home")}>Back</button>
                    </div>
                </div>

                <div style={S.card}>
                    <div style={S.infoRow}><span style={S.infoL}>Nominal</span><span
                        style={S.infoV}>{s.nominal} {s.unit}</span></div>
                    <div style={S.infoRow}><span style={S.infoL}>Unit</span><span style={S.infoV}>{s.unit}</span></div>
                    <div style={S.infoRow}><span style={S.infoL}>Fit Type</span><span
                        style={S.infoV}>{s.fitType === "inside" ? "Inside (Hole)" : "Outside (Shaft)"}</span></div>
                    <div style={S.infoRow}><span style={S.infoL}>Method</span><span style={S.infoV}>{methodLabel}</span>
                    </div>
                    <div style={S.infoRow}><span style={S.infoL}>Steps</span><span
                        style={S.infoV}>{s.history.length}</span></div>
                    <div style={S.infoRow}><span style={S.infoL}>Created</span><span
                        style={S.infoV}>{formatDate(s.createdAt)}</span></div>
                    <div style={{...S.infoRow, borderBottom: "none"}}><span style={S.infoL}>Updated</span><span
                        style={S.infoV}>{formatDate(s.updatedAt)}</span></div>
                    {justRightVal !== undefined && (
                        <div style={{
                            ...S.infoRow,
                            borderBottom: "none",
                            borderTop: "1px solid #141416",
                            paddingTop: "10px",
                            marginTop: "4px"
                        }}>
                            <span style={S.infoL}>Result</span><span
                            style={{color: "#27ae60", fontWeight: 700}}>{justRightVal} {s.unit}</span>
                        </div>
                    )}
                </div>

                {s.history.length > 0 && (
                    <>
                        <div style={{
                            fontSize: "9px",
                            textTransform: "uppercase",
                            letterSpacing: "1.5px",
                            color: "#3f3f46",
                            margin: "20px 0 8px"
                        }}>Full History
                        </div>
                        {s.history.map((h, i) => {
                            const fb = FEEDBACK_OPTIONS.find(f => f.key === h.feedback);
                            return (
                                <div key={i} style={S.histRow(h.feedback)}>
                                    <span style={{color: "#27272a", fontSize: "9px", minWidth: "20px"}}>#{h.step}</span>
                                    <span style={{
                                        color: "#fafafa",
                                        fontWeight: 500,
                                        flex: 1
                                    }}>{h.testValue} {s.unit}</span>
                                    <span style={{
                                        color: fb?.color,
                                        fontSize: "9px",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px",
                                        minWidth: "70px",
                                        textAlign: "right"
                                    }}>{fb?.icon} {fb?.label}</span>
                                    <span style={{color: "#27272a", fontSize: "9px"}}>{formatDate(h.timestamp)}</span>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>
        );
    };

    const renderHistory = (): React.JSX.Element => {
        const completed = sessions.filter(s => s.status === "complete");
        const active = sessions.filter(s => s.status === "active");

        return (
            <div style={S.content}>
                <h1 style={S.h1}>All Tests</h1>
                <p style={S.sub}>{sessions.length} test{sessions.length !== 1 ? "s" : ""} saved</p>
                {sessions.length === 0 ? (
                    <div style={S.empty}>
                        <div style={{fontSize: "40px", marginBottom: "12px"}}>◌</div>
                        <div style={{fontSize: "12px", color: "#3f3f46"}}>No tests found</div>
                    </div>
                ) : (
                    <>
                        {completed.length > 0 && (
                            <>
                                <div style={{
                                    fontSize: "9px",
                                    textTransform: "uppercase",
                                    letterSpacing: "1.5px",
                                    color: "#27ae60",
                                    marginBottom: "8px"
                                }}>Completed ({completed.length})
                                </div>
                                {completed.map(s => {
                                    const result = s.history.find(h => h.feedback === "just_right")?.testValue;
                                    return (
                                        <div key={s.id} style={S.sessionRow} onClick={() => {
                                            setActiveSession(s);
                                            setView("detail");
                                        }}
                                             onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.borderColor = "#27ae6030"}
                                             onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.borderColor = "#18181b"}>
                                            <div>
                                                <div style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                    marginBottom: "3px"
                                                }}>
                                                    <span style={{
                                                        fontSize: "13px",
                                                        fontWeight: 500,
                                                        color: "#fafafa"
                                                    }}>{s.name}</span>
                                                    <span
                                                        style={S.methodBadge}>{METHODS.find(m => m.key === s.method)?.label}</span>
                                                </div>
                                                <div style={{
                                                    fontSize: "10px",
                                                    color: "#3f3f46"
                                                }}>{s.nominal} → {result} {s.unit} · {s.history.length} steps
                                                </div>
                                            </div>
                                            <div style={{color: "#27ae60", fontSize: "10px"}}>◎</div>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                        {active.length > 0 && (
                            <>
                                <div style={{
                                    fontSize: "9px",
                                    textTransform: "uppercase",
                                    letterSpacing: "1.5px",
                                    color: "#e2a832",
                                    marginTop: "20px",
                                    marginBottom: "8px"
                                }}>In Progress ({active.length})
                                </div>
                                {active.map(s => (
                                    <div key={s.id} style={S.sessionRow} onClick={() => {
                                        setActiveSession(s);
                                        setView("detail");
                                    }}
                                         onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.borderColor = "#e2a83230"}
                                         onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.borderColor = "#18181b"}>
                                        <div>
                                            <div style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                marginBottom: "3px"
                                            }}>
                                                <span style={{
                                                    fontSize: "13px",
                                                    fontWeight: 500,
                                                    color: "#fafafa"
                                                }}>{s.name}</span>
                                                <span
                                                    style={S.methodBadge}>{METHODS.find(m => m.key === s.method)?.label}</span>
                                            </div>
                                            <div style={{
                                                fontSize: "10px",
                                                color: "#3f3f46"
                                            }}>{s.nominal} {s.unit} · {s.fitType} · {s.history.length} steps
                                            </div>
                                        </div>
                                        <div style={{color: "#e2a832", fontSize: "10px"}}>◉</div>
                                    </div>
                                ))}
                            </>
                        )}
                    </>
                )}
            </div>
        );
    };

    return (
        <div style={S.app}>
            <div style={S.topBar}>
                <div style={S.logo} onClick={() => setView("home")}>
                    <div style={S.logoMark}>±</div>
                    <span style={S.logoText}>Tolerance Tester</span>
                </div>
                <div style={S.nav}>
                    <button style={S.navBtn(view === "home" || view === "new")} onClick={() => setView("home")}>Home
                    </button>
                    <button style={S.navBtn(view === "history")} onClick={() => setView("history")}>History</button>
                </div>
            </div>
            {view === "home" && renderHome()}
            {view === "new" && renderNew()}
            {view === "testing" && renderTesting()}
            {view === "detail" && renderDetail()}
            {view === "history" && renderHistory()}
        </div>
    );
}

const Page: React.FC = () => <ToleranceTester/>;
const preview = <div/>;

export const title = "Tolerance Tester";
export const description = "A useful thing";

const mod: DemoModule = {title, description, preview, Page, presentable: false };
export default mod;
