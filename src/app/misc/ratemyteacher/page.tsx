"use client";
// IBDesignDoc.tsx
// Single-file TSX “Notion-like” block primitives + example usage.
// Author by writing JSX blocks; Tailwind handles layout/typography.

/* --- PRIMITIVES -------------------------------------------------------- */

import "@/lib/aggrid";
import React, {useEffect, useState} from "react";
import {AgGridReact} from "ag-grid-react";
import {themeQuartz} from "ag-grid-community";
import {
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import PdfCarousel from "@/components/carousel";

function CourseSelectionRadar() {
    // ---- Hardcoded PROBLEM % (0–100) ----
    const problemRates = {
        Sophomore: {
            problems: 0,
            moreTime: 50,
            peerReliance: 100,
            descriptionsInsufficient: 0,
            discoveryTrouble: 0,
            switched: 50,
        },
        Junior: {
            problems: 100,
            moreTime: 100,
            peerReliance: 100,
            descriptionsInsufficient: 100,
            discoveryTrouble: 0,
            switched: 50,
        },
        Senior: {
            problems: 50,
            moreTime: 50,
            peerReliance: 62.5,
            descriptionsInsufficient: 75,
            discoveryTrouble: 62.5,
            switched: 75,
        },
    } as const;

    // Guarded inversion: Problem% -> Good%
    const toGood = (p: unknown) => {
        const n = Number(p);
        if (!Number.isFinite(n)) return 0;
        return Math.max(0, Math.min(100, 100 - n));
    };

    const METRIC_LABEL = {
        problems: "Confident Picking",
        moreTime: "Enough Time",
        peerReliance: "Peer Reliance",
        descriptionsInsufficient: "Clear Course Descriptions",
        discoveryTrouble: "Ease of Course Discovery",
        switched: "Switch Course",
    } as const;

    const metrics = [
        "problems",
        "moreTime",
        "peerReliance",
        "descriptionsInsufficient",
        "discoveryTrouble",
        "switched",
    ] as const;

    // Build Recharts rows
    const rows = metrics.map((m) => ({
        metric: METRIC_LABEL[m],
        Sophomore: toGood(problemRates.Sophomore[m]),
        Junior: toGood(problemRates.Junior[m]),
        Senior: toGood(problemRates.Senior[m]),
    }));

    return (
        <div className="w-full rounded-2xl border border-white/10 bg-black text-white p-4">
            <div className="mb-2 text-sm opacity-70">
                Fuller = better.
            </div>
            <div style={{width: "100%", height: 420}}>
                <ResponsiveContainer>
                    <RadarChart data={rows} outerRadius="75%">
                        <PolarGrid stroke="rgba(255,255,255,0.15)"/>
                        <PolarAngleAxis dataKey="metric" tick={{fill: "#e5e7eb", fontSize: 11}}/>
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{fill: "#9ca3af"}}/>
                        {/* Explicit stroke/fill so shapes are always visible on dark bg */}
                        <Radar name="Sophomore" dataKey="Sophomore" stroke="#8ab4f8" fill="#8ab4f8" fillOpacity={0.2}
                               isAnimationActive={false}/>
                        <Radar name="Junior" dataKey="Junior" stroke="#f28b82" fill="#f28b82" fillOpacity={0.2}
                               isAnimationActive={false}/>
                        <Radar name="Senior" dataKey="Senior" stroke="#81c995" fill="#81c995" fillOpacity={0.2}
                               isAnimationActive={false}/>
                        <Tooltip
                            formatter={(v: number) => `${v.toFixed(0)}%`}
                            contentStyle={{background: "#0b0b0b", border: "1px solid #222"}}
                            labelStyle={{color: "#e5e7eb"}}
                        />
                        <Legend wrapperStyle={{color: "#e5e7eb"}}/>
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}


const blackTheme = themeQuartz.withParams({
    backgroundColor: "#000000",
    foregroundColor: "#e5e7eb",
    headerBackgroundColor: "#0a0a0a",
    headerTextColor: "#ffffff",
    oddRowBackgroundColor: "#0a0a0a",
    rowHoverColor: "#111111",
    selectedRowBackgroundColor: "#111111",
    borderColor: "#1f2937",
    accentColor: "#38bdf8",
});


// Container (full width with readable line length)
function Doc({children}: { children: React.ReactNode }) {
    return (
        <main className="w-full px-6 py-10">
            <article className="prose dark:prose-invert max-w-5xl mx-auto prose-headings:scroll-mt-24">
                {children}
            </article>
        </main>
    );
}

// Headings
const H1 = ({children}: { children: React.ReactNode }) => (
    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">{children}</h1>
);
const H2 = ({
                children,
                id,
                className = "",
            }: {
    children: React.ReactNode;
    id?: string;
    className?: string;
}) => (
    <h2
        id={id}
        className={`text-2xl md:text-3xl font-bold tracking-tight mt-10 mb-3 ${className}`}
    >
        {children}
    </h2>
);
const H3 = ({children}: { children: React.ReactNode }) => (
    <h3 className="text-xl md:text-2xl font-semibold mt-10 mb-2">{children}</h3>
);

// Text
const P = ({children}: { children: React.ReactNode }) => <p>{children}</p>;
const Small = ({children}: { children: React.ReactNode }) => (
    <p className="text-sm text-black/60 dark:text-white/60">{children}</p>
);

// Lists
const Ul = ({children}: { children: React.ReactNode }) => <ul>{children}</ul>;
const Ol = ({children}: { children: React.ReactNode }) => <ol>{children}</ol>;
const Li = ({children}: { children: React.ReactNode }) => <li>{children}</li>;

// Checklist
function Checklist({children}: { children: React.ReactNode }) {
    return <ul className="list-none pl-0 space-y-2">{children}</ul>;
}

function CheckItem({
                       children,
                       checked = false,
                   }: {
    children: React.ReactNode;
    checked?: boolean;
}) {
    return (
        <li className="flex items-start gap-2">
            <input type="checkbox" defaultChecked={checked} className="mt-1 h-4 w-4"/>
            <div className={checked ? "line-through opacity-70" : ""}>{children}</div>
        </li>
    );
}

// Quote / Callout / Divider
const Quote = ({children}: { children: React.ReactNode }) => (
    <blockquote className="border-l-4 pl-4">{children}</blockquote>
);

function Callout({
                     children,
                     tone = "info",
                 }: {
    children: React.ReactNode;
    tone?: "info" | "warn" | "success" | "neutral";
}) {
    const toneMap: Record<string, string> = {
        info: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50",
        warn: "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900/50",
        success: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50",
        neutral: "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10",
    };
    return (
        <div className={`not-prose border rounded-xl px-4 py-3 ${toneMap[tone]}`}>{children}</div>
    );
}

const Divider = () => <hr className="my-6"/>;

// Grid / Columns
function Columns({
                     children,
                     n = 2,
                 }: {
    children: React.ReactNode;
    n?: 2 | 3 | 4;
}) {
    return (
        <div
            className={`not-prose grid gap-4 ${
                n === 2 ? "md:grid-cols-2" : n === 3 ? "md:grid-cols-3" : "md:grid-cols-4"
            }`}
        >
            {children}
        </div>
    );
}

// Code
function Code({children}: { children: React.ReactNode }) {
    return <code className="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10">{children}</code>;
}

function CodeBlock({
                       children,
                       lang,
                   }: {
    children: React.ReactNode;
    lang?: string;
}) {
    return (
        <pre className="not-prose rounded-xl border border-black/10 dark:border-white/10 p-4 overflow-auto">
      <code className={lang ? `language-${lang}` : ""}>{children}</code>
    </pre>
    );
}

// Table
function Table({
                   head,
                   children,
               }: {
    head?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="not-prose overflow-x-auto">
            <table className="w-full border-collapse">
                {head ? <thead>{head}</thead> : null}
                <tbody>{children}</tbody>
            </table>
        </div>
    );
}

const Tr = ({children}: { children: React.ReactNode }) => (
    <tr className="border-b border-black/10 dark:border-white/10">{children}</tr>
);
const Th = ({children}: { children: React.ReactNode }) => (
    <th className="text-left font-semibold px-3 py-2 bg-black/5 dark:bg-white/10">{children}</th>
);
const Td = ({children}: { children: React.ReactNode }) => (
    <td className="align-top px-3 py-2">{children}</td>
);

// Media
function Figure({
                    src,
                    alt,
                    caption,
                    full = false,
                }: {
    src: string;
    alt: string;
    caption?: string;
    full?: boolean; // full-bleed
}) {
    return (
        <figure className={full ? "not-prose mx-[calc(50%-50vw)] w-screen px-6" : ""}>
            <img
                src={src}
                alt={alt}
                className={`rounded-xl border border-black/10 dark:border-white/10 shadow-sm ${
                    full ? "w-full max-h-[60vh] object-contain" : ""
                }`}
            />
            {caption ? (
                <figcaption className="text-sm text-black/60 dark:text-white/60 mt-1">{caption}</figcaption>
            ) : null}
        </figure>
    );
}

// Tag/Badge
const Tag = ({children}: { children: React.ReactNode }) => (
    <span
        className="not-prose inline-flex items-center rounded-full border border-black/10 dark:border-white/10 px-2 py-0.5 text-xs">
    {children}
  </span>
);

// Section wrappers
function Section({
                     id,
                     title,
                     children,
                 }: {
    id: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section id={id} className="scroll-mt-24">
            <H2 id={id}>{title}</H2>
            {children}
        </section>
    );
}

const Subsection = ({
                        title,
                        children,
                    }: {
    title: string;
    children: React.ReactNode;
}) => (
    <div className="mt-6">
        <H3>{title}</H3>
        {children}
    </div>
);

function GridFromCsv() {
    const [rows, setRows] = useState<never[]>([]);
    const [cols, setCols] = useState<never[]>([]);

    useEffect(() => {
        (async () => {
            const csvText = await fetch("/thegradebook/formresult1.csv", {cache: "no-store"}).then(r => r.text());
            const Papa = (await import("papaparse")).default;
            const parsed = Papa.parse(csvText, {header: true, dynamicTyping: true, skipEmptyLines: true});
            const data = parsed.data as never[];
            const columnDefs = Object.keys(data[0] ?? {}).map(k => ({field: k}));
            setRows(data);
            setCols(columnDefs);
        })();
    }, []);

    return (
        <div className="ag-theme-quartz" style={{height: 650, width: "100%"}}>
            <AgGridReact
                theme={blackTheme}
                rowData={rows}
                columnDefs={cols}
                pagination
                animateRows
            />
        </div>
    );
}

export default function thegradebook() {
    return (
        <div className="pt-24">
            <Doc>
                <H1>IB Design Cycle Documentation</H1>
                <Divider/>

                {/* Criterion A */}
                <Section id="A" title="Criterion A – Inquiring & Analyzing">
                    <Divider/>
                    <Subsection title="A1 – Identify the problem & justify the need">
                        <P>
                            High school students are required to select courses at the start of the academic year, and
                            this important decision is met with inadequate resources in many cases. Existing resources
                            such as course catalogs and brief descriptions are insufficient for
                            informed decision-making. They are often outdated and often doesn&#39;t match course content
                            or describes it in vague
                            terms without clarifying workload intensity, teaching style, or student experiences.
                            <br/><br/>
                            As a result, students frequently rely on informal networking—asking peers, siblings, or
                            upperclassmen—to gather insights. This information flow is inconsistent, biased, and
                            limited, leaving students without a dependable basis for making choices. The lack of a
                            standardized, transparent source of feedback and information leads to many students
                            selecting courses that do not match their learning style, expectations, or academic goals.
                            This mismatch often leads to frustration, lowered performance, and course-switching after
                            the school year begins, which disrupts academic progress.
                            <br/><br/>
                            Therefore, there is an unmet need for a structured, accessible, up-to-date, and
                            student-generated platform that offers authentic student feedback on both courses and
                            teachers. Such a system would benefit all students by providing reliable information,
                            reducing course mismatches, and helping students make choices aligned with their academic
                            and personal goals.
                        </P>
                    </Subsection>
                    <Divider/>
                    <Subsection title="A2 – Research the problem">
                        <P>First survey: surveyed population: 8 senior, 2 junior, 2 sophomore</P>
                        <p>Raw Data:</p>
                        <GridFromCsv/>
                        <p>Observed data from result: 0% of sophomores have problems with course selection but half of
                            them switched classes</p>
                        <p>100% of juniors have problems with course selection and half of them switched classes</p>
                        <p>50% of seniors have problems with course selection, and of the 50% that have problems 50%
                            have switched classes, while the other 50% that don&#39;t have problems 100% switched
                            classes</p>
                        <CourseSelectionRadar/>
                    </Subsection>
                    <Divider/>
                    <Subsection title="A3 – Analyze existing solutions">
                        <Columns n={3}>
                            <Callout tone="neutral">
                                <strong>Solution A</strong>
                                <Ul>
                                    <Li>Strengths: …</Li>
                                    <Li>Weaknesses: …</Li>
                                </Ul>
                            </Callout>
                            <Callout tone="neutral">
                                <strong>Solution B</strong>
                                <Ul>
                                    <Li>Strengths: …</Li>
                                    <Li>Weaknesses: …</Li>
                                </Ul>
                            </Callout>
                            <Callout tone="neutral">
                                <strong>Solution C</strong>
                                <Ul>
                                    <Li>Strengths: …</Li>
                                    <Li>Weaknesses: …</Li>
                                </Ul>
                            </Callout>
                        </Columns>
                    </Subsection>
                    <Divider/>
                    <Subsection title="A4 – Design brief">
                        <PdfCarousel slides={[
                            {src: "/thegradebook/Creative Brief P1.jpg", alt: "Page 1", width: 1920, height: 1080},
                            {src: "/thegradebook/Creative Brief P2.jpg", alt: "Page 2", width: 1920, height: 1080},
                            {src: "/thegradebook/Creative Brief P3.jpg", alt: "Page 3", width: 1920, height: 1080},
                            {src: "/thegradebook/Creative Brief P4.jpg", alt: "Page 4", width: 1920, height: 1080},
                        ]} flyThroughRewind={true}/>
                    </Subsection>
                </Section>

            </Doc>
        </div>
    );
}

//{/* Criterion B */}
//                 <Section id="B" title="Criterion B – Developing Ideas">
//                     <Subsection title="B1 – Design specification">
//                         <Table
//                             head={
//                                 <Tr>
//                                     <Th>Requirement</Th>
//                                     <Th>Metric</Th>
//                                     <Th>Test</Th>
//                                     <Th>Priority</Th>
//                                 </Tr>
//                             }
//                         >
//                             <Tr>
//                                 <Td>Course discovery time</Td>
//                                 <Td>&lt; 30 s from home</Td>
//                                 <Td>5-user test</Td>
//                                 <Td><Tag>Must</Tag></Td>
//                             </Tr>
//                         </Table>
//                     </Subsection>
//
//                     <Subsection title="B2 – Design ideas">
//                         <Columns n={2}>
//                             <div>
//                                 <H3>Concept 1</H3>
//                                 <P>Sketch + rationale.</P>
//                                 <Figure src="/placeholder1.png" alt="Concept 1" caption="Initial sketch"/>
//                             </div>
//                             <div>
//                                 <H3>Concept 2</H3>
//                                 <P>Trade-offs vs Concept 1.</P>
//                                 <Figure src="/placeholder2.png" alt="Concept 2" caption="Alternative"/>
//                             </div>
//                         </Columns>
//                     </Subsection>
//
//                     <Subsection title="B3 – Present chosen design">
//                         <P>Why this design wins against the spec. No hand-waving.</P>
//                         <CodeBlock lang="text">{`Decision: Concept 2
// Reasons: hits MUSTs 1,2,3; faster path to prototype; clearer testing.`}</CodeBlock>
//                     </Subsection>
//
//                     <Subsection title="B4 – Planning drawings/diagrams">
//                         <P>Annotated drawings with dimensions and interfaces.</P>
//                     </Subsection>
//                 </Section>
//
//                 {/* Criterion C */}
//                 <Section id="C" title="Criterion C – Creating the Solution">
//                     <Subsection title="C1 – Logical plan">
//                         <Ol>
//                             <Li>Prototype 0.1 → smoke test</Li>
//                             <Li>Prototype 0.2 → usability test (n=5)</Li>
//                             <Li>Beta → metrics + bugfix</Li>
//                         </Ol>
//                     </Subsection>
//
//                     <Subsection title="C2 – Technical skills">
//                         <P>Evidence: commits, screenshots, code diffs.</P>
//                     </Subsection>
//
//                     <Subsection title="C3 – Follow the plan">
//                         <Checklist>
//                             <CheckItem checked>Milestone 1 complete</CheckItem>
//                             <CheckItem>Milestone 2 in progress</CheckItem>
//                         </Checklist>
//                     </Subsection>
//
//                     <Subsection title="C4 – Justify changes">
//                         <P>Every deviation mapped to test data. No arbitrary edits.</P>
//                     </Subsection>
//                 </Section>
//
//                 {/* Criterion D */}
//                 <Section id="D" title="Criterion D – Evaluating">
//                     <Subsection title="D1 – Testing methods">
//                         <Ul>
//                             <Li>Task success rate</Li>
//                             <Li>Time on task</Li>
//                             <Li>Error rate</Li>
//                         </Ul>
//                     </Subsection>
//
//                     <Subsection title="D2 – Evaluate success">
//                         <Table
//                             head={
//                                 <Tr>
//                                     <Th>Spec</Th>
//                                     <Th>Result</Th>
//                                     <Th>Status</Th>
//                                 </Tr>
//                             }
//                         >
//                             <Tr>
//                                 <Td>Discovery &lt; 30 s</Td>
//                                 <Td>Median 22 s (n=8)</Td>
//                                 <Td><Tag>Pass</Tag></Td>
//                             </Tr>
//                         </Table>
//                     </Subsection>
//
//                     <Subsection title="D3 – Impact on client/society">
//                         <P>Concrete effects, not hypotheticals.</P>
//                     </Subsection>
//
//                     <Subsection title="D4 – Improvements">
//                         <Ul>
//                             <Li>Prioritized backlog with reasons</Li>
//                             <Li>Next tests to validate</Li>
//                         </Ul>
//                     </Subsection>
//                 </Section>