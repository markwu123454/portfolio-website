import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "SprocketStats — Mark Wu",
    description:
        "A full-stack scouting platform for FRC — ensemble prediction, field-mapped input, and a guest sharing system that turns scouted data into a team-facing tool.",
};

/* ─────────────────────────────────────────────────────────────────
   Page-local styles. Tokens come from the global stylesheet
   (redesign/tokens.css) loaded in the root layout — this page
   only defines layout primitives specific to /work/sprocketstats.
   ───────────────────────────────────────────────────────────────── */
const styles = `
.ss-page { max-width: 1080px; margin: 0 auto; padding: 56px 56px 96px; }
@media (max-width: 720px) { .ss-page { padding: 32px 24px 64px; } }

/* PageHeader (L.02) */
.ss-page-header { margin-bottom: 40px; }
.ss-page-header .kicker {
  font-family: var(--font-mono); font-size: 11px;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--accent); margin-bottom: 16px;
}
.ss-page-header h1 {
  margin: 0 0 14px; font-size: 44px; font-weight: 600;
  letter-spacing: -0.02em; line-height: 1.05;
}
.ss-page-header .dek {
  margin: 0; font-size: 17px; line-height: 1.55;
  color: var(--fg-muted); max-width: 640px;
}

/* MetaRow (C.03) */
.ss-meta-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 20px 32px;
  padding: 20px 0;
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
  margin-bottom: 40px;
}
.ss-meta-row .pair { display: flex; flex-direction: column; gap: 4px; }
.ss-meta-row .k {
  font-family: var(--font-mono); font-size: 10px;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--fg-soft);
}
.ss-meta-row .v {
  font-size: 14px; color: var(--fg);
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
}
.ss-meta-row .v .dim { color: var(--fg-muted); font-size: 13px; }

/* StatStrip */
.ss-stat-strip {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;
  border: 1px solid var(--rule); border-radius: 4px;
  margin-bottom: 40px; overflow: hidden;
}
.ss-stat-strip .stat {
  padding: 22px 20px; border-right: 1px solid var(--rule);
  display: flex; flex-direction: column; gap: 6px;
}
.ss-stat-strip .stat:last-child { border-right: 0; }
.ss-stat-strip .stat .v {
  font-family: var(--font-mono); font-weight: 500;
  font-size: 26px; letter-spacing: -0.01em;
  color: var(--fg); line-height: 1;
}
.ss-stat-strip .stat .v sup {
  font-size: 13px; color: var(--fg-muted);
  margin-left: 2px; vertical-align: super;
}
.ss-stat-strip .stat .k {
  font-family: var(--font-mono); font-size: 10px;
  letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--fg-soft);
}
@media (max-width: 720px) {
  .ss-stat-strip { grid-template-columns: repeat(2, 1fr); }
  .ss-stat-strip .stat:nth-child(2) { border-right: 0; }
  .ss-stat-strip .stat:nth-child(1),
  .ss-stat-strip .stat:nth-child(2) { border-bottom: 1px solid var(--rule); }
}

/* Tech-stack tag row (I.02 outline) */
.ss-tag-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 56px; }
.ss-tag {
  font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.04em;
  padding: 4px 9px; border: 1px solid var(--rule-strong);
  border-radius: 3px; color: var(--fg-muted);
}

/* Section (L.03) */
.ss-sec { margin-bottom: 64px; scroll-margin-top: 80px; }
.ss-sec .sec-head {
  display: flex; align-items: baseline; gap: 12px;
  padding-bottom: 14px; margin-bottom: 24px;
  border-bottom: 1px solid var(--rule);
}
.ss-sec .sec-head .num {
  font-family: var(--font-mono); font-size: 12px;
  letter-spacing: 0.16em; color: var(--accent);
  font-weight: 500; flex-shrink: 0;
}
.ss-sec .sec-head h2 {
  margin: 0; font-size: 28px; font-weight: 600;
  letter-spacing: -0.015em; line-height: 1.15;
}
.ss-sec .sec-head .label-right {
  margin-left: auto;
  font-family: var(--font-mono); font-size: 10px;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--fg-soft); align-self: center;
}
.ss-sec .prose { max-width: 720px; }
.ss-sec .prose p {
  margin: 0 0 1em;
  font-size: 15.5px; line-height: 1.7; color: var(--fg);
}
.ss-sec .prose em { color: var(--fg-muted); font-style: italic; }
.ss-sec .prose strong { font-weight: 600; }

/* Figure (C.02) */
.ss-fig {
  margin: 32px 0; padding: 16px 0;
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
}
.ss-fig .frame {
  background: var(--bg-elev);
  border: 1px solid var(--rule);
  position: relative; overflow: hidden;
}
.ss-fig .frame .img-wrap {
  position: relative; width: 100%;
  display: block; line-height: 0;
}
.ss-fig .frame .img-wrap img {
  width: 100% !important; height: auto !important;
  display: block;
}
.ss-fig figcaption {
  font-family: var(--font-mono); font-size: 11px;
  letter-spacing: 0.04em; line-height: 1.55;
  color: var(--fg-soft); margin-top: 12px;
}
.ss-fig figcaption .num { color: var(--fg-muted); margin-right: 4px; }

.ss-fig-pair {
  display: grid; grid-template-columns: 1.65fr 1fr;
  gap: 16px; align-items: stretch;
}
.ss-fig-pair .frame { height: 100%; display: flex; }
.ss-fig-pair .frame .img-wrap { width: 100%; align-self: center; }
@media (max-width: 720px) {
  .ss-fig-pair { grid-template-columns: 1fr; }
}

.ss-fig-portrait { max-width: 380px; margin: 0 auto; }

/* StatusPill (I.01) */
.ss-pill {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: var(--font-mono); font-size: 10.5px;
  letter-spacing: 0.14em; text-transform: uppercase;
  padding: 3px 10px 3px 8px;
  border: 1px solid var(--rule-strong); border-radius: 999px;
  color: var(--fg-muted);
}
.ss-pill .dot { width: 6px; height: 6px; border-radius: 999px; background: var(--fg-soft); }
.ss-pill.good .dot { background: var(--good); }

/* Note (C.09) */
.ss-note {
  margin: 24px 0; padding: 14px 18px;
  border-left: 3px solid var(--accent);
  background: var(--accent-soft);
}
.ss-note .title {
  font-family: var(--font-mono); font-size: 10.5px;
  letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--accent); margin-bottom: 4px;
}
.ss-note p { margin: 0; font-size: 14.5px; line-height: 1.6; color: var(--fg); }
`;

/* ─── Image manifest ──────────────────────────────────────────
   Public-folder paths and intrinsic dimensions, kept together so
   any future re-shoot of an asset just updates this map.
   ───────────────────────────────────────────────────────────── */
const IMG = {
    currentApp:   { src: "/sprocket/Screenshot 2026-05-10 075229.png", w: 2559, h: 1599 },
    earlierApp:   { src: "/sprocket/Screenshot 2026-04-03 205309.png", w: 985,  h: 487  },
    sliderClose:  { src: "/sprocket/img.png",                          w: 503,  h: 898  },
    matchReview: { src: "/sprocket/scouting_2026.png", w: 1919, h: 914 },
    yoloTracking: { src: "/sprocket/img_1.png",                        w: 2879, h: 1799 },
} as const;

export default function SprocketStatsPage() {
    return (
        <>
            <style>{styles}</style>

            <main className="notebook ss-page">
                {/* ─ PageHeader ───────────────────────────────────────── */}
                <div className="ss-page-header">
                    <div className="kicker">Work · Software · 2024 —</div>
                    <h1>SprocketStats</h1>
                    <p className="dek">
                        A full-stack scouting platform for FRC, built to close the gap between
                        raw match data and real alliance decisions. Ensemble prediction,
                        field-mapped input, and a guest sharing system that turns scouted data
                        into a team-facing tool.
                    </p>
                </div>

                {/* ─ MetaRow ──────────────────────────────────────────── */}
                <div className="ss-meta-row">
                    <div className="pair">
                        <div className="k">Status</div>
                        <div className="v">
                            <span className="ss-pill good"><span className="dot" />Shipped</span>
                            <span className="dim">down for maintenance · pre-season</span>
                        </div>
                    </div>
                    <div className="pair">
                        <div className="k">Domain</div>
                        <div className="v">Software</div>
                    </div>
                    <div className="pair">
                        <div className="k">Year</div>
                        <div className="v">2024 — present</div>
                    </div>
                    <div className="pair">
                        <div className="k">Team</div>
                        <div className="v">5 members</div>
                    </div>
                </div>

                {/* ─ Stat strip ───────────────────────────────────────── */}
                <div className="ss-stat-strip" aria-label="Headline stats">
                    <div className="stat">
                        <span className="v">218</span>
                        <span className="k">Matches scouted</span>
                    </div>
                    <div className="stat">
                        <span className="v">3</span>
                        <span className="k">Events</span>
                    </div>
                    <div className="stat">
                        <span className="v">70<sup>+</sup></span>
                        <span className="k">Teams scouted</span>
                    </div>
                    <div className="stat">
                        <span className="v">&gt; 90<sup>%</sup></span>
                        <span className="k">Win/loss accuracy · 2026</span>
                    </div>
                </div>

                {/* ─ Tech stack ───────────────────────────────────────── */}
                <div className="ss-tag-row" aria-label="Tech stack">
                    {["React", "TypeScript", "Tailwind", "FastAPI", "C# WPF", "Python"].map((t) => (
                        <span key={t} className="ss-tag">{t}</span>
                    ))}
                </div>

                {/* ─ 01 — Why it exists ───────────────────────────────── */}
                <section className="ss-sec" id="s01">
                    <div className="sec-head">
                        <span className="num">01 —</span>
                        <h2>Why it exists</h2>
                        <span className="label-right">Context</span>
                    </div>
                    <div className="prose">
                        <p>
                            During the 2025 season Sprocket was using an older scouting app,
                            effectively a glorified Google Form. It collected less data, was
                            harder to use, had worse analysis, and had a critical security flaw:
                            all data was downloadable without authentication. That app is now
                            taken down.
                        </p>
                        <p>
                            SprocketStats was built to replace it with a real GUI. The core goal
                            was better data collection, better data quality, and tighter
                            integration across the entire scouting workflow — from getting event
                            data, to match scouting, pit scouting, analysis, presentation, and
                            sharing, not just more of the same.
                        </p>
                    </div>
                </section>

                {/* ─ 02 — The scouting app ────────────────────────────── */}
                <section className="ss-sec" id="s02">
                    <div className="sec-head">
                        <span className="num">02 —</span>
                        <h2>The scouting app</h2>
                        <span className="label-right">2025 → 2026</span>
                    </div>
                    <div className="prose">
                        <p>
                            Built for FRC <em>Reefscape</em> (2025) and rebuilt for{" "}
                            <em>Rebuilt</em> (2026). In 2026 the main UX challenge was shot
                            volume: robots in this game shoot at very high throughput, so the
                            original +1 / +2 / +5 / +10 button approach was replaced with a
                            slider scouters can drag or click rapidly. The app also includes a
                            field illustration where scouters input shooting location and
                            activate task buttons (defense, traversal, shooting, intaking, and
                            so on). Drew inspiration from <em>Lovat</em>, the scouting app
                            developed by FRC team 8033.
                        </p>
                    </div>

                    <figure className="ss-fig">
                        <div className="frame">
                            <div className="img-wrap">
                                <Image
                                    src={IMG.currentApp.src}
                                    width={IMG.currentApp.w}
                                    height={IMG.currentApp.h}
                                    alt="Current scouting app, second event of the 2026 season — task panel and shot slider on the left, field illustration on the right."
                                    sizes="(max-width: 720px) 100vw, 968px"
                                    priority
                                />
                            </div>
                        </div>
                        <figcaption>
                            <span className="num">Fig. 2.1 —</span>
                            Current scouting app, second event of the 2026 season. Field
                            illustration on the right; task panel and shot slider on the left.
                        </figcaption>
                    </figure>

                    <figure className="ss-fig">
                        <div className="ss-fig-pair">
                            <div className="frame">
                                <div className="img-wrap">
                                    <Image
                                        src={IMG.earlierApp.src}
                                        width={IMG.earlierApp.w}
                                        height={IMG.earlierApp.h}
                                        alt="Earlier full-app design, with the original +N button approach for shot counting."
                                        sizes="(max-width: 720px) 100vw, 600px"
                                    />
                                </div>
                            </div>
                            <div className="frame">
                                <div className="img-wrap">
                                    <Image
                                        src={IMG.sliderClose.src}
                                        width={IMG.sliderClose.w}
                                        height={IMG.sliderClose.h}
                                        alt="Close-up of the shot-volume slider that replaced the +N buttons."
                                        sizes="(max-width: 720px) 100vw, 360px"
                                    />
                                </div>
                            </div>
                        </div>
                        <figcaption>
                            <span className="num">Fig. 2.2 —</span>
                            Earlier full-app design (left) and the shot-volume slider in close-up
                            (right). The slider replaced four discrete +N buttons after testing
                            showed shot rates that broke the button-tapping model.
                        </figcaption>
                    </figure>

                    <div className="prose">
                        <div className="ss-note">
                            <div className="title">UX change · between events</div>
                            <p>
                                Task buttons changed from <em>click-to-activate</em> to{" "}
                                <em>hold-to-activate</em>, removing one interaction per task,
                                less physical and mental load on scouters across a six-hour event
                                day.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ─ 03 — Analysis + prediction ───────────────────────── */}
                <section className="ss-sec" id="s03">
                    <div className="sec-head">
                        <span className="num">03 —</span>
                        <h2>Analysis + prediction</h2>
                        <span className="label-right">Ensemble · ~15 params</span>
                    </div>
                    <div className="prose">
                        <p>
                            An ensemble algorithm with roughly 15 designated output parameters
                            across robots, past matches, and future matches. Each data source,
                            Statbotics, match scouting data, pit scouting data, and so on, is
                            weighted by how accurately it predicts past matches, then aggregated.
                        </p>
                        <p>
                            Win/loss prediction accuracy in 2026: <strong>&gt; 90%</strong>. For
                            context, Statbotics, the most widely used FRC analytics platform,
                            reaches roughly 80% on the same task, based on observed usage and a
                            Chief Delphi thread discussing its limitations. Score prediction uses
                            a skewed distribution model, more complex than win/loss, and not
                            reducible to a single accuracy figure.
                        </p>
                    </div>
                </section>

                {/* ─ 04 — Data presentation ───────────────────────────── */}
                <section className="ss-sec" id="s04">
                    <div className="sec-head">
                        <span className="num">04 —</span>
                        <h2>Data presentation</h2>
                        <span className="label-right">In-app</span>
                    </div>
                    <div className="prose">
                        <p>
                            Presentation lives inside the same app. A guest system lets a
                            scouter share a passcode or QR code with alliance partners or future
                            teammates so they get read-only access to the relevant slice of data
                            without an account.
                        </p>
                        <p>
                            Pages include per-team profiles, past match reviews, future match
                            previews, full robot rankings, and an alliance selection simulator{" "}
                            <em>(in progress).</em>
                        </p>
                    </div>

                    <figure className="ss-fig">
                        <div className="frame">
                            <div className="img-wrap">
                                <Image
                                    src={IMG.matchReview.src}
                                    width={IMG.matchReview.w}
                                    height={IMG.matchReview.h}
                                    alt="Match review screen from the data-presentation side of the app."
                                    sizes="(max-width: 720px) 100vw, 1936px"
                                />
                            </div>
                        </div>
                        <figcaption>
                            <span className="num">Fig. 4.1 —</span>
                            Match review screen from the data-presentation side of the app.
                            Per-match breakdown of scouted task counts and contributions.
                        </figcaption>
                    </figure>
                </section>

                {/* ─ 05 — What's next ─────────────────────────────────── */}
                <section className="ss-sec" id="s05">
                    <div className="sec-head">
                        <span className="num">05 —</span>
                        <h2>What&#39;s next</h2>
                        <span className="label-right">2026 — 27 · AI pivot</span>
                    </div>
                    <div className="prose">
                        <p>
                            For the 2026–27 season the team is considering moving from{" "}
                            <em>human-centric</em> to <em>AI-centric</em> scouting. YOLO-based
                            robot tracking is already in development. The plan is to integrate
                            MTMCT(multi-target multi-camera tracking) and related algorithms
                            to eliminate human error from data sources entirely. If this
                            direction holds, there may not be an outward-facing web app next
                            season.
                        </p>
                    </div>

                    <figure className="ss-fig">
                        <div className="frame">
                            <div className="img-wrap">
                                <Image
                                    src={IMG.yoloTracking.src}
                                    width={IMG.yoloTracking.w}
                                    height={IMG.yoloTracking.h}
                                    alt="YOLO-based robot tracking in development — bounding boxes and per-robot identity tracking on competition footage."
                                    sizes="(max-width: 720px) 100vw, 968px"
                                />
                            </div>
                        </div>
                        <figcaption>
                            <span className="num">Fig. 5.1 —</span>
                            YOLO-based robot tracking, in-development. Bounding boxes and
                            per-robot identity tracking on competition footage; precursor to a
                            multi-camera tracking pipeline.
                        </figcaption>
                    </figure>
                </section>
            </main>
        </>
    );
}