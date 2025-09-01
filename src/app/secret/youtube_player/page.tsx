"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Player = YT.Player;

// --- helpers ---
function parseYouTubeId(input: string): string | null {
    try {
        const s = input.trim();
        if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
        const url = new URL(s);
        const host = url.hostname.replace(/^www\./, "");
        if (host === "youtu.be") {
            const id = url.pathname.split("/").filter(Boolean)[0];
            return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
        }
        if (host.endsWith("youtube.com")) {
            const v = url.searchParams.get("v");
            if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
            const parts = url.pathname.split("/").filter(Boolean);
            const embedIdx = parts.indexOf("embed");
            if (embedIdx >= 0 && parts[embedIdx + 1] && /^[a-zA-Z0-9_-]{11}$/.test(parts[embedIdx + 1])) return parts[embedIdx + 1];
            const shortsIdx = parts.indexOf("shorts");
            if (shortsIdx >= 0 && parts[shortsIdx + 1] && /^[a-zA-Z0-9_-]{11}$/.test(parts[shortsIdx + 1])) return parts[shortsIdx + 1];
        }
    } catch {}
    return null;
}

function parseTimeToSeconds(input: string | number | null | undefined): number | undefined {
    if (input == null) return undefined;
    if (typeof input === "number") return Number.isFinite(input) && input >= 0 ? Math.floor(input) : undefined;
    const s = String(input).trim();
    if (!s) return undefined;
    if (/^\d+$/.test(s)) return Math.max(0, parseInt(s, 10));
    const m = s.match(/^(\d+):(\d{1,2})(?::(\d{1,2}))?$/); // mm:ss or hh:mm:ss
    if (m) {
        const h = m[3] ? parseInt(m[1], 10) : 0;
        const mm = m[3] ? parseInt(m[2], 10) : parseInt(m[1], 10);
        const ss = m[3] ? parseInt(m[3], 10) : parseInt(m[2], 10);
        return Math.max(0, h * 3600 + mm * 60 + ss);
    }
    return undefined;
}

function formatSeconds(n?: number) {
    if (n == null || !Number.isFinite(n)) return "";
    const s = Math.max(0, Math.floor(n));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}` : `${m}:${String(sec).padStart(2, "0")}`;
}

// --- storage keys ---
const LS_KEY = "yt_playlist_v2";           // playlist + start/end + name
const LS_INDEX_KEY = "yt_playlist_index_v1";
const LS_MODE_KEY = "yt_playlist_mode_v1";

// --- types ---
type Item = {
    id: string;
    url: string;
    name?: string;  // display name
    start?: number; // seconds
    end?: number;   // seconds
};

type PlaybackMode = "sequential" | "shuffle";


// --- storage helpers ---
function loadPlaylist(): Item[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed
                .map((x) => ({ id: x.id, url: x.url, name: x.name, start: x.start, end: x.end }))
                .filter((x) => x && typeof x.id === "string" && typeof x.url === "string");
        }
    } catch {}
    return [];
}
function savePlaylist(list: Item[]) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch {}
}
function loadIndex(): number {
    if (typeof window === "undefined") return 0;
    const raw = localStorage.getItem(LS_INDEX_KEY);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) ? n : 0;
}
function saveIndex(i: number) { try { localStorage.setItem(LS_INDEX_KEY, String(i)); } catch {} }
function loadMode(): PlaybackMode {
    if (typeof window === "undefined") return "sequential";
    const v = localStorage.getItem(LS_MODE_KEY);
    return v === "shuffle" ? "shuffle" : "sequential";
}
function saveMode(m: PlaybackMode) {
    try { localStorage.setItem(LS_MODE_KEY, m); } catch {}
}
function randIndex(n: number, exclude: number): number {
    if (n <= 1) return 0;
    let j = exclude;
    while (j === exclude) j = Math.floor(Math.random() * n);
    return j;
}

declare global {
    interface Window {
        onYouTubeIframeAPIReady?: () => void;
        YT?: typeof YT; // optional until script loads
    }
}

export default function Page() {
    const [playlist, setPlaylist] = useState<Item[]>([]);
    const [current, setCurrent] = useState(0);
    const [input, setInput] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<Record<string, boolean>>({});
    const [mode, setMode] = useState<PlaybackMode>("sequential");

    const playerRef = useRef<Player | null>(null);
    const ytReadyRef = useRef<boolean>(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const endPollRef = useRef<number | null>(null);

    const parsedInputId = useMemo(() => (input ? parseYouTubeId(input) : null), [input]);
    const currentItem = playlist[current] ?? null;

// load & persist once
    useEffect(() => {
        setPlaylist(loadPlaylist());
        setCurrent(loadIndex());
        setMode(loadMode());
    }, []);
    useEffect(() => { savePlaylist(playlist); }, [playlist]);
    useEffect(() => { saveIndex(current); }, [current]);
    useEffect(() => { saveMode(mode); }, [mode]);

// iframe api
    useEffect(() => {
        if (typeof window === "undefined") return;
        function onYouTubeIframeAPIReady() {
            ytReadyRef.current = true;
            createOrCuePlayer();
        }
        if (window.YT && window.YT.Player) {
            ytReadyRef.current = true;
            createOrCuePlayer();
            return;
        }
        window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
        const scriptId = "youtube-iframe-api";
        if (!document.getElementById(scriptId)) {
            const s = document.createElement("script");
            s.id = scriptId;
            s.src = "https://www.youtube.com/iframe_api";
            s.async = true;
            document.body.appendChild(s);
        }
        return () => {
            if (playerRef.current) {
                try { playerRef.current.destroy(); } catch {}
                playerRef.current = null;
            }
            if (endPollRef.current !== null) {
                clearInterval(endPollRef.current);
                endPollRef.current = null;
            }
        };
// eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => { createOrCuePlayer(); }, [currentItem?.id, currentItem?.start, currentItem?.end]);

    function createOrCuePlayer() {
        if (typeof window === "undefined" || !ytReadyRef.current || !containerRef.current) return;
        const YTns = window.YT;
        if (!YTns) return;

        const vid = currentItem?.id;
        if (!vid) return;

        const startSeconds = currentItem?.start ?? 0;
        const endSeconds = currentItem?.end && currentItem.end > startSeconds ? currentItem.end : undefined;

        if (playerRef.current) {
            try {
                playerRef.current.loadVideoById({ videoId: vid, startSeconds, endSeconds, suggestedQuality: "large" });
            } catch {
                try { playerRef.current.destroy(); } catch {}
                playerRef.current = null;
            }
        }

        if (!playerRef.current) {
            playerRef.current = new YTns.Player(containerRef.current, {
                videoId: vid,
                playerVars: {
                    modestbranding: 1,
                    rel: 0,
                    playsinline: 1,
                    enablejsapi: 1,
                    origin: window.location.origin,
                    controls: 0,
                    disablekb: 1,
                    fs: 0,
                },
                events: {
                    onReady: (e) => { try { e.target.playVideo(); } catch {} },
                    onStateChange: (e) => {
                        if (e.data === 0) {
                            next();
                        } else if (e.data === 2) {
                            try { playerRef.current?.playVideo(); } catch {}
                        }
                    },
                },
            });
        }

        // Fallback: poll for endSeconds where some platforms ignore endSeconds
        if (endPollRef.current !== null) {
            clearInterval(endPollRef.current);
            endPollRef.current = null;
        }
        if (endSeconds != null) {
            endPollRef.current = window.setInterval(() => {
                try {
                    const t = playerRef.current?.getCurrentTime?.();
                    if (typeof t === "number" && t >= endSeconds - 0.15) {
                        if (endPollRef.current !== null) clearInterval(endPollRef.current);
                        endPollRef.current = null;
                        next();
                    }
                } catch {}
            }, 150);
        }
    }


    // --- actions ---
    function add() {
        setError(null);
        const id = parseYouTubeId(input);
        if (!id) { setError("Invalid YouTube URL or ID"); return; }

        // try to pull t= from URL for start
        let start: number | undefined;
        try {
            const u = new URL(input);
            const t = u.searchParams.get("t") || u.searchParams.get("start");
            const s = parseTimeToSeconds(t || undefined);
            if (s != null) start = s;
        } catch {}

        const url = input.trim();
        setPlaylist((prev) => {
            const exists = prev.some((p) => p.id === id);
            const nextList = exists ? prev : [...prev, { id, url, name: undefined, start }];
            if (prev.length === 0) setCurrent(0);
            return nextList;
        });
        setInput("");
    }

    function removeAt(i: number) {
        setPlaylist((prev) => {
            const next = prev.slice(0, i).concat(prev.slice(i + 1));
            if (i < current) setCurrent((c) => Math.max(0, c - 1));
            else if (i === current) setCurrent((c) => Math.min(c, Math.max(0, next.length - 1)));
            if (next.length === 0) setCurrent(0);
            return next;
        });
    }

    function move(i: number, dir: -1 | 1) {
        setPlaylist((prev) => {
            const j = i + dir;
            if (j < 0 || j >= prev.length) return prev;
            const next = prev.slice();
            [next[i], next[j]] = [next[j], next[i]];
            if (current === i) setCurrent(j);
            else if (current === j) setCurrent(i);
            return next;
        });
    }

    function playAt(i: number) { if (i >= 0 && i < playlist.length) setCurrent(i); }

    function next() {
        setCurrent((c) => {
            if (!playlist.length) return 0;
            return mode === "shuffle"
                ? randIndex(playlist.length, c)                  // random, not the one just played
                : (c + 1 < playlist.length ? c + 1 : 0);        // sequential loop
        });
    }

    function prev() {
        setCurrent((c) => {
            if (!playlist.length) return 0;
            return mode === "shuffle"
                ? randIndex(playlist.length, c)                  // random choice for prev in shuffle
                : (c - 1 >= 0 ? c - 1 : Math.max(playlist.length - 1, 0));
        });
    }

    function clearAll() { setPlaylist([]); setCurrent(0); }

    function saveEdit(id: string, fields: Partial<Item>) {
        setPlaylist((prev) => prev.map((p) => (p.id === id ? { ...p, ...fields } : p)));
        setEditing((e) => ({ ...e, [id]: false }));
    }

    // --- UI ---
    return (
        <div className="min-h-[100dvh] bg-black text-gray-200 p-4 md:p-6 lg:p-8 flex flex-col gap-4 mt-24">
            <h1 className="text-2xl font-bold text-white">
                YouTube Playlist <span className="text-xs text-gray-400 align-middle ml-2">[{mode}]</span>
            </h1>

            <div className="flex flex-col gap-2 md:flex-row md:items-end md:gap-3">
                <label className="flex-1">
                    <span className="block text-sm font-medium text-gray-300">Add YouTube URL or ID</span>
                    <input
                        className="mt-1 w-full rounded-xl border border-gray-600 bg-gray-800 text-gray-100 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") add(); }}
                    />
                </label>
                <button className="rounded-xl border border-gray-600 bg-gray-800 text-gray-100 px-4 py-2 font-medium hover:bg-gray-700" onClick={add}>Add</button>
                <button className="rounded-xl border border-gray-600 bg-gray-800 text-gray-100 px-4 py-2 font-medium hover:bg-gray-700" onClick={prev} disabled={!playlist.length}>Prev</button>
                <button className="rounded-xl border border-gray-600 bg-gray-800 text-gray-100 px-4 py-2 font-medium hover:bg-gray-700" onClick={next} disabled={!playlist.length}>Next</button>
                <button className="rounded-xl border border-red-600 bg-red-900 text-red-100 px-4 py-2 font-medium hover:bg-red-800" onClick={clearAll} disabled={!playlist.length}>Clear</button>
            </div>

            <div className="text-sm text-gray-400">
                {input ? (
                    parsedInputId ? (
                        <span>Parsed ID from input: <code className="font-mono">{parsedInputId}</code></span>
                    ) : (
                        <span>Unable to parse a valid video ID from current input.</span>
                    )
                ) : (
                    <span>Tip: paste any YouTube URL or raw 11-char ID. Start/end accept &#34;mm:ss&#34; or seconds.</span>
                )}
            </div>
            {error && <div className="text-sm text-red-400">{error}</div>}

            <div className="flex flex-col md:flex-row gap-4 flex-1">
                {/* Player (controls disabled) */}
                <div className="basis-1/2 aspect-video rounded-2xl border border-gray-600 overflow-hidden select-none">
                    <div ref={containerRef} className="w-full h-full" />
                </div>

                {/* Playlist */}
                <div className="basis-1/2 rounded-2xl border border-gray-600 divide-y divide-gray-700 flex flex-col">
                    <div className="p-3 flex items-center justify-between gap-2">
                        <div className="text-sm text-gray-300">Playlist ({playlist.length})</div>
                        {currentItem && (
                            <div className="text-xs text-gray-400">
                                Now: <code className="font-mono">{currentItem.name || currentItem.id}</code>
                            </div>
                        )}
                        <div className="ml-auto rounded-xl border border-gray-600 bg-gray-800 text-gray-100 px-2 font-medium flex items-center gap-2">
                            <span className="text-xs text-gray-300">Playback:</span>
                            <button
                                className={`rounded px-2 py-1 text-xs border ${mode==="sequential" ? "border-blue-500 bg-blue-900/40 text-blue-100" : "border-gray-600"}`}
                                onClick={() => setMode("sequential")}
                                title="Play in order and loop"
                            >
                                Sequential
                            </button>
                            <button
                                className={`rounded px-2 py-1 text-xs border ${mode==="shuffle" ? "border-blue-500 bg-blue-900/40 text-blue-100" : "border-gray-600"}`}
                                onClick={() => setMode("shuffle")}
                                title="Shuffle without immediate repeats"
                            >
                                Shuffle
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto">
                        {playlist.length === 0 ? (
                            <div className="p-4 text-sm text-gray-500">Empty. Add a YouTube URL above.</div>
                        ) : (
                            playlist.map((p, i) => (
                                <div key={p.id} className={`p-3 ${i === current ? "bg-gray-800" : ""}`}>
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="rounded border border-gray-600 px-2 py-1 text-xs text-gray-200"
                                            onClick={() => move(i, -1)}
                                            title="Move up"
                                        >↑</button>
                                        <button
                                            className="rounded border border-gray-600 px-2 py-1 text-xs text-gray-200"
                                            onClick={() => move(i, +1)}
                                            title="Move down"
                                        >↓</button>
                                        <button
                                            className="rounded border border-gray-600 px-2 py-1 text-xs text-gray-200"
                                            onClick={() => removeAt(i)}
                                            title="Remove"
                                        >✕</button>
                                        <button
                                            className="rounded border border-blue-600 bg-blue-900/40 px-2 py-1 text-xs text-blue-100"
                                            onClick={() => playAt(i)}
                                            title="Play"
                                        >Play</button>
                                        <div className="flex-1 truncate text-gray-100" title={p.url}>
                                            {i + 1}. {p.name || p.id}
                                        </div>
                                        <button
                                            className="rounded border border-gray-600 px-2 py-1 text-xs text-gray-200"
                                            onClick={() => setEditing((e) => ({ ...e, [p.id]: !e[p.id] }))}
                                        >Edit</button>
                                    </div>
                                    {editing[p.id] && (
                                        <EditRow
                                            item={p}
                                            onCancel={() => setEditing((e) => ({ ...e, [p.id]: false }))}
                                            onSave={(fields) => saveEdit(p.id, fields)}
                                        />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <ul className="text-xs text-gray-500 list-disc pl-5">
                <li>Manual controls disabled: no UI, kb disabled; pauses auto-resume.</li>
                <li>Each item supports display name, start and end times. End uses API endSeconds; timer fallback included.</li>
                <li>Times accept seconds or mm:ss / hh:mm:ss formats.</li>
            </ul>
        </div>
    );
}

// Inline editor component
function EditRow({ item, onCancel, onSave }: { item: Item; onCancel: () => void; onSave: (f: Partial<Item>) => void }) {
    const [name, setName] = useState(item.name || "");
    const [start, setStart] = useState(item.start != null ? formatSeconds(item.start) : "");
    const [end, setEnd] = useState(item.end != null ? formatSeconds(item.end) : "");

    function handleSave() {
        const s = parseTimeToSeconds(start);
        const e = parseTimeToSeconds(end);
        const fields: Partial<Item> = { name: name.trim() || undefined, start: s, end: e };
        if (s != null && e != null && e <= s) {
            // ignore invalid end
            fields.end = undefined;
        }
        onSave(fields);
    }

    return (
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <label className="col-span-2">
                <span className="block text-gray-400">Display name</span>
                <input
                    className="mt-1 w-full rounded border border-gray-600 bg-gray-900 px-2 py-1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </label>
            <label>
                <span className="block text-gray-400">Start (s or mm:ss)</span>
                <input
                    className="mt-1 w-full rounded border border-gray-600 bg-gray-900 px-2 py-1"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    placeholder="0:42"
                />
            </label>
            <label>
                <span className="block text-gray-400">End (s or mm:ss)</span>
                <input
                    className="mt-1 w-full rounded border border-gray-600 bg-gray-900 px-2 py-1"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    placeholder="1:23"
                />
            </label>
            <div className="col-span-2 flex gap-2 justify-end">
                <button className="rounded border border-gray-600 px-3 py-1" onClick={onCancel}>Cancel</button>
                <button className="rounded border border-green-600 bg-green-900/40 px-3 py-1" onClick={handleSave}>Save</button>
            </div>
        </div>
    );
}
