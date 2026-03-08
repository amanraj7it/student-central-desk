import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from "react";

export interface Poll {
  id: string;
  question: string;
  options: string[];
  created_by: string;
  created_at: string;
  is_closed: boolean;
}

export interface PollVote {
  id: string;
  poll_id: string;
  user_id: string;
  option_index: number;
  created_at: string;
}

export function usePolls() {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("polls-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "polls" }, () => {
        qc.invalidateQueries({ queryKey: ["polls"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "poll_votes" }, () => {
        qc.invalidateQueries({ queryKey: ["poll-votes"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);

  return useQuery({
    queryKey: ["polls"],
    queryFn: async (): Promise<Poll[]> => {
      const { data, error } = await supabase
        .from("polls")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((p: any) => ({ ...p, options: p.options as string[] }));
    },
  });
}

export function usePollVotes(pollId: string) {
  return useQuery({
    queryKey: ["poll-votes", pollId],
    queryFn: async (): Promise<PollVote[]> => {
      const { data, error } = await supabase
        .from("poll_votes")
        .select("*")
        .eq("poll_id", pollId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!pollId,
  });
}

export function useCreatePoll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ question, options, userId }: { question: string; options: string[]; userId: string }) => {
      const { error } = await supabase.from("polls").insert({
        question,
        options: options as any,
        created_by: userId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["polls"] });
      toast.success("Poll created!");
    },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function useVotePoll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ pollId, userId, optionIndex }: { pollId: string; userId: string; optionIndex: number }) => {
      // Upsert: delete existing vote then insert
      await supabase.from("poll_votes").delete().eq("poll_id", pollId).eq("user_id", userId);
      const { error } = await supabase.from("poll_votes").insert({
        poll_id: pollId,
        user_id: userId,
        option_index: optionIndex,
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["poll-votes", vars.pollId] });
    },
    onError: (e) => toast.error("Failed to vote: " + e.message),
  });
}

export function useClosePoll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pollId: string) => {
      const { error } = await supabase.from("polls").update({ is_closed: true }).eq("id", pollId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["polls"] });
      toast.success("Poll closed");
    },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}
