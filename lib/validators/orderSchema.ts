import { z } from "zod";
import { addressSchema } from "./addressSchema";
import { paymentSchema } from "./paymentSchema";
import { orderItemSchema } from "./orderItemSchema";
import { customerSchema } from "@/lib/validators/customerSchema"


export const orderSchema = z.object({
    user: z.string().optional(),
    address: addressSchema.optional(),
    deliveryMethod: z.enum(['courier', 'pickup'], {
        errorMap: () => ({ message: "Delivery method must be 'courier' or 'pickup'" })
    }),
    note: z.string().max(1000, "Note cannot exceed 1000 characters").optional(),
    guestEmail: z.string().email("Invalid email format").optional(),
    guestName: z.string().max(100, "Guest name too long").optional(),
    status: z.enum(["pending", "shipped", "delivered"]).default("pending"),
    payment: paymentSchema.optional(),
    paymentMethod: z.string().optional()
});



// Enhanced order schema for complete checkout
export const completeOrderSchema = z.object({
    items: z.array(orderItemSchema).min(1, "Order must contain at least one item"),
    customer: customerSchema,
    address: addressSchema.optional(), // Optional because pickup doesn't need address
    deliveryMethod: z.enum(["courier", "pickup"]),
    paymentMethod: z.enum(["card"]),
    note: z.string().max(1000).optional().default(""),
    totalAmount: z.number().positive("Total amount must be positive"),
    userId: z.string().optional()
});

// Order creation with items schema (for your existing API structure)
export const orderWithItemsSchema = z.object({
    items: z.array(orderItemSchema).min(1, "Order must contain at least one item"),
    customer: customerSchema,
    address: addressSchema.optional(),
    deliveryMethod: z.enum(["courier", "pickup"]),
    paymentMethod: z.string().default("card"),
    note: z.string().max(1000).optional(),
    totalAmount: z.number().positive(),
    payment: z.object({
        currency: z.string().default("eur"),
        method: z.string().default("card")
    }).optional()
});

// Validation functions
export const validateCompleteOrder = (data: any) => {
    return completeOrderSchema.safeParse(data);
};

export const validateOrderWithItems = (data: any) => {
    return orderWithItemsSchema.safeParse(data);
};

export const validateOrderItems = (data: any) => {
    return z.array(orderItemSchema).safeParse(data);
};

export const validateOrder = (data: any) => {
    return orderSchema.safeParse(data);
};


export type OrderItemType = z.infer<typeof orderItemSchema>;
export type OrderType = z.infer<typeof orderSchema>;
export type CompleteOrderType = z.infer<typeof completeOrderSchema>;