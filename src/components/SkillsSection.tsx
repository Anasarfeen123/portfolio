'use me';
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Zap, Eye, Cpu, Code, Terminal, Globe, FileCode, Server, Edit3, Gamepad2, ChevronRight, Check, Sparkles } from 'lucide-react';
import { SKILLS, SkillNode } from '@/data/portfolioData';
import { playSound } from '@/lib/audio';

export function SkillsSection() {
  const [activeCategory, setActiveCategory] = useState<string>('ALL NODES');
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(SKILLS[0]);

  const categories = ['ALL NODES', 'AI/ML & RL', 'Languages & Systems', 'Developer Ecosystem'];

  const filteredSkills =
    activeCategory === 'ALL NODES'
      ? SKILLS
      : SKILLS.filter((s) => s.category === activeCategory);

  const getSkillIcon = (iconName: string) => {
    switch (iconName) {
      case 'BrainCircuit':
        return <BrainCircuit className="w-5 h-5 text-cyan-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'Eye':
        return <Eye className="w-5 h-5 text-emerald-400" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-blue-400" />;
      case 'Code':
        return <Code className="w-5 h-5 text-purple-400" />;
      case 'Terminal':
        return <Terminal className="w-5 h-5 text-cyan-300" />;
      case 'Globe':
        return <Globe className="w-5 h-5 text-emerald-300" />;
      case 'FileCode':
        return <FileCode className="w-5 h-5 text-indigo-400" />;
      case 'Server':
        return <Server className="w-5 h-5 text-amber-400" />;
      case 'Edit3':
        return <Edit3 className="w-5 h-5 text-pink-400" />;
      case 'Gamepad2':
        return <Gamepad2 className="w-5 h-5 text-rose-400" />;
      default:
        return <Cpu className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <section id="skills" className="py-24 relative overflow-hidden bg-cyber-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-950/50 border border-purple-500/30 text-purple-400 font-mono text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>03 // NEURAL CAPABILITY MATRIX</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              TECHNICAL <span className="text-gradient-purple font-mono">ECOSYSTEM</span>
            </h2>
            <p className="text-slate-400 max-w-2xl font-sans text-base">
              A interconnected matrix of machine learning algorithms, systems programming primitives, and Linux-based engineering tooling.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 glass-panel p-1.5 rounded-xl border-slate-800">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  playSound('click');
                  setActiveCategory(cat);
                }}
                onMouseEnter={() => playSound('hover')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  activeCategory === cat
                    ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid: Skills Matrix + Live Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Grid: Skill Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredSkills.map((skill) => {
                const isSelected = selectedSkill?.name === skill.name;
                return (
                  <motion.button
                    key={skill.name}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => {
                      playSound('node');
                      setSelectedSkill(skill);
                    }}
                    onMouseEnter={() => playSound('hover')}
                    className={`text-left p-4 rounded-xl transition-all duration-300 relative group overflow-hidden border ${
                      isSelected
                        ? 'glass-panel-glow border-purple-500/50 bg-slate-900/90 shadow-lg shadow-purple-950/40'
                        : 'glass-panel border-slate-800/80 hover:border-purple-500/30 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                          {getSkillIcon(skill.iconName)}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors">
                            {skill.name}
                          </h4>
                          <span className="font-mono text-[10px] text-slate-400">
                            {skill.category}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-purple-400">
                        {skill.level}%
                      </span>
                    </div>

                    {/* Skill Proficiency Meter */}
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800 mt-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full rounded-full transition-all duration-700"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Right Column: Node Inspector & Snippet Sandbox */}
          <div className="lg:col-span-5 sticky top-28">
            {selectedSkill ? (
              <motion.div
                key={selectedSkill.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="glass-panel-glow p-6 rounded-2xl border-purple-500/40 space-y-5"
              >
                {/* Inspector Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/40">
                      {getSkillIcon(selectedSkill.iconName)}
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-purple-400 uppercase font-bold tracking-widest">
                        INSPECTING NEURAL NODE
                      </span>
                      <h3 className="text-xl font-bold text-white">{selectedSkill.name}</h3>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-emerald-400 font-bold">
                    CAPACITY: {selectedSkill.level}%
                  </span>
                </div>

                <p className="text-slate-300 text-sm leading-relaxed">
                  {selectedSkill.description}
                </p>

                {/* Related Projects */}
                {selectedSkill.relatedProjects.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider block">
                      LINKED MODULES / PROJECTS
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedSkill.relatedProjects.map((proj) => (
                        <span
                          key={proj}
                          className="px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 text-purple-400" />
                          {proj}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Snippet Sandbox Preview */}
                {selectedSkill.snippet && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                        SYNTAX CODE PATTERN
                      </span>
                      <span className="font-mono text-[10px] text-cyan-400">PYTHON/CPP</span>
                    </div>
                    <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-xs overflow-x-auto leading-relaxed shadow-inner">
                      <code>{selectedSkill.snippet}</code>
                    </pre>
                  </div>
                )}

                <div className="pt-2 font-mono text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800">
                  <span>TELEMETRY // VERIFIED</span>
                  <span className="text-purple-400 font-bold">ANAS_OS KERNEL MODULE</span>
                </div>
              </motion.div>
            ) : (
              <div className="glass-panel p-8 rounded-2xl border-slate-800 text-center font-mono text-slate-400">
                SELECT A NEURAL NODE TO INSPECT CAPACITY & CODE SNIPPET
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
