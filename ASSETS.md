# Where every asset comes from

Everything below was made for this project, except the fonts and the
libraries listed in `LICENSE`.

| Asset | Files | Origin |
| --- | --- | --- |
| Logo (menu, store) | `src/assets/logo.webp`, `store/icon-512.png` | Drawn as SVG/HTML in `store/brand-src/logo.html`, rendered with `store/brand-src/shot.mjs` |
| App icons | `public/*-v5.png` | Same source as the logo (`store/brand-src/logo.html`) |
| Share image | `public/og-image-v3.jpg` | `store/brand-src/og.html`, rendered with `store/brand-src/og.mjs` |
| Store feature graphic | `store/feature-graphic-1024x500.png` | Rendered from the same brand sources |
| Store and manifest screenshots | `store/screenshots/`, `public/screenshots/` | Screenshots of this game |
| Board art (train, police officer, car, chest, dice) | `src/ui/*.tsx`, `src/ui/*.css` | Hand-written SVG and CSS in this repo |
| Characters and decorations | `src/data/tokens.ts`, shop items | Emoji, drawn by the player's device font (not bundled) |
| Game sounds | `src/ui/sound.ts` | Synthesized in code with Web Audio; no recordings |
| Promo videos and music | `store/promo/` | Scenes in `store/promo/src/promo.html`; music synthesized by `store/promo/src/audio.py` |
| Fonts | `@fontsource/rubik`, `@fontsource/frank-ruhl-libre`, `store/brand-src/*.woff2` | Rubik and Frank Ruhl Libre, SIL Open Font License 1.1 |
| Board, prices, rents, card texts | `src/data/` | Written for this game; street and city names are real places |
