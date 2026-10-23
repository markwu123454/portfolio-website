import { neon } from '@neondatabase/serverless';

// Shared by the proxy (full page loads) and /api/pv (client-side navigations).
const TABLE = 'visitors';

const sql = process.env.VISITOR_DATABASE_URL ? neon(process.env.VISITOR_DATABASE_URL) : null;

export function clientIp(headers: Headers): string | null {
    const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const ip = forwarded || headers.get('x-real-ip')?.trim();
    // The column is inet; anything that isn't a plain v4/v6 address would fail the insert.
    if (!ip || !/^[0-9a-fA-F:.]+$/.test(ip)) return null;
    return ip;
}

export const visitorLoggingEnabled = sql !== null;

// Never throws: a failed insert is logged and dropped so it can't break a request.
export async function logVisit(headers: Headers, path: string): Promise<void> {
    if (!sql) return;
    try {
        await sql.query(`INSERT INTO ${TABLE} (ip, time, user_agent, path) VALUES ($1, now(), $2, $3)`, [
            clientIp(headers),
            headers.get('user-agent'),
            path,
        ]);
    } catch (err) {
        console.error('page view log failed', err);
    }
}
