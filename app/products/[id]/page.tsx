'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Star, Calendar, Package, Palette, Book, Ruler, Heart, Info, ShoppingCart, ArrowLeft, Clock, Truck, Shield, Award } from 'lucide-react';

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
    reviews: { rating: number, comment: string, user: string, createdAt: string }[];
    averageRating: number;
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

export default function ProductDetailPage() {
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('details');

    useEffect(() => {
        async function fetchProduct() {
            if (!id) {
                setError('No product ID provided');
                return;
            }

            try {
                const res = await fetch(`/api/product/${id}`);
                if (!res.ok) {
                    setError('Product not found');
                    return;
                }
                const data = await res.json();
                setProduct({ ...data.product, details: data.prodType });
            } catch (error) {
                console.error('Error fetching product:', error);
                setError('Failed to load product');
            }
        }

        fetchProduct();
    }, [id]);

    const renderStars = (rating: number) => {
        return [1, 2, 3, 4, 5].map((i) => (
            <Star
                key={i}
                fill={i <= Math.round(rating) ? "#fbbf24" : "transparent"}
                stroke={i <= Math.round(rating) ? "#fbbf24" : "#d1d5db"}
                size={18}
            />
        ));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const renderProductDetails = () => {
        if (!product?.details) return null;

        switch (product.typeRef) {
            case 'Book':
                const bookDetails = product.details as BookDetails;
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                                <Book className="text-[#9c6b63] shrink-0" size={20} />
                                <div>
                                    <p className="text-sm text-gray-600">Author</p>
                                    <p className="font-medium text-gray-900">{bookDetails.author}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                                <Info className="text-[#9c6b63] shrink-0" size={20} />
                                <div>
                                    <p className="text-sm text-gray-600">Genre</p>
                                    <p className="font-medium text-gray-900">{bookDetails.genre}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                                <Package className="text-[#9c6b63] shrink-0" size={20} />
                                <div>
                                    <p className="text-sm text-gray-600">Pages</p>
                                    <p className="font-medium text-gray-900">{bookDetails.pages}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                                <Award className="text-[#9c6b63] shrink-0" size={20} />
                                <div>
                                    <p className="text-sm text-gray-600">Publisher</p>
                                    <p className="font-medium text-gray-900">{bookDetails.publisher}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                                <Info className="text-[#9c6b63] shrink-0" size={20} />
                                <div>
                                    <p className="text-sm text-gray-600">ISBN</p>
                                    <p className="font-medium text-gray-900">{bookDetails.isbn}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                                <Calendar className="text-[#9c6b63] shrink-0" size={20} />
                                <div>
                                    <p className="text-sm text-gray-600">Publication Date</p>
                                    <p className="font-medium text-gray-900">
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
                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                                <Palette className="text-[#9c6b63] shrink-0" size={20} />
                                <div>
                                    <p className="text-sm text-gray-600">Color</p>
                                    <p className="font-medium text-gray-900">{flowerDetails.color}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                                <Heart className="text-[#9c6b63] shrink-0" size={20} />
                                <div>
                                    <p className="text-sm text-gray-600">Freshness</p>
                                    <p className="font-medium text-gray-900">{flowerDetails.freshness}/10</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                                <Clock className="text-[#9c6b63] shrink-0" size={20} />
                                <div>
                                    <p className="text-sm text-gray-600">Lifespan</p>
                                    <p className="font-medium text-gray-900">{flowerDetails.lifespan} days</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                                <Calendar className="text-[#9c6b63] shrink-0" size={20} />
                                <div>
                                    <p className="text-sm text-gray-600">Season</p>
                                    <p className="font-medium text-gray-900">{flowerDetails.season}</p>
                                </div>
                            </div>
                        </div>
                        {flowerDetails.careInstructions && (
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <h4 className="font-medium text-green-800 mb-2">Care Instructions</h4>
                                <p className="text-green-700 text-sm">{flowerDetails.careInstructions}</p>
                            </div>
                        )}
                        {flowerDetails.expiryDate && (
                            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                                <p className="text-amber-800 text-sm">
                                    <strong>Best before:</strong> {formatDate(flowerDetails.expiryDate.toString())}
                                </p>
                            </div>
                        )}
                    </div>
                );

            case 'Stationary':
                const stationaryDetails = product.details as StationaryDetails;
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                                <Award className="text-[#9c6b63] shrink-0" size={20} />
                                <div>
                                    <p className="text-sm text-gray-600">Brand</p>
                                    <p className="font-medium text-gray-900">{stationaryDetails.brand}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                                <Info className="text-[#9c6b63] shrink-0" size={20} />
                                <div>
                                    <p className="text-sm text-gray-600">Type</p>
                                    <p className="font-medium text-gray-900">{stationaryDetails.type}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                                <Package className="text-[#9c6b63] shrink-0" size={20} />
                                <div>
                                    <p className="text-sm text-gray-600">Material</p>
                                    <p className="font-medium text-gray-900">{stationaryDetails.material}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                                <Palette className="text-[#9c6b63] shrink-0" size={20} />
                                <div>
                                    <p className="text-sm text-gray-600">Available Colors</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {stationaryDetails.color?.map((color, index) => (
                                            <span key={index} className="px-2 py-1 bg-gray-100 rounded text-xs">
                                                {color}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {stationaryDetails.dimensions && (
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
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
    };

    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
    if (!product) return <div className="text-center py-20">Loading...</div>;

    const discountedPrice = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price;
    const description = product.description || product.Description;

    return (
        <div className="min-h-screen bg-[#fdf8f6]">
            <Header />
            <main className="py-24 px-4 md:px-6 max-w-6xl mx-auto">
                {/* Breadcrumb Navigation */}
                <div className="mb-6">
                    <a href="/products" className="inline-flex items-center gap-2 text-[#9c6b63] hover:text-[#875a53] transition-colors">
                        <ArrowLeft size={16} />
                        <span className="text-sm">Back to products</span>
                    </a>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Image */}
                    <div className="space-y-4">
                        <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg bg-white">
                            <Image src={product.image} alt={product.name} fill className="object-cover" />
                            {product.discount > 0 && (
                                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                    -{product.discount}%
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Information */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-[#9c6b63] mb-2">{product.name}</h1>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        {renderStars(product.averageRating || 0)}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        ({product.reviews?.length || 0} reviews)
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-3">
                            <span className="text-3xl font-bold text-[#9c6b63]">
                                €{discountedPrice.toFixed(2)}
                            </span>
                            {product.discount > 0 && (
                                <span className="text-xl text-gray-500 line-through">
                                    €{product.price.toFixed(2)}
                                </span>
                            )}
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center gap-2">
                            <Package size={16} className={product.stock > 0 ? "text-green-600" : "text-red-600"} />
                            <span className={`text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                            </span>
                        </div>

                        {/* Description */}
                        {description && (
                            <div className="p-4 bg-white rounded-lg border">
                                <p className="text-gray-700 leading-relaxed">{description}</p>
                            </div>
                        )}

                        {/* Quantity Selector and Add to Cart */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                                <div className="flex items-center border rounded-lg">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="px-3 py-2 hover:bg-gray-100 transition-colors"
                                    >
                                        -
                                    </button>
                                    <span className="px-4 py-2 border-x">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        className="px-3 py-2 hover:bg-gray-100 transition-colors"
                                        disabled={quantity >= product.stock}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <button
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#9c6b63] hover:bg-[#875a53] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={product.stock === 0}
                            >
                                <ShoppingCart size={20} />
                                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                        </div>

                        {/* Additional Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Truck size={16} />
                                <span>Free shipping</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Shield size={16} />
                                <span>Secure payment</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock size={16} />
                                <span>Fast delivery</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="mt-16">
                    <div className="border-b border-gray-200">
                        <nav className="flex gap-8">
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'details'
                                        ? 'border-[#9c6b63] text-[#9c6b63]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Product Details
                            </button>
                            <button
                                onClick={() => setActiveTab('reviews')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'reviews'
                                        ? 'border-[#9c6b63] text-[#9c6b63]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Reviews ({product.reviews?.length || 0})
                            </button>
                        </nav>
                    </div>

                    <div className="py-6">
                        {activeTab === 'details' && (
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Specifications</h3>
                                {renderProductDetails()}
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer Reviews</h3>
                                {product.reviews && product.reviews.length > 0 ? (
                                    <div className="space-y-4">
                                        {product.reviews.map((review, index) => (
                                            <div key={index} className="p-4 bg-white rounded-lg border">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium text-gray-900">{review.user}</span>
                                                            <div className="flex gap-1">
                                                                {renderStars(review.rating)}
                                                            </div>
                                                        </div>
                                                        {review.createdAt && (
                                                            <span className="text-sm text-gray-500">
                                                                {formatDate(review.createdAt)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-gray-700">{review.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}