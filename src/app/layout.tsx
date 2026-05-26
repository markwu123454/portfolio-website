import type { Metadata } from 'next';
import type { ReactNode } from 'react';
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
        <body className="m-0 p-0">
        {children}
        </body>
        </html>
    );
}
