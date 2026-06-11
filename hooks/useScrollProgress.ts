"use client";

import { useCallback, useEffect, useRef } from 'react';
import Lenis from 'lenis';

/**
 * Smooth-scroll engine for the 3D timeline.
 *
 * Creates a Lenis instance on the window and writes normalized scroll
 * progress (0→1 over the full page height) into `pRef` — a plain ref, so
 * nothing re-renders per scroll frame. The 3D camera rig reads pRef inside
 * useFrame.
 */
export function useScrollProgress() {
  const pRef = useRef(0);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true, duration: 1.2, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on('scroll', ({ scroll, limit }: Lenis) => {
      pRef.current = limit > 0 ? Math.min(1, Math.max(0, scroll / limit)) : 0;
    });
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  /** Animate the page to a normalized timeline position (0–1). */
  const scrollToProgress = useCallback((p: number) => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    lenis.start(); // in case a panel had locked scrolling
    lenis.scrollTo(lenis.limit * Math.min(1, Math.max(0, p)), { duration: 1.6 });
  }, []);

  /** Freeze page scroll (while an overlay panel is open). */
  const lock = useCallback(() => lenisRef.current?.stop(), []);
  const unlock = useCallback(() => lenisRef.current?.start(), []);

  return { pRef, scrollToProgress, lock, unlock };
}
