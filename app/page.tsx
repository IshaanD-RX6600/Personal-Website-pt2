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
// Bigger = slower, more deliberate scrub. Tune 500–700vh to taste.
const TIMELINE_HEIGHT = '600vh';

export default function HomePage() {
  const [mode, setMode] = useState<'loading' | 'full' | 'fallback'>('loading');
  const { pRef, scrollToProgress, lock, unlock } = useScrollProgress();
  const activeSection = useSiteStore(s => s.activeSection);

  // Capability detection — decide once on mount (client only, avoids hydration mismatch)
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const small   = matchMedia('(max-width: 767px), (pointer: coarse) and (max-width: 1023px)').matches;
    const webgl = (() => {
      try {
        const c = document.createElement('canvas');
        return !!(c.getContext('webgl2') || c.getContext('webgl'));
      } catch {
        return false;
      }
    })();
    // TEMP DEBUG — remove once cause is confirmed
    console.log('[capability]', {
      reduced,
      small,
      webgl,
      innerWidth: window.innerWidth,
      pointer: matchMedia('(pointer: coarse)').matches ? 'coarse' : 'fine',
    });
    setMode(reduced || small || !webgl ? 'fallback' : 'full');
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
        <CarModel pRef={pRef} onNavScroll={scrollToProgress} />
      </div>

      {/* Hero / About overlays, scroll-linked */}
      <ScrollSections pRef={pRef} />

      {/* The only in-flow element: gives the page its scrollable timeline */}
      <div style={{ height: TIMELINE_HEIGHT }} aria-hidden />

      {/* Gear-shifter section panels */}
      <SectionPanels />
    </>
  );
}
