import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertHabitLog } from "@shared/routes";

export function useHabitLogs(date?: string) {
  const url = date ? `${api.habitLogs.list.path}?date=${date}` : api.habitLogs.list.path;
  
  return useQuery({
    queryKey: [api.habitLogs.list.path, date],
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch habit logs");
      return api.habitLogs.list.responses[200].parse(await res.json());
    },
  });
}

export function useToggleHabitLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertHabitLog) => {
      const res = await fetch(api.habitLogs.createOrUpdate.path, {
        method: api.habitLogs.createOrUpdate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to toggle habit log");
      return api.habitLogs.createOrUpdate.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      // Invalidate specifically for the date we modified, and the general list
      queryClient.invalidateQueries({ queryKey: [api.habitLogs.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.habitLogs.list.path, variables.date] });
    },
  });
}
