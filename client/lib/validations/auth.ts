import { z } from "zod";
import { TranslationType } from "@/locales/bn";

export const getSignupSchema = (t: TranslationType) =>
  z
    .object({
      name: z
        .string()
        .trim()
        .min(2, { message: t.validation.nameMin }),
      email: z
        .string()
        .trim()
        .email({ message: t.validation.emailInvalid }),
      phone: z
        .string()
        .trim()
        .min(11, { message: t.validation.phoneMin }),
      password: z
        .string()
        .min(6, { message: t.validation.passwordMin }),
      confirmPassword: z
        .string()
        .min(6, { message: t.validation.confirmPasswordRequired }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t.validation.passwordsMatch,
      path: ["confirmPassword"],
    });

export const getLoginSchema = (t: TranslationType) =>
  z.object({
    identifier: z
      .string()
      .trim()
      .min(1, { message: t.validation.identifierRequired }),
    password: z
      .string()
      .min(1, { message: t.validation.passwordRequired }),
  });

// Default fallback schemas for static typing
const defaultValidation = {
  nameMin: "Name must be at least 2 characters long",
  emailInvalid: "Please enter a valid email address",
  phoneMin: "Phone number must be at least 11 digits",
  passwordMin: "Password must be at least 6 characters long",
  confirmPasswordRequired: "Please confirm your password",
  passwordsMatch: "Passwords do not match",
  identifierRequired: "Email or Phone number is required",
  passwordRequired: "Password is required",
};

export const signupSchema = getSignupSchema({ validation: defaultValidation } as any);
export const loginSchema = getLoginSchema({ validation: defaultValidation } as any);

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
