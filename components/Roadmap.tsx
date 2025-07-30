"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import "./Roadmap.css";

interface RoadmapItemProps {
  children: ReactNode;
  index: number;
  isLast?: boolean;
}

export const RoadmapItem = ({ children, index, isLast = false }: RoadmapItemProps) => {
  return (
    <motion.div 
      className="roadmap-item"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="roadmap-content">
        <div className="roadmap-node">
          <div className="roadmap-circle" />
        </div>
        <div className="roadmap-card">
          {children}
        </div>
      </div>
      {!isLast && <div className="roadmap-line" />}
    </motion.div>
  );
};

interface RoadmapProps {
  children: ReactNode;
  className?: string;
}

const Roadmap = ({ children, className = "" }: RoadmapProps) => {
  return (
    <div className={`roadmap-container ${className}`.trim()}>
      {children}
    </div>
  );
};

export default Roadmap;
