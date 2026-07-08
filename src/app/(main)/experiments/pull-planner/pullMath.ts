/**
 * Pull Patience — probability + projection engine.
 *
 * Pure, dependency-free. Two jobs:
 *   1. Gacha maths: from a pity/rate system and a pull budget, the exact
 *      probability of the possible outcomes (via a small Markov DP — no
 *      simulation).
 *   2. Saving maths: turn a log of check-ins (currency snapshots over time)
 *      into a saving rate, and project it forward to the deadline.
 *
 * The gacha model covers the Genshin/HSR/ZZZ shape: a flat base rate that
 * ramps at soft pity to a guaranteed hard pity, and a "rate-up" 50/50 — a 5★
 * is the featured item with some probability, otherwise it's off-banner and
 * the NEXT 5★ is guaranteed featured.
 */

// ----------------------------- Types -----------------------------

export type GachaSystem = {
    baseRate: number;    // per-pull 5★ chance before soft pity
    softPity: number;    // 1-based pull where the rate starts climbing
    hardPity: number;    // 1-based pull that guarantees a 5★
    rampStep: number;    // rate added per pull at/after soft pity
    featuredChance: number; // chance a 5★ is the rate-up item (the 50/50)
};

export type Game = {
    id: string;
    label: string;       // shown in the dropdown
    kind: string;        // "Agent" / "W-Engine"
    system: GachaSystem;
    currencyName: string;   // premium currency (e.g. Polychrome)
    ticketName: string;     // banner ticket (e.g. Encrypted Master Tape)
    currencyPerPull: number;
    expectedRate: number;   // modelled F2P pulls/day for the "expected" baseline
    refundFactor: number;   // A-rank refunds stretch each raw pull (e.g. 1.15848)
};

export type PullState = {
    pity: number;
    guaranteed: boolean;
    copiesNeeded: number;
};

// ----------------------------- Games -----------------------------
//
// Only Zenless Zone Zero for now. Numbers per the request:
//   Agent    — base 0.6%, soft 75, hard 90, rate-up 50/50
//   W-Engine — base 1.0%, soft 65, hard 80, rate-up 75/25
// Ramp is modelled linearly from soft→hard (hard pity forces 1 regardless).

function ramp(base: number, soft: number, hard: number): number {
    return (1 - base) / Math.max(1, hard - soft);
}

export const GAMES: Game[] = [
    {
        id: "zzz-agent",
        label: "Zenless Zone Zero · Agent",
        kind: "Agent",
        system: {baseRate: 0.006, softPity: 75, hardPity: 90, rampStep: ramp(0.006, 75, 90), featuredChance: 0.5},
        currencyName: "Polychrome",
        ticketName: "Encrypted Master Tape",
        currencyPerPull: 160,
        expectedRate: 1.7,
        refundFactor: 1.15848,
    },
    {
        id: "zzz-weapon",
        label: "Zenless Zone Zero · W-Engine",
        kind: "W-Engine",
        system: {baseRate: 0.01, softPity: 65, hardPity: 80, rampStep: ramp(0.01, 65, 80), featuredChance: 0.75},
        currencyName: "Polychrome",
        ticketName: "Boopon",
        currencyPerPull: 160,
        expectedRate: 1.7,
        refundFactor: 1.15848,
    },
];

export function gameById(id: string): Game {
    return GAMES.find((g) => g.id === id) ?? GAMES[0];
}

// ----------------------------- Core rate curve -----------------------------

export function rarityChance(sys: GachaSystem, pull: number): number {
    if (pull >= sys.hardPity) return 1;
    if (pull < sys.softPity) return clamp01(sys.baseRate);
    return clamp01(sys.baseRate + sys.rampStep * (pull - sys.softPity + 1));
}

// ----------------------------- Success curve (P vs pulls) -----------------------------

export type Curve = {
    /** cdf[k] = P(target reached within k pulls). Non-decreasing. */
    cdf: number[];
    mean: number;
    meanReliable: number;   // mass captured within maxPulls (mean reliable if ~1)
    maxPulls: number;
};

/** P(≥ copiesNeeded featured copies within k pulls), for every k up to maxPulls. */
export function successCurve(sys: GachaSystem, start: PullState, maxPulls: number): Curve {
    const need = Math.max(1, Math.floor(start.copiesNeeded));
    const P = Math.max(1, Math.ceil(sys.hardPity));
    const w = clamp01(sys.featuredChance);

    const make = () =>
        Array.from({length: need + 1}, () => [new Float64Array(P), new Float64Array(P)] as [Float64Array, Float64Array]);
    let dist = make();
    dist[0][start.guaranteed ? 1 : 0][clampInt(start.pity, 0, P - 1)] = 1;

    const rate = new Float64Array(P);
    for (let n = 0; n < P; n++) rate[n] = rarityChance(sys, n + 1);

    const cdf = new Array<number>(maxPulls + 1).fill(0);
    let done = 0, mean = 0;

    for (let k = 1; k <= maxPulls; k++) {
        const next = make();
        for (let c = 0; c < need; c++) {
            for (let g = 0; g < 2; g++) {
                const row = dist[c][g];
                for (let n = 0; n < P; n++) {
                    const m = row[n];
                    if (m === 0) continue;
                    const r = rate[n];
                    if (r < 1) next[c][g][n + 1] += m * (1 - r);
                    const hit = m * r;
                    if (g === 1) next[Math.min(c + 1, need)][0][0] += hit;
                    else {
                        next[Math.min(c + 1, need)][0][0] += hit * w;
                        next[c][1][0] += hit * (1 - w);
                    }
                }
            }
        }
        let nd = 0;
        for (let g = 0; g < 2; g++) {
            const drow = next[need][g];
            for (let n = 0; n < drow.length; n++) { nd += drow[n]; drow[n] = 0; }
        }
        done += nd; mean += k * nd; cdf[k] = done; dist = next;
    }
    return {cdf, mean: done > 0 ? mean / done : Infinity, meanReliable: done, maxPulls};
}

// ----------------------------- Outcome distribution (the stacked bar) -----------------------------
//
// Assumes every available pull is spent by the deadline (no early stop — that's
// what lets "more rate-up copies" be a possible outcome). Tracks featured
// copies F and off-banner 5★ O, both capped, then buckets the terminal state
// into five mutually-exclusive outcomes relative to the target T:
//
//   lessFive   S<T           — unlucky on 5★ rate; couldn't reach target
//   lessRated  S≥T, F<T      — enough 5★, but lost too many 50/50s
//   target     F=T, O=0      — exactly the target
//   moreFive   F=T, O>0      — target met, plus extra off-banner 5★
//   moreRated  F>T           — extra copies of the rate-up item

export type Outcome = {
    lessFive: number;
    lessRated: number;
    target: number;
    moreFive: number;
    moreRated: number;
    /** P(F ≥ T) — same as the success-curve headline. */
    pTarget: number;
};

export function outcomeDistribution(sys: GachaSystem, start: PullState, pulls: number): Outcome {
    const T = Math.max(1, Math.floor(start.copiesNeeded));
    const P = Math.max(1, Math.ceil(sys.hardPity));
    const w = clamp01(sys.featuredChance);
    const Fc = T + 1;   // F in 0..T+1 (T+1 = "more than target")
    const Oc = T;       // O in 0..T   (T = "≥ T off-banner")
    const k = Math.max(0, Math.floor(pulls));

    // dist[F][O][g][pity]
    const idx = (F: number, O: number, g: number, n: number) => ((F * (Oc + 1) + O) * 2 + g) * P + n;
    const size = (Fc + 1) * (Oc + 1) * 2 * P;
    let dist = new Float64Array(size);
    let next = new Float64Array(size);
    dist[idx(0, 0, start.guaranteed ? 1 : 0, clampInt(start.pity, 0, P - 1))] = 1;

    const rate = new Float64Array(P);
    for (let n = 0; n < P; n++) rate[n] = rarityChance(sys, n + 1);

    for (let step = 0; step < k; step++) {
        next.fill(0);
        for (let F = 0; F <= Fc; F++) {
            for (let O = 0; O <= Oc; O++) {
                for (let g = 0; g < 2; g++) {
                    for (let n = 0; n < P; n++) {
                        const m = dist[idx(F, O, g, n)];
                        if (m === 0) continue;
                        const r = rate[n];
                        if (r < 1) next[idx(F, O, g, n + 1)] += m * (1 - r);
                        const hit = m * r;
                        const Fup = Math.min(F + 1, Fc);
                        const Oup = Math.min(O + 1, Oc);
                        if (g === 1) next[idx(Fup, O, 0, 0)] += hit;
                        else {
                            next[idx(Fup, O, 0, 0)] += hit * w;
                            next[idx(F, Oup, 1, 0)] += hit * (1 - w);
                        }
                    }
                }
            }
        }
        const tmp = dist; dist = next; next = tmp;
    }

    const out: Outcome = {lessFive: 0, lessRated: 0, target: 0, moreFive: 0, moreRated: 0, pTarget: 0};
    for (let F = 0; F <= Fc; F++) {
        for (let O = 0; O <= Oc; O++) {
            let mass = 0;
            for (let g = 0; g < 2; g++) for (let n = 0; n < P; n++) mass += dist[idx(F, O, g, n)];
            if (mass === 0) continue;
            const S = F + O;
            if (F > T) out.moreRated += mass;
            else if (S < T) out.lessFive += mass;
            else if (F < T) out.lessRated += mass;
            else if (O === 0) out.target += mass;   // F === T
            else out.moreFive += mass;
        }
    }
    out.pTarget = out.target + out.moreFive + out.moreRated;
    return out;
}

// ----------------------------- Saving maths (check-ins → rate) -----------------------------

export type CheckIn = {
    date: string;      // YYYY-MM-DD
    ticket: number;    // banner tickets on hand
    currency: number;  // premium currency on hand
};

/**
 * Pulls a check-in represents. Tickets and currency are interchangeable (you
 * can convert any time), so they just sum — as a float, since a partial stack
 * of currency is a real fraction of a pull you're saving toward.
 */
export function availablePulls(ci: CheckIn, game: Game): number {
    return Math.max(0, ci.ticket) + Math.max(0, ci.currency) / game.currencyPerPull;
}

export type Regression = {slope: number; intercept: number} | null;

/** Least-squares fit of y over x. Returns null if fewer than two distinct x. */
export function linreg(pts: Array<{x: number; y: number}>): Regression {
    const n = pts.length;
    if (n < 2) return null;
    let sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (const p of pts) { sx += p.x; sy += p.y; sxx += p.x * p.x; sxy += p.x * p.y; }
    const d = n * sxx - sx * sx;
    if (d === 0) return null;
    const slope = (n * sxy - sx * sy) / d;
    return {slope, intercept: (sy - slope * sx) / n};
}

// ----------------------------- Dates -----------------------------

export function dayKey(d: Date = new Date()): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

const DAY_MS = 86_400_000;

export function parseDay(key: string): number {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d).getTime();
}

/** Whole days between two day keys (b − a). */
export function dayDiff(a: string, b: string): number {
    return Math.round((parseDay(b) - parseDay(a)) / DAY_MS);
}

export function daysUntil(deadlineKey: string, today = dayKey()): number {
    return dayDiff(today, deadlineKey);
}

// ----------------------------- helpers -----------------------------

function clamp01(x: number): number { return x < 0 ? 0 : x > 1 ? 1 : x; }
function clampInt(x: number, lo: number, hi: number): number {
    x = Math.round(x);
    return x < lo ? lo : x > hi ? hi : x;
}
