"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import type { EmblaOptionsType } from "embla-carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Slide = { src: string; alt: string; width: number; height: number };

export default function Carousel({
                                     slides,
                                     options = { loop: true, align: "start", skipSnaps: false },
                                     flyThroughRewind = false,
                                 }: {
    slides: Slide[];
    options?: EmblaOptionsType;
    flyThroughRewind?: boolean;
}) {
    // Force loop off when flyThroughRewind is enabled to get edge "yield + bounce"
    const effectiveOptions: EmblaOptionsType = useMemo(() => {
        if (flyThroughRewind) {
            return {
                ...options,
                loop: false,
                containScroll: options.containScroll ?? "trimSnaps",
                dragFree: false,
            };
        }
        return options;
    }, [options, flyThroughRewind]);

    const autoplay = useRef(Autoplay({ delay: 3500, stopOnInteraction: false }));
    const [emblaRef, emblaApi] = useEmblaCarousel(effectiveOptions, [autoplay.current]);

    const [selected, setSelected] = useState(0);
    const restartTimeout = useRef<NodeJS.Timeout | null>(null);
    const autopilotTimeout = useRef<NodeJS.Timeout | null>(null);
    const isFlying = useRef(false);

    const clearTimers = () => {
        if (restartTimeout.current) clearTimeout(restartTimeout.current);
        restartTimeout.current = null;
        if (autopilotTimeout.current) clearTimeout(autopilotTimeout.current);
        autopilotTimeout.current = null;
    };

    const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);
    const nextRaw = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
    const prevRaw = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);

    const pauseAndRestart = useCallback(() => {
        autoplay.current?.stop();
        if (restartTimeout.current) clearTimeout(restartTimeout.current);
        restartTimeout.current = setTimeout(() => autoplay.current?.play(), 30_000);
    }, []);

    // Fly-through animator
    const flyThrough = useCallback(
        async (dir: "left" | "right") => {
            if (!emblaApi || isFlying.current) return;
            isFlying.current = true;
            clearTimers();
            autoplay.current?.stop();

            const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
            const stepMs = 120;

            if (dir === "left") {
                while (emblaApi.selectedScrollSnap() > 0) {
                    emblaApi.scrollPrev();
                    await sleep(stepMs);
                }
            } else {
                const last = emblaApi.scrollSnapList().length - 1;
                while (emblaApi.selectedScrollSnap() < last) {
                    emblaApi.scrollNext();
                    await sleep(stepMs);
                }
            }

            isFlying.current = false;
            autoplay.current?.play();
        },
        [emblaApi]
    );

    // Smart next/prev with fly-through at ends (buttons + autoplay)
    const next = useCallback(() => {
        if (!emblaApi) return;
        const last = emblaApi.scrollSnapList().length - 1;
        if (flyThroughRewind && emblaApi.selectedScrollSnap() === last && !isFlying.current) {
            void flyThrough("left");
        } else {
            nextRaw();
        }
    }, [emblaApi, flyThroughRewind, flyThrough, nextRaw]);

    const prev = useCallback(() => {
        if (!emblaApi) return;
        if (flyThroughRewind && emblaApi.selectedScrollSnap() === 0 && !isFlying.current) {
            void flyThrough("right");
        } else {
            prevRaw();
        }
    }, [emblaApi, flyThroughRewind, flyThrough, prevRaw]);

    // Keyboard
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") {
                next();
                pauseAndRestart();
            } else if (e.key === "ArrowLeft") {
                prev();
                pauseAndRestart();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [next, prev, pauseAndRestart]);

    // Events + intercept autoplay at ends
    useEffect(() => {
        if (!emblaApi) return;

        const onSelect = () => {
            setSelected(emblaApi.selectedScrollSnap());

            if (!flyThroughRewind || isFlying.current) return;

            const last = emblaApi.scrollSnapList().length - 1;
            const idx = emblaApi.selectedScrollSnap();

            // When autoplay lands on an end, schedule fly-through
            if (idx === last || idx === 0) {
                clearTimers();
                autoplay.current?.stop();
                const delay = (autoplay.current?.options?.delay as number) ?? 3500;
                autopilotTimeout.current = setTimeout(() => {
                    void flyThrough(idx === last ? "left" : "right");
                }, delay);
            }
        };

        const onPointerOrScroll = () => pauseAndRestart();

        emblaApi.on("select", onSelect);
        emblaApi.on("pointerDown", onPointerOrScroll);
        emblaApi.on("scroll", onPointerOrScroll);
        onSelect();

        return () => {
            clearTimers();
            emblaApi.off("select", onSelect);
            emblaApi.off("pointerDown", onPointerOrScroll);
            emblaApi.off("scroll", onPointerOrScroll);
        };
    }, [emblaApi, flyThroughRewind, pauseAndRestart, flyThrough]);

    return (
        <section
            className="group relative bg-black" // black shows during edge-yield
            aria-roledescription="carousel"
            aria-label="Image carousel"
        >
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex touch-pan-y">
                    {slides.map((s, i) => (
                        <div className="min-w-0 basis-full shrink-0" key={i}>
                            <div className="relative aspect-[16/9]">
                                <Image
                                    src={s.src}
                                    alt={s.alt}
                                    fill
                                    priority={i === 0}
                                    sizes="(max-width: 768px) 100vw, 80vw"
                                    placeholder="empty"
                                    style={{ objectFit: "cover" }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Controls */}
            <button
                type="button"
                aria-label="Previous slide"
                onClick={() => {
                    if (isFlying.current) return;
                    prev();
                    pauseAndRestart();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white opacity-0 transition group-hover:opacity-100 hover:bg-black/60"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>
            <button
                type="button"
                aria-label="Next slide"
                onClick={() => {
                    if (isFlying.current) return;
                    next();
                    pauseAndRestart();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white opacity-0 transition group-hover:opacity-100 hover:bg-black/60"
            >
                <ChevronRight className="h-5 w-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        aria-label={`Go to slide ${i + 1}`}
                        aria-current={selected === i}
                        onClick={() => {
                            if (isFlying.current) return;
                            scrollTo(i);
                            pauseAndRestart();
                        }}
                        className={`h-2 w-2 rounded-full ${selected === i ? "bg-white" : "bg-white/50"}`}
                    />
                ))}
            </div>
        </section>
    );
}
