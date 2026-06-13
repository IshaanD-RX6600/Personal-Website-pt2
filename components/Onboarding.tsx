"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { GEARS } from './GearShifter';

// ─── First-visit hands-on onboarding ─────────────────────────────────────────
// Rather than telling visitors how the site works, it lets them try it: a
// "scroll to drive" step that completes when they actually scroll, and a little
// draggable gear-shifter they shift before entering. Teaches the two real
// controls by doing. Dismissed state persists so returning visitors skip it.
const SEEN_KEY = 'onboarding-seen-v4';

// pRef crosses ~0.58 when the shifter comes into view (matches GearShifter).
const SHIFTER_VISIBLE_P = 0.58;

type Step = 'welcome' | 'scroll' | 'shift' | 'ready';
type Phase = 'tutorial' | 'closing' | 'done';

export default function Onboarding({ pRef }: { pRef: React.MutableRefObject<number> }) {
  const [phase, setPhase] = useState<Phase | null>(null); // null = undecided (first paint)
  const [step, setStep] = useState<Step>('welcome');
  const [scrollCue, setScrollCue] = useState(false);
  const [shiftedTo, setShiftedTo] = useState<string | null>(null); // section label they discovered
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Decide on mount (client only — localStorage isn't available on the server)
  useEffect(() => {
    let seen = false;
    try { seen = !!localStorage.getItem(SEEN_KEY); } catch { /* private mode */ }
    setPhase(seen ? 'done' : 'tutorial');
    if (seen) setScrollCue(true); // returning visitors still get the scroll nudge
  }, []);

  // ── Step "scroll": complete the moment the visitor scrolls anything ──
  useEffect(() => {
    if (phase !== 'tutorial' || step !== 'scroll') return;
    let done = false;
    const onScroll = () => {
      if (done) return;
      done = true;
      setStep('shift');
    };
    window.addEventListener('wheel', onScroll, { passive: true });
    window.addEventListener('touchmove', onScroll, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', (e) => {
      if (['ArrowDown', 'PageDown', ' ', 'ArrowUp', 'PageUp'].includes(e.key)) onScroll();
    });
    return () => {
      window.removeEventListener('wheel', onScroll);
      window.removeEventListener('touchmove', onScroll);
      window.removeEventListener('scroll', onScroll);
    };
  }, [phase, step]);

  // Hide the scroll cue once the visitor actually scrolls toward the cabin.
  useEffect(() => {
    if (!scrollCue) return;
    const id = setInterval(() => {
      if (pRef.current >= SHIFTER_VISIBLE_P) {
        setScrollCue(false);
        clearInterval(id);
      }
    }, 250);
    return () => clearInterval(id);
  }, [scrollCue, pRef]);

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  function enter() {
    try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* private mode — fine */ }
    setPhase('closing');
    setScrollCue(true);
    closeTimer.current = setTimeout(() => setPhase('done'), 700);
  }

  // When the mini-shifter lands in a slot, surface what it maps to, then advance.
  const onShift = useCallback((gearLabel: string) => {
    setShiftedTo(gearLabel);
    closeTimer.current = setTimeout(() => setStep('ready'), 950);
  }, []);

  if (phase === null) return null;

  const stepIndex = step === 'welcome' ? -1 : step === 'scroll' ? 0 : step === 'shift' ? 1 : 2;

  return (
    <>
      <style>{KEYFRAMES}</style>

      {/* ── Tutorial overlay ── */}
      {phase !== 'done' && (
        <div
          aria-label="Welcome"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            color: 'rgba(225,235,245,0.95)',
            background:
              'radial-gradient(130% 120% at 50% 30%, rgba(10,16,28,0.88) 0%, rgba(4,7,14,0.96) 60%, rgba(2,4,9,0.99) 100%)',
            backdropFilter: 'blur(6px)',
            animation: phase === 'closing' ? 'ob-fade-out 0.65s ease forwards' : 'ob-fade-in 0.6s ease',
          }}
        >
          <div style={{ maxWidth: 540, width: '100%', textAlign: 'center' }}>
            {/* ── Step progress dots (hidden on the welcome screen) ── */}
            {step !== 'welcome' && (
              <div style={dotsRow}>
                {['Scroll', 'Shift', 'Go'].map((lbl, i) => (
                  <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={dot(i <= stepIndex)} />
                    <span style={dotLabel(i === stepIndex)}>{lbl}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ─────────────── WELCOME ─────────────── */}
            {step === 'welcome' && (
              <div key="welcome" style={{ animation: 'ob-swap 0.5s ease' }}>
                <div style={revealStyle(0.1, eyebrowStyle)}>Full-stack developer · Portfolio</div>
                <h1 style={revealStyle(0.24, nameStyle)}>Ishaan Dhiman</h1>
                <p style={revealStyle(0.4, introStyle)}>
                  Hi — I’m a high-school developer who builds AI tools, full-stack
                  apps, and the occasional experiment. This site is one of them.
                  It only takes two controls — let’s try them.
                </p>
                <div style={revealStyle(0.62, ctaRowStyle)}>
                  <button onClick={() => setStep('scroll')} style={ctaPrimary} className="ob-enter">
                    Show me how →
                  </button>
                  <button onClick={enter} style={ctaGhost}>Skip</button>
                </div>
              </div>
            )}

            {/* ─────────────── STEP 1 · SCROLL ─────────────── */}
            {step === 'scroll' && (
              <div key="scroll" style={{ animation: 'ob-swap 0.5s ease' }}>
                <div style={stepNo}>Control 01</div>
                <h2 style={stepTitle}>Scroll to drive</h2>
                <p style={stepBody}>
                  Your scroll steers the camera — from the car outside, through the
                  glass, into the driver’s seat. Give it a scroll now.
                </p>
                <div style={{ margin: '30px auto 6px' }} aria-hidden>
                  <span style={bigMouse}>
                    <span style={bigWheel} />
                  </span>
                </div>
                <div style={hintText}>↑ scroll anywhere to continue</div>
              </div>
            )}

            {/* ─────────────── STEP 2 · SHIFT ─────────────── */}
            {step === 'shift' && (
              <div key="shift" style={{ animation: 'ob-swap 0.5s ease' }}>
                <div style={stepNo}>Control 02</div>
                <h2 style={stepTitle}>Shift a gear</h2>
                <p style={stepBody}>
                  Inside the cabin, the gear knob is the menu. Drag it into a slot —
                  each one opens a different part of my work.
                </p>

                <MiniShifter onShift={onShift} locked={!!shiftedTo} />

                <div style={{ height: 26, marginTop: 6 }}>
                  {shiftedTo && (
                    <div style={shiftResult} key={shiftedTo}>
                      ✓ That gear opens <strong style={{ color: '#7fe9ff' }}>{shiftedTo}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─────────────── READY ─────────────── */}
            {step === 'ready' && (
              <div key="ready" style={{ animation: 'ob-swap 0.5s ease' }}>
                <div style={revealStyle(0.05, { ...stepNo, color: 'rgba(0,200,235,0.8)' })}>You’ve got it</div>
                <h2 style={revealStyle(0.16, { ...stepTitle, fontSize: 'clamp(26px, 5vw, 38px)' })}>
                  Scroll &amp; shift. That’s the whole site.
                </h2>
                <p style={revealStyle(0.3, stepBody)}>
                  Scroll to move through the scene, shift gears to jump between
                  sections. Have a look around.
                </p>
                <div style={revealStyle(0.46, ctaRowStyle)}>
                  <button onClick={enter} style={ctaPrimary} className="ob-enter">
                    Enter the site
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Soft scroll cue (after the tutorial closes) ── */}
      {scrollCue && phase === 'done' && (
        <div aria-hidden style={scrollCueWrap}>
          <span style={scrollCueLabel}>Scroll to explore</span>
          <span style={scrollCueMouse}>
            <span style={scrollCueWheel} />
          </span>
        </div>
      )}
    </>
  );
}

// ─── Mini draggable gear-shifter (SVG H-gate) ────────────────────────────────
// A pointer-draggable knob constrained to an H-pattern, mirroring the real 3D
// shifter's slot map from GEARS. Dragging the knob near a slot snaps it in and
// reports which section that gear opens.
function MiniShifter({ onShift, locked }: { onShift: (label: string) => void; locked: boolean }) {
  // SVG layout — three vertical lanes + a crossbar, 2 slots per lane.
  const W = 280, H = 210;
  const COL = { L: 90, C: 140, R: 190 };
  const ROW = { top: 70, mid: 110, bot: 150 };

  // Map each real gear (1–6) to an on-screen slot. lx>0 = driver-left lane.
  const slots = [
    { gear: '1', x: COL.L, y: ROW.top }, { gear: '2', x: COL.L, y: ROW.bot },
    { gear: '3', x: COL.C, y: ROW.top }, { gear: '4', x: COL.C, y: ROW.bot },
    { gear: '5', x: COL.R, y: ROW.top }, { gear: '6', x: COL.R, y: ROW.bot },
  ];
  const labelOf = (g: string) => GEARS.find(x => x.gear === g)?.label ?? g;

  const svgRef = useRef<SVGSVGElement>(null);
  const [knob, setKnob] = useState({ x: COL.C, y: ROW.mid }); // rest at neutral
  const [active, setActive] = useState<string | null>(null);
  const dragging = useRef(false);

  // Constrain a free point to the nearest spot on the H rails.
  const constrain = useCallback((px: number, py: number) => {
    // Clamp to the lane rails: pick nearest column, allow travel between rows;
    // the crossbar (mid row) lets you switch lanes.
    const cols = [COL.L, COL.C, COL.R];
    const nearCol = cols.reduce((a, b) => (Math.abs(b - px) < Math.abs(a - px) ? b : a));
    const onCross = Math.abs(py - ROW.mid) < 22; // near the crossbar → free x to change lanes
    if (onCross) return { x: Math.max(COL.L, Math.min(COL.R, px)), y: ROW.mid };
    return { x: nearCol, y: Math.max(ROW.top, Math.min(ROW.bot, py)) };
  }, [COL.L, COL.C, COL.R, ROW.mid, ROW.top, ROW.bot]);

  const toLocal = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: COL.C, y: ROW.mid };
    const r = svg.getBoundingClientRect();
    return {
      x: ((clientX - r.left) / r.width) * W,
      y: ((clientY - r.top) / r.height) * H,
    };
  }, [COL.C, ROW.mid]);

  const settle = useCallback((pos: { x: number; y: number }) => {
    // Snap to a slot if close enough; else fall back to neutral.
    let best: typeof slots[number] | null = null;
    let bestD = Infinity;
    for (const s of slots) {
      const d = Math.hypot(s.x - pos.x, s.y - pos.y);
      if (d < bestD) { bestD = d; best = s; }
    }
    if (best && bestD < 26) {
      setKnob({ x: best.x, y: best.y });
      setActive(best.gear);
      onShift(labelOf(best.gear));
    } else {
      setKnob({ x: COL.C, y: ROW.mid });
      setActive(null);
    }
  }, [onShift]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (locked) return;
    const move = (e: PointerEvent) => {
      if (!dragging.current) return;
      const p = toLocal(e.clientX, e.clientY);
      setKnob(constrain(p.x, p.y));
    };
    const up = (e: PointerEvent) => {
      if (!dragging.current) return;
      dragging.current = false;
      const p = toLocal(e.clientX, e.clientY);
      settle(constrain(p.x, p.y));
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [constrain, toLocal, settle, locked]);

  const railStroke = 'rgba(120,150,170,0.3)';
  return (
    <svg
      ref={svgRef}
      width="min(86vw, 280px)"
      viewBox={`0 0 ${W} ${H}`}
      style={{ margin: '24px auto 0', display: 'block', touchAction: 'none', cursor: locked ? 'default' : 'grab' }}
      onPointerDown={(e) => { if (!locked) { dragging.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); } }}
    >
      {/* Plate */}
      <rect x={56} y={50} width={168} height={120} rx={14}
        fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.09)" />
      {/* Rails */}
      {[COL.L, COL.C, COL.R].map((x) => (
        <line key={x} x1={x} y1={ROW.top} x2={x} y2={ROW.bot} stroke={railStroke} strokeWidth={2} strokeLinecap="round" />
      ))}
      <line x1={COL.L} y1={ROW.mid} x2={COL.R} y2={ROW.mid} stroke={railStroke} strokeWidth={2} strokeLinecap="round" />
      {/* Slots */}
      {slots.map((s) => {
        const isActive = active === s.gear;
        return (
          <g key={s.gear}>
            <circle cx={s.x} cy={s.y} r={13}
              fill={isActive ? 'rgba(0,229,255,0.16)' : 'rgba(3,8,16,0.7)'}
              stroke={isActive ? 'rgba(0,229,255,0.85)' : 'rgba(0,180,216,0.35)'} strokeWidth={isActive ? 2 : 1} />
            <text x={s.x} y={s.y + 3.5} textAnchor="middle" fontFamily="monospace" fontSize={11}
              fontWeight="700" fill={isActive ? '#00e5ff' : 'rgba(150,185,205,0.8)'}>{s.gear}</text>
          </g>
        );
      })}
      {/* Knob */}
      <g style={{ transition: dragging.current ? 'none' : 'transform 0.35s cubic-bezier(0.2,1.4,0.4,1)' }}
        transform={`translate(${knob.x} ${knob.y})`}>
        <circle r={15} fill="rgba(0,200,235,0.18)" />
        <circle r={10} fill="#0d1219" stroke="rgba(0,229,255,0.9)" strokeWidth={1.5} />
        <circle r={3} fill="#00e5ff" />
        {!locked && active === null && (
          <circle r={15} fill="none" stroke="rgba(0,229,255,0.6)" strokeWidth={1.5}
            style={{ animation: 'ob-knob-pulse 1.8s ease-out infinite' }} />
        )}
      </g>
    </svg>
  );
}

// ─── Style helpers ────────────────────────────────────────────────────────────
function revealStyle(delay: number, base: React.CSSProperties): React.CSSProperties {
  return {
    ...base,
    opacity: 0,
    animation: `ob-reveal 0.7s cubic-bezier(0.2,0.7,0.2,1) ${delay}s forwards`,
  };
}

const dotsRow: React.CSSProperties = {
  display: 'flex',
  gap: 18,
  justifyContent: 'center',
  marginBottom: 28,
};

const dot = (on: boolean): React.CSSProperties => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: on ? '#00e5ff' : 'rgba(140,165,185,0.25)',
  boxShadow: on ? '0 0 8px rgba(0,229,255,0.6)' : 'none',
  transition: 'all 0.3s',
});

const dotLabel = (cur: boolean): React.CSSProperties => ({
  fontFamily: 'monospace',
  fontSize: 9.5,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: cur ? 'rgba(0,200,235,0.9)' : 'rgba(140,165,185,0.45)',
  transition: 'color 0.3s',
});

const eyebrowStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 11,
  letterSpacing: '0.28em',
  textTransform: 'uppercase',
  color: 'rgba(120,150,170,0.7)',
  marginBottom: 16,
};

const nameStyle: React.CSSProperties = {
  fontFamily: 'var(--font-poppins), system-ui, sans-serif',
  fontSize: 'clamp(38px, 8vw, 68px)',
  fontWeight: 800,
  letterSpacing: '-0.01em',
  lineHeight: 1.02,
  margin: 0,
  color: '#f2f6fb',
};

const introStyle: React.CSSProperties = {
  fontFamily: 'system-ui, sans-serif',
  fontSize: 'clamp(14px, 2.1vw, 16px)',
  lineHeight: 1.65,
  color: 'rgba(180,195,210,0.82)',
  maxWidth: 460,
  margin: '20px auto 0',
};

const stepNo: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 11,
  letterSpacing: '0.24em',
  textTransform: 'uppercase',
  color: 'rgba(0,180,216,0.6)',
  marginBottom: 10,
};

const stepTitle: React.CSSProperties = {
  fontFamily: 'var(--font-poppins), system-ui, sans-serif',
  fontSize: 'clamp(28px, 6vw, 44px)',
  fontWeight: 800,
  letterSpacing: '-0.01em',
  lineHeight: 1.05,
  margin: 0,
  color: '#f2f6fb',
};

const stepBody: React.CSSProperties = {
  fontFamily: 'system-ui, sans-serif',
  fontSize: 'clamp(13px, 2vw, 15px)',
  lineHeight: 1.6,
  color: 'rgba(180,195,210,0.8)',
  maxWidth: 420,
  margin: '14px auto 0',
};

const hintText: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 11,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'rgba(0,200,235,0.55)',
  marginTop: 4,
  animation: 'ob-blink 1.8s ease-in-out infinite',
};

const shiftResult: React.CSSProperties = {
  fontFamily: 'system-ui, sans-serif',
  fontSize: 13.5,
  color: 'rgba(190,225,240,0.9)',
  animation: 'ob-reveal 0.4s ease',
};

const ctaRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  justifyContent: 'center',
  alignItems: 'center',
  flexWrap: 'wrap',
  marginTop: 32,
};

const ctaBase: React.CSSProperties = {
  fontFamily: 'var(--font-poppins), system-ui, sans-serif',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  borderRadius: 8,
};

const ctaPrimary: React.CSSProperties = {
  ...ctaBase,
  fontSize: 14,
  fontWeight: 600,
  padding: '12px 28px',
  color: '#04121a',
  background: 'rgba(0,200,235,0.92)',
  border: '1px solid rgba(0,229,255,0.6)',
  boxShadow: '0 6px 20px rgba(0,180,216,0.22)',
};

const ctaGhost: React.CSSProperties = {
  ...ctaBase,
  fontSize: 13,
  padding: '11px 18px',
  color: 'rgba(160,180,196,0.6)',
  background: 'none',
  border: '1px solid rgba(255,255,255,0.1)',
};

// Big animated mouse for the scroll step
const bigMouse: React.CSSProperties = {
  position: 'relative',
  display: 'inline-block',
  width: 34,
  height: 54,
  borderRadius: 18,
  border: '2px solid rgba(0,200,235,0.6)',
  boxShadow: '0 0 22px rgba(0,200,235,0.18)',
};

const bigWheel: React.CSSProperties = {
  position: 'absolute',
  left: '50%',
  top: 10,
  width: 4,
  height: 11,
  marginLeft: -2,
  borderRadius: 2,
  background: '#00e5ff',
  boxShadow: '0 0 8px #00e5ff',
  animation: 'ob-wheel 1.4s ease-in-out infinite',
};

const scrollCueWrap: React.CSSProperties = {
  position: 'fixed',
  left: '50%',
  bottom: 26,
  transform: 'translateX(-50%)',
  zIndex: 55,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 9,
  fontFamily: 'monospace',
  pointerEvents: 'none',
  animation: 'ob-cue-in 0.8s ease 0.2s both',
};

const scrollCueLabel: React.CSSProperties = {
  fontSize: 9.5,
  letterSpacing: '0.24em',
  textTransform: 'uppercase',
  color: 'rgba(140,165,185,0.6)',
};

const scrollCueMouse: React.CSSProperties = {
  position: 'relative',
  width: 20,
  height: 32,
  borderRadius: 12,
  border: '1.5px solid rgba(140,175,195,0.5)',
  display: 'block',
};

const scrollCueWheel: React.CSSProperties = {
  position: 'absolute',
  left: '50%',
  top: 6,
  width: 3,
  height: 7,
  marginLeft: -1.5,
  borderRadius: 2,
  background: 'rgba(0,200,235,0.9)',
  animation: 'ob-wheel 1.5s ease-in-out infinite',
};

// ─── Keyframes (injected once) ────────────────────────────────────────────────
const KEYFRAMES = `
@keyframes ob-fade-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes ob-fade-out { from { opacity: 1 } to { opacity: 0; visibility: hidden } }
@keyframes ob-reveal { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
@keyframes ob-swap { from { opacity: 0; transform: translateY(10px) scale(0.99) } to { opacity: 1; transform: translateY(0) scale(1) } }
@keyframes ob-cue-in { from { opacity: 0; transform: translate(-50%, 10px) } to { opacity: 1; transform: translate(-50%, 0) } }
@keyframes ob-wheel { 0% { opacity: 0; transform: translateY(0) } 30% { opacity: 1 } 100% { opacity: 0; transform: translateY(13px) } }
@keyframes ob-blink { 0%,100% { opacity: 0.4 } 50% { opacity: 1 } }
@keyframes ob-knob-pulse { 0% { transform: scale(1); opacity: 0.7 } 100% { transform: scale(2.1); opacity: 0 } }
.ob-enter:hover { background: rgba(0,220,255,1) !important; box-shadow: 0 8px 26px rgba(0,200,235,0.34) !important; transform: translateY(-1px); }
.ob-enter:active { transform: translateY(0); }
`;
