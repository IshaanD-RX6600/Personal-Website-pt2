"use client";
import Lightning from '@/components/Lightning';
import SimpleDock from '@/components/SimpleDock';
import ExpandableBlogCard from '@/components/ExpandableBlogCard';
import { blogPosts } from '@/lib/blogPosts';
import { motion } from 'framer-motion';
import { VscHome, VscArchive, VscAccount, VscSettingsGear, VscCode, VscBook } from 'react-icons/vsc';

export default function BlogSinglePage() {
  const post = blogPosts[0];
  const handleNavigation = (path: string) => { try { window.location.href = path; } catch { window.location.assign(path); } };
  const dockItems = [
    { icon: <VscHome size={18} />, label: 'Home', onClick: () => handleNavigation('/') },
    { icon: <VscCode size={18} />, label: 'Projects', onClick: () => handleNavigation('/projects') },
    { icon: <VscBook size={18} />, label: 'Blog', onClick: () => handleNavigation('/blog') },
    { icon: <VscAccount size={18} />, label: 'About', onClick: () => handleNavigation('/about') },
    { icon: <VscArchive size={18} />, label: 'Resume', onClick: () => alert('Resume!') },
    { icon: <VscSettingsGear size={18} />, label: 'Contact', onClick: () => alert('Contact!') },
  ];
  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0"><Lightning hue={0} xOffset={0} speed={1} intensity={1} size={1} /></div>
      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-24 pb-40">
        <motion.h1 className="text-4xl md:text-5xl font-bold text-white mb-10" initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.8}}>
          Blog
        </motion.h1>
        {post && (
          <ExpandableBlogCard
            post={post}
            content={`This is the full content for ${post.title}. You can replace this with your real write-up: introduction, sections, bullet points, conclusion, etc.`}
          />
        )}
      </div>
      <SimpleDock items={dockItems} />
    </div>
  );
}
