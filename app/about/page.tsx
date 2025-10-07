"use client";
import Lightning from "@/components/Lightning";
import SimpleDock from "@/components/SimpleDock";
import TiltedCard from "@/components/TiltedCard";
import TextType from "@/components/TextType";
import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack";
import Roadmap, { RoadmapItem } from "@/components/Roadmap";
import { VscHome, VscArchive, VscAccount, VscSettingsGear, VscCode } from "react-icons/vsc";
import { motion } from "framer-motion"; // keep for now; consider removing if build still errors

export default function AboutPage() {
  const handleNavigation = (path: string) => { try { window.location.href = path; } catch { window.location.assign(path); } };
  const dockItems = [
    { icon: <VscHome size={18} />, label: 'Home', onClick: () => handleNavigation('/') },
  { icon: <VscCode size={18} />, label: 'Projects', onClick: () => handleNavigation('/projects') },
    { icon: <VscAccount size={18} />, label: 'About', onClick: () => handleNavigation('/about') },
    { icon: <VscArchive size={18} />, label: 'Resume', onClick: () => alert('Resume!') },
    { icon: <VscSettingsGear size={18} />, label: 'Contact', onClick: () => alert('Contact!') },
  ];
  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0"><Lightning hue={60} xOffset={0} speed={1} intensity={1} size={1} /></div>
      <div className="relative z-10 flex flex-col items-center min-h-screen p-8 pt-20 pb-32">
        <motion.h1 className="text-5xl md:text-7xl font-bold text-white text-center mb-12" initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:0.2}}>About Me</motion.h1>
        <motion.div className="max-w-6xl w-full flex flex-col lg:flex-row items-start gap-12" initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:0.4}}>
          <div className="flex-1 lg:pr-8">
            <motion.div className="mb-2" initial={{opacity:0,x:-30}} animate={{opacity:1,x:0}} transition={{duration:0.8,delay:0.6}}><TextType text="Hi, I'm Ishaan" className="text-4xl md:text-6xl font-bold text-white"/></motion.div>
            <motion.div className="mb-6" initial={{opacity:0,x:-30}} animate={{opacity:1,x:0}} transition={{duration:0.8,delay:0.8}}><TextType text="Dhiman" className="text-4xl md:text-6xl font-bold text-white"/></motion.div>
            <motion.div className="mb-8" initial={{opacity:0,x:-30}} animate={{opacity:1,x:0}} transition={{duration:0.8,delay:1.0}}><TextType text="Grade 11 Student & Developer" className="text-xl md:text-2xl text-gray-300"/></motion.div>
            <motion.div className="text-gray-300 leading-relaxed text-lg" initial={{opacity:0,x:-30}} animate={{opacity:1,x:0}} transition={{duration:0.8,delay:1.2}}>
              <TextType text="Hi! I'm Ishaan Dhiman, a 11th grade student passionate about software development and technology. I love creating innovative solutions that make a real impact. I specialize in full-stack development with expertise in modern web technologies. My journey in programming started with curiosity and has grown into a passion for building applications that solve real-world problems." />
            </motion.div>
          </div>
          <motion.div className="w-80 h-80 bg-gray-700/50 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden rounded-2xl flex-shrink-0" initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} transition={{duration:0.8,delay:0.6}}>
            <img src="/placeholder-user.jpg" alt="Profile" className="w-full h-full object-cover" onError={(e)=>{const t=e.target as HTMLImageElement; t.style.display='none'; const p=t.parentElement; if(p) p.innerHTML='<div class=\"text-white/60 text-sm\">Profile Image</div>';}} />
          </motion.div>
        </motion.div>
        <motion.div className="mt-16 w-full flex flex-col items-center" initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:1.4}}>
          <motion.div className="mb-8 text-center" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:1.6}}><TextType text="Technical skills" className="text-xl md:text-2xl font-bold text-white"/></motion.div>
          <motion.div className="grid grid-cols-4 md:grid-cols-6 gap-6 justify-items-center max-w-4xl" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:1,delay:1.8}}>
            {['python','java','cplusplus','javascript','typescript','nodejs','pytorch','react','nextjs','html5','css3','tailwindcss','mongodb','firebase','vercel','git','github'].map((name,i)=> (
              <motion.div key={name} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:2.0+i*0.1}}>
                <TiltedCard imageSrc={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${name}/${name}-original.svg`} altText={name} captionText={name.replace(/^[a-z]/,c=>c.toUpperCase())} containerHeight="80px" containerWidth="80px" imageHeight="50px" imageWidth="50px" rotateAmplitude={8} scaleOnHover={1.15} showMobileWarning={false} showTooltip={true} imageClassName={name==='github'?'filter invert':undefined} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        <motion.div className="mt-8 w-full" initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} transition={{duration:0.8,delay:0.2}} viewport={{once:true,amount:0.3}}>
          <motion.div className="mb-8 text-center" initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} transition={{duration:0.8,delay:0.4}} viewport={{once:true,amount:0.5}}><TextType text="Activities & Achievements" className="text-xl md:text-2xl font-bold text-white"/></motion.div>
          <div className="max-w-4xl mx-auto">
            <ScrollStack className="activities-scroll-stack" itemDistance={50} itemScale={0.05} itemStackDistance={25} stackPosition="15%" scaleEndPosition="5%" baseScale={0.92}>
              {[
                ['🔬','STEM Club Member','Exploring science, technology, engineering, and mathematics through hands-on projects and collaborative learning experiences.'],
                ['💻','Coding Club Member - Website Manager','Leading web development initiatives and managing the club\'s digital presence while mentoring fellow students in programming.'],
                ['🌍','GEOGUESSER Club Member','Geography enthusiast and world explorer, developing keen observation skills and cultural awareness through geographical challenges.'],
                ['🤝','South Asian Student Alliance','Building community and cultural connections, fostering inclusivity and celebrating diverse backgrounds within our school community.'],
                ['🛠️','Student Tech Support','Helping fellow students with technology issues, providing technical assistance and troubleshooting support across campus.'],
                ['🧮','UCMAS Graduate','Universal Concept of Mental Arithmetic System graduate, demonstrating advanced mental calculation abilities and mathematical proficiency.'],
                ['🥋','Karate Orange Belt','Martial arts practitioner and discipline enthusiast, embodying the values of respect, perseverance, and continuous self-improvement.'],
                ['🏆','Top 3 in 2024 Junior CCC','Achieved top three placement in the 2024 Canadian Computing Contest (Junior).'],
                ['🥇','Top 3 in 2025 Junior CCC','Secured top three placement in the 2025 Canadian Computing Contest (Junior).'],
              ].map(([e,t,d])=> (
                <ScrollStackItem key={t as string}><div className="emoji">{e}</div><h3>{t}</h3><p>{d}</p></ScrollStackItem>
              ))}
            </ScrollStack>
          </div>
        </motion.div>
        <motion.div className="mt-16 w-full" initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} transition={{duration:0.8,delay:0.2}} viewport={{once:true,amount:0.3}}>
          <motion.div className="mb-8 text-center" initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} transition={{duration:0.8,delay:0.4}} viewport={{once:true,amount:0.5}}><TextType text="Aquatic Certifications" className="text-xl md:text-2xl font-bold text-white"/></motion.div>
          <div className="max-w-4xl mx-auto">
            <Roadmap className="aquatic-roadmap">
              <RoadmapItem index={0}><div className="emoji">🏅</div><h3>Bronze Medallion (15 hr.)</h3><p>Challenges the candidate both mentally and physically and forms the foundation of lifesaving training.</p></RoadmapItem>
              <RoadmapItem index={1}><div className="emoji">🥉</div><h3>Bronze Cross (20 hr.)</h3><p>Transitions from lifesaving to lifeguarding while emphasizing teamwork, judgment, and expanded rescue skills.</p></RoadmapItem>
              <RoadmapItem index={2}><div className="emoji">🛟</div><h3>National Lifeguard (40 hr.)</h3><p>Professional lifeguard standard focusing on advanced rescue, emergency care, supervision, and prevention.</p></RoadmapItem>
              <RoadmapItem index={3} isLast><div className="emoji">🏊‍♂️</div><h3>Swim Instructor Certification (20 hr.)</h3><p>Qualified to plan, teach, and evaluate swim lessons with strong communication and feedback skills.</p></RoadmapItem>
            </Roadmap>
          </div>
        </motion.div>

  {/* Blog section removed per request */}

      </div>
      <SimpleDock items={dockItems} />
    </div>
  );
}
