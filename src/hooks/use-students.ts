import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Student {
  id: string;
  name: string;
  register_number: string;
  email: string | null;
  grade: string | null;
  section: string | null;
  phone: string | null;
  avatar: string | null;
  profile_picture_url: string | null;
  date_of_birth: string | null;
  blood_group: string | null;
  address: string | null;
  parent_name: string | null;
  user_id: string | null;
  parent_phone: string | null;
  specialization: string | null;
  hobby: string | null;
  photos?: string[];
}

const AVATARS = ["🧑‍🎓", "👩‍🎓", "👨‍🎓", "🎓", "📚", "✏️", "🎒", "🌟"];
const getRandomAvatar = () => AVATARS[Math.floor(Math.random() * AVATARS.length)];

async function fetchStudents(): Promise<Student[]> {
  const { data: students, error } = await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;

  // Fetch photos for all students
  const { data: photos } = await supabase
    .from("student_photos")
    .select("student_id, photo_url");

  const photoMap: Record<string, string[]> = {};
  photos?.forEach((p) => {
    if (!photoMap[p.student_id]) photoMap[p.student_id] = [];
    photoMap[p.student_id].push(p.photo_url);
  });

  return (students || []).map((s) => ({
    ...s,
    photos: photoMap[s.id] || [],
  }));
}

export function useStudents() {
  return useQuery({
    queryKey: ["students"],
    queryFn: fetchStudents,
  });
}

export function useAddStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      register_number: string;
      email?: string;
      grade?: string;
      section?: string;
      phone?: string;
      date_of_birth?: string;
      blood_group?: string;
      address?: string;
      parent_name?: string;
      parent_phone?: string;
      specialization?: string;
      hobby?: string;
      profile_picture_file?: File;
      user_id?: string;
    }) => {
      let profile_picture_url: string | null = null;

      if (data.profile_picture_file) {
        const file = data.profile_picture_file;
        const ext = file.name.split(".").pop();
        const path = `profiles/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("student-photos")
          .upload(path, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("student-photos")
          .getPublicUrl(path);
        profile_picture_url = urlData.publicUrl;
      }

      const { profile_picture_file, ...rest } = data;
      const { error } = await supabase.from("students").insert({
        ...rest,
        profile_picture_url,
        avatar: getRandomAvatar(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student added!");
    },
    onError: (e) => toast.error("Failed to add student: " + e.message),
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student deleted");
    },
    onError: (e) => toast.error("Failed to delete: " + e.message),
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Student> & { id: string }) => {
      const { error } = await supabase.from("students").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
    onError: (e) => toast.error("Failed to update: " + e.message),
  });
}

export function useUpdateProfilePicture() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, file }: { studentId: string; file: File }) => {
      const ext = file.name.split(".").pop();
      const path = `profiles/${studentId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("student-photos")
        .upload(path, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage
        .from("student-photos")
        .getPublicUrl(path);
      const { error } = await supabase
        .from("students")
        .update({ profile_picture_url: urlData.publicUrl })
        .eq("id", studentId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      toast.success("Profile photo updated!");
    },
    onError: (e) => toast.error("Failed to update photo: " + e.message),
  });
}

export function useAddStudentPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, file }: { studentId: string; file: File }) => {
      const ext = file.name.split(".").pop();
      const path = `gallery/${studentId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("student-photos")
        .upload(path, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("student-photos")
        .getPublicUrl(path);

      const { error } = await supabase.from("student_photos").insert({
        student_id: studentId,
        photo_url: urlData.publicUrl,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      toast.success("Photo added!");
    },
    onError: (e) => toast.error("Failed to add photo: " + e.message),
  });
}

export function useDeleteStudentPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ photoUrl }: { photoUrl: string }) => {
      const { error } = await supabase
        .from("student_photos")
        .delete()
        .eq("photo_url", photoUrl);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      toast.success("Photo deleted!");
    },
    onError: (e) => toast.error("Failed to delete photo: " + e.message),
  });
}
