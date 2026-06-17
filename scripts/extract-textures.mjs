// Extracts car.glb embedded images to scripts/_tex/ (as PNG, via sharp) and
// prints which material/slot each image feeds, so we can locate the
// "Lamborghini" wordmark and any bull logo. Textures are WebP (EXT_texture_webp).
//   node scripts/extract-textures.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import sharp from 'sharp';

const buf = readFileSync(new URL('../public/car.glb', import.meta.url));
if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error('not a GLB');
let off = 12, json = null, bin = null;
while (off < buf.length) {
  const len = buf.readUInt32LE(off);
  const type = buf.readUInt32LE(off + 4);
  const chunk = buf.subarray(off + 8, off + 8 + len);
  if (type === 0x4e4f534a) json = JSON.parse(chunk.toString('utf8'));
  else if (type === 0x004e4942) bin = chunk;
  off += 8 + len;
}

const outDir = fileURLToPath(new URL('./_tex/', import.meta.url));
mkdirSync(outDir, { recursive: true });

const imgOf = (ti) => {
  const t = json.textures[ti.index];
  return t.extensions?.EXT_texture_webp?.source ?? t.source;
};
const usage = new Map();
const slot = (i, label) => { if (!usage.has(i)) usage.set(i, []); usage.get(i).push(label); };
json.materials.forEach((m, mi) => {
  const p = m.pbrMetallicRoughness ?? {};
  const tag = `${mi}(${(m.name||'').slice(0,22)})`;
  if (p.baseColorTexture)         slot(imgOf(p.baseColorTexture), `${tag}:baseColor`);
  if (p.metallicRoughnessTexture) slot(imgOf(p.metallicRoughnessTexture), `${tag}:metalRough`);
  if (m.normalTexture)            slot(imgOf(m.normalTexture), `${tag}:normal`);
  if (m.emissiveTexture)          slot(imgOf(m.emissiveTexture), `${tag}:EMISSIVE`);
  if (m.occlusionTexture)         slot(imgOf(m.occlusionTexture), `${tag}:occlusion`);
});

for (let i = 0; i < json.images.length; i++) {
  const img = json.images[i];
  const bv = json.bufferViews[img.bufferView];
  const start = bin.byteOffset + (bv.byteOffset ?? 0);
  const bytes = Buffer.from(bin.buffer, start, bv.byteLength);
  const name = `img${String(i).padStart(2,'0')}.png`;
  try {
    const meta = await sharp(bytes).metadata();
    const png = await sharp(bytes).png().toBuffer();
    writeFileSync(join(outDir, name), png);
    console.log(name.padEnd(11), `${meta.width}x${meta.height}`.padStart(10), '|', (usage.get(i) ?? ['(unused)']).join('  '));
  } catch (e) {
    console.log(name.padEnd(11), 'FAILED'.padStart(10), '|', e.message);
  }
}
console.log(`\nextracted to ${outDir}`);
