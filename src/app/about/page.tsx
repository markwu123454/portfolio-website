"use client";

import UnderConstruction, { Stage } from "@/components/NotImplemented";

export default function Page() {
    const stages: Stage[] = [
        { label: "Preparing", status: "in_progress" },
        { label: "Drafting", status: "todo" },
        { label: "Reviewing", status: "todo" },
        { label: "Polishing", status: "todo" },
    ];

    return (
        <UnderConstruction
            name="About Me"
            stages={stages}
            channelStatus="hold"
        />
    );
}
