'use me';
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, Search, Terminal, Cpu, Download, FileText, Globe, Volume2, VolumeX, X, ArrowRight } from 'lucide-react';
import { PERSONAL_INFO } from '@/data/portfolioData';
import { playSound, toggleAudioMute, isAudioMuted } from '@/lib/audio';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandOption {
  id: string;
  title: string;
  category: 'NAVIGATION' | 'ACTIONS' | 'EXTERNAL';
  icon: React.ReactNode;
  action: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          playSound('click');
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navigateTo = (href: string) => {
    playSound('click');
    onClose();
    window.location.href = href;
  };

  const commands: CommandOption[] = [
    {
      id: 'nav-hero',
      title: '01. System Boot & Hero Overview',
      category: 'NAVIGATION',
      icon: <Terminal className="w-4 h-4 text-cyan-400" />,
      action: () => navigateTo('#hero'),
    },
    {
      id: 'nav-about',
      title: '02. Evolution Journey & Brand Identity',
      category: 'NAVIGATION',
      icon: <Cpu className="w-4 h-4 text-emerald-400" />,
      action: () => navigateTo('#about'),
    },
    {
      id: 'nav-skills',
      title: '03. Neural Skills Matrix & PyTorch Capabilities',
      category: 'NAVIGATION',
      icon: <Cpu className="w-4 h-4 text-purple-400" />,
      action: () => navigateTo('#skills'),
    },
    {
      id: 'nav-projects',
      title: '04. Inspect R&D Projects (Autonomous Rover, MusicalTerm, Celeb Classifier)',
      category: 'NAVIGATION',
      icon: <FileText className="w-4 h-4 text-blue-400" />,
      action: () => navigateTo('#projects'),
    },
    {
      id: 'nav-experience',
      title: '05. Leadership & Club Experience (MIC AI/ML Co-Lead, LUG)',
      category: 'NAVIGATION',
      icon: <Terminal className="w-4 h-4 text-yellow-400" />,
      action: () => navigateTo('#experience'),
    },
    {
      id: 'nav-notebook',
      title: '06. Developer Notebook & Technical Writing',
      category: 'NAVIGATION',
      icon: <FileText className="w-4 h-4 text-cyan-400" />,
      action: () => navigateTo('#writing'),
    },
    {
      id: 'nav-contact',
      title: '07. Initiate Communication Protocol',
      category: 'NAVIGATION',
      icon: <Globe className="w-4 h-4 text-emerald-400" />,
      action: () => navigateTo('#contact'),
    },
    {
      id: 'action-resume',
      title: 'Download Anas Arfeen Resume PDF',
      category: 'ACTIONS',
      icon: <Download className="w-4 h-4 text-emerald-400" />,
      action: () => {
        playSound('success');
        window.open(PERSONAL_INFO.resumePath, '_blank');
        onClose();
      },
    },
    {
      id: 'action-audio',
      title: isAudioMuted() ? 'Unmute Cyber SFX Synthesizer' : 'Mute Cyber SFX Synthesizer',
      category: 'ACTIONS',
      icon: isAudioMuted() ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />,
      action: () => {
        toggleAudioMute();
        onClose();
      },
    },
    {
      id: 'ext-github',
      title: 'Open GitHub Profile (@codecrusader07)',
      category: 'EXTERNAL',
      icon: <Globe className="w-4 h-4 text-purple-400" />,
      action: () => {
        window.open(PERSONAL_INFO.github, '_blank');
        onClose();
      },
    },
    {
      id: 'ext-linkedin',
      title: 'Open LinkedIn Profile (Anas Arfeen)',
      category: 'EXTERNAL',
      icon: <Globe className="w-4 h-4 text-blue-400" />,
      action: () => {
        window.open(PERSONAL_INFO.linkedin, '_blank');
        onClose();
      },
    },
  ];

  const filteredCommands = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            playSound('click');
            onClose();
          }}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl"
        />

        {/* Console Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl glass-panel-glow rounded-3xl border-cyan-500/40 shadow-2xl z-10 overflow-hidden font-mono"
        >
          {/* Search Input Bar */}
          <div className="p-4 border-b border-slate-800 flex items-center space-x-3 bg-slate-950/90">
            <Search className="w-5 h-5 text-cyan-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search commands, sections, resume, or projects..."
              className="w-full bg-transparent text-white text-sm focus:outline-none placeholder-slate-500 font-mono"
            />
            <button
              onClick={() => {
                playSound('click');
                onClose();
              }}
              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto p-3 space-y-1">
            {filteredCommands.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs font-mono">
                NO COMMAND MATCHES &quot;{query}&quot;
              </div>
            ) : (
              filteredCommands.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => playSound('hover')}
                  className="w-full text-left p-3 rounded-xl hover:bg-cyan-500/10 flex items-center justify-between text-xs text-slate-200 hover:text-cyan-300 transition-all group border border-transparent hover:border-cyan-500/30"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 rounded-md bg-slate-900 border border-slate-800">
                      {cmd.icon}
                    </div>
                    <span>{cmd.title}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
                </button>
              ))
            )}
          </div>

          {/* Footer Shortcuts */}
          <div className="p-3 bg-slate-950 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
            <span>PRESS ESC OR CTRL+K TO CLOSE</span>
            <span className="text-cyan-400 font-bold">ANAS_OS COMMAND TERMINAL</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
