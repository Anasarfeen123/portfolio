import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'
import data from './data.json'
import Terminal from './components/Terminal'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Footer from './components/Footer'

function App() {
  const [terminalOpen, setTerminalOpen] = useState(false);

  return (
    <div className="app">
      <Navbar onTerminalToggle={() => setTerminalOpen(!terminalOpen)} />
      
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <section id="hero">
          <Hero onTerminalOpen={() => setTerminalOpen(true)} />
        </section>
        
        <motion.section 
          id="about"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <About photoUrl="/Photo.jpg" summary={data.personal.summary} />
        </motion.section>

        <motion.section 
          id="skills"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Skills skills={data.skills} />
        </motion.section>

        <motion.section 
          id="experience"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Experience experience={data.experience} />
        </motion.section>

        <motion.section 
          id="projects"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Projects projects={data.projects} />
        </motion.section>
      </motion.main>
      
      <Footer />
      
      {/* Terminal Overlay */}
      <AnimatePresence>
        {terminalOpen && (
          <motion.div 
            className="terminal-wrapper open"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <Terminal onClose={() => setTerminalOpen(false)} data={data} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        className="terminal-fab" 
        onClick={() => setTerminalOpen(true)}
        aria-label="Open Terminal"
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 420, damping: 24 }}
      >
        <span className="mono">&gt;_</span>
      </motion.button>
    </div>
  )
}

export default App
