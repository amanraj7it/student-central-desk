import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Gamepad2, Brain, Grid3X3, Swords, Check, X, Hand, Layers, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCustomTheme } from "@/components/ThemePicker";
import { useAuth } from "@/hooks/use-auth";
import { useStudents } from "@/hooks/use-students";
import { useGameChallenges, useCreateChallenge, useRespondChallenge } from "@/hooks/use-game-challenges";
import { cn } from "@/lib/utils";

const gamesList = [
  {
    id: "quiz",
    title: "Quiz Challenge",
    description: "Test your knowledge with fun trivia questions across multiple categories!",
    icon: Brain,
    color: "from-violet-500 to-purple-600",
    path: "/games/quiz",
  },
  {
    id: "tictactoe",
    title: "Tic Tac Toe",
    description: "Play the classic X & O game against a friend on the same device!",
    icon: Grid3X3,
    color: "from-emerald-500 to-teal-600",
    path: "/games/tic-tac-toe",
  },
  {
    id: "rps",
    title: "Rock Paper Scissors",
    description: "Test your luck against the computer in the classic RPS showdown!",
    icon: Hand,
    color: "from-orange-500 to-amber-600",
    path: "/games/rock-paper-scissors",
  },
  {
    id: "memory",
    title: "Memory Match",
    description: "Flip cards and find matching pairs — train your memory!",
    icon: Layers,
    color: "from-pink-500 to-rose-600",
    path: "/games/memory-match",
  },
  {
    id: "snake",
    title: "Snake",
    description: "Guide the snake, eat food, and grow as long as you can!",
    icon: Bug,
    color: "from-lime-500 to-green-600",
    path: "/games/snake",
  },
];

const Games = () => {
  useCustomTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: students = [] } = useStudents();
  const { data: challenges = [] } = useGameChallenges();
  const createChallenge = useCreateChallenge();
  const respondChallenge = useRespondChallenge();

  const [challengeDialog, setChallengeDialog] = useState<{ open: boolean; gameType: string }>({ open: false, gameType: "" });

  const pendingForMe = challenges.filter(
    (c) => c.challenged_id === user?.id && c.status === "pending"
  );
  const activeGames = challenges.filter(
    (c) => c.status === "active" && (c.challenger_id === user?.id || c.challenged_id === user?.id)
  );

  const friendsWithAccounts = students.filter((s) => s.user_id && s.user_id !== user?.id);

  const getStudentName = (userId: string) => {
    return students.find((s) => s.user_id === userId)?.name || "Unknown";
  };

  const handleChallenge = async (friendUserId: string) => {
    await createChallenge.mutateAsync({ challengedId: friendUserId, gameType: challengeDialog.gameType });
    setChallengeDialog({ open: false, gameType: "" });
  };

  const handleRespond = async (id: string, accept: boolean) => {
    await respondChallenge.mutateAsync({ id, accept });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-primary px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Dashboard</span>
            </Link>
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-3">
            <Gamepad2 className="h-8 w-8 text-accent" />
            <h1 className="font-display text-4xl text-primary-foreground">Games</h1>
          </div>
          <p className="text-primary-foreground/60 font-body text-lg mt-2">
            Take a break and have some fun with your classmates!
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Pending Challenges */}
        {pendingForMe.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
              <Swords className="h-5 w-5 text-accent" />
              Incoming Challenges
            </h2>
            <div className="space-y-3">
              {pendingForMe.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-xl border border-accent/30 bg-accent/5 p-4">
                  <div>
                    <p className="font-medium text-foreground">
                      {getStudentName(c.challenger_id)} challenged you to{" "}
                      <span className="text-accent font-bold">
                        {c.game_type === "tictactoe" ? "Tic Tac Toe" : "Quiz"}
                      </span>!
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(c.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleRespond(c.id, true)}
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      <Check className="h-4 w-4 mr-1" /> Accept
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleRespond(c.id, false)}>
                      <X className="h-4 w-4 mr-1" /> Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Games */}
        {activeGames.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
              <Gamepad2 className="h-5 w-5 text-accent" />
              Active Games
            </h2>
            <div className="space-y-3">
              {activeGames.map((c) => {
                const opponentId = c.challenger_id === user?.id ? c.challenged_id : c.challenger_id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      if (c.game_type === "tictactoe") navigate(`/games/tic-tac-toe/online/${c.id}`);
                    }}
                    className="flex items-center justify-between rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-accent transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {c.game_type === "tictactoe" ? "Tic Tac Toe" : "Quiz"} vs{" "}
                        <span className="text-accent">{getStudentName(opponentId)}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Tap to continue playing</p>
                    </div>
                    <Swords className="h-5 w-5 text-accent" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Game Cards */}
        <h2 className="font-display text-xl text-foreground mb-4">Play Games</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {gamesList.map((game) => (
            <div key={game.id} className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-card">
              <Link to={game.path} className="group block">
                <div className={`h-32 bg-gradient-to-br ${game.color} flex items-center justify-center`}>
                  <game.icon className="h-16 w-16 text-white/90 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-5 pb-3">
                  <h3 className="font-display text-xl text-foreground mb-1">{game.title}</h3>
                  <p className="text-muted-foreground text-sm">{game.description}</p>
                </div>
              </Link>
              {game.id === "tictactoe" && (
                <div className="px-5 pb-5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-accent/30 text-accent hover:bg-accent/10"
                    onClick={() => setChallengeDialog({ open: true, gameType: "tictactoe" })}
                  >
                    <Swords className="h-4 w-4 mr-2" />
                    Challenge a Friend
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Challenge Friend Dialog */}
      <Dialog open={challengeDialog.open} onOpenChange={(open) => setChallengeDialog({ open, gameType: open ? challengeDialog.gameType : "" })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Swords className="h-5 w-5 text-accent" />
              Challenge a Friend
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {friendsWithAccounts.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No friends with accounts available to challenge.
              </p>
            ) : (
              friendsWithAccounts.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => handleChallenge(friend.user_id!)}
                  disabled={createChallenge.isPending}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3",
                    "hover:border-accent hover:bg-accent/5 transition-colors text-left"
                  )}
                >
                  <span className="text-2xl">{friend.avatar || "🧑‍🎓"}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">{friend.name}</p>
                    <p className="text-xs text-muted-foreground">{friend.register_number}</p>
                  </div>
                  <Swords className="h-4 w-4 text-muted-foreground" />
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Games;
