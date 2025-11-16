// app/projects/portfolio-website/page.tsx
"use client";

import React from "react";
import { Globe } from "lucide-react";

export default function PortfolioWebsitePage() {
    return (
        <main className="relative min-h-[calc(100vh-209px)] overflow-hidden bg-black text-white mt-24">
            <GridGlow />

            <section className="relative z-10 mx-auto flex max-w-3xl flex-col gap-10 px-6 pt-24 pb-32">
                {/* Header */}
                <header className="space-y-4">

                    <h1 className="text-balance text-4xl font-black tracking-tight md:text-6xl">
                        <GradientText>markwu.org</GradientText>
                    </h1>

                    <p className="text-pretty text-sm leading-relaxed text-white/70 md:text-base">
                        A minimalist personal website designed to present my technical projects, teams,
                        and ongoing work in a unified hub. Built with Next.js and styled with Tailwind CSS
                    </p>
                </header>

                {/* Overview */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                    <h2 className="mb-3 text-lg font-semibold text-white/90">Overview</h2>
                    <p className="text-sm text-white/70 leading-relaxed">
                        The site organizes all my major and minor projects including Team Sprocket, DroneScape,
                        Project Aetherius, and Infernope Robotics under the domain{" "}
                        <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-white/80">
                            markwu.org
                        </code>.
                    </p>
                </div>

                {/* Technical details */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                    <h2 className="mb-3 text-lg font-semibold text-white/90">Technical Details</h2>
                    <ul className="list-disc space-y-1 pl-6 text-sm text-white/70">
                        <li>Framework: Next.js 14 (App Router)</li>
                        <li>Styling: Tailwind CSS and pure css for more complex animations</li>
                        <li>Animation: Framer Motion</li>
                        <li>Deployment: Vercel (DNS managed via Namecheap)</li>
                        <li>Navigation: Megamenu grouped by project commitment and lifecycle</li>
                        <li>Accessibility: Semantic HTML and keyboard navigation</li>
                    </ul>
                </div>

                {/* Design philosophy */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                    <h2 className="mb-3 text-lg font-semibold text-white/90">Design Philosophy</h2>
                    <blockquote className="border-l-2 border-white/20 pl-4 italic text-white/70">
                        “Functional minimalism.” Every visual or structural element serves hierarchy,
                        readability, or navigation efficiency.
                    </blockquote>
                </div>

                {/* Footer links */}
                <div className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 shadow-sm backdrop-blur transition hover:bg-white/10 select-none cursor-default">
                    Link: <Globe className="mx-2 h-4 w-4" />
                    Oh wait — you&#39;re looking at it!
                </div>
            </section>
        </main>
    );
}

/* --------------------------------- UI Bits --------------------------------- */
function GradientText({ children }: { children: React.ReactNode }) {
    return (
        <span className="bg-gradient-to-br from-white via-white to-white/60 bg-clip-text text-transparent [text-shadow:0_0_32px_rgba(255,255,255,0.15)]">
      {children}
    </span>
    );
}

/* ----------------------- Background: Stars + GridGlow ---------------------- */
function GridGlow() {
    return (
        <>
            <div className="pointer-events-none absolute inset-0 z-0 [background:radial-gradient(60%_50%_at_50%_40%,rgba(32,149,243,0.25)_0%,rgba(0,0,0,0.0)_60%),radial-gradient(60%_50%_at_50%_80%,rgba(16,185,129,0.15)_0%,rgba(0,0,0,0.0)_60%)]" />
            <div className="pointer-events-none absolute inset-0 z-0 opacity-20 [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:40px_40px]" />
        </>
    );
}
