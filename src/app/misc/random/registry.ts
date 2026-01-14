import React from "react";

export interface DemoModule {
    title: string;
    description: string;
    preview: React.ReactNode;
    Page: React.ComponentType<object>;
    presentable: boolean;
}

type DemoLoader = () => Promise<DemoModule>;
type DemoRegistry = Record<string, DemoLoader>;

export const demos: DemoRegistry = {
    StateSpace: () =>
        import("./StateSpaceVisualizer").then((m: { default: DemoModule }) => m.default),
    Snake: () =>
        import("./Snake").then((m: { default: DemoModule }) => m.default),
    CodelessGraphs: () =>
        import("./CodelessGraphs").then((m: { default: DemoModule }) => m.default),
    YoutubePlayer: () =>
        import("./YoutubePlayer").then((m: { default: DemoModule }) => m.default),
    CollatzConjecture: () =>
        import("./CollatzConjecture").then((m: { default: DemoModule }) => m.default),
    Calculator: () =>
        import("./MathPad").then((m: { default: DemoModule }) => m.default),
    ThreeDExperiment: () =>
        import("./ThreeDExperiments").then((m: { default: DemoModule }) => m.default),
    GatchaSimulator: () =>
        import("./GatchaSimulator").then((m: { default: DemoModule }) => m.default),
    Hamiltonian: () =>
        import("./Hamiltonian").then((m: { default: DemoModule }) => m.default),
};

export type DemoSlug = keyof typeof demos;
export const demoList = Object.keys(demos) as DemoSlug[];
