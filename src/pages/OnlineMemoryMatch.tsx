import { useState, useCallback, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Layers, RotateCcw, Swords, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCustomTheme } from "@/components/ThemePicker";
import { useAuth } from "@/hooks/use-auth";
import { useStudents } from "@/hooks/use-students";
import { useGameChallenge, useUpdateGameState } from "@/hooks/use-game-challenges";
import { cn } from "@/lib/utils";

const EMOJIS = ["🐶", "🐱", "🐸", "🦊", "🐻", "🐼", "🐨", "🦁"];

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

function createDeckFromSeed(seed: string): Card[] {
  // Deterministic shuffle from seed so both players get the same deck
  const pairs = [...EMOJIS, ...EMOJIS];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const rng = () => { hash = (hash * 1103515245 + 12345) & 0x7fffffff; return hash / 0x7fffffff; };
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs.map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
}

const OnlineMemoryMatch = () => {
  useCustomTheme();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: students = [] } = useStudents();
  const { data: challenge, isLoading } = useGameChallenge(id || null);
  const updateGame = useUpdateGameState();

  const getStudentName = (userId: string) =>
    students.find((s) => s.user_id === userId)?.name || "Unknown";

  // Local game state
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const gameData = challenge?.game_data || {};
  const seed = gameData.seed || challenge?.id || "default";
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

  // Initialize deck on mount
  useEffect(() => {
    if (seed) setCards(createDeckFromSeed(seed));
  }, [seed]);

  const matchedCount = cards.filter((c) => c.matched).length;
  const gameWon = matchedCount === cards.length;

  // Auto-submit when game won
  useEffect(() => {
    if (gameWon && !submitted && mySubmittedScore === undefined && challenge) {
      setSubmitted(true);
      const newData = { ...gameData, [myScoreKey]: moves };

      // Check if both done
      const otherScore = gameData[opponentScoreKey] as number | undefined;
      if (otherScore !== undefined) {
        let winnerId: string | null = null;
        if (moves < otherScore) winnerId = user!.id;
        else if (otherScore < moves) winnerId = opponentId;
        updateGame.mutate({ id: challenge.id, gameData: newData, status: "completed", winnerId });
      } else {
        updateGame.mutate({ id: challenge.id, gameData: newData });
      }
    }
  }, [gameWon, submitted, mySubmittedScore, challenge, moves, gameData, myScoreKey, opponentScoreKey, opponentId, user, updateGame]);

  const handleFlip = useCallback((cardId: number) => {
    if (locked || submitted || mySubmittedScore !== undefined) return;
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.flipped || card.matched) return;
    if (selected.length >= 2) return;

    const newCards = cards.map((c) => c.id === cardId ? { ...c, flipped: true } : c);
    setCards(newCards);
    const newSelected = [...selected, cardId];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      const c1 = newCards.find((c) => c.id === newSelected[0])!;
      const c2 = newCards.find((c) => c.id === newSelected[1])!;
      if (c1.emoji === c2.emoji) {
        setCards((prev) => prev.map((c) => c.id === newSelected[0] || c.id === newSelected[1] ? { ...c, matched: true } : c));
        setSelected([]);
      } else {
        setLocked(true);
        setTimeout(() => {
          setCards((prev) => prev.map((c) => c.id === newSelected[0] || c.id === newSelected[1] ? { ...c, flipped: false } : c));
          setSelected([]);
          setLocked(false);
        }, 800);
      }
    }
  }, [cards, selected, locked, submitted, mySubmittedScore]);

  const handleRematch = () => {
    if (!challenge) return;
    const newSeed = Date.now().toString();
    updateGame.mutate({
      id: challenge.id,
      gameData: { player1, player2, seed: newSeed },
      status: "active",
      winnerId: null,
    });
    setCards(createDeckFromSeed(newSeed));
    setMoves(0);
    setSelected([]);
    setSubmitted(false);
    setLocked(false);
  };

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading game...</p></div>;
  if (!challenge) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Game not found</p></div>;

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
            <Layers className="h-7 w-7 text-accent" />
            <h1 className="font-display text-3xl text-primary-foreground">Memory Match Challenge</h1>
          </div>
          <p className="text-primary-foreground/60 text-sm mt-1">vs {getStudentName(opponentId)} • Fewest moves wins!</p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Scoreboard */}
        <div className="flex justify-center gap-6 mb-6">
          <div className="flex flex-col items-center rounded-xl px-5 py-3 border-2 border-border bg-card">
            <span className="text-xs text-muted-foreground">Your Moves</span>
            <span className="text-3xl font-display text-foreground">{mySubmittedScore ?? moves}</span>
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
              {challenge.winner_id === user?.id ? "🎉 You Won! Fewer moves!" :
                challenge.winner_id === null ? "It's a Tie! 🤝" :
                  `${getStudentName(challenge.winner_id || opponentId)} Wins!`}
            </p>
          ) : mySubmittedScore !== undefined ? (
            <p className="text-lg text-muted-foreground animate-pulse">
              Done in {mySubmittedScore} moves! Waiting for {getStudentName(opponentId)}...
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Match all pairs in the fewest moves!</p>
          )}
        </div>

        {/* Grid */}
        {mySubmittedScore === undefined && (
          <div className="flex justify-center mb-8">
            <div className="grid grid-cols-4 gap-3">
              {cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleFlip(card.id)}
                  className={cn(
                    "h-20 w-20 sm:h-24 sm:w-24 rounded-xl border-2 text-3xl sm:text-4xl font-bold transition-all duration-300",
                    card.flipped || card.matched ? "border-accent bg-accent/10" : "border-border bg-card hover:border-accent/50 cursor-pointer",
                    card.matched && "opacity-70 border-accent/50"
                  )}
                >
                  {card.flipped || card.matched ? card.emoji : "?"}
                </button>
              ))}
            </div>
          </div>
        )}

        {(bothDone || isCompleted) && (
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

export default OnlineMemoryMatch;
