import { useEffect, useRef, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import catObj from '../assets/models/cat.obj?raw';
import { gridPos } from '../data/board';
import { TOKENS } from '../data/tokens';
import type { GameState } from '../engine/types';
import './Board3D.css';

// The live 2D board stays as it is (squares, owners, buttons all keep working); it is tilted with a
// CSS perspective, and a three.js layer drawn with the very same perspective puts real 3D pieces,
// houses and the board's thickness on top of it.

const C = 1.55;
const TOTAL = 2 * C + 9;
const track = (n: number) => (n === 1 ? C / 2 : n === 11 ? TOTAL - C / 2 : C + n - 1.5) / TOTAL;
/** how far past the board the 3D layer reaches, as a share of the board, so tall pieces are not cut */
const M = 0.35;
/** the tilt carries the far corner behind the page, where the browser stops drawing it: lift the board toward the viewer so all of it stays in front */
const lift = (B: number, tilt: number) => ((B / 2) * Math.SQRT2 + 2) * Math.sin((tilt * Math.PI) / 180);
/** shrink it back by as much as the lift made it grow */
const shrink = (B: number, tilt: number) => (B ? (B * 1.6 - lift(B, tilt)) / (B * 1.6) : 1);
/** how close the camera rides: the board fills the view and follows the player whose turn it is */
const ZOOM = 1.85;
/** each die face, in the order three.js paints a box: +x, -x, +y, -y, +z (up), -z */
const FACES = [1, 6, 2, 5, 3, 4];
/** the turn that brings each value to the top */
const FACE_UP: Record<number, [number, number]> = { 3: [0, 0], 4: [Math.PI, 0], 2: [Math.PI / 2, 0], 5: [-Math.PI / 2, 0], 1: [0, -Math.PI / 2], 6: [0, Math.PI / 2] };

interface Props {
  game: GameState;
  shown: number[];
  rolling: boolean;
  children: ReactNode;
}

type Piece = {
  g: THREE.Group;
  at: THREE.Vector3;
  from: THREE.Vector3;
  to: THREE.Vector3;
  t0: number;
};

export default function Stage3D({ game, shown, rolling, children }: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(0);
  const [view, setView] = useState({ tilt: 28, spin: 0 });
  const live = useRef({ game, shown, rolling, view, size });
  live.current = { game, shown, rolling, view, size };

  // the board's size follows the tab's layout
  useEffect(() => {
    const el = stage.current!;
    const ro = new ResizeObserver(() => setSize(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // drag to turn and tilt; a real drag never counts as a tap on a square
  useEffect(() => {
    const el = stage.current!;
    let start: { x: number; y: number; tilt: number; spin: number } | null = null;
    let dragged = false;
    const down = (e: PointerEvent) => {
      start = { x: e.clientX, y: e.clientY, ...live.current.view };
      dragged = false;
    };
    const move = (e: PointerEvent) => {
      if (!start) return;
      const dx = e.clientX - start.x,
        dy = e.clientY - start.y;
      if (!dragged && Math.hypot(dx, dy) < 8) return;
      dragged = true;
      setView({
        tilt: Math.max(0, Math.min(60, start.tilt - dy * 0.3)),
        spin: start.spin - dx * 0.4,
      });
    };
    const up = () => {
      start = null;
    };
    const click = (e: MouseEvent) => {
      if (dragged) {
        e.stopPropagation();
        e.preventDefault();
        dragged = false;
      }
    };
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    el.addEventListener('click', click, true);
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      el.removeEventListener('click', click, true);
    };
  }, []);

  // the three.js layer
  useEffect(() => {
    const cv = canvas.current!;
    const renderer = new THREE.WebGLRenderer({
      canvas: cv,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 1, 20000);
    scene.add(new THREE.HemisphereLight('#fffaf0', '#4a3a2a', 1.1));
    const sun = new THREE.DirectionalLight('#fff3dd', 1.4);
    sun.position.set(-0.6, 0.8, 1);
    scene.add(sun);

    const board = new THREE.Group();
    scene.add(board);
    const unit = new THREE.Group(); // scaled so 1 = the board's width
    board.add(unit);

    // the board's thickness: a slab under it, hidden where the real board covers it
    const mask = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ colorWrite: false }));
    mask.renderOrder = -1;
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(1.03, 1.03, 0.045),
      new THREE.MeshStandardMaterial({ color: '#5a3518', roughness: 0.6 }),
    );
    slab.position.z = -0.0235;
    unit.add(mask, slab);

    // board coordinates (0..1, y down like the page) to the board's plane
    const spot = (id: number) => {
      const [row, col] = gridPos(id);
      return new THREE.Vector3(track(col) - 0.5, 0.5 - track(row), 0);
    };
    /** toward the inner edge of a square, where its color bar is */
    const inward = (id: number, amt: number) => {
      const p = spot(id);
      const side = Math.floor(id / 10) % 4;
      const d = [
        [1, 0],
        [0, -1],
        [-1, 0],
        [0, 1],
      ][side];
      return p.add(new THREE.Vector3(d[0] * amt, d[1] * amt, 0));
    };

    // pieces stand on the board: their "up" is the board's out-of-plane axis
    const stand = (g: THREE.Object3D) => {
      g.rotation.x = Math.PI / 2;
      return g;
    };
    const cell = 1 / TOTAL;
    const shadowTex = (() => {
      const c = document.createElement('canvas');
      c.width = c.height = 64;
      const x = c.getContext('2d')!;
      const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(0,0,0,0.45)');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = gr;
      x.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    })();
    const emojiTex = (e: string) => {
      const c = document.createElement('canvas');
      c.width = c.height = 128;
      const x = c.getContext('2d')!;
      x.font = '96px system-ui, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillText(e, 64, 72);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };
    const catGeo = (() => {
      const obj = new OBJLoader().parse(catObj);
      let geo: THREE.BufferGeometry | null = null;
      obj.traverse((m) => {
        if ((m as THREE.Mesh).isMesh && !geo) geo = (m as THREE.Mesh).geometry;
      });
      const g = (geo as unknown as THREE.BufferGeometry).clone();
      g.computeVertexNormals();
      g.computeBoundingBox();
      const b = g.boundingBox!;
      const k = 1 / (b.max.x - b.min.x);
      g.translate(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2);
      g.scale(k, k, k);
      const pos = g.attributes.position,
        nor = g.attributes.normal,
        col = new Float32Array(pos.count * 3);
      const orange = new THREE.Color('#ff9a26'),
        stripe = new THREE.Color('#d9690f'),
        cream = new THREE.Color('#ffe6c4');
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i),
          y = pos.getY(i),
          ny = nor.getY(i);
        const c = ny < -0.35 || (x > 0.2 && y < 0.34 && y > 0.16) ? cream : Math.sin(x * 38) > 0.75 && ny > 0.2 ? stripe : orange;
        col.set([c.r, c.g, c.b], i * 3);
      }
      g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      return g;
    })();
    const makePiece = (token: string, color: string) => {
      const g = new THREE.Group();
      const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(cell * 0.8, cell * 0.8),
        new THREE.MeshBasicMaterial({
          map: shadowTex,
          transparent: true,
          depthWrite: false,
        }),
      );
      shadow.position.z = 0.001;
      g.add(shadow);
      const up = stand(new THREE.Group());
      g.add(up);
      const r = cell * 0.26;
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(r, r * 1.1, cell * 0.12, 28),
        new THREE.MeshStandardMaterial({ color, roughness: 0.3 }),
      );
      base.position.y = cell * 0.06;
      up.add(base);
      if (token === 'cat') {
        const cat = new THREE.Mesh(
          catGeo,
          new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.38,
          }),
        );
        cat.scale.setScalar(cell * 1.05);
        cat.position.y = cell * 0.12;
        cat.rotation.y = -Math.PI / 2;
        up.add(cat);
      } else {
        const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.3 });
        const pts = [
          [0, 0],
          [0.24, 0],
          [0.2, 0.08],
          [0.11, 0.3],
          [0.09, 0.52],
          [0.16, 0.58],
          [0.09, 0.62],
        ].map(([x, y]) => new THREE.Vector2(x * cell * 0.72, y * cell * 0.72));
        const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 24), mat);
        body.position.y = cell * 0.12;
        up.add(body);
        const em = TOKENS.find((t) => t.id === token)?.emoji ?? '●';
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: emojiTex(em), depthTest: true }));
        sp.scale.setScalar(cell * 0.5);
        sp.position.y = cell * 0.72;
        up.add(sp);
      }
      return g;
    };

    const pieces = new Map<number, Piece>();
    const buildings = new THREE.Group();
    unit.add(buildings);
    const houseMat = new THREE.MeshStandardMaterial({
      color: '#1fa24a',
      roughness: 0.35,
    });
    const hotelMat = new THREE.MeshStandardMaterial({
      color: '#e3001b',
      roughness: 0.35,
    });
    const house = (mat: THREE.Material, w: number, h: number) => {
      const g = stand(new THREE.Group());
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), mat);
      b.position.y = h / 2;
      const r = new THREE.Mesh(new THREE.ConeGeometry(w * 0.78, h * 0.7, 4), mat);
      r.position.y = h * 1.35;
      r.rotation.y = Math.PI / 4;
      g.add(b, r);
      return g;
    };
    let lastHouses = '';
    const syncHouses = (gs: GameState) => {
      const key = gs.props.map((p) => p.houses).join(',');
      if (key === lastHouses) return;
      lastHouses = key;
      buildings.clear();
      gs.props.forEach((p, id) => {
        if (!p.houses) return;
        const side = Math.floor(id / 10) % 4;
        const along = side % 2 === 0 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
        const c = inward(id, cell * 0.42);
        if (p.houses === 5) {
          const h = house(hotelMat, cell * 0.42, cell * 0.3);
          h.position.copy(c);
          buildings.add(h);
          return;
        }
        for (let k = 0; k < p.houses; k++) {
          const h = house(houseMat, cell * 0.2, cell * 0.17);
          h.position.copy(c).addScaledVector(along, (k - (p.houses - 1) / 2) * cell * 0.24);
          buildings.add(h);
        }
      });
    };

    // the dice
    const dieTex = (n: number) => {
      const c = document.createElement('canvas');
      c.width = c.height = 128;
      const x = c.getContext('2d')!;
      x.fillStyle = '#fff';
      x.fillRect(0, 0, 128, 128);
      x.fillStyle = '#1a1a1a';
      const P: Record<number, number[][]> = {
        1: [[64, 64]],
        2: [[34, 34], [94, 94]],
        3: [[30, 30], [64, 64], [98, 98]],
        4: [[34, 34], [94, 34], [34, 94], [94, 94]],
        5: [[30, 30], [98, 30], [64, 64], [30, 98], [98, 98]],
        6: [[34, 28], [94, 28], [34, 64], [94, 64], [34, 100], [94, 100]],
      };
      for (const [a, b] of P[n]) {
        x.beginPath();
        x.arc(a, b, 12, 0, 7);
        x.fill();
      }
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };
    const dieMats = FACES.map((n) => new THREE.MeshStandardMaterial({ map: dieTex(n), roughness: 0.3 }));
    const D = cell * 0.5;
    const dice = [0, 1].map(() => {
      const d = new THREE.Mesh(new THREE.BoxGeometry(D, D, D), dieMats);
      d.visible = false;
      unit.add(d);
      return d;
    });
    let seenRoll = live.current.game.rollSeq;
    let rollT0 = -1e9;
    const spins = [new THREE.Euler(), new THREE.Euler()];
    /** where the dice land: in front of the current player, toward the middle of the board */
    let diceAt = new THREE.Vector3();

    // the camera's aim, eased toward the current player
    const aim = new THREE.Vector2(0, 0);

    let raf = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const { game: gs, shown: at, rolling: isRolling, view: v, size: B } = live.current;
      if (!B) return;
      const W = B * (1 + 2 * M),
        P = B * 1.6;
      if (cv.width !== Math.round(W * renderer.getPixelRatio())) renderer.setSize(W, W, false);
      camera.fov = (2 * Math.atan(W / 2 / P) * 180) / Math.PI;
      camera.aspect = 1;
      camera.position.set(0, 0, P);
      camera.updateProjectionMatrix();
      // follow the current player; keep the board's edges outside the view
      const cur = spot(at[gs.current] ?? 0);
      const k = shrink(B, v.tilt) * ZOOM;
      const room = Math.max(0, 0.5 - 0.22 / k);
      const tx = Math.max(-room, Math.min(room, cur.x)),
        ty = Math.max(-room, Math.min(room, -cur.y));
      aim.x += (tx - aim.x) * 0.08;
      aim.y += (ty - aim.y) * 0.08;
      board.rotation.set((-v.tilt * Math.PI) / 180, 0, (-v.spin * Math.PI) / 180, 'XYZ');
      board.position.z = lift(B, v.tilt);
      board.scale.setScalar(k);
      unit.scale.setScalar(B);
      unit.position.set(-aim.x * B, aim.y * B, 0);
      // the live board under the 3D layer moves with exactly the same transform
      if (tilt.current)
        tilt.current.style.transform = `translateZ(${board.position.z}px) scale3d(${k}, ${k}, ${k}) rotateX(${v.tilt}deg) rotateZ(${v.spin}deg) translate(${-aim.x * B}px, ${-aim.y * B}px)`;

      // dice: thrown on every roll, they tumble while the roll runs and land on its numbers
      if (gs.rollSeq !== seenRoll) {
        seenRoll = gs.rollSeq;
        rollT0 = now;
        diceAt = cur.clone().multiplyScalar(0.62);
        spins.forEach((e) => e.set(Math.random() * 12, Math.random() * 12, Math.random() * 12));
      }
      const dt = (now - rollT0) / 900;
      const show = gs.rollSeq > 0 && (isRolling || dt < 6);
      dice.forEach((d, i) => {
        d.visible = show;
        if (!show) return;
        const e = Math.min(1, Math.max(0, dt));
        const ease = 1 - Math.pow(1 - e, 3);
        const [rx, ry] = FACE_UP[gs.dice[i]] ?? [0, 0];
        const off = (i - 0.5) * D * 1.5;
        d.position.set(diceAt.x + off + (1 - ease) * cell * 2, diceAt.y + (1 - ease) * cell * 2, D / 2 + Math.abs(Math.sin(e * Math.PI * 3)) * (1 - e) * cell * 2);
        const sp = isRolling && dt > 1 ? now / 120 : 0;
        d.rotation.set(rx + spins[i].x * (1 - ease) + sp, ry + spins[i].y * (1 - ease) + sp, spins[i].z * (1 - ease) + i * 0.4, 'XYZ');
      });

      syncHouses(gs);
      const alive = gs.players.filter((p) => !p.bankrupt);
      for (const [id, pc] of pieces) if (!alive.some((p) => p.id === id)) (unit.remove(pc.g), pieces.delete(id));
      for (const p of alive) {
        let pc = pieces.get(p.id);
        if (!pc) {
          const g = makePiece(p.token, p.color);
          const s = spot(at[p.id]);
          pc = { g, at: s.clone(), from: s.clone(), to: s.clone(), t0: 0 };
          pieces.set(p.id, pc);
          unit.add(g);
        }
        const mates = alive.filter((q) => at[q.id] === at[p.id]);
        const k = mates.indexOf(p);
        const target = spot(at[p.id]).add(new THREE.Vector3((k - (mates.length - 1) / 2) * cell * 0.36, 0, 0));
        if (!target.equals(pc.to)) {
          pc.from.copy(pc.at);
          pc.to.copy(target);
          pc.t0 = now;
        }
        const k2 = Math.min(1, (now - pc.t0) / 260);
        pc.at.lerpVectors(pc.from, pc.to, k2);
        pc.g.position.copy(pc.at);
        pc.g.position.z = pc.from.distanceTo(pc.to) > 0.001 ? Math.sin(k2 * Math.PI) * cell * 0.7 : 0;
        // the shadow stays on the board while the piece hops
        pc.g.children[0].position.z = -pc.g.position.z + 0.001;
      }
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      renderer.dispose();
    };
  }, []);

  const P = size * 1.6;
  return (
    <div className="stage3d" ref={stage} style={{ perspective: `${P}px` }}>
      {/* its transform is set every frame, with the 3D layer's */}
      <div className="tilt3d" ref={tilt}>
        {children}
      </div>
      <canvas
        ref={canvas}
        className="layer3d"
        style={{
          left: `${-M * 100}%`,
          top: `${-M * 100}%`,
          width: `${(1 + 2 * M) * 100}%`,
          height: `${(1 + 2 * M) * 100}%`,
        }}
      />
    </div>
  );
}
