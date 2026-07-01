// Finds the garage opening: occupancy maps of Cube_0 vertices near each
// boundary wall of car_garage.glb. A hole in the map = the door opening.
//
//   node scripts/probe-garage-walls.mjs
import { readFileSync } from 'node:fs';
import { MeshoptDecoder } from '../node_modules/three/examples/jsm/libs/meshopt_decoder.module.js';

await MeshoptDecoder.ready;
const buf = readFileSync(new URL('../public/car_garage.glb', import.meta.url));

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

// World transforms (glTF column-major TRS), same math as measure-cabin.mjs
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
// Find node 5 (Cube_0)'s world matrix by walking the scene
let worldOf5 = I;
(function seek(idxs, parent) {
  for (const i of idxs) {
    const n = json.nodes[i];
    const world = mul(parent, trs(n));
    if (i === 5) worldOf5 = world;
    if (n.children) seek(n.children, world);
  }
})(json.scenes[json.scene ?? 0].nodes, I);

// Sample many barycentric points per triangle so large wall quads register
// across their full span, then bin the WORLD-space samples.
const node = json.nodes[5];
const mesh = json.meshes[node.mesh];
const tris = []; // world-space sample points
const BARY = [];
for (let a = 0; a <= 4; a++)
  for (let b = 0; b <= 4 - a; b++) BARY.push([a / 4, b / 4, (4 - a - b) / 4]);
for (const prim of mesh.primitives) {
  const pos = readPositions(prim.attributes.POSITION);
  const acc = json.accessors[prim.indices];
  const bytes = viewBytes(acc.bufferView);
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const readIdx = (i) => {
    const o = (acc.byteOffset ?? 0) + i * ({ 5121: 1, 5123: 2, 5125: 4 }[acc.componentType]);
    switch (acc.componentType) {
      case 5121: return dv.getUint8(o);
      case 5123: return dv.getUint16(o, true);
      case 5125: return dv.getUint32(o, true);
    }
  };
  for (let i = 0; i < acc.count; i += 3) {
    const ia = readIdx(i), ib = readIdx(i + 1), ic = readIdx(i + 2);
    const A = xf(worldOf5, pos[ia*3], pos[ia*3+1], pos[ia*3+2]);
    const B = xf(worldOf5, pos[ib*3], pos[ib*3+1], pos[ib*3+2]);
    const C = xf(worldOf5, pos[ic*3], pos[ic*3+1], pos[ic*3+2]);
    for (const [u, v, w] of BARY) {
      tris.push([
        A[0]*u + B[0]*v + C[0]*w,
        A[1]*u + B[1]*v + C[1]*w,
        A[2]*u + B[2]*v + C[2]*w,
      ]);
    }
  }
}
console.log(`Cube_0 world-space samples: ${tris.length}`);

// Occupancy map for a wall slab: fix one axis to a range, plot the other two.
function wallMap(label, axis, lo, hi, uAxis, uLo, uHi, vAxis, vLo, vHi) {
  const NU = 60, NV = 20;
  const grid = Array.from({ length: NV }, () => new Array(NU).fill(' '));
  let count = 0;
  for (const t of tris) {
    if (t[axis] < lo || t[axis] > hi) continue;
    const u = Math.floor(((t[uAxis] - uLo) / (uHi - uLo)) * NU);
    const v = Math.floor(((t[vAxis] - vLo) / (vHi - vLo)) * NV);
    if (u < 0 || u >= NU || v < 0 || v >= NV) continue;
    grid[v][u] = '#';
    count++;
  }
  console.log(`\n${label} (tris in slab: ${count}) — u=${'xyz'[uAxis]}∈[${uLo},${uHi}] → cols, v=${'xyz'[vAxis]}∈[${vLo},${vHi}] → rows (top=high)`);
  for (let v = NV - 1; v >= 0; v--) {
    const vVal = vLo + ((v + 0.5) / NV) * (vHi - vLo);
    console.log(`${vVal.toFixed(1).padStart(6)} |${grid[v].join('')}|`);
  }
}

// global bounds: x[-9.50,7.04] y[-0.04,4.48] z[-5.17,5.17]
wallMap('WALL x≈-9.5 (min-x)', 0, -9.6, -8.8, 2, -5.2, 5.2, 1, 0, 4.5);
wallMap('WALL x≈+7.0 (max-x)', 0, 6.3, 7.1, 2, -5.2, 5.2, 1, 0, 4.5);
wallMap('WALL z≈-5.17 (min-z)', 2, -5.2, -4.9, 0, -9.6, 7.1, 1, 0, 4.5);
wallMap('WALL z≈+5.17 (max-z)', 2, 4.9, 5.2, 0, -9.6, 7.1, 1, 0, 4.5);
wallMap('CEILING y≈4.48', 1, 4.3, 4.5, 0, -9.6, 7.1, 2, -5.2, 5.2);
wallMap('FLOOR y≈0', 1, -0.1, 0.15, 0, -9.6, 7.1, 2, -5.2, 5.2);
