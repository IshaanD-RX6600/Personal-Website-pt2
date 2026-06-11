"use client";

import { useState } from 'react';
import type { SectionId } from '@/stores/useSiteStore';

// Shared by SectionPanels (3D overlay mode) and MobileFallback (stacked mode).
// Content ported from the previous site (about/projects/contact pages).

export const SECTION_META: Record<SectionId, { gear: string; title: string; label: string }> = {
  projects:   { gear: '3', title: 'Projects',   label: 'built work'    },
  experience: { gear: '4', title: 'Experience', label: 'work history'  },
  skills:     { gear: '5', title: 'Skills',     label: 'tech stack'    },
  contact:    { gear: '6', title: 'Contact',    label: 'get in touch'  },
};

export const LINKS = {
  email:    'ishaandhiman74@gmail.com',
  github:   'https://github.com/IshaanD-RX6600',
  linkedin: 'https://www.linkedin.com/in/ishaan-d-835a872a4',
};

// ─── Projects ────────────────────────────────────────────────────────────────
type Project = {
  title: string; stack: string; description: string; status: string;
  liveUrl: string; githubUrl: string; image: string;
};

const PROJECTS: Project[] = [
  { title: 'TidalTasks', stack: 'Next.js · Firebase · OpenAI', status: 'DEPLOYED',
    description: 'An AI-powered task management application that helps users organize and prioritize their work efficiently.',
    liveUrl: 'https://tasktide-ai.vercel.app/', githubUrl: 'https://github.com/DhairyaS450/track-ai-web',
    image: '/Screenshot 2025-07-28 233413.png' },
  { title: 'Waypoint', stack: 'Next.js · Supabase · RAG', status: 'DEMO',
    description: 'AI-powered case memory platform for social workers with voice ingestion, crisis-aware dashboards, and thread-scoped RAG.',
    liveUrl: 'https://www.youtube.com/watch?v=hxuZ9ZgZLvk', githubUrl: 'https://github.com/IshaanD-RX6600/Waypoint',
    image: '/Screenshot 2026-03-17 152816.png' },
  { title: 'FormFlux', stack: 'React · Node.js · ML', status: 'DEPLOYED',
    description: 'Your personal AI fitness coach with workout tracking, progress monitoring, and personalized fitness guidance.',
    liveUrl: 'https://formfluxwork.vercel.app/', githubUrl: 'https://github.com/DhairyaS450/formflux',
    image: '/formflux-new-screenshot.png' },
  { title: 'Shurplus', stack: 'Next.js · Supabase · AI', status: 'DEPLOYED',
    description: 'A dual-engine platform for food rescue connecting distributors, volunteers, and food banks with AI-powered inventory management.',
    liveUrl: 'https://shurplus.vercel.app/', githubUrl: 'https://github.com/SaiAmartya/sharingsurplus',
    image: '/Screenshot 2026-03-17 152604.png' },
  { title: 'CHCI Coding Club', stack: 'Next.js · TailwindCSS', status: 'DEPLOYED',
    description: 'Club website for the CHCI Coding Club, featuring club information, events, and member resources.',
    liveUrl: 'https://chci-coding-club.vercel.app/', githubUrl: 'https://github.com/IshaanD-RX6600/Coding-Club-Website',
    image: '/CHCI-CoodingClubphoto.png' },
  { title: 'Move Master', stack: 'Python · OpenCV · React', status: 'DEMO',
    description: 'Movement tracking app that monitors and analyzes user movement patterns for fitness and health insights.',
    liveUrl: 'https://www.youtube.com/watch?v=S022Pv9t8z4', githubUrl: 'https://github.com/IshaanD-RX6600/Move-Master',
    image: '/Move-Master.png' },
  { title: 'Ledger', stack: 'TypeScript · Next.js', status: 'ACTIVE',
    description: 'A clean financial tracking application for logging expenses, managing budgets, and visualizing spending patterns.',
    liveUrl: '', githubUrl: 'https://github.com/IshaanD-RX6600/Ledger',
    image: '/Screenshot 2026-06-08 150729.png' },
  { title: 'Face Swap', stack: 'Python · dlib · OpenCV', status: 'COMPLETE',
    description: 'Replace any face in a video using a single reference image — no dataset, no training required.',
    liveUrl: '', githubUrl: 'https://github.com/IshaanD-RX6600/Face-Swap',
    image: '/Screenshot 2026-06-08 150712.png' },
  { title: 'Pac-Man', stack: 'Java · Swing', status: 'COMPLETE',
    description: 'A fully playable recreation of the classic arcade game with custom ghost AI, collision detection, and scoring.',
    liveUrl: '', githubUrl: 'https://github.com/IshaanD-RX6600/Pac-Man-java',
    image: '/Screenshot 2026-06-08 150650.png' },
  { title: 'Handwritten to Text', stack: 'Python · TensorFlow · OpenCV', status: 'ML',
    description: 'ML pipeline converting handwritten notes into digital text using a custom-trained CNN for character recognition.',
    liveUrl: '', githubUrl: 'https://github.com/IshaanD-RX6600/Handwritten-to-text',
    image: '/Screenshot 2026-06-08 150856.png' },
];

function Projects() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {PROJECTS.map((p, i) => (
        <div key={p.title} className="bp-card flex flex-col overflow-hidden">
          <div className="h-36 overflow-hidden bg-black/40 relative shrink-0">
            <img src={p.image} alt={p.title} loading="lazy"
              className="w-full h-full object-cover opacity-80 hover:opacity-100 hover:scale-105 transition duration-500" />
            <span className="absolute top-2 right-2 bp-annotation px-1.5 py-0.5 border border-primary/40 bg-background/80">
              {p.status}
            </span>
          </div>
          <div className="flex flex-col flex-1 p-4">
            <div className="bp-annotation opacity-50 mb-1">SPEC-{String(i + 1).padStart(2, '0')}</div>
            <h3 className="font-bold text-foreground mb-2">{p.title}</h3>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {p.stack.split(' · ').map(t => <span key={t} className="bp-tag">{t}</span>)}
            </div>
            <p className="text-sm text-muted-foreground flex-1">{p.description}</p>
            <div className="flex gap-2 mt-4">
              {p.liveUrl && (
                <a className="bp-btn text-xs" href={p.liveUrl} target="_blank" rel="noopener noreferrer">
                  [ {p.liveUrl.includes('youtube.com') ? 'demo' : 'live'} ]
                </a>
              )}
              <a className="bp-btn text-xs opacity-75" href={p.githubUrl} target="_blank" rel="noopener noreferrer">
                [ source ]
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Experience ──────────────────────────────────────────────────────────────
const EXPERIENCES = [
  { role: 'Full-stack Developer & Co-Founder', org: 'TidalTasks AI', period: 'Mar 2025 — present', type: 'STARTUP',
    blurb: 'Tech startup with 50+ beta testers. Building an innovative productivity app with smart reminders and task management.' },
  { role: 'Software Engineer Intern', org: 'NexGenHealth', period: 'Jul — Sep 2025', type: 'INTERNSHIP',
    blurb: 'Built their website from start to finish, handling user data for healthcare solutions.' },
  { role: 'Academic Writer Intern', org: 'TMAS Academy', period: 'Jul — Sep 2025', type: 'INTERNSHIP',
    blurb: 'Creating educational content and academic materials.' },
  { role: 'National Lifeguard & Swim Instructor', org: 'City of Kitchener', period: 'Ongoing', type: 'CERT',
    blurb: 'Taught free swimming lessons to kids as part of instructor certification.' },
];

const HACKATHONS = [
  { name: 'Hack Canada 2026',        result: 'Top 8 Finalist' },
  { name: 'NeoDev Developer League', result: 'Top 3 — Cash Prize Winner' },
  { name: 'Hack the North',          result: "Canada's largest hackathon" },
  { name: 'SpurHacks',               result: 'Participant & Builder' },
  { name: 'Ignition Hacks',          result: 'Participant & Builder' },
  { name: 'HawkHacks',               result: 'Participant & Builder' },
];

function Experience() {
  return (
    <div className="space-y-8">
      <div className="space-y-6">
        {EXPERIENCES.map((e, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center pt-1.5">
              <span className="bp-dot" />
              {i < EXPERIENCES.length - 1 && <span className="w-px flex-1 bg-primary/20 mt-1" />}
            </div>
            <div className="pb-2">
              <div className="bp-annotation mb-1">{e.period} · {e.type}</div>
              <h3 className="font-bold text-foreground">{e.role} · <span className="text-primary">{e.org}</span></h3>
              <p className="text-sm text-muted-foreground mt-1">{e.blurb}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="bp-label mb-4">Hackathons</div>
        <div className="grid gap-2 sm:grid-cols-2">
          {HACKATHONS.map(h => (
            <div key={h.name} className="flex items-baseline justify-between gap-3 border border-primary/15 px-3 py-2">
              <span className="text-sm font-bold text-foreground">{h.name}</span>
              <span className="bp-annotation text-right shrink-0">{h.result}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Skills ──────────────────────────────────────────────────────────────────
const SKILLS: Record<string, string[]> = {
  Languages:               ['Python', 'TypeScript', 'JavaScript', 'Java', 'C++', 'HTML', 'CSS'],
  'Frameworks & Libraries': ['React', 'Next.js', 'Node.js', 'TailwindCSS', 'TensorFlow', 'PyTorch'],
  'Platforms & Tools':      ['Firebase', 'Supabase', 'MongoDB', 'Vercel', 'Google Cloud', 'Git', 'GitHub'],
};

const STATS = [
  { value: '300+',  label: 'Volunteer Hours' },
  { value: '8+',    label: 'Hackathons' },
  { value: '20+',   label: 'Technologies' },
  { value: 'Top 3', label: 'CCC Junior 2025' },
];

function Skills() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATS.map(s => (
          <div key={s.label} className="border border-primary/20 px-3 py-3 text-center">
            <div className="text-xl font-black text-primary">{s.value}</div>
            <div className="bp-annotation mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      {Object.entries(SKILLS).map(([group, items]) => (
        <div key={group}>
          <div className="bp-label mb-3">{group}</div>
          <div className="flex flex-wrap gap-2">
            {items.map(s => <span key={s} className="bp-tag">{s}</span>)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Contact ─────────────────────────────────────────────────────────────────
const INPUT_CLS =
  'w-full bg-transparent border border-primary/20 px-3 py-2.5 text-sm text-foreground ' +
  'placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none transition-colors';

function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? 'Failed to send.');
      setStatus('sent');
      form.reset();
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to send.');
    }
  }

  if (status === 'sent') {
    return (
      <div className="border border-primary/40 px-4 py-6 text-center space-y-2">
        <div className="text-primary font-bold text-sm">MESSAGE SENT</div>
        <p className="text-sm text-muted-foreground">Thanks — I read everything and I&apos;ll get back to you.</p>
        <button className="bp-btn text-xs mt-2" onClick={() => setStatus('idle')}>[ send another ]</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Honeypot — hidden from humans, bots fill it and get silently dropped */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true"
        className="hidden" />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="bp-annotation block mb-1">NAME</span>
          <input name="name" required maxLength={200} placeholder="Your name" className={INPUT_CLS} />
        </label>
        <label className="block">
          <span className="bp-annotation block mb-1">EMAIL</span>
          <input name="email" type="email" required maxLength={200} placeholder="you@example.com" className={INPUT_CLS} />
        </label>
      </div>
      <label className="block">
        <span className="bp-annotation block mb-1">MESSAGE</span>
        <textarea name="message" required maxLength={5000} rows={5} placeholder="What's on your mind?"
          className={`${INPUT_CLS} resize-y`} />
      </label>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={status === 'sending'} className="bp-btn text-xs disabled:opacity-50">
          {status === 'sending' ? '[ sending… ]' : '[ send message ]'}
        </button>
        {status === 'error' && <span className="text-xs text-red-400">{error}</span>}
      </div>
    </form>
  );
}

function Contact() {
  return (
    <div className="space-y-6 max-w-md">
      <p className="text-sm text-muted-foreground">
        Want to work together, or just talk cars and code? Drop a message — it lands
        straight in my inbox — or reach out anywhere below.
      </p>
      <ContactForm />
      <div className="space-y-2">
        <a href={`mailto:${LINKS.email}`} className="flex items-baseline justify-between gap-3 border border-primary/20 px-3 py-2.5 hover:border-primary/60 transition-colors">
          <span className="bp-annotation">EMAIL</span>
          <span className="text-sm text-primary">{LINKS.email}</span>
        </a>
        <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="flex items-baseline justify-between gap-3 border border-primary/20 px-3 py-2.5 hover:border-primary/60 transition-colors">
          <span className="bp-annotation">GITHUB</span>
          <span className="text-sm text-primary">IshaanD-RX6600</span>
        </a>
        <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-baseline justify-between gap-3 border border-primary/20 px-3 py-2.5 hover:border-primary/60 transition-colors">
          <span className="bp-annotation">LINKEDIN</span>
          <span className="text-sm text-primary">ishaan-d</span>
        </a>
      </div>
      <div className="bp-annotation">
        Based in Kitchener, Ontario · Grade 11 IB @ Cameron Heights CI
      </div>
    </div>
  );
}

export function SectionBody({ id }: { id: SectionId }) {
  switch (id) {
    case 'projects':   return <Projects />;
    case 'experience': return <Experience />;
    case 'skills':     return <Skills />;
    case 'contact':    return <Contact />;
  }
}
