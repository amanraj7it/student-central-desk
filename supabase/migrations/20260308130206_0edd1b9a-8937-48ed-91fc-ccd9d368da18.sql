-- Polls table
CREATE TABLE public.polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]',
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_closed boolean NOT NULL DEFAULT false
);

ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view polls" ON public.polls FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create polls" ON public.polls FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creator can update poll" ON public.polls FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- Poll votes table
CREATE TABLE public.poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  option_index int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view votes" ON public.poll_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can vote" ON public.poll_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User can change vote" ON public.poll_votes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "User can delete vote" ON public.poll_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Announcements table
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_pinned boolean NOT NULL DEFAULT false
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view announcements" ON public.announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers can create announcements" ON public.announcements FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "Teachers can update announcements" ON public.announcements FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "Teachers can delete announcements" ON public.announcements FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'teacher'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.polls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;