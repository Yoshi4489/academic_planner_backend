import {z} from "zod";

export const pushSubscriptionSchema=z.object({
  endpoint:z.url().max(2048),
  expirationTime:z.number().nullable().optional(),
  keys:z.object({p256dh:z.string().min(20).max(512),auth:z.string().min(8).max(256)}),
});

export type PushSubscriptionInput=z.infer<typeof pushSubscriptionSchema>;
