import { z } from "zod";

export const paymentSchema = z.object({
    stripePaymentIntentId: z.string().optional(), // Nu required la început
    amount: z.number().min(0),
    currency: z.string().length(3).default('eur'), // Să se potrivească cu modelul
    status: z.enum([
        'succeeded',
        'processing',
        'requires_payment_method',
        'canceled'
    ]).default('processing'),
    method: z.string().optional()
});