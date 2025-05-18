import { z } from "zod";

export const paymentSchema = z.object({
    stripePaymentIntentId: z.string().min(1),
    amount: z.number().min(0),
    currency: z.string().length(3).default('ron'),
    status: z.enum([
        'succeeded',
        'processing',
        'requires_payment_method',
        'canceled'
    ]),
    method: z.string().optional()
});
