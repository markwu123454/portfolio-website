"use client";

import { useState } from "react";

const SLIDES = [
    {
        content: [
            { type: "text", value: "Hey Ash" },
        ],
    },
    {
        content: [
            { type: "text", value: "I dont feel like writing a card soooooo here you go." },
        ],
    },
    {
        content: [
            { type: "text", value: "Honestly with how much time it took to get this to work its prob faster to just write a card." },
        ],
    },
    {
        content: [
            { type: "text", value: "Anyways im not really sentimental and im not gonna try to be." },
        ],
    },
    {
        content: [
            { type: "text", value: "So im just gonna share some photos i had from the past 2 years, sorry if it wakes any bad memories." },
        ],
    },
    {
        content: [
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_1.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_2.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_3.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_4.png", alt: "" },
            { type: "text", value: "Ok so this is almost 2 years ago ShenZhen." },
        ],
    },
    {
        content: [
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_5.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_6.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_7.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_8.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_9.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_10.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_11.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_12.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_13.png", alt: "" },
            { type: "text", value: "This is fll and stem fair." },
        ],
    },
    {
        content: [
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_14.png", alt: "" },
            { type: "text", value: "https://youtu.be/c6-gUOJ6r6U :D" },
        ],
    },
    {
        content: [
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_15.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_16.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_17.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_18.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_19.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_20.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_21.png", alt: "" },
            { type: "text", value: "um...... some images" },
        ],
    },
    {
        content: [
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_22.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_23.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_24.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_25.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_26.png", alt: "" },
            { type: "text", value: "WEEEEEE OCR!" },
        ],
    },
    {
        content: [
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_27.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_28.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_29.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_30.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_31.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_32.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_33.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_34.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_35.png", alt: "" },
            { type: "text", value: "a LOT of photos of you" },
        ],
    },
    {
        content: [
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_36.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_37.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_38.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_39.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_40.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_41.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_42.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_43.png", alt: "" },
            { type: "text", value: "WEEEEE CVR!" },
        ],
    },
    {
        content: [
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_44.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_45.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_46.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_47.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_48.png", alt: "" },
            { type: "text", value: "Furrshley" },
        ],
    },
    {
        content: [
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_49.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_50.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_51.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_52.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_53.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_54.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_55.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_56.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_57.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_58.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_59.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_60.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_61.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_62.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_63.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_64.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_65.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_88.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_89.png", alt: "" },
            { type: "text", value: "WORLDSSS!" },
        ],
    },
    {
        content: [
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_66.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_67.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_68.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_69.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_70.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_71.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_72.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_73.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_74.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_75.png", alt: "" },
            { type: "text", value: "More random pictures of you i have" },
        ],
    },
    {
        content: [
            { type: "text", value: "Oh and then we stopped talking" },
            { type: "text", value: "OKAY IN MY DEFENSE i was really bored so im just picking these games back up, and i play for the grind(i was world top 1%)" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_76.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_77.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_78.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_79.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_80.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_81.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_82.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_83.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_84.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_85.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_86.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_87.png", alt: "" },
        ],
    },
    {
        content: [
            { type: "text", value: "YAY and then we started talking again" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_90.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_91.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_92.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_93.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_94.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_95.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_96.png", alt: "" },
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_97.png", alt: "" },
            { type: "text", value: "oh yeah and theres joseph during build season this year" },
        ],
    },
    {
        content: [
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_98.png", alt: "" },
            { type: "text", value: "i wanna thank brista for gracing my phone with this photo" },
        ],
    },
    {
        content: [
            { type: "image", src: "/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y/img_99.png", alt: "" },
            { type: "text", value: "lmao that photo doesnt even have me in it" },
        ],
    },
    {
        content: [
            { type: "text", value: "That was 99 photos, do you wanna take the 100th together?" },
        ],
    },
    {
        content: [
            { type: "text", value: "Oh u know funny thing, i tried to make it so if you refresh the page it does't work anymore, like you can only see each page once, but then it didnt work so i didnt bother" },
        ],
    },
    {
        content: [
            { type: "text", value: "That's the end." },
        ],
    },
];

export default function Slideshow() {
    const [index, setIndex] = useState(0);
    const [animating, setAnimating] = useState(false);

    const isLast = index === SLIDES.length - 1;
    const slide = SLIDES[index];

    function handleNext() {
        if (animating) return;
        if (isLast) { window.location.reload(); return; }
        setAnimating(true);
        setTimeout(() => {
            setIndex((i) => i + 1);
            setAnimating(false);
        }, 320);
    }

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;1,300&family=DM+Mono:wght@400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
          height: 100%;
          background: #111;
          overflow: hidden;
        }

        .page {
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          background: #111;
          /* no overflow:hidden here; let .slide-scroll own the scrolling */
        }

        /* progress bar */
        .progress {
          position: absolute;
          top: 0;
          left: 0;
          height: 2px;
          background: #e8e4da;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 3;
          pointer-events: none;
        }

        /* counter */
        .counter {
          position: absolute;
          top: 20px;
          right: 28px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.2em;
          color: #3a3a3a;
          text-transform: uppercase;
          z-index: 3;
          pointer-events: none;
        }

        /* the ONLY scrolling element */
        .slide-scroll {
          flex: 1 1 auto;
          min-height: 0;            /* critical: lets flex child shrink so overflow scrolls */
          width: 100%;
          overflow-y: auto;
          overscroll-behavior: contain;
          /* reserve space for chrome via padding instead of fixed page padding */
          padding: 64px 24px 96px;
          scrollbar-width: thin;
          scrollbar-color: #2e2e2e transparent;
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.32s ease, transform 0.32s ease;
        }

        .slide-scroll.exit {
          opacity: 0;
          transform: translateY(-18px);
        }

        .slide-scroll::-webkit-scrollbar { width: 4px; }
        .slide-scroll::-webkit-scrollbar-thumb { background: #2e2e2e; border-radius: 2px; }

        /* wrapper centers content when short, but grows naturally when tall */
        .slide {
          width: 100%;
          max-width: 700px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 28px;
          /* use min-height with calc so short slides still center,
             but tall slides can grow past the viewport without clipping the top.
             margin auto on a flex column with min-height handles the centering. */
          min-height: calc(100vh - 160px); /* 64 top + 96 bottom padding */
          justify-content: center;
        }

        .slide-text {
          font-family: 'Fraunces', serif;
          font-weight: 300;
          font-size: clamp(24px, 4vw, 48px);
          color: #e8e4da;
          text-align: center;
          line-height: 1.4;
          white-space: pre-wrap;
          letter-spacing: -0.01em;
          /* prevent long unbreakable strings from forcing horizontal scroll */
          overflow-wrap: break-word;
          word-break: break-word;
          max-width: 100%;
        }

        .slide-image {
          width: 100%;
          height: auto;             /* was implicit; make it explicit */
          max-height: 70vh;         /* let images breathe; was 42vh which felt cramped */
          object-fit: contain;      /* contain avoids cropping; cover was hiding edges */
          display: block;
          filter: grayscale(18%) contrast(1.04);
          box-shadow: 0 8px 48px rgba(0,0,0,0.55);
        }

        /* next button */
        .btn-next {
          position: absolute;
          bottom: 36px;
          right: 36px;
          background: #111;         /* solid so scrolled content doesn't show behind it */
          border: 1px solid #2e2e2e;
          color: #555;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 12px 24px;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
          z-index: 3;
        }
        .btn-next:hover {
          border-color: #e8e4da;
          color: #e8e4da;
        }
        .btn-next.restart:hover {
          background: #e8e4da;
          color: #111;
          border-color: #e8e4da;
        }
      `}</style>

            <div className="page">
                <div
                    className="progress"
                    style={{ width: `${((index + 1) / SLIDES.length) * 100}%` }}
                />

                <span className="counter">{index + 1} / {SLIDES.length}</span>

                <div
                    key={index}
                    className={`slide-scroll${animating ? " exit" : ""}`}
                >
                    <div className="slide">
                        {slide.content.map((item, i) =>
                            item.type === "text" ? (
                                <p key={i} className="slide-text">{item.value}</p>
                            ) : (
                                <img key={i} className="slide-image" src={item.src} alt={item.alt || ""} />
                            )
                        )}
                    </div>
                </div>

                <button
                    className={`btn-next${isLast ? " restart" : ""}`}
                    onClick={handleNext}
                >
                    {isLast ? "end" : "next →"}
                </button>
            </div>
        </>
    );
}