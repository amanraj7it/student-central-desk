import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Bug, RotateCcw, Swords, Play, Pause, Trophy, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCustomTheme } from "@/components/ThemePicker";
import { useAuth } from "@/hooks/use-auth";
import { useStudents } from "@/hooks/use-students";
import { useGameChallenge, useUpdateGameState } from "@/hooks/use-game-challenges";
import { cn } from "@/lib/utils";

const GRID = 20;
const CELL = 18;
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

const OnlineSnake = () => {
  useCustomTheme();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: students = [] } = useStudents();
  const { data: challenge, isLoading } = useGameChallenge(id || null);
  const updateGame = useUpdateGameState();

  const getStudentName = (userId: string) =>
    students.find((s) => s.user_id === userId)?.name || "Unknown";

  const [snake, setSnake] = useState<Pos[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Pos>({ x: 5, y: 5 });
  const [dir, setDir] = useState<Dir>("RIGHT");
  const [gameOver, setGameOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const dirRef = useRef(dir);
  dirRef.current = dir;
  const snakeRef = useRef(snake);
  snakeRef.current = snake;

  const gameData = challenge?.game_data || {};
  const player1 = gameData.player1 || challenge?.challenger_id || "";
  const player2 = gameData.player2 || challenge?.challenged_id || "";
  const amPlayer1 = user?.id === player1;
  const myScoreKey = amPlayer1 ? "p1Score" : "p2Score";
  const opponentScoreKey = amPlayer1 ? "p2Score" : "p1Score";
  const opponentId = amPlayer1 ? player2 : player1;
  const isCompleted = challenge?.status === "completed";

  const mySubmittedScore = gameData[myScoreKey] as number | undefined;
  const opponentScore = gameData[opponentScoreKey] as number | undefined;
  const bothDone = mySubmittedScore !== undefined && opponentScore !== undefined;

  const restart = () => {
    const initial = [{ x: 10, y: 10 }];
    setSnake(initial);
    setFood(randomFood(initial));
    setDir("RIGHT");
    setGameOver(false);
    setRunning(false);
    setScore(0);
  };

  const handleSubmitScore = () => {
    if (!challenge || submitted || mySubmittedScore !== undefined) return;
    setSubmitted(true);
    const newData = { ...gameData, [myScoreKey]: score };
    const otherScore = gameData[opponentScoreKey] as number | undefined;
    if (otherScore !== undefined) {
      let winnerId: string | null = null;
      if (score > otherScore) winnerId = user!.id;
      else if (otherScore > score) winnerId = opponentId;
      updateGame.mutate({ id: challenge.id, gameData: newData, status: "completed", winnerId });
    } else {
      updateGame.mutate({ id: challenge.id, gameData: newData });
    }
  };

  const handleRematch = () => {
    if (!challenge) return;
    updateGame.mutate({
      id: challenge.id,
      gameData: { player1, player2 },
      status: "active",
      winnerId: null,
    });
    restart();
    setSubmitted(false);
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
  }, [running, gameOver, score]);

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
    const cur = dirRef.current;
    const opposites: Record<Dir, Dir> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
    let newDir: Dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "RIGHT" : "LEFT") : (dy > 0 ? "DOWN" : "UP");
    if (newDir !== opposites[cur]) { setDir(newDir); if (!running && !gameOver) setRunning(true); }
  };

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading game...</p></div>;
  if (!challenge) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Game not found</p></div>;

  const alreadySubmitted = mySubmittedScore !== undefined;

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
            <h1 className="font-display text-3xl text-primary-foreground">Snake Challenge</h1>
          </div>
          <p className="text-primary-foreground/60 text-sm mt-1">vs {getStudentName(opponentId)} • Highest score wins!</p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Scoreboard */}
        <div className="flex justify-center gap-6 mb-6">
          <div className="flex flex-col items-center rounded-xl px-5 py-3 border-2 border-border bg-card">
            <span className="text-xs text-muted-foreground">Your Score</span>
            <span className="text-3xl font-display text-foreground">{alreadySubmitted ? mySubmittedScore : score}</span>
          </div>
          <div className="flex items-center"><Swords className="h-5 w-5 text-muted-foreground" /></div>
          <div className="flex flex-col items-center rounded-xl px-5 py-3 border-2 border-border bg-card">
            <span className="text-xs text-muted-foreground">{getStudentName(opponentId)}</span>
            <span className="text-3xl font-display text-foreground">{opponentScore ?? "..."}</span>
          </div>
        </div>

        {/* Status */}
        <div className="text-center mb-6">
          {bothDone || isCompleted ? (
            <p className="font-display text-2xl text-foreground">
              {challenge.winner_id === user?.id ? "🎉 You Won! Higher score!" :
                challenge.winner_id === null ? "It's a Tie! 🤝" :
                  `${getStudentName(challenge.winner_id || opponentId)} Wins!`}
            </p>
          ) : alreadySubmitted ? (
            <p className="text-lg text-muted-foreground animate-pulse">
              Score submitted ({mySubmittedScore})! Waiting for {getStudentName(opponentId)}...
            </p>
          ) : gameOver ? (
            <p className="font-display text-xl text-destructive">Game Over! Submit your score or try again.</p>
          ) : null}
        </div>

        {/* Game Board */}
        {!alreadySubmitted && (
          <>
            <div className="flex justify-center mb-6" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
              <div className="relative rounded-xl border-2 border-border bg-card overflow-hidden" style={{ width: GRID * CELL, height: GRID * CELL }}>
                <div className="absolute rounded-full bg-destructive" style={{ width: CELL - 2, height: CELL - 2, left: food.x * CELL + 1, top: food.y * CELL + 1 }} />
                {snake.map((seg, i) => (
                  <div key={i} className={cn("absolute rounded-sm", i === 0 ? "bg-accent" : "bg-accent/70")} style={{ width: CELL - 2, height: CELL - 2, left: seg.x * CELL + 1, top: seg.y * CELL + 1 }} />
                ))}
                {!running && !gameOver && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                    <p className="text-muted-foreground text-sm">Press Space or swipe to start</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center gap-3 mb-4">
              {gameOver ? (
                <>
                  <Button onClick={handleSubmitScore} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Send className="h-4 w-4 mr-2" /> Submit Score ({score})
                  </Button>
                  <Button onClick={restart} variant="outline" size="lg">
                    <RotateCcw className="h-4 w-4 mr-2" /> Try Again
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => running ? setRunning(false) : setRunning(true)} variant="outline" size="lg">
                    {running ? <><Pause className="h-4 w-4 mr-2" /> Pause</> : <><Play className="h-4 w-4 mr-2" /> Play</>}
                  </Button>
                  <Button onClick={restart} variant="ghost" size="lg" className="text-muted-foreground">
                    <RotateCcw className="h-4 w-4 mr-2" /> Restart
                  </Button>
                </>
              )}
            </div>
            <p className="text-center text-xs text-muted-foreground">Use arrow keys, WASD, or swipe to move</p>
          </>
        )}

        {(bothDone || isCompleted) && (
          <div className="flex justify-center mt-4">
            <Button onClick={handleRematch} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <RotateCcw className="h-4 w-4 mr-2" /> Rematch
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlineSnake;
