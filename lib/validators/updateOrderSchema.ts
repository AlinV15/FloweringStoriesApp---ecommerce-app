import { z } from "zod";

export const updateOrderSchema = z.object({
    deliveryMethod: z.enum(["courier", "pickup"]).optional(),
    address: z.string().optional(),
    note: z.string().max(500).optional(),
    status: z.enum(["pending", "shipped", "delivered"]).optional()
});
