// lib/og.tsx
import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

// Load fonts once (repo-local TTFs in /public/fonts)
const interBold = fs.readFileSync(path.join(process.cwd(), "public/fonts/Inter_28pt-Bold.ttf"));
const geistMono = fs.readFileSync(path.join(process.cwd(), "public/fonts/GeistMono-SemiBold.ttf"));

type OgOptions = {
    title: string;
    subtitle?: string;
    tag?: string;        // e.g., "markwu.org"
    accent?: string;     // hex/rgb for accent line
};

export function renderOG({ title, subtitle, tag = "markwu.org", accent = "#6EE7F9" }: OgOptions) {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    background: "linear-gradient(135deg, #0b0b0b 0%, #121212 60%, #0b0b0b 100%)",
                }}
            >
                {/* left gutter accent */}
                <div style={{ width: 12, background: accent }} />

                {/* content */}
                <div style={{ flex: 1, display: "flex", padding: 72, gap: 28, flexDirection: "column" }}>
                    {/* tag */}
                    <div style={{ fontFamily: "GeistMono", fontSize: 26, opacity: 0.7 }}>{tag}</div>

                    {/* title */}
                    <div
                        style={{
                            fontFamily: "Inter",
                            fontSize: 92,
                            lineHeight: 1.05,
                            fontWeight: 800,
                            letterSpacing: -1.5,
                            color: "white",
                        }}
                    >
                        {title}
                    </div>

                    {/* subtitle */}
                    {subtitle ? (
                        <div
                            style={{
                                fontFamily: "Inter",
                                fontSize: 38,
                                lineHeight: 1.25,
                                color: "rgba(255,255,255,0.85)",
                                marginTop: 6,
                                maxWidth: 960,
                            }}
                        >
                            {subtitle}
                        </div>
                    ) : null}

                    {/* footer line */}
                    <div style={{ marginTop: "auto", height: 2, width: "100%", background: "rgba(255,255,255,0.08)" }} />
                </div>
            </div>
        ),
        {
            ...OG_SIZE,
            fonts: [
                { name: "Inter", data: interBold, weight: 800, style: "normal" },
                { name: "GeistMono", data: geistMono, weight: 600, style: "normal" },
            ],
        }
    );
}
