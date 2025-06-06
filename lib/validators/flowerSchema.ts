// validators/flowerSchema.ts - FIXED VERSION
import { z } from "zod";

export const flowerSchema = z.object({
    color: z.string().min(3),
    freshness: z.number().min(0).max(100),
    lifespan: z.number().int().min(1).max(365),
    season: z.enum(["spring", "summer", "autumn", "winter"]).optional(),
    careInstructions: z.string().max(1000).optional(),
    // FIXED: Accept both Date objects and date strings
    expiryDate: z.union([
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        z.date(),
        z.string().datetime(),
        z.string().length(0) // Accept empty string
    ]).optional().transform((val) => {
        if (!val || val === '') return undefined;
        if (val instanceof Date) return val;
        return new Date(val);
    })
});