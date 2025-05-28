'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Link from 'next/link';
import { Book, CircleCheckBig, Flower, Package, PackageOpen, Pencil, Search, Star, StarHalf, Tag, XCircle } from 'lucide-react';
import { FaJournalWhills } from 'react-icons/fa';
import { PencilIcon } from '@heroicons/react/20/solid';

// Updated types to match your actual API response structure
interface Product {
    _id: string;
    name: string;
    price: number;
    type: "book" | "stationary" | "flower";
    subcategories?: Array<{
        _id: string;
        name: string;
        description: string;
        image: string;
        type: string;
    }>;
    image: string;
    typeRef: 'Book' | 'Stationary' | 'Flower';
    refId: string;
    stock: number;
    discount: number;
    Description?: string;
    details: BookDetails | StationaryDetails | FlowerDetails;
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

interface BookDetails {
    author: string;
    pages: number;
    isbn: string;
    publisher: string;
    genre: string;
    language: string;
    publicationDate: Date;
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

interface FlowerDetails {
    color: string;
    freshness: number;
    lifespan: number;
    season: string;
    careInstructions: string;
    expiryDate: Date;
}

interface APIResponse {
    products: Product[];
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [subFilters, setSubFilters] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [sortBy, setSortBy] = useState('name');
    const [ratingFilter, setRatingFilter] = useState(0);
    const [stockFilter, setStockFilter] = useState('all');
    const [discountFilter, setDiscountFilter] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [cart, setCart] = useState<{ [key: string]: number }>({});
    const [srcIcon, setSrcIcon] = useState<boolean>(false);
    const itemsPerPage = 12;

    // Fetch products from API
    useEffect(() => {
        async function fetchProducts() {
            try {
                setLoading(true);
                const response = await fetch('/api/product');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data: APIResponse = await response.json();

                const productsWithReviews = (data.products || []).map(product => {
                    const reviews = product.reviews || [];
                    const averageRating = reviews.length > 0
                        ? reviews.reduce((acc: number, review: Review) => acc + review.rating, 0) / reviews.length
                        : 0;

                    return {
                        ...product,
                        reviews,
                        averageRating
                    };
                });

                const validProducts = productsWithReviews.filter(product =>
                    product &&
                    typeof product === 'object' &&
                    product._id &&
                    product.name &&
                    typeof product.price === 'number'
                );

                setProducts(validProducts);
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch products');
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);


    // Add to cart functionality
    const addToCart = (productId: string) => {
        setCart(prev => ({
            ...prev,
            [productId]: (prev[productId] || 0) + 1
        }));

        // Show success message (you can replace with toast notification)
        const product = products.find(p => p._id === productId);
        if (product) {
            alert(`${product.name} added to cart!`);
        }
    };

    // Get unique categories
    const categories = [...new Set(products.map(p => p.type))];

    const getSubcategoriesForCategory = (category: string) => {
        const categoryProducts = products.filter(p => p.type === category);
        const allSubcategories = categoryProducts.flatMap(p =>
            (p.subcategories || []).map(sub => sub.name)
        );
        return [...new Set(allSubcategories.filter(Boolean))];
    };

    const toggleSubFilter = (sub: string) => {
        setSubFilters((prev) =>
            prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
        );
    };

    // Clear filters when category changes
    useEffect(() => {
        setSubFilters([]);
        setCurrentPage(1);
    }, [filter]);

    // Enhanced filter products
    const filteredProducts = products.filter(product => {
        try {
            const matchesCategory = filter === 'all' || product.type === filter;
            const matchesSearch = product.name?.toLowerCase().includes(search.toLowerCase()) ||
                (product.typeRef === 'Book' && product.details &&
                    (product.details as BookDetails).author?.toLowerCase().includes(search.toLowerCase()));

            const matchesSub = subFilters.length === 0 ||
                (product.subcategories && product.subcategories.some(sub =>
                    subFilters.includes(sub.name)
                ));

            const minPrice = priceRange.min ? Math.max(0, parseFloat(priceRange.min)) : 0;
            const maxPrice = priceRange.max ? Math.max(0, parseFloat(priceRange.max)) : Infinity;
            const productPrice = typeof product.price === 'number' ? product.price : 0;
            const matchesPrice = productPrice >= minPrice && productPrice <= maxPrice;

            // Verifică și filtrează pe baza ratingului
            const matchesRating = ratingFilter === 0 || (product.averageRating || 0) >= ratingFilter;

            // Filtrarea produselor pe stoc
            const matchesStock = stockFilter === 'all' ||
                (stockFilter === 'in-stock' && product.stock > 0) ||
                (stockFilter === 'out-of-stock' && product.stock === 0);

            const matchesDiscount = !discountFilter || product.discount > 0;

            return matchesCategory && matchesSearch && matchesSub && matchesPrice &&
                matchesRating && matchesStock && matchesDiscount;
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
            case 'rating':
                return (b.averageRating || 0) - (a.averageRating || 0);
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

    // Get price range
    const getPriceRange = () => {
        if (products.length === 0) return { min: 0, max: 0 };
        try {
            const validPrices = products
                .map(p => p.price)
                .filter(price => typeof price === 'number' && !isNaN(price));

            if (validPrices.length === 0) return { min: 0, max: 0 };

            return {
                min: Math.min(...validPrices),
                max: Math.max(...validPrices)
            };
        } catch (err) {
            console.error('Error calculating price range:', err);
            return { min: 0, max: 0 };
        }
    };

    // Star rating component
    const StarRating = ({ rating }: { rating: number }) => {
        const stars = [];
        let fullStars = Math.floor(rating); // Stele pline
        console.log('Rating:', rating, 'Full Stars:', fullStars);

        // Verificăm dacă ratingul este 0
        if (rating === 0) {
            // Dacă ratingul este 0, toate stelele vor fi gri
            for (let i = 0; i < 5; i++) {
                stars.push(
                    <Star key={i} className="text-[#999999]" fill='#999999' size={24} />
                );
            }
        } else {
            // Generăm stelele pe baza ratingului
            for (let i = 0; i < 5; i++) {
                const isFullStar = i < fullStars;

                if (isFullStar) {
                    stars.push(
                        <Star key={i} className="text-[#ffff36]" fill='#ffff36' size={24} />
                    );
                } else {
                    stars.push(
                        <Star key={i} className="text-[#999999]" fill='#999999' size={24} />
                    );
                }
            }
        }

        return <div className="flex gap-1">{stars}</div>;
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50">
                <Header />
                <main className="max-w-7xl mx-auto px-4 md:px-6 py-32">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-rose-200 border-t-rose-500 mx-auto mb-6"></div>
                            <p className="text-rose-600 text-lg font-medium">Loading amazing products...</p>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50">
                <Header />
                <main className="max-w-7xl mx-auto px-4 md:px-6 py-32">
                    <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-rose-100">
                        <div className="text-6xl mb-4">😞</div>
                        <p className="text-red-500 mb-6 text-lg">Oops! {error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
                        >
                            Try Again
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const priceRange_calc = getPriceRange();

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50">
            <Header />

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-32">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-rose-600 to-orange-500 bg-clip-text text-transparent mb-4">
                        Discover Amazing Products
                    </h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Find the perfect items from our curated collection of books, stationery, and fresh flowers
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Enhanced Sidebar Filter */}
                    <aside className={`w-full lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-rose-100 shadow-xl sticky top-4">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-orange-800">Filters</h2>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="lg:hidden text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Category Filter */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3">Categories</h3>
                                <div className="space-y-2">
                                    {['all', ...categories].map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setFilter(cat)}
                                            className={`w-full text-left px-4 py-3 rounded-xl transition-all ${filter === cat
                                                ? 'bg-gradient-to-r from-[#631c28] to-rose-500 text-white shadow-lg transform scale-105'
                                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 hover:shadow-md'
                                                }`}
                                        >
                                            <span className="capitalize font-medium flex items-center gap-2">
                                                {cat === 'all' ? (<PackageOpen className='text-amber-900 bg-orange-300 h-7 w-7 p-0.5 rounded-xl' />) :
                                                    cat === 'book' ? (<Book className='text-sky-900 bg-blue-300 h-7 w-7 p-1 rounded-xl' />) :
                                                        cat === 'stationary' ? (<Pencil className='text-green-900 bg-emerald-300 h-7 w-7 p-1 rounded-xl ' />) :
                                                            cat === 'flower' ? (<Flower className='text-pink-900 bg-red-300 h-7 w-7 p-1 rounded-xl ' />) : cat}
                                                {cat === 'all' ? 'All Products' :
                                                    cat === 'book' ? 'Books' :
                                                        cat === 'stationary' ? 'Stationery' :
                                                            cat === 'flower' ? 'Flowers' : cat}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sort Filter */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3">Sort By</h3>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-rose-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 bg-white text-neutral-700 shadow-sm transition-all duration-300"
                                >
                                    <option value="name">Name (A-Z)</option>
                                    <option value="price-low">Price (Low to High)</option>
                                    <option value="price-high">Price (High to Low)</option>
                                    <option value="rating">Highest Rated</option>
                                    <option value="newest">Newest First</option>
                                </select>
                            </div>

                            {/* Price Filter */}
                            <div className="mb-6 text-neutral-700">
                                <h3 className="font-semibold text-gray-800 mb-3">Price Range (€)</h3>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder={`${priceRange_calc.min}`}
                                        value={priceRange.min}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                        className="px-3 py-2 text-sm border border-rose-200 rounded-lg focus:border-rose-400 focus:ring-1 focus:ring-rose-200"
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder={`${priceRange_calc.max}`}
                                        value={priceRange.max}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                        className="px-3 py-2 text-sm border border-rose-200 rounded-lg focus:border-rose-400 focus:ring-1 focus:ring-rose-200"
                                    />
                                </div>
                                <button
                                    onClick={() => setPriceRange({ min: '', max: '' })}
                                    className="text-sm text-rose-500 hover:text-rose-700 hover:underline"
                                >
                                    Clear price filter
                                </button>
                            </div>

                            {/* Rating Filter */}
                            <div className="mb-6 text-neutral-700">
                                <h3 className="font-semibold text-gray-800 mb-3">Minimum Rating</h3>
                                <div className="space-y-2">
                                    {[0, 3, 4, 4.5].map(rating => (
                                        <button
                                            key={rating}
                                            onClick={() => setRatingFilter(rating)}
                                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition ${ratingFilter === rating
                                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                                : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            {rating === 0 ? (
                                                <span>All Ratings</span>
                                            ) : (
                                                <>
                                                    <StarRating rating={rating} />
                                                    <span className="text-sm">& Up</span>
                                                </>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Stock Filter */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3">Availability</h3>
                                <div className="space-y-2 text-neutral-700">
                                    {[
                                        { value: 'all', label: 'All Products', icon: (<Package />) },
                                        { value: 'in-stock', label: 'In Stock', icon: (<CircleCheckBig className='text-green-700' />) },
                                        { value: 'out-of-stock', label: 'Out of Stock', icon: (<XCircle className="text-red-900" />) }
                                    ].map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => setStockFilter(option.value)}
                                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition ${stockFilter === option.value
                                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                                : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <span>{option.icon}</span>
                                            <span className="text-sm">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Discount Filter */}
                            <div className="mb-6">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={discountFilter}
                                        onChange={(e) => setDiscountFilter(e.target.checked)}
                                        className="w-5 h-5 text-rose-500 border-rose-300 rounded focus:ring-rose-200"
                                    />
                                    <span className="font-medium text-gray-800 flex gap-2 items-center"><Tag className='text-yellow-600' /> On Sale Only</span>
                                </label>
                            </div>

                            {/* Clear All Filters */}
                            <button
                                onClick={() => {
                                    setSearch('');
                                    setFilter('all');
                                    setSubFilters([]);
                                    setPriceRange({ min: '', max: '' });
                                    setRatingFilter(0);
                                    setStockFilter('all');
                                    setDiscountFilter(false);
                                    setSortBy('name');
                                    setCurrentPage(1);
                                }}
                                className="w-full px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105 shadow-lg font-medium"
                            >
                                Clear All Filters
                            </button>

                            <div className="mt-6 pt-4 border-t border-rose-200 text-center">
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold text-rose-600">{sortedProducts.length}</span> product{sortedProducts.length !== 1 ? 's' : ''} found
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* Products Section */}
                    <div className="flex-1">
                        {/* Top Bar */}
                        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-rose-100 shadow-lg">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setShowFilters(true)}
                                    className="lg:hidden px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition"
                                >
                                    Filters
                                </button>
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    {filter === 'all' ? (<PackageOpen className='text-amber-900 bg-orange-300 h-7 w-7 p-0.5 rounded-xl' />) :
                                        filter === 'book' ? (<Book className='text-sky-900 bg-blue-300 h-7 w-7 p-1 rounded-xl' />) :
                                            filter === 'stationary' ? (<Pencil className='text-green-900 bg-emerald-300 h-7 w-7 p-1 rounded-xl ' />) :
                                                filter === 'flower' ? (<Flower className='text-pink-900 bg-red-300 h-7 w-7 p-1 rounded-xl ' />) : filter.charAt(0).toUpperCase() + filter.slice(1)}
                                    {filter === 'all' ? 'All Products' :
                                        filter === 'book' ? 'Books' :
                                            filter === 'stationary' ? 'Stationery' :
                                                filter === 'flower' ? 'Flowers' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                                </h2>
                            </div>
                            <div className="flex items-center gap-4 relative">
                                <input
                                    type="text"
                                    placeholder={` Search products... `}
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value)
                                        if (e.target.value.trim() !== '') {
                                            setSrcIcon(true);
                                        } else {
                                            setSrcIcon(false);
                                        }
                                    }}
                                    className="w-full sm:w-80 px-6 py-3 rounded-xl border border-rose-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 bg-white shadow-sm placeholder:text-gray-400 transition-all duration-300 text-neutral-700"
                                />
                                <div className={`absolute left-1 top-1/2 transform -translate-y-1/2 text-gray-400 ${srcIcon ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
                                    <Search size={20} />
                                </div>
                            </div>
                        </div>

                        {paginatedProducts.length === 0 ? (
                            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-rose-100 shadow-lg">
                                <div className="text-8xl mb-6 flex items-center justify-center gap-3">
                                    <Search size={30} className='mb-6 text-gray-700' />
                                    <p className="text-gray-600 mb-6 text-xl">No products found matching your criteria.</p></div>

                                <button
                                    onClick={() => {
                                        setSearch('');
                                        setFilter('all');
                                        setSubFilters([]);
                                        setPriceRange({ min: '', max: '' });
                                        setRatingFilter(0);
                                        setStockFilter('all');
                                        setDiscountFilter(false);
                                        setCurrentPage(1);
                                        setSrcIcon(false);
                                    }}
                                    className="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg font-medium"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {paginatedProducts.map(product => (
                                    <div
                                        key={product._id}
                                        className="group rounded-2xl overflow-hidden bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 border border-rose-100 hover:border-rose-200 transform hover:-translate-y-2"
                                    >
                                        <div className="relative aspect-square overflow-hidden">
                                            <Image
                                                src={product.image || '/placeholder-product.jpg'}
                                                alt={product.name || 'Product'}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/placeholder-product.jpg';
                                                }}
                                            />
                                            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-rose-600 border border-rose-200">
                                                {product.typeRef === 'Book' ? (<Book className='text-sky-900 bg-blue-300 h-7 w-7 p-1 rounded-xl' />) :
                                                    product.typeRef === 'Stationary' ? (<Pencil className='text-green-900 bg-emerald-300 h-7 w-7 p-1 rounded-xl' />) : (<Flower className='text-pink-900 bg-red-300 h-7 w-7 p-1 rounded-xl' />)}
                                            </div>
                                            {product.discount > 0 && (
                                                <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                                    -{product.discount}%
                                                </div>
                                            )}
                                            {product.stock === 0 && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                                                        Out of Stock
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-5">
                                            <Link href={`/products/${product._id}`} className="block mb-3">
                                                <h3 className="text-gray-800 font-semibold mb-2 line-clamp-2 group-hover:text-rose-600 transition">
                                                    {product.name}
                                                </h3>
                                            </Link>

                                            {/* Product specific details */}
                                            {product.typeRef === 'Book' && product.details && (
                                                <p className="text-sm text-gray-600 mb-2">
                                                    by {(product.details as BookDetails).author || 'Unknown Author'}
                                                </p>
                                            )}
                                            {product.typeRef === 'Stationary' && product.details && (
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {(product.details as StationaryDetails).brand || 'Unknown Brand'}
                                                </p>
                                            )}
                                            {product.typeRef === 'Flower' && product.details && (
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {(product.details as FlowerDetails).color || 'Unknown Color'}
                                                </p>
                                            )}

                                            {/* Rating */}
                                            <div className="flex items-center gap-2 mb-3">

                                                <StarRating rating={product.averageRating || 0} />
                                                <span className="text-sm text-gray-600">
                                                    ({product.reviews?.length || 0})
                                                </span>
                                            </div>

                                            {/* Price and Add to Cart */}
                                            <div className="flex items-center flex-col justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-rose-600 font-bold text-lg">
                                                        €{typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
                                                    </p>
                                                    {product.discount > 0 && (
                                                        <p className="text-gray-400 line-through text-sm">
                                                            €{(product.price / (1 - product.discount / 100)).toFixed(2)}
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => addToCart(product._id)}
                                                    className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:bg-gradient-to-r hover:from-rose-600 hover:to-pink-600 transition-all transform hover:scale-105"
                                                >
                                                    Add to Cart
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        <div className="flex justify-center mt-12">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300"
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                <span className="text-gray-700">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300"
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
