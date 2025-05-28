import Product from "@/lib/models/Product";
import Review from "@/lib/models/Review";
import connectToDatabase from "@/lib/mongodb";
import { NextResponse } from "next/server";



export async function GET(request: Request, { params }: { params: { id: string } }) {
    const prms = await params;
    const productId = prms.id;

    try {
        // Connect to database
        await connectToDatabase();

        // Find the product by ID and populate reviews
        const reviews = await Review.find({ product: productId }).populate('user', 'firstName lastName email');

        if (!reviews) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // Convert product to plain object
        const productObject = reviews;

        return NextResponse.json({
            reviews: productObject.map(review => ({
                _id: review._id,
                user: {
                    _id: review.user._id,
                    firstName: review.user.firstName,
                    lastName: review.user.lastName,
                    email: review.user.email
                },
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt,
                updatedAt: review.updatedAt
            })),
            count: (productObject || []).length
        });
    } catch (err) {
        console.error('API Error:', err);
        return NextResponse.json({
            error: "Failed to fetch product reviews",
            details: err instanceof Error ? err.message : 'Unknown error'
        }, { status: 500 });
    }
}