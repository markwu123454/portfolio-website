"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Challenge {
    id: string;
    name: string;
    description: string;
    amount: string;
    status: "active" | "taken";
    createdAt: string;
    updatedAt: string;
}

const STORAGE_KEY = "take_or_double_chv2";

// ---------- Custom UI Components ----------
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`rounded-2xl border shadow-md ${className}`}>
            {children}
        </div>
    );
}

function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`p-4 grid gap-3 ${className}`}>
            {children}
        </div>
    );
}

function Button({
                    children,
                    onClick,
                    disabled,
                    type = "button",
                    variant = "filled",
                    className = ""
                }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: "button" | "submit";
    variant?: "filled" | "outline" | "ghost";
    className?: string;
}) {
    const base = "px-4 py-2 text-lg font-medium rounded-xl transition-colors duration-200 shadow-sm";

    const styles = {
        filled: "bg-green-600 hover:bg-green-700 text-white",
        outline: "border border-green-600 text-green-600 hover:bg-green-600/10 shadow-none",
        ghost: "bg-transparent underline hover:opacity-70 shadow-none text-inherit"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${styles[variant]} ${disabled ? "opacity-50 cursor-not-allowed hover:bg-none" : ""} ${className}`}>
            {children}
        </button>
    );
}
// -----------------------------------------

// NEW: display-only numeric formatter with scientific notation fallback
function formatDisplayNumber(raw: string): string {
    try {
        // If it fits in JS number range, format normally
        const asBig = BigInt(raw);
        const formatted = asBig.toLocaleString();

        // If too long, switch to Number → scientific notation for display only
        // (does NOT modify stored raw value)
        if (raw.length > 4) {
            const num = Number(raw);
            if (!Number.isFinite(num)) {
                // If overflowed, manually construct scientific notation from string
                const len = raw.length;
                return `${raw[0]}.${raw.slice(1, 3)}e+${len - 1}`;
            }
            return num.toExponential(3);
        }

        return formatted;
    } catch {
        return raw;
    }
}


function TakeDialog({ challenge, onConfirm, onCancel }: { challenge: Challenge; onConfirm: () => void; onCancel: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
            <Card className="w-full max-w-md border-gray-600 bg-gray-900/40 p-6 text-gray-100">
                <CardContent className="text-center">
                    <h2 className="text-xl font-bold">Confirm Take</h2>
                    <p className="text-sm opacity-80">Are you sure you want to take this chain?</p>
                    <p className="text-2xl font-mono font-semibold break-all">{challenge.name}</p>
                    <p className="text-3xl font-mono font-bold break-all">{challenge.amount}</p>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <Button onClick={onCancel} variant="outline">Cancel</Button>
                        <Button onClick={onConfirm} variant="filled">Take it</Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default function TakeDoublePage() {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [startingAmount, setStartingAmount] = useState("1");
    const [mode, setMode] = useState<"dark" | "light">("dark");
    const [fullscreenId, setFullscreenId] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [takeTarget, setTakeTarget] = useState<Challenge | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const rawMode = window.localStorage.getItem("theme_mode");
        if (rawMode === "light" || rawMode === "dark") {
            setMode(rawMode);
            document.documentElement.classList.toggle("dark", rawMode === "dark");
        } else {
            document.documentElement.classList.add("dark");
        }
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (raw) setChallenges(JSON.parse(raw));
        } catch {}
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (!isLoaded || typeof window === "undefined") return;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
    }, [challenges, isLoaded]);

    const create = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !/^[0-9]+$/.test(startingAmount)) return;
        const now = new Date().toISOString();
        const c: Challenge = {
            id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
            name: name.trim(),
            description: description.trim(),
            amount: startingAmount,
            status: "active",
            createdAt: now,
            updatedAt: now
        };
        setChallenges([c, ...challenges]);
        setName(""); setDescription(""); setStartingAmount("1");
    };

    const update = (id: string, fn: (c: Challenge) => Challenge) => {
        setChallenges(challenges.map(c => c.id === id ? fn(c) : c));
    };

    const double = (id: string) => update(id, c => {
        if (c.status !== "active") return c;
        try {
            const next = (BigInt(c.amount) * BigInt(2)).toString();
            const now = new Date().toISOString();
            return { ...c, amount: next, updatedAt: now };
        } catch { return c; }
    });

    const take = (c: Challenge) => setTakeTarget(c);

    const confirmTake = () => {
        if (!takeTarget) return;
        update(takeTarget.id, c => ({ ...c, status: "taken", updatedAt: new Date().toISOString() }));
        setTakeTarget(null);
    };

    const del = (id: string) => {
        if (!window.confirm("Delete this chain permanently?")) return;
        setChallenges(challenges.filter(c => c.id !== id));
    };

    const toggleTheme = () => {
        const next = mode === "dark" ? "light" : "dark";
        setMode(next);
        document.documentElement.classList.toggle("dark", next === "dark");
        if (typeof window !== "undefined") window.localStorage.setItem("theme_mode", next);
    };

    if (fullscreenId) {
        const c = challenges.find(c => c.id === fullscreenId);
        if (!c) return <div className="p-4">Not found</div>;
        return (
            <div className={`min-h-screen ${mode === "dark" ? "bg-[#050816] text-gray-100" : "bg-white text-gray-900"} flex flex-col p-6`}>
                {takeTarget && (
                    <TakeDialog
                        challenge={takeTarget}
                        onConfirm={confirmTake}
                        onCancel={() => setTakeTarget(null)}
                    />
                )}
                <button onClick={() => setFullscreenId(null)} className="mb-4 text-sm underline self-end">Exit full screen</button>
                <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex flex-col flex-1 justify-center items-center text-center gap-4">
                    <h2 className="text-3xl font-bold break-words max-w-lg">{c.name}</h2>
                    <p className="text-lg max-w-2xl break-words">{c.description}</p>
                    <div className="text-6xl font-mono font-bold break-all">
                        {formatDisplayNumber(c.amount)}
                    </div>
                    <div className="text-xl font-mono whitespace-normal break-words overflow-hidden max-w-md text-center">
                        Raw number: {c.amount}
                    </div>
                    <div className="grid grid-cols-2 gap-6 mt-6">
                        <Button onClick={() => double(c.id)} disabled={c.status!=="active"} variant="filled">Double it</Button>
                        <Button onClick={() => take(c)} disabled={c.status!=="active"} variant="outline">Take it</Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${mode === "dark" ? "bg-[#050816] text-gray-100" : "bg-white text-gray-900"} transition-colors duration-300 p-6`}>
            {takeTarget && <TakeDialog challenge={takeTarget} onConfirm={confirmTake} onCancel={()=>setTakeTarget(null)} />}

            <div className="flex justify-end mb-5">
                <button onClick={toggleTheme} className="text-sm underline opacity-80">Toggle Light/Dark</button>
            </div>

            <h1 className="text-2xl font-bold mb-6">Take It or Double It Tracker</h1>

            <motion.form onSubmit={create} initial={{opacity:0}} animate={{opacity:1}}
                         className="bg-gray-100/5 p-5 mb-7 rounded-2xl border border-gray-600 shadow-md grid gap-4">

                <div>
                    <label className="text-sm font-medium block mb-1">Chain name</label>
                    <input value={name} onChange={e=>setName(e.target.value)}
                           className="w-full p-3 rounded-xl border border-gray-600 outline-none bg-transparent shadow-sm" />
                </div>

                <div>
                    <label className="text-sm font-medium block mb-1">Description</label>
                    <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={2}
                              className="w-full p-3 rounded-xl border border-gray-600 outline-none bg-transparent resize-y shadow-sm" />
                </div>

                <div>
                    <label className="text-sm font-medium block mb-1">Starting amount</label>
                    <input
                        value={startingAmount}
                        onChange={e=>setStartingAmount(e.target.value.replace(/[^0-9]/g, ""))}
                        className="w-full p-3 rounded-xl border border-gray-600 outline-none bg-transparent shadow-sm"
                    />
                </div>

                <Button type="submit" variant="filled" className="py-3">Create chain</Button>
            </motion.form>

            <motion.div className="grid gap-5" initial={{opacity:0}} animate={{opacity:1}}>
                {challenges.map(c => (
                    <motion.div key={c.id} layout>
                        <Card className={`border ${mode === "light" ? "border-gray-300 bg-white text-gray-900" : "border-gray-700 bg-gray-900/20 text-gray-100"}`}>
                            <CardContent>
                                <div className="flex justify-between">
                                    <h3 className="text-xl font-bold break-words max-w-xl">{c.name}</h3>
                                    <span className={`px-3 py-1 text-sm rounded-full border ${c.status==='active'?'border-green-600 text-green-600':'border-gray-500 opacity-70'}`}>{c.status}</span>
                                </div>

                                <p className="text-sm opacity-80 break-words">{c.description}</p>

                                <div className="text-3xl font-mono font-bold break-all">
                                    {formatDisplayNumber(c.amount)}
                                </div>

                                <div className="text-xl font-mono whitespace-normal break-words overflow-hidden max-w-xl text-center">
                                    Raw number: {c.amount}
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <Button onClick={()=>double(c.id)} disabled={c.status!=="active"} variant="filled">Double it</Button>
                                    <Button onClick={()=>take(c)} disabled={c.status!=="active"} variant="outline">Take it</Button>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <Button onClick={()=>update(c.id, x=>({...x,status:"active",amount:x.amount,updatedAt:new Date().toISOString()}))} variant="outline" className="opacity-60">Reset</Button>
                                    <Button onClick={()=>del(c.id)} variant="outline" className="border-red-600 text-red-600">Delete</Button>
                                </div>

                                <Button onClick={()=>setFullscreenId(c.id)} variant="ghost" className="text-center">Full screen</Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
