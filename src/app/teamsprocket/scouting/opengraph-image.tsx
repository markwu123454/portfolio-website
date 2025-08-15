// app/scouting/opengraph-image.tsx
import { OG_SIZE, OG_CONTENT_TYPE, renderOG } from "@/components/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OGImage() {
    return renderOG({
        title: "FRC Scouting App",
        subtitle: "Offline-first collection • Live sync • Strategy-ready analytics",
        tag: "markwu.org",
        accent: "#60A5FA", // optional per-page accent
    });
}
