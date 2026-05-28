import type { ReactNode } from 'react';
import '../globals.css';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Header } from '../components/nav/header';
import { Footer } from '../components/site/footer';

export default function MainLayout({ children }: { children: ReactNode }) {
    return (
        <div className="notebook min-h-screen flex flex-col bg-bg text-fg font-sans">
        <Header />
        <div className="flex-1 min-w-0">{children}</div>
        <Footer />
        <Footnote />
        <SpeedInsights />
        </div>
    );
}

function Footnote() {
    return (
        <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-8 pt-3 pb-8 sm:pb-12">
            <div className="flex justify-between items-baseline border-t border-rule pt-[18px] font-mono text-[11px] tracking-mono text-fg-soft">
                <span>— v1 · 2026.05</span>
                <span>EOF</span>
            </div>
        </div>
    );
}
