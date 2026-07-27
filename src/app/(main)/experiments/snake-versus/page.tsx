"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { intC, intR, generateHamiltonianBasic, randomFreeCell } from "../snake/snakeAlgo";
import { NewSolver, OldSolver, type Solver } from "./solvers";


type Human = {
    snake: number[];
    apple: number;
    steps: number;
    dead: boolean;
    won: boolean;
};

const SIZES = [6, 8, 10, 12];

function dirDelta(head: number, dir: string, rows: number, cols: number): number {
    const r = (head / cols) | 0;
    const c = head % cols;
    if (dir === "up") return r > 0 ? head - cols : -1;
    if (dir === "down") return r < rows - 1 ? head + cols : -1;
    if (dir === "left") return c > 0 ? head - 1 : -1;
    if (dir === "right") return c < cols - 1 ? head + 1 : -1;
    return -1;
}


function VersusPage() {
    const [size, setSize] = useState(8);
    const rows = size;
    const cols = size;

    const humanRef = useRef<Human | null>(null);
    const oldRef = useRef<Solver | null>(null);
    const newRef = useRef<Solver | null>(null);
    const [, setTick] = useState(0);
    const rerender = () => setTick((t) => t + 1);

    const reset = useCallback(() => {
        const basic = generateHamiltonianBasic(size, size);
        const snake = [basic[1], basic[0]];
        const apple = randomFreeCell(size, size, new Set(snake));
        humanRef.current = { snake, apple, steps: 0, dead: false, won: false };
        oldRef.current = new OldSolver(size, size, apple);
        newRef.current = new NewSolver(size, size, apple);
        rerender();
    }, [size]);

    // (Re)start whenever the board size changes (and on mount).
    useEffect(() => { reset(); }, [reset]);

    // Arrow keys: each valid press advances all three by one step. A reverse
    // press is ignored (not a move); a press into a wall or the snake's own body
    // ends the human's run, but the algorithms keep going.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const dir = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" }[e.key];
            if (!dir) return;
            e.preventDefault();

            const h = humanRef.current;
            const total = rows * cols;

            if (h && !h.dead && !h.won) {
                const next = dirDelta(h.snake[0], dir, rows, cols);
                // Reverse into the neck: ignore, advance no one.
                if (next !== -1 && h.snake.length > 1 && next === h.snake[1]) return;

                if (next === -1) {
                    h.dead = true; // into a wall
                } else {
                    const eats = next === h.apple;
                    const body = eats ? h.snake : h.snake.slice(0, h.snake.length - 1);
                    if (body.includes(next)) {
                        h.dead = true; // into itself
                    } else {
                        const ns = [next, ...h.snake];
                        if (!eats) ns.pop();
                        if (eats) h.apple = randomFreeCell(rows, cols, new Set(ns));
                        h.snake = ns;
                        h.steps++;
                        if (ns.length === total) h.won = true;
                    }
                }
            }

            oldRef.current?.step();
            newRef.current?.step();
            rerender();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [rows, cols]);

    const h = humanRef.current;
    const oldS = oldRef.current;
    const newS = newRef.current;

    return (
        <div className="flex flex-col min-h-[calc(100vh-53px)]">
            <div className="border-b border-rule bg-bg-elev px-6 py-5">
                <div className="font-mono text-[11px] tracking-kicker uppercase text-accent flex items-center gap-2">
                    <span>EXPERIMENT</span><span className="text-fg-soft">·</span><span>SNAKE VERSUS</span>
                </div>
                <h1 className="mt-2 mb-1 text-[26px] font-semibold tracking-[-0.025em]">Snake — head to head</h1>
                <p className="m-0 text-[13px] text-fg-muted leading-snug max-w-2xl">
                    You, the old algorithm, and the new one all play at once. Every arrow-key press
                    advances all three by a single step, so there is no clock — pace it yourself and
                    compare how many steps each spends per apple.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                        onClick={reset}
                        className="px-3 py-2 rounded border border-fg bg-fg text-bg hover:opacity-90 font-mono text-[11px] tracking-kicker uppercase transition-opacity"
                    >
                        Reset
                    </button>
                    <span className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft ml-2">Board</span>
                    {SIZES.map((s) => (
                        <button
                            key={s}
                            onClick={() => setSize(s)}
                            className={`px-3 py-2 rounded border font-mono text-[11px] tracking-kicker uppercase transition-colors ${
                                s === size ? "border-fg bg-fg text-bg" : "border-rule bg-bg-elev hover:border-rule-strong"
                            }`}
                        >
                            {s}×{s}
                        </button>
                    ))}
                    <span className="font-mono text-[10px] tracking-kicker uppercase text-fg-soft ml-2">← ↑ ↓ → to play</span>
                </div>
            </div>

            <div className="flex-1 p-6 lg:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {h && (
                    <Board
                        title="You" accent="#22c55e" rows={rows} cols={cols}
                        snake={h.snake} apple={h.apple} apples={h.snake.length - 2} steps={h.steps}
                        status={h.dead ? "Crashed" : h.won ? "Solved" : "Playing"}
                        statusColor={h.dead ? "#ef4444" : h.won ? "#34d399" : "#a1a1aa"}
                    />
                )}
                {oldS && (
                    <Board
                        title="Old algorithm" accent="#38bdf8" rows={rows} cols={cols}
                        snake={oldS.snake} apple={oldS.apple} apples={oldS.apples} steps={oldS.steps}
                        status={oldS.won ? "Solved" : "Running"}
                        statusColor={oldS.won ? "#34d399" : "#a1a1aa"}
                    />
                )}
                {newS && (
                    <Board
                        title="New algorithm" accent="#fb923c" rows={rows} cols={cols}
                        snake={newS.snake} apple={newS.apple} apples={newS.apples} steps={newS.steps}
                        status={newS.won ? "Solved" : "Running"}
                        statusColor={newS.won ? "#34d399" : "#a1a1aa"}
                    />
                )}
            </div>
        </div>
    );
}


function Board({
    title, accent, rows, cols, snake, apple, apples, steps, status, statusColor,
}: {
    title: string; accent: string; rows: number; cols: number;
    snake: number[]; apple: number; apples: number; steps: number;
    status: string; statusColor: string;
}) {
    const ptInt = (v: number) => `${intC(v, cols) * 100 + 50},${intR(v, cols) * 100 + 50}`;
    const perApple = apples > 0 ? (steps / apples).toFixed(1) : "—";

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: accent }} />
                    <span className="font-mono text-[12px] tracking-kicker uppercase text-fg">{title}</span>
                </div>
                <span className="font-mono text-[10px] tracking-kicker uppercase" style={{ color: statusColor }}>{status}</span>
            </div>

            <div
                className="relative grid border border-rule rounded overflow-hidden"
                style={{
                    gridTemplateRows: `repeat(${rows}, 1fr)`,
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    aspectRatio: `${cols} / ${rows}`,
                }}
            >
                {Array.from({ length: rows * cols }).map((_, idx) => (
                    <div key={idx} className="border border-rule bg-bg" />
                ))}

                <svg className="absolute inset-0 pointer-events-none" viewBox={`0 0 ${cols * 100} ${rows * 100}`}>
                    <polyline
                        fill="none" stroke={accent} strokeWidth="55"
                        strokeLinecap="round" strokeLinejoin="round"
                        points={snake.map(ptInt).join(" ")}
                    />
                    {snake.length > 0 && (
                        <circle cx={intC(snake[0], cols) * 100 + 50} cy={intR(snake[0], cols) * 100 + 50} r="30" fill={accent} />
                    )}
                    {snake.length < rows * cols && (
                        <circle cx={intC(apple, cols) * 100 + 50} cy={intR(apple, cols) * 100 + 50} r="26" fill="#dc2626" />
                    )}
                </svg>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-rule pt-3">
                <Stat label="Apples" value={String(apples)} />
                <Stat label="Steps" value={steps.toLocaleString()} />
                <Stat label="Steps / apple" value={perApple} />
            </div>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="font-mono text-[9px] tracking-kicker uppercase text-fg-soft mb-1">{label}</div>
            <div className="font-mono text-[18px] font-medium leading-none text-fg tabular-nums">{value}</div>
        </div>
    );
}

export default function SnakeVersusRoute() {
    return <VersusPage />;
}
