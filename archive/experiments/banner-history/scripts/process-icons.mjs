/**
 * Icon processor
 * ──────────────
 * Copies the icon sets the banner tracker actually renders — agents, elements,
 * specialties, rarity — from the ZZZ Damage Calculator project and re-encodes
 * every image to AVIF (much smaller than the source PNGs) into public/.
 *
 * Only these four sets are copied: w-engine / disc / enemy / stat / combat / ui
 * icons aren't used by the tracker. Filenames are preserved (minus extension):
 *   agents/{id}.avif        elements/{name}.avif
 *   specialties/{name}.avif rarity/{a|b|c|s|special}.avif
 *
 * The UI maps an agent's element/specialty/rarity string → filename with
 * lowercase + spaces→underscores (e.g. "Auric Ink" → auric_ink.avif).
 *
 * Usage:  node scripts/banner-extractor/process-icons.mjs
 * Env:    ICON_SRC (default: the damage-calc icons dir on D:)
 *         OUT_DIR  (default: public/banner-history/icons)
 */

import sharp from 'sharp';
import { readdir, mkdir, stat } from 'node:fs/promises';
import { basename, extname, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');

const ICON_SRC =
    process.env.ICON_SRC ??
    'D:/shared/claude workplace/ZZZ Damage Calculator/app/data/icons';
const OUT_DIR = process.env.OUT_DIR
    ? resolve(ROOT, process.env.OUT_DIR)
    : resolve(ROOT, 'public/banner-history/icons');

const FOLDERS = ['agents', 'elements', 'specialties', 'rarity'];
const AVIF = { quality: 55, effort: 4 };
const SRC_RE = /\.(png|webp|jpe?g)$/i;

function kb(bytes) {
    return (bytes / 1024).toFixed(1) + ' KB';
}

async function main() {
    let totalIn = 0;
    let totalOut = 0;
    let totalFiles = 0;

    for (const folder of FOLDERS) {
        const srcDir = resolve(ICON_SRC, folder);
        const destDir = resolve(OUT_DIR, folder);
        await mkdir(destDir, { recursive: true });

        let files;
        try {
            files = (await readdir(srcDir)).filter((f) => SRC_RE.test(f));
        } catch (e) {
            console.warn(`! skip ${folder}: ${e.message}`);
            continue;
        }

        let inBytes = 0;
        let outBytes = 0;
        for (const f of files) {
            const inPath = resolve(srcDir, f);
            const outPath = resolve(destDir, basename(f, extname(f)) + '.avif');
            inBytes += (await stat(inPath)).size;
            const info = await sharp(inPath).avif(AVIF).toFile(outPath);
            outBytes += info.size;
        }
        totalIn += inBytes;
        totalOut += outBytes;
        totalFiles += files.length;
        const pct = inBytes ? Math.round((1 - outBytes / inBytes) * 100) : 0;
        console.log(
            `  ${folder.padEnd(11)} ${String(files.length).padStart(3)} icons  ` +
                `${kb(inBytes).padStart(10)} → ${kb(outBytes).padStart(9)}  (−${pct}%)`,
        );
    }

    const pct = totalIn ? Math.round((1 - totalOut / totalIn) * 100) : 0;
    console.log(
        `\n✔ ${totalFiles} icons → ${OUT_DIR}\n  ${kb(totalIn)} → ${kb(totalOut)}  (−${pct}% overall)`,
    );
}

main().catch((e) => {
    console.error('✖ icon processing failed:', e.message);
    process.exit(1);
});
