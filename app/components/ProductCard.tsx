// app/components/ProductCard.tsx - Enhanced with real-time stock management
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
    Star, ShoppingCart, Book, Pencil, Flower, User, Calendar,
    Bookmark, Globe, Hash, Building, Droplets, Clock, Sun,
    Ruler, Package, Palette, Leaf, AlertCircle, CheckCircle,
    Loader2
} from 'lucide-react';
import { useCartStore } from '@/app/stores/CartStore';

// Import both types for compatibility
import { ProductEntry } from '@/app/types';
import {
    Product,
    isBookProduct,
    isStationaryProduct,
    isFlowerProduct
} from '@/app/types/product';

interface ProductCardProps {
    product: Product | ProductEntry;
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

// Stock indicator component
const StockIndicator = ({ stock, isLowStock }: { stock: number; isLowStock: boolean }) => {
    if (stock === 0) {
        return (
            <div className="flex items-center gap-1 text-red-500">
                <AlertCircle size={12} />
                <span className="text-xs font-medium">Out of Stock</span>
            </div>
        );
    }

    if (isLowStock) {
        return (
            <div className="flex items-center gap-1 text-orange-500">
                <AlertCircle size={12} />
                <span className="text-xs font-medium">Low Stock ({stock})</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1 text-green-500">
            <CheckCircle size={12} />
            <span className="text-xs font-medium">In Stock ({stock})</span>
        </div>
    );
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
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [currentStock, setCurrentStock] = useState(product.stock);

    const { addItem, isUpdatingStock } = useCartStore();

    // Check if stock is low (less than 10% of original or less than 5 items)
    const isLowStock = currentStock > 0 && currentStock <= Math.max(5, Math.floor(product.stock * 0.1));

    // Sync stock periodically
    useEffect(() => {
        const syncStock = async () => {
            try {
                const response = await fetch(`/api/product/${product._id}/check-stock`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setCurrentStock(data.product.stock);
                    }
                }
            } catch (error) {
                console.error('Error syncing stock:', error);
            }
        };

        // Sync stock every 30 seconds
        const interval = setInterval(syncStock, 30000);

        return () => clearInterval(interval);
    }, [product._id]);

    const handleAddToCart = async (e: React.MouseEvent) => {
        if (asLink) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (currentStock === 0 || isAddingToCart) return;

        setIsAddingToCart(true);

        try {
            // Handle both Product and ProductEntry types
            let productType: string;
            if ('type' in product && product.type) {
                productType = product.type;
            } else if (product && typeof product === 'object' && 'typeRef' in product && (product as any).typeRef) {
                productType = ((product as any).typeRef as string).toLowerCase();
            } else {
                productType = 'product';
            }

            const result = await addItem({
                id: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                type: productType,
                stock: currentStock,
                discount: product.discount,
                maxStock: currentStock
            });

            if (result.success) {
                // Update local stock immediately for better UX
                setCurrentStock(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            showErrorToast('Failed to add item to cart. Please try again.');
        } finally {
            setIsAddingToCart(false);
        }
    };

    const finalPrice = product.discount > 0
        ? product.price * (1 - product.discount / 100)
        : product.price;

    // Calculate average rating - handle both unified and API formats
    const averageRating = (() => {
        if ('averageRating' in product && typeof product.averageRating === 'number') {
            return product.averageRating;
        }
        if (product.reviews?.length) {
            return product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length;
        }
        return 0;
    })();

    // Get type icon with original unified styling
    const getTypeInfo = () => {
        const typeRef = product.typeRef;
        switch (typeRef) {
            case 'Book':
                return {
                    icon: <Book size={16} className="text-sky-900 bg-blue-300 h-7 w-7 p-1 rounded-xl" />
                };
            case 'Stationary':
                return {
                    icon: <Pencil size={16} className="text-green-900 bg-emerald-300 h-7 w-7 p-1 rounded-xl" />
                };
            case 'Flower':
                return {
                    icon: <Flower size={16} className="text-pink-900 bg-red-300 h-7 w-7 p-1 rounded-xl" />
                };
            default:
                return {
                    icon: <Package size={16} className="text-gray-500" />
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
    const formatDate = (date: Date | string) => {
        return new Date(date).getFullYear();
    };

    // Get product details with consistent layout for all types
    const getProductDetails = () => {
        let details: any = null;

        if ('details' in product && product.details) {
            details = product.details;
        } else if ('typeObject' in product && product.typeObject) {
            details = product.typeObject;
        }

        if (!details) return null;

        const typeRef = product.typeRef;

        // Always return the same structure for consistent card height
        return (
            <div className="mb-3">
                {/* Primary Info Line - Always present */}
                <div className="flex items-center gap-2 mb-2">
                    <User size={14} className="text-[#9a6a63]" />
                    <p className="text-sm text-[#9a6a63]/80 font-medium line-clamp-1">
                        {typeRef === 'Book' && details.author ? `by ${details.author}` :
                            typeRef === 'Stationary' && details.brand ? details.brand :
                                typeRef === 'Flower' && details.color ? `${details.color} • ${details.season}` :
                                    'Premium Quality'}
                    </p>
                </div>

                {/* Secondary Info - Always 2 lines for consistency */}
                <div className="space-y-1 mb-2 text-xs text-gray-600 min-h-[32px]">
                    {/* First info line */}
                    <div className="flex items-center justify-between">
                        {typeRef === 'Book' && details.publisher ? (
                            <>
                                <div className="flex items-center gap-1">
                                    <Building size={12} />
                                    <span className="truncate">{details.publisher}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    <span>{formatDate(details.publicationDate)}</span>
                                </div>
                            </>
                        ) : typeRef === 'Stationary' && details.type ? (
                            <>
                                <div className="flex items-center gap-1">
                                    <Package size={12} />
                                    <span className="truncate">{details.type}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Ruler size={12} />
                                    <span className="truncate">{details.material || 'Quality'}</span>
                                </div>
                            </>
                        ) : typeRef === 'Flower' ? (
                            <>
                                <div className="flex items-center gap-1">
                                    <Droplets size={12} />
                                    <span>{details.freshness || 90}% fresh</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock size={12} />
                                    <span>{details.lifespan || 7} days</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-1">
                                    <Package size={12} />
                                    <span>Premium</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star size={12} />
                                    <span>Quality</span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Second info line */}
                    <div className="flex items-center justify-between">
                        {typeRef === 'Book' && details.pages ? (
                            <>
                                <div className="flex items-center gap-1">
                                    <Bookmark size={12} />
                                    <span>{details.pages} pages</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Globe size={12} />
                                    <span>{details.language || 'English'}</span>
                                </div>
                            </>
                        ) : typeRef === 'Stationary' && details.color ? (
                            <>
                                <div className="flex items-center gap-1">
                                    <Palette size={12} />
                                    <span className="truncate">
                                        {Array.isArray(details.color) ? details.color.slice(0, 2).join(', ') : details.color}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Building size={12} />
                                    <span>Premium</span>
                                </div>
                            </>
                        ) : typeRef === 'Flower' ? (
                            <>
                                <div className="flex items-center gap-1">
                                    <Sun size={12} />
                                    <span>{details.season || 'All Season'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Leaf size={12} />
                                    <span>Fresh Cut</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    <span>Latest</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star size={12} />
                                    <span>Featured</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Stock Indicator */}
                <div className="mt-2">
                    <StockIndicator stock={currentStock} isLowStock={isLowStock} />
                </div>
            </div>
        );
    };

    // Get special badges
    const getSpecialBadges = () => {
        let details: any = null;

        if ('details' in product && product.details) {
            details = product.details;
        } else if ('typeObject' in product && product.typeObject) {
            details = product.typeObject;
        }

        if (!details) return null;

        const typeRef = product.typeRef;

        switch (typeRef) {
            case 'Book':
                return details.genre ? (
                    <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${getGenreColor(details.genre)}`}>
                        {details.genre}
                    </div>
                ) : null;

            case 'Stationary':
                return details.type ? (
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {details.type}
                    </div>
                ) : null;

            case 'Flower':
                return details.color ? (
                    <div
                        className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: details.color?.toLowerCase() || '#gray' }}
                    >
                        {details.color}
                    </div>
                ) : null;

            default:
                return null;
        }
    };

    const typeInfo = getTypeInfo();

    return (
        <div className={`group rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 border border-[#c1a5a2]/20 hover:border-[#9a6a63]/40 transform hover:-translate-y-2 ${className} ${asLink ? 'cursor-pointer' : ''} flex flex-col h-full ${currentStock === 0 ? 'opacity-75' : ''}`}>
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

                {/* Stock Status Badge */}
                {currentStock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                            Out of Stock
                        </span>
                    </div>
                )}

                {isLowStock && currentStock > 0 && (
                    <div className="absolute bottom-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        Only {currentStock} left!
                    </div>
                )}
            </div>

            {/* Content Section - Fixed height structure */}
            <div className="p-5 flex flex-col flex-1">
                {/* Title - Fixed height */}
                <div className="mb-3 min-h-[60px] flex items-start">
                    <h3 className="text-gray-800 font-semibold line-clamp-2 group-hover:text-[#9a6a63] transition text-lg leading-tight">
                        {product.name}
                    </h3>
                </div>

                {/* Type-specific details - Fixed height */}
                <div className="min-h-[100px]">
                    {getProductDetails()}
                </div>

                {/* Rating - Fixed height */}
                <div className="flex items-center gap-2 mb-3 min-h-[20px]">
                    <StarRating rating={averageRating} />
                    <span className="text-sm text-gray-600">
                        ({product.reviews?.length || 0})
                    </span>
                </div>

                {/* Price and Add to Cart - Push to bottom */}
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                        <p className="text-[#9a6a63] font-bold text-lg">
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
                        disabled={currentStock === 0 || isAddingToCart || isUpdatingStock}
                        className={`px-4 py-2 text-white rounded-xl transition-all transform shadow-lg flex items-center gap-2 z-10 relative font-medium ${currentStock === 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : isAddingToCart || isUpdatingStock
                                    ? 'bg-gray-500 cursor-wait'
                                    : 'hover:scale-105 hover:shadow-xl'
                            }`}
                        style={currentStock > 0 && !isAddingToCart && !isUpdatingStock ?
                            { background: `linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)` } : {}}
                    >
                        {isAddingToCart || isUpdatingStock ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Adding...
                            </>
                        ) : currentStock === 0 ? (
                            <>
                                <AlertCircle size={16} />
                                Sold Out
                            </>
                        ) : (
                            <>
                                <ShoppingCart size={16} />
                                Add
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Error toast utility
const showErrorToast = (message: string) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-20 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all transform translate-x-0';
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
};