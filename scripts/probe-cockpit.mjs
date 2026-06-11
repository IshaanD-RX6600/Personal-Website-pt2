// Locate cockpit landmarks (steering wheel, seats, shifter, dash) in the GLB
// and map them through CarModel's normalization (scale to 4-unit box, center
// at origin) so waypoints can be authored in scene coordinates.
import { NodeIO, getBounds } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read('public/2024_lbsilhouette_works_murcielago_gt_evo.glb');
const scene = doc.getRoot().getDefaultScene() ?? doc.getRoot().listScenes()[0];

const sb = getBounds(scene);
const size = sb.max.map((v, i) => v - sb.min[i]);
const center = sb.max.map((v, i) => (v + sb.min[i]) / 2);
const s = 4 / Math.max(...size);
console.log('scene bbox size:', size.map(v => v.toFixed(4)).join(', '));
console.log('normalize scale:', s.toFixed(3));

// final = s * (orig - origCenter)
const norm = v => v.map((x, i) => s * (x - center[i]));

const PAT = /steer|seat|shift|gear|dash|cockpit|interior|volant|wheel_rim|stick|console|pedal|mirror/i;
const seen = new Map();

function visit(node) {
  const name = node.getName();
  if (PAT.test(name) && node.getMesh()) {
    const b = getBounds(node);
    const key = name.slice(0, 60);
    if (!seen.has(key)) seen.set(key, [norm(b.min), norm(b.max)]);
  }
  node.listChildren().forEach(visit);
}
scene.listChildren().forEach(visit);

console.log('scene bbox normalized: min', norm(sb.min).map(v => v.toFixed(3)).join(', '), ' max', norm(sb.max).map(v => v.toFixed(3)).join(', '));
for (const [name, [mn, mx]] of seen) {
  console.log(`${name.padEnd(60)}\n  min [${mn.map(v => v.toFixed(3)).join(', ')}]  max [${mx.map(v => v.toFixed(3)).join(', ')}]`);
}
if (!seen.size) {
  console.log('No name matches; dumping top-level nodes with mesh bbox centers:');
  function dump(node, depth) {
    if (depth > 2) return;
    const tag = node.getMesh() ? ' [mesh]' : '';
    const b = node.getMesh() || node.listChildren().length ? getBounds(node) : null;
    const c = b ? norm(b.max.map((v, i) => (v + b.min[i]) / 2)) : null;
    console.log(`${'  '.repeat(depth)}${node.getName()}${tag}${c ? ' â†’ [' + c.map(v => v.toFixed(3)).join(', ') + ']' : ''}`);
    node.listChildren().forEach(n => dump(n, depth + 1));
  }
  scene.listChildren().forEach(n => dump(n, 0));
}

