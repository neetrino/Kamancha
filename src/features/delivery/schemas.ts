import { z } from "zod";

export const deliverySettingsSchema = z.object({
  originAddress: z.string().trim().min(3).max(300),
  pricePerKmAmount: z.coerce.number().int().min(0).max(10_000_000),
  isActive: z.boolean(),
});

export type DeliverySettingsInput = z.infer<typeof deliverySettingsSchema>;

export const quoteDistanceDeliverySchema = z.object({
  line1: z.string().trim().min(3).max(300),
});

export type QuoteDistanceDeliveryInput = z.infer<
  typeof quoteDistanceDeliverySchema
>;

/** @deprecated City-based rules; kept for historical order FK rows. */
export const deliveryLocationSchema = z.object({
  country: z.string().trim().min(1).max(80),
  city: z.string().trim().min(1).max(80),
  priceAmount: z.coerce.number().int().min(0).max(10_000_000),
  freeThresholdAmount: z.preprocess((value) => {
    if (value === "" || value == null) return null;
    return value;
  }, z.coerce.number().int().min(0).max(100_000_000).nullable()),
});

export type DeliveryLocationInput = z.infer<typeof deliveryLocationSchema>;
