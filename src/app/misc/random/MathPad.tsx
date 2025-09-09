"use client";

import React, { useEffect, useRef, useState } from "react";
import { all, create, MathNode, MathType, Matrix } from "mathjs";
import type { DemoModule } from "@/app/misc/random/registry";

// MathPad: math-like REPL; dark theme; auto-evaluates on input.

const math = create(all, { number: "number" as const });

// ---------- Chem formula parsing ----------
function parseChemFormula(formula: string): number {
    // Normalize: remove spaces, accept centered dot or period as hydrate separator
    const f = formula.replace(/\s+/g, "");
    const parts = splitHydrate(f);
    let total = 0;
    for (const part of parts) {
        total += parseTerm(part);
    }
    return total;

    function splitHydrate(s: string): string[] {
        return s.split(/[·.*]/g).filter(Boolean); // middle dot, period, or asterisk
    }

    function parseTerm(s: string): number {
        let i = 0;

        // Optional leading multiplier, e.g., "5H2O"
        const lead = readNumber();
        const mult = lead ?? 1;

        const mass = parseSequence();
        expectEnd();
        return mult * mass;

        function parseSequence(): number {
            let sum = 0;
            while (i < s.length) {
                const c = s[i];
                if (c === "(") {
                    i++; // consume '('
                    const inner = parseSequence();
                    if (s[i] !== ")") throw new Error(`Unmatched "(" at ${i}`);
                    i++; // consume ')'
                    const n = readNumber() ?? 1;
                    sum += inner * n;
                    continue;
                }
                if (c === ")") {
                    // caller handles ')'
                    break;
                }
                if (isUpper(c)) {
                    const el = readElement();
                    const n = readNumber() ?? 1;
                    const mass = CB_MASS[el];
                    if (mass == null) throw new Error(`Unknown element "${el}"`);
                    sum += mass * n;
                    continue;
                }
                throw new Error(`Unexpected character "${c}" at ${i}`);
            }
            return sum;
        }

        function readElement(): string {
            if (!isUpper(s[i])) throw new Error(`Expected element at ${i}`);
            let sym = s[i++]!;
            if (i < s.length && isLower(s[i])) sym += s[i++]!;
            return sym;
        }

        function readNumber(): number | undefined {
            const start = i;
            while (i < s.length && isDigit(s[i])) i++;
            if (i === start) return undefined;
            const n = Number(s.slice(start, i));
            if (!Number.isFinite(n) || n <= 0) throw new Error(`Invalid count at ${start}`);
            return n;
        }

        function expectEnd() {
            if (i !== s.length) throw new Error(`Unexpected trailing content at ${i}`);
        }

        function isUpper(ch: string | undefined) {
            return typeof ch === "string" && ch >= "A" && ch <= "Z";
        }

        function isLower(ch: string | undefined) {
            return typeof ch === "string" && ch >= "a" && ch <= "z";
        }

        function isDigit(ch: string | undefined) {
            return typeof ch === "string" && ch >= "0" && ch <= "9";
        }
    }
}

function normalizeChemCalls(line: string): string {
    return line.replace(
        /chem\(\s*([A-Za-z][A-Za-z0-9()·.*]*)\s*\)/g, // include *
        (_m, inner) => (inner.startsWith('"') || inner.startsWith("'")) ? `chem(${inner})` : `chem("${inner}")`
    );
}

const CB_MASS: Record<string, number> = {
    H: 1.008, He: 4.003,
    Li: 6.94, Be: 9.012, B: 10.81, C: 12.01, N: 14.01, O: 16.00, F: 19.00, Ne: 20.18,
    Na: 22.99, Mg: 24.31, Al: 26.98, Si: 28.09, P: 30.97, S: 32.06, Cl: 35.45, Ar: 39.95,
    K: 39.10, Ca: 40.08, Sc: 44.96, Ti: 47.87, V: 50.94, Cr: 52.00, Mn: 54.94, Fe: 55.85,
    Co: 58.93, Ni: 58.69, Cu: 63.55, Zn: 65.38, Ga: 69.72, Ge: 72.63, As: 74.92, Se: 78.97,
    Br: 79.90, Kr: 83.80,
    Rb: 85.47, Sr: 87.62, Y: 88.91, Zr: 91.22, Nb: 92.91, Mo: 95.95, Tc: 98.00, Ru: 101.07,
    Rh: 102.91, Pd: 106.42, Ag: 107.87, Cd: 112.41, In: 114.82, Sn: 118.71, Sb: 121.76, Te: 127.60,
    I: 126.90, Xe: 131.29,
    Cs: 132.91, Ba: 137.33, La: 138.91, Ce: 140.12, Pr: 140.91, Nd: 144.24, Pm: 145.00,
    Sm: 150.36, Eu: 151.96, Gd: 157.25, Tb: 158.93, Dy: 162.50, Ho: 164.93, Er: 167.26,
    Tm: 168.93, Yb: 173.05, Lu: 174.97,
    Hf: 178.49, Ta: 180.95, W: 183.84, Re: 186.21, Os: 190.23, Ir: 192.22, Pt: 195.08,
    Au: 196.97, Hg: 200.59, Tl: 204.38, Pb: 207.20, Bi: 208.98, Po: 209.00, At: 210.00,
    Rn: 222.00,
    Fr: 223.00, Ra: 226.00, Ac: 227.00, Th: 232.04, Pa: 231.04, U: 238.03, Np: 237.00,
    Pu: 244.00, Am: 243.00, Cm: 247.00, Bk: 247.00, Cf: 251.00, Es: 252.00, Fm: 257.00,
    Md: 258.00, No: 259.00, Lr: 262.00,
    Rf: 267.00, Db: 270.00, Sg: 271.00, Bh: 270.00, Hs: 277.00, Mt: 278.00, Ds: 281.00,
    Rg: 282.00, Cn: 285.00, Nh: 286.00, Fl: 289.00, Mc: 290.00, Lv: 293.00, Ts: 294.00,
    Og: 294.00
};

// ---------- Types (no `any`) ----------
type ScopeValue = MathType | ((x: string) => number);
type Scope = Record<string, ScopeValue>;

// Type guards to avoid `any`
function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null;
}
function isMatrixLike(v: unknown): v is { isMatrix: boolean; toArray: () => unknown } {
    return isRecord(v) && "isMatrix" in v && "toArray" in v && typeof (v as { toArray: unknown }).toArray === "function";
}

function MathPad() {
    const [code, setCode] = useState<string>([
        "# Examples:",
        "f(x) = x^2 + 2x + 1",
        "a = 5",
        "A = [[1, 2], [3, 4]]",
        "B = [[0, -1], [1, 0]]",
        "A * B",
        "f(a)",
        "",
        "# Chem:",
        "chem(Al2O3)",
        "chem(Ca(OH)2)",
        "chem(CuSO4·5H2O)"
    ].join("\n"));
    const [result, setResult] = useState<string>("");
    const [diag, setDiag] = useState<string>("");
    const [pretty, setPretty] = useState<boolean>(true);
    const scopeRef = useRef<Scope>({});

    // Re-render when pretty changes
    useEffect(() => {
        evaluateAll(code);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pretty]);

    function toDisplay(val: unknown): string {
        try {
            if (pretty) return math.format(val as MathType, { precision: 14 });
            return JSON.stringify(
                val,
                (_k, v) => {
                    if (isMatrixLike(v)) return v.toArray();
                    if (typeof v === "number" && !Number.isFinite(v)) return String(v);
                    return v;
                },
                2
            );
        } catch {
            try {
                return String(val);
            } catch {
                return "<unprintable>";
            }
        }
    }

    function stripComments(line: string): string {
        let inQuote = false, quoteChar = "";
        for (let i = 0; i < line.length; i++) {
            const c = line[i]!;
            if ((c === '"' || c === "'") && (i === 0 || line[i - 1] !== "\\")) {
                if (!inQuote) {
                    inQuote = true;
                    quoteChar = c;
                } else if (quoteChar === c) {
                    inQuote = false;
                    quoteChar = "";
                }
            }
            if (!inQuote && c === "#") return line.slice(0, i).trim();
        }
        return line.trim();
    }

    function codeFrame(lines: string[], errLineIdx: number, charIndex?: number) {
        const pad = (n: number) => String(n + 1).padStart(3, " ");
        const prev = lines[errLineIdx - 1];
        const curr = lines[errLineIdx];
        const next = lines[errLineIdx + 1];
        const frame = [
            prev !== undefined ? `${pad(errLineIdx - 1)}  ${prev}` : null,
            `${pad(errLineIdx)}> ${curr}`,
            next !== undefined ? `${pad(errLineIdx + 1)}  ${next}` : null
        ].filter(Boolean).join("\n");

        let caret = "";
        if (typeof charIndex === "number" && charIndex >= 0) {
            const prefix = "    " + " ".repeat(String(errLineIdx + 1).length) + "  ";
            caret = `\n${prefix}${" ".repeat(charIndex)}^`;
        }
        return frame + caret;
    }

    function verboseError(err: unknown, execLines: string[], execToIdx: number) {
        const maybeErr = isRecord(err) ? err : {};
        const idx =
            typeof maybeErr.char === "number" ? (maybeErr.char as number)
                : typeof maybeErr.index === "number" ? (maybeErr.index as number)
                    : undefined;

        const msg = String((isRecord(err) && "message" in err) ? (err as { message: unknown }).message : err ?? "");
        const summary = `Error at line ${execToIdx + 1}: ${msg}`;
        const frame = codeFrame(execLines, execToIdx, idx);
        const hint = (() => {
            if (/Unknown element/.test(msg)) return "Add the element to CB_MASS if missing.";
            if (/Unmatched/.test(msg)) return "Check parentheses.";
            if (/Unexpected character/.test(msg)) return "Valid tokens: element symbols, (), integers.";
            if (/Undefined symbol/i.test(msg)) return "Define variables before use.";
            if (/Unexpected/i.test(msg)) return "Check math syntax (operators, parentheses, commas).";
            if (/dimension|size/i.test(msg)) return "Check matrix/vector shapes.";
            return null;
        })();

        return [summary, "-----", frame, "-----", hint ? `Hint: ${hint}` : ""]
            .filter(Boolean)
            .join("\n");
    }

    function evaluateAll(src: string) {
        const rawLines = src.replace(/\r\n?/g, "\n").split("\n");
        const prepped = rawLines.map(stripComments).filter(l => l.length > 0).map(normalizeChemCalls);

        scopeRef.current = {};
        setDiag("");

        // Bind element masses (variables like H, C, O, …)
        for (const [el, mass] of Object.entries(CB_MASS)) scopeRef.current[el] = mass;

        // Bind chem() into scope
        scopeRef.current["chem"] = (x: string): number => {
            if (typeof x !== "string") throw new Error("chem() expects a formula string");
            return parseChemFormula(x);
        };

        if (prepped.length === 0) {
            setResult("");
            return;
        }

        try {
            let lastVal: MathType | undefined = undefined;
            for (let i = 0; i < prepped.length; i++) {
                const stmt = prepped[i]!;
                const node: MathNode = math.parse(stmt);
                lastVal = node.compile().evaluate(scopeRef.current as Record<string, unknown>) as MathType;
            }
            setResult(toDisplay(lastVal));
        } catch (err: unknown) {
            // Find failing line
            let failingIdx = -1;

            // Retry to locate the failing statement precisely
            scopeRef.current = {};
            for (const [el, mass] of Object.entries(CB_MASS)) scopeRef.current[el] = mass;
            scopeRef.current["chem"] = (x: string): number => {
                if (typeof x !== "string") throw new Error("chem() expects a formula string");
                return parseChemFormula(x);
            };

            for (let i = 0; i < prepped.length; i++) {
                try {
                    const node: MathNode = math.parse(prepped[i]!);
                    node.compile().evaluate(scopeRef.current as Record<string, unknown>);
                } catch {
                    failingIdx = i;
                    break;
                }
            }
            if (failingIdx < 0) failingIdx = 0;

            setResult("");
            setDiag(verboseError(err, prepped, failingIdx));
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            evaluateAll(code);
        }
    }

    return (
        <div className="mt-24 mx-auto max-w-3xl p-4 text-gray-200">
            <h1 className="mb-2 text-2xl font-semibold tracking-tight">MathPad</h1>
            <p className="mb-4 text-sm text-gray-400">
                Each line runs in order; last non-empty value is shown. Use <kbd
                className="rounded bg-white/10 px-1">#</kbd> for comments.
            </p>

            <div className="mb-3">
                <div className="rounded-md border border-white/10 bg-white/5">
          <textarea
              value={code}
              onChange={e => {
                  const v = e.target.value;
                  setCode(v);
                  evaluateAll(v);
              }}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              className="min-h-[500px] w-full resize-y rounded-md bg-transparent p-3 font-mono text-sm text-gray-100 outline-none focus:ring-0"
              placeholder={[
                  "# Examples:",
                  "f(x) = sin(x)^2 + cos(x)^2",
                  "a = 5",
                  "A = [[1,2],[3,4]]",
                  "A * [5,6]",
                  "det(A)",
                  "chem(Ca(OH)2)",
                  "chem(CuSO4·5H2O)"
              ].join("\n")}
          />
                </div>
            </div>

            <div className="mb-3 flex items-center gap-4">
                <label className="inline-flex select-none items-center gap-2 text-sm text-gray-300">
                    <input
                        type="checkbox"
                        checked={pretty}
                        onChange={(e) => setPretty(e.target.checked)}
                        className="h-4 w-4"
                    />
                    pretty-print
                </label>
            </div>

            <div className="rounded-md border border-white/10 bg-white/5">
                <div className="p-4">
                    <div className="text-xs uppercase tracking-wide text-gray-400">Result (last line)</div>
                    <pre className="mt-1 overflow-x-auto rounded-md bg-black/30 p-3 font-mono text-sm">{result || ""}</pre>
                    {diag && (
                        <div className="mt-3">
                            <div className="mb-1 text-xs uppercase tracking-wide text-gray-400">Diagnostics</div>
                            <pre className="overflow-x-auto rounded-md bg-black/30 p-3 font-mono text-xs leading-relaxed">{diag}</pre>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 text-sm text-gray-400">
                <details>
                    <summary className="cursor-pointer select-none">Syntax tips</summary>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                        <li><code>f(x) = x^2 + 2x + 1</code> — define a function</li>
                        <li><code>A = [[1,2],[3,4]]</code> — 2×2 matrix; vectors: <code>[1,2,3]</code></li>
                        <li>Element-wise: <code>A .+ 1</code>, <code>A .* A</code>, <code>A ./ 2</code></li>
                        <li>Matrix ops: <code>A * B</code>, <code>det(A)</code>, <code>inv(A)</code>, <code>transpose(A)</code></li>
                        <li>Ranges: <code>1:5</code> → <code>[1,2,3,4,5]</code>; <code>linspace(0,1,5)</code></li>
                        <li>Chem: <code>chem(Al2O3)</code>, <code>chem(Ca(OH)2)</code>, <code>chem(CuSO4·5H2O)</code></li>
                        <li>Each element symbol (e.g., <code>Na</code>, <code>Cl</code>, <code>O</code>) is bound to its molar mass.</li>
                    </ul>
                </details>
            </div>
        </div>
    );
}

const Page: React.FC = () => <MathPad />;
const preview = <div />;

export const title = "MathPad";
export const description = "WORK IN PROGRESS. a math calculator that's like coding, support algebra, statistics, linear algebra, chemistry";

const mod: DemoModule = { title, description, preview, Page };
export default mod;
