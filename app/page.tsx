"use client";

import dynamic from 'next/dynamic';
import SimpleDock from "@/components/SimpleDock";
import GlitchText from "@/components/GlitchText";
import { VscHome, VscAccount, VscSettingsGear, VscCode, VscBook } from "react-icons/vsc";

const CarModel = dynamic(() => import('@/components/CarModel'), { ssr: false, loading: () => null });

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

      {/* ── 3D Model — full-screen background ── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <CarModel />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 65% at 55% 52%, transparent 25%, rgba(10,22,40,0.6) 58%, #0a1628 88%)',
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="relative px-4 sm:px-8 max-w-4xl w-full text-center">

          {/* Main name */}
          <GlitchText
            speed={1}
            enableShadows={true}
            enableOnHover={true}
            className="text-4xl sm:text-6xl md:text-8xl font-bold text-white"
          >
            Ishaan Dhiman
          </GlitchText>

        </div>
      </div>

      <SimpleDock items={dockItems} />
    </div>
  );
}
