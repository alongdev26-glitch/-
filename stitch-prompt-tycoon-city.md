# Google Stitch Design Prompt — Hebrew board, 1:1 with the classic Israeli board

> **איך משתמשים:** ב-Google Stitch בוחרים **Mobile** ומצב **Landscape**.
> 1. מדביקים את **חלק 1** (מערכת העיצוב).
> 2. מדביקים את **חלק 2** (הלוח המדויק, 40 משבצות).
> 3. אחר כך מדביקים את המסכים מ**חלק 3**, אחד בכל פעם.
>
> שמות רחובות שלא הצלחתי לקרוא בוודאות בתמונה מסומנים ב-`[verify]`. מחליפים את השם ומוחקים את הסימון לפני שמדביקים.
> שם המשחק במרכז הלוח הוא "טייקון" כברירת מחדל. אפשר להחליף אותו, אבל "מונופול" והדמות עם הכובע הם סימנים מסחריים של Hasbro: זה בסדר לסקיצה פרטית, לא לאפליקציה שמפרסמים.

---

## PART 1 — DESIGN SYSTEM (paste first)

Design a premium mobile board-game UI in **Hebrew (RTL)**, landscape 1920×1080. The game board must be an **exact 1:1 reproduction of the classic Israeli Hebrew property-trading board** described in Part 2: same 40 spaces, same order, same Hebrew text, same color strips, same icons. Only the rendering is upgraded to a glossy, modern, top-grossing mobile-game look.

**Style:** slightly tilted top-down board, flat and clean like the printed original but crisp and polished. Soft drop shadows, rounded UI corners (16–24px), glossy highlights. Around the board: a 3D cartoon miniature city (colorful buildings, parks with round trees, roads with dashed lines, a train loop, a turquoise sea with sand on one side, soft clouds at the edges).

**Colors:**
- Board surface: pale mint-grey `#CFE3DA` (exactly like the printed board). Space grid lines thin black `#1A1A1A`. Thin dark-blue outer border `#1F3F8F`.
- Brand red: `#E3001B` (shadow `#A50014`, highlight `#FF3B4E`).
- Color strips: brown `#8B3A2B`, light blue `#1E9BD7`, pink `#E0218A`, orange `#F28C1E`, red `#E3001B`, yellow `#F7D117`, green `#1FA24A`, dark blue `#1C4FA0`.
- Jail corner: orange `#F28C1E` square with black bars.
- Gold accent `#F5B82E → #C98A0B`, money text navy `#1B1F3B`, modal overlay `#121212` at 70%.

**Typography:** Hebrew RTL. Bold rounded Hebrew sans (like "Rubik Black" for headlines, "Rubik Bold" for labels, "Assistant" for small print). Currency is always `ש"ח` after the number style: `ש"ח 400`, `מחיר ש"ח 400`.

**Signature red ribbon banner** in the top-right corner (RTL): bright red, lighter top edge, darker bottom shadow, the left end cut into a sharp chevron, huge white bold Hebrew text with an exclamation mark (e.g. "!הטל", "!ניצחון").

**Tokens:** shiny chrome silver 3D miniatures (cat, race car, scottie dog, T-rex, top hat, duck); premium ones gold.

**Buttons:** primary red gradient pill, white bold text, pressable bottom edge. Secondary black pill. Close = white circle with a thick black X on the modal's top-left corner (RTL).

**Player HUD:** a vertical stack of 4 player cards on the **left** edge (RTL): white dome with the silver token, a colored name ribbon (purple / green / pink / cyan), a white box with money "ש"ח 1500". The active player's ribbon is bigger.

---

## PART 2 — THE BOARD, EXACT 1:1 (paste second)

Reproduce this board **exactly**. Do not add, remove, reorder, translate or rename any space. 40 spaces total: 4 large square corners and 9 rectangular spaces on each side. Every space's text is written in Hebrew and is **rotated to face the center of the board** (the top row reads upside-down from the bottom, the side columns read sideways), exactly like a real printed board. Property spaces have a solid color strip on the edge facing the center, with the **city name printed in white inside the strip**, the street name in the middle of the space and "מחיר ש"ח X" at the outer edge.

**Board orientation on screen:** "דרך צלחה" (START) is the **bottom-left** corner. Play moves up the left column, across the top row to the right, down the right column, then along the bottom row back to the left.

### Corners
1. **Bottom-left: "דרך צלחה"** (START). Large diagonal black text "דרך צלחה" with a long red arrow, small text "כל העובר בדרך צלחה מקבל ש"ח 200".
2. **Top-left: "בכלא / רק מבקר"** (Jail / just visiting). An orange square with black bars and a cartoon prisoner inside; the words "בכלא" on the orange square and "רק מבקר" along the two outer white L-shaped edges.
3. **Top-right: "חניה חופשית"** (Free parking). A cartoon red car icon, text "חניה חופשית".
4. **Bottom-right: "גש לכלא"** (Go to jail). A cartoon blue policeman pointing with his finger, text "גש לכלא".

### Left column (from bottom, next to "דרך צלחה", going up to the jail)
1. Brown strip "אילת" [verify], street "רח' התמרים" [verify], "מחיר ש"ח 60"
2. "תיבת המזל" (community chest) with a blue open treasure-chest icon
3. Brown strip "אילת" [verify], street "רח' האלמוגים" [verify], "מחיר ש"ח 60"
4. "מס הכנסה" (income tax), "שלם ש"ח 200"
5. "רכבת דרום" (railway), a black steam-train icon, "מחיר ש"ח 200"
6. Light-blue strip "טבריה", street "רח' הגליל" [verify], "מחיר ש"ח 100"
7. "הפתעה" (chance) with a large pink/magenta question mark "?"
8. Light-blue strip "טבריה", street "רח' הירדן" [verify], "מחיר ש"ח 100"
9. Light-blue strip "טבריה", street "רח' הכנרת" [verify], "מחיר ש"ח 120"

### Top row (from the jail on the left, going right to the free parking)
1. Pink strip "באר-שבע", street "רח' הרצל" [verify], "מחיר ש"ח 140"
2. "חברת החשמל" (electric company) with a yellow glowing light-bulb icon, "מחיר ש"ח 150"
3. Pink strip "באר-שבע", street "רח' רגר" [verify], "מחיר ש"ח 140"
4. Pink strip "באר-שבע", street "שד' רגר" [verify], "מחיר ש"ח 160"
5. "רכבת מרכז" [verify] (railway), black steam-train icon, "מחיר ש"ח 200"
6. Orange strip "נתניה" [verify], street "רח' ויצמן" [verify], "מחיר ש"ח 180"
7. "תיבת המזל" (community chest) with the blue chest icon
8. Orange strip "נתניה" [verify], street "רח' סמילנסקי" [verify], "מחיר ש"ח 180"
9. Orange strip "נתניה" [verify], street "כיכר העצמאות" [verify], "מחיר ש"ח 200"

### Right column (from the free parking at the top, going down to "גש לכלא")
1. Red strip "רמת-גן", street "דרך אבא הלל", "מחיר ש"ח 220"
2. "הפתעה" (chance) with a large **blue** question mark "?"
3. Red strip "רמת-גן", street "רח' ז'בוטינסקי", "מחיר ש"ח 220"
4. Red strip "רמת-גן", street "רח' ביאליק", "מחיר ש"ח 240"
5. "רכבת מזרח" [verify] (railway), black steam-train icon, "מחיר ש"ח 200"
6. Yellow strip "ירושלים", street "רח' יפו", "מחיר ש"ח 260"
7. Yellow strip "ירושלים", street "רח' בן יהודה", "מחיר ש"ח 260"
8. "חברת המים" (water works) with a grey water-tap/pipe icon, "מחיר ש"ח 150"
9. Yellow strip "ירושלים", street "רח' המלך ג'ורג'", "מחיר ש"ח 280"

### Bottom row (from "גש לכלא" on the right, going left to "דרך צלחה")
1. Green strip "חיפה", street "רח' העצמאות", "מחיר ש"ח 300"
2. Green strip "חיפה", street "רח' החלוץ", "מחיר ש"ח 300"
3. "תיבת המזל" (community chest) with the blue chest icon
4. Green strip "חיפה", street "רח' מוריה", "מחיר ש"ח 320"
5. "רכבת צפון" (railway), black steam-train icon, "מחיר ש"ח 200"
6. "הפתעה" (chance) with a large **red** question mark "?"
7. Dark-blue strip "תל-אביב", street "רח' אלנבי", "מחיר ש"ח 350"
8. "מס מותרות" (luxury tax) with a gold diamond-ring icon, "שלם ש"ח 100"
9. Dark-blue strip "תל-אביב", street "רח' דיזנגוף", "מחיר ש"ח 400"

### Board center
- Plain mint-grey surface `#CFE3DA`, no city inside the play area (the 3D city is only around the outside of the board).
- A large **red rounded-rectangle logo plaque** laid **diagonally** from the bottom-right up to the top-left across the center (about 45°), with a thin white inner outline and a darker red edge. Inside it, big white 3D bevelled Hebrew letters: **"טייקון"**. Sitting on top of the middle of the plaque: the elegant old tycoon mascot (white mustache, black top hat, tuxedo, cane) waving.
- Two card-deck places, each a square **dashed-line rectangle rotated 45°**:
  - Upper-right area: labelled **"תיבת המזל"**, with a face-down stack of blue chest cards.
  - Lower-left area: labelled **"הפתעה"**, with a face-down stack of orange "?" cards.
- A small blue logo stamp near the top-left inner corner of the board (tiny, subtle).

---

## PART 3 — SCREENS (paste one at a time; each uses the exact board from Part 2)

### Screen 1 — Main game ("!הטל")
Show the exact board from Part 2 filling the center of the screen, slightly tilted. Four chrome tokens (cat, race car, T-rex, scottie dog) stand on "דרך צלחה". In the middle of the screen, two large glossy white dice with black rounded pips in mid-throw, sparkles and a soft glow. Red ribbon banner top-right: "!הטל". Player HUD on the left: הנרי (purple, cat), מרק (green, race car), סופיה (pink, T-rex), ג'וזי (cyan, scottie dog), each "ש"ח 1500". Bottom center: a big red pill button "הטל קוביות".

### Screen 2 — Property card ("!תכנן")
The same board. On the right side, two tilted title-deed cards overlap. The front card: white with a thin black border, a dark-blue header "רח' דיזנגוף" with "תל-אביב" above it, then rows: "מחיר ש"ח 400", "משכנתא ש"ח 200", "שכר דירה ש"ח 50", "עם כל הצבע ש"ח 100", "עם בית 1 ש"ח 200" (green house icon), "2 בתים ש"ח 600", "3 בתים ש"ח 1400", "4 בתים ש"ח 1700", "עם מלון ש"ח 2000" (red hotel icon), bottom: "מחיר בית ש"ח 200 / מחיר מלון ש"ח 200". Behind it, the "רח' אלנבי" card. On the board: green 3D houses on the Haifa and Jerusalem streets, and a glossy red hotel landing on "רח' דיזנגוף" with white light rays. Two buttons: red "קנה" and black "מכרז". Banner: "!תכנן".

### Screen 3 — 3D close-up ("!יוצאים לדרך")
A cinematic low-angle 3D close-up of the "דרך צלחה" corner with its red arrow, the neighbouring "רח' דיזנגוף" and "אילת" spaces readable in Hebrew. Four chrome tokens on the corner with reflections. Behind the board edge: 3D houses, a blue-domed building, a water tower, a road and railway. Banner: "!יוצאים לדרך".

### Screen 4 — Token selection ("!בחר כלי")
Soft white quilted-diamond background. A 3×5 grid of light grey rounded tiles with 3D tokens; gold tokens have a gold border, a "!מבצע" tag and a timer "2י 23ש" with a lock; colorful tokens have an orange "!מוגבל" ribbon and a lock. The selected race car has a thick red border. On the left: title "בחר כלי", a large preview of the race car, a red "בחר" pill button. Banner: "!בחר כלי".

### Screen 5 — Stats ("!אלוף")
Dimmed background. White modal with a red header "סטטיסטיקות טייקון". A 4×2 grid of grey tiles: "משחקים שניצחת 25", "הכי הרבה כסף ש"ח 1550", "הכלי האהוב" (silver cat), "הקוביות האהובות" (white dice), "הסדרה הנאספת ביותר – תל-אביב – 1" (dark-blue card icon), "הסדרה הרווחית ביותר – תל-אביב – ש"ח 980", "בתים שנבנו 51" (green house), "מלונות שנבנו 15" (red hotel). Black pill button "עוד סטטיסטיקות". Close X top-left. The tycoon mascot peeks from the left. Banner: "!אלוף".

### Screen 6 — Quiz popup ("!אתגר")
Modal with a thick white border and a deep blue gradient with glowing circuit lines and sparkles. The mascot holds a red "?" card, surrounded by a trophy, a pink milkshake, a wooden gavel and a silver piggy bank. Title "!עשה את החידון וגלה", text "אתה אספן? מכרזן? טייקון גביעים? תעשה את החידון וגלה איזה כלי מתאים לך!". Red pill "התחל". Close X. Banner: "!אתגר".

### Screen 7 — Winner ("!ניצחון")
The exact board from above, darkened, with purple triangle flags on every property the winner owns. A yellow spotlight on a white podium with the silver cat token. A full-width dark-navy translucent band with white lines: "!הנרי ניצח". Below it the mascot throwing his arms up in a burst of colorful ש"ח banknotes and confetti. Banner: "!ניצחון".

### Screen 8 — Main menu
The board blurred in the background. Top bar: avatar with a level badge, coin balance with a "+", settings gear. Center: the red diagonal "טייקון" plaque logo with the mascot. A big red "שחק עכשיו" button, and white buttons "שחק עם חברים" and "נגד המחשב". Bottom nav: "הגדרות", "חברים", "חנות", "לוחות".

---

## PART 4 — FIX-UP LINES (if Stitch drifts)
- "Keep the board exactly as in Part 2: same 40 spaces, same order, same Hebrew text. Do not translate to English."
- "Rotate each side's text so it faces the center of the board."
- "The city name must be inside the colored strip, in white."
- "Keep the same design system, colors and fonts as the previous screens."
