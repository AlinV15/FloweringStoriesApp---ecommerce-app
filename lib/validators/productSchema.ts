// validators/productSchema.ts - ENHANCED VERSION
import { z } from "zod";

export const productSchema = z.object({
    type: z.enum(["book", "stationary", "flower"], {
        errorMap: () => ({ message: "Type must be 'book', 'stationary' or 'flower'." })
    }),
    typeRef: z.enum(["Book", "Stationary", "Flower"], {
        errorMap: () => ({ message: "TypeRef must be 'Book', 'Stationary' or 'Flower'." })
    }),
    refId: z.string().min(1, { message: "Reference ID is required." }).optional(),

    name: z.string().min(2, { message: "Name must have at least 2 characters." }),
    price: z.number().min(0, { message: "Price must be positive." }),
    discount: z.number().min(0).max(100).optional().default(0),
    Description: z.string().max(1000, { message: "Description cannot exceed 1000 characters." }).optional(),

    subcategories: z.array(z.string()).optional().default([]),
    reviews: z.array(z.string()).optional().default([]),
    image: z.string().url({ message: "Must be a valid URL for image." }),
    stock: z.number().int().nonnegative({ message: "Stock must be a non-negative integer." })
});