// Re-homing planner worker. Continuously banks snake-agnostic Hamiltonian
// cycles for the current grid, and for the latest state the UI reports searches
// that bank for the fastest safe way to re-home onto a cycle that reaches the
// apple sooner than the one the UI is already following. The UI samples the
// posted plan on its own clock — compute never blocks the page.

import { SnakePlanner } from "./snakeAlgo";
import type { StateMsg, StatsMsg, PreplanStateMsg } from "./snakeAlgo";

// `self` is the worker global; cast to Worker for a DOM-lib-friendly
// postMessage/onmessage signature without pulling in the webworker lib.
const ctx = self as unknown as Worker;

const planner = new SnakePlanner();
let pendingPost = false;
let lastPost = 0;
let lastStatTime = 0;
let lastStatCount = -1;

ctx.onmessage = (e: MessageEvent<StateMsg | PreplanStateMsg>) => {
    const m = e.data;
    if (!m) return;
    if (m.type === "state") planner.setState(m);
    else if (m.type === "preplanState") planner.setPreplanState(m);
};

function loop() {
    if (planner.step()) pendingPost = true;
    const now = nowMs();

    // Post the latest improved plan, throttled — but never drop it, so an
    // improvement found during the throttle window still reaches the UI.
    if (pendingPost && now - lastPost >= 16) {
        const plan = planner.getPlan();
        if (plan) ctx.postMessage(plan);
        const preplan = planner.getPreplan();
        if (preplan) ctx.postMessage(preplan);
        lastPost = now;
        pendingPost = false;
    }

    // Progress ticker — cycles banked so far.
    if (now - lastStatTime >= 250 && planner.generated !== lastStatCount) {
        const stats: StatsMsg = { type: "stats", generation: planner.generation, generated: planner.generated };
        ctx.postMessage(stats);
        lastStatCount = planner.generated;
        lastStatTime = now;
    }

    // Spin while there is still cycle-banking to do; once the bank is full and
    // we are only re-planning for new states, ease off to stay light on CPU.
    setTimeout(loop, planner.bankFull ? 8 : 0);
}

function nowMs() {
    return typeof performance !== "undefined" ? performance.now() : Date.now();
}

loop();
