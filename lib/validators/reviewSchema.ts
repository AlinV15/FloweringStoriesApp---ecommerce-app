import { z } from "zod";

export const reviewSchema = z.object({
    user: z.string().min(10),
    product: z.string().min(10),
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(1000).optional()
});