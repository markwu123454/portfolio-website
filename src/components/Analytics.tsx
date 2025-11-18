"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";

export default function AnalyticsWrapper() {
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        const noTrack = document.cookie.includes("no_track=1");
        setEnabled(!noTrack);
    }, []);

    return enabled ? <Analytics /> : null;
}
