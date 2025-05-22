import { z } from 'zod';

export const shopSettingsSchema = z.object({
    shopName: z.string().min(1, "Shop name is required."),
    description: z.string().min(1, "Description is required."),
    logo: z.object({
        favicon: z.string(),
        headerLogo: z.string(),
    }).optional(),
    currency: z.enum(['RON', 'USD', 'EUR']).or(z.string()).refine(
        (val) => ['RON', 'USD', 'EUR'].includes(val),
        { message: "Currency must be one of: RON, USD, EUR." }
    ),
    paymentMethod: z.enum(['stripe', 'paypal', 'bank']).refine(
        (val) => ['stripe', 'paypal', 'bank'].includes(val),
        { message: "Payment method must be one of: stripe, paypal, bank." }
    ),
    freeShipping: z.boolean().optional(),
});
