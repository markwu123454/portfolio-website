/**
 * Banner History, archived 2026-10-21. Pulled from the site; kept here
 * so it can be restored. Not built, linted or routed (archive/ is
 * excluded in tsconfig and eslint).
 *
 * Layout of this folder, and where each part lived:
 *   page/     ← src/app/(main)/experiments/banner-history/
 *   scripts/  ← scripts/banner-extractor/
 *   public/   ← public/banner-history/
 *
 * To restore: move the three folders back, re-add the npm scripts
 *   "extract:banners":   "node scripts/banner-extractor/extract.mjs",
 *   "process:icons":     "node scripts/banner-extractor/process-icons.mjs",
 *   "fetch:agent-icons": "node scripts/banner-extractor/fetch-agent-icons.mjs"
 * add '/experiments/banner-history' back to STATIC_PATHS in
 * src/app/sitemap.ts, and paste the preview + READY entry below back
 * into src/app/(main)/experiments/page.tsx.
 */

/* ── Banner History — rerun-cadence gantt ───────────────────────── */

const BH_ROWS = [
    { y: 40, accent: '#7dd3fc', dots: [18, 70, 150, 250], drought: 330 },
    { y: 78, accent: '#fb923c', dots: [40, 130, 300], drought: 300 },
    { y: 116, accent: '#c084fc', dots: [95, 205], drought: 250 },
    { y: 154, accent: '#4ade80', dots: [140, 210, 260, 315], drought: 340 },
    { y: 192, accent: '#f87171', dots: [175, 285], drought: 250 },
];
const BH_VLINES = [18, 78, 138, 198, 258, 318];

const BANNER_HISTORY_PREVIEW = (
    <svg viewBox="0 0 360 232" preserveAspectRatio="xMidYMid meet" className="w-full h-full" aria-hidden>
        {BH_VLINES.map((vx) => (
            <line key={vx} x1={vx} x2={vx} y1={20} y2={214} stroke="var(--rule)" strokeWidth={1} />
        ))}
        <line x1={330} x2={330} y1={20} y2={214} stroke="var(--accent)" strokeWidth={1.5} opacity={0.7} />
        {BH_ROWS.map((r, i) => (
            <g key={i}>
                <line x1={r.dots[0]} x2={r.dots[r.dots.length - 1]} y1={r.y} y2={r.y} stroke={r.accent} strokeWidth={2} opacity={0.45} />
                <line x1={r.dots[r.dots.length - 1]} x2={r.drought} y1={r.y} y2={r.y} stroke="var(--fg-soft)" strokeWidth={1} strokeDasharray="2 3" />
                {r.dots.map((dx, j) => (
                    <circle key={j} cx={dx} cy={r.y} r={j === 0 ? 5 : 3.6}
                            fill={j === 0 ? 'var(--bg)' : r.accent} stroke={r.accent} strokeWidth={j === 0 ? 2.2 : 1} />
                ))}
            </g>
        ))}
    </svg>
);

export const BANNER_HISTORY_ENTRY = {
    href: '/experiments/banner-history',
    category: 'DATA',
    title: 'Banner History',
    blurb: 'A ZZZ rerun-cadence tracker: every agent banner since 1.0, ranked by how overdue each one is for a rerun. Auto-scraped, self-updating.',
    preview: BANNER_HISTORY_PREVIEW,
};
