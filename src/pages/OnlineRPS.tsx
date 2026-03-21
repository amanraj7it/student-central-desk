import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Hand, RotateCcw, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCustomTheme } from "@/components/ThemePicker";
import { useAuth } from "@/hooks/use-auth";
import { useStudents } from "@/hooks/use-students";
import { useGameChallenge, useUpdateGameState } from "@/hooks/use-game-challenges";
import { cn } from "@/lib/utils";

type Choice = "rock" | "paper" | "scissors";

const choicesList: { id: Choice; emoji: string; label: string }[] = [
  { id: "rock", emoji: "🪨", label: "Rock" },
  { id: "paper", emoji: "📄", label: "Paper" },
  { id: "scissors", emoji: "✂️", label: "Scissors" },
];

function getRoundWinner(a: Choice, b: Choice): "a" | "b" | "draw" {
  if (a === b) return "draw";
  if ((a === "rock" && b === "scissors") || (a === "paper" && b === "rock") || (a === "scissors" && b === "paper")) return "a";
  return "b";
}

const OnlineRPS = () => {
  useCustomTheme();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: students = [] } = useStudents();
  const { data: challenge, isLoading } = useGameChallenge(id || null);
  const updateGame = useUpdateGameState();
  const [picked, setPicked] = useState(false);

  const getStudentName = (userId: string) =>
    students.find((s) => s.user_id === userId)?.name || "Unknown";

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading game...</p></div>;
  if (!challenge) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Game not found</p></div>;

  const gameData = challenge.game_data || {};
  const player1 = gameData.player1 || challenge.challenger_id;
  const player2 = gameData.player2 || challenge.challenged_id;
  const rounds: { p1: Choice; p2: Choice; winner: string | null }[] = gameData.rounds || [];
  const currentRound = gameData.currentRound || {};
  const maxRounds = 5;
  const isCompleted = challenge.status === "completed";

  const amPlayer1 = user?.id === player1;
  const myKey = amPlayer1 ? "p1Choice" : "p2Choice";
  const opponentKey = amPlayer1 ? "p2Choice" : "p1Choice";
  const myChoice = currentRound[myKey] as Choice | undefined;
  const opponentChoice = currentRound[opponentKey] as Choice | undefined;

  const p1Wins = rounds.filter((r) => r.winner === player1).length;
  const p2Wins = rounds.filter((r) => r.winner === player2).length;
  const myWins = amPlayer1 ? p1Wins : p2Wins;
  const theirWins = amPlayer1 ? p2Wins : p1Wins;
  const winsNeeded = Math.ceil(maxRounds / 2);
  const matchOver = isCompleted || myWins >= winsNeeded || theirWins >= winsNeeded;

  const opponentId = amPlayer1 ? player2 : player1;

  const handlePick = (choice: Choice) => {
    if (picked || myChoice || matchOver) return;
    setPicked(true);

    const newCurrentRound = { ...currentRound, [myKey]: choice };

    // Check if both have picked
    if (newCurrentRound.p1Choice && newCurrentRound.p2Choice) {
      const result = getRoundWinner(newCurrentRound.p1Choice, newCurrentRound.p2Choice);
      const roundWinner = result === "a" ? player1 : result === "b" ? player2 : null;
      const newRounds = [...rounds, { p1: newCurrentRound.p1Choice, p2: newCurrentRound.p2Choice, winner: roundWinner }];
      const newP1Wins = newRounds.filter((r) => r.winner === player1).length;
      const newP2Wins = newRounds.filter((r) => r.winner === player2).length;
      const gameOver = newP1Wins >= winsNeeded || newP2Wins >= winsNeeded || newRounds.length >= maxRounds;
      let finalWinner: string | null = null;
      if (gameOver) {
        if (newP1Wins > newP2Wins) finalWinner = player1;
        else if (newP2Wins > newP1Wins) finalWinner = player2;
      }

      updateGame.mutate({
        id: challenge.id,
        gameData: { ...gameData, player1, player2, rounds: newRounds, currentRound: {}, lastReveal: { p1: newCurrentRound.p1Choice, p2: newCurrentRound.p2Choice, winner: roundWinner } },
        status: gameOver ? "completed" : "active",
        winnerId: finalWinner,
      });
    } else {
      updateGame.mutate({
        id: challenge.id,
        gameData: { ...gameData, player1, player2, rounds, currentRound: newCurrentRound },
      });
    }

    setTimeout(() => setPicked(false), 1500);
  };

  const handleRematch = () => {
    updateGame.mutate({
      id: challenge.id,
      gameData: { player1, player2, rounds: [], currentRound: {}, lastReveal: null },
      status: "active",
      winnerId: null,
    });
  };

  const lastReveal = gameData.lastReveal;
  const waitingForOpponent = !!myChoice && !opponentChoice;

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
            <h1 className="font-display text-3xl text-primary-foreground">Online Rock Paper Scissors</h1>
          </div>
          <p className="text-primary-foreground/60 text-sm mt-1">vs {getStudentName(opponentId)}</p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Scoreboard */}
        <div className="flex justify-center gap-6 mb-8">
          <div className={cn("flex flex-col items-center rounded-xl px-6 py-3 border-2", myWins > theirWins ? "border-accent bg-accent/10" : "border-border bg-card")}>
            <span className="text-xs text-muted-foreground">You</span>
            <span className="text-3xl font-display text-foreground">{myWins}</span>
          </div>
          <div className="flex items-center"><Swords className="h-5 w-5 text-muted-foreground" /></div>
          <div className={cn("flex flex-col items-center rounded-xl px-6 py-3 border-2", theirWins > myWins ? "border-accent bg-accent/10" : "border-border bg-card")}>
            <span className="text-xs text-muted-foreground">{getStudentName(opponentId)}</span>
            <span className="text-3xl font-display text-foreground">{theirWins}</span>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mb-2">Best of {maxRounds} • Round {Math.min(rounds.length + 1, maxRounds)}</p>

        {/* Last round result */}
        {lastReveal && !matchOver && (
          <div className="text-center mb-6 p-4 rounded-xl border border-border bg-card">
            <div className="flex justify-center items-center gap-6 mb-2">
              <div className="text-center">
                <span className="text-3xl">{choicesList.find(c => c.id === (amPlayer1 ? lastReveal.p1 : lastReveal.p2))?.emoji}</span>
                <p className="text-xs text-muted-foreground mt-1">You</p>
              </div>
              <span className="text-lg text-muted-foreground">vs</span>
              <div className="text-center">
                <span className="text-3xl">{choicesList.find(c => c.id === (amPlayer1 ? lastReveal.p2 : lastReveal.p1))?.emoji}</span>
                <p className="text-xs text-muted-foreground mt-1">{getStudentName(opponentId)}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-foreground">
              {lastReveal.winner === user?.id ? "You won this round! 🎉" : lastReveal.winner === null ? "Draw! 🤝" : `${getStudentName(lastReveal.winner)} won this round`}
            </p>
          </div>
        )}

        {/* Status */}
        <div className="text-center mb-6">
          {matchOver ? (
            <p className="font-display text-2xl text-foreground">
              {challenge.winner_id === user?.id ? "🎉 You Won the Match!" : challenge.winner_id === null ? "Match is a Draw! 🤝" : `${getStudentName(challenge.winner_id || opponentId)} Wins! 😢`}
            </p>
          ) : waitingForOpponent ? (
            <p className="text-lg text-muted-foreground animate-pulse">Waiting for {getStudentName(opponentId)} to pick...</p>
          ) : (
            <p className="text-lg text-accent font-medium">Pick your move!</p>
          )}
        </div>

        {/* Choices */}
        {!matchOver && (
          <div className="flex justify-center gap-4 mb-8">
            {choicesList.map((c) => (
              <button
                key={c.id}
                onClick={() => handlePick(c.id)}
                disabled={!!myChoice || picked}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl border-2 px-6 py-4 transition-all",
                  myChoice === c.id ? "border-accent bg-accent/15 scale-105" : "border-border bg-card",
                  !myChoice && !picked && "hover:border-accent hover:bg-accent/10 cursor-pointer",
                  (!!myChoice || picked) && myChoice !== c.id && "opacity-40 cursor-not-allowed"
                )}
              >
                <span className="text-4xl">{c.emoji}</span>
                <span className="text-sm font-medium text-foreground">{c.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Round History */}
        {rounds.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2 text-center">Round History</h3>
            <div className="flex justify-center gap-2 flex-wrap">
              {rounds.map((r, i) => {
                const myMove = amPlayer1 ? r.p1 : r.p2;
                const won = r.winner === user?.id;
                const draw = r.winner === null;
                return (
                  <div key={i} className={cn("flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs",
                    won ? "border-accent/50 bg-accent/10 text-accent" : draw ? "border-border bg-card text-muted-foreground" : "border-destructive/30 bg-destructive/5 text-destructive"
                  )}>
                    <span>R{i + 1}</span>
                    <span>{choicesList.find(c => c.id === myMove)?.emoji}</span>
                    <span>{won ? "✓" : draw ? "=" : "✗"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {matchOver && (
          <div className="flex justify-center">
            <Button onClick={handleRematch} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <RotateCcw className="h-4 w-4 mr-2" /> Rematch
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlineRPS;
