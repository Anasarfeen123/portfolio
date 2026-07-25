'use me';
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, ExternalLink, Cpu, Layers, Sparkles, Activity, ShieldAlert, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Github } from '@/components/Icons';
import { PROJECTS, Project } from '@/data/portfolioData';
import { playSound } from '@/lib/audio';

interface ProjectsSectionProps {
  onSelectProject: (project: Project) => void;
}

export function ProjectsSection({ onSelectProject }: ProjectsSectionProps) {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const categories = ['ALL', 'AI/ML', 'Systems', 'Web & Tools', 'Deep Learning'];

  const filteredProjects =
    filterCategory === 'ALL'
      ? PROJECTS
      : PROJECTS.filter((p) => p.category === filterCategory);

  return (
    <section id="projects" className="py-24 relative overflow-hidden bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
              <Cpu className="w-3.5 h-3.5" />
              <span>04 // SYSTEM PROCESSES & R&D MODULES</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              FEATURED <span className="text-gradient-cyan">PROJECT LAUNCHES</span>
            </h2>
            <p className="text-slate-400 max-w-2xl font-sans text-base sm:text-lg">
              Autonomous reinforcement learning agents, CLI developer tools, facial vector deep learning, and spatial crowd-sourced telemetry.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 glass-panel p-1.5 rounded-xl border-slate-800">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  playSound('click');
                  setFilterCategory(cat);
                }}
                onMouseEnter={() => playSound('hover')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  filterCategory === cat
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group glass-panel rounded-3xl p-6 sm:p-8 border-slate-800 hover:border-cyan-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-950/40 flex flex-col justify-between relative overflow-hidden"
            >
              {/* Subtle Top Glow Accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent group-hover:via-cyan-400 transition-all duration-500" />

              <div className="space-y-6">
                {/* Top Status & Category Row */}
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase font-bold">
                    {project.category}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                      project.status === 'Active R&D'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        : project.status === 'Open Source'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                    {project.title}
                  </h3>
                  <p className="font-mono text-xs text-cyan-400/90 leading-normal">
                    {project.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-3">
                  {project.description}
                </p>

                {/* Key Metrics Chips */}
                {project.metrics && (
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {project.metrics.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center"
                      >
                        <div className="font-mono text-[9px] text-slate-400 uppercase tracking-tight">
                          {m.label}
                        </div>
                        <div className="font-mono text-xs font-bold text-cyan-400">
                          {m.value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tech Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 text-xs font-mono border border-slate-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-8 flex items-center justify-between border-t border-slate-800/80 mt-6">
                <button
                  onClick={() => {
                    playSound('click');
                    onSelectProject(project);
                  }}
                  onMouseEnter={() => playSound('hover')}
                  className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 font-mono text-xs font-bold transition-colors group/btn"
                >
                  <Layers className="w-4 h-4 text-cyan-400 group-hover/btn:scale-110 transition-transform" />
                  <span>INSPECT ARCHITECTURE & DEMO</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </button>

                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => playSound('click')}
                    onMouseEnter={() => playSound('hover')}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-white transition-all"
                    title="View GitHub Repository"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
