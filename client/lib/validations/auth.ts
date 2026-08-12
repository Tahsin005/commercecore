import { z } from "zod";

export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: "Name must be at least 2 characters long" }),
    email: z
      .string()
      .trim()
      .email({ message: "Please enter a valid email address" }),
    phone: z
      .string()
      .trim()
      .min(11, { message: "Phone number must be at least 11 digits" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, { message: "Email or Phone number is required" }),
  password: z
    .string()
    .min(1, { message: "Password is required" }),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
