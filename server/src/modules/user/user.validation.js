import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters'),
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Invalid email address'),
    phone: z
      .string({ required_error: 'Phone number is required' })
      .trim()
      .min(11, 'Phone number must be at least 11 characters'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters'),
  }),
});

export const loginSchema = z.object({
  body: z
    .object({
      email: z.string().trim().email('Invalid email address').optional(),
      phone: z.string().trim().optional(),
      identifier: z.string().trim().optional(),
      password: z
        .string({ required_error: 'Password is required' })
        .min(1, 'Password is required'),
    })
    .refine((data) => data.email || data.phone || data.identifier, {
      message: 'Either email, phone, or identifier must be provided',
      path: ['email'],
    }),
});

export const claimAccountSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Invalid email address').optional(),
    password: z
      .string({ message: 'Password is required' })
      .min(6, 'Password must be at least 6 characters'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().trim().email('Invalid email address').optional(),
    phone: z.string().trim().min(11, 'Phone number must be at least 11 characters').optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().optional(),
    newPassword: z
      .string({ message: 'New password is required' })
      .min(6, 'New password must be at least 6 characters'),
  }),
});

