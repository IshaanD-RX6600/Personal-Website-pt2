"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { VscGithub } from 'react-icons/vsc';
import { FaLinkedin } from 'react-icons/fa';

const NAV = [
  { num: '01', label: 'Home',     href: '/',        desc: 'Start here' },
  { num: '02', label: 'Projects', href: '/projects', desc: 'Built work' },
  { num: '03', label: 'Blog',     href: '/blog',     desc: 'Writing & ideas' },
  { num: '04', label: 'About',    href: '/about',    desc: 'Who I am' },
  { num: '05', label: 'Contact',  href: '/contact',  desc: 'Get in touch' },
];

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* ── Hamburger button ── */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Toggle navigation"
        className="fixed top-4 right-4 sm:top-5 sm:right-5 z-[200] flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11"
        style={{
          background: 'rgba(5,14,28,0.90)',
          border: open ? '1px solid rgba(0,180,216,0.75)' : '1px solid rgba(0,180,216,0.42)',
          backdropFilter: 'blur(14px)',
          boxShadow: open ? '0 0 20px rgba(0,180,216,0.18)' : 'none',
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
      >
        {/* Three lines → X morph */}
        <span className="relative flex flex-col items-center justify-center w-5 h-3.5">
          <motion.span
            className="absolute block h-px bg-cyan-400 origin-center"
            animate={open ? { rotate: 45, y: 0, width: 18 } : { rotate: 0, y: -6, width: 18 }}
            transition={{ duration: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
          />
          <motion.span
            className="absolute block h-px bg-cyan-400 origin-center"
            animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
            style={{ width: 14 }}
            transition={{ duration: 0.18 }}
          />
          <motion.span
            className="absolute block h-px bg-cyan-400 origin-center"
            animate={open ? { rotate: -45, y: 0, width: 18 } : { rotate: 0, y: 6, width: 11 }}
            transition={{ duration: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </span>
      </button>

      {/* ── Blurred backdrop ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[150]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ background: 'rgba(3,8,20,0.55)', backdropFilter: 'blur(6px)' }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Slide-in menu panel ── */}
      <AnimatePresence>
        {open && (
          <motion.aside
            className="fixed top-0 right-0 bottom-0 z-[160] flex flex-col overflow-hidden"
            style={{
              width: 'min(420px, 92vw)',
              background: 'rgba(3,8,20,0.99)',
              borderLeft: '1px solid rgba(0,180,216,0.28)',
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.42, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Blueprint grid texture */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(0,180,216,0.055) 1px, transparent 1px),' +
                  'linear-gradient(90deg, rgba(0,180,216,0.055) 1px, transparent 1px)',
                backgroundSize: '44px 44px',
              }}
            />

            {/* One-time scan line on open */}
            <motion.div
              className="absolute left-0 right-0 z-20 pointer-events-none"
              style={{
                height: '1px',
                background: 'linear-gradient(to right, transparent, rgba(0,180,216,0.55), transparent)',
              }}
              initial={{ top: 0, opacity: 1 }}
              animate={{ top: '100%', opacity: 0 }}
              transition={{ duration: 1.1, ease: 'linear', delay: 0.05 }}
            />

            {/* Corner brackets */}
            {[
              { top: 0, left: 0, borderTop: '2px solid #00b4d8', borderLeft: '2px solid #00b4d8' },
              { top: 0, right: 0, borderTop: '2px solid #00b4d8', borderRight: '2px solid #00b4d8' },
              { bottom: 0, left: 0, borderBottom: '2px solid #00b4d8', borderLeft: '2px solid #00b4d8' },
              { bottom: 0, right: 0, borderBottom: '2px solid #00b4d8', borderRight: '2px solid #00b4d8' },
            ].map((style, i) => (
              <div
                key={i}
                className="absolute w-4 h-4 pointer-events-none"
                style={style}
              />
            ))}

            {/* Status header */}
            <div
              className="relative z-10 flex items-center justify-between px-7 py-5"
              style={{ borderBottom: '1px solid rgba(0,180,216,0.12)' }}
            >
              <div className="flex items-center gap-2.5">
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                  animate={{ opacity: [1, 0.25, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <span
                  className="font-mono text-[0.52rem] tracking-widest uppercase"
                  style={{ color: 'rgba(0,180,216,0.5)' }}
                >
                  Navigation System
                </span>
              </div>
              <span
                className="font-mono text-[0.46rem] tracking-widest uppercase"
                style={{ color: 'rgba(0,180,216,0.25)' }}
              >
                ONLINE
              </span>
            </div>

            {/* Nav items */}
            <nav className="relative z-10 flex-1 flex flex-col justify-center px-7">
              {NAV.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 48, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.38, delay: 0.14 + i * 0.075, ease: 'easeOut' }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="group relative flex items-center gap-4 py-4 overflow-hidden"
                    style={{ borderBottom: '1px solid rgba(0,180,216,0.07)' }}
                  >
                    {/* Hover fill sweep */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: 'rgba(0,180,216,0.05)', originX: 0 }}
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                    />

                    {/* Sequence number */}
                    <span
                      className="relative font-mono text-[0.5rem] tracking-widest shrink-0 w-5 transition-colors duration-200 group-hover:text-cyan-400"
                      style={{ color: 'rgba(0,180,216,0.28)' }}
                    >
                      {item.num}
                    </span>

                    {/* Label + description */}
                    <div className="relative flex-1 min-w-0">
                      <p className="text-[1.65rem] sm:text-[1.9rem] font-black tracking-tight leading-none text-white transition-colors duration-200 group-hover:text-cyan-300">
                        {item.label}
                      </p>
                      <p
                        className="font-mono text-[0.48rem] tracking-widest uppercase mt-1 transition-all duration-200 opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0"
                        style={{ color: 'rgba(0,180,216,0.5)' }}
                      >
                        {item.desc}
                      </p>
                    </div>

                    {/* Arrow indicator */}
                    <div className="relative flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
                      <span className="block h-px w-5" style={{ background: '#00b4d8' }} />
                      <span className="font-mono text-sm leading-none" style={{ color: '#00b4d8' }}>›</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Footer */}
            <motion.div
              className="relative z-10 px-7 py-6"
              style={{ borderTop: '1px solid rgba(0,180,216,0.12)' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.58, duration: 0.35 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <a
                  href="https://github.com/IshaanD-RX6600"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bp-btn px-3 py-2 text-[0.57rem] flex items-center gap-1.5"
                >
                  <VscGithub size={12} /> GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/ishaan-d-835a872a4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bp-btn px-3 py-2 text-[0.57rem] flex items-center gap-1.5"
                  style={{ borderColor: 'rgba(0,140,210,0.5)', color: '#7dd3fc' }}
                >
                  <FaLinkedin size={12} /> LinkedIn
                </a>
              </div>

              <p
                className="font-mono text-[0.46rem] tracking-widest uppercase"
                style={{ color: 'rgba(0,180,216,0.22)' }}
              >
                Press{' '}
                <span
                  className="px-1 py-0.5"
                  style={{ border: '1px solid rgba(0,180,216,0.3)', color: 'rgba(0,180,216,0.45)' }}
                >
                  ESC
                </span>{' '}
                or click outside to close
              </p>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
