const { z } = require('zod');

const taskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH'], {
  errorMap: () => ({
    message: 'Priority must be one of: LOW, MEDIUM, HIGH.',
  }),
});

const taskStatusEnum = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED'], {
  errorMap: () => ({
    message: 'Status must be one of: PENDING, IN_PROGRESS, COMPLETED.',
  }),
});

const createTaskSchema = z.object({
  name: z
    .string({ required_error: 'Task name is required.' })
    .trim()
    .min(1, 'Task name cannot be empty.')
    .max(200, 'Task name must not exceed 200 characters.'),

  description: z
    .string({ required_error: 'Description is required.' })
    .trim()
    .min(1, 'Description cannot be empty.')
    .max(2000, 'Description must not exceed 2000 characters.'),

  priority: taskPriorityEnum.optional().default('MEDIUM'),

  status: taskStatusEnum.optional().default('PENDING'),

  dueDate: z
    .string({ required_error: 'Due date is required.' })
    .trim()
    .min(1, 'Due date cannot be empty.')
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Due date must be a valid ISO 8601 date string.',
    }),

  projectId: z
    .string({ required_error: 'Project ID is required.' })
    .trim()
    .uuid('Project ID must be a valid UUID.'),
});

const updateTaskSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Task name cannot be empty.')
    .max(200, 'Task name must not exceed 200 characters.')
    .optional(),

  description: z
    .string()
    .trim()
    .min(1, 'Description cannot be empty.')
    .max(2000, 'Description must not exceed 2000 characters.')
    .optional(),

  priority: taskPriorityEnum.optional(),

  status: taskStatusEnum.optional(),

  dueDate: z
    .string()
    .trim()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Due date must be a valid ISO 8601 date string.',
    })
    .optional(),
});

const taskQuerySchema = z.object({
  search: z.string().trim().optional().default(''),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  projectId: z.string().uuid('Project ID must be a valid UUID.').optional(),
});

module.exports = { createTaskSchema, updateTaskSchema, taskQuerySchema };
