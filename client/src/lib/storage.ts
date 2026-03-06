import { type UserStats, type Habit, type HabitLog, type JournalEntry, type FocusSession, type Achievement } from "@shared/schema";

const KEYS = {
  USER_STATS: "stoicforge_user_stats",
  HABITS: "stoicforge_habits",
  HABIT_LOGS: "stoicforge_habit_logs",
  JOURNAL_ENTRIES: "stoicforge_journal_entries",
  FOCUS_SESSIONS: "stoicforge_focus_sessions",
  ACHIEVEMENTS: "stoicforge_achievements",
};

const DEFAULT_HABITS: Habit[] = [
  { id: 1, name: "Workout", isCustom: false, goalValue: 1, unit: "session", xpReward: 15, isSpartan: false },
  { id: 2, name: "Drink Water", isCustom: false, goalValue: 2000, unit: "ml", xpReward: 10, isSpartan: false },
  { id: 3, name: "Walk", isCustom: false, goalValue: 1, unit: "session", xpReward: 10, isSpartan: false },
  { id: 4, name: "Study / Work", isCustom: false, goalValue: 4, unit: "h", xpReward: 20, isSpartan: false },
  { id: 5, name: "Stretching", isCustom: false, goalValue: 1, unit: "session", xpReward: 10, isSpartan: false },
  { id: 6, name: "Reading", isCustom: false, goalValue: 1, unit: "session", xpReward: 10, isSpartan: false },
  { id: 7, name: "Meditation", isCustom: false, goalValue: 1, unit: "session", xpReward: 15, isSpartan: false },
  { id: 8, name: "10 Pushups", isCustom: false, goalValue: 1, unit: "set", xpReward: 5, isSpartan: false },
  { id: 9, name: "20 Squats", isCustom: false, goalValue: 1, unit: "set", xpReward: 5, isSpartan: false },
  { id: 10, name: "30 Second Plank", isCustom: false, goalValue: 1, unit: "set", xpReward: 5, isSpartan: false },
  { id: 11, name: "Cold Shower", isCustom: false, goalValue: 1, unit: "session", xpReward: 30, isSpartan: true },
  { id: 12, name: "2 Hour Deep Work", isCustom: false, goalValue: 1, unit: "session", xpReward: 50, isSpartan: true },
  { id: 13, name: "Digital Detox", isCustom: false, goalValue: 1, unit: "session", xpReward: 40, isSpartan: true },
  { id: 14, name: "Outdoor Walk", isCustom: false, goalValue: 1, unit: "session", xpReward: 20, isSpartan: true },
  { id: 15, name: "Extra Workout", isCustom: false, goalValue: 1, unit: "session", xpReward: 40, isSpartan: true },
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
};
