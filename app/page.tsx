"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useScroll, useTransform, motion, useMotionValueEvent } from 'framer-motion';
import GlitchText from "@/components/GlitchText";
import TextType from "@/components/TextType";
import { VscGithub } from "react-icons/vsc";
import { FaLinkedin } from "react-icons/fa";

const CarModel = dynamic(() => import('@/components/CarModel'), { ssr: false, loading: () => null });

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const [camProgress, setCamProgress] = useState(0);

  // Camera climbs toward cockpit across 80% of total scroll
  const cameraProgress = useTransform(scrollYProgress, [0, 0.80], [0, 1]);
  useMotionValueEvent(cameraProgress, 'change', setCamProgress);

  // Intro gone fast — gives full attention to the zoom
  const introOpacity = useTransform(scrollYProgress, [0, 0.14], [1, 0]);
  const introY       = useTransform(scrollYProgress, [0, 0.14], [0, -60]);

  // Overlay closes in as camera reaches the windshield glass
  const overlayOpacity = useTransform(scrollYProgress, [0.44, 0.63], [0, 1]);

  // About me materialises from inside
  const aboutOpacity = useTransform(scrollYProgress, [0.61, 0.76], [0, 1]);
  const aboutY       = useTransform(scrollYProgress, [0.61, 0.76], [50, 0]);

  const stats = [
    { value: "300+", label: "Volunteer Hours" },
    { value: "8+",   label: "Hackathons" },
    { value: "20+",  label: "Technologies" },
    { value: "Top 3", label: "CCC Junior 2025" },
  ];

  const skills = [
    "Python", "TypeScript", "JavaScript", "Java", "C++",
    "React", "Next.js", "TailwindCSS", "Firebase", "MongoDB", "TensorFlow",
  ];

  return (
    // 400vh — 100vh intro + 160vh zoom tunnel + 140vh about section
    <div className="relative blueprint-bg" style={{ height: '400vh' }}>

      {/* ── Fixed 3D car — always the deepest layer ── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <CarModel scrollProgress={camProgress} />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 65% at 55% 52%, transparent 25%, rgba(10,22,40,0.6) 58%, #0a1628 88%)',
          }}
        />
      </div>

      {/* ── Transition overlay — rises as camera enters the car ── */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 5, background: '#030810', opacity: overlayOpacity }}
      />

      {/* ── Intro (0–100vh) ── */}
      <div
        className="relative flex items-center justify-center"
        style={{ height: '100vh', zIndex: 10 }}
      >
        <motion.div
          className="px-4 sm:px-8 max-w-4xl w-full text-center"
          style={{ opacity: introOpacity, y: introY }}
        >
          <GlitchText
            speed={1}
            enableShadows={true}
            enableOnHover={true}
            className="text-4xl sm:text-6xl md:text-8xl font-bold text-white"
          >
            Ishaan Dhiman
          </GlitchText>
        </motion.div>

        {/* Bouncing scroll hint */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
          style={{ opacity: introOpacity, zIndex: 20 }}
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <span
            className="font-mono text-[0.55rem] tracking-widest uppercase"
            style={{ color: 'rgba(0,180,216,0.45)' }}
          >
            Scroll
          </span>
          <div
            className="w-px h-7"
            style={{ background: 'linear-gradient(to bottom, rgba(0,180,216,0.5), transparent)' }}
          />
        </motion.div>
      </div>

      {/* ── Zoom tunnel (100–260vh) — empty scroll space for the camera dive ── */}
      <div style={{ height: '160vh' }} />

      {/* ── About me (260–400vh) — emerges from the darkness ── */}
      <div
        className="relative"
        style={{
          zIndex: 10,
          minHeight: '140vh',
          background: '#030810',
        }}
      >
        <motion.div
          className="max-w-4xl mx-auto px-4 sm:px-8 pt-20 pb-40"
          style={{ opacity: aboutOpacity, y: aboutY }}
        >
          {/* Label */}
          <div className="mb-6">
            <span className="bp-label">About Me</span>
          </div>

          {/* Name */}
          <h2 className="text-5xl md:text-7xl font-black leading-none mb-3">
            <span className="text-white">Ishaan </span>
            <span style={{ color: '#00b4d8' }}>Dhiman</span>
          </h2>

          {/* Typewriter */}
          <div className="h-10 flex items-center mb-6">
            <TextType
              text={["AI Builder", "Full-Stack Developer", "Hackathon Enthusiast"]}
              typingSpeed={60}
              deletingSpeed={35}
              pauseDuration={2200}
              loop
              className="text-xl md:text-2xl font-semibold"
              textColors={[
                "rgba(200,235,255,0.85)",
                "rgba(200,235,255,0.85)",
                "rgba(200,235,255,0.85)",
              ]}
              showCursor
              cursorCharacter="|"
            />
          </div>

          {/* Bio */}
          <p
            className="max-w-xl leading-relaxed mb-10 text-base"
            style={{ color: 'rgba(180,220,240,0.68)' }}
          >
            High school developer passionate about AI tools, full-stack applications, and
            experimental projects. Currently a Grade 11 IB student at Cameron Heights CI
            in Kitchener, Ontario.
          </p>

          {/* Stats */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 mb-10"
            style={{
              borderTop: '1px solid rgba(0,180,216,0.16)',
              borderBottom: '1px solid rgba(0,180,216,0.1)',
            }}
          >
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="text-center py-5 px-2"
                style={{
                  borderRight: i < stats.length - 1 ? '1px solid rgba(0,180,216,0.1)' : 'none',
                }}
              >
                <p className="text-3xl font-black" style={{ color: '#00b4d8' }}>{s.value}</p>
                <p className="mt-1 bp-annotation opacity-60">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 mb-10">
            {skills.map((skill) => (
              <span key={skill} className="bp-tag px-3 py-1.5">
                {skill}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <a href="/about" className="bp-btn px-5 py-2.5 text-xs">
              Full Profile
            </a>
            <a
              href="https://github.com/IshaanD-RX6600"
              target="_blank"
              rel="noopener noreferrer"
              className="bp-btn px-4 py-2.5 text-xs"
            >
              <VscGithub size={14} /> GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/ishaan-d-835a872a4"
              target="_blank"
              rel="noopener noreferrer"
              className="bp-btn px-4 py-2.5 text-xs"
              style={{ borderColor: 'rgba(0,150,210,0.5)', color: '#7dd3fc' }}
            >
              <FaLinkedin size={14} /> LinkedIn
            </a>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
