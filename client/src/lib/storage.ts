import { type UserStats, type Habit, type HabitLog, type JournalEntry, type FocusSession, type Achievement } from "@shared/schema";

const KEYS = {
  USER_STATS: "stoicforge_user_stats",
  HABITS: "stoicforge_habits",
  HABIT_LOGS: "stoicforge_habit_logs",
  JOURNAL_ENTRIES: "stoicforge_journal_entries",
  FOCUS_SESSIONS: "stoicforge_focus_sessions",
  ACHIEVEMENTS: "stoicforge_achievements",
  NOFAP: "stoicforge_nofap",
  RUNNING_FOCUS: "stoicforge_running_focus",
  DAILY_HISTORY: "stoicforge_daily_history",
};

const DEFAULT_NOFAP = {
  streak: 0,
  bestStreak: 0,
  lastCleanDay: null as string | null,
};

const DEFAULT_HABITS: Habit[] = [
  { id: 1, name: "Today's Workout", isCustom: false, goalValue: 1, unit: "session", xpReward: 20, isSpartan: false },
  { id: 2, name: "Go for a Walk", isCustom: false, goalValue: 1, unit: "session", xpReward: 10, isSpartan: false },
  { id: 3, name: "Study / Work", isCustom: false, goalValue: 1, unit: "h", xpReward: 25, isSpartan: false },
  { id: 4, name: "Book Reading", isCustom: false, goalValue: 5, unit: "pages", xpReward: 10, isSpartan: false },
  { id: 5, name: "Meditation", isCustom: false, goalValue: 1, unit: "session", xpReward: 15, isSpartan: false },
  { id: 6, name: "Drink Water", isCustom: false, goalValue: 4, unit: "L", xpReward: 10, isSpartan: false },
  { id: 11, name: "Cold Shower", isCustom: false, goalValue: 1, unit: "session", xpReward: 30, isSpartan: true, baseDependency: 1 },
  { id: 12, name: "4 Hour Deep Work", isCustom: false, goalValue: 1, unit: "session", xpReward: 50, isSpartan: true, baseDependency: 3 },
  { id: 13, name: "Digital Detox", isCustom: false, goalValue: 1, unit: "session", xpReward: 40, isSpartan: true, baseDependency: 3 },
  { id: 14, name: "Walk 5km", isCustom: false, goalValue: 1, unit: "session", xpReward: 20, isSpartan: true, baseDependency: 2 },
  { id: 15, name: "Extra Workout", isCustom: false, goalValue: 1, unit: "session", xpReward: 40, isSpartan: true, baseDependency: 1 },
];

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 1, name: "First Focus Session", description: "Complete your first focus session", isSecret: false, unlockedAt: null },
  { id: 2, name: "First Discipline Day", description: "Complete all daily disciplines", isSecret: false, unlockedAt: null },
  { id: 3, name: "7 Day Streak", description: "Maintain a 7 day habit streak", isSecret: false, unlockedAt: null },
  { id: 4, name: "5 Workouts Completed", description: "Complete 5 workouts", isSecret: false, unlockedAt: null },
  { id: 5, name: "Monk Mode", description: "30 days NoFap", isSecret: true, unlockedAt: null },
  { id: 6, name: "Beast Mode", description: "6 hours focus in one day", isSecret: true, unlockedAt: null },
  { id: 7, name: "Unbreakable", description: "50 day streak", isSecret: true, unlockedAt: null },
];

function get<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(key);
  if (!data) return defaultValue;
  try {
    return JSON.parse(data);
  } catch (e) {
    return defaultValue;
  }
}

function save<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export const storage = {
  getUserStats: () => get<UserStats>(KEYS.USER_STATS, { id: 1, totalXp: 0, level: 1, lastUpdated: new Date(), dob: null }),
  saveUserStats: (stats: UserStats) => save(KEYS.USER_STATS, stats),

  getHabits: () => get<Habit[]>(KEYS.HABITS, DEFAULT_HABITS),
  saveHabits: (habits: Habit[]) => save(KEYS.HABITS, habits),

  getHabitLogs: () => get<HabitLog[]>(KEYS.HABIT_LOGS, []),
  saveHabitLogs: (logs: HabitLog[]) => save(KEYS.HABIT_LOGS, logs),

  getJournalEntries: () => get<JournalEntry[]>(KEYS.JOURNAL_ENTRIES, []),
  saveJournalEntries: (entries: JournalEntry[]) => save(KEYS.JOURNAL_ENTRIES, entries),

  getFocusSessions: () => get<FocusSession[]>(KEYS.FOCUS_SESSIONS, []),
  saveFocusSessions: (sessions: FocusSession[]) => save(KEYS.FOCUS_SESSIONS, sessions),

  getAchievements: () => get<Achievement[]>(KEYS.ACHIEVEMENTS, DEFAULT_ACHIEVEMENTS),
  saveAchievements: (achievements: Achievement[]) => save(KEYS.ACHIEVEMENTS, achievements),

  getNoFap: () => get<{ streak: number; bestStreak: number; lastCleanDay: string | null }>(KEYS.NOFAP, DEFAULT_NOFAP),
  saveNoFap: (data: { streak: number; bestStreak: number; lastCleanDay: string | null }) => save(KEYS.NOFAP, data),

  getRunningFocus: () => get<{ startTime: number } | null>(KEYS.RUNNING_FOCUS, null),
  saveRunningFocus: (data: { startTime: number } | null) => save(KEYS.RUNNING_FOCUS, data),

  getDailyHistory: () => get<any[]>(KEYS.DAILY_HISTORY, []),
  saveDailyHistory: (data: any[]) => save(KEYS.DAILY_HISTORY, data),
};
