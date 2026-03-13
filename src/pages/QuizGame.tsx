import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Brain, CheckCircle2, XCircle, Trophy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCustomTheme } from "@/components/ThemePicker";
import { cn } from "@/lib/utils";

interface Question {
  question: string;
  options: string[];
  correct: number;
  category: string;
}

const allQuestions: Question[] = [
  { question: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], correct: 2, category: "Geography" },
  { question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correct: 1, category: "Science" },
  { question: "What is 12 × 12?", options: ["124", "144", "134", "154"], correct: 1, category: "Math" },
  { question: "Who painted the Mona Lisa?", options: ["Van Gogh", "Picasso", "Da Vinci", "Rembrandt"], correct: 2, category: "Art" },
  { question: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3, category: "Geography" },
  { question: "What gas do plants absorb from the atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correct: 2, category: "Science" },
  { question: "How many continents are there?", options: ["5", "6", "7", "8"], correct: 2, category: "Geography" },
  { question: "What is the square root of 64?", options: ["6", "7", "8", "9"], correct: 2, category: "Math" },
  { question: "Which element has the chemical symbol 'O'?", options: ["Gold", "Osmium", "Oxygen", "Oganesson"], correct: 2, category: "Science" },
  { question: "In which year did World War II end?", options: ["1943", "1944", "1945", "1946"], correct: 2, category: "History" },
  { question: "What is the hardest natural substance?", options: ["Gold", "Iron", "Diamond", "Platinum"], correct: 2, category: "Science" },
  { question: "Which country has the most population?", options: ["USA", "India", "China", "Indonesia"], correct: 1, category: "Geography" },
  { question: "What is 15% of 200?", options: ["25", "30", "35", "40"], correct: 1, category: "Math" },
  { question: "Who wrote 'Romeo and Juliet'?", options: ["Dickens", "Shakespeare", "Austen", "Twain"], correct: 1, category: "Literature" },
  { question: "What is the boiling point of water in °C?", options: ["90", "95", "100", "110"], correct: 2, category: "Science" },
];

const QUIZ_SIZE = 10;

function shuffleAndPick(arr: Question[], count: number): Question[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const QuizGame = () => {
  useCustomTheme();
  const [questions, setQuestions] = useState(() => shuffleAndPick(allQuestions, QUIZ_SIZE));
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResult, setShowResult] = useState(false);

  const score = useMemo(
    () => answers.filter((a, i) => a === questions[i]?.correct).length,
    [answers, questions]
  );

  const handleSelect = (optionIndex: number) => {
    if (selected !== null) return;
    setSelected(optionIndex);
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent(current + 1);
        setSelected(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  const restart = () => {
    setQuestions(shuffleAndPick(allQuestions, QUIZ_SIZE));
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setShowResult(false);
  };

  const q = questions[current];
  const progress = ((current + (selected !== null ? 1 : 0)) / questions.length) * 100;

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
            <Brain className="h-7 w-7 text-accent" />
            <h1 className="font-display text-3xl text-primary-foreground">Quiz Challenge</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8">
        {showResult ? (
          <div className="text-center py-12">
            <Trophy className={cn("h-20 w-20 mx-auto mb-6", score >= 7 ? "text-yellow-500" : score >= 4 ? "text-accent" : "text-muted-foreground")} />
            <h2 className="font-display text-4xl text-foreground mb-2">
              {score >= 8 ? "Amazing! 🎉" : score >= 5 ? "Good Job! 👏" : "Keep Trying! 💪"}
            </h2>
            <p className="text-xl text-muted-foreground mb-2">
              You scored <span className="text-foreground font-bold">{score}</span> out of <span className="text-foreground font-bold">{questions.length}</span>
            </p>
            <p className="text-muted-foreground mb-8">
              {Math.round((score / questions.length) * 100)}% correct
            </p>

            <div className="space-y-3 text-left max-w-lg mx-auto mb-8">
              {questions.map((q, i) => (
                <div key={i} className={cn("flex items-start gap-3 rounded-lg px-4 py-3 border", answers[i] === q.correct ? "bg-green-500/10 border-green-500/30" : "bg-destructive/10 border-destructive/30")}>
                  {answers[i] === q.correct ? <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> : <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />}
                  <div>
                    <p className="text-sm text-foreground font-medium">{q.question}</p>
                    <p className="text-xs text-muted-foreground">
                      Your answer: {q.options[answers[i]!]} {answers[i] !== q.correct && `• Correct: ${q.options[q.correct]}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={restart} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <RotateCcw className="h-4 w-4 mr-2" />
              Play Again
            </Button>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Question {current + 1} of {questions.length}</span>
                <span className="bg-secondary px-2 py-0.5 rounded text-xs">{q.category}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Question */}
            <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
              <h2 className="font-display text-2xl text-foreground mb-8 text-center">{q.question}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {q.options.map((opt, i) => {
                  const isSelected = selected === i;
                  const isCorrect = i === q.correct;
                  const showFeedback = selected !== null;

                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(i)}
                      disabled={selected !== null}
                      className={cn(
                        "text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 font-medium text-sm",
                        !showFeedback && "border-border bg-background hover:border-accent hover:bg-accent/5 cursor-pointer",
                        showFeedback && isCorrect && "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400",
                        showFeedback && isSelected && !isCorrect && "border-destructive bg-destructive/10 text-destructive",
                        showFeedback && !isSelected && !isCorrect && "border-border bg-background opacity-50"
                      )}
                    >
                      <span className="inline-flex items-center gap-3">
                        <span className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0",
                          !showFeedback && "bg-secondary text-foreground",
                          showFeedback && isCorrect && "bg-green-500 text-white",
                          showFeedback && isSelected && !isCorrect && "bg-destructive text-white",
                          showFeedback && !isSelected && !isCorrect && "bg-secondary text-muted-foreground"
                        )}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Score tracker */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Score: {answers.filter((a, i) => a === questions[i]?.correct).length} / {answers.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizGame;
