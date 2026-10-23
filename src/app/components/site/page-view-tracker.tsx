'use client';

/**
 * Reports client-side navigations to /api/pv.
 *
 * Full page loads are already logged by the proxy, so the first path this
 * sees is only remembered, not sent. After that, every change of path or
 * query string sends one beacon. Prefetches never change the URL, so they
 * don't count.
 */

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function PageViewTracker() {
    const pathname = usePathname();
    const search = useSearchParams().toString();
    const lastPath = useRef<string | null>(null);

    useEffect(() => {
        const path = search ? `${pathname}?${search}` : pathname;
        // Comparing against the last path (rather than a "first render" flag) also keeps
        // Strict Mode's double effect in dev from sending a duplicate.
        if (lastPath.current === null) {
            lastPath.current = path;
            return;
        }
        if (path === lastPath.current) return;
        lastPath.current = path;
        navigator.sendBeacon('/api/pv', path);
    }, [pathname, search]);

    return null;
}
