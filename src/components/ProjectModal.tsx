'use me';
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Cpu, Layers, CheckCircle2, ShieldCheck, Terminal, ArrowRight } from 'lucide-react';
import { Github } from '@/components/Icons';
import { Project } from '@/data/portfolioData';
import { playSound } from '@/lib/audio';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  if (!project) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
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

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-4xl glass-panel-glow p-6 sm:p-8 rounded-3xl border-cyan-500/40 shadow-2xl z-10 space-y-6 max-h-[90vh] overflow-y-auto my-auto"
        >
          {/* Header Bar */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                  {project.category}
                </span>
                <span className="font-mono text-xs text-slate-400">
                  ID: {project.id.toUpperCase()} // STATUS: {project.status}
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                {project.title}
              </h2>
              <p className="font-mono text-xs text-cyan-400">{project.subtitle}</p>
            </div>

            <button
              onClick={() => {
                playSound('click');
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Overview Grid: Problem -> Solution -> Impact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <span className="font-mono text-xs text-red-400 font-bold uppercase block">
                01 // PROBLEM STATEMENT
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">{project.problem}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <span className="font-mono text-xs text-cyan-400 font-bold uppercase block">
                02 // ARCHITECTURAL SOLUTION
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">{project.solution}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <span className="font-mono text-xs text-emerald-400 font-bold uppercase block">
                03 // EMPIRICAL IMPACT
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">{project.impact}</p>
            </div>
          </div>

          {/* Architecture Pipeline Schematic Breakdown */}
          <div className="space-y-3">
            <h3 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              SYSTEM ARCHITECTURE SCHEMATIC & PIPELINE LAYERS
            </h3>

            <div className="p-4 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              {project.architecture.map((layer, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-3 p-3 rounded-xl bg-slate-900/70 border border-slate-800/80"
                >
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 font-bold text-[10px] border border-cyan-500/30">
                    LAYER {idx + 1}
                  </span>
                  <p className="text-slate-200 text-xs font-sans leading-relaxed">{layer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Metrics & Stack Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider block">
                TECHNOLOGY STACK
              </span>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-md bg-slate-900 text-cyan-300 text-xs font-mono border border-slate-800"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {project.metrics && (
              <div className="space-y-2">
                <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider block">
                  SYSTEM BENCHMARKS
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {project.metrics.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center"
                    >
                      <div className="font-mono text-[9px] text-slate-400">{m.label}</div>
                      <div className="font-mono text-xs font-bold text-emerald-400">{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Links */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-800">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playSound('click')}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-mono text-xs font-semibold transition-all"
              >
                <Github className="w-4 h-4" />
                <span>OPEN REPOSITORY</span>
              </a>
            )}

            <button
              onClick={() => {
                playSound('click');
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-cyan-950/40"
            >
              CLOSE INSPECTOR
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
