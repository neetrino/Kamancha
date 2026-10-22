import { z } from "zod";

import { locales } from "@/lib/i18n/config";

const PUSH_ENDPOINT_MAX_LENGTH = 2048;
const PUSH_KEY_MAX_LENGTH = 256;
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+=*$/;

const pushEndpointSchema = z
  .string()
  .trim()
  .max(PUSH_ENDPOINT_MAX_LENGTH)
  .url()
  .refine((value) => value.startsWith("https://"), "Endpoint must be https");

const pushKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(PUSH_KEY_MAX_LENGTH)
  .regex(BASE64URL_PATTERN, "Key must be base64url");

export const saveAdminPushSubscriptionSchema = z.object({
  locale: z.enum(locales),
  endpoint: pushEndpointSchema,
  keys: z.object({
    p256dh: pushKeySchema,
    auth: pushKeySchema,
  }),
});

export type SaveAdminPushSubscriptionInput = z.infer<
  typeof saveAdminPushSubscriptionSchema
>;

export const removeAdminPushSubscriptionSchema = z.object({
  locale: z.enum(locales),
  endpoint: pushEndpointSchema,
});

export type RemoveAdminPushSubscriptionInput = z.infer<
  typeof removeAdminPushSubscriptionSchema
>;
