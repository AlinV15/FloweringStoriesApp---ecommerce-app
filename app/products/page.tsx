// app/products/page.tsx - Enhanced version matching the flowers page pattern
'use client';

import { useEffect, lazy, Suspense, useState, useCallback } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Link from 'next/link';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import {
    Package,
    Search,
    Star,
    Calendar,
    Filter,
    Flower,
    Pencil,
    Book,
    PackageOpen,
    Palette,
    Timer,
    Leaf,
    ArrowUp,
    Building,
    Globe,
    DollarSign,
    RotateCcw,
    X,
    Clock,
} from 'lucide-react';

import { useProductStore } from '../stores/ProductStore';



// Lazy load components
const ProductCard = lazy(() => import("@/app/components/ProductCard"));

// Loading skeletons
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

// Enhanced Search Component
const ProductSearch = ({ searchTerm, onSearchChange, onShowFilters }: {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onShowFilters: () => void;
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <div className={`relative flex-1 transition-all duration-200 ${isFocused ? 'transform scale-[1.02]' : ''
                    }`}>
                    <div className={`relative overflow-hidden rounded-xl border transition-all duration-200 ${isFocused
                        ? 'border-[#9a6a63] ring-2 ring-[#9a6a63]/20 shadow-lg'
                        : 'border-[#c1a5a2]/30 shadow-md hover:border-[#9a6a63]/50'
                        }`}>
                        <Search
                            className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${isFocused ? 'text-[#9a6a63]' : 'text-[#9a6a63]/60'
                                }`}
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="Search products, authors, brands..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className="w-full pl-12 pr-12 py-4 bg-white/90 backdrop-blur-sm text-neutral-700 placeholder:text-gray-400 focus:outline-none transition-all duration-200"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => onSearchChange('')}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                                aria-label="Clear search"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>
                <button
                    onClick={onShowFilters}
                    className="lg:hidden px-6 py-4 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}
                >
                    <Filter size={20} />
                    Filters
                </button>
            </div>
        </div>
    );
};

// Enhanced Filters Component
const ProductFilters = ({
    filters,
    onFilterChange,
    onClearFilters,
    showFilters,
    onToggleFilters,
    totalResults,
    getters
}: {
    filters: any;
    onFilterChange: (key: string, value: any) => void;
    onClearFilters: () => void;
    showFilters: boolean;
    onToggleFilters: () => void;
    totalResults: number;
    getters: any;
}) => {
    // Helper for range inputs
    const RangeInput = ({ min, max, onMinChange, onMaxChange, placeholder = { min: 'Min', max: 'Max' } }: {
        min: string;
        max: string;
        onMinChange: (value: string) => void;
        onMaxChange: (value: string) => void;
        placeholder?: { min: string; max: string };
    }) => (
        <div className="grid grid-cols-2 gap-2">
            <input
                type="number"
                placeholder={placeholder.min}
                value={min}
                onChange={(e) => onMinChange(e.target.value)}
                className="px-3 py-2 text-sm border border-[#c1a5a2]/30 rounded-lg focus:border-[#9a6a63] focus:ring-1 focus:ring-[#9a6a63]/20 text-neutral-700 transition-all"
            />
            <input
                type="number"
                placeholder={placeholder.max}
                value={max}
                onChange={(e) => onMaxChange(e.target.value)}
                className="px-3 py-2 text-sm border border-[#c1a5a2]/30 rounded-lg focus:border-[#9a6a63] focus:ring-1 focus:ring-[#9a6a63]/20 text-neutral-700 transition-all"
            />
        </div>
    );

    // Helper for selects
    const CustomSelect = ({ value, onChange, options, placeholder = 'Select...' }: {
        value: string;
        onChange: (value: string) => void;
        options: { value: string; label: string }[];
        placeholder?: string;
    }) => (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[#c1a5a2]/30 focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white text-neutral-700 shadow-sm appearance-none cursor-pointer transition-all"
        >
            <option value="all">{placeholder}</option>
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );

    return (
        <aside className={`w-full lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-[#c1a5a2]/20 shadow-xl sticky top-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-[#9a6a63] flex items-center gap-2">
                        <Filter size={24} />
                        Filters
                    </h2>
                    <button
                        onClick={onToggleFilters}
                        className="lg:hidden text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Close filters"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Sort Filter */}
                <div className="mb-6">
                    <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                        <Filter size={16} />
                        Sort By
                    </h3>
                    <CustomSelect
                        value={filters.sortBy}
                        onChange={(value) => onFilterChange('sortBy', value)}
                        options={[
                            { value: 'name', label: 'Name (A-Z)' },
                            { value: 'price-low', label: 'Price (Low to High)' },
                            { value: 'price-high', label: 'Price (High to Low)' },
                            { value: 'rating', label: 'Highest Rated' },
                            { value: 'newest', label: 'Newest First' }
                        ]}
                        placeholder="Sort by..."
                    />
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
                                onClick={() => onFilterChange('categoryFilter', category.value)}
                                className={`w-full text-left px-4 py-3 rounded-xl transition-all transform hover:scale-105 ${filters.categoryFilter === category.value
                                    ? 'text-white shadow-lg scale-105'
                                    : 'bg-white/50 text-[#9a6a63] hover:bg-white/80 hover:shadow-md'
                                    }`}
                                style={filters.categoryFilter === category.value ? { background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' } : {}}
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
                {(filters.categoryFilter === 'all' || filters.categoryFilter === 'book') && (
                    <>
                        <div className="mb-6">
                            <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                <Book size={16} />
                                Genre
                            </h3>
                            <CustomSelect
                                value={filters.genreFilter}
                                onChange={(value) => onFilterChange('genreFilter', value)}
                                options={getters.getUniqueGenres().map((genre: string) => ({ value: genre, label: genre }))}
                                placeholder="All Genres"
                            />
                        </div>

                        <div className="mb-6">
                            <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                <Pencil size={16} />
                                Author
                            </h3>
                            <input
                                type="text"
                                placeholder="Search by author..."
                                value={filters.authorFilter}
                                onChange={(e) => onFilterChange('authorFilter', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-[#c1a5a2]/30 focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white text-neutral-700 transition-all"
                            />
                        </div>

                        <div className="mb-6">
                            <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                <Globe size={16} />
                                Language
                            </h3>
                            <CustomSelect
                                value={filters.languageFilter}
                                onChange={(value) => onFilterChange('languageFilter', value)}
                                options={getters.getUniqueLanguages().map((lang: string) => ({ value: lang, label: lang }))}
                                placeholder="All Languages"
                            />
                        </div>

                        <div className="mb-6">
                            <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                <Building size={16} />
                                Publisher
                            </h3>
                            <CustomSelect
                                value={filters.publisherFilter}
                                onChange={(value) => onFilterChange('publisherFilter', value)}
                                options={getters.getUniquePublishers().map((pub: string) => ({ value: pub, label: pub }))}
                                placeholder="All Publishers"
                            />
                        </div>

                        <div className="mb-6">
                            <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                <Calendar size={16} />
                                Publication Year
                            </h3>
                            <RangeInput
                                min={filters.yearFilter.from}
                                max={filters.yearFilter.to}
                                onMinChange={(value) => onFilterChange('yearFilter', { ...filters.yearFilter, from: value })}
                                onMaxChange={(value) => onFilterChange('yearFilter', { ...filters.yearFilter, to: value })}
                                placeholder={{ min: 'From year', max: 'To year' }}
                            />
                        </div>

                        <div className="mb-6">
                            <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                <Book size={16} />
                                Pages
                            </h3>
                            <RangeInput
                                min={filters.pagesFilter.min}
                                max={filters.pagesFilter.max}
                                onMinChange={(value) => onFilterChange('pagesFilter', { ...filters.pagesFilter, min: value })}
                                onMaxChange={(value) => onFilterChange('pagesFilter', { ...filters.pagesFilter, max: value })}
                                placeholder={{ min: 'Min pages', max: 'Max pages' }}
                            />
                        </div>
                    </>
                )}

                {/* Stationary Specific Filters */}
                {(filters.categoryFilter === 'all' || filters.categoryFilter === 'stationary') && (
                    <>
                        <div className="mb-6">
                            <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                <Building size={16} />
                                Brand
                            </h3>
                            <CustomSelect
                                value={filters.brandFilter}
                                onChange={(value) => onFilterChange('brandFilter', value)}
                                options={getters.getUniqueBrands().map((brand: string) => ({ value: brand, label: brand }))}
                                placeholder="All Brands"
                            />
                        </div>

                        <div className="mb-6">
                            <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                <Pencil size={16} />
                                Type
                            </h3>
                            <CustomSelect
                                value={filters.stationaryTypeFilter}
                                onChange={(value) => onFilterChange('stationaryTypeFilter', value)}
                                options={getters.getUniqueStationaryTypes().map((type: string) => ({ value: type, label: type }))}
                                placeholder="All Types"
                            />
                        </div>

                        <div className="mb-6">
                            <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                <Palette size={16} />
                                Color
                            </h3>
                            <CustomSelect
                                value={filters.colorFilter}
                                onChange={(value) => onFilterChange('colorFilter', value)}
                                options={getters.getUniqueColors().map((color: string) => ({ value: color, label: color }))}
                                placeholder="All Colors"
                            />
                        </div>

                        <div className="mb-6">
                            <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                <Package size={16} />
                                Material
                            </h3>
                            <CustomSelect
                                value={filters.materialFilter}
                                onChange={(value) => onFilterChange('materialFilter', value)}
                                options={getters.getUniqueMaterials().map((material: string) => ({ value: material, label: material }))}
                                placeholder="All Materials"
                            />
                        </div>
                    </>
                )}

                {/* Flower Specific Filters */}
                {(filters.categoryFilter === 'all' || filters.categoryFilter === 'flower') && (
                    <>
                        <div className="mb-6">
                            <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                <Palette size={16} />
                                Flower Color
                            </h3>
                            <CustomSelect
                                value={filters.flowerColorFilter}
                                onChange={(value) => onFilterChange('flowerColorFilter', value)}
                                options={getters.getUniqueFlowerColors().map((color: string) => ({ value: color, label: color }))}
                                placeholder="All Colors"
                            />
                        </div>

                        <div className="mb-6">
                            <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                <Leaf size={16} />
                                Season
                            </h3>
                            <CustomSelect
                                value={filters.seasonFilter}
                                onChange={(value) => onFilterChange('seasonFilter', value)}
                                options={getters.getUniqueSeasons().map((season: string) => ({ value: season, label: season }))}
                                placeholder="All Seasons"
                            />
                        </div>

                        <div className="mb-6">
                            <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                <Timer size={16} />
                                Freshness (%)
                            </h3>
                            <RangeInput
                                min={filters.freshnessFilter.min}
                                max={filters.freshnessFilter.max}
                                onMinChange={(value) => onFilterChange('freshnessFilter', { ...filters.freshnessFilter, min: value })}
                                onMaxChange={(value) => onFilterChange('freshnessFilter', { ...filters.freshnessFilter, max: value })}
                                placeholder={{ min: 'Min %', max: 'Max %' }}
                            />
                        </div>

                        <div className="mb-6">
                            <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                <Clock size={16} />
                                Lifespan (days)
                            </h3>
                            <RangeInput
                                min={filters.lifespanFilter.min}
                                max={filters.lifespanFilter.max}
                                onMinChange={(value) => onFilterChange('lifespanFilter', { ...filters.lifespanFilter, min: value })}
                                onMaxChange={(value) => onFilterChange('lifespanFilter', { ...filters.lifespanFilter, max: value })}
                                placeholder={{ min: 'Min days', max: 'Max days' }}
                            />
                        </div>
                    </>
                )}

                {/* Price Range Filter */}
                <div className="mb-6">
                    <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                        <DollarSign size={16} />
                        Price Range (€)
                    </h3>
                    <RangeInput
                        min={filters.priceRange.min}
                        max={filters.priceRange.max}
                        onMinChange={(value) => onFilterChange('priceRange', { ...filters.priceRange, min: value })}
                        onMaxChange={(value) => onFilterChange('priceRange', { ...filters.priceRange, max: value })}
                        placeholder={{ min: 'Min €', max: 'Max €' }}
                    />
                </div>

                {/* Rating Filter */}
                <div className="mb-6">
                    <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                        <Star size={16} />
                        Minimum Rating
                    </h3>
                    <CustomSelect
                        value={filters.ratingFilter.toString()}
                        onChange={(value) => onFilterChange('ratingFilter', parseInt(value))}
                        options={[
                            { value: '0', label: 'All Ratings' },
                            { value: '1', label: '1+ Stars' },
                            { value: '2', label: '2+ Stars' },
                            { value: '3', label: '3+ Stars' },
                            { value: '4', label: '4+ Stars' },
                            { value: '5', label: '5 Stars' }
                        ]}
                        placeholder="All Ratings"
                    />
                </div>

                {/* Stock Filter */}
                <div className="mb-6">
                    <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                        <PackageOpen size={16} />
                        Availability
                    </h3>
                    <CustomSelect
                        value={filters.stockFilter}
                        onChange={(value) => onFilterChange('stockFilter', value)}
                        options={[
                            { value: 'all', label: 'All Items' },
                            { value: 'in-stock', label: 'In Stock' },
                            { value: 'out-of-stock', label: 'Out of Stock' }
                        ]}
                        placeholder="All Items"
                    />
                </div>

                {/* Discount Filter */}
                <div className="mb-6">
                    <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                        <DollarSign size={16} />
                        Special Offers
                    </h3>
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-[#f6eeec] transition-colors">
                        <input
                            type="checkbox"
                            checked={filters.discountFilter}
                            onChange={(e) => onFilterChange('discountFilter', e.target.checked)}
                            className="w-5 h-5 text-[#9a6a63] rounded focus:ring-[#9a6a63] focus:ring-2"
                        />
                        <span className="text-[#9a6a63] font-medium">On Sale Only</span>
                        {filters.discountFilter && (
                            <span className="ml-auto bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                                Active
                            </span>
                        )}
                    </label>
                </div>

                {/* Clear Filters Button */}
                <div className="space-y-3 pt-4 border-t border-[#c1a5a2]/30">
                    <button
                        onClick={onClearFilters}
                        className="w-full px-6 py-3 text-[#9a6a63] bg-white border border-[#9a6a63] rounded-xl hover:bg-[#9a6a63] hover:text-white transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 font-medium"
                    >
                        <RotateCcw size={16} />
                        Clear All Filters
                    </button>
                </div>

                {/* Results Summary */}
                <div className="mt-6 pt-4 border-t border-[#c1a5a2]/30 text-center">
                    <p className="text-sm text-[#9a6a63]/80">
                        <span className="font-semibold text-[#9a6a63] text-lg">{totalResults}</span>
                        <br />
                        <span className="text-xs">product{totalResults !== 1 ? 's' : ''} found</span>
                    </p>
                </div>
            </div>
        </aside>
    );
};

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
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-[#c1a5a2]/20 shadow-xl">
                {/* Previous Button */}
                <button
                    onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg transition-all font-medium ${currentPage === 1
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-white text-[#9a6a63] hover:bg-[#9a6a63] hover:text-white border border-[#c1a5a2]/30 hover:border-[#9a6a63] shadow-sm hover:shadow-md'
                        }`}
                >
                    Previous
                </button>

                {/* First page + ellipsis */}
                {currentPage > 3 && totalPages > 5 && (
                    <>
                        <button
                            onClick={() => onPageChange(1)}
                            className="px-4 py-2 rounded-lg transition-all bg-white text-[#9a6a63] hover:bg-[#9a6a63] hover:text-white border border-[#c1a5a2]/30 hover:border-[#9a6a63] shadow-sm hover:shadow-md font-medium"
                        >
                            1
                        </button>
                        <span className="px-2 text-[#9a6a63]/60">...</span>
                    </>
                )}

                {/* Page Numbers */}
                {getPaginationNumbers().map((pageNum) => (
                    <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`px-4 py-2 rounded-lg transition-all font-medium ${currentPage === pageNum
                            ? 'text-white shadow-lg transform scale-105'
                            : 'bg-white text-[#9a6a63] hover:bg-[#9a6a63] hover:text-white border border-[#c1a5a2]/30 hover:border-[#9a6a63] shadow-sm hover:shadow-md'
                            }`}
                        style={
                            currentPage === pageNum
                                ? { background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }
                                : {}
                        }
                    >
                        {pageNum}
                    </button>
                ))}

                {/* Last page + ellipsis */}
                {currentPage < totalPages - 2 && totalPages > 5 && (
                    <>
                        <span className="px-2 text-[#9a6a63]/60">...</span>
                        <button
                            onClick={() => onPageChange(totalPages)}
                            className="px-4 py-2 rounded-lg transition-all bg-white text-[#9a6a63] hover:bg-[#9a6a63] hover:text-white border border-[#c1a5a2]/30 hover:border-[#9a6a63] shadow-sm hover:shadow-md font-medium"
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
                        : 'bg-white text-[#9a6a63] hover:bg-[#9a6a63] hover:text-white border border-[#c1a5a2]/30 hover:border-[#9a6a63] shadow-sm hover:shadow-md'
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
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-[#c1a5a2]/20 shadow-lg">
            <div className="text-2xl font-bold text-[#9a6a63]">{analytics.totalProducts}</div>
            <div className="text-sm text-[#9a6a63]/70">Total Products</div>
        </div>
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-[#c1a5a2]/20 shadow-lg">
            <div className="text-2xl font-bold text-green-600">{analytics.inStock}</div>
            <div className="text-sm text-[#9a6a63]/70">In Stock</div>
        </div>
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-[#c1a5a2]/20 shadow-lg">
            <div className="text-2xl font-bold text-red-600">{analytics.onSale}</div>
            <div className="text-sm text-[#9a6a63]/70">On Sale</div>
        </div>
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-[#c1a5a2]/20 shadow-lg">
            <div className="text-2xl font-bold text-yellow-600">€{analytics.averagePrice.toFixed(0)}</div>
            <div className="text-sm text-[#9a6a63]/70">Avg Price</div>
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
            style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}
            aria-label="Scroll to top"
        >
            <ArrowUp size={20} />
        </button>
    );
};

export default function ProductsPage() {
    // UI state
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const itemsPerPage = 12;

    // Store state and actions
    const {
        filteredProducts,
        filters,
        loading,
        error,
        initialized,
        fetchProducts,
        setFilters,
        clearFilters,
        getUniqueGenres,
        getUniqueAuthors,
        getUniqueLanguages,
        getUniquePublishers,
        getUniqueBrands,
        getUniqueColors,
        getUniqueMaterials,
        getUniqueStationaryTypes,
        getUniqueFlowerColors,
        getUniqueSeasons
    } = useProductStore();

    // Fetch products only once when component mounts
    useEffect(() => {
        if (!initialized && !loading) {
            fetchProducts();
        }
    }, [initialized, loading, fetchProducts]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Filter update helpers with useCallback to prevent unnecessary re-renders
    const updateFilter = useCallback((key: string, value: any) => {
        setFilters({ [key]: value });
    }, [setFilters]);

    // Pagination helper
    const getPaginationNumbers = useCallback(() => {
        const maxVisiblePages = 5;
        const pages: number[] = [];

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= maxVisiblePages; i++) {
                    pages.push(i);
                }
            } else if (currentPage >= totalPages - 2) {
                for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                    pages.push(i);
                }
            }
        }

        return pages;
    }, [currentPage, totalPages]);

    // Mobile filter controls
    const showFiltersMobile = useCallback(() => {
        setShowFilters(true);
    }, []);

    const hideFilters = useCallback(() => {
        setShowFilters(false);
    }, []);

    // Analytics calculation
    const analytics = {
        totalProducts: filteredProducts.length,
        inStock: filteredProducts.filter(p => p.stock > 0).length,
        outOfStock: filteredProducts.filter(p => p.stock === 0).length,
        onSale: filteredProducts.filter(p => p.discount > 0).length,
        averagePrice: filteredProducts.length > 0 ?
            filteredProducts.reduce((sum, p) => sum + p.price, 0) / filteredProducts.length : 0,
        averageRating: filteredProducts.length > 0 ?
            filteredProducts.reduce((sum, p) => sum + (p.averageRating || 0), 0) / filteredProducts.length : 0,
    };

    // Getters object for filters component
    const getters = {
        getUniqueGenres,
        getUniqueAuthors,
        getUniqueLanguages,
        getUniquePublishers,
        getUniqueBrands,
        getUniqueColors,
        getUniqueMaterials,
        getUniqueStationaryTypes,
        getUniqueFlowerColors,
        getUniqueSeasons
    };

    if (loading && !initialized) {
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

                {/* Quick Statistics */}
                <QuickStats analytics={analytics} />

                {/* Search Component */}
                <ProductSearch
                    searchTerm={filters.search}
                    onSearchChange={(value) => updateFilter('search', value)}
                    onShowFilters={showFiltersMobile}
                />

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filter */}
                    <Suspense fallback={
                        <div className="w-full lg:w-1/4">
                            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-[#c1a5a2]/20 shadow-xl">
                                <div className="h-6 bg-gray-200 rounded mb-6 w-1/2 animate-pulse"></div>
                                {Array.from({ length: 6 }, (_, i) => (
                                    <div key={i} className="mb-6">
                                        <div className="h-4 bg-gray-200 rounded mb-3 w-1/3 animate-pulse"></div>
                                        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    }>
                        <ProductFilters
                            filters={filters}
                            onFilterChange={updateFilter}
                            onClearFilters={clearFilters}
                            showFilters={showFilters}
                            onToggleFilters={hideFilters}
                            totalResults={filteredProducts.length}
                            getters={getters}
                        />
                    </Suspense>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Results Summary */}
                        <div className="mb-8 flex items-center justify-between bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-[#c1a5a2]/20 shadow-lg">
                            <p className="text-[#9a6a63]/80">
                                Showing {paginatedProducts.length} of {filteredProducts.length} products
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
                                    onClick={clearFilters}
                                    className="px-6 py-3 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg"
                                    style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {paginatedProducts.map((product) => (
                                    <Link href={`/products/${product._id}`} key={product._id}>
                                        <Suspense fallback={<ProductCardSkeleton />}>
                                            <ProductCard
                                                product={product}
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
                            onPageChange={setCurrentPage}
                            getPaginationNumbers={getPaginationNumbers}
                        />

                        {/* Page Info */}
                        {totalPages > 1 && (
                            <div className="mt-6 text-center bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-[#c1a5a2]/20 shadow-lg">
                                <p className="text-[#9a6a63]/80 text-sm">
                                    Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredProducts.length)} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="mt-8 flex flex-wrap gap-4 justify-center">
                            {filteredProducts.length > 0 && (
                                <>
                                    <Link href="/products/books">
                                        <button className="px-6 py-3 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                                            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
                                            <Book size={20} />
                                            View Books
                                        </button>
                                    </Link>
                                    <Link href="/products/stationaries">
                                        <button className="px-6 py-3 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                                            style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}>
                                            <Pencil size={20} />
                                            View Stationery
                                        </button>
                                    </Link>
                                    <Link href="/products/flowers">
                                        <button className="px-6 py-3 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                                            style={{ background: 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)' }}>
                                            <Flower size={20} />
                                            View Flowers
                                        </button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Scroll to Top Button */}
            <ScrollToTop />

            <Footer />
        </div>
    );
}