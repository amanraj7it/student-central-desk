import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { useEffect } from "react";
import { toast } from "sonner";

export interface GameChallenge {
  id: string;
  challenger_id: string;
  challenged_id: string;
  game_type: string;
  status: string;
  winner_id: string | null;
  game_data: any;
  created_at: string;
  updated_at: string;
}

export function useGameChallenges() {
  const { user } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("game-challenges-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "game_challenges" }, () => {
        qc.invalidateQueries({ queryKey: ["game-challenges"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, qc]);

  return useQuery({
    queryKey: ["game-challenges"],
    enabled: !!user,
    queryFn: async (): Promise<GameChallenge[]> => {
      const { data, error } = await supabase
        .from("game_challenges")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as GameChallenge[];
    },
  });
}

export function useCreateChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ challengedId, gameType }: { challengedId: string; gameType: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("game_challenges")
        .insert({
          challenger_id: user.id,
          challenged_id: challengedId,
          game_type: gameType,
          status: "pending",
          game_data: gameType === "tictactoe"
            ? { board: Array(9).fill(null), isXTurn: true, xPlayer: user.id, oPlayer: challengedId }
            : {},
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["game-challenges"] });
      toast.success("Challenge sent! 🎮");
    },
    onError: (e) => toast.error("Failed to send challenge: " + e.message),
  });
}

export function useRespondChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, accept }: { id: string; accept: boolean }) => {
      const { error } = await supabase
        .from("game_challenges")
        .update({ status: accept ? "active" : "declined", updated_at: new Date().toISOString() } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["game-challenges"] });
      toast.success(vars.accept ? "Challenge accepted! Let's play! 🎮" : "Challenge declined");
    },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function useUpdateGameState() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, gameData, status, winnerId }: {
      id: string;
      gameData: any;
      status?: string;
      winnerId?: string | null;
    }) => {
      const update: any = { game_data: gameData, updated_at: new Date().toISOString() };
      if (status) update.status = status;
      if (winnerId !== undefined) update.winner_id = winnerId;
      const { error } = await supabase
        .from("game_challenges")
        .update(update)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["game-challenges"] }),
  });
}

export function useGameChallenge(id: string | null) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`game-challenge-${id}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "game_challenges",
        filter: `id=eq.${id}`,
      }, () => {
        qc.invalidateQueries({ queryKey: ["game-challenge", id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, qc]);

  return useQuery({
    queryKey: ["game-challenge", id],
    enabled: !!id,
    refetchInterval: 3000, // fallback polling
    queryFn: async (): Promise<GameChallenge | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("game_challenges")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as GameChallenge;
    },
  });
}
