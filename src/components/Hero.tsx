import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import './Hero.css';

// ─── Glitch Effect ──────────────────────────────────────────
const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#@$%&!?';
const FULL_NAME = 'Anas Arfeen';

const GlitchName: React.FC<{ trigger: number }> = ({ trigger }) => {
  const [display, setDisplay] = useState(FULL_NAME);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    if (trigger === 0) {
      setDisplay(FULL_NAME);
      return;
    }
    setIsGlitching(true);
    let frames = 0;
    const maxFrames = 12;
    const interval = setInterval(() => {
      setDisplay(
        FULL_NAME.split('').map((ch: string) => {
          if (ch === ' ' || Math.random() > 0.25) return ch;
          return CHARSET[Math.floor(Math.random() * CHARSET.length)];
        }).join('')
      );
      frames++;
      if (frames >= maxFrames) {
        clearInterval(interval);
        setDisplay(FULL_NAME);
        setIsGlitching(false);
      }
    }, 70);
    return () => clearInterval(interval);
  }, [trigger]);

  return <span className={isGlitching ? 'glitch-active' : ''}>{display}</span>;
};

// ─── Personas ───────────────────────────────────────────────
const PERSONAS = [
  {
    icon: '🤖',
    label: 'AI/ML',
    subtitle: 'Building autonomous RL agents — from warehouse rovers to game-playing bots — using PyTorch and curriculum learning.',
    tag: 'PyTorch · PPO · SAC · SB3',
    accent: '#a6e22e',
    accentRgb: '166, 226, 46',
  },
  {
    icon: '⚡',
    label: 'Systems',
    subtitle: 'Passionate about low-level optimization, systems programming, and building efficient developer tools.',
    tag: 'C++ · Rust · Linux · Neovim',
    accent: '#66d9ef',
    accentRgb: '102, 217, 239',
  },
  {
    icon: '🚀',
    label: 'Builder',
    subtitle: 'Turning complex ideas into functional prototypes. Focused on performance, scalability, and clean architecture.',
    tag: 'React · Node.js · Go · Docker',
    accent: '#e7bc91',
    accentRgb: '231, 188, 145',
  },
] as const;

// ─── Mini Terminal ───────────────────────────────────────────
const MINI_RESPONSES: Record<string, string[]> = {
  help: ['→ Commands: about · stack · hire · ls · whoami'],
  about: [
    'CS undergrad @ VIT Chennai (2025–2029)',
    'AI/ML Co-Lead, Microsoft Innovations Club',
    'RL researcher & systems programmer',
  ],
  stack: [
    '⎡ Languages : Python · C++ · Rust · Go · C#',
    '⎢ AI/ML     : PyTorch · SB3 · NumPy · PPO · SAC',
    '⎣ Tools     : Linux · Neovim · Docker · Git',
  ],
  hire: [
    '🚀 Open to internships & collabs!',
    '📧 codecrusader07@gmail.com',
    '🐙 github.com/Anasarfeen123',
  ],
  ls: [
    'about.md   projects/   skills.json',
    'cv.pdf     contact.txt  .zshrc',
  ],
  whoami: ['anas — builder · tinkerer · RL researcher · linux enthusiast'],
  sudo: ['[sudo] password for anas: ********', 'sudo: Permission denied. Nice try. 😈'],
  'cat contact.txt': [
    'Email: codecrusader07@gmail.com',
    'GitHub: github.com/Anasarfeen123',
    'LinkedIn: linkedin.com/in/anas-arfeen-b94870366',
  ],
  'git push': ['Everything up-to-date.'],
  'npm install': [
    'added 847 packages in 0.3s',
    'Found 0 vulnerabilities. Perfect.',
  ],
};

type LineType = 'in' | 'out' | 'err';
interface TermLine { type: LineType; text: string; }

const MiniTerminal: React.FC = () => {
  const [lines, setLines] = useState<TermLine[]>([
    { type: 'out', text: 'anas@portfolio ~ bash — interactive terminal' },
    { type: 'out', text: 'Type "help" to explore. Tab for autocomplete.' },
  ]);
  const [input, setInput] = useState('');
  const [cmdHist, setCmdHist] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const [booted, setBooted] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 600);
    return () => clearTimeout(t);
  }, []);

  const run = useCallback((raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const cmd = trimmed.toLowerCase();

    if (cmd === 'clear') {
      setLines([{ type: 'out', text: 'Terminal cleared.' }]);
      setInput('');
      setCmdHist(prev => [trimmed, ...prev]);
      setHIdx(-1);
      return;
    }

    const newLines: TermLine[] = [...lines, { type: 'in', text: trimmed }];
    const resp = MINI_RESPONSES[cmd];

    if (resp) {
      resp.forEach(r => newLines.push({ type: 'out', text: r }));
    } else {
      newLines.push({ type: 'err', text: `bash: ${cmd}: command not found` });
      newLines.push({ type: 'out', text: 'Try "help" for available commands.' });
    }

    setLines(newLines);
    setCmdHist(prev => [trimmed, ...prev]);
    setHIdx(-1);
    setInput('');
  }, [lines]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    run(input);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const i = Math.min(hIdx + 1, cmdHist.length - 1);
      setHIdx(i);
      setInput(cmdHist[i] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const i = Math.max(hIdx - 1, -1);
      setHIdx(i);
      setInput(i === -1 ? '' : cmdHist[i]);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const allCmds = Object.keys(MINI_RESPONSES);
      const match = allCmds.find(s => s.startsWith(input.toLowerCase()) && s !== input.toLowerCase());
      if (match) setInput(match);
    }
  };

  return (
    <motion.div
      className="mini-term"
      onClick={() => inputRef.current?.focus()}
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: booted ? 1 : 0, y: booted ? 0 : 20, scale: booted ? 1 : 0.97 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="mt-header">
        <span className="mt-dot" style={{ background: '#ff5f56' }} />
        <span className="mt-dot" style={{ background: '#ffbd2e' }} />
        <span className="mt-dot" style={{ background: '#27c93f' }} />
        <span className="mt-title mono">anas@portfolio — bash</span>
      </div>

      <div className="mt-body mono">
        {lines.map((l, i) => (
          <div key={i} className={`mt-line mt-${l.type}`}>
            {l.type === 'in' && <span className="mt-prompt">❯&nbsp;</span>}
            <span>{l.text}</span>
          </div>
        ))}
        <form onSubmit={handleSubmit} className="mt-form">
          <span className="mt-prompt">❯&nbsp;</span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            className="mt-input mono"
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            placeholder="start typing..."
            aria-label="Terminal input"
          />
        </form>
        <div ref={endRef} />
      </div>

    </motion.div>
  );
};

// ─── Floating Glyphs ─────────────────────────────────────────
const GLYPHS = ['{}', '=>', '()', '//', '&&', '||', 'RL', 'AI', '0xFF', '#!/', '...', '===', '::'];
const PARTICLE_DATA = GLYPHS.flatMap((g, i) => [
  { glyph: g, x: (i * 7.3 + 2) % 92, delay: i * 0.55, dur: 9 + (i % 4) },
  { glyph: GLYPHS[(i + 4) % GLYPHS.length], x: (i * 7.3 + 43) % 92, delay: i * 0.38 + 2, dur: 11 + (i % 3) },
]);

// ─── Stats ───────────────────────────────────────────────────
const STATS = [
  { v: '5+', l: 'Projects', detail: 'RL, ML, Web, Systems' },
  { v: '3+', l: 'Leadership', detail: 'MIC AI/ML Co-Lead, LUG' },
  { v: '500+', l: 'Commits', detail: 'Consistent contributions' },
];

// ─── Floating Coffee Beans ──────────────────────────────────
interface CoffeeBeanProps {
  delay?: number;
  x?: string | number;
  y?: string | number;
  scale?: number;
  rotate?: number;
  speed?: number;
}

const CoffeeBean: React.FC<CoffeeBeanProps> = ({ delay = 0, x = 0, y = 0, scale = 1, rotate = 0, speed = 0.3 }) => {
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 1000], [0, 1000 * speed]);

  return (
    <motion.div
      className="floating-bean"
      initial={{ x, y, rotate, opacity: 0 }}
      style={{ 
        left: x,
        top: y,
        y: yParallax,
        scale,
      }}
      animate={{ 
        rotate: [rotate, rotate + 45, rotate],
        opacity: [0, 0.6, 0.4]
      }}
      transition={{ 
        rotate: { duration: 10 + Math.random() * 5, repeat: Infinity, ease: "easeInOut" },
        opacity: { duration: 2, delay }
      }}
    >
      ☕
    </motion.div>
  );
};

// ─── Hero ─────────────────────────────────────────────────────
const Hero: React.FC = () => {
  const [persona, setPersona] = useState(0);
  const [glitchTrigger, setGlitchTrigger] = useState(0);
  const [statPop, setStatPop] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const cur = PERSONAS[persona];

  useEffect(() => {
    window.scrollTo(0, 0);
    const t = setTimeout(() => setGlitchTrigger(1), 350);
    return () => clearTimeout(t);
  }, []);

  const handleNameClick = useCallback(() => {
    setGlitchTrigger(s => s + 1);
  }, []);

  const handleStatClick = (i: number) => {
    setStatPop(i);
    setTimeout(() => setStatPop(null), 1200);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText('codecrusader07@gmail.com').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="hero" className="hero-ng">
      {/* Background elements */}
      <div className="hero-grid-bg" aria-hidden />
      
      <div className="hero-beans-bg" aria-hidden>
        <CoffeeBean x="10%" y="15%" scale={1.2} delay={0} rotate={20} speed={0.2} />
        <CoffeeBean x="80%" y="10%" scale={0.8} delay={1} rotate={-10} speed={0.4} />
        <CoffeeBean x="40%" y="60%" scale={1.5} delay={2} rotate={45} speed={0.15} />
        <CoffeeBean x="90%" y="50%" scale={0.7} delay={3} rotate={180} speed={0.5} />
        <CoffeeBean x="15%" y="55%" scale={0.9} delay={4} rotate={-30} speed={0.25} />
        <CoffeeBean x="65%" y="75%" scale={1.1} delay={5} rotate={15} speed={0.35} />
      </div>

      {/* Floating particles */}
      <div className="hero-particles" aria-hidden>
        {PARTICLE_DATA.map((p, i) => (
          <span
            key={i}
            className="glyph-particle mono"
            style={{
              left: `${p.x}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
            }}
          >
            {p.glyph}
          </span>
        ))}
      </div>

      <div className="hero-ng-inner container">

        {/* ── LEFT ── */}
        <motion.div
          className="hero-left"
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Available badge */}
          <motion.div
            className="avail-badge mono"
            animate={{
              boxShadow: [
                '0 0 0px rgba(39,201,63,0)',
                '0 0 14px rgba(39,201,63,0.35)',
                '0 0 0px rgba(39,201,63,0)',
              ],
            }}
            transition={{ repeat: Infinity, duration: 2.8 }}
          >
            <span className="avail-dot" />
            Available for new projects
          </motion.div>

          {/* Name — click to glitch */}
          <motion.h1
            className="hero-name-ng"
            onClick={handleNameClick}
            title="Click to glitch!"
            whileHover={{ scale: 1.012, x: 2 }}
            whileTap={{ scale: 0.995 }}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <GlitchName trigger={glitchTrigger} />
            <span className="name-cursor" aria-hidden>_</span>
          </motion.h1>

          {/* Persona tabs */}
          <motion.div
            className="persona-row"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {PERSONAS.map((p, i) => (
              <motion.button
                key={p.label}
                className={`persona-btn${i === persona ? ' active' : ''}`}
                style={i === persona ? {
                  background: `rgba(${p.accentRgb}, 0.12)`,
                  borderColor: p.accent,
                  color: p.accent,
                } : {}}
                onClick={() => setPersona(i)}
                whileHover={{ scale: 1.06, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* Subtitle — animated per persona */}
          <div className="subtitle-wrap">
            <AnimatePresence mode="wait">
              <motion.p
                key={`sub-${persona}`}
                className="hero-sub-ng"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                {cur.subtitle}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Tech tag */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`tag-${persona}`}
              className="hero-tag-ng mono"
              style={{ color: cur.accent, borderColor: `rgba(${cur.accentRgb}, 0.35)` }}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2 }}
            >
              ▶&nbsp;{cur.tag}
            </motion.div>
          </AnimatePresence>

          {/* Stats */}
          <div className="hero-stats-ng">
            {STATS.map((s, i) => (
              <div key={s.l} style={{ position: 'relative' }}>
                <motion.div
                  className="stat-ng"
                  onClick={() => handleStatClick(i)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="stat-ng-val mono">{s.v}</div>
                  <div className="stat-ng-lbl">{s.l}</div>
                </motion.div>
                <AnimatePresence>
                  {statPop === i && (
                    <motion.div
                      className="stat-tooltip mono"
                      initial={{ opacity: 0, y: 4, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                    >
                      {s.detail}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            className="hero-cta-ng"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.a
              href="/portfolio.pdf"
              download="Anas_Arfeen_Portfolio.pdf"
              className="cta-primary"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              📄 Download CV (PDF)
            </motion.a>
            <motion.a
              href="https://github.com/Anasarfeen123"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-secondary"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              GitHub →
            </motion.a>
            <motion.button
              className="cta-copy mono"
              onClick={handleCopy}
              title="Copy email"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
            >
              {copied ? '✓ Copied!' : '@ Email'}
            </motion.button>
          </motion.div>

          {/* Hint */}
          <motion.p
            className="hero-hint-ng mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            ↑ click name to glitch ·&nbsp;
            <a href="https://github.com/Anasarfeen123" target="_blank" rel="noopener noreferrer">GitHub</a>
            &nbsp;·&nbsp;
            <a href="https://linkedin.com/in/anas-arfeen-b94870366" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </motion.p>
        </motion.div>

        {/* ── RIGHT ── */}
        <motion.div
          className="hero-right"
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <MiniTerminal />

          {/* System status strip */}
          <motion.div
            className="status-strip mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {[
              { label: 'OS', value: 'Linux' },
              { label: 'Shell', value: 'zsh' },
              { label: 'Editor', value: 'Neovim' },
              { label: 'Status', value: 'Productive' },
            ].map((item, i) => (
              <div key={item.label} className="strip-item">
                <span className="strip-label">{item.label}</span>
                <span className="strip-sep">:</span>
                <span className="strip-val">{item.value}</span>
                {i < 3 && <span className="strip-div" />}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="scroll-ng"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          ↓
        </motion.span>
        <span className="scroll-label mono">scroll</span>
      </motion.div>
    </section>
  );
};

export default Hero;
