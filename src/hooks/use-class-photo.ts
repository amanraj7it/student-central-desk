import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useClassPhoto() {
  return useQuery({
    queryKey: ["class-photo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("class_photos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data?.photo_url ?? null;
    },
  });
}

export function useUploadClassPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split(".").pop();
      const path = `class/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("student-photos")
        .upload(path, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("student-photos")
        .getPublicUrl(path);

      // Delete old class photos then insert new one
      await supabase.from("class_photos").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      const { error } = await supabase.from("class_photos").insert({
        photo_url: urlData.publicUrl,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["class-photo"] });
      toast.success("Class photo updated!");
    },
    onError: (e) => toast.error("Failed to upload: " + e.message),
  });
}
