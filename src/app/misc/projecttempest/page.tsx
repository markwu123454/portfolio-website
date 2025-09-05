"use client";

import UnderConstruction, { Stage } from "@/components/NotImplemented";

export default function Page() {
    const stages: Stage[] = [
        { label: "Preparing", status: "todo" },
        { label: "Drafting", status: "todo" },
        { label: "Reviewing", status: "todo" },
        { label: "Polishing", status: "todo" },
    ];

    return (
        <UnderConstruction
            name="Project Tempest"
            stages={stages}
            channelStatus="inactive"
        />
    );
}
