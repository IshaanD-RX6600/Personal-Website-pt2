"use client";

import { useEffect, useState } from 'react';

// Tiny first-visit onboarding. Two clean instructions that mirror the only two
// non-obvious interactions: scroll drives the 3D camera, and once you reach the
// cabin the gear shifter navigates sections. Dismissed state persists so repeat
// visitors never see it again.
const SEEN_KEY = 'onboarding-seen-v1';

// pRef crosses ~0.58 when the shifter comes into view — same threshold the
// GearShifter uses to become interactive.
const SHIFTER_VISIBLE_P = 0.58;

const STEPS = [
  { icon: '↓', title: 'Scroll to drive', body: 'Scroll down to steer the camera through the scene.' },
  { icon: '⇄', title: 'Shift to navigate', body: 'At the cabin, drag or tap the gear knob to open a section.' },
] as const;

export default function Onboarding({ pRef }: { pRef: React.MutableRefObject<number> }) {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  // Decide visibility on mount (client only — localStorage isn't on the server)
  useEffect(() => {
    try {
      if (!localStorage.getItem(SEEN_KEY)) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  // Auto-advance to step 2 once the visitor has scrolled to the shifter, so the
  // gear instruction lands exactly when it's actionable.
  useEffect(() => {
    if (!show || step !== 0) return;
    const id = setInterval(() => {
      if (pRef.current >= SHIFTER_VISIBLE_P) {
        setStep(1);
        clearInterval(id);
      }
    }, 200);
    return () => clearInterval(id);
  }, [show, step, pRef]);

  function dismiss() {
    try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* private mode — fine */ }
    setShow(false);
  }

  if (!show) return null;
  const s = STEPS[step];

  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 28,
        transform: 'translateX(-50%)',
        zIndex: 60,
        width: 'min(92vw, 340px)',
        padding: '16px 18px',
        background: 'rgba(3,8,20,0.92)',
        border: '1px solid rgba(0,229,255,0.35)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 0 28px rgba(0,229,255,0.12)',
        fontFamily: 'monospace',
        color: 'rgba(200,235,255,0.92)',
        userSelect: 'none',
        animation: 'onboarding-rise 0.4s ease-out',
      }}
    >
      <style>{`@keyframes onboarding-rise{from{opacity:0;transform:translate(-50%,12px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>

      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <span
          aria-hidden
          style={{
            fontSize: 22,
            lineHeight: 1,
            color: '#00e5ff',
            textShadow: '0 0 12px rgba(0,229,255,0.6)',
            marginTop: 1,
          }}
        >
          {s.icon}
        </span>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#00e5ff',
              marginBottom: 4,
            }}
          >
            {s.title}
          </div>
          <div style={{ fontSize: 11.5, lineHeight: 1.45, color: 'rgba(170,210,235,0.85)' }}>
            {s.body}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 14,
        }}
      >
        {/* Step dots */}
        <div style={{ display: 'flex', gap: 6 }}>
          {STEPS.map((_, i) => (
            <span
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: i === step ? '#00e5ff' : 'rgba(0,180,216,0.3)',
                boxShadow: i === step ? '0 0 6px #00e5ff' : 'none',
                transition: 'background 0.25s, box-shadow 0.25s',
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={dismiss} style={btnGhost}>
            Skip
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(step + 1)} style={btnPrimary}>
              Next
            </button>
          ) : (
            <button onClick={dismiss} style={btnPrimary}>
              Got it
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const btnBase: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 10.5,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  padding: '5px 12px',
  cursor: 'pointer',
  borderRadius: 2,
  transition: 'all 0.2s',
};

const btnGhost: React.CSSProperties = {
  ...btnBase,
  background: 'none',
  border: '1px solid rgba(0,180,216,0.25)',
  color: 'rgba(0,180,216,0.6)',
};

const btnPrimary: React.CSSProperties = {
  ...btnBase,
  background: 'rgba(0,229,255,0.12)',
  border: '1px solid rgba(0,229,255,0.55)',
  color: '#00e5ff',
};
