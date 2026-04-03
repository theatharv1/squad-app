import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Pool } from "@/types";

export function usePools(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return useQuery<Pool[]>({
    queryKey: ["pools", params],
    queryFn: () => api(`/api/pools?${qs}`),
  });
}

export function usePool(id: string | undefined) {
  return useQuery<Pool>({
    queryKey: ["pool", id],
    queryFn: () => api(`/api/pools/${id}`),
    enabled: !!id,
  });
}

export function useCreatePool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api("/api/pools", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pools"] }); },
  });
}

export function useJoinPool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (poolId: string) => api(`/api/pools/${poolId}/join`, { method: "POST" }),
    onSuccess: (_d, poolId) => {
      qc.invalidateQueries({ queryKey: ["pool", poolId] });
      qc.invalidateQueries({ queryKey: ["pools"] });
    },
  });
}

export function useLeavePool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (poolId: string) => api(`/api/pools/${poolId}/leave`, { method: "DELETE" }),
    onSuccess: (_d, poolId) => {
      qc.invalidateQueries({ queryKey: ["pool", poolId] });
      qc.invalidateQueries({ queryKey: ["pools"] });
    },
  });
}

export function useUpdatePool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => api(`/api/pools/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["pool", vars.id] });
      qc.invalidateQueries({ queryKey: ["pools"] });
    },
  });
}

export function useDeletePool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/api/pools/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pools"] }); },
  });
}
