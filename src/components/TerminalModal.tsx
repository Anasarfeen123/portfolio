"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CornerDownLeft, Sparkles, Terminal as TerminalIcon, X } from "lucide-react";
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
  "uname",
  "pwd",
  "ls",
  "cd",
  "cat",
  "echo",
  "clear",
  "history",
  "date",
  "uptime",
  "ping",
  "projects",
  "skills",
  "experience",
  "snake",
  "pong",
  "invaders",
  "guess",
  "matrix",
  "sudo",
  "theme",
  "resume",
  "contact",
  "exit",
];

const availableFiles = ["bio.txt", "contact.txt", "resume.txt", "stack.txt", "projects"];
const projectFiles = projects.map((p) => `${p.id}.json`);

const quickPills = ["neofetch", "projects", "skills", "snake", "pong", "invaders", "matrix", "clear", "help"];

// --- 1. Fast & Responsive Terminal Snake Game ---
function TerminalSnakeGame({ onQuit }: { onQuit: () => void }) {
  const width = 24;
  const height = 12;
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([
    { x: 10, y: 6 },
    { x: 9, y: 6 },
    { x: 8, y: 6 },
  ]);
  const [direction, setDirection] = useState<{ x: number; y: number }>({ x: 1, y: 0 });
  const nextDirRef = useRef<{ x: number; y: number }>({ x: 1, y: 0 });
  const [food, setFood] = useState<{ x: number; y: number }>({ x: 17, y: 6 });
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "q") {
        onQuit();
        return;
      }
      if (gameOver && e.key === "Enter") {
        setSnake([{ x: 10, y: 6 }, { x: 9, y: 6 }, { x: 8, y: 6 }]);
        setDirection({ x: 1, y: 0 });
        nextDirRef.current = { x: 1, y: 0 };
        setFood({ x: 17, y: 6 });
        setScore(0);
        setGameOver(false);
        return;
      }

      const curr = nextDirRef.current;
      if ((e.key === "ArrowUp" || key === "w") && curr.y !== 1) {
        nextDirRef.current = { x: 0, y: -1 };
      } else if ((e.key === "ArrowDown" || key === "s") && curr.y !== -1) {
        nextDirRef.current = { x: 0, y: 1 };
      } else if ((e.key === "ArrowLeft" || key === "a") && curr.x !== 1) {
        nextDirRef.current = { x: -1, y: 0 };
      } else if ((e.key === "ArrowRight" || key === "d") && curr.x !== -1) {
        nextDirRef.current = { x: 1, y: 0 };
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const timer = setInterval(() => {
      setDirection(nextDirRef.current);
      const dir = nextDirRef.current;

      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = { x: head.x + dir.x, y: head.y + dir.y };

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
    }, 85);

    return () => clearInterval(timer);
  }, [food, gameOver]);

  return (
    <div className="flex flex-col items-center justify-center p-2 font-mono text-xs select-none">
      <div className="flex items-center justify-between w-full max-w-sm mb-1.5 text-[var(--accent)] font-bold">
        <span>🐍 SNAKE ARCADE (FAST)</span>
        <span>SCORE: {score}</span>
      </div>

      <div className="border border-[var(--line)] bg-[var(--background)] p-1 rounded-xl shadow-inner">
        {Array.from({ length: height }).map((_, y) => (
          <div key={y} className="flex">
            {Array.from({ length: width }).map((_, x) => {
              const isSnakeHead = snake[0].x === x && snake[0].y === y;
              const isSnakeBody = snake.slice(1).some((s) => s.x === x && s.y === y);
              const isFood = food.x === x && food.y === y;

              let char = " ";
              let colorClass = "text-[var(--muted)]/20";

              if (isSnakeHead) {
                char = "█";
                colorClass = "text-[var(--accent)] font-bold";
              } else if (isSnakeBody) {
                char = "▓";
                colorClass = "text-[var(--accent)]/70";
              } else if (isFood) {
                char = "★";
                colorClass = "text-amber-400 animate-ping";
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
        <div className="mt-2 text-center text-red-400 font-bold">
          GAME OVER! Press [ENTER] to Restart | [Q] to Quit
        </div>
      ) : (
        <div className="mt-1.5 text-center text-[10px] text-[var(--muted)]">
          [WASD / Arrow Keys] Move | [Q] Quit
        </div>
      )}
    </div>
  );
}

// --- 2. Fast & Responsive Terminal Pong Game ---
function TerminalPongGame({ onQuit }: { onQuit: () => void }) {
  const width = 26;
  const height = 11;
  const [paddleY, setPaddleY] = useState(4);
  const [ball, setBall] = useState({ x: 13, y: 5, dx: 1, dy: 1 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "q") {
        onQuit();
        return;
      }
      if (gameOver && e.key === "Enter") {
        setPaddleY(4);
        setBall({ x: 13, y: 5, dx: 1, dy: 1 });
        setScore(0);
        setGameOver(false);
        return;
      }
      if (e.key === "ArrowUp" || key === "w") {
        setPaddleY((y) => Math.max(0, y - 1));
      } else if (e.key === "ArrowDown" || key === "s") {
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
    }, 70);

    return () => clearInterval(timer);
  }, [paddleY, gameOver]);

  return (
    <div className="flex flex-col items-center justify-center p-2 font-mono text-xs select-none">
      <div className="flex items-center justify-between w-full max-w-sm mb-1.5 text-[var(--accent)] font-bold">
        <span>🏓 PONG ARCADE (FAST)</span>
        <span>SCORE: {score}</span>
      </div>

      <div className="border border-[var(--line)] bg-[var(--background)] p-1 rounded-xl shadow-inner">
        {Array.from({ length: height }).map((_, y) => (
          <div key={y} className="flex">
            {Array.from({ length: width }).map((_, x) => {
              const isPaddle = x === 0 && y >= paddleY && y <= paddleY + 2;
              const isBall = ball.x === x && ball.y === y;
              const isRightWall = x === width - 1;

              let char = " ";
              let colorClass = "text-[var(--muted)]/20";

              if (isPaddle) {
                char = "█";
                colorClass = "text-[var(--accent)] font-bold";
              } else if (isBall) {
                char = "●";
                colorClass = "text-amber-400 font-bold";
              } else if (isRightWall) {
                char = "│";
                colorClass = "text-[var(--muted)]";
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
        <div className="mt-2 text-center text-red-400 font-bold">
          GAME OVER! Press [ENTER] to Restart | [Q] to Quit
        </div>
      ) : (
        <div className="mt-1.5 text-center text-[10px] text-[var(--muted)]">
          [W/S or Arrow Keys] Move Paddle | [Q] Quit
        </div>
      )}
    </div>
  );
}

// --- 3. Fast & Responsive Terminal Space Invaders Game ---
function TerminalInvadersGame({ onQuit }: { onQuit: () => void }) {
  const width = 24;
  const height = 11;
  const [playerX, setPlayerX] = useState(12);
  const [lasers, setLasers] = useState<{ x: number; y: number }[]>([]);
  const [aliens, setAliens] = useState<{ x: number; y: number }[]>([
    { x: 4, y: 1 }, { x: 8, y: 1 }, { x: 12, y: 1 }, { x: 16, y: 1 }, { x: 20, y: 1 },
    { x: 4, y: 2 }, { x: 8, y: 2 }, { x: 12, y: 2 }, { x: 16, y: 2 }, { x: 20, y: 2 },
  ]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "q") {
        onQuit();
        return;
      }
      if (gameOver && e.key === "Enter") {
        setPlayerX(12);
        setLasers([]);
        setAliens([
          { x: 4, y: 1 }, { x: 8, y: 1 }, { x: 12, y: 1 }, { x: 16, y: 1 }, { x: 20, y: 1 },
          { x: 4, y: 2 }, { x: 8, y: 2 }, { x: 12, y: 2 }, { x: 16, y: 2 }, { x: 20, y: 2 },
        ]);
        setScore(0);
        setGameOver(false);
        return;
      }

      if (e.key === "ArrowLeft" || key === "a") {
        setPlayerX((x) => Math.max(0, x - 1));
      } else if (e.key === "ArrowRight" || key === "d") {
        setPlayerX((x) => Math.min(width - 1, x + 1));
      } else if (e.key === " " || key === "space") {
        setLasers((prev) => [...prev, { x: playerX, y: height - 2 }]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playerX, gameOver]);

  // Lasers & Alien Physics Loop
  useEffect(() => {
    if (gameOver) return;

    const timer = setInterval(() => {
      setLasers((prevLasers) => {
        const next = prevLasers.map((l) => ({ ...l, y: l.y - 1 })).filter((l) => l.y >= 0);
        return next;
      });
    }, 60);

    return () => clearInterval(timer);
  }, [gameOver]);

  // Collision detection loop
  useEffect(() => {
    if (gameOver || aliens.length === 0) return;

    setAliens((prevAliens) => {
      let updatedAliens = [...prevAliens];
      lasers.forEach((laser) => {
        updatedAliens = updatedAliens.filter((alien) => {
          if (alien.x === laser.x && alien.y === laser.y) {
            setScore((s) => s + 20);
            return false;
          }
          return true;
        });
      });
      return updatedAliens;
    });
  }, [lasers, gameOver]);

  return (
    <div className="flex flex-col items-center justify-center p-2 font-mono text-xs select-none">
      <div className="flex items-center justify-between w-full max-w-sm mb-1.5 text-[var(--accent)] font-bold">
        <span>👾 SPACE INVADERS (FAST)</span>
        <span>SCORE: {score}</span>
      </div>

      <div className="border border-[var(--line)] bg-[var(--background)] p-1 rounded-xl shadow-inner">
        {Array.from({ length: height }).map((_, y) => (
          <div key={y} className="flex">
            {Array.from({ length: width }).map((_, x) => {
              const isPlayer = y === height - 1 && x === playerX;
              const isLaser = lasers.some((l) => l.x === x && l.y === y);
              const isAlien = aliens.some((a) => a.x === x && a.y === y);

              let char = " ";
              let colorClass = "text-[var(--muted)]/20";

              if (isPlayer) {
                char = "▲";
                colorClass = "text-[var(--accent)] font-bold";
              } else if (isLaser) {
                char = "│";
                colorClass = "text-amber-400 font-bold";
              } else if (isAlien) {
                char = "W";
                colorClass = "text-red-400 font-bold animate-pulse";
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

      {aliens.length === 0 ? (
        <div className="mt-2 text-center text-emerald-400 font-bold">
          VICTORY! ALL INVADERS DESTROYED! Press [ENTER] to Replay | [Q] to Quit
        </div>
      ) : gameOver ? (
        <div className="mt-2 text-center text-red-400 font-bold">
          GAME OVER! Press [ENTER] to Restart | [Q] to Quit
        </div>
      ) : (
        <div className="mt-1.5 text-center text-[10px] text-[var(--muted)]">
          [A/D or Arrows] Move | [SPACE] Shoot Lasers | [Q] Quit
        </div>
      )}
    </div>
  );
}

export function TerminalModal({ isOpen, onClose, onToggleTheme, onOpenResume }: TerminalModalProps) {
  const [input, setInput] = useState("");
  const [currentDir, setCurrentDir] = useState<string>("/home/anas");
  const [activeGame, setActiveGame] = useState<"snake" | "pong" | "invaders" | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const [output, setOutput] = useState<OutputLine[]>([
    { id: "1", type: "system", text: "ANAS_OS // Developer Shell [Version 6.12.0-arch1]" },
    { id: "2", type: "system", text: "Type 'help' for commands, or press [TAB] to autocomplete." },
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 100);

      const handleKeyScrollBlock = (e: KeyboardEvent) => {
        const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "PageUp", "PageDown"];
        if (keys.includes(e.key) || keys.includes(e.code)) {
          const target = e.target as HTMLElement;
          const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
          if (!isInput) {
            e.preventDefault();
          }
        }
      };

      window.addEventListener("keydown", handleKeyScrollBlock, { capture: true });
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyScrollBlock, { capture: true });
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output, activeGame]);

  if (!isOpen) return null;

  const promptPrefix = `anas@ANAS_OS:${currentDir.replace("/home/anas", "~")}$`;

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
      text: `${promptPrefix} ${trimmed}`,
    };

    let responses: OutputLine[] = [];

    switch (command) {
      case "help":
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: `AVAILABLE SYSTEM COMMANDS:
  neofetch    - System hardware & specs summary
  whoami      - Display current shell user details
  uname -a    - Kernel architectural release string
  pwd         - Print working directory
  ls          - List directory files & projects
  cd <dir>    - Change working directory (e.g. cd projects, cd ..)
  cat <file>  - Read file (e.g. cat bio.txt, cat stack.txt)
  projects    - List all 11 flagship project repositories
  skills      - Machine learning, systems & web tech ecosystem
  snake       - Launch 2D ASCII Snake Arcade game
  pong        - Launch 2D ASCII Pong Arcade game
  invaders    - Launch 2D ASCII Space Invaders Arcade game
  ping <host> - Ping live telemetry server
  matrix      - Display Matrix digital rain
  history     - List terminal command history
  theme       - Toggle Light / Dark color theme
  resume      - Open embedded PDF Resume viewer
  clear       - Clear screen output
  exit        - Close developer shell`,
        });
        break;

      case "whoami":
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: `anas (Anas Arfeen) — ${profile.role}`,
        });
        break;

      case "uname":
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: "Linux ANAS_OS 6.12.8-arch1-1 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux",
        });
        break;

      case "pwd":
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: currentDir,
        });
        break;

      case "ls":
        if (currentDir === "/home/anas/projects") {
          responses.push({
            id: Math.random().toString(),
            type: "response",
            text: projectFiles.join("   "),
          });
        } else {
          responses.push({
            id: Math.random().toString(),
            type: "response",
            text: availableFiles.join("   "),
          });
        }
        break;

      case "cd":
        if (args.length === 0 || args[0] === "~" || args[0] === "/home/anas") {
          setCurrentDir("/home/anas");
        } else if (args[0] === ".." || args[0] === "../") {
          setCurrentDir("/home/anas");
        } else if (args[0] === "projects" || args[0] === "projects/") {
          setCurrentDir("/home/anas/projects");
        } else {
          responses.push({
            id: Math.random().toString(),
            type: "error",
            text: `cd: no such file or directory: ${args[0]}`,
          });
        }
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
          } else if (currentDir === "/home/anas/projects" || file.endsWith(".json")) {
            const projId = file.replace(".json", "");
            const found = projects.find((p) => p.id === projId);
            if (found) {
              responses.push({
                id: Math.random().toString(),
                type: "response",
                text: JSON.stringify(found, null, 2),
              });
            } else {
              responses.push({ id: Math.random().toString(), type: "error", text: `cat: ${file}: No such file` });
            }
          } else {
            responses.push({ id: Math.random().toString(), type: "error", text: `cat: ${file}: No such file` });
          }
        }
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

      case "invaders":
        setActiveGame("invaders");
        responses.push({
          id: Math.random().toString(),
          type: "system",
          text: "Launching 2D ASCII Space Invaders Arcade...",
        });
        break;

      case "history":
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: history.map((h, i) => ` ${i + 1}  ${h}`).join("\n"),
        });
        break;

      case "ping":
        const host = args[0] || "chennai.node.anas.dev";
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: `PING ${host} (13.08.80.27) 56(84) bytes of data.
64 bytes from ${host}: icmp_seq=1 ttl=64 time=1.42 ms
64 bytes from ${host}: icmp_seq=2 ttl=64 time=1.18 ms
64 bytes from ${host}: icmp_seq=3 ttl=64 time=1.35 ms
--- ${host} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2003ms`,
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

      case "sudo":
        responses.push({
          id: Math.random().toString(),
          type: "error",
          text: "anas is not in the sudoers file. This incident will be reported.",
        });
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
          text: `zsh: command not found: ${command}. Type 'help' for available commands.`,
        });
        break;
    }

    setOutput((prev) => [...prev, cmdLine, ...responses]);
    setInput("");
  };

  // --- Real TAB Autocomplete & Arrow History Navigation ---
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand(input);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const trimmed = input.toLowerCase().trimStart();
      const parts = trimmed.split(" ");

      if (parts.length === 1) {
        // Autocomplete command name
        const matches = availableCommands.filter((c) => c.startsWith(parts[0]));
        if (matches.length === 1) {
          setInput(matches[0]);
        } else if (matches.length > 1) {
          setOutput((prev) => [
            ...prev,
            { id: Math.random().toString(), type: "command", text: `${promptPrefix} ${input}` },
            { id: Math.random().toString(), type: "response", text: matches.join("   ") },
          ]);
        }
      } else if (parts[0] === "cat" && parts.length === 2) {
        // Autocomplete cat filename
        const filesToSearch = currentDir === "/home/anas/projects" ? projectFiles : availableFiles;
        const matches = filesToSearch.filter((f) => f.startsWith(parts[1]));
        if (matches.length === 1) {
          setInput(`cat ${matches[0]}`);
        } else if (matches.length > 1) {
          setOutput((prev) => [
            ...prev,
            { id: Math.random().toString(), type: "command", text: `${promptPrefix} ${input}` },
            { id: Math.random().toString(), type: "response", text: matches.join("   ") },
          ]);
        }
      } else if (parts[0] === "cd" && parts.length === 2) {
        // Autocomplete cd directory
        const dirs = ["projects"];
        const matches = dirs.filter((d) => d.startsWith(parts[1]));
        if (matches.length === 1) {
          setInput(`cd ${matches[0]}`);
        }
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = historyIndex + 1 < history.length ? historyIndex + 1 : historyIndex;
        setHistoryIndex(nextIdx);
        setInput(history[history.length - 1 - nextIdx] ?? "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInput(history[history.length - 1 - nextIdx] ?? "");
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput("");
      }
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md"
        onClick={onClose}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <motion.div
          className="relative w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--card-bg)] text-[var(--foreground)] backdrop-blur-[40px] shadow-2xl"
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          data-lenis-prevent="true"
        >
          {/* Header Bar with Mac Dots */}
          <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--card-hover)] px-4 py-3 text-xs font-mono">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500/80 cursor-pointer" onClick={onClose} />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="font-bold text-[var(--heading)] text-[11px] sm:text-xs tracking-wider">
                ANAS_OS // DEVELOPER_SHELL
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-[10px] text-[var(--muted)] font-mono">
                Press [TAB] to autocomplete | Esc to exit
              </span>
              <button onClick={onClose} className="p-1 text-[var(--muted)] hover:text-[var(--heading)] transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Terminal Screen Stream */}
          <div
            ref={scrollRef}
            className="flex-1 min-h-[300px] max-h-[440px] overflow-y-auto p-4 font-mono text-xs leading-relaxed space-y-2.5 bg-[var(--background)]/40"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            data-lenis-prevent="true"
          >
            {activeGame === "snake" ? (
              <TerminalSnakeGame onQuit={() => setActiveGame(null)} />
            ) : activeGame === "pong" ? (
              <TerminalPongGame onQuit={() => setActiveGame(null)} />
            ) : activeGame === "invaders" ? (
              <TerminalInvadersGame onQuit={() => setActiveGame(null)} />
            ) : (
              output.map((line) => (
                <div key={line.id}>
                  {line.type === "command" && (
                    <span className="font-bold text-[var(--signal)]">{line.text}</span>
                  )}
                  {line.type === "response" && (
                    <pre className="whitespace-pre-wrap font-mono text-[var(--foreground)] text-[11px] leading-relaxed select-text overflow-x-auto">
                      {line.text}
                    </pre>
                  )}
                  {line.type === "system" && (
                    <span className="text-[var(--accent)] font-semibold">{line.text}</span>
                  )}
                  {line.type === "error" && (
                    <span className="text-red-400 font-semibold">{line.text}</span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Quick Command Launcher Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto px-4 py-2 border-t border-[var(--line)] bg-[var(--card-hover)] font-mono text-[10px]">
            <span className="text-[var(--muted)] font-bold uppercase shrink-0">QUICK:</span>
            {quickPills.map((pill) => (
              <button
                key={pill}
                onClick={() => handleCommand(pill)}
                className="shrink-0 rounded-full border border-[var(--line)] bg-[var(--card-bg)] px-2.5 py-0.5 text-[var(--accent)] hover:border-[var(--accent)] transition-all cursor-pointer font-semibold"
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Prompt Input Line */}
          {!activeGame && (
            <div className="flex items-center gap-2 border-t border-[var(--line)] bg-[var(--card-hover)] px-4 py-3 font-mono text-xs">
              <span className="text-[var(--signal)] font-bold text-[11px] sm:text-xs">{promptPrefix}</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-[var(--heading)] outline-none caret-[var(--accent)] text-[11px] sm:text-xs"
                placeholder="Type command or press [TAB]..."
                autoFocus
              />
              <button
                onClick={() => handleCommand(input)}
                className="flex items-center gap-1 rounded-lg border border-[var(--line)] bg-[var(--card-bg)] px-3 py-1 font-semibold text-[var(--accent)] hover:border-[var(--accent)] transition-all cursor-pointer text-xs"
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
