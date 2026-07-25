'use me';
'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Terminal, ShieldCheck, Sparkles, ChevronDown, Download, Brain, ArrowRight } from 'lucide-react';
import { PERSONAL_INFO } from '@/data/portfolioData';
import { playSound } from '@/lib/audio';

interface HeroProps {
  onOpenCommandPalette: () => void;
}

export function Hero({ onOpenCommandPalette }: HeroProps) {
  return (
    <section
      id="hero"
      className="relative min-h-screen pt-28 pb-16 flex items-center justify-center overflow-hidden bg-cyber-grid"
    >
      {/* Radial Gradient Spotlight */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Text & Hero Headline */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            {/* HUD Status Tag */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-cyan-400 text-xs font-mono backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span>SYSTEM READY // AI ENGINEER & SYSTEMS DEVELOPER</span>
            </div>

            {/* Massive Cinematic Heading */}
            <div className="space-y-2">
              <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-400 font-bold">
                COMMAND CENTER // ARCH LINUX & NEOVIM
              </h2>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-none">
                BUILDING THE <br />
                <span className="text-gradient-cyan">FUTURE</span> WITH <br />
                <span className="text-gradient-emerald">CODE + AI</span>
              </h1>
            </div>

            {/* Role & Name */}
            <div className="border-l-2 border-cyan-500/50 pl-4 py-1 space-y-1">
              <p className="text-xl sm:text-2xl font-semibold text-slate-100 font-sans">
                {PERSONAL_INFO.name}
              </p>
              <p className="font-mono text-sm text-slate-400">
                AI/ML Co-Lead @ Microsoft Innovations Club (MIC) | VIT Chennai
              </p>
            </div>

            {/* Subtext Tagline */}
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl font-sans leading-relaxed">
              {PERSONAL_INFO.tagline}
            </p>

            {/* Telemetry Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 max-w-xl py-2">
              <div className="glass-panel p-3 rounded-lg border-slate-800">
                <div className="font-mono text-[10px] text-slate-400 uppercase">RL AGENTS</div>
                <div className="font-mono text-lg font-bold text-cyan-400">98.4% ACC</div>
              </div>
              <div className="glass-panel p-3 rounded-lg border-slate-800">
                <div className="font-mono text-[10px] text-slate-400 uppercase">PRIMARY OS</div>
                <div className="font-mono text-lg font-bold text-emerald-400">ARCH LINUX</div>
              </div>
              <div className="glass-panel p-3 rounded-lg border-slate-800">
                <div className="font-mono text-[10px] text-slate-400 uppercase">COMMUNITY</div>
                <div className="font-mono text-lg font-bold text-purple-400">MIC CO-LEAD</div>
              </div>
            </div>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => {
                  playSound('click');
                  onOpenCommandPalette();
                }}
                onMouseEnter={() => playSound('hover')}
                className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-cyan-500 text-slate-950 font-mono font-bold text-sm hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/25 hover:scale-105 active:scale-95"
              >
                <Terminal className="w-4 h-4" />
                <span>LAUNCH COMMAND PALETTE</span>
              </button>

              <a
                href="#projects"
                onClick={() => playSound('click')}
                onMouseEnter={() => playSound('hover')}
                className="flex items-center space-x-2 px-6 py-3.5 rounded-xl glass-panel text-white font-mono text-sm hover:border-cyan-500/50 hover:text-cyan-400 transition-all hover:scale-105"
              >
                <span>EXPLORE PROJECTS</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          {/* Right Column: Bio-Scanner Profile Picture HUD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="relative w-full max-w-md">
              {/* Outer Glowing Cyber HUD Frame */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 opacity-30 blur-lg animate-pulse-glow" />

              <div className="relative glass-panel-glow p-4 rounded-2xl border-cyan-500/30 space-y-4">
                {/* HUD Header Bar */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-mono text-[11px] text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-cyan-400" />
                    <span className="text-white font-semibold">NEURAL_ID // 07</span>
                  </div>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED
                  </span>
                </div>

                {/* Profile Image with Bio-Scanner Overlay */}
                <div className="relative aspect-square rounded-xl overflow-hidden border border-cyan-500/40 group">
                  <Image
                    src={PERSONAL_INFO.avatarPath}
                    alt={PERSONAL_INFO.name}
                    fill
                    className="object-cover object-center filter contrast-105 brightness-95 group-hover:scale-105 transition-transform duration-700"
                    priority
                  />

                  {/* Bio Scanner Grid Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  <div className="absolute inset-0 bg-cyber-grid opacity-30 pointer-events-none" />

                  {/* Scanning Bar Animation */}
                  <div className="absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_15px_#00f0ff] animate-scanline pointer-events-none opacity-70" />

                  {/* Dynamic Corner Target Reticles */}
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

                  {/* Profile Bottom Floating Badge */}
                  <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 flex items-center justify-between font-mono text-xs">
                    <div>
                      <p className="text-white font-bold">ANAS ARFEEN</p>
                      <p className="text-[10px] text-cyan-400">PPO/SAC • PyTorch • Linux</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      ONLINE
                    </span>
                  </div>
                </div>

                {/* Telemetry Audio Frequency Bars Simulator */}
                <div className="pt-1 flex items-center justify-between font-mono text-[10px] text-slate-400">
                  <span>AUDIO_FREQ // RX</span>
                  <div className="flex items-end space-x-1 h-4">
                    {[60, 90, 40, 100, 70, 85, 50, 95, 40, 80].map((h, i) => (
                      <span
                        key={i}
                        className="w-1 bg-cyan-400/80 rounded-t animate-pulse"
                        style={{
                          height: `${h}%`,
                          animationDelay: `${i * 100}ms`,
                        }}
                      />
                    ))}
                  </div>
                  <span>100% SYS_OK</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="mt-16 flex justify-center">
          <a
            href="#about"
            onClick={() => playSound('click')}
            className="flex flex-col items-center space-y-2 text-slate-400 hover:text-cyan-400 font-mono text-xs transition-colors group"
          >
            <span>SCROLL TO INITIALIZE STORY</span>
            <ChevronDown className="w-4 h-4 animate-bounce text-cyan-400" />
          </a>
        </div>
      </div>
    </section>
  );
}
