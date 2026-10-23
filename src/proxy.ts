import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';
import { logVisit, visitorLoggingEnabled } from '@/lib/visitors';

// Logs every full page load to Neon. The insert runs after the response is sent (waitUntil),
// so a slow or failing database never delays or breaks a page. Client-side navigations are
// logged separately by <PageViewTracker> via /api/pv.

// Next strips its own RSC/prefetch headers before the proxy runs, so <Link> prefetches look like
// ordinary GETs here. The browser's Sec-Fetch-Dest survives: a real page load is "document",
// while every RSC fetch (prefetch or client-side navigation) is "empty". Bots and curl send no
// Sec-Fetch headers at all, so those are counted too.
function isPageLoad(request: NextRequest): boolean {
    const h = request.headers;
    if (h.get('purpose') === 'prefetch' || h.get('sec-purpose')?.includes('prefetch')) return false;
    const dest = h.get('sec-fetch-dest');
    return dest === null || dest === 'document';
}

export function proxy(request: NextRequest, event: NextFetchEvent) {
    if (visitorLoggingEnabled && request.method === 'GET' && isPageLoad(request)) {
        event.waitUntil(logVisit(request.headers, request.nextUrl.pathname + request.nextUrl.search));
    }
    return NextResponse.next();
}

export const config = {
    // Pages, plus the two files worth counting. Skips Next internals, API routes and other static files.
    matcher: ['/((?!_next/|api/|.*\\..*).*)', '/resume.pdf', '/robots.txt'],
};
