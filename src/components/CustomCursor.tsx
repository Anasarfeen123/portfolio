import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue, useVelocity, useTransform, AnimatePresence } from 'framer-motion';
import './CustomCursor.css';

interface Particle {
  id: number;
  x: number;
  y: number;
  scale: number;
}

const CustomCursor: React.FC = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdCounter = useRef(0);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const velocityX = useVelocity(cursorX);
  const velocityY = useVelocity(cursorY);
  
  const rotateZ = useTransform(velocityX, [-3000, 3000], [-35, 35]);
  const stretchX = useTransform(velocityX, [-3000, 3000], [0.8, 1.2]);
  const stretchY = useTransform(velocityY, [-3000, 3000], [0.8, 1.2]);

  const springConfig = { damping: 30, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      // Spawn trail particles based on movement
      if (Math.abs(e.movementX) > 2 || Math.abs(e.movementY) > 2) {
        const id = particleIdCounter.current++;
        const newParticle: Particle = {
          id,
          x: e.clientX,
          y: e.clientY,
          scale: Math.random() * 0.5 + 0.5,
        };
        setParticles(prev => [...prev.slice(-12), newParticle]);
        setTimeout(() => {
          setParticles(prev => prev.filter(p => p.id !== id));
        }, 600);
      }
    };

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = !!(
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('.project-card') ||
        target.closest('.skill-tag-gamified') ||
        target.closest('.social-link') ||
        target.classList.contains('interactive')
      );
      
      setIsHovering(isInteractive);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleHover);
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleHover);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cursorX, cursorY, isVisible]);

  return (
    <>
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="cursor-particle"
            initial={{ x: p.x, y: p.y, scale: p.scale, opacity: 0.6 }}
            animate={{ scale: 0, opacity: 0, y: p.y + (Math.random() - 0.5) * 20 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        ))}
      </AnimatePresence>

      <motion.div
        className="custom-cursor"
        style={{
          translateX: cursorXSpring,
          translateY: cursorYSpring,
          scaleX: stretchX,
          scaleY: stretchY,
        }}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: isHovering ? 2.5 : 1,
          borderWidth: isHovering ? '1px' : '2px',
        }}
        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      />

      <motion.div
        className="custom-cursor-point"
        style={{
          translateX: cursorX,
          translateY: cursorY,
          rotateZ,
        }}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: isHovering ? 0 : 1,
        }}
      >
        <div className="comet-head" />
      </motion.div>
    </>
  );
};

export default CustomCursor;
