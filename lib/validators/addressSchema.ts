// lib/validators.ts
import { z } from "zod";

// Existing schemas (updated with English messages)
export const addressSchema = z.object({
    street: z.string().min(1, "Street is required").max(100),
    city: z.string().min(1, "City is required").max(50),
    state: z.string().max(100).optional(),
    postalCode: z.string().min(1, "Postal code is required").max(10),
    country: z.string().min(1, "Country is required").max(56).default("Romania"),
    details: z.string().max(500).optional()
});

export const validateAddress = (data: any) => {
    return addressSchema.safeParse(data);
};
export type AddressType = z.infer<typeof addressSchema>;
