import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Hand, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCustomTheme } from "@/components/ThemePicker";
import { cn } from "@/lib/utils";

type Choice = "rock" | "paper" | "scissors";
type Result = "win" | "lose" | "draw" | null;

const choices: { id: Choice; emoji: string; label: string }[] = [
  { id: "rock", emoji: "🪨", label: "Rock" },
  { id: "paper", emoji: "📄", label: "Paper" },
  { id: "scissors", emoji: "✂️", label: "Scissors" },
];

function getResult(player: Choice, computer: Choice): Result {
  if (player === computer) return "draw";
  if (
    (player === "rock" && computer === "scissors") ||
    (player === "paper" && computer === "rock") ||
    (player === "scissors" && computer === "paper")
  ) return "win";
  return "lose";
}

const RockPaperScissors = () => {
  useCustomTheme();
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<Result>(null);
  const [scores, setScores] = useState({ wins: 0, losses: 0, draws: 0 });
  const [animating, setAnimating] = useState(false);

  const play = (choice: Choice) => {
    if (animating) return;
    setAnimating(true);
    setPlayerChoice(choice);
    setComputerChoice(null);
    setResult(null);

    setTimeout(() => {
      const compChoice = choices[Math.floor(Math.random() * 3)].id;
      setComputerChoice(compChoice);
      const res = getResult(choice, compChoice);
      setResult(res);
      setScores((s) => ({
        wins: s.wins + (res === "win" ? 1 : 0),
        losses: s.losses + (res === "lose" ? 1 : 0),
        draws: s.draws + (res === "draw" ? 1 : 0),
      }));
      setAnimating(false);
    }, 800);
  };

  const resetScores = () => {
    setScores({ wins: 0, losses: 0, draws: 0 });
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
  };

  const resultText = result === "win" ? "You Win! 🎉" : result === "lose" ? "You Lose! 😢" : result === "draw" ? "It's a Draw! 🤝" : null;
  const resultColor = result === "win" ? "text-green-500" : result === "lose" ? "text-destructive" : "text-muted-foreground";

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
            <Hand className="h-7 w-7 text-accent" />
            <h1 className="font-display text-3xl text-primary-foreground">Rock Paper Scissors</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Scoreboard */}
        <div className="flex justify-center gap-4 mb-8">
          <div className="flex flex-col items-center rounded-xl px-5 py-3 border-2 border-green-500/30 bg-green-500/5">
            <span className="text-sm text-muted-foreground">Wins</span>
            <span className="text-3xl font-display text-green-500">{scores.wins}</span>
          </div>
          <div className="flex flex-col items-center rounded-xl px-5 py-3 border-2 border-border bg-card">
            <span className="text-sm text-muted-foreground">Draws</span>
            <span className="text-3xl font-display text-muted-foreground">{scores.draws}</span>
          </div>
          <div className="flex flex-col items-center rounded-xl px-5 py-3 border-2 border-destructive/30 bg-destructive/5">
            <span className="text-sm text-muted-foreground">Losses</span>
            <span className="text-3xl font-display text-destructive">{scores.losses}</span>
          </div>
        </div>

        {/* Battle Area */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-muted-foreground">You</span>
            <div className={cn(
              "h-28 w-28 rounded-2xl border-2 flex items-center justify-center text-5xl transition-all",
              playerChoice ? "border-accent bg-accent/10" : "border-border bg-card"
            )}>
              {playerChoice ? choices.find(c => c.id === playerChoice)?.emoji : "❓"}
            </div>
          </div>
          <span className="text-2xl font-display text-muted-foreground">VS</span>
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-muted-foreground">Computer</span>
            <div className={cn(
              "h-28 w-28 rounded-2xl border-2 flex items-center justify-center text-5xl transition-all",
              animating && "animate-pulse",
              computerChoice ? "border-accent bg-accent/10" : "border-border bg-card"
            )}>
              {animating ? "🤔" : computerChoice ? choices.find(c => c.id === computerChoice)?.emoji : "❓"}
            </div>
          </div>
        </div>

        {/* Result */}
        {resultText && (
          <p className={cn("text-center font-display text-2xl mb-6", resultColor)}>{resultText}</p>
        )}

        {/* Choices */}
        <div className="flex justify-center gap-4 mb-8">
          {choices.map((c) => (
            <button
              key={c.id}
              onClick={() => play(c.id)}
              disabled={animating}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border-2 px-6 py-4 transition-all",
                "hover:border-accent hover:bg-accent/10 cursor-pointer",
                "border-border bg-card disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <span className="text-4xl">{c.emoji}</span>
              <span className="text-sm font-medium text-foreground">{c.label}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <Button onClick={resetScores} variant="ghost" className="text-muted-foreground">
            <RotateCcw className="h-4 w-4 mr-2" /> Reset Scores
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RockPaperScissors;
