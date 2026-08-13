"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Keyboard, X } from "lucide-react";
import { useEffect, useState } from "react";

const SHORTCUTS: { keys: string; description: string }[] = [
  { keys: "⌘/Ctrl K", description: "Open the developer terminal" },
  { keys: "?", description: "Show this shortcuts overlay" },
  { keys: "Esc", description: "Close whatever's open" },
  { keys: "↑ ↓ ← →", description: "Move in Snake / Pong / Invaders / the guessing game (inside the terminal)" },
  { keys: "Tab", description: "Autocomplete a command (inside the terminal)" },
];

/** Mounted once in the root layout so `?` works on every page. Ignores the
 * keypress while any input/textarea/contenteditable is focused — otherwise
 * typing a literal "?" anywhere (the contact form, the terminal's own input)
 * would fight with this. */
export function ShortcutsOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        return;
      }

      if (e.key !== "?" || e.metaKey || e.ctrlKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;

      e.preventDefault();
      setOpen((v) => !v);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="w-[min(420px,92vw)] rounded-2xl border border-[var(--line-strong)] bg-[var(--card-hover)] p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                <Keyboard size={14} /> Shortcuts
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-[var(--muted)] hover:bg-[var(--line)] hover:text-[var(--heading)] transition-colors cursor-pointer"
                aria-label="Close shortcuts overlay"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {SHORTCUTS.map((s) => (
                <div key={s.keys} className="flex items-center justify-between gap-4">
                  <span className="text-xs text-[var(--muted)]">{s.description}</span>
                  <kbd className="shrink-0 rounded-md border border-[var(--line-strong)] bg-[var(--background)] px-2 py-1 font-mono text-[11px] font-semibold text-[var(--heading)] whitespace-nowrap">
                    {s.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
