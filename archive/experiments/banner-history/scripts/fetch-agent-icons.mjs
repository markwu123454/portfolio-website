/**
 * Agent icon fetcher (Enka.Network)
 * ─────────────────────────────────
 * Downloads the ROUND in-game avatar icon for every agent and re-encodes to
 * AVIF into public/banner-history/icons/agents/{id}.avif — fully automatic, no
 * manual datamining. Replaces the hand-datamined agent icons.
 *
 * Source: Enka's community-maintained store, keyed by the SAME 4-digit agent id
 * our lookup.json uses, so the join is a straight id lookup:
 *   store/zzz/avatars.json → { "1091": { CircleIcon: "/ui/zzz/IconRoleCircle13.png", … } }
 *   image → https://enka.network/ui/zzz/IconRoleCircle13.png   (already round + alpha)
 *
 * `CircleIcon` numbers are NOT derivable from the id (1091→13, 1191→21), so the
 * store json is required — but it auto-updates, so new agents appear on their own.
 * Enka only hosts what its site uses, so a brand-new agent's icon may 404; we skip
 * and warn (keeping the last-good file) rather than fail the run.
 *
 * Also emits data/agent-colors.json (id → the agent's game-canonical accent
 * colors) from the same store data — for tinting Gantt bands / icon glows in the
 * UI. The UI joins it by the agent id already present in banner.json.
 *
 * Elements / specialties / rarity are NOT handled here — they change rarely and
 * come from the local set via process-icons.mjs.
 *
 * Usage:  node scripts/banner-extractor/fetch-agent-icons.mjs
 * Env:    ENKA_BASE  (default https://enka.network)
 *         STORE_URL  (default the API-docs raw avatars.json)
 *         LOOKUP     (default scripts/banner-extractor/lookup.json)
 *         OUT_DIR    (default public/banner-history/icons/agents)
 *         DATA_DIR   (default src/app/(main)/experiments/banner-history/data)
 */

import sharp from 'sharp';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');

const ENKA_BASE = process.env.ENKA_BASE ?? 'https://enka.network';
const STORE_URL =
    process.env.STORE_URL ??
    'https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/zzz/avatars.json';
const LOOKUP_PATH = process.env.LOOKUP
    ? resolve(ROOT, process.env.LOOKUP)
    : resolve(HERE, 'lookup.json');
const OUT_DIR = process.env.OUT_DIR
    ? resolve(ROOT, process.env.OUT_DIR)
    : resolve(ROOT, 'public/banner-history/icons/agents');
const DATA_DIR = process.env.DATA_DIR
    ? resolve(ROOT, process.env.DATA_DIR)
    : resolve(ROOT, 'src/app/(main)/experiments/banner-history/data');

const USER_AGENT = 'portfolio-banner-tracker/1.0 (+github actions)';
const AVIF = { quality: 60, effort: 4 };

const kb = (b) => (b / 1024).toFixed(1) + ' KB';

async function fetchBuffer(url) {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) throw new Error(`${res.status}`);
    return Buffer.from(await res.arrayBuffer());
}

async function main() {
    console.log(`▶ store: ${STORE_URL}`);
    const store = JSON.parse((await fetchBuffer(STORE_URL)).toString('utf8'));
    const lookup = JSON.parse(await readFile(LOOKUP_PATH, 'utf8'));
    const ids = Object.keys(lookup.agents ?? {});
    console.log(`  ${Object.keys(store).length} agents in store · ${ids.length} in lookup`);

    await mkdir(OUT_DIR, { recursive: true });

    const missing = [];
    const failed = [];
    const colors = {}; // id → accent colors (independent of icon availability)
    let ok = 0;
    let outBytes = 0;
    let firstLogged = false;

    for (const id of ids) {
        const entry = store[id];
        if (entry?.Colors) {
            const c = entry.Colors;
            colors[id] = {
                name: lookup.agents[id].name,
                accent: c.Accent ?? null,
                accentExtra: c.AccentExtra ?? null,
                mindscape: c.Mindscape ?? null,
            };
        }
        const iconPath = entry?.CircleIcon;
        if (!iconPath) {
            missing.push(`${id} ${lookup.agents[id].name}`);
            continue;
        }
        const url = new URL(iconPath, ENKA_BASE).href;
        try {
            const buf = await fetchBuffer(url);
            if (!firstLogged) {
                const meta = await sharp(buf).metadata();
                console.log(`  sample ${id}: ${meta.width}×${meta.height} ${meta.format} alpha=${meta.hasAlpha}`);
                firstLogged = true;
            }
            const info = await sharp(buf).avif(AVIF).toFile(resolve(OUT_DIR, `${id}.avif`));
            outBytes += info.size;
            ok++;
        } catch (e) {
            failed.push(`${id} ${lookup.agents[id].name} (${e.message})`);
        }
    }

    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(resolve(DATA_DIR, 'agent-colors.json'), JSON.stringify(colors, null, 2));

    console.log(`\n✔ ${ok} agent icons → ${OUT_DIR}  (${kb(outBytes)} total, avg ${kb(outBytes / (ok || 1))})`);
    console.log(`✔ ${Object.keys(colors).length} agent color sets → ${resolve(DATA_DIR, 'agent-colors.json')}`);
    if (missing.length) console.log(`\n○ not in Enka store yet (kept last-good if present):\n  ${missing.join('\n  ')}`);
    if (failed.length) console.log(`\n! download/encode failed:\n  ${failed.join('\n  ')}`);
    if (missing.length || failed.length) {
        console.log('\n  → for any of the above, fall back to a manual datamined icon in the agents/ folder.');
    }
}

main().catch((e) => {
    console.error('✖ agent-icon fetch failed:', e.message);
    process.exit(1);
});
