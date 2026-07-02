"use client";

import { Suspense, useEffect, useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, useProgress, Sky, Clouds, Cloud } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { GarageModel, GarageDoor, EdgeCars, RoadModel, Greenery, DOOR_Z } from './Garage';
import * as THREE from 'three';

// ─── Camera path waypoints — THE scroll choreography tuning surface ────────
// p = normalized page scroll (0→1). Tune positions here, not in the rig.
//
// Every section car owns its own slice of the timeline: the camera travels
// to it, then HOLDS on it (paired waypoints with a slow drift) while that
// car's floor glow lights up — one car at a time, museum-tour pace.
//
//   0.00–0.08  exterior hold — closed garage door, hero overlay
//   0.08–0.20  the door rolls up (Garage.tsx OPEN window), camera approaches
//   0.20–0.42  enter + glide down the center aisle — About overlay lives here
//   0.44–0.52  ── stop 1: Projects   (Centenario,  left front)
//   0.58–0.66  ── stop 2: Experience (Countach,    left rear)
//   0.72–0.80  ── stop 3: Skills     (GT EVO,      right front)
//   0.86–0.92  ── stop 4: Contact    (ramp car,    right rear)
//   0.92–1.00  showroom finale: high and wide, all four cars framed
type WaypointEntry = { p: number; pos: [number,number,number]; look: [number,number,number]; fov: number };
export const WP: WaypointEntry[] = [
  { p: 0.00, pos: [ 2.40, 1.70, 14.60], look: [ 0.00, 1.00, DOOR_Z], fov: 50 }, // hero — closed door
  { p: 0.08, pos: [ 2.10, 1.60, 14.00], look: [ 0.00, 1.00, DOOR_Z], fov: 50 }, // hero hold (barely creeps in)
  { p: 0.20, pos: [ 1.20, 1.25, 11.20], look: [ 0.00, 0.80, DOOR_Z], fov: 49 }, // door lifting, slow approach
  { p: 0.28, pos: [ 0.00, 0.95,  6.90], look: [ 0.00, 0.15, 0.50],   fov: 50 }, // at the threshold, showroom revealed
  { p: 0.40, pos: [-0.20, 0.95,  4.20], look: [ 0.00, 0.10, -1.00],  fov: 48 }, // gliding down the aisle — About card
  // stop 1 — Projects (car at x=-3.2, z=2.3)
  { p: 0.44, pos: [-0.60, 0.75,  4.20], look: [-3.00, 0.15, 2.30],   fov: 44 },
  { p: 0.52, pos: [-0.85, 0.72,  3.55], look: [-3.00, 0.15, 2.30],   fov: 44 }, // hold: slow drift across the nose
  // stop 2 — Experience (car at x=-3.2, z=-2.5)
  { p: 0.58, pos: [-0.55, 0.75, -0.70], look: [-3.00, 0.15, -2.50],  fov: 44 },
  { p: 0.66, pos: [-0.80, 0.72, -1.35], look: [-3.00, 0.15, -2.50],  fov: 44 }, // hold
  // stop 3 — Skills (car at x=3.2, z=2.3)
  { p: 0.72, pos: [ 0.60, 0.75,  4.20], look: [ 3.00, 0.15, 2.30],   fov: 44 },
  { p: 0.80, pos: [ 0.85, 0.72,  3.55], look: [ 3.00, 0.15, 2.30],   fov: 44 }, // hold
  // stop 4 — Contact (car at x=3.2, z=-2.5)
  { p: 0.86, pos: [ 0.55, 0.75, -0.70], look: [ 3.00, 0.15, -2.50],  fov: 44 },
  { p: 0.92, pos: [ 0.80, 0.72, -1.35], look: [ 3.00, 0.15, -2.50],  fov: 44 }, // hold
  { p: 1.00, pos: [ 0.00, 1.90, -7.20], look: [ 0.00, 0.20, 1.60],   fov: 60 }, // showroom finale — all four cars
];

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

// Mounts only once Suspense resolves — i.e. the GLBs are actually loaded.
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
  const smoothPos  = useRef(new THREE.Vector3(...WP[0].pos));
  const smoothLook = useRef(new THREE.Vector3(...WP[0].look));
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

// ─── Scene (inside Canvas context) ────────────────────────────────────────
function Scene({
  pRef,
  onModelReady,
}: {
  pRef:         React.MutableRefObject<number>;
  onModelReady: () => void;
}) {
  return (
    <Suspense fallback={null}>
      {/* Daytime sky dome — procedural sun + atmosphere. The haze fog blends
          the apron and clouds toward the horizon color. */}
      <Sky distance={4000} sunPosition={[6, 3.5, 10]} turbidity={5} rayleigh={1.1} mieCoefficient={0.004} mieDirectionalG={0.85} />
      <fog attach="fog" args={['#cfe0ee', 22, 75]} />
      {/* Drifting clouds — behind the garage for the hero shot, and out past
          the apron (+z) so the open door frames them at the finale */}
      <Clouds material={THREE.MeshBasicMaterial} limit={300}>
        <Cloud seed={1}  segments={16} bounds={[9, 2, 4]}  volume={7} opacity={0.75} speed={0.1}  color="#ffffff" position={[-16, 11, -30]} />
        <Cloud seed={7}  segments={16} bounds={[10, 2, 5]} volume={8} opacity={0.7}  speed={0.08} color="#f6fbff" position={[14, 13, -38]} />
        <Cloud seed={3}  segments={14} bounds={[12, 3, 5]} volume={9} opacity={0.6}  speed={0.06} color="#ffffff" position={[0, 16, -50]} />
        <Cloud seed={11} segments={14} bounds={[9, 2, 4]}  volume={7} opacity={0.7}  speed={0.1}  color="#ffffff" position={[18, 10, 26]} />
        <Cloud seed={5}  segments={14} bounds={[8, 2, 4]}  volume={6} opacity={0.65} speed={0.12} color="#f8fcff" position={[-15, 12, 30]} />
      </Clouds>
      {/* IBL: the metallic car paint reads almost entirely off this map. */}
      <Environment preset="warehouse" background={false} environmentIntensity={0.7} />

      {/* Sunlight — warm key streaming toward the garage front */}
      <directionalLight position={[12, 16, 24]} intensity={2.4} color="#fff2d9" />
      {/* Ambient + hemisphere fill — daylight bounce, keeps the enclosed
          garage interior readable */}
      <ambientLight intensity={0.45} color="#dce8f5" />
      <hemisphereLight args={['#dbeaff', '#68707c', 0.5]} />

      {/* Garage ceiling lights — two bays of overhead wash */}
      <pointLight position={[0, 2.9,  2.4]} intensity={5}   color="#dfe9f5" distance={13} decay={2} />
      <pointLight position={[0, 2.9, -2.6]} intensity={4.5} color="#dfe9f5" distance={13} decay={2} />

      {/* Cyan rim lights along the center aisle — studio underlit vibe */}
      <pointLight position={[ 2.2, -0.2,  0.8]} intensity={2}   color="#00b4d8" distance={7} decay={2} />
      <pointLight position={[-2.4, -0.2, -0.6]} intensity={1.5} color="#005588" distance={6} decay={2} />

      <CameraRig pRef={pRef} />
      <GarageModel />
      <GarageDoor pRef={pRef} />
      <EdgeCars pRef={pRef} />
      {/* Street outside — 15MB of texture, streams in behind the main scene */}
      <Suspense fallback={null}>
        <RoadModel />
      </Suspense>
      {/* Grass tufts + trees on the lawn (lazy, own inner Suspense per model) */}
      <Greenery />
      <ModelReady onReady={onModelReady} />

      {/* multisampling={4}: MSAA in the composer so edges stay crisp (the
          Canvas `antialias` is bypassed once we render through EffectComposer).
          Threshold 1.0: ONLY the garage light strips (emissive 1.5–2.4) bloom.
          The car's Lamborghini badge is capped at emissive 1.0 in CarMesh, so
          it stays under the threshold and renders pin-sharp — no glow smear. */}
      <EffectComposer multisampling={4}>
        <Bloom intensity={0.3} luminanceThreshold={1.0} luminanceSmoothing={0.12} mipmapBlur />
      </EffectComposer>
    </Suspense>
  );
}

// ─── Public export ────────────────────────────────────────────────────────
export default function CarModel({ pRef }: { pRef: React.MutableRefObject<number> }) {
  // Flips when the GLBs have actually loaded (not just when the GL context exists)
  const [ready, setReady] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Canvas fades/scales in over 0.6s once the models have streamed in */}
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
          camera={{ position: WP[0].pos, fov: WP[0].fov }}
          // localClippingEnabled: the roll-up door slats clip at the lintel
          gl={{ antialias: true, alpha: true, toneMappingExposure: 0.9, localClippingEnabled: true }}
          dpr={[1, 2]}
          style={{ background: 'transparent', width: '100%', height: '100%' }}
        >
          <Scene pRef={pRef} onModelReady={() => setReady(true)} />
        </Canvas>
      </div>

      {!ready && <LoaderOverlay />}
    </div>
  );
}
