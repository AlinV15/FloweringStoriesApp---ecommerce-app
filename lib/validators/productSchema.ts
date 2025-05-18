import { z } from "zod";

export const productSchema = z.object({
    type: z.enum(["book", "stationary", "flower"], {
        errorMap: () => ({ message: "Tipul trebuie să fie 'book', 'stationary' sau 'flower'." })
    }),
    typeRef: z.enum(["Book", "Stationary", "Flower"]),
    refId: z.string().min(1, { message: "ID-ul referinței este necesar." }).optional(),

    name: z.string().min(2, { message: "Numele trebuie să aibă minim 2 caractere." }),
    price: z.number().min(0, { message: "Prețul trebuie să fie pozitiv." }),
    discount: z.number().min(0).max(100).optional(),
    Description: z.string().max(1000).optional(),

    subcategories: z.array(z.string()).optional(), // ID-uri Mongo
    reviews: z.array(z.string()).optional(),       // ID-uri Mongo
    image: z.string().url({ message: "Trebuie să fie un URL valid pentru imagine." }).optional(),
    stock: z.number().int().nonnegative()
});
