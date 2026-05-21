import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

const KonamiEgg: React.FC = () => {
  const [, setSeq] = useState<string[]>([]);
  const [unlocked, setUnlocked] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      setSeq((prev) => {
        const next = [...prev, e.key].slice(-10);
        if (next.join(',') === KONAMI.join(',') && !unlocked) {
          setUnlocked(true);
          setShow(true);
          setTimeout(() => setShow(false), 5000);
        }
        return next;
      });
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [unlocked]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '1rem',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Matrix rain background */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.85)',
          }} />
          <motion.div
            style={{
              position: 'relative',
              fontFamily: 'var(--font-mono)',
              color: '#a6e22e',
              fontSize: 'clamp(2rem, 8vw, 5rem)',
              fontWeight: 900,
              textAlign: 'center',
              textShadow: '0 0 30px rgba(166,226,46,0.8)',
            }}
            animate={{ scale: [1, 1.05, 1], textShadow: [
              '0 0 20px rgba(166,226,46,0.5)',
              '0 0 50px rgba(166,226,46,0.9)',
              '0 0 20px rgba(166,226,46,0.5)',
            ]}}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            👾 GOD MODE 👾
          </motion.div>
          <motion.div
            style={{
              position: 'relative',
              fontFamily: 'var(--font-mono)',
              color: '#e7bc91',
              fontSize: '1.2rem',
              textAlign: 'center',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            You found the secret! ⬆⬆⬇⬇⬅➡⬅➡BA
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default KonamiEgg;
