"use client";

import { useEffect, useRef, useState } from 'react';

// ─── First-visit welcome ─────────────────────────────────────────────────────
// A calm, personal intro to the portfolio: who I am, what this is, and the two
// simple ways to move around. Deliberately understated — no HUD theatrics — so
// it reads like a greeting, not a dashboard. After it closes, a soft scroll cue
// invites you in. Dismissed state persists so returning visitors land straight
// in the scene.
const SEEN_KEY = 'onboarding-seen-v3';

// pRef crosses ~0.58 when the shifter comes into view (matches GearShifter).
const SHIFTER_VISIBLE_P = 0.58;

const STEPS = [
  {
    no: '01',
    title: 'Scroll to explore',
    body: 'Scrolling moves you through the scene — from the car outside, into the driver’s seat.',
  },
  {
    no: '02',
    title: 'Use the gear shifter',
    body: 'Once you’re inside, the gear knob is the menu. Each slot opens a part of my work.',
  },
] as const;

type Phase = 'intro' | 'closing' | 'done';

export default function Onboarding({ pRef }: { pRef: React.MutableRefObject<number> }) {
  const [phase, setPhase] = useState<Phase | null>(null); // null = undecided (first paint)
  const [scrollCue, setScrollCue] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Decide on mount (client only — localStorage isn't available on the server)
  useEffect(() => {
    let seen = false;
    try { seen = !!localStorage.getItem(SEEN_KEY); } catch { /* private mode */ }
    setPhase(seen ? 'done' : 'intro');
    if (seen) setScrollCue(true); // returning visitors still get the scroll nudge
  }, []);

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
    // Let the fade play before fully unmounting the overlay
    closeTimer.current = setTimeout(() => setPhase('done'), 700);
  }

  if (phase === null) return null;

  return (
    <>
      <style>{KEYFRAMES}</style>

      {/* ── Welcome overlay ── */}
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
              'radial-gradient(130% 120% at 50% 30%, rgba(10,16,28,0.86) 0%, rgba(4,7,14,0.95) 60%, rgba(2,4,9,0.98) 100%)',
            backdropFilter: 'blur(6px)',
            animation: phase === 'closing' ? 'ob-fade-out 0.65s ease forwards' : 'ob-fade-in 0.6s ease',
          }}
        >
          <div style={{ maxWidth: 620, width: '100%', textAlign: 'center' }}>
            {/* Eyebrow */}
            <div style={revealStyle(0.1, eyebrowStyle)}>Full-stack developer · Portfolio</div>

            {/* Name */}
            <h1 style={revealStyle(0.24, nameStyle)}>Ishaan Dhiman</h1>

            {/* Personal intro */}
            <p style={revealStyle(0.4, introStyle)}>
              Hi — I’m a high-school developer who builds AI tools, full-stack apps,
              and the occasional experiment. This site is one of them: a little
              interactive instead of a wall of text. Here’s how to get around.
            </p>

            {/* The two simple controls */}
            <div style={cardsRowStyle}>
              {STEPS.map((s, i) => (
                <div key={s.no} style={revealStyle(0.56 + i * 0.14, cardStyle)}>
                  <div style={cardNoStyle}>{s.no}</div>
                  <div style={cardTitleStyle}>{s.title}</div>
                  <p style={cardBodyStyle}>{s.body}</p>
                </div>
              ))}
            </div>

            {/* CTA row */}
            <div style={revealStyle(0.9, ctaRowStyle)}>
              <button onClick={enter} style={ctaPrimary} className="ob-enter">
                Take a look
              </button>
              <button onClick={enter} style={ctaGhost}>Skip</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Soft scroll cue (after the welcome closes) ── */}
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

// ─── Style helpers ────────────────────────────────────────────────────────────
function revealStyle(delay: number, base: React.CSSProperties): React.CSSProperties {
  return {
    ...base,
    opacity: 0,
    animation: `ob-reveal 0.7s cubic-bezier(0.2,0.7,0.2,1) ${delay}s forwards`,
  };
}

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
  maxWidth: 480,
  margin: '20px auto 0',
};

const cardsRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 14,
  justifyContent: 'center',
  flexWrap: 'wrap',
  margin: '34px auto 0',
};

const cardStyle: React.CSSProperties = {
  position: 'relative',
  width: 'min(86vw, 260px)',
  textAlign: 'left',
  padding: '18px 20px 20px',
  borderRadius: 10,
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
};

const cardNoStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 11,
  letterSpacing: '0.18em',
  color: 'rgba(0,180,216,0.55)',
  marginBottom: 8,
};

const cardTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-poppins), system-ui, sans-serif',
  fontSize: 15,
  fontWeight: 700,
  color: '#dde7f0',
  marginBottom: 6,
};

const cardBodyStyle: React.CSSProperties = {
  fontFamily: 'system-ui, sans-serif',
  fontSize: 13,
  lineHeight: 1.55,
  color: 'rgba(165,182,198,0.78)',
  margin: 0,
};

const ctaRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  justifyContent: 'center',
  alignItems: 'center',
  flexWrap: 'wrap',
  marginTop: 34,
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
@keyframes ob-cue-in { from { opacity: 0; transform: translate(-50%, 10px) } to { opacity: 1; transform: translate(-50%, 0) } }
@keyframes ob-wheel { 0% { opacity: 0; transform: translateY(0) } 30% { opacity: 1 } 100% { opacity: 0; transform: translateY(10px) } }
.ob-enter:hover { background: rgba(0,220,255,1) !important; box-shadow: 0 8px 26px rgba(0,200,235,0.34) !important; transform: translateY(-1px); }
.ob-enter:active { transform: translateY(0); }
`;
