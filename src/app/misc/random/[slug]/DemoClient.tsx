"use client";

import { useEffect, useState } from "react";
import { demos, type DemoSlug } from "../registry";
import type { DemoModule } from "../registry";

export default function DemoClient({ slug }: { slug: DemoSlug }) {
    const [mod, setMod] = useState<DemoModule | null>(null);

    useEffect(() => {
        let alive = true;
        (async () => {
            const m = await demos[slug]();
            if (alive) setMod(m);
        })();
        return () => {
            alive = false;
        };
    }, [slug]);

    if (!mod) return null; // or a skeleton
    const Demo = mod.Page;
    return <Demo />;
}
