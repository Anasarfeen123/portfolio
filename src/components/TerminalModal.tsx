"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CornerDownLeft, Gamepad2, Terminal as TerminalIcon, X } from "lucide-react";
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
  }, [direction, gameOver, onQuit]);

  useEffect(() => {
    if (gameOver) return;

    const timer = setInterval(() => {
      setSnake((prev) => {
        const head = { x: prev[0].x + direction.x, y: prev[0].y + direction.y };

        if (head.x < 0 || head.x >= width || head.y < 0 || head.y >= height) {
          setGameOver(true);
          return prev;
        }

        if (prev.some((s) => s.x === head.x && s.y === head.y)) {
          setGameOver(true);
          return prev;
        }

        const newSnake = [head, ...prev];

        if (head.x === food.x && head.y === food.y) {
          setScore((s) => s + 10);
          setFood(spawnFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 130);

    return () => clearInterval(timer);
  }, [direction, food, gameOver]);

  const renderBoard = () => {
    const grid: string[][] = Array.from({ length: height }, () => Array(width).fill(" "));
    grid[food.y][food.x] = "★";
    snake.forEach((s, idx) => {
      grid[s.y][s.x] = idx === 0 ? "█" : "░";
    });

    let topBorder = "┌" + "─".repeat(width) + "┐";
    let bottomBorder = "└" + "─".repeat(width) + "┘";
    let rows = grid.map((r) => "│" + r.join("") + "│").join("\n");

    return `${topBorder}\n${rows}\n${bottomBorder}`;
  };

  return (
    <div className="font-mono text-xs text-[#38edf8] space-y-2 select-none">
      <div className="flex items-center justify-between text-white border-b border-[#1e293b] pb-2">
        <span className="flex items-center gap-1.5 font-bold text-[#ffb703]">
          <Gamepad2 size={14} /> TERMINAL SNAKE ARCADE
        </span>
        <span>Score: <strong className="text-[var(--accent)]">{score}</strong></span>
      </div>

      <pre className="font-mono leading-none text-white text-[11px] sm:text-[12px] bg-[#04070d] p-3 rounded-lg overflow-x-auto text-center">
        {renderBoard()}
      </pre>

      {/* Mobile D-Pad Touch Controls */}
      <div className="flex flex-col items-center gap-1.5 py-1">
        <button
          onClick={() => handleMove("up")}
          className="h-8 w-12 rounded bg-[#1e293b] text-white font-bold text-sm hover:bg-[#334155] active:scale-95 transition-all"
        >
          ▲
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => handleMove("left")}
            className="h-8 w-12 rounded bg-[#1e293b] text-white font-bold text-sm hover:bg-[#334155] active:scale-95 transition-all"
          >
            ◄
          </button>
          <button
            onClick={() => handleMove("down")}
            className="h-8 w-12 rounded bg-[#1e293b] text-white font-bold text-sm hover:bg-[#334155] active:scale-95 transition-all"
          >
            ▼
          </button>
          <button
            onClick={() => handleMove("right")}
            className="h-8 w-12 rounded bg-[#1e293b] text-white font-bold text-sm hover:bg-[#334155] active:scale-95 transition-all"
          >
            ►
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#94a3b8]">
        <span>Controls: Touch D-Pad or W/A/S/D</span>
        <button onClick={onQuit} className="underline text-white">Quit Game (Q)</button>
      </div>

      {gameOver && (
        <div className="text-center font-bold text-[#ef6f6c] pt-1">
          GAME OVER! Final Score: {score} — Press ENTER or D-Pad to retry.
        </div>
      )}
    </div>
  );
}

// --- 2. Terminal Pong Game Component ---
function TerminalPongGame({ onQuit }: { onQuit: () => void }) {
  const width = 24;
  const height = 10;
  const [playerY, setPlayerY] = useState(4);
  const [aiY, setAiY] = useState(4);
  const [ball, setBall] = useState({ x: 12, y: 5, vx: 1, vy: 1 });
  const [score, setScore] = useState({ player: 0, ai: 0 });

  const moveUp = () => setPlayerY((y) => Math.max(0, y - 1));
  const moveDown = () => setPlayerY((y) => Math.min(height - 2, y + 1));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "q") {
        onQuit();
        return;
      }
      if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") moveUp();
      else if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") moveDown();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onQuit]);

  useEffect(() => {
    const timer = setInterval(() => {
      setBall((prev) => {
        let nx = prev.x + prev.vx;
        let ny = prev.y + prev.vy;
        let nvx = prev.vx;
        let nvy = prev.vy;

        if (ny <= 0 || ny >= height - 1) {
          nvy = -nvy;
        }

        if (nx === 1 && (ny === playerY || ny === playerY + 1)) {
          nvx = -nvx;
        }

        if (nx === width - 2 && (ny === aiY || ny === aiY + 1)) {
          nvx = -nvx;
        }

        if (nx <= 0) {
          setScore((s) => ({ ...s, ai: s.ai + 1 }));
          return { x: 12, y: 5, vx: 1, vy: 1 };
        }
        if (nx >= width - 1) {
          setScore((s) => ({ ...s, player: s.player + 1 }));
          return { x: 12, y: 5, vx: -1, vy: -1 };
        }

        setAiY((y) => {
          if (ny > y + 1 && y < height - 2) return y + 1;
          if (ny < y && y > 0) return y - 1;
          return y;
        });

        return { x: nx, y: ny, vx: nvx, vy: nvy };
      });
    }, 110);

    return () => clearInterval(timer);
  }, [playerY, aiY]);

  const renderBoard = () => {
    const grid: string[][] = Array.from({ length: height }, () => Array(width).fill(" "));

    grid[playerY][0] = "█";
    if (playerY + 1 < height) grid[playerY + 1][0] = "█";

    grid[aiY][width - 1] = "█";
    if (aiY + 1 < height) grid[aiY + 1][width - 1] = "█";

    if (ball.y >= 0 && ball.y < height && ball.x >= 0 && ball.x < width) {
      grid[ball.y][ball.x] = "O";
    }

    let topBorder = "┌" + "─".repeat(width) + "┐";
    let bottomBorder = "└" + "─".repeat(width) + "┘";
    let rows = grid.map((r) => "│" + r.join("") + "│").join("\n");

    return `${topBorder}\n${rows}\n${bottomBorder}`;
  };

  return (
    <div className="font-mono text-xs text-[#38edf8] space-y-2 select-none">
      <div className="flex items-center justify-between text-white border-b border-[#1e293b] pb-2">
        <span className="flex items-center gap-1.5 font-bold text-[#ffb703]">
          <Gamepad2 size={14} /> TERMINAL PONG
        </span>
        <span>YOU: <strong className="text-[var(--accent)]">{score.player}</strong> | AI: <strong className="text-[#ef6f6c]">{score.ai}</strong></span>
      </div>

      <pre className="font-mono leading-none text-white text-[11px] sm:text-[12px] bg-[#04070d] p-3 rounded-lg overflow-x-auto text-center">
        {renderBoard()}
      </pre>

      {/* Mobile Touch Controls for Paddle */}
      <div className="flex justify-center gap-4 py-1">
        <button
          onClick={moveUp}
          className="h-10 w-20 rounded bg-[#1e293b] text-white font-bold text-sm hover:bg-[#334155] active:scale-95 transition-all"
        >
          ▲ UP
        </button>
        <button
          onClick={moveDown}
          className="h-10 w-20 rounded bg-[#1e293b] text-white font-bold text-sm hover:bg-[#334155] active:scale-95 transition-all"
        >
          ▼ DOWN
        </button>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#94a3b8]">
        <span>Controls: Touch buttons or W/S</span>
        <button onClick={onQuit} className="underline text-white">Quit Game (Q)</button>
      </div>
    </div>
  );
}

// --- Main Terminal Modal ---
export function TerminalModal({ isOpen, onClose, onToggleTheme, onOpenResume }: TerminalModalProps) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeGame, setActiveGame] = useState<"snake" | "pong" | null>(null);

  const [secretNumber, setSecretNumber] = useState<number | null>(null);
  const [guessAttempts, setGuessAttempts] = useState(0);

  const [output, setOutput] = useState<OutputLine[]>([
    {
      id: "welcome-1",
      type: "system",
      text: "ANAS_ARFEEN_OS v2.4 Developer Shell. Type 'help' or 'github' for live telemetry.",
    },
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
      setActiveGame(null);
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [output, activeGame]);

  if (!isOpen) return null;

  const fetchGitHubTelemetry = async () => {
    setOutput((prev) => [
      ...prev,
      { id: Math.random().toString(), type: "system", text: "Fetching live telemetry from https://api.github.com/users/Anasarfeen123..." },
    ]);

    let publicRepos = projects.length;
    let followers = 12;
    let following = 8;
    let totalStars = 6;
    let bio = profile.statement;
    let location = profile.location;
    let isLive = false;

    try {
      const userRes = await fetch("https://api.github.com/users/Anasarfeen123");
      if (userRes.ok) {
        const userData = await userRes.json();
        publicRepos = userData.public_repos ?? publicRepos;
        followers = userData.followers ?? followers;
        following = userData.following ?? following;
        bio = userData.bio || bio;
        location = userData.location || location;
        isLive = true;
      }
    } catch {
      // Fallback
    }

    try {
      const reposRes = await fetch("https://api.github.com/users/Anasarfeen123/repos?per_page=30");
      if (reposRes.ok) {
        const reposData = await reposRes.json();
        if (Array.isArray(reposData)) {
          totalStars = reposData.reduce((acc: number, r: { stargazers_count?: number }) => acc + (r.stargazers_count || 0), 0);
        }
      }
    } catch {
      // Fallback
    }

    const telemetryText = `[GITHUB LIVE TELEMETRY // @Anasarfeen123]
--------------------------------------------------
User Handle:      ${profile.name} (@${profile.handle})
Public Repos:     ${publicRepos} repositories
Total Stars:      ${totalStars} ⭐ across public repos
Followers:        ${followers} followers | Following: ${following}
Primary Stack:    Python, PyTorch, JavaScript, C++, OpenCV
Bio:              "${bio}"
Location:         ${location}
GitHub URL:       ${profile.github}
Telemetry Status: ${isLive ? "API Live (200 OK)" : "System Telemetry (Nominal)"}
--------------------------------------------------`;

    setOutput((prev) => [
      ...prev,
      { id: Math.random().toString(), type: "response", text: telemetryText },
    ]);
  };

  const handleCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    const newHistory = [...history, trimmed];
    setHistory(newHistory);
    setHistoryIndex(-1);

    const cmdLine: OutputLine = {
      id: Math.random().toString(),
      type: "command",
      text: `anas@portfolio:~$ ${trimmed}`,
    };

    const parts = trimmed.toLowerCase().split(" ");
    const command = parts[0];
    const arg = parts.slice(1).join(" ");

    const responses: OutputLine[] = [];

    switch (command) {
      case "help":
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: `Available CLI Commands:
  help       - Display this assistance menu
  github     - Fetch & display LIVE GitHub telemetry stats 📊
  whoami     - Output engineer bio and profile stats
  neofetch   - Display Linux system info & specs
  snake      - Play 2D ASCII Snake Arcade Game 🎮
  pong       - Play 2D ASCII Pong Arcade Game 🏓
  guess <n>  - Play Number Guessing Game 🔢 (e.g. guess 50)
  projects   - List key autonomous AI & systems projects
  skills     - View neural tech stack breakdown
  experience - View leadership & club history
  ls         - List virtual filesystem contents
  cat <file> - Read a file (e.g. cat bio.txt, cat resume.txt)
  ping <host>- Ping a host (e.g. ping github.com, ping vit.ac.in)
  matrix     - Trigger digital rain visual stream
  ascii      - Generate ASCII art banner
  quote      - Output tech/AI quote
  sudo <cmd> - Execute with elevated privileges
  date       - Output current time & timestamp
  history    - Display command history log
  contact    - View email, GitHub, and LinkedIn vectors
  resume     - Open inline PDF Resume Viewer
  theme      - Toggle between Warm Paper & Dark Space themes
  clear      - Clear terminal screen history
  exit       - Close terminal interface`,
        });
        break;

      case "github":
      case "telemetry":
      case "stats":
        setOutput((prev) => [...prev, cmdLine]);
        setInput("");
        fetchGitHubTelemetry();
        return;

      case "snake":
        setActiveGame("snake");
        responses.push({
          id: Math.random().toString(),
          type: "system",
          text: "Starting Terminal Snake Game...",
        });
        break;

      case "pong":
        setActiveGame("pong");
        responses.push({
          id: Math.random().toString(),
          type: "system",
          text: "Starting Terminal Pong Game...",
        });
        break;

      case "guess":
        let target = secretNumber;
        if (target === null) {
          target = Math.floor(Math.random() * 100) + 1;
          setSecretNumber(target);
          setGuessAttempts(0);
        }

        if (!arg) {
          responses.push({
            id: Math.random().toString(),
            type: "response",
            text: `[NUMBER GUESSING GAME] I'm thinking of a secret number between 1 and 100!
Game active! Make a guess by typing 'guess <number>' (e.g. guess 50).`,
          });
        } else {
          const userNum = parseInt(arg, 10);
          if (isNaN(userNum)) {
            responses.push({
              id: Math.random().toString(),
              type: "error",
              text: `Invalid guess '${arg}'. Please guess a valid number between 1 and 100.`,
            });
          } else {
            const nextAttempts = guessAttempts + 1;
            setGuessAttempts(nextAttempts);

            if (userNum < target) {
              responses.push({
                id: Math.random().toString(),
                type: "response",
                text: `📈 Too LOW! Try a HIGHER number than ${userNum}. (Attempt #${nextAttempts})`,
              });
            } else if (userNum > target) {
              responses.push({
                id: Math.random().toString(),
                type: "response",
                text: `📉 Too HIGH! Try a LOWER number than ${userNum}. (Attempt #${nextAttempts})`,
              });
            } else {
              responses.push({
                id: Math.random().toString(),
                type: "system",
                text: `🎉 BINGO! You guessed the secret number ${target} correctly in ${nextAttempts} attempts! Game complete!`,
              });
              setSecretNumber(null);
              setGuessAttempts(0);
            }
          }
        }
        break;

      case "whoami":
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: `${profile.name} — ${profile.role}
Location: ${profile.location}
Education: ${profile.education}
Statement: "${profile.statement}"
Bio: ${profile.bio}`,
        });
        break;

      case "neofetch":
      case "fastfetch":
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: `
       .---.        anas@ANAS_OS
      /     \\       ------------
     |  () () |      OS: Arch Linux x86_64 / ANAS_OS 2.4
     |   \\  / |      Kernel: 6.12.10-arch1-1
      \\  --  /       Uptime: 247 days, 14 hours
       \`---\`        Shell: zsh 5.9 (x86_64-pc-linux-gnu)
                    WM: Hyprland (Wayland)
                    Host: VIT Chennai (B.Tech CSE '29)
                    Role: AI/ML Co-Lead @ MIC VITC
                    Stack: PyTorch, Python, OpenCV, React, C++
          `,
        });
        break;

      case "projects":
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: projects
            .map((p, idx) => `[0${idx + 1}] ${p.title} (${p.technologies.join(", ")})\n     Signal: ${p.signal}`)
            .join("\n\n"),
        });
        break;

      case "skills":
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: skillClusters
            .map((c) => `• ${c.label}: ${c.modules.join(" | ")}`)
            .join("\n"),
        });
        break;

      case "experience":
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: experience
            .map((e) => `[${e.time}] ${e.role} — ${e.org}\n  ${e.notes.map((n) => `• ${n}`).join("\n  ")}`)
            .join("\n\n"),
        });
        break;

      case "ls":
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: `drwxr-xr-x 2 anas anas 4096 Jul 25 13:00 projects/
drwxr-xr-x 2 anas anas 4096 Jul 25 13:00 experience/
-rw-r--r-- 1 anas anas  104K Jul 25 13:00 Resume.pdf
-rw-r--r-- 1 anas anas  1.2K Jul 25 13:00 bio.txt
-rw-r--r-- 1 anas anas   480 Jul 25 13:00 contact.txt
-rw-r--r-- 1 anas anas   820 Jul 25 13:00 stack.txt`,
        });
        break;

      case "cat":
        if (!arg) {
          responses.push({
            id: Math.random().toString(),
            type: "error",
            text: "Usage: cat <filename> (e.g. cat bio.txt, cat contact.txt, cat resume.txt)",
          });
        } else if (arg.includes("bio")) {
          responses.push({
            id: Math.random().toString(),
            type: "response",
            text: profile.bio,
          });
        } else if (arg.includes("contact")) {
          responses.push({
            id: Math.random().toString(),
            type: "response",
            text: `Email: ${profile.email}\nGitHub: ${profile.github}\nLinkedIn: ${profile.linkedin}`,
          });
        } else if (arg.includes("resume")) {
          onOpenResume();
          responses.push({
            id: Math.random().toString(),
            type: "system",
            text: "Opening PDF Resume Viewer modal...",
          });
        } else if (arg.includes("stack")) {
          responses.push({
            id: Math.random().toString(),
            type: "response",
            text: skillClusters.map((c) => `${c.label}: ${c.modules.join(", ")}`).join("\n"),
          });
        } else {
          responses.push({
            id: Math.random().toString(),
            type: "error",
            text: `cat: ${arg}: No such file or directory. Try 'cat bio.txt' or 'cat contact.txt'.`,
          });
        }
        break;

      case "ping":
        const host = arg || "github.com";
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: `PING ${host} (140.82.121.4): 56 data bytes
64 bytes from ${host}: icmp_seq=0 ttl=58 time=14.2 ms
64 bytes from ${host}: icmp_seq=1 ttl=58 time=13.8 ms
64 bytes from ${host}: icmp_seq=2 ttl=58 time=14.5 ms
--- ${host} ping statistics ---
3 packets transmitted, 3 packets received, 0.0% packet loss, time 2004ms`,
        });
        break;

      case "matrix":
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: `01000001 01001110 01000001 01010011 01011111 01001111 01010011
01100001 01101110 01100001 01110011 01100001 01110010 01100110 01100101 01100101 01101110
[MATRIX STREAM ACTIVATED] Connecting to neural matrix node at VIT Chennai...
System initialized: 100% nominal.`,
        });
        break;

      case "ascii":
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: `
  ▲   ███╗   ██╗ █████╗ ███████╗    ██████╗ ███████╗
 / \\  ████╗  ██║██╔══██╗██╔════╝   ██╔═══██╗██╔════╝
/███\\ ██╔██╗ ██║███████║███████╗   ██║   ██║███████╗
  ██  ██║╚██╗██║██╔══██║╚════██║   ██║   ██║╚════██║
  ██  ██║ ╚████║██║  ██║███████║   ╚██████╔╝███████║
      ╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝    ╚═════╝ ╚══════╝`,
        });
        break;

      case "quote":
        const quotes = [
          `"Simplicity is prerequisite for reliability." — Edsger W. Dijkstra`,
          `"Talk is cheap. Show me the code." — Linus Torvalds`,
          `"Intelligence is the ability to adapt to change." — Stephen Hawking`,
          `"The best way to predict the future is to invent it." — Alan Kay`,
        ];
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: quotes[Math.floor(Math.random() * quotes.length)],
        });
        break;

      case "sudo":
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: `anas is in the sudoers file. Proceeding with elevated privileges...
[OK] Access granted! All systems running at maximum performance.`,
        });
        break;

      case "date":
      case "time":
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: `Current Time: ${new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })} IST (India Standard Time)`,
        });
        break;

      case "history":
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: history.map((h, i) => `  ${i + 1}  ${h}`).join("\n"),
        });
        break;

      case "contact":
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: `Email: ${profile.email}\nGitHub: ${profile.github}\nLinkedIn: ${profile.linkedin}`,
        });
        break;

      case "resume":
        onOpenResume();
        responses.push({
          id: Math.random().toString(),
          type: "system",
          text: "Opening PDF Resume Viewer modal...",
        });
        break;

      case "theme":
        onToggleTheme();
        responses.push({
          id: Math.random().toString(),
          type: "system",
          text: "Theme mode toggled successfully.",
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
    } else if (e.key === "Tab") {
      e.preventDefault();
      const trimmed = input.toLowerCase().trim();
      const parts = trimmed.split(" ");

      if (parts.length === 1) {
        const matches = availableCommands.filter((c) => c.startsWith(parts[0]));
        if (matches.length === 1) {
          setInput(matches[0]);
        } else if (matches.length > 1) {
          setOutput((prev) => [
            ...prev,
            { id: Math.random().toString(), type: "command", text: `anas@portfolio:~$ ${input}` },
            { id: Math.random().toString(), type: "response", text: matches.join("   ") },
          ]);
        }
      } else if (parts[0] === "cat" && parts.length === 2) {
        const matches = availableFiles.filter((f) => f.startsWith(parts[1]));
        if (matches.length === 1) {
          setInput(`cat ${matches[0]}`);
        } else if (matches.length > 1) {
          setOutput((prev) => [
            ...prev,
            { id: Math.random().toString(), type: "command", text: `anas@portfolio:~$ ${input}` },
            { id: Math.random().toString(), type: "response", text: matches.join("   ") },
          ]);
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
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-md"
        onClick={onClose}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <motion.div
          className="relative w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden rounded-xl border border-[var(--line-strong)] bg-[#0c1017] text-[#38edf8] shadow-2xl"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          data-lenis-prevent="true"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-[#1e293b] bg-[#070a0f] px-3 sm:px-4 py-2.5 text-xs font-mono text-[#94a3b8]">
            <div className="flex items-center gap-2">
              <TerminalIcon size={14} className="text-[#38edf8]" />
              <span className="font-semibold text-white text-[11px] sm:text-xs">anas@ANAS_OS: ~</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden sm:inline text-[10px] text-[#64748b]">Type &apos;snake&apos; or &apos;pong&apos;</span>
              <button onClick={onClose} className="p-1 text-[#94a3b8] hover:text-white transition-colors" aria-label="Close terminal">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Terminal Screen Stream OR Live Active Game */}
          <div
            ref={scrollRef}
            className="flex-1 min-h-[280px] max-h-[420px] overflow-y-auto p-3 sm:p-4 font-mono text-xs leading-relaxed space-y-3 bg-[#080c14]"
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
                    <span className="font-bold text-[#ffb703]">{line.text}</span>
                  )}
                  {line.type === "response" && (
                    <pre className="whitespace-pre-wrap font-mono text-[#e2e8f0] text-[10px] sm:text-[11px] leading-relaxed select-text overflow-x-auto">
                      {line.text}
                    </pre>
                  )}
                  {line.type === "system" && (
                    <span className="text-[#38edf8] italic">{line.text}</span>
                  )}
                  {line.type === "error" && (
                    <span className="text-[#ef6f6c] font-semibold">{line.text}</span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Terminal Input Line (Hidden during active games) */}
          {!activeGame && (
            <div className="flex items-center gap-2 border-t border-[#1e293b] bg-[#070a0f] px-3 sm:px-4 py-2.5 font-mono text-xs">
              <span className="text-[#ffb703] font-bold text-[11px] sm:text-xs">anas@portfolio:~$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-white outline-none caret-[#38edf8] text-[11px] sm:text-xs"
                placeholder="Type command..."
                autoFocus
              />
              <button
                onClick={() => handleCommand(input)}
                className="flex items-center gap-1 rounded bg-[#1e293b] px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold text-[#38edf8] hover:bg-[#334155] transition-colors"
              >
                Run <CornerDownLeft size={10} />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
