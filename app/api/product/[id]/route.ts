// pages/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Book from "@/lib/models/Book";
import Stationary from "@/lib/models/Stationary";
import Flower from "@/lib/models/Flower";
import Subcategory from "@/lib/models/Subcategory";
import Review from "@/lib/models/Review";
import User from "@/lib/models/User";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectToDatabase();

        const { id } = params;

        if (!id) {
            return NextResponse.json({
                error: "Product ID is required"
            }, { status: 400 });
        }

        // Fetch the product
        const product = await Product.findById(id);

        if (!product) {
            return NextResponse.json({
                error: "Product not found"
            }, { status: 404 });
        }

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

        // Fetch product reviews manually with user details
        try {
            const productReviews = await Review.find({ product: product._id })
                .sort({ createdAt: -1 });

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
                    // Keep the original user field for backward compatibility
                    user: reviewObject.user || (userData ? `${userData.firstName} ${userData.lastName}` : 'Anonymous'),
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

        // Calculate average rating and rating distribution
        const averageRating = reviews.length > 0
            ? reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / reviews.length
            : 0;

        // Calculate rating distribution for the product detail page
        const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
            rating,
            count: reviews.filter(review => review.rating === rating).length,
            percentage: reviews.length > 0 ? (reviews.filter(review => review.rating === rating).length / reviews.length) * 100 : 0
        }));

        const productObject = product.toObject();
        const result = {
            product: {
                ...productObject,
                subcategories: subcategories,
                reviews: reviews,
                averageRating: Math.round(averageRating * 10) / 10,
                reviewCount: reviews.length,
                ratingDistribution: ratingDistribution
            },
            prodType: detailedProduct ? detailedProduct.toObject() : null
        };

        return NextResponse.json(result);

    } catch (err) {
        console.error('API Error:', err);
        return NextResponse.json({
            error: "Failed to fetch product",
            details: err instanceof Error ? err.message : 'Unknown error'
        }, { status: 500 });
    }
}


export async function PUT(_: NextRequest, { params }: { params: { id: string } }) {
    try {
        const body = await _.json();
        await connectToDatabase();
        const par = await params
        const id = par.id;
        const product = await Product.findByIdAndUpdate(id, {
            $set: {
                subcategories: body.subcategories,
            },
        }, {
            new: true
        }); // Optionally: `.populate('refId')`
        return NextResponse.json({ product });
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}