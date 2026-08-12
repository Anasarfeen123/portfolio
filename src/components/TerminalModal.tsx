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
  onNavigate: (path: string) => void;
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
  "catalog",
  "blog",
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

const quickPills = ["neofetch", "projects", "skills", "snake", "pong", "invaders", "guess", "matrix", "clear", "help"];

// --- 1. Rock-Solid Responsive Snake Game ---
function TerminalSnakeGame({ onQuit }: { onQuit: () => void }) {
  const width = 22;
  const height = 11;
  const gameRef = useRef<HTMLDivElement>(null);

  const [snake, setSnake] = useState<{ x: number; y: number }[]>([
    { x: 10, y: 5 },
    { x: 9, y: 5 },
    { x: 8, y: 5 },
  ]);
  const [food, setFood] = useState<{ x: number; y: number }>({ x: 16, y: 5 });
  const dirRef = useRef<{ x: number; y: number }>({ x: 1, y: 0 });
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

  const changeDir = (dx: number, dy: number) => {
    if (gameOver) return;
    const current = dirRef.current;
    if (dx !== 0 && current.x === -dx) return;
    if (dy !== 0 && current.y === -dy) return;
    dirRef.current = { x: dx, y: dy };
  };

  useEffect(() => {
    gameRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      const key = e.key.toLowerCase();

      if (key === "q") {
        e.preventDefault();
        onQuit();
        return;
      }

      if (gameOver && (code === "Enter" || key === "enter")) {
        e.preventDefault();
        setSnake([{ x: 10, y: 5 }, { x: 9, y: 5 }, { x: 8, y: 5 }]);
        dirRef.current = { x: 1, y: 0 };
        setFood({ x: 16, y: 5 });
        setScore(0);
        setGameOver(false);
        return;
      }

      if (code === "ArrowUp" || code === "KeyW") {
        e.preventDefault();
        changeDir(0, -1);
      } else if (code === "ArrowDown" || code === "KeyS") {
        e.preventDefault();
        changeDir(0, 1);
      } else if (code === "ArrowLeft" || code === "KeyA") {
        e.preventDefault();
        changeDir(-1, 0);
      } else if (code === "ArrowRight" || code === "KeyD") {
        e.preventDefault();
        changeDir(1, 0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const timer = setInterval(() => {
      const dir = dirRef.current;
      setSnake((prev) => {
        const head = prev[0];
        const newHead = { x: head.x + dir.x, y: head.y + dir.y };

        if (newHead.x < 0 || newHead.x >= width || newHead.y < 0 || newHead.y >= height) {
          setGameOver(true);
          return prev;
        }

        if (prev.some((s) => s.x === newHead.x && s.y === newHead.y)) {
          setGameOver(true);
          return prev;
        }

        const newSnake = [newHead, ...prev];
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 10);
          setFood(spawnFood(newSnake));
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 90);

    return () => clearInterval(timer);
  }, [food, gameOver]);

  return (
    <div
      ref={gameRef}
      tabIndex={0}
      className="flex flex-col items-center justify-center p-2 font-mono text-xs outline-none select-none"
    >
      <div className="flex items-center justify-between w-full max-w-sm mb-1 text-[var(--accent)] font-bold">
        <span>🐍 SNAKE ARCADE</span>
        <span>SCORE: {score}</span>
      </div>

      <div className="border border-[var(--line)] bg-[var(--background)] p-1 rounded-xl shadow-lg">
        {Array.from({ length: height }).map((_, y) => (
          <div key={y} className="flex">
            {Array.from({ length: width }).map((_, x) => {
              const isHead = snake[0].x === x && snake[0].y === y;
              const isBody = snake.slice(1).some((s) => s.x === x && s.y === y);
              const isFood = food.x === x && food.y === y;

              let char = " ";
              let color = "text-[var(--muted)]/20";

              if (isHead) {
                char = "█";
                color = "text-[var(--accent)] font-bold";
              } else if (isBody) {
                char = "▓";
                color = "text-[var(--accent)]/70";
              } else if (isFood) {
                char = "★";
                color = "text-amber-400 font-bold animate-ping";
              }

              return (
                <span key={x} className={`w-3.5 h-4 text-center leading-none ${color}`}>
                  {char}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      {/* On-Screen Touch / Click Controls */}
      <div className="flex flex-col items-center gap-1 mt-2">
        <button
          onClick={() => changeDir(0, -1)}
          className="px-3 py-1 rounded bg-[var(--card-hover)] border border-[var(--line)] text-[var(--heading)] font-bold hover:bg-[var(--accent)] hover:text-black transition-all cursor-pointer"
        >
          ▲ UP
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => changeDir(-1, 0)}
            className="px-3 py-1 rounded bg-[var(--card-hover)] border border-[var(--line)] text-[var(--heading)] font-bold hover:bg-[var(--accent)] hover:text-black transition-all cursor-pointer"
          >
            ◄ LEFT
          </button>
          <button
            onClick={() => changeDir(0, 1)}
            className="px-3 py-1 rounded bg-[var(--card-hover)] border border-[var(--line)] text-[var(--heading)] font-bold hover:bg-[var(--accent)] hover:text-black transition-all cursor-pointer"
          >
            ▼ DOWN
          </button>
          <button
            onClick={() => changeDir(1, 0)}
            className="px-3 py-1 rounded bg-[var(--card-hover)] border border-[var(--line)] text-[var(--heading)] font-bold hover:bg-[var(--accent)] hover:text-black transition-all cursor-pointer"
          >
            ► RIGHT
          </button>
        </div>
      </div>

      {gameOver ? (
        <div className="mt-2 text-center text-red-400 font-bold">
          GAME OVER! Press [ENTER] to Restart | [Q] to Quit
        </div>
      ) : (
        <div className="mt-1 text-center text-[10px] text-[var(--muted)]">
          Controls: WASD / Arrow Keys or buttons above | Press [Q] to Quit
        </div>
      )}
    </div>
  );
}

// --- 2. Rock-Solid Responsive Pong Game ---
function TerminalPongGame({ onQuit }: { onQuit: () => void }) {
  const width = 26;
  const height = 11;
  const gameRef = useRef<HTMLDivElement>(null);

  const [paddleY, setPaddleY] = useState(4);
  const [ball, setBall] = useState({ x: 13, y: 5, dx: 1, dy: 1 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const movePaddle = (dir: -1 | 1) => {
    if (gameOver) return;
    setPaddleY((y) => Math.max(0, Math.min(height - 3, y + dir)));
  };

  useEffect(() => {
    gameRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      const key = e.key.toLowerCase();

      if (key === "q") {
        e.preventDefault();
        onQuit();
        return;
      }

      if (gameOver && (code === "Enter" || key === "enter")) {
        e.preventDefault();
        setPaddleY(4);
        setBall({ x: 13, y: 5, dx: 1, dy: 1 });
        setScore(0);
        setGameOver(false);
        return;
      }

      if (code === "ArrowUp" || code === "KeyW") {
        e.preventDefault();
        movePaddle(-1);
      } else if (code === "ArrowDown" || code === "KeyS") {
        e.preventDefault();
        movePaddle(1);
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
    }, 75);

    return () => clearInterval(timer);
  }, [paddleY, gameOver]);

  return (
    <div
      ref={gameRef}
      tabIndex={0}
      className="flex flex-col items-center justify-center p-2 font-mono text-xs outline-none select-none"
    >
      <div className="flex items-center justify-between w-full max-w-sm mb-1 text-[var(--accent)] font-bold">
        <span>🏓 PONG ARCADE</span>
        <span>SCORE: {score}</span>
      </div>

      <div className="border border-[var(--line)] bg-[var(--background)] p-1 rounded-xl shadow-lg">
        {Array.from({ length: height }).map((_, y) => (
          <div key={y} className="flex">
            {Array.from({ length: width }).map((_, x) => {
              const isPaddle = x === 0 && y >= paddleY && y <= paddleY + 2;
              const isBall = ball.x === x && ball.y === y;
              const isWall = x === width - 1;

              let char = " ";
              let color = "text-[var(--muted)]/20";

              if (isPaddle) {
                char = "█";
                color = "text-[var(--accent)] font-bold";
              } else if (isBall) {
                char = "●";
                color = "text-amber-400 font-bold animate-ping";
              } else if (isWall) {
                char = "│";
                color = "text-[var(--muted)]";
              }

              return (
                <span key={x} className={`w-3.5 h-4 text-center leading-none ${color}`}>
                  {char}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      {/* On-Screen Touch / Click Controls */}
      <div className="flex gap-3 mt-2">
        <button
          onClick={() => movePaddle(-1)}
          className="px-4 py-1 rounded bg-[var(--card-hover)] border border-[var(--line)] text-[var(--heading)] font-bold hover:bg-[var(--accent)] hover:text-black transition-all cursor-pointer"
        >
          ▲ MOVE UP
        </button>
        <button
          onClick={() => movePaddle(1)}
          className="px-4 py-1 rounded bg-[var(--card-hover)] border border-[var(--line)] text-[var(--heading)] font-bold hover:bg-[var(--accent)] hover:text-black transition-all cursor-pointer"
        >
          ▼ MOVE DOWN
        </button>
      </div>

      {gameOver ? (
        <div className="mt-2 text-center text-red-400 font-bold">
          GAME OVER! Press [ENTER] to Restart | [Q] to Quit
        </div>
      ) : (
        <div className="mt-1 text-center text-[10px] text-[var(--muted)]">
          Controls: W/S or Up/Down arrows or buttons | Press [Q] to Quit
        </div>
      )}
    </div>
  );
}

// --- 3. Rock-Solid Responsive Space Invaders Game ---
function TerminalInvadersGame({ onQuit }: { onQuit: () => void }) {
  const width = 24;
  const height = 11;
  const gameRef = useRef<HTMLDivElement>(null);

  const [playerX, setPlayerX] = useState(12);
  const [lasers, setLasers] = useState<{ x: number; y: number }[]>([]);
  const [aliens, setAliens] = useState<{ x: number; y: number }[]>([
    { x: 4, y: 1 }, { x: 8, y: 1 }, { x: 12, y: 1 }, { x: 16, y: 1 }, { x: 20, y: 1 },
    { x: 4, y: 2 }, { x: 8, y: 2 }, { x: 12, y: 2 }, { x: 16, y: 2 }, { x: 20, y: 2 },
  ]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const movePlayer = (dir: -1 | 1) => {
    if (gameOver) return;
    setPlayerX((x) => Math.max(0, Math.min(width - 1, x + dir)));
  };

  const shootLaser = () => {
    if (gameOver) return;
    setLasers((prev) => [...prev, { x: playerX, y: height - 2 }]);
  };

  useEffect(() => {
    gameRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      const key = e.key.toLowerCase();

      if (key === "q") {
        e.preventDefault();
        onQuit();
        return;
      }

      if (gameOver && (code === "Enter" || key === "enter")) {
        e.preventDefault();
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

      if (code === "ArrowLeft" || code === "KeyA") {
        e.preventDefault();
        movePlayer(-1);
      } else if (code === "ArrowRight" || code === "KeyD") {
        e.preventDefault();
        movePlayer(1);
      } else if (code === "Space" || key === " ") {
        e.preventDefault();
        shootLaser();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playerX, gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const timer = setInterval(() => {
      setLasers((prev) => prev.map((l) => ({ ...l, y: l.y - 1 })).filter((l) => l.y >= 0));
    }, 60);

    return () => clearInterval(timer);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver || aliens.length === 0) return;

    setAliens((prevAliens) => {
      let updated = [...prevAliens];
      lasers.forEach((laser) => {
        updated = updated.filter((alien) => {
          if (alien.x === laser.x && alien.y === laser.y) {
            setScore((s) => s + 20);
            return false;
          }
          return true;
        });
      });
      return updated;
    });
  }, [lasers, gameOver]);

  return (
    <div
      ref={gameRef}
      tabIndex={0}
      className="flex flex-col items-center justify-center p-2 font-mono text-xs outline-none select-none"
    >
      <div className="flex items-center justify-between w-full max-w-sm mb-1 text-[var(--accent)] font-bold">
        <span>👾 SPACE INVADERS</span>
        <span>SCORE: {score}</span>
      </div>

      <div className="border border-[var(--line)] bg-[var(--background)] p-1 rounded-xl shadow-lg">
        {Array.from({ length: height }).map((_, y) => (
          <div key={y} className="flex">
            {Array.from({ length: width }).map((_, x) => {
              const isPlayer = y === height - 1 && x === playerX;
              const isLaser = lasers.some((l) => l.x === x && l.y === y);
              const isAlien = aliens.some((a) => a.x === x && a.y === y);

              let char = " ";
              let color = "text-[var(--muted)]/20";

              if (isPlayer) {
                char = "▲";
                color = "text-[var(--accent)] font-bold";
              } else if (isLaser) {
                char = "│";
                color = "text-amber-400 font-bold";
              } else if (isAlien) {
                char = "W";
                color = "text-red-400 font-bold animate-pulse";
              }

              return (
                <span key={x} className={`w-3.5 h-4 text-center leading-none ${color}`}>
                  {char}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      {/* On-Screen Touch / Click Controls */}
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => movePlayer(-1)}
          className="px-3 py-1 rounded bg-[var(--card-hover)] border border-[var(--line)] text-[var(--heading)] font-bold hover:bg-[var(--accent)] hover:text-black transition-all cursor-pointer"
        >
          ◄ LEFT
        </button>
        <button
          onClick={shootLaser}
          className="px-4 py-1 rounded bg-[var(--accent)] text-black font-extrabold hover:brightness-110 transition-all cursor-pointer shadow-md"
        >
          🚀 SHOOT
        </button>
        <button
          onClick={() => movePlayer(1)}
          className="px-3 py-1 rounded bg-[var(--card-hover)] border border-[var(--line)] text-[var(--heading)] font-bold hover:bg-[var(--accent)] hover:text-black transition-all cursor-pointer"
        >
          ► RIGHT
        </button>
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
        <div className="mt-1 text-center text-[10px] text-[var(--muted)]">
          Controls: A/D or Arrow keys to Move | SPACE to Shoot | Press [Q] to Quit
        </div>
      )}
    </div>
  );
}

// --- 4. Interactive Number Guessing Game Component ---
function TerminalGuessGame({ onQuit }: { onQuit: () => void }) {
  const [target, setTarget] = useState<number>(() => Math.floor(Math.random() * 100) + 1);
  const [guessInput, setGuessInput] = useState("");
  const [attempts, setAttempts] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("Guess a number between 1 and 100!");
  const [won, setWon] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(guessInput, 10);
    if (isNaN(val)) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (val < target) {
      setFeedback(`📈 TOO LOW! '${val}' is smaller than the target. Try higher!`);
    } else if (val > target) {
      setFeedback(`📉 TOO HIGH! '${val}' is larger than the target. Try lower!`);
    } else {
      setFeedback(`🎉 BINGO! You guessed ${target} correctly in ${newAttempts} attempt(s)!`);
      setWon(true);
    }
    setGuessInput("");
  };

  const restartGame = () => {
    setTarget(Math.floor(Math.random() * 100) + 1);
    setAttempts(0);
    setFeedback("New target generated! Guess a number between 1 and 100!");
    setWon(false);
    setGuessInput("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="flex flex-col items-center justify-center p-3 font-mono text-xs select-none">
      <div className="flex items-center justify-between w-full max-w-sm mb-2 text-[var(--accent)] font-bold">
        <span>🎯 NUMBER GUESSING ARCADE</span>
        <span>ATTEMPTS: {attempts}</span>
      </div>

      <div className="w-full max-w-sm border border-[var(--line)] bg-[var(--background)] p-4 rounded-xl shadow-lg space-y-3 text-center">
        <p className="font-semibold text-[var(--heading)] text-sm">{feedback}</p>

        {!won ? (
          <form onSubmit={handleGuess} className="flex gap-2 justify-center mt-2">
            <input
              ref={inputRef}
              type="number"
              min="1"
              max="100"
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              placeholder="1-100"
              className="w-24 px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--card-bg)] text-[var(--heading)] font-mono font-bold text-center outline-none focus:border-[var(--accent)]"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[var(--accent)] text-black font-extrabold hover:brightness-110 transition-all cursor-pointer"
            >
              SUBMIT
            </button>
          </form>
        ) : (
          <div className="space-y-2 mt-2">
            <button
              onClick={restartGame}
              className="px-4 py-2 rounded-lg bg-[var(--accent)] text-black font-extrabold hover:brightness-110 transition-all cursor-pointer w-full"
            >
              PLAY AGAIN 🔄
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-3">
        <button
          onClick={onQuit}
          className="px-3 py-1 rounded border border-[var(--line)] text-[var(--muted)] hover:text-[var(--heading)] transition-all cursor-pointer text-[11px]"
        >
          Quit Game [Q]
        </button>
      </div>
    </div>
  );
}

export function TerminalModal({ isOpen, onClose, onToggleTheme, onOpenResume, onNavigate }: TerminalModalProps) {
  const [input, setInput] = useState("");
  const [currentDir, setCurrentDir] = useState<string>("/home/anas");
  const [activeGame, setActiveGame] = useState<"snake" | "pong" | "invaders" | "guess" | null>(null);
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
  uptime      - Display system uptime & load averages
  date        - Current system timestamp
  pwd         - Print working directory
  ls          - List directory files & projects
  cd <dir>    - Change working directory (e.g. cd projects, cd ..)
  cat <file>  - Read file (e.g. cat bio.txt, cat stack.txt)
  echo <msg>  - Print message string to terminal
  projects    - List all ${projects.length} project repositories
  catalog     - Open the full /projects catalog page
  blog        - Open the /blog field-notes page
  skills      - Machine learning, systems & web tech ecosystem
  experience  - Leadership positions & experience nodes
  contact     - Email, GitHub & LinkedIn handles
  snake       - Launch 2D ASCII Snake Arcade game
  pong        - Launch 2D ASCII Pong Arcade game
  invaders    - Launch 2D ASCII Space Invaders Arcade game
  guess       - Launch interactive Number Guessing game
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

      case "uptime":
        const now = new Date();
        const timeStr = now.toTimeString().split(" ")[0];
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: ` ${timeStr} up 842 days, 14:32, 1 user, load average: 0.14, 0.08, 0.05`,
        });
        break;

      case "date":
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: new Date().toString(),
        });
        break;

      case "echo":
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: args.join(" "),
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

      case "guess":
        setActiveGame("guess");
        responses.push({
          id: Math.random().toString(),
          type: "system",
          text: "Launching interactive Number Guessing game...",
        });
        break;

      case "contact":
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: `📧 Email: ${profile.email}\n🐙 GitHub: ${profile.github}\n💼 LinkedIn: ${profile.linkedin}`,
        });
        break;

      case "experience":
        responses.push({
          id: Math.random().toString(),
          type: "response",
          text: experience.map((e) => `▪ ${e.role} @ ${e.org} (${e.time})\n  ${e.notes.join("\n  ")}`).join("\n\n"),
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

      case "catalog":
        onNavigate("/projects");
        responses.push({ id: Math.random().toString(), type: "system", text: "Navigating to /projects..." });
        break;

      case "blog":
        onNavigate("/blog");
        responses.push({ id: Math.random().toString(), type: "system", text: "Navigating to /blog..." });
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
            ) : activeGame === "guess" ? (
              <TerminalGuessGame onQuit={() => setActiveGame(null)} />
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
