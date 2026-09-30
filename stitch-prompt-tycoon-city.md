# Google Stitch Design Prompt — "TYCOON CITY" (board game, inspired by the reference screenshots)

> How to use: open Google Stitch → choose **Mobile** → set orientation to **Landscape** → paste **Part 1 (Master prompt)** first.
> After the first result, paste each screen prompt from **Part 2** one at a time (Stitch gives better results screen by screen).

---

## PART 1 — MASTER PROMPT (paste first)

Design a premium, polished mobile game UI for an original property-trading board game called **"TYCOON CITY"**. Landscape orientation, 1920×1080 (16:9). The style is a high-end casual board game: bright, glossy, playful but classy — a 3D miniature city living inside a classic board-game board. It must feel like a top-grossing App Store game, not a web app.

**Overall visual style**
- Isometric / slightly tilted 3D look for the board, flat-but-glossy UI on top of it.
- Soft cartoon 3D city: small colorful buildings, green parks with round trees, grey roads with white dashed lines, railway tracks, a turquoise sea with a sandy beach on one side, soft white clouds drifting at the edges of the screen.
- Everything around the UI has soft drop shadows, rounded corners (16–24px), subtle glossy highlights and light bevels.

**Color palette**
- Signature Red (main brand + primary buttons): #E3001B, darker shade for shadows #A50014, highlight #FF3B4E.
- Board surface: pale mint cream #DDF1E4 with thin black grid lines #1A1A1A.
- Background grass green #6DBE45, park green #3F9B3A, sea turquoise #3EC6C9, sand #F2DFA7.
- UI panels: pure white #FFFFFF with light grey tiles #EFEFEF.
- Dark overlays: charcoal #121212 at 70% opacity for modals.
- Accent gold for rewards/premium: #F5B82E → #C98A0B gradient.
- Money text: dark navy #1B1F3B.
- Property color groups: brown #8B4A2B, light blue #AEE0F7, pink #D93A96, orange #F7941D, red #ED1B24, yellow #FEF200, green #1FB25A, dark blue #0072BB.
- Player colors: purple #8E2DE2, green #7ED321, pink #FF2D78, cyan #19D3C5.

**Typography**
- Headlines: heavy bold italic, uppercase, white with a thin dark shadow (like "Montserrat Black Italic" / "Luckiest Guy" feel). Example: "ROLL!", "WIN!".
- UI labels: bold rounded geometric sans, uppercase, small letter-spacing (e.g. "Montserrat ExtraBold").
- Numbers and money: bold, tabular figures, with a custom currency symbol "Ŧ" (an original coin symbol) before the amount, e.g. "Ŧ1500".

**Signature component — the Red Ribbon Banner**
A large red banner in the top-left corner of key screens: bright red #E3001B, a lighter red top edge, a darker red bottom shadow, the right end cut with a sharp arrow/chevron point. Inside, huge white bold italic uppercase text with an exclamation mark ("ROLL!", "STRATEGIZE!", "WIN!"). It overlaps the scene slightly and has a soft shadow below.

**Game tokens**
Shiny silver chrome 3D miniature tokens (cat, race car, scottie dog, T-rex, duck, top hat, horse, dragon). Metallic reflections, soft shadow on the board. Premium tokens are gold. Limited tokens are colorful (rainbow unicorn, fire phoenix, monster truck, red sports car, ice yeti, lava egg).

**Buttons**
- Primary: pill shape, red gradient (#FF3B4E top → #E3001B → #A50014 bottom), white bold uppercase text, 2px darker bottom edge so it looks pressable, soft outer shadow. Example: "START", "SELECT", "PLAY NOW".
- Secondary: black pill #111111 with white uppercase text, e.g. "SHOW MORE STATS".
- Close button: white circle with a thick black "X", black outline, placed on the top-right corner of every modal, half outside the modal edge.

**Player HUD cards (right side of game screens)**
A vertical stack of 4 player cards on the right edge. Each card: a white semicircle/dome holding the silver token 3D image, below it a colored ribbon tag (player color) with the player name in white bold, and below that a white rounded rectangle showing money "Ŧ1500" in navy bold. The active player's ribbon is bigger and points left like an arrow. A small gold medal badge with a level number ("80") sits on the top-right corner of the player's own card.

Keep the whole UI clean, readable, big touch targets (min 48px), consistent spacing on an 8px grid, safe margins of 24px from screen edges.

---

## PART 2 — SCREEN PROMPTS (paste one by one)

### Screen 1 — Main game board ("ROLL!")
Create the main gameplay screen. Top-down, slightly tilted view of a square board game board that fills the center-left of the screen. The board has 40 spaces: 4 large corner squares (START with a big red arrow, JAIL / Just Visiting with an orange square, FREE PARKING, GO TO JAIL) and 9 spaces per side. Property spaces have a colored strip at the top in their color group, tiny uppercase street name and a price like "Ŧ200". Special spaces use icons: a red/pink question mark (Chance), a blue treasure chest (Community Chest), a black train (Station), a light bulb (Electric Company), a water tap (Water Works), a gold ring (Luxury Tax).
Inside the board is a lively miniature 3D city: skyscrapers, a domed city hall, colorful houses, parks, a helipad, roads and a small train line. Outside the board: a train track loop, highways, a beach and turquoise sea on the right, clouds on the edges.
In the center of the screen, two large glossy white dice with black rounded pips in mid-throw, with sparkle stars and a soft glow behind them.
Top-left: the Red Ribbon Banner with "ROLL!". Right side: the 4-player HUD stack (Henry – purple – cat, Mark – green – race car, Sophia – pink – T-rex, Josie – cyan – scottie dog), each with "Ŧ1500".

### Screen 2 — Property card & strategy ("STRATEGIZE!")
Same board view, zoomed slightly out. On the left, two tilted property title-deed cards overlap (the back one partially hidden). The front card: white card with thin black border, a dark blue header block with "SKYLINE AVENUE" in uppercase, then a light blue row "Purchase Price Ŧ400", "Mortgage Value Ŧ200", then a rent list: "Rent Ŧ50", "Rent with color set Ŧ100", "Rent with 1 house Ŧ200" (small green house icon with number), 2 houses Ŧ600, 3 houses Ŧ1400, 4 houses Ŧ1700, "Rent with hotel Ŧ2000" (red hotel icon), and at the bottom "House cost Ŧ200 / Hotel cost Ŧ200".
On the board, a big glossy red hotel lands on a space with white light rays bursting out of it. Several green houses are built on other properties. Player HUD on the right with different amounts (Henry Ŧ568, Mark Ŧ852 – active, Sophia Ŧ10, Josie Ŧ1200). Banner: "STRATEGIZE!".

### Screen 3 — Close-up 3D moment ("IT'S GO TIME")
A cinematic low-angle 3D close-up of the START corner of the board. Mint-colored spaces with printed text, a big bold "GO"-style START label with a long red arrow. Four chrome silver tokens (cat, race car, scottie dog, T-rex) stand together on the corner with realistic reflections and shadows. In the background: 3D buildings (brick houses, a blue-domed building, a water tower, trees), a road with dashed lines on the left, railway tracks on the right. Banner: "IT'S GO TIME" (the word "GO" larger than the rest).

### Screen 4 — Token selection ("CUSTOMIZE!")
A light, premium screen with a very soft white/grey diamond-quilted background pattern. Left 65%: a scrollable grid (3 rows × 5 columns) of rounded square tiles, light grey with soft inner shadow. Each tile shows one 3D token. Silver tokens are free; gold tokens (dragon, horse, wolf) have a gold tile border, a small gold "GET A DEAL!" tag at the top and a small timer "2d 23h" plus a lock icon at the bottom. Colorful premium tokens (monster truck, phoenix, unicorn, ice yeti, lava egg, red sports car) have an orange-red "LIMITED!" ribbon at the bottom-left and a lock icon. The selected tile (race car) has a thick red border. A thin horizontal scroll bar under the grid.
Right 35%: title "SELECT TOKEN" in black bold uppercase, a large rotating preview of the selected token on a soft shadow, and a big red pill "SELECT" button below it. Banner: "CUSTOMIZE!".

### Screen 5 — Player stats modal ("MASTER!")
A blurred, darkened game menu in the background (deep red top area). Centered white modal with rounded corners, a red header strip reading "Tycoon Stats" in white. Inside, a 4×2 grid of light grey rounded stat tiles:
Row 1: "GAMES WON 25", "MOST MONEY Ŧ1550", "MOST USED TOKEN" (silver cat image), "MOST USED DICE" (white dice image).
Row 2: "MOST COLLECTED PROPERTY SET – DARK BLUE – 1" (small dark-blue-topped card icon), "MOST PROFITABLE PROPERTY SET – DARK BLUE – Ŧ980", "HOUSES BUILT 51" (green 3D house icon), "HOTELS BUILT 15" (red 3D hotel icon).
Labels small, black, uppercase; values large and bold. A black pill button "SHOW MORE STATS" at the bottom center. White round close X on the top-right corner. On the right, peeking from behind the modal: an original mascot — an elegant old tycoon gentleman with a white mustache, black top hat, black tuxedo and a cane, 3D cartoon style (original design, not an existing brand character). Banner: "MASTER!".

### Screen 6 — Daily quiz popup ("CHALLENGE!")
Dimmed main menu in the background. Centered modal with a thick white rounded border, inner background a deep blue gradient (#0B3D91 → #1E73E8) with a subtle glowing circuit-lines pattern and white sparkle stars. In the middle, the tycoon mascot holding a red "?" card with a curious smile. Around him, four floating 3D reward items: a silver-and-gold trophy (top-left), a pink milkshake cup (top-right), a wooden auction gavel (bottom-left), a silver piggy bank with green money (bottom-right).
Below: title "Take the Quiz to Find Out!" in white bold, and a small white paragraph: "Are you a Collector? An Auctioneer? A Trophy Tycoon? A Sweet Treat? Take the quiz and find which token suits you best!". A red pill "START" button overlapping the bottom edge of the modal. White round close X on the top-right corner. Banner: "CHALLENGE!".

### Screen 7 — Winner screen ("WIN!")
The full board seen from above, slightly darkened, with purple triangular flags on all the properties owned by the winner. A yellow spotlight beam comes from the top center onto a white round podium holding the winning silver cat token, framed by a purple ribbon.
Across the full width in the middle: a semi-transparent dark navy horizontal band with thin white lines above and below, text "Henry is the winner!" in large white bold.
Below the band, the tycoon mascot throws his arms up while a burst of colorful banknotes (yellow, pink, green, purple, blue) flies around him. Confetti. Banner: "WIN!".

### Screen 8 — Board themes ("EXPLORE!")
Three different themed boards shown side by side as tall tilted panels with thin white separators, each an isometric 3D board:
1) Neon cyber city at night: dark navy board, neon pink/cyan/purple glowing skyscrapers, glowing icons, water around it.
2) Snowy ski resort: white snow board, ski-lift, ski-pass and slope icons, chalets with red roofs, an ice rink, frozen river, pine trees.
3) Luxury night harbor: beige board, golden street lights, a lit casino-style skyline, yachts on dark green sea.
Each board keeps the orange JAIL corner. Banner: "EXPLORE!".

### Screen 9 — Main menu / home
Background: the 3D city board from above, blurred slightly. Top bar: player avatar with level badge, coin balance with gold coin icon and "+" button, gem balance, settings gear. Center: big "TYCOON CITY" logo — white bold italic letters on a red plaque with a gold outline. Big red "PLAY NOW" pill button, below it smaller white buttons "PLAY WITH FRIENDS", "VS COMPUTER". Right side: a gold VIP offer card "Don't miss out on your VIP Offer!". Bottom navigation: 4 square rounded icon buttons with labels — SETTINGS, SOCIAL, SHOP, BOARDS — dark translucent with white icons.

---

## PART 3 — EXTRA INSTRUCTIONS FOR REFINING (use if needed)
- "Make the red ribbon banner bigger and add a stronger chevron cut on its right edge."
- "Make the tokens more metallic and reflective, like polished chrome."
- "Increase contrast of the money numbers; use tabular numbers."
- "Keep the same design system, colors and fonts as the previous screens."
- "Add soft ambient occlusion shadows under all 3D buildings."
