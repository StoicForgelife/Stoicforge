import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed initial habits if none exist
  async function seedDatabase() {
    try {
      const existingHabits = await storage.getHabits();
      if (existingHabits.length === 0) {
        const defaultHabits = [
          { name: "Drink Water", isCustom: false, goalValue: 2000, unit: "ml" },
          { name: "Workout", isCustom: false, goalValue: 1, unit: "session" },
          { name: "Study / Work", isCustom: false, goalValue: 4, unit: "h" },
          { name: "Journal", isCustom: false, goalValue: 1, unit: "entry" },
          { name: "NoFap", isCustom: false, goalValue: 1, unit: "day" },
          { name: "Sleep 7+ Hours", isCustom: false, goalValue: 7, unit: "h" },
        ];
        
        for (const habit of defaultHabits) {
          await storage.createHabit(habit);
        }
        console.log("Database seeded with default habits");
      }
    } catch (err) {
      console.error("Failed to seed database:", err);
    }
  }

  // Habits
  app.get(api.habits.list.path, async (req, res) => {
    const habits = await storage.getHabits();
    res.json(habits);
  });

  app.post(api.habits.create.path, async (req, res) => {
    try {
      const input = api.habits.create.input.parse(req.body);
      const habit = await storage.createHabit(input);
      res.status(201).json(habit);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.habits.delete.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid habit ID" });
      }
      await storage.deleteHabit(id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Habit Logs
  app.get(api.habitLogs.list.path, async (req, res) => {
    const date = req.query.date as string | undefined;
    const logs = await storage.getHabitLogs(date);
    res.json(logs);
  });

  app.post(api.habitLogs.createOrUpdate.path, async (req, res) => {
    try {
      const input = api.habitLogs.createOrUpdate.input.parse(req.body);
      const log = await storage.createOrUpdateHabitLog(input);
      res.status(200).json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.habitLogs.streaks.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const streak = await storage.getHabitStreak(id);
    res.json({ streak });
  });

  // Journal Entries
  app.get(api.journalEntries.get.path, async (req, res) => {
    const date = req.params.date;
    const entry = await storage.getJournalEntry(date);
    res.json(entry || null);
  });

  app.post(api.journalEntries.createOrUpdate.path, async (req, res) => {
    try {
      const input = api.journalEntries.createOrUpdate.input.parse(req.body);
      const entry = await storage.createOrUpdateJournalEntry(input);
      res.status(200).json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Distraction Logs
  app.get(api.distractionLogs.get.path, async (req, res) => {
    const date = req.params.date;
    const log = await storage.getDistractionLog(date);
    res.json(log || null);
  });

  app.post(api.distractionLogs.createOrUpdate.path, async (req, res) => {
    try {
      const input = api.distractionLogs.createOrUpdate.input.parse(req.body);
      const log = await storage.createOrUpdateDistractionLog(input);
      res.status(200).json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Focus Sessions
  app.get(api.focusSessions.list.path, async (req, res) => {
    const date = req.query.date as string | undefined;
    const sessions = await storage.getFocusSessions(date);
    res.json(sessions);
  });

  app.post(api.focusSessions.create.path, async (req, res) => {
    try {
      const input = api.focusSessions.create.input.parse(req.body);
      const session = await storage.createFocusSession(input);
      res.status(201).json(session);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Run seed function on startup
  seedDatabase();

  return httpServer;
}
