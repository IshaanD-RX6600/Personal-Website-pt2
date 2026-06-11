"use client";

import { useEffect, useRef } from 'react';

/**
 * Scroll-linked HTML overlays for the 3D timeline (hero + about).
 * Opacity is written imperatively from pRef in one rAF loop — zero re-renders.
 *
 * Visibility ranges (p = normalized scroll, matches WP keyframes in CarModel):
 *   Hero:  in 0.00→0.02, out 0.14→0.20  (gone before the cabin fly-in)
 *   About: in 0.24→0.30, out 0.44→0.50  (lives during the fly-in phase)
 */

// Linear fade-in over [in0,in1], hold at 1, fade-out over [out0,out1]
function ramp(p: number, in0: number, in1: number, out0: number, out1: number) {
  if (p <= in0) return 0;
  if (p < in1)  return (p - in0) / (in1 - in0);
  if (p <= out0) return 1;
  if (p < out1) return 1 - (p - out0) / (out1 - out0);
  return 0;
}

export default function ScrollSections({ pRef }: { pRef: React.MutableRefObject<number> }) {
  const heroRef  = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = pRef.current;

      if (heroRef.current) {
        // in0 = -1: fully visible at the very top (ramp(0, 0, …) would be 0)
        const o = ramp(p, -1, 0, 0.14, 0.2);
        heroRef.current.style.opacity = String(o);
        heroRef.current.style.visibility = o > 0.01 ? 'visible' : 'hidden';
      }
      if (aboutRef.current) {
        const o = ramp(p, 0.24, 0.3, 0.44, 0.5);
        aboutRef.current.style.opacity = String(o);
        aboutRef.current.style.visibility = o > 0.01 ? 'visible' : 'hidden';
        // Slight parallax drift while in range
        aboutRef.current.style.transform = `translateY(${(0.37 - p) * 120}px)`;
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
          style={{ fontFamily: 'var(--font-poppins)' }}
        >
          Ishaan Dhiman
        </h1>
        <p className="mt-4 text-muted-foreground max-w-md mx-auto text-sm sm:text-base">
          I build fast, beautiful things for the web.
        </p>
        <div className="absolute left-1/2 -translate-x-1/2 top-[68vh] bp-annotation animate-bounce">
          scroll ↓
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
            Get in. Buckle up.
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
          <div className="bp-annotation mt-4">keep scrolling → cockpit · shifter = nav</div>
        </div>
      </div>
    </div>
  );
}
