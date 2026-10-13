import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.goto('http://localhost:8766/og.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
await p.locator('#c').screenshot({ path: process.argv[2], type: 'jpeg', quality: 88 });
await b.close();
