import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(1, 'First name required'),
    lastName: z.string().min(1, 'Last name required'),
    role: z.enum(['student', 'counsellor', 'admin']).optional(),
    studentId: z.string().optional(),
    department: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const assessmentSchema = z.object({
  body: z.object({
    type: z.enum(['phq9', 'gad7']),
    answers: z.array(z.number().min(0).max(3)),
    isAnonymous: z.boolean().optional(),
  }),
});

export const moodSchema = z.object({
  body: z.object({
    mood: z.number().min(1).max(10),
    emoji: z.string().min(1),
    note: z.string().max(2000).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const appointmentBookSchema = z.object({
  body: z.object({
    counsellorId: z.string(),
    scheduledAt: z.string().datetime(),
    reason: z.string().max(1000).optional(),
    duration: z.number().min(15).max(120).optional(),
  }),
});

export const availabilitySchema = z.object({
  body: z.object({
    dayOfWeek: z.number().min(0).max(6),
    slots: z.array(
      z.object({
        startTime: z.string(),
        endTime: z.string(),
      })
    ),
  }),
});

export const forumPostSchema = z.object({
  body: z.object({
    forumId: z.string(),
    title: z.string().min(3).max(200),
    content: z.string().min(10).max(5000),
    isAnonymous: z.boolean().optional(),
    parentId: z.string().optional(),
  }),
});

export const resourceSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    type: z.enum(['article', 'video', 'guide', 'strategy', 'emergency']),
    content: z.string().optional(),
    url: z.string().url().optional().or(z.literal('')),
    tags: z.array(z.string()).optional(),
    isPublished: z.boolean().optional(),
  }),
});

export const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    search: z.string().optional(),
  }),
});
