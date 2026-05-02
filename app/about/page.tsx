"use client";

import { motion } from "framer-motion";
import SimpleDock from "@/components/SimpleDock";
import TextType from "@/components/TextType";
import { VscHome, VscCode, VscBook, VscAccount, VscSettingsGear, VscGithub } from "react-icons/vsc";
import { FaLinkedin } from "react-icons/fa";
import React from "react";

// ---------- Inline sub-components ----------

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-12">
      <span className="inline-flex items-center px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-mono uppercase tracking-widest whitespace-nowrap">
        {children}
      </span>
      <div className="h-px flex-1 bg-gradient-to-r from-purple-500/50 to-transparent" />
    </div>
  );
}

function GlassCard({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-2xl transition-all duration-300 hover:border-purple-500/40 hover:bg-white/[0.06] ${className ?? ""}`}
      {...props}
    >
      {children}
    </div>
  );
}

// ---------- Page ----------

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 as const },
};

export default function AboutPage() {
  const dockItems = [
    { icon: <VscHome size={18} />, label: "Home", href: "/" },
    { icon: <VscCode size={18} />, label: "Projects", href: "/projects" },
    { icon: <VscBook size={18} />, label: "Blog", href: "/blog" },
    { icon: <VscAccount size={18} />, label: "About", href: "/about" },
    { icon: <VscSettingsGear size={18} />, label: "Contact", href: "/contact" },
  ];

  const skills = [
    "Python", "TypeScript", "JavaScript", "Java", "C++", "HTML", "CSS",
    "React", "Next.js", "Node.js", "TailwindCSS", "Firebase", "MongoDB",
    "Supabase", "Vercel", "Google Cloud", "TensorFlow", "PyTorch", "Git", "GitHub",
  ];

  const stats = [
    { value: "300+", label: "Volunteer Hours" },
    { value: "8+", label: "Hackathons" },
    { value: "20+", label: "Technologies" },
    { value: "Top 3", label: "CCC Junior 2025" },
  ];

  const experiences = [
    {
      role: "Full-stack Developer & Co-Founder",
      company: "TidalTasks AI",
      date: "Mar 2025 – Present",
      desc: "Tech startup with 50+ beta testers. Building an innovative productivity app with smart reminders and task management.",
      color: "text-purple-400",
    },
    {
      role: "Software Engineer Intern",
      company: "NexGenHealth",
      date: "Jul – Sep 2025",
      desc: "Built their website from start to finish, handling user data for healthcare solutions.",
      color: "text-blue-400",
    },
    {
      role: "Academic Writer Intern",
      company: "TMAS Academy",
      date: "Jul – Sep 2025",
      desc: "Creating educational content and academic materials.",
      color: "text-green-400",
    },
    {
      role: "Certified National Lifeguard & Swim Instructor",
      company: "City of Kitchener",
      date: "Ongoing",
      desc: "Taught free swimming lessons to kids as part of instructor certification.",
      color: "text-cyan-400",
    },
  ];

  const hackathons = [
    {
      name: "Hack Canada 2026",
      result: "Top 8 Finalist",
      badge: "Top 8 Finalist",
      badgeColor: "text-yellow-300",
      badgeBg: "bg-yellow-500/10 border-yellow-500/30",
      gradient: "from-yellow-500/10 to-orange-500/10",
      featured: true,
    },
    {
      name: "NeoDev Developer League",
      result: "Top 3 — Cash Prize Winner",
      badge: "Cash Prize Winner",
      badgeColor: "text-green-300",
      badgeBg: "bg-green-500/10 border-green-500/30",
      gradient: "from-green-500/10 to-emerald-500/10",
      featured: true,
    },
    {
      name: "Hack the North",
      result: "Canada's Largest Hackathon",
      badge: "Participant",
      badgeColor: "text-zinc-300",
      badgeBg: "bg-white/5 border-white/10",
      gradient: "from-blue-500/5 to-indigo-500/5",
      featured: false,
    },
    {
      name: "SpurHacks",
      result: "Participant & Builder",
      badge: "Builder",
      badgeColor: "text-zinc-300",
      badgeBg: "bg-white/5 border-white/10",
      gradient: "from-violet-500/5 to-purple-500/5",
      featured: false,
    },
    {
      name: "Ignition Hacks",
      result: "Participant & Builder",
      badge: "Builder",
      badgeColor: "text-zinc-300",
      badgeBg: "bg-white/5 border-white/10",
      gradient: "from-fuchsia-500/5 to-pink-500/5",
      featured: false,
    },
    {
      name: "HawkHacks",
      result: "Participant & Builder",
      badge: "Builder",
      badgeColor: "text-zinc-300",
      badgeBg: "bg-white/5 border-white/10",
      gradient: "from-sky-500/5 to-blue-500/5",
      featured: false,
    },
  ];

  const volunteerItems = [
    { icon: "💻", title: "Coding Club EXEC & Website Manager", detail: "Cameron Heights CI", color: "text-violet-400" },
    { icon: "🔬", title: "STEM Club Volunteer", detail: "90+ hrs", color: "text-blue-400" },
    { icon: "⚡", title: "Hack the North Volunteer", detail: "19+ hrs", color: "text-indigo-400" },
    { icon: "🧘", title: "Yoga Camp Volunteer", detail: "40+ hrs", color: "text-purple-400" },
    { icon: "⚽", title: "Soccer Coach Volunteer", detail: "30+ hrs", color: "text-sky-400" },
    { icon: "🚲", title: "BikeCheck Volunteer", detail: "City of Kitchener", color: "text-cyan-400" },
    { icon: "🤝", title: "Safe & Caring Committee", detail: "2021 – 2023", color: "text-fuchsia-400" },
    { icon: "🌏", title: "South Asian Student Alliance", detail: "Cameron Heights CI", color: "text-slate-400" },
  ];

  const achievements = [
    {
      title: "Top 3 in 2025 CCC Junior",
      sub: "Canadian Computing Competition",
      gradient: "from-violet-500/10 to-purple-500/10",
      border: "border-violet-500/20",
      accent: "text-violet-400",
    },
    {
      title: "Canada Youth Changemakers Summit",
      sub: "Participant & Presenter",
      gradient: "from-blue-500/10 to-indigo-500/10",
      border: "border-blue-500/20",
      accent: "text-blue-400",
    },
    {
      title: "Solo Website Builder",
      sub: "Built Student Activity Council website & personal portfolio",
      gradient: "from-purple-500/10 to-fuchsia-500/10",
      border: "border-purple-500/20",
      accent: "text-purple-400",
    },
    {
      title: "Built Custom PC",
      sub: "Hardware assembly & configuration",
      gradient: "from-indigo-500/10 to-blue-500/10",
      border: "border-indigo-500/20",
      accent: "text-indigo-400",
    },
    {
      title: "Smart Home Automation",
      sub: "Automated entire household with Amazon Alexa",
      gradient: "from-cyan-500/10 to-blue-500/10",
      border: "border-cyan-500/20",
      accent: "text-cyan-400",
    },
    {
      title: "Master in Full-Stack Development",
      sub: "Self-taught expertise",
      gradient: "from-sky-500/10 to-indigo-500/10",
      border: "border-sky-500/20",
      accent: "text-sky-400",
    },
  ];

  const clubs = [
    { name: "Chess Club", color: "from-indigo-500 to-blue-500" },
    { name: "Badminton", color: "from-blue-500 to-cyan-500" },
    { name: "House League Soccer", color: "from-violet-500 to-indigo-500" },
    { name: "STEM Club", color: "from-purple-500 to-violet-500" },
    { name: "Coding Club", color: "from-fuchsia-500 to-purple-500" },
    { name: "South Asian Student Alliance", color: "from-sky-500 to-blue-500" },
  ];

  return (
    <div className="min-h-screen relative bg-black overflow-x-hidden">
      {/* Fixed radial background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.12),transparent_50%)] pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 pb-32">

        {/* ===== SECTION 1: HERO ===== */}
        <motion.section
          {...fadeUp}
          transition={{ duration: 0.8 }}
        >
          <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-center min-h-[85vh]">
            {/* Left column */}
            <div className="flex flex-col justify-center">
              {/* Badge */}
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-300 text-xs font-mono w-fit mb-8">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Available for opportunities
              </span>

              {/* Name */}
              <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none mb-4">
                <span className="text-white">Ishaan </span>
                <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
                  Dhiman
                </span>
              </h1>

              {/* Animated role switcher */}
              <div className="text-2xl md:text-3xl font-semibold text-zinc-300 mb-6 h-10 flex items-center">
                <TextType
                  text={["AI Builder", "Full-Stack Developer", "Hackathon Enthusiast"]}
                  typingSpeed={60}
                  deletingSpeed={35}
                  pauseDuration={2200}
                  loop
                  className="text-2xl md:text-3xl font-semibold text-zinc-300"
                  showCursor
                  cursorCharacter="|"
                />
              </div>

              {/* Bio */}
              <p className="text-zinc-400 leading-relaxed text-lg max-w-xl mt-6">
                I'm a high school developer passionate about building AI tools, full-stack
                applications, and experimental projects. I enjoy exploring LLMs, machine learning,
                and real-world software problems. Currently a Grade 11 IB student at Cameron Heights
                Collegiate Institute in Kitchener, Ontario.
              </p>

              {/* Social links */}
              <div className="flex flex-wrap gap-3 mt-8">
                <a
                  href="https://github.com/IshaanD-RX6600"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 text-sm hover:border-purple-500/50 hover:text-white hover:bg-white/[0.08] transition-all duration-200"
                >
                  <VscGithub size={18} /> GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/ishaan-d-835a872a4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm hover:border-blue-400/60 hover:text-white hover:bg-blue-500/20 transition-all duration-200"
                >
                  <FaLinkedin size={18} /> LinkedIn
                </a>
              </div>
            </div>

            {/* Right column — avatar */}
            <div className="relative flex items-center justify-center">
              {/* Outer orbit ring 1 */}
              <motion.div
                className="absolute w-80 h-80 rounded-full border border-dashed border-purple-500/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              {/* Outer orbit ring 2 */}
              <motion.div
                className="absolute w-72 h-72 rounded-full border border-dashed border-indigo-500/20"
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              />
              {/* Avatar circle */}
              <div className="w-64 h-64 rounded-full border border-purple-500/20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                <span className="text-7xl font-black bg-gradient-to-br from-purple-400 to-blue-400 bg-clip-text text-transparent select-none">
                  ID
                </span>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-12 border-t border-white/5">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {s.value}
                </p>
                <p className="text-zinc-500 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ===== SECTION 2: SKILLS (MARQUEE) ===== */}
        <motion.section className="mt-24" {...fadeUp} transition={{ duration: 0.7 }}>
          <SectionLabel>Technical Skills</SectionLabel>
          <div className="marquee-container py-4">
            <div className="marquee-content">
              {[...skills, ...skills].map((skill, i) => (
                <span
                  key={i}
                  className="mx-3 px-5 py-2.5 bg-white/[0.05] border border-white/10 text-zinc-300 rounded-full text-sm whitespace-nowrap hover:border-purple-500/40 hover:text-white transition-all duration-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ===== SECTION 3: EXPERIENCE (VERTICAL TIMELINE) ===== */}
        <motion.section className="mt-24" {...fadeUp} transition={{ duration: 0.7 }}>
          <SectionLabel>Experience</SectionLabel>
          <div className="relative">
            {/* Spine */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/50 via-blue-500/20 to-transparent -translate-x-1/2" />

            <div className="space-y-10">
              {experiences.map((exp, idx) => (
                <motion.div
                  key={exp.company}
                  {...fadeUp}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className={`relative pl-12 md:pl-0 flex flex-col ${
                    idx % 2 === 0
                      ? "md:pr-[calc(50%+2rem)] md:items-end md:text-right"
                      : "md:pl-[calc(50%+2rem)] md:items-start md:text-left"
                  }`}
                >
                  {/* Node dot */}
                  <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-purple-500 ring-4 ring-purple-500/20 -translate-x-1/2 mt-1" />

                  <GlassCard className="p-6 max-w-lg w-full">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs font-mono px-2 py-0.5 rounded-md bg-white/5 text-zinc-400`}>
                        {exp.date}
                      </span>
                    </div>
                    <p className="text-white font-semibold text-lg">{exp.role}</p>
                    <p className={`${exp.color} text-sm font-medium mt-0.5`}>{exp.company}</p>
                    <p className="text-zinc-400 text-sm mt-2 leading-relaxed">{exp.desc}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ===== SECTION 4: HACKATHONS (BENTO GRID) ===== */}
        <motion.section className="mt-24" {...fadeUp} transition={{ duration: 0.7 }}>
          <SectionLabel>Hackathons</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hackathons.map((h) => (
              <motion.div
                key={h.name}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className={h.featured ? "md:col-span-2" : ""}
              >
                <GlassCard
                  className={`p-6 h-full bg-gradient-to-br ${h.gradient} ${h.featured ? "min-h-[140px]" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-white font-semibold text-lg">{h.name}</p>
                      <p className="text-zinc-400 text-sm mt-1">{h.result}</p>
                    </div>
                    <span
                      className={`shrink-0 px-2.5 py-1 rounded-full border text-xs font-mono font-medium ${h.badgeBg} ${h.badgeColor}`}
                    >
                      {h.badge}
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ===== SECTION 5: VOLUNTEER & ACTIVITIES ===== */}
        <motion.section className="mt-24" {...fadeUp} transition={{ duration: 0.7 }}>
          <SectionLabel>Volunteer &amp; Activities</SectionLabel>

          {/* Hero number */}
          <div className="text-center mb-10">
            <p className="text-8xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              300+
            </p>
            <p className="text-zinc-400 text-lg mt-2">Volunteer Hours</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
            {volunteerItems.map((v) => (
              <motion.div key={v.title} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                <GlassCard className="p-4 h-full flex flex-col gap-2">
                  <span className="text-2xl">{v.icon}</span>
                  <p className="text-white text-sm font-medium leading-snug">{v.title}</p>
                  <span className={`text-xs font-mono ${v.color}`}>{v.detail}</span>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ===== SECTION 6: ACHIEVEMENTS ===== */}
        <motion.section className="mt-24" {...fadeUp} transition={{ duration: 0.7 }}>
          <SectionLabel>Achievements</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievements.map((a) => (
              <motion.div key={a.title} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                <GlassCard
                  className={`p-6 group h-full bg-gradient-to-br ${a.gradient} border ${a.border}`}
                >
                  <p className="text-white font-semibold">{a.title}</p>
                  <p className={`${a.accent} text-sm mt-1`}>{a.sub}</p>
                  <div className="mt-4">
                    <span className="text-zinc-500 group-hover:text-purple-400 group-hover:translate-x-1 inline-block transition-all duration-200">
                      →
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ===== SECTION 7: CLUBS & SPORTS ===== */}
        <motion.section className="mt-24" {...fadeUp} transition={{ duration: 0.7 }}>
          <SectionLabel>Clubs &amp; Sports</SectionLabel>
          <div className="flex flex-wrap justify-center gap-3">
            {clubs.map((c) => (
              <span
                key={c.name}
                className={`px-5 py-2.5 bg-gradient-to-r ${c.color} text-white rounded-full text-sm font-medium shadow-lg hover:scale-105 transition-transform duration-200 cursor-default`}
              >
                {c.name}
              </span>
            ))}
          </div>
        </motion.section>

        {/* Footer line */}
        <p className="mt-24 text-center text-zinc-600 text-base">Always building something new.</p>
      </div>

      <SimpleDock items={dockItems} />
    </div>
  );
}
