"use client";

import { motion } from "framer-motion";
import SimpleDock from "@/components/SimpleDock";
import TextType from "@/components/TextType";
import { VscHome, VscCode, VscBook, VscAccount, VscSettingsGear, VscGithub } from "react-icons/vsc";
import { FaLinkedin } from "react-icons/fa";
import React from "react";

// ── Section label ─────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-10">
      <span className="bp-label">{children}</span>
      <div
        className="h-px flex-1"
        style={{ background: 'linear-gradient(to right, rgba(0,180,216,0.4), transparent)' }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 as const },
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
    { value: "8+",   label: "Hackathons" },
    { value: "20+",  label: "Technologies" },
    { value: "Top 3", label: "CCC Junior 2025" },
  ];

  const experiences = [
    {
      role: "Full-stack Developer & Co-Founder",
      company: "TidalTasks AI",
      date: "Mar 2025 – Present",
      type: "STARTUP",
      desc: "Tech startup with 50+ beta testers. Building an innovative productivity app with smart reminders and task management.",
    },
    {
      role: "Software Engineer Intern",
      company: "NexGenHealth",
      date: "Jul – Sep 2025",
      type: "INTERNSHIP",
      desc: "Built their website from start to finish, handling user data for healthcare solutions.",
    },
    {
      role: "Academic Writer Intern",
      company: "TMAS Academy",
      date: "Jul – Sep 2025",
      type: "INTERNSHIP",
      desc: "Creating educational content and academic materials.",
    },
    {
      role: "Certified National Lifeguard & Swim Instructor",
      company: "City of Kitchener",
      date: "Ongoing",
      type: "CERT",
      desc: "Taught free swimming lessons to kids as part of instructor certification.",
    },
  ];

  const hackathons = [
    {
      name: "Hack Canada 2026",
      result: "Top 8 Finalist",
      status: "TOP 8 FINALIST",
      featured: true,
    },
    {
      name: "NeoDev Developer League",
      result: "Top 3 — Cash Prize Winner",
      status: "CASH PRIZE",
      featured: true,
    },
    {
      name: "Hack the North",
      result: "Canada's Largest Hackathon",
      status: "PARTICIPANT",
      featured: false,
    },
    {
      name: "SpurHacks",
      result: "Participant & Builder",
      status: "BUILDER",
      featured: false,
    },
    {
      name: "Ignition Hacks",
      result: "Participant & Builder",
      status: "BUILDER",
      featured: false,
    },
    {
      name: "HawkHacks",
      result: "Participant & Builder",
      status: "BUILDER",
      featured: false,
    },
  ];

  // No emojis — category codes used instead
  const volunteerItems = [
    { cat: "CS",  title: "Coding Club EXEC & Website Manager", detail: "Cameron Heights CI" },
    { cat: "SCI", title: "STEM Club Volunteer",                detail: "90+ hrs" },
    { cat: "ENG", title: "Hack the North Volunteer",           detail: "19+ hrs" },
    { cat: "WLB", title: "Yoga Camp Volunteer",                detail: "40+ hrs" },
    { cat: "SPT", title: "Soccer Coach Volunteer",             detail: "30+ hrs" },
    { cat: "CIV", title: "BikeCheck Volunteer",                detail: "City of Kitchener" },
    { cat: "COM", title: "Safe & Caring Committee",            detail: "2021 – 2023" },
    { cat: "DIV", title: "South Asian Student Alliance",       detail: "Cameron Heights CI" },
  ];

  const achievements = [
    { num: "01", title: "Top 3 in 2025 CCC Junior",           sub: "Canadian Computing Competition" },
    { num: "02", title: "Canada Youth Changemakers Summit",    sub: "Participant & Presenter" },
    { num: "03", title: "Solo Website Builder",                sub: "Built Student Activity Council website & personal portfolio" },
    { num: "04", title: "Built Custom PC",                     sub: "Hardware assembly & configuration" },
    { num: "05", title: "Smart Home Automation",               sub: "Automated entire household with Amazon Alexa" },
    { num: "06", title: "Master in Full-Stack Development",    sub: "Self-taught expertise" },
  ];

  const clubs = [
    "Chess Club",
    "Badminton",
    "House League Soccer",
    "STEM Club",
    "Coding Club",
    "South Asian Student Alliance",
  ];

  return (
    <div className="min-h-screen relative blueprint-bg overflow-x-hidden">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at top, rgba(0,180,216,0.05), transparent 60%)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 pb-32">

        {/* ===== HERO ===== */}
        <motion.section {...fadeUp} transition={{ duration: 0.8 }}>
          <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-center min-h-[85vh]">

            <div className="flex flex-col justify-center">
              {/* Status indicator */}
              <span
                className="inline-flex items-center gap-2 px-3 py-1 w-fit mb-8 font-mono text-xs tracking-widest uppercase"
                style={{
                  border: '1px solid rgba(0,180,216,0.4)',
                  background: 'rgba(0,180,216,0.07)',
                  color: '#00d4f5',
                  borderRadius: '1px',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Available for opportunities
              </span>

              <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none mb-4">
                <span className="text-white">Ishaan </span>
                <span style={{ color: '#00b4d8' }}>Dhiman</span>
              </h1>

              <div className="h-10 flex items-center mb-6">
                <TextType
                  text={["AI Builder", "Full-Stack Developer", "Hackathon Enthusiast"]}
                  typingSpeed={60}
                  deletingSpeed={35}
                  pauseDuration={2200}
                  loop
                  className="text-2xl md:text-3xl font-semibold"
                  textColors={["rgba(200,235,255,0.85)", "rgba(200,235,255,0.85)", "rgba(200,235,255,0.85)"]}
                  showCursor
                  cursorCharacter="|"
                />
              </div>

              <p className="leading-relaxed text-lg max-w-xl mt-4" style={{ color: 'rgba(180,220,240,0.68)' }}>
                I'm a high school developer passionate about building AI tools, full-stack
                applications, and experimental projects. I enjoy exploring LLMs, machine learning,
                and real-world software problems. Currently a Grade 11 IB student at Cameron Heights
                Collegiate Institute in Kitchener, Ontario.
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                <a href="https://github.com/IshaanD-RX6600" target="_blank" rel="noopener noreferrer"
                  className="bp-btn px-4 py-2 text-sm">
                  <VscGithub size={15} /> GitHub
                </a>
                <a href="https://www.linkedin.com/in/ishaan-d-835a872a4" target="_blank" rel="noopener noreferrer"
                  className="bp-btn px-4 py-2 text-sm"
                  style={{ borderColor: 'rgba(0,150,210,0.5)', color: '#7dd3fc' }}>
                  <FaLinkedin size={15} /> LinkedIn
                </a>
              </div>
            </div>

            {/* Schematic avatar */}
            <div className="relative flex items-center justify-center">
              <motion.div
                className="absolute w-80 h-80 rounded-full"
                style={{ border: '1px dashed rgba(0,180,216,0.28)' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute w-72 h-72 rounded-full"
                style={{ border: '1px dashed rgba(0,180,216,0.14)' }}
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              />
              <div
                className="w-64 h-64 rounded-full flex items-center justify-center"
                style={{
                  border: '1px solid rgba(0,180,216,0.28)',
                  background: 'linear-gradient(135deg, rgba(0,180,216,0.1), rgba(0,100,180,0.08))',
                }}
              >
                <span className="text-7xl font-black select-none" style={{ color: '#00b4d8' }}>ID</span>
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                <span className="bp-annotation opacity-55">ENTITY: ISHAAN_DHIMAN</span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 mt-12 pt-12"
            style={{ borderTop: '1px solid rgba(0,180,216,0.16)' }}
          >
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="text-center py-4"
                style={{ borderRight: i < stats.length - 1 ? '1px solid rgba(0,180,216,0.1)' : 'none' }}
              >
                <div className="mx-auto mb-2 w-px h-3" style={{ background: 'rgba(0,180,216,0.35)' }} />
                <p className="text-3xl md:text-4xl font-black" style={{ color: '#00b4d8' }}>{s.value}</p>
                <p className="mt-1 bp-annotation opacity-65">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ===== SKILLS ===== */}
        <motion.section className="mt-24" {...fadeUp} transition={{ duration: 0.7 }}>
          <SectionLabel>Technical Skills</SectionLabel>
          <div className="marquee-container py-4">
            <div className="marquee-content">
              {[...skills, ...skills].map((skill, i) => (
                <span key={i} className="mx-3 bp-tag px-4 py-2">{skill}</span>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ===== EXPERIENCE ===== */}
        <motion.section className="mt-24" {...fadeUp} transition={{ duration: 0.7 }}>
          <SectionLabel>Experience</SectionLabel>
          <div className="relative">
            {/* Spine */}
            <div
              className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
              style={{ background: 'linear-gradient(to bottom, rgba(0,180,216,0.5), rgba(0,180,216,0.12), transparent)' }}
            />

            <div className="space-y-8">
              {experiences.map((exp, idx) => (
                <motion.div
                  key={exp.company}
                  {...fadeUp}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={`relative pl-12 md:pl-0 flex flex-col ${
                    idx % 2 === 0
                      ? "md:pr-[calc(50%+2rem)] md:items-end md:text-right"
                      : "md:pl-[calc(50%+2rem)] md:items-start md:text-left"
                  }`}
                >
                  <div className="absolute left-4 md:left-1/2 w-3 h-3 bp-dot -translate-x-1/2 mt-2" />

                  {/* Experience card — field-labeled form entry */}
                  <div
                    className="max-w-lg w-full"
                    style={{
                      border: '1px solid rgba(0,180,216,0.22)',
                      borderLeft: '3px solid rgba(0,180,216,0.6)',
                      backgroundColor: 'rgba(5,14,28,0.78)',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-base leading-snug">{exp.role}</p>
                        <p className="font-mono text-sm mt-0.5" style={{ color: '#00b4d8' }}>{exp.company}</p>
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1 pt-0.5">
                        <span className="bp-annotation opacity-55">{exp.date}</span>
                        <span
                          className="font-mono text-[0.5rem] tracking-widest uppercase px-1.5 py-0.5"
                          style={{ border: '1px solid rgba(0,180,216,0.3)', color: 'rgba(0,180,216,0.6)' }}
                        >
                          {exp.type}
                        </span>
                      </div>
                    </div>
                    {/* Divider */}
                    <div style={{ height: '1px', background: 'rgba(0,180,216,0.12)', margin: '0 20px' }} />
                    {/* Description */}
                    <p className="px-5 pt-3 pb-5 text-sm leading-relaxed" style={{ color: 'rgba(180,220,240,0.62)' }}>
                      {exp.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ===== HACKATHONS ===== */}
        <motion.section className="mt-24" {...fadeUp} transition={{ duration: 0.7 }}>
          <SectionLabel>Hackathons</SectionLabel>

          {/* Featured entries */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {hackathons.filter(h => h.featured).map((h) => (
              <div
                key={h.name}
                style={{
                  border: '1px solid rgba(0,180,216,0.25)',
                  borderLeft: '3px solid #00b4d8',
                  backgroundColor: 'rgba(5,14,28,0.8)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div className="p-5">
                  <p className="bp-annotation opacity-55 mb-2">COMPETITION // FEATURED RESULT</p>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-white font-bold text-lg leading-snug">{h.name}</h3>
                      <p className="text-sm mt-1" style={{ color: 'rgba(180,220,240,0.65)' }}>{h.result}</p>
                    </div>
                    <span
                      className="shrink-0 font-mono text-[0.55rem] tracking-widest uppercase px-2 py-1 mt-0.5"
                      style={{
                        border: '1px solid rgba(0,180,216,0.5)',
                        color: '#00d4f5',
                        background: 'rgba(0,180,216,0.08)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Regular entries — compact list */}
          <div style={{ border: '1px solid rgba(0,180,216,0.18)', backgroundColor: 'rgba(5,14,28,0.6)' }}>
            {hackathons.filter(h => !h.featured).map((h, i, arr) => (
              <div
                key={h.name}
                className="flex items-center gap-4 px-5 py-3 hover:bg-cyan-500/5 transition-colors duration-150"
                style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(0,180,216,0.1)' : 'none' }}
              >
                <span className="flex-1 text-sm font-medium text-white">{h.name}</span>
                <span className="text-sm hidden sm:block" style={{ color: 'rgba(180,220,240,0.5)' }}>{h.result}</span>
                <span
                  className="shrink-0 font-mono text-[0.52rem] tracking-widest uppercase px-2 py-0.5"
                  style={{ border: '1px solid rgba(0,180,216,0.28)', color: 'rgba(0,180,216,0.65)' }}
                >
                  {h.status}
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ===== VOLUNTEER & ACTIVITIES ===== */}
        <motion.section className="mt-24" {...fadeUp} transition={{ duration: 0.7 }}>
          <SectionLabel>Volunteer &amp; Activities</SectionLabel>

          {/* Big stat */}
          <div className="flex items-baseline gap-4 mb-8">
            <p className="text-7xl font-black" style={{ color: '#00b4d8' }}>300+</p>
            <div>
              <p className="bp-annotation opacity-65 mb-1">TOTAL VOLUNTEER HOURS</p>
              <div style={{ width: '120px', height: '1px', background: 'rgba(0,180,216,0.35)' }} />
            </div>
          </div>

          {/* Activity log — two columns, no individual cards */}
          <div
            style={{
              border: '1px solid rgba(0,180,216,0.2)',
              backgroundColor: 'rgba(5,14,28,0.65)',
            }}
          >
            {/* Log header */}
            <div
              className="flex items-center gap-4 px-4 py-2"
              style={{ borderBottom: '1px solid rgba(0,180,216,0.2)', backgroundColor: 'rgba(0,180,216,0.05)' }}
            >
              <span className="bp-annotation opacity-45 w-8">NO.</span>
              <span className="bp-annotation opacity-45 w-10">CAT</span>
              <span className="bp-annotation opacity-45 flex-1">ACTIVITY / ROLE</span>
              <span className="bp-annotation opacity-45 w-32 text-right hidden sm:block">DETAIL</span>
            </div>
            {volunteerItems.map((v, i) => (
              <div
                key={v.title}
                className="flex items-center gap-4 px-4 py-3 hover:bg-cyan-500/5 transition-colors duration-150"
                style={{ borderBottom: i < volunteerItems.length - 1 ? '1px solid rgba(0,180,216,0.1)' : 'none' }}
              >
                {/* Row number */}
                <span
                  className="shrink-0 font-mono font-bold text-[0.55rem] tracking-widest w-8"
                  style={{ color: 'rgba(0,180,216,0.38)' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                {/* Category code */}
                <span
                  className="shrink-0 font-mono font-bold text-[0.52rem] tracking-widest px-1 py-0.5 w-10 text-center"
                  style={{
                    border: '1px solid rgba(0,180,216,0.35)',
                    color: '#00b4d8',
                    background: 'rgba(0,180,216,0.06)',
                  }}
                >
                  {v.cat}
                </span>
                {/* Title */}
                <span className="flex-1 text-white text-sm font-medium">{v.title}</span>
                {/* Detail */}
                <span
                  className="shrink-0 font-mono text-[0.58rem] tracking-wider w-32 text-right hidden sm:block"
                  style={{ color: 'rgba(0,180,216,0.5)' }}
                >
                  {v.detail}
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ===== ACHIEVEMENTS ===== */}
        <motion.section className="mt-24" {...fadeUp} transition={{ duration: 0.7 }}>
          <SectionLabel>Achievements</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {achievements.map((a) => (
              <div
                key={a.title}
                className="flex items-start gap-5 p-5 hover:bg-cyan-500/5 transition-colors duration-150"
                style={{
                  border: '1px solid rgba(0,180,216,0.2)',
                  borderLeft: '2px solid rgba(0,180,216,0.55)',
                  backgroundColor: 'rgba(5,14,28,0.7)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {/* Callout number */}
                <span
                  className="shrink-0 font-mono font-black text-sm leading-none mt-0.5"
                  style={{ color: 'rgba(0,180,216,0.4)' }}
                >
                  {a.num}
                </span>
                <div>
                  <p className="text-white font-semibold text-sm leading-snug">{a.title}</p>
                  <p
                    className="font-mono text-[0.6rem] tracking-wider uppercase mt-1.5"
                    style={{ color: 'rgba(0,180,216,0.52)' }}
                  >
                    {a.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ===== CLUBS & SPORTS ===== */}
        <motion.section className="mt-24" {...fadeUp} transition={{ duration: 0.7 }}>
          <SectionLabel>Clubs &amp; Sports</SectionLabel>
          <div className="flex flex-wrap gap-2.5">
            {clubs.map((c) => (
              <span
                key={c}
                className="bp-tag px-4 py-2 text-[0.65rem] cursor-default transition-colors duration-150 hover:bg-cyan-500/12"
              >
                {c}
              </span>
            ))}
          </div>
        </motion.section>

        {/* Footer annotation */}
        <p className="mt-24 text-center bp-annotation" style={{ opacity: 0.38 }}>
          Always building something new.
        </p>
      </div>

      <SimpleDock items={dockItems} />
    </div>
  );
}
