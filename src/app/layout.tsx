// src/app/layout.tsx
import "./globals.css"
import type {Metadata} from "next";
import {Header} from "@/components/Header";
import {Footer} from "@/components/Footer";
import React from "react";

export const metadata: Metadata = {
    metadataBase: new URL("https://markwu.org"),
    title: { default: "Mark Wu", template: "%s · Mark Wu" },
    description: "UAV, robotics, and software projects.",
    openGraph: { type: "website", url: "/", siteName: "Mark Wu" },
    twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="h-dvh">
        <body className="h-dvh overflow-hidden">
        {/* Fixed header overlays content; controls its own hide/show */}
        <Header/>

        {/* Single full-height scroll container (gutter = full viewport) */}
        <div
            id="content-scroll"
            className="h-dvh overflow-y-auto [scrollbar-gutter:auto]"
        >
            {/* Push content below header height */}
            <main className="pt-24 mx-auto w-screen max-w-none text-white">
                {children}
            </main>
            <Footer />
        </div>
        </body>
        </html>
    );
}




