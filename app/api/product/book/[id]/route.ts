import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Book from "@/lib/models/Book";
import Product from "@/lib/models/Product";
import { productSchema, bookSchema } from "@/lib/validators";
import { z } from "zod";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/product/book/[id] - FIXED to return both book and product data
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const par = await params;
        const id = par.id;

        await connectToDatabase();

        // Validate if the ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid book ID format" }, { status: 400 });
        }

        // Fetch the book data
        const book = await Book.findById(id);
        console.log("Book found:", book);

        if (!book) {
            return NextResponse.json({ error: "Book not found" }, { status: 404 });
        }

        // IMPORTANT: Also fetch the associated product data
        const product = await Product.findOne({
            refId: new mongoose.Types.ObjectId(id),
            type: "book"
        });

        console.log("Associated product found:", product);

        // Return both book details and product details
        return NextResponse.json({
            // Book specific fields
            author: book.author,
            pages: book.pages,
            isbn: book.isbn,
            publisher: book.publisher,
            genre: book.genre,
            language: book.language,
            publicationDate: book.publicationDate,

            // Product fields (if product exists)
            ...(product && {
                productId: product._id,
                name: product.name,
                price: product.price,
                stock: product.stock,
                discount: product.discount,
                Description: product.Description,
                image: product.image,
                type: product.type,
                typeRef: product.typeRef
            })
        });
    } catch (error) {
        console.error("Error fetching book:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PUT - Updated to handle both book and product updates correctly
const inputSchema = z.object({
    book: bookSchema.partial(),
    product: productSchema.omit({ refId: true, type: true, typeRef: true })
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Doar adminii pot crea produse" }, { status: 403 });
        }

        await connectToDatabase();
        const { id } = await params;

        // Validate if the ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid book ID format" }, { status: 400 });
        }

        const body = await req.json();
        console.log("PUT request body:", body);

        const parsed = inputSchema.safeParse(body);
        if (!parsed.success) {
            console.error("Validation failed:", parsed.error.flatten());
            return NextResponse.json({
                error: "Validation failed",
                details: parsed.error.flatten()
            }, { status: 400 });
        }

        const { book, product } = parsed.data;

        // Start a transaction to ensure both updates succeed or fail together
        const mongoSession = await mongoose.startSession();
        mongoSession.startTransaction();

        try {
            // Update book data
            const updatedBook = await Book.findByIdAndUpdate(
                id,
                book,
                { new: true, session: mongoSession }
            );

            if (!updatedBook) {
                await mongoSession.abortTransaction();
                return NextResponse.json({ error: "Book not found" }, { status: 404 });
            }

            // Update associated product data
            const updatedProduct = await Product.findOneAndUpdate(
                { refId: new mongoose.Types.ObjectId(id), type: "book" },
                { ...product },
                { new: true, session: mongoSession }
            );

            if (!updatedProduct) {
                await mongoSession.abortTransaction();
                return NextResponse.json({ error: "Associated product not found" }, { status: 404 });
            }

            await mongoSession.commitTransaction();

            return NextResponse.json({
                book: updatedBook,
                product: updatedProduct,
                message: "Book and product updated successfully"
            });
        } catch (transactionError) {
            await mongoSession.abortTransaction();
            throw transactionError;
        } finally {
            mongoSession.endSession();
        }
    } catch (error) {
        console.error("Error updating book:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/product/book/[id] - Kept as is, looks good
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Doar adminii pot crea produse" }, { status: 403 });
        }
        const { id } = await params;
        await connectToDatabase();

        // Validate if the ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid book ID format" }, { status: 400 });
        }

        // Use transaction for consistency
        const mongoSession = await mongoose.startSession();
        mongoSession.startTransaction();

        try {
            // Delete the associated product first
            const deletedProduct = await Product.findOneAndDelete({
                refId: new mongoose.Types.ObjectId(id),
                type: "book"
            }, { session: mongoSession });

            // Then delete the book
            const deletedBook = await Book.findByIdAndDelete(id, { session: mongoSession });

            if (!deletedBook) {
                await mongoSession.abortTransaction();
                return NextResponse.json({ error: "Book not found" }, { status: 404 });
            }

            await mongoSession.commitTransaction();

            return NextResponse.json({
                message: "Book and associated Product deleted",
                deletedProductId: deletedProduct?._id,
                deletedBookId: deletedBook._id
            });
        } catch (transactionError) {
            await mongoSession.abortTransaction();
            throw transactionError;
        } finally {
            mongoSession.endSession();
        }
    } catch (error) {
        console.error("Error deleting book:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}