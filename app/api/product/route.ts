// QUICK SOLUTION: Modify route.ts to not use populate for now
// app/api/product/route.ts

import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Book from "@/lib/models/Book";
import Stationary from "@/lib/models/Stationary";
import Flower from "@/lib/models/Flower";
import Review from "@/lib/models/Review";
import Subcategory from "@/lib/models/Subcategory";
import User from "@/lib/models/User";

// În /app/api/product/route.ts - adaugă debug pentru a vedea problema cu refId

export async function GET() {
    try {
        await connectToDatabase();

        const products = await Product.find();

        console.log('=== DEBUGGING MAIN API REFID ISSUE ===');
        console.log(`Found ${products.length} products`);

        const populatedProducts = await Promise.all(products.map(async (product) => {
            let detailedProduct: any = null;
            let subcategories: any[] = [];
            let reviews: any[] = [];

            // DEBUGGING: Verifică structura product
            console.log(`\n🔍 Processing product: ${product.name}`);
            console.log(`  Product._id: ${product._id}`);
            console.log(`  Product.refId: ${product.refId}`);
            console.log(`  Product.type: ${product.type}`);
            console.log(`  Product.typeRef: ${product.typeRef}`);
            console.log(`  refId === _id?: ${product.refId?.toString() === product._id?.toString()}`);

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
                    console.log(`  🔎 Searching for Book with refId: ${product.refId}`);
                    detailedProduct = await Book.findById(product.refId);

                    if (detailedProduct) {
                        console.log(`  ✅ Found Book: ${detailedProduct.author} - "${detailedProduct.isbn}"`);
                        console.log(`     Book._id: ${detailedProduct._id}`);
                    } else {
                        console.log(`  ❌ Book NOT FOUND with refId: ${product.refId}`);

                        // DEBUGGING: Încearcă să găsești Book-ul cu product._id
                        const bookWithProductId = await Book.findById(product._id);
                        if (bookWithProductId) {
                            console.log(`  🚨 FOUND Book using Product._id instead of refId!`);
                            console.log(`     This means refId is incorrect in database`);
                            console.log(`     Book found: ${bookWithProductId.author}`);
                        }

                        // DEBUGGING: Arată ce Book-uri există
                        const allBooks = await Book.find({}).limit(3);
                        console.log(`  📚 Sample Books in database:`, allBooks.map(b => ({
                            _id: b._id,
                            author: b.author
                        })));
                    }
                } else if (product.typeRef === 'Stationary') {
                    console.log(`  🔎 Searching for Stationary with refId: ${product.refId}`);
                    detailedProduct = await Stationary.findById(product.refId);

                    if (detailedProduct) {
                        console.log(`  ✅ Found Stationary: ${detailedProduct.brand} ${detailedProduct.type}`);
                    } else {
                        console.log(`  ❌ Stationary NOT FOUND with refId: ${product.refId}`);
                    }
                } else if (product.typeRef === 'Flower') {
                    console.log(`  🔎 Searching for Flower with refId: ${product.refId}`);
                    detailedProduct = await Flower.findById(product.refId);

                    if (detailedProduct) {
                        console.log(`  ✅ Found Flower: ${detailedProduct.color}`);
                    } else {
                        console.log(`  ❌ Flower NOT FOUND with refId: ${product.refId}`);
                    }
                }
            } catch (detailError) {
                console.error(`❌ Error fetching details for product ${product._id}:`, detailError);
            }

            // Fetch product reviews manually (păstrat cum era)
            try {
                const productReviews = await Review.find({ product: product._id }).sort({ createdAt: -1 });

                const reviewsWithUsers = await Promise.all(productReviews.map(async (review) => {
                    let userData: any = null;

                    try {
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
            const result = {
                ...productObject,
                subcategories: subcategories,
                details: detailedProduct ? detailedProduct.toObject() : null,
                reviews: reviews,
                averageRating: Math.round(averageRating * 10) / 10,
                reviewCount: reviews.length
            };

            console.log(`  📦 Final product structure:`, {
                _id: result._id,
                refId: result.refId,
                hasDetails: !!result.details,
                detailsType: result.details ? 'found' : 'missing'
            });

            return result;
        }));

        console.log('=== END DEBUGGING MAIN API ===');

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

// BONUS: Adaugă și o rută de debug pentru a verifica rapid datele
export async function POST() {
    try {
        await connectToDatabase();

        // Quick data check
        const products = await Product.find({}).limit(3);
        const books = await Book.find({}).limit(3);
        const flowers = await Flower.find({}).limit(3);
        const stationaries = await Stationary.find({}).limit(3);

        console.log('=== QUICK DATA STRUCTURE CHECK ===');

        return NextResponse.json({
            message: "Debug data structure",
            sampleData: {
                products: products.map(p => ({
                    _id: p._id,
                    name: p.name,
                    refId: p.refId,
                    type: p.type,
                    typeRef: p.typeRef,
                    refIdEqualsId: p.refId?.toString() === p._id?.toString()
                })),
                books: books.map(b => ({
                    _id: b._id,
                    author: b.author,
                    isbn: b.isbn
                })),
                flowers: flowers.map(f => ({
                    _id: f._id,
                    color: f.color
                })),
                stationaries: stationaries.map(s => ({
                    _id: s._id,
                    brand: s.brand,
                    type: s.type
                }))
            }
        });
    } catch (err) {
        return NextResponse.json({
            error: "Debug failed",
            details: err instanceof Error ? err.message : 'Unknown error'
        }, { status: 500 });
    }
}