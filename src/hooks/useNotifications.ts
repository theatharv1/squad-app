import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Notification } from "@/types";

export function useNotifications() {
  return useQuery<{ notifications: Notification[]; unreadCount: number }>({
    queryKey: ["notifications"],
    queryFn: () => api("/api/notifications"),
    refetchInterval: 15000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/api/notifications/${id}/read`, { method: "PUT" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api("/api/notifications/read-all", { method: "PUT" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); },
  });
}
