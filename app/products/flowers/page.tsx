// app/flowers/page.tsx - Final integrated version with all enhancements
'use client';

import { useEffect, lazy, Suspense } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Link from 'next/link';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { Flower, ArrowUp } from 'lucide-react';

import { useProductStore } from '@/app/stores/ProductStore';
import { isFlowerProduct, Product } from '@/app/types/product';
import {
    useFlowerFilters,
    usePagination,
    useMobileFilters,
    useFlowerAnalytics
} from '@/app/hooks/useFlowerFilters';

// Lazy load components
const ProductCard = lazy(() => import("@/app/components/ProductCard"));
const FlowerFilters = lazy(() => import("@/app/components/FlowerFilters"));
const FlowerSearch = lazy(() => import("@/app/components/FlowerSearch"));

// Loading skeletons
const ProductCardSkeleton = () => (
    <div className="group rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm shadow-lg border border-[#e5d4ce]/20 animate-pulse">
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

const FiltersSkeleton = () => (
    <div className="w-full lg:w-1/4">
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-[#e5d4ce]/20 shadow-xl">
            <div className="h-6 bg-gray-200 rounded mb-6 w-1/2"></div>
            {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="mb-6">
                    <div className="h-4 bg-gray-200 rounded mb-3 w-1/3"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                </div>
            ))}
        </div>
    </div>
);

// Pagination component
const PaginationControls = ({
    currentPage,
    totalPages,
    onPageChange,
    getPaginationNumbers
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    getPaginationNumbers: () => number[];
}) => {
    if (totalPages <= 1) return null;

    return (
        <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-[#e5d4ce]/20 shadow-xl">
                {/* Previous Button */}
                <button
                    onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg transition-all font-medium ${currentPage === 1
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-white text-[#9c6b63] hover:bg-[#9c6b63] hover:text-white border border-[#e5d4ce]/30 hover:border-[#9c6b63] shadow-sm hover:shadow-md'
                        }`}
                >
                    Previous
                </button>

                {/* First page + ellipsis */}
                {currentPage > 3 && totalPages > 5 && (
                    <>
                        <button
                            onClick={() => onPageChange(1)}
                            className="px-4 py-2 rounded-lg transition-all bg-white text-[#9c6b63] hover:bg-[#9c6b63] hover:text-white border border-[#e5d4ce]/30 hover:border-[#9c6b63] shadow-sm hover:shadow-md font-medium"
                        >
                            1
                        </button>
                        <span className="px-2 text-[#9c6b63]/60">...</span>
                    </>
                )}

                {/* Page Numbers */}
                {getPaginationNumbers().map((pageNum) => (
                    <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`px-4 py-2 rounded-lg transition-all font-medium ${currentPage === pageNum
                            ? 'text-white shadow-lg transform scale-105'
                            : 'bg-white text-[#9c6b63] hover:bg-[#9c6b63] hover:text-white border border-[#e5d4ce]/30 hover:border-[#9c6b63] shadow-sm hover:shadow-md'
                            }`}
                        style={
                            currentPage === pageNum
                                ? { background: 'linear-gradient(135deg, #9c6b63 0%, #c1a5a2 100%)' }
                                : {}
                        }
                    >
                        {pageNum}
                    </button>
                ))}

                {/* Last page + ellipsis */}
                {currentPage < totalPages - 2 && totalPages > 5 && (
                    <>
                        <span className="px-2 text-[#9c6b63]/60">...</span>
                        <button
                            onClick={() => onPageChange(totalPages)}
                            className="px-4 py-2 rounded-lg transition-all bg-white text-[#9c6b63] hover:bg-[#9c6b63] hover:text-white border border-[#e5d4ce]/30 hover:border-[#9c6b63] shadow-sm hover:shadow-md font-medium"
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                {/* Next Button */}
                <button
                    onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg transition-all font-medium ${currentPage === totalPages
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-white text-[#9c6b63] hover:bg-[#9c6b63] hover:text-white border border-[#e5d4ce]/30 hover:border-[#9c6b63] shadow-sm hover:shadow-md'
                        }`}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

// Quick Stats Component
const QuickStats = ({ analytics }: { analytics: any }) => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-[#e5d4ce]/20 shadow-lg">
            <div className="text-2xl font-bold text-[#9c6b63]">{analytics.totalFlowers}</div>
            <div className="text-sm text-[#9c6b63]/70">Total Flowers</div>
        </div>
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-[#e5d4ce]/20 shadow-lg">
            <div className="text-2xl font-bold text-green-600">{analytics.inStock}</div>
            <div className="text-sm text-[#9c6b63]/70">In Stock</div>
        </div>
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-[#e5d4ce]/20 shadow-lg">
            <div className="text-2xl font-bold text-red-600">{analytics.onSale}</div>
            <div className="text-sm text-[#9c6b63]/70">On Sale</div>
        </div>
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-[#e5d4ce]/20 shadow-lg">
            <div className="text-2xl font-bold text-yellow-600">€{analytics.averagePrice.toFixed(0)}</div>
            <div className="text-sm text-[#9c6b63]/70">Avg Price</div>
        </div>
    </div>
);

// Scroll to top component
const ScrollToTop = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 p-3 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 z-40"
            style={{ background: 'linear-gradient(135deg, #9c6b63 0%, #c1a5a2 100%)' }}
            aria-label="Scroll to top"
        >
            <ArrowUp size={20} />
        </button>
    );
};

export default function FlowersPage() {
    // Store state and actions
    const {
        allProducts,
        loading,
        error,
        initialized,
        fetchProducts
    } = useProductStore();

    // Get only flower products
    const flowers = allProducts.filter(isFlowerProduct);

    // Initialize custom hooks
    const {
        filters,
        sortedFlowers,
        filterOptions,
        updateFilter,
        clearAllFilters,
    } = useFlowerFilters(flowers);

    const {
        currentPage,
        totalPages,
        paginatedItems: paginatedFlowers,
        getPaginationNumbers,
        goToPage,
    } = usePagination(sortedFlowers, 12);

    const {
        showFilters,
        toggleFilters,
        hideFilters,
        showFiltersMobile,
    } = useMobileFilters();

    const analytics = useFlowerAnalytics(flowers);

    // Fetch products only once when component mounts
    useEffect(() => {
        if (!initialized && !loading) {
            fetchProducts();
        }
    }, [initialized, loading, fetchProducts]);

    if (loading && !initialized) {
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

                {/* Quick Statistics */}
                <QuickStats analytics={analytics} />

                {/* Search Component */}
                <div className="mb-8">
                    <Suspense fallback={
                        <div className="h-16 bg-white/90 rounded-xl border border-[#e5d4ce]/20 animate-pulse"></div>
                    }>
                        <FlowerSearch
                            searchTerm={filters.search}
                            onSearchChange={(value) => updateFilter('search', value)}
                            flowers={flowers}
                            onShowFilters={showFiltersMobile}
                            showFiltersButton={true}
                        />
                    </Suspense>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filter */}
                    <Suspense fallback={<FiltersSkeleton />}>
                        <FlowerFilters
                            filters={filters}
                            filterOptions={filterOptions}
                            onFilterChange={updateFilter}
                            onClearFilters={clearAllFilters}
                            showFilters={showFilters}
                            onToggleFilters={hideFilters}
                            totalResults={sortedFlowers.length}
                            className={showFilters ? 'block' : 'hidden lg:block'}
                        />
                    </Suspense>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Results Summary */}
                        <div className="mb-8 flex items-center justify-between bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-[#e5d4ce]/20 shadow-lg">
                            <p className="text-[#9c6b63]/80">
                                Showing {paginatedFlowers.length} of {sortedFlowers.length} flowers
                                {flowers.length !== sortedFlowers.length && (
                                    <span className="text-gray-500 ml-2">
                                        (filtered from {flowers.length} total)
                                    </span>
                                )}
                            </p>
                            <div className="text-sm text-[#9c6b63]/60">
                                Page {currentPage} of {totalPages}
                            </div>
                        </div>

                        {/* Flowers Grid */}
                        {paginatedFlowers.length === 0 ? (
                            <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-2xl border border-[#e5d4ce]/20 shadow-xl">
                                <Flower className="w-16 h-16 mx-auto mb-4 text-[#9c6b63]/60" />
                                <h3 className="text-xl font-semibold text-[#9c6b63] mb-2">No flowers found</h3>
                                <p className="text-[#9c6b63]/70 mb-6">Try adjusting your filters or search terms</p>
                                <button
                                    onClick={clearAllFilters}
                                    className="px-6 py-3 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg"
                                    style={{ background: 'linear-gradient(135deg, #9c6b63 0%, #c1a5a2 100%)' }}
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {paginatedFlowers.map((flower: Product) => (
                                    <Link href={`/products/${flower._id}`} key={flower._id}>
                                        <Suspense fallback={<ProductCardSkeleton />}>
                                            <ProductCard
                                                product={flower}
                                                showDetailedInfo={false}
                                                asLink={true}
                                            />
                                        </Suspense>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={goToPage}
                            getPaginationNumbers={getPaginationNumbers}
                        />

                        {/* Page Info */}
                        {totalPages > 1 && (
                            <div className="mt-6 text-center bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-[#e5d4ce]/20 shadow-lg">
                                <p className="text-[#9c6b63]/80 text-sm">
                                    Showing {Math.min((currentPage - 1) * 12 + 1, sortedFlowers.length)} - {Math.min(currentPage * 12, sortedFlowers.length)} of {sortedFlowers.length} flower{sortedFlowers.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        )}



                    </div>
                </div>
            </main>

            {/* Scroll to Top Button */}
            <ScrollToTop />

            <Footer />
        </div>
    );
}