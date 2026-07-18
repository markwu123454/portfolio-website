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
 * The rate curve covers the common shape: a flat base rate that ramps at soft
 * pity to a guaranteed hard pity, with a "rate-up" 50/50 on the top rarity. The
 * featured-guarantee itself is pluggable (see FeaturedGuard) so both the
 * Genshin/HSR/ZZZ carryover model (lose the 50/50 → next is guaranteed) and the
 * Arknights: Endfield model (a cumulative-pull pity that forces the featured
 * item every 120 pulls) run through the same engine.
 */

// ----------------------------- Types -----------------------------

export type GachaSystem = {
    baseRate: number;    // per-pull top-rarity chance before soft pity
    softPity: number;    // 1-based pull where the rate starts climbing
    hardPity: number;    // 1-based pull that guarantees the top rarity
    rampStep: number;    // rate added per pull at/after soft pity
    featuredChance: number; // chance a top-rarity pull is the rate-up item (the 50/50)
};

/**
 * The featured-guarantee mechanic — the part that differs most between games.
 *
 *   • "carryover" (Genshin/HSR/ZZZ): losing the 50/50 sets a flag so the NEXT
 *     top-rarity pull is guaranteed featured. Two guard states (flag on/off).
 *   • "pullPity" (Arknights: Endfield): no carryover flag — every top-rarity
 *     pull is a fresh 50/50 — but a cumulative pull counter forces the featured
 *     item once you reach a fixed number of pulls on the banner (120), regardless
 *     of pity. Off-banner pulls still count; a featured win resets the counter.
 *
 * Both collapse to one per-pull transition through this interface, so the
 * probability engine below stays single-path.
 */
export type FeaturedGuard = {
    size: number;                         // number of guard states (fg ∈ 0..size-1)
    startFrom: (s: PullState) => number;  // initial guard state from a PullState
    forced: (fg: number) => boolean;      // this pull is featured regardless of rate/pity
    onMiss: (fg: number) => number;       // guard after a non-top-rarity pull
    onOff: (fg: number) => number;        // guard after an off-banner top-rarity pull
    wonChance: (fg: number) => number;    // P(featured | natural top-rarity); ignored if forced
    // A featured result (forced or won) always resets the guard to 0.
};

/** Losing the 50/50 guarantees the next top-rarity is featured (ZZZ/Genshin). */
function carryoverGuard(featuredChance: number): FeaturedGuard {
    return {
        size: 2,
        startFrom: (s) => (s.guaranteed ? 1 : 0),
        forced: () => false,
        onMiss: (fg) => fg,                       // guarantee persists across misses
        onOff: () => 1,                           // lost the 50/50 → next is guaranteed
        wonChance: (fg) => (fg === 1 ? 1 : featuredChance),
    };
}

/** A cumulative pull counter forces the featured item every `pulls` pulls (Endfield). */
function pullPityGuard(pulls: number, featuredChance: number): FeaturedGuard {
    const last = pulls - 1;
    return {
        size: pulls,
        startFrom: (s) => clampInt(s.bannerPulls ?? 0, 0, last),
        forced: (fg) => fg >= last,               // the `pulls`-th pull since the last featured
        onMiss: (fg) => Math.min(fg + 1, last),
        onOff: (fg) => Math.min(fg + 1, last),    // off-banner pulls still count toward it
        wonChance: () => featuredChance,          // always a fresh 50/50
    };
}

/**
 * One thing you can spend on this banner. Everything converts to pulls at its
 * own rate and the rates simply add up, so a banner can mix a 1:1 ticket, a
 * mid-tier currency (160 Polychrome / 500 Oroberyl a pull), and a premium
 * currency a few of which make one pull.
 */
export type PullResource = {
    id: string;       // stable key, also used in CheckIn.amounts
    name: string;     // display label (e.g. "Polychrome")
    perPull: number;  // units of this resource that equal one pull (a ticket is 1)
};

/**
 * A one-time bundle of free rolls handed out at a banner-pull milestone — e.g.
 * Endfield's "Urgent Recruitment", a free 10-pull unlocked at 30 pulls on the
 * limited banner. Crucially these rolls do NOT touch pity or the featured
 * guarantee: each is an independent shot at the flat base rate with its own
 * 50/50, and copies won don't advance/reset the spark. Modelled as a separate
 * burst injected when the player's banner-pull count crosses `at`.
 */
export type FreePull = {
    at: number;     // cumulative banner pulls that unlock the free rolls
    count: number;  // number of free rolls granted
};

export type Game = {
    id: string;
    label: string;       // shown in the dropdown
    kind: string;        // "Agent" / "Operator"
    system: GachaSystem;
    guard: FeaturedGuard;                  // featured-guarantee mechanic (see above)
    guardKind: "carryover" | "pullPity";   // which featured-state input the UI shows
    rarityStar: string;                    // display term for the top rarity ("5★" / "6★")
    resources: PullResource[];             // everything spendable on the banner, in display order
    freePull?: FreePull;                   // one-time milestone free rolls (Endfield Urgent Recruitment)
    expectedRate: number;   // modelled F2P pulls/day for the "expected" baseline
    refundFactor: number;   // lower-rarity refunds stretch each raw pull (1 = none)
};

export type PullState = {
    pity: number;
    guaranteed: boolean;    // carryover games: did you lose your last 50/50?
    bannerPulls?: number;   // pullPity games: pulls already done on this banner
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
        guard: carryoverGuard(0.5),
        guardKind: "carryover",
        rarityStar: "5★",
        resources: [
            {id: "ticket", name: "Encrypted Master Tape", perPull: 1},
            {id: "polychrome", name: "Polychrome", perPull: 160},
        ],
        expectedRate: 2.2,
        refundFactor: 1.15848,
    },
    {
        id: "zzz-weapon",
        label: "Zenless Zone Zero · W-Engine",
        kind: "W-Engine",
        system: {baseRate: 0.01, softPity: 65, hardPity: 80, rampStep: ramp(0.01, 65, 80), featuredChance: 0.75},
        guard: carryoverGuard(0.75),
        guardKind: "carryover",
        rarityStar: "5★",
        resources: [
            {id: "ticket", name: "Boopon", perPull: 1},
            {id: "polychrome", name: "Polychrome", perPull: 160},
        ],
        expectedRate: 2.2,
        refundFactor: 1.15848,
    },
    {
        // Arknights: Endfield — limited Operator banner.
        //   6★ base 0.8%, soft pity 65 (+5%/pull), hard pity 80, 50/50 rate-up.
        //   No 50/50 carryover; instead the 120th pull on the banner is a
        //   guaranteed featured 6★ (a cumulative-pull pity — off-banner 6★ still
        //   count, a featured win resets it).
        //   Four things pull on the limited (Chartered) banner: a banner-exclusive
        //   Limited Permit and a general Chartered Permit (both 1 pull each), 500
        //   Oroberyl, or Origeometry at 75 Oroberyl apiece (500/75 ≈ 6.667 a pull).
        //   Note: expectedRate/refundFactor are rough placeholders — the game is
        //   new and reliable F2P-income and dupe-refund figures aren't settled.
        id: "endfield-operator",
        label: "Arknights: Endfield · Operator",
        kind: "Operator",
        system: {baseRate: 0.008, softPity: 65, hardPity: 80, rampStep: ramp(0.008, 65, 80), featuredChance: 0.5},
        guard: pullPityGuard(120, 0.5),
        guardKind: "pullPity",
        rarityStar: "6★",
        resources: [
            {id: "limitedPermit", name: "Limited HH Permit", perPull: 1},
            {id: "charteredPermit", name: "Chartered HH Permit", perPull: 1},
            {id: "oroberyl", name: "Oroberyl", perPull: 500},
            {id: "origeometry", name: "Origeometry", perPull: 500 / 75},
        ],
        // "Urgent Recruitment": a free 10-pull at 30 banner pulls, used on the
        // same banner, with no effect on pity or the 120 spark.
        freePull: {at: 30, count: 10},
        expectedRate: 2.0,
        refundFactor: 1,
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
export function successCurve(game: Game, start: PullState, maxPulls: number): Curve {
    const sys = game.system, guard = game.guard;
    const need = Math.max(1, Math.floor(start.copiesNeeded));
    const P = Math.max(1, Math.ceil(sys.hardPity));
    const G = Math.max(1, guard.size);

    // dist[c][fg][pity]: mass with c featured copies, guard state fg, pity index.
    const make = () =>
        Array.from({length: need + 1}, () => Array.from({length: G}, () => new Float64Array(P)));
    let dist = make();
    dist[0][clampInt(guard.startFrom(start), 0, G - 1)][clampInt(start.pity, 0, P - 1)] = 1;

    const rate = new Float64Array(P);
    for (let n = 0; n < P; n++) rate[n] = rarityChance(sys, n + 1);

    // Free-roll milestone (Endfield): own pull after which the burst fires, and
    // the per-roll chance a free roll lands the featured (a fresh, pity-free 50/50).
    const startBP = clampInt(start.bannerPulls ?? 0, 0, G - 1);
    const freeStep = game.freePull ? game.freePull.at - startBP : -1;
    const freePf = clamp01(sys.baseRate * sys.featuredChance);

    const cdf = new Array<number>(maxPulls + 1).fill(0);
    let done = 0, mean = 0;

    // Absorb + clear mass that has reached `need` featured copies; returns the mass.
    const absorbDone = (arr: Float64Array[][]): number => {
        let nd = 0;
        for (let fg = 0; fg < G; fg++) {
            const drow = arr[need][fg];
            for (let n = 0; n < drow.length; n++) { nd += drow[n]; drow[n] = 0; }
        }
        return nd;
    };

    for (let k = 1; k <= maxPulls; k++) {
        const next = make();
        for (let c = 0; c < need; c++) {
            for (let fg = 0; fg < G; fg++) {
                const row = dist[c][fg];
                for (let n = 0; n < P; n++) {
                    const m = row[n];
                    if (m === 0) continue;
                    if (guard.forced(fg)) {                        // guaranteed featured this pull
                        next[Math.min(c + 1, need)][0][0] += m;
                        continue;
                    }
                    const r = rate[n];
                    if (r < 1) next[c][guard.onMiss(fg)][n + 1] += m * (1 - r);
                    const hit = m * r;
                    const w = clamp01(guard.wonChance(fg));
                    next[Math.min(c + 1, need)][0][0] += hit * w;              // featured
                    if (w < 1) next[c][guard.onOff(fg)][0] += hit * (1 - w);   // off-banner
                }
            }
        }
        let nd = absorbDone(next);

        // Free 10-pull unlocked at this own-pull count: `count` independent
        // base-rate rolls that only advance copies — pity index and guard state
        // ride along untouched. Iterate c downward so no unit gets two hits per roll.
        if (k === freeStep && game.freePull) {
            for (let r = 0; r < game.freePull.count; r++) {
                for (let c = need - 1; c >= 0; c--) {
                    for (let fg = 0; fg < G; fg++) {
                        const row = next[c][fg], up = next[Math.min(c + 1, need)][fg];
                        for (let n = 0; n < P; n++) {
                            const m = row[n];
                            if (m === 0) continue;
                            row[n] = m * (1 - freePf);
                            up[n] += m * freePf;
                        }
                    }
                }
            }
            nd += absorbDone(next);   // copies won from free rolls count at this own-pull cost
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

export function outcomeDistribution(game: Game, start: PullState, pulls: number): Outcome {
    const sys = game.system, guard = game.guard;
    const T = Math.max(1, Math.floor(start.copiesNeeded));
    const P = Math.max(1, Math.ceil(sys.hardPity));
    const G = Math.max(1, guard.size);
    const Fc = T + 1;   // F in 0..T+1 (T+1 = "more than target")
    const Oc = T;       // O in 0..T   (T = "≥ T off-banner")
    const k = Math.max(0, Math.floor(pulls));

    // dist[F][O][fg][pity]
    const idx = (F: number, O: number, fg: number, n: number) => ((F * (Oc + 1) + O) * G + fg) * P + n;
    const size = (Fc + 1) * (Oc + 1) * G * P;
    let dist = new Float64Array(size);
    let next = new Float64Array(size);
    dist[idx(0, 0, clampInt(guard.startFrom(start), 0, G - 1), clampInt(start.pity, 0, P - 1))] = 1;

    const rate = new Float64Array(P);
    for (let n = 0; n < P; n++) rate[n] = rarityChance(sys, n + 1);

    // Free-roll milestone (Endfield): loop step after which the burst fires, and
    // the per-roll featured / off-banner / nothing split (a fresh, pity-free 50/50).
    const startBP = clampInt(start.bannerPulls ?? 0, 0, G - 1);
    const freePull = game.freePull;
    const freeAfterStep = freePull ? freePull.at - startBP - 1 : -1;
    const freePf = clamp01(sys.baseRate * sys.featuredChance);
    const freePo = clamp01(sys.baseRate * (1 - sys.featuredChance));
    const freePn = 1 - freePf - freePo;

    for (let step = 0; step < k; step++) {
        next.fill(0);
        for (let F = 0; F <= Fc; F++) {
            for (let O = 0; O <= Oc; O++) {
                for (let fg = 0; fg < G; fg++) {
                    for (let n = 0; n < P; n++) {
                        const m = dist[idx(F, O, fg, n)];
                        if (m === 0) continue;
                        const Fup = Math.min(F + 1, Fc);
                        if (guard.forced(fg)) {                     // guaranteed featured this pull
                            next[idx(Fup, O, 0, 0)] += m;
                            continue;
                        }
                        const r = rate[n];
                        if (r < 1) next[idx(F, O, guard.onMiss(fg), n + 1)] += m * (1 - r);
                        const hit = m * r;
                        const w = clamp01(guard.wonChance(fg));
                        next[idx(Fup, O, 0, 0)] += hit * w;         // featured
                        if (w < 1) {
                            const Oup = Math.min(O + 1, Oc);
                            next[idx(F, Oup, guard.onOff(fg), 0)] += hit * (1 - w);   // off-banner
                        }
                    }
                }
            }
        }
        let tmp = dist; dist = next; next = tmp;

        // Free 10-pull unlocked once banner pulls cross the milestone: `count`
        // independent base-rate rolls adding copies (featured) or off-banner 6★,
        // leaving pity index and guard state untouched.
        if (freePull && step === freeAfterStep) {
            for (let r = 0; r < freePull.count; r++) {
                next.fill(0);
                for (let F = 0; F <= Fc; F++) {
                    for (let O = 0; O <= Oc; O++) {
                        for (let fg = 0; fg < G; fg++) {
                            for (let n = 0; n < P; n++) {
                                const m = dist[idx(F, O, fg, n)];
                                if (m === 0) continue;
                                next[idx(Math.min(F + 1, Fc), O, fg, n)] += m * freePf;   // featured
                                next[idx(F, Math.min(O + 1, Oc), fg, n)] += m * freePo;   // off-banner
                                next[idx(F, O, fg, n)] += m * freePn;                     // nothing
                            }
                        }
                    }
                }
                tmp = dist; dist = next; next = tmp;
            }
        }
    }

    const out: Outcome = {lessFive: 0, lessRated: 0, target: 0, moreFive: 0, moreRated: 0, pTarget: 0};
    for (let F = 0; F <= Fc; F++) {
        for (let O = 0; O <= Oc; O++) {
            let mass = 0;
            for (let fg = 0; fg < G; fg++) for (let n = 0; n < P; n++) mass += dist[idx(F, O, fg, n)];
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
    date: string;                    // YYYY-MM-DD
    amounts: Record<string, number>; // resource id → units on hand (see Game.resources)
};

/**
 * Pulls a check-in represents. Every resource is interchangeable (you can
 * convert any time), so each one's amount ÷ its per-pull rate simply sums — as
 * a float, since a partial stack is a real fraction of a pull you're saving toward.
 */
export function availablePulls(ci: CheckIn, game: Game): number {
    let pulls = 0;
    for (const r of game.resources) pulls += Math.max(0, ci.amounts?.[r.id] ?? 0) / r.perPull;
    return pulls;
}

export type Trend = {slope: number; anchorX: number; anchorY: number} | null;

/**
 * Trend line through the modal slope of consecutive check-ins, anchored at the
 * most recent point. Using the mode (rather than a least-squares fit) means a
 * one-off topup or windfall between two check-ins — a slope wildly unlike the
 * rest — doesn't drag the whole trend with it, so long as the regular saving
 * pace shows up more than once in the window. The line starts exactly at the
 * latest check-in so the projection always agrees with "where you are now".
 */
export function modeSlopeTrend(pts: Array<{x: number; y: number}>): Trend {
    const n = pts.length;
    if (n < 2) return null;

    const slopes: number[] = [];
    for (let i = 1; i < n; i++) {
        const dx = pts[i].x - pts[i - 1].x;
        if (dx <= 0) continue;
        slopes.push((pts[i].y - pts[i - 1].y) / dx);
    }
    const last = pts[n - 1];
    if (slopes.length === 0) return null;
    if (slopes.length === 1) return {slope: slopes[0], anchorX: last.x, anchorY: last.y};

    // Continuous slopes rarely repeat exactly, so bin them before taking the
    // mode, then average the raw values within the winning bin.
    const BIN = 0.01; // pulls/day
    const bins = new Map<number, number[]>();
    for (const s of slopes) {
        const key = Math.round(s / BIN);
        const arr = bins.get(key);
        if (arr) arr.push(s); else bins.set(key, [s]);
    }
    let modal: number[] = [];
    for (const arr of bins.values()) if (arr.length > modal.length) modal = arr;
    const slope = modal.reduce((a, b) => a + b, 0) / modal.length;

    return {slope, anchorX: last.x, anchorY: last.y};
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
