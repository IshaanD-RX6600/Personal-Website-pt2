"use client";
import SimpleDock from "@/components/SimpleDock";
import { VscHome, VscArchive, VscAccount, VscSettingsGear, VscCode, VscBook, VscGithub } from "react-icons/vsc";
import { FaLinkedin } from "react-icons/fa";
import { motion } from "framer-motion";

export default function AboutPage() {
  const dockItems = [
    { icon: <VscHome size={18} />, label: 'Home', href: '/' },
    { icon: <VscCode size={18} />, label: 'Projects', href: '/projects' },
    { icon: <VscBook size={18} />, label: 'Blog', href: '/blog' },
    { icon: <VscAccount size={18} />, label: 'About', href: '/about' },
    { icon: <VscSettingsGear size={18} />, label: 'Contact', href: '/contact' },
  ];

  const skills = [
    'Python', 'TypeScript', 'JavaScript', 'Java', 'C++', 'HTML', 'CSS',
    'React', 'Next.js', 'Node.js', 'TailwindCSS', 'Firebase', 'MongoDB',
    'Supabase', 'Vercel', 'Google Cloud', 'TensorFlow', 'PyTorch', 'Git', 'GitHub'
  ];

  return (
    <div className="min-h-screen relative bg-black">
      <div className="relative z-10 flex flex-col items-center min-h-screen p-8 pt-20 pb-32">
        <motion.h1 className="text-5xl md:text-7xl font-bold text-white text-center mb-12" initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:0.2}}>About Me</motion.h1>
        
        {/* Intro Section */}
        <motion.div className="max-w-4xl w-full" initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:0.4}}>
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Hi, I'm Ishaan</h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-6">Developer | AI Builder | Hackathon Enthusiast</p>
            <p className="text-gray-300 leading-relaxed text-lg max-w-2xl mx-auto">
              I'm a high school developer passionate about building AI tools, full-stack applications, and experimental projects. I enjoy exploring LLMs, machine learning, and real-world software problems. Currently a Grade 11 IB student at Cameron Heights Collegiate Institute in Kitchener, Ontario.
            </p>
            {/* Social Links */}
            <div className="flex flex-wrap gap-4 mt-6 justify-center">
              <a href="https://github.com/IshaanD-RX6600" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 text-white rounded-lg hover:bg-gray-600/50 transition-colors">
                <VscGithub size={20} /> GitHub
              </a>
              <a href="https://www.linkedin.com/in/ishaan-d-835a872a4" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-700/50 text-white rounded-lg hover:bg-blue-600/50 transition-colors">
                <FaLinkedin size={20} /> LinkedIn
              </a>
            </div>
          </div>
        </motion.div>

        {/* Technical Skills - Smooth Infinite Marquee */}
        <motion.div className="mt-16 w-full" initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:0.6}}>
          <h3 className="mb-8 text-center text-xl md:text-2xl font-bold text-white">Technical Skills</h3>
          <div className="marquee-container py-4">
            <div className="marquee-content">
              {[...skills, ...skills].map((skill, i) => (
                <span key={i} className="mx-3 px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full text-sm font-medium whitespace-nowrap hover:bg-white/20 hover:border-white/40 transition-all duration-300">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Hackathons Section */}
        <motion.div className="mt-16 w-full max-w-4xl" initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} transition={{duration:0.8,delay:0.2}} viewport={{once:true,amount:0.3}}>
          <h3 className="mb-8 text-center text-xl md:text-2xl font-bold text-white">Hackathons</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
              <p className="text-white font-semibold">Hack Canada 2026</p>
              <p className="text-yellow-400 text-sm">Top 8 Finalist</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
              <p className="text-white font-semibold">NeoDev Developer League</p>
              <p className="text-yellow-400 text-sm">Top 3 — Cash Prize Winner</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
              <p className="text-white font-semibold">Hack the North</p>
              <p className="text-gray-400 text-sm">Canada's Largest Hackathon</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
              <p className="text-white font-semibold">SpurHacks • Ignition Hacks • HawkHacks</p>
              <p className="text-gray-400 text-sm">Participant & Builder</p>
            </div>
          </div>
        </motion.div>

        {/* Experience Section */}
        <motion.div className="mt-16 w-full max-w-4xl" initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} transition={{duration:0.8,delay:0.2}} viewport={{once:true,amount:0.3}}>
          <h3 className="mb-8 text-center text-xl md:text-2xl font-bold text-white">Experience</h3>
          <div className="space-y-4">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 border-l-4 border-l-blue-500">
              <p className="text-white font-semibold">Full-stack Developer & Co-Founder</p>
              <p className="text-blue-400 text-sm">TidalTasks AI • Mar 2025 - Present</p>
              <p className="text-gray-400 text-sm mt-1">Tech startup with 50+ beta testers. Building an innovative productivity app with smart reminders and task management.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 border-l-4 border-l-purple-500">
              <p className="text-white font-semibold">Software Engineer Intern</p>
              <p className="text-purple-400 text-sm">NexGenHealth • Jul - Sep 2025</p>
              <p className="text-gray-400 text-sm mt-1">Built their website from start to finish, handling user data for healthcare solutions.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 border-l-4 border-l-green-500">
              <p className="text-white font-semibold">Academic Writer Intern</p>
              <p className="text-green-400 text-sm">TMAS Academy • Jul - Sep 2025</p>
              <p className="text-gray-400 text-sm mt-1">Creating educational content and academic materials.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 border-l-4 border-l-cyan-500">
              <p className="text-white font-semibold">Certified National Lifeguard & Swim Instructor</p>
              <p className="text-cyan-400 text-sm">City of Kitchener</p>
              <p className="text-gray-400 text-sm mt-1">Taught free swimming lessons to kids as part of instructor certification.</p>
            </div>
          </div>
        </motion.div>

        {/* Volunteer & Activities Section */}
        <motion.div className="mt-16 w-full max-w-4xl" initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} transition={{duration:0.8,delay:0.2}} viewport={{once:true,amount:0.3}}>
          <h3 className="mb-2 text-center text-xl md:text-2xl font-bold text-white">Volunteer & Activities</h3>
          <p className="mb-8 text-center text-purple-400 text-sm font-medium">300+ total volunteer hours</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 border-l-4 border-l-violet-500">
              <p className="text-white font-semibold">Coding Club EXEC & Website Manager</p>
              <p className="text-violet-400 text-sm">Cameron Heights CI</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 border-l-4 border-l-blue-500">
              <p className="text-white font-semibold">STEM Club Volunteer</p>
              <p className="text-blue-400 text-sm">90+ hours</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 border-l-4 border-l-indigo-500">
              <p className="text-white font-semibold">Hack the North Volunteer</p>
              <p className="text-indigo-400 text-sm">19+ hours</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 border-l-4 border-l-purple-500">
              <p className="text-white font-semibold">Yoga Camp Volunteer</p>
              <p className="text-purple-400 text-sm">Brahmrishi Mission • 40+ hours</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 border-l-4 border-l-sky-500">
              <p className="text-white font-semibold">Soccer Coach Volunteer</p>
              <p className="text-sky-400 text-sm">30+ hours coaching youth</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 border-l-4 border-l-cyan-500">
              <p className="text-white font-semibold">BikeCheck Volunteer</p>
              <p className="text-cyan-400 text-sm">City of Kitchener</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 border-l-4 border-l-fuchsia-500">
              <p className="text-white font-semibold">Safe, Caring & Inclusive Committee</p>
              <p className="text-fuchsia-400 text-sm">2021 - 2023</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 border-l-4 border-l-slate-400">
              <p className="text-white font-semibold">South Asian Student Alliance</p>
              <p className="text-slate-400 text-sm">Cameron Heights CI</p>
            </div>
          </div>
        </motion.div>

        {/* Achievements & Projects */}
        <motion.div className="mt-16 w-full max-w-4xl" initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} transition={{duration:0.8,delay:0.2}} viewport={{once:true,amount:0.3}}>
          <h3 className="mb-8 text-center text-xl md:text-2xl font-bold text-white">Achievements & Projects</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 backdrop-blur-sm border border-violet-500/30 rounded-lg p-4">
              <p className="text-white font-semibold">Top 3 in 2025 CCC Junior</p>
              <p className="text-violet-400 text-sm">Canadian Computing Competition</p>
            </div>
            <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4">
              <p className="text-white font-semibold">Canada Youth Changemakers Summit</p>
              <p className="text-blue-400 text-sm">Participant & Presenter</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4">
              <p className="text-white font-semibold">Solo Website Builder</p>
              <p className="text-purple-400 text-sm">Built Student Activity Council website & personal portfolio</p>
            </div>
            <div className="bg-gradient-to-r from-indigo-500/20 to-blue-500/20 backdrop-blur-sm border border-indigo-500/30 rounded-lg p-4">
              <p className="text-white font-semibold">Built Custom PC</p>
              <p className="text-indigo-400 text-sm">Hardware assembly & configuration</p>
            </div>
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4">
              <p className="text-white font-semibold">Smart Home Automation</p>
              <p className="text-cyan-400 text-sm">Automated entire household with Amazon Alexa</p>
            </div>
            <div className="bg-gradient-to-r from-sky-500/20 to-indigo-500/20 backdrop-blur-sm border border-sky-500/30 rounded-lg p-4">
              <p className="text-white font-semibold">Master in Full-Stack Development</p>
              <p className="text-sky-400 text-sm">Self-taught expertise</p>
            </div>
          </div>
        </motion.div>

        {/* Clubs & Sports */}
        <motion.div className="mt-16 w-full max-w-4xl" initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} transition={{duration:0.8,delay:0.2}} viewport={{once:true,amount:0.3}}>
          <h3 className="mb-8 text-center text-xl md:text-2xl font-bold text-white">Clubs & Sports</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: 'Chess Club', color: 'from-indigo-500 to-blue-500' },
              { name: 'Badminton', color: 'from-blue-500 to-cyan-500' },
              { name: 'House League Soccer', color: 'from-violet-500 to-indigo-500' },
              { name: 'STEM Club', color: 'from-purple-500 to-violet-500' },
              { name: 'Coding Club', color: 'from-fuchsia-500 to-purple-500' },
              { name: 'South Asian Student Alliance', color: 'from-sky-500 to-blue-500' }
            ].map((club) => (
              <span key={club.name} className={`px-4 py-2 bg-gradient-to-r ${club.color} text-white rounded-full text-sm font-medium shadow-lg`}>
                {club.name}
              </span>
            ))}
          </div>
        </motion.div>

        <p className="mt-16 text-center text-gray-500 text-lg">Always building something new.</p>
      </div>
      <SimpleDock items={dockItems} />
    </div>
  );
}
