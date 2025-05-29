import Image from 'next/image';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import ProductTabs from '@/app/components/ProductTabs';
import { Star, Calendar, Package, Palette, Book, Ruler, Heart, Info, ShoppingCart, ArrowLeft, Clock, Truck, Shield, Award, User, MessageCircle, ThumbsUp } from 'lucide-react';
import AddToCartSection from '@/app/components/AddToCartSection'; // sau calea corectă

interface Product {
    _id: string;
    name: string;
    price: number;
    image: string;
    description?: string;
    Description?: string;
    type: "book" | "stationary" | "flower";
    stock: number;
    discount: number;
    typeRef: string;
    details: any;
    reviews: Review[];
    averageRating: number;
    createdAt: string;
    updatedAt: string;
}

interface Review {
    _id: string;
    user: string;
    product: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
}

interface BookDetails {
    author: string;
    pages: number;
    isbn: string;
    publisher: string;
    genre: string;
    language: string;
    publicationDate: Date;
}

interface FlowerDetails {
    color: string;
    freshness: number;
    lifespan: number;
    season: string;
    careInstructions: string;
    expiryDate: Date;
}

interface StationaryDetails {
    brand: string;
    color: string[];
    type: string;
    dimensions: {
        height: number;
        width: number;
        depth: number;
    };
    material: string;
}

// Server-side data fetching
async function getProduct(id: string): Promise<Product | null> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/product/${id}`, {
            cache: 'no-store'
        });
        if (!res.ok) return null;
        const data = await res.json();
        return { ...data.product, details: data.prodType };
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

async function getSimilarProducts(type: string, currentId: string): Promise<Product[]> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/product?type=${type}&limit=4`, {
            cache: 'no-store'
        });
        if (!res.ok) return [];
        const data = await res.json();
        return (data.products || []).filter((p: Product) => p._id !== currentId).slice(0, 4);
    } catch (error) {
        console.error('Error fetching similar products:', error);
        return [];
    }
}

// Components
function StarRating({ rating, size = 18 }: { rating: number; size?: number }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    fill={i <= Math.round(rating) ? "#fbbf24" : "transparent"}
                    stroke={i <= Math.round(rating) ? "#fbbf24" : "#d1d5db"}
                    size={size}
                />
            ))}
        </div>
    );
}

function ProductDetails({ product }: { product: Product }) {
    if (!product?.details) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    switch (product.typeRef) {
        case 'Book':
            const bookDetails = product.details as BookDetails;
            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-[#c1a5a2]/20 shadow-lg">
                            <Book className="text-[#9a6a63] shrink-0" size={20} />
                            <div>
                                <p className="text-sm text-[#9a6a63]/70">Author</p>
                                <p className="font-medium text-[#9a6a63]">{bookDetails.author}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-[#c1a5a2]/20 shadow-lg">
                            <Info className="text-[#9a6a63] shrink-0" size={20} />
                            <div>
                                <p className="text-sm text-[#9a6a63]/70">Genre</p>
                                <p className="font-medium text-[#9a6a63]">{bookDetails.genre}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-[#c1a5a2]/20 shadow-lg">
                            <Package className="text-[#9a6a63] shrink-0" size={20} />
                            <div>
                                <p className="text-sm text-[#9a6a63]/70">Pages</p>
                                <p className="font-medium text-[#9a6a63]">{bookDetails.pages}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-[#c1a5a2]/20 shadow-lg">
                            <Award className="text-[#9a6a63] shrink-0" size={20} />
                            <div>
                                <p className="text-sm text-[#9a6a63]/70">Publisher</p>
                                <p className="font-medium text-[#9a6a63]">{bookDetails.publisher}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-[#c1a5a2]/20 shadow-lg">
                            <Info className="text-[#9a6a63] shrink-0" size={20} />
                            <div>
                                <p className="text-sm text-[#9a6a63]/70">ISBN</p>
                                <p className="font-medium text-[#9a6a63]">{bookDetails.isbn}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-[#c1a5a2]/20 shadow-lg">
                            <Calendar className="text-[#9a6a63] shrink-0" size={20} />
                            <div>
                                <p className="text-sm text-[#9a6a63]/70">Publication Date</p>
                                <p className="font-medium text-[#9a6a63]">
                                    {formatDate(bookDetails.publicationDate.toString())}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 'Flower':
            const flowerDetails = product.details as FlowerDetails;
            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-[#c1a5a2]/20 shadow-lg">
                            <Palette className="text-[#9a6a63] shrink-0" size={20} />
                            <div>
                                <p className="text-sm text-[#9a6a63]/70">Color</p>
                                <p className="font-medium text-[#9a6a63]">{flowerDetails.color}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-[#c1a5a2]/20 shadow-lg">
                            <Heart className="text-[#9a6a63] shrink-0" size={20} />
                            <div>
                                <p className="text-sm text-[#9a6a63]/70">Freshness</p>
                                <p className="font-medium text-[#9a6a63]">{flowerDetails.freshness}%</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-[#c1a5a2]/20 shadow-lg">
                            <Clock className="text-[#9a6a63] shrink-0" size={20} />
                            <div>
                                <p className="text-sm text-[#9a6a63]/70">Lifespan</p>
                                <p className="font-medium text-[#9a6a63]">{flowerDetails.lifespan} days</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-[#c1a5a2]/20 shadow-lg">
                            <Calendar className="text-[#9a6a63] shrink-0" size={20} />
                            <div>
                                <p className="text-sm text-[#9a6a63]/70">Season</p>
                                <p className="font-medium text-[#9a6a63]">{flowerDetails.season}</p>
                            </div>
                        </div>
                    </div>
                    {flowerDetails.careInstructions && (
                        <div className="p-4 bg-green-50/80 backdrop-blur-sm rounded-xl border border-green-200/50 shadow-lg">
                            <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                                <Heart className="text-green-600" size={16} />
                                Care Instructions
                            </h4>
                            <p className="text-green-700 text-sm">{flowerDetails.careInstructions}</p>
                        </div>
                    )}
                </div>
            );

        case 'Stationary':
            const stationaryDetails = product.details as StationaryDetails;
            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-[#c1a5a2]/20 shadow-lg">
                            <Award className="text-[#9a6a63] shrink-0" size={20} />
                            <div>
                                <p className="text-sm text-[#9a6a63]/70">Brand</p>
                                <p className="font-medium text-[#9a6a63]">{stationaryDetails.brand}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-[#c1a5a2]/20 shadow-lg">
                            <Info className="text-[#9a6a63] shrink-0" size={20} />
                            <div>
                                <p className="text-sm text-[#9a6a63]/70">Type</p>
                                <p className="font-medium text-[#9a6a63]">{stationaryDetails.type}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-[#c1a5a2]/20 shadow-lg">
                            <Package className="text-[#9a6a63] shrink-0" size={20} />
                            <div>
                                <p className="text-sm text-[#9a6a63]/70">Material</p>
                                <p className="font-medium text-[#9a6a63]">{stationaryDetails.material}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-[#c1a5a2]/20 shadow-lg">
                            <Palette className="text-[#9a6a63] shrink-0" size={20} />
                            <div>
                                <p className="text-sm text-[#9a6a63]/70">Available Colors</p>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                    {stationaryDetails.color?.map((color, index) => (
                                        <span key={index} className="px-2 py-1 bg-[#9a6a63]/10 text-[#9a6a63] rounded-lg text-xs font-medium">
                                            {color}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    {stationaryDetails.dimensions && (
                        <div className="p-4 bg-blue-50/80 backdrop-blur-sm rounded-xl border border-blue-200/50 shadow-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Ruler className="text-blue-600" size={16} />
                                <h4 className="font-medium text-blue-800">Dimensions</h4>
                            </div>
                            <p className="text-blue-700 text-sm">
                                {stationaryDetails.dimensions.height}H × {stationaryDetails.dimensions.width}W × {stationaryDetails.dimensions.depth}D cm
                            </p>
                        </div>
                    )}
                </div>
            );

        default:
            return null;
    }
}

function ReviewSection({ reviews }: { reviews: Review[] }) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!reviews || reviews.length === 0) {
        return (
            <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-[#9a6a63]/60" />
                <h3 className="text-xl font-semibold text-[#9a6a63] mb-2">No reviews yet</h3>
                <p className="text-[#9a6a63]/70">Be the first to review this product!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Reviews Stats */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-[#9a6a63] flex items-center gap-2">
                        <MessageCircle className="text-[#9a6a63]" size={24} />
                        Customer Reviews
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-[#9a6a63]/70">
                        <span>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                {/* Average Rating */}
                <div className="flex items-center gap-4 mb-6 p-4 bg-[#9a6a63]/5 rounded-xl">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-[#9a6a63] mb-1">
                            {(reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)}
                        </div>
                        <StarRating rating={reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length} size={20} />
                        <div className="text-sm text-[#9a6a63]/70 mt-1">Average Rating</div>
                    </div>
                    <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map(star => {
                            const count = reviews.filter(r => r.rating === star).length;
                            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                            return (
                                <div key={star} className="flex items-center gap-2 text-sm">
                                    <span className="w-3 text-[#9a6a63]/70">{star}</span>
                                    <Star size={12} className="text-yellow-400" fill="currentColor" />
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="w-8 text-[#9a6a63]/70 text-xs">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-4">
                {reviews.map((review, index) => (
                    <div key={review._id || index} className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#9a6a63] to-[#c1a5a2] rounded-full flex items-center justify-center text-white font-semibold">
                                    {review.user?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-[#9a6a63]">{review.user || 'Anonymous'}</span>
                                        <StarRating rating={review.rating} size={16} />
                                    </div>
                                    <span className="text-sm text-[#9a6a63]/70">
                                        {formatDate(review.createdAt || review.updatedAt)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <ThumbsUp size={16} className="text-[#9a6a63]/60 hover:text-[#9a6a63] cursor-pointer transition-colors" />
                                <span className="text-sm text-[#9a6a63]/70">Helpful</span>
                            </div>
                        </div>
                        <p className="text-[#9a6a63]/80 leading-relaxed">{review.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SimilarProducts({ products }: { products: Product[] }) {
    if (!products || products.length === 0) return null;

    return (
        <div className="mt-16">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-[#9a6a63] mb-4">You Might Also Like</h2>
                <p className="text-[#9a6a63]/70 text-lg">Discover similar products in our collection</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <Link key={product._id} href={`/products/${product._id}`}>
                        <div className="group bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
                            <div className="relative aspect-square overflow-hidden">
                                <Image
                                    src={product.image || '/api/placeholder/300/300'}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                {product.discount > 0 && (
                                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                        -{product.discount}%
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-[#9a6a63] mb-2 line-clamp-2 group-hover:text-[#9a6a63]/80 transition">
                                    {product.name}
                                </h3>
                                <div className="flex items-center gap-2 mb-2">
                                    <StarRating rating={product.averageRating || 0} size={14} />
                                    <span className="text-xs text-[#9a6a63]/70">
                                        ({product.reviews?.length || 0})
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-[#9a6a63]">
                                        €{product.discount > 0
                                            ? (product.price * (1 - product.discount / 100)).toFixed(2)
                                            : product.price.toFixed(2)
                                        }
                                    </span>
                                    {product.discount > 0 && (
                                        <span className="text-sm text-gray-400 line-through">
                                            €{product.price.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

// Main Server Component
export default async function ProductDetailPage({ params }: { params: { id: string } }) {
    const paramss = await params;
    const product = await getProduct(paramss.id);

    if (!product) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f6eeec] via-[#fefdfc] to-[#f2ded9]">
                <Header />
                <main className="py-24 px-4 md:px-6 max-w-6xl mx-auto">
                    <div className="text-center py-20">
                        <Package className="w-20 h-20 mx-auto mb-6 text-[#9a6a63]/60" />
                        <h1 className="text-3xl font-bold text-[#9a6a63] mb-4">Product Not Found</h1>
                        <p className="text-[#9a6a63]/70 mb-8">The product you're looking for doesn't exist or has been removed.</p>
                        <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}>
                            <ArrowLeft size={16} />
                            Back to Products
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const similarProducts = await getSimilarProducts(product.type, product._id);
    const discountedPrice = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price;
    const description = product.description || product.Description;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f6eeec] via-[#fefdfc] to-[#f2ded9]">
            <Header />
            <main className="py-24 px-4 md:px-6 max-w-6xl mx-auto">
                {/* Breadcrumb Navigation */}
                <div className="mb-6">
                    <Link href="/products" className="inline-flex items-center gap-2 text-[#9a6a63] hover:text-[#9a6a63]/80 transition-colors">
                        <ArrowLeft size={16} />
                        <span className="text-sm">Back to products</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Image */}
                    <div className="space-y-4">
                        <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl bg-white/90 backdrop-blur-sm border border-[#c1a5a2]/20">
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                                priority
                            />
                            {product.discount > 0 && (
                                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                                    -{product.discount}%
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Information */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-4xl font-bold text-[#9a6a63] mb-4">{product.name}</h1>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <StarRating rating={product.averageRating || 0} size={20} />
                                    <span className="text-[#9a6a63]/70">
                                        ({product.reviews?.length || 0} reviews)
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-3">
                            <span className="text-4xl font-bold text-[#9a6a63]">
                                €{discountedPrice.toFixed(2)}
                            </span>
                            {product.discount > 0 && (
                                <span className="text-xl text-gray-500 line-through">
                                    €{product.price.toFixed(2)}
                                </span>
                            )}
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center gap-2 p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-[#c1a5a2]/20 shadow-lg">
                            <Package size={20} className={product.stock > 0 ? "text-green-600" : "text-red-600"} />
                            <span className={`font-medium ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                            </span>
                        </div>

                        {/* Description */}
                        {description && (
                            <div className="p-6 bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl">
                                <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                    <Info size={18} />
                                    Description
                                </h3>
                                <p className="text-[#9a6a63]/80 leading-relaxed">{description}</p>
                            </div>
                        )}

                        {/* Add to Cart Section */}
                        <AddToCartSection product={product} />

                        {/* Additional Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#c1a5a2]/20">
                            <div className="flex items-center gap-3 text-sm text-[#9a6a63]/70">
                                <div className="p-2 bg-[#9a6a63]/10 rounded-lg">
                                    <Truck size={16} className="text-[#9a6a63]" />
                                </div>
                                <span>Free shipping</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-[#9a6a63]/70">
                                <div className="p-2 bg-[#9a6a63]/10 rounded-lg">
                                    <Shield size={16} className="text-[#9a6a63]" />
                                </div>
                                <span>Secure payment</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-[#9a6a63]/70">
                                <div className="p-2 bg-[#9a6a63]/10 rounded-lg">
                                    <Clock size={16} className="text-[#9a6a63]" />
                                </div>
                                <span>Fast delivery</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Tabs with Interactive Features */}
                <ProductTabs
                    product={product}
                    productDetails={<ProductDetails product={product} />}
                    reviewSection={<ReviewSection reviews={product.reviews || []} />}
                />

                {/* Similar Products Section */}
                <SimilarProducts products={similarProducts} />
            </main>
            <Footer />
        </div>
    );
}