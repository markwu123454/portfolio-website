import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProjectLayout } from '@/app/components/project/project-layout';
import { getNeighbours, getProject, PROJECT_PAGES } from '@/content/projects';

interface Props {
    params: Promise<{ slug: string }>;
}

// Only the slugs listed in content/projects exist; anything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
    return PROJECT_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const project = getProject((await params).slug);
    if (!project) return {};
    const description = project.description ?? project.summary;
    return {
        title: project.title,
        description,
        openGraph: {
            title: project.title,
            description,
            images: [{ url: project.thumb.src, width: project.thumb.width, height: project.thumb.height }],
        },
    };
}

export default async function ProjectPage({ params }: Props) {
    const { slug } = await params;
    const project = getProject(slug);
    if (!project) notFound();
    const { prev, next } = getNeighbours(slug);
    return <ProjectLayout project={project} prev={prev} next={next} />;
}
