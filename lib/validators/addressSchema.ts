import { z } from "zod";

export const addressSchema = z.object({
    street: z
        .string()
        .min(5, { message: "Strada trebuie să aibă minim 5 caractere." })
        .max(100, { message: "Strada nu poate depăși 100 de caractere." }),

    city: z
        .string()
        .min(2, { message: "Orașul trebuie să aibă minim 2 caractere." })
        .max(50, { message: "Orașul nu poate depăși 50 de caractere." }),

    postalCode: z
        .string()
        .min(4, { message: "Codul poștal trebuie să aibă minim 4 caractere." })
        .max(10, { message: "Codul poștal nu poate depăși 10 caractere." })
        .regex(/^[0-9A-Za-z-]+$/, { message: "Codul poștal conține caractere invalide." }),

    country: z
        .string()
        .min(2, { message: "Țara trebuie să aibă minim 2 caractere." })
        .max(56, { message: "Țara nu poate depăși 56 de caractere." }),
});
