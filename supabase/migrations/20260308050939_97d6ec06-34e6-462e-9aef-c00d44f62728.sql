
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('teacher', 'student');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles: users can read their own roles, teachers can read all
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'teacher'));

-- Add user_id to students table to link student to their auth account
ALTER TABLE public.students ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Anyone can view students" ON public.students;
DROP POLICY IF EXISTS "Anyone can insert students" ON public.students;
DROP POLICY IF EXISTS "Anyone can update students" ON public.students;
DROP POLICY IF EXISTS "Anyone can delete students" ON public.students;

DROP POLICY IF EXISTS "Anyone can view student photos" ON public.student_photos;
DROP POLICY IF EXISTS "Anyone can insert student photos" ON public.student_photos;
DROP POLICY IF EXISTS "Anyone can delete student photos" ON public.student_photos;

-- New RLS for students: authenticated users can view all, teachers can do everything, students can only update their own
CREATE POLICY "Authenticated users can view students" ON public.students
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Teachers can insert students" ON public.students
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Teachers can update any student" ON public.students
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Students can update own profile" ON public.students
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Teachers can delete students" ON public.students
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'teacher'));

-- Student photos: authenticated can view, teachers and photo owner can insert/delete
CREATE POLICY "Authenticated can view student photos" ON public.student_photos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Teachers can insert student photos" ON public.student_photos
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Students can insert own photos" ON public.student_photos
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.students WHERE id = student_id AND user_id = auth.uid())
  );

CREATE POLICY "Teachers can delete student photos" ON public.student_photos
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Students can delete own photos" ON public.student_photos
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.students WHERE id = student_id AND user_id = auth.uid())
  );

-- Storage: require auth
DROP POLICY IF EXISTS "Anyone can view student photos storage" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload student photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete student photos" ON storage.objects;

CREATE POLICY "Authenticated can view student photos" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'student-photos');

CREATE POLICY "Authenticated can upload student photos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'student-photos');

CREATE POLICY "Authenticated can delete student photos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'student-photos');

-- Auto-assign 'student' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
