'use client';

import Image, { type StaticImageData } from 'next/image';
import { useEffect, useState } from 'react';

/**
 * Muted autoplaying loop with no controls. The poster sits underneath and
 * the video fades in once it is actually playing, so there is no black
 * flash while it loads. Visitors who ask for reduced motion get the
 * poster only.
 */
export function LoopVideo({
                              src,
                              poster,
                              alt,
                              sizes = '(max-width: 768px) 100vw, 720px',
                          }: {
    src: string;
    poster: StaticImageData;
    alt: string;
    sizes?: string;
}) {
    const [reduced, setReduced] = useState(false);
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReduced(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);

    return (
        <>
            <Image src={poster} alt={alt} fill sizes={sizes} placeholder="blur" className="object-cover" />
            {!reduced && (
                <video
                    src={src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    aria-hidden
                    onPlaying={() => setPlaying(true)}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                        playing ? 'opacity-100' : 'opacity-0'
                    }`}
                />
            )}
        </>
    );
}
