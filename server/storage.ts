import { db } from "./db";
import {
  habits,
  habitLogs,
  journalEntries,
  focusSessions,
  userStats,
  achievements,
  type Habit,
  type InsertHabit,
  type HabitLog,
  type InsertHabitLog,
  type JournalEntry,
  type InsertJournalEntry,
  type FocusSession,
  type InsertFocusSession,
  type UserStats,
  type Achievement,
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  getHabits(): Promise<Habit[]>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  deleteHabit(id: number): Promise<void>;
  getHabitLogs(date?: string): Promise<HabitLog[]>;
  createOrUpdateHabitLog(log: InsertHabitLog): Promise<HabitLog>;
  getHabitStreak(habitId: number): Promise<number>;
  getJournalEntry(date: string): Promise<JournalEntry | undefined>;
  getJournalEntries(): Promise<JournalEntry[]>;
  createOrUpdateJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  getFocusSessions(date?: string): Promise<FocusSession[]>;
  createFocusSession(session: InsertFocusSession): Promise<FocusSession>;
  getUserStats(): Promise<UserStats>;
  updateUserXp(xpChange: number): Promise<UserStats>;
  getAchievements(): Promise<Achievement[]>;
  unlockAchievement(name: string): Promise<void>;
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
      .where(and(eq(habitLogs.habitId, log.habitId), eq(habitLogs.date, log.date)));

    if (existing.length > 0) {
      const [updated] = await db
        .update(habitLogs)
        .set({ completed: log.completed, currentValue: log.currentValue })
        .where(eq(habitLogs.id, existing[0].id))
        .returning();
      
      if (log.completed && !existing[0].completed) {
        const habit = (await db.select().from(habits).where(eq(habits.id, log.habitId)))[0];
        await this.updateUserXp(habit.xpReward);
      }
      return updated;
    } else {
      const [created] = await db.insert(habitLogs).values(log).returning();
      if (log.completed) {
        const habit = (await db.select().from(habits).where(eq(habits.id, log.habitId)))[0];
        await this.updateUserXp(habit.xpReward);
      }
      return created;
    }
  }

  async getHabitStreak(habitId: number): Promise<number> {
    const logs = await db.select().from(habitLogs).where(eq(habitLogs.habitId, habitId)).orderBy(desc(habitLogs.date));
    let streak = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    for (const log of logs) {
      if (log.completed) streak++;
      else if (log.date !== todayStr) break;
    }
    return streak;
  }

  async getJournalEntry(date: string): Promise<JournalEntry | undefined> {
    const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.date, date));
    return entry;
  }

  async getJournalEntries(): Promise<JournalEntry[]> {
    return await db.select().from(journalEntries).orderBy(desc(journalEntries.date));
  }

  async createOrUpdateJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const existing = await this.getJournalEntry(entry.date);
    if (existing) {
      const [updated] = await db.update(journalEntries).set({ content: entry.content }).where(eq(journalEntries.id, existing.id)).returning();
      return updated;
    } else {
      const [created] = await db.insert(journalEntries).values(entry).returning();
      return created;
    }
  }

  async getFocusSessions(date?: string): Promise<FocusSession[]> {
    if (date) return await db.select().from(focusSessions).where(eq(focusSessions.date, date));
    return await db.select().from(focusSessions);
  }

  async createFocusSession(session: InsertFocusSession): Promise<FocusSession> {
    const [created] = await db.insert(focusSessions).values(session).returning();
    await this.updateUserXp(session.xpEarned);
    return created;
  }

  async getUserStats(): Promise<UserStats> {
    let [stats] = await db.select().from(userStats);
    if (!stats) [stats] = await db.insert(userStats).values({ totalXp: 0, level: 1 }).returning();
    return stats;
  }

  async updateUserXp(xpChange: number): Promise<UserStats> {
    const stats = await this.getUserStats();
    const newXp = stats.totalXp + xpChange;
    const newLevel = Math.floor(newXp / 100) + 1;
    const [updated] = await db.update(userStats).set({ totalXp: newXp, level: Math.min(newLevel, 50), lastUpdated: new Date() }).where(eq(userStats.id, stats.id)).returning();
    return updated;
  }

  async getAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements);
  }

  async unlockAchievement(name: string): Promise<void> {
    await db.update(achievements).set({ unlockedAt: new Date() }).where(and(eq(achievements.name, name), eq(achievements.unlockedAt, null)));
  }
}

export const storage = new DatabaseStorage();
