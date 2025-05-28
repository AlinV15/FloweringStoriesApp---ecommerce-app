import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Book from "@/lib/models/Book";
import Stationary from "@/lib/models/Stationary";
import Flower from "@/lib/models/Flower";
import Review from "@/lib/models/Review";

export async function GET() {
    try {
        // Connect to the database
        await connectToDatabase();

        // Fetch all products and populate subcategories
        const products = await Product.find().populate('subcategories');

        // Fetch detailed product information and reviews concurrently for better performance
        const populatedProducts = await Promise.all(products.map(async (product) => {
            let detailedProduct = null;

            // Fetch product details based on type
            try {
                if (product.typeRef === 'Book') {
                    detailedProduct = await Book.findById(product.refId);
                } else if (product.typeRef === 'Stationary') {
                    detailedProduct = await Stationary.findById(product.refId);
                } else if (product.typeRef === 'Flower') {
                    detailedProduct = await Flower.findById(product.refId);
                }
            } catch (detailError) {
                console.error(`Error fetching details for product ${product._id}:`, detailError);
            }

            // Fetch product reviews concurrently
            const reviews = await Review.find({ product: product._id })
                .populate('user', 'firstName lastName email'); // Only fetch necessary fields for users

            // Merge product details and reviews
            const productObject = product.toObject();
            return {
                ...productObject,
                details: detailedProduct ? detailedProduct.toObject() : null,
                reviews: reviews,
                averageRating: reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / (reviews.length || 1) // Calculate average rating
            };
        }));

        // Return the products with detailed information and reviews
        return NextResponse.json({
            products: populatedProducts,
            count: populatedProducts.length
        });
    } catch (err) {
        console.error('API Error:', err);
        return NextResponse.json({
            error: "Failed to fetch products",
            details: err instanceof Error ? err.message : 'Unknown error'
        }, { status: 500 });
    }
}
