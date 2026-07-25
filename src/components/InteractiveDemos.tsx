"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Play, Pause, RefreshCw, Sliders, Sparkles, X, Eye } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// --- 1. ASCII Cam Live Generator Demo ---
export function AsciiCamDemo() {
  const [inputText, setInputText] = useState("ANAS_AI");
  const [density, setDensity] = useState(1); // 0: Sparse, 1: Medium, 2: Dense
  const charSets = [
    " .:-=+*#%@",
    " ░▒▓█",
    " 010101",
  ];

  const generateAscii = () => {
    const chars = charSets[density] || charSets[0];
    const lines: string[] = [];
    const text = inputText || "DEMO";

    for (let y = 0; y < 8; y++) {
      let line = "";
      for (let x = 0; x < 28; x++) {
        const charIdx = (x + y + text.length) % text.length;
        const valIdx = Math.floor((Math.sin((x * 0.4) + (y * 0.6)) + 1) * 0.5 * (chars.length - 1));
        line += chars[valIdx] ?? chars[0];
      }
      lines.push(line);
    }
    return lines.join("\n");
  };

  return (
    <div className="mt-4 rounded-xl border border-[var(--line-strong)] bg-[#090d16] p-4 text-xs font-mono text-[#38edf8]">
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-2 text-[11px] text-[#94a3b8]">
        <span className="flex items-center gap-1.5 font-semibold text-white">
          <Sparkles size={13} className="text-[var(--accent)]" /> LIVE ASCII CAM GENERATOR
        </span>
        <span className="text-[10px] text-[#64748b]">Interactive Demo</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          maxLength={12}
          className="rounded border border-[#1e293b] bg-[#0d1527] px-2.5 py-1 text-white outline-none focus:border-[var(--accent)] text-xs"
          placeholder="Type text..."
        />
        <div className="flex items-center gap-1">
          <Sliders size={12} className="text-[#94a3b8]" />
          <button
            onClick={() => setDensity((d) => (d + 1) % charSets.length)}
            className="rounded border border-[#1e293b] bg-[#1e293b] px-2 py-0.5 text-[10px] text-[#cbd5e1] hover:text-white"
          >
            Charset: {density === 0 ? "Standard" : density === 1 ? "Shaded" : "Binary"}
          </button>
        </div>
      </div>

      <pre className="mt-3 overflow-x-auto rounded bg-[#04070d] p-3 text-[11px] leading-tight text-[#38edf8] select-all">
        {generateAscii()}
      </pre>
    </div>
  );
}

// --- 2. Cellular Automata / Game of Life Live Simulation ---
export function CellularAutomataDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(true);
  const gridRef = useRef<number[][]>([]);
  const rows = 16;
  const cols = 28;

  const createEmptyGrid = () => Array.from({ length: rows }, () => Array(cols).fill(0));
  const createRandomGrid = () =>
    Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => (Math.random() > 0.72 ? 1 : 0))
    );

  useEffect(() => {
    gridRef.current = createRandomGrid();
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const runSimulation = () => {
      if (isRunning && gridRef.current.length > 0) {
        const nextGrid = createEmptyGrid();
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            let neighbors = 0;
            for (let i = -1; i <= 1; i++) {
              for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const nr = (r + i + rows) % rows;
                const nc = (c + j + cols) % cols;
                neighbors += gridRef.current[nr][nc] > 0 ? 1 : 0;
              }
            }
            if (gridRef.current[r][c] > 0) {
              nextGrid[r][c] = neighbors === 2 || neighbors === 3 ? gridRef.current[r][c] + 1 : 0;
            } else {
              nextGrid[r][c] = neighbors === 3 ? 1 : 0;
            }
          }
        }
        gridRef.current = nextGrid;
      }

      // Draw canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#090d16";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const cellW = canvas.width / cols;
          const cellH = canvas.height / rows;

          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const age = gridRef.current[r]?.[c] ?? 0;
              if (age > 0) {
                ctx.fillStyle = age === 1 ? "#38edf8" : age === 2 ? "#ffb703" : "#ef6f6c";
                ctx.fillRect(c * cellW + 1, r * cellH + 1, cellW - 2, cellH - 2);
              }
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(() => {
        setTimeout(runSimulation, 120);
      });
    };

    runSimulation();

    return () => cancelAnimationFrame(animationFrameId);
  }, [isRunning]);

  return (
    <div className="mt-4 rounded-xl border border-[var(--line-strong)] bg-[#090d16] p-4 text-xs font-mono">
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-2 text-[11px] text-[#94a3b8]">
        <span className="flex items-center gap-1.5 font-semibold text-white">
          <Play size={12} className="text-[var(--accent)]" /> LIVE CELLULAR AUTOMATA ENGINE
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="flex items-center gap-1 rounded bg-[#1e293b] px-2 py-0.5 text-white hover:bg-[#334155]"
          >
            {isRunning ? <Pause size={10} /> : <Play size={10} />}
            {isRunning ? "Pause" : "Play"}
          </button>
          <button
            onClick={() => { gridRef.current = createRandomGrid(); }}
            className="flex items-center gap-1 rounded bg-[#1e293b] px-2 py-0.5 text-white hover:bg-[#334155]"
          >
            <RefreshCw size={10} /> Reset
          </button>
        </div>
      </div>

      <div className="mt-3 flex justify-center overflow-hidden rounded bg-[#04070d] p-2">
        <canvas ref={canvasRef} width={280} height={160} className="w-full max-w-[320px] rounded" />
      </div>
    </div>
  );
}

// --- 3. Web App Preview Modal ---
interface WebPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

export function WebPreviewModal({ isOpen, onClose, title, url }: WebPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md" onClick={onClose}>
        <motion.div
          className="relative flex flex-col w-full max-w-5xl h-[90vh] overflow-hidden rounded-2xl border border-[var(--line-strong)] bg-[#090d16] text-white shadow-2xl"
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1e293b] bg-[#060912] px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <Eye size={16} className="text-[#38edf8]" />
              <span className="font-mono text-sm font-semibold text-white">{title} — Live Web Preview</span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#1e293b] bg-[#1e293b] px-3 py-1.5 font-mono text-xs font-medium text-white hover:border-[#38edf8] transition-all"
              >
                <ExternalLink size={13} /> Open in New Tab
              </a>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-[#94a3b8] hover:bg-[#1e293b] hover:text-white transition-colors"
                aria-label="Close live preview"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Embedded Web App Frame */}
          <div className="flex-1 w-full h-full bg-[#02040a]">
            <iframe src={url} title={title} className="w-full h-full border-none" />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
