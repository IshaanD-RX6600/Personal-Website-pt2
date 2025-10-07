"use client";
import Lightning from "@/components/Lightning";
import SimpleDock from "@/components/SimpleDock";
import BlogHeroImage from "@/components/BlogHeroImage";
import { blogPosts } from "@/lib/blogPosts";
import { motion } from "framer-motion";
import Link from "next/link";
import { VscHome, VscArchive, VscAccount, VscSettingsGear, VscCode, VscBook } from "react-icons/vsc";

export default function BlogPage() {
  const dockItems = [
    { icon: <VscHome size={18} />, label: 'Home', href: '/' },
    { icon: <VscCode size={18} />, label: 'Projects', href: '/projects' },
    { icon: <VscBook size={18} />, label: 'Blog', href: '/blog' },
    { icon: <VscAccount size={18} />, label: 'About', href: '/about' },
    { icon: <VscArchive size={18} />, label: 'Resume', href: '/resume' },
    { icon: <VscSettingsGear size={18} />, label: 'Contact', href: '/contact' },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Red lightning background (hue around 0 = red) */}
      <div className="absolute inset-0">
        <Lightning hue={0} xOffset={0} speed={1} intensity={1.1} size={1} />
      </div>
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-40">
        {/* Hero image for the blog section */}
        <div className="w-full mb-8 rounded-xl border border-white/10 bg-black/40 p-2 flex justify-center">
          <BlogHeroImage
            src="/nbe-blogathon-beads.png"
            alt="Beaded keychain"
            className="w-full max-w-xl object-contain block h-auto"
          />
        </div>
        <motion.h1
          className="text-5xl md:text-6xl font-bold text-white mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Blog
        </motion.h1>
        <motion.p
          className="text-gray-300 text-lg mb-12 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Thoughts on english, coding, learning, problem solving, and building cool things.
        </motion.p>
        <div className="grid sm:grid-cols-2 gap-8">
          {blogPosts.map((post, idx) => (
            <motion.article
              key={post.slug}
              className="group relative border border-white/15 bg-white/[0.05] backdrop-blur-sm rounded-2xl flex flex-col overflow-hidden hover:border-white/30 transition"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 + idx * 0.1 }}
            >
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition" style={{ background: 'radial-gradient(circle at 30% 20%, rgba(255,0,0,0.25), transparent 70%)' }} />
              {post.image && (
                <div className="relative h-40 w-full overflow-hidden bg-white/5 flex items-center justify-center">
                  <img src={post.image} alt={post.title} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition" onError={(e)=>{const t=e.currentTarget; t.style.display='none';}} />
                  {post.videoUrl && (
                    <span className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded bg-red-600/80 text-white font-medium backdrop-blur-sm">Video</span>
                  )}
                </div>
              )}
              <div className="p-6 flex flex-col flex-1">
              <time className="text-xs uppercase tracking-wider text-red-300/70 mb-2 font-semibold">
                {new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </time>
              <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-red-300 transition">
                <Link href={`/blog/${post.slug}`} className="focus:outline-none focus:ring-2 focus:ring-red-400 rounded">{post.title}</Link>
              </h2>
              <p className="text-sm text-gray-300 mb-4 leading-relaxed line-clamp-3">{post.excerpt}</p>
              {post.tags && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-[11px] px-2 py-1 rounded-full bg-red-500/15 text-red-300 border border-red-500/30">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-auto pt-2">
                <Link href={`/blog/${post.slug}`} className="text-red-300 text-sm font-medium group-hover:underline inline-flex items-center gap-1">
                  Read more <span aria-hidden>→</span>
                </Link>
              </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
      <SimpleDock items={dockItems} />
    </div>
  );
}
