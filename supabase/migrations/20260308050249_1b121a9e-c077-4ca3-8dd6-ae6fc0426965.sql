
-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  register_number TEXT NOT NULL,
  email TEXT,
  grade TEXT,
  section TEXT,
  phone TEXT,
  avatar TEXT,
  profile_picture_url TEXT,
  date_of_birth DATE,
  blood_group TEXT,
  address TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for now (no auth required)
CREATE POLICY "Anyone can view students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Anyone can insert students" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update students" ON public.students FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete students" ON public.students FOR DELETE USING (true);

-- Create student_photos table
CREATE TABLE public.student_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.student_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view student photos" ON public.student_photos FOR SELECT USING (true);
CREATE POLICY "Anyone can insert student photos" ON public.student_photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete student photos" ON public.student_photos FOR DELETE USING (true);

-- Create storage bucket for student photos
INSERT INTO storage.buckets (id, name, public) VALUES ('student-photos', 'student-photos', true);

CREATE POLICY "Anyone can view student photos storage" ON storage.objects FOR SELECT USING (bucket_id = 'student-photos');
CREATE POLICY "Anyone can upload student photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'student-photos');
CREATE POLICY "Anyone can delete student photos" ON storage.objects FOR DELETE USING (bucket_id = 'student-photos');

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
