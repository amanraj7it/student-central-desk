
-- Game challenges table
CREATE TABLE public.game_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id uuid NOT NULL,
  challenged_id uuid NOT NULL,
  game_type text NOT NULL DEFAULT 'tictactoe',
  status text NOT NULL DEFAULT 'pending',
  winner_id uuid,
  game_data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_challenges ENABLE ROW LEVEL SECURITY;

-- Policies: participants can view their challenges
CREATE POLICY "Users can view own challenges"
  ON public.game_challenges FOR SELECT TO authenticated
  USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

-- Authenticated users can create challenges
CREATE POLICY "Users can create challenges"
  ON public.game_challenges FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = challenger_id);

-- Participants can update challenge (accept/decline/game moves)
CREATE POLICY "Participants can update challenge"
  ON public.game_challenges FOR UPDATE TO authenticated
  USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

-- Challenger can delete pending challenges
CREATE POLICY "Challenger can delete challenge"
  ON public.game_challenges FOR DELETE TO authenticated
  USING (auth.uid() = challenger_id AND status = 'pending');

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_challenges;
