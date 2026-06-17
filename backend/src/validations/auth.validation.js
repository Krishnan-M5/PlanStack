const { z } = require('zod');

const registerSchema = z.object({
  fullName: z
    .string({
      required_error: 'Full name is required.',
    })
    .trim()
    .min(2, 'Full name must be at least 2 characters long.')
    .max(100, 'Full name must not exceed 100 characters.'),

  email: z
    .string({
      required_error: 'Email is required.',
    })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address.'),

  password: z
    .string({
      required_error: 'Password is required.',
    })
    .min(6, 'Password must be at least 6 characters long.')
    .max(128, 'Password must not exceed 128 characters.'),
});

const loginSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required.',
    })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address.'),

  password: z
    .string({
      required_error: 'Password is required.',
    })
    .min(1, 'Password cannot be empty.'),
});

module.exports = { registerSchema, loginSchema };
