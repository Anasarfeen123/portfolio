import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

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
            className="theme-toggle mono"
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
