# Promo video source

- `promo.html`: the animated scenes. `render(t)` draws the frame at time `t`, and `?w=&h=` sets the size.
- `audio.py`: synthesizes the soundtrack, synced to the scenes. Run it with `python3 audio.py promo.wav`.
- `render.mjs`: captures every frame with Playwright and encodes it with ffmpeg (libx264 + AAC).

Next to `promo.html` the page needs the assets it loads: `icon.png` (= public/icon-512-v3.png), `he-*.png` (= store/screenshots), and the Rubik woff2 files. Serve the folder with `python3 -m http.server 8765`, then run:
`node render.mjs 1080 1920 out.mp4 <ffmpeg> promo.wav`
