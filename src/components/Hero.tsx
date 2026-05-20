import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal as TerminalIcon, Coffee, Cpu, Code, Play } from 'lucide-react';
import './Hero.css';
import Scene3D from './Scene3D';

interface HeroProps {
  onTerminalOpen?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onTerminalOpen }) => {
  const [statusIndex, setStatusIndex] = useState(0);
  const statusLines = [
    { label: 'System', value: 'Arch Linux x86_64' },
    { label: 'Kernel', value: '6.8.9-zen' },
    { label: 'Uptime', value: '100%' },
    { label: 'Coffee', value: 'Double Espresso' },
    { label: 'Status', value: 'Optimizing Models...' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStatusIndex((prev) => {
        if (prev < statusLines.length) {
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });
    }, 400);
    return () => clearInterval(timer);
  }, [statusLines.length]);

  return (
    <section className="hero">
      <div className="hero-visual">
        <Scene3D />
      </div>

      <div className="container hero-content">
        <motion.div 
          className="hero-text"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="hero-badge mono">
            <span className="pulse"></span>
            Available for new projects
          </div>
          
          <h1 className="hero-title glitch-text" data-text="Anas Arfeen">
            Anas Arfeen
          </h1>
          
          <p className="hero-subtitle">
            AI/ML Engineer & Systems Programmer building intelligent environments and high-performance tools.
          </p>
          
          <div className="hero-cta">
            <button onClick={onTerminalOpen} className="btn primary flex-center gap-2">
              <TerminalIcon size={18} /> Launch CLI
            </button>
            <a href="#projects" className="btn secondary">View Work</a>
          </div>
        </motion.div>

        <motion.div 
          className="hero-status-window mono"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="status-header">
            <div className="status-dot" style={{ backgroundColor: '#ff5f56' }}></div>
            <div className="status-dot" style={{ backgroundColor: '#ffbd2e' }}></div>
            <div className="status-dot" style={{ backgroundColor: '#27c93f' }}></div>
            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', opacity: 0.5 }}>anas@portfolio</span>
          </div>
          
          <div className="status-body">
            {statusLines.map((line, i) => (
              <div key={i} className="status-line" style={{ 
                opacity: i < statusIndex ? 1 : 0, 
                maxHeight: i < statusIndex ? '2rem' : 0,
                transition: 'opacity 0.3s, maxHeight 0.3s' 
              }}>
                <span className="status-label">{line.label}:</span>
                <span className="status-value">{line.value}</span>
              </div>
            ))}
            {statusIndex < statusLines.length && (
              <div className="status-line">
                <span className="status-label">{statusLines[statusIndex]?.label}:</span>
                <span className="typing-cursor"></span>
              </div>
            )}
          </div>

          <div className="status-footer" style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-around' }}>
            <Cpu size={18} opacity={0.5} />
            <Code size={18} opacity={0.5} />
            <Coffee size={18} opacity={0.5} />
            <Play size={18} opacity={0.5} style={{ cursor: 'pointer' }} onClick={onTerminalOpen} />
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <div className="mouse">
          <div className="wheel"></div>
        </div>
        <span className="mono" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Scroll</span>
      </motion.div>
    </section>
  );
};

export default Hero;


