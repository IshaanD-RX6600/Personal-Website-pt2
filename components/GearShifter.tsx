"use client";

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSiteStore, type SectionId } from '@/stores/useSiteStore';

// ─── Gate geometry constants ─────────────────────────────────────────────────
// All positions are LOCAL offsets from GATE_CENTER (applied as: world = center + local)
const LANE        = 0.055; // x-offset between lanes
const SLOT        = 0.055; // z-offset for engaged gear
const R_EXT       = 0.042; // additional x-offset for Reverse
const SNAP_THRESH = SLOT * 0.88;
const SPRING_K    = 200;
const DAMPING     = 26;

// ─── Gate frame: derived from measured cabin geometry — nothing hand-placed ──
// Measurements come from the real GLB vertex data (run: node scripts/measure-cabin.mjs),
// expressed in the normalized car space CarModel.tsx produces (4-unit box
// centered at origin · nose/windshield = +z · steering column on +x).
//
// FORWARD: local +z = toward the windshield (+z = nose per scene anatomy).
// Gears 1/3/5 (lz>0) push toward the glass; R/2/4/6 pull toward the driver.
const SEAT_INNER_L = -0.115; // left seat inner edge  (measured, z∈[0.05,0.30])
const SEAT_INNER_R =  0.110; // right seat inner edge (measured)
const TUNNEL_TOP_Y = -0.165;  // tunnel top — flat over x∈[-0.09,0.09], z∈[0.20,0.44] (measured)
const SURFACE_CREST = -0.1635; // highest surface vert under the plate footprint (measured)
const TUNNEL_Z     =  0.30;   // center of that flat patch

// Plate intrinsic extents in gate-local units (must mirror GatePlate's shape)
const PLATE_X0 = -(LANE + R_EXT + 0.013 + 0.030); // R-spur edge   (-0.140)
const PLATE_X1 =   LANE + 0.042;                  // gear-1/2 edge (+0.097)
const PLATE_HZ =   SLOT + 0.013 + 0.030;          // z half-extent (±0.098)
const PLATE_UNDERSIDE = -0.0135;                  // underside local y (mesh y -0.012 − bevel)
// The plate is x-asymmetric — this local shift centers its bbox on the anchor
const PLATE_XOFF = -(PLATE_X0 + PLATE_X1) / 2;

// Derived placement:
//   scale  → plate width = 55% of the seat gap (clearance to BOTH seats)
//   anchor → seat-gap midpoint, inset flush into the tunnel top surface
//   rake   → 5° pitch toward the driver — subtle, so the plate reads as
//            machined into the console (rear edge flush, ~5 mm lip at the
//            front) instead of perched on top; roll/yaw stay 0 so the slots
//            run exactly along the car's forward axis (R points to the rear)
const SEAT_GAP    = SEAT_INNER_R - SEAT_INNER_L;
const GATE_SCALE  = (0.55 * SEAT_GAP) / (PLATE_X1 - PLATE_X0);
const GATE_TILT_X = -Math.PI / 36;
const COS_TILT = Math.cos(GATE_TILT_X), SIN_TILT = Math.sin(GATE_TILT_X);
const EMBED = 0.002; // sink the resting edge a hair below the surface crest
// A pitched plate contacts the ground along its rear underside edge — seat
// THAT edge just under the surface CREST (highest local bump), so no point of
// the surface pokes through the plate and the rear edge sits truly flush.
const REAR_UNDER_Y = PLATE_UNDERSIDE * COS_TILT + PLATE_HZ * SIN_TILT;
export const GATE_ANCHOR = new THREE.Vector3(
  (SEAT_INNER_L + SEAT_INNER_R) / 2,
  SURFACE_CREST - EMBED - GATE_SCALE * REAR_UNDER_Y,
  TUNNEL_Z,
);
// Gate frame = anchor ∘ local x-offset; pitch never moves x, so fold it in
const GATE_CENTER = new THREE.Vector3(GATE_ANCHOR.x + GATE_SCALE * PLATE_XOFF, GATE_ANCHOR.y, GATE_ANCHOR.z);

// Slot well: the plate's H-shape extruded downward so the slots are hollow
// channels with real depth — through the cutouts you see dark walls dropping
// to a floor, not a surface flush against the plate.
const WELL_DEPTH = 0.035;
const WELL_BOT   = PLATE_UNDERSIDE - WELL_DEPTH;

// Base skirt: flush with the plate edges (no recessed shadow line), spanning
// from the well floor down far enough that even its raised front corner stays
// below the tunnel surface — seals the housing into the console with no
// visible air gap. Its top sits at WELL_BOT (not the plate underside!) so it
// never plugs the hollow slot channels from below.
const SKIRT_HX  = ((PLATE_X1 - PLATE_X0) / 2) * 0.99;
const SKIRT_HZ  = PLATE_HZ * 0.99;
const SKIRT_TOP = WELL_BOT;
const SKIRT_BOT = Math.min(
  ((TUNNEL_TOP_Y - 0.01 - GATE_ANCHOR.y) / GATE_SCALE + SKIRT_HZ * SIN_TILT) / COS_TILT,
  SKIRT_TOP - 0.004, // never degenerate — the well may already reach below the surface
);

const GATE_QUAT    = new THREE.Quaternion().setFromEuler(new THREE.Euler(GATE_TILT_X, 0, 0));
const GATE_MAT     = new THREE.Matrix4().compose(GATE_CENTER, GATE_QUAT, new THREE.Vector3(GATE_SCALE, GATE_SCALE, GATE_SCALE));
const GATE_MAT_INV = GATE_MAT.clone().invert();
const GATE_NORMAL  = new THREE.Vector3(0, 1, 0).applyQuaternion(GATE_QUAT);

// H-path segments as [fromLocalXZ, toLocalXZ].
// Handedness: the driver faces +z (windshield), so from their POV local +x
// projects to screen-LEFT. Gears 1/2 therefore live on the +x lane so 1st
// is on the driver's left, like a real H-gate; R extends past 6 on -x.
const H_SEGS: [[number, number], [number, number]][] = [
  [[ LANE, 0],          [-LANE, 0]         ], // horizontal crossbar
  [[ LANE, 0],          [ LANE,  SLOT]     ], // driver-left lane → gear 1
  [[ LANE, 0],          [ LANE, -SLOT]     ], // driver-left lane → gear 2
  [[0,     0],          [0,      SLOT]     ], // center lane → gear 3
  [[0,     0],          [0,     -SLOT]     ], // center lane → gear 4
  [[-LANE, 0],          [-LANE,  SLOT]     ], // driver-right lane → gear 5
  [[-LANE, 0],          [-LANE, -SLOT]     ], // driver-right lane → gear 6
  [[-LANE, -SLOT],      [-LANE - R_EXT, -SLOT]], // R extension past gear 6
];

// ─── Gear → action config ────────────────────────────────────────────────────
// 'scroll' moves the page timeline to a normalized progress (0–1);
// 'panel' opens an in-page overlay section; 'neutral' closes any open panel.
export type GearAction =
  | { type: 'scroll'; to: number }
  | { type: 'panel'; id: SectionId }
  | { type: 'neutral' };

export interface GearDef {
  gear:   string;
  label:  string;
  sub:    string;
  action: GearAction;
  lx:     number;
  lz:     number;
}

export const GEARS: GearDef[] = [
  { gear: 'N', label: 'Neutral',    sub: 'idle',          action: { type: 'neutral' },               lx: 0,               lz: 0      },
  { gear: '1', label: 'Home',       sub: 'hero view',     action: { type: 'scroll', to: 0 },         lx:  LANE,           lz:  SLOT  },
  { gear: '2', label: 'About',      sub: 'who I am',      action: { type: 'scroll', to: 0.32 },      lx:  LANE,           lz: -SLOT  },
  { gear: '3', label: 'Projects',   sub: 'built work',    action: { type: 'panel', id: 'projects' }, lx: 0,               lz:  SLOT  },
  { gear: '4', label: 'Experience', sub: 'work history',  action: { type: 'panel', id: 'experience' }, lx: 0,             lz: -SLOT  },
  { gear: '5', label: 'Skills',     sub: 'tech stack',    action: { type: 'panel', id: 'skills' },   lx: -LANE,           lz:  SLOT  },
  { gear: '6', label: 'Contact',    sub: 'get in touch',  action: { type: 'panel', id: 'contact' },  lx: -LANE,           lz: -SLOT  },
  { gear: 'R', label: 'Reverse',    sub: 'back to top',   action: { type: 'scroll', to: 0 },         lx: -LANE - R_EXT,   lz: -SLOT  },
];

// ─── Math helpers ─────────────────────────────────────────────────────────────
function closestOnSeg(
  px: number, pz: number,
  ax: number, az: number,
  bx: number, bz: number,
): [number, number] {
  const dx = bx - ax, dz = bz - az;
  const len2 = dx * dx + dz * dz;
  if (len2 < 1e-10) return [ax, az];
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / len2));
  return [ax + t * dx, az + t * dz];
}

// Projects local [lx, lz] onto the nearest point on the H-path
function projectOnHPath(lx: number, lz: number): [number, number] {
  let best: [number, number] = [0, 0];
  let bestD = Infinity;
  for (const [[ax, az], [bx, bz]] of H_SEGS) {
    const [cx, cz] = closestOnSeg(lx, lz, ax, az, bx, bz);
    const d = Math.hypot(cx - lx, cz - lz);
    if (d < bestD) { bestD = d; best = [cx, cz]; }
  }
  return best;
}

// Slides from the current on-path position toward the pointer, restricted to
// segments the knob is currently ON. A global nearest-point projection would
// let the knob jump between adjacent slot ends straight through the plate
// metal; this way lane changes can only happen through the crossbar junctions,
// exactly like a real gated shifter.
const TOUCH_EPS = 0.004; // how close to a segment counts as "on it"
function slideOnHPath(curX: number, curZ: number, px: number, pz: number): [number, number] {
  let best: [number, number] | null = null;
  let bestD = Infinity;
  for (const [[ax, az], [bx, bz]] of H_SEGS) {
    const [tx, tz] = closestOnSeg(curX, curZ, ax, az, bx, bz);
    if (Math.hypot(tx - curX, tz - curZ) > TOUCH_EPS) continue; // not on this segment
    const [cx, cz] = closestOnSeg(px, pz, ax, az, bx, bz);
    const d = Math.hypot(cx - px, cz - pz);
    if (d < bestD) { bestD = d; best = [cx, cz]; }
  }
  // Drifted off-path somehow → snap back to the path (don't chase the pointer)
  return best ?? projectOnHPath(curX, curZ);
}

function nearestGear(lx: number, lz: number): GearDef {
  let best = GEARS[0];
  let bestD = Infinity;
  for (const g of GEARS) {
    const d = Math.hypot(g.lx - lx, g.lz - lz);
    if (d < bestD) { bestD = d; best = g; }
  }
  return bestD < SNAP_THRESH ? best : GEARS[0]; // fall back to N
}

// Convert a world position to gate-local [lx, lz] (drops the local-y component)
function worldToGateLocal(world: THREE.Vector3): [number, number] {
  const l = world.clone().applyMatrix4(GATE_MAT_INV);
  return [l.x, l.z];
}

// ─── Audio ────────────────────────────────────────────────────────────────────
let _audioCtx: AudioContext | null = null;
function getACtx() {
  if (!_audioCtx && typeof window !== 'undefined') {
    _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return _audioCtx;
}
function playClick(muted: boolean) {
  if (muted) return;
  try {
    const ctx = getACtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(820, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.065);
    g.gain.setValueAtTime(0.22, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch { /* ignore */ }
}
function haptic() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(28);
}

// ─── Physical gate plate — milled metal surround with the H-slots cut out ───
// Classic Lamborghini open-gate look: the knob shaft slides through the slots.
function GatePlate({ activeGear }: { activeGear: string }) {
  const { plateGeo, wellGeo } = useMemo(() => {
    const w  = 0.011;              // slot half-width (shaft r=0.009 clears it)
    const S  = SLOT + 0.013;       // slot ends extend a touch past gear centers
    const L  = LANE;
    const RXE = LANE + R_EXT + 0.013; // R spur end
    // Shape is built in XY; rotateX(-π/2) maps shape +y → world -z, so z is
    // negated (n). x is mirrored (m) to put the R spur on -x, matching GEARS
    // (gears 1/2 on +x = driver's left; THREE fixes hole winding itself).
    const n = (z: number) => -z;
    const m = (x: number) => -x;

    // Outer plate: rounded rectangle
    const ox0 = -L - 0.042, ox1 = RXE + 0.030;
    const oz  = S + 0.030, r = 0.016;
    const shape = new THREE.Shape();
    shape.moveTo(m(ox0 + r), n(oz));
    shape.lineTo(m(ox1 - r), n(oz));
    shape.quadraticCurveTo(m(ox1), n(oz), m(ox1), n(oz) + r);
    shape.lineTo(m(ox1), n(-oz) - r);
    shape.quadraticCurveTo(m(ox1), n(-oz), m(ox1 - r), n(-oz));
    shape.lineTo(m(ox0 + r), n(-oz));
    shape.quadraticCurveTo(m(ox0), n(-oz), m(ox0), n(-oz) - r);
    shape.lineTo(m(ox0), n(oz) + r);
    shape.quadraticCurveTo(m(ox0), n(oz), m(ox0 + r), n(oz));

    // Single connected hole tracing the H pattern + R spur
    const h = new THREE.Path();
    const pts: [number, number][] = [
      [-L - w,  S], [-L + w,  S], [-L + w,  w], [-w,  w], [-w,  S],
      [ w,  S], [ w,  w], [ L - w,  w], [ L - w,  S], [ L + w,  S],
      [ L + w, -SLOT + w], [RXE, -SLOT + w], [RXE, -SLOT - w], [ L + w, -SLOT - w],
      [ L + w, -S], [ L - w, -S], [ L - w, -w], [ w, -w], [ w, -S],
      [-w, -S], [-w, -w], [-L + w, -w], [-L + w, -S], [-L - w, -S],
    ];
    h.moveTo(m(pts[0][0]), n(pts[0][1]));
    for (let i = 1; i < pts.length; i++) h.lineTo(m(pts[i][0]), n(pts[i][1]));
    h.closePath();
    shape.holes.push(h);

    const plateGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.006, bevelEnabled: true, bevelThickness: 0.0015, bevelSize: 0.0015, bevelSegments: 2 });
    plateGeo.rotateX(-Math.PI / 2);
    // Same outline + holes extruded deeper: the hollow slot well under the
    // plate. Its inner walls are what you see through the H cutouts.
    const wellGeo = new THREE.ExtrudeGeometry(shape, { depth: WELL_DEPTH, bevelEnabled: false });
    wellGeo.rotateX(-Math.PI / 2);
    return { plateGeo, wellGeo };
  }, []);

  // Slot dots — one per gear (except N)
  const dotPositions = useMemo(() => GEARS.filter(g => g.gear !== 'N'), []);

  // All positions are gate-local — the parent group applies GATE_CENTER + tilt
  return (
    <group>
      {/* Brushed-metal / matte-composite plate — solid and high-contrast.
          Low envMapIntensity + moderate metalness keeps it opaque-looking:
          the old 0.95-metalness surface mirrored the carbon interior and
          read as washed-out / see-through. */}
      <mesh geometry={plateGeo} position={[0, -0.012, 0]}>
        <meshStandardMaterial color="#39414c" metalness={0.6} roughness={0.48} envMapIntensity={0.5} />
      </mesh>
      {/* Hollow slot well — blacked-out, light-absorbing channel where the
          shifter travels: the H reads as a dark void cut into the plate */}
      <mesh geometry={wellGeo} position={[0, WELL_BOT, 0]}>
        <meshStandardMaterial color="#04060a" metalness={0.1} roughness={0.9} />
      </mesh>
      {/* Black base skirt — plate footprint slightly inset, top at the WELL
          floor (so it never plugs the hollow channels), bottom below the
          tunnel surface even at the rake-raised front corner (SKIRT_BOT is
          solved for exactly that), burying the OEM tunnel top. */}
      <mesh position={[-PLATE_XOFF, (SKIRT_TOP + SKIRT_BOT) / 2, 0]}>
        <boxGeometry args={[SKIRT_HX * 2, SKIRT_TOP - SKIRT_BOT, SKIRT_HZ * 2]} />
        {/* matches the blacked-out well so the channel floor disappears too */}
        <meshStandardMaterial color="#04060a" metalness={0.1} roughness={0.9} />
      </mesh>
      {dotPositions.map(g => {
        const isActive = g.gear === activeGear;
        return (
          // Inset LEDs on the well floor — glowing up from inside the slots
          <mesh key={g.gear} position={[g.lx, WELL_BOT + 0.004, g.lz]}>
            <sphereGeometry args={[isActive ? 0.0045 : 0.003, 8, 8]} />
            <meshStandardMaterial
              color={isActive ? '#00e5ff' : '#00b4d8'}
              emissive={isActive ? '#00e5ff' : '#00b4d8'}
              emissiveIntensity={isActive ? 1.2 : 0.35}
              transparent
              opacity={isActive ? 1 : 0.55}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ─── Gear labels (Html anchored to each gate slot) ────────────────────────────
function GearLabels({ activeGear }: { activeGear: string }) {
  return (
    <>
      {GEARS.filter(g => g.gear !== 'N').map(g => {
        const isActive = g.gear === activeGear;
        // Label sits beyond the slot end: forward of the top row, behind the bottom row
        const zOff = g.lz > 0 ? 0.024 : -0.024;
        return (
          <Html key={g.gear} position={[g.lx, 0.006, g.lz + zOff]} center zIndexRange={[30, 0]}>
            {/* Backed/outlined chip pinned at the slot terminal — stays
                legible even over bright specular highlights on the plate */}
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 10,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '1px 5px',
                borderRadius: 2,
                background: 'rgba(4,10,22,0.78)',
                border: `1px solid ${isActive ? 'rgba(0,229,255,0.65)' : 'rgba(0,180,216,0.28)'}`,
                color:      isActive ? '#00e5ff' : 'rgba(160,230,255,0.92)',
                textShadow: isActive
                  ? '0 0 8px #00e5ff, 0 0 16px #00b4d8'
                  : '0 1px 2px rgba(0,0,0,0.95)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                userSelect:    'none',
                transition:    'color 0.25s, text-shadow 0.25s, border-color 0.25s',
              }}
            >
              {g.label}
            </div>
          </Html>
        );
      })}
    </>
  );
}

// ─── Instrument-cluster HUD readout ──────────────────────────────────────────
function GearHUD({
  activeGear,
  muted,
  onMuteToggle,
  pRef,
}: {
  activeGear:    string;
  muted:         boolean;
  onMuteToggle:  () => void;
  pRef:          React.MutableRefObject<number>;
}) {
  const wrapRef  = useRef<HTMLDivElement>(null);
  const def      = GEARS.find(g => g.gear === activeGear)!;
  const isNeutral = activeGear === 'N';
  // Floats above/forward of the gate anchor, toward the dash — sits near the
  // top of the p=1.0 driver-POV framing (camera looks at GATE_ANCHOR).
  const hudPos: [number, number, number] = [
    GATE_ANCHOR.x + 0.06, GATE_ANCHOR.y + 0.15, GATE_ANCHOR.z + 0.12,
  ];

  useFrame(() => {
    if (!wrapRef.current) return;
    const opacity = THREE.MathUtils.clamp((pRef.current - 0.58) / 0.05, 0, 1);
    wrapRef.current.style.opacity      = String(opacity);
    wrapRef.current.style.pointerEvents = opacity > 0.05 ? 'auto' : 'none';
  });

  return (
    <Html position={hudPos} center zIndexRange={[40, 0]}>
      <div ref={wrapRef} style={{ opacity: 0, pointerEvents: 'none' }}>
        {/* Destination readout — shows the SELECTED SECTION (Home, About…),
            never gear states; hidden entirely while nothing is engaged */}
        {!isNeutral && (
          <div style={{
            padding:        '6px 12px',
            background:     'rgba(3,8,20,0.92)',
            border:         '1px solid rgba(0,229,255,0.55)',
            backdropFilter: 'blur(10px)',
            boxShadow:      '0 0 18px rgba(0,229,255,0.18)',
            marginBottom:   3,
            textAlign:      'center',
            userSelect:     'none',
          }}>
            <div style={{
              fontFamily:      'monospace',
              fontSize:        7,
              letterSpacing:   '0.14em',
              textTransform:   'uppercase',
              color:           'rgba(0,180,216,0.55)',
              marginBottom:    2,
            }}>
              {def.sub}
            </div>
            <div style={{
              fontFamily:    'monospace',
              fontSize:      13,
              fontWeight:    900,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color:         '#00e5ff',
              textShadow:    '0 0 12px rgba(0,229,255,0.6)',
            }}>
              {def.label}
            </div>
          </div>
        )}

        {/* Mute toggle */}
        <button
          onClick={onMuteToggle}
          style={{
            display:       'block',
            marginLeft:    'auto',
            background:    'none',
            border:        'none',
            cursor:        'pointer',
            fontFamily:    'monospace',
            fontSize:      7,
            color:         'rgba(0,180,216,0.35)',
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            padding:       '2px 4px',
            transition:    'color 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(0,180,216,0.65)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(0,180,216,0.35)'; }}
        >
          {muted ? '[ sfx off ]' : '[ sfx on ]'}
        </button>
      </div>
    </Html>
  );
}

// ─── Draggable shifter knob ───────────────────────────────────────────────────
function ShifterKnob({
  pRef,
  muted,
  onGearEngage,
  onNavScroll,
}: {
  pRef:         React.MutableRefObject<number>;
  muted:        boolean;
  onGearEngage: (g: GearDef) => void;
  onNavScroll:  (p: number) => void;
}) {
  const { camera, gl } = useThree();
  const knobRef    = useRef<THREE.Group>(null);
  const isDragging = useRef(false);

  // Spring state — all in GATE-LOCAL coordinates (the parent group applies
  // GATE_CENTER + tilt), all refs so nothing re-renders per frame
  const knobPos   = useRef(new THREE.Vector3());
  const knobVel   = useRef(new THREE.Vector3());
  const targetPos = useRef(new THREE.Vector3());
  const curGear   = useRef<GearDef>(GEARS[0]);

  // ── Raycast pointer→tilted gate plane, returns gate-local [lx, lz] ──────
  const hitGatePlane = useCallback((clientX: number, clientY: number): [number, number] | null => {
    const canvas = gl.domElement;
    const rect   = canvas.getBoundingClientRect();
    const ndcX   = ((clientX - rect.left) / rect.width)  * 2 - 1;
    const ndcY   = -((clientY - rect.top)  / rect.height) * 2 + 1;
    const ray    = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(GATE_NORMAL, GATE_CENTER);
    const hit   = new THREE.Vector3();
    return ray.ray.intersectPlane(plane, hit) ? worldToGateLocal(hit) : null;
  }, [camera, gl]);

  // ── Engage a gear ──────────────────────────────────────────────────────
  const engageGear = useCallback((g: GearDef) => {
    if (g.gear === curGear.current.gear) return;
    curGear.current = g;
    targetPos.current.set(g.lx, 0, g.lz);
    playClick(muted);
    haptic();
    onGearEngage(g);

    const action = g.action;
    if (action.type === 'panel') {
      // Let the knob spring settle into the slot before the panel fades in
      setTimeout(() => useSiteStore.getState().openSection(action.id, g.gear), 480);
    } else if (action.type === 'scroll') {
      // Close any open panel but keep this gear engaged (gear→'N' would
      // trigger the external-reset subscription and spring the knob home)
      useSiteStore.setState({ activeSection: null, gear: g.gear });
      onNavScroll(action.to);
    } else {
      useSiteStore.getState().closeSection();
    }
  }, [muted, onGearEngage, onNavScroll]);

  // ── Pointer down on knob ───────────────────────────────────────────────
  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (pRef.current < 0.60) return;   // only active once camera frames the shifter
    e.stopPropagation();
    isDragging.current = true;
    try { gl.domElement.setPointerCapture(e.nativeEvent.pointerId); } catch {}
  }, [pRef, gl]);

  // ── External reset: panel closed elsewhere → spring knob home to N ────
  useEffect(() => useSiteStore.subscribe((s) => {
    if (s.gear === 'N' && curGear.current.gear !== 'N') {
      curGear.current = GEARS[0];
      targetPos.current.set(0, 0, 0);
    }
  }), []);

  // ── Global pointer move / up on canvas ────────────────────────────────
  useEffect(() => {
    const canvas = gl.domElement;

    function onMove(e: PointerEvent) {
      if (!isDragging.current) return;
      const hit = hitGatePlane(e.clientX, e.clientY);
      if (!hit) return;
      // targetPos always lives ON the path, so sliding from it keeps the knob
      // inside the slots — it can never cut across the plate between lanes
      const [px, pz] = slideOnHPath(targetPos.current.x, targetPos.current.z, hit[0], hit[1]);
      targetPos.current.set(px, 0, pz);
    }

    function onUp(e: PointerEvent) {
      if (!isDragging.current) return;
      isDragging.current = false;
      try { gl.domElement.releasePointerCapture(e.pointerId); } catch {}

      // Engage the gear nearest to where the knob actually IS (the constrained
      // target), not the raw pointer — releasing with the pointer over an
      // unreachable slot must not teleport the knob through the gate.
      engageGear(nearestGear(targetPos.current.x, targetPos.current.z));
    }

    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup',   onUp);
    return () => {
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup',   onUp);
    };
  }, [gl, hitGatePlane, engageGear]);

  // ── Spring physics + knob tilt ────────────────────────────────────────
  useFrame((_, dt) => {
    if (!knobRef.current) return;

    const disp  = targetPos.current.clone().sub(knobPos.current);
    const force = disp.multiplyScalar(SPRING_K);
    knobVel.current.add(force.multiplyScalar(dt));
    knobVel.current.multiplyScalar(Math.max(0, 1 - DAMPING * dt));
    knobPos.current.add(knobVel.current.clone().multiplyScalar(dt));

    knobRef.current.position.copy(knobPos.current);

    // Lean into movement direction
    const vx = knobVel.current.x, vz = knobVel.current.z;
    knobRef.current.rotation.z = THREE.MathUtils.lerp(knobRef.current.rotation.z, -vx * 2.8, 0.22);
    knobRef.current.rotation.x = THREE.MathUtils.lerp(knobRef.current.rotation.x,  vz * 2.8, 0.22);
  });

  return (
    <>
      {/* Invisible click targets — tap a gate slot to shift directly */}
      {GEARS.filter(g => g.gear !== 'N').map(g => (
        <mesh
          key={g.gear}
          position={[g.lx, 0.004, g.lz]}
          onClick={(e) => {
            if (pRef.current < 0.60) return;
            e.stopPropagation();
            engageGear(g);
          }}
          onPointerEnter={() => { if (pRef.current >= 0.60) document.body.style.cursor = 'pointer'; }}
          onPointerLeave={() => { document.body.style.cursor = ''; }}
        >
          <sphereGeometry args={[0.016, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}

    <group
      ref={knobRef}
      position={[0, 0, 0]}
      onPointerDown={handlePointerDown}
      onPointerEnter={() => { if (knobRef.current) document.body.style.cursor = 'grab'; }}
      onPointerLeave={() => { document.body.style.cursor = ''; }}
    >
      {/* Stalk — polished steel so it stays visible against the dark well,
          running from the knob down through the slot to below the well floor:
          the knob clearly mounts INTO the gate, not floats above it */}
      <mesh position={[0, -0.036, 0]}>
        <cylinderGeometry args={[0.006, 0.009, 0.072, 12]} />
        <meshStandardMaterial color="#9aa5b1" metalness={0.92} roughness={0.22} />
      </mesh>

      {/* Slot shoe — dark collar riding ON the plate surface around the slot
          mouth, anchoring the stalk to the gate as it slides */}
      <mesh position={[0, -0.0015, 0]}>
        <cylinderGeometry args={[0.0125, 0.0145, 0.005, 16]} />
        <meshStandardMaterial color="#1c232e" metalness={0.75} roughness={0.35} />
      </mesh>

      {/* Knob sphere */}
      <mesh position={[0, 0.008, 0]}>
        <sphereGeometry args={[0.020, 28, 28]} />
        <meshStandardMaterial color="#0f151e" metalness={0.88} roughness={0.12} envMapIntensity={1.8} />
      </mesh>

      {/* Cyan accent ring */}
      <mesh position={[0, 0.001, 0]}>
        <torusGeometry args={[0.020, 0.0028, 8, 36]} />
        <meshStandardMaterial
          color="#00b4d8"
          emissive="#00b4d8"
          emissiveIntensity={0.7}
          metalness={0.5}
          roughness={0.25}
        />
      </mesh>

      {/* Top engraved dot */}
      <mesh position={[0, 0.028, 0]}>
        <sphereGeometry args={[0.003, 8, 8]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={1.2} />
      </mesh>
    </group>
    </>
  );
}

// ─── Flat SVG H-pattern (mobile / no-WebGL / reduced-motion fallback) ────────
export function GearShifterFallback({ onSelect }: { onSelect?: (def: GearDef) => void }) {
  const W = 220, H = 280, cx = W / 2, cy = H / 2;
  const COL: Record<string, number> = { L: cx - 56, C: cx, R: cx + 56 };
  const ROW: Record<string, number> = { top: cy - 52, mid: cy, bot: cy + 52 };

  const layout = [
    { gear: '1', x: COL.L, y: ROW.top },
    { gear: '2', x: COL.L, y: ROW.bot },
    { gear: '3', x: COL.C, y: ROW.top },
    { gear: '4', x: COL.C, y: ROW.bot },
    { gear: '5', x: COL.R, y: ROW.top },
    { gear: '6', x: COL.R, y: ROW.bot },
    { gear: 'R', x: COL.R + 30, y: ROW.bot + 26 },
  ];

  const [active, setActive] = useState('N');

  const handleClick = (def: GearDef) => {
    setActive(def.gear);
    if (onSelect) { onSelect(def); return; }
    // Default: in-flow anchor navigation (used by the mobile fallback page)
    if (def.action.type === 'panel') {
      document.getElementById(def.action.id)?.scrollIntoView({ behavior: 'smooth' });
    } else if (def.action.type === 'scroll') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, userSelect: 'none' }}>
      <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(0,180,216,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
        Navigate
      </span>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        {/* Rails */}
        {[COL.L, COL.C, COL.R].map((x, i) => (
          <line key={i} x1={x} y1={ROW.top} x2={x} y2={ROW.bot} stroke="rgba(0,180,216,0.30)" strokeWidth={1} />
        ))}
        <line x1={COL.L} y1={ROW.mid} x2={COL.R + 30} y2={ROW.mid} stroke="rgba(0,180,216,0.30)" strokeWidth={1} />
        <line x1={COL.R} y1={ROW.bot} x2={COL.R + 30} y2={ROW.bot + 26}
          stroke="rgba(0,180,216,0.22)" strokeWidth={1} strokeDasharray="3 3" />

        {/* Gear slots */}
        {layout.map(({ gear, x, y }) => {
          const def     = GEARS.find(g => g.gear === gear)!;
          const isActive = gear === active;
          const r        = gear === 'R' ? 13 : 17;
          return (
            <g key={gear} style={{ cursor: 'pointer' }} onClick={() => handleClick(def)}>
              <circle
                cx={x} cy={y} r={r}
                fill={isActive ? 'rgba(0,229,255,0.10)' : 'rgba(3,8,20,0.88)'}
                stroke={isActive ? 'rgba(0,229,255,0.75)' : 'rgba(0,180,216,0.40)'}
                strokeWidth={isActive ? 1.5 : 1}
              />
              <text x={x} y={y - 2} textAnchor="middle" dominantBaseline="middle"
                fill={isActive ? '#00e5ff' : '#00b4d8'}
                fontSize={gear === 'R' ? 9 : 12}
                fontFamily="monospace"
                fontWeight="700"
                style={{ filter: isActive ? 'drop-shadow(0 0 4px #00e5ff)' : 'none' }}>
                {gear}
              </text>
              <text x={x} y={y + 9} textAnchor="middle"
                fill="rgba(0,180,216,0.45)" fontSize={5.5} fontFamily="monospace">
                {def.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── GearShifter root (inside Canvas) ────────────────────────────────────────
export default function GearShifter({
  pRef,
  onNavScroll,
}: {
  pRef:        React.MutableRefObject<number>;
  onNavScroll: (p: number) => void;
}) {
  const [activeGear, setActiveGear] = useState('N');
  const [muted,      setMuted]      = useState(false);
  // Visibility is driven by scroll progress, tracked imperatively to avoid per-frame re-renders
  const [visible, setVisible] = useState(false);
  const prevVisible = useRef(false);

  useFrame(() => {
    const v = pRef.current >= 0.58;
    if (v !== prevVisible.current) { prevVisible.current = v; setVisible(v); }
  });

  // Keep the HUD/labels in sync when a panel close springs the knob back to N
  useEffect(() => useSiteStore.subscribe((s) => {
    if (s.gear === 'N') setActiveGear('N');
  }), []);

  // GearLabels/GearHUD use drei <Html>, whose DOM stays visible even inside
  // an invisible group — mount them only when the shifter is actually in view.
  // ANCHOR group: console-tunnel center (measured), seated on the tunnel top,
  // pitch-only rake — the whole assembly is parented here and placed at local
  // (0,0,0); the inner offset just centers the asymmetric plate's bbox so it
  // clears both seats symmetrically. (anchor ∘ offset ≡ GATE_MAT used by the
  // drag-plane raycast.)
  return (
    <group visible={visible}>
      <group position={GATE_ANCHOR} rotation={[GATE_TILT_X, 0, 0]} scale={GATE_SCALE}>
        <group position={[PLATE_XOFF, 0, 0]}>
          <GatePlate  activeGear={activeGear} />
          {visible && <GearLabels activeGear={activeGear} />}
          <ShifterKnob
            pRef={pRef}
            muted={muted}
            onGearEngage={g => setActiveGear(g.gear)}
            onNavScroll={onNavScroll}
          />
        </group>
      </group>
      {/* HUD stays in world space — positioned for the driver-POV nav framing */}
      {visible && (
        <GearHUD
          activeGear={activeGear}
          muted={muted}
          onMuteToggle={() => setMuted(m => !m)}
          pRef={pRef}
        />
      )}
    </group>
  );
}
