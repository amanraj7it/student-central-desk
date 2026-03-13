import { useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Grid3X3, RotateCcw, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCustomTheme } from "@/components/ThemePicker";
import { useAuth } from "@/hooks/use-auth";
import { useStudents } from "@/hooks/use-students";
import { useGameChallenge, useUpdateGameState } from "@/hooks/use-game-challenges";
import { cn } from "@/lib/utils";

type CellValue = "X" | "O" | null;

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function checkWinner(board: CellValue[]): { winner: CellValue; line: number[] | null } {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combo };
    }
  }
  return { winner: null, line: null };
}

const OnlineTicTacToe = () => {
  useCustomTheme();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: students = [] } = useStudents();
  const { data: challenge, isLoading } = useGameChallenge(id || null);
  const updateGame = useUpdateGameState();

  const getStudentName = (userId: string) =>
    students.find((s) => s.user_id === userId)?.name || "Unknown";

  const gameData = challenge?.game_data || { board: Array(9).fill(null), isXTurn: true, xPlayer: null, oPlayer: null };
  const board: CellValue[] = gameData.board || Array(9).fill(null);
  const isXTurn: boolean = gameData.isXTurn ?? true;
  const xPlayer: string = gameData.xPlayer || challenge?.challenger_id || "";
  const oPlayer: string = gameData.oPlayer || challenge?.challenged_id || "";

  const mySymbol: "X" | "O" | null = user?.id === xPlayer ? "X" : user?.id === oPlayer ? "O" : null;
  const isMyTurn = (isXTurn && mySymbol === "X") || (!isXTurn && mySymbol === "O");
  const { winner, line } = checkWinner(board);
  const isDraw = !winner && board.every((cell: CellValue) => cell !== null);
  const gameOver = !!winner || isDraw;
  const isCompleted = challenge?.status === "completed";

  const opponentId = user?.id === challenge?.challenger_id ? challenge?.challenged_id : challenge?.challenger_id;

  const handleClick = useCallback(
    (index: number) => {
      if (!challenge || !isMyTurn || board[index] || gameOver || isCompleted) return;
      const newBoard = [...board];
      newBoard[index] = mySymbol;
      const result = checkWinner(newBoard);
      const newIsDraw = !result.winner && newBoard.every((c: CellValue) => c !== null);

      const newGameData = { ...gameData, board: newBoard, isXTurn: !isXTurn };
      const status = result.winner || newIsDraw ? "completed" : "active";
      const winnerId = result.winner
        ? result.winner === "X" ? xPlayer : oPlayer
        : newIsDraw ? null : undefined;

      updateGame.mutate({
        id: challenge.id,
        gameData: newGameData,
        status,
        winnerId: winnerId === undefined ? undefined : winnerId,
      });
    },
    [challenge, isMyTurn, board, gameOver, isCompleted, mySymbol, gameData, isXTurn, xPlayer, oPlayer, updateGame]
  );

  const handleRematch = () => {
    if (!challenge) return;
    // Swap X and O for rematch
    updateGame.mutate({
      id: challenge.id,
      gameData: {
        board: Array(9).fill(null),
        isXTurn: true,
        xPlayer: oPlayer,
        oPlayer: xPlayer,
      },
      status: "active",
      winnerId: null,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading game...</p>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Game not found</p>
      </div>
    );
  }

  const winnerName = challenge.winner_id ? getStudentName(challenge.winner_id) : null;
  const isWinner = challenge.winner_id === user?.id;

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
            <h1 className="font-display text-3xl text-primary-foreground">Online Tic Tac Toe</h1>
          </div>
          <p className="text-primary-foreground/60 text-sm mt-1">
            vs {getStudentName(opponentId || "")}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Player indicators */}
        <div className="flex justify-center gap-6 mb-8">
          <div className={cn(
            "flex flex-col items-center rounded-xl px-6 py-3 border-2 transition-colors",
            isXTurn && !gameOver ? "border-accent bg-accent/10" : "border-border bg-card"
          )}>
            <span className="text-xs text-muted-foreground mb-1">
              {xPlayer === user?.id ? "You" : getStudentName(xPlayer)}
            </span>
            <span className="text-2xl font-bold text-foreground">X</span>
          </div>
          <div className="flex items-center">
            <Swords className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className={cn(
            "flex flex-col items-center rounded-xl px-6 py-3 border-2 transition-colors",
            !isXTurn && !gameOver ? "border-accent bg-accent/10" : "border-border bg-card"
          )}>
            <span className="text-xs text-muted-foreground mb-1">
              {oPlayer === user?.id ? "You" : getStudentName(oPlayer)}
            </span>
            <span className="text-2xl font-bold text-foreground">O</span>
          </div>
        </div>

        {/* Status */}
        <div className="text-center mb-6">
          {isCompleted && winner ? (
            <p className="font-display text-2xl text-foreground">
              {isWinner ? "🎉 You Win!" : `${winnerName} Wins!`}
            </p>
          ) : isCompleted && isDraw ? (
            <p className="font-display text-2xl text-muted-foreground">It's a Draw! 🤝</p>
          ) : winner ? (
            <p className="font-display text-2xl text-foreground">
              {winner === mySymbol ? "🎉 You Win!" : `${getStudentName(winner === "X" ? xPlayer : oPlayer)} Wins!`}
            </p>
          ) : isDraw ? (
            <p className="font-display text-2xl text-muted-foreground">It's a Draw! 🤝</p>
          ) : isMyTurn ? (
            <p className="text-lg text-accent font-medium">Your turn ({mySymbol})</p>
          ) : (
            <p className="text-lg text-muted-foreground">
              Waiting for {getStudentName(opponentId || "")}...
            </p>
          )}
        </div>

        {/* Board */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {board.map((cell: CellValue, i: number) => {
              const isWinCell = line?.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => handleClick(i)}
                  disabled={!isMyTurn || !!cell || gameOver}
                  className={cn(
                    "h-24 w-24 sm:h-28 sm:w-28 rounded-xl border-2 text-4xl sm:text-5xl font-bold transition-all duration-200",
                    !cell && isMyTurn && !gameOver && "hover:bg-accent/10 hover:border-accent cursor-pointer border-border bg-card",
                    !cell && (!isMyTurn || gameOver) && "border-border bg-card opacity-50",
                    cell && "border-border bg-card",
                    isWinCell && "border-accent bg-accent/15 scale-105",
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
        {(gameOver || isCompleted) && (
          <div className="flex justify-center">
            <Button onClick={handleRematch} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <RotateCcw className="h-4 w-4 mr-2" />
              Rematch
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlineTicTacToe;
