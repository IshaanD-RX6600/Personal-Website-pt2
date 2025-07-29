"use client";

import { VscHome, VscArchive, VscAccount, VscSettingsGear, VscCode } from "react-icons/vsc";

interface SimpleDockProps {
  items: Array<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
  }>;
}

export default function SimpleDock({ items }: SimpleDockProps) {
  const handleClick = (onClick: () => void, label: string) => {
    console.log('Dock item clicked:', label); // Debug log
    try {
      onClick();
    } catch (error) {
      console.error('Click handler error:', error);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-4 bg-black/20 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => handleClick(item.onClick, item.label)}
            className="relative group flex items-center justify-center w-12 h-12 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110 cursor-pointer"
            title={item.label}
            type="button"
          >
            <div className="text-white">
              {item.icon}
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {item.label}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
