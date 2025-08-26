// src/app/misc/random/[slug]/page.tsx
import { notFound } from "next/navigation";
import { demos, type DemoSlug } from "../registry";
import DemoClient from "./DemoClient";

export default async function DemoPage({
                                           params,
                                       }: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params; // <- await the Promise
    const s = slug as DemoSlug;
    if (!(s in demos)) notFound();

    return (
        <main className="min-h-screen bg-black text-white">
            <DemoClient slug={s} />
        </main>
    );
}
