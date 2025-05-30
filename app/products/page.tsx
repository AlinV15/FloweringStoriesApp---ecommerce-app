'use client';

import { useState, useEffect, lazy } from 'react';
import Image from 'next/image';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Link from 'next/link';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import {
    Book,
    Search,
    Star,
    Calendar,
    User,
    BookOpen,
    Languages,
    Building,
    ShoppingCart,
    Filter,
    Flower,
    Pencil,
    Package,
    PackageOpen,
    CircleCheckBig,
    XCircle,
    Tag,
    Palette,
    Timer,
    Leaf,
    Box,
    Ruler,
    Hammer
} from 'lucide-react';

// Import tipurile unificate și convertorul
import {
    Product,
    BookProduct,
    StationaryProduct,
    FlowerProduct,
    BookDetails,
    StationaryDetails,
    FlowerDetails,
    Review,
    convertProductEntryToProduct,
    isBookProduct,
    isStationaryProduct,
    isFlowerProduct
} from '@/app/types/product';

// Import tipurile din API
import { Product as APIProductEntry } from '@/app/types/product';
import { useProductStore } from '../stores/ProductStore';
import { useInView } from 'react-intersection-observer';

interface APIResponse {
    products: APIProductEntry[];
}

// Lazy load simple ProductCard that works with ProductEntry directly
const ProductCard = lazy(() => import("@/app/components/ProductCard"));

// Loading fallbacks
const ProductCardSkeleton = () => (
    <div className="group rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm shadow-lg border border-[#c1a5a2]/20 animate-pulse">
        <div className="aspect-[3/4] bg-gray-200"></div>
        <div className="p-5">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-3 w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded mb-3 w-1/2"></div>
            <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
        </div>
    </div>
);

export default function ProductsPage() {

    // Filter states
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [subcategoryFilter, setSubcategoryFilter] = useState('all');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [sortBy, setSortBy] = useState('name');
    const [ratingFilter, setRatingFilter] = useState(0);
    const [stockFilter, setStockFilter] = useState('all');
    const [discountFilter, setDiscountFilter] = useState(false);

    // Book specific filters
    const [genreFilter, setGenreFilter] = useState('all');
    const [authorFilter, setAuthorFilter] = useState('');
    const [languageFilter, setLanguageFilter] = useState('all');
    const [publisherFilter, setPublisherFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState({ from: '', to: '' });
    const [pagesFilter, setPagesFilter] = useState({ min: '', max: '' });

    // Stationary specific filters
    const [brandFilter, setBrandFilter] = useState('all');
    const [colorFilter, setColorFilter] = useState('all');
    const [materialFilter, setMaterialFilter] = useState('all');
    const [stationaryTypeFilter, setStationaryTypeFilter] = useState('all');

    // Flower specific filters
    const [flowerColorFilter, setFlowerColorFilter] = useState('all');
    const [seasonFilter, setSeasonFilter] = useState('all');
    const [freshnessFilter, setFreshnessFilter] = useState({ min: '', max: '' });
    const [lifespanFilter, setLifespanFilter] = useState({ min: '', max: '' });

    // Pagination and UI
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const itemsPerPage = 12;

    // Product store
    const fetchProducts = useProductStore((state) => state.fetchProducts);
    const loading = useProductStore((state) => state.loading);
    const error = useProductStore((state) => state.error);
    const products = useProductStore((state) => state.products);

    const [featuredRef, featuredInView] = useInView({ threshold: 0.1, triggerOnce: true });
    const [featuresRef, featuresInView] = useInView({ threshold: 0.1, triggerOnce: true });

    useEffect(() => {
        if (featuredInView && !loading) {
            fetchProducts();
        }
    }, [featuredInView, fetchProducts, loading]);

    // Clear category-specific filters when category changes
    useEffect(() => {
        setGenreFilter('all');
        setAuthorFilter('');
        setLanguageFilter('all');
        setPublisherFilter('all');
        setYearFilter({ from: '', to: '' });
        setPagesFilter({ min: '', max: '' });
        setBrandFilter('all');
        setColorFilter('all');
        setMaterialFilter('all');
        setStationaryTypeFilter('all');
        setFlowerColorFilter('all');
        setSeasonFilter('all');
        setFreshnessFilter({ min: '', max: '' });
        setLifespanFilter({ min: '', max: '' });
        setCurrentPage(1);
    }, [categoryFilter]);

    // Get unique values for filters usando type guards
    // const getUniqueGenres = () => {
    //     const books = products.filter(isBookProduct);
    //     return [...new Set(books.map(book => book.details?.genre).filter(Boolean))];
    // };

    // const getUniqueAuthors = () => {
    //     const books = products.filter(isBookProduct);
    //     return [...new Set(books.map(book => book.details.author).filter(Boolean))];
    // };

    // const getUniqueLanguages = () => {
    //     const books = products.filter(isBookProduct);
    //     return [...new Set(books.map(book => book.details.language).filter(Boolean))];
    // };

    // const getUniquePublishers = () => {
    //     const books = products.filter(isBookProduct);
    //     return [...new Set(books.map(book => book.details.publisher).filter(Boolean))];
    // };

    // // Stationary filters
    // const getUniqueBrands = () => {
    //     const stationaries = products.filter(isStationaryProduct);
    //     return [...new Set(stationaries.map(item => item.details.brand).filter(Boolean))];
    // };

    // const getUniqueColors = () => {
    //     const stationaries = products.filter(isStationaryProduct);
    //     const allColors = stationaries.flatMap(item => item.details.color || []);
    //     return [...new Set(allColors)].filter(Boolean);
    // };

    // const getUniqueMaterials = () => {
    //     const stationaries = products.filter(isStationaryProduct);
    //     return [...new Set(stationaries.map(item => item.details.material).filter(Boolean))];
    // };

    // const getUniqueStationaryTypes = () => {
    //     const stationaries = products.filter(isStationaryProduct);
    //     return [...new Set(stationaries.map(item => item.details.type).filter(Boolean))];
    // };

    // // Flower filters
    // const getUniqueFlowerColors = () => {
    //     const flowers = products.filter(isFlowerProduct);
    //     return [...new Set(flowers.map(flower => flower.details.color).filter(Boolean))];
    // };

    // const getUniqueSeasons = () => {
    //     const flowers = products.filter(isFlowerProduct);
    //     return [...new Set(flowers.map(flower => flower.details.season).filter(Boolean))];
    // };

    // Filter products usando type guards
    const filteredProducts = products.filter(product => {
        try {
            const matchesCategory = categoryFilter === 'all' || product.type === categoryFilter;

            const matchesSearch = product.name?.toLowerCase().includes(search.toLowerCase()) ||
                (isBookProduct(product) && product.details.author?.toLowerCase().includes(search.toLowerCase())) ||
                (isStationaryProduct(product) && product.details.brand?.toLowerCase().includes(search.toLowerCase())) ||
                (isFlowerProduct(product) && product.details.color?.toLowerCase().includes(search.toLowerCase()));

            const minPrice = priceRange.min ? Math.max(0, parseFloat(priceRange.min)) : 0;
            const maxPrice = priceRange.max ? Math.max(0, parseFloat(priceRange.max)) : Infinity;
            const productPrice = typeof product.price === 'number' ? product.price : 0;
            const matchesPrice = productPrice >= minPrice && productPrice <= maxPrice;

            //const matchesRating = ratingFilter === 0 || (product.averageRating || 0) >= ratingFilter;

            const matchesStock = stockFilter === 'all' ||
                (stockFilter === 'in-stock' && product.stock > 0) ||
                (stockFilter === 'out-of-stock' && product.stock === 0);

            const matchesDiscount = !discountFilter || product.discount > 0;

            // Book specific filters
            let matchesBookFilters = true;
            if (isBookProduct(product)) {
                const matchesGenre = genreFilter === 'all' || product.details.genre === genreFilter;
                const matchesAuthor = !authorFilter || product.details.author?.toLowerCase().includes(authorFilter.toLowerCase());
                const matchesLanguage = languageFilter === 'all' || product.details.language === languageFilter;
                const matchesPublisher = publisherFilter === 'all' || product.details.publisher === publisherFilter;

                const bookYear = new Date(product.details.publicationDate).getFullYear();
                const matchesYear = (!yearFilter.from || bookYear >= parseInt(yearFilter.from)) &&
                    (!yearFilter.to || bookYear <= parseInt(yearFilter.to));

                const matchesPages = (!pagesFilter.min || product.details.pages >= parseInt(pagesFilter.min)) &&
                    (!pagesFilter.max || product.details.pages <= parseInt(pagesFilter.max));

                matchesBookFilters = matchesGenre && matchesAuthor && matchesLanguage &&
                    matchesPublisher && matchesYear && matchesPages;
            }

            // Stationary specific filters
            let matchesStationaryFilters = true;
            if (isStationaryProduct(product)) {
                const matchesBrand = brandFilter === 'all' || product.details.brand === brandFilter;
                const matchesColor = colorFilter === 'all' || (product.details.color && product.details.color.includes(colorFilter));
                const matchesMaterial = materialFilter === 'all' || product.details.material === materialFilter;
                const matchesStType = stationaryTypeFilter === 'all' || product.details.type === stationaryTypeFilter;

                matchesStationaryFilters = matchesBrand && matchesColor && matchesMaterial && matchesStType;
            }

            // Flower specific filters
            let matchesFlowerFilters = true;
            if (isFlowerProduct(product)) {
                const matchesFlowerColor = flowerColorFilter === 'all' || product.details.color === flowerColorFilter;
                const matchesSeason = seasonFilter === 'all' || product.details.season === seasonFilter;

                const matchesFreshness = (!freshnessFilter.min || product.details.freshness >= parseInt(freshnessFilter.min)) &&
                    (!freshnessFilter.max || product.details.freshness <= parseInt(freshnessFilter.max));

                const matchesLifespan = (!lifespanFilter.min || product.details.lifespan >= parseInt(lifespanFilter.min)) &&
                    (!lifespanFilter.max || product.details.lifespan <= parseInt(lifespanFilter.max));

                matchesFlowerFilters = matchesFlowerColor && matchesSeason && matchesFreshness && matchesLifespan;
            }

            return matchesCategory && matchesSearch && matchesPrice &&
                //matchesRating && matchesStock && matchesDiscount && matchesBookFilters &&
                matchesStationaryFilters && matchesFlowerFilters;
        } catch (err) {
            console.error('Error filtering product:', product, err);
            return false;
        }
    });

    // Sort products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'rating': return a.price
            // return (b.averageRating || 0) - (a.averageRating || 0);
            case 'newest':
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'name':
            default:
                return a.name.localeCompare(b.name);
        }
    });

    const paginatedProducts = sortedProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

    // Clear all filters
    const clearAllFilters = () => {
        setSearch('');
        setCategoryFilter('all');
        setSubcategoryFilter('all');
        setPriceRange({ min: '', max: '' });
        setRatingFilter(0);
        setStockFilter('all');
        setDiscountFilter(false);
        setSortBy('name');

        // Clear book filters
        setGenreFilter('all');
        setAuthorFilter('');
        setLanguageFilter('all');
        setPublisherFilter('all');
        setYearFilter({ from: '', to: '' });
        setPagesFilter({ min: '', max: '' });

        // Clear stationary filters
        setBrandFilter('all');
        setColorFilter('all');
        setMaterialFilter('all');
        setStationaryTypeFilter('all');

        // Clear flower filters
        setFlowerColorFilter('all');
        setSeasonFilter('all');
        setFreshnessFilter({ min: '', max: '' });
        setLifespanFilter({ min: '', max: '' });

        setCurrentPage(1);
    };

    if (loading) {
        return (
            <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f6eeec 0%, #fefdfc 50%, #f2ded9 100%)' }}>
                <Header />
                <main className="max-w-7xl mx-auto px-4 md:px-6 py-32">
                    <LoadingSpinner message="Loading amazing products..." />
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
                        <Package className="w-16 h-16 mx-auto mb-4 text-[#9a6a63]" />
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
                        <Package className="text-[#9a6a63]" size={48} />
                        Premium Products Collection
                    </h1>
                    <p className="text-[#9a6a63]/80 text-lg max-w-2xl mx-auto">
                        Discover our curated collection of books, stationery, and fresh flowers
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
                                    <option value="price-low">Price (Low to High)</option>
                                    <option value="price-high">Price (High to Low)</option>
                                    <option value="rating">Highest Rated</option>
                                    <option value="newest">Newest First</option>
                                </select>
                            </div>

                            {/* Category Filter */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                    <Package size={16} />
                                    Categories
                                </h3>
                                <div className="space-y-2">
                                    {[
                                        { value: 'all', label: 'All Products', icon: <PackageOpen className='text-amber-900 bg-orange-300 h-7 w-7 p-0.5 rounded-xl' /> },
                                        { value: 'book', label: 'Books', icon: <Book className='text-sky-900 bg-blue-300 h-7 w-7 p-1 rounded-xl' /> },
                                        { value: 'stationary', label: 'Stationery', icon: <Pencil className='text-green-900 bg-emerald-300 h-7 w-7 p-1 rounded-xl' /> },
                                        { value: 'flower', label: 'Flowers', icon: <Flower className='text-pink-900 bg-red-300 h-7 w-7 p-1 rounded-xl' /> }
                                    ].map(category => (
                                        <button
                                            key={category.value}
                                            onClick={() => setCategoryFilter(category.value)}
                                            className={`w-full text-left px-4 py-3 rounded-xl transition-all ${categoryFilter === category.value
                                                ? 'text-white shadow-lg transform scale-105'
                                                : 'bg-white/50 text-[#9a6a63] hover:bg-white/80 hover:shadow-md'
                                                }`}
                                            style={categoryFilter === category.value ? { background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' } : {}}
                                        >
                                            <span className="font-medium flex items-center gap-2">
                                                {category.icon}
                                                {category.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Book Specific Filters */}
                            {(categoryFilter === 'all' || categoryFilter === 'book') && (
                                <>
                                    <div className="mb-6">
                                        <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                            <Pencil size={16} />
                                            Type
                                        </h3>
                                        <select
                                            value={stationaryTypeFilter}
                                            onChange={(e) => setStationaryTypeFilter(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-[#c1a5a2]/30 focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white text-neutral-700"
                                        >
                                            <option value="all">All Types</option>
                                            {/* {getUniqueStationaryTypes().map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))} */}
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* Flower Specific Filters */}
                            {(categoryFilter === 'all' || categoryFilter === 'flower') && (
                                <>
                                    <div className="mb-6">
                                        <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                            <Palette size={16} />
                                            Flower Color
                                        </h3>
                                        <select
                                            value={flowerColorFilter}
                                            onChange={(e) => setFlowerColorFilter(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-[#c1a5a2]/30 focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white text-neutral-700"
                                        >
                                            <option value="all">All Colors</option>
                                            {/* {getUniqueFlowerColors().map(color => (
                                                <option key={color} value={color}>{color}</option>
                                            ))} */}
                                        </select>
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                            <Leaf size={16} />
                                            Season
                                        </h3>
                                        <select
                                            value={seasonFilter}
                                            onChange={(e) => setSeasonFilter(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-[#c1a5a2]/30 focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white text-neutral-700"
                                        >
                                            <option value="all">All Seasons</option>
                                            {/* {getUniqueSeasons().map(season => (
                                                <option key={season} value={season}>{season}</option>
                                            ))} */}
                                        </select>
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                            <Timer size={16} />
                                            Freshness (%)
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={freshnessFilter.min}
                                                onChange={(e) => setFreshnessFilter(prev => ({ ...prev, min: e.target.value }))}
                                                className="px-3 py-2 text-sm border border-[#c1a5a2]/30 rounded-lg focus:border-[#9a6a63] text-neutral-700"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={freshnessFilter.max}
                                                onChange={(e) => setFreshnessFilter(prev => ({ ...prev, max: e.target.value }))}
                                                className="px-3 py-2 text-sm border border-[#c1a5a2]/30 rounded-lg focus:border-[#9a6a63] text-neutral-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                            <Calendar size={16} />
                                            Lifespan (days)
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={lifespanFilter.min}
                                                onChange={(e) => setLifespanFilter(prev => ({ ...prev, min: e.target.value }))}
                                                className="px-3 py-2 text-sm border border-[#c1a5a2]/30 rounded-lg focus:border-[#9a6a63] text-neutral-700"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={lifespanFilter.max}
                                                onChange={(e) => setLifespanFilter(prev => ({ ...prev, max: e.target.value }))}
                                                className="px-3 py-2 text-sm border border-[#c1a5a2]/30 rounded-lg focus:border-[#9a6a63] text-neutral-700"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Price Range Filter */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-[#9a6a63] mb-3">Price Range</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min Price"
                                        value={priceRange.min}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                        className="px-3 py-2 text-sm border border-[#c1a5a2]/30 rounded-lg focus:border-[#9a6a63] text-neutral-700"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max Price"
                                        value={priceRange.max}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                        className="px-3 py-2 text-sm border border-[#c1a5a2]/30 rounded-lg focus:border-[#9a6a63] text-neutral-700"
                                    />
                                </div>
                            </div>

                            {/* Rating Filter */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                    <Star size={16} />
                                    Minimum Rating
                                </h3>
                                <select
                                    value={ratingFilter}
                                    onChange={(e) => setRatingFilter(parseInt(e.target.value))}
                                    className="w-full px-4 py-3 rounded-xl border border-[#c1a5a2]/30 focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white text-neutral-700"
                                >
                                    <option value={0}>All Ratings</option>
                                    <option value={1}>1+ Stars</option>
                                    <option value={2}>2+ Stars</option>
                                    <option value={3}>3+ Stars</option>
                                    <option value={4}>4+ Stars</option>
                                    <option value={5}>5 Stars</option>
                                </select>
                            </div>

                            {/* Stock Filter */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                    <PackageOpen size={16} />
                                    Stock Status
                                </h3>
                                <select
                                    value={stockFilter}
                                    onChange={(e) => setStockFilter(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-[#c1a5a2]/30 focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white text-neutral-700"
                                >
                                    <option value="all">All Items</option>
                                    <option value="in-stock">In Stock</option>
                                    <option value="out-of-stock">Out of Stock</option>
                                </select>
                            </div>

                            {/* Discount Filter */}
                            <div className="mb-6">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={discountFilter}
                                        onChange={(e) => setDiscountFilter(e.target.checked)}
                                        className="w-5 h-5 text-[#9a6a63] rounded focus:ring-[#9a6a63]"
                                    />
                                    <span className="text-[#9a6a63] font-medium">On Sale Only</span>
                                </label>
                            </div>

                            {/* Clear Filters Button */}
                            <button
                                onClick={clearAllFilters}
                                className="w-full px-6 py-3 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Search and Mobile Filter Toggle */}
                        <div className="mb-8">
                            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9a6a63]/60" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search products, authors, brands..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-[#c1a5a2]/30 focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white/90 backdrop-blur-sm text-neutral-700 shadow-lg"
                                    />
                                </div>
                                <button
                                    onClick={() => setShowFilters(true)}
                                    className="lg:hidden px-6 py-4 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                                    style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}
                                >
                                    <Filter size={20} />
                                    Filters
                                </button>
                            </div>
                        </div>

                        {/* Results Summary */}
                        <div className="mb-8 flex items-center justify-between">
                            <p className="text-[#9a6a63]/80">
                                Showing {paginatedProducts.length} of {sortedProducts.length} products
                            </p>
                            <div className="text-sm text-[#9a6a63]/60">
                                Page {currentPage} of {totalPages}
                            </div>
                        </div>

                        {/* Products Grid cu ProductCard unificat */}
                        {paginatedProducts.length === 0 ? (
                            <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl">
                                <Package className="w-16 h-16 mx-auto mb-4 text-[#9a6a63]/60" />
                                <h3 className="text-xl font-semibold text-[#9a6a63] mb-2">No products found</h3>
                                <p className="text-[#9a6a63]/70 mb-6">Try adjusting your filters or search terms</p>
                                <button
                                    onClick={clearAllFilters}
                                    className="px-6 py-3 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg"
                                    style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.map((product) => (
                                    <Link href={`/products/${product._id}`} key={product._id}>
                                        <ProductCard
                                            product={product}
                                            showDetailedInfo={false}
                                            asLink={true}
                                        />
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className={`px-4 py-2 rounded-lg transition-all ${currentPage === 1
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-white text-[#9a6a63] hover:bg-[#9a6a63] hover:text-white border border-[#c1a5a2]/30'
                                            }`}
                                    >
                                        Previous
                                    </button>

                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const pageNum = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i));
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`px-4 py-2 rounded-lg transition-all ${currentPage === pageNum
                                                    ? 'text-white shadow-lg'
                                                    : 'bg-white text-[#9a6a63] hover:bg-[#9a6a63] hover:text-white border border-[#c1a5a2]/30'
                                                    }`}
                                                style={currentPage === pageNum ? { background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' } : {}}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className={`px-4 py-2 rounded-lg transition-all ${currentPage === totalPages
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-white text-[#9a6a63] hover:bg-[#9a6a63] hover:text-white border border-[#c1a5a2]/30'
                                            }`}
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