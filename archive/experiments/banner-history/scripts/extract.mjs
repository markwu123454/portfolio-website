/**
 * ZZZ banner extractor
 * ─────────────────────
 * Pulls the banner *schedule* out of zzz.163.moe's SvelteKit bundle and enriches
 * it with local game metadata from lookup.json, producing three artefacts:
 *
 *   data/banner.json            enriched banners (names → ids/element/specialty/…)
 *   data/metadata.json          hash, counts, coverage, the fingerprint we matched
 *   data/bundle-catalogue.json  first-element inventory of every big constant found
 *
 * Deploy-resilience: we never anchor on chunk filenames or minified variable
 * names. We fetch the entry HTML, follow every referenced JS chunk, parse each
 * to an AST, and find the banner array by the SHAPE of its elements (property
 * keys survive minification; variable names do not). The array is pure literal
 * data, so we statically evaluate just that node — their code is never executed.
 *
 * If the shape ever stops matching (they rename keys / enable property mangling),
 * we exit non-zero WITHOUT writing banner.json, so CI fails loudly and the last
 * good data stays committed.
 *
 * Usage:  node scripts/banner-extractor/extract.mjs
 * Env:    BASE_URL   (default https://zzz.163.moe)
 *         OUT_DIR    (default src/app/(main)/experiments/banner-history/data)
 *         LOOKUP     (default scripts/banner-extractor/lookup.json)
 */

import * as acorn from 'acorn';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');

const BASE_URL = process.env.BASE_URL ?? 'https://zzz.163.moe';
const OUT_DIR = process.env.OUT_DIR
    ? resolve(ROOT, process.env.OUT_DIR)
    : resolve(ROOT, 'src/app/(main)/experiments/banner-history/data');
const LOOKUP_PATH = process.env.LOOKUP
    ? resolve(ROOT, process.env.LOOKUP)
    : resolve(HERE, 'lookup.json');

const USER_AGENT = 'portfolio-banner-tracker/1.0 (+github actions; contact via site)';

// Property keys a banner element must have. These are the fingerprint — the one
// thing that stays stable across their deploys. Update deliberately if it breaks.
const BANNER_FINGERPRINT = ['version', 'phase', 'startDate', 'endDate'];

/* ───────────────────────── fetch layer ───────────────────────── */

async function fetchText(url) {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) throw new Error(`GET ${url} → ${res.status} ${res.statusText}`);
    return res.text();
}

/** Extract every _app/immutable/**.js URL referenced by the entry HTML. */
function jsChunkUrls(html, pageUrl) {
    const urls = new Set();
    const re = /(?:href|src)\s*=\s*["']([^"']*_app\/immutable\/[^"']*\.js)["']/g;
    let m;
    while ((m = re.exec(html))) urls.add(new URL(m[1], pageUrl).href);
    return [...urls];
}

/* ───────────────────── AST helpers (no acorn-walk) ───────────────────── */

/** Depth-first walk over an ESTree node, calling visit(node) on every object. */
function walk(node, visit) {
    if (!node || typeof node.type !== 'string') return;
    visit(node);
    for (const key in node) {
        if (key === 'type' || key === 'start' || key === 'end') continue;
        const child = node[key];
        if (Array.isArray(child)) {
            for (const c of child) if (c && typeof c.type === 'string') walk(c, visit);
        } else if (child && typeof child.type === 'string') {
            walk(child, visit);
        }
    }
}

/** Static-evaluate a literal-only AST node. Throws on anything non-literal —
 *  which is exactly the guarantee we want: their code never runs. */
function evalLiteral(node) {
    switch (node.type) {
        case 'Literal':
            return node.value;
        case 'ArrayExpression':
            return node.elements.map((el) => (el === null ? null : evalLiteral(el)));
        case 'ObjectExpression': {
            const o = {};
            for (const p of node.properties) {
                if (p.type !== 'Property') throw new Error('spread/getter in object');
                o[keyName(p)] = evalLiteral(p.value);
            }
            return o;
        }
        case 'UnaryExpression':
            // minifiers emit !0 / !1 for true / false, and void 0 for undefined
            if (node.operator === '-') return -evalLiteral(node.argument);
            if (node.operator === '+') return +evalLiteral(node.argument);
            if (node.operator === '!') return !evalLiteral(node.argument);
            if (node.operator === 'void') return void evalLiteral(node.argument);
            throw new Error(`unary ${node.operator}`);
        case 'TemplateLiteral':
            if (node.expressions.length === 0) return node.quasis[0].value.cooked;
            throw new Error('template with expressions');
        case 'Identifier':
            if (node.name === 'undefined') return undefined;
            throw new Error(`identifier ${node.name}`);
        default:
            throw new Error(`non-literal node: ${node.type}`);
    }
}

function keyName(prop) {
    return prop.key.type === 'Identifier' ? prop.key.name : prop.key.value;
}

/** Keys of the first ObjectExpression element of an array, else null. */
function firstElementKeys(arrayNode) {
    const first = arrayNode.elements.find((e) => e && e.type === 'ObjectExpression');
    return first ? first.properties.filter((p) => p.type === 'Property').map(keyName) : null;
}

/** Does this array look like the banner array? */
function isBannerArray(arrayNode) {
    const keys = firstElementKeys(arrayNode);
    if (!keys) return false;
    const set = new Set(keys);
    return BANNER_FINGERPRINT.every((k) => set.has(k));
}

/* ─────────────────── chunk cataloguing + banner find ─────────────────── */

/**
 * Parse one chunk. Returns { collections, banners, bannerVar }.
 * - collections: inventory of every top-level const array/object (first-element shape)
 * - banners:     the evaluated banner array if this chunk holds it, else null
 */
function inspectChunk(source) {
    let ast;
    try {
        ast = acorn.parse(source, { ecmaVersion: 'latest', sourceType: 'module' });
    } catch {
        // Some entry/start chunks aren't valid modules on their own — skip.
        return { collections: [], banners: null, bannerVar: null };
    }

    const collections = [];
    let banners = null;
    let bannerVar = null;

    // Top-level `const/let/var NAME = [...]|{...}` — the "big constants".
    for (const stmt of ast.body) {
        const decls =
            stmt.type === 'VariableDeclaration'
                ? stmt.declarations
                : stmt.type === 'ExportNamedDeclaration' && stmt.declaration?.type === 'VariableDeclaration'
                    ? stmt.declaration.declarations
                    : [];
        for (const d of decls) {
            const name = d.id?.type === 'Identifier' ? d.id.name : '?';
            const init = d.init;
            if (!init) continue;
            if (init.type === 'ArrayExpression' && init.elements.length > 0) {
                collections.push({
                    name,
                    type: 'array',
                    count: init.elements.length,
                    firstElementKeys: firstElementKeys(init),
                    firstElement: sampleValue(init.elements[0]),
                });
            } else if (init.type === 'ObjectExpression' && init.properties.length > 0) {
                const props = init.properties.filter((p) => p.type === 'Property');
                collections.push({
                    name,
                    type: 'object',
                    count: props.length,
                    sampleKeys: props.slice(0, 8).map(keyName),
                    firstValue: props[0] ? sampleValue(props[0].value) : null,
                });
            }
        }
    }

    // Banner array can live anywhere in the tree (often inside an IIFE / export).
    walk(ast, (n) => {
        if (banners) return;
        if (n.type === 'ArrayExpression' && isBannerArray(n)) {
            // Defensive: a shape match that fails to statically eval is a
            // false positive, not a crash — skip it and keep scanning.
            try { banners = evalLiteral(n); } catch { /* not the banner array */ }
        }
    });
    // Best-effort: recover the variable name the banner array was assigned to.
    if (banners) {
        walk(ast, (n) => {
            if (bannerVar) return;
            if (
                n.type === 'VariableDeclarator' &&
                n.init?.type === 'ArrayExpression' &&
                isBannerArray(n.init) &&
                n.id?.type === 'Identifier'
            ) {
                bannerVar = n.id.name;
            }
        });
    }

    return { collections, banners, bannerVar };
}

/** A compact, safe sample of a node's value for the catalogue (never throws). */
function sampleValue(node) {
    if (!node) return null;
    try {
        const v = evalLiteral(node);
        return truncate(v);
    } catch {
        return `<${node.type}>`;
    }
}

function truncate(v, depth = 0) {
    if (depth > 3) return '…';
    if (Array.isArray(v)) return v.slice(0, 4).map((x) => truncate(x, depth + 1));
    if (v && typeof v === 'object') {
        const out = {};
        for (const k of Object.keys(v).slice(0, 12)) out[k] = truncate(v[k], depth + 1);
        return out;
    }
    if (typeof v === 'string' && v.length > 80) return v.slice(0, 80) + '…';
    return v;
}

/* ───────────────────────── lookup / join ───────────────────────── */

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');

function buildIndex(lookup) {
    const agents = new Map(); // norm(name|alias) → {id, ...meta}
    for (const [id, a] of Object.entries(lookup.agents ?? {})) {
        const rec = {
            id,
            name: a.name,
            element: a.element ?? null,
            specialty: a.specialty ?? null,
            rarity: a.rarity ?? null,
            faction: a.faction ?? null,
        };
        agents.set(norm(a.name), rec);
        for (const al of a.aliases ?? []) agents.set(norm(al), rec);
    }
    return { agents };
}

function resolveAgent(name, index, unmatched) {
    const hit = index.agents.get(norm(name));
    if (hit) return { ...hit, raw: name };
    unmatched.add(name);
    return { id: null, name, element: null, specialty: null, rarity: null, faction: null, raw: name };
}

/* ─────────────────────────── main ─────────────────────────── */

async function main() {
    console.log(`▶ fetching ${BASE_URL}`);
    const pageUrl = new URL('/', BASE_URL).href;
    const html = await fetchText(pageUrl);
    const chunkUrls = jsChunkUrls(html, pageUrl);
    console.log(`  found ${chunkUrls.length} JS chunk(s) referenced by the entry HTML`);
    if (chunkUrls.length === 0) throw new Error('no JS chunks referenced in HTML — layout changed?');

    const catalogue = { generatedAt: new Date().toISOString(), source: pageUrl, chunks: [] };
    let banners = null;
    let bannerChunk = null;
    let bannerVar = null;

    for (const url of chunkUrls) {
        let source;
        try {
            source = await fetchText(url);
        } catch (e) {
            console.warn(`  ! skip ${url}: ${e.message}`);
            continue;
        }
        const { collections, banners: found, bannerVar: v } = inspectChunk(source);
        catalogue.chunks.push({
            url,
            name: url.split('/').pop(),
            byteLength: source.length,
            collectionCount: collections.length,
            collections,
        });
        if (found && !banners) {
            banners = found;
            bannerChunk = url;
            bannerVar = v;
        }
    }

    if (!banners) {
        console.error('\n✖ banner array not found in any chunk.');
        console.error('  The structural fingerprint may have changed:', BANNER_FINGERPRINT.join(', '));
        console.error('  bundle-catalogue below lists what WAS found — inspect firstElementKeys.');
        await mkdir(OUT_DIR, { recursive: true });
        await writeFile(resolve(OUT_DIR, 'bundle-catalogue.json'), JSON.stringify(catalogue, null, 2));
        process.exit(1);
    }

    console.log(`✔ banners: ${banners.length} entries (var "${bannerVar ?? '?'}" in ${bannerChunk.split('/').pop()})`);

    // ── enrich ──
    const lookup = JSON.parse(await readFile(LOOKUP_PATH, 'utf8'));
    const index = buildIndex(lookup);
    const unmatched = { sRanks: new Set(), aRanks: new Set() };
    const stats = { sRanks: [0, 0], aRanks: [0, 0] }; // [matched, total]

    const tally = (arr, kind) =>
        (arr ?? []).map((name) => {
            const r = resolveAgent(name, index, unmatched[kind]);
            stats[kind][1]++;
            if (r.id) stats[kind][0]++;
            return r;
        });

    const enriched = banners.map((b) => ({
        version: b.version,
        phase: b.phase,
        startDate: b.startDate,
        endDate: b.endDate,
        sRanks: tally(b.sRanks, 'sRanks'),
        aRanks: tally(b.aRanks, 'aRanks'),
        // Featured A-rank w-engines rerun alongside the agent, so we keep them as
        // plain names only — no separate weapon lookup / icons.
        aWengines: b.aWengines ?? [],
        raw: b, // keep the original for audit / fields we didn't map
    }));

    const versions = [...new Set(banners.map((b) => b.version))];
    const dataHash = createHash('sha256')
        .update(JSON.stringify(enriched.map(({ raw, ...e }) => e)))
        .digest('hex');

    // ── change detection vs previously committed metadata ──
    const metaPath = resolve(OUT_DIR, 'metadata.json');
    let prevHash = null;
    if (existsSync(metaPath)) {
        try { prevHash = JSON.parse(await readFile(metaPath, 'utf8')).dataHash ?? null; } catch { /* ignore */ }
    }
    const changed = prevHash !== dataHash;

    const metadata = {
        generatedAt: new Date().toISOString(),
        source: pageUrl,
        bannerChunk,
        bannerVar,
        fingerprint: BANNER_FINGERPRINT,
        bannerCount: banners.length,
        versionCount: versions.length,
        versions,
        dataHash,
        previousHash: prevHash,
        changed,
        coverage: {
            sRanks: `${stats.sRanks[0]}/${stats.sRanks[1]}`,
            aRanks: `${stats.aRanks[0]}/${stats.aRanks[1]}`,
        },
        unmatched: {
            sRanks: [...unmatched.sRanks].sort(),
            aRanks: [...unmatched.aRanks].sort(),
        },
    };

    // ── write ──
    await mkdir(OUT_DIR, { recursive: true });
    await writeFile(resolve(OUT_DIR, 'banner.json'), JSON.stringify(enriched, null, 2));
    await writeFile(metaPath, JSON.stringify(metadata, null, 2));
    await writeFile(resolve(OUT_DIR, 'bundle-catalogue.json'), JSON.stringify(catalogue, null, 2));

    // ── report ──
    console.log('\n── coverage (agents only) ──');
    console.log(`  S-ranks   ${metadata.coverage.sRanks}`);
    console.log(`  A-ranks   ${metadata.coverage.aRanks}`);
    const anyUnmatched = unmatched.sRanks.size + unmatched.aRanks.size;
    if (anyUnmatched) {
        console.log('\n── unmatched (need aliases in lookup.json) ──');
        if (unmatched.sRanks.size) console.log('  S:', [...unmatched.sRanks].join(', '));
        if (unmatched.aRanks.size) console.log('  A:', [...unmatched.aRanks].join(', '));
    } else {
        console.log('\n  ✔ every name resolved');
    }
    console.log(`\n${changed ? '● data CHANGED' : '○ data unchanged'} (hash ${dataHash.slice(0, 12)}…)`);
    console.log(`✔ wrote banner.json (${enriched.length}), metadata.json, bundle-catalogue.json → ${OUT_DIR}`);
}

main().catch((e) => {
    console.error('\n✖ extractor failed:', e.message);
    process.exit(1);
});
