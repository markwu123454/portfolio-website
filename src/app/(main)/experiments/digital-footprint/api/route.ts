/**
 * Digital Footprint Mirror — server endpoint.
 *   GET /experiments/digital-footprint/api
 *
 * Everything the SERVER can see about the request, in one response:
 *   • the real request headers (UA, languages, client hints, etc.)
 *   • the resolved client IP
 *   • free external enrichment of that IP — Vercel geo headers, ip-api.com
 *     proxy/hosting/mobile flags, and a reverse-DNS (PTR) lookup
 *
 * Runs on the Node runtime (reverse DNS needs `node:dns`). Nothing is stored
 * or logged; the IP is used for this one lookup and the response is no-store.
 *
 * Note on header fidelity: these are the headers carried by the fetch() to
 * this endpoint. Most (user-agent, accept-language, client hints, IP) are
 * identical to the original page navigation. A few are request-context
 * specific — sec-fetch-*, referer, priority — and are labelled as such by the
 * client so the demo stays honest.
 */

import {NextResponse} from "next/server";
import {headers} from "next/headers";
import dns from "node:dns/promises";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEADER_ORDER = [
    "user-agent", "accept", "accept-language", "accept-encoding", "referer",
    "dnt", "sec-gpc", "sec-ch-ua", "sec-ch-ua-platform", "sec-ch-ua-mobile",
    "sec-ch-ua-platform-version", "sec-ch-ua-arch", "sec-ch-ua-model",
    "sec-fetch-site", "sec-fetch-mode", "sec-fetch-dest",
    "upgrade-insecure-requests", "connection", "priority",
];

type IpApi = {
    status?: string; country?: string; regionName?: string; city?: string;
    lat?: number; lon?: number; timezone?: string; isp?: string; org?: string;
    as?: string; asname?: string; reverse?: string;
    mobile?: boolean; proxy?: boolean; hosting?: boolean;
};

export type FootprintResponse = {
    // ---- Section A: what the server received ----
    ip: string | null;
    ipResolved: boolean;
    ua: string | null;
    acceptLanguage: string | null;
    referer: string | null;
    dnt: boolean;
    gpc: boolean;
    chPlatform: string | null;
    rawHeaders: Array<[string, string]>;
    // ---- Section C: what the IP reveals ----
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

function firstForwarded(xff: string | null): string | null {
    if (!xff) return null;
    return xff.split(",")[0]?.trim() || null;
}

function isPrivate(ip: string): boolean {
    return (
        ip === "127.0.0.1" || ip === "::1" ||
        ip.startsWith("10.") || ip.startsWith("192.168.") ||
        /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
        ip.startsWith("fc") || ip.startsWith("fd")
    );
}

async function checkTorExit(ip: string | null): Promise<boolean | null> {
    // IPv4 only — the Tor bulk exit list is IPv4. Returns null when unknown.
    if (!ip || ip.includes(":")) return null;
    try {
        const res = await fetch("https://check.torproject.org/torbulkexitlist", {cache: "no-store"});
        if (!res.ok) return null;
        const text = await res.text();
        // line-delimited list of exit IPs; exact-match a full line
        return text.split("\n").some((line) => line.trim() === ip);
    } catch {
        return null;
    }
}

async function enrich(ip: string | null) {
    if (!ip || isPrivate(ip)) {
        return {api: null as IpApi | null, ptr: null as string | null, torExit: null as boolean | null};
    }
    const fields = [
        "status", "country", "regionName", "city", "lat", "lon", "timezone",
        "isp", "org", "as", "asname", "reverse", "mobile", "proxy", "hosting",
    ].join(",");
    const apiP = fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=${fields}`, {cache: "no-store"})
        .then((r) => (r.ok ? r.json() : null))
        .then((d: IpApi | null) => (d && d.status === "success" ? d : null))
        .catch(() => null);
    const ptrP = dns.reverse(ip).then((n) => n[0] ?? null).catch(() => null);
    const torP = checkTorExit(ip);
    const [api, ptr, torExit] = await Promise.all([apiP, ptrP, torP]);
    return {api, ptr, torExit};
}

export async function GET() {
    const h = await headers();

    const rawHeaders: Array<[string, string]> = [];
    for (const key of HEADER_ORDER) {
        const v = h.get(key);
        if (v) rawHeaders.push([key, v]);
    }

    const ip = firstForwarded(h.get("x-forwarded-for")) ?? h.get("x-real-ip") ?? null;
    const ipResolved = !!ip && !isPrivate(ip);

    const vCity = h.get("x-vercel-ip-city");
    const vercel = {
        city: vCity ? decodeURIComponent(vCity) : null,
        region: h.get("x-vercel-ip-country-region"),
        country: h.get("x-vercel-ip-country"),
        lat: h.get("x-vercel-ip-latitude"),
        lon: h.get("x-vercel-ip-longitude"),
        tz: h.get("x-vercel-ip-timezone"),
    };

    const {api, ptr, torExit} = await enrich(ip);

    const body: FootprintResponse = {
        ip,
        ipResolved,
        ua: h.get("user-agent"),
        acceptLanguage: h.get("accept-language"),
        referer: h.get("referer"),
        dnt: h.get("dnt") === "1",
        gpc: h.get("sec-gpc") === "1",
        chPlatform: h.get("sec-ch-ua-platform"),
        rawHeaders,
        geo: {
            city: vercel.city ?? api?.city ?? null,
            region: vercel.region ?? api?.regionName ?? null,
            country: vercel.country ?? api?.country ?? null,
            lat: vercel.lat ? Number(vercel.lat) : api?.lat ?? null,
            lon: vercel.lon ? Number(vercel.lon) : api?.lon ?? null,
            tz: vercel.tz ?? api?.timezone ?? null,
        },
        isp: api?.isp ?? null,
        org: api?.org ?? null,
        asn: api?.as ?? api?.asname ?? null,
        ptr: ptr ?? api?.reverse ?? null,
        flags: api ? {proxy: !!api.proxy, hosting: !!api.hosting, mobile: !!api.mobile} : null,
        torExit,
    };

    return NextResponse.json(body, {headers: {"Cache-Control": "no-store"}});
}