"use client";

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// ─── Gate geometry constants ─────────────────────────────────────────────────
// All positions are LOCAL offsets from GATE_CENTER (applied as: world = center + local)
const LANE        = 0.055; // x-offset between lanes
const SLOT        = 0.055; // z-offset for engaged gear
const R_EXT       = 0.042; // additional x-offset for Reverse
const SNAP_THRESH = SLOT * 0.88;
const SPRING_K    = 200;
const DAMPING     = 26;

// Center of the gate in world space — matches the camera's look-at for p=0.82
// Adjust these if your specific GLB positions the center console differently
const GATE_CENTER = new THREE.Vector3(0.14, 0.264, -0.48);

// H-path segments as [fromLocalXZ, toLocalXZ]
const H_SEGS: [[number, number], [number, number]][] = [
  [[-LANE, 0],          [ LANE, 0]         ], // horizontal crossbar
  [[-LANE, 0],          [-LANE,  SLOT]     ], // left lane → gear 1
  [[-LANE, 0],          [-LANE, -SLOT]     ], // left lane → gear 2
  [[0,     0],          [0,      SLOT]     ], // center lane → gear 3
  [[0,     0],          [0,     -SLOT]     ], // center lane → gear 4
  [[ LANE, 0],          [ LANE,  SLOT]     ], // right lane → gear 5
  [[ LANE, 0],          [ LANE, -SLOT]     ], // right lane → gear 6
  [[ LANE, -SLOT],      [ LANE + R_EXT, -SLOT]], // R extension
];

// ─── Gear → route config ─────────────────────────────────────────────────────
export interface GearDef {
  gear:  string;
  label: string;
  sub:   string;
  route: string | null; // null = neutral/no-nav; '__TOP__' = scroll to top
  lx:    number;
  lz:    number;
}

export const GEARS: GearDef[] = [
  { gear: 'N', label: 'Neutral',    sub: 'idle',          route: null,       lx: 0,            lz: 0      },
  { gear: '1', label: 'Home',       sub: 'start here',    route: '/',        lx: -LANE,        lz:  SLOT  },
  { gear: '2', label: 'About',      sub: 'who I am',      route: '/about',   lx: -LANE,        lz: -SLOT  },
  { gear: '3', label: 'Projects',   sub: 'built work',    route: '/projects',lx: 0,            lz:  SLOT  },
  { gear: '4', label: 'Experience', sub: 'work history',  route: '/experience', lx: 0,         lz: -SLOT  },
  { gear: '5', label: 'Skills',     sub: 'tech stack',    route: '/skills',  lx:  LANE,        lz:  SLOT  },
  { gear: '6', label: 'Contact',    sub: 'get in touch',  route: '/contact', lx:  LANE,        lz: -SLOT  },
  { gear: 'R', label: 'Reverse',    sub: 'hero view',     route: '__TOP__',  lx:  LANE + R_EXT,lz: -SLOT  },
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

function nearestGear(lx: number, lz: number): GearDef {
  let best = GEARS[0];
  let bestD = Infinity;
  for (const g of GEARS) {
    const d = Math.hypot(g.lx - lx, g.lz - lz);
    if (d < bestD) { bestD = d; best = g; }
  }
  return bestD < SNAP_THRESH ? best : GEARS[0]; // fall back to N
}

// Convert a world position to gate-local [lx, lz]
function worldToLocal(wx: number, wz: number): [number, number] {
  return [wx - GATE_CENTER.x, wz - GATE_CENTER.z];
}

// World position for a gate-local offset
function localToWorld(lx: number, lz: number, yOff = 0): THREE.Vector3 {
  return new THREE.Vector3(GATE_CENTER.x + lx, GATE_CENTER.y + yOff, GATE_CENTER.z + lz);
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

// ─── Gate rail lines ─────────────────────────────────────────────────────────
function GateRails({ activeGear }: { activeGear: string }) {
  const geo = useMemo(() => {
    const pts: number[] = [];
    for (const [[ax, az], [bx, bz]] of H_SEGS) {
      const a = localToWorld(ax, az, 0.002);
      const b = localToWorld(bx, bz, 0.002);
      pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  const mat = useMemo(
    () => new THREE.LineBasicMaterial({ color: 0x00b4d8, transparent: true, opacity: 0.35 }),
    [],
  );

  // Slot dots — one per gear (except N)
  const dotPositions = useMemo(() => GEARS.filter(g => g.gear !== 'N'), []);

  return (
    <group>
      <primitive object={new THREE.LineSegments(geo, mat)} />
      {dotPositions.map(g => {
        const isActive = g.gear === activeGear;
        const pos = localToWorld(g.lx, g.lz, 0.004);
        return (
          <mesh key={g.gear} position={pos.toArray()}>
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
        // Label sits above gears in the top row, below in the bottom row
        const yOff = g.lz > 0 ? 0.022 : -0.022;
        const pos = localToWorld(g.lx, g.lz + yOff, 0.006);
        return (
          <Html key={g.gear} position={pos.toArray()} center zIndexRange={[30, 0]}>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 7,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color:      isActive ? '#00e5ff' : 'rgba(0,180,216,0.45)',
                textShadow: isActive ? '0 0 8px #00e5ff, 0 0 16px #00b4d8' : 'none',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                userSelect:    'none',
                transition:    'color 0.25s, text-shadow 0.25s',
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
  // Position near instrument cluster — upper-left dash area in world space
  const hudPos: [number, number, number] = [-0.04, 0.65, -0.60];

  useFrame(() => {
    if (!wrapRef.current) return;
    const opacity = THREE.MathUtils.clamp((pRef.current - 0.54) / 0.05, 0, 1);
    wrapRef.current.style.opacity      = String(opacity);
    wrapRef.current.style.pointerEvents = opacity > 0.05 ? 'auto' : 'none';
  });

  return (
    <Html position={hudPos} center zIndexRange={[40, 0]}>
      <div ref={wrapRef} style={{ opacity: 0, pointerEvents: 'none' }}>
        {/* Gear indicator block */}
        <div style={{
          display:        'flex',
          alignItems:     'center',
          gap:            8,
          padding:        '5px 10px 5px 8px',
          background:     'rgba(3,8,20,0.92)',
          border:         `1px solid ${isNeutral ? 'rgba(0,180,216,0.28)' : 'rgba(0,229,255,0.55)'}`,
          backdropFilter: 'blur(10px)',
          boxShadow:      isNeutral ? 'none' : '0 0 18px rgba(0,229,255,0.18)',
          marginBottom:   3,
          transition:     'border-color 0.3s, box-shadow 0.3s',
          userSelect:     'none',
        }}>
          {/* Gear number */}
          <span style={{
            fontSize:   22,
            fontWeight: 900,
            fontFamily: 'monospace',
            lineHeight: 1,
            minWidth:   18,
            textAlign:  'center',
            color:      isNeutral ? 'rgba(0,180,216,0.38)' : '#00e5ff',
            textShadow: isNeutral ? 'none' : '0 0 14px #00e5ff, 0 0 30px rgba(0,229,255,0.5)',
            transition: 'color 0.25s, text-shadow 0.25s',
          }}>
            {activeGear}
          </span>

          <div style={{ width: 1, height: 26, background: 'rgba(0,180,216,0.2)' }} />

          <div style={{ minWidth: 68 }}>
            <div style={{
              fontFamily:      'monospace',
              fontSize:        7,
              letterSpacing:   '0.12em',
              textTransform:   'uppercase',
              color:           'rgba(0,180,216,0.5)',
              marginBottom:    2,
            }}>
              {def.sub || 'stand by'}
            </div>
            <div style={{
              fontFamily:    'monospace',
              fontSize:      10,
              fontWeight:    700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color:         '#dff0ff',
            }}>
              {def.label}
            </div>
          </div>
        </div>

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
}: {
  pRef:         React.MutableRefObject<number>;
  muted:        boolean;
  onGearEngage: (g: GearDef) => void;
}) {
  const { camera, gl } = useThree();
  const knobRef    = useRef<THREE.Group>(null);
  const isDragging = useRef(false);

  // Spring state (all refs — updated in useFrame, no React re-renders)
  const knobPos   = useRef(GATE_CENTER.clone());
  const knobVel   = useRef(new THREE.Vector3());
  const targetPos = useRef(GATE_CENTER.clone());
  const curGear   = useRef<GearDef>(GEARS[0]);

  // ── Raycast pointer→gate plane ──────────────────────────────────────────
  const hitGatePlane = useCallback((clientX: number, clientY: number): [number, number] | null => {
    const canvas = gl.domElement;
    const rect   = canvas.getBoundingClientRect();
    const ndcX   = ((clientX - rect.left) / rect.width)  * 2 - 1;
    const ndcY   = -((clientY - rect.top)  / rect.height) * 2 + 1;
    const ray    = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -GATE_CENTER.y);
    const hit   = new THREE.Vector3();
    return ray.ray.intersectPlane(plane, hit) ? [hit.x, hit.z] : null;
  }, [camera, gl]);

  // ── Engage a gear ──────────────────────────────────────────────────────
  const engageGear = useCallback((g: GearDef) => {
    if (g.gear === curGear.current.gear) return;
    curGear.current = g;
    targetPos.current.set(
      GATE_CENTER.x + g.lx,
      GATE_CENTER.y,
      GATE_CENTER.z + g.lz,
    );
    playClick(muted);
    haptic();
    onGearEngage(g);

    if (g.route === '__TOP__') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (g.route) {
      setTimeout(() => { window.location.href = g.route!; }, 480);
    }
  }, [muted, onGearEngage]);

  // ── Pointer down on knob ───────────────────────────────────────────────
  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (pRef.current < 0.52) return;   // only active in cockpit
    e.stopPropagation();
    isDragging.current = true;
    try { gl.domElement.setPointerCapture(e.nativeEvent.pointerId); } catch {}
  }, [pRef, gl]);

  // ── Global pointer move / up on canvas ────────────────────────────────
  useEffect(() => {
    const canvas = gl.domElement;

    function onMove(e: PointerEvent) {
      if (!isDragging.current) return;
      const wxz = hitGatePlane(e.clientX, e.clientY);
      if (!wxz) return;
      const [lx, lz]    = worldToLocal(wxz[0], wxz[1]);
      const [px, pz]    = projectOnHPath(lx, lz);
      targetPos.current.set(GATE_CENTER.x + px, GATE_CENTER.y, GATE_CENTER.z + pz);
    }

    function onUp(e: PointerEvent) {
      if (!isDragging.current) return;
      isDragging.current = false;
      try { gl.domElement.releasePointerCapture(e.pointerId); } catch {}

      const wxz = hitGatePlane(e.clientX, e.clientY);
      const [lx, lz] = wxz
        ? worldToLocal(wxz[0], wxz[1])
        : [knobPos.current.x - GATE_CENTER.x, knobPos.current.z - GATE_CENTER.z];

      const g = nearestGear(lx, lz);
      engageGear(g);
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
    <group
      ref={knobRef}
      position={GATE_CENTER.toArray()}
      onPointerDown={handlePointerDown}
      onPointerEnter={() => { if (knobRef.current) document.body.style.cursor = 'grab'; }}
      onPointerLeave={() => { document.body.style.cursor = ''; }}
    >
      {/* Base shaft */}
      <mesh position={[0, -0.036, 0]}>
        <cylinderGeometry args={[0.006, 0.009, 0.072, 12]} />
        <meshStandardMaterial color="#18202e" metalness={0.92} roughness={0.18} />
      </mesh>

      {/* Chrome collar ring */}
      <mesh position={[0, -0.010, 0]}>
        <cylinderGeometry args={[0.011, 0.011, 0.006, 16]} />
        <meshStandardMaterial color="#8899aa" metalness={0.95} roughness={0.08} />
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
  );
}

// ─── Reduced-motion fallback: flat SVG H-pattern ─────────────────────────────
export function GearShifterFallback() {
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
    if (def.route === '__TOP__') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (def.route) setTimeout(() => { window.location.href = def.route!; }, 260);
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
  reducedMotion = false,
}: {
  pRef:          React.MutableRefObject<number>;
  reducedMotion?: boolean;
}) {
  const [activeGear, setActiveGear] = useState('N');
  const [muted,      setMuted]      = useState(false);
  // Visibility is driven by scroll progress, tracked imperatively to avoid per-frame re-renders
  const [visible, setVisible] = useState(false);
  const prevVisible = useRef(false);

  useFrame(() => {
    const v = pRef.current >= 0.54;
    if (v !== prevVisible.current) { prevVisible.current = v; setVisible(v); }
  });

  if (reducedMotion) return null; // parent renders SVG fallback

  return (
    <group visible={visible}>
      <GateRails  activeGear={activeGear} />
      <GearLabels activeGear={activeGear} />
      <ShifterKnob
        pRef={pRef}
        muted={muted}
        onGearEngage={g => setActiveGear(g.gear)}
      />
      <GearHUD
        activeGear={activeGear}
        muted={muted}
        onMuteToggle={() => setMuted(m => !m)}
        pRef={pRef}
      />
    </group>
  );
}
