/**
 * <rs-ascii-logo> — 3D rotating ASCII logo web component.
 *
 * From the home page of the UC Merced Robotics Society site
 * (robotics-society-ucmerced.angelavargas0831.workers.dev). Recovered from
 * the site bundle and de-minified; logic unchanged. Ported to TS here, and
 * the class is built inside defineRsAsciiLogo() so the module can be imported
 * during SSR, where HTMLElement does not exist.
 *
 * Two fixes over the original:
 * - It assumed every character is 0.6em wide, which only holds for JetBrains
 *   Mono. In any other monospace font (Consolas is 0.55em) the hover effect
 *   drifted away from the cursor and the logo was squashed sideways. It now
 *   measures the font it actually renders with.
 * - It spun the gear about the image's centre, but the gear in the logo sits a
 *   little below it, so the gear wobbled round in a small orbit. The point
 *   cloud is now centred on the gear.
 *
 * Usage:
 *   <rs-ascii-logo src="/assets/rblogo.jpg" palette="Logo" ramp="Classic"
 *                  effect="Scramble" transparent no-hint></rs-ascii-logo>
 *
 * Attributes: src, palette (Logo|Blueprint|Steel), ramp (Classic|Binary|Blocks|ASCII),
 * effect (Scramble|Repel), scale, transparent, no-hint, no-autorotate
 */

export const PALETTES = {
    Logo:      { bg: '#050607', gear: '#2f74e0', letter: '#e5a93a', dim: '#6b7078' },
    Blueprint: { bg: '#f2f2f3', gear: '#5980a6', letter: '#1d1f20', dim: '#8a9099' },
    Steel:     { bg: '#1f2c3a', gear: '#f2f2f3', letter: '#a9c1d8', dim: '#8aa0b6' },
} as const;
// Every printable ASCII character but the space ('!' to '~'). The space is left out because the
// darkest shading takes the ramp's first character, and a blank there would erase the shadowed
// side. Code order isn't brightness order, so the element sorts these by ink (see sortByInk).
const PRINTABLE_ASCII = Array.from({ length: 94 }, (_, i) => String.fromCharCode(33 + i)).join('');

export const RAMPS = { Classic: '.,-~:;=!*#$@', Binary: '0011', Blocks: '·:░▒▓█', ASCII: PRINTABLE_ASCII } as const;
export const EFFECTS = ['Scramble', 'Repel'] as const;

export type PaletteName = keyof typeof PALETTES;
export type RampName = keyof typeof RAMPS;
export type EffectName = (typeof EFFECTS)[number];

const geoCache: Record<string, Promise<Float32Array>> = {};
const N = 190; // image sample resolution

// Turn the logo image into a 3D point cloud.
// Blue pixels -> layer 0 (gear), gold pixels -> layer 1 (letters).
// Each point: [x, y, z, nx, ny, nz, layer]  (7 floats)
function loadGeometry(src: string): Promise<Float32Array> {
    if (src in geoCache) return geoCache[src];
    return (geoCache[src] = new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onerror = reject;
        img.onload = () => {
            const cv = document.createElement('canvas');
            cv.width = cv.height = N;
            const ctx = cv.getContext('2d')!;
            ctx.drawImage(img, 0, 0, N, N);
            const px = ctx.getImageData(0, 0, N, N).data;
            const masks = [new Uint8Array(N * N), new Uint8Array(N * N)];

            for (let y = 0; y < N; y++)
                for (let x = 0; x < N; x++) {
                    const i = (y * N + x) * 4, r = px[i], g = px[i + 1], b = px[i + 2];
                    if (b > 140 && r < 110 && b > g) masks[0][y * N + x] = 1;          // blue
                    else if (r > 170 && g > 110 && b < 120) masks[1][y * N + x] = 1;  // gold
                }

            const cell = 2 / N;
            const zRange = [[-0.1, 0.1], [-0.06, 0.2]]; // [back, front] per layer
            const pts: number[] = [];
            const at = (m: Uint8Array, x: number, y: number) => (x < 0 || y < 0 || x >= N || y >= N ? 0 : m[y * N + x]);

            // The gear spins about the origin, so put the origin at the gear's centre (its centroid),
            // not the image's. In this logo the gear sits 3% of the image below centre.
            let sx = 0, sy = 0, count = 0;
            for (let y = 0; y < N; y++)
                for (let x = 0; x < N; x++)
                    if (masks[0][y * N + x]) { sx += x + 0.5; sy += y + 0.5; count++; }
            const ox = count ? (sx / count) * cell - 1 : 0;
            const oy = count ? 1 - (sy / count) * cell : 0;

            for (let layer = 0; layer < 2; layer++) {
                const m = masks[layer];
                const [zBack, zFront] = zRange[layer];
                for (let y = 0; y < N; y++)
                    for (let x = 0; x < N; x++) {
                        if (!m[y * N + x]) continue;
                        const wx = (x + 0.5) * cell - 1 - ox;
                        const wy = 1 - (y + 0.5) * cell - oy;

                        // front face and back face
                        pts.push(wx, wy, zFront, 0, 0, 1, layer,
                                 wx, wy, zBack,  0, 0, -1, layer);

                        // interior pixel: no side wall needed
                        if (at(m, x + 1, y) && at(m, x - 1, y) && at(m, x, y + 1) && at(m, x, y - 1)) continue;

                        // edge pixel: estimate outward normal from 5x5 neighbourhood
                        let gx = 0, gy = 0;
                        for (let dy = -2; dy <= 2; dy++)
                            for (let dx = -2; dx <= 2; dx++) {
                                const v = at(m, x + dx, y + dy);
                                gx += v * dx; gy += v * dy;
                            }
                        let nx = -gx, ny = gy;
                        const len = Math.hypot(nx, ny) || 1;
                        nx /= len; ny /= len;

                        // extrude side wall between back and front
                        for (let z = zBack + cell * 0.6; z < zFront; z += cell * 0.6)
                            pts.push(wx, wy, z, nx, ny, 0, layer);
                    }
            }
            resolve(new Float32Array(pts));
        };
        img.src = src;
    }));
}

// Orders characters from least to most ink in `font`, by drawing each one and summing its coverage.
function sortByInk(chars: string, font: string) {
    const size = 48;
    const cv = document.createElement('canvas');
    cv.width = size;
    cv.height = Math.ceil(size * 1.5);
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    if (!ctx) return chars;
    ctx.font = `${size}px ${font}`;
    ctx.textBaseline = 'top';
    const ink = new Map<string, number>();
    for (const ch of chars) {
        ctx.clearRect(0, 0, cv.width, cv.height);
        ctx.fillText(ch, 0, size * 0.1);
        const data = ctx.getImageData(0, 0, cv.width, cv.height).data;
        let sum = 0;
        for (let i = 3; i < data.length; i += 4) sum += data[i];
        ink.set(ch, sum);
    }
    return [...chars].sort((a, b) => ink.get(a)! - ink.get(b)!).join('');
}

// Deterministic hash -> [0,1), used for flicker/scramble noise
function hash(a: number, b: number, c: number) {
    let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0;
    h = (h ^ (h >>> 13)) * 1274126177;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

interface DragState { x: number; y: number; x0: number; y0: number; t: number; moved: number }

/** Registers <rs-ascii-logo> once. Call from the browser only. */
export function defineRsAsciiLogo() {
    if (customElements.get('rs-ascii-logo')) return;

    class RsAsciiLogo extends HTMLElement {
        static get observedAttributes() {
            return ['palette', 'scale', 'no-hint', 'transparent'];
        }

        preGear: HTMLPreElement;
        preLetter: HTMLPreElement;
        probe: HTMLPreElement;
        hint: HTMLDivElement;
        s: {
            rx: number; ry: number; gz: number;
            vx: number; vy: number; vgz: number;
            depth: number;
            reveal: number; revealing: boolean;
            frame: number;
            mx: number; my: number; mIn: boolean;
            mc: number; mr: number;
            drag: DragState | null; touched: boolean; visible: boolean;
        };
        reduced = false;
        geo?: Float32Array;
        ro?: ResizeObserver;
        io?: IntersectionObserver;
        h: Record<string, (e: PointerEvent) => void> = {};
        raf = 0;
        fs = 0; cw = 0; cols = 0; rows = 0; offX = 0; offY = 0; K = 0;
        aspect = 0.6;                         // char width / row height, measured in layout()
        asciiRamp: string | null = null;      // RAMPS.ASCII sorted by ink, measured on first use
        onFonts = () => { this.asciiRamp = null; this.layout(); };
        zb?: Float32Array; ch?: Int16Array; ty?: Uint8Array;

        constructor() {
            super();
            const root = this.attachShadow({ mode: 'open' });
            root.innerHTML = `<style>
        :host{display:block;position:relative;width:100%;height:100%;min-height:320px;overflow:hidden;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none}
        pre{position:absolute;left:0;top:0;margin:0;font-family:'JetBrains Mono',ui-monospace,Menlo,Consolas,monospace;white-space:pre;letter-spacing:0;pointer-events:none}
        .l{font-weight:700}
        .hint{position:absolute;left:0;right:0;bottom:24px;display:flex;justify-content:center;gap:28px;font:15px 'Barlow Condensed',sans-serif;letter-spacing:.16em;text-transform:uppercase;white-space:nowrap;pointer-events:none;transition:opacity .6s}
        @media (max-width:640px){.hint{bottom:12px;gap:16px;font-size:12px}}
        .probe{visibility:hidden;font-size:100px;line-height:1}
      </style><pre class="g"></pre><pre class="l"></pre><pre class="probe" aria-hidden="true">${'#'.repeat(50)}</pre><div class="hint"><span>Drag to orbit</span><span>Click to spin</span></div>`;
            this.preGear = root.querySelector('.g')!;
            this.preLetter = root.querySelector('.l')!;
            this.probe = root.querySelector('.probe')!;
            this.hint = root.querySelector('.hint')!;
            this.s = {
                rx: -0.3, ry: 0.62, gz: 0,        // rotation: pitch, yaw, gear spin
                vx: 0, vy: 0, vgz: 0,             // angular velocities
                depth: 0,                         // 0 = flat, 1 = full extrusion
                reveal: -2, revealing: false,     // scanline reveal row
                frame: 0,
                mx: 0, my: 0, mIn: false,         // mouse in normalized coords
                mc: 0, mr: 0,                     // mouse in char column/row
                drag: null, touched: false, visible: true,
            };
        }

        attributeChangedCallback() {
            if (this.isConnected) { this.applyPalette(); this.layout(); }
        }

        connectedCallback() {
            this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

            loadGeometry(this.getAttribute('src') || 'rblogo.jpg')
                .then(g => (this.geo = g))
                .catch(() => console.warn('rs-ascii-logo: could not load logo image'));

            this.ro = new ResizeObserver(() => this.layout());
            this.ro.observe(this);

            this.io = new IntersectionObserver(([entry]) => {
                const s = this.s;
                s.visible = entry.isIntersecting;
                if (entry.isIntersecting && !s.revealing) {
                    s.revealing = true;
                    if (this.reduced) { s.reveal = 1e4; s.depth = 1; }
                }
            }, { threshold: 0.15 });
            this.io.observe(this);

            const local = (e: PointerEvent): [number, number, DOMRect] => {
                const r = this.getBoundingClientRect();
                return [e.clientX - r.left, e.clientY - r.top, r];
            };

            this.h = {
                pointerdown: e => {
                    const [x, y] = local(e);
                    this.s.drag = { x, y, x0: x, y0: y, t: performance.now(), moved: 0 };
                    this.setPointerCapture(e.pointerId);
                    this.style.cursor = 'grabbing';
                },
                pointermove: e => {
                    const [x, y, r] = local(e), s = this.s;
                    s.mIn = true;
                    s.mx = (x / r.width) * 2 - 1;
                    s.my = (y / r.height) * 2 - 1;
                    s.mc = (x - this.offX) / this.cw;
                    s.mr = (y - this.offY) / this.fs;
                    if (!s.drag) return;

                    const dx = x - s.drag.x, dy = y - s.drag.y;
                    const now = performance.now();
                    const dt = Math.max(1, now - s.drag.t) / 1000;
                    const k = 4.2 / Math.min(r.width, r.height);
                    s.ry += dx * k;
                    s.rx = Math.max(-1.3, Math.min(1.3, s.rx + dy * k));
                    s.vy = (dx * k) / dt;
                    s.vx = (dy * k) / dt;
                    s.drag.x = x; s.drag.y = y; s.drag.t = now;
                    s.drag.moved = Math.max(s.drag.moved, Math.hypot(x - s.drag.x0, y - s.drag.y0));
                    if (s.drag.moved > 6) this.dismissHint();
                },
                pointerup: e => {
                    const s = this.s;
                    if (s.drag && s.drag.moved < 6) { s.vgz -= 9; this.dismissHint(); } // click = spin gear
                    if (s.drag && performance.now() - s.drag.t > 80) { s.vx = 0; s.vy = 0; }
                    s.drag = null;
                    this.style.cursor = '';
                    if (e.pointerType !== 'mouse') s.mIn = false;
                },
                pointerleave: () => { if (!this.s.drag) this.s.mIn = false; },
            };
            this.h.pointercancel = this.h.pointerup;
            for (const k in this.h) this.addEventListener(k, this.h[k] as EventListener);

            this.applyPalette();
            this.layout();
            // A web font arriving late changes the character width; nothing else would re-run layout.
            document.fonts.addEventListener('loadingdone', this.onFonts);

            let last = performance.now();
            const loop = (t: number) => {
                this.raf = requestAnimationFrame(loop);
                const dt = Math.min(0.05, (t - last) / 1000);
                last = t;
                if (this.s.visible && this.geo) { this.step(dt); this.draw(); }
            };
            this.raf = requestAnimationFrame(loop);
        }

        disconnectedCallback() {
            cancelAnimationFrame(this.raf);
            this.ro?.disconnect();
            this.io?.disconnect();
            document.fonts.removeEventListener('loadingdone', this.onFonts);
            for (const k in this.h) this.removeEventListener(k, this.h[k] as EventListener);
        }

        dismissHint() {
            this.hint.style.opacity = '0';
            this.s.touched = true;
        }

        applyPalette() {
            const p = PALETTES[this.getAttribute('palette') as PaletteName] || PALETTES.Logo;
            this.style.background = this.hasAttribute('transparent') ? 'transparent' : p.bg;
            this.preGear.style.color = p.gear;
            this.preLetter.style.color = p.letter;
            this.hint.style.color = p.dim;
            this.hint.style.display = this.hasAttribute('no-hint') ? 'none' : 'flex';
        }

        layout() {
            const w = this.clientWidth, h = this.clientHeight;
            if (!w || !h) return;
            const scale = parseFloat(this.getAttribute('scale') ?? '') || 1;
            const fs = Math.max(6, Math.min(16, Math.min(w, h) / (62 * scale)));
            this.fs = fs;
            // The probe is 50 characters at 100px, so its width / 5000 is one character's width in ems.
            this.aspect = this.probe.getBoundingClientRect().width / 5000 || 0.6;
            this.cw = fs * this.aspect;               // monospace char width
            this.cols = Math.ceil(w / this.cw);
            this.rows = Math.ceil(h / fs);
            this.offX = (w - this.cols * this.cw) / 2;
            this.offY = (h - this.rows * fs) / 2;
            this.K = (Math.min(w, h) / fs) * 1.6 * scale; // projection scale
            for (const pre of [this.preGear, this.preLetter]) {
                pre.style.left = this.offX + 'px';
                pre.style.top = this.offY + 'px';
                pre.style.fontSize = fs + 'px';
                pre.style.lineHeight = fs + 'px';
            }
        }

        step(dt: number) {
            const s = this.s;
            const auto = !this.hasAttribute('no-autorotate') && !this.reduced;

            if (s.revealing) {
                s.reveal += (dt * this.rows) / 1.1;
                if (s.reveal > this.rows * 0.6) s.depth += (1 - s.depth) * (1 - Math.exp(-dt * 3));
            }

            if (!s.drag) {
                s.vy += ((auto ? 0.16 : 0) - s.vy) * (1 - Math.exp(-dt * 1.2));
                s.ry += s.vy * dt;
                s.vx *= Math.exp(-dt * 3);
                const targetRx = -0.3 + (s.mIn ? s.my * 0.28 : 0);
                s.rx += s.vx * dt + (targetRx - s.rx) * (1 - Math.exp(-dt * 2.2));
                if (s.mIn) s.ry += s.mx * 0.5 * dt;
            }

            s.vgz += ((auto ? -0.12 : 0) - s.vgz) * (1 - Math.exp(-dt * 1.4));
            s.gz += s.vgz * dt;
            s.frame++;
        }

        draw() {
            if (!this.cols || !this.geo) return;
            const geo = this.geo, s = this.s, cols = this.cols, rows = this.rows, n = cols * rows;

            if (!this.zb || !this.ch || !this.ty || this.zb.length !== n) {
                this.zb = new Float32Array(n);  // depth buffer
                this.ch = new Int16Array(n);    // ramp index per cell
                this.ty = new Uint8Array(n);    // layer per cell
            }
            const zb = this.zb, ch = this.ch, ty = this.ty;
            zb.fill(0); ch.fill(-1);

            const rampName = this.getAttribute('ramp');
            let ramp: string = RAMPS[rampName as RampName] || RAMPS.Classic;
            if (rampName === 'ASCII')
                ramp = this.asciiRamp ??= sortByInk(RAMPS.ASCII, getComputedStyle(this.preGear).fontFamily);
            const maxIdx = ramp.length - 1;
            const effect = this.getAttribute('effect') || 'Scramble';
            const cx = cols / 2, cy = rows / 2, K = this.K, depth = s.depth, aspect = this.aspect;
            const cg = Math.cos(s.gz), sg = Math.sin(s.gz);
            const cy_ = Math.cos(s.ry), sy = Math.sin(s.ry);
            const cx_ = Math.cos(s.rx), sx = Math.sin(s.rx);

            // light direction
            let lx = -0.45, ly = 0.55, lz = 0.7;
            const ll = Math.hypot(lx, ly, lz);
            lx /= ll; ly /= ll; lz /= ll;

            const radius = Math.max(6, rows * 0.13);
            const mc = s.mc, mr = s.mr, hover = s.mIn && !s.drag;

            for (let i = 0; i < geo.length; i += 7) {
                let x = geo[i], y = geo[i + 1], z = geo[i + 2] * depth;
                let nx = geo[i + 3], ny = geo[i + 4], nz = geo[i + 5];
                const layer = geo[i + 6];
                if (nz === 0 && depth < 0.04) continue; // skip side walls while flat

                // gear layer spins around Z
                if (layer === 0) {
                    let t = x * cg - y * sg; y = x * sg + y * cg; x = t;
                    t = nx * cg - ny * sg; ny = nx * sg + ny * cg; nx = t;
                }

                // yaw (Y axis)
                let a = x * cy_ + z * sy, b = -x * sy + z * cy_;
                x = a; z = b;
                a = nx * cy_ + nz * sy; b = -nx * sy + nz * cy_;
                nx = a; nz = b;

                // pitch (X axis)
                a = y * cx_ - z * sx; b = y * sx + z * cx_;
                y = a; z = b;
                a = ny * cx_ - nz * sx; b = ny * sx + nz * cx_;
                ny = a; nz = b;

                // perspective projection
                const invZ = 1 / (3.2 - z);
                let px = cx + (x * K * invZ) / aspect;
                let py = cy - y * K * invZ;

                if (hover && effect === 'Repel') {
                    const dx = (px - mc) * aspect, dy = py - mr, d = Math.hypot(dx, dy);
                    if (d < radius && d > 0.001) {
                        const push = (1 - d / radius) ** 2 * radius * 0.55;
                        px += ((dx / d) * push) / aspect;
                        py += (dy / d) * push;
                    }
                }

                const col = Math.floor(px), row = Math.floor(py);
                if (col < 0 || row < 0 || col >= cols || row >= rows) continue;
                const idx = row * cols + col;
                if (invZ <= zb[idx]) continue; // z-test
                zb[idx] = invZ;

                // Lambert shading -> character ramp
                const lum = nx * lx + ny * ly + nz * lz;
                ch[idx] = Math.max(0, Math.min(maxIdx, Math.floor(((lum + 0.25) / 1.25) * maxIdx + 0.5)));
                ty[idx] = layer;
            }

            // build two text layers (gear + letters) so each gets its own colour
            const gearLines: string[] = [], letterLines: string[] = [];
            const seed = s.frame >> 1, revealRow = s.reveal, revealing = revealRow < rows + 2;

            for (let r = 0; r < rows; r++) {
                let g = '', l = '';
                const hidden = r > revealRow;
                const onScanline = revealing && Math.abs(r - revealRow) < 1.5;

                for (let c = 0; c < cols; c++) {
                    const idx = r * cols + c, k = ch[idx];

                    if (onScanline && (k >= 0 || hash(r, c, seed) < 0.04)) {
                        g += ramp[Math.floor(hash(c, r, seed) * ramp.length)];
                        l += ' ';
                        continue;
                    }
                    if (hidden || k < 0) { g += ' '; l += ' '; continue; }

                    let chr = ramp[k];
                    if (hover && effect === 'Scramble') {
                        const d = Math.hypot((c - mc) * aspect, r - mr);
                        if (d < radius && hash(c, r, seed) < (1 - d / radius) * 0.9)
                            chr = ramp[Math.floor(hash(r, c, seed + 7) * ramp.length)];
                    }
                    if (ty[idx] === 0) { g += chr; l += ' '; }
                    else { g += ' '; l += chr; }
                }
                gearLines.push(g);
                letterLines.push(l);
            }

            this.preGear.textContent = gearLines.join('\n');
            this.preLetter.textContent = letterLines.join('\n');
        }
    }

    customElements.define('rs-ascii-logo', RsAsciiLogo);
}
