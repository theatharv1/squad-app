import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Conversation, Message } from "@/types";

export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: () => api("/api/messages/conversations"),
    refetchInterval: 10000,
  });
}

export function useMessages(conversationId: string | undefined) {
  return useQuery<Message[]>({
    queryKey: ["messages", conversationId],
    queryFn: () => api(`/api/messages/conversations/${conversationId}/messages`),
    enabled: !!conversationId,
    refetchInterval: 5000,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, text }: { conversationId: string; text: string }) =>
      api(`/api/messages/conversations/${conversationId}/messages`, {
        method: "POST",
        body: JSON.stringify({ text }),
      }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["messages", vars.conversationId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useCreateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api("/api/messages/conversations", {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["conversations"] }); },
  });
}
