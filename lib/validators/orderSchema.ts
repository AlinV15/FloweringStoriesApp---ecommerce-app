import { z } from "zod";
import { addressSchema } from "./addressSchema";
import { paymentSchema } from "./paymentSchema";

export const orderSchema = z.object({
    user: z.string().optional(),
    address: addressSchema.optional(),
    deliveryMethod: z.enum(['courier', 'pickup']),
    note: z.string().optional(),
    guestEmail: z.string().email().optional(),
    guestName: z.string().optional(),
    status: z.enum(["pending", "shipped", "delivered"]).optional(),
    payment: paymentSchema.optional(),
    paymentMethod: z.string().optional()
    // ❌ ELIMINĂ items și totalAmount de aici
});