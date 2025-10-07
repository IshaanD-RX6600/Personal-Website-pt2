"use client";
import Link from 'next/link';

interface DockItem { icon: React.ReactNode; label: string; href?: string; onClick?: () => void }
interface SimpleDockProps { items: DockItem[] }

export default function SimpleDock({ items }: SimpleDockProps) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-4 bg-black/25 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3 shadow-lg">
        {items.map((item, i) => {
          const inner = (
            <>
              <div className="text-white">{item.icon}</div>
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">{item.label}</div>
              </div>
            </>
          );
          if (item.href) {
            return (
              <Link
                key={i}
                href={item.href}
                className="relative group flex items-center justify-center w-12 h-12 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110"
                title={item.label}
              >
                {inner}
              </Link>
            );
          }
          return (
            <button
              key={i}
              type="button"
              onClick={item.onClick}
              className="relative group flex items-center justify-center w-12 h-12 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110"
              title={item.label}
            >
              {inner}
            </button>
          );
        })}
      </div>
    </div>
  );
}
