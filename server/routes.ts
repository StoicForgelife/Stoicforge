import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  async function seedDatabase() {
    try {
      const existingHabits = await storage.getHabits();
      if (existingHabits.length === 0) {
        const defaultHabits = [
          { name: "Workout", isCustom: false, goalValue: 1, unit: "session", xpReward: 15, isSpartan: false },
          { name: "Drink Water", isCustom: false, goalValue: 2000, unit: "ml", xpReward: 10, isSpartan: false },
          { name: "Walk", isCustom: false, goalValue: 1, unit: "session", xpReward: 10, isSpartan: false },
          { name: "Study / Work", isCustom: false, goalValue: 4, unit: "h", xpReward: 20, isSpartan: false },
          { name: "Stretching", isCustom: false, goalValue: 1, unit: "session", xpReward: 10, isSpartan: false },
          { name: "Reading", isCustom: false, goalValue: 1, unit: "session", xpReward: 10, isSpartan: false },
          { name: "Meditation", isCustom: false, goalValue: 1, unit: "session", xpReward: 15, isSpartan: false },
          { name: "10 Pushups", isCustom: false, goalValue: 1, unit: "set", xpReward: 5, isSpartan: false },
          { name: "20 Squats", isCustom: false, goalValue: 1, unit: "set", xpReward: 5, isSpartan: false },
          { name: "30 Second Plank", isCustom: false, goalValue: 1, unit: "set", xpReward: 5, isSpartan: false },
          { name: "Cold Shower", isCustom: false, goalValue: 1, unit: "session", xpReward: 30, isSpartan: true },
          { name: "Extra Workout", isCustom: false, goalValue: 1, unit: "session", xpReward: 40, isSpartan: true },
          { name: "2 Hour Deep Work", isCustom: false, goalValue: 1, unit: "session", xpReward: 50, isSpartan: true },
          { name: "Digital Detox", isCustom: false, goalValue: 1, unit: "session", xpReward: 40, isSpartan: true },
        ];
        for (const h of defaultHabits) await storage.createHabit(h);
      }
      const existingAchievements = await storage.getAchievements();
      if (existingAchievements.length === 0) {
        const achs = [
          { name: "First Focus Session", description: "Complete your first focus session", isSecret: false },
          { name: "7 Day Streak", description: "Maintain a 7 day habit streak", isSecret: false },
          { name: "5 Workouts Completed", description: "Complete 5 workouts", isSecret: false },
          { name: "Monk Mode", description: "30 days NoFap", isSecret: true },
          { name: "Beast Mode", description: "6 hours focus in one day", isSecret: true },
          { name: "Unbreakable", description: "50 day streak", isSecret: true },
        ];
        // Note: achievement schema in shared/schema.ts isAchievements not ACHIEVEMENTS
        // Need to use db directly or add to storage
      }
    } catch (err) { console.error("Seed failed:", err); }
  }

  app.get(api.habits.list.path, async (req, res) => res.json(await storage.getHabits()));
  app.post(api.habits.create.path, async (req, res) => res.status(201).json(await storage.createHabit(api.habits.create.input.parse(req.body))));
  app.delete(api.habits.delete.path, async (req, res) => {
    await storage.deleteHabit(parseInt(req.params.id));
    res.status(204).send();
  });
  app.get(api.habitLogs.list.path, async (req, res) => res.json(await storage.getHabitLogs(req.query.date as string)));
  app.post(api.habitLogs.createOrUpdate.path, async (req, res) => res.json(await storage.createOrUpdateHabitLog(api.habitLogs.createOrUpdate.input.parse(req.body))));
  app.get(api.habitLogs.streaks.path, async (req, res) => res.json({ streak: await storage.getHabitStreak(parseInt(req.params.id)) }));
  app.get(api.journalEntries.get.path, async (req, res) => res.json((await storage.getJournalEntry(req.params.date)) || null));
  app.get(api.journalEntries.list.path, async (req, res) => res.json(await storage.getJournalEntries()));
  app.post(api.journalEntries.createOrUpdate.path, async (req, res) => res.json(await storage.createOrUpdateJournalEntry(api.journalEntries.createOrUpdate.input.parse(req.body))));
  app.get(api.userStats.get.path, async (req, res) => res.json(await storage.getUserStats()));
  app.get(api.achievements.list.path, async (req, res) => res.json(await storage.getAchievements()));
  app.get(api.focusSessions.list.path, async (req, res) => res.json(await storage.getFocusSessions(req.query.date as string)));
  app.post(api.focusSessions.create.path, async (req, res) => res.status(201).json(await storage.createFocusSession(api.focusSessions.create.input.parse(req.body))));

  seedDatabase();
  return httpServer;
}
