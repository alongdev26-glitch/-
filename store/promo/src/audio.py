# Synthesizes the promo soundtrack: a 120 BPM jingle plus sound effects synced to promo.html.
import math, random, struct, wave, sys

SR = 44100
import json
TL = json.load(open('timeline.json'))
STYLE = sys.argv[2] if len(sys.argv) > 2 else 'pop'
DUR = TL['end'][1]
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

# ---------------- extra instruments ----------------
def pluck(t, m, g=0.2, dur=0.9, pan=0.0, bright=0.5):
    """Karplus-Strong plucked string (oud-like)"""
    f = midi(m); n = int(dur * SR); p = max(2, int(SR / f))
    buf = [rnd.uniform(-1, 1) for _ in range(p)]
    out = []
    for j in range(n):
        v = buf[j % p]
        nxt = buf[(j + 1) % p]
        buf[j % p] = 0.996 * (bright * v + (1 - bright) * nxt) if bright < 1 else 0.996 * 0.5 * (v + nxt)
        out.append(v)
    add(t, out, g, pan)
def saw(t, m, dur, g=0.08, pan=0.0, decay=0.25, detune=0.006):
    f = midi(m); n = int(dur * SR); d = decay * SR; out = []
    for j in range(n):
        tt = j / SR; e = min(1, j / 200) * math.exp(-j / d)
        v = 0
        for det in (1 - detune, 1 + detune):
            v += sum(math.sin(TAU * f * det * tt * h) / h for h in range(1, 7))
        out.append(v * e * 0.5)
    add(t, out, g, pan)
def dum(t, g=0.75): add(t, sweep(160, 70, 0.35, 0.12), g); add(t, noise(0.05, 0.01, lp=0.3), 0.15 * g)
def tek(t, g=0.35, pan=0.15): add(t, noise(0.06, 0.012, hp=0.92, lp=0.8), g, pan); add(t, tone(720, 0.05, 0.012), 0.2 * g, pan)
def ohat(t, g=0.1, pan=0.0): add(t, noise(0.18, 0.05, hp=0.98, lp=0.95), g, pan)
def clang(t, g=0.35):
    for f, a in ((523, 1), (1187, 0.6), (1663, 0.45), (2437, 0.3)): add(t, tone(f, 1.2, 0.35), g * a)
    click(t, 0.4)
def siren(t, dur=0.9, g=0.12):
    n = int(dur * SR); ph = 0; out = []
    for j in range(n):
        k = j / SR; f = 700 if int(k * 6) % 2 == 0 else 950
        ph += TAU * f / SR; out.append((1 if math.sin(ph) > 0 else -1) * 0.5 * math.sin(math.pi * j / n))
    add(t, out, g)
def horn(t, g=0.16):
    for f in (392, 494):
        n = int(0.32 * SR); ph = 0; out = []
        for j in range(n):
            ph += TAU * f / SR; out.append((1 if math.sin(ph) > 0 else -1) * min(1, j / 300) * min(1, (n - j) / 600))
        add(t, out, g * 0.5)
def engine(t, dur=0.9, g=0.25):
    n = int(dur * SR); ph = 0; out = []
    for j in range(n):
        k = j / n; f = 55 + 70 * math.sin(math.pi * k * 0.9)
        ph += TAU * f / SR; v = sum(math.sin(ph * h) / h for h in range(1, 6))
        out.append(v * math.sin(math.pi * k) * 0.6)
    add(t, out, g)

# ---------------- music ----------------
T0 = 1.25                      # the beat drops on the logo slam
END = TL['end'][0]             # the end card gets a final chord
def grid(bpm):
    beat = 60 / bpm; t = T0; i = 0
    while t < END - 0.02:
        yield i, t, beat
        i += 1; t = T0 + i * beat

if STYLE == 'pop':             # bright pop, G major
    CH = [(67, 71, 74), (62, 66, 69), (64, 67, 71), (60, 64, 67)]; RT = [43, 38, 40, 36]
    HOOK = [79, 81, 83, 86, 83, 81, 79, None, 78, 79, 81, 83, 81, None, 79, 74]
    for i, t, b in grid(124):
        bar = i // 4; beat = i % 4; c = CH[bar % 4]; r = RT[bar % 4]
        kick(t)
        if beat in (1, 3): clap(t)
        hat(t + b / 2, pan=0.3 if beat % 2 else -0.3); hat(t + b / 4, g=0.05); hat(t + 3 * b / 4, g=0.05)
        bass(t, r); bass(t + b / 2, r + 12, g=0.2)
        stab(t + b / 2, c, g=0.1)
        if bar >= 1:
            for k in (0, 1):
                m = HOOK[(bar % 2) * 8 + beat * 2 + k]
                if m: bell(t + k * b / 2, m, 0.15, pan=0.15 if k else -0.15)
    FINAL = (55, 67, 71, 74, 79)
elif STYLE == 'party':         # electronic / EDM, A minor
    CH = [(57, 60, 64), (53, 57, 60), (60, 64, 67), (55, 59, 62)]; RT = [33, 29, 36, 31]
    ARP = [0, 1, 2, 1, 0, 2, 1, 2]
    for i, t, b in grid(128):
        bar = i // 4; beat = i % 4; c = CH[bar % 4]; r = RT[bar % 4]
        kick(t, 1.0)
        if beat in (1, 3): clap(t, 0.3)
        ohat(t + b / 2, 0.12, 0.2 if beat % 2 else -0.2)
        bass(t + b / 2, r + 12, dur=0.2, g=0.3); bass(t + 3 * b / 4, r + 12, dur=0.12, g=0.18)
        # pumping pad: chord swells after each kick
        for m in c: add(t + 0.06, tone(midi(m), b - 0.06, b * 0.9, ((1, 1), (2, 0.3), (3, 0.15)), attack=b * 0.6), 0.035)
        if bar >= 2:
            for k in range(2):
                m = c[ARP[(beat * 2 + k) % 8]] + 12
                saw(t + k * b / 2, m, b / 2, g=0.05, pan=0.25 if k else -0.25, decay=0.12)
    FINAL = (45, 57, 60, 64, 69)
else:                          # 'med': Mediterranean, D Hijaz, darbuka maqsum
    SC = [62, 63, 66, 67, 69, 70, 72, 74]
    CH = [(62, 66, 69), (60, 63, 67), (55, 58, 62), (62, 66, 69)]; RT = [38, 36, 31, 38]
    MEL = [7, 6, 5, 4, 5, 4, 2, 1, 2, 3, 4, None, 2, 1, 0, None]
    MAQSUM = {0: 'D', 1: 'T', 3: 'T', 4: 'D', 6: 'T'}   # in 8ths over one bar
    for i, t, b in grid(110):
        bar = i // 4; beat = i % 4; c = CH[bar % 4]; r = RT[bar % 4]
        for k in (0, 1):
            pos = beat * 2 + k; hit = MAQSUM.get(pos)
            tt = t + k * b / 2
            if hit == 'D': dum(tt)
            elif hit == 'T': tek(tt, pan=0.2 if pos % 3 else -0.2)
        tek(t + b / 4, 0.1, -0.3); tek(t + 3 * b / 4, 0.1, 0.3)
        bass(t, r, dur=0.4, g=0.3)
        if beat == 0: pad(t, (c[0] - 12, c[0] - 5), 4 * b, 0.035)
        if bar >= 1:
            for k in (0, 1):
                n = MEL[(bar % 2) * 8 + beat * 2 + k]
                if n is not None: pluck(t + k * b / 2, SC[n], 0.32, dur=0.7, pan=-0.1 if k else 0.1)
            if beat == 3: pluck(t + b / 2 + b / 4, SC[(bar * 3) % 8] - 12, 0.18, dur=0.4)
    FINAL = (50, 62, 66, 69, 74)

# ---------------- scene effects (relative to each scene's start) ----------------
S = {k: v[0] for k, v in TL.items()}
riser(0.0, 1.25, 0.18)
for delay, pan in ((0.0, -0.5), (0.12, 0.5)):
    for k in (0.364, 0.727, 0.909, 1.0):
        click(0.05 + delay + 0.9 * k, 0.45 * (1.1 - k * 0.5), pan)
    for j in range(10):
        click(0.1 + delay + j * 0.06, 0.12, pan)
boom(1.25)
for j in range(9): ching(1.3 + j * 0.06 + rnd.random() * 0.03, 0.09, rnd.uniform(-0.6, 0.6))
bell(1.7, 96, 0.12); bell(1.78, 100, 0.09)
for k, (a, b) in TL.items():
    if a > 0: whoosh(a)
b0 = S['board']
for j in range(8): click(b0 + 0.5 + j * 0.05, 0.2, rnd.uniform(-0.4, 0.4))
for i, h in enumerate((1.0, 1.45, 1.9)): pop(b0 + h + 0.33, 500 + i * 120, 0.32)
thud(b0 + 2.47, 0.7); register(b0 + 2.52)
b0 = S['build']
for i in range(4): pop(b0 + 0.55 + i * 0.22 + 0.3, 700 + i * 90, 0.28); click(b0 + 0.55 + i * 0.22 + 0.32, 0.25)
thud(b0 + 1.95, 0.9); boom(b0 + 1.97, 0.35)
for j in range(10): ching(b0 + 1.65 + j * 0.08, 0.08, rnd.uniform(-0.5, 0.5))
register(b0 + 2.55)
b0 = S['auction']
for i, bt in enumerate((0.75, 1.1, 1.45, 1.8)): pop(b0 + bt, 600 + i * 150, 0.28, (-0.4, 0, 0.4, -0.4)[i])
thud(b0 + 2.2, 1.0); click(b0 + 2.2, 0.6); boom(b0 + 2.22, 0.3); register(b0 + 2.3)
for j in range(8): ching(b0 + 2.3 + j * 0.06, 0.07, rnd.uniform(-0.6, 0.6))
b0 = S['trade']
for i in range(2): pop(b0 + 0.35 + i * 0.1, 500, 0.2, (-0.5, 0.5)[i])
swish(b0 + 0.8, 0.3); swish(b0 + 1.0, 0.25)
pop(b0 + 1.65, 400, 0.35); ching(b0 + 1.85, 0.16)
for j in range(5): bell(b0 + 1.9 + j * 0.07, 88 + j * 2, 0.06)
b0 = S['cards']
for j in range(6): click(b0 + 0.45 + j * 0.05, 0.18)
swish(b0 + 0.95); bell(b0 + 1.35, 88, 0.12)
swish(b0 + 1.55); bell(b0 + 1.95, 91, 0.12)
b0 = S['jail']
siren(b0 + 0.25, 1.0); clang(b0 + 0.62)
swish(b0 + 1.0, 0.25); ching(b0 + 1.25, 0.14); ching(b0 + 1.32, 0.1)   # key card
clang(b0 + 1.35, 0.2); pop(b0 + 1.5, 700, 0.25)
engine(b0 + 1.95, 0.9); horn(b0 + 2.8); pop(b0 + 2.75, 500, 0.2)
b0 = S['langs']
for i in range(6): pop(b0 + 0.1 + i * 0.11 + 0.42, 400 + i * 60, 0.22, (i % 2 - 0.5))
for i in range(6): bell(b0 + 1.2 + i * 0.28, 84 + [0, 2, 4, 7, 9, 12][i], 0.07)
b0 = S['shop']
for i in range(12): pop(b0 + 0.3 + i * 0.06 + 0.3, 600 + i * 70, 0.16, math.sin(i))
pop(b0 + 0.75, 900, 0.25)
for j in range(5): bell(b0 + 0.9 + j * 0.4, 96 + (j % 2) * 3, 0.05, (j % 2 - 0.5))
b0 = S['friends']
pop(b0 + 0.45, 650, 0.2)
for i in range(4): pop(b0 + 0.75 + i * 0.12 + 0.2, 450 + i * 110, 0.25, (-0.5, 0.5, -0.5, 0.5)[i])
register(b0 + 1.62)
for j in range(10): ching(b0 + 1.7 + j * 0.06, 0.08, rnd.uniform(-0.6, 0.6))
b0 = S['end']
boom(b0 + 0.08, 0.8)
pad(b0, FINAL, 4.5, 0.06)
for k, m in enumerate(FINAL[1:]): bell(b0 + 0.1 + k * 0.09, m + 12 if m < 72 else m, 0.13)
pop(b0 + 0.95, 700, 0.3); ching(b0 + 1.0, 0.12)
for i in range(3): pop(b0 + 1.75 + i * 0.25, 800 + i * 100, 0.15)
# ---------------- master: soft clip, fade out, write ----------------
peak = max(max(abs(v) for v in L), max(abs(v) for v in R))
g = 0.9 / peak * 1.6
fade0 = DUR - 1.6
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
