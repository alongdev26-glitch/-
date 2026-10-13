import { chromium } from 'playwright-core';
const [out, q = '', size = '1024', bgTransparent = '1'] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: +size / 1024 });
await p.goto('http://localhost:8766/logo.html?' + q); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
await p.locator('#logo').screenshot({ path: out, omitBackground: bgTransparent === '1' });
await b.close();
