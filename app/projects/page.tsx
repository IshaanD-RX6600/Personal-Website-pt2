"use client";

import { useEffect, useState, useRef } from 'react';
import SimpleDock from "@/components/SimpleDock";
import { VscHome, VscAccount, VscSettingsGear, VscCode, VscGithub, VscLinkExternal, VscBook } from "react-icons/vsc";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";

type Project = {
  title: string;
  stack: string;
  description: string;
  status: string;
  liveUrl: string;
  githubUrl: string;
  image: string;
};

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [4, -4]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-4, 4]), { stiffness: 300, damping: 30 });

  const glowLeft = useTransform(mouseX, [0, 1], ['10%', '90%']);
  const glowTop = useTransform(mouseY, [0, 1], ['10%', '90%']);
  const glowBg = useMotionTemplate`radial-gradient(circle 180px at ${glowLeft} ${glowTop}, rgba(0,180,216,0.09), transparent 70%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
    setHovered(false);
  };

  const stackChips = project.stack.split(' · ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.07 }}
      style={{ perspective: '900px' }}
    >
      <motion.div
        ref={cardRef}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' as const }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="flex flex-col h-full"
      >
        <div
          style={{
            border: `1px solid ${hovered ? 'rgba(0,180,216,0.55)' : 'rgba(0,180,216,0.22)'}`,
            backgroundColor: 'rgba(5,14,28,0.8)',
            backdropFilter: 'blur(12px)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            transition: 'border-color 0.3s',
          }}
        >
          {/* Mouse-tracking spotlight */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: glowBg,
              zIndex: 0,
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.4s',
            }}
          />

          {/* Top accent line */}
          <div style={{
            height: '2px',
            background: hovered ? 'rgba(0,212,245,0.8)' : 'rgba(0,180,216,0.5)',
            flexShrink: 0,
            transition: 'background 0.3s',
            position: 'relative',
            zIndex: 1,
          }} />

          {/* Header row */}
          <div
            className="flex items-center justify-between px-3 py-1.5 relative"
            style={{ borderBottom: '1px solid rgba(0,180,216,0.15)', zIndex: 1 }}
          >
            <span className="bp-annotation opacity-45">
              SPEC-{String(index + 1).padStart(2, '0')}
            </span>
            <span
              className="font-mono text-[0.5rem] tracking-widest uppercase px-1.5 py-0.5"
              style={{
                border: `1px solid ${hovered ? 'rgba(0,180,216,0.6)' : 'rgba(0,180,216,0.32)'}`,
                color: project.status === 'DEPLOYED' ? '#00d4f5' : 'rgba(0,180,216,0.6)',
                transition: 'border-color 0.3s',
              }}
            >
              {project.status}
            </span>
          </div>

          {/* Image */}
          <div
            className="w-full h-44 overflow-hidden relative"
            style={{ backgroundColor: 'rgba(3,10,22,0.95)', flexShrink: 0, zIndex: 1 }}
          >
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover"
              style={{
                opacity: hovered ? 1 : 0.7,
                transform: hovered ? 'scale(1.06)' : 'scale(1)',
                transition: 'opacity 0.4s, transform 0.5s',
              }}
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.style.display = 'none';
                const parent = t.parentElement;
                if (parent) {
                  parent.innerHTML = `<div class="bp-annotation opacity-40 w-full h-full flex items-center justify-center">PREVIEW UNAVAILABLE</div>`;
                }
              }}
            />
            {/* Hover overlay on image */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background: 'rgba(5,14,28,0.58)',
                opacity: hovered ? 1 : 0,
                transition: 'opacity 0.3s',
              }}
            >
              <span
                className="font-mono text-[0.52rem] tracking-widest uppercase"
                style={{
                  color: 'rgba(0,212,245,0.9)',
                  border: '1px solid rgba(0,212,245,0.4)',
                  padding: '4px 12px',
                  letterSpacing: '0.18em',
                }}
              >
                INSPECT SCHEMATIC
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col flex-1 p-5 relative" style={{ zIndex: 1 }}>
            <div className="mb-3">
              <h3 className="text-white font-bold text-lg leading-tight">{project.title}</h3>
              <div className="flex flex-wrap gap-1 mt-2">
                {stackChips.map((chip, i) => (
                  <span key={i} className="bp-tag" style={{ fontSize: '0.46rem' }}>{chip}</span>
                ))}
              </div>
            </div>

            <div style={{ height: '1px', background: 'rgba(0,180,216,0.12)', marginBottom: '12px' }} />

            <p className="text-sm leading-relaxed flex-1" style={{ color: 'rgba(180,220,240,0.65)' }}>
              {project.description}
            </p>

            <div className="flex gap-2.5 mt-5">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bp-btn flex items-center gap-1.5 px-3 py-1.5 text-[0.58rem]"
                >
                  <VscLinkExternal size={11} />
                  {project.liveUrl.includes('youtube.com') ? 'Demo' : 'Live'}
                </a>
              )}
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bp-btn flex items-center gap-1.5 px-3 py-1.5 text-[0.58rem]"
                style={{ borderColor: 'rgba(0,180,216,0.28)', color: 'rgba(0,180,216,0.65)' }}
              >
                <VscGithub size={11} />
                Source
              </a>
            </div>
          </div>

          {/* Animated corner brackets — all four corners */}
          <div className="absolute top-0 left-0 pointer-events-none" style={{ width: hovered ? '22px' : '13px', height: hovered ? '22px' : '13px', borderTop: '1.5px solid rgba(0,212,245,0.65)', borderLeft: '1.5px solid rgba(0,212,245,0.65)', transition: 'width 0.25s ease, height 0.25s ease' }} />
          <div className="absolute top-0 right-0 pointer-events-none" style={{ width: hovered ? '22px' : '13px', height: hovered ? '22px' : '13px', borderTop: '1.5px solid rgba(0,180,216,0.4)', borderRight: '1.5px solid rgba(0,180,216,0.4)', transition: 'width 0.25s ease, height 0.25s ease' }} />
          <div className="absolute bottom-0 left-0 pointer-events-none" style={{ width: hovered ? '22px' : '13px', height: hovered ? '22px' : '13px', borderBottom: '1.5px solid rgba(0,180,216,0.4)', borderLeft: '1.5px solid rgba(0,180,216,0.4)', transition: 'width 0.25s ease, height 0.25s ease' }} />
          <div className="absolute bottom-0 right-0 pointer-events-none" style={{ width: hovered ? '22px' : '13px', height: hovered ? '22px' : '13px', borderBottom: '1.5px solid rgba(0,212,245,0.65)', borderRight: '1.5px solid rgba(0,212,245,0.65)', transition: 'width 0.25s ease, height 0.25s ease' }} />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ProjectsPage() {
  const dockItems = [
    { icon: <VscHome size={18} />, label: 'Home', href: '/' },
    { icon: <VscCode size={18} />, label: 'Projects', href: '/projects' },
    { icon: <VscBook size={18} />, label: 'Blog', href: '/blog' },
    { icon: <VscAccount size={18} />, label: 'About', href: '/about' },
    { icon: <VscSettingsGear size={18} />, label: 'Contact', href: '/contact' },
  ];

  useEffect(() => {
    document.body.classList.remove('no-scroll');
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
  }, []);

  const projects: Project[] = [
    {
      title: "TidalTasks",
      stack: "Next.js · Firebase · OpenAI",
      description: "An AI-powered task management application that helps users organize and prioritize their work efficiently.",
      status: "DEPLOYED",
      liveUrl: "https://tasktide-ai.vercel.app/",
      githubUrl: "https://github.com/DhairyaS450/track-ai-web",
      image: "/Screenshot 2025-07-28 233413.png",
    },
    {
      title: "Waypoint",
      stack: "Next.js · Supabase · RAG",
      description: "AI-powered case memory platform for social workers with voice ingestion, crisis-aware dashboards, and thread-scoped RAG for secure case management.",
      status: "DEMO",
      liveUrl: "https://www.youtube.com/watch?v=hxuZ9ZgZLvk",
      githubUrl: "https://github.com/IshaanD-RX6600/Waypoint",
      image: "/Screenshot 2026-03-17 152816.png",
    },
    {
      title: "FormFlux",
      stack: "React · Node.js · ML",
      description: "Your personal AI fitness coach with workout tracking, progress monitoring, and personalized fitness guidance.",
      status: "DEPLOYED",
      liveUrl: "https://formfluxwork.vercel.app/",
      githubUrl: "https://github.com/DhairyaS450/formflux",
      image: "/formflux-new-screenshot.png",
    },
    {
      title: "CHCI Coding Club",
      stack: "Next.js · TailwindCSS",
      description: "Club website for the CHCI Coding Club, featuring club information, events, and member resources.",
      status: "DEPLOYED",
      liveUrl: "https://chci-coding-club.vercel.app/",
      githubUrl: "https://github.com/IshaanD-RX6600/Coding-Club-Website",
      image: "/CHCI-CoodingClubphoto.png",
    },
    {
      title: "Move Master",
      stack: "Python · OpenCV · React",
      description: "Movement tracking app that monitors and analyzes user movement patterns for fitness and health insights.",
      status: "DEMO",
      liveUrl: "https://www.youtube.com/watch?v=S022Pv9t8z4",
      githubUrl: "https://github.com/IshaanD-RX6600/Move-Master",
      image: "/Move-Master.png",
    },
    {
      title: "Shurplus",
      stack: "Next.js · Supabase · AI",
      description: "A dual-engine platform for food rescue connecting distributors, volunteers, and food banks with AI-powered inventory management and smart routing.",
      status: "DEPLOYED",
      liveUrl: "https://shurplus.vercel.app/",
      githubUrl: "https://github.com/SaiAmartya/sharingsurplus",
      image: "/Screenshot 2026-03-17 152604.png",
    },
    {
      title: "Ledger",
      stack: "TypeScript · Next.js",
      description: "A clean financial tracking application for logging expenses, managing budgets, and visualizing spending patterns over time.",
      status: "ACTIVE",
      liveUrl: "",
      githubUrl: "https://github.com/IshaanD-RX6600/Ledger",
      image: "/Screenshot 2026-06-08 150729.png",
    },
    {
      title: "Face Swap",
      stack: "Python · dlib · OpenCV",
      description: "Replace any face in a video using a single reference image — no dataset, no training required. Facial landmark detection handles alignment and blending automatically.",
      status: "COMPLETE",
      liveUrl: "",
      githubUrl: "https://github.com/IshaanD-RX6600/Face-Swap",
      image: "/Screenshot 2026-06-08 150712.png",
    },
    {
      title: "Pac-Man",
      stack: "Java · Swing",
      description: "A fully playable recreation of the classic Pac-Man arcade game, built from scratch in Java with custom ghost AI, collision detection, and scoring.",
      status: "COMPLETE",
      liveUrl: "",
      githubUrl: "https://github.com/IshaanD-RX6600/Pac-Man-java",
      image: "/Screenshot 2026-06-08 150650.png",
    },
    {
      title: "Serenity Valley",
      stack: "Python · Pygame",
      description: "A 2D adventure game built with Pygame featuring custom sprite animation, collision physics, level progression, and an original art style.",
      status: "COMPLETE",
      liveUrl: "",
      githubUrl: "https://github.com/IshaanD-RX6600/Serenity-Valley-game",
      image: "/Screenshot 2026-06-08 150748.png",
    },
    {
      title: "Handwritten to Text",
      stack: "Python · TensorFlow · OpenCV",
      description: "Machine learning pipeline that converts handwritten notes into digital text using a custom-trained CNN for character segmentation and recognition.",
      status: "ML",
      liveUrl: "",
      githubUrl: "https://github.com/IshaanD-RX6600/Handwritten-to-text",
      image: "/Screenshot 2026-06-08 150856.png",
    },
    {
      title: "Student Help Website",
      stack: "HTML · CSS · JavaScript",
      description: "Collaborative resource hub built with a team of five students — aggregating study tools, peer tutoring links, and school-specific academic guides.",
      status: "COMPLETE",
      liveUrl: "",
      githubUrl: "https://github.com/IshaanD-RX6600/Student-Help-Website",
      image: "/Screenshot 2026-06-08 150913.png",
    },
    {
      title: "STEAM IC Website",
      stack: "HTML · CSS · JavaScript",
      description: "School club website for the STEAM program at CHCI — events calendar, member profiles, and a resource hub for current and prospective STEAM students.",
      status: "DEPLOYED",
      liveUrl: "",
      githubUrl: "https://github.com/IshaanD-RX6600/STEAM-IC-WEBSITE",
      image: "/steam-ic-preview.png",
    },
  ];

  return (
    <div className="min-h-screen relative blueprint-bg">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at top, rgba(0,180,216,0.05), transparent 60%)' }}
      />

      <div className="relative z-10 flex flex-col items-center min-h-screen p-4 sm:p-8 pt-16 sm:pt-20 pb-32">

        {/* Page header */}
        <motion.div
          className="w-full max-w-6xl mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(0,180,216,0.35))' }} />
            <span className="bp-annotation opacity-55">DOC: PROJECT_CATALOGUE</span>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(0,180,216,0.35))' }} />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-center text-white tracking-tight">Projects</h1>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="w-16 bp-dim-line" />
            <span className="bp-annotation opacity-45">{projects.length} ENTRIES</span>
            <div className="w-16 bp-dim-line" />
          </div>
        </motion.div>

        {/* Project grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full mb-14">
          {projects.map((project, index) => (
            <ProjectCard key={index} project={project} index={index} />
          ))}
        </div>

        {/* GitHub link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
        >
          <a
            href="https://github.com/IshaanD-RX6600"
            target="_blank"
            rel="noopener noreferrer"
            className="bp-btn py-3 px-8 text-sm flex items-center gap-3"
          >
            <VscGithub size={16} />
            View Full Repository
          </a>
        </motion.div>
      </div>

      <SimpleDock items={dockItems} />
    </div>
  );
}
