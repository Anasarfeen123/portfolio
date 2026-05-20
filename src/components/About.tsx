import React from 'react';
import { motion } from 'framer-motion';
import './About.css';
import data from '../data.json';

interface AboutProps {
  photoUrl: string;
  summary: string;
}

const About: React.FC<AboutProps> = ({ photoUrl, summary }) => {
  const { creative_summary, fun_facts, interests } = data.personal;

  return (
    <section id="about" className="about">
      <div className="container">
        <h2 className="section-title">About Me</h2>
        <div className="about-grid">
          <motion.div 
            className="about-image-container"
            whileHover={{ scale: 1.05, rotate: 2 }}
          >
            <img src={photoUrl} alt="Anas Arfeen" className="about-image" />
            <div className="image-frame"></div>
          </motion.div>
          <div className="about-text">
            <p className="summary-text">{summary}</p>
            <p className="creative-summary">{creative_summary}</p>
            
            <div className="fun-facts-section">
              <h3>Fun Facts</h3>
              <ul className="fun-facts-list mono">
                {fun_facts.map((fact, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className="bullet">&gt;</span> {fact}
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="interests-tags">
              {interests.map((interest, index) => (
                <motion.span 
                  key={index} 
                  className="interest-tag mono"
                  whileHover={{ scale: 1.1, backgroundColor: 'var(--accent-gold)', color: 'var(--espresso)' }}
                >
                  #{interest.replace(/\s+/g, '_').toLowerCase()}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
