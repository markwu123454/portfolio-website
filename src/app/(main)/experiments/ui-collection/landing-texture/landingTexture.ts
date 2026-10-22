/**
 * Landing texture — the wind-blown ASCII field behind the Claude Code desktop
 * app's new-session screen.
 *
 * Tuning and shaders are copied from the app. One change: CALM_LEFT in the
 * wind shader is 1.0 here (0.3 in the app), because there is no prompt box in
 * the middle to dim the texture behind.
 *
 * Two WebGL2 passes per frame: the wind is worked out into a small texture
 * (1×2 samples per character cell), then one quad per cell draws a glyph from
 * an atlas, lit by that texture. Clicks send out ripples (every third one is a
 * heart); moving the pointer leaves a warm wake. The loop runs at ~25 fps,
 * settles after a few idle minutes and backs off if the GPU falls behind.
 *
 * startLandingTexture(container) draws into `container` and listens for input
 * on its parent. The container's `color` is the ink and its `font-family` the
 * glyph font. Returns { destroy }.
 */

import { GLYPHS_FS, GLYPHS_VS, WIND_FS, WIND_VS } from './landingTextureShaders';

// ─── Tuning, copied from the app ────────────────────────────────────────────
const CONFIG = {
    strength: { scale: 1, base: { dark: 0.26, light: 0.26 }, cap: { dark: 0.9, light: 0.9 }, rest: 0.03 },
    surface: { fill: 1, weight: 300, glyphCss: 9, skipUnseen: true },
    wind: { energy: 1, friction: 0.6, flick: 1.2, lull: 0.5, streak: 0.4, detail: 0.6, edge: 0.75, curl: 0.65, wisp: 0.5, tail: 0.35, sweep: 0.3, morph: 3, revealS: 4 },
    glow: { amount: 1, headroom: 3, color: { dark: [0.1, 0.68, 1], light: [0, 0.25, 1] } },
    touch: { stir: 1, ripple: 1, slowPxS: 60, fastPxS: 800 },
    grid: { cellCss: 6.5, minCols: 24, minRows: 8, maxDevicePixels: 21e6 },
    power: { frameMs: 40, rippleFrameMs: 10, backoffFrameMs: 83, budgetS: 180, settleS: 8, resumeS: 3, retryS: 60, retryMaxS: 480, resizeSettleMs: 150 },
};
// The 96 cells of the glyph atlas (16 × 6): space, printable ASCII, and a middle dot.
const CHARSET = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~·";
const ATLAS_ROWS = 6;
// Each cell steps through one of these sequences, starting at its own place in it.
const LOOKS: Record<string, string> = {
    mixed: "ab0cAde1fEgh2iGjk3lHmn4oKpq5rMst6uRvw7xSyz8nT9eW",
    lettered: "abcd3efgRhijk7lmnAopqr0stuEvwxy5zaeKiou2gcS9",
    figured: "0a1b2C3d4e5F6g7h8i9J0k1m2N3p4q5R6s7t8U9v0w1X2y3z",
};
const FADE_IN_MS = 3000;
const RECENT_KEY = "landing-texture-demo-recent";
const INTERACTIVE = [
    "a,button,input,textarea,select,label,summary",
    "[contenteditable]:not([contenteditable='false'])",
    "[draggable='true']",
    "[tabindex]:not([tabindex='-1'])",
    ..."button link textbox combobox listbox option menu menuitem tab switch checkbox radio slider dialog".split(" ").map((r) => `[role='${r}']`),
].join(",");

type Rgb = [number, number, number];
type Mode = "dark" | "light";
interface Layout { cellWidth: number; cellHeight: number; columns: number; rows: number; left: number; top: number; scale: number }
interface Size { deviceWidth: number; deviceHeight: number; cssWidth: number; cssHeight: number }
interface WindParams { key: string; seed: number; heading: number; speed: number; gustLength: number; gustWidth: number; bend: number; bendScale: number }

const smoothstep01 = (x: number) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t); };

// ─── Grid and glyph atlas ───────────────────────────────────────────────────
function layoutGrid(size: Size, dpr: number): Layout | null {
    const g = CONFIG.grid;
    if (!(size.deviceWidth > 0 && size.deviceHeight > 0 && dpr > 0)) return null;
    const cellWidth = Math.max(5, Math.round(g.cellCss * dpr));
    const cellHeight = cellWidth * 2;
    let columns = Math.ceil(size.deviceWidth / cellWidth);
    let rows = Math.ceil(size.deviceHeight / cellHeight);
    if (columns < g.minCols || rows < g.minRows) return null;
    const over = (columns * cellWidth * rows * cellHeight) / g.maxDevicePixels;
    if (over > 1) {
        columns = Math.floor(columns / Math.sqrt(over));
        rows = Math.floor(rows / Math.sqrt(over));
    }
    const left = Math.round((size.deviceWidth - columns * cellWidth) / 2);
    const top = Math.round((size.deviceHeight - rows * cellHeight) / 2);
    return { cellWidth, cellHeight, columns, rows, left, top, scale: dpr };
}

function parseCssColor(css: string): { rgb: Rgb; alpha: number } {
    const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    if (!ctx) return { rgb: [0.5, 0.5, 0.5], alpha: 1 };
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const [r = 128, g = 128, b = 128, a = 255] = ctx.getImageData(0, 0, 1, 1).data;
    return { rgb: [r / 255, g / 255, b / 255], alpha: a / 255 };
}

function pickFont(family: string, cellWidth: number, dpr: number) {
    // Thinner strokes on dense screens, one step heavier at 1x.
    const weight = dpr >= 1.5 ? CONFIG.surface.weight : CONFIG.surface.weight + 100;
    const ctx = document.createElement("canvas").getContext("2d");
    let ratio = 0.6;
    if (ctx) {
        ctx.font = `${weight} 100px ${family}`;
        ratio = ctx.measureText("0").width / 100 || ratio;
    }
    return { family, weight, px: Math.min(Math.round(CONFIG.surface.glyphCss * dpr), Math.floor((cellWidth - 2) / ratio)) };
}

function drawAtlas(font: ReturnType<typeof pickFont>, cellWidth: number, cellHeight: number) {
    const canvas = document.createElement("canvas");
    canvas.width = 16 * cellWidth;
    canvas.height = ATLAS_ROWS * cellHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.font = `${font.weight} ${font.px}px ${font.family}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "white";
    const m = ctx.measureText("Mg|");
    const baseline = Math.round((cellHeight - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent);
    const advance = ctx.measureText("0").width;
    const inset = Math.floor((cellWidth - advance) / 2);
    // A glyph narrower or wider than "0" would break the grid, so it's left out.
    const missing = [...CHARSET].map((ch, i) => {
        if (Math.abs(ctx.measureText(ch).width - advance) > 0.5) return true;
        const x = (i % 16) * cellWidth, y = Math.floor(i / 16) * cellHeight;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, cellWidth, cellHeight);
        ctx.clip();
        ctx.fillText(ch, x + inset, y + baseline);
        ctx.restore();
        return false;
    });
    const rgba = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const coverage = new Uint8Array(canvas.width * canvas.height);
    for (let i = 0; i < coverage.length; i++) coverage[i] = rgba[i * 4 + 3] ?? 0;
    return { coverage, missing };
}

// Each glyph's ink box within its cell, so the vertex shader draws only that much.
function measureGlyphBoxes(coverage: Uint8Array, cellWidth: number, cellHeight: number) {
    const stride = 16 * cellWidth;
    const boxes = new Uint8Array(CHARSET.length * 4);
    for (let g = 0; g < CHARSET.length; g++) {
        const gx = (g % 16) * cellWidth, gy = Math.floor(g / 16) * cellHeight;
        let minX = cellWidth, minY = cellHeight, maxX = -1, maxY = -1;
        for (let y = 0; y < cellHeight; y++) {
            for (let x = 0; x < cellWidth; x++) {
                if ((coverage[(gy + y) * stride + gx + x] ?? 0) >= 8) {
                    minX = Math.min(minX, x); minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
                }
            }
        }
        if (maxX >= 0) boxes.set([minX, minY, maxX - minX + 1, maxY - minY + 1], g * 4);
    }
    return boxes;
}

function glyphSequence(look: string, missing: boolean[]) {
    const seq = [...(LOOKS[look] ?? LOOKS.mixed)].map((ch) => CHARSET.indexOf(ch)).filter((i) => i > 0 && missing[i] !== true);
    return Uint8Array.from(seq.length > 0 ? seq : [CHARSET.indexOf(".")]);
}

// ─── Seeded randomness: the look and the wind for one visit ────────────────
function mix32(x: number) {
    let t = x >>> 0;
    t = Math.imul(t ^ (t >>> 16), 569420461);
    t = Math.imul(t ^ (t >>> 15), 1935289751);
    return (t ^ (t >>> 15)) >>> 0;
}
function seededRandom(seed: number, salt: string) {
    let s = mix32(seed);
    for (const ch of salt) s = mix32(s ^ ch.charCodeAt(0));
    return () => { s = (s + 2654435769) >>> 0; return mix32(s) / 4294967296; };
}
function readRecentLooks(): string[] {
    try {
        const list = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
        if (Array.isArray(list)) return list.filter((x) => typeof x === "string");
    } catch {}
    return [];
}
function rememberLook(look: string) {
    try { localStorage.setItem(RECENT_KEY, JSON.stringify([look, ...readRecentLooks().filter((x) => x !== look)].slice(0, 3))); } catch {}
}
// Prefer a look not seen in the last three visits; failing that, anything but the last one.
function pickLook(seed: number, recent: string[]) {
    const keys = Object.keys(LOOKS);
    const fresh = keys.filter((k) => !recent.includes(k));
    const notLast = keys.filter((k) => k !== recent[0]);
    const pool = fresh.length > 0 ? fresh : notLast.length > 0 ? notLast : keys;
    return pool[Math.floor(seededRandom(seed, "look")() * pool.length)] ?? "mixed";
}
// A heading 18°–42° off horizontal, either way.
function windHeading(r: number) {
    const lo = Math.PI / 10;
    const a = lo + (Math.PI / 4.3 - lo) * ((r * 2) % 1);
    return r < 0.5 ? a : Math.PI - a;
}
function windParams(seed: number, look: string): WindParams {
    const r = seededRandom(seed, "wind");
    const between = (a: number, b: number) => a + (b - a) * r();
    return {
        key: look in LOOKS ? look : "mixed",
        seed: seed >>> 0,
        heading: windHeading(r()),
        speed: between(42, 64),
        gustLength: between(380, 560),
        gustWidth: between(120, 190),
        bend: between(60, 110),
        bendScale: between(300, 440),
    };
}

// ─── Frame loop: a timer, then requestAnimationFrame ────────────────────────
interface FrameLoopOptions {
    intervalMs?: () => number;
    allowed?: () => boolean;
    onLate?: () => void;
    onStall?: () => void;
}
function createFrameLoop(onFrame: (clockS: number) => void, opts: FrameLoopOptions) {
    let running = false, killed = false, clockMs = 0, lastNow = 0, scheduledAt = 0, slowFrames = 0, inFrame = false;
    let timer: ReturnType<typeof setTimeout> | undefined, raf: number | undefined;
    let lateHistory: boolean[] = [];
    const visible = () => !document.hidden;
    const canRun = () => running && !killed && visible() && (opts.allowed?.() ?? true);
    const stop = () => {
        clearTimeout(timer);
        if (raf !== undefined) cancelAnimationFrame(raf);
        timer = raf = undefined;
    };
    const noteLateness = (ms: number) => {
        lateHistory = [...lateHistory.slice(-9), ms > 17];
        if (lateHistory.filter(Boolean).length >= 5) { lateHistory = []; opts.onLate?.(); }
    };
    const frame = (rafTime: number) => {
        raf = undefined;
        inFrame = true;
        try {
            const now = performance.now();
            const start = Math.max(rafTime, scheduledAt);
            noteLateness(now - start);
            clockMs += Math.min(now - lastNow, 250);
            lastNow = now;
            onFrame(clockMs / 1000);
            slowFrames = performance.now() - start > 50 ? slowFrames + 1 : 0;
            if (slowFrames >= 3) { slowFrames = 0; opts.onStall?.(); }
        } finally {
            inFrame = false;
        }
        if (canRun()) schedule();
    };
    const schedule = () => {
        timer = setTimeout(() => {
            timer = undefined;
            scheduledAt = performance.now();
            raf = requestAnimationFrame(frame);
        }, opts.intervalMs?.() ?? 40);
    };
    const refresh = () => {
        if (inFrame) return;
        const active = timer !== undefined || raf !== undefined;
        if (canRun() && !active) { lastNow = performance.now(); schedule(); }
        else if (!canRun() && active) stop();
    };
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("blur", refresh);
    return {
        redraw: () => { if (!killed) onFrame(clockMs / 1000); },
        setRunning: (v: boolean) => { running = v; refresh(); },
        refresh,
        kill: () => { killed = true; refresh(); },
        destroy: () => {
            killed = true;
            stop();
            document.removeEventListener("visibilitychange", refresh);
            window.removeEventListener("focus", refresh);
            window.removeEventListener("blur", refresh);
        },
    };
}

// ─── Pointer: clicks become ripples, movement leaves a warm wake ───────────
const TAP_LIFE_S = 3.6, WAKE_LIFE_S = 2.4;
interface Tap { x: number; y: number; at: number; force: number }
interface Wake { x: number; y: number; at: number; force: number; wayX: number; wayY: number }
interface Point { x: number; y: number; at: number }
interface TouchFrame { now: number; tapCount: number; taps: Float32Array; wakeCount: number; wakes: Float32Array; ways: Float32Array }

function createPointerTracker() {
    let taps: Tap[] = [], wakes: Wake[] = [], last: Point | null = null, anchor: Point | null = null, speed = 0, tapCount = 0;
    const out: TouchFrame = { now: 0, tapCount: 0, taps: new Float32Array(24), wakeCount: 0, wakes: new Float32Array(192), ways: new Float32Array(192) };
    return {
        move(x: number, y: number, t: number) {
            if (!last || !anchor || t - last.at > 0.25) {
                last = { x, y, at: t }; anchor = last; speed = 0;
                return false;
            }
            const dt = Math.max(t - last.at, 1 / 240);
            speed += (Math.hypot(x - last.x, y - last.y) / dt - speed) * Math.min(1, dt / 0.08);
            last = { x, y, at: t };
            const length = Math.hypot(x - anchor.x, y - anchor.y);
            if (length < 18 || t - anchor.at < 0.035) return false;
            const { slowPxS, fastPxS, stir } = CONFIG.touch;
            const force = stir * smoothstep01((speed - slowPxS) / (fastPxS - slowPxS));
            const from = anchor;
            anchor = last;
            if (force < 0.04) return false;
            wakes = [...wakes.slice(-47), {
                x: (x + from.x) / 2, y: (y + from.y) / 2, at: t,
                force: (force * length) / (length + 90),
                wayX: (x - from.x) / 2, wayY: (y - from.y) / 2,
            }];
            return true;
        },
        tap(x: number, y: number, t: number) {
            tapCount += 1;
            // Every third click is negative, which the shaders draw as a heart.
            const force = tapCount % 3 === 0 ? -1.15 * CONFIG.touch.ripple : CONFIG.touch.ripple;
            taps = [...taps.slice(-5), { x, y, at: t, force }];
        },
        leave() { last = null; },
        busy: (t: number) => taps.some((p) => t - p.at < TAP_LIFE_S) || wakes.some((w) => t - w.at < WAKE_LIFE_S),
        rippling: (t: number) => taps.some((p) => t - p.at < TAP_LIFE_S),
        frame(now: number) {
            taps = taps.filter((p) => now - p.at < TAP_LIFE_S);
            wakes = wakes.filter((w) => now - w.at < WAKE_LIFE_S);
            out.now = now;
            out.tapCount = taps.length;
            taps.forEach((p, i) => out.taps.set([p.x, p.y, p.at, p.force], i * 4));
            const room = 48 - wakes.length;
            let n = 0;
            wakes.forEach((w, i) => {
                const age = Math.max(0, now - w.at);
                const heat = w.force * Math.min(1, (i + 1 + room) / 8) * (1 - Math.exp(-age / 0.05)) * Math.exp(-age / 0.65);
                if (heat < 0.002) return;
                const reach = 50 + 40 * age;
                const len = Math.hypot(w.wayX, w.wayY);
                out.wakes.set([w.x, w.y, heat, 1 / (reach * reach)], n * 4);
                out.ways.set([w.wayX / (len || 1), w.wayY / (len || 1), len, 0], n * 4);
                n += 1;
            });
            out.wakeCount = n;
            return out;
        },
    };
}

// ─── WebGL2 renderer: wind pass into a small texture, then one quad per cell
const UNIT = { wind: 0, atlas: 1, boxes: 2, sequence: 3 };

function compileProgram(gl: WebGL2RenderingContext, vs: string, fs: string) {
    const program = gl.createProgram()!;
    for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]] as const) {
        const shader = gl.createShader(type)!;
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(shader));
        gl.attachShader(program, shader);
        gl.deleteShader(shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

function createRenderer(container: HTMLElement, params: WindParams, fontFamily: string) {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", {
        alpha: true, antialias: false, depth: false, stencil: false,
        premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: "low-power",
    });
    if (!gl) return null;
    const windProgram = compileProgram(gl, WIND_VS, WIND_FS);
    const glyphProgram = compileProgram(gl, GLYPHS_VS, GLYPHS_FS);
    if (!windProgram || !glyphProgram) return null;

    const makeTexture = (unit: number, filter: number) => {
        const tex = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return tex;
    };
    // Each texture stays bound to its own unit, so uploads only pick the unit.
    const upload = (unit: number, format: "r8" | "rgba8" | "rgba8ui", w: number, h: number, data: ArrayBufferView | null) => {
        gl.activeTexture(gl.TEXTURE0 + unit);
        const [internal, fmt] = format === "r8" ? [gl.R8, gl.RED] : format === "rgba8" ? [gl.RGBA8, gl.RGBA] : [gl.RGBA8UI, gl.RGBA_INTEGER];
        gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, fmt, gl.UNSIGNED_BYTE, data);
    };
    const windTex = makeTexture(UNIT.wind, gl.LINEAR);
    const atlasTex = makeTexture(UNIT.atlas, gl.NEAREST);
    const boxesTex = makeTexture(UNIT.boxes, gl.NEAREST);
    const sequenceTex = makeTexture(UNIT.sequence, gl.NEAREST);
    const framebuffer = gl.createFramebuffer();
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    const loc = (p: WebGLProgram, name: string) => gl.getUniformLocation(p, name);
    const { wind } = CONFIG;

    gl.useProgram(windProgram);
    gl.uniform1ui(loc(windProgram, "u_seed"), params.seed);
    gl.uniform1f(loc(windProgram, "u_tail"), wind.tail);
    gl.uniform1f(loc(windProgram, "u_sweep"), wind.sweep);
    gl.uniform1f(loc(windProgram, "u_morph"), wind.morph);
    gl.uniform4f(loc(windProgram, "u_wind"), params.heading, params.speed, params.gustLength, params.gustWidth);
    gl.uniform4f(loc(windProgram, "u_gust"), params.bend, params.bendScale, wind.lull, wind.streak);
    gl.uniform4f(loc(windProgram, "u_shape"), wind.detail, wind.edge, wind.curl, wind.wisp);

    gl.useProgram(glyphProgram);
    gl.uniform1i(loc(glyphProgram, "u_wind"), UNIT.wind);
    gl.uniform1i(loc(glyphProgram, "u_atlas"), UNIT.atlas);
    gl.uniform1i(loc(glyphProgram, "u_boxes"), UNIT.boxes);
    gl.uniform1i(loc(glyphProgram, "u_sequence"), UNIT.sequence);
    gl.uniform1ui(loc(glyphProgram, "u_seed"), params.seed);
    gl.uniform1f(loc(glyphProgram, "u_fill"), CONFIG.surface.fill);
    gl.uniform1f(loc(glyphProgram, "u_flick"), wind.flick);
    gl.uniform1f(loc(glyphProgram, "u_friction"), wind.friction);
    gl.uniform1f(loc(glyphProgram, "u_glowAmount"), CONFIG.glow.amount);

    const touchLocs = (p: WebGLProgram) => ({
        now: loc(p, "u_now"), tapCount: loc(p, "u_tapCount"), wakeCount: loc(p, "u_wakeCount"),
        taps: loc(p, "u_taps"), wakes: loc(p, "u_wakes"), ways: loc(p, "u_ways"),
    });
    const touch = { wind: touchLocs(windProgram), glyphs: touchLocs(glyphProgram) };
    const setTouch = (l: ReturnType<typeof touchLocs>, t: TouchFrame | undefined) => {
        gl.uniform1i(l.tapCount, t?.tapCount ?? 0);
        gl.uniform1i(l.wakeCount, t?.wakeCount ?? 0);
        if (!t) return;
        gl.uniform1f(l.now, t.now);
        if (t.tapCount > 0) gl.uniform4fv(l.taps, t.taps);
        if (t.wakeCount > 0 && l.wakes) {
            gl.uniform4fv(l.wakes, t.wakes);
            gl.uniform4fv(l.ways, t.ways);
        }
    };
    const U = {
        cellCss: loc(glyphProgram, "u_cellCss"), windTime: loc(windProgram, "u_time"), reveal: loc(windProgram, "u_reveal"),
        sampleCss: loc(windProgram, "u_sampleCss"), originCss: loc(windProgram, "u_originCss"), paneCss: loc(windProgram, "u_paneCss"),
        canvasCss: loc(windProgram, "u_canvasCss"), glyphTime: loc(glyphProgram, "u_time"), count: loc(glyphProgram, "u_count"),
        grid: loc(glyphProgram, "u_grid"), cell: loc(glyphProgram, "u_cell"), buffer: loc(glyphProgram, "u_buffer"),
        color: loc(glyphProgram, "u_color"), glowColor: loc(glyphProgram, "u_glowColor"), inkAlpha: loc(glyphProgram, "u_inkAlpha"),
    };

    let cells = 0, columns = 0, rows = 0, atlasCellWidth = 0, lagging = 0, frames = 0;
    let fence: WebGLSync | null = null;
    const buildAtlas = (cellWidth: number, cellHeight: number) => {
        const font = pickFont(fontFamily, cellWidth, devicePixelRatio);
        const atlas = drawAtlas(font, cellWidth, cellHeight);
        if (!atlas) return false;
        const boxes = measureGlyphBoxes(atlas.coverage, cellWidth, cellHeight);
        const sequence = glyphSequence(params.key, atlas.missing);
        upload(UNIT.atlas, "r8", 16 * cellWidth, ATLAS_ROWS * cellHeight, atlas.coverage);
        upload(UNIT.boxes, "rgba8ui", CHARSET.length, 1, boxes);
        upload(UNIT.sequence, "r8", sequence.length, 1, sequence);
        gl.useProgram(glyphProgram);
        gl.uniform1i(U.count, sequence.length);
        atlasCellWidth = cellWidth;
        return true;
    };

    container.append(canvas);
    return {
        canvas,
        resize(layout: Layout, [paneWidth, paneHeight]: [number, number]) {
            if (layout.cellWidth !== atlasCellWidth && !buildAtlas(layout.cellWidth, layout.cellHeight)) return false;
            const width = layout.columns * layout.cellWidth, height = layout.rows * layout.cellHeight;
            if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
            const css = (v: number) => v / layout.scale;
            canvas.style.left = `${css(layout.left)}px`;
            canvas.style.top = `${css(layout.top)}px`;
            canvas.style.width = `${css(width)}px`;
            canvas.style.height = `${css(height)}px`;
            if (layout.columns !== columns || layout.rows !== rows) {
                ({ columns, rows } = layout);
                cells = columns * rows;
                // The wind is sampled twice per cell, top and bottom half.
                upload(UNIT.wind, "rgba8", columns, rows * 2, null);
                gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, windTex, 0);
            }
            gl.useProgram(windProgram);
            gl.uniform2f(U.sampleCss, css(layout.cellWidth), css(layout.cellHeight) / 2);
            gl.uniform2f(U.originCss, css(layout.left), css(layout.top));
            gl.uniform2f(U.paneCss, paneWidth, paneHeight);
            gl.uniform2f(U.canvasCss, css(width), css(height));
            gl.useProgram(glyphProgram);
            gl.uniform2i(U.grid, columns, rows);
            gl.uniform4f(U.cellCss, css(layout.left + layout.cellWidth / 2), css(layout.top + layout.cellHeight / 2), css(layout.cellWidth), css(layout.cellHeight));
            gl.uniform2i(U.cell, layout.cellWidth, layout.cellHeight);
            gl.uniform2i(U.buffer, width, height);
            return true;
        },
        setInk(rgb: Rgb, alpha = 1) {
            gl.useProgram(glyphProgram);
            gl.uniform3f(U.color, rgb[0], rgb[1], rgb[2]);
            gl.uniform1f(U.inkAlpha, alpha);
        },
        setGlow(rgb: number[]) {
            gl.useProgram(glyphProgram);
            gl.uniform3f(U.glowColor, rgb[0], rgb[1], rgb[2]);
        },
        draw({ time, reveal, touch: t }: { time: number; reveal: number; touch: TouchFrame | undefined }) {
            if (cells === 0) return;
            if (fence) {
                lagging = gl.getSyncParameter(fence, gl.SYNC_STATUS) === gl.SIGNALED ? 0 : lagging + 1;
                gl.deleteSync(fence);
                fence = null;
            }
            // Pass 1: the wind, into a texture with 1×2 samples per cell.
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
            gl.viewport(0, 0, columns, rows * 2);
            gl.useProgram(windProgram);
            gl.uniform1f(U.windTime, time);
            gl.uniform1f(U.reveal, reveal);
            setTouch(touch.wind, t);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            // Pass 2: one quad per cell, lit by the wind.
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(glyphProgram);
            gl.uniform1f(U.glyphTime, time);
            setTouch(touch.glyphs, t);
            gl.drawArrays(gl.TRIANGLES, 0, 6 * cells);
            frames += 1;
            if (frames % 4 === 0) {
                fence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
                gl.flush();
            }
        },
        fellBehind: () => {
            if (lagging < 2) return false;
            lagging = 0;
            return true;
        },
        destroy() {
            if (fence) gl.deleteSync(fence);
            gl.deleteProgram(windProgram);
            gl.deleteProgram(glyphProgram);
            for (const tex of [windTex, atlasTex, boxesTex, sequenceTex]) gl.deleteTexture(tex);
            gl.deleteFramebuffer(framebuffer);
            gl.getExtension("WEBGL_lose_context")?.loseContext();
            canvas.remove();
        },
    };
}

// ─── Controller: sizing, theme, power budget, input ────────────────────────
export function startLandingTexture(container: HTMLElement): { destroy(): void } {
    const { power, wind, strength } = CONFIG;
    const cleanups: (() => void)[] = [];
    let destroyed = false;
    let loop: ReturnType<typeof createFrameLoop> | null = null;
    const running = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (matchMedia("(prefers-contrast: more), (forced-colors: active)").matches) return { destroy() {} };

    const init = async () => {
        const visitSeed = crypto.getRandomValues(new Uint32Array(1))[0] || 1;
        const params = windParams(visitSeed, pickLook(visitSeed, readRecentLooks()));
        const family = getComputedStyle(container).fontFamily;
        await document.fonts.load(`400 16px ${family}`, ".").catch(() => undefined);
        if (destroyed) return;
        const renderer = createRenderer(container, params, family);
        if (!renderer) return;
        if (destroyed) { renderer.destroy(); return; }
        cleanups.push(renderer.destroy);
        renderer.canvas.dataset.look = `${params.key}/${params.seed.toString(16)}`;
        renderer.canvas.style.opacity = "0";
        rememberLook(params.key);

        let laidOut = false, dead = false, lateStrikes = 0, calm = false, busy = "", still = false;
        let activeS = 0, lastClockS = 0, settle = 1, resume = 1, revealStart = 0;
        let windTime = (visitSeed / 4294967296) * 64;
        let budgetEnd = power.budgetS, resumeStart = -power.resumeS, retryS = power.retryS, targetOpacity = 0;
        let retryTimer: ReturnType<typeof setTimeout> | undefined;
        const pointer = createPointerTracker();
        const t0 = performance.now();
        const nowS = () => (performance.now() - t0) / 1000;
        const visible = () => !document.hidden;

        const updateOpacity = () => {
            const show = still || (!busy && visible());
            renderer.canvas.style.transition = `opacity ${show ? FADE_IN_MS : 500}ms ease-out`;
            renderer.canvas.style.opacity = String(show ? targetOpacity : 0);
            renderer.canvas.dataset.state = (still && "still") || (busy && `busy-${busy}`) || (!visible() && "unseen") || (calm && "calm") || "moving";
        };
        const draw = () => renderer.draw({
            time: windTime,
            touch: still ? undefined : pointer.frame(nowS()),
            reveal: still ? 1 : smoothstep01((activeS - revealStart) / wind.revealS) * settle,
        });
        // Back to full motion: the wind ramps up again and the field re-reveals.
        const wake = () => {
            clearTimeout(retryTimer);
            retryTimer = undefined;
            calm = false; busy = ""; lateStrikes = 0;
            revealStart = activeS; resumeStart = activeS; budgetEnd = activeS + power.budgetS;
            loop?.redraw();
            updateOpacity();
            loop?.refresh();
        };
        const retry = () => { const keep = budgetEnd; wake(); budgetEnd = keep; };
        const backOff = (reason: string) => {
            busy = reason;
            updateOpacity();
            loop?.refresh();
            retryTimer = setTimeout(retry, retryS * 1000);
            retryS = Math.min(retryS * 2, power.retryMaxS);
        };
        const strike = (reason: string) => {
            lateStrikes += 1;
            if (lateStrikes >= 2) backOff(reason);
            else loop?.refresh();
        };
        const onFrame = (clockS: number) => {
            const dt = Math.min(Math.max(clockS - lastClockS, 0), 0.25);
            lastClockS = clockS;
            activeS += dt;
            settle = 1 - smoothstep01((activeS - budgetEnd) / power.settleS);
            resume = smoothstep01((activeS - resumeStart) / power.resumeS);
            windTime += dt * wind.energy * settle * resume;
            draw();
            if (settle === 0 && !calm && !pointer.busy(nowS())) {
                calm = true;
                retryS = power.retryS;
                updateOpacity();
            } else if (renderer.fellBehind() && !calm && !busy) {
                strike("gpu");
            }
        };

        let themeKey = "";
        const applyTheme = () => {
            const cs = getComputedStyle(container);
            const key = `${cs.color} ${cs.colorScheme}`;
            if (key === themeKey) return;
            themeKey = key;
            const mode: Mode = cs.colorScheme.includes("light") ? "light" : "dark";
            const ink = parseCssColor(cs.color);
            renderer.setInk(ink.rgb, ink.alpha);
            renderer.setGlow(CONFIG.glow.color[mode]);
            targetOpacity = Math.min(1, Math.min(strength.base[mode] * strength.scale, strength.cap[mode]) * CONFIG.glow.headroom);
            updateOpacity();
        };

        const onSize = (size: Size) => {
            if (dead) return;
            const layout = layoutGrid(size, devicePixelRatio);
            laidOut = layout !== null && renderer.resize(layout, [size.cssWidth, size.cssHeight]);
            renderer.canvas.style.visibility = laidOut ? "" : "hidden";
            if (!laidOut) { loop?.refresh(); return; }
            applyTheme();
            if (loop) { loop.redraw(); loop.refresh(); return; }
            loop = createFrameLoop(onFrame, {
                intervalMs: () => (lateStrikes > 0 ? power.backoffFrameMs : pointer.rippling(nowS()) ? power.rippleFrameMs : power.frameMs),
                allowed: () => laidOut && !calm && !busy,
                onLate: () => strike("late"),
                onStall: () => backOff("slow"),
            });
            cleanups.push(loop.destroy);
            still = !running;
            updateOpacity();
            loop.redraw();
            loop.setRunning(running);
        };

        let firstSize = true, pendingSize: Size | undefined;
        let settleTimer: ReturnType<typeof setTimeout> | undefined;
        const resizeObserver = new ResizeObserver((entries) => {
            const entry = entries[0];
            const css = entry?.contentBoxSize?.[0];
            if (!css) return;
            const device = entry.devicePixelContentBoxSize?.[0];
            const size: Size = {
                deviceWidth: device ? device.inlineSize : Math.round(css.inlineSize * devicePixelRatio),
                deviceHeight: device ? device.blockSize : Math.round(css.blockSize * devicePixelRatio),
                cssWidth: css.inlineSize,
                cssHeight: css.blockSize,
            };
            pendingSize = size;
            if (firstSize) { firstSize = false; onSize(size); return; }
            clearTimeout(settleTimer);
            settleTimer = setTimeout(() => { if (pendingSize) onSize(pendingSize); }, power.resizeSettleMs);
        });
        try { resizeObserver.observe(container, { box: "device-pixel-content-box" }); } catch { resizeObserver.observe(container); }

        // Coming back to the page after the texture settled starts it again.
        const onVisibility = () => { if (calm && visible()) wake(); else updateOpacity(); };

        const host = container.parentElement ?? container;
        const interactive = () => !still && running && laidOut && !busy;
        const localPoint = (ev: PointerEvent): [number, number] | null => {
            if (!interactive()) return null;
            const r = container.getBoundingClientRect();
            return [ev.clientX - r.left, ev.clientY - r.top];
        };
        // Any input keeps the texture going for another budget, or wakes it if it settled.
        const poke = () => {
            if (calm) wake();
            else if (activeS < budgetEnd) budgetEnd = activeS + power.budgetS;
        };
        const onPointerMove = (ev: PointerEvent) => {
            const p = ev.pointerType === "mouse" ? localPoint(ev) : null;
            if (p) { pointer.move(p[0], p[1], nowS()); poke(); }
        };
        const onPointerDown = (ev: PointerEvent) => {
            const p = ev.button === 0 ? localPoint(ev) : null;
            if (!p) return;
            const hit = ev.target instanceof Element ? ev.target.closest(INTERACTIVE) : null;
            if (!(hit && hit !== host && host.contains(hit))) pointer.tap(p[0], p[1], nowS());
            poke();
            loop?.refresh();
        };
        const onKeyDown = () => { if (interactive()) poke(); };
        host.addEventListener("pointermove", onPointerMove, { passive: true });
        host.addEventListener("pointerdown", onPointerDown, { passive: true });
        host.addEventListener("pointerleave", pointer.leave, { passive: true });
        host.addEventListener("keydown", onKeyDown, { capture: true, passive: true });
        window.addEventListener("blur", onVisibility);
        window.addEventListener("focus", onVisibility);
        document.addEventListener("visibilitychange", onVisibility);

        const unhook = () => {
            clearTimeout(settleTimer);
            clearTimeout(retryTimer);
            host.removeEventListener("pointermove", onPointerMove);
            host.removeEventListener("pointerdown", onPointerDown);
            host.removeEventListener("pointerleave", pointer.leave);
            host.removeEventListener("keydown", onKeyDown, { capture: true });
            resizeObserver.disconnect();
            window.removeEventListener("blur", onVisibility);
            window.removeEventListener("focus", onVisibility);
            document.removeEventListener("visibilitychange", onVisibility);
        };
        const onContextLost = () => {
            dead = true;
            laidOut = false;
            loop?.kill();
            renderer.canvas.style.visibility = "hidden";
            unhook();
        };
        renderer.canvas.addEventListener("webglcontextlost", onContextLost);
        cleanups.push(unhook, () => renderer.canvas.removeEventListener("webglcontextlost", onContextLost));
    };
    init();

    return {
        destroy() {
            if (destroyed) return;
            destroyed = true;
            cleanups.reverse().forEach((fn) => fn());
        },
    };
}
