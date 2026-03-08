import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Album {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  created_by: string;
  created_at: string;
  photo_count?: number;
}

export interface AlbumPhoto {
  id: string;
  album_id: string;
  photo_url: string;
  caption: string | null;
  uploaded_by: string;
  created_at: string;
}

export function useAlbums() {
  return useQuery({
    queryKey: ["albums"],
    queryFn: async (): Promise<Album[]> => {
      const { data, error } = await supabase
        .from("photo_albums")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const { data: photos } = await supabase
        .from("album_photos")
        .select("album_id");

      const countMap: Record<string, number> = {};
      photos?.forEach((p) => {
        countMap[p.album_id] = (countMap[p.album_id] || 0) + 1;
      });

      return (data || []).map((a) => ({ ...a, photo_count: countMap[a.id] || 0 }));
    },
  });
}

export function useAlbumPhotos(albumId: string) {
  return useQuery({
    queryKey: ["album-photos", albumId],
    queryFn: async (): Promise<AlbumPhoto[]> => {
      const { data, error } = await supabase
        .from("album_photos")
        .select("*")
        .eq("album_id", albumId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!albumId,
  });
}

export function useCreateAlbum() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ title, description, userId }: { title: string; description?: string; userId: string }) => {
      const { error } = await supabase.from("photo_albums").insert({
        title,
        description: description || null,
        created_by: userId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["albums"] });
      toast.success("Album created!");
    },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function useAddAlbumPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ albumId, file, userId }: { albumId: string; file: File; userId: string }) => {
      const ext = file.name.split(".").pop();
      const path = `albums/${albumId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("student-photos").upload(path, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("student-photos").getPublicUrl(path);
      const { error } = await supabase.from("album_photos").insert({
        album_id: albumId,
        photo_url: urlData.publicUrl,
        uploaded_by: userId,
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["album-photos", vars.albumId] });
      qc.invalidateQueries({ queryKey: ["albums"] });
      toast.success("Photo added!");
    },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function useDeleteAlbum() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("photo_albums").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["albums"] });
      toast.success("Album deleted");
    },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}
