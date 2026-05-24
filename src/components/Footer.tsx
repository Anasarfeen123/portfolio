import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer coffee-gradient">
      <div className="container footer-content">
        <div className="footer-info">
          <h3 className="mono">anas@portfolio:~$ contact --info</h3>
          <p>Email: codecrusader07@gmail.com</p>
          <div className="social-links">
            <a href="https://github.com/Anasarfeen123" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://linkedin.com/in/anas-arfeen-b94870366" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="mono">Built with React & ❤️</p>
          <p>© 2026 Anas Arfeen</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
