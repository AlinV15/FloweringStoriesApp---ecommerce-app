'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Link from 'next/link';
import { Flower, Search, Star, Calendar, Leaf, ShoppingCart, Filter, Droplets, Sun, Clock } from 'lucide-react';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { useCartStore } from '@/app/stores/CartStore';

interface FlowerProduct {
    _id: string;
    name: string;
    typeRef: string;
    price: number;
    image: string;
    stock: number;
    discount: number;
    Description?: string;
    details: {
        color: string;
        freshness: number;
        lifespan: number;
        season: string;
        careInstructions: string;
        expiryDate: Date;
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

export default function FlowersPage() {
    const [flowers, setFlowers] = useState<FlowerProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [search, setSearch] = useState('');
    const [colorFilter, setColorFilter] = useState('all');
    const [seasonFilter, setSeasonFilter] = useState('all');
    const [freshnessFilter, setFreshnessFilter] = useState({ min: '', max: '' });
    const [lifespanFilter, setLifespanFilter] = useState({ min: '', max: '' });
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [sortBy, setSortBy] = useState('name');
    const [ratingFilter, setRatingFilter] = useState(0);
    const [stockFilter, setStockFilter] = useState('all');
    const [discountFilter, setDiscountFilter] = useState(false);
    const [expiryFilter, setExpiryFilter] = useState('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const itemsPerPage = 12;

    // Add to cart functionality
    const addItem = useCartStore(state => state.addItem);

    // Funcția pentru a adăuga în coș
    const handleAddToCart = (product: FlowerProduct) => {
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
    // Fetch flowers from API
    useEffect(() => {
        async function fetchFlowers() {
            try {
                setLoading(true);
                const response = await fetch('/api/product?type=flower');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                const flowerProducts = (data.products || [])
                    .filter((product: FlowerProduct) => product.typeRef === 'Flower' && product.details)
                    .map((product: FlowerProduct) => ({
                        ...product,
                        details: product.details,
                        averageRating: (product.reviews?.length ?? 0) > 0
                            ? product.reviews!.reduce((acc, review) => acc + review.rating, 0) / (product.reviews?.length ?? 1)
                            : 0
                    }));

                setFlowers(flowerProducts);
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch flowers');
            } finally {
                setLoading(false);
            }
        }

        fetchFlowers();
    }, []);

    // Get unique values for filters
    const getUniqueColors = () => [...new Set(flowers.map(flower => flower.details.color).filter(Boolean))];
    const getUniqueSeasons = () => [...new Set(flowers.map(flower => flower.details.season).filter(Boolean))];

    // Filter flowers
    const filteredFlowers = flowers.filter(flower => {
        const matchesSearch = flower.name.toLowerCase().includes(search.toLowerCase()) ||
            flower.details.color.toLowerCase().includes(search.toLowerCase()) ||
            flower.details.season.toLowerCase().includes(search.toLowerCase());

        const matchesColor = colorFilter === 'all' || flower.details.color === colorFilter;
        const matchesSeason = seasonFilter === 'all' || flower.details.season === seasonFilter;

        const matchesFreshness = (!freshnessFilter.min || flower.details.freshness >= parseInt(freshnessFilter.min)) &&
            (!freshnessFilter.max || flower.details.freshness <= parseInt(freshnessFilter.max));

        const matchesLifespan = (!lifespanFilter.min || flower.details.lifespan >= parseInt(lifespanFilter.min)) &&
            (!lifespanFilter.max || flower.details.lifespan <= parseInt(lifespanFilter.max));

        const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
        const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        const matchesPrice = flower.price >= minPrice && flower.price <= maxPrice;

        const matchesRating = ratingFilter === 0 || (flower.averageRating || 0) >= ratingFilter;
        const matchesStock = stockFilter === 'all' ||
            (stockFilter === 'in-stock' && flower.stock > 0) ||
            (stockFilter === 'out-of-stock' && flower.stock === 0);
        const matchesDiscount = !discountFilter || flower.discount > 0;

        const now = new Date();
        const expiryDate = new Date(flower.details.expiryDate);
        const matchesExpiry = expiryFilter === 'all' ||
            (expiryFilter === 'fresh' && expiryDate > now) ||
            (expiryFilter === 'expiring-soon' && expiryDate > now && expiryDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) ||
            (expiryFilter === 'expired' && expiryDate <= now);

        return matchesSearch && matchesColor && matchesSeason && matchesFreshness &&
            matchesLifespan && matchesPrice && matchesRating && matchesStock &&
            matchesDiscount && matchesExpiry;
    });

    // Sort flowers
    const sortedFlowers = [...filteredFlowers].sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'rating':
                return (b.averageRating || 0) - (a.averageRating || 0);
            case 'newest':
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'freshness-high':
                return b.details.freshness - a.details.freshness;
            case 'freshness-low':
                return a.details.freshness - b.details.freshness;
            case 'lifespan-high':
                return b.details.lifespan - a.details.lifespan;
            case 'lifespan-low':
                return a.details.lifespan - b.details.lifespan;
            case 'expiry-date':
                return new Date(a.details.expiryDate).getTime() - new Date(b.details.expiryDate).getTime();
            case 'color':
                return a.details.color.localeCompare(b.details.color);
            case 'name':
            default:
                return a.name.localeCompare(b.name);
        }
    });

    const paginatedFlowers = sortedFlowers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(sortedFlowers.length / itemsPerPage);

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

    // Freshness indicator
    const FreshnessIndicator = ({ freshness }: { freshness: number }) => {
        const getColor = () => {
            if (freshness >= 8) return 'text-green-500';
            if (freshness >= 6) return 'text-yellow-500';
            if (freshness >= 4) return 'text-orange-500';
            return 'text-red-500';
        };

        return (
            <div className={`flex items-center gap-1 ${getColor()}`}>
                <Droplets size={14} />
                <span className="text-xs font-medium">{freshness}/10</span>
            </div>
        );
    };

    // Expiry status
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

    // Clear all filters
    const clearAllFilters = () => {
        setSearch('');
        setColorFilter('all');
        setSeasonFilter('all');
        setFreshnessFilter({ min: '', max: '' });
        setLifespanFilter({ min: '', max: '' });
        setPriceRange({ min: '', max: '' });
        setRatingFilter(0);
        setStockFilter('all');
        setDiscountFilter(false);
        setExpiryFilter('all');
        setSortBy('name');
        setCurrentPage(1);
    };

    if (loading) {
        return (
            <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8f6f3 0%, #fefcfa 50%, #f4ede8 100%)' }}>
                <Header />
                <main className="max-w-7xl mx-auto px-4 md:px-6 py-32">
                    <LoadingSpinner message="Loading beautiful flowers..." />
                </main>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8f6f3 0%, #fefcfa 50%, #f4ede8 100%)' }}>
                <Header />
                <main className="max-w-7xl mx-auto px-4 md:px-6 py-32">
                    <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-[#e5d4ce]/20">
                        <Flower className="w-16 h-16 mx-auto mb-4 text-[#9c6b63]" />
                        <p className="text-red-500 mb-6 text-lg">Oops! {error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #9c6b63 0%, #c1a5a2 100%)' }}
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
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8f6f3 0%, #fefcfa 50%, #f4ede8 100%)' }}>
            <Header />

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-32">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#9c6b63] mb-4 flex items-center justify-center gap-3">
                        <Flower className="text-[#9c6b63]" size={48} />
                        Premium Flowers Collection
                    </h1>
                    <p className="text-[#9c6b63]/80 text-lg max-w-2xl mx-auto">
                        Discover our curated collection of fresh and beautiful flowers for every occasion
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filter */}
                    <aside className={`w-full lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-[#e5d4ce]/20 shadow-xl sticky top-4">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-[#9c6b63] flex items-center gap-2">
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
                                <h3 className="font-semibold text-[#9c6b63] mb-3">Sort By</h3>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-[#e5d4ce]/30 focus:border-[#9c6b63] focus:ring-2 focus:ring-[#9c6b63]/20 bg-white text-neutral-700 shadow-sm"
                                >
                                    <option value="name">Name (A-Z)</option>
                                    <option value="color">Color (A-Z)</option>
                                    <option value="price-low">Price (Low to High)</option>
                                    <option value="price-high">Price (High to Low)</option>
                                    <option value="rating">Highest Rated</option>
                                    <option value="freshness-high">Freshness (High to Low)</option>
                                    <option value="freshness-low">Freshness (Low to High)</option>
                                    <option value="lifespan-high">Lifespan (High to Low)</option>
                                    <option value="lifespan-low">Lifespan (Low to High)</option>
                                    <option value="expiry-date">Expiry Date (Soonest)</option>
                                    <option value="newest">Recently Added</option>
                                </select>
                            </div>

                            {/* Color Filter */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-[#9c6b63] mb-3 flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-400 to-pink-400"></div>
                                    Color
                                </h3>
                                <select
                                    value={colorFilter}
                                    onChange={(e) => setColorFilter(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-[#e5d4ce]/30 focus:border-[#9c6b63] focus:ring-2 focus:ring-[#9c6b63]/20 bg-white text-neutral-700"
                                >
                                    <option value="all">All Colors</option>
                                    {getUniqueColors().map(color => (
                                        <option key={color} value={color}>{color}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Season Filter */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-[#9c6b63] mb-3 flex items-center gap-2">
                                    <Sun size={16} />
                                    Season
                                </h3>
                                <select
                                    value={seasonFilter}
                                    onChange={(e) => setSeasonFilter(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-[#e5d4ce]/30 focus:border-[#9c6b63] focus:ring-2 focus:ring-[#9c6b63]/20 bg-white text-neutral-700"
                                >
                                    <option value="all">All Seasons</option>
                                    {getUniqueSeasons().map(season => (
                                        <option key={season} value={season}>{season}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Freshness Filter */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-[#9c6b63] mb-3 flex items-center gap-2">
                                    <Droplets size={16} />
                                    Freshness Level (1-100)
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        min="1"
                                        max="100"
                                        value={freshnessFilter.min}
                                        onChange={(e) => setFreshnessFilter(prev => ({ ...prev, min: e.target.value }))}
                                        className="px-3 py-2 text-sm border border-[#e5d4ce]/30 rounded-lg focus:border-[#9c6b63] text-neutral-700"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        min="1"
                                        max="10"
                                        value={freshnessFilter.max}
                                        onChange={(e) => setFreshnessFilter(prev => ({ ...prev, max: e.target.value }))}
                                        className="px-3 py-2 text-sm border border-[#e5d4ce]/30 rounded-lg focus:border-[#9c6b63] text-neutral-700"
                                    />
                                </div>
                            </div>

                            {/* Lifespan Filter */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-[#9c6b63] mb-3 flex items-center gap-2">
                                    <Clock size={16} />
                                    Lifespan (Days)
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={lifespanFilter.min}
                                        onChange={(e) => setLifespanFilter(prev => ({ ...prev, min: e.target.value }))}
                                        className="px-3 py-2 text-sm border border-[#e5d4ce]/30 rounded-lg focus:border-[#9c6b63] text-neutral-700"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={lifespanFilter.max}
                                        onChange={(e) => setLifespanFilter(prev => ({ ...prev, max: e.target.value }))}
                                        className="px-3 py-2 text-sm border border-[#e5d4ce]/30 rounded-lg focus:border-[#9c6b63] text-neutral-700"
                                    />
                                </div>
                            </div>

                            {/* Expiry Filter */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-[#9c6b63] mb-3 flex items-center gap-2">
                                    <Calendar size={16} />
                                    Expiry Status
                                </h3>
                                <select
                                    value={expiryFilter}
                                    onChange={(e) => setExpiryFilter(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-[#e5d4ce]/30 focus:border-[#9c6b63] focus:ring-2 focus:ring-[#9c6b63]/20 bg-white text-neutral-700"
                                >
                                    <option value="all">All Status</option>
                                    <option value="fresh">Fresh (7+ days)</option>
                                    <option value="expiring-soon">Expiring Soon (1-7 days)</option>
                                    <option value="expired">Expired</option>
                                </select>
                            </div>

                            {/* Price Filter */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-[#9c6b63] mb-3">Price Range (€)</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={priceRange.min}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                        className="px-3 py-2 text-sm border border-[#e5d4ce]/30 rounded-lg focus:border-[#9c6b63] text-neutral-700"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={priceRange.max}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                        className="px-3 py-2 text-sm border border-[#e5d4ce]/30 rounded-lg focus:border-[#9c6b63] text-neutral-700"
                                    />
                                </div>
                            </div>

                            {/* Stock Filter */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-[#9c6b63] mb-3">Availability</h3>
                                <select
                                    value={stockFilter}
                                    onChange={(e) => setStockFilter(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-[#e5d4ce]/30 focus:border-[#9c6b63] focus:ring-2 focus:ring-[#9c6b63]/20 bg-white text-neutral-700"
                                >
                                    <option value="all">All Items</option>
                                    <option value="in-stock">In Stock</option>
                                    <option value="out-of-stock">Out of Stock</option>
                                </select>
                            </div>

                            {/* Discount Filter */}
                            <div className="mb-6">
                                <label className="flex items-center gap-2 text-[#9c6b63]">
                                    <input
                                        type="checkbox"
                                        checked={discountFilter}
                                        onChange={(e) => setDiscountFilter(e.target.checked)}
                                        className="accent-[#9c6b63]"
                                    />
                                    Show Only Discounted Items
                                </label>
                            </div>

                            {/* Clear All Filters */}
                            <button
                                onClick={clearAllFilters}
                                className="w-full px-4 py-3 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg font-medium"
                                style={{ background: 'linear-gradient(135deg, #9c6b63 0%, #c1a5a2 100%)' }}
                            >
                                Clear All Filters
                            </button>

                            <div className="mt-6 pt-4 border-t border-[#e5d4ce]/30 text-center">
                                <p className="text-sm text-[#9c6b63]/80">
                                    <span className="font-semibold text-[#9c6b63]">{sortedFlowers.length}</span> flower{sortedFlowers.length !== 1 ? 's' : ''} found
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* Flowers Section */}
                    <div className="flex-1">
                        {/* Top Bar */}
                        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-[#e5d4ce]/20 shadow-lg">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setShowFilters(true)}
                                    className="lg:hidden px-4 py-2 text-white rounded-lg transition"
                                    style={{ backgroundColor: '#9c6b63' }}
                                >
                                    Filters
                                </button>
                                <h2 className="text-2xl font-bold text-[#9c6b63] flex items-center gap-2">
                                    <Flower className="text-[#9c6b63]" />
                                    Flowers Collection
                                </h2>
                            </div>
                            <div className="flex items-center gap-4 relative">
                                <input
                                    type="text"
                                    placeholder="Search flowers, colors, seasons..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full sm:w-80 px-6 py-3 rounded-xl border border-[#e5d4ce]/30 focus:border-[#9c6b63] focus:ring-2 focus:ring-[#9c6b63]/20 bg-white shadow-sm placeholder:text-gray-400 text-neutral-700"
                                />
                                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <Search size={20} />
                                </div>
                            </div>
                        </div>

                        {paginatedFlowers.length === 0 ? (
                            <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-2xl border border-[#e5d4ce]/20 shadow-lg">
                                <Flower className="w-24 h-24 mx-auto mb-6 text-[#9c6b63]/50" />
                                <p className="text-[#9c6b63]/80 mb-6 text-xl">No flowers found matching your criteria.</p>
                                <button
                                    onClick={clearAllFilters}
                                    className="px-8 py-4 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg font-medium"
                                    style={{ background: 'linear-gradient(135deg, #9c6b63 0%, #c1a5a2 100%)' }}
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            // Replace the existing flower card grid section (around line 430-600) with this simplified version:

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {paginatedFlowers.map(flower => (
                                    <div
                                        key={flower._id}
                                        className="group rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 border border-[#e5d4ce]/20 hover:border-[#9c6b63]/40 transform hover:-translate-y-2"
                                    >
                                        <div className="relative aspect-[3/4] overflow-hidden">
                                            <Image
                                                src={flower.image || '/placeholder-flower.jpg'}
                                                alt={flower.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-[#9c6b63] border border-[#e5d4ce]/30">
                                                <Flower size={16} />
                                            </div>
                                            {flower.discount > 0 && (
                                                <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                                    -{flower.discount}%
                                                </div>
                                            )}
                                            {flower.stock === 0 && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                                                        Out of Stock
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-5">
                                            <Link href={`/products/${flower._id}`} className="block mb-3">
                                                <h3 className="text-gray-800 font-semibold mb-2 line-clamp-2 group-hover:text-[#9c6b63] transition">
                                                    {flower.name}
                                                </h3>
                                            </Link>

                                            <div className="text-sm text-[#9c6b63]/80 mb-2 flex items-center gap-1">
                                                <div
                                                    className="w-3 h-3 rounded-full border border-white shadow-sm"
                                                    style={{ backgroundColor: flower.details.color.toLowerCase() }}
                                                ></div>
                                                {flower.details.color} • {flower.details.season}
                                            </div>

                                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                                <span className="px-2 py-1 rounded-full text-white flex items-center gap-1" style={{ backgroundColor: '#9c6b63' }}>
                                                    <Droplets size={12} />
                                                    {flower.details.freshness}/100
                                                </span>
                                                <span className="px-2 py-1 rounded-full bg-[#f4ede8] text-[#9c6b63] flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {flower.details.lifespan}d
                                                </span>
                                            </div>

                                            {/* Rating */}
                                            {flower.reviews && flower.reviews.length > 0 && (
                                                <div className="flex items-center gap-2 mb-3">
                                                    <StarRating rating={flower.averageRating || 0} />
                                                    <span className="text-sm text-gray-600">
                                                        ({flower.reviews.length})
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {flower.discount > 0 ? (
                                                        <>
                                                            <p className="text-[#9c6b63] font-bold text-lg">
                                                                €{(flower.price * (1 - flower.discount / 100)).toFixed(2)}
                                                            </p>
                                                            <p className="text-gray-400 line-through text-sm">
                                                                €{flower.price.toFixed(2)}
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <p className="text-[#9c6b63] font-bold text-lg">
                                                            €{flower.price.toFixed(2)}
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleAddToCart(flower)}
                                                    disabled={flower.stock === 0}
                                                    className="px-4 py-2 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                            <div className="mt-12 flex justify-center items-center gap-4 bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-[#e5d4ce]/20 shadow-lg">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-6 py-3 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                    style={{ background: currentPage === 1 ? '#ccc' : 'linear-gradient(135deg, #9c6b63 0%, #c1a5a2 100%)' }}
                                >
                                    Previous
                                </button>

                                <div className="flex items-center gap-2">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-12 h-12 rounded-xl font-medium transition-all ${currentPage === pageNum
                                                    ? 'text-white shadow-lg'
                                                    : 'text-[#9c6b63] hover:bg-[#9c6b63]/10'
                                                    }`}
                                                style={{
                                                    background: currentPage === pageNum
                                                        ? 'linear-gradient(135deg, #9c6b63 0%, #c1a5a2 100%)'
                                                        : 'transparent'
                                                }}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-6 py-3 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                    style={{ background: currentPage === totalPages ? '#ccc' : 'linear-gradient(135deg, #9c6b63 0%, #c1a5a2 100%)' }}
                                >
                                    Next
                                </button>
                            </div>
                        )}

                        {/* Results Summary */}
                        <div className="mt-8 text-center bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-[#e5d4ce]/20 shadow-lg">
                            <p className="text-[#9c6b63]/80">
                                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, sortedFlowers.length)} - {Math.min(currentPage * itemsPerPage, sortedFlowers.length)} of {sortedFlowers.length} flower{sortedFlowers.length !== 1 ? 's' : ''}
                                {flowers.length !== sortedFlowers.length && (
                                    <span className="text-gray-500 ml-2">
                                        (filtered from {flowers.length} total)
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
