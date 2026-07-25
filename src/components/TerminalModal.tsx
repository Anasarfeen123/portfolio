"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CornerDownLeft, Gamepad2, Sparkles, Terminal as TerminalIcon, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { experience, profile, projects, skillClusters } from "@/data/portfolio";

type OutputLine = {
  id: string;
  type: "command" | "response" | "system" | "error";
  text: string;
};

interface TerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleTheme: () => void;
  onOpenResume: () => void;
}

const availableCommands = [
  "help",
  "whoami",
  "neofetch",
  "fastfetch",
  "github",
  "telemetry",
  "stats",
  "snake",
  "pong",
  "guess",
  "projects",
  "skills",
  "experience",
  "ls",
  "cat",
  "ping",
  "matrix",
  "ascii",
  "quote",
  "sudo",
  "date",
  "time",
  "history",
  "contact",
  "resume",
  "theme",
  "clear",
  "exit",
];

const quickPills = ["neofetch", "projects", "skills", "snake", "pong", "matrix", "clear", "help"];
const availableFiles = ["bio.txt", "contact.txt", "resume.txt", "stack.txt"];

// --- 1. Terminal Snake Game Component ---
function TerminalSnakeGame({ onQuit }: { onQuit: () => void }) {
  const width = 22;
  const height = 11;
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([
    { x: 10, y: 5 },
    { x: 9, y: 5 },
    { x: 8, y: 5 },
  ]);
  const [direction, setDirection] = useState<{ x: number; y: number }>({ x: 1, y: 0 });
  const [food, setFood] = useState<{ x: number; y: number }>({ x: 16, y: 5 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const spawnFood = (currentSnake: { x: number; y: number }[]) => {
    let newX: number, newY: number;
    do {
      newX = Math.floor(Math.random() * width);
      newY = Math.floor(Math.random() * height);
    } while (currentSnake.some((s) => s.x === newX && s.y === newY));
    return { x: newX, y: newY };
  };

  const handleMove = (dir: "up" | "down" | "left" | "right") => {
    if (dir === "up" && direction.y !== 1) setDirection({ x: 0, y: -1 });
    if (dir === "down" && direction.y !== -1) setDirection({ x: 0, y: 1 });
    if (dir === "left" && direction.x !== 1) setDirection({ x: -1, y: 0 });
    if (dir === "right" && direction.x !== -1) setDirection({ x: 1, y: 0 });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "q") {
        onQuit();
        return;
      }
      if (gameOver && e.key === "Enter") {
        setSnake([{ x: 10, y: 5 }, { x: 9, y: 5 }, { x: 8, y: 5 }]);
        setDirection({ x: 1, y: 0 });
        setFood({ x: 16, y: 5 });
        setScore(0);
        setGameOver(false);
        return;
      }
      if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") handleMove("up");
      else if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") handleMove("down");
      else if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") handleMove("left");
      else if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") handleMove("right");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction, gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const timer = setInterval(() => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };

        if (newHead.x < 0 || newHead.x >= width || newHead.y < 0 || newHead.y >= height) {
          setGameOver(true);
          return prevSnake;
        }

        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 10);
          setFood(spawnFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 120);

    return () => clearInterval(timer);
  }, [direction, food, gameOver]);

  return (
    <div className="flex flex-col items-center justify-center p-3 font-mono text-xs select-none">
      <div className="flex items-center justify-between w-full max-w-sm mb-2 text-[#00e6a8] font-bold">
        <span>🐍 SNAKE ARCADE</span>
        <span>SCORE: {score}</span>
      </div>

      <div className="border-2 border-[#00e6a8]/40 bg-[#040810] p-1 rounded-lg">
        {Array.from({ length: height }).map((_, y) => (
          <div key={y} className="flex">
            {Array.from({ length: width }).map((_, x) => {
              const isSnakeHead = snake[0].x === x && snake[0].y === y;
              const isSnakeBody = snake.slice(1).some((s) => s.x === x && s.y === y);
              const isFood = food.x === x && food.y === y;

              let char = " ";
              let colorClass = "text-slate-800";

              if (isSnakeHead) {
                char = "█";
                colorClass = "text-[#00e6a8]";
              } else if (isSnakeBody) {
                char = "▓";
                colorClass = "text-[#00e6a8]/70";
              } else if (isFood) {
                char = "★";
                colorClass = "text-amber-400 animate-pulse";
              }

              return (
                <span key={x} className={`w-3.5 h-4 text-center leading-none ${colorClass}`}>
                  {char}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      {gameOver ? (
        <div className="mt-3 text-center text-red-400 font-bold">
          GAME OVER! [ENTER] Restart | [Q] Quit
        </div>
      ) : (
        <div className="mt-2 text-center text-[10px] text-slate-400">
          Use WASD / Arrow Keys to Move | Press [Q] to Quit
        </div>
      )}
    </div>
  );
}

// --- 2. Terminal Pong Game Component ---
function TerminalPongGame({ onQuit }: { onQuit: () => void }) {
  const width = 24;
  const height = 10;
  const [paddleY, setPaddleY] = useState(4);
  const [ball, setBall] = useState({ x: 12, y: 5, dx: 1, dy: 1 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "q") {
        onQuit();
        return;
      }
      if (gameOver && e.key === "Enter") {
        setPaddleY(4);
        setBall({ x: 12, y: 5, dx: 1, dy: 1 });
        setScore(0);
        setGameOver(false);
        return;
      }
      if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
        setPaddleY((y) => Math.max(0, y - 1));
      } else if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
        setPaddleY((y) => Math.min(height - 3, y + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const timer = setInterval(() => {
      setBall((b) => {
        let nextX = b.x + b.dx;
        let nextY = b.y + b.dy;
        let nextDx = b.dx;
        let nextDy = b.dy;

        if (nextY <= 0 || nextY >= height - 1) {
          nextDy = -nextDy;
        }

        if (nextX >= width - 1) {
          nextDx = -nextDx;
        }

        if (nextX === 1) {
          if (nextY >= paddleY && nextY <= paddleY + 2) {
            nextDx = -nextDx;
            setScore((s) => s + 1);
          } else {
            setGameOver(true);
          }
        }

        return { x: nextX, y: nextY, dx: nextDx, dy: nextDy };
      });
    }, 110);

    return () => clearInterval(timer);
  }, [paddleY, gameOver]);

  return (
    <div className="flex flex-col items-center justify-center p-3 font-mono text-xs select-none">
      <div className="flex items-center justify-between w-full max-w-sm mb-2 text-[#00e6a8] font-bold">
        <span>🏓 PONG ARCADE</span>
        <span>SCORE: {score}</span>
      </div>

      <div className="border-2 border-[#00e6a8]/40 bg-[#040810] p-1 rounded-lg">
        {Array.from({ length: height }).map((_, y) => (
          <div key={y} className="flex">
            {Array.from({ length: width }).map((_, x) => {
              const isPaddle = x === 0 && y >= paddleY && y <= paddleY + 2;
              const isBall = ball.x === x && ball.y === y;
              const isRightWall = x === width - 1;

              let char = " ";
              let colorClass = "text-slate-800";

              if (isPaddle) {
                char = "█";
                colorClass = "text-[#00e6a8]";
              } else if (isBall) {
                char = "●";
                colorClass = "text-amber-400 animate-ping";
              } else if (isRightWall) {
                char = "│";
                colorClass = "text-slate-600";
              }

              return (
                <span key={x} className={`w-3.5 h-4 text-center leading-none ${colorClass}`}>
                  {char}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      {gameOver ? (
        <div className="mt-3 text-center text-red-400 font-bold">
          GAME OVER! [ENTER] Restart | [Q] Quit
        </div>
      ) : (
        <div className="mt-2 text-center text-[10px] text-slate-400">
          W/S or Up/Down to move paddle | [Q] to Quit
        </div>
      )}
    </div>
  );
}

export function TerminalModal({ isOpen, onClose, onToggleTheme, onOpenResume }: TerminalModalProps) {
  const [input, setInput] = useState("");
  const [activeGame, setActiveGame] = useState<"snake" | "pong" | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const [output, setOutput] = useState<OutputLine[]>([
    { id: "1", type: "system", text: "ANAS_OS // Developer Shell [Version 6.12.0-arch1]" },
    { id: "2", type: "system", text: "Type 'help' to see all available commands or click quick pills below." },
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output, activeGame]);

  if (!isOpen) return null;

  const handleCommand = (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    const parts = trimmed.split(" ");
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    const cmdLine: OutputLine = {
      id: Math.random().toString(),
      type: "command",
      text: `anas@ANAS_OS:~$ ${trimmed}`,
    };

    let responses: OutputLine[] = [];

    switch (command) {
      case "help":
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: `AVAILABLE COMMANDS:
  neofetch    - System info & specs overview
  projects    - List all 11 engineering projects
  skills      - Neural tech stack ecosystem map
  snake       - Launch 2D ASCII Snake Arcade game
  pong        - Launch 2D ASCII Pong Arcade game
  guess       - Play number guessing game (e.g. guess 42)
  ls          - List terminal directory files
  cat <file>  - Read file contents (cat bio.txt, cat stack.txt)
  matrix      - Display Matrix digital rain
  theme       - Toggle Light / Dark mode
  resume      - Open embedded PDF Resume modal
  clear       - Clear terminal screen output
  exit        - Close terminal shell`,
        });
        break;

      case "neofetch":
      case "fastfetch":
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: `        ./\`         anas@ANAS_OS
       ./\`/\`        ------------
      ./\` / \`       OS: Arch Linux x86_64
     ./\`  /  \`      Kernel: 6.12.8-arch1-1
    ./\`  /    \`     Host: VIT Chennai Neural Core
   ./\`  /      \`    Uptime: 2 years, 4 months
  ./\`  /        \`   Shell: zsh 5.9
 /.\`  /          \`  WM: Hyprland (Wayland)
/.=================\` GPU: NVIDIA RTX 4070 Laptop / Intel Iris Xe
                     Memory: 16GB DDR5 5600MHz
                     Stack: Python, PyTorch, C++, Next.js, ROS 2`,
        });
        break;

      case "snake":
        setActiveGame("snake");
        responses.push({
          id: Math.random().toString(),
          type: "system",
          text: "Launching 2D ASCII Snake Arcade...",
        });
        break;

      case "pong":
        setActiveGame("pong");
        responses.push({
          id: Math.random().toString(),
          type: "system",
          text: "Launching 2D ASCII Pong Arcade...",
        });
        break;

      case "projects":
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: projects.map((p, idx) => `[0${idx + 1}] ${p.title} — ${p.signal}`).join("\n"),
        });
        break;

      case "skills":
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: skillClusters.map((c) => `▪ ${c.label}: ${c.modules.join(", ")}`).join("\n"),
        });
        break;

      case "ls":
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: availableFiles.join("   "),
        });
        break;

      case "cat":
        if (args.length === 0) {
          responses.push({ id: Math.random().toString(), type: "error", text: "Usage: cat <filename> (e.g. cat bio.txt)" });
        } else {
          const file = args[0].toLowerCase();
          if (file === "bio.txt") {
            responses.push({ id: Math.random().toString(), type: "response", text: profile.bio });
          } else if (file === "stack.txt") {
            responses.push({ id: Math.random().toString(), type: "response", text: "Python, PyTorch, C++, ROS 2, OpenCV, Next.js, TypeScript, TailwindCSS" });
          } else if (file === "contact.txt") {
            responses.push({ id: Math.random().toString(), type: "response", text: `Email: ${profile.email}\nGitHub: ${profile.github}\nLinkedIn: ${profile.linkedin}` });
          } else if (file === "resume.txt") {
            responses.push({ id: Math.random().toString(), type: "response", text: `${profile.name} — ${profile.education}` });
          } else {
            responses.push({ id: Math.random().toString(), type: "error", text: `cat: ${file}: No such file` });
          }
        }
        break;

      case "theme":
        onToggleTheme();
        responses.push({ id: Math.random().toString(), type: "system", text: "Theme toggled." });
        break;

      case "resume":
        onOpenResume();
        responses.push({ id: Math.random().toString(), type: "system", text: "Opening Resume modal..." });
        break;

      case "matrix":
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: "01000001 01001110 01000001 01010011 00100000 01000001 01010010 01000110 01000101 01000101 01001110\nSystem state nominal. Follow the white rabbit...",
        });
        break;

      case "clear":
        setOutput([]);
        setInput("");
        return;

      case "exit":
        onClose();
        return;

      default:
        responses.push({
          id: Math.random().toString(),
          type: "error",
          text: `Command not recognized: '${command}'. Type 'help' for valid commands.`,
        });
        break;
    }

    setOutput((prev) => [...prev, cmdLine, ...responses]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand(input);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-lg"
        onClick={onClose}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <motion.div
          className="relative w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden rounded-2xl border border-[#00e6a8]/35 bg-[#080d17]/95 text-[#00e6a8] shadow-[0_0_50px_rgba(0,230,168,0.15)]"
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          data-lenis-prevent="true"
        >
          {/* Header Bar with Mac Dots */}
          <div className="flex items-center justify-between border-b border-[#1e293b] bg-[#040810] px-4 py-3 text-xs font-mono">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500/80 cursor-pointer" onClick={onClose} />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="font-bold text-white text-[11px] sm:text-xs tracking-wider">
                ANAS_OS // DEVELOPER_SHELL
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-[10px] text-slate-400 font-mono">
                Press Esc or type &apos;exit&apos;
              </span>
              <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Terminal Screen Stream */}
          <div
            ref={scrollRef}
            className="flex-1 min-h-[300px] max-h-[440px] overflow-y-auto p-4 font-mono text-xs leading-relaxed space-y-2.5 bg-[#03060c]"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            data-lenis-prevent="true"
          >
            {activeGame === "snake" ? (
              <TerminalSnakeGame onQuit={() => setActiveGame(null)} />
            ) : activeGame === "pong" ? (
              <TerminalPongGame onQuit={() => setActiveGame(null)} />
            ) : (
              output.map((line) => (
                <div key={line.id}>
                  {line.type === "command" && (
                    <span className="font-bold text-amber-400">{line.text}</span>
                  )}
                  {line.type === "response" && (
                    <pre className="whitespace-pre-wrap font-mono text-slate-200 text-[11px] leading-relaxed select-text overflow-x-auto">
                      {line.text}
                    </pre>
                  )}
                  {line.type === "system" && (
                    <span className="text-[#00e6a8] font-semibold">{line.text}</span>
                  )}
                  {line.type === "error" && (
                    <span className="text-red-400 font-semibold">{line.text}</span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Quick Command Launcher Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto px-4 py-2 border-t border-[#1e293b] bg-[#050912] font-mono text-[10px]">
            <span className="text-slate-500 font-bold uppercase shrink-0">QUICK:</span>
            {quickPills.map((pill) => (
              <button
                key={pill}
                onClick={() => handleCommand(pill)}
                className="shrink-0 rounded-full border border-[#1e293b] bg-[#0c1220] px-2.5 py-0.5 text-[#00e6a8] hover:border-[#00e6a8] hover:bg-[#00e6a8]/10 transition-all cursor-pointer"
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Prompt Input Line */}
          {!activeGame && (
            <div className="flex items-center gap-2 border-t border-[#1e293b] bg-[#040810] px-4 py-3 font-mono text-xs">
              <span className="text-amber-400 font-bold text-[11px] sm:text-xs">anas@ANAS_OS:~$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-white outline-none caret-[#00e6a8] text-[11px] sm:text-xs"
                placeholder="Type command..."
                autoFocus
              />
              <button
                onClick={() => handleCommand(input)}
                className="flex items-center gap-1 rounded-lg border border-[#00e6a8]/40 bg-[#00e6a8]/10 px-3 py-1 font-semibold text-[#00e6a8] hover:bg-[#00e6a8] hover:text-black transition-all cursor-pointer text-xs"
              >
                Run <CornerDownLeft size={11} />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
