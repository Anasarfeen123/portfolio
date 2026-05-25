import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import './App.css'
import data from './data.json'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Footer from './components/Footer'
import CustomCursor from './components/CustomCursor'

function App() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="app">
      <CustomCursor />
      
      {/* Scroll Progress Bar */}
      <motion.div className="progress-bar" style={{ scaleX }} />

      <Navbar />
      
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Hero />
        
        <motion.section 
          id="about"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 42 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.22, margin: '0px 0px -12% 0px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <About photoUrl="/Photo.jpg" summary={data.personal.summary} />
        </motion.section>

        <motion.section 
          id="skills"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 42 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2, margin: '0px 0px -12% 0px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <Skills skills={data.skills} />
        </motion.section>

        <motion.section 
          id="experience"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 42 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2, margin: '0px 0px -12% 0px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <Experience experience={data.experience} />
        </motion.section>

        <motion.section 
          id="projects"
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 42 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.16, margin: '0px 0px -12% 0px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ perspective: 1000 }}
        >
          <Projects projects={data.projects} />
        </motion.section>
      </motion.main>
      
      <Footer />
    </div>
  )
}

export default App
