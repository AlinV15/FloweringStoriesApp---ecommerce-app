import { z } from "zod";

export const addressSchema = z.object({
    street: z.string().min(1).max(100),
    city: z.string().min(1).max(50),
    state: z.string().optional(),
    postalCode: z.string().min(1).max(10),
    country: z.string().min(1).max(56),
    details: z.string().optional()
});