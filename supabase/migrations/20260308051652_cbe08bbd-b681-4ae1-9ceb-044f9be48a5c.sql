
-- Allow students to insert their own record (user_id must match their auth id)
CREATE POLICY "Students can insert own profile" ON public.students
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
