import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  isCustom: boolean("is_custom").default(false).notNull(),
  goalValue: integer("goal_value"), // For measurable habits (e.g. 4 for 4h study)
  unit: text("unit"), // e.g., "h", "ml", "km"
});

export const habitLogs = pgTable("habit_logs", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  completed: boolean("completed").default(false).notNull(),
  currentValue: integer("current_value").default(0).notNull(), // Progress for measurable habits
});

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD
  content: text("content").notNull(),
});

export const distractionLogs = pgTable("distraction_logs", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD
  instagramMinutes: integer("instagram_minutes").default(0).notNull(),
  youtubeMinutes: integer("youtube_minutes").default(0).notNull(),
  gamingMinutes: integer("gaming_minutes").default(0).notNull(),
  otherMinutes: integer("other_minutes").default(0).notNull(),
});

export const focusSessions = pgTable("focus_sessions", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  startTime: text("start_time").notNull(),
});

// Base schemas
export const insertHabitSchema = createInsertSchema(habits).omit({ id: true });
export const insertHabitLogSchema = createInsertSchema(habitLogs).omit({ id: true });
export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({ id: true });
export const insertDistractionLogSchema = createInsertSchema(distractionLogs).omit({ id: true });
export const insertFocusSessionSchema = createInsertSchema(focusSessions).omit({ id: true });

// Types
export type Habit = typeof habits.$inferSelect;
export type InsertHabit = z.infer<typeof insertHabitSchema>;

export type HabitLog = typeof habitLogs.$inferSelect;
export type InsertHabitLog = z.infer<typeof insertHabitLogSchema>;

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;

export type DistractionLog = typeof distractionLogs.$inferSelect;
export type InsertDistractionLog = z.infer<typeof insertDistractionLogSchema>;

export type FocusSession = typeof focusSessions.$inferSelect;
export type InsertFocusSession = z.infer<typeof insertFocusSessionSchema>;

// API Contract Types
export type CreateHabitRequest = InsertHabit;
export type CreateHabitLogRequest = InsertHabitLog;
export type UpdateHabitLogRequest = Partial<InsertHabitLog>;
export type CreateJournalEntryRequest = InsertJournalEntry;
export type CreateDistractionLogRequest = InsertDistractionLog;
export type CreateFocusSessionRequest = InsertFocusSession;
