// Builds each product's photo set so every image shows the SAME bag:
//  - the main photo (cropped to the 4:5 card frame), and
//  - extra colour versions made by recolouring only the bag's pixels (selective hue
//    change — neutral backgrounds, skin and hardware stay as they are), or
//  - a close-up detail crop for single-colour bags.
// Output: public/images/products/<slug>/<n>-<colour>.webp, plus variants.json
// (slug → images[] in the same order as the product's colours).
// Usage: node scripts/product-variants.mjs
import sharp from "sharp";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const W = 1200, H = 1500;
const pub = new URL("../public/", import.meta.url);
const U = (id) => `https://images.unsplash.com/photo-${id}?w=1600&q=85&auto=format&fm=jpg`;

async function load(src) {
  const buf = src.startsWith("http")
    ? Buffer.from(await (await fetch(src)).arrayBuffer())
    : src.startsWith("sources/")
      ? readFileSync(new URL("./" + src, import.meta.url))
      : readFileSync(new URL("." + src, pub));
  // same framing the product card uses (centre crop to 4:5)
  return sharp(buf).rotate().resize(W, H, { fit: "cover", position: "centre" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
}

// ---- colour maths (HSL, 0..1) ----
function rgb2hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
function hsl2rgb(h, s, l) {
  h = ((h % 360) + 360) % 360 / 360;
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const f = (t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
  return [f(h + 1 / 3), f(h), f(h - 1 / 3)].map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255));
}
const inHue = (h, [a, b]) => (a <= b ? h >= a && h <= b : h >= a || h <= b); // supports wrap e.g. [330, 12]
const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

/**
 * Recolour selected pixels.
 * select: { hue:[from,to], minSat } for coloured bags, or { neutral:true, maxSat, minL, maxL } for black/ivory bags
 * to: { hue, sat (absolute) | satMul, lMul, lAdd }
 */
function recolor({ data, info }, select, to) {
  const out = Buffer.from(data);
  for (let i = 0; i < out.length; i += 3) {
    const [h, s, l] = rgb2hsl(data[i], data[i + 1], data[i + 2]);
    let w;
    if (select.neutral) {
      if (s > select.maxSat || l < select.minL || l > select.maxL) continue;
      w = 1 - smooth(select.maxL - 0.06, select.maxL, l); // feather toward the background
    } else {
      if (!inHue(h, select.hue)) continue;
      w = smooth(select.minSat, select.minSat + 0.12, s);
    }
    if (w <= 0) continue;
    const nh = to.hue ?? h;
    const ns = to.sat ?? s * (to.satMul ?? 1);
    const nl = Math.min(1, Math.max(0, l * (to.lMul ?? 1) + (to.lAdd ?? 0)));
    const [r, g, b] = hsl2rgb(nh, ns, nl);
    out[i] = Math.round(data[i] + (r - data[i]) * w);
    out[i + 1] = Math.round(data[i + 1] + (g - data[i + 1]) * w);
    out[i + 2] = Math.round(data[i + 2] + (b - data[i + 2]) * w);
  }
  return { data: out, info };
}

const toWebp = ({ data, info }) => sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } }).webp({ quality: 84 });
const detail = (img, focus = { x: 0.5, y: 0.55 }, zoom = 1.7) => {
  const cw = Math.round(W / zoom), ch = Math.round(H / zoom);
  const left = Math.min(W - cw, Math.max(0, Math.round(W * focus.x - cw / 2)));
  const top = Math.min(H - ch, Math.max(0, Math.round(H * focus.y - ch / 2)));
  return sharp(img.data, { raw: { width: W, height: H, channels: 3 } }).extract({ left, top, width: cw, height: ch }).resize(W, H).sharpen().webp({ quality: 84 });
};

const PINK = [318, 14], YELLOW = [36, 66], GOLD = [30, 60], TEAL = [165, 210];

// slug: source photo + one entry per colour (first = the photo as shot)
const PLAN = {
  "noor-crystal-clutch": { src: "/images/products/gold-bow-clutch.webp", colors: [["Champagne"], ["Silver", { hue: GOLD, minSat: 0.1 }, { sat: 0.03, lMul: 1.06 }]] },
  "gulabi-satin-box-clutch": { src: U("1789110854562-6bff8f621b3b"), colors: [["Rose Pink"], ["Ivory", { hue: PINK, minSat: 0.28 }, { hue: 40, sat: 0.14, lAdd: 0.26 }]] },
  "midnight-envelope-clutch": { src: "sources/black-sequin-clutch.jpg", colors: [["Black"], ["Bronze", { neutral: true, maxSat: 0.3, minL: 0, maxL: 0.5 }, { hue: 28, sat: 0.55, lMul: 1.7, lAdd: 0.05 }]] },
  "zari-heritage-potli": { src: "/images/products/gold-zari-flower-bag.webp", colors: [["Gold"]], detail: { x: 0.5, y: 0.66 } },
  "mehfil-beaded-potli": { src: "/images/insta/pink-tassel-bag.webp", colors: [["Rani Pink"], ["Emerald", { hue: PINK, minSat: 0.25 }, { hue: 158, satMul: 0.85, lMul: 0.78 }], ["Ivory", { hue: PINK, minSat: 0.25 }, { hue: 42, sat: 0.12, lAdd: 0.22 }]] },
  "rouge-top-handle-bag": { src: U("1584917865442-de89df76afd3"), colors: [["Rouge"], ["Black", { hue: [340, 16], minSat: 0.32 }, { sat: 0.04, lMul: 0.24 }]] },
  "ivory-quilted-flap-bag": { src: "/images/products/ivory-pearl-baguette.webp", colors: [["Ivory"], ["Beige", { neutral: true, maxSat: 0.28, minL: 0.3, maxL: 0.95 }, { hue: 36, sat: 0.3, lMul: 0.95 }]] },
  "saffron-mini-tote": { src: U("1640901555383-7335ec5a6476"), colors: [["Saffron"], ["Lilac", { hue: YELLOW, minSat: 0.3 }, { hue: 272, sat: 0.32, lAdd: 0.1 }]] },
  "blush-chevron-crossbody": { src: U("1566150905458-1bf1fc113f0d"), colors: [["Blush"], ["Tan", { hue: PINK, minSat: 0.14 }, { hue: 30, sat: 0.4, lMul: 0.92 }]] },
  "metallic-chain-sling": { src: U("1594223274512-ad4803739b7c"), colors: [["Teal"], ["Graphite", { hue: TEAL, minSat: 0.2 }, { sat: 0.04, lMul: 1.25 }]] },
  // single colour → photo + close-up
  "onyx-shoulder-bag": { src: U("1705909237050-7a7625b47fac"), colors: [["Black"]], detail: { x: 0.5, y: 0.55 } },
  "blush-marble-mini": { src: U("1681747685985-a401c271156c"), colors: [["Blush"]], detail: { x: 0.5, y: 0.52 } },
  "cognac-everyday-purse": { src: U("1598532163257-ae3c6b2524b6"), colors: [["Cognac"]], detail: { x: 0.5, y: 0.58 } },
  "pearl-white-wristlet": { src: "/images/products/pearl-frame-clutch.webp", colors: [["Pearl White"]], detail: { x: 0.5, y: 0.5 } },
};

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const result = {};
for (const [slug, p] of Object.entries(PLAN)) {
  const dir = new URL(`images/products/${slug}/`, pub);
  mkdirSync(dir, { recursive: true });
  const base = await load(p.src);
  const images = [];
  for (const [k, [color, select, to]] of p.colors.entries()) {
    const file = `${k + 1}-${slugify(color)}.webp`;
    const img = select ? recolor(base, select, to) : base;
    await toWebp(img).toFile(new URL(file, dir).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
    images.push(`/images/products/${slug}/${file}`);
  }
  if (p.detail) {
    const file = `${images.length + 1}-detail.webp`;
    await detail(base, p.detail).toFile(new URL(file, dir).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
    images.push(`/images/products/${slug}/${file}`);
  }
  result[slug] = { images, colors: p.colors.map((c) => c[0]) };
  console.log(slug.padEnd(26), images.length, "images", result[slug].colors.join(" / "));
}
writeFileSync(new URL("./variants.json", import.meta.url), JSON.stringify(result, null, 2) + "\n");
