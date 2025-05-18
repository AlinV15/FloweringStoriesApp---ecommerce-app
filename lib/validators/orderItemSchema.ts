import { z } from "zod";

export const orderItemSchema = z.object({
    product: z.string().min(10), // presupunem ID Mongo valid
    quantity: z.number().int().min(1).max(100),
    lineAmount: z.number().min(0).max(100000)
});