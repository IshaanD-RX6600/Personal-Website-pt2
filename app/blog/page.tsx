"use client";
import SimpleDock from "@/components/SimpleDock";
import { blogPosts } from "@/lib/blogPosts";
import { motion } from "framer-motion";
import Link from "next/link";
import { VscHome, VscAccount, VscSettingsGear, VscCode, VscBook } from "react-icons/vsc";

export default function BlogPage() {
  const dockItems = [
    { icon: <VscHome size={18} />, label: 'Home', href: '/' },
    { icon: <VscCode size={18} />, label: 'Projects', href: '/projects' },
    { icon: <VscBook size={18} />, label: 'Blog', href: '/blog' },
    { icon: <VscAccount size={18} />, label: 'About', href: '/about' },
    { icon: <VscSettingsGear size={18} />, label: 'Contact', href: '/contact' },
  ];

  return (
    <div className="min-h-screen relative blueprint-bg">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at top, rgba(0,180,216,0.05), transparent 60%)' }}
      />

      <div className="relative z-10 flex flex-col items-center min-h-screen p-8 pt-20 pb-32">

        {/* Page header */}
        <motion.div
          className="w-full max-w-5xl mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(0,180,216,0.35))' }} />
            <span className="bp-annotation opacity-55">DOC: FIELD_NOTES</span>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(0,180,216,0.35))' }} />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-center text-white tracking-tight">Blog</h1>
        </motion.div>

        <motion.p
          className="max-w-2xl text-center mb-14 text-base"
          style={{ color: 'rgba(180,220,240,0.6)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          Thoughts on english, coding, learning, problem solving, and building cool things.
        </motion.p>

        {/* Blog entries */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-5xl w-full">
          {blogPosts.map((post, idx) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + idx * 0.08 }}
              className="group flex flex-col"
              style={{
                border: '1px solid rgba(0,180,216,0.2)',
                backgroundColor: 'rgba(5,14,28,0.78)',
                backdropFilter: 'blur(12px)',
                position: 'relative',
              }}
            >
              {/* Top accent */}
              <div style={{ height: '1.5px', background: 'rgba(0,180,216,0.4)', flexShrink: 0 }} />

              {/* Post image */}
              {post.image && (
                <div
                  className="relative w-full overflow-hidden"
                  style={{ height: '160px', backgroundColor: 'rgba(3,10,22,0.9)' }}
                >
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-400"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                  {post.videoUrl && (
                    <span
                      className="absolute top-2 right-2 font-mono text-[0.52rem] tracking-widest uppercase px-2 py-1"
                      style={{ border: '1px solid rgba(0,180,216,0.4)', color: '#00b4d8', background: 'rgba(5,14,28,0.85)' }}
                    >
                      VIDEO
                    </span>
                  )}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'rgba(0,180,216,0.2)' }} />
                </div>
              )}

              {/* Card body */}
              <div className="flex flex-col flex-1 p-5">
                {/* Date + entry number row */}
                <div className="flex items-center justify-between mb-3">
                  <time className="bp-annotation opacity-60">
                    {new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </time>
                  <span className="bp-annotation opacity-35">
                    {String(idx + 1).padStart(2, '0')} / {String(blogPosts.length).padStart(2, '0')}
                  </span>
                </div>

                {/* Title — primary element */}
                <h2 className="text-lg font-bold text-white leading-snug mb-2 transition-colors duration-200 group-hover:text-cyan-300">
                  <Link href={`/blog/${post.slug}`} className="focus:outline-none">
                    {post.title}
                  </Link>
                </h2>

                {/* Tags immediately after title */}
                {post.tags && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {post.tags.map((tag) => (
                      <span key={tag} className="bp-tag">{tag}</span>
                    ))}
                  </div>
                )}

                {/* Thin separator */}
                <div style={{ height: '1px', background: 'rgba(0,180,216,0.1)', marginBottom: '12px' }} />

                {/* Excerpt */}
                <p className="text-sm leading-relaxed line-clamp-3 flex-1" style={{ color: 'rgba(180,220,240,0.62)' }}>
                  {post.excerpt}
                </p>

                {/* Read more */}
                <div className="mt-4">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 font-mono text-[0.58rem] tracking-widest uppercase transition-colors duration-200"
                    style={{ color: 'rgba(0,180,216,0.7)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#00d4f5'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(0,180,216,0.7)'; }}
                  >
                    Read article <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>

              {/* Bottom-right corner bracket */}
              <div
                className="absolute bottom-0 right-0 w-4 h-4 pointer-events-none"
                style={{ borderBottom: '1px solid rgba(0,180,216,0.45)', borderRight: '1px solid rgba(0,180,216,0.45)' }}
              />
            </motion.article>
          ))}
        </div>
      </div>

      <SimpleDock items={dockItems} />
    </div>
  );
}
