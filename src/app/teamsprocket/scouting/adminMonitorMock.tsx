"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

type MatchRow = {
    match: number;
    match_type: "qm" | "sf" | "f";
    team: string;
    alliance: "red" | "blue";
    scouter: string | null;
    status: string;
    last_modified: number;
};

export default function AdminDashboardMock2026() {
    const [rows, setRows] = useState<MatchRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // --- initialize fake scouts ---
    useEffect(() => {
        setRows(generateInitial());
        setLoading(false);
        setLastUpdated(new Date());
    }, []);

    // --- live mutations every few seconds ---
    useEffect(() => {
        const interval = setInterval(() => {
            setRows((prev) => mutateRows(prev));
            setLastUpdated(new Date());
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    // --- group by match key ---
    const grouped = rows.reduce((acc, r) => {
        const key = `${r.match_type}-${r.match}`;
        if (!acc[key]) acc[key] = { type: r.match_type, num: r.match, red: [], blue: [] };
        acc[key][r.alliance].push(r);
        return acc;
    }, {} as Record<string, { type: string; num: number; red: MatchRow[]; blue: MatchRow[] }>);

    const sorted = Object.values(grouped).sort((a, b) => {
        const typeOrder: Record<string, number> = { qm: 1, sf: 2, f: 3 };
        const typeA = typeOrder[a.type];
        const typeB = typeOrder[b.type];
        if (typeA !== typeB) return typeA - typeB;
        return a.num - b.num;
    });

    return (
        <div
            className="
        w-[532px] h-[332px] overflow-hidden
        bg-[#fef7dc]/90 border border-[#e6ddae]
        text-[#3b2d00] rounded-xl p-4
        font-sans text-xs leading-tight shadow-lg
      "
        >
            <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-sm">Admin Dashboard</h2>
                <div className="opacity-60 text-[10px]">
                    {lastUpdated ? lastUpdated.toLocaleTimeString() : "Loading..."}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="animate-spin h-5 w-5 opacity-50" />
                </div>
            ) : sorted.length === 0 ? (
                <div className="flex justify-center items-center h-full opacity-60">
                    No active scouting.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[280px] pr-1">
                    {sorted.map(({ type, num, red, blue }) => (
                        <div
                            key={`${type}-${num}`}
                            className="border border-[#e6ddae] bg-[#fff9e2]/70 rounded-lg p-2"
                        >
                            <div className="flex justify-between items-center mb-1">
                                <div className="font-semibold text-[11px]">
                                    {type.toUpperCase()} {num}
                                </div>
                                <div className="text-[10px] opacity-60">
                                    {red.length + blue.length} teams
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-1">
                                <AllianceBlock label="Red" color="red" teams={red} />
                                <AllianceBlock label="Blue" color="blue" teams={blue} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ---------- Alliance Block ----------
function AllianceBlock({
                           label,
                           color,
                           teams,
                       }: {
    label: string;
    color: "red" | "blue";
    teams: MatchRow[];
}) {
    const colorBg = color === "red" ? "bg-red-200/40" : "bg-blue-200/40";
    const colorText = color === "red" ? "text-red-600" : "text-blue-700";
    return (
        <div>
            <div className={`font-semibold ${colorText} text-[10px] mb-[2px]`}>{label}</div>
            {teams.length === 0 ? (
                <div className="text-[10px] opacity-50">—</div>
            ) : (
                <div className="space-y-[2px]">
                    {teams.map((r, i) => (
                        <div
                            key={i}
                            className={`flex justify-between items-center ${colorBg} rounded px-2 py-[1px]`}
                        >
                            <span className="font-semibold text-[10px]">#{r.team}</span>
                            <span className="text-[10px] opacity-80">{r.scouter ?? "—"}</span>
                            <span className="text-[9px] opacity-70">{r.status}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ---------- Fake Data Logic ----------

const scouterNames = [
    "Mark",
    "Adam",
    "Joseph",
    "Brandon",
    "Tyler",
    "Maren",
    "Cindy",
    "Ashlyn",
    "Sarena"
];
const statuses = [
    "pre-match",
    "auto phase",
    "teleop phase",
    "post match",
    "submitting",
    "idle",
];

function randomChoice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomTeam(): string {
    return Math.floor(1 + Math.random() * 11999).toString();
}

function randomMatchType(): "qm" | "sf" | "f" {
    const r = Math.random();
    if (r < 0.75) return "qm";
    if (r < 0.95) return "sf";
    return "f";
}

function randomMatchNumber(type: "qm" | "sf" | "f"): number {
    if (type === "qm") return 1 + Math.floor(Math.random() * 125);
    if (type === "sf") return 1 + Math.floor(Math.random() * 13);
    return 1 + Math.floor(Math.random() * 3);
}

function generateInitial(): MatchRow[] {
    const rows: MatchRow[] = [];
    const total = 5 + Math.floor(Math.random() * 3); // 5–7 scouts
    for (let i = 0; i < total; i++) {
        const type = randomMatchType();
        rows.push({
            match: randomMatchNumber(type),
            match_type: type,
            team: randomTeam(),
            alliance: Math.random() < 0.5 ? "red" : "blue",
            scouter: randomChoice(scouterNames),
            status: randomChoice(statuses),
            last_modified: Date.now(),
        });
    }
    return rows;
}

function mutateRows(rows: MatchRow[]): MatchRow[] {
    const newRows = [...rows];
    const total = newRows.length;
    const action = Math.random();

    // update status
    if (action < 0.4 && total > 0) {
        const idx = Math.floor(Math.random() * total);
        newRows[idx].status = randomChoice(statuses);
        newRows[idx].last_modified = Date.now();
    }
    // remove scout (end of match)
    else if (action < 0.65 && total > 5) {
        newRows.splice(Math.floor(Math.random() * total), 1);
    }
    // add new scout (more likely same match)
    else if (total < 7) {
        let match_type: "qm" | "sf" | "f";
        let match_num: number;

        if (Math.random() < 0.7 && total > 0) {
            // choose existing match more often
            const ref = randomChoice(newRows);
            match_type = ref.match_type;
            match_num = ref.match;
        } else {
            match_type = randomMatchType();
            match_num = randomMatchNumber(match_type);
        }

        const alliance = Math.random() < 0.5 ? "red" : "blue";
        const sameMatchAlliance = newRows.filter(
            (r) => r.match === match_num && r.match_type === match_type && r.alliance === alliance
        );

        // cap per alliance
        if (sameMatchAlliance.length < 3) {
            newRows.push({
                match: match_num,
                match_type,
                team: randomTeam(),
                alliance,
                scouter: randomChoice(scouterNames),
                status: randomChoice(statuses),
                last_modified: Date.now(),
            });
        }
    }

    return newRows;
}
