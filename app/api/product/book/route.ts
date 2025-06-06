import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';

import connectToDatabase from "@/lib/mongodb";
import Book from "@/lib/models/Book";
import Product from "@/lib/models/Product";
import { bookSchema, productSchema } from "@/lib/validators";
import { z } from "zod";

// combinăm schema: validăm book și product (fără refId! și type/typeRef care sunt interne)
const bookProductSchema = z.object({
    book: bookSchema,
    product: productSchema.omit({ refId: true, type: true, typeRef: true })
});

// GET - public (opțional poți filtra doar active/publicate)
export async function GET() {
    try {
        await connectToDatabase();
        const books = await Book.find();
        const productBooks = await Product.find({ type: "book" });

        return NextResponse.json({ books, productBooks });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Eroare server" }, { status: 500 });
    }
}

// POST - doar adminii pot crea
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Doar adminii pot crea produse" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();

    console.log("Received body:", body);
    const parsed = bookProductSchema.safeParse(body);
    console.log("Parsed data:", parsed);
    if (!parsed.success) {
        return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
    }

    const { book, product } = parsed.data;

    try {
        const createdBook = await Book.create(book);

        const createdProduct = await Product.create({
            ...product,
            refId: createdBook._id,
            type: "book",
            typeRef: "Book"
        });

        return NextResponse.json({ book: createdBook, product: createdProduct }, { status: 201 });
    } catch (error) {
        console.error("Eroare creare produs:", error);
        return NextResponse.json({ message: "Eroare server", error }, { status: 500 });
    }
}
