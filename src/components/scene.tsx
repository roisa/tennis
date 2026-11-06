import type { Court, Scene as SceneKey } from "@/lib/data/schema";

/**
 * COURTSCAPE "Scene" — original, art-directed placeholder artwork.
 * A perspective-correct tennis court (ITF dimensions) set in a flat, poster-style
 * landscape. Used wherever real photography hasn't been supplied yet.
 */

type Palette = {
  sky: string; sky2?: string; sun: string; far: string; far2?: string; mid: string; ground: string; fg: string;
  water?: string; water2?: string; snow?: string; runoff?: string;
};

const P: Record<SceneKey, Palette> = {
  ocean:    { sky: "#EDE6D4", sun: "#C7E45B", far: "#2D5A63", far2: "#3E727A", water: "#24505A", water2: "#336A73", mid: "#1D3E37", ground: "#1E3B34", fg: "#0F221E" },
  cliff:    { sky: "#F1E3C8", sky2: "#EAD5B0", sun: "#E9864F", far: "#2B5866", water: "#22505E", water2: "#2F6574", mid: "#B79B76", ground: "#22403A", fg: "#12261F" },
  mountain: { sky: "#DCE3DA", sun: "#F1EFE7", far: "#8FA39A", far2: "#6E8A7F", mid: "#3C5E52", ground: "#264A3F", fg: "#152D28" },
  alpine:   { sky: "#DDE7EC", sun: "#FFFFFF", far: "#8EA3B0", far2: "#61798A", snow: "#F7F7F2", mid: "#355848", ground: "#2E5743", fg: "#132A22" },
  jungle:   { sky: "#D8E2C9", sun: "#C7E45B", far: "#6F8F63", far2: "#4C7049", mid: "#2D5238", ground: "#22432E", fg: "#0E2216" },
  city:     { sky: "#E7E3DA", sun: "#C7E45B", far: "#9AA0A3", far2: "#6B7378", mid: "#3A4248", ground: "#2A3136", fg: "#1A1F23" },
  volcano:  { sky: "#EFE2CF", sun: "#E58A55", far: "#5B6B66", far2: "#45534F", water: "#2A5560", water2: "#376873", mid: "#2E4A3E", ground: "#24412F", fg: "#10241A" },
  lagoon:   { sky: "#E4F0EC", sun: "#F7F1D9", far: "#4FA59B", water: "#5DB6AA", water2: "#86CDBF", mid: "#E6DCC3", ground: "#E9E0C8", fg: "#1D3E33", runoff: "#3F7A6B" },
  garden:   { sky: "#ECE9DD", sun: "#C7E45B", far: "#A8B49A", far2: "#7F9372", mid: "#41634A", ground: "#2E5440", fg: "#152D28" },
  zen:      { sky: "#F1EBE1", sun: "#D9573C", far: "#7C8C99", far2: "#5B6B78", snow: "#F7F5EF", mid: "#3F5A4C", ground: "#2F4D3F", fg: "#16271F" },
  terraces: { sky: "#E5E7CF", sun: "#C7E45B", far: "#8DAA6A", far2: "#6F9452", mid: "#4E7A3E", ground: "#3A6233", fg: "#173219" },
};

const SURFACE_COLORS: Record<string, [string, string]> = {
  hard: ["#2F6E86", "#2A5E5A"],
  clay: ["#B9643D", "#A9573A"],
  grass: ["#5F9142", "#4E7D37"],
  artificial_grass: ["#4E8A4B", "#3E7140"],
  carpet: ["#3F6F8A", "#335B70"],
  other: ["#2F6E86", "#2A5E5A"],
};

function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 1600;
const H = 1000;
const f = (n: number) => Math.round(n * 10) / 10;

function ridge(r: () => number, baseY: number, amp: number, steps: number, jag = 1) {
  const pts: string[] = [`M0 ${H}`, `L0 ${f(baseY - r() * amp)}`];
  for (let i = 1; i <= steps; i++) {
    const x = (W / steps) * i;
    const y = baseY - (i % 2 === jag % 2 ? amp * (0.55 + r() * 0.45) : amp * r() * 0.35);
    pts.push(`L${f(x)} ${f(y)}`);
  }
  pts.push(`L${W} ${H}Z`);
  return pts.join(" ");
}

function hills(r: () => number, baseY: number, amp: number, n: number) {
  let d = `M0 ${H} L0 ${f(baseY)}`;
  const step = W / n;
  for (let i = 0; i < n; i++) {
    const x1 = i * step + step / 2;
    const y1 = baseY - amp * (0.4 + r() * 0.6);
    d += ` Q${f(x1)} ${f(y1)} ${f((i + 1) * step)} ${f(baseY - r() * amp * 0.2)}`;
  }
  return `${d} L${W} ${H}Z`;
}

function palm(x: number, y: number, s: number, lean: number, color: string, key: string) {
  const topX = x + lean * s;
  const topY = y - 260 * s;
  const fronds = [-150, -115, -70, -25, 20, 60, 105, 150].map((deg, i) => {
    const a = ((deg - 90) * Math.PI) / 180;
    const len = (120 + (i % 3) * 25) * s;
    const ex = topX + Math.cos(a) * len;
    const ey = topY + Math.sin(a) * len * 0.55 + 50 * s;
    const cx = topX + Math.cos(a) * len * 0.5;
    const cy = topY + Math.sin(a) * len * 0.5 - 25 * s;
    return `M${f(topX)} ${f(topY)} Q${f(cx)} ${f(cy)} ${f(ex)} ${f(ey)} Q${f(cx + 8 * s)} ${f(cy + 18 * s)} ${f(topX)} ${f(topY + 6 * s)}Z`;
  });
  return (
    <g key={key} fill={color}>
      <path d={`M${f(x - 7 * s)} ${f(y)} Q${f(x + lean * s * 0.3)} ${f(y - 140 * s)} ${f(topX - 4 * s)} ${f(topY)} L${f(topX + 4 * s)} ${f(topY)} Q${f(x + lean * s * 0.3 + 10 * s)} ${f(y - 140 * s)} ${f(x + 7 * s)} ${f(y)}Z`} />
      {fronds.map((d, i) => <path key={i} d={d} />)}
    </g>
  );
}

function pine(x: number, y: number, s: number, color: string, key: string) {
  const tiers = [0, 1, 2, 3].map((i) => {
    const w = (70 - i * 13) * s;
    const top = y - (60 + i * 52) * s - 40 * s;
    const base = y - i * 52 * s;
    return `M${f(x - w)} ${f(base)} L${f(x)} ${f(top)} L${f(x + w)} ${f(base)}Z`;
  });
  return <path key={key} d={tiers.join(" ")} fill={color} />;
}

function cypress(x: number, y: number, s: number, color: string, key: string) {
  return <path key={key} d={`M${f(x)} ${f(y - 300 * s)} C${f(x + 34 * s)} ${f(y - 200 * s)} ${f(x + 30 * s)} ${f(y - 40 * s)} ${f(x)} ${f(y)} C${f(x - 30 * s)} ${f(y - 40 * s)} ${f(x - 34 * s)} ${f(y - 200 * s)} ${f(x)} ${f(y - 300 * s)}Z`} fill={color} />;
}

function foliage(x: number, y: number, s: number, color: string, r: () => number, key: string) {
  return (
    <g key={key} fill={color}>
      {Array.from({ length: 7 }, (_, i) => (
        <ellipse key={i} cx={f(x + (r() - 0.5) * 220 * s)} cy={f(y - r() * 160 * s)} rx={f((60 + r() * 70) * s)} ry={f((40 + r() * 50) * s)} />
      ))}
    </g>
  );
}

function Court({ horizon, camX, surface, runoffColor }: { horizon: number; camX: number; surface: string; runoffColor?: string }) {
  const F = 900;
  const camH = 6;
  const z0 = 14;
  const proj = (x: number, z: number): [number, number] => [W / 2 + ((x - camX) * F) / z, horizon + (camH * F) / z];
  const poly = (pts: [number, number][]) => pts.map(([x, z]) => proj(x, z).map(f).join(",")).join(" ");
  const [surf, run] = SURFACE_COLORS[surface] ?? SURFACE_COLORS.hard;
  const hw = 5.485;
  const sw = 4.115;
  const zb = z0 + 23.77;
  const zn = z0 + 11.885;
  const line = (x1: number, z1: number, x2: number, z2: number, k: string) => {
    const [a, b] = proj(x1, z1);
    const [c, d] = proj(x2, z2);
    const w = Math.max(1.6, (0.05 * F) / ((z1 + z2) / 2));
    return <line key={k} x1={f(a)} y1={f(b)} x2={f(c)} y2={f(d)} stroke="#F7F5EE" strokeWidth={f(w)} strokeLinecap="square" />;
  };
  const netH = (1.07 * F) / zn;
  const [nl, ny] = proj(-hw - 0.914, zn);
  const [nr] = proj(hw + 0.914, zn);
  const [pl] = proj(-hw - 0.914, zn);
  return (
    <g>
      <polygon points={poly([[-hw - 4.5, z0 - 6.4], [hw + 4.5, z0 - 6.4], [hw + 4.5, zb + 6.4], [-hw - 4.5, zb + 6.4]])} fill={runoffColor ?? run} />
      <polygon points={poly([[-hw, z0], [hw, z0], [hw, zb], [-hw, zb]])} fill={surf} />
      {line(-hw, z0, hw, z0, "b1")}
      {line(-hw, zb, hw, zb, "b2")}
      {line(-hw, z0, -hw, zb, "d1")}
      {line(hw, z0, hw, zb, "d2")}
      {line(-sw, z0, -sw, zb, "s1")}
      {line(sw, z0, sw, zb, "s2")}
      {line(-sw, zn - 6.4, sw, zn - 6.4, "sv1")}
      {line(-sw, zn + 6.4, sw, zn + 6.4, "sv2")}
      {line(0, zn - 6.4, 0, zn + 6.4, "c")}
      {line(0, z0, 0, z0 - 0.0001 + 0.3, "cm1")}
      {line(0, zb - 0.3, 0, zb, "cm2")}
      <polygon points={`${f(nl)},${f(ny)} ${f(nr)},${f(ny)} ${f(nr)},${f(ny - netH * 0.93)} ${f(nl)},${f(ny - netH)}`} fill="#0E1A17" opacity="0.72" />
      <line x1={f(nl)} y1={f(ny - netH)} x2={f(nr)} y2={f(ny - netH * 0.93)} stroke="#F7F5EE" strokeWidth="3" />
      <rect x={f(pl - 2)} y={f(ny - netH - 2)} width="4" height={f(netH + 2)} fill="#0E1A17" />
      <rect x={f(nr - 2)} y={f(ny - netH * 0.93 - 2)} width="4" height={f(netH * 0.93 + 2)} fill="#0E1A17" />
    </g>
  );
}

export type SceneProps = {
  scene: SceneKey;
  seed?: string;
  surface?: Court["surface"];
  label: string;
  className?: string;
  /** Hide the court (e.g. for destination posters with a wide view). */
  noCourt?: boolean;
};

export function Scene({ scene, seed = scene, surface, label, className, noCourt }: SceneProps) {
  const p = P[scene] ?? P.ocean;
  const r = rng(`${scene}:${seed}`);
  const camX = (r() - 0.5) * 7;
  const horizon = { cliff: 420, ocean: 470, lagoon: 470, volcano: 470, alpine: 520, mountain: 520, zen: 520, jungle: 520, terraces: 500, garden: 540, city: 540 }[scene];
  const sunX = 250 + r() * 1100;
  const sunY = horizon - 120 - r() * 160;
  const surf = surface ?? (scene === "alpine" || scene === "garden" ? "clay" : scene === "lagoon" || scene === "city" ? "hard" : scene === "jungle" || scene === "terraces" ? "artificial_grass" : "hard");
  const groundTop = ["ocean", "cliff", "lagoon", "volcano"].includes(scene) ? horizon + 125 : horizon;

  const layers: React.ReactNode[] = [];
  const fg: React.ReactNode[] = [];

  if (p.water) {
    layers.push(<rect key="w" x="0" y={horizon} width={W} height={H - horizon} fill={p.water} />);
    layers.push(<rect key="w2" x="0" y={horizon} width={W} height="18" fill={p.water2} />);
    for (let i = 0; i < 6; i++) {
      const y = horizon + 30 + i * 16;
      layers.push(<rect key={`wl${i}`} x={f(r() * 1200)} y={y} width={f(80 + r() * 220)} height="3" fill={p.water2} opacity="0.8" />);
    }
  }
  switch (scene) {
    case "ocean":
      layers.push(<path key="hd" d={`M0 ${horizon + 40} Q 220 ${horizon - 30} 420 ${horizon + 30} L 420 ${H} L0 ${H}Z`} fill={p.far} />);
      break;
    case "cliff":
      layers.push(<path key="cl" d={`M${W} ${horizon + 10} L ${W - 260} ${horizon + 30} L ${W - 380} ${groundTop} L${W} ${groundTop}Z`} fill={p.mid} />);
      layers.push(<path key="cl2" d={`M0 ${horizon + 50} L 300 ${horizon + 70} L 420 ${groundTop} L0 ${groundTop}Z`} fill={p.mid} opacity="0.85" />);
      break;
    case "volcano": {
      const vx = 980 + (r() - 0.5) * 300;
      layers.push(<path key="v" d={`M${vx - 520} ${horizon} L ${vx - 70} ${horizon - 300} L ${vx + 60} ${horizon - 300} L ${vx + 560} ${horizon} Z`} fill={p.far} />);
      layers.push(<path key="v2" d={`M${vx - 70} ${horizon - 300} L ${vx - 20} ${horizon - 250} L ${vx + 25} ${horizon - 285} L ${vx + 60} ${horizon - 300}Z`} fill={p.far2} />);
      break;
    }
    case "lagoon":
      layers.push(<rect key="reef" x="0" y={horizon + 60} width={W} height="40" fill={p.water2} />);
      break;
    case "mountain":
      layers.push(<path key="m1" d={ridge(r, horizon - 40, 240, 7)} fill={p.far} />);
      layers.push(<path key="m2" d={hills(r, horizon + 10, 150, 4)} fill={p.far2} />);
      layers.push(<rect key="mist" x="0" y={horizon - 70} width={W} height="40" fill={p.sky} opacity="0.55" />);
      break;
    case "alpine": {
      const peaks = [[120, 300], [420, 160], [700, 260], [980, 110], [1260, 220], [1520, 170]];
      const d = `M0 ${horizon} ` + peaks.map(([x, y]) => `L${x} ${y}`).join(" ") + ` L${W} ${horizon}Z`;
      layers.push(<path key="a1" d={d} fill={p.far} />);
      layers.push(<g key="snow" fill={p.snow}>{peaks.map(([x, y], i) => <path key={i} d={`M${x - 55} ${y + 75} L${x} ${y} L${x + 55} ${y + 75} L${x + 20} ${y + 60} L${x} ${y + 82} L${x - 22} ${y + 58}Z`} />)}</g>);
      layers.push(<path key="a2" d={hills(r, horizon + 5, 120, 5)} fill={p.far2} />);
      break;
    }
    case "jungle":
      layers.push(<path key="j1" d={hills(r, horizon - 20, 200, 3)} fill={p.far} />);
      layers.push(<rect key="mist" x="0" y={horizon - 90} width={W} height="60" fill={p.sky} opacity="0.5" />);
      layers.push(<path key="j2" d={hills(r, horizon + 10, 130, 5)} fill={p.far2} />);
      break;
    case "terraces":
      layers.push(<path key="t1" d={hills(r, horizon - 10, 230, 3)} fill={p.far} />);
      for (let i = 0; i < 4; i++) layers.push(<path key={`tb${i}`} d={hills(r, horizon - 120 + i * 40, 60, 3)} fill="none" stroke={p.far2} strokeWidth="5" opacity="0.7" />);
      layers.push(<path key="t2" d={hills(r, horizon + 10, 90, 4)} fill={p.far2} />);
      break;
    case "city": {
      const blocks: React.ReactNode[] = [];
      let x = 0;
      let i = 0;
      while (x < W) {
        const w = 60 + r() * 120;
        const h = 90 + r() * 280;
        blocks.push(<rect key={i++} x={f(x)} y={f(horizon - h)} width={f(w)} height={f(h + 2)} fill={i % 3 ? p.far : p.far2} />);
        x += w + 8;
      }
      layers.push(<g key="city">{blocks}</g>);
      break;
    }
    case "garden":
      layers.push(<path key="g1" d={hills(r, horizon - 20, 110, 3)} fill={p.far} />);
      layers.push(<rect key="villa" x="980" y={horizon - 120} width="360" height="122" fill="#E9E2D0" />);
      layers.push(<path key="roof" d={`M960 ${horizon - 120} L1160 ${horizon - 190} L1360 ${horizon - 120}Z`} fill={p.far2} />);
      layers.push(<rect key="hedge" x="0" y={horizon - 26} width={W} height="28" fill={p.mid} />);
      break;
    case "zen": {
      layers.push(<path key="fuji" d={`M260 ${horizon} L760 ${horizon - 300} L840 ${horizon - 300} L1340 ${horizon}Z`} fill={p.far} />);
      layers.push(<path key="fs" d={`M690 ${horizon - 258} L760 ${horizon - 300} L840 ${horizon - 300} L910 ${horizon - 258} L860 ${horizon - 238} L820 ${horizon - 262} L780 ${horizon - 236}Z`} fill={p.snow} />);
      layers.push(<path key="z2" d={hills(r, horizon + 5, 80, 6)} fill={p.far2} />);
      break;
    }
  }

  // Ground plane
  layers.push(<rect key="gr" x="0" y={groundTop} width={W} height={H - groundTop} fill={p.ground} />);
  if (scene === "lagoon") layers.push(<rect key="sand" x="0" y={groundTop} width={W} height="22" fill="#F4EEDD" />);

  // Foreground
  if (["ocean", "cliff", "lagoon", "volcano"].includes(scene)) {
    fg.push(palm(140, H + 10, 1.35, 60, p.fg, "p1"), palm(1480, H + 20, 1.5, -70, p.fg, "p2"));
    if (r() > 0.4) fg.push(palm(1330, H + 40, 1.0, -40, p.fg, "p3"));
  } else if (scene === "alpine" || scene === "mountain") {
    fg.push(pine(110, H, 1.6, p.fg, "t1"), pine(250, H + 40, 1.2, p.fg, "t2"), pine(1470, H, 1.7, p.fg, "t3"), pine(1340, H + 50, 1.1, p.fg, "t4"));
  } else if (scene === "jungle" || scene === "terraces") {
    fg.push(foliage(90, H + 60, 1.6, p.fg, r, "f1"), foliage(1520, H + 60, 1.7, p.fg, r, "f2"), palm(1360, H + 30, 1.1, -30, p.fg, "p4"));
  } else if (scene === "garden") {
    fg.push(cypress(120, H, 1.4, p.fg, "c1"), cypress(230, H + 30, 1.1, p.fg, "c2"), cypress(1480, H, 1.5, p.fg, "c3"));
  } else if (scene === "zen") {
    fg.push(pine(130, H + 20, 1.3, p.fg, "z1"), <rect key="torii" x="1380" y={H - 280} width="160" height="16" fill={p.sun} opacity="0.9" />);
  } else if (scene === "city") {
    fg.push(<rect key="fence" x="0" y={H - 170} width={W} height="4" fill="#C9CCCF" opacity="0.4" />);
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label={label} className={className}>
      <rect width={W} height={H} fill={p.sky} />
      {p.sky2 && <rect y={horizon - 160} width={W} height="160" fill={p.sky2} />}
      <circle cx={f(sunX)} cy={f(sunY)} r={scene === "zen" ? 120 : 90} fill={p.sun} />
      {layers}
      {!noCourt && <Court horizon={horizon} camX={camX} surface={surf} runoffColor={p.runoff} />}
      {fg}
    </svg>
  );
}
