import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Venue } from "@/types";

export function useVenues(city?: string) {
  return useQuery<Venue[]>({
    queryKey: ["venues", city],
    queryFn: () => api(`/api/venues${city ? `?city=${city}` : ""}`),
  });
}

export function useVenue(id: string | undefined) {
  return useQuery<Venue>({
    queryKey: ["venue", id],
    queryFn: () => api(`/api/venues/${id}`),
    enabled: !!id,
  });
}
