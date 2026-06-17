// Reports normalized-space AABBs (CarModel's 4-unit/centered space) for the
// trademark-bearing meshes so we know where the dash badge sits and what each
// trademark is attached to.  node scripts/measure-badge.mjs
import { readFileSync } from 'node:fs';
import { MeshoptDecoder } from '../node_modules/three/examples/jsm/libs/meshopt_decoder.module.js';
await MeshoptDecoder.ready;

const buf = readFileSync(new URL('../public/car.glb', import.meta.url));
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

const meshSets = [];
(function visit(idxs, parent){ for (const i of idxs){ const n = json.nodes[i]; const world = mul(parent, trs(n));
  if (n.mesh !== undefined) for (const prim of json.meshes[n.mesh].primitives){
    const local = readPositions(prim.attributes.POSITION); const verts = new Float32Array(local.length);
    for (let v=0; v<local.length; v+=3){ const w = xf(world, local[v],local[v+1],local[v+2]); verts[v]=w[0];verts[v+1]=w[1];verts[v+2]=w[2]; }
    meshSets.push({ name: n.name ?? `node${i}`, mat: prim.material, verts }); }
  if (n.children) visit(n.children, world); } })(json.scenes[json.scene ?? 0].nodes, I);

const gMin=[Infinity,Infinity,Infinity], gMax=[-Infinity,-Infinity,-Infinity];
for (const {verts} of meshSets) for (let v=0;v<verts.length;v+=3) for(let a=0;a<3;a++){ if(verts[v+a]<gMin[a])gMin[a]=verts[v+a]; if(verts[v+a]>gMax[a])gMax[a]=verts[v+a]; }
const s = 4/Math.max(...gMax.map((v,i)=>v-gMin[i]));
const ctr = gMin.map((v,i)=>((v+gMax[i])/2)*s);
const N=(v,a)=>v*s-ctr[a];

const want = /Badge|Calliper|Caliper|Wheel|ManufacturerPlate|Plate/;
console.log('mesh (normalized AABB · centered 4-unit space · +z=nose, +x=steering side)\n');
for (const {name, mat, verts} of meshSets){
  if (!want.test(name)) continue;
  const mn=[Infinity,Infinity,Infinity], mx=[-Infinity,-Infinity,-Infinity];
  for (let v=0;v<verts.length;v+=3) for(let a=0;a<3;a++){ const c=N(verts[v+a],a); if(c<mn[a])mn[a]=c; if(c>mx[a])mx[a]=c; }
  const cx=((mn[0]+mx[0])/2).toFixed(3), cy=((mn[1]+mx[1])/2).toFixed(3), cz=((mn[2]+mx[2])/2).toFixed(3);
  console.log(`${(name.match(/LB:(\w+)/)?.[1]??name).padEnd(20)} mat${String(mat).padStart(2)}  center(${cx},${cy},${cz})  x[${N(mn[0]/s*s,0).toFixed(2)},${mx[0].toFixed(2)}] y[${mn[1].toFixed(2)},${mx[1].toFixed(2)}] z[${mn[2].toFixed(2)},${mx[2].toFixed(2)}]`);
}
