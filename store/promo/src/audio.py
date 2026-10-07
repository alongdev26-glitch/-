# Synthesizes the promo soundtrack: a 120 BPM jingle plus sound effects synced to promo.html.
import math, random, struct, wave, sys

SR = 44100
DUR = 26.0
N = int(SR * DUR)
L = [0.0] * N
R = [0.0] * N
rnd = random.Random(5)
TAU = 2 * math.pi


def add(t0, samples, gain=1.0, pan=0.0):
    i0 = int(t0 * SR)
    gl, gr = gain * (1 - max(0, pan)), gain * (1 + min(0, pan))
    for j, v in enumerate(samples):
        i = i0 + j
        if 0 <= i < N:
            L[i] += v * gl
            R[i] += v * gr


def env(n, a, d):
    """attack a samples, exponential decay with time constant d samples"""
    return [min(1, j / a) * math.exp(-j / d) if a else math.exp(-j / d) for j in range(n)]


def tone(f, dur, decay, harm=((1, 1),), attack=0.004, vib=0):
    n = int(dur * SR); a = int(attack * SR); d = decay * SR
    out = []
    for j in range(n):
        t = j / SR
        e = min(1, j / a if a else 1) * math.exp(-j / d)
        ph = TAU * f * t + (vib * math.sin(TAU * 5.5 * t) if vib else 0)
        out.append(e * sum(g * math.sin(ph * h) for h, g in harm))
    return out


def noise(dur, decay, attack=0.001, hp=0.0, lp=1.0):
    n = int(dur * SR); a = max(1, int(attack * SR)); d = decay * SR
    out, prev, low = [], 0.0, 0.0
    for j in range(n):
        w = rnd.uniform(-1, 1)
        low += lp * (w - low)              # one-pole low-pass
        v = low - hp * prev                 # crude high-pass
        prev = low
        out.append(v * min(1, j / a) * math.exp(-j / d))
    return out


def sweep(f0, f1, dur, decay):
    n = int(dur * SR); ph = 0; out = []
    for j in range(n):
        k = j / n
        f = f0 * (f1 / f0) ** k
        ph += TAU * f / SR
        out.append(math.sin(ph) * math.exp(-j / (decay * SR)))
    return out


def midi(m):
    return 440 * 2 ** ((m - 69) / 12)


# ---------------- instruments ----------------
def kick(t, g=0.9): add(t, sweep(140, 42, 0.28, 0.09), g)
def clap(t, g=0.32): add(t, noise(0.16, 0.045, hp=0.9, lp=0.6), g)
def hat(t, g=0.12, pan=0.2): add(t, noise(0.05, 0.012, hp=0.98, lp=0.95), g, pan)
def bass(t, m, dur=0.23, g=0.32): add(t, tone(midi(m), dur, 0.18, ((1, 1), (2, 0.35), (3, 0.12)), attack=0.006), g)
def stab(t, ms, g=0.11, pan=0.0):
    for k, m in enumerate(ms):
        add(t, tone(midi(m), 0.22, 0.09, ((1, 1), (2, 0.4), (3, 0.25), (4, 0.1)), attack=0.004), g, pan + (k - 1) * 0.25)
def bell(t, m, g=0.16, pan=0.0): add(t, tone(midi(m), 0.6, 0.22, ((1, 1), (2.01, 0.45), (3.99, 0.15)), attack=0.002), g, pan)
def pad(t, ms, dur, g=0.05):
    for m in ms:
        add(t, tone(midi(m), dur, dur * 0.6, ((1, 1), (2, 0.3)), attack=0.25, vib=0.004), g)

# ---------------- sound effects ----------------
def click(t, g=0.35, pan=0.0): add(t, noise(0.03, 0.006, hp=0.95, lp=0.9), g, pan)
def boom(t, g=1.0):
    add(t, sweep(110, 32, 0.9, 0.3), g)
    add(t, noise(1.0, 0.35, attack=0.002, lp=0.35), 0.45 * g)
def ching(t, g=0.18, pan=0.0):
    add(t, tone(2637, 0.35, 0.08, ((1, 1), (1.5, 0.5))), g, pan)
    add(t + 0.05, tone(3520, 0.45, 0.12, ((1, 1), (1.5, 0.4))), g * 0.9, pan)
def pop(t, f=520, g=0.3, pan=0.0): add(t, sweep(f, f * 2.2, 0.09, 0.04), g, pan)
def whoosh(t_center, g=0.32, dur=0.7):
    n = int(dur * SR); out = []; low = 0; prev = 0
    for j in range(n):
        k = j / n
        lp = 0.05 + 0.5 * math.sin(math.pi * k) ** 2
        w = rnd.uniform(-1, 1); low += lp * (w - low); v = low - 0.6 * prev; prev = low
        out.append(v * math.sin(math.pi * k) ** 2)
    add(t_center - dur / 2, out, g)
def thud(t, g=0.6): add(t, sweep(180, 60, 0.18, 0.06), g); click(t, 0.2)
def swish(t, g=0.25): add(t, noise(0.22, 0.07, attack=0.03, hp=0.7, lp=0.7), g)
def register(t):
    ching(t, 0.22); add(t + 0.02, tone(1568, 0.25, 0.06), 0.08)
def riser(t0, dur, g=0.12):
    n = int(dur * SR); out = []; low = 0
    for j in range(n):
        k = j / n; lp = 0.02 + 0.5 * k
        low += lp * (rnd.uniform(-1, 1) - low)
        out.append(low * k * k)
    add(t0, out, g)

# ---------------- music: starts on the logo slam ----------------
T0 = 1.25
BEAT = 0.5
CHORDS = [(60, 64, 67), (55, 59, 62), (57, 60, 64), (53, 57, 60)]  # C G Am F
ROOTS = [36, 31, 33, 29]
HOOK = [76, 79, 81, 79, 76, 74, 72, 74, 76, 79, 84, 81, 79, None, 76, None]  # 8ths over 2 bars
END = 22.0
bar_count = int((END - T0) / (4 * BEAT)) + 1
for b in range(bar_count):
    bt = T0 + b * 4 * BEAT
    ch = CHORDS[b % 4]; root = ROOTS[b % 4]
    for beat in range(4):
        t = bt + beat * BEAT
        if t >= END - 0.01: break
        kick(t)
        if beat in (1, 3): clap(t)
        hat(t + BEAT / 2, pan=0.3 if beat % 2 else -0.3)
        bass(t, root); bass(t + BEAT / 2, root + (12 if beat % 2 else 0), g=0.22)
        stab(t + BEAT / 2, ch, pan=0.0)
    if b >= 1:  # hook after the first bar
        half = (b - 1) % 2
        for k in range(8):
            m = HOOK[half * 8 + k]
            t = bt + k * BEAT / 2
            if m and t < END - 0.05: bell(t, m, pan=-0.15 if k % 2 else 0.15)

# ---------------- scene effects ----------------
# scene 1: dice bounces, slam, coins, shine
riser(0.0, 1.25, 0.18)
for delay, pan in ((0.0, -0.5), (0.12, 0.5)):
    for k in (0.364, 0.727, 0.909, 1.0):
        click(0.05 + delay + 0.9 * k, 0.45 * (1.1 - k * 0.5), pan)
    for j in range(10):
        click(0.1 + delay + j * 0.06, 0.12, pan)
boom(1.25)
for j in range(9): ching(1.3 + j * 0.06 + rnd.random() * 0.03, 0.09, rnd.uniform(-0.6, 0.6))
bell(1.7, 96, 0.12); bell(1.78, 100, 0.09)
# cuts
for c in (3, 7, 10, 13, 16, 19, 22): whoosh(c)
# scene 2: token hops, buy stamp
for i, h in enumerate((4.0, 4.45, 4.9)): pop(h + 0.33, 500 + i * 120, 0.32)
thud(5.47, 0.7); register(5.52)
# scene 3: houses and hotel, coins to the counter
for i in range(4): pop(7 + 0.55 + i * 0.22 + 0.3, 700 + i * 90, 0.28); click(7 + 0.55 + i * 0.22 + 0.32, 0.25)
thud(8.95, 0.9); boom(8.97, 0.35)
for j in range(10): ching(8.65 + j * 0.08, 0.08, rnd.uniform(-0.5, 0.5))
register(9.7)
# scene 4: cards fan and flip
for j in range(6): click(10.45 + j * 0.05, 0.18)
swish(10.95); bell(11.35, 88, 0.12)
swish(11.55); bell(11.95, 91, 0.12)
# scene 5: flags land, highlight ticks
for i in range(6): pop(13 + 0.1 + i * 0.11 + 0.42, 400 + i * 60, 0.22, (i % 2 - 0.5))
for i in range(6): bell(14.2 + i * 0.28, 84 + [0, 2, 4, 7, 9, 12][i], 0.07)
# scene 6: characters pop in
for i in range(12): pop(16.3 + i * 0.06 + 0.3, 600 + i * 70, 0.16, math.sin(i))
for j in range(5): bell(16.9 + j * 0.4, 96 + (j % 2) * 3, 0.05, (j % 2 - 0.5))
# scene 7: friends connect, +150 badge
for i in range(4): pop(19 + 0.75 + i * 0.12 + 0.2, 450 + i * 110, 0.25, (-0.5, 0.5, -0.5, 0.5)[i])
register(20.62)
for j in range(10): ching(20.7 + j * 0.06, 0.08, rnd.uniform(-0.6, 0.6))
# scene 8: end card
boom(22.08, 0.8)
pad(22.0, (48, 60, 64, 67, 72), 4.0, 0.06)
for k, m in enumerate((72, 76, 79, 84)): bell(22.1 + k * 0.09, m, 0.14)
pop(22.95, 700, 0.3); ching(23.0, 0.12)
for k, m in enumerate((79, 84)): bell(23.5 + k * 0.5, m, 0.08)

# ---------------- master: soft clip, fade out, write ----------------
peak = max(max(abs(v) for v in L), max(abs(v) for v in R))
g = 0.9 / peak * 1.6
fade0 = 24.6
with wave.open(sys.argv[1] if len(sys.argv) > 1 else 'promo.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    frames = bytearray()
    for i in range(N):
        t = i / SR
        f = 1.0 if t < fade0 else max(0.0, 1 - (t - fade0) / (DUR - fade0))
        fi = min(1.0, t / 0.03)
        for v in (L[i], R[i]):
            s = math.tanh(v * g) * f * fi
            frames += struct.pack('<h', int(s * 32000))
    w.writeframes(bytes(frames))
print('peak', round(peak, 2))
