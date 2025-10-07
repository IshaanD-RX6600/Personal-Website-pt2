"use client";
import React from 'react';

interface BlogHeroImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectFallbackHeight?: number; // optional fixed height if image fails
}

/**
 * Client-only wrapper for blog hero images so we can safely handle load / error events
 * without passing event handlers from a Server Component (which breaks prerender exports).
 */
export function BlogHeroImage({ src, alt, className = '', aspectFallbackHeight = 220 }: BlogHeroImageProps) {
  const [failed, setFailed] = React.useState(false);
  if (!src) return null;

  if (failed) {
    return (
      <div
        className={
          `flex items-center justify-center text-xs tracking-wide text-white/50 italic bg-white/5 border border-white/10 rounded-xl ${className}`
        }
        style={{ minHeight: aspectFallbackHeight }}
      >
        Image unavailable
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}

export default BlogHeroImage;
