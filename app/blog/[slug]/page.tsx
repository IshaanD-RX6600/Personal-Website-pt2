import Lightning from '@/components/Lightning';
import BlogNavigationDock from '@/components/BlogNavigationDock';
import { blogPosts } from '@/lib/blogPosts';
import { notFound } from 'next/navigation';
import { VscHome, VscArchive, VscAccount, VscSettingsGear, VscCode, VscBook } from 'react-icons/vsc';
import { Metadata } from 'next';
import { motion } from 'framer-motion';</parameter,

interface PageProps { params: { slug: string } }

export function generateStaticParams() {
  return blogPosts.map(p => ({ slug: p.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const post = blogPosts.find(p => p.slug === params.slug);
  if (!post) return { title: 'Post Not Found' };
  const title = post.title + ' | Blog';
  return {
    title,
    description: post.excerpt,
    openGraph: {
      title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      type: 'article'
    },
    twitter: {
      card: 'summary',
      title,
      description: post.excerpt
    }
  };
}

export default function BlogSlugPage({ params }: PageProps) {
  const post = blogPosts.find(p => p.slug === params.slug);
  if (!post) return notFound();</parameter,
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
      <div className="absolute inset-0"><Lightning hue={0} xOffset={0} speed={1} intensity={1.05} size={1} /></div>
      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-24 pb-40">
        <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.8}} className="mb-10">
          <p className="text-xs uppercase tracking-wider text-red-300/70 font-semibold mb-3">
            {new Date(post.date).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'})}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{post.title}</h1>
          <p className="text-gray-300 text-base leading-relaxed max-w-2xl">{post.excerpt}</p>
          {post.tags && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map(tag => (
                <span key={tag} className="text-[11px] px-2 py-1 rounded-full bg-red-500/15 text-red-300 border border-red-500/30">{tag}</span>
              ))}
            </div>
          )}
        </motion.div>
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:0.15}} className="prose prose-invert max-w-none text-sm leading-relaxed">
          <p>This is placeholder body content for <strong>{post.title}</strong>. Add your full article here. You can migrate to MDX later for headings, code blocks, images, and more.</p>
          <p>Ideas to enhance this page: table of contents, reading time, previous/next navigation, share buttons, and syntax highlighting.</p>
        </motion.div>
      </div>
      <SimpleDock items={dockItems} />
    </div>
  );
}
