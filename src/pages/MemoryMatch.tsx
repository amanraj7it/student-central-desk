import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Layers, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCustomTheme } from "@/components/ThemePicker";
import { cn } from "@/lib/utils";

const EMOJIS = ["🐶", "🐱", "🐸", "🦊", "🐻", "🐼", "🐨", "🦁"];

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

function createDeck(): Card[] {
  const pairs = [...EMOJIS, ...EMOJIS];
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs.map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
}

const MemoryMatch = () => {
  useCustomTheme();
  const [cards, setCards] = useState<Card[]>(createDeck);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(() => {
    const saved = localStorage.getItem("memory-best");
    return saved ? parseInt(saved) : null;
  });
  const [locked, setLocked] = useState(false);

  const matchedCount = cards.filter((c) => c.matched).length;
  const gameWon = matchedCount === cards.length;

  useEffect(() => {
    if (gameWon && (bestScore === null || moves < bestScore)) {
      setBestScore(moves);
      localStorage.setItem("memory-best", moves.toString());
    }
  }, [gameWon, moves, bestScore]);

  const handleFlip = useCallback((id: number) => {
    if (locked) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched) return;
    if (selected.length >= 2) return;

    const newCards = cards.map((c) => c.id === id ? { ...c, flipped: true } : c);
    setCards(newCards);
    const newSelected = [...selected, id];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newSelected;
      const c1 = newCards.find((c) => c.id === first)!;
      const c2 = newCards.find((c) => c.id === second)!;

      if (c1.emoji === c2.emoji) {
        setCards((prev) => prev.map((c) => c.id === first || c.id === second ? { ...c, matched: true } : c));
        setSelected([]);
      } else {
        setLocked(true);
        setTimeout(() => {
          setCards((prev) => prev.map((c) => c.id === first || c.id === second ? { ...c, flipped: false } : c));
          setSelected([]);
          setLocked(false);
        }, 800);
      }
    }
  }, [cards, selected, locked]);

  const restart = () => {
    setCards(createDeck());
    setSelected([]);
    setMoves(0);
    setLocked(false);
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
            <Layers className="h-7 w-7 text-accent" />
            <h1 className="font-display text-3xl text-primary-foreground">Memory Match</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Stats */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="flex flex-col items-center">
            <span className="text-sm text-muted-foreground">Moves</span>
            <span className="text-3xl font-display text-foreground">{moves}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm text-muted-foreground">Matched</span>
            <span className="text-3xl font-display text-accent">{matchedCount / 2}/{EMOJIS.length}</span>
          </div>
          {bestScore !== null && (
            <div className="flex flex-col items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-1"><Trophy className="h-3 w-3" /> Best</span>
              <span className="text-3xl font-display text-accent">{bestScore}</span>
            </div>
          )}
        </div>

        {gameWon && (
          <div className="text-center mb-6">
            <p className="font-display text-2xl text-accent">🎉 You Won in {moves} moves!</p>
          </div>
        )}

        {/* Grid */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-4 gap-3">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleFlip(card.id)}
                className={cn(
                  "h-20 w-20 sm:h-24 sm:w-24 rounded-xl border-2 text-3xl sm:text-4xl font-bold transition-all duration-300",
                  card.flipped || card.matched
                    ? "border-accent bg-accent/10 scale-100"
                    : "border-border bg-card hover:border-accent/50 hover:bg-accent/5 cursor-pointer",
                  card.matched && "opacity-70 border-accent/50"
                )}
              >
                {card.flipped || card.matched ? card.emoji : "?"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <Button onClick={restart} variant="outline" size="lg">
            <RotateCcw className="h-4 w-4 mr-2" />
            {gameWon ? "Play Again" : "Restart"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MemoryMatch;
