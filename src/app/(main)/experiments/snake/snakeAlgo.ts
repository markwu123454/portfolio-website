// ── Snake algorithm core ──
// Pure, DOM-free logic shared by the page (rendering + light run loop) and the
// Web Worker (continuous cycle search). No React imports belong in this file.

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


export function zipsToApple(
    path: number[],
    posMap: Int32Array,
    snake: number[],
    apple: number,
    cols: number
): boolean {
    const headIndex = posMap[snake[0]];
    const appleIndex = posMap[apple];

    if (headIndex === -1 || appleIndex === -1) return false;
    if (appleIndex <= headIndex) return false;

    let prev = path[headIndex];

    for (let i = headIndex + 1; i <= appleIndex; i++) {
        const cur = path[i];

        const dc = intC(cur, cols) - intC(prev, cols);
        const dr = intR(cur, cols) - intR(prev, cols);

        if (Math.abs(dc) + Math.abs(dr) !== 1) return false;

        const ac = intC(apple, cols);
        const ar = intR(apple, cols);
        if (
            Math.abs(intC(cur, cols) - ac) > Math.abs(intC(prev, cols) - ac) ||
            Math.abs(intR(cur, cols) - ar) > Math.abs(intR(prev, cols) - ar)
        ) {
            return false;
        }

        prev = cur;
    }

    return true;
}


// Weight on post-eat space (φ) vs. route length (ρ) in the combined
// objective. Tune via a headless sweep over mean steps-per-apple; 1.0 is
// the neutral starting point where a unit of each excess trades evenly.
export const LAMBDA = 1.0;

// J within this margin of its ideal (0) counts as good enough — stop the
// search and idle until the state next changes.
export const STOP_EPS = 0.05;


// Transparent reach field: BFS distance from the apple on the EMPTY grid
// (body passable). Depends only on the apple, so it is computed once per
// target and shared across candidates. Returns the field and its total.
export function appleTransparentField(
    apple: number,
    rows: number,
    cols: number
): { d0: Int32Array; totalD0: number } {
    const total = rows * cols;
    const d0 = new Int32Array(total).fill(-1);
    d0[apple] = 0;
    const queue: number[] = [apple];
    let qi = 0;
    let totalD0 = 0;
    while (qi < queue.length) {
        const cur = queue[qi++];
        const cr = (cur / cols) | 0;
        const cc = cur % cols;
        const nd = d0[cur] + 1;
        if (cc + 1 < cols) { const n = cur + 1;    if (d0[n] === -1) { d0[n] = nd; totalD0 += nd; queue.push(n); } }
        if (cc - 1 >= 0)   { const n = cur - 1;    if (d0[n] === -1) { d0[n] = nd; totalD0 += nd; queue.push(n); } }
        if (cr + 1 < rows) { const n = cur + cols; if (d0[n] === -1) { d0[n] = nd; totalD0 += nd; queue.push(n); } }
        if (cr - 1 >= 0)   { const n = cur - cols; if (d0[n] === -1) { d0[n] = nd; totalD0 += nd; queue.push(n); } }
    }
    return { d0, totalD0 };
}

// φ for one candidate cycle: opaque reach-sum / transparent reach-sum, both
// over the SAME post-eat free cells. The post-eat body is the L+1 cells
// ending at the apple along the cycle; we flood from the apple around that
// body. φ ≥ 1, equals 1 when the body forces no detour, and grows as the
// cycle walls space off behind the apple. Sealed cells cap at the grid size.
export function posteatSpaceRatio(
    path: number[],
    posMap: Int32Array,
    snakeLen: number,
    apple: number,
    rows: number,
    cols: number,
    d0: Int32Array,
    totalD0: number
): number {
    const N = path.length;
    const appleIndex = posMap[apple];
    if (appleIndex === -1) return 1;

    const total = rows * cols;
    const blocked = new Uint8Array(total);

    let arcSumD0 = 0;
    for (let i = 0; i <= snakeLen; i++) {
        const cell = path[((appleIndex - i) % N + N) % N];
        if (blocked[cell] === 0) {
            blocked[cell] = 1;
            arcSumD0 += d0[cell];
        }
    }

    const A = totalD0 - arcSumD0;
    if (A <= 0) return 1;

    const dist = new Int32Array(total).fill(-1);
    dist[apple] = 0;
    const queue: number[] = [apple];
    let qi = 0;
    while (qi < queue.length) {
        const cur = queue[qi++];
        const cr = (cur / cols) | 0;
        const cc = cur % cols;
        const nd = dist[cur] + 1;
        if (cc + 1 < cols) { const n = cur + 1;    if (dist[n] === -1 && blocked[n] === 0) { dist[n] = nd; queue.push(n); } }
        if (cc - 1 >= 0)   { const n = cur - 1;    if (dist[n] === -1 && blocked[n] === 0) { dist[n] = nd; queue.push(n); } }
        if (cr + 1 < rows) { const n = cur + cols; if (dist[n] === -1 && blocked[n] === 0) { dist[n] = nd; queue.push(n); } }
        if (cr - 1 >= 0)   { const n = cur - cols; if (dist[n] === -1 && blocked[n] === 0) { dist[n] = nd; queue.push(n); } }
    }

    let B = 0;
    for (let c = 0; c < total; c++) {
        if (blocked[c] === 1) continue;
        B += dist[c] === -1 ? total : dist[c];
    }

    return B / A;
}

// Combined objective J = (ρ - 1) + LAMBDA·(φ - 1) for one normalized cycle.
// ρ = d_H(head, apple) / d*; φ = post-eat reach overhead. J ≥ 0, 0 = perfect.
export function scoreCycle(
    path: number[],
    pm: Int32Array,
    snakeLen: number,
    apple: number,
    rows: number,
    cols: number,
    lowerBound: number,
    d0: Int32Array,
    totalD0: number
): number {
    const dH = patternDistance(path, apple, pm);
    if (!Number.isFinite(dH)) return Infinity;
    const rho = dH / lowerBound;
    const phi = posteatSpaceRatio(path, pm, snakeLen, apple, rows, cols, d0, totalD0);
    return (rho - 1) + LAMBDA * (phi - 1);
}


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

export function patternDistance(path: number[], apple: number, posMap?: Int32Array): number {
    const ai = posMap ? posMap[apple] : path.indexOf(apple);
    return ai === -1 ? Infinity : ai;
}

function is2x2Square(a: number, b: number, c: number, d: number, cols: number): boolean {
    const rs = new Set([intR(a, cols), intR(b, cols), intR(c, cols), intR(d, cols)]);
    const cs = new Set([intC(a, cols), intC(b, cols), intC(c, cols), intC(d, cols)]);
    return rs.size === 2 && cs.size === 2;
}

function extend(from: number, to: number, cols: number, rows: number): number {
    const dr = intR(to, cols) - intR(from, cols);
    const dc = intC(to, cols) - intC(from, cols);
    const nr = intR(to, cols) + dr;
    const nc = intC(to, cols) + dc;
    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return -1;
    return toInt(nr, nc, cols);
}

function spliceByRemoveInsert(
    path: number[],
    indexMap: Int32Array,
    cols: number,
    A: number,
    B: number,
    C: number,
    D: number,
    Bp: number,
    Cp: number
): number[] | null {

    const iB = indexMap[B];
    const iC = indexMap[C];
    const iBp = indexMap[Bp];
    const iCp = indexMap[Cp];

    if (iB === -1 || iC === -1 || iBp === -1 || iCp === -1) return null;

    if (Math.abs(iB - iC) !== 1) return null;
    if (Math.abs(iBp - iCp) !== 1) return null;

    const removed = path.filter((_, i) => i !== iB && i !== iC);

    const idxBp = removed.indexOf(Bp);
    const idxCp = removed.indexOf(Cp);

    if (idxBp === -1 || idxCp === -1) return null;

    const insertAt = Math.min(idxBp, idxCp) + 1;

    return [
        ...removed.slice(0, insertAt),
        C,
        B,
        ...removed.slice(insertAt),
    ];
}


export function optimizeHamiltonianByBumps(
    rawPath: number[],
    snake: number[],
    apple: number,
    cols: number
): number[] {
    if (rawPath.length === 0) return rawPath;

    const rows = (rawPath.length / cols) | 0;
    const rawPm = buildPosMap(rawPath);
    let path = normalizeHamiltonian(rawPath, snake, cols, rawPm);
    const N = path.length;

    const snakeSet = new Set<number>();
    for (let i = 1; i < snake.length; i++) {
        snakeSet.add(snake[i]);
    }

    while (true) {
        let improved = false;

        const indexMap = new Int32Array(N).fill(-1);
        for (let i = 0; i < N; i++) indexMap[path[i]] = i;

        const baseDist = patternDistance(path, apple, indexMap);

        const segment = pathFromHeadToApple(path, snake, apple, cols, indexMap);

        for (let si = 0; si + 3 < segment.length; si++) {
            const A = segment[si];
            const B = segment[si + 1];
            const C = segment[si + 2];
            const D = segment[si + 3];

            if (!is2x2Square(A, B, C, D, cols)) continue;

            const Bp = extend(A, B, cols, rows);
            const Cp = extend(D, C, cols, rows);

            if (Bp === -1 || Cp === -1) continue;

            if (snakeSet.has(Bp) || snakeSet.has(Cp)) continue;

            const newPath = spliceByRemoveInsert(
                path, indexMap, cols,
                A, B, C, D, Bp, Cp
            );

            if (!newPath) continue;

            const newPosMap = buildPosMap(newPath);
            const newDist = patternDistance(newPath, apple, newPosMap);

            if (newDist === baseDist - 2) {
                path = newPath;
                improved = true;
                break;
            }
        }

        if (!improved) break;
    }

    return path;
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


export function bfsDistance(
    from: number,
    to: number,
    rows: number,
    cols: number,
    snake: number[]
): number {
    if (from === to) return 0;

    const total = rows * cols;
    const blocked = new Uint8Array(total);
    for (let i = 1; i < snake.length; i++) {
        blocked[snake[i]] = 1;
    }

    const dist = new Int32Array(total).fill(-1);
    dist[from] = 0;

    const queue: number[] = [from];
    let qi = 0;

    while (qi < queue.length) {
        const cur = queue[qi++];
        const cr = (cur / cols) | 0;
        const cc = cur % cols;
        const nd = dist[cur] + 1;

        if (cc + 1 < cols) { const n = cur + 1;    if (dist[n] === -1 && !blocked[n]) { if (n === to) return nd; dist[n] = nd; queue.push(n); } }
        if (cc - 1 >= 0)   { const n = cur - 1;    if (dist[n] === -1 && !blocked[n]) { if (n === to) return nd; dist[n] = nd; queue.push(n); } }
        if (cr + 1 < rows) { const n = cur + cols;  if (dist[n] === -1 && !blocked[n]) { if (n === to) return nd; dist[n] = nd; queue.push(n); } }
        if (cr - 1 >= 0)   { const n = cur - cols;  if (dist[n] === -1 && !blocked[n]) { if (n === to) return nd; dist[n] = nd; queue.push(n); } }
    }

    return Infinity;
}


// ── Heatmap overlay field (decoupled from the selection algorithm) ──
// BFS from the apple over the CURRENT grid, treating the whole snake as a
// wall. Each free cell gets its distance from the apple; cells the body has
// sealed off stay -1. Purely a visualization of how the body blocks space.
export function reachabilityField(
    apple: number,
    rows: number,
    cols: number,
    snake: number[]
): { dist: Int32Array; maxDist: number } {
    const total = rows * cols;
    const blocked = new Uint8Array(total);
    for (let i = 0; i < snake.length; i++) {
        blocked[snake[i]] = 1;
    }

    const dist = new Int32Array(total).fill(-1);
    if (apple < 0 || apple >= total || blocked[apple] === 1) {
        return { dist, maxDist: 0 };
    }
    dist[apple] = 0;

    const queue: number[] = [apple];
    let qi = 0;
    let maxDist = 0;

    while (qi < queue.length) {
        const cur = queue[qi++];
        const cr = (cur / cols) | 0;
        const cc = cur % cols;
        const nd = dist[cur] + 1;

        if (cc + 1 < cols) { const n = cur + 1;    if (dist[n] === -1 && blocked[n] === 0) { dist[n] = nd; if (nd > maxDist) maxDist = nd; queue.push(n); } }
        if (cc - 1 >= 0)   { const n = cur - 1;    if (dist[n] === -1 && blocked[n] === 0) { dist[n] = nd; if (nd > maxDist) maxDist = nd; queue.push(n); } }
        if (cr + 1 < rows) { const n = cur + cols; if (dist[n] === -1 && blocked[n] === 0) { dist[n] = nd; if (nd > maxDist) maxDist = nd; queue.push(n); } }
        if (cr - 1 >= 0)   { const n = cur - cols; if (dist[n] === -1 && blocked[n] === 0) { dist[n] = nd; if (nd > maxDist) maxDist = nd; queue.push(n); } }
    }

    return { dist, maxDist };
}


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


// Is the snake a contiguous arc of the cycle (in either direction)? The UI
// only adopts a worker cycle that passes this, which is what guarantees every
// move stays on a Hamiltonian cycle containing the current snake.
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
// UI → worker: the current target + the cycle the UI holds (the incumbent to
// refine from) + an effort duty-cycle. Sent every step and on reset.
export type StateMsg = {
    type: "state";
    generation: number;
    rows: number;
    cols: number;
    snake: number[];
    apple: number;
    cycle: number[];
    effort: number;
};

// worker → UI: the best cycle found so far for the last reported state.
export type BestMsg = {
    type: "best";
    generation: number;
    cycle: number[];
    score: number;
};


const nowMs = () =>
    (typeof performance !== "undefined" ? performance.now() : Date.now());

// Anytime optimizer driven by the worker. `setState` re-targets it to the
// latest snake/apple and re-bases its incumbent onto the cycle the UI holds;
// `step` refines toward min-J for a time budget; `getBest` reports the
// incumbent. It never mutates `best` in place, so a posted cycle is stable.
export class SnakeSearch {
    rows = 0;
    cols = 0;
    snake: number[] = [];
    apple = -1;
    generation = -1;
    best: number[] = [];
    bestScore = Infinity;

    private lowerBound = 1;
    private d0: Int32Array = new Int32Array(0);
    private totalD0 = 0;
    private ready = false;

    setState(msg: StateMsg): void {
        const appleChanged =
            msg.apple !== this.apple ||
            msg.rows !== this.rows ||
            msg.cols !== this.cols;

        this.rows = msg.rows;
        this.cols = msg.cols;
        this.snake = msg.snake;
        this.apple = msg.apple;
        this.generation = msg.generation;

        const bfs = bfsDistance(this.snake[0], this.apple, this.rows, this.cols, this.snake);
        this.lowerBound = Number.isFinite(bfs) ? Math.max(bfs, 1) : 1;

        if (appleChanged || this.d0.length !== this.rows * this.cols) {
            const f = appleTransparentField(this.apple, this.rows, this.cols);
            this.d0 = f.d0;
            this.totalD0 = f.totalD0;
        }

        // Re-base the incumbent onto the cycle the UI is using (valid for this
        // snake). No progress is lost: when the UI adopts our best each tick,
        // that best is exactly what comes back here.
        this.best = normalizeHamiltonian(msg.cycle, this.snake, this.cols, buildPosMap(msg.cycle));
        this.bestScore = this.scoreOf(this.best);
        this.ready = true;
    }

    private scoreOf(path: number[]): number {
        return scoreCycle(
            path, buildPosMap(path), this.snake.length,
            this.apple, this.rows, this.cols, this.lowerBound, this.d0, this.totalD0
        );
    }

    // Refine for ~budgetMs of wall-clock; returns whether the incumbent improved.
    step(budgetMs: number): boolean {
        if (!this.ready) return false;
        let improved = false;
        const start = nowMs();
        do {
            if (this.bestScore <= STOP_EPS) break;   // nothing to gain — idle
            try {
                const raw = generateHamiltonian(this.rows, this.cols, this.snake, this.apple);
                if (raw.length === 0) continue;
                const norm = normalizeHamiltonian(raw, this.snake, this.cols, buildPosMap(raw));
                const cand = optimizeHamiltonianByBumps(norm, this.snake, this.apple, this.cols);
                const score = this.scoreOf(cand);
                if (score < this.bestScore) {
                    this.best = cand;
                    this.bestScore = score;
                    improved = true;
                }
            } catch {
                // discard a bad candidate, keep searching
            }
        } while (nowMs() - start < budgetMs);
        return improved;
    }

    getBest(): BestMsg {
        return { type: "best", generation: this.generation, cycle: this.best, score: this.bestScore };
    }

    get idle(): boolean {
        return this.ready && this.bestScore <= STOP_EPS;
    }
}
