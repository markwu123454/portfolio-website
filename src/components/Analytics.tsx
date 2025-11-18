"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";

export default function AnalyticsWrapper() {
    const [disableAnalytics, setDisableAnalytics] = useState(true);

    useEffect(() => {
        const search = new URLSearchParams(window.location.search);
        setDisableAnalytics(search.get("flag") === "dev");
    }, []);

    if (disableAnalytics) return null;
    return <Analytics />;
}
