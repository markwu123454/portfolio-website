import "./globals.css";
import type { Metadata } from "next";
import React from "react";
import LayoutWrapper from "@/components/LayoutWrapper";

export const metadata: Metadata = {
    metadataBase: new URL("https://markwu.org"),
    title: { default: "Mark Wu", template: "%s · Mark Wu" },
    description: "UAV, robotics, and software projects.",
    openGraph: { type: "website", url: "/", siteName: "Mark Wu" },
    twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    // ✅ remains server, still supports metadata
    return <LayoutWrapper>{children}</LayoutWrapper>;
}
