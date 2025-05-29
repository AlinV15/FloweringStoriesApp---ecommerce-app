// validators/subcategorySchema.ts
import { z } from "zod";

export const subcategorySchema = z.object({
    name: z.string()
        .min(3, { message: "Name must have at least 3 characters." })
        .max(50, { message: "Name cannot exceed 50 characters." }),
    description: z.string()
        .max(500, { message: "Description cannot exceed 500 characters." })
        .optional(),
    image: z.string()
        .url({ message: "Must be a valid URL for image." })
        .optional(),
    type: z.enum(['book', 'stationary', 'flower'], {
        errorMap: () => ({ message: "Type must be 'book', 'stationary' or 'flower'." })
    })
});