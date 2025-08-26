import { notFound } from "next/navigation";
import { demos, type DemoSlug } from "../registry";
import DemoClient from "./DemoClient";

export default function DemoPage({ params }: { params: { slug: string } }) {
    const slug = params.slug as DemoSlug;
    if (!(slug in demos)) notFound();
    return (
        <main className="min-h-screen bg-black text-white">
            <DemoClient slug={slug} />
        </main>
    );
}
