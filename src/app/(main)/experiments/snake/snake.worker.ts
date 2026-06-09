// Continuous cycle-search worker. Free-runs an anytime optimizer over the
// latest state the UI reported, posting its best whenever it improves. The
// UI samples that best on its own clock — compute never blocks the page.

import { SnakeSearch } from "./snakeAlgo";
import type { StateMsg } from "./snakeAlgo";

// `self` is the worker global; cast to Worker for a DOM-lib-friendly
// postMessage/onmessage signature without pulling in the webworker lib.
const ctx = self as unknown as Worker;

const search = new SnakeSearch();
let effort = 0.5;
let lastPost = 0;

ctx.onmessage = (e: MessageEvent<StateMsg>) => {
    const m = e.data;
    if (m && m.type === "state") {
        search.setState(m);
        effort = m.effort;
    }
};

function loop() {
    const improved = search.step(8);
    const now = nowMs();

    // Post on improvement, throttled — but always flush the final improvement
    // that reaches the idle threshold so the UI gets the best cycle promptly.
    if (improved && (now - lastPost >= 16 || search.idle)) {
        ctx.postMessage(search.getBest());
        lastPost = now;
    }

    // Effort is a duty cycle: full effort runs flat out, lower effort sleeps
    // between bursts (less CPU, lower-quality cycles). Idle sleeps regardless.
    const e = Math.max(effort, 0.02);
    const sleep = search.idle ? 50 : Math.round((8 * (1 - e)) / e);
    setTimeout(loop, sleep);
}

function nowMs() {
    return typeof performance !== "undefined" ? performance.now() : Date.now();
}

loop();
