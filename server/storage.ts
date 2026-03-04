import { db } from "./db";
import {
  habits,
  habitLogs,
  journalEntries,
  distractionLogs,
  focusSessions,
  type Habit,
  type InsertHabit,
  type HabitLog,
  type InsertHabitLog,
  type JournalEntry,
  type InsertJournalEntry,
  type DistractionLog,
  type InsertDistractionLog,
  type FocusSession,
  type InsertFocusSession,
} from "@shared/schema";
import { eq, and, desc, lt } from "drizzle-orm";

export interface IStorage {
  // Habits
  getHabits(): Promise<Habit[]>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  deleteHabit(id: number): Promise<void>;

  // Habit Logs
  getHabitLogs(date?: string): Promise<HabitLog[]>;
  createOrUpdateHabitLog(log: InsertHabitLog): Promise<HabitLog>;
  getHabitStreak(habitId: number): Promise<number>;

  // Journal Entries
  getJournalEntry(date: string): Promise<JournalEntry | undefined>;
  createOrUpdateJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;

  // Distraction Logs
  getDistractionLog(date: string): Promise<DistractionLog | undefined>;
  createOrUpdateDistractionLog(log: InsertDistractionLog): Promise<DistractionLog>;

  // Focus Sessions
  getFocusSessions(date?: string): Promise<FocusSession[]>;
  createFocusSession(session: InsertFocusSession): Promise<FocusSession>;
}

export class DatabaseStorage implements IStorage {
  async getHabits(): Promise<Habit[]> {
    return await db.select().from(habits);
  }

  async createHabit(habit: InsertHabit): Promise<Habit> {
    const [created] = await db.insert(habits).values(habit).returning();
    return created;
  }

  async deleteHabit(id: number): Promise<void> {
    await db.delete(habits).where(eq(habits.id, id));
  }

  async getHabitLogs(date?: string): Promise<HabitLog[]> {
    if (date) {
      return await db.select().from(habitLogs).where(eq(habitLogs.date, date));
    }
    return await db.select().from(habitLogs);
  }

  async createOrUpdateHabitLog(log: InsertHabitLog): Promise<HabitLog> {
    const existing = await db
      .select()
      .from(habitLogs)
      .where(
        and(
          eq(habitLogs.habitId, log.habitId),
          eq(habitLogs.date, log.date)
        )
      );

    if (existing.length > 0) {
      const [updated] = await db
        .update(habitLogs)
        .set({ 
          completed: log.completed,
          currentValue: log.currentValue
        })
        .where(eq(habitLogs.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(habitLogs).values(log).returning();
      return created;
    }
  }

  async getHabitStreak(habitId: number): Promise<number> {
    const logs = await db
      .select()
      .from(habitLogs)
      .where(eq(habitLogs.habitId, habitId))
      .orderBy(desc(habitLogs.date));
    
    let streak = 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    
    for (const log of logs) {
      const logDate = new Date(log.date);
      logDate.setHours(0,0,0,0);
      
      // Calculate diff in days
      const diffTime = Math.abs(today.getTime() - logDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (log.completed) {
        streak++;
      } else if (diffDays > 1) {
        // If not completed and it's not today, streak breaks
        break;
      } else if (diffDays === 1 && !log.completed) {
        // If yesterday was not completed, streak breaks
        break;
      }
    }
    return streak;
  }

  async getJournalEntry(date: string): Promise<JournalEntry | undefined> {
    const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.date, date));
    return entry;
  }

  async createOrUpdateJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const existing = await this.getJournalEntry(entry.date);

    if (existing) {
      const [updated] = await db
        .update(journalEntries)
        .set({ content: entry.content })
        .where(eq(journalEntries.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(journalEntries).values(entry).returning();
      return created;
    }
  }

  async getDistractionLog(date: string): Promise<DistractionLog | undefined> {
    const [log] = await db.select().from(distractionLogs).where(eq(distractionLogs.date, date));
    return log;
  }

  async createOrUpdateDistractionLog(log: InsertDistractionLog): Promise<DistractionLog> {
    const existing = await this.getDistractionLog(log.date);

    if (existing) {
      const [updated] = await db
        .update(distractionLogs)
        .set({
          instagramMinutes: log.instagramMinutes,
          youtubeMinutes: log.youtubeMinutes,
          gamingMinutes: log.gamingMinutes,
          otherMinutes: log.otherMinutes,
        })
        .where(eq(distractionLogs.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(distractionLogs).values(log).returning();
      return created;
    }
  }

  async getFocusSessions(date?: string): Promise<FocusSession[]> {
    if (date) {
      return await db.select().from(focusSessions).where(eq(focusSessions.date, date));
    }
    return await db.select().from(focusSessions);
  }

  async createFocusSession(session: InsertFocusSession): Promise<FocusSession> {
    const [created] = await db.insert(focusSessions).values(session).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
