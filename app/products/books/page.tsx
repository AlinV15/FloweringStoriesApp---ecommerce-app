'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Link from 'next/link';
import { Book, Search, Star, Calendar, User, BookOpen, Languages, Building, ShoppingCart, Filter } from 'lucide-react';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { useCartStore } from '@/app/stores/CartStore';
import { useBooksStore, type BookProduct } from '@/app/stores/BookStore';

export default function BooksPage() {
    // Books store
    const {
        // Data
        paginatedBooks,
        loading,
        error,
        totalPages,
        uniqueGenres,
        uniqueLanguages,
        uniquePublishers,
        sortedBooks,

        // Filters
        search,
        genreFilter,
        authorFilter,
        languageFilter,
        publisherFilter,
        yearFilter,
        pagesFilter,
        priceRange,
        sortBy,
        currentPage,
        showFilters,

        // Actions
        fetchBooks,
        setSearch,
        setGenreFilter,
        setAuthorFilter,
        setLanguageFilter,
        setPublisherFilter,
        setYearFilter,
        setPagesFilter,
        setPriceRange,
        setSortBy,
        setCurrentPage,
        setShowFilters,
        clearAllFilters,
    } = useBooksStore();

    // Cart store
    const addItem = useCartStore(state => state.addItem);

    // Fetch books on component mount
    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

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

    // Add to cart handler
    const handleAddToCart = (product: BookProduct) => {
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

        // Show toast notification
        const toast = document.createElement('div');
        toast.className = 'fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        toast.textContent = `${product.name} added to cart!`;
        document.body.appendChild(toast);
        setTimeout(() => document.body.removeChild(toast), 3000);
    };

    if (loading) {
        return (
            <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f6eeec 0%, #fefdfc 50%, #f2ded9 100%)' }}>
                <Header />
                <main className="max-w-7xl mx-auto px-4 md:px-6 py-32">
                    <LoadingSpinner message="Loading amazing books..." />
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
                        <Book className="w-16 h-16 mx-auto mb-4 text-[#9a6a63]" />
                        <p className="text-red-500 mb-6 text-lg">Oops! {error}</p>
                        <button
                            onClick={fetchBooks}
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
                        <Book className="text-[#9a6a63]" size={48} />
                        Premium Books Collection
                    </h1>
                    <p className="text-[#9a6a63]/80 text-lg max-w-2xl mx-auto">
                        Discover our curated collection of books from various genres and renowned authors
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
                                    <option value="name">Title (A-Z)</option>
                                    <option value="author">Author (A-Z)</option>
                                    <option value="price-low">Price (Low to High)</option>
                                    <option value="price-high">Price (High to Low)</option>
                                    <option value="rating">Highest Rated</option>
                                    <option value="publication-date">Publication Date (Newest)</option>
                                    <option value="pages-low">Pages (Low to High)</option>
                                    <option value="pages-high">Pages (High to Low)</option>
                                    <option value="newest">Recently Added</option>
                                </select>
                            </div>

                            {/* Genre Filter */}
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
                                    {uniqueGenres.map((genre: string) => (
                                        <option key={genre} value={genre}>{genre}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Author Filter */}
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

                            {/* Language Filter */}
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
                                    {uniqueLanguages.map((language: string) => (
                                        <option key={language} value={language}>{language}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Publisher Filter */}
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
                                    {uniquePublishers.map((publisher: string) => (
                                        <option key={publisher} value={publisher}>{publisher}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Publication Year Filter */}
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
                                        onChange={(e) => setYearFilter({ ...yearFilter, from: e.target.value })}
                                        className="px-3 py-2 text-sm border border-[#c1a5a2]/30 rounded-lg focus:border-[#9a6a63] text-neutral-700"
                                    />
                                    <input
                                        type="number"
                                        placeholder="To"
                                        value={yearFilter.to}
                                        onChange={(e) => setYearFilter({ ...yearFilter, to: e.target.value })}
                                        className="px-3 py-2 text-sm border border-[#c1a5a2]/30 rounded-lg focus:border-[#9a6a63] text-neutral-700"
                                    />
                                </div>
                            </div>

                            {/* Pages Filter */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-[#9a6a63] mb-3">Number of Pages</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={pagesFilter.min}
                                        onChange={(e) => setPagesFilter({ ...pagesFilter, min: e.target.value })}
                                        className="px-3 py-2 text-sm border border-[#c1a5a2]/30 rounded-lg focus:border-[#9a6a63] text-neutral-700"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={pagesFilter.max}
                                        onChange={(e) => setPagesFilter({ ...pagesFilter, max: e.target.value })}
                                        className="px-3 py-2 text-sm border border-[#c1a5a2]/30 rounded-lg focus:border-[#9a6a63] text-neutral-700"
                                    />
                                </div>
                            </div>

                            {/* Price Filter */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-[#9a6a63] mb-3">Price Range (€)</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={priceRange.min}
                                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                        className="px-3 py-2 text-sm border border-[#c1a5a2]/30 rounded-lg focus:border-[#9a6a63] text-neutral-700"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={priceRange.max}
                                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
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
                                    <span className="font-semibold text-[#9a6a63]">{sortedBooks.length}</span> book{sortedBooks.length !== 1 ? 's' : ''} found
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* Books Section */}
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
                                    <Book className="text-[#9a6a63]" />
                                    Books Collection
                                </h2>
                            </div>
                            <div className="flex items-center gap-4 relative">
                                <input
                                    type="text"
                                    placeholder="Search books, authors, genres..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full sm:w-80 px-6 py-3 rounded-xl border border-[#c1a5a2]/30 focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white shadow-sm placeholder:text-gray-400 text-neutral-700"
                                />
                                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <Search size={20} />
                                </div>
                            </div>
                        </div>

                        {paginatedBooks.length === 0 ? (
                            <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-lg">
                                <Book className="w-24 h-24 mx-auto mb-6 text-[#9a6a63]/50" />
                                <p className="text-[#9a6a63]/80 mb-6 text-xl">No books found matching your criteria.</p>
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
                                {paginatedBooks.map((book: BookProduct) => (
                                    <div
                                        key={book._id}
                                        className="group rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 border border-[#c1a5a2]/20 hover:border-[#9a6a63]/40 transform hover:-translate-y-2"
                                    >
                                        <div className="relative aspect-[3/4] overflow-hidden">
                                            <Image
                                                src={book.image || '/placeholder-book.jpg'}
                                                alt={book.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-[#9a6a63] border border-[#c1a5a2]/30">
                                                <Book size={16} />
                                            </div>
                                            {book.discount > 0 && (
                                                <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                                    -{book.discount}%
                                                </div>
                                            )}
                                            {book.stock === 0 && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                                                        Out of Stock
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-5">
                                            <Link href={`/products/${book._id}`} className="block mb-3">
                                                <h3 className="text-gray-800 font-semibold mb-2 line-clamp-2 group-hover:text-[#9a6a63] transition">
                                                    {book.name}
                                                </h3>
                                            </Link>

                                            <p className="text-sm text-[#9a6a63]/80 mb-2 flex items-center gap-1">
                                                <User size={14} />
                                                by {book.details.author}
                                            </p>

                                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                                <span className="px-2 py-1 rounded-full text-white" style={{ backgroundColor: '#c1a5a2' }}>
                                                    {book.details.genre}
                                                </span>
                                                <span className="px-2 py-1 rounded-full bg-[#f2ded9] text-[#9a6a63]">
                                                    {book.details.pages}p
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 mb-3">
                                                <StarRating rating={book.averageRating || 0} />
                                                <span className="text-sm text-gray-600">
                                                    ({book.reviews?.length || 0})
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[#9a6a63] font-bold text-lg">
                                                        €{book.discount > 0
                                                            ? (book.price * (1 - book.discount / 100)).toFixed(2)
                                                            : book.price.toFixed(2)
                                                        }
                                                    </p>
                                                    {book.discount > 0 && (
                                                        <p className="text-gray-400 line-through text-sm">
                                                            €{book.price.toFixed(2)}
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleAddToCart(book)}
                                                    disabled={book.stock === 0}
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
                            <div className="flex justify-center mt-12">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 text-[#9a6a63] border border-[#c1a5a2]/30 rounded-xl hover:bg-[#9a6a63] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`px-4 py-2 rounded-xl transition-all ${currentPage === pageNum
                                                ? 'bg-[#9a6a63] text-white shadow-lg'
                                                : 'text-[#9a6a63] border border-[#c1a5a2]/30 hover:bg-[#9a6a63] hover:text-white'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 text-[#9a6a63] border border-[#c1a5a2]/30 rounded-xl hover:bg-[#9a6a63] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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