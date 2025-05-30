// app/components/ProductCard.tsx - Unified card with type-specific details
'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
    Star, ShoppingCart, Book, Pencil, Flower, User, Calendar,
    Bookmark, Globe, Hash, Building, Droplets, Clock, Sun,
    Ruler, Package, Palette
} from 'lucide-react';
import { useCartStore } from '@/app/stores/CartStore';
import { ProductEntry } from '@/app/types';

interface ProductCardProps {
    product: ProductEntry;
    showDetailedInfo?: boolean;
    className?: string;
    asLink?: boolean;
}

const StarRating = ({ rating }: { rating: number }) => {
    const stars = [];
    const fullStars = Math.floor(rating);

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars.push(
                <Star key={i} className="text-yellow-400" fill="currentColor" size={14} />
            );
        } else {
            stars.push(
                <Star key={i} className="text-gray-300" size={14} />
            );
        }
    }

    return <div className="flex gap-1">{stars}</div>;
};

// Flower-specific components
const ExpiryStatus = ({ expiryDate }: { expiryDate: Date }) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
        return <span className="text-red-500 text-xs font-medium">Expired</span>;
    } else if (daysLeft <= 3) {
        return <span className="text-orange-500 text-xs font-medium">Expires in {daysLeft}d</span>;
    } else if (daysLeft <= 7) {
        return <span className="text-yellow-500 text-xs font-medium">Expires in {daysLeft}d</span>;
    } else {
        return <span className="text-green-500 text-xs font-medium">Fresh ({daysLeft}d left)</span>;
    }
};

export default function ProductCard({
    product,
    showDetailedInfo = false,
    className = "",
    asLink = false
}: ProductCardProps) {
    const [imageError, setImageError] = useState(false);
    const addItem = useCartStore(state => state.addItem);

    const handleAddToCart = (e: React.MouseEvent) => {
        if (asLink) {
            e.preventDefault();
            e.stopPropagation();
        }

        addItem({
            id: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            type: product.type,
            stock: product.stock,
            discount: product.discount,
            maxStock: product.stock
        });

        // Show toast notification
        const toast = document.createElement('div');
        toast.className = 'fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        toast.textContent = `${product.name} added to cart!`;
        document.body.appendChild(toast);
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 3000);
    };

    const finalPrice = product.discount > 0
        ? product.price * (1 - product.discount / 100)
        : product.price;

    // Calculate average rating
    const averageRating = product.reviews?.length ?
        product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length : 0;

    // Get type icon and colors
    const getTypeInfo = () => {
        switch (product.typeRef) {
            case 'Book':
                return {
                    icon: <Book size={16} className="text-sky-900 bg-blue-300 h-7 w-7 p-1 rounded-xl" />,
                    colors: { primary: '#9a6a63', secondary: '#c1a5a2' }
                };
            case 'Stationary':
                return {
                    icon: <Pencil size={16} className="text-green-900 bg-emerald-300 h-7 w-7 p-1 rounded-xl" />,
                    colors: { primary: '#9a6a63', secondary: '#c1a5a2' }
                };
            case 'Flower':
                return {
                    icon: <Flower size={16} className="text-pink-900 bg-red-300 h-7 w-7 p-1 rounded-xl" />,
                    colors: { primary: '#9c6b63', secondary: '#e5d4ce' }
                };
            default:
                return {
                    icon: <Book size={16} className="text-gray-500" />,
                    colors: { primary: '#9a6a63', secondary: '#c1a5a2' }
                };
        }
    };

    // Get genre/type color for badges
    const getGenreColor = (genre: string) => {
        const colors: { [key: string]: string } = {
            'Fiction': 'bg-blue-100 text-blue-800',
            'Non-Fiction': 'bg-green-100 text-green-800',
            'Romance': 'bg-pink-100 text-pink-800',
            'Mystery': 'bg-purple-100 text-purple-800',
            'Sci-Fi': 'bg-indigo-100 text-indigo-800',
            'Fantasy': 'bg-violet-100 text-violet-800',
            'Biography': 'bg-orange-100 text-orange-800',
            'History': 'bg-amber-100 text-amber-800',
            'Children': 'bg-teal-100 text-teal-800'
        };
        return colors[genre] || 'bg-gray-100 text-gray-800';
    };

    // Format date
    const formatDate = (date: Date) => {
        return new Date(date).getFullYear();
    };

    // Get product specific details
    const getProductDetails = () => {
        if (!product.details) return null;

        switch (product.typeRef) {
            case 'Book':
                const bookDetails = product.details as any;
                return (
                    <>
                        {/* Author */}
                        {bookDetails.author && (
                            <div className="flex items-center gap-2 mb-2">
                                <User size={14} className="text-[#9a6a63]" />
                                <p className="text-sm text-[#9a6a63]/80 font-medium">
                                    by {bookDetails.author}
                                </p>
                            </div>
                        )}

                        {/* Book Specific Details */}
                        <div className="space-y-1 mb-3 text-xs text-gray-600">
                            {/* Publisher & Publication Date */}
                            <div className="flex items-center justify-between">
                                {bookDetails.publisher && (
                                    <div className="flex items-center gap-1">
                                        <Building size={12} />
                                        <span>{bookDetails.publisher}</span>
                                    </div>
                                )}
                                {bookDetails.publicationDate && (
                                    <div className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        <span>{formatDate(bookDetails.publicationDate)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Pages & Language */}
                            <div className="flex items-center justify-between">
                                {bookDetails.pages && (
                                    <div className="flex items-center gap-1">
                                        <Bookmark size={12} />
                                        <span>{bookDetails.pages} pages</span>
                                    </div>
                                )}
                                {bookDetails.language && (
                                    <div className="flex items-center gap-1">
                                        <Globe size={12} />
                                        <span>{bookDetails.language}</span>
                                    </div>
                                )}
                            </div>

                            {/* ISBN */}
                            {bookDetails.isbn && showDetailedInfo && (
                                <div className="flex items-center gap-1">
                                    <Hash size={12} />
                                    <span className="font-mono text-xs">{bookDetails.isbn}</span>
                                </div>
                            )}
                        </div>
                    </>
                );

            case 'Stationary':
                const stationaryDetails = product.details as any;
                return (
                    <>
                        {/* Brand */}
                        {stationaryDetails.brand && (
                            <div className="flex items-center gap-2 mb-2">
                                <Building size={14} className="text-[#9a6a63]" />
                                <p className="text-sm text-[#9a6a63]/80 font-medium">
                                    {stationaryDetails.brand}
                                </p>
                            </div>
                        )}

                        {/* Stationary Specific Details */}
                        <div className="space-y-1 mb-3 text-xs text-gray-600">
                            {/* Type & Material */}
                            <div className="flex items-center justify-between">
                                {stationaryDetails.type && (
                                    <div className="flex items-center gap-1">
                                        <Package size={12} />
                                        <span>{stationaryDetails.type}</span>
                                    </div>
                                )}
                                {stationaryDetails.material && (
                                    <div className="flex items-center gap-1">
                                        <Ruler size={12} />
                                        <span>{stationaryDetails.material}</span>
                                    </div>
                                )}
                            </div>

                            {/* Colors */}
                            {stationaryDetails.color && stationaryDetails.color.length > 0 && (
                                <div className="flex items-center gap-1">
                                    <Palette size={12} />
                                    <span>{stationaryDetails.color.join(', ')}</span>
                                </div>
                            )}

                            {/* Dimensions */}
                            {stationaryDetails.dimensions && showDetailedInfo && (
                                <div className="flex items-center gap-1">
                                    <Ruler size={12} />
                                    <span>
                                        {stationaryDetails.dimensions.height}×{stationaryDetails.dimensions.width}×{stationaryDetails.dimensions.depth}cm
                                    </span>
                                </div>
                            )}
                        </div>
                    </>
                );

            case 'Flower':
                const flowerDetails = product.details as any;
                return (
                    <>
                        {/* Color and Season */}
                        <div className="text-sm text-[#9c6b63]/80 mb-2 flex items-center gap-1">
                            <div
                                className="w-3 h-3 rounded-full border border-white shadow-sm"
                                style={{ backgroundColor: flowerDetails.color?.toLowerCase() }}
                            ></div>
                            {flowerDetails.color} • {flowerDetails.season}
                        </div>

                        {/* Freshness and Lifespan */}
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                            {flowerDetails.freshness && (
                                <span className="px-2 py-1 rounded-full text-white flex items-center gap-1" style={{ backgroundColor: '#9c6b63' }}>
                                    <Droplets size={12} />
                                    {flowerDetails.freshness}%
                                </span>
                            )}
                            {flowerDetails.lifespan && (
                                <span className="px-2 py-1 rounded-full bg-[#f4ede8] text-[#9c6b63] flex items-center gap-1">
                                    <Clock size={12} />
                                    {flowerDetails.lifespan}d
                                </span>
                            )}
                        </div>

                        {/* Detailed Flower Info */}
                        {showDetailedInfo && (
                            <div className="mb-3 text-xs text-gray-600 space-y-1">
                                {flowerDetails.season && (
                                    <div className="flex items-center gap-1">
                                        <Sun size={12} />
                                        <span>Season: {flowerDetails.season}</span>
                                    </div>
                                )}
                                {flowerDetails.expiryDate && (
                                    <div className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        <ExpiryStatus expiryDate={flowerDetails.expiryDate} />
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                );

            default:
                return null;
        }
    };

    // Get special badges
    const getSpecialBadges = () => {
        if (!product.details) return null;

        switch (product.typeRef) {
            case 'Book':
                const bookDetails = product.details as any;
                return bookDetails.genre ? (
                    <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${getGenreColor(bookDetails.genre)}`}>
                        {bookDetails.genre}
                    </div>
                ) : null;

            case 'Stationary':
                const stationaryDetails = product.details as any;
                return stationaryDetails.type ? (
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {stationaryDetails.type}
                    </div>
                ) : null;

            case 'Flower':
                const flowerDetails = product.details as any;
                return flowerDetails.color ? (
                    <div
                        className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: flowerDetails.color?.toLowerCase() }}
                    >
                        {flowerDetails.color}
                    </div>
                ) : null;

            default:
                return null;
        }
    };

    const typeInfo = getTypeInfo();

    return (
        <div className={`group rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 border border-[${typeInfo.colors.secondary}]/20 hover:border-[${typeInfo.colors.primary}]/40 transform hover:-translate-y-2 ${className} ${asLink ? 'cursor-pointer' : ''}`}>
            {/* Image Section */}
            <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                    src={imageError ? `/placeholder-${product.typeRef?.toLowerCase() || 'product'}.jpg` : product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={() => setImageError(true)}
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    priority={false}
                />

                {/* Type Badge */}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold border border-gray-200">
                    {typeInfo.icon}
                </div>

                {/* Special Type Badge */}
                {getSpecialBadges()}

                {/* Discount Badge */}
                {product.discount > 0 && (
                    <div className={`absolute ${getSpecialBadges() ? 'top-12' : 'top-3'} left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold`}>
                        -{product.discount}%
                    </div>
                )}

                {/* Out of Stock Overlay */}
                {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-5">
                {/* Title */}
                <div className="block mb-3">
                    <h3 className={`text-gray-800 font-semibold mb-2 line-clamp-2 group-hover:text-[${typeInfo.colors.primary}] transition text-lg`}>
                        {product.name}
                    </h3>
                </div>

                {/* Type-specific details */}
                {getProductDetails()}

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                    <StarRating rating={averageRating} />
                    <span className="text-sm text-gray-600">
                        ({product.reviews?.length || 0})
                    </span>
                </div>

                {/* Price and Add to Cart */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <p className={`text-[${typeInfo.colors.primary}] font-bold text-lg`}>
                            €{finalPrice.toFixed(2)}
                        </p>
                        {product.discount > 0 && (
                            <p className="text-gray-400 line-through text-sm">
                                €{product.price.toFixed(2)}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        className="px-4 py-2 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 z-10 relative"
                        style={{ background: `linear-gradient(135deg, ${typeInfo.colors.primary} 0%, ${typeInfo.colors.secondary} 100%)` }}
                    >
                        <ShoppingCart size={16} /> Add
                    </button>
                </div>
            </div>
        </div>
    );
}