import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertJournalEntry } from "@shared/routes";

export function useJournalEntry(date: string) {
  return useQuery({
    queryKey: [api.journalEntries.get.path, date],
    queryFn: async () => {
      const url = buildUrl(api.journalEntries.get.path, { date });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch journal entry");
      return api.journalEntries.get.responses[200].parse(await res.json());
    },
    enabled: !!date,
  });
}

export function useSaveJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertJournalEntry) => {
      const res = await fetch(api.journalEntries.createOrUpdate.path, {
        method: api.journalEntries.createOrUpdate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to save journal entry");
      return api.journalEntries.createOrUpdate.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.journalEntries.get.path, variables.date] });
    },
  });
}
