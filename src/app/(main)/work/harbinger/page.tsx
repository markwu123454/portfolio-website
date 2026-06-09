import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Harbinger — Mark Wu",
    description:
        "Differential turret with a coilgun actuator. ESP32 + SimpleFOC control, programmable high-voltage driver, Qt desktop app over Bluetooth.",
};

/* ─────────────────────────────────────────────────────────────────
   Page-local styles. Tokens come from the global stylesheet
   (redesign/tokens.css). Class names prefixed `hb-` for scope.

   Layout pattern matches /work/aetherius:
     • breadcrumbs · kicker
     • two-col hero (h1 L / dek+chips+links R)
     • wide stat strip
     • main article column + sticky TOC sidebar
   Content is the real Harbinger source — early-stage, four
   sections, one image, honest about not-yet-built parts.
   ───────────────────────────────────────────────────────────────── */
const styles = `
.hb-page { max-width: 1180px; margin: 0 auto; padding: 56px 56px 96px; }
@media (max-width: 720px) { .hb-page { padding: 32px 24px 64px; } }

/* Breadcrumbs */
.hb-crumbs {
  font-family: var(--font-mono); font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--fg-soft);
  margin-bottom: 28px;
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
}
.hb-crumbs a { color: var(--fg-muted); text-decoration: none; }
.hb-crumbs a:hover { color: var(--accent); }
.hb-crumbs .sep { color: var(--fg-soft); }
.hb-crumbs .here { color: var(--fg); }

/* Kicker */
.hb-kicker {
  font-family: var(--font-mono); font-size: 11px;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--accent); margin-bottom: 18px;
  display: flex; align-items: center; gap: 10px;
}
.hb-kicker .dot { color: var(--fg-soft); }

/* Hero — two columns */
.hb-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 48px;
  align-items: start;
  margin-bottom: 40px;
}
@media (max-width: 880px) {
  .hb-hero { grid-template-columns: 1fr; gap: 28px; }
}
.hb-hero h1 {
  margin: 0;
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: -0.025em;
  font-size: clamp(40px, 5vw, 60px);
  max-width: 760px;
}
.hb-hero h1 .cont {
  display: block;
  color: var(--fg-muted);
  font-style: italic;
  font-weight: 500;
}
.hb-hero .right {
  display: flex; flex-direction: column; gap: 16px;
}
.hb-hero .right .dek {
  margin: 0;
  font-size: 15.5px; line-height: 1.65;
  color: var(--fg-muted);
  max-width: 420px;
}
.hb-hero .right .chips {
  display: flex; flex-wrap: wrap; gap: 6px;
}
.hb-hero .right .repos {
  display: flex; flex-direction: column; gap: 4px;
  padding-top: 12px; border-top: 1px solid var(--rule);
  font-family: var(--font-mono); font-size: 11.5px;
}
.hb-hero .right .repos .lab {
  font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--fg-soft); margin-bottom: 4px;
}
.hb-hero .right .repos a {
  color: var(--fg-muted); text-decoration: none;
  display: inline-flex; align-items: center; gap: 6px;
  width: max-content; max-width: 100%;
}
.hb-hero .right .repos a:hover { color: var(--accent); }
.hb-hero .right .repos a .arrow { color: var(--fg-soft); font-size: 10px; }
.hb-hero .right .repos a:hover .arrow { color: var(--accent); }

/* Pill + tags */
.hb-pill {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: var(--font-mono); font-size: 10.5px;
  letter-spacing: 0.14em; text-transform: uppercase;
  padding: 3px 10px 3px 8px;
  border: 1px solid var(--rule-strong); border-radius: 999px;
  color: var(--fg-muted);
}
.hb-pill .dot { width: 6px; height: 6px; border-radius: 999px; background: var(--fg-soft); }
.hb-pill.warn .dot { background: var(--warn); }

.hb-tag {
  font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.04em;
  padding: 4px 9px; border: 1px solid var(--rule-strong);
  border-radius: 3px; color: var(--fg-muted);
}

/* StatStrip */
.hb-stat-strip {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;
  border: 1px solid var(--rule); border-radius: 4px;
  margin-bottom: 40px; overflow: hidden;
}
.hb-stat-strip .stat {
  padding: 22px 20px; border-right: 1px solid var(--rule);
  display: flex; flex-direction: column; gap: 8px;
}
.hb-stat-strip .stat:last-child { border-right: 0; }
.hb-stat-strip .stat .v {
  font-family: var(--font-mono); font-weight: 500;
  font-size: 14.5px; letter-spacing: -0.005em;
  color: var(--fg); line-height: 1.35;
}
.hb-stat-strip .stat .k {
  font-family: var(--font-mono); font-size: 10px;
  letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--fg-soft);
}
@media (max-width: 720px) {
  .hb-stat-strip { grid-template-columns: repeat(2, 1fr); }
  .hb-stat-strip .stat:nth-child(2) { border-right: 0; }
  .hb-stat-strip .stat:nth-child(1),
  .hb-stat-strip .stat:nth-child(2) { border-bottom: 1px solid var(--rule); }
}

/* Hero figure */
.hb-fig {
  margin: 8px 0 0; padding: 16px 0;
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
}
.hb-fig .frame {
  background: var(--bg-elev);
  border: 1px solid var(--rule);
  position: relative; overflow: hidden;
}
.hb-fig .frame .img-wrap { position: relative; width: 100%; display: block; line-height: 0; }
.hb-fig .frame .img-wrap img { width: 100% !important; height: auto !important; display: block; }
.hb-fig figcaption {
  font-family: var(--font-mono); font-size: 11px;
  letter-spacing: 0.04em; line-height: 1.55;
  color: var(--fg-soft); margin-top: 12px;
}
.hb-fig figcaption .num { color: var(--fg-muted); margin-right: 4px; }

/* Body — article + sidebar */
.hb-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px;
  gap: 48px;
  margin-top: 56px;
}
@media (max-width: 880px) {
  .hb-body { grid-template-columns: 1fr; gap: 32px; }
}
.hb-article { min-width: 0; }

/* Section */
.hb-sec { margin-bottom: 56px; scroll-margin-top: 80px; }
.hb-sec:last-child { margin-bottom: 0; }
.hb-sec .sec-head {
  display: flex; align-items: baseline; gap: 12px;
  padding-bottom: 14px; margin-bottom: 24px;
  border-bottom: 1px solid var(--rule);
}
.hb-sec .sec-head .num {
  font-family: var(--font-mono); font-size: 12px;
  letter-spacing: 0.16em; color: var(--accent);
  font-weight: 500; flex-shrink: 0;
}
.hb-sec .sec-head h2 {
  margin: 0; font-size: 26px; font-weight: 600;
  letter-spacing: -0.015em; line-height: 1.15;
}
.hb-sec .sec-head .label-right {
  margin-left: auto;
  font-family: var(--font-mono); font-size: 10px;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--fg-soft); align-self: center;
}
.hb-sec .prose p {
  margin: 0 0 1em;
  font-size: 15.5px; line-height: 1.7; color: var(--fg-muted);
  max-width: 640px;
}
.hb-sec .prose p:last-child { margin-bottom: 0; }
.hb-sec .prose em { font-style: italic; }
.hb-sec .prose strong { font-weight: 600; color: var(--fg); }

/* Sidebar TOC */
.hb-sidebar {
  align-self: start;
  font-size: 13px;
}
@media (min-width: 881px) {
  .hb-sidebar { position: sticky; top: 96px; }
}
.hb-sidebar .toc {
  border-top: 1px solid var(--rule);
  padding-top: 14px;
}
.hb-sidebar .toc .label {
  font-family: var(--font-mono); font-size: 10px;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--fg-soft); margin-bottom: 12px;
}
.hb-sidebar .toc ul {
  list-style: none; margin: 0; padding: 0;
  display: flex; flex-direction: column; gap: 6px;
}
.hb-sidebar .toc a {
  font-size: 13px; color: var(--fg-muted);
  text-decoration: none; transition: color 120ms ease;
}
.hb-sidebar .toc a:hover { color: var(--accent); }
.hb-sidebar .toc .ix {
  font-family: var(--font-mono); font-size: 10.5px;
  color: var(--fg-soft); margin-right: 8px;
  letter-spacing: 0.06em;
}
`;

/* ─── Image manifest ────────────────────────────────────────── */
const IMG = {
    electronics: { src: "/harbinger/img.png", w: 2880, h: 2160 },
} as const;

/* ─── Repos (header links) ──────────────────────────────────── */
const REPOS = [
    { label: "Harbinger",    href: "https://github.com/markwu123454/Harbinger" },
    { label: "HarbingerApp", href: "https://github.com/markwu123454/HarbingerApp" },
] as const;

/* ─── TOC source of truth ───────────────────────────────────── */
const TOC = [
    { id: "s01", num: "01", label: "What it is" },
    { id: "s02", num: "02", label: "Coilgun design" },
    { id: "s03", num: "03", label: "Control system" },
    { id: "s04", num: "04", label: "Qt app" },
] as const;

export default function HarbingerPage() {
    return (
        <>
            <style>{styles}</style>

            <main className="notebook hb-page">
                {/* ─ Breadcrumbs ──────────────────────────────────────── */}
                <nav className="hb-crumbs" aria-label="Breadcrumb">
                    <Link href="/work">Work</Link>
                    <span className="sep">/</span>
                    <span className="here">Harbinger</span>
                </nav>

                {/* ─ Kicker ───────────────────────────────────────────── */}
                <div className="hb-kicker">
                    <span>Project</span>
                    <span className="dot">·</span>
                    <span>#01</span>
                    <span className="dot">·</span>
                    <span>Active</span>
                </div>

                {/* ─ Hero ─ two columns ──────────────────────────────── */}
                <div className="hb-hero">
                    <h1>
                        Harbinger —
                        <span className="cont">differential turret with a coilgun actuator.</span>
                    </h1>

                    <div className="right">
                        <p className="dek">
                            Closed-loop heading control on an ESP32, programmable
                            high-voltage driver, Qt desktop app over Bluetooth.
                        </p>
                        <div className="chips">
                            <span className="hb-pill warn"><span className="dot" />Paused</span>
                            <span className="hb-tag">ESP32</span>
                            <span className="hb-tag">SimpleFOC</span>
                            <span className="hb-tag">C++</span>
                            <span className="hb-tag">Qt</span>
                            <span className="hb-tag">Bluetooth</span>
                        </div>
                        <div className="repos">
                            <div className="lab">Source</div>
                            {REPOS.map((r) => (
                                <a
                                    key={r.label}
                                    href={r.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {r.label}
                                    <span className="arrow">↗</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ─ Stat strip ───────────────────────────────────────── */}
                <div className="hb-stat-strip" aria-label="Build specs">
                    <div className="stat">
                        <span className="v">ESP32</span>
                        <span className="k">MCU</span>
                    </div>
                    <div className="stat">
                        <span className="v">Gimbal motors · SimpleFOC</span>
                        <span className="k">Drive</span>
                    </div>
                    <div className="stat">
                        <span className="v">Coilgun · 3–5 stage</span>
                        <span className="k">Actuator</span>
                    </div>
                    <div className="stat">
                        <span className="v">Steel ball bearings</span>
                        <span className="k">Projectile</span>
                    </div>
                </div>

                {/* ─ Hero figure ──────────────────────────────────────── */}
                <figure className="hb-fig">
                    <div className="frame">
                        <div className="img-wrap">
                            <Image
                                src={IMG.electronics.src}
                                width={IMG.electronics.w}
                                height={IMG.electronics.h}
                                alt="Harbinger electronics bay — ESP32 control board, motor drivers, and supporting electronics."
                                sizes="(max-width: 880px) 100vw, 1068px"
                                priority
                            />
                        </div>
                    </div>
                    <figcaption>
                        <span className="num">Fig. 1 —</span>
                        Electronics bay. ESP32 control board, motor drivers, and the
                        rest of the low-voltage stack; coilgun driver lives separately.
                    </figcaption>
                </figure>

                {/* ─ Body ─ article + sidebar ─────────────────────────── */}
                <div className="hb-body">
                    <article className="hb-article">
                        {/* 01 */}
                        <section className="hb-sec" id="s01">
                            <div className="sec-head">
                                <span className="num">01 —</span>
                                <h2>What it is</h2>
                                <span className="label-right">System overview</span>
                            </div>
                            <div className="prose">
                                <p>
                                    A differential turret driven by gimbal motors, controlled
                                    by an <strong>ESP32</strong> running <em>SimpleFOC</em>. A
                                    Qt desktop app connects over Bluetooth, currently handles
                                    enable/disable and manual turret movement, with PID tuning
                                    and settings management coming next.
                                </p>
                                <p>
                                    The coilgun sits on top as the actuator: a programmable
                                    electromagnetic linear actuator with variable output energy.
                                </p>
                            </div>
                        </section>

                        {/* 02 */}
                        <section className="hb-sec" id="s02">
                            <div className="sec-head">
                                <span className="num">02 —</span>
                                <h2>Coilgun design</h2>
                                <span className="label-right">Planning · not built</span>
                            </div>
                            <div className="prose">
                                <p>
                                    Three- or five-stage coilgun. Projectile is a steel ball
                                    bearing. The power supply is a programmable voltage
                                    converter running 25–200&nbsp;V, varying output voltage is
                                    the mechanism for controlling muzzle energy.
                                </p>
                                <p>
                                    Electronic components are mostly specified. Still in
                                    planning; no build started yet.
                                </p>
                            </div>
                        </section>

                        {/* 03 */}
                        <section className="hb-sec" id="s03">
                            <div className="sec-head">
                                <span className="num">03 —</span>
                                <h2>Control system</h2>
                                <span className="label-right">Blocked · encoders</span>
                            </div>
                            <div className="prose">
                                <p>
                                    Absolute encoders feeding a PID heading controller. Current
                                    blocker: getting the encoders to register reliably. Once
                                    that is resolved, the plan is a more complex control loop
                                    beyond basic PID. Gimbal motors were chosen for their
                                    torque characteristics at low speed.
                                </p>
                            </div>
                        </section>

                        {/* 04 */}
                        <section className="hb-sec" id="s04">
                            <div className="sec-head">
                                <span className="num">04 —</span>
                                <h2>Qt app</h2>
                                <span className="label-right">Windows · Bluetooth</span>
                            </div>
                            <div className="prose">
                                <p>
                                    Windows desktop app. Connects to the ESP32 over Bluetooth.
                                    Current features: enable/disable subsystems, manual turret
                                    movement. In progress: PID tuning interface, settings
                                    management.
                                </p>
                            </div>
                        </section>
                    </article>

                    {/* ─ Sidebar TOC ──────────────────────────────────── */}
                    <aside className="hb-sidebar" aria-label="On this page">
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