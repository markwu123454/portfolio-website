import { neon } from '@neondatabase/serverless';
import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';

// Logs every page fetch to Neon. The insert runs after the response is sent (waitUntil),
// so a slow or failing database never delays or breaks a page.
const TABLE = 'visitors';

const sql = process.env.VISITOR_DATABASE_URL ? neon(process.env.VISITOR_DATABASE_URL) : null;

function clientIp(request: NextRequest): string | null {
    const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const ip = forwarded || request.headers.get('x-real-ip')?.trim();
    // The column is inet; anything that isn't a plain v4/v6 address would fail the insert.
    if (!ip || !/^[0-9a-fA-F:.]+$/.test(ip)) return null;
    return ip;
}

function isPrefetch(request: NextRequest): boolean {
    const h = request.headers;
    return h.has('next-router-prefetch') || h.get('purpose') === 'prefetch' || h.get('sec-purpose')?.includes('prefetch') === true;
}

export function proxy(request: NextRequest, event: NextFetchEvent) {
    if (sql && request.method === 'GET' && !isPrefetch(request)) {
        const ip = clientIp(request);
        const userAgent = request.headers.get('user-agent');
        const path = request.nextUrl.pathname + request.nextUrl.search;

        event.waitUntil(
            sql
                .query(`INSERT INTO ${TABLE} (ip, time, user_agent, path) VALUES ($1, now(), $2, $3)`, [ip, userAgent, path])
                .catch((err) => console.error('page view log failed', err)),
        );
    }
    return NextResponse.next();
}

export const config = {
    // Pages, plus the two files worth counting. Skips Next internals, API routes and other static files.
    matcher: ['/((?!_next/|api/|.*\\..*).*)', '/resume.pdf', '/robots.txt'],
};
