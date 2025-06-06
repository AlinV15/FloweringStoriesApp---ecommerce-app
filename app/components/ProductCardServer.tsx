// app/components/ProductCardServer.tsx - Optimized for performance
import Image from 'next/image';
import {
    Star, Book, Pencil, Flower, User, Calendar,
    Building, Droplets, Clock, Sun,
    Ruler, Package, AlertCircle, CheckCircle
} from 'lucide-react';
import React, { memo } from 'react';

// Import types for compatibility
import { ProductEntry } from '@/app/types';
import { Product } from '@/app/types/product';

interface ProductCardServerProps {
    product: Product | ProductEntry;
    className?: string;
    priority?: boolean; // For image loading priority
    sizes?: string; // Custom sizes for responsive images
}

// Server-safe Image Component - No event handlers
const OptimizedProductImage = memo(({
    src,
    alt,
    priority = false,
    sizes = "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
}: {
    src: string;
    alt: string;
    priority?: boolean;
    sizes?: string;
}) => {
    // Validate image src server-side instead of using onError
    const safeSrc = src || '/placeholder-product.jpg';

    return (
        <Image
            src={safeSrc}
            alt={alt}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes={sizes}
            priority={priority}
            quality={80}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
    );
});

OptimizedProductImage.displayName = 'OptimizedProductImage';

// Memoized Star rating component
const StarRating = memo(({ rating }: { rating: number }) => {
    const stars: React.ReactElement[] = [];
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
});

StarRating.displayName = 'StarRating';

// Memoized Stock indicator component
const StockIndicator = memo(({ stock }: { stock: number }) => {
    const isLowStock = stock > 0 && stock <= 5;

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
            <span className="text-xs font-medium">In Stock</span>
        </div>
    );
});

StockIndicator.displayName = 'StockIndicator';

// Optimized type badge component
const TypeBadge = memo(({ typeRef }: { typeRef: string }) => {
    const getTypeInfo = () => {
        switch (typeRef) {
            case 'Book':
                return {
                    icon: <Book size={16} className="text-sky-900" />,
                    bgColor: 'bg-blue-100'
                };
            case 'Stationary':
                return {
                    icon: <Pencil size={16} className="text-green-900" />,
                    bgColor: 'bg-emerald-100'
                };
            case 'Flower':
                return {
                    icon: <Flower size={16} className="text-pink-900" />,
                    bgColor: 'bg-red-100'
                };
            default:
                return {
                    icon: <Package size={16} className="text-gray-500" />,
                    bgColor: 'bg-gray-100'
                };
        }
    };

    const typeInfo = getTypeInfo();

    return (
        <div className={`absolute top-3 right-3 ${typeInfo.bgColor} backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold border border-gray-200 flex items-center gap-1`}>
            {typeInfo.icon}
        </div>
    );
});

TypeBadge.displayName = 'TypeBadge';

// Optimized product details component
const ProductDetails = memo(({ product }: { product: Product | ProductEntry }) => {
    let details: unknown = null;

    if ('details' in product && product.details) {
        details = product.details;
    } else if ('typeObject' in product && product.typeObject) {
        details = product.typeObject;
    }

    if (!details || typeof details !== 'object') {
        return (
            <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                    <Package size={14} className="text-[#9a6a63]" />
                    <p className="text-sm text-[#9a6a63]/80 font-medium">Premium Quality</p>
                </div>
                <div className="min-h-[32px]">
                    <StockIndicator stock={product.stock} />
                </div>
            </div>
        );
    }

    const typeRef = product.typeRef;
    const formatDate = (date: Date | string) => new Date(date).getFullYear();

    // Type guards pentru different product types
    const detailsObj = details as Record<string, unknown>;

    return (
        <div className="mb-3">
            {/* Primary Info Line */}
            <div className="flex items-center gap-2 mb-2">
                <User size={14} className="text-[#9a6a63]" />
                <p className="text-sm text-[#9a6a63]/80 font-medium line-clamp-1">
                    {typeRef === 'Book' && typeof detailsObj.author === 'string' ? `by ${detailsObj.author}` :
                        typeRef === 'Stationary' && typeof detailsObj.brand === 'string' ? detailsObj.brand :
                            typeRef === 'Flower' && typeof detailsObj.color === 'string' ? `${detailsObj.color} • ${typeof detailsObj.season === 'string' ? detailsObj.season : 'Fresh'}` :
                                'Premium Quality'}
                </p>
            </div>

            {/* Secondary Info - Optimized layout */}
            <div className="space-y-1 mb-2 text-xs text-gray-600 min-h-[32px]">
                <div className="flex items-center justify-between">
                    {typeRef === 'Book' && typeof detailsObj.publisher === 'string' ? (
                        <>
                            <div className="flex items-center gap-1 min-w-0 flex-1">
                                <Building size={12} className="flex-shrink-0" />
                                <span className="truncate">{detailsObj.publisher}</span>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                                <Calendar size={12} />
                                <span>{detailsObj.publicationDate ? formatDate(detailsObj.publicationDate as Date | string) : 'N/A'}</span>
                            </div>
                        </>
                    ) : typeRef === 'Stationary' && typeof detailsObj.type === 'string' ? (
                        <>
                            <div className="flex items-center gap-1 min-w-0 flex-1">
                                <Package size={12} className="flex-shrink-0" />
                                <span className="truncate">{detailsObj.type}</span>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                                <Ruler size={12} />
                                <span className="truncate">{typeof detailsObj.material === 'string' ? detailsObj.material : 'Quality'}</span>
                            </div>
                        </>
                    ) : typeRef === 'Flower' ? (
                        <>
                            <div className="flex items-center gap-1">
                                <Droplets size={12} />
                                <span>{typeof detailsObj.freshness === 'number' ? detailsObj.freshness : 90}% fresh</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock size={12} />
                                <span>{typeof detailsObj.lifespan === 'number' ? detailsObj.lifespan : 7} days</span>
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
            </div>

            {/* Stock Indicator */}
            <StockIndicator stock={product.stock} />
        </div>
    );
});

ProductDetails.displayName = 'ProductDetails';

// Special badges component
const SpecialBadges = memo(({ product }: { product: Product | ProductEntry }) => {
    let details: unknown = null;

    if ('details' in product && product.details) {
        details = product.details;
    } else if ('typeObject' in product && product.typeObject) {
        details = product.typeObject;
    }

    if (!details || typeof details !== 'object') return null;

    const typeRef = product.typeRef;
    const detailsObj = details as Record<string, unknown>;

    // Genre color mapping
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

    switch (typeRef) {
        case 'Book':
            return typeof detailsObj.genre === 'string' ? (
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${getGenreColor(detailsObj.genre)}`}>
                    {detailsObj.genre}
                </div>
            ) : null;

        case 'Stationary':
            return typeof detailsObj.type === 'string' ? (
                <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {detailsObj.type}
                </div>
            ) : null;

        case 'Flower':
            return typeof detailsObj.color === 'string' ? (
                <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                    {detailsObj.color}
                </div>
            ) : null;

        default:
            return null;
    }
});

SpecialBadges.displayName = 'SpecialBadges';

// Main component - Memoized for performance
const ProductCardServer = memo(function ProductCardServer({
    product,
    className = "",
    priority = false,
    sizes
}: ProductCardServerProps) {
    // Calculate final price
    const finalPrice = product.discount > 0
        ? product.price * (1 - product.discount / 100)
        : product.price;

    // Calculate average rating
    const averageRating = (() => {
        if ('averageRating' in product && typeof product.averageRating === 'number') {
            return product.averageRating;
        }
        if (product.reviews?.length) {
            return product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length;
        }
        return 0;
    })();

    // Optimize image src with fallback server-side
    const imageSrc = (() => {
        if (product.image && product.image.trim() !== '') {
            return product.image;
        }
        // Fallback based on product type
        const typeFolder = product.typeRef?.toLowerCase() || 'product';
        return `/placeholder-${typeFolder}.jpg`;
    })();

    return (
        <article className={`group rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 border border-[#c1a5a2]/20 hover:border-[#9a6a63]/40 transform hover:-translate-y-2 ${className} cursor-pointer flex flex-col h-full ${product.stock === 0 ? 'opacity-75' : ''}`}>
            {/* Image Section - Optimized */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                <OptimizedProductImage
                    src={imageSrc}
                    alt={`${product.name} - ${product.typeRef} from Flowering Stories`}
                    priority={priority}
                    sizes={sizes}
                />

                {/* Type Badge */}
                <TypeBadge typeRef={product.typeRef} />

                {/* Special Type Badge */}
                <SpecialBadges product={product} />

                {/* Discount Badge */}
                {product.discount > 0 && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        -{product.discount}%
                    </div>
                )}

                {/* Stock Status Overlays */}
                {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg">
                            Out of Stock
                        </span>
                    </div>
                )}

                {product.stock > 0 && product.stock <= 5 && (
                    <div className="absolute bottom-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                        Only {product.stock} left!
                    </div>
                )}
            </div>

            {/* Content Section - Optimized layout */}
            <div className="p-5 flex flex-col flex-1">
                {/* Title - Consistent height */}
                <header className="mb-3 min-h-[60px] flex items-start">
                    <h3 className="text-gray-800 font-semibold line-clamp-2 group-hover:text-[#9a6a63] transition text-lg leading-tight">
                        {product.name}
                    </h3>
                </header>

                {/* Product details - Consistent height */}
                <div className="min-h-[100px] flex-1">
                    <ProductDetails product={product} />
                </div>

                {/* Rating - Consistent height */}
                <div className="flex items-center gap-2 mb-3 min-h-[20px]">
                    <StarRating rating={averageRating} />
                    <span className="text-sm text-gray-600">
                        ({product.reviews?.length || 0})
                    </span>
                </div>

                {/* Price and CTA - Always at bottom */}
                <footer className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
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
                    <div
                        className="px-4 py-2 text-white rounded-xl transition-all transform shadow-lg font-medium text-sm hover:shadow-xl active:scale-95"
                        style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}
                    >
                        View Product
                    </div>
                </footer>
            </div>
        </article>
    );
});

ProductCardServer.displayName = 'ProductCardServer';

export default ProductCardServer;