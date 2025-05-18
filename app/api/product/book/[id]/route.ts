import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Book from "@/lib/models/Book";
import Product from "@/lib/models/Product";
import { productSchema, stationarySchema } from "@/lib/validators";
import { z } from "zod";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/product/book/[id]
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
    await connectToDatabase();
    const book = await Book.findById(params.id);
    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });
    return NextResponse.json(book);
}

// PUT si inputul pentru book si product
const inputSchema = z.object({
    book: stationarySchema.partial(),
    product: productSchema.omit({ refId: true, type: true, typeRef: true })
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Doar adminii pot crea produse" }, { status: 403 });
    }
    await connectToDatabase();
    const body = await req.json();

    const parsed = inputSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { book, product } = parsed.data;

    const updatedBook = await Book.findByIdAndUpdate(params.id, book, { new: true });
    if (!updatedBook) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    const updatedProduct = await Product.findOneAndUpdate(
        { refId: new mongoose.Types.ObjectId(params.id), type: "book" },
        { ...product },
        { new: true }
    );

    return NextResponse.json({ book: updatedBook, product: updatedProduct });
}



// DELETE /api/product/book/[id]
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Doar adminii pot crea produse" }, { status: 403 });
    }
    await connectToDatabase();

    // Ștergem întâi produsul asociat
    const deletedProduct = await Product.findOneAndDelete({
        refId: new mongoose.Types.ObjectId(params.id),
        type: "book"
    });

    // Apoi ștergem cartea
    const deletedBook = await Book.findByIdAndDelete(params.id);

    if (!deletedBook) {
        return NextResponse.json({ error: "Book not found (product might have been deleted)" }, { status: 404 });
    }

    return NextResponse.json({
        message: "Book and associated Product deleted",
        deletedProductId: deletedProduct?._id,
        deletedBookId: deletedBook._id
    });
}
