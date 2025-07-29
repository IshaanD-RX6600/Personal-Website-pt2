"use client";

import Lightning from "@/components/Lightning";
import SimpleDock from "@/components/SimpleDock";
import TiltedCard from "@/components/TiltedCard";
import TextType from "@/components/TextType";
import { VscHome, VscArchive, VscAccount, VscSettingsGear, VscCode } from "react-icons/vsc";
import { motion } from "framer-motion";

export default function AboutPage() {
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
    { icon: <VscAccount size={18} />, label: 'About', onClick: () => handleNavigation('/about') },
    { icon: <VscArchive size={18} />, label: 'Resume', onClick: () => alert('Resume!') },
    { icon: <VscSettingsGear size={18} />, label: 'Contact', onClick: () => alert('Contact!') },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Yellow Lightning Background */}
      <div className="absolute inset-0">
        <Lightning
          hue={60} // Yellow hue
          xOffset={0}
          speed={1}
          intensity={1}
          size={1}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center min-h-screen p-8 pt-20 pb-32">
        <motion.h1 
          className="text-5xl md:text-7xl font-bold text-white text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          About Me
        </motion.h1>
        
        {/* Profile Section */}
        <motion.div 
          className="max-w-6xl w-full flex flex-col lg:flex-row items-start lg:items-start gap-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Left Content */}
          <div className="flex-1 lg:pr-8">
            <motion.div 
              className="mb-2"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <TextType 
                text="Hi, I'm Ishaan" 
                className="text-4xl md:text-6xl font-bold text-white"
              />
            </motion.div>
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <TextType 
                text="Dhiman" 
                className="text-4xl md:text-6xl font-bold text-white"
              />
            </motion.div>
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              <TextType 
                text="Grade 11 Student & Developer" 
                className="text-xl md:text-2xl text-gray-300"
              />
            </motion.div>
            
            <motion.div 
              className="text-gray-300 leading-relaxed text-lg"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <TextType 
                text="Hi! I'm Ishaan Dhiman, a 11th grade student passionate about software development and technology. I love creating innovative solutions that make a real impact. I specialize in full-stack development with expertise in modern web technologies. My journey in programming started with curiosity and has grown into a passion for building applications that solve real-world problems."
              />
            </motion.div>
          </div>
          
          {/* Right Profile Image */}
          <motion.div 
            className="w-80 h-80 bg-gray-700/50 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden rounded-2xl flex-shrink-0"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <img
              src="/placeholder-user.jpg"
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<div class="text-white/60 text-sm">Profile Image</div>`;
                }
              }}
            />
          </motion.div>
        </motion.div>

        {/* Tech Stack - Centered below everything */}
        <motion.div 
          className="mt-16 w-full flex flex-col items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <motion.div 
            className="mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
          >
            <TextType 
              text="Technical skills" 
              className="text-xl md:text-2xl font-bold text-white"
            />
          </motion.div>
          <motion.div 
            className="grid grid-cols-4 md:grid-cols-6 gap-6 justify-items-center max-w-4xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.8 }}
          >
            {/* Programming Languages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.0 }}
            >
              <TiltedCard
                imageSrc="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"
                altText="Python"
                captionText="Python"
                containerHeight="80px"
                containerWidth="80px"
                imageHeight="50px"
                imageWidth="50px"
                rotateAmplitude={8}
                scaleOnHover={1.15}
                showMobileWarning={false}
                showTooltip={true}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.1 }}
            >
              <TiltedCard
                imageSrc="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg"
                altText="Java"
                captionText="Java"
                containerHeight="80px"
                containerWidth="80px"
                imageHeight="50px"
                imageWidth="50px"
                rotateAmplitude={8}
                scaleOnHover={1.15}
                showMobileWarning={false}
                showTooltip={true}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.2 }}
            >
              <TiltedCard
                imageSrc="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg"
                altText="C++"
                captionText="C++"
                containerHeight="80px"
                containerWidth="80px"
                imageHeight="50px"
                imageWidth="50px"
                rotateAmplitude={8}
                scaleOnHover={1.15}
                showMobileWarning={false}
                showTooltip={true}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.3 }}
            >
              <TiltedCard
                imageSrc="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg"
                altText="JavaScript"
                captionText="JavaScript"
                containerHeight="80px"
                containerWidth="80px"
                imageHeight="50px"
                imageWidth="50px"
                rotateAmplitude={8}
                scaleOnHover={1.15}
                showMobileWarning={false}
                showTooltip={true}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.4 }}
            >
              <TiltedCard
                imageSrc="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg"
                altText="TypeScript"
                captionText="TypeScript"
                containerHeight="80px"
                containerWidth="80px"
                imageHeight="50px"
                imageWidth="50px"
                rotateAmplitude={8}
                scaleOnHover={1.15}
                showMobileWarning={false}
                showTooltip={true}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.5 }}
            >
              <TiltedCard
                imageSrc="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg"
                altText="Node.js"
                captionText="Node.js"
                containerHeight="80px"
                containerWidth="80px"
                imageHeight="50px"
                imageWidth="50px"
                rotateAmplitude={8}
                scaleOnHover={1.15}
                showMobileWarning={false}
                showTooltip={true}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.6 }}
            >
              <TiltedCard
                imageSrc="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg"
                altText="PyTorch"
                captionText="PyTorch"
                containerHeight="80px"
                containerWidth="80px"
                imageHeight="50px"
                imageWidth="50px"
                rotateAmplitude={8}
                scaleOnHover={1.15}
                showMobileWarning={false}
                showTooltip={true}
              />
            </motion.div>

            {/* Frontend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.7 }}
            >
              <TiltedCard
                imageSrc="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
                altText="React"
                captionText="React"
                containerHeight="80px"
                containerWidth="80px"
                imageHeight="50px"
                imageWidth="50px"
                rotateAmplitude={8}
                scaleOnHover={1.15}
                showMobileWarning={false}
                showTooltip={true}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.8 }}
            >
              <TiltedCard
                imageSrc="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg"
                altText="Next.js"
                captionText="Next.js"
                containerHeight="80px"
                containerWidth="80px"
                imageHeight="50px"
                imageWidth="50px"
                rotateAmplitude={8}
                scaleOnHover={1.15}
                showMobileWarning={false}
                showTooltip={true}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.9 }}
            >
              <TiltedCard
                imageSrc="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg"
                altText="HTML5"
                captionText="HTML5"
                containerHeight="80px"
                containerWidth="80px"
                imageHeight="50px"
                imageWidth="50px"
                rotateAmplitude={8}
                scaleOnHover={1.15}
                showMobileWarning={false}
                showTooltip={true}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 3.0 }}
            >
              <TiltedCard
                imageSrc="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg"
                altText="CSS3"
                captionText="CSS3"
                containerHeight="80px"
                containerWidth="80px"
                imageHeight="50px"
                imageWidth="50px"
                rotateAmplitude={8}
                scaleOnHover={1.15}
                showMobileWarning={false}
                showTooltip={true}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 3.1 }}
            >
              <TiltedCard
                imageSrc="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg"
                altText="Tailwind CSS"
                captionText="Tailwind CSS"
                containerHeight="80px"
                containerWidth="80px"
                imageHeight="50px"
                imageWidth="50px"
                rotateAmplitude={8}
                scaleOnHover={1.15}
                showMobileWarning={false}
                showTooltip={true}
              />
            </motion.div>

            {/* Backend & Databases */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 3.2 }}
            >
              <TiltedCard
                imageSrc="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg"
                altText="MongoDB"
                captionText="MongoDB"
                containerHeight="80px"
                containerWidth="80px"
                imageHeight="50px"
                imageWidth="50px"
                rotateAmplitude={8}
                scaleOnHover={1.15}
                showMobileWarning={false}
                showTooltip={true}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 3.3 }}
            >
              <TiltedCard
                imageSrc="https://imgs.search.brave.com/FRH8SQSrPxi6Rc03hz1fTmEdKtfrTmdpmli2CaDJQOo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hLnN0/b3J5Ymxvay5jb20v/Zi8xOTE0NjYvMTQ2/eDE1MC82Yzg0NmMy/MzBkL3RlY2hub2xv/Z3ktc3VwYWJhc2Uu/c3Zn"
                altText="Supabase"
                captionText="Supabase"
                containerHeight="80px"
                containerWidth="80px"
                imageHeight="50px"
                imageWidth="50px"
                rotateAmplitude={8}
                scaleOnHover={1.15}
                showMobileWarning={false}
                showTooltip={true}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 3.4 }}
            >
              <TiltedCard
                imageSrc="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg"
                altText="Firebase"
                captionText="Firebase"
                containerHeight="80px"
                containerWidth="80px"
                imageHeight="50px"
                imageWidth="50px"
                rotateAmplitude={8}
                scaleOnHover={1.15}
                showMobileWarning={false}
                showTooltip={true}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 3.5 }}
            >
              <TiltedCard
                imageSrc="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vercel/vercel-original.svg"
                altText="Vercel"
                captionText="Vercel"
                containerHeight="80px"
                containerWidth="80px"
                imageHeight="50px"
                imageWidth="50px"
                rotateAmplitude={8}
                scaleOnHover={1.15}
                showMobileWarning={false}
                showTooltip={true}
              />
            </motion.div>

            {/* Version Control & Tools */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 3.6 }}
            >
              <TiltedCard
                imageSrc="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg"
                altText="Git"
                captionText="Git"
                containerHeight="80px"
                containerWidth="80px"
                imageHeight="50px"
                imageWidth="50px"
                rotateAmplitude={8}
                scaleOnHover={1.15}
                showMobileWarning={false}
                showTooltip={true}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 3.7 }}
            >
              <TiltedCard
                imageSrc="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
                altText="GitHub"
                captionText="GitHub"
                containerHeight="80px"
                containerWidth="80px"
                imageHeight="50px"
                imageWidth="50px"
                rotateAmplitude={8}
                scaleOnHover={1.15}
                showMobileWarning={false}
                showTooltip={true}
                imageClassName="filter invert"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Dock Navigation */}
      <SimpleDock items={dockItems} />
    </div>
  );
}