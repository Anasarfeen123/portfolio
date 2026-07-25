'use me';
'use client';

import React, { useState, useEffect } from 'react';
import { Terminal, Volume2, VolumeX, Command, Cpu, Download, Sparkles } from 'lucide-react';
import { PERSONAL_INFO } from '@/data/portfolioData';
import { toggleAudioMute, isAudioMuted, playSound } from '@/lib/audio';

interface NavbarProps {
  onOpenCommandPalette: () => void;
}

export function Navbar({ onOpenCommandPalette }: NavbarProps) {
  const [timeString, setTimeString] = useState<string>('');
  const [audioMuted, setAudioMuted] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    setAudioMuted(isAudioMuted());

    const updateClock = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' IST'
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);

    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleAudioToggle = () => {
    const newMuted = toggleAudioMute();
    setAudioMuted(newMuted);
    if (!newMuted) {
      playSound('click');
    }
  };

  const navItems = [
    { label: '01.SYSTEM', href: '#hero' },
    { label: '02.JOURNEY', href: '#about' },
    { label: '03.NEURAL', href: '#skills' },
    { label: '04.MODULES', href: '#projects' },
    { label: '05.TIMELINE', href: '#experience' },
    { label: '06.NOTEBOOK', href: '#writing' },
    { label: '07.PROTOCOL', href: '#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-950/80 backdrop-blur-xl border-b border-cyan-500/20 py-3 shadow-2xl shadow-cyan-950/20'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo & System Status */}
        <a
          href="#hero"
          onClick={() => playSound('hover')}
          className="flex items-center space-x-3 group"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/40 group-hover:border-cyan-400 transition-all duration-300">
            <Cpu className="w-5 h-5 text-cyan-400 group-hover:rotate-45 transition-transform duration-500" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-bold text-white tracking-wider group-hover:text-cyan-400 transition-colors">
                ANAS_OS
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                v4.0
              </span>
            </div>
            <p className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              MIC AI/ML CO-LEAD
            </p>
          </div>
        </a>

        {/* Desktop Nav Nodes */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 glass-panel px-4 py-1.5 rounded-full border-slate-800/80">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onMouseEnter={() => playSound('hover')}
              onClick={() => playSound('click')}
              className="font-mono text-xs text-slate-300 hover:text-cyan-400 px-3 py-1 rounded-md transition-all hover:bg-cyan-500/10"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Action HUD Controls */}
        <div className="flex items-center space-x-3">
          {/* Command Prompt Shortcut */}
          <button
            onClick={() => {
              playSound('click');
              onOpenCommandPalette();
            }}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 text-xs font-mono transition-all group"
            title="Open Command Console (Ctrl+K)"
          >
            <Command className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">CMD</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-slate-800 rounded border border-slate-700 text-slate-400">
              Ctrl+K
            </kbd>
          </button>

          {/* Audio Synthesizer Toggle */}
          <button
            onClick={handleAudioToggle}
            className={`p-2 rounded-lg border transition-all ${
              audioMuted
                ? 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-300'
                : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-400 shadow-sm shadow-cyan-500/20'
            }`}
            title={audioMuted ? 'Unmute Cyber SFX' : 'Mute Cyber SFX'}
          >
            {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Resume PDF Quick Download */}
          <a
            href={PERSONAL_INFO.resumePath}
            download="Anas_Arfeen_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playSound('success')}
            className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-mono font-semibold shadow-lg shadow-cyan-950/40 transition-all hover:scale-105 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>RESUME</span>
          </a>
        </div>
      </div>
    </header>
  );
}
