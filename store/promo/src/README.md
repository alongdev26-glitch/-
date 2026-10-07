# Promo video source

- `promo.html`: the animated scenes. `render(t)` draws the frame at time `t`, and `?w=&h=` sets the size.
- `timeline.json`: the scene start and end times, shared by the page and the soundtrack.
- `audio.py`: synthesizes an original soundtrack plus synced sound effects. Run it with `python3 audio.py out.wav <pop|party|med>`.
- `render.mjs`: captures every frame with Playwright and encodes it with ffmpeg (libx264 + AAC).

Next to `promo.html` the page needs the assets it loads: `icon.png` (= public/icon-512-v3.png), `he-*.png` (= store/screenshots), and the Rubik woff2 files. Serve the folder with `python3 -m http.server 8765`, then run:
`node render.mjs 1080 1920 silent.mp4 <ffmpeg> none`, then mux each track with `ffmpeg -i silent.mp4 -i track.wav -c:v copy -c:a aac -shortest out.mp4`.
