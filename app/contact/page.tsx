"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { VscHome, VscAccount, VscSettingsGear, VscCode, VscBook } from "react-icons/vsc";
import SimpleDock from "@/components/SimpleDock";

const dockItems = [
  { icon: <VscHome size={18} />, label: "Home", href: "/" },
  { icon: <VscCode size={18} />, label: "Projects", href: "/projects" },
  { icon: <VscBook size={18} />, label: "Blog", href: "/blog" },
  { icon: <VscAccount size={18} />, label: "About", href: "/about" },
  { icon: <VscSettingsGear size={18} />, label: "Contact", href: "/contact" },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen relative blueprint-bg">
      {/* Radial glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at top, rgba(0,180,216,0.06), transparent 60%)' }}
      />

      <div className="relative z-10 flex flex-col items-center min-h-screen p-4 sm:p-8 pt-16 sm:pt-20 pb-32">

        {/* Page title */}
        <motion.div
          className="w-full max-w-xl mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-4 mb-3">
            <div
              className="h-px flex-1"
              style={{ background: 'linear-gradient(to right, transparent, rgba(0,180,216,0.4))' }}
            />
            <span className="bp-annotation opacity-60">MODULE: SIGNAL_TRANSMIT</span>
            <div
              className="h-px flex-1"
              style={{ background: 'linear-gradient(to left, transparent, rgba(0,180,216,0.4))' }}
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-center text-white">Contact</h1>
        </motion.div>

        {/* Sub-description */}
        <motion.p
          className="mb-12 text-center bp-annotation opacity-70 text-[0.7rem]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          HAVE A QUESTION OR WANT TO WORK TOGETHER? TRANSMIT A MESSAGE.
        </motion.p>

        {/* Form panel */}
        <motion.div
          className="w-full max-w-xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Title block — schematic drawing header */}
          <div
            className="px-5 py-3 flex items-center justify-between mb-0"
            style={{
              backgroundColor: 'rgba(0,180,216,0.07)',
              border: '1px solid rgba(0,180,216,0.35)',
              borderBottom: 'none',
            }}
          >
            <span className="bp-label">Communication Interface</span>
            <span className="bp-annotation opacity-60">FORM-001</span>
          </div>

          {/* Form container */}
          <form
            onSubmit={handleSubmit}
            className="w-full space-y-6 p-8"
            style={{
              backgroundColor: 'rgba(5,14,28,0.82)',
              border: '1px solid rgba(0,180,216,0.28)',
              backdropFilter: 'blur(14px)',
              position: 'relative',
            }}
          >
            {/* Bottom-right corner bracket */}
            <div
              className="absolute bottom-0 right-0 w-5 h-5 pointer-events-none"
              style={{
                borderBottom: '2px solid #00b4d8',
                borderRight: '2px solid #00b4d8',
              }}
            />

            {/* Name field */}
            <div>
              <label
                htmlFor="name"
                className="block mb-2 bp-annotation opacity-85 font-semibold"
              >
                FIELD_01: SENDER_NAME
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bp-input w-full px-4 py-3"
                placeholder="your name"
              />
            </div>

            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className="block mb-2 bp-annotation opacity-85 font-semibold"
              >
                FIELD_02: SENDER_EMAIL
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bp-input w-full px-4 py-3"
                placeholder="your@email.com"
              />
            </div>

            {/* Message field */}
            <div>
              <label
                htmlFor="message"
                className="block mb-2 bp-annotation opacity-85 font-semibold"
              >
                FIELD_03: MESSAGE_PAYLOAD
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={5}
                className="bp-input w-full px-4 py-3 resize-none"
                placeholder="your message..."
              />
            </div>

            {/* Divider line with ticks */}
            <div className="bp-dim-line" />

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={status === "loading"}
              className="bp-btn w-full py-3 px-6 text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {status === "loading" ? "Transmitting..." : "Transmit Message"}
            </motion.button>

            {/* Status messages */}
            {status === "success" && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center font-mono text-xs tracking-widest uppercase"
                style={{ color: '#00b4d8' }}
              >
                ✓ Signal received successfully.
              </motion.p>
            )}

            {status === "error" && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center font-mono text-xs tracking-widest uppercase text-red-400"
              >
                ✗ Transmission failed. Please retry.
              </motion.p>
            )}
          </form>

          {/* Footer annotation */}
          <div className="mt-3 flex items-center justify-between">
            <span className="bp-annotation opacity-40">DEST: ishaandhiman74@gmail.com</span>
            <span className="bp-annotation opacity-40">PORT-A005</span>
          </div>
        </motion.div>
      </div>

      <SimpleDock items={dockItems} />
    </div>
  );
}
