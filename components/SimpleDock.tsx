"use client";
import Link from 'next/link';

interface DockItem { icon: React.ReactNode; label: string; href?: string; onClick?: () => void }
interface SimpleDockProps { items: DockItem[] }

export default function SimpleDock({ items }: SimpleDockProps) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div
        className="flex items-center gap-3 px-3 py-2.5 shadow-2xl backdrop-blur-md"
        style={{
          backgroundColor: 'rgba(5, 14, 28, 0.92)',
          border: '1px solid rgba(0, 180, 216, 0.45)',
          borderRadius: '2px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 180, 216, 0.1)',
        }}
      >
        {items.map((item, i) => {
          const inner = (
            <>
              <div style={{ color: 'rgba(0, 200, 240, 0.85)' }}>{item.icon}</div>
              {/* Schematic callout tooltip */}
              <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                <div
                  className="px-2.5 py-1 whitespace-nowrap font-mono text-[0.58rem] tracking-widest uppercase"
                  style={{
                    backgroundColor: 'rgba(5, 14, 28, 0.97)',
                    border: '1px solid rgba(0, 180, 216, 0.4)',
                    color: '#00b4d8',
                    borderRadius: '1px',
                  }}
                >
                  {item.label}
                </div>
                {/* Callout connector line */}
                <div
                  className="mx-auto"
                  style={{
                    width: '1px',
                    height: '6px',
                    background: 'rgba(0, 180, 216, 0.4)',
                  }}
                />
              </div>
            </>
          );

          if (item.href) {
            return (
              <Link
                key={i}
                href={item.href}
                className="relative group flex items-center justify-center w-11 h-11 dock-item"
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
              className="relative group flex items-center justify-center w-11 h-11 dock-item"
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
