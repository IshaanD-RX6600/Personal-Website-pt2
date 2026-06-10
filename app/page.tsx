"use client";

import dynamic from 'next/dynamic';

const CarModel = dynamic(() => import('@/components/CarModel'), {
  ssr: false,
  loading: () => null,
});

export default function HomePage() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <CarModel scrollProgress={0} reducedMotion={false} />
    </div>
  );
}
