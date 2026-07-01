"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { useSiteStore } from '@/stores/useSiteStore';
import ScrollSections from '@/components/ScrollSections';
import SectionPanels from '@/components/SectionPanels';
import MobileFallback from '@/components/MobileFallback';

const CarModel = dynamic(() => import('@/components/CarModel'), {
  ssr: false,
  loading: () => null,
});

// Total scrollable height driving the 0→1 camera timeline.
// Bigger = slower, more deliberate scrub. Each section car owns ~15% of the
// timeline (see WP in CarModel.tsx), so at 1800vh a single car's stop takes
// ~2.5 screens of scrolling — a deliberately slow showroom walk.
const TIMELINE_HEIGHT = '1800vh';

export default function HomePage() {
  const [mode, setMode] = useState<'loading' | 'full' | 'fallback'>('loading');
  const { pRef, lock, unlock } = useScrollProgress();
  const activeSection = useSiteStore(s => s.activeSection);

  // Capability detection — decide once on mount (client only, avoids hydration mismatch).
  // The 3D car runs on mobile/touch too (responsive Canvas, capped DPR, pointer-event
  // controls), so screen size no longer forces the fallback. We only fall back when the
  // device genuinely can't render it (no WebGL) or the user opted out of motion.
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const webgl = (() => {
      try {
        const c = document.createElement('canvas');
        return !!(c.getContext('webgl2') || c.getContext('webgl'));
      } catch {
        return false;
      }
    })();
    setMode(reduced || !webgl ? 'fallback' : 'full');
  }, []);

  // Freeze page scroll while an overlay panel is open (panel scrolls natively)
  useEffect(() => {
    if (activeSection) lock(); else unlock();
  }, [activeSection, lock, unlock]);

  if (mode === 'fallback') return <MobileFallback />;
  if (mode === 'loading') return null;

  return (
    <>
      {/* 3D scene — fixed, scrubbed by scroll via pRef */}
      <div className="fixed inset-0 z-0">
        <CarModel pRef={pRef} />
      </div>

      {/* Hero / About overlays, scroll-linked */}
      <ScrollSections pRef={pRef} />

      {/* The only in-flow element: gives the page its scrollable timeline */}
      <div style={{ height: TIMELINE_HEIGHT }} aria-hidden />

      {/* Wall-panel section overlays */}
      <SectionPanels />
    </>
  );
}