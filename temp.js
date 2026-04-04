// Run from your Next.js project root:  node measure-images.js
// Requires: Node 18+ (uses built-in fs, path)
// If you have `sharp` installed it uses that, otherwise falls back to reading PNG/JPG headers manually.

const fs = require("fs");
const path = require("path");

const PUBLIC = path.resolve(__dirname, "public");

// Every image src referenced in the CAD page
const srcs = [
    "/solidworks/{91143FAA-45E0-4EB9-A834-E05C1A57D44C}.png",
    "/solidworks/Screenshot 2025-01-01 190433.png",
    "/solidworks/Screenshot 2025-01-14 231204.png",
    "/solidworks/{C9458B6B-8225-4316-9C7E-309683CBDC82}.png",
    "/solidworks/f805624e83623c87c7082c5fd1e75fba.jpg",
    "/solidworks/58a88204ec28a905ad1667fe61e58dbe.jpg",
    "/solidworks/{AE219238-8BB7-4E2D-B0AF-E17E795C96DA}.png",
    "/solidworks/{DE04C1FD-A281-4AEC-9A13-41A03C5B4156}.png",
    "/solidworks/{A7574BBF-A191-48AD-9BEF-CA605A55813A}.png",
    "/solidworks/Screenshot 2025-03-10 134357.png",
    "/solidworks/{7F8C180E-E30A-4F7E-943C-4D3E5082E3C1}.png",
    "/solidworks/{BF2AAED7-2041-4930-A4B5-7F1724DCF4A4}.png",
    "/solidworks/{8B2EC6D4-D0A4-4CB5-9F3B-1B1180A80D9E}.png",
    "/solidworks/{D227BF55-ACFA-44EA-AC0F-70747FB6BB4A}.png",
    "/solidworks/{44F91A73-7658-4898-AE80-4C4A43AF14A0}.png",
    "/solidworks/{C2655D9F-F9C1-43DC-A1BF-22620025D351}.png",
    "/solidworks/rDdZRNT.jpeg",
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