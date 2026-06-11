"use client";

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSiteStore } from '@/stores/useSiteStore';
import { SECTION_META, SectionBody } from './sections/SectionContent';

/**
 * Full-screen overlay panels opened by the 3D gear shifter.
 * Unmounted entirely when closed, so they never block canvas pointer events.
 */
export default function SectionPanels() {
  const activeSection = useSiteStore(s => s.activeSection);
  const closeSection  = useSiteStore(s => s.closeSection);

  useEffect(() => {
    if (!activeSection) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSection(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeSection, closeSection]);

  return (
    <AnimatePresence>
      {activeSection && (
        <motion.div
          key={activeSection}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-50 overflow-y-auto"
          data-lenis-prevent
          style={{
            background: 'rgba(5,10,22,0.88)',
            backdropFilter: 'blur(8px)',
            overscrollBehavior: 'contain',
          }}
        >
          <motion.div
            initial={{ y: 24 }}
            animate={{ y: 0 }}
            exit={{ y: 24 }}
            transition={{ duration: 0.35 }}
            className="bp-card mx-auto my-[7vh] w-[min(94vw,56rem)] p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="bp-annotation mb-1">
                  gear {SECTION_META[activeSection].gear} · {SECTION_META[activeSection].label}
                </div>
                <h2 className="text-2xl font-black text-foreground" style={{ fontFamily: 'var(--font-poppins)' }}>
                  {SECTION_META[activeSection].title}
                </h2>
              </div>
              <button className="bp-btn shrink-0" onClick={closeSection}>
                [ N ] close
              </button>
            </div>

            <SectionBody id={activeSection} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
