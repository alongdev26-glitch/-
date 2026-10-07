// Renders promo.html frame by frame and pipes the frames into ffmpeg with the soundtrack.
import { chromium } from 'playwright-core';
import { spawn } from 'child_process';
const [w, h, out, ffmpeg, wav] = process.argv.slice(2);
const FPS = 30;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto(`http://localhost:8765/promo.html?w=${w}&h=${h}`);
await p.evaluate(() => window.ready); await p.waitForTimeout(300);
const dur = await p.evaluate(() => window.DURATION);
const ff = spawn(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-i', wav,
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-c:a', 'aac', '-b:a', '160k',
  '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const frames = Math.round(dur * FPS);
for (let i = 0; i < frames; i++) {
  await p.evaluate((t) => render(t), i / FPS);
  const buf = await p.screenshot({ type: 'jpeg', quality: 94 });
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  if (i % 150 === 0) console.log(w + 'x' + h, i, '/', frames);
}
ff.stdin.end();
await new Promise((r) => ff.on('close', r));
await b.close();
console.log('done', out);
