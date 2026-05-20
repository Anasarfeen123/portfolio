import React from 'react';
import { motion, type Variants } from 'framer-motion';
import './Projects.css';

interface ProjectsProps {
  projects: any[];
}

const Projects: React.FC<ProjectsProps> = ({ projects }) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', damping: 15 }
    }
  };

  return (
    <section id="projects" className="projects">
      <div className="container">
        <h2 className="section-title">Selected Projects</h2>
        <motion.div 
          className="projects-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {projects.map((project, index) => (
            <motion.div 
              key={index} 
              className="project-card"
              variants={itemVariants}
              whileHover={{ 
                y: -10,
                transition: { duration: 0.3 }
              }}
            >
              <div className="project-content">
                <div className="project-tags">
                  {project.technologies.map((tech: string) => (
                    <span key={tech} className="tech-tag mono">{tech}</span>
                  ))}
                </div>
                <h3 className="project-title">{project.title}</h3>
                <ul className="project-desc">
                  {project.description.map((desc: string, i: number) => (
                    <li key={i}>{desc}</li>
                  ))}
                </ul>
                <div className="project-footer">
                  <motion.span 
                    className="mono link-effect"
                    whileHover={{ x: 10 }}
                  >
                    EXPLORE &gt;
                  </motion.span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
