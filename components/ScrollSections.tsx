"use client";

import { useEffect, useRef } from 'react';

/**
 * Scroll-linked HTML overlays for the 3D garage timeline (hero + about + nav hint).
 * Opacity is written imperatively from pRef in one rAF loop — zero re-renders.
 *
 * Visibility ranges (p = normalized scroll, matches WP keyframes in CarModel):
 *   Hero:  in at top, out 0.06→0.11   (gone as the garage door starts lifting)
 *   About: in 0.29→0.35, out 0.39→0.44 (the aisle glide, before the car stops)
 *   Hint:  in 0.93→0.98, holds to the end (the parked cars = nav)
 */

// Linear fade-in over [in0,in1], hold at 1, fade-out over [out0,out1]
function ramp(p: number, in0: number, in1: number, out0: number, out1: number) {
  if (p <= in0) return 0;
  if (p < in1)  return (p - in0) / (in1 - in0);
  if (p <= out0) return 1;
  if (p < out1) return 1 - (p - out0) / (out1 - out0);
  return 0;
}

export default function ScrollSections({
  pRef,
  onRestart,
}: {
  pRef: React.MutableRefObject<number>;
  /** Smooth-scrolls the timeline back to p=0 (the closed garage door) */
  onRestart: () => void;
}) {
  const heroRef  = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const hintRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = pRef.current;

      if (heroRef.current) {
        // in0 = -1: fully visible at the very top (ramp(0, 0, …) would be 0)
        const o = ramp(p, -1, 0, 0.06, 0.11);
        heroRef.current.style.opacity = String(o);
        heroRef.current.style.visibility = o > 0.01 ? 'visible' : 'hidden';
      }
      if (aboutRef.current) {
        const o = ramp(p, 0.29, 0.35, 0.39, 0.44);
        aboutRef.current.style.opacity = String(o);
        aboutRef.current.style.visibility = o > 0.01 ? 'visible' : 'hidden';
        // Slight parallax drift while in range. Keep the -50% vertical centering
        // (Tailwind's -translate-y-1/2 lives on `transform`, which we overwrite here).
        aboutRef.current.style.transform = `translateY(calc(-50% + ${(0.365 - p) * 200}px))`;
      }
      if (hintRef.current) {
        // out0=2: never fades back out — holds through the end of the timeline
        const o = ramp(p, 0.93, 0.98, 2, 3);
        hintRef.current.style.opacity = String(o);
        hintRef.current.style.visibility = o > 0.01 ? 'visible' : 'hidden';
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pRef]);

  return (
    <div className="fixed inset-0 z-10 pointer-events-none">
      {/* ── Hero ── */}
      <div ref={heroRef} className="absolute inset-x-0 top-[12vh] text-center px-6" style={{ opacity: 0 }}>
        <div className="bp-annotation mb-3">full stack developer</div>
        <h1
          className="text-5xl sm:text-7xl font-black tracking-tight text-foreground"
          style={{
            fontFamily: 'var(--font-poppins)',
            // Legible over the bright daytime sky
            textShadow: '0 2px 20px rgba(4,16,32,0.65), 0 1px 3px rgba(4,16,32,0.8)',
          }}
        >
          Ishaan Dhiman
        </h1>
        <p
          className="mt-4 text-muted-foreground max-w-md mx-auto text-sm sm:text-base"
          style={{ textShadow: '0 1px 10px rgba(4,16,32,0.7), 0 1px 2px rgba(4,16,32,0.85)' }}
        >
          I build fast, beautiful things for the web.
        </p>
        <div className="absolute left-1/2 -translate-x-1/2 top-[68vh] bp-annotation animate-bounce">
          scroll to open the garage ↓
        </div>
      </div>

      {/* ── About ── */}
      <div
        ref={aboutRef}
        className="absolute left-[6vw] sm:left-[8vw] top-1/2 -translate-y-1/2 w-[min(86vw,26rem)]"
        style={{ opacity: 0 }}
      >
        <div className="bp-card p-6 sm:p-8">
          <div className="bp-label mb-3">About</div>
          <h2 className="text-2xl font-black text-foreground mb-3" style={{ fontFamily: 'var(--font-poppins)' }}>
            Welcome to the garage.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            I&apos;m a high school developer passionate about building AI tools,
            full-stack applications, and experimental projects. I enjoy exploring
            LLMs, machine learning, and real-world software problems. Currently a
            Grade 11 IB student at Cameron Heights Collegiate Institute in
            Kitchener, Ontario.
          </p>
          <div className="grid grid-cols-2 gap-2 mt-5">
            <div className="border border-primary/20 px-3 py-2 text-center">
              <div className="text-lg font-black text-primary">300+</div>
              <div className="bp-annotation">Volunteer Hours</div>
            </div>
            <div className="border border-primary/20 px-3 py-2 text-center">
              <div className="text-lg font-black text-primary">8+</div>
              <div className="bp-annotation">Hackathons</div>
            </div>
          </div>
          <div className="bp-annotation mt-4">keep scrolling → around the car · the parked cars = nav</div>
        </div>
      </div>

      {/* ── Nav hint + restart (showroom finale) ── */}
      <div
        ref={hintRef}
        className="absolute inset-x-0 bottom-[6vh] flex flex-col items-center gap-3 text-center"
        style={{ opacity: 0 }}
      >
        <span className="bp-annotation">click a parked car to open its section</span>
        {/* The overlay container is pointer-events-none; re-enable for the button */}
        <button
          className="bp-btn px-4 py-2 pointer-events-auto"
          onClick={onRestart}
        >
          [ ↑ ] back to the start
        </button>
      </div>
    </div>
  );
}
