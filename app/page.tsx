"use client";

import SimpleDock from "@/components/SimpleDock";
import GlitchText from "@/components/GlitchText";
import { VscHome, VscAccount, VscSettingsGear, VscCode, VscBook } from "react-icons/vsc";

export default function HomePage() {
  const dockItems = [
    { icon: <VscHome size={18} />, label: 'Home', href: '/' },
    { icon: <VscCode size={18} />, label: 'Projects', href: '/projects' },
    { icon: <VscBook size={18} />, label: 'Blog', href: '/blog' },
    { icon: <VscAccount size={18} />, label: 'About', href: '/about' },
    { icon: <VscSettingsGear size={18} />, label: 'Contact', href: '/contact' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden blueprint-bg">

      {/* ── Full-page corner bracket frame ── */}
      <div className="fixed top-3 left-3 w-8 h-8 pointer-events-none z-10"
        style={{ borderTop: '1.5px solid rgba(0,180,216,0.35)', borderLeft: '1.5px solid rgba(0,180,216,0.35)' }} />
      <div className="fixed top-3 right-3 w-8 h-8 pointer-events-none z-10"
        style={{ borderTop: '1.5px solid rgba(0,180,216,0.35)', borderRight: '1.5px solid rgba(0,180,216,0.35)' }} />
      <div className="fixed bottom-3 left-3 w-8 h-8 pointer-events-none z-10"
        style={{ borderBottom: '1.5px solid rgba(0,180,216,0.35)', borderLeft: '1.5px solid rgba(0,180,216,0.35)' }} />
      <div className="fixed bottom-3 right-3 w-8 h-8 pointer-events-none z-10"
        style={{ borderBottom: '1.5px solid rgba(0,180,216,0.35)', borderRight: '1.5px solid rgba(0,180,216,0.35)' }} />

      {/* ── Top-left technical stamp ── */}
      <div className="fixed top-5 left-5 z-10 select-none pointer-events-none">
        <div className="bp-annotation opacity-55 space-y-0.5">
          <div>DRAWN BY: I.DHIMAN</div>
          <div>DATE: 2026-06</div>
          <div>REV: A</div>
        </div>
      </div>

      {/* ── Top-right sheet info ── */}
      <div className="fixed top-5 right-5 z-10 text-right select-none pointer-events-none">
        <div className="bp-annotation opacity-55 space-y-0.5">
          <div>SHEET: 1 / 5</div>
          <div>SCALE: 1:1</div>
          <div>FILE: PORT-A001</div>
        </div>
      </div>

      {/* ── Bottom-left coordinate stamp ── */}
      <div className="fixed bottom-20 left-5 z-10 select-none pointer-events-none">
        <div className="bp-annotation opacity-38 space-y-0.5">
          <div>LAT: 43.4516°N</div>
          <div>LNG: 80.4925°W</div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="relative px-8 max-w-4xl w-full">

          {/* Dimension annotation above name */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 md:w-24 bp-dim-line" />
            <span className="bp-annotation opacity-80">COMPONENT: HERO_IDENTIFICATION</span>
            <div className="w-10 md:w-24 bp-dim-line" />
          </div>

          {/* Main name */}
          <div className="flex justify-center">
            <GlitchText
              speed={1}
              enableShadows={true}
              enableOnHover={true}
              className="text-6xl md:text-8xl font-bold text-white text-center"
            >
              Ishaan Dhiman
            </GlitchText>
          </div>

          {/* Callout label below name */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="w-6 md:w-14 bp-dim-line" />
            <span className="bp-label">Full-Stack Developer // AI Builder</span>
            <div className="w-6 md:w-14 bp-dim-line" />
          </div>

          {/* Sub-annotation line */}
          <div className="text-center mt-4">
            <span className="bp-annotation" style={{ opacity: 0.65 }}>
              KITCHENER, ON &nbsp;∥&nbsp; GRADE 11 IB &nbsp;∥&nbsp; CAMERON HEIGHTS CI
            </span>
          </div>

          {/* Dimension line below the whole block */}
          <div className="mt-10 flex items-center gap-3 justify-center">
            <div className="w-16 md:w-32 bp-dim-line" />
            <span className="bp-annotation opacity-40">END COMPONENT</span>
            <div className="w-16 md:w-32 bp-dim-line" />
          </div>
        </div>
      </div>

      {/* Dock Navigation */}
      <SimpleDock items={dockItems} />
    </div>
  );
}
