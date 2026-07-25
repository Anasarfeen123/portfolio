'use me';
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Cpu, Brain, Rocket, Award, CheckCircle2, ChevronRight, BookOpen, Layers } from 'lucide-react';
import { JOURNEY, PERSONAL_INFO } from '@/data/portfolioData';
import { playSound } from '@/lib/audio';

export function AboutSection() {
  const [selectedMilestone, setSelectedMilestone] = useState<number>(3); // Default to current

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Terminal':
        return <Terminal className="w-5 h-5 text-cyan-400" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-emerald-400" />;
      case 'Brain':
        return <Brain className="w-5 h-5 text-purple-400" />;
      case 'Rocket':
        return <Rocket className="w-5 h-5 text-amber-400" />;
      default:
        return <Layers className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <section id="about" className="py-24 relative overflow-hidden bg-slate-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Section Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
            <BookOpen className="w-3.5 h-3.5" />
            <span>02 // THE EVOLUTION MATRIX</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            ENGINEERING <span className="text-gradient-emerald">JOURNEY & PHILOSOPHY</span>
          </h2>
          <p className="text-slate-400 max-w-3xl font-sans text-base sm:text-lg">
            From discovering Unix terminal environments to spearheading AI/ML initiatives as Co-Lead at Microsoft Innovations Club (MIC) VIT Chennai.
          </p>
        </div>

        {/* Brand Statement Box */}
        <div className="glass-panel-glow p-6 sm:p-8 rounded-2xl border-cyan-500/30 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <h3 className="font-mono text-sm uppercase tracking-wider text-cyan-400 font-bold">
              CORE BRAND IDENTITY
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-white font-sans leading-snug">
              &quot;{PERSONAL_INFO.brandStatement}&quot;
            </p>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              I view engineering not just as code execution, but as architecting intelligent systems with mathematical rigor, memory optimization, and open-source transparency. Whether ricing Neovim on Arch Linux or training Proximal Policy Optimization (PPO) reinforcement learning agents in PyTorch, my focus is speed, efficiency, and real-world impact.
            </p>
          </div>

          <div className="lg:col-span-4 space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-slate-400">INSTITUTION</div>
              <div className="text-white font-semibold">{PERSONAL_INFO.institution}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-slate-400">DEGREE PROGRAM</div>
              <div className="text-emerald-400 font-semibold">{PERSONAL_INFO.degree}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-center">
                <div className="text-slate-400 text-[10px]">CBSE CLASS 12</div>
                <div className="text-cyan-400 font-bold text-base">90%</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-center">
                <div className="text-slate-400 text-[10px]">CBSE CLASS 10</div>
                <div className="text-cyan-400 font-bold text-base">94%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Story Timeline Grid */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              INTERACTIVE CHRONOLOGICAL NODES
            </h3>
            <span className="font-mono text-xs text-slate-400">SELECT NODE TO INSPECT</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {JOURNEY.map((item, idx) => {
              const isSelected = selectedMilestone === idx;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    playSound('click');
                    setSelectedMilestone(idx);
                  }}
                  onMouseEnter={() => playSound('hover')}
                  className={`text-left p-5 rounded-2xl transition-all duration-300 relative group overflow-hidden ${
                    isSelected
                      ? 'glass-panel-glow border-cyan-500/50 scale-102 shadow-xl shadow-cyan-950/30'
                      : 'glass-panel border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  {/* Top Status Bar */}
                  <div className="flex items-center justify-between mb-3 font-mono text-xs">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.tag}
                    </span>
                    <span className="text-slate-400 font-semibold">{item.year}</span>
                  </div>

                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      {getIcon(item.icon)}
                    </div>
                    <h4 className="font-bold text-white text-base group-hover:text-cyan-400 transition-colors">
                      {item.title}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">{item.subtitle}</p>

                  {isSelected && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-emerald-400"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Milestone Inspection Panel */}
          <motion.div
            key={selectedMilestone}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-panel p-6 sm:p-8 rounded-2xl border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40">
                  {getIcon(JOURNEY[selectedMilestone].icon)}
                </div>
                <div>
                  <span className="font-mono text-xs text-cyan-400 uppercase font-bold">
                    MILESTONE {selectedMilestone + 1} OF 4 // {JOURNEY[selectedMilestone].year}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    {JOURNEY[selectedMilestone].title}
                  </h3>
                </div>
              </div>
              <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono">
                {JOURNEY[selectedMilestone].tag} ARCHIVE
              </span>
            </div>

            <p className="text-slate-300 text-base leading-relaxed">
              {JOURNEY[selectedMilestone].description}
            </p>

            <div className="pt-2 flex items-center space-x-2 font-mono text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>STATUS: LOGGED & VERIFIED IN ANAS_OS KERNEL HISTORY</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
