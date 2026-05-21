import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './Terminal.css';

interface TerminalProps {
  onClose: () => void;
  data: any;
}

const Terminal: React.FC<TerminalProps> = ({ onClose, data }) => {
  const [history, setHistory] = useState<string[]>([
    'Welcome to Anas\'s interactive terminal.',
    'Type "help" to see available commands.',
    'Hint: Try "matrix", "sudo", or the Konami code 👾',
  ]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [matrixMode, setMatrixMode] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [history]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      const idx = Math.min(histIdx + 1, cmdHistory.length - 1);
      setHistIdx(idx);
      setInput(cmdHistory[idx] ?? '');
    } else if (e.key === 'ArrowDown') {
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx);
      setInput(idx === -1 ? '' : cmdHistory[idx]);
    }
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = input.trim();
    const cmd = raw.toLowerCase();
    if (!raw) return;

    setCmdHistory((prev) => [raw, ...prev]);
    setHistIdx(-1);
    const newHistory = [...history, `anas@portfolio:~$ ${raw}`];

    switch (cmd) {
      case 'help':
        newHistory.push('┌─ Available Commands ──────────────────────────────┐');
        newHistory.push('│ about      whoami    neofetch   ls                │');
        newHistory.push('│ projects   skills    exp        contact           │');
        newHistory.push('│ coffee     hack      matrix     sudo              │');
        newHistory.push('│ cat <file> clear     exit                         │');
        newHistory.push('└─────────────────────────────────────────────────┘');
        newHistory.push('Pro tip: ↑↓ arrow keys for history');
        break;
      case 'about':
        newHistory.push(data.personal.summary);
        break;
      case 'whoami':
        newHistory.push(data.personal.creative_summary);
        break;
      case 'neofetch':
        newHistory.push('   .--.      anas@portfolio');
        newHistory.push('  |o_o |     ────────────────────');
        newHistory.push('  |:_/ |     OS: Arch Linux x86_64');
        newHistory.push(' //   \\ \\    Host: VIT Chennai');
        newHistory.push('(|     | )   Kernel: 6.8.9-zen1-1-zen');
        newHistory.push('/\'\\_ _/`\\    Shell: zsh 5.9');
        newHistory.push('\\___)=(___/  Editor: Neovim (btw)');
        newHistory.push('            Coffee: Double Espresso ☕');
        newHistory.push('            Status: In flow state 🎯');
        break;
      case 'matrix':
        setMatrixMode(true);
        newHistory.push('Entering the Matrix...');
        newHistory.push('Wake up, Neo...');
        newHistory.push('The Matrix has you...');
        newHistory.push('Follow the white rabbit. 🐇');
        setTimeout(() => setMatrixMode(false), 4000);
        break;
      case 'sudo':
        newHistory.push('[sudo] password for anas:');
        setTimeout(() => {
          setHistory((prev) => [...prev, 'sudo: Permission denied — nice try 😈']);
        }, 800);
        break;
      case 'sudo rm -rf /':
        newHistory.push('Nope. I like my filesystem. 🛡️');
        break;
      case 'hack':
        newHistory.push('> Initializing penetration sequence...');
        newHistory.push('> Bypassing firewall ████████ [OK]');
        newHistory.push('> Injecting payload   ████████ [OK]');
        newHistory.push('> Accessing mainframe  ██░░░░░░ ...');
        newHistory.push('> ERROR: Coffee level critical. Aborting. ☕');
        break;
      case 'projects':
        data.projects.forEach((p: any, i: number) => {
          newHistory.push(`[${i + 1}] ${p.title}  │  ${p.technologies.join(', ')}`);
        });
        break;
      case 'skills':
        newHistory.push(`Languages : ${data.skills.languages.join(' · ')}`);
        newHistory.push(`AI/ML     : ${data.skills.ai_ml.join(' · ')}`);
        newHistory.push(`Tools     : ${data.skills.tools.join(' · ')}`);
        newHistory.push(`Core      : ${data.skills.competencies.join(' · ')}`);
        break;
      case 'exp':
        data.experience.forEach((e: any) => {
          newHistory.push(`★ ${e.role} @ ${e.organization}  (${e.duration})`);
        });
        break;
      case 'contact':
        newHistory.push(`📧  ${data.personal.email}`);
        newHistory.push(`🐙  ${data.personal.github}`);
        newHistory.push(`💼  ${data.personal.linkedin}`);
        break;
      case 'ls':
        newHistory.push('about.md   projects/  skills.json  secrets.gpg  coffee.txt  .bashrc');
        break;
      case 'cat about.md':
        newHistory.push(data.personal.summary);
        break;
      case 'cat projects.md':
        data.projects.forEach((p: any) => {
          newHistory.push(`## ${p.title}\n${p.description[0]}`);
        });
        break;
      case 'cat secrets.gpg':
        newHistory.push('gpg: encrypted with 4096-bit RSA key');
        newHistory.push('gpg: decryption failed: No secret key');
        newHistory.push('...okay fine: I put ketchup on pasta once. Never again.');
        break;
      case 'cat coffee.txt':
        newHistory.push('☕ Today\'s brew: Ethiopian Yirgacheffe, double espresso');
        newHistory.push('   Grind: 18g in, 36g out, 27 seconds');
        newHistory.push('   Result: Perfection. Code compiled first try.');
        break;
      case 'coffee':
        newHistory.push('☕ Brewing a double espresso...');
        newHistory.push('   ████████████████ 100%');
        newHistory.push('   Enjoy! This fuels the code.');
        break;
      case 'cat .bashrc':
        newHistory.push('alias vim="nvim"');
        newHistory.push('alias python="python3"');
        newHistory.push('alias please="sudo"');
        newHistory.push('export COFFEE_LEVEL=critical');
        break;
      case 'cat':
        newHistory.push('cat: missing file operand');
        newHistory.push('Usage: cat [filename]');
        break;
      case 'exit':
        onClose();
        return;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      default:
        if (cmd.startsWith('sudo ')) {
          newHistory.push(`sudo: ${cmd.slice(5)}: command not found. Also, no.`);
        } else if (cmd !== '') {
          newHistory.push(`bash: ${cmd}: command not found`);
          newHistory.push('Type "help" for available commands.');
        }
    }

    setHistory(newHistory);
    setInput('');
  };

  return (
    <motion.div
      className={`terminal-window ${matrixMode ? 'matrix-mode' : ''}`}
      onClick={() => inputRef.current?.focus()}
      initial={{ scale: 0.95, opacity: 0, y: 18 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.98, opacity: 0, y: 12 }}
      transition={{ type: 'spring', stiffness: 360, damping: 32 }}
    >
      <div className="terminal-header">
        <div className="terminal-buttons">
          <span className="dot red" onClick={onClose} title="Close" />
          <span className="dot yellow" title="Minimize" />
          <span className="dot green" title="Maximize" />
        </div>
        <div className="terminal-title">anas@portfolio:~ — bash</div>
      </div>
      <div className="terminal-body mono">
        {history.map((line, i) => (
          <div key={i} className="terminal-line">
            {line.startsWith('anas@portfolio:~$') ? (
              <span className="history-input">{line}</span>
            ) : (
              <span className="terminal-output">{line}</span>
            )}
          </div>
        ))}
        <form onSubmit={handleCommand} className="terminal-input-line">
          <span className="prompt">anas@portfolio:~$ </span>
          <input
            ref={inputRef}
            autoFocus
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="terminal-input mono"
            spellCheck="false"
            aria-label="Terminal command"
            autoComplete="off"
          />
        </form>
        <div ref={terminalEndRef} />
      </div>
    </motion.div>
  );
};

export default Terminal;
