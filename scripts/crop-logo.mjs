/**
 * Crop logo: remove BrandBird watermark, replace dark background with exact #1A1C1F so it blends.
 * Run: node scripts/crop-logo.mjs
 */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, "../public/logo-source.png");
const out = path.join(__dirname, "../public/logo.png");

const APP_BG = { r: 0x1a, g: 0x1c, b: 0x1f }; // #1A1C1F deep-teal-950
const DARK_THRESHOLD = 70; // pixels with R,G,B all below this are treated as background

async function main() {
  const meta = await sharp(src).metadata();
  const w = meta.width || 800;
  const h = meta.height || 400;

  const cropW = w;
  const cropH = h;

  const { data, info } = await sharp(src)
    .extract({ left: 0, top: 0, width: cropW, height: cropH })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r <= DARK_THRESHOLD && g <= DARK_THRESHOLD && b <= DARK_THRESHOLD) {
      data[i] = APP_BG.r;
      data[i + 1] = APP_BG.g;
      data[i + 2] = APP_BG.b;
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels,
    },
  })
    .png()
    .toFile(out);

  console.log("Logo saved to public/logo.png (cropped, background replaced with #1A1C1F)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
