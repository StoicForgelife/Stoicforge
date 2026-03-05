import { z } from 'zod';
import { 
  insertHabitSchema, 
  habits, 
  insertHabitLogSchema, 
  habitLogs, 
  insertJournalEntrySchema, 
  journalEntries, 
  insertDistractionLogSchema, 
  distractionLogs,
  insertFocusSessionSchema,
  focusSessions,
  userStats,
  achievements
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  habits: {
    list: {
      method: 'GET' as const,
      path: '/api/habits' as const,
      responses: {
        200: z.array(z.custom<typeof habits.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/habits' as const,
      input: insertHabitSchema,
      responses: {
        201: z.custom<typeof habits.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/habits/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  habitLogs: {
    list: {
      method: 'GET' as const,
      path: '/api/habit-logs' as const,
      input: z.object({
        date: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof habitLogs.$inferSelect>()),
      },
    },
    createOrUpdate: {
      method: 'POST' as const,
      path: '/api/habit-logs' as const,
      input: insertHabitLogSchema,
      responses: {
        200: z.custom<typeof habitLogs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    streaks: {
      method: 'GET' as const,
      path: '/api/habits/:id/streak' as const,
      responses: {
        200: z.object({ streak: z.number() }),
      },
    },
  },
  journalEntries: {
    get: {
      method: 'GET' as const,
      path: '/api/journal-entries/:date' as const,
      responses: {
        200: z.custom<typeof journalEntries.$inferSelect>().nullable(),
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/journal-entries' as const,
      responses: {
        200: z.array(z.custom<typeof journalEntries.$inferSelect>()),
      },
    },
    createOrUpdate: {
      method: 'POST' as const,
      path: '/api/journal-entries' as const,
      input: insertJournalEntrySchema,
      responses: {
        200: z.custom<typeof journalEntries.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  userStats: {
    get: {
      method: 'GET' as const,
      path: '/api/user-stats' as const,
      responses: {
        200: z.custom<typeof userStats.$inferSelect>(),
      },
    },
  },
  achievements: {
    list: {
      method: 'GET' as const,
      path: '/api/achievements' as const,
      responses: {
        200: z.array(z.custom<typeof achievements.$inferSelect>()),
      },
    },
  },
  focusSessions: {
    list: {
      method: 'GET' as const,
      path: '/api/focus-sessions' as const,
      input: z.object({ date: z.string().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof focusSessions.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/focus-sessions' as const,
      input: insertFocusSessionSchema,
      responses: {
        201: z.custom<typeof focusSessions.$inferSelect>(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
