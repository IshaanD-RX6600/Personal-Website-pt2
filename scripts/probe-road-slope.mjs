// Height of the road-lane surface as a function of raw z: samples points on
// every triangle in the center strip (|x|<250) and bins surface y by z.
//   node scripts/probe-road-slope.mjs
import { readFileSync } from 'node:fs';

const buf = readFileSync(new URL('../public/road__avenue__street.glb', import.meta.url));
let off = 12, json = null, bin = null;
while (off < buf.length) {
  const len = buf.readUInt32LE(off), type = buf.readUInt32LE(off + 4);
  const chunk = buf.subarray(off + 8, off + 8 + len);
  if (type === 0x4e4f534a) json = JSON.parse(chunk.toString('utf8'));
  else if (type === 0x004e4942) bin = chunk;
  off += 8 + len;
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

const prim = json.meshes[0].primitives[0];
const pacc = json.accessors[prim.attributes.POSITION];
const pbv = json.bufferViews[pacc.bufferView];
const pdv = new DataView(bin.buffer, bin.byteOffset + (pbv.byteOffset ?? 0), pbv.byteLength);
const pst = pbv.byteStride ?? 12;
const P = (i) => {
  const o = (pacc.byteOffset ?? 0) + i * pst;
  return xf(world, pdv.getFloat32(o, true), pdv.getFloat32(o + 4, true), pdv.getFloat32(o + 8, true));
};
const iacc = json.accessors[prim.indices];
const ibv = json.bufferViews[iacc.bufferView];
const idv = new DataView(bin.buffer, bin.byteOffset + (ibv.byteOffset ?? 0), ibv.byteLength);
const isz = { 5121: 1, 5123: 2, 5125: 4 }[iacc.componentType];
const IX = (i) => {
  const o = (iacc.byteOffset ?? 0) + i * isz;
  return isz === 1 ? idv.getUint8(o) : isz === 2 ? idv.getUint16(o, true) : idv.getUint32(o, true);
};

// Sample every center-strip triangle densely; record min/max surface y per z bin
const bins = new Map(); // zBin(100) -> {lo, hi, n}
for (let i = 0; i < iacc.count; i += 3) {
  const A = P(IX(i)), B = P(IX(i + 1)), C = P(IX(i + 2));
  for (let a = 0; a <= 6; a++)
    for (let b = 0; b <= 6 - a; b++) {
      const c = 6 - a - b;
      const x = (A[0]*a + B[0]*b + C[0]*c) / 6;
      const y = (A[1]*a + B[1]*b + C[1]*c) / 6;
      const z = (A[2]*a + B[2]*b + C[2]*c) / 6;
      if (Math.abs(x) > 250) continue;
      const k = Math.floor(z / 100) * 100;
      const e = bins.get(k) ?? { lo: Infinity, hi: -Infinity, n: 0 };
      e.lo = Math.min(e.lo, y); e.hi = Math.max(e.hi, y); e.n++;
      bins.set(k, e);
    }
}
console.log('center strip (|x|<250): surface y range per raw-z bin');
for (const k of [...bins.keys()].sort((a, b) => a - b)) {
  const e = bins.get(k);
  console.log(`z ${String(k).padStart(5)}..${k + 100}: y ${e.lo.toFixed(1)}..${e.hi.toFixed(1)}  (${e.n} samples)`);
}
