"use client";

/**
 * Digital Footprint Mirror — /experiments/digital-footprint
 *
 * A self-completing "visitor disclosure record". Three layers:
 *   A. what the request itself transmitted (headers, cookies, referrer)
 *   B. what the browser volunteers to JavaScript with no permission prompt
 *   C. what a server can look up for free from the IP alone (geo, ISP, ASN)
 *
 * Every value starts behind a redaction bar and is swept open once the
 * record is assembled. Nothing is stored or logged; the only outbound
 * requests are the free IP-geolocation lookups that power section C
 * (ipwho.is, ipapi.co fallback) and the OpenStreetMap embed.
 */

import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import styles from "./footprint.module.css";

// ----------------------------- Row plumbing -----------------------------

type RowOpts = { warn?: boolean; muted?: boolean; sub?: string };
type RowData = RowOpts & { text: string; revealed: boolean };
type Rows = Record<string, RowData>;

const SECTION_A: Array<[string, string]> = [
    ["ip", "IP address"],
    ["ua", "User agent"],
    ["lang", "Languages"],
    ["ref", "Referrer"],
    ["cookies", "Cookies"],
    ["dnt", "Do Not Track"],
];
const SECTION_B: Array<[string, string]> = [
    ["os", "Operating system"],
    ["screen", "Screen"],
    ["tz", "Timezone & clock"],
    ["cpu", "CPU cores"],
    ["mem", "Memory"],
    ["touch", "Touch points"],
    ["net", "Network"],
    ["battery", "Battery"],
    ["gpu", "Graphics (GPU)"],
    ["adblock", "Ad/tracker blocker"],
    ["canvas", "Canvas fingerprint"],
    ["fp", "Composite ID"],
];
const SECTION_C: Array<[string, string]> = [
    ["geo", "Estimated location"],
    ["coords", "Coordinates"],
    ["isp", "Internet provider"],
    ["asn", "Network (ASN)"],
    ["vpn", "VPN / proxy heuristic"],
];

// Reveal order for the staggered sweep once the record is assembled.
// Rows that arrive late (battery, geo lookup, …) sweep open on arrival;
// reveal() skips ids that have no value yet, matching the prototype.
const CASCADE: string[] = [
    "ua", "lang", "ref", "cookies", "dnt",
    "os", "screen", "tz", "cpu", "mem", "touch", "net",
    "battery", "gpu", "adblock", "canvas", "fp",
];

// ----------------------------- Free enrichment -----------------------------

type GeoInfo = {
    ip: string;
    city?: string;
    region?: string;
    country?: string;
    lat?: number;
    lon?: number;
    isp?: string;
    org?: string;
    asn?: string | number;
    tz?: string;
};

// Two free, keyless, CORS-enabled sources; first one that answers wins.
async function lookupIp(): Promise<GeoInfo | null> {
    const sources: Array<{ url: string; map: (d: any) => GeoInfo | null }> = [
        {
            url: "https://ipwho.is/",
            map: (d) => d.success === false ? null : ({
                ip: d.ip, city: d.city, region: d.region, country: d.country,
                lat: d.latitude, lon: d.longitude,
                isp: d.connection?.isp, org: d.connection?.org, asn: d.connection?.asn,
                tz: d.timezone?.id,
            }),
        },
        {
            url: "https://ipapi.co/json/",
            map: (d) => d.error ? null : ({
                ip: d.ip, city: d.city, region: d.region, country: d.country_name,
                lat: d.latitude, lon: d.longitude,
                isp: d.org, org: d.org, asn: d.asn,
                tz: d.timezone,
            }),
        },
    ];
    for (const s of sources) {
        try {
            const r = await fetch(s.url, {cache: "no-store"});
            if (!r.ok) continue;
            const data = s.map(await r.json());
            if (data && data.ip) return data;
        } catch {
            // try next source
        }
    }
    return null;
}

async function sha256Hex(input: string): Promise<string> {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ----------------------------- Document -----------------------------

function DisclosureRecord() {
    const [rows, setRows] = useState<Rows>({
        ip: {text: "resolving…", revealed: false},
        geo: {text: "querying…", revealed: false},
    });
    const [meta, setMeta] = useState({caseNo: "—", openedAt: "—", stamp: "PROCESSING"});
    const [mapSrc, setMapSrc] = useState<string | null>(null);
    const [mapCap, setMapCap] = useState("");
    const [summary, setSummary] = useState<string | null>(null);
    const [genTime, setGenTime] = useState("");
    const [reduce, setReduce] = useState(false);

    const fpRef = useRef("");
    const openedIsoRef = useRef("");
    const timers = useRef<number[]>([]);
    const ran = useRef(false);

    useEffect(() => {
        if (ran.current) return;
        ran.current = true;

        const prefersReduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
        setReduce(prefersReduce);

        const later = (fn: () => void, ms: number) => {
            timers.current.push(window.setTimeout(fn, ms));
        };
        const set = (id: string, text: string, opts: RowOpts = {}, revealed = false) =>
            setRows((prev) => ({
                ...prev,
                [id]: {text, ...opts, revealed: revealed || (prev[id]?.revealed ?? false)},
            }));
        const reveal = (id: string) =>
            setRows((prev) => prev[id] ? {...prev, [id]: {...prev[id], revealed: true}} : prev);

        // ---------- masthead ----------
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, "0");
        const hhmm = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
        const openedIso = now.toISOString().slice(0, 19).replace("T", " ");
        openedIsoRef.current = openedIso;
        setMeta({
            caseNo: `VDR-${now.getFullYear()}-${Math.floor(Math.random() * 9e5 + 1e5)}`,
            openedAt: openedIso,
            stamp: hhmm,
        });

        // ---------- SECTION A ----------
        set("ua", navigator.userAgent);
        set("lang", (navigator.languages || [navigator.language]).join(", ") || "unknown");
        const ref = document.referrer;
        set("ref", ref || "(none — typed directly or hidden)", {muted: !ref});
        const ck = document.cookie;
        set("cookies", ck || "0 readable cookies right now",
            {muted: !ck, sub: ck ? undefined : "A real site usually sets several on arrival."});
        const dnt = navigator.doNotTrack;
        set("dnt", dnt === "1" ? "Enabled (and routinely ignored)" : "Not set", {warn: dnt !== "1"});

        // ---------- SECTION B ----------
        const nav = navigator as any;
        const uaData = nav.userAgentData;
        let os: string = nav.platform || "unknown";
        if (uaData?.platform) os = uaData.platform + (uaData.mobile ? " (mobile)" : "");
        set("os", os);

        set("screen",
            `${screen.width}×${screen.height} px, ${screen.colorDepth}-bit`,
            {sub: `viewport ${innerWidth}×${innerHeight}, pixel ratio ${devicePixelRatio}`});

        const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown";
        const off = -now.getTimezoneOffset() / 60;
        set("tz", tzName, {sub: `local clock ${now.toLocaleTimeString()}, UTC${off >= 0 ? "+" : ""}${off}`});

        set("cpu", (navigator.hardwareConcurrency || "unknown") + " logical cores");
        set("mem", nav.deviceMemory ? `${nav.deviceMemory} GB (approx.)` : "not exposed",
            {muted: !nav.deviceMemory});
        set("touch", (navigator.maxTouchPoints || 0) + " touch points" +
            (navigator.maxTouchPoints ? " — likely a touch device" : ""));

        const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
        if (conn?.effectiveType) {
            set("net", `${conn.effectiveType}`,
                {sub: `~${conn.downlink} Mbps, ${conn.rtt}ms round-trip${conn.saveData ? ", data-saver on" : ""}`});
        } else {
            set("net", "not exposed by this browser", {muted: true});
        }

        // battery — promise-based, sweeps open on arrival
        if (nav.getBattery) {
            nav.getBattery().then((b: any) => {
                set("battery", `${Math.round(b.level * 100)}% ${b.charging ? "(charging)" : "(on battery)"}`, {}, true);
            }).catch(() => set("battery", "blocked", {muted: true}, true));
        } else {
            set("battery", "not exposed by this browser", {muted: true});
        }

        // GPU via WebGL
        let gpuText = "unavailable";
        let gpuMuted = true;
        try {
            const gl = document.createElement("canvas").getContext("webgl");
            const dbg = gl && gl.getExtension("WEBGL_debug_renderer_info");
            if (gl && dbg) {
                gpuText = String(gl.getParameter((dbg as any).UNMASKED_RENDERER_WEBGL));
                gpuMuted = false;
            } else if (gl) {
                gpuText = "present (renderer string masked)";
            }
        } catch {
            // keep "unavailable"
        }
        set("gpu", gpuText, {muted: gpuMuted});

        // adblock bait
        const bait = document.createElement("div");
        bait.className = "adsbox ad-banner pub_300x250";
        bait.style.cssText = "position:absolute;height:8px;width:8px;left:-9999px;top:-9999px";
        document.body.appendChild(bait);
        later(() => {
            const blocked = bait.offsetHeight === 0 || bait.offsetParent === null ||
                getComputedStyle(bait).display === "none";
            set("adblock", blocked ? "Detected — a blocker is hiding bait elements" : "None detected",
                {warn: !blocked}, true);
            bait.remove();
        }, 120);

        // canvas + composite fingerprint
        (async () => {
            let canvasSig = "n/a";
            try {
                const c = document.createElement("canvas");
                c.width = 280;
                c.height = 60;
                const ctx = c.getContext("2d")!;
                ctx.textBaseline = "top";
                ctx.font = "16px 'Arial'";
                ctx.fillStyle = "#f60";
                ctx.fillRect(10, 10, 100, 30);
                ctx.fillStyle = "#069";
                ctx.fillText("disclosure ✓ \u{1F4CE} 9.81", 12, 16);
                ctx.strokeStyle = "rgba(0,80,200,.7)";
                ctx.beginPath();
                ctx.arc(160, 30, 18, 0, Math.PI * 2);
                ctx.stroke();
                canvasSig = (await sha256Hex(c.toDataURL())).slice(0, 16);
            } catch {
                // canvas or crypto.subtle unavailable (e.g. insecure context)
            }
            set("canvas", canvasSig, {sub: "Drawn invisibly. Renders slightly differently per device."}, true);

            try {
                const signals = [
                    navigator.userAgent, (navigator.languages || []).join(","), os,
                    `${screen.width}x${screen.height}x${screen.colorDepth}`, devicePixelRatio,
                    tzName, navigator.hardwareConcurrency, nav.deviceMemory,
                    navigator.maxTouchPoints, gpuText, canvasSig,
                ].join("|");
                const fp = (await sha256Hex(signals)).slice(0, 24);
                fpRef.current = fp;
                set("fp", fp, {warn: true, sub: "A stable label for this browser — no cookie required."}, true);
            } catch {
                set("fp", "unavailable in this context", {muted: true}, true);
            }
        })();

        // ---------- examiner's summary ----------
        const buildSummary = (geo: GeoInfo | null) => {
            const dev = navigator.maxTouchPoints ? "a touch device" : "a desktop or laptop";
            const place = geo ? [geo.city, geo.country].filter(Boolean).join(", ") : null;
            const net = geo ? (geo.isp || geo.org) : null;
            let s = `The subject arrived using ${os ? os + ", " : ""}running ${
                (navigator.languages || [navigator.language])[0] || "an unknown locale"} on ${dev}. `;
            if (place) s += `Based on the originating IP alone, they are most likely in §§${place}§§${
                net ? ", connecting through " + net : ""}. `;
            s += `No cookies were required to assign them the persistent label §§${
                fpRef.current || "a fingerprint"}§§. `;
            s += `At no point was the subject asked for consent, and at no point were they informed this record existed.`;
            return s;
        };

        const finishUp = (geo: GeoInfo | null) => {
            if (prefersReduce) {
                CASCADE.forEach(reveal);
            } else {
                CASCADE.forEach((id, i) => later(() => reveal(id), 220 + i * 95));
            }
            later(() => setSummary(buildSummary(geo)), 900);
        };

        // ---------- SECTION C: free server-side enrichment, demoed client-side ----------
        lookupIp().then((d) => {
            if (!d) {
                set("ip", "could not resolve from this network", {muted: true}, true);
                ["geo", "coords", "isp", "asn", "vpn"].forEach((id) =>
                    set(id, "lookup blocked here — works on a live server", {muted: true}, true));
                setMapCap("// On a deployed site this section pinpoints you to city level.");
                finishUp(null);
                return;
            }
            set("ip", d.ip, {}, true);
            const place = [d.city, d.region, d.country].filter(Boolean).join(", ") || "unknown";
            set("geo", place, {sub: "Derived from your IP alone — accurate to roughly your city."}, true);
            set("coords", d.lat != null ? `${(+d.lat).toFixed(4)}, ${(+d.lon!).toFixed(4)}` : "unknown", {}, true);
            set("isp", d.isp || d.org || "unknown", {}, true);
            set("asn", (d.asn ? "AS" + String(d.asn).replace(/^AS/i, "") : "unknown") +
                (d.org ? "  ·  " + d.org : ""), {}, true);

            // VPN heuristic: IP timezone vs browser timezone
            const ipTz = d.tz;
            let vpnText: string;
            let warn = false;
            if (ipTz && tzName !== "unknown" && ipTz !== tzName) {
                vpnText = `Possible — IP says ${ipTz}, your clock says ${tzName}`;
                warn = true;
            } else if (ipTz) {
                vpnText = `No obvious mismatch (IP & clock agree on ${ipTz})`;
            } else {
                vpnText = "Inconclusive";
            }
            set("vpn", vpnText,
                {warn, sub: "One free trick: compare the IP's timezone to your device clock."}, true);

            if (d.lat != null && d.lon != null) {
                const lat = +d.lat, lon = +d.lon, dl = 0.06;
                setMapSrc(`https://www.openstreetmap.org/export/embed.html?bbox=${lon - dl}%2C${lat - dl}%2C${lon + dl}%2C${lat + dl}&layer=mapnik&marker=${lat}%2C${lon}`);
                setMapCap("// Plotted from your IP. You were never asked for your location.");
            }
            finishUp(d);
        });

        const pending = timers.current;
        return () => pending.forEach(clearTimeout);
    }, []);

    const handleSummaryDone = useCallback(() => {
        setMeta((m) => m.stamp.endsWith("CLOSED") ? m : {...m, stamp: `${m.stamp} CLOSED`});
        setGenTime(`RECORD ASSEMBLED ${openedIsoRef.current}Z`);
    }, []);

    return (
        <div className={styles.paper}>
            <div className={styles.masthead}>
                <div className={styles.eyebrow}>Bureau of Self-Evident Data &middot; Intake Terminal</div>
                <h2 className={styles.docTitle}>Visitor Disclosure Record</h2>
                <div className={styles.stamp}>On File<small>{meta.stamp}</small></div>
                <div className={styles.metaGrid}>
                    <div><span>FILE NO.</span><br/><b>{meta.caseNo}</b></div>
                    <div><span>OPENED</span><br/><b>{meta.openedAt}</b></div>
                    <div><span>SUBJECT</span><br/><b>UNIDENTIFIED VISITOR</b></div>
                    <div><span>CONSENT ON RECORD</span><br/><b className={styles.consent}>NONE REQUESTED</b></div>
                </div>
            </div>

            <p className={styles.lede}>
                You opened this page. You typed nothing, clicked nothing, agreed to nothing. In the time
                it took to render, the following record was assembled.{" "}
                <b>Each black bar below hides something you already handed over.</b>
            </p>

            <RecordSection id="A" title="What you transmitted"
                           note="// Sent with the request itself. A real server reads these before any code of yours runs."
                           rows={SECTION_A} data={rows}/>

            <RecordSection id="B" title="What your device volunteered"
                           note="// Read by JavaScript. No permission prompt, no notification."
                           rows={SECTION_B} data={rows}/>

            <RecordSection id="C" title="What a server looks up for free"
                           note="// Your IP, fed into a free public database. No API key. No charge. This took one network call."
                           rows={SECTION_C} data={rows}>
                {mapSrc && (
                    <div className={styles.mapWrap}>
                        <iframe src={mapSrc} title="Estimated location map" loading="lazy"
                                referrerPolicy="no-referrer"/>
                    </div>
                )}
                {mapCap && <div className={styles.mapCap}>{mapCap}</div>}
            </RecordSection>

            <section className={styles.summary}>
                <div className={styles.labelTag}>Examiner&apos;s summary</div>
                <TypedSummary text={summary} reduce={reduce} onDone={handleSummaryDone}/>
            </section>

            <section className={styles.sec}>
                <div className={styles.secHead}>
                    <span className={styles.secId}>D</span>
                    <span className={styles.secTitle}>How to disclose less</span>
                </div>
                <div className={styles.fixGrid}>
                    <div className={styles.fix}>
                        <h3>Your IP &amp; location</h3>
                        <p>Route traffic through a <b>reputable VPN</b> or the <b>Tor Browser</b>. This hides
                            your real IP from the site and breaks the free geolocation lookup in Section C.</p>
                    </div>
                    <div className={styles.fix}>
                        <h3>Cookies &amp; cross-site tracking</h3>
                        <p>Use <b>Firefox</b> or <b>Brave</b> with strict tracking protection, add{" "}
                            <b>uBlock Origin</b>, and clear cookies regularly. Container tabs isolate one
                            site&apos;s view of you from another&apos;s.</p>
                    </div>
                    <div className={styles.fix}>
                        <h3>Fingerprinting</h3>
                        <p>Cookies are optional; fingerprints are not. Use a browser with{" "}
                            <b>fingerprint resistance</b> (Tor Browser, or Firefox&apos;s{" "}
                            <code>resistFingerprinting</code>). It normalizes the signals in Section B so you
                            look like everyone else.</p>
                    </div>
                    <div className={styles.fix}>
                        <h3>The user agent &amp; headers</h3>
                        <p>You can&apos;t stop sending these, but a privacy browser sends a{" "}
                            <b>generic, common</b> set so your request blends into the crowd instead of
                            standing out.</p>
                    </div>
                </div>
            </section>

            <footer className={styles.docFooter}>
                <span>Nothing here is stored or logged. The only outbound request is the IP lookup behind Section C — everything else runs in your browser.</span>
                <span>{genTime}</span>
            </footer>
        </div>
    );
}

function RecordSection({id, title, note, rows, data, children}: {
    id: string;
    title: string;
    note: string;
    rows: Array<[string, string]>;
    data: Rows;
    children?: React.ReactNode;
}) {
    return (
        <section className={styles.sec}>
            <div className={styles.secHead}>
                <span className={styles.secId}>{id}</span>
                <span className={styles.secTitle}>{title}</span>
            </div>
            <div className={styles.secNote}>{note}</div>
            {rows.map(([rowId, label]) => <RecordRow key={rowId} label={label} data={data[rowId]}/>)}
            {children}
        </section>
    );
}

function RecordRow({label, data}: { label: string; data?: RowData }) {
    const txtCls = [
        styles.txt,
        data?.warn ? styles.warnTxt : "",
        data?.muted ? styles.mutedTxt : "",
    ].filter(Boolean).join(" ");
    return (
        <div className={styles.row}>
            <div className={styles.rowLabel}>{label}</div>
            <div>
                <span className={`${styles.v}${data?.revealed ? ` ${styles.revealed}` : ""}`}>
                    <span className={styles.bar}/>
                    <span className={txtCls}>
                        {data?.text ?? ""}
                        {data?.sub && <span className={styles.sub}>{data.sub}</span>}
                    </span>
                </span>
            </div>
        </div>
    );
}

// ----------------------------- Typed summary -----------------------------

function TypedSummary({text, reduce, onDone}: {
    text: string | null;
    reduce: boolean;
    onDone: () => void;
}) {
    // §§…§§ marks highlighted spans, as in the prototype
    const tokens = useMemo(() => {
        if (text == null) return [];
        return text.split(/(§§.+?§§)/g).filter(Boolean).map((t) =>
            t.startsWith("§§") ? {hl: true, text: t.slice(2, -2)} : {hl: false, text: t});
    }, [text]);
    const total = useMemo(() => tokens.reduce((n, t) => n + t.text.length, 0), [tokens]);

    const [count, setCount] = useState(0);
    const done = total > 0 && count >= total;

    useEffect(() => {
        if (text == null || done) return;
        if (reduce) {
            setCount(total);
            return;
        }
        // highlighted spans type slower, like the prototype
        let acc = 0;
        let hl = false;
        for (const t of tokens) {
            if (count < acc + t.text.length) {
                hl = t.hl;
                break;
            }
            acc += t.text.length;
        }
        const id = window.setTimeout(() => setCount((c) => c + 1), hl ? 24 : 10);
        return () => clearTimeout(id);
    }, [text, reduce, done, count, total, tokens]);

    const doneRef = useRef(false);
    useEffect(() => {
        if (done && !doneRef.current) {
            doneRef.current = true;
            onDone();
        }
    }, [done, onDone]);

    let acc = 0;
    return (
        <div className={styles.summaryText}>
            {tokens.map((t, i) => {
                const shown = Math.max(0, Math.min(t.text.length, count - acc));
                acc += t.text.length;
                if (shown === 0) return null;
                const slice = t.text.slice(0, shown);
                return t.hl
                    ? <span key={i} className={styles.hl}>{slice}</span>
                    : <span key={i}>{slice}</span>;
            })}
            {!done && <span className={styles.cursor}/>}
        </div>
    );
}

// ----------------------------- Page -----------------------------

export default function DigitalFootprintPage() {
    return (
        <div className="mx-auto max-w-[920px] px-4 sm:px-8 pt-12 pb-16">
            <div className="font-mono text-[11px] tracking-kicker uppercase text-accent mb-4 flex items-center gap-2">
                <span>EXPERIMENT</span>
                <span className="text-fg-soft">·</span>
                <span>DIGITAL FOOTPRINT</span>
            </div>
            <h1 className="m-0 mb-2 text-[clamp(28px,4vw,40px)] font-semibold tracking-[-0.02em]">
                Digital Footprint Mirror
            </h1>
            <p className="mb-10 text-[15px] text-fg-muted max-w-[640px] leading-relaxed">
                Load the page, touch nothing — and watch a disclosure record assemble itself from what
                your browser hands over, what JavaScript reads without asking, and what one free API
                call turns your IP address into.
            </p>

            <DisclosureRecord/>

            {/* ── Notes ──────────────────────────────────────────────── */}
            <div className="mt-12 border-t border-rule pt-8 grid md:grid-cols-3 gap-8">
                <Note num="01" title="The request itself">
                    Section A is read from the request before any of your code runs. A real server sees
                    even more — this client-side demo can only show what JavaScript can reach, not the
                    raw headers.
                </Note>
                <Note num="02" title="The silent interview">
                    Section B is a dozen device properties JavaScript can read with no permission prompt.
                    Hashed together they make a fingerprint that survives clearing cookies — a stable
                    label for this browser, no consent required.
                </Note>
                <Note num="03" title="Free enrichment">
                    Section C feeds your IP into a free, keyless public API and gets back city, ISP and
                    network owner in one round trip. It is city-level at best and sometimes wrong — VPNs
                    and mobile-carrier routing blur it — but it costs a server nothing.
                </Note>
            </div>
        </div>
    );
}

function Note({num, title, children}: { num: string; title: string; children: React.ReactNode }) {
    return (
        <div>
            <div className="flex items-baseline gap-3 mb-2 pb-2 border-b border-rule">
                <span className="font-mono text-[11px] tracking-kicker text-accent">{num} —</span>
                <h3 className="font-semibold text-[15px] tracking-[-0.005em]">{title}</h3>
            </div>
            <p className="text-[14px] text-fg-muted leading-[1.65]">{children}</p>
        </div>
    );
}
