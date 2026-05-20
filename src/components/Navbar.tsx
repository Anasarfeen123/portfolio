import React from 'react';
import { motion } from 'framer-motion';
import './Navbar.css';

interface NavbarProps {
  onTerminalToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onTerminalToggle }) => {
  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    event.preventDefault();

    const target = document.getElementById(targetId);
    if (!target) return;

    const offset = 78;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <motion.nav 
      className="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="container nav-content">
        <motion.div 
          className="logo mono"
          whileHover={{ scale: 1.05 }}
        >
          anas@portfolio
        </motion.div>
        <div className="nav-links">
          {['About', 'Skills', 'Experience', 'Projects'].map((item) => (
            <motion.a 
              key={item} 
              href={`#${item.toLowerCase()}`}
              onClick={(event) => handleNavClick(event, item.toLowerCase())}
              whileHover={{ y: -1, color: 'var(--accent-gold)' }}
              whileTap={{ y: 1, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            >
              {item}
            </motion.a>
          ))}
          <motion.button 
            className="term-toggle" 
            onClick={onTerminalToggle}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
          >
            <span className="mono">&gt;_</span>
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
