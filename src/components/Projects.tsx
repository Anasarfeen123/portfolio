import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { ArrowRight, ExternalLink, SquareCode, X } from 'lucide-react';
import './Projects.css';

interface Project {
  title: string;
  technologies: string[];
  description: string[];
}

interface ProjectsProps {
  projects: Project[];
}

const projectMeta: Record<string, {
  icon: string;
  category: string;
  accent: string;
  metric: string;
  metricLabel: string;
  outcome: string;
}> = {
  'Autonomous Warehouse Rover': {
    icon: 'RL',
    category: 'Reinforcement Learning',
    accent: '#a6e22e',
    metric: 'PPO',
    metricLabel: 'Policy optimizer',
    outcome: 'Navigation agent trained through progressively harder simulated layouts.',
  },
  MusicalTerm: {
    icon: 'CLI',
    category: 'Developer Tooling',
    accent: '#66d9ef',
    metric: 'TUI',
    metricLabel: 'Terminal-first UX',
    outcome: 'A focused music player experience for command-line workflows.',
  },
  'Campus Signal Mapper': {
    icon: 'MAP',
    category: 'Data Visualization',
    accent: '#fd971f',
    metric: 'Live',
    metricLabel: 'Crowd data',
    outcome: 'Interactive campus heatmaps built from submitted carrier signal readings.',
  },
  'Celeb Classifier': {
    icon: 'CV',
    category: 'Computer Vision',
    accent: '#e7bc91',
    metric: 'ResNet50',
    metricLabel: 'Vision backbone',
    outcome: 'Similarity matching pipeline wrapped in an AI-powered web application.',
  },
  'Snake - AI Edition': {
    icon: 'A*',
    category: 'Search Algorithms',
    accent: '#9cdcfe',
    metric: 'A*',
    metricLabel: 'Path planning',
    outcome: 'Classic arcade logic rebuilt with automated real-time decision making.',
  },
};

const getProjectMeta = (title: string) => projectMeta[title] ?? {
  icon: '{}',
  category: 'Software Project',
  accent: '#e7bc91',
  metric: 'Build',
  metricLabel: 'Prototype',
  outcome: 'A focused technical build with practical implementation details.',
};

const ProjectModal: React.FC<{ project: Project; onClose: () => void }> = ({ project, onClose }) => {
  const meta = getProjectMeta(project.title);

  return createPortal(
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
        <button className="modal-close" onClick={onClose} aria-label="Close project details">
          <X size={20} strokeWidth={2.4} />
        </button>
        <div className="modal-inner">
          <div className="modal-header">
            <span className="modal-icon mono" style={{ '--project-accent': meta.accent } as React.CSSProperties}>
              {meta.icon}
            </span>
            <div className="modal-title-wrap">
              <span className="modal-kicker mono">{meta.category}</span>
              <h3 className="modal-title">{project.title}</h3>
              <p className="modal-outcome">{meta.outcome}</p>
            </div>
          </div>
          
          <div className="modal-body">
            <div className="project-showcase" style={{ '--project-accent': meta.accent } as React.CSSProperties}>
              <div className="showcase-topline">
                <span className="mono">SELECTED BUILD</span>
                <span className="showcase-status mono">active</span>
              </div>
              <div className="showcase-orbit" aria-hidden>
                <span />
                <span />
                <span />
              </div>
              <div className="showcase-core">
                <span className="showcase-icon mono">{meta.icon}</span>
                <div>
                  <strong>{meta.metric}</strong>
                  <span>{meta.metricLabel}</span>
                </div>
              </div>
              <div className="showcase-stack">
                {project.technologies.map((tech) => (
                  <span key={tech} className="modal-tech-tag mono">{tech}</span>
                ))}
              </div>
            </div>
            
            <div className="modal-details">
              <span className="detail-label mono">Overview</span>
              <p>{project.description.join(' ')}</p>
              
              <span className="detail-label mono">What it does</span>
              <ul className="modal-feature-list">
                {project.description.map((desc, i) => (
                  <li key={i}>{desc}</li>
                ))}
              </ul>
              
              <div className="modal-actions">
                <a
                  href="https://github.com/Anasarfeen123?tab=repositories"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-btn primary"
                >
                  <SquareCode size={17} />
                  Repositories
                </a>
                <a
                  href="mailto:codecrusader07@gmail.com"
                  className="modal-btn secondary"
                >
                  <ExternalLink size={17} />
                  Discuss project
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

const ProjectCard: React.FC<{ project: Project; onClick: () => void }> = ({ project, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const meta = getProjectMeta(project.title);

  return (
    <motion.div
      className="project-card"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      <div className="project-card-glow" style={{ '--project-accent': meta.accent } as React.CSSProperties} />
      <div className="project-content">
        <div className="project-header-row">
          <span className="project-icon mono" style={{ '--project-accent': meta.accent } as React.CSSProperties}>
            {meta.icon}
          </span>
          <div className="project-tags">
            {project.technologies.slice(0, 3).map((tech) => (
              <span key={tech} className="tech-tag mono">{tech}</span>
            ))}
          </div>
        </div>
        <span className="project-category mono">{meta.category}</span>
        <h3 className="project-title">{project.title}</h3>
        <ul className="project-desc">
          {project.description.slice(0, 2).map((desc, i) => (
            <li key={i} className="line-clamp-2">{desc}</li>
          ))}
        </ul>
        <div className="project-footer">
          <motion.span
            className="mono link-effect"
            animate={{ x: hovered ? 8 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            EXPLORE <ArrowRight size={15} />
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
};

const Projects: React.FC<ProjectsProps> = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (!selectedProject) return;

    const scrollY = window.scrollY;
    const previous = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.body.style.overflow = previous.overflow;
      document.body.style.position = previous.position;
      document.body.style.top = previous.top;
      document.body.style.width = previous.width;
      window.scrollTo(0, scrollY);
    };
  }, [selectedProject]);

  useEffect(() => {
    if (!selectedProject) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedProject(null);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selectedProject]);

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
