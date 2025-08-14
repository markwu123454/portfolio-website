// src/app/layout.tsx
import "./globals.css"
import type {Metadata} from "next";
import {Header} from "@/components/Header";
import {Footer} from "@/components/Footer";
import React from "react";

export const metadata: Metadata = {
    title: "Mark Wu — Engineer",
    description: "UAV GCS and analytics",
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




