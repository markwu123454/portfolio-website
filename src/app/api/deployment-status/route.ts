// app/api/deployment-status/route.ts
import { NextResponse } from "next/server";

type ServiceKey = "thisApp" | "frontend" | "backend";

const GITHUB_REPOS: Record<ServiceKey, { owner: string; repo: string }> = {
    thisApp: {
        owner: "markwu123454",
        repo: "portfolio-website",
    },
    frontend: {
        owner: "markwu123454",
        repo: "SprocketStats",
    },
    backend: {
        owner: "markwu123454",
        repo: "SprocketStats",
    },
};

export async function GET() {
    const [thisApp, frontend, backend] = await Promise.all([
        getVercelStatus(process.env.VERCEL_SELF_PROJECT_ID!, "thisApp"),
        getVercelStatus(process.env.VERCEL_FRONTEND_PROJECT_ID!, "frontend"),
        getRenderStatus("backend"),
    ]);

    return NextResponse.json({
        this: thisApp,
        sprocketstatfrontend: frontend,
        sprocketstatbackend: backend,
        updatedAt: Date.now(),
    });
}

function githubCommitUrl(service: ServiceKey, sha?: string) {
    if (!sha) return undefined;
    const { owner, repo } = GITHUB_REPOS[service];
    return `https://github.com/${owner}/${repo}/commit/${sha}`;
}

function normalizeTime(ms?: number | string) {
    if (!ms) return undefined;
    return typeof ms === "number" ? ms : new Date(ms).getTime();
}

async function getVercelStatus(projectId: string, service: ServiceKey) {
    const params = new URLSearchParams({
        projectId,
        target: "production",
        limit: "1",
    });

    const res = await fetch(
        `https://api.vercel.com/v6/deployments?${params}`,
        {
            headers: {
                Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
            },
            cache: "no-store",
        }
    );

    if (!res.ok) {
        return {
            deploymentTime: undefined,
            isBuilding: false,
            commitSha: undefined,
            commitUrl: undefined,
        };
    }

    const data = await res.json();
    const d = data.deployments?.[0];
    if (!d) {
        return {
            deploymentTime: undefined,
            isBuilding: false,
            commitSha: undefined,
            commitUrl: undefined,
        };
    }

    const isBuilding =
        d.state === "BUILDING" || d.state === "QUEUED";

    const sha = d.meta?.githubCommitSha;

    return {
        deploymentTime: normalizeTime(d.readyAt ?? d.createdAt),
        isBuilding,
        commitSha: sha,
        commitUrl: githubCommitUrl(service, sha),
    };
}

async function getRenderStatus(service: ServiceKey) {
    const res = await fetch(
        `https://api.render.com/v1/services/${process.env.RENDER_BACKEND_SERVICE_ID}/deploys?limit=1`,
        {
            headers: {
                Authorization: `Bearer ${process.env.RENDER_API_KEY}`,
                Accept: "application/json",
            },
            cache: "no-store",
        }
    );

    if (!res.ok) {
        return {
            deploymentTime: undefined,
            isBuilding: false,
            commitSha: undefined,
            commitUrl: undefined,
        };
    }

    const data = await res.json();

    const wrapper = data?.[0];
    const d = wrapper?.deploy;
    if (!d) {
        return {
            deploymentTime: undefined,
            isBuilding: false,
            commitSha: undefined,
            commitUrl: undefined,
        };
    }

    const isBuilding =
        d.status === "build_in_progress" ||
        d.status === "created";

    const sha = d.commit?.id;

    return {
        deploymentTime: normalizeTime(d.finishedAt ?? d.createdAt),
        isBuilding,
        commitSha: sha,
        commitUrl: githubCommitUrl(service, sha),
    };
}
