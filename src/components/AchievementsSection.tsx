'use me';
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, Star, ShieldCheck, Sparkles, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ACHIEVEMENTS } from '@/data/portfolioData';
import { playSound } from '@/lib/audio';

export function AchievementsSection() {
  const triggerConfetti = (e: React.MouseEvent) => {
    playSound('success');
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { x, y },
      colors: ['#00f0ff', '#00ff9d', '#a855f7', '#fbbf24']
    });
  };

  return (
    <section id="achievements" className="py-24 relative overflow-hidden bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-yellow-950/50 border border-yellow-500/30 text-yellow-400 font-mono text-xs">
            <Trophy className="w-3.5 h-3.5" />
            <span>06 // TROPHY VAULT & VERIFIED BENCHMARKS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            HONORS & <span className="text-gradient-cyan">MILESTONES</span>
          </h2>
          <p className="text-slate-400 max-w-2xl font-sans text-base sm:text-lg">
            Peer-recognized leadership appointments, open-source repository releases, and empirical AI benchmarks.
          </p>
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ACHIEVEMENTS.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              onClick={(e) => triggerConfetti(e)}
              onMouseEnter={() => playSound('hover')}
              className="glass-panel p-6 rounded-3xl border-slate-800 hover:border-yellow-500/40 transition-all duration-300 cursor-pointer group hover:scale-102 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-yellow-950/40 border border-yellow-500/30 text-yellow-400 group-hover:rotate-12 transition-transform">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                    {item.badgeText}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-yellow-300 transition-colors">
                  {item.title}
                </h3>
                <p className="font-mono text-xs text-cyan-400">{item.issuer}</p>
                <p className="text-slate-300 text-xs leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between font-mono text-[10px] text-slate-400">
                <span>DATE: {item.date}</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> VERIFIED
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
