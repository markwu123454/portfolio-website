/**
 * Media for project pages. The layout gives each slot (hero, highlight
 * tile) a fixed-ratio, position:relative frame; everything here fills
 * that frame absolutely. Pass any of these, or any other JSX that does
 * the same, as `hero` or a highlight's `media`.
 */

import Image, { type StaticImageData } from 'next/image';

export { LoopVideo } from './loop-video';

/** Default `sizes`: full width on phones, about two thirds of the 1100px column on desktop. */
const SIZES = '(max-width: 768px) 100vw, 720px';

export function Shot({
                         src,
                         alt,
                         fit = 'cover',
                         position,
                         priority,
                         sizes = SIZES,
                     }: {
    src: StaticImageData;
    alt: string;
    /** `contain` shows the whole image on the drafting grid; use it for tall or small images. */
    fit?: 'cover' | 'contain';
    /** CSS object-position for `cover`, e.g. '50% 30%'. */
    position?: string;
    priority?: boolean;
    sizes?: string;
}) {
    if (fit === 'contain') return <CadRender src={src} alt={alt} priority={priority} sizes={sizes} />;
    return (
        <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            placeholder="blur"
            className="object-cover"
            style={position ? { objectPosition: position } : undefined}
        />
    );
}

/** Whole image, uncropped, on a drafting grid. For CAD renders and odd aspect ratios. */
export function CadRender({
                              src,
                              alt,
                              priority,
                              sizes = SIZES,
                          }: {
    src: StaticImageData;
    alt: string;
    priority?: boolean;
    sizes?: string;
}) {
    return (
        <div
            className="absolute inset-0 bg-bg-elev"
            style={{
                backgroundImage:
                    'linear-gradient(var(--rule) 1px, transparent 1px), linear-gradient(90deg, var(--rule) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
            }}
        >
            <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-contain p-[4%]" />
        </div>
    );
}

/** Label/value rows as a tile, for a project brief or spec that reads better as type than as an image. */
export function Brief({ items }: { items: Array<[label: string, value: string]> }) {
    return (
        <dl className="absolute inset-0 m-0 bg-bg-elev grid content-center px-[8%] py-[6%]">
            {items.map(([k, v]) => (
                <div
                    key={k}
                    className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 items-baseline py-2.5 border-t border-rule first:border-t-0"
                >
                    <dt className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft">{k}</dt>
                    <dd className="m-0 text-[clamp(15px,2vw,20px)] font-medium tracking-[-0.01em]">{v}</dd>
                </div>
            ))}
        </dl>
    );
}
