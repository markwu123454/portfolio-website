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

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className="min-h-dvh grid grid-rows-[auto_1fr_auto]">
        <Header/>
        <main className="px-4 mx-auto w-full max-w-5xl text-white">{children}</main>
        <Footer/>
        </body>
        </html>
    );
}
