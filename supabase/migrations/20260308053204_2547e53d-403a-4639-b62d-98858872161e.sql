
CREATE TABLE public.class_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.class_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view class photos" ON public.class_photos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can insert class photos" ON public.class_photos
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Admin can update class photos" ON public.class_photos
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Admin can delete class photos" ON public.class_photos
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'teacher'));
