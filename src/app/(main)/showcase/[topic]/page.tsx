import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ShowcaseLayout } from '@/app/components/showcase/showcase-layout';
import { getShowcase, SHOWCASES } from '@/content/showcase';

interface Props {
    params: Promise<{ topic: string }>;
}

// Only the topics listed in content/showcase exist; anything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
    return SHOWCASES.map((s) => ({ topic: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const showcase = getShowcase((await params).topic);
    if (!showcase) return {};
    return {
        title: `${showcase.topic} showcase`,
        description: showcase.description,
        // Unlinked drafts for now; keep them out of search until they're linked from the site.
        robots: { index: false, follow: false },
    };
}

export default async function ShowcasePage({ params }: Props) {
    const showcase = getShowcase((await params).topic);
    if (!showcase) notFound();
    return <ShowcaseLayout showcase={showcase} />;
}
