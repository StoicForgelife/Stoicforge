import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertDistractionLog } from "@shared/routes";

export function useDistractionLog(date: string) {
  return useQuery({
    queryKey: [api.distractionLogs.get.path, date],
    queryFn: async () => {
      const url = buildUrl(api.distractionLogs.get.path, { date });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch distraction log");
      return api.distractionLogs.get.responses[200].parse(await res.json());
    },
    enabled: !!date,
  });
}

export function useSaveDistractionLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertDistractionLog) => {
      const res = await fetch(api.distractionLogs.createOrUpdate.path, {
        method: api.distractionLogs.createOrUpdate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to save distraction log");
      return api.distractionLogs.createOrUpdate.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.distractionLogs.get.path, variables.date] });
    },
  });
}
