'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

export interface CarouselSlide {
    media: ReactNode;
    caption?: ReactNode;
}

/**
 * Crossfading slideshow for any JSX. Auto-advances every `interval` ms
 * (0 turns that off), and holds still while hovered or focused, while
 * scrolled off screen or the tab is hidden, and for visitors who ask for
 * reduced motion. Arrow keys, the side buttons and the dots all navigate.
 */
/** Above this many slides the dots get cramped, so a single progress bar is shown instead. */
const MAX_DOTS = 10;

export function Carousel({ slides, interval = 5000, label }: { slides: CarouselSlide[]; interval?: number; label: string }) {
    const n = slides.length;
    const [index, setIndex] = useState(0);
    const [held, setHeld] = useState(false);
    const [reduced, setReduced] = useState(false);
    const [inView, setInView] = useState(true);
    const [pageVisible, setPageVisible] = useState(true);
    const root = useRef<HTMLDivElement>(null);

    const go = (k: number) => setIndex(((k % n) + n) % n);
    // Only the current slide and its neighbours are mounted, so a long gallery
    // loads a few images at a time instead of all of them at once.
    const near = (k: number) => {
        const d = Math.abs(k - index);
        return Math.min(d, n - d) <= 1;
    };
    const useDots = n <= MAX_DOTS;

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const onMq = () => setReduced(mq.matches);
        const onVis = () => setPageVisible(!document.hidden);
        onMq();
        onVis();
        mq.addEventListener('change', onMq);
        document.addEventListener('visibilitychange', onVis);
        const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 });
        if (root.current) io.observe(root.current);
        return () => {
            mq.removeEventListener('change', onMq);
            document.removeEventListener('visibilitychange', onVis);
            io.disconnect();
        };
    }, []);

    const autoplay = n > 1 && interval > 0 && !reduced;
    const running = autoplay && !held && inView && pageVisible;

    useEffect(() => {
        if (!running) return;
        const t = window.setTimeout(() => setIndex((v) => (v + 1) % n), interval);
        return () => window.clearTimeout(t);
    }, [running, index, interval, n]);

    const arrow =
        'absolute top-1/2 -translate-y-1/2 z-10 grid place-items-center w-9 h-9 rounded-full border border-rule-strong bg-bg/80 backdrop-blur-sm text-fg transition-colors hover:text-accent hover:border-accent';

    return (
        <div
            ref={root}
            role="region"
            aria-roledescription="carousel"
            aria-label={label}
            onMouseEnter={() => setHeld(true)}
            onMouseLeave={() => setHeld(false)}
            onFocus={() => setHeld(true)}
            onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHeld(false);
            }}
            onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') go(index - 1);
                if (e.key === 'ArrowRight') go(index + 1);
            }}
        >
            <div className="relative aspect-[4/3] md:aspect-video overflow-hidden rounded border border-rule bg-bg-elev">
                {slides.map((s, k) => (
                    <div
                        key={k}
                        role="group"
                        aria-roledescription="slide"
                        aria-label={`${k + 1} of ${n}`}
                        aria-hidden={k !== index}
                        inert={k !== index}
                        className={`absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none ${
                            k === index ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        {near(k) && s.media}
                    </div>
                ))}
                {n > 1 && (
                    <>
                        <button type="button" onClick={() => go(index - 1)} aria-label="Previous slide" className={`${arrow} left-3`}>
                            <ChevronLeft aria-hidden size={18} />
                        </button>
                        <button type="button" onClick={() => go(index + 1)} aria-label="Next slide" className={`${arrow} right-3`}>
                            <ChevronRight aria-hidden size={18} />
                        </button>
                    </>
                )}
            </div>

            <div className="mt-2.5 flex items-start justify-between gap-6">
                <p aria-live={running ? 'off' : 'polite'} className="m-0 min-h-[1.55em] text-[14px] leading-[1.55] text-fg-muted max-w-160">
                    {slides[index].caption}
                </p>
                {n > 1 && (
                    <div className="flex items-center gap-3 shrink-0 pt-1">
                        {useDots ? (
                            <div className="flex items-center gap-1.5">
                                {slides.map((_, k) => (
                                    <button
                                        key={k}
                                        type="button"
                                        onClick={() => go(k)}
                                        aria-label={`Show slide ${k + 1}`}
                                        aria-current={k === index}
                                        className={`relative h-1.5 rounded-full overflow-hidden bg-rule-strong transition-[width] duration-300 ${
                                            k === index ? 'w-6' : 'w-1.5 hover:bg-fg-soft'
                                        }`}
                                    >
                                        {k === index && <Progress key={index} interval={interval} autoplay={autoplay} running={running} />}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <span aria-hidden className="relative block w-16 h-1.5 rounded-full overflow-hidden bg-rule-strong">
                                <Progress key={index} interval={interval} autoplay={autoplay} running={running} />
                            </span>
                        )}
                        <span className="font-mono text-[11px] text-fg-soft tabular-nums">
                            {String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

/** Fills over one interval while auto-advancing; solid otherwise. */
function Progress({ interval, autoplay, running }: { interval: number; autoplay: boolean; running: boolean }) {
    return (
        <span
            aria-hidden
            className="absolute inset-0 origin-left bg-accent"
            style={
                autoplay
                    ? { animation: `gallery-progress ${interval}ms linear forwards`, animationPlayState: running ? 'running' : 'paused' }
                    : undefined
            }
        />
    );
}
