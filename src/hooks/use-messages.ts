import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface Message {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string | null;
  content: string;
  created_at: string;
}

export function useMessages() {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => {
          qc.invalidateQueries({ queryKey: ["messages"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return useQuery({
    queryKey: ["messages"],
    queryFn: async (): Promise<Message[]> => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useSendMessage() {
  return useMutation({
    mutationFn: async ({
      content,
      userId,
      userEmail,
      userName,
    }: {
      content: string;
      userId: string;
      userEmail: string;
      userName?: string;
    }) => {
      const { error } = await supabase.from("messages").insert({
        content,
        user_id: userId,
        user_email: userEmail,
        user_name: userName || null,
      });
      if (error) throw error;
    },
  });
}
