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
            <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4 animate-pulse">
                        <div className="aspect-square rounded-xl bg-white/10 mb-3" />
                        <div className="h-4 w-2/3 bg-white/10 rounded mb-2" />
                        <div className="h-3 w-5/6 bg-white/10 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-6 mt-24 p-8">
            {items.map(({ slug, mod }) => (
                <Link
                    key={slug}
                    href={`/misc/random/${slug}`}
                    className="group rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:border-white/20 hover:bg-white/10 flex flex-col"
                >
                    <div className="mb-3 aspect-square overflow-hidden rounded-xl border border-white/10 bg-black/40 flex items-center justify-center">
                        {mod.preview}
                    </div>

                    <h3 className="text-base font-semibold text-white">{mod.title}</h3>
                    <p className="mt-1 text-sm text-white/70 line-clamp-3">{mod.description}</p>

                    <div className="mt-3 inline-flex items-center gap-1 text-sm text-emerald-300 group-hover:text-emerald-200">
                        Open demo
                        <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                            aria-hidden
                        >
                            <path
                                d="M7 17L17 7M17 7H9M17 7v8"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                </Link>
            ))}
        </div>
    );
}
