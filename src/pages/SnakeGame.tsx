import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bug, RotateCcw, Trophy, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCustomTheme } from "@/components/ThemePicker";
import { cn } from "@/lib/utils";

const GRID = 20;
const CELL = 20;
const INITIAL_SPEED = 150;

type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Pos = { x: number; y: number };

function randomFood(snake: Pos[]): Pos {
  let pos: Pos;
  do {
    pos = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
  } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
  return pos;
}

const SnakeGame = () => {
  useCustomTheme();
  const [snake, setSnake] = useState<Pos[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Pos>({ x: 5, y: 5 });
  const [dir, setDir] = useState<Dir>("RIGHT");
  const [gameOver, setGameOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const s = localStorage.getItem("snake-high");
    return s ? parseInt(s) : 0;
  });

  const dirRef = useRef(dir);
  dirRef.current = dir;
  const snakeRef = useRef(snake);
  snakeRef.current = snake;

  const restart = () => {
    const initial = [{ x: 10, y: 10 }];
    setSnake(initial);
    setFood(randomFood(initial));
    setDir("RIGHT");
    setGameOver(false);
    setRunning(false);
    setScore(0);
  };

  const handleKey = useCallback((e: KeyboardEvent) => {
    const map: Record<string, Dir> = {
      ArrowUp: "UP", ArrowDown: "DOWN", ArrowLeft: "LEFT", ArrowRight: "RIGHT",
      w: "UP", s: "DOWN", a: "LEFT", d: "RIGHT",
    };
    const newDir = map[e.key];
    if (!newDir) {
      if (e.key === " ") { e.preventDefault(); setRunning((r) => !r); }
      return;
    }
    e.preventDefault();
    const cur = dirRef.current;
    const opposites: Record<Dir, Dir> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
    if (newDir !== opposites[cur]) {
      setDir(newDir);
      if (!running && !gameOver) setRunning(true);
    }
  }, [running, gameOver]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  useEffect(() => {
    if (!running || gameOver) return;
    const speed = Math.max(60, INITIAL_SPEED - score * 2);
    const interval = setInterval(() => {
      const s = snakeRef.current;
      const head = { ...s[0] };
      const d = dirRef.current;
      if (d === "UP") head.y -= 1;
      if (d === "DOWN") head.y += 1;
      if (d === "LEFT") head.x -= 1;
      if (d === "RIGHT") head.x += 1;

      if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID || s.some((p) => p.x === head.x && p.y === head.y)) {
        setGameOver(true);
        setRunning(false);
        setScore((sc) => {
          if (sc > highScore) {
            setHighScore(sc);
            localStorage.setItem("snake-high", sc.toString());
          }
          return sc;
        });
        return;
      }

      const newSnake = [head, ...s];
      setFood((f) => {
        if (head.x === f.x && head.y === f.y) {
          setScore((sc) => sc + 1);
          const nf = randomFood(newSnake);
          setFood(nf);
          return nf;
        }
        newSnake.pop();
        return f;
      });
      setSnake(newSnake);
    }, speed);
    return () => clearInterval(interval);
  }, [running, gameOver, score, highScore]);

  // Touch controls
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
    const cur = dirRef.current;
    const opposites: Record<Dir, Dir> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
    let newDir: Dir;
    if (Math.abs(dx) > Math.abs(dy)) {
      newDir = dx > 0 ? "RIGHT" : "LEFT";
    } else {
      newDir = dy > 0 ? "DOWN" : "UP";
    }
    if (newDir !== opposites[cur]) {
      setDir(newDir);
      if (!running && !gameOver) setRunning(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-primary px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between mb-3">
            <Link to="/games" className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Games</span>
            </Link>
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-3">
            <Bug className="h-7 w-7 text-accent" />
            <h1 className="font-display text-3xl text-primary-foreground">Snake</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Stats */}
        <div className="flex justify-center gap-6 mb-6">
          <div className="flex flex-col items-center">
            <span className="text-sm text-muted-foreground">Score</span>
            <span className="text-3xl font-display text-foreground">{score}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1"><Trophy className="h-3 w-3" /> Best</span>
            <span className="text-3xl font-display text-accent">{highScore}</span>
          </div>
        </div>

        {gameOver && (
          <p className="text-center font-display text-2xl text-destructive mb-4">Game Over! 💀</p>
        )}

        {/* Board */}
        <div
          className="flex justify-center mb-6"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="relative rounded-xl border-2 border-border bg-card overflow-hidden"
            style={{ width: GRID * CELL, height: GRID * CELL }}
          >
            {/* Food */}
            <div
              className="absolute rounded-full bg-destructive"
              style={{ width: CELL - 2, height: CELL - 2, left: food.x * CELL + 1, top: food.y * CELL + 1 }}
            />
            {/* Snake */}
            {snake.map((seg, i) => (
              <div
                key={i}
                className={cn("absolute rounded-sm", i === 0 ? "bg-accent" : "bg-accent/70")}
                style={{ width: CELL - 2, height: CELL - 2, left: seg.x * CELL + 1, top: seg.y * CELL + 1 }}
              />
            ))}

            {/* Overlay */}
            {!running && !gameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                <p className="text-muted-foreground text-sm">Press Space or swipe to start</p>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          <Button onClick={() => running ? setRunning(false) : (gameOver ? restart() : setRunning(true))} variant="outline" size="lg">
            {gameOver ? <><RotateCcw className="h-4 w-4 mr-2" /> Play Again</> :
              running ? <><Pause className="h-4 w-4 mr-2" /> Pause</> :
              <><Play className="h-4 w-4 mr-2" /> Play</>}
          </Button>
          {!gameOver && (
            <Button onClick={restart} variant="ghost" size="lg" className="text-muted-foreground">
              <RotateCcw className="h-4 w-4 mr-2" /> Restart
            </Button>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">Use arrow keys, WASD, or swipe to move</p>
      </div>
    </div>
  );
};

export default SnakeGame;
