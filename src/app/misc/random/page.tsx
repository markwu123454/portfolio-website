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
            <div className="max-w-7xl mx-auto px-6 py-6 mt-24">
                {/* Header skeleton */}
                <div className="mb-12">
                    <div className="h-8 w-64 rounded bg-white/10 animate-pulse" />
                    <div className="mt-3 h-4 w-96 max-w-full rounded bg-white/10 animate-pulse" />
                </div>

                {/* Grid skeleton */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className="rounded-xl border border-white/10 bg-white/[0.04] p-3 animate-pulse flex flex-col"
                        >
                            <div className="mb-3 aspect-[4/3] rounded-lg bg-white/10" />

                            <div className="h-4 w-2/3 rounded bg-white/10 mb-2" />
                            <div className="h-3 w-full rounded bg-white/10" />

                            <div className="mt-3 h-3 w-20 rounded bg-white/10" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }


    const ready = items.filter(({ mod }) => mod.presentable);
    const wip = items.filter(({ mod }) => !mod.presentable);

    const Grid = ({ data }: { data: typeof items }) => (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.map(({ slug, mod }) => (
                <Link
                    key={slug}
                    href={`/misc/random/${slug}`}
                    className="group rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur
                               transition hover:border-white/20 hover:bg-white/[0.08]
                               flex flex-col"
                >
                    {/* Preview */}
                    <div className="mb-3 aspect-[1/1] overflow-hidden rounded-lg border border-white/10 bg-black/40
                                    flex items-center justify-center">
                        {mod.preview}
                    </div>

                    {/* Text */}
                    <h3 className="text-sm font-medium text-white leading-tight">
                        {mod.title}
                    </h3>

                    <p className="mt-1 text-xs text-white/60 line-clamp-2">
                        {mod.description}
                    </p>

                    {/* CTA */}
                    <div className="mt-3 inline-flex items-center gap-1 text-xs text-emerald-300
                                    group-hover:text-emerald-200">
                        Open demo
                        <svg
                            viewBox="0 0 24 24"
                            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
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

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 mt-24">
            {/* Header */}
            <div className="mb-12">
                <h1 className="text-3xl font-semibold tracking-tight text-white">
                    Random Experiments
                </h1>
                <p className="mt-2 max-w-2xl text-white/60">
                    Small interactive demos, visual ideas, and some stuff I find useful.
                </p>
            </div>

            {/* Ready demos */}
            <Grid data={ready} />

            {/* Divider + WIP */}
            {wip.length > 0 && (
                <>
                    <div className="my-16 flex items-center gap-4">
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="text-xs uppercase tracking-wide text-white/40">
                            Work in progress
                        </span>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <Grid data={wip} />
                </>
            )}
        </div>
    );
}
