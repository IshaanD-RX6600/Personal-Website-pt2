// Inspects a GLB: node tree, mesh bounds, materials, animations.
// Tells us what a scene contains (door? walls? floor?) and its raw
// dimensions so CarModel.tsx can place things.
//
//   node scripts/inspect-garage.mjs [public/car_garage.glb]
import { readFileSync } from 'node:fs';
import { MeshoptDecoder } from '../node_modules/three/examples/jsm/libs/meshopt_decoder.module.js';

await MeshoptDecoder.ready;
const file = process.argv[2] ?? 'public/car_garage.glb';
const buf = readFileSync(new URL(`../${file}`, import.meta.url));

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

console.log('── extensions ──');
console.log('used:', json.extensionsUsed ?? []);
console.log('required:', json.extensionsRequired ?? []);

console.log('\n── materials ──');
for (const [i, m] of (json.materials ?? []).entries()) {
  console.log(`[${i}] ${m.name ?? '(unnamed)'} alphaMode=${m.alphaMode ?? 'OPAQUE'} metallic=${m.pbrMetallicRoughness?.metallicFactor ?? 1} rough=${m.pbrMetallicRoughness?.roughnessFactor ?? 1} baseTex=${m.pbrMetallicRoughness?.baseColorTexture ? 'yes' : 'no'} emissive=${JSON.stringify(m.emissiveFactor ?? null)}`);
}

console.log('\n── animations ──');
for (const [i, a] of (json.animations ?? []).entries()) {
  console.log(`[${i}] ${a.name ?? '(unnamed)'} channels=${a.channels.length}`);
  for (const ch of a.channels) {
    console.log(`   target node ${ch.target.node} (${json.nodes[ch.target.node]?.name}) path=${ch.target.path}`);
  }
}
if (!(json.animations ?? []).length) console.log('(none)');

// bufferView bytes (meshopt-decoded when compressed)
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

console.log('\n── node tree + world-space mesh bounds ──');
const nodes = json.nodes ?? [];
const gMin = [Infinity, Infinity, Infinity], gMax = [-Infinity, -Infinity, -Infinity];
(function visit(idxs, parent, depth) {
  for (const i of idxs) {
    const n = nodes[i];
    const world = mul(parent, trs(n));
    let info = '';
    if (n.mesh !== undefined) {
      const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
      let tris = 0;
      const mats = new Set();
      for (const prim of json.meshes[n.mesh].primitives) {
        const local = readPositions(prim.attributes.POSITION);
        if (prim.material !== undefined) mats.add(json.materials[prim.material]?.name ?? prim.material);
        if (prim.indices !== undefined) tris += json.accessors[prim.indices].count / 3;
        for (let v = 0; v < local.length; v += 3) {
          const w = xf(world, local[v], local[v + 1], local[v + 2]);
          for (let a = 0; a < 3; a++) {
            if (w[a] < mn[a]) mn[a] = w[a];
            if (w[a] > mx[a]) mx[a] = w[a];
            if (w[a] < gMin[a]) gMin[a] = w[a];
            if (w[a] > gMax[a]) gMax[a] = w[a];
          }
        }
      }
      info = ` MESH tris=${tris} x[${mn[0].toFixed(2)},${mx[0].toFixed(2)}] y[${mn[1].toFixed(2)},${mx[1].toFixed(2)}] z[${mn[2].toFixed(2)},${mx[2].toFixed(2)}] mats=[${[...mats].join(', ')}]`;
    }
    console.log(`${'  '.repeat(depth)}[${i}] ${n.name ?? '(unnamed)'}${info}`);
    if (n.children) visit(n.children, world, depth + 1);
  }
})(json.scenes[json.scene ?? 0].nodes, I, 0);

console.log(`\nGLOBAL bounds x[${gMin[0].toFixed(2)},${gMax[0].toFixed(2)}] y[${gMin[1].toFixed(2)},${gMax[1].toFixed(2)}] z[${gMin[2].toFixed(2)},${gMax[2].toFixed(2)}]`);
console.log(`size ${(gMax[0]-gMin[0]).toFixed(2)} x ${(gMax[1]-gMin[1]).toFixed(2)} x ${(gMax[2]-gMin[2]).toFixed(2)}`);
