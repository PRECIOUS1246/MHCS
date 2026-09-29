import { z } from 'zod';

export const registerSchema = z.object({
  body: z
    .object({
      fullName: z.string().trim().min(2, 'Full name is required'),
      email: z.string().trim().email('Invalid email'),
      studentId: z.string().trim().min(3, 'Student ID is required'),
      department: z.string().trim().min(2, 'Department is required'),
      level: z.string().trim().min(1, 'Level is required'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .superRefine(({ password, confirmPassword }, ctx) => {
      if (password !== confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirmPassword'],
          message: 'Passwords do not match',
        });
      }
    }),
});

export const createUserSchema = z.object({
  body: z
    .object({
      fullName: z.string().trim().min(2, 'Full name is required'),
      email: z.string().trim().email('Invalid email'),
      role: z.enum(['counsellor', 'admin']),
      department: z.string().trim().optional(),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .superRefine(({ password, confirmPassword }, ctx) => {
      if (password !== confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirmPassword'],
          message: 'Passwords do not match',
        });
      }
    }),
});

export const loginSchema = z.object({
  body: z
    .object({
      email: z.string().email(),
      password: z.string().min(1).optional(),
      otp: z.string().regex(/^\d{6}$/).optional(),
    })
    .refine((data) => data.password || data.otp, {
      message: 'Provide a password or a 6-digit OTP',
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
    imageUrl: z.string().url().optional().or(z.literal('')),
    videoUrl: z.string().url().optional().or(z.literal('')),
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
