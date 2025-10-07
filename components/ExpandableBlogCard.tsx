"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlogPostMeta } from '@/lib/blogPosts';

interface ExpandableBlogCardProps {
  post: BlogPostMeta;
  content?: string; // optional full content
}

export default function ExpandableBlogCard({ post, content }: ExpandableBlogCardProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o=>!o)}
        className="w-full text-left group border border-white/15 bg-white/[0.05] hover:border-white/30 transition rounded-xl p-5 backdrop-blur-sm"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-white/60 mb-1 font-medium">
              {new Date(post.date).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}
            </div>
            <h3 className="text-lg font-semibold text-white group-hover:text-white/90">
              {post.title}
            </h3>
            <p className="text-sm text-gray-300 mt-2 line-clamp-2 group-hover:line-clamp-none">
              {post.excerpt}
            </p>
          </div>
          <span className="text-xs text-white/60 px-2 py-1 rounded-md bg-white/10 self-start">
            {open ? 'Close' : 'Open'}
          </span>
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="mt-4 relative z-20 border border-white/15 rounded-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-xl" />
            <div className="relative p-6 space-y-4 text-sm leading-relaxed text-gray-200">
              <h4 className="text-white font-semibold text-base">{post.title}</h4>
              <div>
                {content || 'Full blog content placeholder. Add the actual blog text here.'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
