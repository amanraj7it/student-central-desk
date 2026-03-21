import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import Index from "./pages/Index";
import StudentProfile from "./pages/StudentProfile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Chat from "./pages/Chat";
import Conversations from "./pages/Conversations";
import DirectMessage from "./pages/DirectMessage";
import Albums from "./pages/Albums";
import MyProfile from "./pages/MyProfile";
import Games from "./pages/Games";
import QuizGame from "./pages/QuizGame";
import TicTacToe from "./pages/TicTacToe";
import OnlineTicTacToe from "./pages/OnlineTicTacToe";
import RockPaperScissors from "./pages/RockPaperScissors";
import MemoryMatch from "./pages/MemoryMatch";
import SnakeGame from "./pages/SnakeGame";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (session) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/student/:id" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Conversations /></ProtectedRoute>} />
              <Route path="/dm/:id" element={<ProtectedRoute><DirectMessage /></ProtectedRoute>} />
              <Route path="/albums" element={<ProtectedRoute><Albums /></ProtectedRoute>} />
              <Route path="/my-profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
              <Route path="/games" element={<ProtectedRoute><Games /></ProtectedRoute>} />
              <Route path="/games/quiz" element={<ProtectedRoute><QuizGame /></ProtectedRoute>} />
              <Route path="/games/tic-tac-toe" element={<ProtectedRoute><TicTacToe /></ProtectedRoute>} />
              <Route path="/games/tic-tac-toe/online/:id" element={<ProtectedRoute><OnlineTicTacToe /></ProtectedRoute>} />
              <Route path="/games/rock-paper-scissors" element={<ProtectedRoute><RockPaperScissors /></ProtectedRoute>} />
              <Route path="/games/memory-match" element={<ProtectedRoute><MemoryMatch /></ProtectedRoute>} />
              <Route path="/games/snake" element={<ProtectedRoute><SnakeGame /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
