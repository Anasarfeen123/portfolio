import React, { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import './Projects.css';

interface ProjectsProps {
  projects: any[];
}

const projectIcons: Record<string, string> = {
  'Autonomous Warehouse Rover': '🤖',
  'MusicalTerm': '🎵',
  'Campus Signal Mapper': '📡',
  'Celeb Classifier': '👤',
  'Snake - AI Edition': '🐍',
};

const ProjectModal: React.FC<{ project: any; onClose: () => void }> = ({ project, onClose }) => {
  return (
    <motion.div
      className="project-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="project-modal-content"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-inner">
          <div className="modal-header">
            <span className="modal-icon">{projectIcons[project.title] ?? '🚀'}</span>
            <div className="modal-title-wrap">
              <h3 className="modal-title">{project.title}</h3>
              <div className="modal-tags">
                {project.technologies.map((tech: string) => (
                  <span key={tech} className="modal-tech-tag mono">{tech}</span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="modal-body">
            <div className="modal-image-placeholder">
              <span className="mono">PROJECT PREVIEW</span>
              <p className="image-hint">Visual showcase coming soon</p>
            </div>
            
            <div className="modal-details">
              <h4>Overview</h4>
              <p>{project.description.join(' ')}</p>
              
              <h4>Key Features</h4>
              <ul className="modal-feature-list">
                {project.description.map((desc: string, i: number) => (
                  <li key={i}>{desc}</li>
                ))}
              </ul>
              
              <div className="modal-actions">
                <a href="#" className="modal-btn primary" onClick={(e) => e.preventDefault()}>
                  View Source Code
                </a>
                <a href="#" className="modal-btn secondary" onClick={(e) => e.preventDefault()}>
                  Live Demo
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ProjectCard: React.FC<{ project: any; index: number; onClick: () => void }> = ({ project, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="project-card"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      <div className="project-content">
        <div className="project-header-row">
          <span className="project-icon">{projectIcons[project.title] ?? '🚀'}</span>
          <div className="project-tags">
            {project.technologies.slice(0, 3).map((tech: string) => (
              <span key={tech} className="tech-tag mono">{tech}</span>
            ))}
          </div>
        </div>
        <h3 className="project-title">{project.title}</h3>
        <ul className="project-desc">
          {project.description.slice(0, 2).map((desc: string, i: number) => (
            <li key={i} className="line-clamp-2">{desc}</li>
          ))}
        </ul>
        <div className="project-footer">
          <motion.span
            className="mono link-effect"
            animate={{ x: hovered ? 8 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            EXPLORE →
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
};

const Projects: React.FC<ProjectsProps> = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };
  const itemVariants: Variants = {
    hidden: { y: 25, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 15 } },
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
          viewport={{ once: true, amount: 0.15 }}
        >
          {projects.map((project, index) => (
            <motion.div key={index} variants={itemVariants}>
              <ProjectCard 
                project={project} 
                index={index} 
                onClick={() => setSelectedProject(project)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal 
            project={selectedProject} 
            onClose={() => setSelectedProject(null)} 
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default Projects;
