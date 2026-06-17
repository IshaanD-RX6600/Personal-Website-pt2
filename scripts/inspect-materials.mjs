// Dumps car.glb material flags + per-mesh attributes so we can tell the
// "hollow / see-through" cause apart: backface culling vs transparency vs
// missing geometry vs missing normals.
//   node scripts/inspect-materials.mjs
import { readFileSync } from 'node:fs';

const buf = readFileSync(new URL('../public/car.glb', import.meta.url));
if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error('not a GLB');
let off = 12, json = null;
while (off < buf.length) {
  const len = buf.readUInt32LE(off);
  const type = buf.readUInt32LE(off + 4);
  const chunk = buf.subarray(off + 8, off + 8 + len);
  if (type === 0x4e4f534a) json = JSON.parse(chunk.toString('utf8'));
  off += 8 + len;
}

const mats = json.materials ?? [];
console.log(`\n=== MATERIALS (${mats.length}) ===`);
console.log('idx  doubleSided  alphaMode   baseAlpha  name');
mats.forEach((m, i) => {
  const a = m.pbrMetallicRoughness?.baseColorFactor?.[3];
  console.log(
    String(i).padEnd(4),
    String(!!m.doubleSided).padEnd(12),
    String(m.alphaMode ?? 'OPAQUE').padEnd(11),
    String(a ?? 1).padEnd(10),
    m.name ?? '',
  );
});

// Per node->mesh->primitive: attributes + material + triangle count
const nodes = json.nodes ?? [];
console.log(`\n=== MESH PRIMITIVES ===`);
console.log('node                         hasNORMAL  tris      material');
let noNormal = 0, total = 0;
function accCount(i) { return i === undefined ? 0 : json.accessors[i].count; }
(function visit(idxs) {
  for (const i of idxs) {
    const n = nodes[i];
    if (n.mesh !== undefined) {
      for (const prim of json.meshes[n.mesh].primitives) {
        const hasN = prim.attributes.NORMAL !== undefined;
        const idxCount = accCount(prim.indices) || accCount(prim.attributes.POSITION);
        const tris = Math.round(idxCount / 3);
        const matName = prim.material !== undefined ? (mats[prim.material]?.name ?? `mat${prim.material}`) : '(none)';
        if (!hasN) noNormal++;
        total++;
        console.log(
          (n.name ?? `node${i}`).slice(0, 28).padEnd(28),
          String(hasN).padEnd(10),
          String(tris).padEnd(9),
          matName,
        );
      }
    }
    if (n.children) visit(n.children);
  }
})(json.scenes[json.scene ?? 0].nodes);

console.log(`\nprimitives: ${total} · missing NORMAL: ${noNormal}`);
const transparent = mats.filter(m => (m.alphaMode && m.alphaMode !== 'OPAQUE') || (m.pbrMetallicRoughness?.baseColorFactor?.[3] ?? 1) < 1);
console.log(`transparent/blended materials: ${transparent.length}${transparent.length ? ' → ' + transparent.map(m => m.name).join(', ') : ''}`);
console.log(`source-doubleSided materials: ${mats.filter(m => m.doubleSided).length} / ${mats.length}`);
