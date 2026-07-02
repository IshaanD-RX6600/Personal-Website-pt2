// Y-histogram of road__avenue__street.glb triangle centroids — find the
// road surface level so it can be aligned to the garage floor.
//   node scripts/probe-road.mjs
import { readFileSync } from 'node:fs';
import { MeshoptDecoder } from '../node_modules/three/examples/jsm/libs/meshopt_decoder.module.js';
await MeshoptDecoder.ready;

const buf = readFileSync(new URL('../public/road__avenue__street.glb', import.meta.url));
let off = 12, json = null, bin = null;
while (off < buf.length) {
  const len = buf.readUInt32LE(off), type = buf.readUInt32LE(off + 4);
  const chunk = buf.subarray(off + 8, off + 8 + len);
  if (type === 0x4e4f534a) json = JSON.parse(chunk.toString('utf8'));
  else if (type === 0x004e4942) bin = chunk;
  off += 8 + len;
}
function readAcc(accIdx) {
  const acc = json.accessors[accIdx];
  const bv = json.bufferViews[acc.bufferView];
  const bytes = new Uint8Array(bin.buffer, bin.byteOffset + (bv.byteOffset ?? 0), bv.byteLength);
  return { acc, bytes, dv: new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength), stride: bv.byteStride };
}
// world transform of node 2: parents likely carry the usual -90° X sketchfab rotation
// — report raw LOCAL geometry AND account for it: apply full chain like inspect script does.
// Simpler: reuse world bounds already known; here compute y histogram in WORLD space
// by replicating the two-level transform. Node chain: 0 -> 1 -> 2.
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
function mul(a, b) {
  const o = new Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
      o[c * 4 + r] = s;
    }
  return o;
}
const I = [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
let world = I;
(function seek(idxs, parent) {
  for (const i of idxs) {
    const n = json.nodes[i];
    const w = mul(parent, trs(n));
    if (n.mesh !== undefined) world = w;
    if (n.children) seek(n.children, w);
  }
})(json.scenes[json.scene ?? 0].nodes, I);
const xf = (m, x, y, z) => [m[0]*x + m[4]*y + m[8]*z + m[12], m[1]*x + m[5]*y + m[9]*z + m[13], m[2]*x + m[6]*y + m[10]*z + m[14]];

const mesh = json.meshes[json.nodes.find(n => n.mesh !== undefined) ? 0 : 0];
const prim = json.meshes[0].primitives[0];
const { acc, dv, stride } = readAcc(prim.attributes.POSITION);
const st = stride ?? 12;
const hist = new Map();
const verts = [];
let n = 0;
for (let i = 0; i < acc.count; i++) {
  const o = (acc.byteOffset ?? 0) + i * st;
  const w = xf(world, dv.getFloat32(o, true), dv.getFloat32(o + 4, true), dv.getFloat32(o + 8, true));
  verts.push(w);
  const bin2 = Math.round(w[1]);
  hist.set(bin2, (hist.get(bin2) ?? 0) + 1);
  n++;
}
console.log(`verts: ${n}`);
for (const k of [...hist.keys()].sort((a, b) => a - b)) console.log(`y≈${k}: ${hist.get(k)}`);

// Surface height along the long axis (world z): dominant y at |x|<60 (the
// central road strip) per 75-unit z slice.
console.log('\nz-slice → y levels near centerline (|x|<60):');
for (let z0 = -750; z0 < 750; z0 += 75) {
  const ys = verts.filter(([x, , z]) => Math.abs(x) < 60 && z >= z0 && z < z0 + 75).map(v => v[1]);
  if (!ys.length) { console.log(`z ${z0}..${z0 + 75}: (no verts)`); continue; }
  const lv = new Map();
  for (const y of ys) { const k = Math.round(y); lv.set(k, (lv.get(k) ?? 0) + 1); }
  console.log(`z ${z0}..${z0 + 75}: ${[...lv.entries()].sort((a, b) => b[1] - a[1]).map(([k, c]) => `y${k}×${c}`).join(' ')}`);
}

// Cross-section at a few z: x-bins vs max y (find the road lane's x range)
for (const zc of [-600, -300, 0, 300, 600]) {
  const band = verts.filter(([, , z]) => Math.abs(z - zc) < 40);
  let row = `x-profile @z≈${zc}: `;
  for (let x0 = -500; x0 < 500; x0 += 100) {
    const ys = band.filter(([x]) => x >= x0 && x < x0 + 100).map(v => v[1]);
    row += ys.length ? `[${x0}:${Math.max(...ys).toFixed(0)}] ` : `[${x0}:--] `;
  }
  console.log(row);
}
