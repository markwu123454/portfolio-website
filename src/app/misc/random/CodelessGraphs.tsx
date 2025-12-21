"use client";

import {DemoModule} from "@/app/misc/random/registry";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";

import Papa from "papaparse";
import * as XLSX from "xlsx";

import {AgGridReact} from "ag-grid-react";
import {themeQuartz, IHeaderParams, colorSchemeDark} from "ag-grid-community";

import {ResponsiveBar} from "@nivo/bar";
import {ResponsiveLine} from "@nivo/line";
import {ResponsiveScatterPlot} from "@nivo/scatterplot";
import { ResponsiveRadar } from "@nivo/radar";

const myTheme = themeQuartz.withPart(colorSchemeDark);

/* ---------- Types ---------- */

type IngestSource =
    | { kind: "file"; file: File }
    | { kind: "text"; text: string };

type ChartType = "bar" | "line" | "scatter";

type ChartSpec = {
    kind: "pointList" | "columnList" | "hierarchy";
};

const ChartTypes: Record<ChartType, ChartSpec> = {
    bar: {kind: "columnList"},
    line: {kind: "columnList"},
    scatter: {kind: "pointList"},
};

type ColumnListMapping = {
    x: string | null;
    y: string[];
}

type PointListMapping = {
    points: {
        x: string;
        y: string;
    }[];
};

type ChartMapping =
    | { kind: "columnList"; value: ColumnListMapping }
    | { kind: "pointList"; value: PointListMapping };

/* ---------- Graph creation ---------- */

function ColumnPill({col}: { col: ColumnDef }) {
    return (
        <div
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData("column-id", col.id);
            }}
            className="
        px-2 py-1 rounded-md text-xs
        bg-neutral-800 text-neutral-300
        cursor-grab active:cursor-grabbing
        hover:bg-neutral-700
      "
        >
            {col.label}
        </div>
    );
}

type ColumnListMappingPanelProps = {
    columns: ColumnDef[];
    mapping: ColumnListMapping;
    setMapping: (value: ColumnListMapping) => void;
};

const ColumnListMappingPanel: React.FC<ColumnListMappingPanelProps> = ({
                                                                           columns,
                                                                           mapping,
                                                                           setMapping,
                                                                       }) => {
    const xColumn =
        columns.find((c) => c.id === mapping.x) ?? null;

    const yColumns = mapping.y
        .map((id) => columns.find((c) => c.id === id))
        .filter((c): c is ColumnDef => c !== undefined);

    return (
        <div className="grid grid-cols-2 gap-6">
            {/* X axis */}
            <div>
                <div className="mb-2 text-xs text-neutral-500">X axis</div>
                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        const id = e.dataTransfer.getData("column-id");
                        if (id) {
                            setMapping({...mapping, x: id});
                        }
                    }}
                    className="
                        min-h-[40px] rounded-md border border-dashed
                        border-neutral-700 flex items-center px-2
                        text-sm text-neutral-400
                    "
                >
                    {xColumn ? xColumn.label : "Drop column here"}
                </div>
            </div>

            {/* Y values */}
            <div>
                <div className="mb-2 text-xs text-neutral-500">Y values</div>
                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        const id = e.dataTransfer.getData("column-id");
                        if (id && !mapping.y.includes(id)) {
                            setMapping({
                                ...mapping,
                                y: [...mapping.y, id],
                            });
                        }
                    }}
                    className="
                        min-h-[60px] rounded-md border border-dashed
                        border-neutral-700 p-2 flex flex-wrap gap-2
                    "
                >
                    {yColumns.length === 0 && (
                        <div className="text-sm text-neutral-500">
                            Drop numeric columns here
                        </div>
                    )}

                    {yColumns.map((col) => (
                        <div
                            key={col.id}
                            className="
                                flex items-center gap-1
                                px-2 py-1 bg-neutral-700
                                rounded-md text-xs
                            "
                        >
                            {col.label}
                            <button
                                onClick={() =>
                                    setMapping({
                                        ...mapping,
                                        y: mapping.y.filter((y) => y !== col.id),
                                    })
                                }
                                className="text-neutral-400 hover:text-white"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


type PointListMappingPanelProps = {
    columns: ColumnDef[];
    mapping: PointListMapping;
    setMapping: (value: PointListMapping) => void;
};

const PointListMappingPanel: React.FC<PointListMappingPanelProps> = ({
                                                                         columns,
                                                                         mapping,
                                                                         setMapping,
                                                                     }) => {
    const pairs = mapping.points;

    const updatePair = (
        index: number,
        key: "x" | "y",
        value: string
    ) => {
        const next = [...pairs];
        next[index] = {...next[index], [key]: value};

        // If last pair is now complete → append empty pair
        const last = next[next.length - 1];
        if (last?.x && last?.y) {
            next.push({x: "", y: ""});
        }

        setMapping({points: next});
    };

    const removePair = (index: number) => {
        const next = pairs.filter((_, i) => i !== index);

        // Ensure at least one empty row exists
        if (next.length === 0 || next[next.length - 1].x || next[next.length - 1].y) {
            next.push({x: "", y: ""});
        }

        setMapping({points: next});
    };

    const getColumnLabel = (id: string) =>
        columns.find((c) => c.id === id)?.label ?? id;

    return (
        <div className="space-y-3">
            <div className="text-xs text-neutral-500">
                Scatter point pairs (X, Y)
            </div>

            {pairs.map((pair, index) => (
                <div
                    key={index}
                    className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center"
                >
                    {/* X drop */}
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            const id = e.dataTransfer.getData("column-id");
                            if (id) updatePair(index, "x", id);
                        }}
                        className="
                            min-h-[36px] rounded-md border border-dashed
                            border-neutral-700 px-2 flex items-center
                            text-sm text-neutral-400
                        "
                    >
                        {pair.x ? getColumnLabel(pair.x) : "Drop X column"}
                    </div>

                    {/* Y drop */}
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            const id = e.dataTransfer.getData("column-id");
                            if (id) updatePair(index, "y", id);
                        }}
                        className="
                            min-h-[36px] rounded-md border border-dashed
                            border-neutral-700 px-2 flex items-center
                            text-sm text-neutral-400
                        "
                    >
                        {pair.y ? getColumnLabel(pair.y) : "Drop Y column"}
                    </div>

                    {/* Remove */}
                    {(pair.x || pair.y) && (
                        <button
                            onClick={() => removePair(index)}
                            className="text-neutral-500 hover:text-white"
                        >
                            ×
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};


/* ---------- AG Grid ---------- */

type ColumnDef = {
    id: string;
    label: string;
};

type TableData = {
    columns: ColumnDef[];
    rows: Record<string, any>[];
};

type HeaderProps = IHeaderParams & {
    onCommit: (colId: string, newLabel: string) => void;
};

const EditableHeader: React.FC<HeaderProps> = (props) => {
    const {displayName, column, onCommit} = props;

    const [value, setValue] = useState(displayName ?? "");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setValue(displayName ?? "");
    }, [displayName]);

    return (
        <input
            ref={inputRef}
            value={value}
            spellCheck={false}

            onChange={(e) => setValue(e.target.value)}

            onBlur={() => {
                if (value !== displayName) {
                    onCommit(column.getColId(), value);
                }
            }}

            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    inputRef.current?.blur();
                }
                if (e.key === "Escape") {
                    setValue(displayName ?? "");
                    inputRef.current?.blur();
                }
            }}

            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}

            className="
                w-full bg-transparent border-none outline-none
                text-sm text-neutral-400 font-medium
                px-0 py-0
                focus:ring-0
            "
        />
    );
};


/* ---------- Component ---------- */

function GraphBuilderPage() {
    const inputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);

    const chartRef = useRef<HTMLDivElement>(null);

    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const [tableData, setTableData] = useState<TableData | null>(null);
    const [chartType, setChartType] = useState<ChartType>("bar");

    const [mapping, setMapping] = useState<ChartMapping>({
        kind: "columnList",
        value: {x: null, y: []},
    });


    const previewRows = tableData?.rows.slice(0, 5) ?? [];

    const columnDefs = useMemo(() => {
        if (!tableData) return [];

        return tableData.columns.map((col) => ({
            field: col.id,
            colId: col.id,
            editable: false,
            sortable: false,
            suppressMovable: false,

            headerComponent: EditableHeader,
            headerComponentParams: {
                onCommit: (id: string, newLabel: string) => {
                    setTableData((prev) => {
                        if (!prev) return prev;

                        return {
                            ...prev,
                            columns: prev.columns.map((c) =>
                                c.id === id ? {...c, label: newLabel} : c
                            ),
                        };
                    });
                },
            },
        }));
    }, [tableData]);


    const handleColumnMoved = (e: any) => {
        setTableData((prev) => {
            if (!prev) return prev;

            const newOrder: string[] = e.api
                .getAllGridColumns()
                .map((c: any) => c.getColId());

            return {
                ...prev,
                columns: newOrder.map(id =>
                    prev.columns.find(c => c.id === id)!
                ),
            };
        });
    };


    useEffect(() => {
        const spec = ChartTypes[chartType];

        setMapping(prev => {
            // If the kind didn't change, keep existing mapping
            if (prev?.kind === spec.kind) {
                return prev;
            }

            // Otherwise, reset based on new kind
            if (spec.kind === "columnList") {
                return {
                    kind: "columnList",
                    value: {x: null, y: []},
                };
            }

            if (spec.kind === "pointList") {
                return {
                    kind: "pointList",
                    value: {points: [{x: "", y: ""}]},
                };
            }

            return prev;
        });
    }, [chartType]);


    const columnListToSeries = (
        rows: Record<string, any>[],
        x: string,
        y: string[]
    ) => {
        return y.map(yKey => ({
            id: columnLabelById[yKey],
            data: rows.map(row => ({
                x: row[x],
                y: row[yKey],
            })),
        }));
    };


    const columnLabelById = useMemo(() => {
        if (!tableData) return {};
        return Object.fromEntries(
            tableData.columns.map(c => [c.id, c.label])
        );
    }, [tableData]);


    const barChartData = useMemo(() => {
        if (
            chartType !== "bar" ||
            !tableData ||
            mapping.kind !== "columnList" ||
            !mapping.value.x ||
            mapping.value.y.length === 0
        ) {
            return null;
        }

        const {x, y} = mapping.value;

        return tableData.rows.map(row => {
            const item: Record<string, any> = {
                [columnLabelById[x]]: row[x],
            };

            y.forEach(colId => {
                item[columnLabelById[colId]] = row[colId];
            });

            return item;
        });
    }, [chartType, tableData, mapping, columnLabelById]);


    const lineChartData = useMemo(() => {
        if (
            !tableData ||
            mapping.kind !== "columnList" ||
            !mapping.value.x ||
            mapping.value.y.length === 0
        ) {
            return null;
        }

        return columnListToSeries(
            tableData.rows,
            mapping.value.x,
            mapping.value.y
        );
    }, [tableData, mapping, columnLabelById]);


    const scatterChartData = useMemo(() => {
        if (
            chartType !== "scatter" ||
            !tableData ||
            mapping.kind !== "pointList"
        ) {
            return null;
        }

        const validPairs = mapping.value.points.filter(p => p.x && p.y);
        if (validPairs.length === 0) return null;

        return validPairs.map(pair => ({
            id: `${columnLabelById[pair.x]} vs ${columnLabelById[pair.y]}`,
            data: tableData.rows
                .map(row => ({
                    x: row[pair.x],
                    y: row[pair.y],
                }))
                .filter(p => typeof p.x === "number" && typeof p.y === "number"),
        }));
    }, [chartType, tableData, mapping, columnLabelById]);

    /* ---------- Export ---------- */

    const exportSVG = () => {
        if (!chartRef.current) return;

        const svg = chartRef.current.querySelector("svg");
        if (!svg) return;

        const serializer = new XMLSerializer();
        const source = serializer.serializeToString(svg);

        const blob = new Blob([source], {
            type: "image/svg+xml;charset=utf-8",
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");

        a.href = url;
        a.download = "chart.svg";
        a.click();

        URL.revokeObjectURL(url);
    };

    const exportPNG = async () => {
        if (!chartRef.current) return;

        const {toPng} = await import("html-to-image");

        const dataUrl = await toPng(chartRef.current, {
            backgroundColor: "#000000",
            pixelRatio: 2,
        });

        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "chart.png";
        a.click();
    };


    /* ---------- Validation helpers ---------- */

    const isSupportedFile = (file: File) =>
        file.type === "text/csv" ||
        file.name.endsWith(".csv") ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls");

    const looksLikeTabularText = (text: string) =>
        /[\t,;]/.test(text) && text.split("\n").length > 1;

    /* ---------- Central ingestion ---------- */

    const parseCSV = (input: File | string) =>
        new Promise<TableData>((resolve, reject) => {
            Papa.parse(input, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: (result) => {
                    const rows = result.data as Record<string, any>[];
                    resolve({
                        columns: (result.meta.fields ?? []).map((f) => ({
                            id: f,
                            label: f,
                        })),
                        rows,
                    });
                },
                error: reject,
            });
        });

    const parseExcel = async (file: File): Promise<TableData> => {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, {type: "array"});
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
            defval: null,
        });

        return {
            columns: rows.length
                ? Object.keys(rows[0]).map((k) => ({id: k, label: k}))
                : [],
            rows,
        };
    };


    const ingestData = useCallback(async (source: IngestSource) => {
        setError(null);

        try {
            if (source.kind === "file") {
                const {file} = source;

                if (!isSupportedFile(file)) {
                    setError("Unsupported file type. Please upload a CSV or Excel file.");
                    return;
                }

                setFileName(file.name);

                const data =
                    file.name.endsWith(".csv")
                        ? await parseCSV(file)
                        : await parseExcel(file);

                setTableData(data);
                console.log("Table state:", data);
                return;
            }

            if (source.kind === "text") {
                if (!looksLikeTabularText(source.text)) {
                    setError("Pasted content does not look like tabular data.");
                    return;
                }

                setFileName(null);

                const data = await parseCSV(source.text);
                setTableData(data);
                console.log("Table state:", data);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to parse data.");
        }
    }, []);


    /* ---------- File handling ---------- */

    const handleFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        ingestData({kind: "file", file: files[0]});
    };

    /* ---------- Global paste (hover-gated) ---------- */

    useEffect(() => {
        const handleGlobalPaste = (e: ClipboardEvent) => {
            if (!isHovered && !isFocused) return;

            const text = e.clipboardData?.getData("text/plain");
            if (!text) return;

            e.preventDefault();
            ingestData({kind: "text", text});
        };

        document.addEventListener("paste", handleGlobalPaste);
        return () => document.removeEventListener("paste", handleGlobalPaste);
    }, [isHovered, isFocused, ingestData]);

    /* ---------- Render ---------- */

    const isActive = isHovered || isFocused || isDragOver;

    return (
        <div className="bg-black text-white flex flex-col mt-24 py-12 px-6 gap-8">
            {/* Header */}
            <header className="max-w-5xl w-full mx-auto flex flex-col gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Graph Studio
                </h1>
                <p className="text-sm text-neutral-400 max-w-xl">
                    Upload data and design charts visually.
                </p>
            </header>

            {/* Main workspace */}
            <main className="max-w-5xl w-full mx-auto flex flex-col gap-6">
                {/* Upload / Data section */}
                <section
                    ref={dropZoneRef}
                    tabIndex={0}
                    className={[
                        "rounded-2xl border-2 border-dashed transition-all cursor-pointer outline-none",
                        "p-12 text-center",
                        error
                            ? "border-red-500 bg-red-500/5"
                            : isActive
                                ? "border-neutral-400 bg-neutral-900/60"
                                : "border-neutral-700 hover:border-neutral-500",
                    ].join(" ")}
                    onClick={() => inputRef.current?.click()}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        handleFiles(e.dataTransfer.files);
                    }}
                >
                    <div className="flex flex-col items-center gap-3 pointer-events-none">
                        <p className="text-base text-neutral-200">
                            Drag & drop your data here
                        </p>
                        <p className="text-sm text-neutral-400">
                            CSV, Excel, or paste while hovering
                        </p>
                        <p
                            className={[
                                "text-xs transition-colors",
                                error
                                    ? "text-red-400"
                                    : fileName
                                        ? "text-neutral-300"
                                        : "text-neutral-500",
                            ].join(" ")}
                        >
                            {error
                                ? error
                                : fileName
                                    ? (
                                        <>
                                            Loaded file:{" "}
                                            <span className="font-medium text-white">
                                                {fileName}
                                            </span>
                                        </>
                                    )
                                    : isActive
                                        ? "Press ⌘V / Ctrl+V to paste tabular data"
                                        : "Click anywhere to choose a file"}
                        </p>
                    </div>

                    <input
                        ref={inputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        className="hidden"
                        onChange={(e) => handleFiles(e.target.files)}
                    />
                </section>

                <section className="border border-neutral-800 rounded-lg p-4">
                    <div className="mb-2 text-xs text-neutral-400">
                        Data preview (first 5 rows)
                    </div>

                    <div className="h-[240px]">
                        <AgGridReact
                            theme={myTheme}
                            rowData={tableData ? previewRows : []}
                            columnDefs={tableData ? columnDefs : []}
                            headerHeight={36}
                            rowHeight={32}
                            animateRows
                            onColumnMoved={handleColumnMoved}
                            suppressCellFocus
                        />
                    </div>
                </section>


                <section className="border border-neutral-800 rounded-lg p-6 space-y-6">
                    <div className="text-sm text-neutral-400">Chart mapping</div>

                    {/* Chart type selector */}
                    <div className="flex gap-1 bg-neutral-900 p-1 rounded-lg w-fit">
                        {(Object.keys(ChartTypes) as ChartType[]).map(type => (
                            <button
                                key={type}
                                onClick={() => setChartType(type)}
                                className={[
                                    "px-3 py-1.5 text-sm rounded-md transition",
                                    chartType === type
                                        ? "bg-neutral-700 text-white"
                                        : "text-neutral-400 hover:text-white hover:bg-neutral-800",
                                ].join(" ")}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Columns */}
                    <div>
                        <div className="mb-2 text-xs text-neutral-500">Columns</div>

                        {tableData ? (
                            <div className="flex flex-wrap gap-2">
                                {tableData.columns.map(col => (
                                    <ColumnPill key={col.id} col={col}/>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-neutral-500 italic">
                                Load data to enable column mapping
                            </div>
                        )}
                    </div>

                    {/* Mapping UI */}
                    {tableData ? (
                        <>
                            {mapping.kind === "columnList" && (
                                <ColumnListMappingPanel
                                    columns={tableData.columns}
                                    mapping={mapping.value}
                                    setMapping={(value) =>
                                        setMapping({
                                            kind: "columnList",
                                            value,
                                        })
                                    }
                                />
                            )}

                            {mapping.kind === "pointList" && (
                                <PointListMappingPanel
                                    columns={tableData.columns}
                                    mapping={mapping.value}
                                    setMapping={(value) =>
                                        setMapping({
                                            kind: "pointList",
                                            value,
                                        })
                                    }
                                />
                            )}
                        </>
                    ) : (
                        <div
                            className="rounded-md border border-dashed border-neutral-700 p-4 text-sm text-neutral-500">
                            Drag & drop mapping will be available once data is loaded.
                        </div>
                    )}
                </section>


                {/* Customization panel */}
                <section className="border border-neutral-800 rounded-lg p-6">
                    <div className="mb-2 text-sm text-neutral-400">Chart preview</div>

                    {/* BAR */}
                    {chartType === "bar" && barChartData && (
                        <div ref={chartRef} className="h-[360px] bg-black">
                            <ResponsiveBar
                                data={barChartData}
                                keys={
                                    mapping.kind === "columnList"
                                        ? mapping.value.y.map(id => columnLabelById[id])
                                        : []
                                }
                                indexBy={
                                    mapping.kind === "columnList"
                                        ? columnLabelById[mapping.value.x!]
                                        : ""
                                }
                                margin={{top: 20, right: 20, bottom: 50, left: 60}}
                                padding={0.3}
                                colors={{scheme: "nivo"}}
                                axisBottom={{
                                    tickSize: 5,
                                    tickPadding: 5,
                                    legend:
                                        mapping.kind === "columnList"
                                            ? columnLabelById[mapping.value.x!]
                                            : "",
                                    legendPosition: "middle",
                                    legendOffset: 36,
                                }}
                                axisLeft={{
                                    tickSize: 5,
                                    tickPadding: 5,
                                    legend: "Value",
                                    legendPosition: "middle",
                                    legendOffset: -40,
                                }}
                                enableLabel={false}
                                theme={{
                                    text: {
                                        fill: "#d4d4d4",
                                        fontSize: 11,
                                    },
                                    axis: {
                                        ticks: {
                                            line: {stroke: "#525252"},
                                            text: {fill: "#a3a3a3"},
                                        },
                                        legend: {
                                            text: {fill: "#d4d4d4"},
                                        },
                                    },
                                    grid: {
                                        line: {stroke: "#262626"},
                                    },
                                    tooltip: {
                                        container: {
                                            background: "#111",
                                            color: "#fff",
                                            fontSize: 12,
                                        },
                                    },
                                }}
                            />
                        </div>
                    )}

                    {/* LINE */}
                    {chartType === "line" && lineChartData && (
                        <div ref={chartRef} className="h-[360px] bg-black">
                            <ResponsiveLine
                                data={lineChartData}
                                margin={{top: 20, right: 20, bottom: 50, left: 60}}
                                xScale={{type: "point"}}
                                yScale={{type: "linear", stacked: false}}
                                axisBottom={{
                                    legend:
                                        mapping.kind === "columnList"
                                            ? columnLabelById[mapping.value.x!]
                                            : "",
                                    legendOffset: 36,
                                    legendPosition: "middle",
                                }}
                                axisLeft={{
                                    legend: "Value",
                                    legendOffset: -40,
                                    legendPosition: "middle",
                                }}
                                colors={{scheme: "nivo"}}
                                pointSize={6}
                                useMesh
                                theme={{
                                    text: {
                                        fill: "#d4d4d4",
                                        fontSize: 11,
                                    },
                                    axis: {
                                        ticks: {
                                            line: {stroke: "#525252"},
                                            text: {fill: "#a3a3a3"},
                                        },
                                        legend: {
                                            text: {fill: "#d4d4d4"},
                                        },
                                    },
                                    grid: {
                                        line: {stroke: "#262626"},
                                    },
                                    tooltip: {
                                        container: {
                                            background: "#111",
                                            color: "#fff",
                                            fontSize: 12,
                                        },
                                    },
                                }}
                            />
                        </div>
                    )}

                    {/* SCATTER */}
                    {chartType === "scatter" && scatterChartData && (
                        <div ref={chartRef} className="h-[360px] bg-black">
                            <ResponsiveScatterPlot
                                data={scatterChartData}
                                margin={{top: 20, right: 20, bottom: 50, left: 60}}
                                xScale={{type: "linear"}}
                                yScale={{type: "linear"}}
                                axisBottom={{
                                    legend: "X",
                                    legendOffset: 36,
                                    legendPosition: "middle",
                                }}
                                axisLeft={{
                                    legend: "Y",
                                    legendOffset: -40,
                                    legendPosition: "middle",
                                }}
                                colors={{scheme: "nivo"}}
                                nodeSize={8}
                                useMesh
                                theme={{
                                    text: {
                                        fill: "#d4d4d4",
                                        fontSize: 11,
                                    },
                                    axis: {
                                        ticks: {
                                            line: {stroke: "#525252"},
                                            text: {fill: "#a3a3a3"},
                                        },
                                        legend: {
                                            text: {fill: "#d4d4d4"},
                                        },
                                    },
                                    grid: {
                                        line: {stroke: "#262626"},
                                    },
                                    tooltip: {
                                        container: {
                                            background: "#111",
                                            color: "#fff",
                                            fontSize: 12,
                                        },
                                    },
                                }}
                            />
                        </div>
                    )}


                </section>


                <section className="border border-neutral-800 rounded-lg p-6 flex gap-3">
                    <button
                        onClick={exportSVG}
                        disabled={!chartRef.current}
                        className="
            px-4 py-2 rounded-md text-sm
            bg-neutral-700 hover:bg-neutral-600
            disabled:opacity-40 disabled:cursor-not-allowed
        "
                    >
                        Export SVG
                    </button>

                    <button
                        onClick={exportPNG}
                        disabled={!chartRef.current}
                        className="
            px-4 py-2 rounded-md text-sm
            bg-neutral-700 hover:bg-neutral-600
            disabled:opacity-40 disabled:cursor-not-allowed
        "
                    >
                        Export PNG
                    </button>
                </section>

            </main>
        </div>
    );
}

/* ---------- Module wiring ---------- */

const previewAreaBumpData = [
    {
        "taste": "fruity",
        "chardonay": 64,
        "carmenere": 101,
        "syrah": 58
    },
    {
        "taste": "bitter",
        "chardonay": 106,
        "carmenere": 54,
        "syrah": 47
    },
    {
        "taste": "heavy",
        "chardonay": 96,
        "carmenere": 80,
        "syrah": 37
    },
    {
        "taste": "strong",
        "chardonay": 118,
        "carmenere": 105,
        "syrah": 87
    },
    {
        "taste": "sunny",
        "chardonay": 95,
        "carmenere": 95,
        "syrah": 33
    }
]


const Page: React.FC = () => <GraphBuilderPage/>;

const preview = (
    <div className="w-full h-fullrounded-lgborder border-zinc-800overflow-hidden">
        <ResponsiveRadar /* or Radar for fixed dimensions */
            data={previewAreaBumpData}
            keys={['chardonay', 'carmenere', 'syrah']}
            indexBy="taste"
            margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
            gridLabelOffset={36}
            dotSize={10}
            dotColor={{ theme: 'background' }}
            dotBorderWidth={2}
            blendMode="multiply"
            legends={[
                {
                    anchor: 'top-left',
                    direction: 'column',
                    translateX: -50,
                    translateY: -40,
                    itemWidth: 80,
                    itemHeight: 20,
                    symbolShape: 'circle'
                }
            ]}
        />
    </div>
);



export const title = "Graph Studio";
export const description = "A no-code data visualization tool. WIP";

const mod: DemoModule = {
    title,
    description,
    preview,
    Page,
    presentable: true,
};

export default mod;
