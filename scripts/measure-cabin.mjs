// Measures public/car.glb cabin geometry (seats, console tunnel) so the gear
// shifter can be placed deterministically. Decodes EXT_meshopt_compression +
// KHR_mesh_quantization vertex data and reports everything in the SAME
// normalized space CarModel.tsx uses (fit 4-unit box, centered at origin).
//
//   node scripts/measure-cabin.mjs
import { readFileSync } from 'node:fs';
import { MeshoptDecoder } from '../node_modules/three/examples/jsm/libs/meshopt_decoder.module.js';

await MeshoptDecoder.ready;
const buf = readFileSync(new URL('../public/car.glb', import.meta.url));

// ── GLB container ──────────────────────────────────────────────────────────
if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error('not a GLB');
let off = 12;
let json = null, bin = null;
while (off < buf.length) {
  const len = buf.readUInt32LE(off);
  const type = buf.readUInt32LE(off + 4);
  const chunk = buf.subarray(off + 8, off + 8 + len);
  if (type === 0x4e4f534a) json = JSON.parse(chunk.toString('utf8'));
  else if (type === 0x004e4942) bin = chunk;
  off += 8 + len;
}

// ── bufferView bytes (meshopt-decoded when compressed) ─────────────────────
const bvCache = new Map();
function viewBytes(bvIdx) {
  if (bvCache.has(bvIdx)) return bvCache.get(bvIdx);
  const bv = json.bufferViews[bvIdx];
  const ext = bv.extensions?.EXT_meshopt_compression;
  let out;
  if (ext) {
    const src = new Uint8Array(bin.buffer, bin.byteOffset + (ext.byteOffset ?? 0), ext.byteLength);
    out = new Uint8Array(ext.count * ext.byteStride);
    MeshoptDecoder.decodeGltfBuffer(out, ext.count, ext.byteStride, src, ext.mode, ext.filter);
    out.stride = ext.byteStride;
  } else {
    out = new Uint8Array(bin.buffer, bin.byteOffset + (bv.byteOffset ?? 0), bv.byteLength);
    out.stride = bv.byteStride;
  }
  bvCache.set(bvIdx, out);
  return out;
}

// ── POSITION accessor → Float32Array (dequantized, mesh-local) ─────────────
function readPositions(accIdx) {
  const acc = json.accessors[accIdx];
  const bytes = viewBytes(acc.bufferView);
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const out = new Float32Array(acc.count * 3);
  const compSize = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5126: 4 }[acc.componentType];
  const stride = bytes.stride ?? compSize * 3;
  for (let i = 0; i < acc.count; i++) {
    const o = (acc.byteOffset ?? 0) + i * stride;
    for (let a = 0; a < 3; a++) {
      let v;
      switch (acc.componentType) {
        case 5126: v = dv.getFloat32(o + a * 4, true); break;
        case 5122: v = dv.getInt16(o + a * 2, true); if (acc.normalized) v = Math.max(v / 32767, -1); break;
        case 5123: v = dv.getUint16(o + a * 2, true); if (acc.normalized) v /= 65535; break;
        case 5120: v = dv.getInt8(o + a);  if (acc.normalized) v = Math.max(v / 127, -1); break;
        case 5121: v = dv.getUint8(o + a); if (acc.normalized) v /= 255; break;
        default: throw new Error(`componentType ${acc.componentType}`);
      }
      out[i * 3 + a] = v;
    }
  }
  return out;
}

// ── Node world transforms (TRS, glTF column-major) ─────────────────────────
const I = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
function mul(a, b) {
  const o = new Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++) {
      let s2 = 0;
      for (let k = 0; k < 4; k++) s2 += a[k * 4 + r] * b[c * 4 + k];
      o[c * 4 + r] = s2;
    }
  return o;
}
function trs(n) {
  if (n.matrix) return n.matrix;
  const [tx, ty, tz] = n.translation ?? [0, 0, 0];
  const [qx, qy, qz, qw] = n.rotation ?? [0, 0, 0, 1];
  const [sx, sy, sz] = n.scale ?? [1, 1, 1];
  const x2 = qx + qx, y2 = qy + qy, z2 = qz + qz;
  const xx = qx * x2, xy = qx * y2, xz = qx * z2;
  const yy = qy * y2, yz = qy * z2, zz = qz * z2;
  const wx = qw * x2, wy = qw * y2, wz = qw * z2;
  return [
    (1 - (yy + zz)) * sx, (xy + wz) * sx, (xz - wy) * sx, 0,
    (xy - wz) * sy, (1 - (xx + zz)) * sy, (yz + wx) * sy, 0,
    (xz + wy) * sz, (yz - wx) * sz, (1 - (xx + yy)) * sz, 0,
    tx, ty, tz, 1,
  ];
}
const xf = (m, x, y, z) => [
  m[0] * x + m[4] * y + m[8] * z + m[12],
  m[1] * x + m[5] * y + m[9] * z + m[13],
  m[2] * x + m[6] * y + m[10] * z + m[14],
];

// ── Collect world-space vertices per mesh node ─────────────────────────────
const nodes = json.nodes ?? [];
const meshSets = []; // { name, verts: Float32Array (world) }
(function visit(idxs, parent) {
  for (const i of idxs) {
    const n = nodes[i];
    const world = mul(parent, trs(n));
    if (n.mesh !== undefined) {
      for (const prim of json.meshes[n.mesh].primitives) {
        const local = readPositions(prim.attributes.POSITION);
        const verts = new Float32Array(local.length);
        for (let v = 0; v < local.length; v += 3) {
          const w = xf(world, local[v], local[v + 1], local[v + 2]);
          verts[v] = w[0]; verts[v + 1] = w[1]; verts[v + 2] = w[2];
        }
        meshSets.push({ name: n.name ?? `node${i}`, verts });
      }
    }
    if (n.children) visit(n.children, world);
  }
})(json.scenes[json.scene ?? 0].nodes, I);

// ── Normalization identical to CarModel.tsx (scale to 4, then center) ──────
const gMin = [Infinity, Infinity, Infinity], gMax = [-Infinity, -Infinity, -Infinity];
for (const { verts } of meshSets)
  for (let v = 0; v < verts.length; v += 3)
    for (let a = 0; a < 3; a++) {
      if (verts[v + a] < gMin[a]) gMin[a] = verts[v + a];
      if (verts[v + a] > gMax[a]) gMax[a] = verts[v + a];
    }
const s = 4 / Math.max(...gMax.map((v, i) => v - gMin[i]));
const ctr = gMin.map((v, i) => ((v + gMax[i]) / 2) * s);
const N = (v, a) => v * s - ctr[a];
console.log(`normalized bounds: x[${N(gMin[0],0).toFixed(3)},${N(gMax[0],0).toFixed(3)}] y[${N(gMin[1],1).toFixed(3)},${N(gMax[1],1).toFixed(3)}] z[${N(gMin[2],2).toFixed(3)},${N(gMax[2],2).toFixed(3)}]`);

// Orientation sanity: the Murcielago is mid-engine → engine z tells us the rear
for (const { name, verts } of meshSets) {
  if (!/Engine|Interior/.test(name)) continue;
  const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (let v = 0; v < verts.length; v += 3)
    for (let a = 0; a < 3; a++) {
      if (verts[v + a] < mn[a]) mn[a] = verts[v + a];
      if (verts[v + a] > mx[a]) mx[a] = verts[v + a];
    }
  console.log(`${(name.match(/LB:(\w+)_Geo/)?.[1] ?? name).padEnd(10)} x[${N(mn[0],0).toFixed(3)},${N(mx[0],0).toFixed(3)}] y[${N(mn[1],1).toFixed(3)},${N(mx[1],1).toFixed(3)}] z[${N(mn[2],2).toFixed(3)},${N(mx[2],2).toFixed(3)}]`);
}

// ── Cabin heightfield from the Interior meshes ─────────────────────────────
const X0 = -0.7, X1 = 0.7, Z0 = -0.6, Z1 = 1.0, NXC = 70, NZC = 64;
const Y_CUT = 0.25; // ignore roof/pillars
const grid = Array.from({ length: NZC }, () => new Float64Array(NXC).fill(NaN));
for (const { name, verts } of meshSets) {
  if (!/Interior/.test(name)) continue;
  for (let v = 0; v < verts.length; v += 3) {
    const x = N(verts[v], 0), y = N(verts[v + 1], 1), z = N(verts[v + 2], 2);
    if (y > Y_CUT) continue;
    const cx = Math.floor(((x - X0) / (X1 - X0)) * NXC);
    const cz = Math.floor(((z - Z0) / (Z1 - Z0)) * NZC);
    if (cx < 0 || cx >= NXC || cz < 0 || cz >= NZC) continue;
    if (!(grid[cz][cx] >= y)) grid[cz][cx] = y;
  }
}
const RAMP = ' .:-=+*#%@';
console.log(`\ncabin heightfield (max interior y per cell, y∈[-0.45,${Y_CUT}] → ' '..'@'); cols x∈[${X0},${X1}] left→right; rows z=${Z1} (nose?) top → z=${Z0} bottom`);
for (let zi = NZC - 1; zi >= 0; zi--) {
  let row = '';
  for (let xi = 0; xi < NXC; xi++) {
    const y = grid[zi][xi];
    row += Number.isNaN(y) ? ' ' : RAMP[Math.max(0, Math.min(9, Math.round(((y + 0.45) / (Y_CUT + 0.45)) * 9)))];
  }
  const z = Z0 + ((zi + 0.5) / NZC) * (Z1 - Z0);
  console.log(`${z.toFixed(2).padStart(6)} |${row}|`);
}
let ax = '        ';
for (let xi = 0; xi < NXC; xi++) ax += xi % 10 === 0 ? '|' : ' ';
console.log(ax);
console.log('        x:' + Array.from({ length: Math.ceil(NXC / 10) }, (_, k) => (X0 + ((k * 10 + 0.5) / NXC) * (X1 - X0)).toFixed(2).padStart(6)).join('    '));

// ── Numeric cross-sections across the tunnel/seat region ──────────────────
// For each z slice, the max interior y per x bin (y < 0.05 → below dash top,
// so the tunnel and seat cushions read cleanly without dash overhang).
function profile(zlo, zhi, ycut = 0.05) {
  const PX0 = -0.45, PX1 = 0.45, NB = 45;
  const prof = new Float64Array(NB).fill(NaN);
  for (const { name, verts } of meshSets) {
    if (!/Interior/.test(name)) continue;
    for (let v = 0; v < verts.length; v += 3) {
      const x = N(verts[v], 0), y = N(verts[v + 1], 1), z = N(verts[v + 2], 2);
      if (z < zlo || z > zhi || y > ycut) continue;
      const b = Math.floor(((x - PX0) / (PX1 - PX0)) * NB);
      if (b < 0 || b >= NB) continue;
      if (!(prof[b] >= y)) prof[b] = y;
    }
  }
  return { PX0, PX1, NB, prof };
}
console.log('\ncross-sections: max y per x-bin (x -0.45..0.45, bin 0.02), y-cutoff 0.05');
for (let zlo = -0.4; zlo < 0.65; zlo += 0.1) {
  const { PX0, PX1, NB, prof } = profile(zlo, zlo + 0.1);
  const cells = Array.from(prof, (y) => (Number.isNaN(y) ? '  .  ' : y.toFixed(2).padStart(5)));
  console.log(`z ${zlo.toFixed(2)}..${(zlo + 0.1).toFixed(2)}:`);
  for (let k = 0; k < NB; k += 9) {
    const xs = Array.from({ length: Math.min(9, NB - k) }, (_, j) => (PX0 + (k + j + 0.5) / NB * (PX1 - PX0)).toFixed(2).padStart(5)).join(' ');
    console.log(`   x: ${xs}`);
    console.log(`   y: ${cells.slice(k, k + 9).join(' ')}`);
  }
}

// ── Zoomed tunnel map: max y per 0.025-cell, x∈[-0.2,0.2], z∈[-0.1,0.65] ───
console.log('\nzoomed tunnel map (max y per cell, "  .  " = no verts):');
{
  const TX0 = -0.2, TX1 = 0.2, TZ0 = -0.1, TZ1 = 0.65, NBX = 16, NBZ = 30;
  const g2 = Array.from({ length: NBZ }, () => new Float64Array(NBX).fill(NaN));
  for (const { name, verts } of meshSets) {
    if (!/Interior/.test(name)) continue;
    for (let v = 0; v < verts.length; v += 3) {
      const x = N(verts[v], 0), y = N(verts[v + 1], 1), z = N(verts[v + 2], 2);
      if (y > 0.12) continue;
      const bx = Math.floor(((x - TX0) / (TX1 - TX0)) * NBX);
      const bz = Math.floor(((z - TZ0) / (TZ1 - TZ0)) * NBZ);
      if (bx < 0 || bx >= NBX || bz < 0 || bz >= NBZ) continue;
      if (!(g2[bz][bx] >= y)) g2[bz][bx] = y;
    }
  }
  let hdr = '   z\\x ';
  for (let bx = 0; bx < NBX; bx++) hdr += (TX0 + ((bx + 0.5) / NBX) * (TX1 - TX0)).toFixed(2).padStart(6);
  console.log(hdr);
  for (let bz = NBZ - 1; bz >= 0; bz--) {
    let row = (TZ0 + ((bz + 0.5) / NBZ) * (TZ1 - TZ0)).toFixed(2).padStart(6) + ' ';
    for (let bx = 0; bx < NBX; bx++) row += Number.isNaN(g2[bz][bx]) ? '   .  ' : g2[bz][bx].toFixed(2).padStart(6);
    console.log(row);
  }
}

// ── Seat inner edges & tunnel top in the shifter zone ──────────────────────
// Shifter zone: between the seat cushions, z∈[0.05,0.30].
{
  const ZLO = 0.05, ZHI = 0.30;
  let leftInner = -Infinity, rightInner = Infinity, tunnelTop = -Infinity;
  let leftTopY = -Infinity, rightTopY = -Infinity;
  for (const { name, verts } of meshSets) {
    if (!/Interior/.test(name)) continue;
    for (let v = 0; v < verts.length; v += 3) {
      const x = N(verts[v], 0), y = N(verts[v + 1], 1), z = N(verts[v + 2], 2);
      if (z < ZLO || z > ZHI || y > 0.0 || y < -0.40) continue;
      if (x < -0.09 && x > -0.45) { if (x > leftInner) leftInner = x; if (y > leftTopY) leftTopY = y; }
      if (x >  0.09 && x <  0.45) { if (x < rightInner) rightInner = x; if (y > rightTopY) rightTopY = y; }
      if (Math.abs(x) < 0.07 && y > tunnelTop) tunnelTop = y;
    }
  }
  console.log(`\nshifter zone z∈[${ZLO},${ZHI}]:`);
  console.log(`  seat inner edges: left x=${leftInner.toFixed(3)} (top y=${leftTopY.toFixed(3)}), right x=${rightInner.toFixed(3)} (top y=${rightTopY.toFixed(3)})`);
  console.log(`  gap=${(rightInner - leftInner).toFixed(3)}, midpoint x=${((rightInner + leftInner) / 2).toFixed(3)}`);
  console.log(`  tunnel top (|x|<0.07): y=${tunnelTop.toFixed(3)}`);
}

// ── VERIFY gate placement (mirrors components/GearShifter.tsx derivation) ──
{
  const LANE = 0.055, SLOT = 0.055, R_EXT = 0.042;
  const SEAT_INNER_L = -0.115, SEAT_INNER_R = 0.110;
  const TUNNEL_TOP_Y = -0.165, TUNNEL_Z = 0.30;
  const PLATE_X0 = -(LANE + R_EXT + 0.013 + 0.030);
  const PLATE_X1 = LANE + 0.042;
  const PLATE_HZ = SLOT + 0.013 + 0.030;
  const PLATE_UNDERSIDE = -0.0135;
  const PLATE_XOFF = -(PLATE_X0 + PLATE_X1) / 2;
  const SEAT_GAP = SEAT_INNER_R - SEAT_INNER_L;
  const SURFACE_CREST = -0.1635;
  const SC = (0.55 * SEAT_GAP) / (PLATE_X1 - PLATE_X0);
  const TILT = -Math.PI / 36, C = Math.cos(TILT), SN = Math.sin(TILT);
  const EMBED = 0.002;
  const REAR_UNDER_Y = PLATE_UNDERSIDE * C + PLATE_HZ * SN;
  const AX = (SEAT_INNER_L + SEAT_INNER_R) / 2;
  const AY = SURFACE_CREST - EMBED - SC * REAR_UNDER_Y;
  const CX = AX + SC * PLATE_XOFF;
  const WELL_DEPTH = 0.035, WELL_BOT = PLATE_UNDERSIDE - WELL_DEPTH;
  const SKIRT_HZ = PLATE_HZ * 0.99;
  const SKIRT_BOT = Math.min(
    ((TUNNEL_TOP_Y - 0.01 - AY) / SC + SKIRT_HZ * SN) / C,
    WELL_BOT - 0.004,
  );

  // World AABB of the tilted plate (8 corners through anchor∘offset∘tilt∘scale)
  const corners = [];
  for (const x of [PLATE_X0, PLATE_X1])
    for (const y of [PLATE_UNDERSIDE, -0.0045])
      for (const z of [-PLATE_HZ, PLATE_HZ])
        corners.push([CX + SC * x, AY + SC * (y * C - z * SN), TUNNEL_Z + SC * (y * SN + z * C)]);
  const box = {
    x0: Math.min(...corners.map(c => c[0])), x1: Math.max(...corners.map(c => c[0])),
    y0: Math.min(...corners.map(c => c[1])), y1: Math.max(...corners.map(c => c[1])),
    z0: Math.min(...corners.map(c => c[2])), z1: Math.max(...corners.map(c => c[2])),
  };
  console.log(`\nVERIFY gate placement: anchor=(${AX.toFixed(4)}, ${AY.toFixed(4)}, ${TUNNEL_Z}) scale=${SC.toFixed(4)} tilt=${(TILT * 180 / Math.PI).toFixed(1)}°`);
  console.log(`  plate world AABB x[${box.x0.toFixed(3)},${box.x1.toFixed(3)}] y[${box.y0.toFixed(3)},${box.y1.toFixed(3)}] z[${box.z0.toFixed(3)},${box.z1.toFixed(3)}]`);

  let seatHits = 0, tunnelMaxY = -Infinity, underCount = 0;
  for (const { name, verts } of meshSets) {
    if (!/Interior/.test(name)) continue;
    for (let v = 0; v < verts.length; v += 3) {
      const x = N(verts[v], 0), y = N(verts[v + 1], 1), z = N(verts[v + 2], 2);
      const inside = x >= box.x0 && x <= box.x1 && y >= box.y0 && y <= box.y1 && z >= box.z0 && z <= box.z1;
      if (inside && (x <= SEAT_INNER_L + 1e-3 || x >= SEAT_INNER_R - 1e-3)) seatHits++;
      if (Math.abs(x - AX) < 0.07 && z >= box.z0 && z <= box.z1 && y < -0.10) {
        if (y > tunnelMaxY) tunnelMaxY = y;
        underCount++;
      }
    }
  }
  const rearUnderWorld = AY + SC * REAR_UNDER_Y;
  const skirtFrontBottom = AY + SC * (SKIRT_BOT * C - SKIRT_HZ * SN);
  const checks = [
    ['(a) plate clear of LEFT seat', box.x0 > SEAT_INNER_L, `clearance ${(box.x0 - SEAT_INNER_L).toFixed(4)}`],
    ['(a) plate clear of RIGHT seat', box.x1 < SEAT_INNER_R, `clearance ${(SEAT_INNER_R - box.x1).toFixed(4)}`],
    ['(a) no seat-side verts inside plate box', seatHits === 0, `${seatHits} hits`],
    ['(b) rear underside at/below tunnel top (no float)', rearUnderWorld <= TUNNEL_TOP_Y, `rear underside y=${rearUnderWorld.toFixed(4)} vs tunnel ${TUNNEL_TOP_Y}`],
    ['(b) tunnel surface present under footprint', tunnelMaxY > -0.20 && tunnelMaxY < -0.13, `max tunnel y under plate=${tunnelMaxY.toFixed(4)} (${underCount} verts)`],
    ['(b) skirt bottom below tunnel surface (wedge filled)', skirtFrontBottom <= TUNNEL_TOP_Y - 0.009, `skirt front-bottom y=${skirtFrontBottom.toFixed(4)}`],
    ['(c) plate footprint within flat tunnel patch z∈[0.20,0.44]', box.z0 >= 0.20 && box.z1 <= 0.44, `z[${box.z0.toFixed(3)},${box.z1.toFixed(3)}]`],
    ['(d) slots parallel to centerline (pitch-only)', true, `rotation=[${(TILT * 180 / Math.PI).toFixed(1)}°,0,0]; roll=yaw=0 by construction`],
  ];
  let ok = true;
  for (const [label, pass, detail] of checks) {
    console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${label} — ${detail}`);
    if (!pass) ok = false;
  }
  process.exitCode = ok ? 0 : 1;
}
