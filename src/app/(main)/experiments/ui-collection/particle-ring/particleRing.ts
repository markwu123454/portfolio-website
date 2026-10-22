/**
 * Particle ring — the hero background on antigravity.google.
 *
 * A jittered grid of grey specks. Near a slowly breathing, wobbling ring the
 * specks are pushed outward and drawn as short radial dashes, coloured by a
 * blue → violet → pink → red → orange → yellow gradient that turns around
 * the ring. The ring follows the pointer, and drifts on its own after a
 * couple of idle seconds.
 *
 * Ported from a full-window page: here it sizes to `host` and reads the
 * pointer relative to it. Returns { destroy }.
 */

// ---- Tunables ----
const SPACING = 24;          // px between particles (grid with jitter)
const JITTER = 0.85;         // 0..1 fraction of spacing used as random offset
const RING_SCALE = 0.36;     // ring radius as fraction of min(viewport w, h)
const BAND = 0.42;           // band thickness relative to ring radius
const PUSH = 14;             // px outward displacement inside the band
const DASH_MIN = 2, DASH_MAX = 7;
const FOLLOW_MOUSE = true;   // ring center eases toward the cursor
const IDLE_MS = 2500;        // after this long without mouse movement, ring drifts on its own

// Gradient along the ring (Google-ish: blue -> violet -> pink -> red -> orange -> yellow)
const STOPS: [number, [number, number, number]][] = [
    [0.00, [ 66, 110, 244]],
    [0.30, [ 98,  92, 238]],
    [0.50, [160,  86, 214]],
    [0.66, [226,  70, 120]],
    [0.80, [236,  72,  58]],
    [0.92, [244, 128,  40]],
    [1.00, [250, 188,  20]],
];
const LUT: string[] = [];
for (let i = 0; i < 128; i++) {
    const t = i / 127;
    let k = 0; while (k < STOPS.length - 2 && t > STOPS[k + 1][0]) k++;
    const [t0, c0] = STOPS[k], [t1, c1] = STOPS[k + 1];
    const u = (t - t0) / (t1 - t0);
    LUT.push(c0.map((v, j) => Math.round(v + (c1[j] - v) * u)).join(','));
}

const TAU = Math.PI * 2;
// angle that maps to the start (blue) of the gradient: upper-left
const START_ANGLE = -Math.PI * 0.75;

interface Particle { x: number; y: number; seed: number; gray: number }

export function startParticleRing(canvas: HTMLCanvasElement, host: HTMLElement): { destroy(): void } {
    const ctx = canvas.getContext('2d');
    if (!ctx) return { destroy() {} };

    let W = 0, H = 0, DPR = 1, raf = 0;
    let particles: Particle[] = [];
    const center = { x: 0, y: 0 };
    const mouse = { x: 0, y: 0, last: -Infinity };

    function resize() {
        DPR = Math.min(window.devicePixelRatio || 1, 2);
        W = host.clientWidth; H = host.clientHeight;
        canvas.width = Math.round(W * DPR);
        canvas.height = Math.round(H * DPR);
        ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
        particles = [];
        for (let y = -SPACING; y < H + SPACING; y += SPACING) {
            for (let x = -SPACING; x < W + SPACING; x += SPACING) {
                particles.push({
                    x: x + (Math.random() - 0.5) * SPACING * JITTER,
                    y: y + (Math.random() - 0.5) * SPACING * JITTER,
                    seed: Math.random() * Math.PI * 2,
                    gray: 0.18 + Math.random() * 0.3,
                });
            }
        }
        if (!center.x) { center.x = W / 2; center.y = H * 0.5; }
    }

    const onPointerMove = (e: PointerEvent) => {
        // The canvas starts inside the host's border; clientLeft/Top are that border's width.
        const r = host.getBoundingClientRect();
        mouse.x = e.clientX - r.left - host.clientLeft;
        mouse.y = e.clientY - r.top - host.clientTop;
        mouse.last = performance.now();
    };

    function frame(now: number) {
        const t = now / 1000;
        const c = ctx!;

        // Target for the ring center: cursor when active, slow drift otherwise
        let tx, ty;
        if (FOLLOW_MOUSE && now - mouse.last < IDLE_MS) {
            tx = mouse.x; ty = mouse.y;
        } else {
            tx = W * (0.5 + 0.22 * Math.sin(t * 0.21) + 0.08 * Math.sin(t * 0.53));
            ty = H * (0.5 + 0.18 * Math.cos(t * 0.17) + 0.06 * Math.sin(t * 0.41));
        }
        center.x += (tx - center.x) * 0.035;
        center.y += (ty - center.y) * 0.035;

        const baseR = Math.min(W, H) * RING_SCALE * (1 + 0.07 * Math.sin(t * 0.6));
        const band = baseR * BAND;
        const rot = t * 0.15; // slow rotation of the color gradient

        c.clearRect(0, 0, W, H);
        c.lineCap = 'round';

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            // gentle idle float
            const fx = p.x + Math.sin(t * 0.7 + p.seed) * 1.2;
            const fy = p.y + Math.cos(t * 0.6 + p.seed * 1.3) * 1.2;

            const dx = fx - center.x, dy = fy - center.y;
            const d = Math.hypot(dx, dy) || 0.0001;
            const a = Math.atan2(dy, dx);

            // irregular, breathing ring radius per angle
            const R = baseR * (1
                + 0.10 * Math.sin(3 * a + t * 0.8)
                + 0.06 * Math.sin(5 * a - t * 1.1)
                + 0.04 * Math.sin(2 * a + t * 0.35));

            const z = (d - R) / band;
            let f = Math.exp(-z * z * 2.2); // 0..1 influence
            // thin out the band toward the edges so it looks scattered
            f *= 0.75 + 0.25 * Math.sin(p.seed * 7 + t * 1.5);

            if (f < 0.12) {
                c.fillStyle = `rgba(60,64,72,${p.gray})`;
                c.fillRect(fx - 0.6, fy - 0.6, 1.2, 1.2);
                continue;
            }

            const ux = dx / d, uy = dy / d;
            const push = PUSH * f;
            const px = fx + ux * push, py = fy + uy * push;
            const len = DASH_MIN + (DASH_MAX - DASH_MIN) * f;

            let g = (a - START_ANGLE - rot) / TAU;
            g = g - Math.floor(g);
            // fold so the gradient runs blue -> yellow -> back smoothly around the circle
            g = g < 0.5 ? g * 2 : (1 - g) * 2;
            const col = LUT[Math.min(127, Math.floor(g * 127))];

            c.strokeStyle = `rgba(${col},${Math.min(1, f * 1.15)})`;
            c.lineWidth = 1.3 + f * 0.9;
            c.beginPath();
            c.moveTo(px - ux * len * 0.5, py - uy * len * 0.5);
            c.lineTo(px + ux * len * 0.5, py + uy * len * 0.5);
            c.stroke();
        }

        raf = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    host.addEventListener('pointermove', onPointerMove);
    resize();
    raf = requestAnimationFrame(frame);

    return {
        destroy() {
            cancelAnimationFrame(raf);
            ro.disconnect();
            host.removeEventListener('pointermove', onPointerMove);
        },
    };
}
