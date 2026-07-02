"use client";

import { Suspense, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useSiteStore, type SectionId } from '@/stores/useSiteStore';

/**
 * The garage set: the car_garage.glb shell, a procedural roll-up door
 * (the GLB ships with NO door — both short ends are open), and the wall
 * navigation panels that replaced the gear shifter.
 *
 * World placement (car space: car fits a 4-unit box centered at origin,
 * ground at y=-0.485, nose = +z):
 *   The GLB's long axis is its local X. rotation.y=-π/2 maps local +x →
 *   world +z. Height/length scale by 0.85; the width axis (local z) is
 *   additionally stretched ×1.25 so the section cars can park PERPENDICULAR
 *   to the walls without their noses hitting the hero car:
 *     side walls   x ≈ ±5.49 (inner face ≈ ±5.28), blue light strips
 *     back wall    z ≈ -8.08
 *     door end     z ≈ +5.98   (in front of the hero car's nose)
 *     ceiling      y ≈ +3.29   (floor sits at the car's ground plane)
 *
 * The GLB's +x end ships CLOSED: a static, non-animatable door assembly
 * (raw x 5.1–5.9, the emblem panels) plus an outer concrete skin
 * (raw x 6.4–7.04) — measured in scripts/probe-endwall.mjs. Both layers are
 * triangle-culled at load (see HOLE below) so the procedural roll-up door
 * here is THE door, seen from outside and inside, and it actually opens.
 */
const GARAGE_GLB = '/car_garage.glb';
export const FLOOR_Y = -0.485;
export const GARAGE_SCALE = 0.85;
const WIDTH_STRETCH = 1.25;             // widens the room for perpendicular parking

// ─── Roll-up door ───────────────────────────────────────────────────────────
export const DOOR_Z = 5.82;             // just inside the open end wall (z≈5.98)
const DOOR_W = 10.7;                    // spans past the widened opening; edges hide in columns
const DOOR_H = 3.0;                     // slat stack height (floor → lintel)
const LINTEL_Y = FLOOR_Y + DOOR_H + 0.02;
const SLATS = 6;
const SLAT_H = DOOR_H / SLATS;
// Scroll window over which the door rolls open (matches the approach leg
// of the WP timeline in CarModel.tsx)
const OPEN_P0 = 0.08, OPEN_P1 = 0.22;

/** 0 = closed, 1 = fully open (smoothstepped over the scroll window). */
export function doorProgress(p: number) {
  const t = THREE.MathUtils.clamp((p - OPEN_P0) / (OPEN_P1 - OPEN_P0), 0, 1);
  return t * t * (3 - 2 * t);
}

// World-space clip plane at the lintel: slats vanish into the header as the
// door rises, exactly like sections feeding onto the roll drum. The door only
// translates in y, so a fixed plane is correct. (Canvas must enable
// localClippingEnabled for material clip planes to apply.)
const LINTEL_CLIP = [new THREE.Plane(new THREE.Vector3(0, -1, 0), LINTEL_Y)];

export function GarageDoor({ pRef }: { pRef: React.MutableRefObject<number> }) {
  const doorRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!doorRef.current) return;
    doorRef.current.position.y = FLOOR_Y + doorProgress(pRef.current) * (DOOR_H + 0.12);
  });

  return (
    <group position={[0, 0, DOOR_Z]}>
      {/* Moving slat stack — local y=0 is the floor line */}
      <group ref={doorRef} position={[0, FLOOR_Y, 0]}>
        {Array.from({ length: SLATS }, (_, i) => (
          <mesh key={i} position={[0, SLAT_H * (i + 0.5), 0]}>
            {/* small y-gap between slats reads as the hinge groove */}
            <boxGeometry args={[DOOR_W, SLAT_H - 0.03, 0.09]} />
            <meshStandardMaterial
              color="#242e3c" metalness={0.72} roughness={0.34} envMapIntensity={0.7}
              clippingPlanes={LINTEL_CLIP}
            />
          </mesh>
        ))}
        {/* Backing sheet — seals the hinge grooves so the lit interior can't
            leak through the slat gaps when the door is closed */}
        <mesh position={[0, DOOR_H / 2, -0.06]}>
          <boxGeometry args={[DOOR_W, DOOR_H, 0.02]} />
          <meshStandardMaterial color="#0d1119" metalness={0.4} roughness={0.7} clippingPlanes={LINTEL_CLIP} />
        </mesh>
        {/* Bottom weather seal + cyan ground-effect strip (glows as it lifts) */}
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[DOOR_W, 0.05, 0.1]} />
          <meshStandardMaterial color="#0a0e14" roughness={0.9} clippingPlanes={LINTEL_CLIP} />
        </mesh>
        <mesh position={[0, 0.055, 0.052]}>
          <boxGeometry args={[DOOR_W - 0.6, 0.015, 0.006]} />
          <meshStandardMaterial
            color="#00b4d8" emissive="#00b4d8" emissiveIntensity={1.6}
            clippingPlanes={LINTEL_CLIP}
          />
        </mesh>
      </group>

      {/* Static frame: side track columns, header box, roll drum. Sit 0.06
          proud of the GLB facade plane (z≈5.98 world) so nothing z-fights
          the concrete corner strips left around the culled opening. */}
      <mesh position={[-(DOOR_W / 2 + 0.13), FLOOR_Y + (DOOR_H + 0.5) / 2, 0.06]}>
        <boxGeometry args={[0.3, DOOR_H + 0.5, 0.32]} />
        <meshStandardMaterial color="#131a26" metalness={0.6} roughness={0.42} />
      </mesh>
      <mesh position={[DOOR_W / 2 + 0.13, FLOOR_Y + (DOOR_H + 0.5) / 2, 0.06]}>
        <boxGeometry args={[0.3, DOOR_H + 0.5, 0.32]} />
        <meshStandardMaterial color="#131a26" metalness={0.6} roughness={0.42} />
      </mesh>
      {/* Header: spans lintel → roofline (2.52..3.30 world), hiding both the
          clipped door top and the culled gap below the GLB parapet */}
      <mesh position={[0, LINTEL_Y + 0.39, 0.06]}>
        <boxGeometry args={[DOOR_W + 0.56, 0.78, 0.36]} />
        <meshStandardMaterial color="#131a26" metalness={0.6} roughness={0.42} />
      </mesh>
      {/* Roll drum tucked behind the header, inside the garage */}
      <mesh position={[0, LINTEL_Y + 0.16, -0.32]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.17, 0.17, DOOR_W - 0.2, 20]} />
        <meshStandardMaterial color="#1c2531" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Header accent strip over the opening */}
      <mesh position={[0, LINTEL_Y + 0.05, 0.25]}>
        <boxGeometry args={[DOOR_W - 0.4, 0.02, 0.006]} />
        <meshStandardMaterial color="#00b4d8" emissive="#00b4d8" emissiveIntensity={1.2} />
      </mesh>

      {/* Lawn — sits 6cm below the floor line so the street model renders on
          top of it; this is the green ground beside/behind the garage and
          past the road's edges, dressed by <Greenery /> and fading into the
          horizon haze */}
      <mesh position={[0, FLOOR_Y - 0.06, 20]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[160, 120]} />
        <meshStandardMaterial color="#587f48" roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}

// ─── Garage shell ───────────────────────────────────────────────────────────
export function GarageModel() {
  const { scene } = useGLTF(GARAGE_GLB);
  const { gl } = useThree();
  const maxAniso = useMemo(() => gl.capabilities.getMaxAnisotropy(), [gl]);

  const model = useMemo(() => {
    const c = scene.clone(true);

    // ── Open the door end ──────────────────────────────────────────────
    // Cull every triangle whose centroid falls in the HOLE region (raw GLB
    // world space, matching scripts/probe-endwall.mjs): both layers of the
    // baked-shut door assembly go, while the floor (y<0.15), the roof
    // (y>4.22) and the side walls (|z|>4.95) stay. The concrete strips left
    // at the corners and the parapet above hide behind the roll-up door's
    // frame columns and header. Centroid test (not all-verts-inside) because
    // the wall quads are huge and would straddle any box.
    const HOLE = { x0: 5.02, y0: 0.15, y1: 4.22, hz: 4.95 };
    c.updateMatrixWorld(true);
    const va = new THREE.Vector3(), vb = new THREE.Vector3(), vc = new THREE.Vector3();
    c.traverse(obj => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const idx = mesh.geometry.getIndex();
      if (!idx) return;
      const geo = mesh.geometry.clone(); // GLTF cache shares geometries — never mutate
      const pos = geo.getAttribute('position') as THREE.BufferAttribute;
      const keep: number[] = [];
      for (let i = 0; i < idx.count; i += 3) {
        va.fromBufferAttribute(pos, idx.getX(i)).applyMatrix4(mesh.matrixWorld);
        vb.fromBufferAttribute(pos, idx.getX(i + 1)).applyMatrix4(mesh.matrixWorld);
        vc.fromBufferAttribute(pos, idx.getX(i + 2)).applyMatrix4(mesh.matrixWorld);
        const cx = (va.x + vb.x + vc.x) / 3;
        const cy = (va.y + vb.y + vc.y) / 3;
        const cz = (va.z + vb.z + vc.z) / 3;
        const inHole = cx > HOLE.x0 && cy > HOLE.y0 && cy < HOLE.y1 && Math.abs(cz) < HOLE.hz;
        if (!inHole) keep.push(idx.getX(i), idx.getX(i + 1), idx.getX(i + 2));
      }
      if (keep.length < idx.count) {
        geo.setIndex(keep);
        mesh.geometry = geo;
      }
    });

    c.traverse(obj => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(m => {
        const mat = m as THREE.MeshStandardMaterial;
        if (!mat.isMeshStandardMaterial) return;
        // The three *_light materials are flat emissive geometry (ceiling
        // strips, wall washers, floor runners). Tint them into the site's
        // cyan/white scheme and push them past the bloom threshold so THEY
        // are what glows — not the car badge.
        if (/blue_light|floor_light/.test(mat.name)) {
          mat.emissive.set('#00b4d8');
          mat.color.set('#03141c');
          mat.emissiveIntensity = mat.name === 'blue_light' ? 2.2 : 1.5;
        } else if (/white_light/.test(mat.name)) {
          mat.emissive.set('#e8f1fb');
          mat.color.set('#10161f');
          mat.emissiveIntensity = 2.4;
        } else {
          // Concrete/metal shell: matte, and damp the baked 0.2 grey emissive
          // factor so the room doesn't look self-lit and flat.
          mat.roughness = 0.85;
          mat.metalness = 0.08;
          mat.emissiveIntensity = 0.3;
          mat.envMapIntensity = 0.45;
        }
        for (const tex of [mat.map, mat.normalMap, mat.roughnessMap, mat.metalnessMap, mat.emissiveMap, mat.aoMap]) {
          if (tex && tex.anisotropy !== maxAniso) { tex.anisotropy = maxAniso; tex.needsUpdate = true; }
        }
        mat.needsUpdate = true;
      });
    });
    return c;
  }, [scene, maxAniso]);

  return (
    <primitive
      object={model}
      position={[0, FLOOR_Y, 0]}
      rotation={[0, -Math.PI / 2, 0]}
      // local z = room width (lands on world x after the -90° yaw)
      scale={[GARAGE_SCALE, GARAGE_SCALE, GARAGE_SCALE * WIDTH_STRETCH]}
      dispose={null}
    />
  );
}

useGLTF.preload(GARAGE_GLB);

// ─── Street outside the garage ──────────────────────────────────────────────
// road__avenue__street.glb: a 1000×1500 textured avenue. Probed in
// scripts/probe-road-slope.mjs: the drivable LANE is the plot's LOWEST
// surface — dead flat at raw y=-5 across the whole center strip (|x|<250) —
// flanked by raised platforms (y 11..15) carrying the striped barriers out
// at |x|≥300. Align the lane to the garage floor: the door opens straight
// onto asphalt, with the barrier platforms rising ~1 unit off to the sides.
const ROAD_GLB = '/road__avenue__street.glb';
const ROAD_SCALE = 0.05;
const ROAD_TOP = -5;     // raw height of the road lane

export function RoadModel() {
  const { scene } = useGLTF(ROAD_GLB);
  const { gl } = useThree();
  const maxAniso = useMemo(() => gl.capabilities.getMaxAnisotropy(), [gl]);

  const model = useMemo(() => {
    const c = scene.clone(true);
    c.traverse(obj => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(m => {
        const mat = m as THREE.MeshStandardMaterial;
        // Parts of the plot (the lane stretch near the garage) have flipped
        // normals and vanish from above unless both faces render
        mat.side = THREE.DoubleSide;
        if (mat.isMeshStandardMaterial) {
          for (const tex of [mat.map, mat.normalMap, mat.roughnessMap, mat.aoMap]) {
            if (tex && tex.anisotropy !== maxAniso) { tex.anisotropy = maxAniso; tex.needsUpdate = true; }
          }
        }
        mat.needsUpdate = true;
      });
    });
    return c;
  }, [scene, maxAniso]);

  // Long axis (raw z, 1500 units) runs down world +z — away from the door.
  // The plot starts at the door line (so it never overlaps the garage floor)
  // and the lane sits 4mm below the floor plane — an invisible step that
  // avoids any z-fighting at the threshold.
  return (
    <primitive
      object={model}
      position={[0, FLOOR_Y - 0.004 - ROAD_TOP * ROAD_SCALE, 6 + 750 * ROAD_SCALE]}
      scale={ROAD_SCALE}
      dispose={null}
    />
  );
}

// ─── Greenery — grass tufts + trees on the lawn ─────────────────────────────
// patch_of_grass.glb ships ~9k SEPARATE 8-triangle blade meshes (one draw
// call each = unusable). All blades get merged into a single geometry at
// load, then that one mesh is instanced by hand at a dozen spots. The soil
// base plate is dropped — tufts sit straight on the lawn plane.
// trees_low_poly.glb carries two distinct trees (tree4, tree6): each is
// extracted, re-centered onto its trunk base, and cloned across the spots.
const GRASS_GLB = '/patch_of_grass.glb';
const TREES_GLB = '/trees_low_poly.glb';
const LAWN_Y = FLOOR_Y - 0.06;

// Field zones to blanket with tufts: [x0, x1, z0, z1, step, sBase, sVar].
// step = grid spacing, sBase/sVar = tuft footprint scale range. Big cheap
// tufts fill the open fields; SMALL tufts (short blade reach → they pass the
// garage-clearance test much closer in) fill the verges along the walls and
// the road shoulders so no bald strips remain. Never the door corridor, the
// garage footprint, or the road plot itself.
const GRASS_ZONES: [number, number, number, number, number, number, number][] = [
  // open fields
  [-40,  -7, -20, 5.5, 4.4, 0.036, 0.0010],  // left of the garage
  [  7,  40, -20, 5.5, 4.4, 0.036, 0.0010],  // right of the garage
  [ -5,   5, -20, -10, 4.4, 0.036, 0.0010],  // behind the garage
  [-42, -26,   7,  52, 4.4, 0.036, 0.0010],  // left of the road
  [ 26,  42,   7,  52, 4.4, 0.036, 0.0010],  // right of the road
  // verge fills — small tufts hugging the garage walls and road shoulders
  [-9.5,  -6, -10, 5.5, 1.8, 0.016, 0.0006], // left wall verge
  [   6,  9.5, -10, 5.5, 1.8, 0.016, 0.0006], // right wall verge
  [-9.5,  9.5, -12, -9, 1.8, 0.016, 0.0006], // back verge
  [-28, -25.5,   7, 52, 1.8, 0.016, 0.0006], // left road shoulder
  [25.5,   28,   7, 52, 1.8, 0.016, 0.0006], // right road shoulder
];
// [kind, x, z, scale, yaw]
const TREE_SPOTS: ['tree4' | 'tree6', number, number, number, number][] = [
  ['tree4', -8.5,  5.5, 0.0032, 0.4], ['tree6',  9.0,  5.0, 0.0040, 2.1],
  ['tree6', -11.0, -2.0, 0.0036, 1.2], ['tree4', 12.0, -3.0, 0.0028, 3.6],
  ['tree4', -9.5, -11.0, 0.0030, 5.0], ['tree6', 10.5, -12.0, 0.0038, 0.9],
  ['tree6', -28.5, 18, 0.0042, 2.8], ['tree4', 28.5, 22, 0.0034, 4.4],
  ['tree4', -29.5, 38, 0.0030, 1.7], ['tree6', 30.0, 42, 0.0040, 5.6],
];

function GrassField() {
  const { scene } = useGLTF(GRASS_GLB);
  const { gl } = useThree();
  const maxAniso = useMemo(() => gl.capabilities.getMaxAnisotropy(), [gl]);

  const merged = useMemo(() => {
    scene.updateMatrixWorld(true);
    const geos: THREE.BufferGeometry[] = [];
    let mat: THREE.MeshStandardMaterial | null = null;
    // Optimization + shape: keep every 5th blade (~9k source meshes is far
    // denser than needed) and only blades inside an 85-unit disc of the plot
    // center — the merged tuft comes out round, so overlapping instances
    // tile into a continuous field with no straight seams.
    const DISC_R2 = 85 * 85;
    let i = 0;
    scene.traverse(obj => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const m = mesh.material as THREE.MeshStandardMaterial;
      if (m.name !== 'grass') return; // skip the Soil base plate
      mat = m;
      if (i++ % 5 !== 0) return;
      const e = mesh.matrixWorld.elements;
      if (e[12] * e[12] + e[14] * e[14] > DISC_R2) return;
      geos.push(mesh.geometry.clone().applyMatrix4(mesh.matrixWorld));
    });
    if (!geos.length || !mat) return null;
    const geo = mergeGeometries(geos, false);
    geos.forEach(g => g.dispose());
    if (!geo) return null;
    const material = mat as THREE.MeshStandardMaterial;
    material.side = THREE.DoubleSide; // blade cards read from both sides
    // Tint the neon blade texture down toward the lawn hue so the field
    // blends with the ground plane peeking through between blades
    material.color.set('#c2d0a6');
    if (material.map && material.map.anisotropy !== maxAniso) {
      material.map.anisotropy = maxAniso;
      material.map.needsUpdate = true;
    }
    return { geo, material };
  }, [scene, maxAniso]);

  // Blanket the zones with one InstancedMesh: a jittered grid of tufts,
  // stretched wide in XZ (coverage) but kept short in Y (ankle-height
  // blades) via non-uniform scale — the whole field is a single draw call.
  const field = useMemo(() => {
    if (!merged) return null;
    const spots: { x: number; z: number; ry: number; s: number; sy: number }[] = [];
    // Garage shell (outer faces + margin): no tuft's blade disc may reach
    // inside, or blades poke through the walls onto the showroom floor
    const GX = 5.8, GZ0 = -8.5, GZ1 = 6.3;
    let n = 0;
    for (const [x0, x1, z0, z1, step, sBase, sVar] of GRASS_ZONES) {
      const jit = step * 0.55; // jitter proportional to grid spacing
      for (let x = x0; x <= x1; x += step) {
        for (let z = z0; z <= z1; z += step) {
          // Deterministic jitter/variation from the index (no Math.random —
          // layout must be identical every mount)
          const h = (n * 2654435761) % 1000;
          n++;
          const sp = {
            x: x + ((h % 30) / 30 - 0.5) * jit,
            z: z + (((h >> 3) % 30) / 30 - 0.5) * jit,
            ry: (h % 63) / 10,
            s: sBase + (h % 11) * sVar,
            sy: 0.011 + (h % 7) * 0.001,   // blades ~0.14..0.21 tall
          };
          // Blades live inside an 85-unit disc of the tuft origin — reject
          // any placement whose disc overlaps the garage box
          const reach = 85 * sp.s + 0.5;
          if (
            sp.x + reach > -GX && sp.x - reach < GX &&
            sp.z + reach > GZ0 && sp.z - reach < GZ1
          ) continue;
          spots.push(sp);
        }
      }
    }
    const im = new THREE.InstancedMesh(merged.geo, merged.material, spots.length);
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const eu = new THREE.Euler();
    const p = new THREE.Vector3();
    const sc = new THREE.Vector3();
    spots.forEach((sp, i) => {
      eu.set(0, sp.ry, 0);
      q.setFromEuler(eu);
      // sunk a hair so blade bases never float above the lawn
      m4.compose(p.set(sp.x, LAWN_Y - 0.005, sp.z), q, sc.set(sp.s, sp.sy, sp.s));
      im.setMatrixAt(i, m4);
    });
    im.instanceMatrix.needsUpdate = true;
    // InstancedMesh culls by the BASE geometry's bounds (one tuft at the
    // origin), which would blink the whole field off-screen — disable it
    im.frustumCulled = false;
    return im;
  }, [merged]);

  return field ? <primitive object={field} /> : null;
}

function Trees() {
  const { scene } = useGLTF(TREES_GLB);
  const { gl } = useThree();
  const maxAniso = useMemo(() => gl.capabilities.getMaxAnisotropy(), [gl]);

  const templates = useMemo(() => {
    const src = scene.clone(true);
    src.updateMatrixWorld(true);
    src.traverse(obj => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(m => {
        const mat = m as THREE.MeshStandardMaterial;
        // Leaf cards export as alpha-BLEND: switch to alpha-test so
        // overlapping canopies don't sort against each other (and the sky)
        if (/leaves/i.test(mat.name)) {
          mat.alphaTest = 0.35;
          mat.depthWrite = true;
        }
        mat.side = THREE.DoubleSide;
        if (mat.isMeshStandardMaterial && mat.map && mat.map.anisotropy !== maxAniso) {
          mat.map.anisotropy = maxAniso;
          mat.map.needsUpdate = true;
        }
        mat.needsUpdate = true;
      });
    });
    const extract = (name: string) => {
      const node = src.getObjectByName(name);
      if (!node) return null;
      // Re-parent at identity keeping the world transform, then shift the
      // trunk base to the local origin so placement is just [x, LAWN_Y, z]
      const holder = new THREE.Group();
      holder.attach(node);
      const box = new THREE.Box3().setFromObject(node);
      const ctr = box.getCenter(new THREE.Vector3());
      node.position.x -= ctr.x;
      node.position.z -= ctr.z;
      node.position.y -= box.min.y;
      return holder;
    };
    return { tree4: extract('tree4'), tree6: extract('tree6') };
  }, [scene, maxAniso]);

  // One clone per spot (clones share geometry/materials — cheap). Built in
  // a single memo: hooks can't live inside the render loop below.
  const instances = useMemo(
    () => TREE_SPOTS.map(([kind, x, z, s, ry]) => {
      const tpl = templates[kind];
      return tpl ? { obj: tpl.clone(true), x, z, s, ry } : null;
    }),
    [templates],
  );

  return (
    <>
      {instances.map((it, i) => it && (
        <primitive
          key={i}
          object={it.obj}
          position={[it.x, LAWN_Y, it.z]}
          rotation={[0, it.ry, 0]}
          scale={it.s}
        />
      ))}
    </>
  );
}

export function Greenery() {
  return (
    <>
      <Suspense fallback={null}>
        <GrassField />
      </Suspense>
      <Suspense fallback={null}>
        <Trees />
      </Suspense>
    </>
  );
}

// ─── Section cars — the navigation ──────────────────────────────────────────
// One car per section, parked PERPENDICULAR to the side walls (tail to the
// wall, nose toward the center aisle). The car itself is the nav: hover for
// a floor glow + floating label, click to open the section overlay.
// They stream in lazily (own Suspense per car) so the main scene's loader
// never waits on them — together they're ~70MB of GLB.
const ACTIVE_P = 0.30;          // clickable once the camera is inside
const EDGE_CAR_LEN = 3.6;
const EDGE_X = 3.2;             // tail clears the wall light strips (inner face ≈ ±5.2), nose at |x|≈1.4

type EdgeCarDef = {
  id: SectionId; glb: string; num: string; title: string; sub: string;
  x: number; z: number;
  /** yaw: ±π/2 points the nose at the center aisle for models that face +z
      natively. The Countach faces -z, so its yaw is flipped 180°. */
  ry: number;
  /** this car's slice of the scroll timeline (the camera holds on it here —
      keep in sync with the WP stops in CarModel.tsx); lights the floor glow */
  w0: number; w1: number;
};
const EDGE_CARS: EdgeCarDef[] = [
  { id: 'projects',   glb: '/2017_lamborghini_centenario_lp770-4.glb',       num: '01', title: 'Projects',   sub: 'built work',   x: -EDGE_X, z:  2.3, ry:  Math.PI / 2, w0: 0.42, w1: 0.55 },
  { id: 'experience', glb: '/2021_lamborghini_countach_lpi_800-4.glb',       num: '02', title: 'Experience', sub: 'work history', x: -EDGE_X, z: -2.5, ry: -Math.PI / 2, w0: 0.56, w1: 0.69 },
  { id: 'skills',     glb: '/2024_lbsilhouette_works_murcielago_gt_evo.glb', num: '03', title: 'Skills',     sub: 'tech stack',   x:  EDGE_X, z:  2.3, ry: -Math.PI / 2, w0: 0.70, w1: 0.83 },
  { id: 'contact',    glb: '/ramp_car.glb',                                  num: '04', title: 'Contact',    sub: 'get in touch', x:  EDGE_X, z: -2.5, ry: -Math.PI / 2, w0: 0.84, w1: 0.95 },
];

function EdgeCar({ def, pRef, active }: {
  def: EdgeCarDef;
  pRef: React.MutableRefObject<number>;
  active: boolean;
}) {
  const { scene } = useGLTF(def.glb);
  const { gl } = useThree();
  const maxAniso = useMemo(() => gl.capabilities.getMaxAnisotropy(), [gl]);
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<THREE.MeshStandardMaterial>(null);

  // The floor glow tracks this car's slice of the scroll timeline: it wakes
  // up while the camera holds on the car (and on hover), tying the "one car
  // per section" pacing to a visible cue.
  useFrame(() => {
    const m = glowRef.current;
    if (!m) return;
    const p = pRef.current;
    const focus = hovered || (p >= def.w0 && p <= def.w1);
    m.emissiveIntensity = THREE.MathUtils.lerp(m.emissiveIntensity, focus ? 1.1 : 0.3, 0.08);
    m.opacity = THREE.MathUtils.lerp(m.opacity, focus ? 0.5 : 0.22, 0.08);
  });

  const model = useMemo(() => {
    const c = scene.clone(true);
    // Normalize like the hero car: fit a box (these GLBs arrive in wildly
    // different units), center at origin, then drop onto the floor.
    const box = new THREE.Box3().setFromObject(c);
    const size = box.getSize(new THREE.Vector3());
    const s = EDGE_CAR_LEN / Math.max(size.x, size.y, size.z);
    if (Number.isFinite(s) && s > 0) c.scale.setScalar(s);
    const box2 = new THREE.Box3().setFromObject(c);
    const ctr = box2.getCenter(new THREE.Vector3());
    c.position.sub(ctr);
    c.position.y += FLOOR_Y - (box2.min.y - ctr.y);

    c.traverse(obj => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(m => {
        const mat = m as THREE.MeshStandardMaterial;
        // Same see-through fix as the hero car, but light-touch: only flip
        // fully-opaque materials wrongly flagged as BLEND. Leave each model's
        // own metalness/roughness alone — these exporters got them right.
        if (mat.transparent && mat.opacity >= 0.99) {
          mat.transparent = false;
          mat.depthWrite = true;
        }
        if (mat.isMeshStandardMaterial) {
          if (mat.emissiveIntensity > 1.0) mat.emissiveIntensity = 1.0; // stay under bloom
          for (const tex of [mat.map, mat.normalMap, mat.roughnessMap, mat.metalnessMap, mat.emissiveMap, mat.aoMap]) {
            if (tex && tex.anisotropy !== maxAniso) { tex.anisotropy = maxAniso; tex.needsUpdate = true; }
          }
        }
        mat.needsUpdate = true;
      });
    });
    return c;
  }, [scene, maxAniso]);

  const open = (e: { stopPropagation: () => void }) => {
    if (pRef.current < ACTIVE_P) return;
    e.stopPropagation();
    document.body.style.cursor = '';
    useSiteStore.getState().openSection(def.id);
  };

  return (
    <group position={[def.x, 0, def.z]} rotation={[0, def.ry, 0]}>
      <primitive object={model} dispose={null} />

      {/* Floor glow — cyan pool under the car; brightens on hover AND while
          the scroll timeline is holding on this car (see useFrame above) */}
      <mesh position={[0, FLOOR_Y + 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.62, 1.08, 1]}>
        <circleGeometry args={[2.05, 40]} />
        <meshStandardMaterial
          ref={glowRef}
          color="#001820" emissive="#00b4d8"
          emissiveIntensity={0.3}
          transparent opacity={0.22}
          depthWrite={false}
        />
      </mesh>

      {/* Invisible hitbox over the whole car — the 3D click/hover target */}
      <mesh
        position={[0, FLOOR_Y + 0.62, 0]}
        onClick={open}
        onPointerEnter={() => {
          if (pRef.current < ACTIVE_P) return;
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={() => { setHovered(false); document.body.style.cursor = ''; }}
      >
        <boxGeometry args={[1.9, 1.24, EDGE_CAR_LEN + 0.15]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Floating label above the car — DOM chip, also a click target (drei's
          <Html> wrapper sits on top of the canvas, so clicks on the label
          never reach the hitbox mesh — handle them right in the DOM). Mounted
          only while the nav is active so the DOM doesn't linger at the top of
          the page. */}
      {active && (
        <Html position={[0, 0.98, 0]} center zIndexRange={[30, 0]}>
          <div
            onClick={open}
            onMouseEnter={() => {
              if (pRef.current < ACTIVE_P) return;
              setHovered(true);
            }}
            onMouseLeave={() => setHovered(false)}
            style={{
              fontFamily: 'monospace',
              textAlign: 'center',
              padding: '6px 14px',
              background: 'rgba(4,10,22,0.82)',
              border: `1px solid ${hovered ? 'rgba(0,229,255,0.85)' : 'rgba(0,180,216,0.4)'}`,
              boxShadow: hovered ? '0 0 18px rgba(0,229,255,0.35)' : 'none',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
          >
            <div style={{ fontSize: 8, letterSpacing: '0.2em', color: 'rgba(0,180,216,0.6)', textTransform: 'uppercase' }}>
              bay {def.num} · {def.sub}
            </div>
            <div style={{
              fontSize: 15, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: hovered ? '#00e5ff' : '#bfeaff',
              textShadow: hovered ? '0 0 10px rgba(0,229,255,0.8)' : '0 1px 2px rgba(0,0,0,0.9)',
              transition: 'color 0.2s, text-shadow 0.2s',
            }}>
              {def.title}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

export function EdgeCars({ pRef }: { pRef: React.MutableRefObject<number> }) {
  // Labels/interaction wake up once the camera is inside the garage — drei
  // <Html> DOM stays visible even inside an invisible group, so gate with
  // state (same pattern the old wall panels used).
  const [active, setActive] = useState(false);
  const prev = useRef(false);
  useFrame(() => {
    const v = pRef.current >= ACTIVE_P;
    if (v !== prev.current) { prev.current = v; setActive(v); }
  });

  return (
    <>
      {EDGE_CARS.map(d => (
        <Suspense key={d.id} fallback={null}>
          <EdgeCar def={d} pRef={pRef} active={active} />
        </Suspense>
      ))}
    </>
  );
}

