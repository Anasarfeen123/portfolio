"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, Check, Copy, RotateCcw, Send, Sparkles, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string; time: string };

const STARTER_PROMPTS = [
  "What's his strongest project?",
  "Does he know backend/full-stack?",
  "What's poke-ai actually do?",
  "How do I get in touch with him?",
];

// Whether the visitor has ever opened the panel before, on this device —
// gates the discovery badge on the trigger button (see `hasSeen` state
// below). A brand-new visitor is the one person who actually benefits
// from a "hey, this exists" nudge; showing it forever would just be a
// permanent distraction for repeat visitors who already know it's there.
const SEEN_KEY = "ai-sidebar-seen";

function timeLabel(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function TypingIndicator() {
  return (
    <div className="ai-sidebar-message-row is-assistant">
      <div className="ai-sidebar-avatar is-assistant">
        <Bot size={12} />
      </div>
      <div className="ai-sidebar-message is-assistant is-typing" aria-label="Assistant is typing">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="ai-sidebar-copy-btn"
      aria-label={copied ? "Copied" : "Copy reply"}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard permission denied or unavailable — nothing useful to
          // recover to here, the button just silently stays "not copied."
        }
      }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
    </button>
  );
}

export function AiSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeen, setHasSeen] = useState(true); // default true (no badge) until the mount effect below actually checks — avoids a flash of the badge for returning visitors on the very first paint
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkSeen = () => setHasSeen(!!localStorage.getItem(SEEN_KEY));
    checkSeen();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  // Escape-to-close and auto-focus are both scoped to isOpen so neither
  // steals a keystroke or focus while the panel is closed.
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    window.addEventListener("keydown", onKey);
    // The panel's own spring-in transition (~350ms) needs to actually
    // finish before focusing — focusing an element that's still sliding
    // in causes most browsers to yank it into view instantly, which reads
    // as a jump-cut in the middle of the slide-in animation.
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 380);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(focusTimer);
    };
  }, [isOpen]);

  function openPanel() {
    setIsOpen(true);
    if (!localStorage.getItem(SEEN_KEY)) {
      localStorage.setItem(SEEN_KEY, "1");
      setHasSeen(true);
    }
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const nextHistory: ChatMessage[] = [...messages, { role: "user", content: trimmed, time: timeLabel() }];
    setMessages(nextHistory);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      // The system prompt (grounding data + rules) is built and prepended
      // server-side (src/lib/ai-context.ts, used by src/app/api/ai-chat) —
      // only the conversation itself goes over the wire, so there's
      // nothing for a visitor to inject a fake "system" message into.
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextHistory.map(({ role, content }) => ({ role, content })) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || typeof data.reply !== "string") {
        // Every error path in the route already returns a specific,
        // human-readable string (rate-limited vs. not-configured vs.
        // provider error are genuinely different situations) — show that
        // directly instead of flattening them all into one generic
        // message, which used to swallow exactly the detail that would
        // tell a visitor whether "try again in a bit" is actually worth it.
        setError(typeof data.error === "string" ? data.error : "The AI assistant couldn't respond just now — try again in a moment, or reach out directly instead.");
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply, time: timeLabel() }]);
    } catch {
      // Reaching here means the fetch itself failed (offline, DNS, CORS) —
      // the server was never reached, so there's no server-provided error
      // string to show; this is the one case that still gets a generic
      // fallback, and it's phrased differently on purpose ("couldn't
      // reach" vs. "couldn't respond") since the failure is actually
      // different.
      setError("Couldn't reach the AI assistant — check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const lastMessage = messages[messages.length - 1];
  const askedPrompts = new Set(messages.filter((m) => m.role === "user").map((m) => m.content));
  const followUps = STARTER_PROMPTS.filter((p) => !askedPrompts.has(p)).slice(0, 2);
  const showFollowUps = !isLoading && !error && lastMessage?.role === "assistant" && followUps.length > 0;

  return (
    <>
      <button
        type="button"
        className="ai-sidebar-trigger"
        onClick={openPanel}
        aria-label="Ask an AI about Anas Arfeen"
        aria-expanded={isOpen}
      >
        <Sparkles size={16} />
        <span>Ask AI</span>
        {!hasSeen && <span className="ai-sidebar-trigger-badge" aria-hidden="true" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="ai-sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              className={`ai-sidebar-panel${isLoading ? " is-loading" : ""}`}
              role="dialog"
              aria-modal="true"
              aria-label="Ask AI about Anas Arfeen"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
            >
              <header className="ai-sidebar-header">
                <div className="flex items-center gap-2">
                  <Bot size={16} className="text-[var(--accent)]" />
                  <div>
                    <div className="ai-sidebar-title">Ask about Anas</div>
                    <div className="ai-sidebar-subtitle">Grounded on this site&apos;s real data — no guessing.</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {messages.length > 0 && (
                    <button
                      type="button"
                      className="ai-sidebar-icon-btn"
                      onClick={() => {
                        setMessages([]);
                        setError(null);
                      }}
                      aria-label="Reset conversation"
                      title="Reset conversation"
                    >
                      <RotateCcw size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    className="ai-sidebar-icon-btn"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </header>

              <div className="ai-sidebar-messages" ref={scrollRef}>
                {messages.length === 0 && (
                  <div className="ai-sidebar-starters">
                    <p className="ai-sidebar-starters-copy">
                      Grounded on this portfolio&apos;s real project/experience data, running on{" "}
                      <span className="text-[var(--accent)]">Groq</span> — the same fast-inference provider{" "}
                      <span className="text-[var(--accent)]">Reverse Akinator</span> can call. Pick a question, or ask your own.
                    </p>
                    {STARTER_PROMPTS.map((prompt) => (
                      <button key={prompt} type="button" className="ai-sidebar-starter-chip" onClick={() => send(prompt)}>
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    className={`ai-sidebar-message-row is-${m.role}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  >
                    <div className={`ai-sidebar-avatar is-${m.role}`}>
                      {m.role === "assistant" ? <Bot size={12} /> : <User size={12} />}
                    </div>
                    <div className="ai-sidebar-message-col">
                      <div className={`ai-sidebar-message is-${m.role}`}>{m.content}</div>
                      <div className="ai-sidebar-message-meta">
                        <span>{m.time}</span>
                        {m.role === "assistant" && <CopyButton text={m.content} />}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isLoading && <TypingIndicator />}
                {error && <div className="ai-sidebar-error">{error}</div>}

                {showFollowUps && (
                  <div className="ai-sidebar-followups">
                    {followUps.map((prompt) => (
                      <button key={prompt} type="button" className="ai-sidebar-starter-chip is-followup" onClick={() => send(prompt)}>
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <form
                className="ai-sidebar-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  className="hud-input"
                  placeholder="Ask something..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  aria-label="Your question"
                />
                <button type="submit" className="ai-sidebar-send" disabled={isLoading || !input.trim()} aria-label="Send">
                  <Send size={15} />
                </button>
              </form>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
