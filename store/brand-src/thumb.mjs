// Renders the promo thumbnails: node thumb.mjs <out-dir>  (serve this folder on :8766 first)
import { chromium } from 'playwright-core';
const out = process.argv[2] || '.';
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
for (const [v, w, h, name] of [['wide', 1280, 720, 'thumbnail-1280x720.jpg'], ['tall', 1080, 1920, 'cover-1080x1920.jpg']]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(`http://localhost:8766/thumb.html?v=${v}`); await p.evaluate(() => window.ready); await p.waitForTimeout(400);
  await p.locator('#c').screenshot({ path: `${out}/${name}`, type: 'jpeg', quality: 90 });
  await p.close();
}
await b.close();
