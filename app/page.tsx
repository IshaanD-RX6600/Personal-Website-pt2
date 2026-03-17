"use client";

import SimpleDock from "@/components/SimpleDock";
import GlitchText from "@/components/GlitchText";
import { VscHome, VscArchive, VscAccount, VscSettingsGear, VscCode, VscBook } from "react-icons/vsc";

export default function HomePage() {
  const dockItems = [
    { icon: <VscHome size={18} />, label: 'Home', href: '/' },
    { icon: <VscCode size={18} />, label: 'Projects', href: '/projects' },
    { icon: <VscBook size={18} />, label: 'Blog', href: '/blog' },
    { icon: <VscAccount size={18} />, label: 'About', href: '/about' },
    { icon: <VscArchive size={18} />, label: 'Resume', href: '/resume' },
    { icon: <VscSettingsGear size={18} />, label: 'Contact', href: '/contact' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <GlitchText
          speed={1}
          enableShadows={true}
          enableOnHover={true}
          className="text-6xl md:text-8xl font-bold text-white text-center"
        >
          Ishaan Dhiman
        </GlitchText>
      </div>

      {/* Dock Navigation */}
      <SimpleDock items={dockItems} />
    </div>
  )
}
