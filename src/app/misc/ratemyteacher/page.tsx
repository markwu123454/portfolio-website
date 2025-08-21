"use client";

import "@/lib/aggrid";
import React, {useEffect, useState} from "react";
import Image from "next/image";
import {AgGridReact} from "ag-grid-react";
import {themeQuartz} from "ag-grid-community";
import type {ColDef} from "ag-grid-community";
import {
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import PdfCarousel from "@/components/carousel";
import Link from "next/link";
import {MoveRight} from "lucide-react";


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

// Container (full width with readable line length)
function Doc({children}: { children: React.ReactNode }) {
    return (
        <main className="w-full px-6 py-10">
            <article className="prose dark:prose-invert min-w-0 px-50 mx-auto prose-headings:scroll-mt-24">
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


const Divider = () => <hr className="my-6"/>;


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


type CsvRow = Record<string, string | number | boolean | null>;

function GridFromCsv() {
    const [rows, setRows] = useState<CsvRow[]>([]);
    const [cols, setCols] = useState<ColDef[]>([]);

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

    useEffect(() => {
        (async () => {
            const csvText = await fetch("/thegradebook/formresult1.csv", {
                cache: "no-store",
            }).then((r) => r.text());
            const Papa = (await import("papaparse")).default;
            const parsed = Papa.parse<CsvRow>(csvText, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
            });
            const data = parsed.data;
            const columnDefs: ColDef[] =
                Object.keys(data[0] ?? {}).map((k) => ({field: k}));
            setRows(data);
            setCols(columnDefs);
        })();
    }, []);

    return (
        <div
            className="ag-theme-quartz" // base theme class
            style={{height: 650, width: "100%"}}
        >
            <AgGridReact<CsvRow>
                theme={blackTheme}        // injects your custom colors
                rowData={rows}
                columnDefs={cols}
                pagination
                animateRows
            />
        </div>
    );
}

export default function Thegradebook() {
    return (
        <div className="pt-24">
            <Doc>
                <Link
                    href="https://thegradebook-git-master-markwu123454s-projects.vercel.app/"
                    target="_blank"
                    className="font-semibold underline-offset-4 inline-flex items-center gap-1 transition text-2xl hover:underline pb-4"
                >
                    Visit the project website <MoveRight className="w-6 h-6" />
                </Link>
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
                        <table className="table-auto border-collapse border border-gray-400 w-full text-left">
                            <thead>
                            <tr>
                                <th className="border border-gray-400 px-4 py-2">Categories</th>
                                <th className="border border-gray-400 px-4 py-2">BerkeleyTime</th>
                                <th className="border border-gray-400 px-4 py-2">RateMyTeachers</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td className="border border-gray-400 px-4 py-2">Who’s the target audience/</td>
                                <td className="border border-gray-400 px-4 py-2">UC Berkeley students planning their
                                    courses and exploring professors.
                                </td>
                                <td className="border border-gray-400 px-4 py-2">Middle school and high school students
                                    seeking peer opinions about teachers.
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-400 px-4 py-2">What’s the problem being addressed?
                                </td>
                                <td className="border border-gray-400 px-4 py-2">Lack of easy access to grade
                                    distributions and class information in the official university system.
                                </td>
                                <td className="border border-gray-400 px-4 py-2">Lack of transparency about teachers and
                                    teaching styles in secondary schools.
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-400 px-4 py-2">What’s unique about it?</td>
                                <td className="border border-gray-400 px-4 py-2">Uses official grade data presented in
                                    clean, visual charts.
                                </td>
                                <td className="border border-gray-400 px-4 py-2">Allows student driven qualitative
                                    feedback on teachers in a centralized space.
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-400 px-4 py-2">Strength:</td>
                                <td className="border border-gray-400 px-4 py-2">
                                    <li>Clean, professional interface designed specifically for students.</li>
                                    <li>Provides visual grade distributions (bar charts) that make data easy to
                                        understand.
                                    </li>
                                    <li>Centralizes course and instructor information in one place.</li>
                                    <li>Widely trusted by students because data comes from official sources.</li>
                                </td>
                                <td className="border border-gray-400 px-4 py-2">
                                    <li>Gives students a voice.</li>
                                    <li>Provides quick, direct insight into teacher personality and teaching style.</li>
                                    <li>Centralized platform for reviews.</li>
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-400 px-4 py-2">Weakness:</td>
                                <td className="border border-gray-400 px-4 py-2">
                                    <li>Only quantitative (data only, no personal feedback).</li>
                                    <li>Only for UC Berkeley (not adaptable to HS).</li>
                                </td>
                                <td className="border border-gray-400 px-4 py-2">
                                    <li>Reviews are often unmoderated → biased or unprofessional.</li>
                                    <li>Focuses only on teachers, not classes.</li>
                                    <li>Sometimes vague or unhelpful.</li>
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-400 px-4 py-2">What would you change?</td>
                                <td className="border border-gray-400 px-4 py-2">Add student comments in a moderated way
                                    to give context beyond grades. This can help students better understand the class.
                                    Most class descriptions only have what teachers right and not feedback about the
                                    class.
                                </td>
                                <td className="border border-gray-400 px-4 py-2">Add grade data or workload indicators
                                    to complement reviews; improve moderation. This will help students decide whether or
                                    not this class will be too difficult for them.
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-400 px-4 py-2">What’s the take away?</td>
                                <td className="border border-gray-400 px-4 py-2">Official, visual data builds trust and
                                    usability. It brings authenticity to each review. Ultimately, this will help
                                    students understand what each class is like
                                </td>
                                <td className="border border-gray-400 px-4 py-2">Student voices are valuable but need
                                    structure moderation and balance with data. Remove all ads.
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-400 px-4 py-2">Screenshots</td>
                                <td className="border border-gray-400 px-4 py-2">
                                    <Image src="/thegradebook/berkeleytime1.png"
                                           alt="BerkeleyTime image"
                                           width="500" height="500"
                                    />
                                    <Image src="/thegradebook/berkeleytime2.png"
                                           alt="BerkeleyTime image"
                                           width="500" height="500"
                                           className="pt-2"
                                    />
                                </td>
                                <td className="border border-gray-400 px-4 py-2">
                                    <Image src="/thegradebook/ratemyteacher1.png"
                                           alt="ratemyteachers image"
                                           width="500" height="500"
                                    />
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </Subsection>
                    <Divider/>
                    <Subsection title="A4 – Design brief">
                        <PdfCarousel slides={[
                            {src: "/thegradebook/Creative Brief P1.jpg", alt: "Page 1", width: 1920, height: 1080},
                            {src: "/thegradebook/Creative Brief P2.jpg", alt: "Page 2", width: 1920, height: 1080},
                            {src: "/thegradebook/Creative Brief P3.jpg", alt: "Page 3", width: 1920, height: 1080},
                            {src: "/thegradebook/Creative Brief P4.jpg", alt: "Page 4", width: 1920, height: 1080},
                            {src: "/thegradebook/Creative Brief P5.jpg", alt: "Page 5", width: 1920, height: 1080},
                            {src: "/thegradebook/Creative Brief P6.jpg", alt: "Page 6", width: 1920, height: 1080},
                            {src: "/thegradebook/Creative Brief P7.jpg", alt: "Page 7", width: 1920, height: 1080},
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