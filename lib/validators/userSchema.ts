import { z } from "zod";
import { addressSchema } from "./addressSchema";

export const userSchema = z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    birthDate: z.string().optional(),
    genre: z.enum(["male", "female", "other"]).optional(),
    address: addressSchema,
    favoriteProducts: z.array(z.string()).optional(), // ID-uri de produse
    orders: z.array(z.string()).optional()            // ID-uri de comenzi
});
