import React from 'react';
import { motion, type Variants } from 'framer-motion';
import type { ExperienceItem } from '../types';
import './Experience.css';

interface ExperienceProps {
  experience: ExperienceItem[];
}

const Experience: React.FC<ExperienceProps> = ({ experience }) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.2 } 
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    },
  };

  return (
    <section id="experience" className="experience">
      <div className="container">
        <h2 className="section-title">Leadership & Experience</h2>
        <motion.div 
          className="timeline"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {experience.map((item, index) => (
            <motion.div 
              key={index} 
              className="timeline-item"
              variants={itemVariants}
            >
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <h3 className="role">{item.role}</h3>
                  <span className="duration mono">{item.duration}</span>
                </div>
                <h4 className="organization">{item.organization}</h4>
                <ul className="description">
                  {item.description.map((desc: string, i: number) => (
                    <li key={i}>{desc}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Experience;
