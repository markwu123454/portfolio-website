import type { Metadata } from 'next';
import type { ReactNode } from 'react';

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
        <html lang="en">
        <body className="m-0 p-0">
        {children}
        </body>
        </html>
    );
}
