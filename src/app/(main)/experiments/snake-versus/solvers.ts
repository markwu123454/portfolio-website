// Synchronous, self-contained solvers for the versus page. Each holds its own
// game (snake + apple + loop) and exposes step() to advance exactly one move.
// No workers, no timers — the page drives every move in lockstep, so the two
// algorithms and the human all advance together on each key press.

import {
    generateHamiltonianBasic,
    generateHamiltonian,
    normalizeHamiltonian,
    buildNextMap,
    buildPosMap,
    randomFreeCell,
    planReHome,
    simulateSafe,
    isSubArc,
    type BankEntry,
} from "../snake/snakeAlgo";

import {
    generateHamiltonianBasic as oldGenerateBasic,
    generateHamiltonian as oldGenerate,
    normalizeHamiltonian as oldNormalize,
    buildNextMap as oldBuildNextMap,
    buildPosMap as oldBuildPosMap,
    scoreCycle,
    appleTransparentField,
    bfsDistance,
    optimizeHamiltonianByBumps,
} from "./oldAlgo";


export interface Solver {
    readonly rows: number;
    readonly cols: number;
    snake: number[];
    apple: number;
    steps: number;
    won: boolean;
    readonly apples: number;
    step(): void;
}


// ── New algorithm: anticipatory (ahead-of-time) planner ──
// Unlike the old algo, which re-decides its whole cycle every step (so it can
// never know where the snake will be when it eats), this one COMMITS a path per
// apple. Commitment makes the eat-instant board fully deterministic, which is
// what unlocks generating ahead of time: while walking toward the current apple
// it builds a fresh bank of cycles shaped around the body it *will* have when it
// eats, rolling the oldest out. On eating, that anticipated bank becomes live
// and it picks the best path to the new apple from it — then repeats. The same
// loop runs the whole game (seed random cycles, pick best-to-apple, then
// anticipate), and the committed cycle always still contains the body after
// eating, so a lagging generator only ever costs speed, never the guarantee.
//
// When it can only follow a long arc (no shortcut — the late-game regime where
// the old algo's per-step re-planning pulls ahead), it adds one more checkpoint
// at the arc's halfway point. The halfway body is just as deterministic as the
// eat body, so it anticipates that first, re-selects there (keeping the better
// of the new best vs the cycle it's on, now that the tail has vacated space),
// then anticipates the eat body for the second half — coarse reactivity without
// giving up commitment or the transition-free switch.
const NEW_BANK = 48;         // rolling bank capacity
const GEN_PER_STEP = 3;      // cycles generated per step, amortized across the walk
const MIN_SPLIT_ARC = 8;     // only split a follow into two phases if the arc is this long

export class NewSolver implements Solver {
    rows: number;
    cols: number;
    snake: number[];
    apple: number;
    steps = 0;
    won = false;

    private cycle: number[];
    private pos: Int32Array;
    private nextMap: Int32Array;

    // `active` contains cycles that contain the CURRENT body (used to plan toward
    // the current apple); `pending` is being generated for the deterministic
    // eat-instant body and is promoted to `active` the moment the snake eats.
    private active: BankEntry[] = [];
    private pending: BankEntry[] = [];
    private futureBody: number[] = [];   // head-first body to anticipate for the next checkpoint
    private plannedApple = -1;           // apple the current commitment targets
    private exec: { path: number[]; index: number; cycle: number[] } | null = null;
    private midStep = -1;                // walk-step to re-plan at (-1 = no halfway split)
    private walkStep = 0;                // steps taken since the last (start or halfway) plan

    constructor(rows: number, cols: number, apple: number) {
        this.rows = rows;
        this.cols = cols;
        this.cycle = generateHamiltonianBasic(rows, cols);
        this.snake = [this.cycle[1], this.cycle[0]];
        this.apple = apple;
        this.pos = buildPosMap(this.cycle);
        this.nextMap = buildNextMap(this.cycle, cols);
        // Seed the live bank with cycles built around the starting body.
        for (let a = 0; a < NEW_BANK * 10 && this.active.length < NEW_BANK; a++) {
            try {
                const raw = generateHamiltonian(rows, cols, this.snake, 0);
                if (raw.length) this.active.push({ cycle: raw, pos: buildPosMap(raw) });
            } catch {
                // discard a failed generation attempt
            }
        }
    }

    get apples(): number {
        return this.snake.length - 2;
    }

    private setCycle(c: number[]): void {
        this.cycle = c;
        this.pos = buildPosMap(c);
        this.nextMap = buildNextMap(c, this.cols);
    }

    // Head-first body (apple first, length S+1) the snake will occupy the instant
    // it finishes walking `path` — its last S+1 cells reversed.
    private eatBodyFromPath(path: number[]): number[] {
        const S = this.snake.length;
        const body: number[] = [];
        for (let i = path.length - 1; i >= path.length - 1 - S; i--) body.push(path[i]);
        return body;
    }

    // `len` head-first cells of the current cycle ending at cycle index `ht` — the
    // body the snake occupies at that point along the arc. Used for both the
    // halfway body (len = S, at the midpoint index) and the eat body (len = S+1,
    // at the apple index).
    private bodyOnCycle(ht: number, len: number): number[] {
        const cyc = this.cycle;
        const N = cyc.length;
        const body: number[] = [];
        for (let i = 0; i < len; i++) body.push(cyc[((ht - i) % N + N) % N]);
        return body;
    }

    // Plan from the current head toward the apple. The apple is known, so spend
    // it: bump every banked body-cycle toward it (2×2 detour flips that shorten
    // the head→apple arc) and keep the best J = (ρ-1) + λ(φ-1) — short to the
    // apple AND not walling off space behind it. Then optionally take a faster
    // re-homing shortcut. Finally set the next checkpoint: if we can only follow a
    // long arc, anticipate the HALFWAY body and re-plan there; otherwise
    // anticipate the eat body directly. `allowMidpoint` is false on the halfway
    // re-plan itself — the second half is never split again.
    private plan(allowMidpoint: boolean): void {
        const { rows, cols } = this;
        const N = rows * cols;
        const snake = this.snake;
        const head = snake[0];
        const apple = this.apple;
        const S = snake.length;

        // Apple-specific fields, computed once for the whole candidate pool.
        const bfs = bfsDistance(head, apple, rows, cols, snake);
        const lowerBound = Number.isFinite(bfs) ? Math.max(bfs, 1) : 1;
        const { d0, totalD0 } = appleTransparentField(apple, rows, cols);
        const score = (path: number[]) =>
            scoreCycle(path, buildPosMap(path), S, apple, rows, cols, lowerBound, d0, totalD0);

        // Incumbent: the cycle we're already on, optimized toward this apple. A
        // candidate replaces it only if it scores strictly better — so the halfway
        // re-plan keeps following the current cycle unless a genuinely better one
        // turned up in the bank grown during the first half.
        let best = optimizeHamiltonianByBumps(
            normalizeHamiltonian(this.cycle, snake, cols, this.pos), snake, apple, cols);
        let bestScore = score(best);

        for (const e of this.active) {
            const norm = normalizeHamiltonian(e.cycle, snake, cols, e.pos);
            const pm = buildPosMap(norm);
            if (!isSubArc(norm, snake, pm)) continue;   // stale: body no longer fits
            const cand = optimizeHamiltonianByBumps(norm, snake, apple, cols);
            const sc = score(cand);
            if (sc < bestScore) { best = cand; bestScore = sc; }
        }
        this.setCycle(best);

        // Optional shortcut: re-home across the bank if it beats following `best`.
        const arc = ((this.pos[apple] - this.pos[head]) % N + N) % N;
        const rehome = planReHome(snake, apple, rows, cols, this.active, arc);
        this.exec = rehome && simulateSafe(snake, apple, rehome.path, cols)
            ? { path: rehome.path, index: 0, cycle: rehome.cycle }
            : null;

        this.walkStep = 0;
        if (this.exec) {
            // A committed shortcut transitions mid-walk, so it isn't cleanly
            // switchable partway — treat it as one phase, anticipate the eat body.
            this.midStep = -1;
            this.futureBody = this.eatBodyFromPath(this.exec.path);
        } else if (allowMidpoint && arc >= MIN_SPLIT_ARC) {
            this.midStep = arc >> 1;
            this.futureBody = this.bodyOnCycle(this.midStep, S);        // halfway body
        } else {
            this.midStep = -1;
            this.futureBody = this.bodyOnCycle(arc, S + 1);             // eat body
        }
        this.pending = [];
    }

    step(): void {
        if (this.won) return;
        const { rows, cols } = this;
        const total = rows * cols;
        const snake = this.snake;
        if (snake.length === total) { this.won = true; return; }

        // New apple ⇒ start-commit a path (splitting into two phases if it can
        // only follow a long arc) and re-target anticipatory generation.
        if (this.plannedApple !== this.apple) {
            this.plan(true);
            this.plannedApple = this.apple;
        }

        // Generate ahead of time for the current checkpoint's body, amortized
        // across the walk; roll nothing out until the bank is full.
        for (let k = 0; k < GEN_PER_STEP && this.pending.length < NEW_BANK; k++) {
            try {
                const raw = generateHamiltonian(rows, cols, this.futureBody, 0);
                if (raw.length) this.pending.push({ cycle: raw, pos: buildPosMap(raw) });
            } catch {
                // discard a failed generation attempt
            }
        }

        let next: number;
        if (this.exec && this.exec.path[this.exec.index + 1] !== undefined) {
            next = this.exec.path[this.exec.index + 1];
        } else {
            this.exec = null;
            next = this.nextMap[snake[0]];
        }

        if (snake.length === total - 1 && next === this.apple) {
            this.snake = [next, ...snake];
            this.won = true;
            this.steps++;
            this.exec = null;
            return;
        }

        const eats = next === this.apple;
        const nextSnake = [next, ...snake];
        if (!eats) nextSnake.pop();

        if (this.exec) {
            if (eats) { this.setCycle(normalizeHamiltonian(this.exec.cycle, nextSnake, cols)); this.exec = null; }
            else this.exec.index++;
        }

        this.walkStep++;

        // Halfway checkpoint (follow case only): the snake now equals the body we
        // anticipated, so the bank we grew for it is live — promote it and re-plan
        // toward the apple, keeping the better of {new best, current cycle} and
        // switching the anticipation target to the eat body for the second half.
        if (!eats && this.exec === null && this.midStep > 0 && this.walkStep === this.midStep) {
            if (this.pending.length) this.active = this.pending;
            this.pending = [];
            this.snake = nextSnake;
            this.plan(false);
            this.steps++;
            return;
        }

        if (eats) {
            // The anticipated future is now the present: promote the bank we grew
            // for this body. If generation couldn't keep up, keep the old bank —
            // its stale cycles are simply filtered out at the next plan.
            if (this.pending.length) this.active = this.pending;
            this.pending = [];
            this.apple = randomFreeCell(rows, cols, new Set(nextSnake));
        }
        if (nextSnake.length === total) this.won = true;
        this.snake = nextSnake;
        this.steps++;
    }
}


// ── Old algorithm: J-objective cycle search ──
// Each step, generate a batch of snake-containing cycles, score them by
// J = (ρ−1) + λ(φ−1), keep the best, and step one cell along it. Always on a
// full cycle, so it re-optimizes the whole loop for the apple every move.
const OLD_BATCH = 24;

export class OldSolver implements Solver {
    rows: number;
    cols: number;
    snake: number[];
    apple: number;
    steps = 0;
    won = false;

    private cycle: number[];

    constructor(rows: number, cols: number, apple: number) {
        this.rows = rows;
        this.cols = cols;
        this.cycle = oldGenerateBasic(rows, cols);
        this.snake = [this.cycle[1], this.cycle[0]];
        this.apple = apple;
    }

    get apples(): number {
        return this.snake.length - 2;
    }

    step(): void {
        if (this.won) return;
        const { rows, cols } = this;
        const total = rows * cols;
        const snake = this.snake;
        if (snake.length === total) { this.won = true; return; }

        const bfs = bfsDistance(snake[0], this.apple, rows, cols, snake);
        const lowerBound = Number.isFinite(bfs) ? Math.max(bfs, 1) : 1;
        const { d0, totalD0 } = appleTransparentField(this.apple, rows, cols);

        let best = oldNormalize(this.cycle, snake, cols, oldBuildPosMap(this.cycle));
        let bestScore = scoreCycle(best, oldBuildPosMap(best), snake.length, this.apple, rows, cols, lowerBound, d0, totalD0);

        for (let i = 0; i < OLD_BATCH; i++) {
            try {
                const raw = oldGenerate(rows, cols, snake, this.apple);
                if (!raw.length) continue;
                const norm = oldNormalize(raw, snake, cols, oldBuildPosMap(raw));
                const cand = optimizeHamiltonianByBumps(norm, snake, this.apple, cols);
                const sc = scoreCycle(cand, oldBuildPosMap(cand), snake.length, this.apple, rows, cols, lowerBound, d0, totalD0);
                if (sc < bestScore) { best = cand; bestScore = sc; }
            } catch {
                // discard a bad candidate
            }
        }

        this.cycle = best;
        const nextMap = oldBuildNextMap(best, cols);
        const next = nextMap[snake[0]];

        if (snake.length === total - 1 && next === this.apple) {
            this.snake = [next, ...snake];
            this.won = true;
            this.steps++;
            return;
        }

        const eats = next === this.apple;
        const nextSnake = [next, ...snake];
        if (!eats) nextSnake.pop();
        if (eats) this.apple = randomFreeCell(rows, cols, new Set(nextSnake));
        if (nextSnake.length === total) this.won = true;
        this.snake = nextSnake;
        this.steps++;
    }
}
