"use client";

import { GearShifterFallback } from './GearShifter';
import { SECTION_META, SectionBody } from './sections/SectionContent';
import type { SectionId } from '@/stores/useSiteStore';

const SECTION_ORDER: SectionId[] = ['projects', 'experience', 'skills', 'contact'];

/**
 * Plain stacked-scroll version of the site.
 * Served on small screens, when WebGL is unavailable, and for
 * prefers-reduced-motion. The SVG H-pattern shifter doubles as a
 * jump-to-section nav via in-page anchors.
 */
export default function MobileFallback() {
  return (
    <main className="blueprint-bg min-h-screen">
      {/* ── Hero ── */}
      <header className="min-h-[88vh] flex flex-col items-center justify-center text-center px-6">
        <div className="bp-annotation mb-3">full stack developer</div>
        <h1
          className="text-4xl sm:text-6xl font-black tracking-tight text-foreground"
          style={{ fontFamily: 'var(--font-poppins)' }}
        >
          Ishaan Dhiman
        </h1>
        <p className="mt-4 text-muted-foreground max-w-md text-sm sm:text-base">
          I build fast, beautiful things for the web.
        </p>
        <div className="mt-10">
          <GearShifterFallback />
        </div>
      </header>

      {/* ── About ── */}
      <section id="about" className="max-w-3xl mx-auto px-6 py-16">
        <div className="bp-card p-6 sm:p-8">
          <div className="bp-label mb-3">About</div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            I&apos;m a high school developer passionate about building AI tools,
            full-stack applications, and experimental projects. I enjoy exploring
            LLMs, machine learning, and real-world software problems. Currently a
            Grade 11 IB student at Cameron Heights Collegiate Institute in
            Kitchener, Ontario.
          </p>
        </div>
      </section>

      {/* ── Sections (same content the 3D panels render) ── */}
      {SECTION_ORDER.map(id => (
        <section key={id} id={id} className="max-w-3xl mx-auto px-6 py-16 scroll-mt-8">
          <div className="bp-annotation mb-1">
            gear {SECTION_META[id].gear} · {SECTION_META[id].label}
          </div>
          <h2
            className="text-2xl font-black text-foreground mb-6"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            {SECTION_META[id].title}
          </h2>
          <SectionBody id={id} />
        </section>
      ))}

      <footer className="text-center py-10 bp-annotation">
        © {new Date().getFullYear()} Ishaan Dhiman
      </footer>
    </main>
  );
}
