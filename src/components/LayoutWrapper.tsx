"use client";

import React from "react";
import {usePathname} from "next/navigation";
import {Header} from "@/components/Header";
import {Footer} from "@/components/Footer";
import AnalyticsWrapper from "@/components/Analytics";
import {SpeedInsights} from "@vercel/speed-insights/next";
import '@/app/ag-grid-client';

// ---- BLACKLIST CONFIG ----
const blacklistPaths = ["/takeordouble"];

function isBlacklisted(pathname: string): boolean {
    return blacklistPaths.some(rule => pathname.startsWith(rule));
}

export default function LayoutWrapper({children}: { children: React.ReactNode }) {
    const pathname = usePathname();

    // ---- BLACKLISTED → RAW PAGE ONLY ----
    if (isBlacklisted(pathname)) {
        return (
            <>
                <html lang="en">
                <body>{children}</body>
                </html>
            </>
        )
    }

    // ---- NORMAL → INCLUDE HEADER/FOOTER/ANALYTICS + SCROLL ----
    return (
        <html lang="en" className="h-dvh">
        <body className="h-dvh overflow-hidden">
        <SpeedInsights/>
        <AnalyticsWrapper/>
        <Header/>

        <div
            id="content-scroll"
            className="h-dvh overflow-y-auto [scrollbar-gutter:auto]"
        >
            <main className="mx-auto w-screen max-w-none text-white">
                {children}
            </main>
            <Footer/>
        </div>
        </body>
        </html>
    );
}
