import { z } from "zod";

export const bookSchema = z.object({
    author: z.string().min(2, { message: "Autorul este obligatoriu." }),
    pages: z.number().int().min(1).max(5000),
    isbn: z.string().length(13, { message: "ISBN-ul trebuie să aibă exact 13 caractere." }),
    publisher: z.string().min(2).max(100).optional(),
    genre: z.string().min(3).max(50).optional(),
    language: z.string().min(2).max(30).optional(),
    publicationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});