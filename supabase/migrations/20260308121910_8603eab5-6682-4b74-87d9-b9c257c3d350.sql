
CREATE TABLE public.photo_albums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.album_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID NOT NULL REFERENCES public.photo_albums(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.photo_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view albums" ON public.photo_albums FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create albums" ON public.photo_albums FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creator can update album" ON public.photo_albums FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Creator or teacher can delete album" ON public.photo_albums FOR DELETE TO authenticated USING (auth.uid() = created_by OR has_role(auth.uid(), 'teacher'));

CREATE POLICY "Authenticated can view album photos" ON public.album_photos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can add album photos" ON public.album_photos FOR INSERT TO authenticated WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Uploader can delete album photo" ON public.album_photos FOR DELETE TO authenticated USING (auth.uid() = uploaded_by);
CREATE POLICY "Teacher can delete album photos" ON public.album_photos FOR DELETE TO authenticated USING (has_role(auth.uid(), 'teacher'));
