import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useAuth } from "./use-auth";

export interface Conversation {
  id: string;
  type: "direct" | "group";
  name: string | null;
  created_by: string;
  created_at: string;
  members: ConversationMember[];
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
}

export interface ConversationMember {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
}

export function useConversations() {
  const { user } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("conversations-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversation_members" }, () => {
        qc.invalidateQueries({ queryKey: ["conversations"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "direct_messages" }, () => {
        qc.invalidateQueries({ queryKey: ["conversations"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc, user]);

  return useQuery({
    queryKey: ["conversations"],
    enabled: !!user,
    queryFn: async (): Promise<Conversation[]> => {
      // Get conversations the user is a member of
      const { data: memberRows, error: mErr } = await supabase
        .from("conversation_members")
        .select("conversation_id")
        .eq("user_id", user!.id);
      if (mErr) throw mErr;
      if (!memberRows?.length) return [];

      const convIds = memberRows.map((m) => m.conversation_id);

      const { data: convs, error: cErr } = await supabase
        .from("conversations")
        .select("*")
        .in("id", convIds)
        .order("created_at", { ascending: false });
      if (cErr) throw cErr;

      // Get all members for these conversations
      const { data: allMembers } = await supabase
        .from("conversation_members")
        .select("*")
        .in("conversation_id", convIds);

      // Get last message for each conversation
      const conversations: Conversation[] = [];
      for (const conv of convs || []) {
        const { data: lastMsg } = await supabase
          .from("direct_messages")
          .select("content, created_at, sender_id")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1);

        conversations.push({
          ...conv,
          type: conv.type as "direct" | "group",
          members: (allMembers || []).filter((m) => m.conversation_id === conv.id),
          last_message: lastMsg?.[0] || undefined,
        });
      }

      // Sort by last message time
      conversations.sort((a, b) => {
        const aTime = a.last_message?.created_at || a.created_at;
        const bTime = b.last_message?.created_at || b.created_at;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      return conversations;
    },
  });
}

export function useCreateConversation() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ type, name, memberIds }: { type: "direct" | "group"; name?: string; memberIds: string[] }) => {
      if (!user) throw new Error("Not authenticated");

      // For direct conversations, check if one already exists
      if (type === "direct" && memberIds.length === 1) {
        const otherId = memberIds[0];
        const { data: myConvs } = await supabase
          .from("conversation_members")
          .select("conversation_id")
          .eq("user_id", user.id);

        if (myConvs?.length) {
          const { data: otherConvs } = await supabase
            .from("conversation_members")
            .select("conversation_id")
            .eq("user_id", otherId)
            .in("conversation_id", myConvs.map((c) => c.conversation_id));

          if (otherConvs?.length) {
            // Check if any of these are direct conversations
            for (const oc of otherConvs) {
              const { data: conv } = await supabase
                .from("conversations")
                .select("*")
                .eq("id", oc.conversation_id)
                .eq("type", "direct")
                .single();
              if (conv) return conv.id;
            }
          }
        }
      }

      // Create new conversation
      const { data: conv, error: convErr } = await supabase
        .from("conversations")
        .insert({ type, name: name || null, created_by: user.id })
        .select()
        .single();
      if (convErr) throw convErr;

      // Add creator as member
      const allMembers = [user.id, ...memberIds.filter((id) => id !== user.id)];
      const { error: memErr } = await supabase
        .from("conversation_members")
        .insert(allMembers.map((uid) => ({ conversation_id: conv.id, user_id: uid })));
      if (memErr) throw memErr;

      return conv.id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
  });
}

export function useDirectMessages(conversationId: string | null) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`dm-${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "direct_messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, () => {
        qc.invalidateQueries({ queryKey: ["direct_messages", conversationId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, qc]);

  return useQuery({
    queryKey: ["direct_messages", conversationId],
    enabled: !!conversationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("direct_messages")
        .select("*")
        .eq("conversation_id", conversationId!)
        .order("created_at", { ascending: true })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useSendDirectMessage() {
  return useMutation({
    mutationFn: async ({ conversationId, senderId, content }: { conversationId: string; senderId: string; content: string }) => {
      const { error } = await supabase.from("direct_messages").insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
      });
      if (error) throw error;
    },
  });
}
