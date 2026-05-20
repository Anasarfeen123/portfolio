import React from 'react';
import { motion, type Variants } from 'framer-motion';
import './Skills.css';

interface SkillsProps {
  skills: {
    languages: string[];
    ai_ml: string[];
    tools: string[];
    competencies: string[];
  };
}

const Skills: React.FC<SkillsProps> = ({ skills }) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <section id="skills" className="skills coffee-gradient">
      <div className="container">
        <h2 className="section-title" style={{color: 'var(--latte-light)'}}>Technical Arsenal</h2>
        <motion.div 
          className="skills-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div className="skill-category" variants={itemVariants}>
            <h3 className="mono">Languages</h3>
            <div className="skill-tags">
              {skills.languages.map(s => (
                <motion.span 
                  key={s} 
                  className="tag"
                  whileHover={{ scale: 1.1, y: -5 }}
                >
                  {s}
                </motion.span>
              ))}
            </div>
          </motion.div>
          <motion.div className="skill-category" variants={itemVariants}>
            <h3 className="mono">AI & Machine Learning</h3>
            <div className="skill-tags">
              {skills.ai_ml.map(s => (
                <motion.span 
                  key={s} 
                  className="tag"
                  whileHover={{ scale: 1.1, y: -5 }}
                >
                  {s}
                </motion.span>
              ))}
            </div>
          </motion.div>
          <motion.div className="skill-category" variants={itemVariants}>
            <h3 className="mono">Tools & Platforms</h3>
            <div className="skill-tags">
              {skills.tools.map(s => (
                <motion.span 
                  key={s} 
                  className="tag"
                  whileHover={{ scale: 1.1, y: -5 }}
                >
                  {s}
                </motion.span>
              ))}
            </div>
          </motion.div>
          <motion.div className="skill-category" variants={itemVariants}>
            <h3 className="mono">Core Competencies</h3>
            <div className="skill-tags">
              {skills.competencies.map(s => (
                <motion.span 
                  key={s} 
                  className="tag"
                  whileHover={{ scale: 1.1, y: -5 }}
                >
                  {s}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
