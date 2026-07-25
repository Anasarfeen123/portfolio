"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Download, ExternalLink, FileText, X } from "lucide-react";
import { useEffect } from "react";
import { profile } from "@/data/portfolio";

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResumeModal({ isOpen, onClose }: ResumeModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md"
        onClick={onClose}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <motion.div
          className="relative flex flex-col w-full max-w-4xl h-[88vh] overflow-hidden rounded-2xl border border-[var(--line-strong)] bg-[var(--card-bg)] text-[var(--foreground)] shadow-2xl"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          data-lenis-prevent="true"
        >
          {/* Top Bar Controls */}
          <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--card-hover)] px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <FileText size={16} className="text-[var(--accent)]" />
              <span className="font-mono text-sm font-semibold text-[var(--heading)]">
                {profile.name} — Resume.pdf
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={profile.resume}
                download="Anas_Arfeen_Resume.pdf"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--card-bg)] px-3 py-1.5 font-mono text-xs font-medium text-[var(--heading)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
              >
                <Download size={13} /> Download PDF
              </a>
              <a
                href={profile.resume}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--card-bg)] px-3 py-1.5 font-mono text-xs font-medium text-[var(--heading)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
              >
                <ExternalLink size={13} /> Open
              </a>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-[var(--muted)] hover:bg-[var(--line)] hover:text-[var(--heading)] transition-colors"
                aria-label="Close resume viewer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Embedded PDF Frame */}
          <div className="flex-1 w-full h-full bg-slate-900" data-lenis-prevent="true">
            <iframe
              src={`${profile.resume}#toolbar=0`}
              title={`${profile.name} Resume PDF`}
              className="w-full h-full border-none"
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
