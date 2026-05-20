import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './Terminal.css';

interface TerminalProps {
  onClose: () => void;
  data: any;
}

const Terminal: React.FC<TerminalProps> = ({ onClose, data }) => {
  const [history, setHistory] = useState<string[]>(['Welcome to Anas\'s interactive terminal. Type "help" to see available commands.']);
  const [input, setInput] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    const newHistory = [...history, `anas@portfolio:~$ ${input}`];

    switch (cmd) {
      case 'help':
        newHistory.push('Available commands: about, projects, skills, exp, contact, ls, cat, neofetch, whoami, hack, coffee, clear, help, exit');
        break;
      case 'about':
        newHistory.push(data.personal.summary);
        break;
      case 'whoami':
        newHistory.push(data.personal.creative_summary);
        break;
      case 'neofetch':
        newHistory.push('   .--.      anas@portfolio');
        newHistory.push('  |o_o |     --------------');
        newHistory.push('  |:_/ |     OS: Arch Linux x86_64');
        newHistory.push(' //   \\ \\    Host: VIT Chennai');
        newHistory.push('(|     | )   Kernel: 6.8.9-arch1-1');
        newHistory.push('/\'\\_   _/`\\  Shell: zsh 5.9');
        newHistory.push('\\___)=(___/  Terminal: MusicalTerm');
        newHistory.push('             Coffee: Double Espresso');
        break;
      case 'hack':
        newHistory.push('Initializing penetration test...');
        newHistory.push('Bypassing firewall [OK]');
        newHistory.push('Injecting payload [OK]');
        newHistory.push('Accessing mainframe [OK]');
        newHistory.push('ERROR: Coffee level critically low. Hacking aborted.');
        break;
      case 'projects':
        data.projects.forEach((p: any) => {
          newHistory.push(`- ${p.title} [${p.technologies.join(', ')}]`);
        });
        break;
      case 'skills':
        newHistory.push(`Languages: ${data.skills.languages.join(', ')}`);
        newHistory.push(`AI/ML: ${data.skills.ai_ml.join(', ')}`);
        newHistory.push(`Competencies: ${data.skills.competencies.join(', ')}`);
        break;
      case 'exp':
        data.experience.forEach((e: any) => {
          newHistory.push(`- ${e.role} at ${e.organization} (${e.duration})`);
        });
        break;
      case 'contact':
        newHistory.push(`Email: ${data.personal.email}`);
        newHistory.push(`GitHub: ${data.personal.github}`);
        newHistory.push(`LinkedIn: ${data.personal.linkedin}`);
        break;
      case 'ls':
        newHistory.push('about.md  projects.md  skills.md  experience.md  contact.md  coffee.txt  secrets.gpg');
        break;
      case 'cat about.md':
        newHistory.push(data.personal.summary);
        break;
      case 'cat projects.md':
        data.projects.forEach((p: any) => {
          newHistory.push(`- ${p.title}: ${p.description[0]}`);
        });
        break;
      case 'cat secrets.gpg':
        newHistory.push('Nice try! But you need a GPG key to decrypt this. Hint: Look for it in the coffee beans.');
        break;
      case 'cat coffee.txt':
        newHistory.push('☕ Freshly brewed espresso! Anas is currently drinking a double latte while coding this.');
        break;
      case 'cat':
        newHistory.push('Usage: cat [filename]');
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'exit':
        onClose();
        break;
      case 'coffee':
        newHistory.push('☕ Freshly brewed espresso! Anas is currently drinking a double latte while coding this.');
        break;
      default:
        if (cmd !== '') {
          newHistory.push(`Command not found: ${cmd}. Type "help" for options.`);
        }
    }

    setHistory(newHistory);
    setInput('');
  };

  return (
    <motion.div 
      className="terminal-window" 
      onClick={focusInput}
      initial={{ scale: 0.96, opacity: 0, y: 18 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.98, opacity: 0, y: 12 }}
      transition={{ type: 'spring', stiffness: 360, damping: 32 }}
    >
      <div className="terminal-header">
        <div className="terminal-buttons">
          <span className="dot red" onClick={onClose}></span>
          <span className="dot yellow"></span>
          <span className="dot green"></span>
        </div>
        <div className="terminal-title">anas@portfolio:~</div>
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
            className="terminal-input mono"
            spellCheck="false"
            aria-label="Terminal command"
          />
        </form>
        <div ref={terminalEndRef} />
      </div>
    </motion.div>
  );
};

export default Terminal;
