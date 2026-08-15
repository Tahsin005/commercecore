import { z } from "zod";
import { TranslationType } from "@/locales/bn";

export const getCheckoutSchema = (t: TranslationType) =>
  z.object({
    customerName: z
      .string()
      .trim()
      .min(2, { message: t.validation.customerNameMin }),
    phone: z
      .string()
      .trim()
      .min(11, { message: t.validation.phoneMin }),
    shippingAddress: z
      .string()
      .trim()
      .min(5, { message: t.validation.addressMin }),
    notes: z.string().trim().optional(),
    deliveryZone: z.enum(["inside_dhaka", "outside_dhaka"], {
      message: t.validation.deliveryZoneRequired,
    }),
  });

const defaultValidation = {
  customerNameMin: "Full name must be at least 2 characters long",
  phoneMin: "Phone number must be at least 11 digits",
  addressMin: "Shipping address must be at least 5 characters long",
  deliveryZoneRequired: "Please select a delivery area",
};

export const checkoutSchema = getCheckoutSchema({ validation: defaultValidation } as any);

export type CheckoutInput = z.infer<typeof checkoutSchema>;
