// Continuous cycle-search worker. Free-runs an anytime optimizer over the
// latest state the UI reported, posting its best whenever it improves. The
// UI samples that best on its own clock — compute never blocks the page.

import { SnakeSearch } from "./snakeAlgo";
import type { StateMsg, StatsMsg } from "./snakeAlgo";

// `self` is the worker global; cast to Worker for a DOM-lib-friendly
// postMessage/onmessage signature without pulling in the webworker lib.
const ctx = self as unknown as Worker;

const search = new SnakeSearch();
let lastPost = 0;
let lastStatTime = 0;
let lastStatCount = -1;

ctx.onmessage = (e: MessageEvent<StateMsg>) => {
    const m = e.data;
    if (m && m.type === "state") {
        search.setState(m);
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

    // Progress ticker — only while actually generating, so an idle worker
    // (or a paused board it has solved) stops nudging the UI to re-render.
    if (now - lastStatTime >= 250 && search.generated !== lastStatCount) {
        const stats: StatsMsg = { type: "stats", generation: search.generation, generated: search.generated };
        ctx.postMessage(stats);
        lastStatCount = search.generated;
        lastStatTime = now;
    }

    // Run flat out, yielding between bursts so incoming state messages get
    // processed (and so the browser/OS can throttle it like any other busy
    // task). When there's nothing left to improve, idle instead of spinning.
    setTimeout(loop, search.idle ? 50 : 0);
}

function nowMs() {
    return typeof performance !== "undefined" ? performance.now() : Date.now();
}

loop();
