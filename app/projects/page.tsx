"use client";

import { useEffect } from 'react';
import SimpleDock from "@/components/SimpleDock";
import StarBorder from "@/components/StarBorder";
import { VscHome, VscArchive, VscAccount, VscSettingsGear, VscCode, VscGithub, VscLinkExternal, VscBook } from "react-icons/vsc";
import { motion } from "framer-motion";

export default function ProjectsPage() {
  const handleNavigation = (path: string) => {
    console.log('Navigating to:', path); // Debug log
    try {
      window.location.href = path;
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback navigation
      window.location.assign(path);
    }
  };

  const dockItems = [
    { icon: <VscHome size={18} />, label: 'Home', href: '/' },
    { icon: <VscCode size={18} />, label: 'Projects', href: '/projects' },
    { icon: <VscBook size={18} />, label: 'Blog', href: '/blog' },
    { icon: <VscAccount size={18} />, label: 'About', href: '/about' },
    { icon: <VscSettingsGear size={18} />, label: 'Contact', href: '/contact' },
  ];

  // Allow scrolling for projects page
  useEffect(() => {
    // Force remove no-scroll class and enable scrolling
    document.body.classList.remove('no-scroll');
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    
    return () => {
      // Clean up on unmount - don't restore no-scroll
    };
  }, []);

  const projects = [
    {
      title: "TidalTasks",
      description: "An AI-powered task management application that helps users organize and prioritize their work efficiently.",
      liveUrl: "https://tasktide-ai.vercel.app/",
      githubUrl: "https://github.com/DhairyaS450/track-ai-web",
      image: "/Screenshot 2025-07-28 233413.png"
    },
    {
      title: "Waypoint",
      description: "AI-powered case memory platform for social workers with voice ingestion, crisis-aware dashboards, and thread-scoped RAG for secure case management.",
      liveUrl: "https://www.youtube.com/watch?v=hxuZ9ZgZLvk",
      githubUrl: "https://github.com/IshaanD-RX6600/Waypoint",
      image: "/Screenshot 2026-03-17 152816.png"
    },
    {
      title: "FormFlux",
      description: "Your personal AI fitness coach with workout tracking, progress monitoring, and personalized fitness guidance.",
      liveUrl: "https://formfluxwork.vercel.app/",
      githubUrl: "https://github.com/DhairyaS450/formflux",
      image: "/formflux-new-screenshot.png"
    },
    {
      title: "CHCI Coding Club",
      description: "Club website for the CHCI Coding Club, featuring club information, events, and member resources.",
      liveUrl: "https://chci-coding-club.vercel.app/",
      githubUrl: "https://github.com/IshaanD-RX6600/Coding-Club-Website",
      image: "/CHCI-CoodingClubphoto.png"
    },
    {
      title: "Move Master",
      description: "Movement tracking app that monitors and analyzes user movement patterns for fitness and health insights.",
      liveUrl: "https://www.youtube.com/watch?v=S022Pv9t8z4",
      githubUrl: "https://github.com/IshaanD-RX6600/Move-Master",
      image: "/Move-Master.png"
    },
    {
      title: "Shurplus",
      description: "A dual-engine platform for food rescue connecting distributors, volunteers, and food banks with AI-powered inventory management and smart routing.",
      liveUrl: "https://shurplus.vercel.app/",
      githubUrl: "https://github.com/SaiAmartya/sharingsurplus",
      image: "/Screenshot 2026-03-17 152604.png"
    }
  ];

  return (
    <div className="min-h-screen relative bg-black">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.12),transparent_50%)] pointer-events-none z-0" />
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center min-h-screen p-8 pt-20 pb-32">
        <motion.h1
          className="text-5xl md:text-7xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">Projects</span>
        </motion.h1>
        
        {/* Project Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {projects.map((project, index) => {
            const colors = ['#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#7c3aed'];
            const speeds = ['4s', '5s', '6s', '7s', '5.5s', '4.5s'];
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + (index * 0.1) }}
                className="h-full"
              >
                <StarBorder
                  color={colors[index % colors.length]}
                  speed={speeds[index % speeds.length]}
                  className="w-full h-full"
                >
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/40 hover:bg-white/[0.06] transition-all duration-300 cursor-pointer group flex flex-col h-full">
                  {/* Project Image */}
                  <div className="w-full h-48 bg-gray-800/50 flex items-center justify-center overflow-hidden">
                    {project.image === "coming-soon" ? (
                      <div className="text-white/80 text-lg font-semibold">Coming Soon</div>
                    ) : (
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="text-white/60 text-sm">Preview Image</div>`;
                          }
                        }}
                      />
                    )}
                  </div>
                  {/* Project Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">{project.title}</h3>
                    <p className="text-zinc-300 mb-4 text-sm group-hover:text-zinc-200 transition-colors duration-300 flex-1">{project.description}</p>
                    <div className="flex gap-3">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-xl hover:bg-purple-500/30 hover:text-white transition-all duration-300 text-sm"
                        >
                          <VscLinkExternal size={14} />
                          {project.liveUrl.includes('youtube.com') ? 'Demo Video' : 'Website Link'}
                        </a>
                      )}
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-white/[0.04] border border-white/10 text-zinc-300 rounded-xl hover:border-white/20 hover:text-white transition-all duration-300 text-sm"
                      >
                        <VscGithub size={14} />
                        GitHub
                      </a>
                    </div>
                  </div>
                </div>
              </StarBorder>
              </motion.div>
            );
          })}
        </motion.div>
        
        {/* See More on GitHub Button */}
        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <a
            href="https://github.com/IshaanD-RX6600"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-8 py-4 bg-white/[0.03] backdrop-blur-xl border border-white/10 text-white rounded-2xl hover:border-purple-500/40 hover:bg-white/[0.06] transition-all duration-300 text-lg font-semibold"
          >
            <VscGithub size={20} />
            See More on GitHub
          </a>
        </motion.div>
      </div>

      {/* Dock Navigation */}
      <SimpleDock items={dockItems} />
    </div>
  );
}
