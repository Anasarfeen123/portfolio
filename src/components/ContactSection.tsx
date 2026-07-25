'use me';
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Download, Copy, Check, Send, Terminal, Sparkles, Globe, Cpu } from 'lucide-react';
import { Github, Linkedin } from '@/components/Icons';
import { PERSONAL_INFO } from '@/data/portfolioData';
import { playSound } from '@/lib/audio';

export function ContactSection() {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [msgStatus, setMsgStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [formInput, setFormInput] = useState({ name: '', email: '', message: '' });

  const handleCopyEmail = () => {
    playSound('success');
    navigator.clipboard.writeText(PERSONAL_INFO.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInput.email || !formInput.message) return;
    playSound('terminal');
    setMsgStatus('sending');
    setTimeout(() => {
      playSound('success');
      setMsgStatus('sent');
    }, 1200);
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden bg-slate-950">
      {/* Background Radial Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-t from-cyan-500/10 via-purple-500/5 to-transparent blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Section Title */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
            <Terminal className="w-3.5 h-3.5" />
            <span>08 // COMMUNICATION PROTOCOL & LAUNCH POINT</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            LET&apos;S BUILD <span className="text-gradient-cyan">SOMETHING AMAZING</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg font-sans">
            Interested in AI research, autonomous agent architectures, open-source development, or technical leadership? Initiate connection protocol below.
          </p>
        </div>

        {/* Communication Terminal & Quick Links Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Quick Contact Cards */}
          <div className="lg:col-span-5 space-y-4">
            {/* Email Card with Copy */}
            <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-400 uppercase">DIRECT EMAIL</span>
                <button
                  onClick={handleCopyEmail}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 font-mono text-[11px] transition-all"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-cyan-400" />
                      <span>COPY EMAIL</span>
                    </>
                  )}
                </button>
              </div>
              <a
                href={`mailto:${PERSONAL_INFO.email}`}
                className="text-xl font-bold text-white hover:text-cyan-400 font-mono transition-colors block"
              >
                {PERSONAL_INFO.email}
              </a>
            </div>

            {/* Social Protocols */}
            <div className="grid grid-cols-2 gap-4">
              <a
                href={PERSONAL_INFO.github}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playSound('click')}
                onMouseEnter={() => playSound('hover')}
                className="glass-panel p-4 rounded-2xl border-slate-800 hover:border-cyan-500/40 transition-all group flex items-center space-x-3"
              >
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 group-hover:text-cyan-400 group-hover:border-cyan-500/40 transition-colors">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">
                    GitHub
                  </div>
                  <div className="font-mono text-[10px] text-slate-400">@codecrusader07</div>
                </div>
              </a>

              <a
                href={PERSONAL_INFO.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playSound('click')}
                onMouseEnter={() => playSound('hover')}
                className="glass-panel p-4 rounded-2xl border-slate-800 hover:border-cyan-500/40 transition-all group flex items-center space-x-3"
              >
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 group-hover:text-cyan-400 group-hover:border-cyan-500/40 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">
                    LinkedIn
                  </div>
                  <div className="font-mono text-[10px] text-slate-400">Anas Arfeen</div>
                </div>
              </a>
            </div>

            {/* Resume Download Action Banner */}
            <div className="glass-panel-glow p-6 rounded-2xl border-cyan-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-cyan-400 uppercase font-bold">
                  CURRICULUM VITAE // PDF
                </span>
                <span className="font-mono text-[10px] text-emerald-400">UPDATED 2026</span>
              </div>
              <p className="text-slate-300 text-xs font-sans leading-relaxed">
                Download Anas Arfeen&apos;s full resume detailing computer science engineering coursework, AI leadership, and software projects.
              </p>
              <a
                href={PERSONAL_INFO.resumePath}
                download="Anas_Arfeen_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playSound('success')}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-mono font-bold text-xs transition-all shadow-lg shadow-cyan-950/40 hover:scale-102"
              >
                <Download className="w-4 h-4" />
                <span>DOWNLOAD RESUME PDF</span>
              </a>
            </div>
          </div>

          {/* Right Column: Terminal Contact Form */}
          <div className="lg:col-span-7">
            <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl border-cyan-500/40 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 font-mono text-xs">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span className="text-white font-bold">COMMUNICATION TERMINAL</span>
                </div>
                <span className="text-emerald-400">ENCRYPTED // TLS v1.3</span>
              </div>

              {msgStatus === 'sent' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/50">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">TRANSMISSION DELIVERED</h3>
                  <p className="text-slate-300 font-mono text-xs">
                    Your message packet has been queued in Anas Arfeen&apos;s terminal inbox.
                  </p>
                  <button
                    onClick={() => {
                      playSound('click');
                      setMsgStatus('idle');
                      setFormInput({ name: '', email: '', message: '' });
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 font-mono text-xs border border-slate-700 mt-2"
                  >
                    SEND ANOTHER TRANSMISSION
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4 font-mono">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 uppercase">NAME // CALLSIGN</label>
                      <input
                        type="text"
                        required
                        value={formInput.name}
                        onChange={(e) => setFormInput({ ...formInput, name: e.target.value })}
                        placeholder="e.g. Alex Turing"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 text-xs focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 uppercase">EMAIL ADDRESS</label>
                      <input
                        type="email"
                        required
                        value={formInput.email}
                        onChange={(e) => setFormInput({ ...formInput, email: e.target.value })}
                        placeholder="e.g. alex@ai.org"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 text-xs focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 uppercase">TRANSMISSION MESSAGE</label>
                    <textarea
                      rows={4}
                      required
                      value={formInput.message}
                      onChange={(e) => setFormInput({ ...formInput, message: e.target.value })}
                      placeholder="Type your transmission details..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-100 text-xs focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={msgStatus === 'sending'}
                    className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-cyan-500/20"
                  >
                    {msgStatus === 'sending' ? (
                      <span>TRANSMITTING PACKET...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>DISPATCH TRANSMISSION</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Footer Copyright & Kernel Info */}
        <div className="pt-12 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between font-mono text-xs text-slate-500 gap-4">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>ANAS_OS v4.0 • DESIGNED & ENGINEERED BY ANAS ARFEEN</span>
          </div>
          <span>VIT CHENNAI • ARCH LINUX • PYTORCH</span>
        </div>
      </div>
    </section>
  );
}
