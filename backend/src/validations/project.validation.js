const { z } = require('zod');

const projectStatusEnum = z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'], {
  errorMap: () => ({
    message: "Status must be one of: NOT_STARTED, IN_PROGRESS, COMPLETED.",
  }),
});

const createProjectSchema = z.object({
  name: z
    .string({ required_error: 'Project name is required.' })
    .trim()
    .min(1, 'Project name cannot be empty.')
    .max(200, 'Project name must not exceed 200 characters.'),

  description: z
    .string({ required_error: 'Description is required.' })
    .trim()
    .min(1, 'Description cannot be empty.')
    .max(2000, 'Description must not exceed 2000 characters.'),

  status: projectStatusEnum.optional().default('NOT_STARTED'),

  startDate: z
    .string({ required_error: 'Start date is required.' })
    .trim()
    .min(1, 'Start date cannot be empty.')
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Start date must be a valid ISO 8601 date string.',
    }),

  endDate: z
    .string({ required_error: 'End date is required.' })
    .trim()
    .min(1, 'End date cannot be empty.')
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'End date must be a valid ISO 8601 date string.',
    }),
}).refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  {
    message: 'End date must be on or after start date.',
    path: ['endDate'],
  }
);

const updateProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Project name cannot be empty.')
    .max(200, 'Project name must not exceed 200 characters.')
    .optional(),

  description: z
    .string()
    .trim()
    .min(1, 'Description cannot be empty.')
    .max(2000, 'Description must not exceed 2000 characters.')
    .optional(),

  status: projectStatusEnum.optional(),

  startDate: z
    .string()
    .trim()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Start date must be a valid ISO 8601 date string.',
    })
    .optional(),

  endDate: z
    .string()
    .trim()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'End date must be a valid ISO 8601 date string.',
    })
    .optional(),
});

const projectQuerySchema = z.object({
  search: z.string().trim().optional().default(''),
  status: projectStatusEnum.optional(),
});

module.exports = { createProjectSchema, updateProjectSchema, projectQuerySchema };
