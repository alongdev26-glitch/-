import base64, sys
d = sys.argv[1]
def uri(name, mime): return f'data:{mime};base64,' + base64.b64encode(open(f'{d}/{name}', 'rb').read()).decode()
icon = uri('icon.png', 'image/png'); thumb = uri('thumb.jpg', 'image/jpeg')
shots = ''.join(f'<img class="shot" src="{uri(n + ".jpg", "image/jpeg")}" alt="">' for n in ['en-1-menu', 'en-2-board', 'en-3-game', 'en-4-shop'])
html = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Deal City Listing Preview</title>
<style>
:root {{ --bg: #ffffff; --ink: #1f1f1f; --muted: #5f6368; --line: #e3e3e3; --accent: #01875f; --chip: #f1f3f4; }}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{ --bg: #131314; --ink: #e3e3e3; --muted: #9aa0a6; --line: #333537; --accent: #4fd1a1; --chip: #202124; }} }}
:root[data-theme="dark"] {{ --bg: #131314; --ink: #e3e3e3; --muted: #9aa0a6; --line: #333537; --accent: #4fd1a1; --chip: #202124; }}
* {{ box-sizing: border-box; }}
body {{ margin: 0; background: var(--bg); color: var(--ink); font: 15px/1.5 Roboto, system-ui, -apple-system, "Segoe UI", Arial, sans-serif; }}
main {{ max-width: 720px; margin: 0 auto; padding: 16px 16px 48px; }}
.note {{ font-size: 12px; color: var(--muted); background: var(--chip); border-radius: 10px; padding: 8px 12px; margin-bottom: 18px; }}
.head {{ display: flex; gap: 18px; align-items: center; }}
.head img {{ width: 84px; height: 84px; border-radius: 20px; box-shadow: 0 1px 4px rgba(0,0,0,.25); flex: none; }}
h1 {{ margin: 0; font-size: 26px; font-weight: 600; line-height: 1.2; }}
.dev {{ color: var(--accent); font-weight: 600; font-size: 14px; }}
.sub {{ color: var(--muted); font-size: 12px; }}
.stats {{ display: flex; margin: 20px 0; }}
.stats div {{ flex: 1; text-align: center; font-size: 13px; color: var(--muted); border-left: 1px solid var(--line); padding: 0 4px; }}
.stats div:first-child {{ border-left: 0; }}
.stats b {{ display: block; color: var(--ink); font-size: 15px; font-weight: 600; }}
.install {{ display: block; width: 100%; border: 0; border-radius: 10px; background: var(--accent); color: #fff; font: 600 15px/1 inherit; padding: 14px; cursor: pointer; }}
:root[data-theme="dark"] .install {{ color: #062b1e; }}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) .install {{ color: #062b1e; }} }}
.media {{ display: flex; gap: 10px; overflow-x: auto; margin: 22px -16px 0; padding: 0 16px 6px; scroll-snap-type: x mandatory; }}
.media > * {{ scroll-snap-align: start; flex: none; }}
.video {{ position: relative; height: 200px; align-self: center; border-radius: 12px; overflow: hidden; }}
.video img {{ height: 100%; display: block; }}
.video::after {{ content: "▶"; position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); width: 64px; height: 64px; border-radius: 50%; background: rgba(0,0,0,.6); color: #fff; font-size: 26px; display: grid; place-items: center; padding-left: 4px; }}
.shot {{ height: 300px; border-radius: 12px; border: 1px solid var(--line); }}
h2 {{ font-size: 18px; font-weight: 600; margin: 28px 0 8px; display: flex; justify-content: space-between; align-items: center; }}
h2 span {{ color: var(--muted); font-size: 20px; font-weight: 400; }}
p {{ margin: 0 0 10px; }}
.full {{ white-space: pre-line; color: var(--ink); }}
.chips {{ display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }}
.chips span {{ border: 1px solid var(--line); border-radius: 8px; padding: 4px 12px; font-size: 13px; color: var(--muted); }}
.safety {{ border: 1px solid var(--line); border-radius: 12px; padding: 14px 16px; font-size: 14px; }}
.safety div {{ display: flex; gap: 12px; padding: 6px 0; }}
.meta {{ display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px; font-size: 14px; }}
.meta b {{ display: block; font-weight: 600; }}
.meta span {{ color: var(--muted); }}
.lang {{ position: fixed; right: 12px; bottom: 12px; display: flex; gap: 6px; }}
.lang button {{ border: 1px solid var(--line); background: var(--bg); color: var(--ink); border-radius: 999px; padding: 6px 12px; font: inherit; font-size: 13px; cursor: pointer; }}
.lang button.on {{ background: var(--accent); color: #fff; border-color: var(--accent); }}
[dir="rtl"] .stats div {{ border-left: 0; border-right: 1px solid var(--line); }}
[dir="rtl"] .stats div:first-child {{ border-right: 0; }}
</style></head>
<body><main id="m"></main>
<div class="lang"><button data-l="en" class="on">English</button><button data-l="he">עברית</button></div>
<script>
const T = {{
  en: {{ dir: 'ltr', note: 'Preview of the store listing, made from your real listing texts and images. Not the real store.',
    name: 'Deal City', dev: 'alongdev26-glitch', sub: 'Contains no ads · No in-app purchases',
    stats: [['New', 'No reviews yet'], ['Free', 'Price'], ['3+', 'Rated for 3+']], install: 'Install',
    about: 'About this game', short: 'Buy streets, build hotels and beat your friends! A board game in 6 languages 🎲',
    full: `🎲 Deal City is a property-trading board game with a bright, modern look!

🏙️ Buy streets in real cities, build houses and hotels, and collect rent from your rivals.
🤝 Make deals and trades with other players.
🃏 "Lucky Chest" and "Surprise" cards with original twists.
🤖 Play smart bots, pass-and-play with friends, or play online.
🌍 6 languages, each with its own board: Israel, USA, UAE, France, Russia and Japan.
🛍️ A shop that rotates every 3 days with new characters, skins and boards.
🎁 Share with a friend and get 150 coins for every new player!

No ads, no sign-up, and it works offline.`,
    chips: ['Board', 'Casual', 'Multiplayer', 'Offline'],
    safety: 'Data safety', safe: [['🔗', 'No data shared with third parties'], ['🪪', 'Collects a random device ID, only for friend invites'], ['🔒', 'Data is encrypted in transit'], ['🗑️', 'You can request that data be deleted']],
    info: 'App info', meta: [['Category', 'Board'], ['Languages', '6'], ['Offline', 'Yes'], ['Ads', 'None']] }},
  he: {{ dir: 'rtl', note: 'הדמיה של דף החנות, מהטקסטים והתמונות האמיתיים שלך. זה לא החנות עצמה.',
    name: 'דיל סיטי – Deal City', dev: 'alongdev26-glitch', sub: 'ללא פרסומות · ללא רכישות בתוך האפליקציה',
    stats: [['חדש', 'אין עדיין ביקורות'], ['חינם', 'מחיר'], ['3+', 'מתאים לגיל 3+']], install: 'התקנה',
    about: 'מידע על המשחק', short: 'קונים רחובות, בונים בתים ומלונות ומנצחים חברים! משחק לוח ב-6 שפות 🎲',
    full: `🎲 דיל סיטי הוא משחק לוח של קנייה, בנייה ומסחר בנכסים, בעיצוב צבעוני ומודרני!

🏙️ קונים רחובות בערים אמיתיות, בונים בתים ומלונות וגובים שכר דירה מהיריבים.
🤝 עושים עסקאות והחלפות עם שחקנים אחרים.
🃏 קלפי "תיבת המזל" ו"הפתעה" עם הפתעות מקוריות.
🤖 משחקים נגד בוטים חכמים, או עם חברים על אותו טלפון או אונליין.
🌍 6 שפות, ולכל שפה לוח משלה: ישראל, ארה"ב, האמירויות, צרפת, רוסיה ויפן.
🛍️ חנות מתחלפת כל 3 ימים עם דמויות, סקינים ולוחות חדשים.
🎁 שתפו לחבר וקבלו 150 מטבעות על כל חבר חדש!

בלי פרסומות, בלי הרשמה, ועובד גם בלי אינטרנט.`,
    chips: ['לוח', 'קז׳ואל', 'מרובה משתתפים', 'אופליין'],
    safety: 'בטיחות נתונים', safe: [['🔗', 'לא משתפים נתונים עם צד שלישי'], ['🪪', 'אוסף מזהה מכשיר אקראי, רק להזמנת חברים'], ['🔒', 'הנתונים מוצפנים בזמן ההעברה'], ['🗑️', 'אפשר לבקש למחוק את הנתונים']],
    info: 'פרטי האפליקציה', meta: [['קטגוריה', 'לוח'], ['שפות', '6'], ['עובד בלי אינטרנט', 'כן'], ['פרסומות', 'אין']] }},
}};
const ICON = "{icon}", THUMB = "{thumb}", SHOTS = `{shots}`;
function draw(l) {{
  const t = T[l]; document.documentElement.dir = t.dir; document.documentElement.lang = l;
  document.getElementById('m').innerHTML = `
  <div class="note">${{t.note}}</div>
  <div class="head"><img src="${{ICON}}" alt=""><div><h1>${{t.name}}</h1><div class="dev">${{t.dev}}</div><div class="sub">${{t.sub}}</div></div></div>
  <div class="stats">${{t.stats.map(([a, b]) => `<div><b>${{a}}</b>${{b}}</div>`).join('')}}</div>
  <button class="install">${{t.install}}</button>
  <div class="media"><div class="video"><img src="${{THUMB}}" alt=""></div>${{SHOTS}}</div>
  <h2>${{t.about}} <span>${{t.dir === 'rtl' ? '←' : '→'}}</span></h2>
  <p><b>${{t.short}}</b></p><p class="full">${{t.full}}</p>
  <div class="chips">${{t.chips.map((c) => `<span>${{c}}</span>`).join('')}}</div>
  <h2>${{t.safety}}</h2>
  <div class="safety">${{t.safe.map(([i, s]) => `<div><span>${{i}}</span><span>${{s}}</span></div>`).join('')}}</div>
  <h2>${{t.info}}</h2>
  <div class="meta">${{t.meta.map(([a, b]) => `<div><b>${{a}}</b><span>${{b}}</span></div>`).join('')}}</div>`;
  document.querySelectorAll('.lang button').forEach((b) => b.classList.toggle('on', b.dataset.l === l));
}}
document.querySelectorAll('.lang button').forEach((b) => b.onclick = () => draw(b.dataset.l));
draw(new URLSearchParams(location.search).get('lang') || 'en');
</script></body></html>'''
open(sys.argv[2], 'w').write(html)
