"use client";

import { Suspense, useEffect, useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, useProgress } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import GearShifter, { GATE_ANCHOR } from './GearShifter';
import * as THREE from 'three';

// ─── Camera path waypoints — THE scroll choreography tuning surface ────────
// p = normalized page scroll (0→1). Tune positions here, not in the rig.
//
//   0.00–0.20  exterior 3/4 hold — car auto-rotates to a stop, hero overlay
//   0.20–0.50  fly-in: windshield approach, pass through glass — About overlay
//   0.50–1.00  cockpit: settle, then push tight onto the gear shifter (nav)
type WaypointEntry = { p: number; pos: [number,number,number]; look: [number,number,number]; fov: number };
// Scene anatomy (normalized: car fits a 4-unit box, centered at origin —
// measured from GLB vertices, see scripts/measure-cabin.mjs):
//   ground y=-0.485 · roof y≈+0.485 · nose +z · rear wing -z · steering on +x
//   cabin: x∈[-0.7,0.7] y∈[-0.42,0.41] z∈[-0.48,1.03]
//   console tunnel top y≈-0.165 (flat over z 0.20–0.44) · seats inner edges x≈∓0.11
// Interior look targets derive from the gear gate's measured anchor so the
// shifter stays framed wherever the measurements put it.
const GA = GATE_ANCHOR;
export const WP: WaypointEntry[] = [
  { p: 0.00, pos: [ 2.40, 1.05, 4.40], look: [ 0.00,  0.28, 0.00], fov: 42 }, // hero 3/4 view
  { p: 0.20, pos: [ 2.40, 1.05, 4.40], look: [ 0.00,  0.28, 0.00], fov: 42 }, // hold (rotation stops here)
  { p: 0.35, pos: [ 0.00, 0.35, 2.60], look: [ 0.00,  0.05, 0.50], fov: 40 }, // nose / windshield approach
  { p: 0.50, pos: [-0.28, 0.12, 0.15], look: [ 0.00,  0.00, 1.00], fov: 70 }, // through glass → driver seat, dash view
  // 0.62–1.00: driver's-seat POV — settle into the seat, then glance
  // down-and-forward at the gate, windshield/dash beyond for context
  { p: 0.62, pos: [-0.26, 0.13, 0.05], look: [GA.x, GA.y + 0.03, GA.z + 0.05], fov: 60 }, // glance from the seat toward the console
  { p: 0.80, pos: [-0.18, 0.17, -0.08], look: [GA.x, GA.y, GA.z], fov: 54 }, // over the driver's knee, gate framed
  { p: 1.00, pos: [-0.09, 0.12, -0.04], look: [GA.x, GA.y, GA.z], fov: 50 }, // driver's glance at the shifter — nav mode
];

const GLB = '/car.glb';

// ─── Waypoint interpolation (easeInOut between adjacent points) ────────────
function samplePath(t: number) {
  const c = Math.max(0, Math.min(1, t));
  let lo: WaypointEntry = WP[0], hi: WaypointEntry = WP[WP.length - 1];
  for (let i = 0; i < WP.length - 1; i++) {
    if (c >= WP[i].p && c <= WP[i + 1].p) { lo = WP[i]; hi = WP[i + 1]; break; }
  }
  const span = hi.p - lo.p;
  const raw  = span < 1e-5 ? 0 : (c - lo.p) / span;
  const a    = raw < 0.5 ? 2 * raw * raw : -1 + (4 - 2 * raw) * raw;
  return {
    pos:  new THREE.Vector3(
      THREE.MathUtils.lerp(lo.pos[0], hi.pos[0], a),
      THREE.MathUtils.lerp(lo.pos[1], hi.pos[1], a),
      THREE.MathUtils.lerp(lo.pos[2], hi.pos[2], a),
    ),
    look: new THREE.Vector3(
      THREE.MathUtils.lerp(lo.look[0], hi.look[0], a),
      THREE.MathUtils.lerp(lo.look[1], hi.look[1], a),
      THREE.MathUtils.lerp(lo.look[2], hi.look[2], a),
    ),
    fov: THREE.MathUtils.lerp(lo.fov, hi.fov, a),
  };
}

// ─── Loader overlay — plain HTML, lives OUTSIDE the fading canvas wrapper ──
// useProgress is a global store, so it works outside the Canvas too.
function LoaderOverlay() {
  const { progress } = useProgress();
  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
      fontFamily: 'monospace', fontSize: 11, color: '#00b4d8', letterSpacing: '0.15em',
      textAlign: 'center', userSelect: 'none', pointerEvents: 'none',
    }}>
      <div style={{ marginBottom: 8, textTransform: 'uppercase', opacity: 0.8 }}>Loading</div>
      <div style={{ width: 120, height: 1, background: 'rgba(0,180,216,0.18)', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, width: `${progress}%`, background: '#00b4d8', transition: 'width 0.2s ease' }} />
      </div>
      <div style={{ marginTop: 6, opacity: 0.4 }}>{Math.round(progress)}%</div>
    </div>
  );
}

// Mounts only once Suspense resolves — i.e. the GLB is actually loaded.
function ModelReady({ onReady }: { onReady: () => void }) {
  useEffect(() => { onReady(); }, [onReady]);
  return null;
}

// ─── Camera rig ───────────────────────────────────────────────────────────
// Dev tuning: append ?cam=x,y,z&look=x,y,z&fov=50 to the URL to pin the
// camera and find new waypoint coordinates without scrolling.
function parseDebugCam() {
  if (typeof window === 'undefined') return null;
  const q = new URLSearchParams(window.location.search);
  const cam = q.get('cam'), look = q.get('look');
  if (!cam || !look) return null;
  const v = (s: string) => s.split(',').map(Number) as [number, number, number];
  return { pos: v(cam), look: v(look), fov: Number(q.get('fov') ?? 50) };
}

// Waypoint FOVs are authored for a wide desktop viewport. THREE's `fov` is
// VERTICAL, so on a tall/narrow (portrait phone) screen the horizontal view
// collapses and the wide car gets cropped off the sides. Re-derive the vertical
// fov from a fixed horizontal target so framing stays consistent on any aspect.
const DESIGN_ASPECT = 16 / 9;
const MAX_FOV = 88; // clamp so extreme portrait widens instead of going fisheye
function fovForAspect(authoredFov: number, aspect: number) {
  if (aspect >= DESIGN_ASPECT) return authoredFov;
  const hFov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(authoredFov) / 2) * DESIGN_ASPECT);
  const vFov = 2 * Math.atan(Math.tan(hFov / 2) / aspect);
  return Math.min(THREE.MathUtils.radToDeg(vFov), MAX_FOV);
}

function CameraRig({ pRef }: { pRef: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  const smoothPos  = useRef(new THREE.Vector3(2.4, 1.05, 4.4));
  const smoothLook = useRef(new THREE.Vector3(0, 0.28, 0));
  const debug      = useMemo(parseDebugCam, []);

  useFrame((state, dt) => {
    const { pos, look, fov } = debug
      ? { pos: new THREE.Vector3(...debug.pos), look: new THREE.Vector3(...debug.look), fov: debug.fov }
      : samplePath(pRef.current);
    // Exponential damping — frame-rate independent (≈ lerp 0.055 @ 60fps)
    const a = 1 - Math.exp(-3.5 * dt);
    smoothPos.current.lerp(pos,   a);
    smoothLook.current.lerp(look, a);
    camera.position.copy(smoothPos.current);
    camera.lookAt(smoothLook.current);
    const cam = camera as THREE.PerspectiveCamera;
    if (cam.isPerspectiveCamera) {
      const targetFov = fovForAspect(fov, state.size.width / state.size.height);
      cam.fov = THREE.MathUtils.lerp(cam.fov, targetFov, a);
      cam.updateProjectionMatrix();
    }
  });

  return null;
}

// ─── Car mesh ─────────────────────────────────────────────────────────────
function CarMesh({ pRef }: { pRef: React.MutableRefObject<number> }) {
  const { scene } = useGLTF(GLB);
  const { gl }    = useThree();
  // Max anisotropic filtering the GPU supports (usually 16). Default is 1 (off),
  // which is why textures viewed at grazing angles — carbon console, floor,
  // leather — smear into blur. Applied to every texture below.
  const maxAniso  = useMemo(() => gl.capabilities.getMaxAnisotropy(), [gl]);
  const groupRef  = useRef<THREE.Group>(null);
  const rotY      = useRef(0);
  // Freeze rotation while tuning with the ?cam= debug camera
  const frozen    = useMemo(
    () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('cam'),
    [],
  );

  const model = useMemo(() => {
    const c = scene.clone(true);
    // Normalise scale to fit a 4-unit bounding box
    const sz  = new THREE.Box3().setFromObject(c).getSize(new THREE.Vector3());
    const max = Math.max(sz.x, sz.y, sz.z);
    if (max > 0) c.scale.setScalar(4 / max);
    // Centre at origin
    const ctr = new THREE.Box3().setFromObject(c).getCenter(new THREE.Vector3());
    c.position.sub(ctr);
    // Remove the OEM shifter bracket: the vertical rectangular carbon frame
    // standing on the tunnel just ahead of our gear gate (measured at
    // x -0.135..-0.025 · z 0.385..0.535 — scripts/measure-cabin.mjs). It is
    // MERGED into the big Interior mesh, so hiding whole meshes can't work;
    // cull its triangles instead. The opening it leaves is capped by the dark
    // console panel rendered below the <primitive>.
    const CULL = { x0: -0.135, x1: -0.025, y0: -0.172, y1: 0.08, z0: 0.385, z1: 0.535 };
    c.updateMatrixWorld(true);
    const v = new THREE.Vector3();
    c.traverse(obj => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || !/Interior/.test(mesh.name)) return;
      const idx = mesh.geometry.getIndex();
      if (!idx) return;
      const geo = mesh.geometry.clone(); // GLTF cache shares geometries — never mutate
      const pos = geo.getAttribute('position');
      const keep: number[] = [];
      for (let i = 0; i < idx.count; i += 3) {
        let allIn = true;
        for (let k = 0; k < 3; k++) {
          v.fromBufferAttribute(pos as THREE.BufferAttribute, idx.getX(i + k)).applyMatrix4(mesh.matrixWorld);
          if (v.x < CULL.x0 || v.x > CULL.x1 || v.y < CULL.y0 || v.y > CULL.y1 || v.z < CULL.z0 || v.z > CULL.z1) {
            allIn = false;
            break;
          }
        }
        if (!allIn) for (let k = 0; k < 3; k++) keep.push(idx.getX(i + k));
      }
      if (keep.length < idx.count) {
        geo.setIndex(keep);
        mesh.geometry = geo;
      }
    });

    // ── Diagnostics (append to URL): tells "culling" apart from "missing geo"
    //   ?diag=back      → render ONLY backfaces. If the hollow areas fill in,
    //                     the geometry EXISTS and the issue is front-face
    //                     culling. If they stay empty, the faces are MISSING.
    //   ?diag=wire      → wireframe: triangles in the gap ⇒ culling; bare
    //                     space ⇒ genuinely no geometry there.
    //   ?diag=normals   → color = normal direction. A panel whose inside and
    //                     outside read as the SAME color with a hard flip is
    //                     a flipped-normal / inside-out mesh.
    //   ?diag=recompute → rebuild normals from winding (test the flip theory;
    //                     destroys authored smoothing — diagnostic only).
    const diag = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('diag')
      : null;

    // Polish materials: glossy black paint, made to read as SOLID.
    //  • side=DoubleSide   → back-facing interior polys render instead of
    //                        culling to a transparent shell (the hollow look)
    //  • shadowSide        → keep those now-visible backfaces out of self-
    //                        shadow black if shadows get enabled on <Canvas>
    //  • envMapIntensity   → at metalness 0.82 the surfaces are lit almost
    //                        entirely by the <Environment> map; lift it so the
    //                        enclosed cabin isn't near-black
    c.traverse(obj => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      if (diag === 'recompute') {
        mesh.geometry = mesh.geometry.clone(); // never mutate the GLTF cache
        mesh.geometry.computeVertexNormals();
      }
      if (diag === 'normals') {
        mesh.material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
        return;
      }

      const isGlass  = /Window/i.test(mesh.name);  // real glass — keep see-through
      const isCutout = /Grille/i.test(mesh.name);  // alpha-textured grille holes

      (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(mat => {
        // ROOT CAUSE of the "hollow" look: this GLB exports nearly every
        // material with alphaMode=BLEND — all 22 are flagged transparent in
        // the source (run scripts/inspect-materials.mjs), including solid
        // carbon/leather/plastic with baseColor alpha=1. A transparent
        // material renders in the back-to-front blended pass and lets you see
        // straight through it to the backfaces behind — THAT is the hollow
        // shell, not backface culling (every material is already DoubleSide
        // in the source). Force everything opaque except the actual glass and
        // the alpha-cutout grille.
        if (!isGlass && !isCutout && mat.transparent) {
          mat.transparent = false;
          mat.depthWrite  = true;
        }
        if (mat instanceof THREE.MeshStandardMaterial) {
          mat.roughness = 0.30;
          mat.metalness = 0.82;
          mat.envMapIntensity = 1.0;
          mat.shadowSide = THREE.DoubleSide;
          mat.wireframe = diag === 'wire';
          // The interior texture bakes the glowing badge / dash screen / gauges
          // as EMISSIVE at KHR strength ~3 (lights at ~4) — at close range that
          // clips to a featureless white blob and feeds bloom. Cap it so the
          // lettering keeps its detail and reads as backlit chrome, not a flare.
          if (mat.emissiveIntensity > 1.2) mat.emissiveIntensity = 1.2;
          // Crisp textures at grazing angles (carbon, floor, leather)
          for (const tex of [mat.map, mat.normalMap, mat.roughnessMap, mat.metalnessMap, mat.emissiveMap, mat.aoMap]) {
            if (tex && tex.anisotropy !== maxAniso) { tex.anisotropy = maxAniso; tex.needsUpdate = true; }
          }
        }
        mat.side = diag === 'back' ? THREE.BackSide : THREE.DoubleSide;
        mat.needsUpdate = true;
      });
    });
    return c;
  }, [scene, maxAniso]);

  useFrame((_, dt) => {
    if (!groupRef.current) return;
    if (frozen) { groupRef.current.rotation.y = 0; return; }
    const p = pRef.current;
    if (p < 0.20) {
      // Auto-rotate eases to 0 by p=0.20
      const speed = THREE.MathUtils.lerp(0.28, 0, Math.min(p / 0.20, 1));
      rotY.current += dt * speed;
    } else {
      // The interior waypoints (driver seat, gear shifter) are authored
      // against the car's original orientation — settle the accumulated
      // rotation onto the nearest full turn before the camera flies in.
      const target = Math.round(rotY.current / (Math.PI * 2)) * Math.PI * 2;
      rotY.current = THREE.MathUtils.damp(rotY.current, target, 2.5, dt);
    }
    groupRef.current.rotation.y = rotY.current;
  });

  return (
    <group ref={groupRef}>
      <primitive object={model} dispose={null} />
      {/* Dark console panel capping the opening left by the culled OEM
          shifter bracket (same measured footprint, slightly padded) */}
      <mesh position={[-0.08, -0.166, 0.46]}>
        <boxGeometry args={[0.12, 0.012, 0.16]} />
        <meshStandardMaterial color="#10141a" metalness={0.3} roughness={0.6} />
      </mesh>
    </group>
  );
}

useGLTF.preload(GLB);

// ─── Scene (inside Canvas context) ────────────────────────────────────────
function Scene({
  pRef,
  onNavScroll,
  onModelReady,
}: {
  pRef:         React.MutableRefObject<number>;
  onNavScroll:  (p: number) => void;
  onModelReady: () => void;
}) {
  return (
    <Suspense fallback={null}>
      {/* Opaque background — EffectComposer + transparent canvas causes alpha fringing */}
      <color attach="background" args={['#0a1628']} />
      {/* IBL: the metallic cabin surfaces read almost entirely off this map.
          environmentIntensity lifts the enclosed interior out of near-black
          without washing out the studio key/fill spots below. */}
      <Environment preset="warehouse" background={false} environmentIntensity={0.85} />

      {/* Ambient rim light — cool blue tint */}
      <ambientLight intensity={0.5} color="#a0b8d8" />
      {/* Hemisphere fill — soft sky/ground gradient that reaches up into the
          cabin roof and down across the seats so interior faces aren't flat-dark */}
      <hemisphereLight args={['#bcd3f0', '#202830', 0.45]} />
      {/* Interior bounce — a dim fill sitting inside the cabin so console,
          dash and door cards stay readable in the tight driver-POV framing */}
      <pointLight position={[0, 0.1, 0.4]} intensity={0.6} color="#cfe2ff" distance={3} decay={2} />

      {/* Key: overhead front-right */}
      <spotLight position={[4, 8, 6]}   angle={0.22} penumbra={1} intensity={7}   color="#ffffff" castShadow />
      {/* Fill: left side */}
      <spotLight position={[-4, 5, 3]}  angle={0.35} penumbra={1} intensity={3.5} color="#cce4ff" />
      {/* Back: opposite windshield */}
      <spotLight position={[0, 4, -6]}  angle={0.30} penumbra={1} intensity={2.5} color="#ffffff" />

      {/* Cyan rim lights on the ground plane — gives that studio underlit vibe */}
      <pointLight position={[1.5, -1, 0.5]}  intensity={2}   color="#00b4d8" distance={7} decay={2} />
      <pointLight position={[-2,  -1, 0.5]}  intensity={1.5} color="#005588" distance={5} decay={2} />

      <CameraRig pRef={pRef} />
      <CarMesh   pRef={pRef} />
      <GearShifter pRef={pRef} onNavScroll={onNavScroll} />
      <ModelReady onReady={onModelReady} />

      {/* multisampling={4}: MSAA in the composer so edges stay crisp (the
          Canvas `antialias` is bypassed once we render through EffectComposer).
          Bloom threshold raised to 1.0 + lower intensity so ONLY the emissive
          cyan accents bloom — the bright metal reflections no longer smear a
          haze over the cabin (that was the "blurry" look). 0.9 (not 1.0) keeps
          the accent glow alive under r3f's default ACES tone mapping. */}
      <EffectComposer multisampling={4}>
        <Bloom intensity={0.25} luminanceThreshold={0.9} luminanceSmoothing={0.1} mipmapBlur />
      </EffectComposer>
    </Suspense>
  );
}

// ─── Public export ────────────────────────────────────────────────────────
export default function CarModel({
  pRef,
  onNavScroll,
}: {
  pRef:        React.MutableRefObject<number>;
  onNavScroll: (p: number) => void;
}) {
  // Flips when the GLB has actually loaded (not just when the GL context exists)
  const [ready, setReady] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Canvas fades/scales in over 0.6s once the GLB has streamed in */}
      <div
        style={{
          width: '100%',
          height: '100%',
          opacity: ready ? 1 : 0,
          transform: ready ? 'scale(1)' : 'scale(0.97)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        <Canvas
          camera={{ position: [2.4, 1.05, 4.4], fov: 42 }}
          gl={{ antialias: true, alpha: true, toneMappingExposure: 0.9 }}
          dpr={[1, 2]}
          style={{ background: 'transparent', width: '100%', height: '100%' }}
        >
          <Scene pRef={pRef} onNavScroll={onNavScroll} onModelReady={() => setReady(true)} />
        </Canvas>
      </div>

      {!ready && <LoaderOverlay />}
    </div>
  );
}