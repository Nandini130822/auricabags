// Turns raw product photos into consistent 4:5 catalogue shots for the product cards.
// The bag is centred on a canvas filled with the photo's own background colour, so nothing gets cropped.
// Usage: node scripts/prep-product-images.mjs <srcDir> <name=file> [<name=file> ...]
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const [srcDir, ...pairs] = process.argv.slice(2);
const out = new URL("../public/images/products/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
mkdirSync(out, { recursive: true });

const W = 1200, H = 1500, PAD = 0.1; // 10% breathing room around the bag

for (const pair of pairs) {
  const [name, file] = pair.split("=");
  const input = sharp(join(srcDir, file)).rotate();
  const { data } = await input.clone().extract({ left: 0, top: 0, width: 4, height: 4 }).raw().toBuffer({ resolveWithObject: true });
  const bg = { r: data[0], g: data[1], b: data[2], alpha: 1 }; // top-left pixel = studio background
  const bag = await input
    .resize({ width: Math.round(W * (1 - 2 * PAD)), height: Math.round(H * (1 - 2 * PAD)), fit: "inside", withoutEnlargement: false })
    .toBuffer();
  await sharp({ create: { width: W, height: H, channels: 4, background: bg } })
    .composite([{ input: bag, gravity: "center" }])
    .flatten({ background: bg })
    .webp({ quality: 86 })
    .toFile(join(out, `${name}.webp`));
  console.log("wrote", `${name}.webp`, "bg", `rgb(${bg.r},${bg.g},${bg.b})`);
}
