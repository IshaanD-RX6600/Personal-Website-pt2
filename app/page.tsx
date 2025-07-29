"use client";

import Lightning from "@/components/Lightning";
import Dock from "@/components/Dock";
import { VscHome, VscArchive, VscAccount, VscSettingsGear, VscCode } from "react-icons/vsc";

export default function HomePage() {
  const dockItems = [
    { icon: <VscHome size={18} />, label: 'Home', onClick: () => alert('Home!') },
    { icon: <VscCode size={18} />, label: 'Projects', onClick: () => alert('Projects!') },
    { icon: <VscAccount size={18} />, label: 'About', onClick: () => alert('About!') },
    { icon: <VscArchive size={18} />, label: 'Resume', onClick: () => alert('Resume!') },
    { icon: <VscSettingsGear size={18} />, label: 'Contact', onClick: () => alert('Contact!') },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Lightning Background */}
      <div className="absolute inset-0">
        <Lightning
          hue={220}
          xOffset={0}
          speed={1}
          intensity={1}
          size={1}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <h1 className="text-6xl md:text-8xl font-bold text-white text-center">
          Ishaan Dhiman
        </h1>
      </div>

      {/* Dock Navigation */}
      <div className="relative z-20">
        <Dock 
          items={dockItems}
          panelHeight={68}
          baseItemSize={50}
          magnification={70}
        />
      </div>
    </div>
  )
}
