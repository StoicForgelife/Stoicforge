import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  isCustom: boolean("is_custom").default(false).notNull(),
  goalValue: integer("goal_value"), 
  unit: text("unit"), 
  xpReward: integer("xp_reward").default(10).notNull(),
  isSpartan: boolean("is_spartan").default(false).notNull(),
});

export const habitLogs = pgTable("habit_logs", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull(),
  date: text("date").notNull(), 
  completed: boolean("completed").default(false).notNull(),
  currentValue: integer("current_value").default(0).notNull(),
});

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), 
  content: text("content").notNull(),
  timestamp: text("timestamp").notNull(), // Added for Time display
});

export const focusSessions = pgTable("focus_sessions", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  startTime: text("start_time").notNull(),
  xpEarned: integer("xp_earned").default(0).notNull(),
});

export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  totalXp: integer("total_xp").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
  dob: text("dob"), // Added for Memento Mori
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  isSecret: boolean("is_secret").default(false).notNull(),
  unlockedAt: timestamp("unlocked_at"),
});

// Base schemas
export const insertHabitSchema = createInsertSchema(habits).omit({ id: true });
export const insertHabitLogSchema = createInsertSchema(habitLogs).omit({ id: true });
export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({ id: true });
export const insertFocusSessionSchema = createInsertSchema(focusSessions).omit({ id: true });
export const insertUserStatsSchema = createInsertSchema(userStats).omit({ id: true, lastUpdated: true });
export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true, unlockedAt: true });

// Types
export type Habit = typeof habits.$inferSelect;
export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type HabitLog = typeof habitLogs.$inferSelect;
export type InsertHabitLog = z.infer<typeof insertHabitLogSchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type FocusSession = typeof focusSessions.$inferSelect;
export type InsertFocusSession = z.infer<typeof insertFocusSessionSchema>;
export type UserStats = typeof userStats.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
