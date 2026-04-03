import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Review } from "@/types";

export function useUserReviews(userId: string | undefined) {
  return useQuery<Review[]>({
    queryKey: ["reviews", userId],
    queryFn: () => api(`/api/reviews/user/${userId}`),
    enabled: !!userId,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { reviewedUserId: string; poolId?: string; rating: number; text?: string }) =>
      api("/api/reviews", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reviews"] }); },
  });
}
