import { z } from "zod";

export const checkoutSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, { message: "পূর্ণ নাম অন্তত ২ অক্ষরের হতে হবে" }),
  phone: z
    .string()
    .trim()
    .min(11, { message: "মোবাইল নম্বর অন্তত ১১ ডিজিটের হতে হবে" }),
  shippingAddress: z
    .string()
    .trim()
    .min(5, { message: "ডেলিভারি ঠিকানা অন্তত ৫ অক্ষরের হতে হবে" }),
  deliveryZone: z.enum(["inside_dhaka", "outside_dhaka"], {
    message: "একটি ডেলিভারি এরিয়া নির্বাচন করুন",
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
