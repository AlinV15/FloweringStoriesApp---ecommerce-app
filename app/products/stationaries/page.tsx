'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Link from 'next/link';
import { Pen, Search, Star, Package, Palette, Ruler, ShoppingCart, Filter, Grid } from 'lucide-react';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { useCartStore } from '@/app/stores/CartStore';

interface StationaryProduct {
    _id: string;
    name: string;
    typeRef: string;
    price: number;
    image: string;
    stock: number;
    discount: number;
    Description?: string;
    details: {
        brand: string;
        color: string[];
        type: string;
        dimensions: {
            height: number;
            width: number;
            depth: number;
        };
        material: string;
    };
    reviews?: Review[];
    averageRating?: number;
    createdAt: string;
    updatedAt: string;
}

interface Review {
    _id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export default function StationaryPage() {
    const [stationary, setStationary] = useState<StationaryProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [brandFilter, setBrandFilter] = useState('all');
    const [colorFilter, setColorFilter] = useState('all');
    const [materialFilter, setMaterialFilter] = useState('all');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [sortBy, setSortBy] = useState('name');
    const [ratingFilter, setRatingFilter] = useState(0);
    const [stockFilter, setStockFilter] = useState('all');
    const [discountFilter, setDiscountFilter] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const itemsPerPage = 12;

    // Add to cart functionality
    const addItem = useCartStore(state => state.addItem);

    // Funcția pentru a adăuga în coș
    const handleAddToCart = (product: StationaryProduct) => {
        addItem({
            id: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            type: product.typeRef,
            stock: product.stock,
            discount: product.discount,
            maxStock: product.stock
        });

        // Optionally, show a toast or notification here if needed, but addItem does not return a result.
    };

    // Fetch stationary from API
    useEffect(() => {
        async function fetchStationary() {
            try {
                setLoading(true);
                const response = await fetch('/api/product?type=stationary');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                const stationaryProducts = (data.products || [])
                    .filter((product: StationaryProduct) => product.typeRef === 'Stationary' && product.details)
                    .map((product: StationaryProduct) => ({
                        ...product,
                        details: product.details,
                        averageRating: (product.reviews?.length ?? 0) > 0
                            ? product.reviews!.reduce((acc, review) => acc + review.rating, 0) / (product.reviews?.length ?? 1)
                            : 0
                    }));

                setStationary(stationaryProducts);
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch stationary products');
            } finally {
                setLoading(false);
            }
        }

        fetchStationary();
    }, []);

    // Get unique values for filters
    const getUniqueTypes = () => [...new Set(stationary.map(item => item.details.type).filter(Boolean))];
    const getUniqueBrands = () => [...new Set(stationary.map(item => item.details.brand).filter(Boolean))];
    const getUniqueColors = () => [...new Set(stationary.flatMap(item => item.details.color).filter(Boolean))];
    const getUniqueMaterials = () => [...new Set(stationary.map(item => item.details.material).filter(Boolean))];

    // Filter stationary
    const filteredStationary = stationary.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.details.brand.toLowerCase().includes(search.toLowerCase()) ||
            item.details.type.toLowerCase().includes(search.toLowerCase()) ||
            item.details.material.toLowerCase().includes(search.toLowerCase());

        const matchesType = typeFilter === 'all' || item.details.type === typeFilter;
        const matchesBrand = brandFilter === 'all' || item.details.brand === brandFilter;
        const matchesColor = colorFilter === 'all' || item.details.color.includes(colorFilter);
        const matchesMaterial = materialFilter === 'all' || item.details.material === materialFilter;

        const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
        const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        const matchesPrice = item.price >= minPrice && item.price <= maxPrice;

        const matchesRating = ratingFilter === 0 || (item.averageRating || 0) >= ratingFilter;
        const matchesStock = stockFilter === 'all' ||
            (stockFilter === 'in-stock' && item.stock > 0) ||
            (stockFilter === 'out-of-stock' && item.stock === 0);
        const matchesDiscount = !discountFilter || item.discount > 0;

        return matchesSearch && matchesType && matchesBrand && matchesColor &&
            matchesMaterial && matchesPrice && matchesRating && matchesStock && matchesDiscount;
    });

    // Sort stationary
    const sortedStationary = [...filteredStationary].sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'rating':
                return (b.averageRating || 0) - (a.averageRating || 0);
            case 'newest':
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'brand':
                return a.details.brand.localeCompare(b.details.brand);
            case 'type':
                return a.details.type.localeCompare(b.details.type);
            case 'name':
            default:
                return a.name.localeCompare(b.name);
        }
    });

    const paginatedStationary = sortedStationary.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(sortedStationary.length / itemsPerPage);

    // Star rating component
    const StarRating = ({ rating }: { rating: number }) => {
        const stars = [];
        const fullStars = Math.floor(rating);

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(
                    <Star key={i} className="text-yellow-400" fill="currentColor" size={16} />
                );
            } else {
                stars.push(
                    <Star key={i} className="text-gray-300" size={16} />
                );
            }
        }

        return <div className="flex gap-1">{stars}</div>;
    };

    // Clear all filters
    const clearAllFilters = () => {
        setSearch('');
        setTypeFilter('all');
        setBrandFilter('all');
        setColorFilter('all');
        setMaterialFilter('all');
        setPriceRange({ min: '', max: '' });
        setRatingFilter(0);
        setStockFilter('all');
        setDiscountFilter(false);
        setSortBy('name');
        setCurrentPage(1);
    };

    if (loading) {
        return (
            <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f6eeec 0%, #fefdfc 50%, #f2ded9 100%)' }}>
                <Header />
                <main className="max-w-7xl mx-auto px-4 md:px-6 py-32">
                    <LoadingSpinner message="Loading amazing stationary..." />
                </main>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f6eeec 0%, #fefdfc 50%, #f2ded9 100%)' }}>
                <Header />
                <main className="max-w-7xl mx-auto px-4 md:px-6 py-32">
                    <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-[#c1a5a2]/20">
                        <Pen className="w-16 h-16 mx-auto mb-4 text-[#9a6a63]" />
                        <p className="text-red-500 mb-6 text-lg">Oops! {error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}
                        >
                            Try Again
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f6eeec 0%, #fefdfc 50%, #f2ded9 100%)' }}>
            <Header />

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-32">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#9a6a63] mb-4 flex items-center justify-center gap-3">
                        <Pen className="text-[#9a6a63]" size={48} />
                        Premium Stationary Collection
                    </h1>
                    <p className="text-[#9a6a63]/80 text-lg max-w-2xl mx-auto">
                        Discover high-quality stationary products for all your creative and professional needs
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filter */}
                    <aside className={`w-full lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-[#c1a5a2]/20 shadow-xl sticky top-4">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-[#9a6a63] flex items-center gap-2">
                                    <Filter size={24} />
                                    Filters
                                </h2>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="lg:hidden text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Sort Filter */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-[#9a6a63] mb-3">Sort By</h3>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-[#c1a5a2]/30 focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white text-neutral-700 shadow-sm"
                                >
                                    <option value="name">Name (A-Z)</option>
                                    <option value="brand">Brand (A-Z)</option>
                                    <option value="type">Type (A-Z)</option>
                                    <option value="price-low">Price (Low to High)</option>
                                    <option value="price-high">Price (High to Low)</option>
                                    <option value="rating">Highest Rated</option>
                                    <option value="newest">Recently Added</option>
                                </select>
                            </div>

                            {/* Type Filter */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                    <Grid size={16} />
                                    Type
                                </h3>
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-[#c1a5a2]/30 focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white text-neutral-700"
                                >
                                    <option value="all">All Types</option>
                                    {getUniqueTypes().map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Brand Filter */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                    <Package size={16} />
                                    Brand
                                </h3>
                                <select
                                    value={brandFilter}
                                    onChange={(e) => setBrandFilter(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-[#c1a5a2]/30 focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white text-neutral-700"
                                >
                                    <option value="all">All Brands</option>
                                    {getUniqueBrands().map(brand => (
                                        <option key={brand} value={brand}>{brand}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Color Filter */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                    <Palette size={16} />
                                    Color
                                </h3>
                                <select
                                    value={colorFilter}
                                    onChange={(e) => setColorFilter(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-[#c1a5a2]/30 focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white text-neutral-700"
                                >
                                    <option value="all">All Colors</option>
                                    {getUniqueColors().map(color => (
                                        <option key={color} value={color}>{color}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Material Filter */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                    <Ruler size={16} />
                                    Material
                                </h3>
                                <select
                                    value={materialFilter}
                                    onChange={(e) => setMaterialFilter(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-[#c1a5a2]/30 focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white text-neutral-700"
                                >
                                    <option value="all">All Materials</option>
                                    {getUniqueMaterials().map(material => (
                                        <option key={material} value={material}>{material}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Filter */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-[#9a6a63] mb-3">Price Range (€)</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={priceRange.min}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                        className="px-3 py-2 text-sm border border-[#c1a5a2]/30 rounded-lg focus:border-[#9a6a63] text-neutral-700"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={priceRange.max}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                        className="px-3 py-2 text-sm border border-[#c1a5a2]/30 rounded-lg focus:border-[#9a6a63] text-neutral-700"
                                    />
                                </div>
                            </div>

                            {/* Clear All Filters */}
                            <button
                                onClick={clearAllFilters}
                                className="w-full px-4 py-3 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg font-medium"
                                style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}
                            >
                                Clear All Filters
                            </button>

                            <div className="mt-6 pt-4 border-t border-[#c1a5a2]/30 text-center">
                                <p className="text-sm text-[#9a6a63]/80">
                                    <span className="font-semibold text-[#9a6a63]">{sortedStationary.length}</span> product{sortedStationary.length !== 1 ? 's' : ''} found
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* Products Section */}
                    <div className="flex-1">
                        {/* Top Bar */}
                        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-[#c1a5a2]/20 shadow-lg">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setShowFilters(true)}
                                    className="lg:hidden px-4 py-2 text-white rounded-lg transition"
                                    style={{ backgroundColor: '#9a6a63' }}
                                >
                                    Filters
                                </button>
                                <h2 className="text-2xl font-bold text-[#9a6a63] flex items-center gap-2">
                                    <Pen className="text-[#9a6a63]" />
                                    Stationary Collection
                                </h2>
                            </div>
                            <div className="flex items-center gap-4 relative">
                                <input
                                    type="text"
                                    placeholder="Search products, brands, types..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full sm:w-80 px-6 py-3 rounded-xl border border-[#c1a5a2]/30 focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white shadow-sm placeholder:text-gray-400 text-neutral-700"
                                />
                                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <Search size={20} />
                                </div>
                            </div>
                        </div>

                        {paginatedStationary.length === 0 ? (
                            <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-lg">
                                <Pen className="w-24 h-24 mx-auto mb-6 text-[#9a6a63]/50" />
                                <p className="text-[#9a6a63]/80 mb-6 text-xl">No stationary products found matching your criteria.</p>
                                <button
                                    onClick={clearAllFilters}
                                    className="px-8 py-4 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg font-medium"
                                    style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {paginatedStationary.map(item => (
                                    <div
                                        key={item._id}
                                        className="group rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 border border-[#c1a5a2]/20 hover:border-[#9a6a63]/40 transform hover:-translate-y-2"
                                    >
                                        <div className="relative aspect-square overflow-hidden">
                                            <Image
                                                src={item.image || '/placeholder-stationary.jpg'}
                                                alt={item.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-[#9a6a63] border border-[#c1a5a2]/30">
                                                <Pen size={16} />
                                            </div>
                                            {item.discount > 0 && (
                                                <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                                    -{item.discount}%
                                                </div>
                                            )}
                                            {item.stock === 0 && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                                                        Out of Stock
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-5">
                                            <Link href={`/products/${item._id}`} className="block mb-3">
                                                <h3 className="text-gray-800 font-semibold mb-2 line-clamp-2 group-hover:text-[#9a6a63] transition">
                                                    {item.name}
                                                </h3>
                                            </Link>

                                            <p className="text-sm text-[#9a6a63]/80 mb-2 flex items-center gap-1">
                                                <Package size={14} />
                                                {item.details.brand}
                                            </p>

                                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                                <span className="px-2 py-1 rounded-full text-white" style={{ backgroundColor: '#c1a5a2' }}>
                                                    {item.details.type}
                                                </span>
                                                <span className="px-2 py-1 rounded-full bg-[#f2ded9] text-[#9a6a63]">
                                                    {item.details.material}
                                                </span>
                                            </div>

                                            {item.details.color && item.details.color.length > 0 && (
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Palette size={14} className="text-[#9a6a63]" />
                                                    <div className="flex gap-1">
                                                        {item.details.color.slice(0, 3).map((color, index) => (
                                                            <div
                                                                key={index}
                                                                className="w-4 h-4 rounded-full border border-gray-300"
                                                                style={{ backgroundColor: color.toLowerCase() }}
                                                                title={color}
                                                            />
                                                        ))}
                                                        {item.details.color.length > 3 && (
                                                            <span className="text-xs text-gray-500 ml-1">
                                                                +{item.details.color.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 mb-3">
                                                <StarRating rating={item.averageRating || 0} />
                                                <span className="text-sm text-gray-600">
                                                    ({item.reviews?.length || 0})
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[#9a6a63] font-bold text-lg">
                                                        €{item.discount > 0
                                                            ? (item.price * (1 - item.discount / 100)).toFixed(2)
                                                            : item.price.toFixed(2)
                                                        }
                                                    </p>
                                                    {item.discount > 0 && (
                                                        <p className="text-gray-400 line-through text-sm">
                                                            €{item.price.toFixed(2)}
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleAddToCart(item)}
                                                    disabled={item.stock === 0}
                                                    className="px-4 py-2 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                                                    style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}
                                                >
                                                    <ShoppingCart size={16} /> Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-12">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        className="px-4 py-2 bg-white/80 text-[#9a6a63] rounded-xl hover:bg-white border border-[#c1a5a2]/30 disabled:opacity-50 transition-all"
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </button>
                                    <span className="text-[#9a6a63] px-4 font-medium">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        className="px-4 py-2 bg-white/80 text-[#9a6a63] rounded-xl hover:bg-white border border-[#c1a5a2]/30 disabled:opacity-50 transition-all"
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}