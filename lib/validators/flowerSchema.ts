import { z } from "zod";

export const flowerSchema = z.object({
    color: z.string().min(3),
    freshness: z.number().min(0).max(100),
    lifespan: z.number().int().min(1).max(365),
    season: z.enum(["spring", "summer", "autumn", "winter"]).optional(),
    careInstructions: z.string().max(1000).optional(),
    expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});