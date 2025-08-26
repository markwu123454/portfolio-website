"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { demos, demoList, type DemoSlug } from "./registry";
import type { DemoModule } from "./registry";

export default function Page() {
    const [items, setItems] = useState<Array<{ slug: DemoSlug; mod: DemoModule }>>([]);

    useEffect(() => {
        let alive = true;
        (async () => {
            const loaded = await Promise.all(
                demoList.map(async (slug) => ({ slug, mod: await demos[slug]() }))
            );
            if (alive) setItems(loaded);
        })();
        return () => {
            alive = false;
        };
    }, []);

    if (!items.length) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4 animate-pulse">
                        <div className="h-28 rounded-lg bg-white/10 mb-3" />
                        <div className="h-4 w-2/3 bg-white/10 rounded mb-2" />
                        <div className="h-3 w-5/6 bg-white/10 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-24 p-8">
            {items.map(({ slug, mod }) => (
                <article
                    key={slug}
                    className="group rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:border-white/20 hover:bg-white/10"
                >
                    <div className="mb-3 h-28 overflow-hidden rounded-xl border border-white/10 bg-black/40 flex items-center justify-center">
                        {mod.preview}
                    </div>

                    <h3 className="text-base font-semibold text-white">{mod.title}</h3>
                    <p className="mt-1 text-sm text-white/70 line-clamp-3">{mod.description}</p>

                    <div className="mt-3">
                        {/* Link to sibling dynamic route */}
                        <Link
                            href={`/misc/random/${slug}`}
                            className="inline-flex items-center gap-1 text-sm text-emerald-300 hover:text-emerald-200"
                        >
                            Open demo
                            <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden>
                                <path d="M7 17L17 7M17 7H9M17 7v8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                            </svg>
                        </Link>
                    </div>
                </article>
            ))}
        </div>
    );
}
