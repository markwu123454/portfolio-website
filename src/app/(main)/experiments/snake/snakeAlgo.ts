// ── Snake algorithm core ──
// Pure, DOM-free logic shared by the page (rendering + light run loop) and the
// Web Worker (continuous cycle bank + re-homing planner). No React imports here.

// ── Int-encoded cell helpers ──
// A cell (r, c) is stored as the single integer r * cols + c.
export function toInt(r: number, c: number, cols: number): number {
    return r * cols + c;
}
export function intR(v: number, cols: number): number {
    return (v / cols) | 0;
}
export function intC(v: number, cols: number): number {
    return v % cols;
}
export function intAdj(a: number, b: number, cols: number): boolean {
    const dr = intR(a, cols) - intR(b, cols);
    const dc = intC(a, cols) - intC(b, cols);
    return (dr === 0 && (dc === 1 || dc === -1)) || (dc === 0 && (dr === 1 || dr === -1));
}


export function generateHamiltonianBasic(rows: number, cols: number): number[] {
    const path: number[] = [];

    if (cols % 2 === 0) {
        for (let c = 0; c < cols; c++) {
            if (c % 2 === 0) {
                for (let r = 1; r < rows; r++) path.push(toInt(r, c, cols));
            } else {
                for (let r = rows - 1; r >= 1; r--) path.push(toInt(r, c, cols));
            }
        }
        for (let c = cols - 1; c >= 0; c--) path.push(toInt(0, c, cols));
    } else {
        for (let r = 0; r < rows; r++) {
            if (r % 2 === 0) {
                for (let c = 1; c < cols; c++) path.push(toInt(r, c, cols));
            } else {
                for (let c = cols - 1; c >= 1; c--) path.push(toInt(r, c, cols));
            }
        }
        for (let r = rows - 1; r >= 0; r--) path.push(toInt(r, 0, cols));
    }

    return path;
}


// Random full-grid Hamiltonian cycle. With a trivial 1-cell placeholder snake
// this produces a snake-agnostic cycle (it depends only on the grid), which is
// what the worker banks. The `snake` suffix + `apple` params are kept for the
// generator's forward-biting machinery; `apple` itself is unused.
export function generateHamiltonian(
    rows: number,
    cols: number,
    snake: number[],
    apple: number,
    seed?: number,
): number[] {
    const total = rows * cols
    if (rows < 2 || cols < 2) throw new Error("Need rows, cols >= 2 for a cycle.")
    if ((rows % 2 === 1) && (cols % 2 === 1)) {
        throw new Error("No Hamiltonian cycle exists on an odd*odd grid.")
    }
    if (snake.length < 1) throw new Error("snake must have at least one cell.")

    // Direction offsets as flat int deltas
    const dirs = [cols, -cols, 1, -1] as const  // down, up, right, left

    const inBounds = (v: number, d: number): boolean => {
        const r = (v / cols) | 0;
        const c = v % cols;
        if (d === cols) return r + 1 < rows;
        if (d === -cols) return r - 1 >= 0;
        if (d === 1) return c + 1 < cols;
        /* d === -1 */ return c - 1 >= 0;
    }

    // --- Seedable RNG (xorshift32) ---
    let state = (seed ?? ((Math.random() * 0xffffffff) >>> 0)) >>> 0
    const rnd = () => {
        state ^= state << 13
        state ^= state >>> 17
        state ^= state << 5
        return (state >>> 0) / 0xffffffff
    }
    const randInt = (n: number) => Math.floor(rnd() * n)

    // Validate snake
    {
        const seen = new Set<number>()
        for (let i = 0; i < snake.length; i++) {
            const v = snake[i]
            if (v < 0 || v >= total) throw new Error("Snake cell out of bounds.")
            if (seen.has(v)) throw new Error("Snake contains duplicates.")
            seen.add(v)
            if (i > 0 && !intAdj(snake[i - 1], snake[i], cols)) {
                throw new Error("Snake must be 4-neighbor adjacent along its length.")
            }
        }
    }

    const snakeTailNeck = snake.length > 1 ? snake[snake.length - 2] : -1

    // -- Forward-only biting --
    // Snake is a fixed SUFFIX. Head arm grows leftward.
    //
    //   [... head arm ...] [snake[0] snake[1] ... snake[L-1]]
    //    lo                 snakeStart                        hi-1

    const MAX_RESTARTS = 200
    for (let restart = 0; restart < MAX_RESTARTS; restart++) {
        const cap = total * 2
        const path = new Int32Array(cap)
        const pos = new Int32Array(total).fill(-1)

        const snakeStart = (cap / 2) | 0
        let lo = snakeStart

        for (let i = 0; i < snake.length; i++) {
            path[snakeStart + i] = snake[i]
            pos[snake[i]] = snakeStart + i
        }

        const hi = snakeStart + snake.length
        const n = () => hi - lo

        function reverseSegment(i1: number, i2: number) {
            while (i1 < i2) {
                const tmp = path[i1]
                path[i1] = path[i2]
                path[i2] = tmp
                pos[path[i1]] = i1
                pos[path[i2]] = i2
                i1++
                i2--
            }
        }

        function forwardBiteOnce(): void {
            const headEnd = path[lo]
            const d = dirs[randInt(4)]
            if (!inBounds(headEnd, d)) return
            const neigh = headEnd + d

            const j = pos[neigh]
            if (j === -1) {
                lo--
                path[lo] = neigh
                pos[neigh] = lo
                return
            }

            if (j - 1 >= snakeStart) return
            if (j === lo + 1) return

            reverseSegment(lo, j - 1)
        }

        const q = 1.0
        const attemptsPerPhase = Math.max(
            200,
            Math.floor(q * 10 * total * Math.log(2 + total) * Math.log(2 + total)),
        )

        let growthBudget = attemptsPerPhase
        while (n() < total && growthBudget-- > 0) forwardBiteOnce()
        if (n() < total) continue

        for (let i = 0; i < attemptsPerPhase; i++) forwardBiteOnce()

        const closeBudget = attemptsPerPhase * 2
        let closed = false
        for (let i = 0; i < closeBudget; i++) {
            const headEnd = path[lo]
            const tailEnd = path[hi - 1]
            if (
                intAdj(headEnd, tailEnd, cols) &&
                (snakeTailNeck === -1 || !intAdj(headEnd, snakeTailNeck, cols))
            ) {
                closed = true
                break
            }
            forwardBiteOnce()
        }
        if (!closed) continue

        const result: number[] = new Array(hi - lo)
        for (let i = lo; i < hi; i++) result[i - lo] = path[i]
        return result
    }

    return []
}


// Rotate a cycle so the snake's head is first, oriented so following it forward
// moves away from the neck (never a reverse into the body).
export function normalizeHamiltonian(
    path: number[],
    snake: number[],
    cols: number,
    posMap?: Int32Array
): number[] {
    const head = snake[0]
    const neck = snake.length > 1 ? snake[1] : -1

    const idx = posMap
        ? posMap[head]
        : path.indexOf(head)
    if (idx === -1) return path

    let rotated = [
        ...path.slice(idx),
        ...path.slice(0, idx),
    ]

    if (neck !== -1 && rotated[1] === neck) {
        rotated = [
            rotated[0],
            ...rotated.slice(1).reverse(),
        ]
    }

    return rotated
}


export function buildNextMap(path: number[], cols: number): Int32Array {
    const total = path.length;
    const map = new Int32Array(total).fill(-1);
    for (let i = 0; i < total; i++) {
        map[path[i]] = path[(i + 1) % total];
    }
    return map;
}

/** Build position lookup: posMap[v] = index in path. Unvisited = -1. */
export function buildPosMap(path: number[]): Int32Array {
    const total = path.length;
    const map = new Int32Array(total).fill(-1);
    for (let i = 0; i < total; i++) {
        map[path[i]] = i;
    }
    return map;
}


export function randomFreeCell(
    rows: number,
    cols: number,
    occupied: Set<number>
): number {
    while (true) {
        const v = Math.floor(Math.random() * rows * cols);
        if (!occupied.has(v)) return v;
    }
}


// Walk a cycle forward from the head to the apple. Used to render the route the
// snake takes when it is simply following its current cycle (Phase A).
export function pathFromHeadToApple(
    path: number[],
    snake: number[],
    apple: number,
    cols: number,
    posMap?: Int32Array
): number[] {
    if (path.length === 0) return [];

    const head = snake[0];
    const headIndex = posMap ? posMap[head] : path.indexOf(head);
    const appleIndex = posMap ? posMap[apple] : path.indexOf(apple);

    if (headIndex === -1 || appleIndex === -1) return [];

    const result: number[] = [];
    let i = headIndex;

    while (true) {
        result.push(path[i]);
        if (i === appleIndex) break;
        i = (i + 1) % path.length;

        if (result.length > path.length) break;
    }

    return result;
}


// Is the snake a contiguous arc of the cycle (in either direction)? True exactly
// when the snake is "on" that cycle, so following it keeps every move on a
// Hamiltonian cycle — the invariant that makes the game impossible to lose.
export function isSubArc(cycle: number[], snake: number[], posMap?: Int32Array): boolean {
    const N = cycle.length;
    if (snake.length === 0 || snake.length > N) return false;
    const pm = posMap ?? buildPosMap(cycle);
    const headIdx = pm[snake[0]];
    if (headIdx === -1) return false;

    let fwd = true;
    let bwd = true;
    for (let i = 0; i < snake.length; i++) {
        if (cycle[(headIdx + i) % N] !== snake[i]) fwd = false;
        if (cycle[((headIdx - i) % N + N) % N] !== snake[i]) bwd = false;
        if (!fwd && !bwd) return false;
    }
    return fwd || bwd;
}


// ── Temporal (tail-aware) transition pathfinding ──
// BFS from the head to a target cell that respects the snake's own body vacating
// as it moves. While the snake is NOT eating, body cell snake[i] (head = index
// 0) frees up after S - i moves, so a cell is enterable at BFS depth d when it
// is off-body or already vacated (freeAt <= d). Reserved settle-arc cells are
// hard-blocked — you can't walk the arc to get onto the arc. Conservative: it
// may miss paths that would need a detour to burn time, which only costs
// optimality — every path it returns is re-checked exactly by simulateSafe.
export function temporalTransitionBFS(
    head: number,
    target: number,
    snake: number[],
    rows: number,
    cols: number,
    blocked: Uint8Array,
): number[] | null {
    const total = rows * cols;
    const S = snake.length;
    const freeAt = new Int32Array(total);            // 0 = off-body, free from the start
    for (let i = 0; i < S; i++) freeAt[snake[i]] = S - i;

    const prev = new Int32Array(total).fill(-1);
    const depth = new Int32Array(total).fill(-1);
    depth[head] = 0;
    const queue: number[] = [head];
    let qi = 0;

    while (qi < queue.length) {
        const cur = queue[qi++];
        if (cur === target) break;
        const d = depth[cur] + 1;
        const cr = (cur / cols) | 0;
        const cc = cur % cols;
        let n: number;
        if (cc + 1 < cols) { n = cur + 1;    if (depth[n] === -1 && (n === target || blocked[n] === 0) && freeAt[n] <= d) { depth[n] = d; prev[n] = cur; queue.push(n); } }
        if (cc - 1 >= 0)   { n = cur - 1;    if (depth[n] === -1 && (n === target || blocked[n] === 0) && freeAt[n] <= d) { depth[n] = d; prev[n] = cur; queue.push(n); } }
        if (cr + 1 < rows) { n = cur + cols; if (depth[n] === -1 && (n === target || blocked[n] === 0) && freeAt[n] <= d) { depth[n] = d; prev[n] = cur; queue.push(n); } }
        if (cr - 1 >= 0)   { n = cur - cols; if (depth[n] === -1 && (n === target || blocked[n] === 0) && freeAt[n] <= d) { depth[n] = d; prev[n] = cur; queue.push(n); } }
    }

    if (depth[target] === -1) return null;
    const path: number[] = [];
    for (let c = target; c !== -1; c = prev[c]) path.push(c);
    path.reverse();
    return path;
}


// Exact safety check for a planned head→apple path. Simulate the snake walking
// it cell by cell — the tail retracts on every non-eating step, the final step
// onto the apple grows it — and reject any self-collision or stray early apple.
// A path is safe to execute iff this returns true. O(path length).
export function simulateSafe(
    snake: number[],
    apple: number,
    path: number[],
    cols: number,
): boolean {
    if (path.length < 2 || path[0] !== snake[0]) return false;
    const body = snake.slice();                      // head-first
    const occ = new Set(body);
    for (let i = 1; i < path.length; i++) {
        const cell = path[i];
        if (!intAdj(path[i - 1], cell, cols)) return false;
        const isLast = i === path.length - 1;
        if (cell === apple && !isLast) return false; // the apple may only sit at the very end
        if (!isLast) {                               // non-eating move: the tail frees a cell
            occ.delete(body[body.length - 1]);
            body.pop();
        }
        if (occ.has(cell)) return false;             // would collide with the body
        occ.add(cell);
        body.unshift(cell);
    }
    return path[path.length - 1] === apple;
}


// A cached Hamiltonian cycle in the worker's bank: the cell sequence plus its
// position lookup. Cycles are snake-agnostic (grid-only), so they stay valid for
// every state and can be reused across steps and apples.
export type BankEntry = { cycle: number[]; pos: Int32Array };

// One re-homing plan: the full head→apple path to walk, and the Hamiltonian
// cycle the snake becomes a contiguous sub-arc of the instant it eats — which is
// what keeps the win guaranteed no matter where the next apple lands.
export type ReHomePlan = { path: number[]; cycle: number[] };

// Search the bank for the fastest SAFE re-homing plan that reaches the apple in
// fewer than `maxSteps` moves (the incumbent to beat — normally the cost of just
// following the current cycle). For each cycle we try both travel directions:
// the settle arc is the S cells ending at the apple; its far end is the entry
// the head must reach. Returns null when nothing beats `maxSteps`.
export function planReHome(
    snake: number[],
    apple: number,
    rows: number,
    cols: number,
    bank: BankEntry[],
    maxSteps: number,
): ReHomePlan | null {
    const N = rows * cols;
    const S = snake.length;
    const head = snake[0];
    let best: ReHomePlan | null = null;
    let bestSteps = maxSteps;

    for (const { cycle, pos } of bank) {
        const ai = pos[apple];
        if (ai === -1) continue;
        for (const dir of [1, -1] as const) {
            const entryIdx = ((ai - dir * S) % N + N) % N;
            const entry = cycle[entryIdx];

            // Settle arc: the S cells from just past the entry up to the apple.
            // Reserve them so the transition can't walk through the arc it will
            // later trace.
            const settle: number[] = [];
            const blocked = new Uint8Array(N);
            let idx = entryIdx;
            for (let s = 0; s < S; s++) {
                idx = ((idx + dir) % N + N) % N;
                const cell = cycle[idx];
                settle.push(cell);
                blocked[cell] = 1;
            }

            const trans = temporalTransitionBFS(head, entry, snake, rows, cols, blocked);
            if (!trans) continue;

            const path = trans.concat(settle);       // head … entry, entry+dir … apple
            const steps = path.length - 1;
            if (steps >= bestSteps) continue;
            if (!simulateSafe(snake, apple, path, cols)) continue;

            best = { path, cycle };
            bestSteps = steps;
        }
    }
    return best;
}


export function sliderToSteps(slider: number) {
    if (slider >= 100) return Infinity;
    const min = 1;
    const max = 30;
    const gamma = 0.6;
    const t = Math.pow(slider / 100, gamma);
    return Math.round(min * Math.pow(max / min, t));
}


export function digitsOnly(value: string) {
    return value.replace(/\D+/g, "");
}

function snapEven(n: number) {
    if (n <= 2) return 2;
    return n % 2 === 0 ? n : n - 1;
}

export function enforceGridRules(
    r: number,
    c: number,
    changed: "rows" | "cols"
) {
    if (r % 2 === 0 || c % 2 === 0) {
        return { rows: r, cols: c };
    }
    if (changed === "rows") {
        return { rows: snapEven(r), cols: c };
    } else {
        return { rows: r, cols: snapEven(c) };
    }
}


// ── Worker message protocol ──
// UI → worker: the live state plus the cycle the UI is currently following (the
// Phase-A baseline the worker must beat). Sent every step and on reset.
export type StateMsg = {
    type: "state";
    generation: number;
    // Monotonic per-state token, bumped on every step and reset. A plan is only
    // safe to adopt for the exact state it was computed against, so the worker
    // echoes it back and the UI drops any plan whose serial has been superseded.
    serial: number;
    rows: number;
    cols: number;
    snake: number[];
    apple: number;
    cycle: number[];
};

// worker → UI: a re-homing plan that reaches the apple faster than following the
// current cycle. The UI adopts it only if the serial and head still match and it
// re-passes simulateSafe; otherwise it just keeps following its current cycle.
export type PlanMsg = {
    type: "plan";
    generation: number;
    serial: number;
    path: number[];
    cycle: number[];
};

// worker → UI: lightweight progress — how many cycles are banked so far.
export type StatsMsg = {
    type: "stats";
    generation: number;
    generated: number;
};

// UI → worker: ask the worker to start solving, in advance, the re-homing
// problem for a FUTURE state — the body + apple the snake will have the instant
// it finishes eating the apple it's walking toward right now. That future state
// is fully deterministic (Phase-A follows a fixed cycle to a fixed apple; a
// committed re-homing plan always finishes on a fixed settle arc), so it can be
// requested the moment it becomes known, giving the worker the entire remaining
// approach as lead time — the real plan is ready the instant the eat actually
// happens instead of needing a post-eat round trip. `token` identifies this
// specific speculative request; superseded the moment the future it predicts
// changes (a plan gets adopted, or the live apple changes).
export type PreplanStateMsg = {
    type: "preplanState";
    generation: number;
    token: number;
    rows: number;
    cols: number;
    snake: number[];
    apple: number;
    cycle: number[];
};

// worker → UI: the speculative plan solved for a PreplanStateMsg's future state.
export type PreplanMsg = {
    type: "preplan";
    generation: number;
    token: number;
    path: number[];
    cycle: number[];
};


// How many random cycles to keep on hand. They never go stale (grid-only), so
// once the bank is full the worker stops generating and just re-plans. More
// cycles = more re-homing options (though each plan pass scans them all).
const BANK_CAP = 256;

// The worker's engine. It banks snake-agnostic Hamiltonian cycles and, for the
// latest reported state, searches that bank for the fastest safe re-homing plan
// that beats simply following the UI's current cycle. Generation never blocks
// movement — the UI always has its current cycle to fall back on — so a slow
// generator costs only speed, never the guarantee.
export class SnakePlanner {
    rows = 0;
    cols = 0;
    snake: number[] = [];
    apple = -1;
    generation = -1;
    serial = -1;
    generated = 0;

    private bank: BankEntry[] = [];
    private maxSteps = Infinity;         // Phase-A cost to beat (current-cycle arc length)
    private plan: ReHomePlan | null = null;
    private planSteps = Infinity;
    private ready = false;

    // Speculative re-homing search for a future (not-yet-real) state, run
    // alongside the live search above against the same bank.
    private preplanToken = -1;
    private preplanSnake: number[] = [];
    private preplanApple = -1;
    private preplanMaxSteps = Infinity;
    private preplanPlan: ReHomePlan | null = null;
    private preplanSteps = Infinity;
    private preplanReady = false;

    setState(msg: StateMsg): void {
        const sizeChanged = msg.rows !== this.rows || msg.cols !== this.cols;
        this.rows = msg.rows;
        this.cols = msg.cols;
        this.snake = msg.snake;
        this.apple = msg.apple;
        this.generation = msg.generation;
        this.serial = msg.serial;

        if (sizeChanged) { this.bank = []; this.generated = 0; }

        // Phase-A baseline: steps to reach the apple by just following the cycle
        // the UI holds. Any plan we post has to be shorter than this.
        const N = this.rows * this.cols;
        const pos = buildPosMap(msg.cycle);
        const hi = pos[this.snake[0]];
        const ai = pos[this.apple];
        this.maxSteps = (hi === -1 || ai === -1) ? Infinity : ((ai - hi) % N + N) % N;

        // New state ⇒ the previous plan no longer applies.
        this.plan = null;
        this.planSteps = Infinity;
        this.ready = true;
    }

    // Register a speculative future state to solve for. Ignored if it's already
    // stale by the time it arrives (a reset bumped the generation past it).
    setPreplanState(msg: PreplanStateMsg): void {
        if (msg.generation !== this.generation) return;
        this.preplanToken = msg.token;
        this.preplanSnake = msg.snake;
        this.preplanApple = msg.apple;

        const N = this.rows * this.cols;
        const pos = buildPosMap(msg.cycle);
        const hi = pos[this.preplanSnake[0]];
        const ai = pos[this.preplanApple];
        this.preplanMaxSteps = (hi === -1 || ai === -1) ? Infinity : ((ai - hi) % N + N) % N;

        this.preplanPlan = null;
        this.preplanSteps = Infinity;
        this.preplanReady = true;
    }

    private enrich(): void {
        try {
            const raw = generateHamiltonian(this.rows, this.cols, [0], this.apple);
            if (raw.length === 0) return;
            this.bank.push({ cycle: raw, pos: buildPosMap(raw) });
            if (this.bank.length > BANK_CAP) this.bank.shift();
            this.generated++;
        } catch {
            // discard a failed generation attempt
        }
    }

    // Bank a couple of cycles (until the bank is full) and re-plan for the
    // current state plus the speculative future state, if any; returns whether
    // either search found a strictly better plan.
    step(): boolean {
        if (!this.ready) return false;
        if (this.bank.length < BANK_CAP) { this.enrich(); this.enrich(); }

        let improved = false;

        const found = planReHome(
            this.snake, this.apple, this.rows, this.cols, this.bank,
            Math.min(this.planSteps, this.maxSteps),
        );
        if (found) {
            this.plan = found;
            this.planSteps = found.path.length - 1;
            improved = true;
        }

        if (this.preplanReady) {
            const preFound = planReHome(
                this.preplanSnake, this.preplanApple, this.rows, this.cols, this.bank,
                Math.min(this.preplanSteps, this.preplanMaxSteps),
            );
            if (preFound) {
                this.preplanPlan = preFound;
                this.preplanSteps = preFound.path.length - 1;
                improved = true;
            }
        }

        return improved;
    }

    getPlan(): PlanMsg | null {
        if (!this.plan) return null;
        return {
            type: "plan",
            generation: this.generation,
            serial: this.serial,
            path: this.plan.path,
            cycle: this.plan.cycle,
        };
    }

    getPreplan(): PreplanMsg | null {
        if (!this.preplanPlan) return null;
        return {
            type: "preplan",
            generation: this.generation,
            token: this.preplanToken,
            path: this.preplanPlan.path,
            cycle: this.preplanPlan.cycle,
        };
    }

    get bankFull(): boolean {
        return this.bank.length >= BANK_CAP;
    }
}
