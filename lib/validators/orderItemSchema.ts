import { z } from "zod";

export const orderItemSchema = z.object({
    product: z.string().min(10, "Valid product ID is required"), // MongoDB ObjectId length
    quantity: z.number().int().min(1, "Quantity must be at least 1").max(100, "Quantity cannot exceed 100"),
    lineAmount: z.number().min(0, "Line amount cannot be negative").max(100000, "Line amount too large")
});