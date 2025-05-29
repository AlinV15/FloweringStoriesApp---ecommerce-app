// QUICK SOLUTION: Modify route.ts to not use populate for now
// app/api/product/route.ts

import { NextResponse } from "next/server";
import mongoose from 'mongoose';
import connectToDatabase from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Book from "@/lib/models/Book";
import Stationary from "@/lib/models/Stationary";
import Flower from "@/lib/models/Flower";
import Review from "@/lib/models/Review";
import Subcategory from "@/lib/models/Subcategory";
import User from "@/lib/models/User";

export async function GET() {
    try {
        await connectToDatabase();

        //console.log('Registered models:', mongoose.modelNames());

        // TEMPORARY SOLUTION: Fetch without populate
        const products = await Product.find();

        const populatedProducts = await Promise.all(products.map(async (product) => {
            let detailedProduct = null;
            let subcategories = [];
            let reviews = [];

            // Fetch subcategories manually
            if (product.subcategories && product.subcategories.length > 0) {
                try {
                    subcategories = await Subcategory.find({
                        '_id': { $in: product.subcategories }
                    });
                } catch (subError) {
                    console.error(`Error fetching subcategories for product ${product._id}:`, subError);
                }
            }

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

            // Fetch product reviews manually (same strategy as subcategories)
            try {
                const productReviews = await Review.find({ product: product._id }).sort({ createdAt: -1 });

                // Fetch user details for each review manually
                const reviewsWithUsers = await Promise.all(productReviews.map(async (review) => {
                    let userData = null;

                    try {
                        // Fetch user data manually using userId
                        if (review.userId) {
                            userData = await User.findById(review.userId).select('firstName lastName email');
                        }
                    } catch (userError) {
                        console.error(`Error fetching user for review ${review._id}:`, userError);
                    }

                    const reviewObject = review.toObject();
                    return {
                        ...reviewObject,
                        userDetails: userData ? {
                            firstName: userData.firstName,
                            lastName: userData.lastName,
                            email: userData.email,
                            fullName: `${userData.firstName} ${userData.lastName}`
                        } : null
                    };
                }));

                reviews = reviewsWithUsers;
            } catch (reviewError) {
                console.error(`Error fetching reviews for product ${product._id}:`, reviewError);
            }

            // Calculate average rating
            const averageRating = reviews.length > 0
                ? reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / reviews.length
                : 0;

            const productObject = product.toObject();
            return {
                ...productObject,
                subcategories: subcategories, // Add subcategories manually
                details: detailedProduct ? detailedProduct.toObject() : null,
                reviews: reviews, // Add reviews with user details manually
                averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
                reviewCount: reviews.length
            };
        }));

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
// Pentru debugging, poți adăuga și această rută POST temporară
export async function POST() {
    try {
        await connectToDatabase();

        // Verifică ce modele sunt înregistrate
        const registeredModels = mongoose.modelNames();

        return NextResponse.json({
            message: "Debug info",
            registeredModels: registeredModels,
            hasSubcategory: registeredModels.includes('Subcategory')
        });
    } catch (err) {
        return NextResponse.json({
            error: "Debug failed",
            details: err instanceof Error ? err.message : 'Unknown error'
        }, { status: 500 });
    }
}