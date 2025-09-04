import React from "react";

export interface DemoModule {
    title: string;
    description: string;
    preview: React.ReactNode;
    Page: React.ComponentType<object>;
}

type DemoLoader = () => Promise<DemoModule>;
type DemoRegistry = Record<string, DemoLoader>;

export const demos: DemoRegistry = {
    StateSpace: () =>
        import("./StateSpaceVisualizer").then((m: { default: DemoModule }) => m.default),
    YoutubePlayer: () =>
        import("./YoutubePlayer").then((m: { default: DemoModule }) => m.default),
};

export type DemoSlug = keyof typeof demos;
export const demoList = Object.keys(demos) as DemoSlug[];
