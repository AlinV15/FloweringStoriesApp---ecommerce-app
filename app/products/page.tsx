'use client';

import { useState, useEffect } from 'react';
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
import { useCartStore } from '../stores/CartStore';

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
    averageRating: number | 0;
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
    const [cart, setCart] = useState<{ [key: string]: number }>({});
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
    const addItem = useCartStore(state => state.addItem);

    // Funcția pentru a adăuga în coș
    const handleAddToCart = (product: Product) => {
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

        // Optionally, show a toast or notification here if needed, but addItem does not return a result.
    };

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

    // Get unique values for filters
    const getUniqueSubcategories = () => {
        const subcats = products.flatMap(p => p.subcategories || []);
        return [...new Set(subcats.map(sub => sub.name))].filter(Boolean);
    };

    // Book filters
    const getUniqueGenres = () => {
        const books = products.filter(p => p.typeRef === 'Book');
        return [...new Set(books.map(book => (book.details as BookDetails).genre).filter(Boolean))];
    };

    const getUniqueAuthors = () => {
        const books = products.filter(p => p.typeRef === 'Book');
        return [...new Set(books.map(book => (book.details as BookDetails).author).filter(Boolean))];
    };

    const getUniqueLanguages = () => {
        const books = products.filter(p => p.typeRef === 'Book');
        return [...new Set(books.map(book => (book.details as BookDetails).language).filter(Boolean))];
    };

    const getUniquePublishers = () => {
        const books = products.filter(p => p.typeRef === 'Book');
        return [...new Set(books.map(book => (book.details as BookDetails).publisher).filter(Boolean))];
    };

    // Stationary filters
    const getUniqueBrands = () => {
        const stationaries = products.filter(p => p.typeRef === 'Stationary');
        return [...new Set(stationaries.map(item => (item.details as StationaryDetails).brand).filter(Boolean))];
    };

    const getUniqueColors = () => {
        const stationaries = products.filter(p => p.typeRef === 'Stationary');
        const allColors = stationaries.flatMap(item => (item.details as StationaryDetails).color || []);
        return [...new Set(allColors)].filter(Boolean);
    };

    const getUniqueMaterials = () => {
        const stationaries = products.filter(p => p.typeRef === 'Stationary');
        return [...new Set(stationaries.map(item => (item.details as StationaryDetails).material).filter(Boolean))];
    };

    const getUniqueStationaryTypes = () => {
        const stationaries = products.filter(p => p.typeRef === 'Stationary');
        return [...new Set(stationaries.map(item => (item.details as StationaryDetails).type).filter(Boolean))];
    };

    // Flower filters
    const getUniqueFlowerColors = () => {
        const flowers = products.filter(p => p.typeRef === 'Flower');
        return [...new Set(flowers.map(flower => (flower.details as FlowerDetails).color).filter(Boolean))];
    };

    const getUniqueSeasons = () => {
        const flowers = products.filter(p => p.typeRef === 'Flower');
        return [...new Set(flowers.map(flower => (flower.details as FlowerDetails).season).filter(Boolean))];
    };

    // Filter products
    const filteredProducts = products.filter(product => {
        try {
            const matchesCategory = categoryFilter === 'all' || product.type === categoryFilter;

            const matchesSearch = product.name?.toLowerCase().includes(search.toLowerCase()) ||
                (product.typeRef === 'Book' &&
                    (product.details as BookDetails).author?.toLowerCase().includes(search.toLowerCase())) ||
                (product.typeRef === 'Stationary' &&
                    (product.details as StationaryDetails).brand?.toLowerCase().includes(search.toLowerCase())) ||
                (product.typeRef === 'Flower' &&
                    (product.details as FlowerDetails).color?.toLowerCase().includes(search.toLowerCase()));

            const matchesSubcategory = subcategoryFilter === 'all' ||
                (product.subcategories && product.subcategories.some(sub => sub.name === subcategoryFilter));

            const minPrice = priceRange.min ? Math.max(0, parseFloat(priceRange.min)) : 0;
            const maxPrice = priceRange.max ? Math.max(0, parseFloat(priceRange.max)) : Infinity;
            const productPrice = typeof product.price === 'number' ? product.price : 0;
            const matchesPrice = productPrice >= minPrice && productPrice <= maxPrice;

            const matchesRating = ratingFilter === 0 || (product.averageRating || 0) >= ratingFilter;

            const matchesStock = stockFilter === 'all' ||
                (stockFilter === 'in-stock' && product.stock > 0) ||
                (stockFilter === 'out-of-stock' && product.stock === 0);

            const matchesDiscount = !discountFilter || product.discount > 0;

            // Book specific filters
            let matchesBookFilters = true;
            if (product.typeRef === 'Book') {
                const bookDetails = product.details as BookDetails;
                const matchesGenre = genreFilter === 'all' || bookDetails.genre === genreFilter;
                const matchesAuthor = !authorFilter || bookDetails.author?.toLowerCase().includes(authorFilter.toLowerCase());
                const matchesLanguage = languageFilter === 'all' || bookDetails.language === languageFilter;
                const matchesPublisher = publisherFilter === 'all' || bookDetails.publisher === publisherFilter;

                const bookYear = new Date(bookDetails.publicationDate).getFullYear();
                const matchesYear = (!yearFilter.from || bookYear >= parseInt(yearFilter.from)) &&
                    (!yearFilter.to || bookYear <= parseInt(yearFilter.to));

                const matchesPages = (!pagesFilter.min || bookDetails.pages >= parseInt(pagesFilter.min)) &&
                    (!pagesFilter.max || bookDetails.pages <= parseInt(pagesFilter.max));

                matchesBookFilters = matchesGenre && matchesAuthor && matchesLanguage &&
                    matchesPublisher && matchesYear && matchesPages;
            }

            // Stationary specific filters
            let matchesStationaryFilters = true;
            if (product.typeRef === 'Stationary') {
                const stationaryDetails = product.details as StationaryDetails;
                const matchesBrand = brandFilter === 'all' || stationaryDetails.brand === brandFilter;
                const matchesColor = colorFilter === 'all' || (stationaryDetails.color && stationaryDetails.color.includes(colorFilter));
                const matchesMaterial = materialFilter === 'all' || stationaryDetails.material === materialFilter;
                const matchesStType = stationaryTypeFilter === 'all' || stationaryDetails.type === stationaryTypeFilter;

                matchesStationaryFilters = matchesBrand && matchesColor && matchesMaterial && matchesStType;
            }

            // Flower specific filters
            let matchesFlowerFilters = true;
            if (product.typeRef === 'Flower') {
                const flowerDetails = product.details as FlowerDetails;
                const matchesFlowerColor = flowerColorFilter === 'all' || flowerDetails.color === flowerColorFilter;
                const matchesSeason = seasonFilter === 'all' || flowerDetails.season === seasonFilter;

                const matchesFreshness = (!freshnessFilter.min || flowerDetails.freshness >= parseInt(freshnessFilter.min)) &&
                    (!freshnessFilter.max || flowerDetails.freshness <= parseInt(freshnessFilter.max));

                const matchesLifespan = (!lifespanFilter.min || flowerDetails.lifespan >= parseInt(lifespanFilter.min)) &&
                    (!lifespanFilter.max || flowerDetails.lifespan <= parseInt(lifespanFilter.max));

                matchesFlowerFilters = matchesFlowerColor && matchesSeason && matchesFreshness && matchesLifespan;
            }

            return matchesCategory && matchesSearch && matchesSubcategory && matchesPrice &&
                matchesRating && matchesStock && matchesDiscount && matchesBookFilters &&
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

                            {/* Category Filter - Button Style */}
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

                            {/* Subcategory Filter */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                    <Tag size={16} />
                                    Subcategory
                                </h3>
                                <select
                                    value={subcategoryFilter}
                                    onChange={(e) => setSubcategoryFilter(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-[#c1a5a2]/30 focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white text-neutral-700"
                                >
                                    <option value="all">All Subcategories</option>
                                    {getUniqueSubcategories().map(subcategory => (
                                        <option key={subcategory} value={subcategory}>{subcategory}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Conditional Filters Based on Category */}
                            {/* Book Specific Filters */}
                            {(categoryFilter === 'all' || categoryFilter === 'book') && (
                                <>
                                    <div className="mb-6">
                                        <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                            <BookOpen size={16} />
                                            Genre
                                        </h3>
                                        <select
                                            value={genreFilter}
                                            onChange={(e) => setGenreFilter(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-[#c1a5a2]/30 focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white text-neutral-700"
                                        >
                                            <option value="all">All Genres</option>
                                            {getUniqueGenres().map(genre => (
                                                <option key={genre} value={genre}>{genre}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                            <User size={16} />
                                            Author
                                        </h3>
                                        <input
                                            type="text"
                                            placeholder="Search by author..."
                                            value={authorFilter}
                                            onChange={(e) => setAuthorFilter(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-[#c1a5a2]/30 focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white text-neutral-700"
                                        />
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                            <Languages size={16} />
                                            Language
                                        </h3>
                                        <select
                                            value={languageFilter}
                                            onChange={(e) => setLanguageFilter(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-[#c1a5a2]/30 focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white text-neutral-700"
                                        >
                                            <option value="all">All Languages</option>
                                            {getUniqueLanguages().map(language => (
                                                <option key={language} value={language}>{language}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                            <Building size={16} />
                                            Publisher
                                        </h3>
                                        <select
                                            value={publisherFilter}
                                            onChange={(e) => setPublisherFilter(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-[#c1a5a2]/30 focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white text-neutral-700"
                                        >
                                            <option value="all">All Publishers</option>
                                            {getUniquePublishers().map(publisher => (
                                                <option key={publisher} value={publisher}>{publisher}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                            <Calendar size={16} />
                                            Publication Year
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="number"
                                                placeholder="From"
                                                value={yearFilter.from}
                                                onChange={(e) => setYearFilter(prev => ({ ...prev, from: e.target.value }))}
                                                className="px-3 py-2 text-sm border border-[#c1a5a2]/30 rounded-lg focus:border-[#9a6a63] text-neutral-700"
                                            />
                                            <input
                                                type="number"
                                                placeholder="To"
                                                value={yearFilter.to}
                                                onChange={(e) => setYearFilter(prev => ({ ...prev, to: e.target.value }))}
                                                className="px-3 py-2 text-sm border border-[#c1a5a2]/30 rounded-lg focus:border-[#9a6a63] text-neutral-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="font-semibold text-[#9a6a63] mb-3">Number of Pages</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={pagesFilter.min}
                                                onChange={(e) => setPagesFilter(prev => ({ ...prev, min: e.target.value }))}
                                                className="px-3 py-2 text-sm border border-[#c1a5a2]/30 rounded-lg focus:border-[#9a6a63] text-neutral-700"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={pagesFilter.max}
                                                onChange={(e) => setPagesFilter(prev => ({ ...prev, max: e.target.value }))}
                                                className="px-3 py-2 text-sm border border-[#c1a5a2]/30 rounded-lg focus:border-[#9a6a63] text-neutral-700"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Stationary Specific Filters */}
                            {(categoryFilter === 'all' || categoryFilter === 'stationary') && (
                                <>
                                    <div className="mb-6">
                                        <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                            <Building size={16} />
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

                                    <div className="mb-6">
                                        <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                            <Box size={16} />
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
                                            {getUniqueStationaryTypes().map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
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
                                            {getUniqueFlowerColors().map(color => (
                                                <option key={color} value={color}>{color}</option>
                                            ))}
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
                                            {getUniqueSeasons().map(season => (
                                                <option key={season} value={season}>{season}</option>
                                            ))}
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

                        {/* Products Grid */}
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
                                {paginatedProducts.map((product) => (
                                    <div
                                        key={product._id}
                                        className="group rounded-2xl overflow-hidden bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 border border-[#c1a5a2]/20 hover:border-[#9a6a63]/30 transform hover:-translate-y-2"
                                    >
                                        <div className="relative aspect-square overflow-hidden">
                                            <Image
                                                src={product.image || '/api/placeholder/300/250'}
                                                alt={product.name || 'Product'}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/placeholder-product.jpg';
                                                }}
                                            />
                                            {/* Category Icon */}
                                            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold border border-[#c1a5a2]/30">
                                                {product.typeRef === 'Book' ? (
                                                    <Book className='text-sky-900 bg-blue-300 h-7 w-7 p-1 rounded-xl' />
                                                ) : product.typeRef === 'Stationary' ? (
                                                    <Pencil className='text-green-900 bg-emerald-300 h-7 w-7 p-1 rounded-xl' />
                                                ) : (
                                                    <Flower className='text-pink-900 bg-red-300 h-7 w-7 p-1 rounded-xl' />
                                                )}
                                            </div>
                                            {/* Discount Badge */}
                                            {product.discount > 0 && (
                                                <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
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

                                        <div className="p-5">
                                            <Link href={`/products/${product._id}`} className="block mb-3">
                                                <h3 className="text-[#9a6a63] font-semibold mb-2 line-clamp-2 group-hover:text-[#9a6a63]/80 transition">
                                                    {product.name}
                                                </h3>
                                            </Link>

                                            {/* Product specific details */}
                                            {product.typeRef === 'Book' && product.details && (
                                                <p className="text-sm text-[#9a6a63]/70 mb-2">
                                                    by {(product.details as BookDetails).author || 'Unknown Author'}
                                                </p>
                                            )}
                                            {product.typeRef === 'Stationary' && product.details && (
                                                <p className="text-sm text-[#9a6a63]/70 mb-2">
                                                    {(product.details as StationaryDetails).brand || 'Unknown Brand'}
                                                </p>
                                            )}
                                            {product.typeRef === 'Flower' && product.details && (
                                                <p className="text-sm text-[#9a6a63]/70 mb-2">
                                                    {(product.details as FlowerDetails).color || 'Unknown Color'}
                                                </p>
                                            )}

                                            {/* Rating */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <StarRating rating={product.averageRating || 0} />
                                                <span className="text-sm text-[#9a6a63]/70">
                                                    ({product.reviews?.length || 0})
                                                </span>
                                            </div>

                                            {/* Price and Add to Cart */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[#9a6a63] font-bold text-lg">
                                                        €{product.discount > 0
                                                            ? (product.price * (1 - product.discount / 100)).toFixed(2)
                                                            : product.price.toFixed(2)
                                                        }
                                                    </p>
                                                    {product.discount > 0 && (
                                                        <p className="text-gray-400 line-through text-sm">
                                                            €{product.price.toFixed(2)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons  -----------*/}
                                            <div className="flex gap-3">

                                                <button
                                                    onClick={() => handleAddToCart(product)}
                                                    disabled={product.stock === 0}
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