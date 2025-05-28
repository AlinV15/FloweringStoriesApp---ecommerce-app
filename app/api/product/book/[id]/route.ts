import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Book from "@/lib/models/Book";
import Product from "@/lib/models/Product";
import { productSchema, bookSchema } from "@/lib/validators"; // Changed from stationarySchema to bookSchema
import { z } from "zod";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/product/book/[id]
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
    try {
        const par = await params;
        const id = par.id;

        await connectToDatabase();

        // Validate if the ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid book ID format" }, { status: 400 });
        }

        const book = await Book.findById(id);
        console.log("Book found:", book);

        if (!book) {
            return NextResponse.json({ error: "Book not found" }, { status: 404 });
        }

        return NextResponse.json(book);
    } catch (error) {
        console.error("Error fetching book:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PUT - Fixed input schema to use bookSchema instead of stationarySchema
const inputSchema = z.object({
    book: bookSchema.partial(), // This was the main issue - you were using stationarySchema
    product: productSchema.omit({ refId: true, type: true, typeRef: true })
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Doar adminii pot crea produse" }, { status: 403 });
        }

        await connectToDatabase();

        // Validate if the ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(params.id)) {
            return NextResponse.json({ error: "Invalid book ID format" }, { status: 400 });
        }

        const body = await req.json();

        const parsed = inputSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({
                error: "Validation failed",
                details: parsed.error.flatten()
            }, { status: 400 });
        }

        const { book, product } = parsed.data;

        const updatedBook = await Book.findByIdAndUpdate(params.id, book, { new: true });
        if (!updatedBook) {
            return NextResponse.json({ error: "Book not found" }, { status: 404 });
        }

        const updatedProduct = await Product.findOneAndUpdate(
            { refId: new mongoose.Types.ObjectId(params.id), type: "book" },
            { ...product },
            { new: true }
        );

        if (!updatedProduct) {
            return NextResponse.json({ error: "Associated product not found" }, { status: 404 });
        }

        return NextResponse.json({ book: updatedBook, product: updatedProduct });
    } catch (error) {
        console.error("Error updating book:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/product/book/[id]
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Doar adminii pot crea produse" }, { status: 403 });
        }

        await connectToDatabase();

        // Validate if the ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(params.id)) {
            return NextResponse.json({ error: "Invalid book ID format" }, { status: 400 });
        }

        // Delete the associated product first
        const deletedProduct = await Product.findOneAndDelete({
            refId: new mongoose.Types.ObjectId(params.id),
            type: "book"
        });

        // Then delete the book
        const deletedBook = await Book.findByIdAndDelete(params.id);

        if (!deletedBook) {
            return NextResponse.json({ error: "Book not found (product might have been deleted)" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Book and associated Product deleted",
            deletedProductId: deletedProduct?._id,
            deletedBookId: deletedBook._id
        });
    } catch (error) {
        console.error("Error deleting book:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}