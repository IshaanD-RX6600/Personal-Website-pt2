"use client";

import { Suspense, useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, Html, useProgress } from '@react-three/drei';
import GearShifter, { GearShifterFallback } from './GearShifter';
import * as THREE from 'three';

// ─── Camera path waypoints ─────────────────────────────────────────────────
type WaypointEntry = { p: number; pos: [number,number,number]; look: [number,number,number]; fov: number };
// Each entry: p=scroll progress (0→1), pos=camera position, look=look-at, fov
const WP: WaypointEntry[] = [
  // exterior 3/4 view — holds during auto-rotation phase
  { p: 0.00, pos: [2.4,  1.05, 4.4],  look: [0,    0.28,  0],    fov: 42 },
  { p: 0.15, pos: [2.4,  1.05, 4.4],  look: [0,    0.28,  0],    fov: 42 },
  // dolly toward windshield
  { p: 0.40, pos: [0.0,  0.84, 1.05], look: [0,    0.66,  0],    fov: 36 },
  // through glass — land in driver seat
  { p: 0.52, pos: [-0.14, 0.61, 0.0], look: [0.0,  0.56, -1.6],  fov: 76 },
  // interior pan: steering wheel / instrument cluster → Projects
  { p: 0.62, pos: [-0.14, 0.61, 0.0], look: [-0.3, 0.46, -1.0],  fov: 76 },
  // infotainment → About
  { p: 0.72, pos: [-0.14, 0.61, 0.0], look: [0.12, 0.38, -1.1],  fov: 76 },
  // gear shifter → Skills
  { p: 0.82, pos: [-0.14, 0.61, 0.0], look: [0.12, 0.28, -0.55], fov: 72 },
  // rearview mirror → Experience
  { p: 0.90, pos: [-0.14, 0.61, 0.0], look: [0.01, 0.70, -0.55], fov: 70 },
  // passenger seat → Contact
  { p: 1.00, pos: [-0.14, 0.61, 0.0], look: [0.55, 0.34, -0.80], fov: 68 },
];

// Navigation is now handled entirely by GearShifter — no separate hotspot pins.

const GLB = '/2024_lbsilhouette_works_murcielago_gt_evo.glb';

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

// ─── Loader (shown via Html while GLB streams) ────────────────────────────
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#00b4d8', letterSpacing: '0.15em', textAlign: 'center', userSelect: 'none' }}>
        <div style={{ marginBottom: 8, textTransform: 'uppercase', opacity: 0.8 }}>Loading</div>
        <div style={{ width: 120, height: 1, background: 'rgba(0,180,216,0.18)', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, width: `${progress}%`, background: '#00b4d8', transition: 'width 0.2s ease' }} />
        </div>
        <div style={{ marginTop: 6, opacity: 0.4 }}>{Math.round(progress)}%</div>
      </div>
    </Html>
  );
}

// ─── Camera rig ───────────────────────────────────────────────────────────
function CameraRig({ pRef }: { pRef: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  const smoothPos  = useRef(new THREE.Vector3(2.4, 1.05, 4.4));
  const smoothLook = useRef(new THREE.Vector3(0, 0.28, 0));

  useFrame(() => {
    const { pos, look, fov } = samplePath(pRef.current);
    smoothPos.current.lerp(pos,   0.055);
    smoothLook.current.lerp(look, 0.055);
    camera.position.copy(smoothPos.current);
    camera.lookAt(smoothLook.current);
    const cam = camera as THREE.PerspectiveCamera;
    if (cam.isPerspectiveCamera) {
      cam.fov = THREE.MathUtils.lerp(cam.fov, fov, 0.055);
      cam.updateProjectionMatrix();
    }
  });

  return null;
}

// ─── Car mesh ─────────────────────────────────────────────────────────────
function CarMesh({ pRef }: { pRef: React.MutableRefObject<number> }) {
  const { scene } = useGLTF(GLB);
  const groupRef  = useRef<THREE.Group>(null);
  const rotY      = useRef(0);

  const model = useMemo(() => {
    const c = scene.clone(true);
    // Normalise scale to fit a 4-unit bounding box
    const sz  = new THREE.Box3().setFromObject(c).getSize(new THREE.Vector3());
    const max = Math.max(sz.x, sz.y, sz.z);
    if (max > 0) c.scale.setScalar(4 / max);
    // Centre at origin
    const ctr = new THREE.Box3().setFromObject(c).getCenter(new THREE.Vector3());
    c.position.sub(ctr);
    // Polish materials: glossy black paint
    c.traverse(obj => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(mat => {
        if (mat instanceof THREE.MeshStandardMaterial) {
          mat.roughness = 0.30;
          mat.metalness = 0.82;
          mat.needsUpdate = true;
        }
      });
    });
    return c;
  }, [scene]);

  useFrame((_, dt) => {
    if (!groupRef.current) return;
    // Auto-rotate eases to 0 by p=0.20
    const speed = THREE.MathUtils.lerp(0.28, 0, Math.min(pRef.current / 0.20, 1));
    rotY.current += dt * speed;
    groupRef.current.rotation.y = rotY.current;
  });

  return (
    <group ref={groupRef}>
      <primitive object={model} dispose={null} />
    </group>
  );
}

useGLTF.preload(GLB);

// ─── Scene (inside Canvas context) ────────────────────────────────────────
function Scene({ pRef, reducedMotion }: { pRef: React.MutableRefObject<number>; reducedMotion: boolean }) {
  return (
    <Suspense fallback={<Loader />}>
      <Environment preset="warehouse" background={false} />

      {/* Ambient rim light — cool blue tint */}
      <ambientLight intensity={0.55} color="#a0b8d8" />

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
      <GearShifter pRef={pRef} reducedMotion={reducedMotion} />
    </Suspense>
  );
}

// ─── Public export ────────────────────────────────────────────────────────
export default function CarModel({
  scrollProgress = 0,
  reducedMotion  = false,
}: {
  scrollProgress?: number;
  reducedMotion?:  boolean;
}) {
  const [ready, setReady] = useState(false);
  const pRef = useRef<number>(0);
  // Lock to 0 (exterior static view) when user prefers reduced motion
  pRef.current = reducedMotion ? 0 : scrollProgress;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        opacity: ready ? 1 : 0,
        transition: 'opacity 1.2s ease',
      }}
    >
      <Canvas
        camera={{ position: [2.4, 1.05, 4.4], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
        onCreated={() => setReady(true)}
      >
        <Scene pRef={pRef} reducedMotion={reducedMotion} />
      </Canvas>

      {/* Flat SVG fallback — overlaid when animation is disabled */}
      {reducedMotion && (
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          zIndex: 20,
        }}>
          <GearShifterFallback />
        </div>
      )}
    </div>
  );
}
