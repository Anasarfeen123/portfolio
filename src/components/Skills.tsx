import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Skills.css';

interface SkillsProps {
  skills: {
    languages: string[];
    ai_ml: string[];
    tools: string[];
    competencies: string[];
  };
}

const levelMap: Record<string, string> = {
  'Python': 'S', 'C++': 'S', 'PyTorch': 'A', 'Reinforcement Learning': 'S',
  'PPO': 'A', 'SAC': 'A', 'ResNet50': 'B', 'Linux (Arch)': 'A',
  'Neovim': 'B', 'C#': 'B', 'GDScript': 'C', 'NumPy': 'A',
};

const levelColors: Record<string, string> = {
  S: '#e7bc91', A: '#a6e22e', B: '#66d9ef', C: 'rgba(245,235,224,0.5)'
};

const SkillTag: React.FC<{ skill: string; revealed: boolean; onReveal: () => void }> = ({ skill, revealed, onReveal }) => {
  const level = levelMap[skill];
  const levelColor = level ? levelColors[level] : levelColors['C'];

  const handleClick = () => {
    if (!revealed) {
      onReveal();
    }
  };

  return (
    <motion.span
      className={`tag skill-tag-gamified ${revealed ? 'revealed' : 'locked'}`}
      onClick={handleClick}
      whileHover={{ scale: revealed ? 1.08 : 1.04, y: -3 }}
      whileTap={{ scale: 0.96 }}
      style={{ cursor: revealed ? 'default' : 'pointer' }}
      title={revealed ? undefined : 'Click to reveal'}
    >
      {!revealed && <span className="lock-icon">🔒</span>}
      {revealed && level && (
        <span className="skill-level-badge" style={{ color: levelColor, borderColor: levelColor }}>
          {level}
        </span>
      )}
      <span className={revealed ? '' : 'blurred-text'}>{skill}</span>
    </motion.span>
  );
};

const SkillCategory: React.FC<{ title: string; skills: string[] }> = ({ title, skills }) => {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const allRevealed = revealed.size === skills.length;

  const revealAll = () => {
    const newSet = new Set(skills.map((_, i) => i));
    setRevealed(newSet);
  };

  return (
    <motion.div
      className="skill-category"
      whileHover={{ transform: 'translateY(-5px)' }}
    >
      <div className="skill-cat-header">
        <h3 className="mono">{title}</h3>
        <div className="skill-cat-meta mono">
          <span className="skill-progress">{revealed.size}/{skills.length}</span>
          {!allRevealed && (
            <motion.button
              className="reveal-all-btn"
              onClick={revealAll}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Reveal All
            </motion.button>
          )}
          {allRevealed && <span className="all-revealed">✓ Mastered</span>}
        </div>
      </div>
      <div className="skill-tags">
        {skills.map((s, i) => (
          <SkillTag
            key={s}
            skill={s}
            revealed={revealed.has(i)}
            onReveal={() => setRevealed((prev) => new Set([...prev, i]))}
          />
        ))}
      </div>
    </motion.div>
  );
};

const Skills: React.FC<SkillsProps> = ({ skills }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };
  const itemVariants = {
    hidden: { scale: 0.85, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: 'spring' as const, stiffness: 100 } },
  };

  return (
    <section id="skills" className="skills coffee-gradient">
      <div className="container">
        <h2 className="section-title" style={{ color: 'var(--latte-light)' }}>
          Technical Arsenal
        </h2>
        <p className="skills-hint mono">Click any hidden skill to reveal it</p>
        <motion.div
          className="skills-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants}>
            <SkillCategory title="Languages" skills={skills.languages} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <SkillCategory title="AI & Machine Learning" skills={skills.ai_ml} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <SkillCategory title="Tools & Platforms" skills={skills.tools} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <SkillCategory title="Core Competencies" skills={skills.competencies} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
