import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { User } from "@/types";

export function useUser(id: string | undefined) {
  return useQuery<User>({
    queryKey: ["user", id],
    queryFn: () => api(`/api/users/${id}`),
    enabled: !!id,
  });
}

export function useSearchUsers(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return useQuery<User[]>({
    queryKey: ["users-search", params],
    queryFn: () => api(`/api/users/search?${qs}`),
    enabled: !!params.city || !!params.q,
  });
}

export function useFollowers(userId: string | undefined) {
  return useQuery<{ users: User[]; total: number }>({
    queryKey: ["followers", userId],
    queryFn: () => api(`/api/users/${userId}/followers`),
    enabled: !!userId,
  });
}

export function useFollowing(userId: string | undefined) {
  return useQuery<{ users: User[]; total: number }>({
    queryKey: ["following", userId],
    queryFn: () => api(`/api/users/${userId}/following`),
    enabled: !!userId,
  });
}

export function useFollow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api(`/api/users/${userId}/follow`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user"] });
      qc.invalidateQueries({ queryKey: ["followers"] });
      qc.invalidateQueries({ queryKey: ["following"] });
    },
  });
}

export function useUnfollow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api(`/api/users/${userId}/follow`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user"] });
      qc.invalidateQueries({ queryKey: ["followers"] });
      qc.invalidateQueries({ queryKey: ["following"] });
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<User>) => api("/api/users/me", { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["user"] }); },
  });
}

export function useLeaderboard(type: string) {
  return useQuery<any[]>({
    queryKey: ["leaderboard", type],
    queryFn: () => api(`/api/users/leaderboard?type=${type}`),
  });
}
