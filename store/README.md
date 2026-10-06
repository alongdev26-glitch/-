# ביג דיל: ערכת Google Play

הערכה כוללת:
- `icon-512.png`: אייקון האפליקציה (512×512).
- `feature-graphic-1024x500.png`: הבאנר שבראש דף החנות.
- `screenshots/`: צילומי טלפון בגודל 1080×1920, ארבעה בעברית (`he-*`) וארבעה באנגלית (`en-*`).

מדיניות הפרטיות: https://alongdev26-glitch.github.io/-1/privacy.html

## 1. בניית קובץ האפליקציה (AAB)
1. נכנסים ל-https://www.pwabuilder.com ומדביקים את הכתובת `https://alongdev26-glitch.github.io/-1/`.
2. לוחצים **Package For Stores**, בוחרים **Android** ואז **Generate Package**.
   - Package ID: `io.github.alongdev26glitch.bigdeal`
   - App name: `ביג דיל`
   - Signing key: לבחור **Create new**.
3. מורידים את ה-zip. הוא מכיל:
   - `*.aab`: הקובץ שמעלים לגוגל פליי.
   - `signing.keystore` וקובץ `signing-key-info.txt`: **צריך לשמור אותם במקום בטוח.** בלעדיהם אי אפשר לעדכן את האפליקציה.
   - `assetlinks.json`: שולחים את התוכן שלו ל-Claude. הוא יעלה אותו לכתובת `https://alongdev26-glitch.github.io/.well-known/assetlinks.json`, כדי שהאפליקציה תיפתח בלי שורת כתובת.
   - אם בוחרים ב-Play App Signing (מומלץ): אחרי ההעלאה הראשונה מעתיקים את טביעת האצבע SHA-256 מ-Play Console, מהעמוד Setup → App signing, ומוסיפים אותה ל-`assetlinks.json`.

## 2. דף החנות (Main store listing)
**שם:** ביג דיל: משחק נדל"ן

**תיאור קצר (עד 80 תווים):**
> קונים רחובות, בונים בתים ומלונות ומנצחים חברים! משחק לוח ב-6 שפות 🎲

**תיאור מלא:**
> 🎲 ביג דיל הוא משחק לוח קלאסי של קנייה, בנייה ומסחר בנכסים, בעיצוב צבעוני ומודרני!
>
> 🏙️ קונים רחובות בערים אמיתיות, בונים בתים ומלונות וגובים שכר דירה מהיריבים.
> 🤝 עושים עסקאות והחלפות עם שחקנים אחרים.
> 🃏 קלפי "תיבת המזל" ו"הפתעה" עם הפתעות מקוריות.
> 🤖 משחקים נגד בוטים חכמים, או עם חברים על אותו טלפון או אונליין.
> 🌍 6 שפות, ולכל שפה לוח משלה: ישראל, ארה"ב, האמירויות, צרפת, רוסיה ויפן.
> 🛍️ חנות מתחלפת כל 3 ימים עם דמויות, סקינים ולוחות חדשים.
> 🎁 שתפו לחבר וקבלו 150 מטבעות על כל חבר חדש!
>
> בלי פרסומות, בלי הרשמה, ועובד גם בלי אינטרנט.

**Short description (EN):**
> Buy streets, build hotels and beat your friends! A board game in 6 languages 🎲

**Full description (EN):**
> 🎲 Big Deal is a classic property-trading board game with a bright, modern look!
>
> 🏙️ Buy streets in real cities, build houses and hotels, and collect rent from your rivals.
> 🤝 Make deals and trades with other players.
> 🃏 "Lucky Chest" and "Surprise" cards with original twists.
> 🤖 Play smart bots, pass-and-play with friends, or play online.
> 🌍 6 languages, each with its own board: Israel, USA, UAE, France, Russia and Japan.
> 🛍️ A shop that rotates every 3 days with new characters, skins and boards.
> 🎁 Share with a friend and get 150 coins for every new player!
>
> No ads, no sign-up, and it works offline.

**קטגוריה:** Games → Board · **תגיות:** Board, Casual, Multiplayer

## 3. בטיחות נתונים (Data safety)
- האם האפליקציה אוספת או משתפת נתוני משתמשים? → **כן**, רק מזהה מכשיר.
  - App activity / Device or other IDs → **Device or other IDs**.
  - Collected: כן. Shared: לא. Processed ephemerally: לא. Required: לא (רק כשנכנסים דרך קישור של חבר).
  - מטרה: **App functionality** (זיכוי מטבעות על הזמנת חבר).
  - האם הנתונים מוצפנים בזמן ההעברה? → **כן** (HTTPS).
  - האם אפשר לבקש מחיקה? → **כן** (דרך הקישור במדיניות הפרטיות).
- אין מיקום, אנשי קשר, תמונות, תשלומים או פרסומות.

## 4. דירוג תוכן (Content rating, IARC)
- קטגוריה: **Game**.
- אלימות, מין, שפה גסה, סמים: **לא**.
- הימורים: **לא**. המטבעות במשחק לא קונים בכסף אמיתי ולא פודים לכסף אמיתי. ל"קופת הלוטו" על הלוח אין ערך אמיתי.
- אינטראקציה בין משתמשים: **כן**. במשחק אונליין חברים בחדר רואים את השם שבחרו, ואין צ'אט.
- רכישות בתוך האפליקציה: **לא**.
- הדירוג הצפוי: 3+ / Everyone.

## 5. קהל יעד (Target audience)
- מומלץ לבחור **13+**. אם בוחרים גילאים מתחת ל-13, האפליקציה נכנסת לתוכנית Families, שיש לה דרישות נוספות.
- Ads: **No ads**.
