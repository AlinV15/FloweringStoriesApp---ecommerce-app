// validators/stationarySchema.ts - FIXED VERSION
import { z } from "zod";

export const stationarySchema = z.object({
    brand: z.string().min(2).max(100).optional(),
    color: z.array(z.string().min(3)).min(1),
    type: z.string().min(3).max(50),
    // REMOVED: price is handled in main product schema
    dimensions: z.object({
        height: z.number().min(0).max(100),
        width: z.number().min(0).max(100),
        depth: z.number().min(0).max(100)
    }),
    material: z.string().min(2).max(50).optional()
});