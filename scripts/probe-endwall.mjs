// Histogram of Cube_0 triangle centroids along raw-world X near the +x end,
// split by height — tells us the exact slab to cull for the door opening.
//   node scripts/probe-endwall.mjs
import { readFileSync } from 'node:fs';
import { MeshoptDecoder } from '../node_modules/three/examples/jsm/libs/meshopt_decoder.module.js';
await MeshoptDecoder.ready;

const buf = readFileSync(new URL('../public/car_garage.glb', import.meta.url));
let off = 12, json = null, bin = null;
while (off < buf.length) {
  const len = buf.readUInt32LE(off), type = buf.readUInt32LE(off + 4);
  const chunk = buf.subarray(off + 8, off + 8 + len);
  if (type === 0x4e4f534a) json = JSON.parse(chunk.toString('utf8'));
  else if (type === 0x004e4942) bin = chunk;
  off += 8 + len;
}
const bvCache = new Map();
function viewBytes(bvIdx) {
  if (bvCache.has(bvIdx)) return bvCache.get(bvIdx);
  const bv = json.bufferViews[bvIdx]; const ext = bv.extensions?.EXT_meshopt_compression; let out;
  if (ext) { const src = new Uint8Array(bin.buffer, bin.byteOffset + (ext.byteOffset ?? 0), ext.byteLength);
    out = new Uint8Array(ext.count * ext.byteStride);
    MeshoptDecoder.decodeGltfBuffer(out, ext.count, ext.byteStride, src, ext.mode, ext.filter); out.stride = ext.byteStride;
  } else { out = new Uint8Array(bin.buffer, bin.byteOffset + (bv.byteOffset ?? 0), bv.byteLength); out.stride = bv.byteStride; }
  bvCache.set(bvIdx, out); return out;
}
function readPositions(accIdx) {
  const acc = json.accessors[accIdx], bytes = viewBytes(acc.bufferView);
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const out = new Float32Array(acc.count * 3);
  const compSize = { 5120:1,5121:1,5122:2,5123:2,5126:4 }[acc.componentType];
  const stride = bytes.stride ?? compSize * 3;
  for (let i = 0; i < acc.count; i++) { const o = (acc.byteOffset ?? 0) + i * stride;
    for (let a = 0; a < 3; a++) { let v; switch (acc.componentType) {
      case 5126: v = dv.getFloat32(o + a*4, true); break;
      case 5122: v = dv.getInt16(o + a*2, true); if (acc.normalized) v = Math.max(v/32767,-1); break;
      case 5123: v = dv.getUint16(o + a*2, true); if (acc.normalized) v/=65535; break;
      case 5120: v = dv.getInt8(o+a); if (acc.normalized) v = Math.max(v/127,-1); break;
      case 5121: v = dv.getUint8(o+a); if (acc.normalized) v/=255; break; }
      out[i*3+a] = v; } }
  return out;
}
const I = [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
function mul(a,b){const o=new Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s;}return o;}
function trs(n){if(n.matrix)return n.matrix;const[tx,ty,tz]=n.translation??[0,0,0];const[qx,qy,qz,qw]=n.rotation??[0,0,0,1];const[sx,sy,sz]=n.scale??[1,1,1];
  const x2=qx+qx,y2=qy+qy,z2=qz+qz,xx=qx*x2,xy=qx*y2,xz=qx*z2,yy=qy*y2,yz=qy*z2,zz=qz*z2,wx=qw*x2,wy=qw*y2,wz=qw*z2;
  return[(1-(yy+zz))*sx,(xy+wz)*sx,(xz-wy)*sx,0,(xy-wz)*sy,(1-(xx+zz))*sy,(yz+wx)*sy,0,(xz+wy)*sz,(yz-wx)*sz,(1-(xx+yy))*sz,0,tx,ty,tz,1];}
const xf=(m,x,y,z)=>[m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14]];

let worldOf5 = I;
(function seek(idxs, parent) {
  for (const i of idxs) {
    const n = json.nodes[i];
    const world = mul(parent, trs(n));
    if (i === 5) worldOf5 = world;
    if (n.children) seek(n.children, world);
  }
})(json.scenes[json.scene ?? 0].nodes, I);

const mesh = json.meshes[json.nodes[5].mesh];
const cents = [];
for (const prim of mesh.primitives) {
  const pos = readPositions(prim.attributes.POSITION);
  const acc = json.accessors[prim.indices];
  const bytes = viewBytes(acc.bufferView);
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const readIdx = (i) => {
    const o = (acc.byteOffset ?? 0) + i * ({ 5121:1, 5123:2, 5125:4 }[acc.componentType]);
    switch (acc.componentType) { case 5121: return dv.getUint8(o); case 5123: return dv.getUint16(o, true); case 5125: return dv.getUint32(o, true); }
  };
  for (let i = 0; i < acc.count; i += 3) {
    const A = xf(worldOf5, pos[readIdx(i)*3], pos[readIdx(i)*3+1], pos[readIdx(i)*3+2]);
    const B = xf(worldOf5, pos[readIdx(i+1)*3], pos[readIdx(i+1)*3+1], pos[readIdx(i+1)*3+2]);
    const C = xf(worldOf5, pos[readIdx(i+2)*3], pos[readIdx(i+2)*3+1], pos[readIdx(i+2)*3+2]);
    cents.push([(A[0]+B[0]+C[0])/3, (A[1]+B[1]+C[1])/3, (A[2]+B[2]+C[2])/3]);
  }
}

// x-histogram (0.1 bins) of centroids with x > 5.0, split by y band
console.log('x-bin   y<0.15  0.15<y<4.2  y>4.2   (centroid counts)');
for (let x0 = 5.0; x0 < 7.1; x0 += 0.1) {
  let lo = 0, mid = 0, hi = 0;
  for (const [x, y] of cents) {
    if (x < x0 || x >= x0 + 0.1) continue;
    if (y < 0.15) lo++; else if (y > 4.2) hi++; else mid++;
  }
  console.log(`${x0.toFixed(1).padStart(5)}  ${String(lo).padStart(5)}  ${String(mid).padStart(9)}  ${String(hi).padStart(5)}`);
}
// Also: the -x end for reference
console.log('\n-x end:');
for (let x0 = -9.6; x0 < -7.9; x0 += 0.1) {
  let lo = 0, mid = 0, hi = 0;
  for (const [x, y] of cents) {
    if (x < x0 || x >= x0 + 0.1) continue;
    if (y < 0.15) lo++; else if (y > 4.2) hi++; else mid++;
  }
  console.log(`${x0.toFixed(1).padStart(5)}  ${String(lo).padStart(5)}  ${String(mid).padStart(9)}  ${String(hi).padStart(5)}`);
}
// z-extent of mid-band tris near the +x end (does the wall span full width?)
let zmin = Infinity, zmax = -Infinity, ymin = Infinity, ymax = -Infinity, n = 0;
for (const [x, y, z] of cents) {
  if (x < 6.2 || y < 0.15 || y > 4.2) continue;
  n++;
  if (z < zmin) zmin = z; if (z > zmax) zmax = z;
  if (y < ymin) ymin = y; if (y > ymax) ymax = y;
}
console.log(`\nmid-band tris with x>6.2: ${n}, z[${zmin.toFixed(2)},${zmax.toFixed(2)}] y[${ymin.toFixed(2)},${ymax.toFixed(2)}]`);
