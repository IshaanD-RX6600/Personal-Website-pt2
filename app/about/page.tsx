"use client";

import Lightning from "@/components/Lightning";
import SimpleDock from "@/components/SimpleDock";
import TiltedCard from "@/components/TiltedCard";
import TextType from "@/components/TextType";
import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack";
import Roadmap, { RoadmapItem } from "@/components/Roadmap";
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

        {/* Activities & Achievements Section with ScrollStack */}
        <motion.div 
          className="mt-8 w-full"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div 
            className="mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            <TextType 
              text="Activities & Achievements" 
              className="text-xl md:text-2xl font-bold text-white"
            />
          </motion.div>
          
          <div className="max-w-4xl mx-auto">
            <ScrollStack
              className="activities-scroll-stack"
              itemDistance={50}
              itemScale={0.05}
              itemStackDistance={25}
              stackPosition="15%"
              scaleEndPosition="5%"
              baseScale={0.92}
            >
              <ScrollStackItem>
                <div className="emoji">🔬</div>
                <h3>STEM Club Member</h3>
                <p>Exploring science, technology, engineering, and mathematics through hands-on projects and collaborative learning experiences.</p>
              </ScrollStackItem>

              <ScrollStackItem>
                <div className="emoji">💻</div>
                <h3>Coding Club Member - Website Manager</h3>
                <p>Leading web development initiatives and managing the club's digital presence while mentoring fellow students in programming.</p>
              </ScrollStackItem>

              <ScrollStackItem>
                <div className="emoji">🌍</div>
                <h3>GEOGUESSER Club Member</h3>
                <p>Geography enthusiast and world explorer, developing keen observation skills and cultural awareness through geographical challenges.</p>
              </ScrollStackItem>

              <ScrollStackItem>
                <div className="emoji">🤝</div>
                <h3>South Asian Student Alliance</h3>
                <p>Building community and cultural connections, fostering inclusivity and celebrating diverse backgrounds within our school community.</p>
              </ScrollStackItem>

              <ScrollStackItem>
                <div className="emoji">🛠️</div>
                <h3>Student Tech Support</h3>
                <p>Helping fellow students with technology issues, providing technical assistance and troubleshooting support across campus.</p>
              </ScrollStackItem>

              <ScrollStackItem>
                <div className="emoji">🧮</div>
                <h3>UCMAS Graduate</h3>
                <p>Universal Concept of Mental Arithmetic System graduate, demonstrating advanced mental calculation abilities and mathematical proficiency.</p>
              </ScrollStackItem>

              <ScrollStackItem>
                <div className="emoji">🥋</div>
                <h3>Karate Orange Belt</h3>
                <p>Martial arts practitioner and discipline enthusiast, embodying the values of respect, perseverance, and continuous self-improvement.</p>
              </ScrollStackItem>

              <ScrollStackItem>
                <div className="emoji">🏆</div>
                <h3>Top 3 in 2024 Junior CCC</h3>
                <p>Achieved top three placement in the 2024 Canadian Computing Contest (Junior), demonstrating exceptional problem-solving and algorithmic thinking skills.</p>
              </ScrollStackItem>

              <ScrollStackItem>
                <div className="emoji">🥇</div>
                <h3>Top 3 in 2025 Junior CCC</h3>
                <p>Secured top three placement in the 2025 Canadian Computing Contest (Junior), showcasing consistent excellence in competitive programming and computational thinking.</p>
              </ScrollStackItem>
            </ScrollStack>
          </div>
        </motion.div>

        {/* Aquatic Certifications Section */}
        <motion.div 
          className="mt-16 w-full"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div 
            className="mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            <TextType 
              text="Aquatic Certifications" 
              className="text-xl md:text-2xl font-bold text-white"
            />
          </motion.div>
          
          <div className="max-w-4xl mx-auto">
            <Roadmap className="aquatic-roadmap">
              <RoadmapItem index={0}>
                <div className="emoji">🏅</div>
                <h3>Bronze Medallion (15 hr.)</h3>
                <p>Challenges the candidate both mentally and physically. Judgment, knowledge, skill, and fitness – the four components of water rescue – form the basis of Bronze Medallion training. Acquired the assessment and problem-solving skills needed to make good decisions in, on, and around the water. Serves as a prerequisite for assistant lifeguard training in Bronze Cross.</p>
              </RoadmapItem>

              <RoadmapItem index={1}>
                <div className="emoji">🥉</div>
                <h3>Bronze Cross (20 hr.)</h3>
                <p>Begins the transition from lifesaving to lifeguarding and prepares candidates for responsibilities as assistant lifeguards. Strengthened and expanded lifesaving skills while beginning to apply the principles and techniques of active surveillance in aquatic facilities. Emphasizes the importance of teamwork and communication in preventing and responding to aquatic emergencies.</p>
              </RoadmapItem>

              <RoadmapItem index={2}>
                <div className="emoji">🛟</div>
                <h3>National Lifeguard (40 hr.)</h3>
                <p>National Lifeguard is the standard for professional lifeguards in Canada. Completed 40 hours of intensive training in advanced water rescue, emergency care, teamwork, and supervision. Developed the judgment, knowledge, and skills required to prevent and respond to emergencies in aquatic environments.</p>
              </RoadmapItem>

              <RoadmapItem index={3} isLast={true}>
                <div className="emoji">🏊‍♂️</div>
                <h3>Swim Instructor Certification (20 hr.)</h3>
                <p>Certified Swim Instructor after 20 hours of training. Learned to plan, teach, and evaluate swimming lessons for all ages. Developed skills in communication, demonstration, and feedback to help swimmers progress and achieve their goals in a safe and supportive environment.</p>
              </RoadmapItem>
            </Roadmap>
          </div>
        </motion.div>
      </div>

      {/* Dock Navigation */}
      <SimpleDock items={dockItems} />
    </div>
  );
}