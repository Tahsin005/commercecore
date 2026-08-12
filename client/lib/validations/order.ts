import { z } from "zod";

export const checkoutSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, { message: "Full name must be at least 2 characters long" }),
  phone: z
    .string()
    .trim()
    .min(11, { message: "Phone number must be at least 11 digits" }),
  shippingAddress: z
    .string()
    .trim()
    .min(5, { message: "Shipping address must be at least 5 characters long" }),
  deliveryZone: z.enum(["inside_dhaka", "outside_dhaka"], {
    message: "Please select a delivery area",
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
