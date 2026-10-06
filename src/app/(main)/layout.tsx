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
        <SpeedInsights />
        </div>
    );
}
