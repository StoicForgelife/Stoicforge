import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storage } from "@/lib/storage";
import { type UserStats, type Habit, type HabitLog, type JournalEntry, type FocusSession, type Achievement } from "@shared/schema";
import { format, isSameDay, desc, compareDesc } from "date-fns";

export function useUserStats() {
  return useQuery({
    queryKey: ["/api/user-stats"],
    queryFn: () => storage.getUserStats(),
  });
}

export function useUpdateUserStats() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<UserStats>) => {
      const stats = storage.getUserStats();
      const newStats = { ...stats, ...updates, lastUpdated: new Date() };
      storage.saveUserStats(newStats);
      return newStats;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-stats"] });
    },
  });
}

export function useHabits() {
  return useQuery({
    queryKey: ["/api/habits"],
    queryFn: () => storage.getHabits(),
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (habit: any) => {
      const habits = storage.getHabits();
      const newHabit = { ...habit, id: Math.max(0, ...habits.map(h => h.id)) + 1 };
      storage.saveHabits([...habits, newHabit]);
      return newHabit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const habits = storage.getHabits();
      storage.saveHabits(habits.filter(h => h.id !== id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
    },
  });
}

export function useHabitLogs(date?: string) {
  return useQuery({
    queryKey: ["/api/habit-logs", date],
    queryFn: () => {
      const logs = storage.getHabitLogs();
      if (date) return logs.filter(l => l.date === date);
      return logs;
    },
  });
}

export function useToggleHabitLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (log: any) => {
      const logs = storage.getHabitLogs();
      const existingIdx = logs.findIndex(l => l.habitId === log.habitId && l.date === log.date);
      let newLogs;
      if (existingIdx >= 0) {
        newLogs = [...logs];
        newLogs[existingIdx] = { ...newLogs[existingIdx], ...log };
      } else {
        newLogs = [...logs, { ...log, id: Math.max(0, ...logs.map(l => l.id)) + 1 }];
      }
      storage.saveHabitLogs(newLogs);
      return log;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/habit-logs", variables.date] });
      queryClient.invalidateQueries({ queryKey: ["/api/habits", variables.habitId, "streak"] });
    },
  });
}

export function useHabitStreak(habitId: number) {
  return useQuery({
    queryKey: ["/api/habits", habitId, "streak"],
    queryFn: () => {
      const logs = storage.getHabitLogs().filter(l => l.habitId === habitId).sort((a, b) => b.date.localeCompare(a.date));
      let streak = 0;
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      for (const log of logs) {
        if (log.completed) streak++;
        else if (log.date !== todayStr) break;
      }
      return { streak };
    },
    enabled: !!habitId,
  });
}

export function useJournalEntries() {
  return useQuery({
    queryKey: ["/api/journal-entries"],
    queryFn: () => storage.getJournalEntries().sort((a, b) => b.date.localeCompare(a.date)),
  });
}

export function useJournalEntry(date: string) {
  return useQuery({
    queryKey: ["/api/journal-entries", date],
    queryFn: () => storage.getJournalEntries().find(e => e.date === date) || null,
  });
}

export function useSaveJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entry: any) => {
      const entries = storage.getJournalEntries();
      const idx = entries.findIndex(e => e.date === entry.date);
      let newEntries;
      if (idx >= 0) {
        newEntries = [...entries];
        newEntries[idx] = { ...newEntries[idx], ...entry };
      } else {
        newEntries = [...entries, { ...entry, id: Math.max(0, ...entries.map(e => e.id)) + 1 }];
      }
      storage.saveJournalEntries(newEntries);
      return entry;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries", variables.date] });
    },
  });
}

export function useFocusSessions(date?: string) {
  return useQuery({
    queryKey: ["/api/focus-sessions", date],
    queryFn: () => {
      const sessions = storage.getFocusSessions();
      if (date) return sessions.filter(s => s.date === date);
      return sessions;
    },
  });
}

export function useCreateFocusSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (session: any) => {
      const sessions = storage.getFocusSessions();
      const newSession = { ...session, id: Math.max(0, ...sessions.map(s => s.id)) + 1 };
      storage.saveFocusSessions([...sessions, newSession]);
      return newSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/focus-sessions"] });
    },
  });
}

export function useAchievements() {
  return useQuery({
    queryKey: ["/api/achievements"],
    queryFn: () => storage.getAchievements(),
  });
}

export function useUnlockAchievement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const achs = storage.getAchievements();
      const idx = achs.findIndex(a => a.name === name);
      if (idx >= 0 && !achs[idx].unlockedAt) {
        const newAchs = [...achs];
        newAchs[idx] = { ...newAchs[idx], unlockedAt: new Date() };
        storage.saveAchievements(newAchs);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
    },
  });
}

export function useNoFap() {
  return useQuery({
    queryKey: ["nofap"],
    queryFn: () => storage.getNoFap(),
  });
}

export function useUpdateNoFap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { streak: number; bestStreak: number }) => {
      storage.saveNoFap(data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nofap"] });
    },
  });
}

export function useRunningFocus() {
  return useQuery({
    queryKey: ["running-focus"],
    queryFn: () => storage.getRunningFocus(),
  });
}

export function useSaveRunningFocus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { startTime: number } | null) => {
      storage.saveRunningFocus(data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["running-focus"] });
    },
  });
}
