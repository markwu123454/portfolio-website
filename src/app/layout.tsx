import type { Metadata } from 'next';
import { Suspense, type ReactNode } from 'react';
import { Geist, JetBrains_Mono, Source_Serif_4 } from 'next/font/google';
import { PageViewTracker } from '@/app/components/site/page-view-tracker';

// Self-hosted by next/font; tokens.css builds --font-sans/-mono/-serif on these variables.
const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });
// Only a few spots use the serif, so it isn't preloaded on every page.
const sourceSerif = Source_Serif_4({
    subsets: ['latin'],
    style: ['normal', 'italic'],
    axes: ['opsz'],
    variable: '--font-source-serif',
    preload: false,
});

export const metadata: Metadata = {
    metadataBase: new URL('https://markwu.org'),
    title: {
        default: 'Mark Wu, UC Merced Undergrad',
        template: '%s · Mark Wu',
    },
    description:
        'Robots, drones, and the software that runs them. Class of 2030.',
    openGraph: {
        title: 'Mark Wu, UC Merced Undergrad',
        description:
            'Robots, drones, and the software that runs them. Class of 2030.',
        type: 'website',
    },
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" className={`${geist.variable} ${jetbrainsMono.variable} ${sourceSerif.variable}`}>
        <body className="m-0 p-0">
        {children}
        {/* useSearchParams needs a Suspense boundary or every static page would bail out to client rendering. */}
        <Suspense fallback={null}>
            <PageViewTracker/>
        </Suspense>
        </body>
        </html>
    );
}
