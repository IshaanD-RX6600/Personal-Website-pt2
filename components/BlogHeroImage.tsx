"use client";
import React from 'react';

interface BlogHeroImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectFallbackHeight?: number; // optional fixed height if image fails
  sizes?: string; // responsive sizes attribute
  priority?: boolean; // if true load eagerly
  aspectRatio?: string; // e.g. '3/4', '4/3'
}

/**
 * Client-only wrapper for blog hero images so we can safely handle load / error events
 * without passing event handlers from a Server Component (which breaks prerender exports).
 */
export function BlogHeroImage({ src, alt, className = '', aspectFallbackHeight = 220, sizes = '(max-width: 640px) 100vw, 640px', priority = false, aspectRatio }: BlogHeroImageProps) {
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

  const style: React.CSSProperties = {};
  if (aspectRatio) style.aspectRatio = aspectRatio;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      sizes={sizes}
      style={style}
      fetchPriority={priority ? 'high' as any : undefined}
    />
  );
}

export default BlogHeroImage;
