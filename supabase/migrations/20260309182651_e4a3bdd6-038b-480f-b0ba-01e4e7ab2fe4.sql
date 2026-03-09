
-- Fix overly permissive insert policy on conversation_members
DROP POLICY "Conversation creator can add members" ON public.conversation_members;

CREATE POLICY "Authenticated can add members to own conversations" ON public.conversation_members
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id AND created_by = auth.uid()
    )
    OR auth.uid() = user_id
  );
