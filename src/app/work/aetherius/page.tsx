import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Aetherius UAV — Mark Wu",
    description:
        "Fixed-wing UAV build — twin-boom foam/CF airframe with self-sourced avionics. Pixhawk 6X, SiK telemetry, QGroundControl. Pre-maiden.",
};

/* ─────────────────────────────────────────────────────────────────
   Page-local styles. Tokens come from the global stylesheet
   (redesign/tokens.css). Class names prefixed `ae-` for scope.

   Layout pattern adopted from the design-team skeleton:
     • breadcrumbs
     • kicker
     • two-col hero (title L / dek+chips R)
     • wide stat strip
     • main article column + sticky TOC sidebar
   Content is the real Aetherius source — no fabricated revs, dates,
   code, or rev-4 specifics.
   ───────────────────────────────────────────────────────────────── */
const styles = `
.ae-page { max-width: 1180px; margin: 0 auto; padding: 56px 56px 96px; }
@media (max-width: 720px) { .ae-page { padding: 32px 24px 64px; } }

/* Breadcrumbs */
.ae-crumbs {
  font-family: var(--font-mono); font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--fg-soft);
  margin-bottom: 28px;
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
}
.ae-crumbs a { color: var(--fg-muted); text-decoration: none; }
.ae-crumbs a:hover { color: var(--accent); }
.ae-crumbs .sep { color: var(--fg-soft); }
.ae-crumbs .here { color: var(--fg); }

/* Kicker */
.ae-kicker {
  font-family: var(--font-mono); font-size: 11px;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--accent); margin-bottom: 18px;
  display: flex; align-items: center; gap: 10px;
}
.ae-kicker .dot { color: var(--fg-soft); }

/* Hero — two columns */
.ae-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 48px;
  align-items: start;
  margin-bottom: 40px;
}
@media (max-width: 880px) {
  .ae-hero { grid-template-columns: 1fr; gap: 28px; }
}
.ae-hero h1 {
  margin: 0;
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: -0.025em;
  font-size: clamp(40px, 5vw, 60px);
  max-width: 760px;
}
.ae-hero h1 .cont {
  display: block;
  color: var(--fg-muted);
  font-style: italic;
  font-weight: 500;
}
.ae-hero .right {
  display: flex; flex-direction: column; gap: 14px;
}
.ae-hero .right .dek {
  margin: 0;
  font-size: 15.5px; line-height: 1.65;
  color: var(--fg-muted);
  max-width: 420px;
}
.ae-hero .right .chips {
  display: flex; flex-wrap: wrap; gap: 6px;
}

/* Pill + tags shared with rest of system */
.ae-pill {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: var(--font-mono); font-size: 10.5px;
  letter-spacing: 0.14em; text-transform: uppercase;
  padding: 3px 10px 3px 8px;
  border: 1px solid var(--rule-strong); border-radius: 999px;
  color: var(--fg-muted);
}
.ae-pill .dot { width: 6px; height: 6px; border-radius: 999px; background: var(--fg-soft); }
.ae-pill.warn .dot { background: var(--warn); }

.ae-tag {
  font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.04em;
  padding: 4px 9px; border: 1px solid var(--rule-strong);
  border-radius: 3px; color: var(--fg-muted);
}

/* StatStrip — 4 cols, wider container */
.ae-stat-strip {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;
  border: 1px solid var(--rule); border-radius: 4px;
  margin-bottom: 40px; overflow: hidden;
}
.ae-stat-strip .stat {
  padding: 22px 20px; border-right: 1px solid var(--rule);
  display: flex; flex-direction: column; gap: 8px;
}
.ae-stat-strip .stat:last-child { border-right: 0; }
.ae-stat-strip .stat .v {
  font-family: var(--font-mono); font-weight: 500;
  font-size: 14.5px; letter-spacing: -0.005em;
  color: var(--fg); line-height: 1.35;
}
.ae-stat-strip .stat .k {
  font-family: var(--font-mono); font-size: 10px;
  letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--fg-soft);
}
@media (max-width: 720px) {
  .ae-stat-strip { grid-template-columns: repeat(2, 1fr); }
  .ae-stat-strip .stat:nth-child(2) { border-right: 0; }
  .ae-stat-strip .stat:nth-child(1),
  .ae-stat-strip .stat:nth-child(2) { border-bottom: 1px solid var(--rule); }
}

/* Hero figure */
.ae-fig {
  margin: 8px 0 0; padding: 16px 0;
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
}
.ae-fig .frame {
  background: var(--bg-elev);
  border: 1px solid var(--rule);
  position: relative; overflow: hidden;
}
.ae-fig .frame .img-wrap { position: relative; width: 100%; display: block; line-height: 0; }
.ae-fig .frame .img-wrap img { width: 100% !important; height: auto !important; display: block; }
.ae-fig figcaption {
  font-family: var(--font-mono); font-size: 11px;
  letter-spacing: 0.04em; line-height: 1.55;
  color: var(--fg-soft); margin-top: 12px;
}
.ae-fig figcaption .num { color: var(--fg-muted); margin-right: 4px; }

/* Body — article + sidebar */
.ae-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px;
  gap: 48px;
  margin-top: 56px;
}
@media (max-width: 880px) {
  .ae-body { grid-template-columns: 1fr; gap: 32px; }
}
.ae-article { min-width: 0; }

/* Section (L.03) */
.ae-sec { margin-bottom: 56px; scroll-margin-top: 80px; }
.ae-sec:last-child { margin-bottom: 0; }
.ae-sec .sec-head {
  display: flex; align-items: baseline; gap: 12px;
  padding-bottom: 14px; margin-bottom: 24px;
  border-bottom: 1px solid var(--rule);
}
.ae-sec .sec-head .num {
  font-family: var(--font-mono); font-size: 12px;
  letter-spacing: 0.16em; color: var(--accent);
  font-weight: 500; flex-shrink: 0;
}
.ae-sec .sec-head h2 {
  margin: 0; font-size: 26px; font-weight: 600;
  letter-spacing: -0.015em; line-height: 1.15;
}
.ae-sec .sec-head .label-right {
  margin-left: auto;
  font-family: var(--font-mono); font-size: 10px;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--fg-soft); align-self: center;
}
.ae-sec .prose p {
  margin: 0 0 1em;
  font-size: 15.5px; line-height: 1.7; color: var(--fg-muted);
  max-width: 640px;
}
.ae-sec .prose p:last-child { margin-bottom: 0; }
.ae-sec .prose em { font-style: italic; }
.ae-sec .prose strong { font-weight: 600; color: var(--fg); }

/* Sidebar TOC */
.ae-sidebar {
  align-self: start;
  font-size: 13px;
}
@media (min-width: 881px) {
  .ae-sidebar { position: sticky; top: 96px; }
}
.ae-sidebar .toc {
  border-top: 1px solid var(--rule);
  padding-top: 14px;
}
.ae-sidebar .toc .label {
  font-family: var(--font-mono); font-size: 10px;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--fg-soft); margin-bottom: 12px;
}
.ae-sidebar .toc ul {
  list-style: none; margin: 0; padding: 0;
  display: flex; flex-direction: column; gap: 6px;
}
.ae-sidebar .toc a {
  font-size: 13px; color: var(--fg-muted);
  text-decoration: none; transition: color 120ms ease;
}
.ae-sidebar .toc a:hover { color: var(--accent); }
.ae-sidebar .toc .ix {
  font-family: var(--font-mono); font-size: 10.5px;
  color: var(--fg-soft); margin-right: 8px;
  letter-spacing: 0.06em;
}
`;

/* ─── Image manifest ────────────────────────────────────────── */
const IMG = {
    plane: { src: "/aetherius/dd2f2ce996d5ddd75e8cf7fc5e3e01f1.jpg", w: 985, h: 738 },
} as const;

/* ─── TOC source of truth ───────────────────────────────────── */
const TOC = [
    { id: "s01", num: "01", label: "The build" },
    { id: "s02", num: "02", label: "Avionics decisions" },
    { id: "s03", num: "03", label: "Flight status" },
    { id: "s04", num: "04", label: "Ground control station" },
] as const;

export default function AetheriusPage() {
    return (
        <>
            <style>{styles}</style>

            <main className="notebook ae-page">
                {/* ─ Breadcrumbs ──────────────────────────────────────── */}
                <nav className="ae-crumbs" aria-label="Breadcrumb">
                    <Link href="/work">Work</Link>
                    <span className="sep">/</span>
                    <Link href="/work?domain=Drones">Drones</Link>
                    <span className="sep">/</span>
                    <span className="here">Aetherius UAV</span>
                </nav>

                {/* ─ Kicker ───────────────────────────────────────────── */}
                <div className="ae-kicker">
                    <span>Project</span>
                    <span className="dot">·</span>
                    <span>Drones</span>
                    <span className="dot">·</span>
                    <span>2024 —</span>
                </div>

                {/* ─ Hero ─ two columns ──────────────────────────────── */}
                <div className="ae-hero">
                    <h1>
                        Aetherius UAV —
                        <span className="cont">fixed-wing build, pre-maiden.</span>
                    </h1>

                    <div className="right">
                        <p className="dek">
                            Off-the-shelf twin-boom foam/CF airframe with self-sourced
                            avionics. One short flight before a crash; not counting it as a
                            maiden. Next attempt planned for summer.
                        </p>
                        <div className="chips">
                            <span className="ae-pill warn"><span className="dot" />Building</span>
                            <span className="ae-tag">Fixed-wing</span>
                            <span className="ae-tag">Pixhawk 6X</span>
                        </div>
                    </div>
                </div>

                {/* ─ Stat strip ───────────────────────────────────────── */}
                <div className="ae-stat-strip" aria-label="Build specs">
                    <div className="stat">
                        <span className="v">Twin-boom · foam + CF</span>
                        <span className="k">Airframe</span>
                    </div>
                    <div className="stat">
                        <span className="v">~ 2 m</span>
                        <span className="k">Wingspan</span>
                    </div>
                    <div className="stat">
                        <span className="v">Pixhawk 6X</span>
                        <span className="k">Flight controller</span>
                    </div>
                    <div className="stat">
                        <span className="v">Pre-maiden</span>
                        <span className="k">Stage</span>
                    </div>
                </div>

                {/* ─ Hero figure ──────────────────────────────────────── */}
                <figure className="ae-fig">
                    <div className="frame">
                        <div className="img-wrap">
                            <Image
                                src={IMG.plane.src}
                                width={IMG.plane.w}
                                height={IMG.plane.h}
                                alt="Aetherius — twin-boom foam and carbon-fiber UAV airframe."
                                sizes="(max-width: 880px) 100vw, 1068px"
                                priority
                            />
                        </div>
                    </div>
                    <figcaption>
                        <span className="num">Fig. 1 —</span>
                        Aetherius airframe — twin-boom, foam and carbon-fiber construction.
                        Off-the-shelf platform; avionics sourced separately.
                    </figcaption>
                </figure>

                {/* ─ Body ─ article + sidebar ─────────────────────────── */}
                <div className="ae-body">
                    <article className="ae-article">
                        {/* 01 */}
                        <section className="ae-sec" id="s01">
                            <div className="sec-head">
                                <span className="num">01 —</span>
                                <h2>The build</h2>
                                <span className="label-right">Airframe + electronics</span>
                            </div>
                            <div className="prose">
                                <p>
                                    Off-the-shelf twin-boom foam and carbon-fiber airframe.
                                    Electronics sourced separately: a{" "}
                                    <strong>Pixhawk 6X</strong> flight controller, an{" "}
                                    <strong>FSi6</strong> transmitter, and a{" "}
                                    <strong>SiK</strong> telemetry radio. Ground station is{" "}
                                    <em>QGroundControl</em>.
                                </p>
                            </div>
                        </section>

                        {/* 02 */}
                        <section className="ae-sec" id="s02">
                            <div className="sec-head">
                                <span className="num">02 —</span>
                                <h2>Avionics decisions</h2>
                                <span className="label-right">Telemetry path</span>
                            </div>
                            <div className="prose">
                                <p>
                                    Originally planned to use a Raspberry Pi as a companion
                                    computer to relay telemetry to a laptop. Ditched in favor
                                    of the SiK radio — simpler, more reliable, less friction
                                    to get flying.
                                </p>
                            </div>
                        </section>

                        {/* 03 */}
                        <section className="ae-sec" id="s03">
                            <div className="sec-head">
                                <span className="num">03 —</span>
                                <h2>Flight status</h2>
                                <span className="label-right">1 attempt · pre-maiden</span>
                            </div>
                            <div className="prose">
                                <p>
                                    One flight attempt. The plane flew for a few seconds before
                                    crashing. Not counting it as a maiden. Next flight planned
                                    for summer.
                                </p>
                            </div>
                        </section>

                        {/* 04 */}
                        <section className="ae-sec" id="s04">
                            <div className="sec-head">
                                <span className="num">04 —</span>
                                <h2>Ground control station</h2>
                                <span className="label-right">Shelved</span>
                            </div>
                            <div className="prose">
                                <p>
                                    A custom GCS was started in parallel. <em>v1</em> was a
                                    Python / FastAPI hosted web app; <em>v2</em> was a Tauri
                                    desktop app with a Python backend. Both are shelved for now
                                    while the airframe takes priority. May return to it.
                                </p>
                            </div>
                        </section>
                    </article>

                    {/* ─ Sidebar TOC ──────────────────────────────────── */}
                    <aside className="ae-sidebar" aria-label="On this page">
                        <div className="toc">
                            <div className="label">On this page</div>
                            <ul>
                                {TOC.map((t) => (
                                    <li key={t.id}>
                                        <a href={`#${t.id}`}>
                                            <span className="ix">{t.num}</span>
                                            {t.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>
                </div>
            </main>
        </>
    );
}