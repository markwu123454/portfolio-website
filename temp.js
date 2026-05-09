// Run from your Next.js project root:  node measure-images.js
// Requires: Node 18+ (uses built-in fs, path)
// If you have `sharp` installed it uses that, otherwise falls back to reading PNG/JPG headers manually.

const fs = require("fs");
const path = require("path");

const PUBLIC = path.resolve(__dirname, "public");

// Every image src referenced in the CAD page
const srcs = [
    "/sprocket/belt_with_paddle.png",
    "/sprocket/final_belt_v1_in_h2d.png",
    "/sprocket/final_belt_v1_in_test.png",
    "/sprocket/final_belt_v1n2_on_indexer.png",
    "/sprocket/prototype_indexer_before_paddle.png"
];

function readPngSize(buf) {
    if (buf[0] === 0x89 && buf[1] === 0x50) {
        return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    }
    return null;
}

function readJpgSize(buf) {
    if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
    let off = 2;
    while (off < buf.length - 8) {
        if (buf[off] !== 0xff) break;
        const marker = buf[off + 1];
        if (marker >= 0xc0 && marker <= 0xc3) {
            return { w: buf.readUInt16BE(off + 7), h: buf.readUInt16BE(off + 5) };
        }
        const len = buf.readUInt16BE(off + 2);
        off += 2 + len;
    }
    return null;
}

console.log("\n=== IMAGE DIMENSIONS ===\n");

for (const src of srcs) {
    const full = path.join(PUBLIC, src);
    if (!fs.existsSync(full)) {
        console.log(`MISSING  ${src}`);
        continue;
    }
    const buf = fs.readFileSync(full);
    const ext = path.extname(full).toLowerCase();
    let size = null;
    if (ext === ".png") size = readPngSize(buf);
    else size = readJpgSize(buf);

    if (size) {
        const ratio = (size.w / size.h).toFixed(2);
        console.log(`${size.w}x${size.h}  ratio=${ratio}  ${src}`);
    } else {
        console.log(`UNREADABLE  ${src}`);
    }
}

console.log("\n=== DONE ===\n");