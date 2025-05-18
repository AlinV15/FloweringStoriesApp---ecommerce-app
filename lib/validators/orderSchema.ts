import { z } from "zod";
import { addressSchema } from "./addressSchema";
import { paymentSchema } from "./paymentSchema";

export const orderSchema = z.object({
    user: z.string(), // ID de user
    items: z.array(z.string()), // ID-uri de OrderItem
    address: addressSchema,
    totalAmount: z.number().min(0),
    payment: paymentSchema,
    deliveryMethod: z.enum(['courier', 'pickup']),
    note: z.string().optional(),
    guestEmail: z.string().email().optional(),
    guestName: z.string().optional(),
    status: z.enum(["pending", "shipped", "delivered"])
});
