"use client";

/**
 * Digital Footprint Mirror — /experiments/digital-footprint
 *
 * One client component. It assembles a disclosure record from two sources:
 *
 *   • The BROWSER (this file, on mount): everything navigator / canvas / audio
 *     / matchMedia expose with no permission prompt — Section B, plus cookies.
 *   • The SERVER (./api/route.ts, fetched on mount): the real request headers
 *     it received (Section A) and what the client IP reveals through free
 *     public data — geolocation, reverse DNS, proxy/VPN reputation (Section C).
 *
 * The client renders both. No animations: each value shows a placeholder until
 * its source resolves, then settles. Nothing is stored or logged.
 */

import React, {useEffect, useMemo, useState} from "react";
import styles from "./footprint.module.css";

// ----------------------------- Types -----------------------------

type ServerData = {
    ip: string | null;
    ipResolved: boolean;
    ua: string | null;
    acceptLanguage: string | null;
    referer: string | null;
    dnt: boolean;
    gpc: boolean;
    chPlatform: string | null;
    rawHeaders: Array<[string, string]>;
    geo: {
        city: string | null;
        region: string | null;
        country: string | null;
        lat: number | null;
        lon: number | null;
        tz: string | null;
    };
    isp: string | null;
    org: string | null;
    asn: string | null;
    ptr: string | null;
    flags: {proxy: boolean; hosting: boolean; mobile: boolean} | null;
    torExit: boolean | null;
};

type Val = {text: string; sub?: string; warn?: boolean; muted?: boolean} | null;
type Bag = Record<string, Val>;

// ----------------------------- Browser probes -----------------------------

async function sha256Hex(input: string): Promise<string> {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function audioFingerprint(): Promise<string | null> {
    try {
        const Ctx: typeof OfflineAudioContext =
            (window as any).OfflineAudioContext || (window as any).webkitOfflineAudioContext;
        if (!Ctx) return null;
        const ctx = new Ctx(1, 44100, 44100);
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.value = 10000;
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -50;
        comp.knee.value = 40;
        comp.ratio.value = 12;
        comp.attack.value = 0;
        comp.release.value = 0.25;
        osc.connect(comp);
        comp.connect(ctx.destination);
        osc.start(0);
        const buf = await ctx.startRendering();
        const data = buf.getChannelData(0);
        let acc = 0;
        for (let i = 4000; i < 5000; i++) acc += Math.abs(data[i]);
        return (await sha256Hex(acc.toString())).slice(0, 16);
    } catch {
        return null;
    }
}

function speechVoices(timeoutMs = 600): Promise<string[]> {
    return new Promise((resolve) => {
        try {
            const synth = window.speechSynthesis;
            if (!synth) return resolve([]);
            const read = () => synth.getVoices().map((v) => v.name);
            const immediate = read();
            if (immediate.length) return resolve(immediate);
            let done = false;
            const finish = () => {
                if (done) return;
                done = true;
                resolve(read());
            };
            synth.addEventListener("voiceschanged", finish, {once: true});
            setTimeout(finish, timeoutMs);
        } catch {
            resolve([]);
        }
    });
}

async function mediaDeviceCounts(): Promise<{cam: number; mic: number; spk: number} | null> {
    try {
        if (!navigator.mediaDevices?.enumerateDevices) return null;
        const list = await navigator.mediaDevices.enumerateDevices();
        let cam = 0, mic = 0, spk = 0;
        for (const d of list) {
            if (d.kind === "videoinput") cam++;
            else if (d.kind === "audioinput") mic++;
            else if (d.kind === "audiooutput") spk++;
        }
        return {cam, mic, spk};
    } catch {
        return null;
    }
}

function detectFonts(): string[] {
    const baseFonts = ["monospace", "sans-serif", "serif"];
    const testString = "mmmmmmmmmmlli";
    const candidates = [
        "Arial", "Arial Black", "Calibri", "Cambria", "Comic Sans MS", "Consolas",
        "Courier New", "Georgia", "Helvetica", "Helvetica Neue", "Impact",
        "Lucida Console", "Menlo", "Monaco", "Palatino", "Segoe UI", "Tahoma",
        "Times New Roman", "Trebuchet MS", "Verdana", "San Francisco", "Roboto",
        "Ubuntu", "Cantarell", "DejaVu Sans", "Liberation Sans", "Noto Sans",
        "Gill Sans", "Futura", "Andale Mono",
    ];
    const span = document.createElement("span");
    span.style.cssText =
        "position:absolute;left:-9999px;top:-9999px;font-size:72px;line-height:normal;visibility:hidden";
    span.textContent = testString;
    document.body.appendChild(span);
    const bw: Record<string, number> = {};
    const bh: Record<string, number> = {};
    for (const b of baseFonts) {
        span.style.fontFamily = b;
        bw[b] = span.offsetWidth;
        bh[b] = span.offsetHeight;
    }
    const found: string[] = [];
    for (const f of candidates) {
        for (const b of baseFonts) {
            span.style.fontFamily = `'${f}',${b}`;
            if (span.offsetWidth !== bw[b] || span.offsetHeight !== bh[b]) {
                found.push(f);
                break;
            }
        }
    }
    span.remove();
    return found;
}

async function permissionStates(): Promise<string[] | null> {
    try {
        if (!navigator.permissions?.query) return null;
        const names = ["camera", "microphone", "geolocation", "notifications", "clipboard-read"];
        const out: string[] = [];
        for (const name of names) {
            try {
                const s = await navigator.permissions.query({name: name as PermissionName});
                out.push(`${name}: ${s.state}`);
            } catch {
                // some names unsupported in some browsers — skip silently
            }
        }
        return out.length ? out : null;
    } catch {
        return null;
    }
}

function storageAvailability(): string[] {
    const probe = (label: string, fn: () => boolean) => {
        try {
            return fn() ? label : null;
        } catch {
            return null;
        }
    };
    return [
        probe("localStorage", () => !!window.localStorage),
        probe("sessionStorage", () => !!window.sessionStorage),
        probe("indexedDB", () => !!window.indexedDB),
        probe("caches", () => !!window.caches),
        probe("serviceWorker", () => !!navigator.serviceWorker),
    ].filter(Boolean) as string[];
}

function frameContext(): {text: string; warn: boolean} {
    try {
        const framed = window.top !== window.self;
        const hasOpener = !!window.opener;
        if (framed) return {text: "Loaded inside an iframe (embedded by another site)", warn: true};
        if (hasOpener) return {text: "Opened by another window (window.opener set)", warn: true};
        return {text: "Top-level window, no opener", warn: false};
    } catch {
        // cross-origin access throws — that itself means we're framed
        return {text: "Cross-origin framed (access to window.top blocked)", warn: true};
    }
}

function osPreferences(): string[] {
    const q = (s: string) => {
        try {
            return matchMedia(s).matches;
        } catch {
            return false;
        }
    };
    const out: string[] = [];
    out.push(q("(prefers-color-scheme: dark)") ? "dark mode" : "light mode");
    if (q("(prefers-reduced-motion: reduce)")) out.push("reduced motion");
    if (q("(prefers-contrast: more)")) out.push("high contrast");
    if (q("(forced-colors: active)")) out.push("forced colors");
    if (q("(inverted-colors: inverted)")) out.push("inverted colors");
    return out;
}

// ----------------------------- Consent section (Section C-bis) -----------------------------
//
// Sections B and C show what leaks with NO interaction. This section is the
// mirror image: each grantable capability gets a button, and saying "allow"
// once unlocks the extra data that capability hands over. Everything here is
// strictly opt-in, runs client-side, and is torn down on unmount. Nothing is
// captured (no photo, no audio, no clipboard contents) — only the metadata
// that becomes readable the moment consent is given.

type GrantState = "prompt" | "granted" | "denied" | "unsupported";

type Capability = {
    id: string;
    label: string;
    // one-line description of what clicking "allow" will expose, shown BEFORE the click
    exposes: string;
    // attempt the request; resolve with the revealed lines, or throw on denial
    request: () => Promise<string[]>;
    // feature-detect; return false to render the row as unsupported
    supported: () => boolean;
};

async function revealMediaMeta(kind: "videoinput" | "audioinput"): Promise<string[]> {
    // Requesting the stream is what unlocks device *labels*. We grab it only to
    // read labels + track settings, then stop every track immediately. No frame
    // is drawn, no audio sample is kept.
    const constraints = kind === "videoinput" ? {video: true} : {audio: true};
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    const out: string[] = [];
    try {
        const track = stream.getTracks()[0];
        if (track) {
            out.push(`active device: ${track.label || "unnamed"}`);
            const s = track.getSettings?.() || {};
            if (kind === "videoinput") {
                if (s.width && s.height) out.push(`resolution: ${s.width}×${s.height}`);
                if (s.frameRate) out.push(`frame rate: ${Math.round(s.frameRate)} fps`);
                if ((s as any).facingMode) out.push(`facing: ${(s as any).facingMode}`);
            } else {
                if (s.sampleRate) out.push(`sample rate: ${s.sampleRate} Hz`);
                if (s.channelCount) out.push(`channels: ${s.channelCount}`);
                if ((s as any).echoCancellation !== undefined) out.push(`echo cancellation: ${(s as any).echoCancellation}`);
            }
        }
        // Now that we hold a grant, labels for ALL devices of every kind unlock.
        const devices = await navigator.mediaDevices.enumerateDevices();
        const named = devices.filter((d) => d.label).map((d) => `${d.kind}: ${d.label}`);
        if (named.length) out.push(`all device names now readable (${named.length}): ${named.slice(0, 6).join(" · ")}${named.length > 6 ? "…" : ""}`);
    } finally {
        stream.getTracks().forEach((t) => t.stop());
    }
    return out;
}

async function revealGeolocation(): Promise<string[]> {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true, timeout: 12000, maximumAge: 0,
        });
    });
    const c = pos.coords;
    const out = [
        `coordinates: ${c.latitude.toFixed(6)}, ${c.longitude.toFixed(6)}`,
        `accuracy: ±${Math.round(c.accuracy)} m`,
    ];
    if (c.altitude != null) out.push(`altitude: ${Math.round(c.altitude)} m (±${Math.round(c.altitudeAccuracy ?? 0)} m)`);
    if (c.heading != null && !Number.isNaN(c.heading)) out.push(`heading: ${Math.round(c.heading)}°`);
    if (c.speed != null && !Number.isNaN(c.speed)) out.push(`speed: ${c.speed.toFixed(1)} m/s`);
    // free reverse geocode → street address, no key (OpenStreetMap Nominatim)
    try {
        const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${c.latitude}&lon=${c.longitude}&zoom=18`,
            {headers: {"Accept": "application/json"}, cache: "no-store"},
        );
        if (r.ok) {
            const j = await r.json();
            if (j.display_name) out.push(`reverse-geocoded address: ${j.display_name}`);
        }
    } catch {
        // address is a bonus; coords alone already make the point
    }
    return out;
}

async function revealClipboard(): Promise<string[]> {
    const text = await navigator.clipboard.readText();
    // We deliberately do NOT display the contents. Showing only length + a hash
    // proves access without exposing whatever the user happened to have copied.
    if (!text) return ["clipboard readable — it was empty just now"];
    const hash = (await sha256Hex(text)).slice(0, 12);
    return [
        `clipboard readable: ${text.length} characters present`,
        `(contents withheld by this page — fingerprint ${hash})`,
    ];
}

async function revealNotifications(): Promise<string[]> {
    const result = await Notification.requestPermission();
    if (result !== "granted") throw new Error("denied");
    return ["notification permission granted — this page could now interrupt you at the OS level, even after you leave"];
}

async function revealMidi(): Promise<string[]> {
    const access = await (navigator as any).requestMIDIAccess({sysex: false});
    const inputs = [...access.inputs.values()].map((i: any) => i.name);
    const outputs = [...access.outputs.values()].map((o: any) => o.name);
    const out = [`MIDI access granted`];
    if (inputs.length) out.push(`inputs: ${inputs.join(", ")}`);
    if (outputs.length) out.push(`outputs: ${outputs.join(", ")}`);
    if (!inputs.length && !outputs.length) out.push("no MIDI devices attached — but the port list is now readable");
    return out;
}

function revealSensor(kind: "accelerometer" | "gyroscope" | "magnetometer" | "ambient-light"): () => Promise<string[]> {
    return () => new Promise<string[]>((resolve, reject) => {
        // iOS gates motion/orientation behind requestPermission(); other browsers
        // expose it directly via the event. We listen for one reading, then detach.
        const evt = kind === "ambient-light" ? "devicelight" : "deviceorientation";
        let settled = false;
        const handler = (e: any) => {
            if (settled) return;
            settled = true;
            window.removeEventListener(evt, handler as EventListener);
            if (kind === "ambient-light") {
                resolve([`ambient light: ${e.value} lux — reads the brightness around your device`]);
            } else {
                resolve([
                    `orientation readable: α ${Math.round(e.alpha ?? 0)}° β ${Math.round(e.beta ?? 0)}° γ ${Math.round(e.gamma ?? 0)}°`,
                    "a live stream of how you're holding and moving the device",
                ]);
            }
        };
        const start = () => {
            window.addEventListener(evt, handler as EventListener);
            setTimeout(() => {
                if (!settled) {
                    window.removeEventListener(evt, handler as EventListener);
                    reject(new Error("no sensor reading"));
                }
            }, 3000);
        };
        const DME = (window as any).DeviceMotionEvent;
        if (DME?.requestPermission) {
            DME.requestPermission().then((s: string) => (s === "granted" ? start() : reject(new Error("denied")))).catch(reject);
        } else {
            start();
        }
    });
}

async function revealSerial(): Promise<string[]> {
    // requestPort() opens the browser's device chooser. Resolves with the port
    // the user picks; we read its identifying info and never open a stream.
    const port = await (navigator as any).serial.requestPort();
    const info = port.getInfo?.() || {};
    const out = ["serial port access granted"];
    if (info.usbVendorId != null) {
        out.push(`USB vendor ID: 0x${info.usbVendorId.toString(16).padStart(4, "0")}`);
    }
    if (info.usbProductId != null) {
        out.push(`USB product ID: 0x${info.usbProductId.toString(16).padStart(4, "0")}`);
    }
    out.push("this page could now read from and write to that device");
    return out;
}

async function revealUsb(): Promise<string[]> {
    const dev = await (navigator as any).usb.requestDevice({filters: []});
    const out = ["USB device access granted"];
    if (dev.productName) out.push(`product: ${dev.productName}`);
    if (dev.manufacturerName) out.push(`manufacturer: ${dev.manufacturerName}`);
    out.push(`vendor/product: 0x${dev.vendorId.toString(16)} / 0x${dev.productId.toString(16)}`);
    if (dev.serialNumber) out.push(`serial number: ${dev.serialNumber}`);
    return out;
}

async function revealBluetooth(): Promise<string[]> {
    // acceptAllDevices shows every nearby device in the chooser.
    const dev = await (navigator as any).bluetooth.requestDevice({acceptAllDevices: true});
    const out = ["Bluetooth device access granted"];
    if (dev.name) out.push(`device name: ${dev.name}`);
    if (dev.id) out.push(`device ID: ${dev.id}`);
    out.push("this page can now connect to it and enumerate its services");
    return out;
}

async function revealHid(): Promise<string[]> {
    const devices = await (navigator as any).hid.requestDevice({filters: []});
    if (!devices.length) throw new Error("none selected");
    const d = devices[0];
    const out = ["HID device access granted"];
    if (d.productName) out.push(`product: ${d.productName}`);
    out.push(`vendor/product: 0x${d.vendorId.toString(16)} / 0x${d.productId.toString(16)}`);
    if (devices.length > 1) out.push(`${devices.length} devices granted in one pick`);
    return out;
}

function buildCapabilities(): Capability[] {
    const nav = navigator as any;
    const caps: Capability[] = [
        {
            id: "geolocation",
            label: "Location",
            exposes: "Exact GPS coordinates, accuracy, altitude, and your street address — far past the city-level guess under Location.",
            supported: () => !!navigator.geolocation,
            request: revealGeolocation,
        },
        {
            id: "camera",
            label: "Camera",
            exposes: "The real make/model of your camera, its resolution and frame rate, and the names of every other media device.",
            supported: () => !!navigator.mediaDevices?.getUserMedia,
            request: () => revealMediaMeta("videoinput"),
        },
        {
            id: "microphone",
            label: "Microphone",
            exposes: "Your mic's device name, sample rate, and channel count — plus the labels of all your other devices.",
            supported: () => !!navigator.mediaDevices?.getUserMedia,
            request: () => revealMediaMeta("audioinput"),
        },
        {
            id: "clipboard",
            label: "Clipboard",
            exposes: "Whatever you last copied. This page reads it but withholds the contents — only proving it can.",
            supported: () => !!navigator.clipboard?.readText,
            request: revealClipboard,
        },
        {
            id: "notifications",
            label: "Notifications",
            exposes: "The ability to push OS-level alerts to you, persisting even after you close the tab.",
            supported: () => typeof Notification !== "undefined",
            request: revealNotifications,
        },
        {
            id: "midi",
            label: "MIDI devices",
            exposes: "The names of every MIDI instrument and controller attached to your machine.",
            supported: () => !!nav.requestMIDIAccess,
            request: revealMidi,
        },
        {
            id: "motion",
            label: "Motion & orientation",
            exposes: "A live feed of how you're tilting and moving the device, from its accelerometer and gyroscope.",
            supported: () => "DeviceOrientationEvent" in window,
            request: revealSensor("gyroscope"),
        },
        {
            id: "serial",
            label: "Serial port",
            exposes: "A direct two-way channel to a device on your serial/USB ports — Arduinos, microcontrollers, 3D printers.",
            supported: () => !!nav.serial?.requestPort,
            request: revealSerial,
        },
        {
            id: "usb",
            label: "USB device",
            exposes: "Raw access to a chosen USB device, including its vendor, product, and serial number.",
            supported: () => !!nav.usb?.requestDevice,
            request: revealUsb,
        },
        {
            id: "bluetooth",
            label: "Bluetooth device",
            exposes: "A connection to a nearby Bluetooth device and the ability to read its services.",
            supported: () => !!nav.bluetooth?.requestDevice,
            request: revealBluetooth,
        },
        {
            id: "hid",
            label: "HID device",
            exposes: "Low-level access to a human-interface device — gamepads, keyboards, custom peripherals.",
            supported: () => !!nav.hid?.requestDevice,
            request: revealHid,
        },
    ];
    return caps.filter((c) => c.supported());
}

// capability → which profile category it deepens
const CAP_CAT: Record<string, string> = {
    geolocation: "location", camera: "device", microphone: "device",
    clipboard: "behaviour", notifications: "behaviour", midi: "device",
    motion: "device", serial: "device", usb: "device", bluetooth: "network", hid: "device",
};

// ----------------------------- Grant row (Act II, inline) -----------------------------
//
// A grantable capability rendered as ONE row inside its category. A single
// "Prompt" button fires the real permission request; the browser's own dialog
// is where the visitor allows or blocks. Allowing unfolds the actual fields the
// capability returns (camera → device, resolution, frame rate, …); blocking
// leaves them sealed. Nothing is captured beyond that metadata.
type GrantUiState = "idle" | "busy" | "granted" | "denied";

function GrantRow({cap}: {cap: Capability}) {
    const [state, setState] = useState<GrantUiState>("idle");
    const [lines, setLines] = useState<string[]>([]);

    const onPrompt = async () => {
        setState("busy");
        try {
            const revealed = await cap.request();
            setLines(revealed);
            setState("granted");
        } catch {
            setState("denied");
        }
    };

    if (state === "granted") {
        return (
            <div className={`${styles.grant} ${styles.granted}`}>
                <div className={styles.grantHead}>
                    <span className={styles.grantDot}>⊕</span>
                    <span className={styles.grantLabel}>{cap.label}</span>
                    <button className={styles.grantState} onClick={() => setState("idle")}>● granted</button>
                </div>
                <div className={styles.grantFields}>
                    {lines.map((l, i) => {
                        const ix = l.indexOf(": ");
                        return ix > 0
                            ? <div className={styles.field} key={i}><span className={styles.fieldLabel}>{l.slice(0, ix)}</span><span className={styles.fieldVal}>{l.slice(ix + 2)}</span></div>
                            : <div className={styles.field} key={i}><span className={styles.fieldVal}>{l}</span></div>;
                    })}
                </div>
            </div>
        );
    }
    if (state === "denied") {
        return (
            <div className={`${styles.grant} ${styles.blocked}`}>
                <div className={styles.grantHead}>
                    <span className={styles.grantDot}>⊕</span>
                    <span className={styles.grantLabel}>{cap.label}</span>
                    <button className={styles.grantState} onClick={() => setState("idle")}>○ blocked</button>
                </div>
                <div className={styles.grantHint}>Nothing unlocked — {cap.exposes.replace(/\.$/, "").toLowerCase()} stays sealed.</div>
            </div>
        );
    }
    const busy = state === "busy";
    return (
        <div className={styles.grant}>
            <div className={styles.grantHead}>
                <span className={styles.grantDot}>⊕</span>
                <span className={styles.grantLabel}>{cap.label}</span>
                <button className={styles.promptBtn} disabled={busy} onClick={onPrompt}>{busy ? "requesting…" : "Prompt"}</button>
            </div>
            <div className={styles.grantHint}>{cap.exposes}</div>
        </div>
    );
}

// ----------------------------- Row + cluster rendering -----------------------------

type RowDef = {label: string; source: string; val: Val};

// A passive signal: label · value · a small tag for how it reached the page
// (sent with the request / read by JS / looked up from the IP). The "where it
// came from" is demoted to that tag — the organising axis is now the category.
function PassiveRow({label, source, val}: RowDef) {
    const pending = val == null;
    const cls = [styles.pVal, val?.warn ? styles.warn : "", (val?.muted || pending) ? styles.muted : ""].filter(Boolean).join(" ");
    return (
        <div className={styles.pRow}>
            <span className={styles.pLabel}>{label}</span>
            <span className={cls} title={val?.sub || undefined}>{pending ? "…" : val!.text}</span>
            <span className={styles.src}>{source}</span>
        </div>
    );
}

function CatCluster({name, rows, caps}: {name: string; rows: RowDef[]; caps: Capability[]}) {
    return (
        <section className={styles.cluster}>
            <div className={styles.clusterHead}>
                <span className={styles.catDot} />
                <h3 className={styles.catName}>{name}</h3>
                <span className={styles.catCount}>{rows.length + caps.length}</span>
            </div>
            {rows.map((r) => <PassiveRow key={r.label} {...r} />)}
            {caps.map((cp) => <GrantRow key={cp.id} cap={cp} />)}
        </section>
    );
}

// ----------------------------- Component -----------------------------

export default function DigitalFootprintPage() {
    // Browser-sourced values (Section B + cookies)
    const [bx, setBx] = useState<Bag>({});
    // Server-sourced values (Sections A & C)
    const [srv, setSrv] = useState<ServerData | null>(null);
    const [srvFailed, setSrvFailed] = useState(false);
    const [showHeaders, setShowHeaders] = useState(false);
    const [browserOs, setBrowserOs] = useState<string>("");
    const [fp, setFp] = useState<string>("");
    // Grantable capabilities, resolved once on the client (feature-detected).
    const [caps, setCaps] = useState<Capability[]>([]);
    useEffect(() => {
        setCaps(buildCapabilities());
    }, []);

    // ---- Browser probes on mount ----
    useEffect(() => {
        const nav = navigator as any;
        const now = new Date();
        const put = (id: string, v: Val) => setBx((p) => ({...p, [id]: v}));

        // cookies (browser-readable subset)
        const ck = document.cookie;
        put("cookies", ck
            ? {text: ck}
            : {text: "0 readable cookies right now", muted: true,
                sub: "A real site usually sets several on arrival."});

        // OS / platform
        const uaData = nav.userAgentData;
        let os: string = nav.platform || "unknown";
        if (uaData?.platform) os = uaData.platform + (uaData.mobile ? " (mobile)" : "");
        setBrowserOs(os);
        put("os", {text: os});

        put("screen", {
            text: `${screen.width}×${screen.height} px, ${screen.colorDepth}-bit`,
            sub: `avail ${screen.availWidth}×${screen.availHeight}, viewport ${innerWidth}×${innerHeight}, pixel ratio ${devicePixelRatio}`,
        });

        const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown";
        const off = -now.getTimezoneOffset() / 60;
        put("tz", {text: tzName, sub: `local clock ${now.toLocaleTimeString()}, UTC${off >= 0 ? "+" : ""}${off}`});

        put("cpu", {text: `${navigator.hardwareConcurrency || "unknown"} logical cores`});
        put("mem", nav.deviceMemory
            ? {text: `${nav.deviceMemory} GB (approx.)`}
            : {text: "not exposed", muted: true});
        put("touch", {
            text: `${navigator.maxTouchPoints || 0} touch points` +
                (navigator.maxTouchPoints ? " — likely a touch device" : ""),
        });

        const fine = matchMedia("(pointer: fine)").matches;
        const coarse = matchMedia("(pointer: coarse)").matches;
        const canHover = matchMedia("(hover: hover)").matches;
        put("pointer", {
            text: fine && !coarse ? "precise (mouse/trackpad)"
                : coarse && !fine ? "coarse (touch)"
                    : fine && coarse ? "both touch and mouse" : "unknown",
            sub: canHover ? "hover capable" : "no hover — touch-first device",
        });

        const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
        put("net", conn?.effectiveType
            ? {text: conn.effectiveType, sub: `~${conn.downlink} Mbps, ${conn.rtt}ms round-trip${conn.saveData ? ", data-saver on" : ""}`}
            : {text: "not exposed by this browser", muted: true});

        if (nav.getBattery) {
            nav.getBattery().then((b: any) =>
                put("battery", {text: `${Math.round(b.level * 100)}% ${b.charging ? "(charging)" : "(on battery)"}`})
            ).catch(() => put("battery", {text: "blocked", muted: true}));
        } else {
            put("battery", {text: "not exposed by this browser", muted: true});
        }

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
            // unavailable
        }
        put("gpu", {text: gpuText, muted: gpuMuted});

        put("prefs", {text: osPreferences().join(", ") || "defaults",
            sub: "Read from your OS settings — no permission needed."});

        // browser capability flags
        const capFlags: string[] = [];
        capFlags.push(`cookies ${navigator.cookieEnabled ? "enabled" : "disabled"}`);
        if ("pdfViewerEnabled" in navigator) {
            capFlags.push(`PDF viewer ${(navigator as any).pdfViewerEnabled ? "on" : "off"}`);
        }
        put("caps", {text: capFlags.join(", "),
            sub: "Toggles and built-in features, readable without asking."});

        // client-side storage surfaces available to track you
        const stores = storageAvailability();
        put("storage", {
            text: stores.length ? stores.join(", ") : "none available",
            warn: stores.length > 0,
            sub: "Each is a place a site can persist an identifier without a classic cookie.",
        });

        // embedding context
        const frame = frameContext();
        put("frame", {text: frame.text, warn: frame.warn});

        permissionStates().then((states) => {
            if (!states) return put("perms", {text: "not exposed by this browser", muted: true});
            put("perms", {
                text: states.join("  ·  "),
                sub: "Each grant/denial is itself a distinguishing signal — read without a prompt.",
            });
        });

        mediaDeviceCounts().then((c) => {
            if (!c) return put("devices", {text: "not exposed by this browser", muted: true});
            const parts: string[] = [];
            if (c.cam) parts.push(`${c.cam} camera${c.cam > 1 ? "s" : ""}`);
            if (c.mic) parts.push(`${c.mic} microphone${c.mic > 1 ? "s" : ""}`);
            if (c.spk) parts.push(`${c.spk} speaker${c.spk > 1 ? "s" : ""}`);
            put("devices", {text: parts.join(", ") || "none detected", warn: c.cam + c.mic > 0,
                sub: "Counts only — names need permission. Still a fingerprint signal."});
        });

        speechVoices().then((voices) => {
            if (!voices.length) return put("voices", {text: "none exposed", muted: true});
            put("voices", {
                text: `${voices.length} voices: ${voices.slice(0, 6).join(", ")}${voices.length > 6 ? "…" : ""}`,
                sub: "The exact set varies per OS and locale. You never installed these for a website.",
            });
        });

        setTimeout(() => {
            try {
                const fonts = detectFonts();
                put("fonts", {
                    text: fonts.length
                        ? `${fonts.length} detected: ${fonts.slice(0, 8).join(", ")}${fonts.length > 8 ? "…" : ""}`
                        : "none detected",
                    sub: "Probed by measuring text width. Reveals software you've installed.",
                });
            } catch {
                put("fonts", {text: "detection blocked", muted: true});
            }
        }, 0);

        const bait = document.createElement("div");
        bait.className = "adsbox ad-banner pub_300x250";
        bait.style.cssText = "position:absolute;height:8px;width:8px;left:-9999px;top:-9999px";
        document.body.appendChild(bait);
        const baitTimer = window.setTimeout(() => {
            const blocked = bait.offsetHeight === 0 || bait.offsetParent === null ||
                getComputedStyle(bait).display === "none";
            put("adblock", {text: blocked ? "Detected — a blocker is hiding bait elements" : "None detected",
                warn: !blocked});
            bait.remove();
        }, 120);

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
                // unavailable
            }
            put("canvas", {text: canvasSig, sub: "Drawn invisibly. Renders slightly differently per device."});

            const audioSig = await audioFingerprint();
            put("audio", audioSig
                ? {text: audioSig, sub: "Generated from silent audio you never heard."}
                : {text: "blocked or unsupported", muted: true});

            try {
                const signals = [
                    navigator.userAgent, (navigator.languages || []).join(","), os,
                    `${screen.width}x${screen.height}x${screen.colorDepth}`, devicePixelRatio,
                    tzName, navigator.hardwareConcurrency, nav.deviceMemory,
                    navigator.maxTouchPoints, gpuText, canvasSig, audioSig ?? "",
                ].join("|");
                const id = (await sha256Hex(signals)).slice(0, 24);
                setFp(id);
                put("fp", {text: id, warn: true, sub: "A stable label for this browser — no cookie required."});
            } catch {
                put("fp", {text: "unavailable in this context", muted: true});
            }
        })();

        return () => clearTimeout(baitTimer);
    }, []);

    // ---- Server fetch on mount ----
    useEffect(() => {
        fetch("/experiments/digital-footprint/api", {cache: "no-store"})
            .then((r) => (r.ok ? r.json() as Promise<ServerData> : null))
            .then((d) => {
                if (d) setSrv(d);
                else setSrvFailed(true);
            })
            .catch(() => setSrvFailed(true));
    }, []);

    // ---- Derived Section A & C values from server data ----
    const a = useMemo<Bag>(() => {
        if (srvFailed) {
            const fail: Val = {text: "server lookup unavailable", muted: true};
            return {ip: fail, ua: fail, lang: fail, ref: fail, dnt: fail};
        }
        if (!srv) return {} as Bag;
        return {
            ip: {text: srv.ipResolved ? srv.ip! : "not resolved on this host", muted: !srv.ipResolved},
            ua: {text: srv.ua || "—"},
            lang: {text: srv.acceptLanguage || "unknown"},
            ref: {text: srv.referer || "(none on this request)", muted: !srv.referer,
                sub: "This is the referrer on the lookup call, not necessarily your page navigation."},
            dnt: {
                text: srv.dnt || srv.gpc
                    ? `Signaled${srv.gpc ? " (GPC)" : ""}${srv.dnt ? " (DNT)" : ""} — and routinely ignored`
                    : "Not set",
                warn: !(srv.dnt || srv.gpc),
            },
        };
    }, [srv, srvFailed]);

    const c = useMemo<Bag>(() => {
        if (srvFailed) {
            const fail: Val = {text: "server lookup unavailable", muted: true};
            return {geo: fail, coords: fail, isp: fail, asn: fail, ptr: fail, iptype: fail, vpn: fail, tor: fail};
        }
        if (!srv) return {} as Bag;
        if (!srv.ipResolved) {
            const local: Val = {text: "no edge IP here — live on the deployed site", muted: true};
            return {geo: local, coords: local, isp: local, asn: local, ptr: local, iptype: local, vpn: local, tor: local};
        }
        const g = srv.geo;
        const place = [g.city, g.region, g.country].filter(Boolean).join(", ") || "unknown";
        const f = srv.flags;
        const iptype = f
            ? (f.hosting ? "Datacenter / hosting" : f.mobile ? "Mobile carrier" : "Residential / business") +
            (f.proxy ? " · flagged as proxy/VPN" : "")
            : "unclassified";

        let vpnText = "Inconclusive";
        let warn = false;
        const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown";
        if (srv.torExit) {
            vpnText = "Yes — the IP is a known Tor exit node";
            warn = true;
        } else if (f?.proxy) {
            vpnText = "Likely — the IP is on a known proxy/VPN list";
            warn = true;
        } else if (g.tz && tzName !== "unknown" && g.tz !== tzName) {
            vpnText = `Possible — IP says ${g.tz}, your clock says ${tzName}`;
            warn = true;
        } else if (g.tz) {
            vpnText = `No obvious mismatch (IP & clock agree on ${g.tz})`;
        }

        const torVal: Val = srv.torExit == null
            ? {text: "not checked (IPv6 or lookup failed)", muted: true}
            : srv.torExit
                ? {text: "Yes — matches the Tor Project's bulk exit list", warn: true}
                : {text: "No — not on the Tor exit list", muted: true,
                    sub: "Checked against the Tor Project's own published list, not a heuristic."};

        return {
            geo: {text: place, sub: "Derived from your IP alone — accurate to roughly your city."},
            coords: {text: g.lat != null && g.lon != null ? `${g.lat.toFixed(4)}, ${g.lon.toFixed(4)}` : "unknown"},
            isp: {text: srv.isp || srv.org || "unknown"},
            asn: {text: srv.asn || "unknown"},
            ptr: {text: srv.ptr || "no PTR record", muted: !srv.ptr,
                sub: srv.ptr ? "A reverse DNS lookup — impossible from your browser." : undefined},
            iptype: {text: iptype, warn: !!(f?.proxy || f?.hosting), muted: !f},
            vpn: {text: vpnText, warn,
                sub: "Cross-checks the IP's reputation and timezone against your device clock."},
            tor: torVal,
        };
    }, [srv, srvFailed]);

    const mapSrc = useMemo(() => {
        const g = srv?.geo;
        if (!g || g.lat == null || g.lon == null) return null;
        const lat = g.lat, lon = g.lon, dl = 0.06;
        return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - dl}%2C${lat - dl}%2C${lon + dl}%2C${lat + dl}&layer=mapnik&marker=${lat}%2C${lon}`;
    }, [srv]);

    // ---- Category groups: every signal regrouped by what it says about you ----
    const groups: {id: string; name: string; rows: RowDef[]}[] = [
        {id: "identity", name: "Identity", rows: [
            {label: "Languages", source: "sent", val: a.lang},
            {label: "Canvas fingerprint", source: "read", val: bx.canvas},
            {label: "Audio fingerprint", source: "read", val: bx.audio},
        ]},
        {id: "location", name: "Location", rows: [
            {label: "Timezone & clock", source: "read", val: bx.tz},
            {label: "Estimated location", source: "looked up", val: c.geo},
            {label: "Coordinates", source: "looked up", val: c.coords},
        ]},
        {id: "device", name: "Device", rows: [
            {label: "User agent", source: "sent", val: a.ua},
            {label: "Operating system", source: "read", val: bx.os},
            {label: "Screen", source: "read", val: bx.screen},
            {label: "CPU cores", source: "read", val: bx.cpu},
            {label: "Memory", source: "read", val: bx.mem},
            {label: "Touch points", source: "read", val: bx.touch},
            {label: "Pointer & hover", source: "read", val: bx.pointer},
            {label: "Battery", source: "read", val: bx.battery},
            {label: "Graphics (GPU)", source: "read", val: bx.gpu},
            {label: "Cameras & microphones", source: "read", val: bx.devices},
            {label: "Speech voices", source: "read", val: bx.voices},
            {label: "Installed fonts", source: "read", val: bx.fonts},
            {label: "OS preferences", source: "read", val: bx.prefs},
            {label: "Browser capabilities", source: "read", val: bx.caps},
        ]},
        {id: "behaviour", name: "Behaviour", rows: [
            {label: "Referrer", source: "sent", val: a.ref},
            {label: "Do Not Track", source: "sent", val: a.dnt},
            {label: "Cookies", source: "sent", val: bx.cookies},
            {label: "Permission states", source: "read", val: bx.perms},
            {label: "Storage surfaces", source: "read", val: bx.storage},
            {label: "Embedding context", source: "read", val: bx.frame},
            {label: "Ad / tracker blocker", source: "read", val: bx.adblock},
        ]},
        {id: "network", name: "Network", rows: [
            {label: "IP address", source: "sent", val: a.ip},
            {label: "Network", source: "read", val: bx.net},
            {label: "Internet provider", source: "looked up", val: c.isp},
            {label: "Network (ASN)", source: "looked up", val: c.asn},
            {label: "Reverse DNS (PTR)", source: "looked up", val: c.ptr},
            {label: "IP classification", source: "looked up", val: c.iptype},
            {label: "VPN / proxy", source: "looked up", val: c.vpn},
            {label: "Tor exit node", source: "looked up", val: c.tor},
        ]},
    ];
    const capsFor = (cat: string) => caps.filter((cp) => CAP_CAT[cp.id] === cat);
    const g = (id: string) => groups.find((x) => x.id === id)!;
    const signalCount = groups.reduce((n, x) => n + x.rows.length, 0);
    const facts: [string, string][] = [
        ["Location", srv?.ipResolved ? ([srv.geo.city, srv.geo.country].filter(Boolean).join(", ") || "—") : "…"],
        ["Provider", srv?.isp || srv?.org || "…"],
        ["Device", browserOs || "…"],
        ["Time zone", bx.tz?.text || "…"],
    ];

    return (
        <div className="mx-auto max-w-285 px-4 sm:px-8 pt-12 pb-16">
            <div className={styles.profile}>
                {/* identity card */}
                <aside className={styles.idCard}>
                    <div className="font-mono text-[11px] tracking-kicker uppercase text-accent flex items-center gap-2">
                        <span>EXPERIMENT</span><span className="text-fg-soft">·</span><span>DIGITAL FOOTPRINT</span>
                    </div>
                    <h1 className="mt-3 mb-2 text-[26px] font-semibold tracking-[-0.025em]">Digital Footprint Mirror</h1>
                    <div className={styles.idPanel}>
                        <div className={styles.idCapLabel}>Composite identity</div>
                        <div className={styles.idHash}>{fp || "…"}</div>
                        <div className={styles.idCap}>A stable ID </div>
                        <div className={styles.idDivider} />
                        {facts.map(([k, v]) => (
                            <div className={styles.fact} key={k}>
                                <span className={styles.factLabel}>{k}</span>
                                <span className={styles.factVal}>{v}</span>
                            </div>
                        ))}
                        {mapSrc && (
                            <div className={styles.idMap}>
                                <iframe src={mapSrc} title="Estimated location map" loading="lazy" referrerPolicy="no-referrer" />
                            </div>
                        )}
                        <div className={styles.idMapCap}>{mapSrc ? "// plotted from your IP — you were never asked" : "// on the deployed site this pinpoints you to city level"}</div>
                    </div>
                    <div className={styles.idStats}>
                        <div>{signalCount} signals · 0 permissions asked</div>
                        <div>0 cookies set · 1 network call</div>
                    </div>
                </aside>

                {/* category clusters — Device gets its own column (it holds the
                    camera / mic / motion / device grants that expand the most) */}
                <div className={styles.clusters}>
                    <div className={styles.col}>
                        <CatCluster name="Device" rows={g("device").rows} caps={capsFor("device")} />
                    </div>
                    <div className={styles.col}>
                        <CatCluster name="Location" rows={g("location").rows} caps={capsFor("location")} />
                        <CatCluster name="Network" rows={g("network").rows} caps={capsFor("network")} />
                        <CatCluster name="Identity" rows={g("identity").rows} caps={capsFor("identity")} />
                        <CatCluster name="Behaviour" rows={g("behaviour").rows} caps={capsFor("behaviour")} />
                    </div>
                </div>
            </div>

            {/* raw request headers — the unedited proof for Section "sent" */}
            {srv && srv.rawHeaders.length > 0 && (
                <details className={styles.headerToggle}
                         onToggle={(e) => setShowHeaders((e.target as HTMLDetailsElement).open)}>
                    <summary>the raw request ({srv.rawHeaders.length} headers)</summary>
                    {showHeaders && (
                        <pre className={styles.rawHeaders}>
                            {srv.rawHeaders.map(([k, v]) => `${k}: ${v}`).join("\n")}
                        </pre>
                    )}
                </details>
            )}

            {/* how to disclose less */}
            <section className={styles.sec}>
                <div className={styles.secHead}>
                    <span className={styles.secId}>↓ —</span>
                    <span className={styles.secTitle}>How to disclose less</span>
                </div>
                <div className={styles.fixGrid}>
                    <div className={styles.fix}>
                        <h3>Your IP &amp; location</h3>
                        <p>Route traffic through a <b>reputable VPN</b> or the <b>Tor Browser</b>. This hides your real IP and breaks the geolocation, reverse DNS, and classification rows under Location and Network.</p>
                    </div>
                    <div className={styles.fix}>
                        <h3>Cookies &amp; cross-site tracking</h3>
                        <p>Use <b>Firefox</b> or <b>Brave</b> with strict tracking protection, add <b>uBlock Origin</b>, and clear cookies regularly. Container tabs isolate one site&apos;s view of you from another&apos;s.</p>
                    </div>
                    <div className={styles.fix}>
                        <h3>Fingerprinting</h3>
                        <p>The canvas, audio, font, and voice signals under Identity and Device don&apos;t need cookies. Use a browser with <b>fingerprint resistance</b> (Tor Browser, or Firefox&apos;s <code>resistFingerprinting</code>) to normalize them.</p>
                    </div>
                    <div className={styles.fix}>
                        <h3>The user agent &amp; headers</h3>
                        <p>You can&apos;t stop sending these, but a privacy browser sends a <b>generic, common</b> set so your request blends into the crowd instead of standing out.</p>
                    </div>
                </div>
            </section>

            <footer className={styles.docFooter}>
                <span>Nothing here is stored or logged. The server gathered the <i>sent</i> and <i>looked-up</i> rows once for this page view and discarded them; everything <i>read</i> runs in your browser and is never sent back.</span>
            </footer>
        </div>
    );
}
