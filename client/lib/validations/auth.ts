import { z } from "zod";

export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: "নাম অন্তত ২ অক্ষরের হতে হবে" }),
    email: z
      .string()
      .trim()
      .email({ message: "একটি সঠিক ইমেইল ঠিকানা প্রদান করুন" }),
    phone: z
      .string()
      .trim()
      .min(11, { message: "ফোন নম্বর অন্তত ১১ ডিজিটের হতে হবে" }),
    password: z
      .string()
      .min(6, { message: "পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে" }),
    confirmPassword: z
      .string()
      .min(6, { message: "পাসওয়ার্ড নিশ্চিত করুন" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "পাসওয়ার্ড মেলেনি",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, { message: "ইমেইল বা ফোন নম্বর আবশ্যক" }),
  password: z
    .string()
    .min(1, { message: "পাসওয়ার্ড আবশ্যক" }),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
