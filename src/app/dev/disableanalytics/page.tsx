"use client";

import { useEffect } from "react";

export default function OptOutPage() {
    useEffect(() => {
        document.cookie = "no_track=1; path=/; max-age=31536000"; // 1 year
        window.location.href = "/"; // redirect home
    }, []);

    return null;
}
