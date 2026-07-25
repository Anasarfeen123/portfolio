'use me';
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Calendar, MapPin, CheckCircle2, ShieldCheck, Terminal, Users, Sparkles } from 'lucide-react';
import { EXPERIENCES } from '@/data/portfolioData';
import { playSound } from '@/lib/audio';

export function ExperienceSection() {
  return (
    <section id="experience" className="py-24 relative overflow-hidden bg-cyber-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Section Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-mono text-xs">
            <Users className="w-3.5 h-3.5" />
            <span>05 // LEADERSHIP & TECHNICAL POSITIONS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            ORGANIZATIONAL <span className="text-gradient-emerald">TIMELINE</span>
          </h2>
          <p className="text-slate-400 max-w-2xl font-sans text-base sm:text-lg">
            Directing student AI/ML workshops at Microsoft Innovations Club, ricing Linux workflows at LUG, and building open-source initiatives.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative border-l-2 border-slate-800 ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-12">
          {EXPERIENCES.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              {/* Timeline Node Icon */}
              <div className="absolute -left-[35px] sm:-left-[51px] top-1.5 w-8 h-8 rounded-xl bg-slate-950 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <Briefcase className="w-4 h-4" />
              </div>

              {/* Experience Card */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border-slate-800 hover:border-emerald-500/40 transition-all duration-300 space-y-4">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl sm:text-2xl font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                        {exp.role}
                      </h3>
                      {exp.current && (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          CURRENT ROLE
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-sm text-slate-300 font-semibold mt-0.5">
                      {exp.organization}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      {exp.period}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      {exp.location}
                    </span>
                  </div>
                </div>

                {/* Bullet Highlights */}
                <ul className="space-y-2.5 text-slate-300 text-sm sm:text-base">
                  {exp.highlights.map((h, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />
                      <span className="leading-relaxed">{h}</span>
                    </li>
                  ))}
                </ul>

                {/* Tech Chips */}
                <div className="pt-2 flex flex-wrap gap-1.5 border-t border-slate-800/60">
                  {exp.techUsed.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 text-xs font-mono border border-emerald-500/20"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
