"use client";

import { useEffect } from 'react';
import Lightning from "@/components/Lightning";
import SimpleDock from "@/components/SimpleDock";
import { VscHome, VscArchive, VscAccount, VscSettingsGear, VscCode, VscGithub, VscLinkExternal } from "react-icons/vsc";

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
    { icon: <VscHome size={18} />, label: 'Home', onClick: () => handleNavigation('/') },
    { icon: <VscCode size={18} />, label: 'Projects', onClick: () => handleNavigation('/projects') },
    { icon: <VscAccount size={18} />, label: 'About', onClick: () => alert('About!') },
    { icon: <VscArchive size={18} />, label: 'Resume', onClick: () => alert('Resume!') },
    { icon: <VscSettingsGear size={18} />, label: 'Contact', onClick: () => alert('Contact!') },
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
      image: "/Screenshot 2025-07-28 233435.png"
    },
    {
      title: "Personal Portfolio",
      description: "My personal portfolio website showcasing my projects, skills, and experience in web development.",
      liveUrl: "https://ishaan-dhiman.vercel.app/",
      githubUrl: "https://github.com/IshaanD-RX6600/IshaanDhiman",
      image: "/Screenshot 2025-07-28 233435.png"
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
      title: "Pantry Tracker",
      description: "Hackathon project showcasing innovative solutions and collaborative development during the HawkHacks event.",
      liveUrl: null,
      githubUrl: "https://github.com/RohanZ2/HawkHacks",
      image: "coming-soon"
    }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Purple Lightning Background */}
      <div className="absolute inset-0">
        <Lightning
          hue={280}
          xOffset={0}
          speed={1}
          intensity={1}
          size={1}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center min-h-screen p-8 pt-20 pb-32">
        <h1 className="text-5xl md:text-7xl font-bold text-white text-center mb-12">
          Projects
        </h1>
        
        {/* Project Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
          {projects.map((project, index) => (
            <div key={index} className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden hover:bg-black/40 transition-all duration-300">
              {/* Project Image */}
              <div className="w-full h-48 bg-gray-800/50 flex items-center justify-center">
                {project.image === "coming-soon" ? (
                  <div className="text-white/80 text-lg font-semibold">Coming Soon</div>
                ) : (
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
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
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-3">{project.title}</h3>
                <p className="text-gray-300 mb-4 text-sm">{project.description}</p>
                <div className="flex gap-3">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600/80 text-white rounded-md hover:bg-blue-700/80 transition-colors text-sm"
                    >
                      <VscLinkExternal size={14} />
                      {project.liveUrl.includes('youtube.com') ? 'Demo Video' : 'Website Link'}
                    </a>
                  )}
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-gray-600/80 text-white rounded-md hover:bg-gray-700/80 transition-colors text-sm"
                  >
                    <VscGithub size={14} />
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dock Navigation */}
      <SimpleDock items={dockItems} />
    </div>
  );
}
