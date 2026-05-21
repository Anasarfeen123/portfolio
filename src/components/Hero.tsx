import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal as TerminalIcon, Coffee, Zap, Star } from 'lucide-react';
import './Hero.css';
import CoffeeLiquid from './CoffeeLiquid';

interface HeroProps {
  onTerminalOpen?: () => void;
}

const TypewriterSubtitle: React.FC = () => {
  const lines = [
    'AI/ML Engineer & Systems Programmer',
    'Building intelligent RL environments',
    'Arch Linux enjoyer & coffee addict',
    'Turning caffeine into clean code',
  ];
  const [lineIndex, setLineIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = lines[lineIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && displayed.length < current.length) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 45);
    } else if (!deleting && displayed.length === current.length) {
      timeout = setTimeout(() => setDeleting(true), 2200);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 22);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setLineIndex((prev) => (prev + 1) % lines.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, lineIndex, lines]);

  return (
    <p className="hero-subtitle typewriter">
      {displayed}
      <span className="type-cursor">|</span>
    </p>
  );
};

const StatusPanel: React.FC<{ onTerminalOpen?: () => void }> = ({ onTerminalOpen }) => {
  const [statusIndex, setStatusIndex] = useState(0);
  const statusLines = [
    { label: 'OS', value: 'Arch Linux x86_64', color: '#66d9ef' },
    { label: 'Shell', value: 'zsh + oh-my-zsh', color: '#a6e22e' },
    { label: 'Coffee', value: 'Double Espresso ☕', color: '#e7bc91' },
    { label: 'Music', value: 'lo-fi hip hop 🎵', color: '#fd971f' },
    { label: 'Status', value: 'Training agents...', color: '#a6e22e' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStatusIndex((prev) => {
        if (prev < statusLines.length) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 350);
    return () => clearInterval(timer);
  }, [statusLines.length]);

  return (
    <motion.div
      className="hero-status-window mono"
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.3 }}
    >
      <div className="status-header">
        <div className="status-dot" style={{ backgroundColor: '#ff5f56' }} />
        <div className="status-dot" style={{ backgroundColor: '#ffbd2e' }} />
        <div className="status-dot" style={{ backgroundColor: '#27c93f' }} />
        <span className="status-title">anas@portfolio — neofetch</span>
      </div>

      <div className="status-body">
        {statusLines.map((line, i) => (
          <motion.div
            key={i}
            className="status-line"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: i < statusIndex ? 1 : 0, x: i < statusIndex ? 0 : -10 }}
            transition={{ duration: 0.2 }}
          >
            <span className="status-label" style={{ color: line.color }}>{line.label}</span>
            <span className="status-sep">:</span>
            <span className="status-value">{line.value}</span>
          </motion.div>
        ))}
        {statusIndex < statusLines.length && (
          <div className="status-line">
            <span className="status-label" style={{ color: statusLines[statusIndex]?.color }}>
              {statusLines[statusIndex]?.label}
            </span>
            <span className="status-sep">:</span>
            <span className="typing-cursor-block" />
          </div>
        )}
      </div>

      <div className="status-footer">
        <Zap size={14} />
        <Coffee size={14} />
        <Star size={14} />
        <span
          className="term-launch-hint"
          onClick={onTerminalOpen}
          style={{ marginLeft: 'auto', cursor: 'pointer', fontSize: '0.7rem', opacity: 0.6 }}
        >
          ▶ launch cli
        </span>
      </div>
    </motion.div>
  );
};

const ScrollIndicator: React.FC = () => (
  <motion.div
    className="scroll-indicator"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 2 }}
  >
    <motion.div
      className="scroll-chevron"
      animate={{ y: [0, 8, 0] }}
      transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
    >
      ↓
    </motion.div>
    <span className="mono" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '2px' }}>scroll</span>
  </motion.div>
);

const Hero: React.FC<HeroProps> = ({ onTerminalOpen }) => {
  return (
    <section id="hero" className="hero">
      <div className="hero-visual" aria-hidden="true">
        <CoffeeLiquid />
      </div>

      <div className="container hero-content">
        <motion.div
          className="hero-text"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="hero-badge mono"
            animate={{ boxShadow: ['0 0 0px rgba(231,188,145,0)', '0 0 18px rgba(231,188,145,0.4)', '0 0 0px rgba(231,188,145,0)'] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          >
            <span className="pulse" />
            Open to new projects
          </motion.div>

          <div className="hero-name-block">
            <motion.h1
              className="hero-title glitch-text"
              data-text="Anas Arfeen"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Anas Arfeen
            </motion.h1>
            <div className="hero-rank mono">
              <span className="rank-badge">AI/ML Co-Lead</span>
              <span className="rank-sep">·</span>
              <span className="rank-sub">VIT Chennai</span>
            </div>
          </div>

          <TypewriterSubtitle />

          <div className="hero-stats mono">
            {[
              { value: '5+', label: 'Projects' },
              { value: '3+', label: 'Leadership roles' },
              { value: '∞', label: 'Coffee cups' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="hero-stat"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                whileHover={{ scale: 1.08 }}
              >
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </motion.div>
            ))}
          </div>

          <div className="hero-cta">
            <motion.button
              onClick={onTerminalOpen}
              className="btn primary flex-center gap-2"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <TerminalIcon size={16} /> Launch CLI
            </motion.button>
            <motion.a
              href="#projects"
              className="btn secondary"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              View Work →
            </motion.a>
          </div>
        </motion.div>

        <StatusPanel onTerminalOpen={onTerminalOpen} />
      </div>

      <ScrollIndicator />
    </section>
  );
};

export default Hero;
