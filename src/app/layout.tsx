/**
 * Root layout.
 *
 * Wraps every route with site chrome:
 *   <Header />               — sticky nav at top
 *   {children}               — the page content
 *   <Footer />               — four-column site footer
 *   <Footnote />             — the EOF line
 *
 * globals.css imports Tailwind + tokens.css and bridges the two via
 * @theme inline, so utility classes like `bg-bg`, `text-fg`,
 * `border-rule` resolve to design tokens and auto-flip light/dark.
 *
 * Per-page palette overrides (apply at section/page level, not here):
 *   <div data-theme="manuscript"> ... </div>   ← warm-paper, /music
 *   <div data-theme="hazard">     ... </div>   ← amber/red, /work/combat
 *   <div data-color-scheme="dark">...</div>    ← pin scheme
 */

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Header } from './components/nav/header';
import { Footer } from './components/site/footer';
import './globals.css';

export const metadata: Metadata = {
    metadataBase: new URL('https://markwu.org'),
    title: {
        default: 'Mark Wu — student engineer',
        template: '%s · Mark Wu',
    },
    description:
        'Student engineer. Robots, drones, and the software that runs them. Class of 2026, FRC 3473.',
    openGraph: {
        title: 'Mark Wu — student engineer',
        description:
            'Robots, drones, and the software that runs them. Class of 2026, FRC 3473.',
        type: 'website',
    },
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
        <body className="notebook m-0 min-h-screen flex flex-col bg-bg text-fg font-sans">
        <Header />
        <div className="flex-1 min-w-0">{children}</div>
        <Footer />
        <Footnote />
        <SpeedInsights />
        </body>
        </html>
    );
}

/* ─────────────────────────────────────────────────────────────────
   Footnote — the very last line. Mono, soft color, hairline above.
   Distinct from Footer (the four-column block).
   ───────────────────────────────────────────────────────────────── */

function Footnote() {
    return (
        // Tighter horizontal padding on mobile (px-4), full px-8 on sm+
        <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-8 pt-3 pb-8 sm:pb-12">
            <div className="flex justify-between items-baseline border-t border-rule pt-[18px] font-mono text-[11px] tracking-mono text-fg-soft">
                <span>— v1 · 2026.05</span>
                <span>EOF</span>
            </div>
        </div>
    );
}