import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectMongo from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import User from '@/lib/models/User';
import Review from '@/lib/models/Review';


// POST - Create a new review
export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession();
        if (!session || !session.user) {
            return NextResponse.json(
                { message: 'Authentication required' },
                { status: 401 }
            );
        }

        await connectMongo();

        const body = await request.json();
        const { product, rating, comment } = body;

        // Validation
        if (!product || !rating || !comment) {
            return NextResponse.json(
                { message: 'Product ID, rating, and comment are required' },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { message: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }

        if (comment.trim().length < 10) {
            return NextResponse.json(
                { message: 'Comment must be at least 10 characters long' },
                { status: 400 }
            );
        }

        // Check if product exists
        const productExists = await Product.findById(product);
        if (!productExists) {
            return NextResponse.json(
                { message: 'Product not found' },
                { status: 404 }
            );
        }

        // Get user details
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        // Check if user has already reviewed this product
        const existingReview = await Review.findOne({
            userId: user._id,
            product: product
        });

        if (existingReview) {
            return NextResponse.json(
                { message: 'You have already reviewed this product' },
                { status: 409 }
            );
        }

        // Create new review
        const newReview = new Review({
            user: `${user.firstName} ${user.lastName}`,
            userEmail: user.email,
            userId: user._id,
            product: product,
            rating: rating,
            comment: comment.trim(),
        });

        await newReview.save();

        // Update product's average rating
        await updateProductRating(product);

        return NextResponse.json(
            {
                message: 'Review submitted successfully',
                review: newReview
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error creating review:', error);

        // Handle duplicate review error
        if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 11000) {
            return NextResponse.json(
                { message: 'You have already reviewed this product' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET - Get reviews for a product
export async function GET(request: NextRequest) {
    try {
        await connectMongo();

        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('product');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        if (!productId) {
            return NextResponse.json(
                { message: 'Product ID is required' },
                { status: 400 }
            );
        }

        const skip = (page - 1) * limit;

        const reviews = await Review.find({ product: productId })
            .populate('userId', 'firstName lastName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalReviews = await Review.countDocuments({ product: productId });
        const totalPages = Math.ceil(totalReviews / limit);

        // Calculate rating distribution
        const ratingDistribution = await Review.aggregate([
            { $match: { product: productId } },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: -1 } }
        ]);

        const avgRating = await Review.aggregate([
            { $match: { product: productId } },
            { $group: { _id: null, average: { $avg: '$rating' } } }
        ]);

        return NextResponse.json({
            reviews,
            pagination: {
                currentPage: page,
                totalPages,
                totalReviews,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            stats: {
                averageRating: avgRating[0]?.average || 0,
                ratingDistribution
            }
        });

    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Helper function to update product rating
async function updateProductRating(productId: string) {
    try {
        const reviews = await Review.find({ product: productId });

        if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRating / reviews.length;

            await Product.findByIdAndUpdate(productId, {
                averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
                reviewCount: reviews.length
            });
        }
    } catch (error) {
        console.error('Error updating product rating:', error);
    }
}