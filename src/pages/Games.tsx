import { Link } from "react-router-dom";
import { ArrowLeft, Gamepad2, Brain, Grid3X3 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCustomTheme } from "@/components/ThemePicker";

const games = [
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
];

const Games = () => {
  useCustomTheme();

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
        <div className="grid gap-6 sm:grid-cols-2">
          {games.map((game) => (
            <Link key={game.id} to={game.path} className="group">
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className={`h-32 bg-gradient-to-br ${game.color} flex items-center justify-center`}>
                  <game.icon className="h-16 w-16 text-white/90 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl text-foreground mb-1">{game.title}</h3>
                  <p className="text-muted-foreground text-sm">{game.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Games;
