import { after, type NextRequest } from 'next/server';
import { logVisit } from '@/lib/visitors';

// Receives a beacon from <PageViewTracker> for each client-side navigation. The body is the
// plain path + query string. Anyone can post here, so only accept something shaped like a path.
const MAX_PATH = 500;

export async function POST(request: NextRequest) {
    const path = (await request.text()).trim();
    if (!path.startsWith('/') || path.startsWith('//') || path.length > MAX_PATH) {
        return new Response(null, { status: 400 });
    }

    after(() => logVisit(request.headers, path));
    return new Response(null, { status: 204 });
}
