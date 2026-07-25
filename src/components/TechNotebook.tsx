'use me';
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, BookOpen, Clock, Tag, ChevronRight, Copy, Check, Sparkles } from 'lucide-react';
import { ARTICLES, Article } from '@/data/portfolioData';
import { playSound } from '@/lib/audio';

export function TechNotebook() {
  const [selectedArticle, setSelectedArticle] = useState<Article>(ARTICLES[0]);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopySnippet = () => {
    playSound('click');
    navigator.clipboard.writeText(selectedArticle.contentSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="writing" className="py-24 relative overflow-hidden bg-cyber-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
            <Terminal className="w-3.5 h-3.5" />
            <span>07 // DEVELOPER NOTEBOOK & RESEARCH LOGS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            TECHNICAL <span className="text-gradient-cyan">EXPOSITIONS</span>
          </h2>
          <p className="text-slate-400 max-w-2xl font-sans text-base sm:text-lg">
            Engineering benchmarks, PyTorch reinforcement learning breakdowns, and Unix productivity ricing guides.
          </p>
        </div>

        {/* Notebook Main Layout: Article List + Terminal Excerpt */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Article Selector List */}
          <div className="lg:col-span-5 space-y-4">
            {ARTICLES.map((article) => {
              const isSelected = selectedArticle.id === article.id;
              return (
                <button
                  key={article.id}
                  onClick={() => {
                    playSound('terminal');
                    setSelectedArticle(article);
                  }}
                  onMouseEnter={() => playSound('hover')}
                  className={`w-full text-left p-5 rounded-2xl transition-all duration-300 relative group overflow-hidden border ${
                    isSelected
                      ? 'glass-panel-glow border-cyan-500/50 bg-slate-900/90 shadow-xl shadow-cyan-950/30'
                      : 'glass-panel border-slate-800 hover:border-cyan-500/30 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      {article.readTime}
                    </span>
                    <span>{article.date}</span>
                  </div>

                  <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors mb-1.5">
                    {article.title}
                  </h3>

                  <p className="text-slate-400 text-xs line-clamp-2">{article.summary}</p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {article.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded bg-slate-950 text-cyan-400 font-mono text-[10px] border border-slate-800"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Terminal Reader Window */}
          <div className="lg:col-span-7 sticky top-28">
            <motion.div
              key={selectedArticle.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="glass-panel-glow p-6 sm:p-8 rounded-3xl border-cyan-500/40 space-y-5"
            >
              {/* Terminal Titlebar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                  <span className="ml-2 text-slate-400">
                    anas@archlinux:~/notebook/{selectedArticle.id}.md
                  </span>
                </div>

                <button
                  onClick={handleCopySnippet}
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 text-[11px] transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-cyan-400" />
                      <span>COPY EXCERPT</span>
                    </>
                  )}
                </button>
              </div>

              {/* Article Header */}
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  {selectedArticle.title}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {selectedArticle.summary}
                </p>
              </div>

              {/* Terminal Code Snippet Box */}
              <pre className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-xs sm:text-sm overflow-x-auto leading-relaxed shadow-inner">
                <code>{selectedArticle.contentSnippet}</code>
              </pre>

              <div className="pt-2 flex items-center justify-between font-mono text-[10px] text-slate-400 border-t border-slate-800">
                <span>AUTHOR: ANAS ARFEEN</span>
                <span className="text-cyan-400 font-bold">NEOVIM / ARCH LINUX ARCHIVE</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
