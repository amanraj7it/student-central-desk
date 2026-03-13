import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Grid3X3, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCustomTheme } from "@/components/ThemePicker";
import { cn } from "@/lib/utils";

type CellValue = "X" | "O" | null;
type Board = CellValue[];

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function checkWinner(board: Board): { winner: CellValue; line: number[] | null } {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combo };
    }
  }
  return { winner: null, line: null };
}

const TicTacToe = () => {
  useCustomTheme();
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isXTurn, setIsXTurn] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });

  const { winner, line } = checkWinner(board);
  const isDraw = !winner && board.every((cell) => cell !== null);
  const gameOver = !!winner || isDraw;
  const currentPlayer = isXTurn ? "X" : "O";

  const handleClick = useCallback((index: number) => {
    if (board[index] || gameOver) return;
    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    setIsXTurn(!isXTurn);

    const result = checkWinner(newBoard);
    if (result.winner) {
      setScores((s) => ({ ...s, [result.winner!]: s[result.winner!] + 1 }));
    } else if (newBoard.every((c) => c !== null)) {
      setScores((s) => ({ ...s, draws: s.draws + 1 }));
    }
  }, [board, gameOver, currentPlayer, isXTurn]);

  const reset = () => {
    setBoard(Array(9).fill(null));
    setIsXTurn(true);
  };

  const resetAll = () => {
    reset();
    setScores({ X: 0, O: 0, draws: 0 });
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
            <Grid3X3 className="h-7 w-7 text-accent" />
            <h1 className="font-display text-3xl text-primary-foreground">Tic Tac Toe</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Scoreboard */}
        <div className="flex justify-center gap-4 mb-8">
          <div className={cn("flex flex-col items-center rounded-xl px-6 py-3 border-2 transition-colors", !gameOver && isXTurn ? "border-accent bg-accent/10" : "border-border bg-card")}>
            <span className="text-2xl font-bold text-foreground">X</span>
            <span className="text-3xl font-display text-foreground">{scores.X}</span>
          </div>
          <div className="flex flex-col items-center rounded-xl px-6 py-3 border-2 border-border bg-card">
            <span className="text-sm text-muted-foreground">Draw</span>
            <span className="text-3xl font-display text-muted-foreground">{scores.draws}</span>
          </div>
          <div className={cn("flex flex-col items-center rounded-xl px-6 py-3 border-2 transition-colors", !gameOver && !isXTurn ? "border-accent bg-accent/10" : "border-border bg-card")}>
            <span className="text-2xl font-bold text-foreground">O</span>
            <span className="text-3xl font-display text-foreground">{scores.O}</span>
          </div>
        </div>

        {/* Status */}
        <div className="text-center mb-6">
          {winner ? (
            <p className="font-display text-2xl text-foreground">
              🎉 <span className="text-accent">{winner}</span> Wins!
            </p>
          ) : isDraw ? (
            <p className="font-display text-2xl text-muted-foreground">It's a Draw! 🤝</p>
          ) : (
            <p className="text-lg text-muted-foreground">
              Player <span className="font-bold text-foreground">{currentPlayer}</span>'s turn
            </p>
          )}
        </div>

        {/* Board */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {board.map((cell, i) => {
              const isWinCell = line?.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => handleClick(i)}
                  disabled={!!cell || gameOver}
                  className={cn(
                    "h-24 w-24 sm:h-28 sm:w-28 rounded-xl border-2 text-4xl sm:text-5xl font-bold transition-all duration-200",
                    !cell && !gameOver && "hover:bg-accent/10 hover:border-accent cursor-pointer border-border bg-card",
                    cell && "border-border bg-card",
                    isWinCell && "border-accent bg-accent/15 scale-105",
                    !cell && gameOver && "border-border bg-card opacity-50",
                    cell === "X" && "text-accent",
                    cell === "O" && "text-foreground"
                  )}
                >
                  {cell}
                </button>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          <Button onClick={reset} variant="outline" size="lg">
            <RotateCcw className="h-4 w-4 mr-2" />
            {gameOver ? "Next Round" : "Restart"}
          </Button>
          <Button onClick={resetAll} variant="ghost" size="lg" className="text-muted-foreground">
            Reset Scores
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;
