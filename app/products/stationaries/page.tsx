// app/stationery/page.tsx - Enhanced version matching the advanced pattern
'use client';

import { useEffect, lazy, Suspense, useState, useCallback } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Link from 'next/link';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import {
    Pencil,
    Search,
    Star,
    Package,
    Palette,
    Ruler,
    Filter,
    Grid,
    ArrowUp,
    Building,
    DollarSign,
    RotateCcw,
    X,
    TrendingUp,
    Sparkles,
    Clock,
    PackageOpen
} from 'lucide-react';

import { useProductStore } from '@/app/stores/ProductStore';
import { isStationaryProduct, Product, StationaryProduct } from '@/app/types/product';

// Lazy load components
const ProductCard = lazy(() => import("@/app/components/ProductCard"));

// Loading skeletons
const ProductCardSkeleton = () => (
    <div className="group rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm shadow-lg border border-[#c1a5a2]/20 animate-pulse">
        <div className="aspect-square bg-gray-200"></div>
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
const StationerySearch = ({ searchTerm, onSearchChange, onShowFilters }: {
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
                            placeholder="Search stationery, brands, types..."
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
const StationeryFilters = ({
    filters,
    onFilterChange,
    onClearFilters,
    showFilters,
    onToggleFilters,
    totalResults,
    filterOptions
}: {
    filters: any;
    onFilterChange: (key: string, value: any) => void;
    onClearFilters: () => void;
    showFilters: boolean;
    onToggleFilters: () => void;
    totalResults: number;
    filterOptions: any;
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

    // Color picker component
    const ColorPicker = ({ colors, selectedColor, onColorChange }: {
        colors: string[];
        selectedColor: string;
        onColorChange: (color: string) => void;
    }) => (
        <div className="space-y-3">
            <CustomSelect
                value={selectedColor}
                onChange={onColorChange}
                options={colors.map(color => ({ value: color, label: color }))}
                placeholder="All Colors"
            />

            {/* Color visual picker */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => onColorChange('all')}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedColor === 'all'
                        ? 'border-[#9a6a63] ring-2 ring-[#9a6a63]/20'
                        : 'border-gray-300 hover:border-[#9a6a63]/50'
                        }`}
                    style={{ background: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)', backgroundSize: '8px 8px', backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px' }}
                    title="All Colors"
                >
                    {selectedColor === 'all' && <X size={16} className="text-gray-600" />}
                </button>

                {colors.slice(0, 8).map(color => (
                    <button
                        key={color}
                        onClick={() => onColorChange(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${selectedColor === color
                            ? 'border-[#9a6a63] ring-2 ring-[#9a6a63]/20 scale-110'
                            : 'border-white shadow-md hover:border-[#9a6a63]/50'
                            }`}
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                    />
                ))}
            </div>
        </div>
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
                            { value: 'brand', label: 'Brand (A-Z)' },
                            { value: 'type', label: 'Type (A-Z)' },
                            { value: 'price-low', label: 'Price (Low to High)' },
                            { value: 'price-high', label: 'Price (High to Low)' },
                            { value: 'rating', label: 'Highest Rated' },
                            { value: 'newest', label: 'Recently Added' }
                        ]}
                        placeholder="Sort by..."
                    />
                </div>

                {/* Type Filter */}
                <div className="mb-6">
                    <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                        <Grid size={16} />
                        Type
                    </h3>
                    <CustomSelect
                        value={filters.typeFilter}
                        onChange={(value) => onFilterChange('typeFilter', value)}
                        options={filterOptions.types.map((type: string) => ({ value: type, label: type }))}
                        placeholder="All Types"
                    />
                </div>

                {/* Brand Filter */}
                <div className="mb-6">
                    <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                        <Building size={16} />
                        Brand
                    </h3>
                    <CustomSelect
                        value={filters.brandFilter}
                        onChange={(value) => onFilterChange('brandFilter', value)}
                        options={filterOptions.brands.map((brand: string) => ({ value: brand, label: brand }))}
                        placeholder="All Brands"
                    />
                </div>

                {/* Color Filter */}
                <div className="mb-6">
                    <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                        <Palette size={16} />
                        Color
                    </h3>
                    <ColorPicker
                        colors={filterOptions.colors}
                        selectedColor={filters.colorFilter}
                        onColorChange={(color) => onFilterChange('colorFilter', color)}
                    />
                </div>

                {/* Material Filter */}
                <div className="mb-6">
                    <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                        <Ruler size={16} />
                        Material
                    </h3>
                    <CustomSelect
                        value={filters.materialFilter}
                        onChange={(value) => onFilterChange('materialFilter', value)}
                        options={filterOptions.materials.map((material: string) => ({ value: material, label: material }))}
                        placeholder="All Materials"
                    />
                </div>

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

                {/* Active Filters Summary */}
                {(filters.search || filters.typeFilter !== 'all' || filters.brandFilter !== 'all' ||
                    filters.colorFilter !== 'all' || filters.materialFilter !== 'all' || filters.discountFilter ||
                    filters.stockFilter !== 'all' || filters.ratingFilter > 0) && (
                        <div className="mt-4 pt-4 border-t border-[#c1a5a2]/30">
                            <h4 className="text-sm font-medium text-[#9a6a63] mb-2">Active Filters:</h4>
                            <div className="flex flex-wrap gap-1">
                                {filters.search && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#9a6a63]/10 text-[#9a6a63] rounded-full text-xs">
                                        Search: "{filters.search}"
                                        <button
                                            onClick={() => onFilterChange('search', '')}
                                            className="hover:bg-[#9a6a63]/20 rounded-full p-0.5"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                                {filters.typeFilter !== 'all' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#9a6a63]/10 text-[#9a6a63] rounded-full text-xs">
                                        Type: {filters.typeFilter}
                                        <button
                                            onClick={() => onFilterChange('typeFilter', 'all')}
                                            className="hover:bg-[#9a6a63]/20 rounded-full p-0.5"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                                {filters.brandFilter !== 'all' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#9a6a63]/10 text-[#9a6a63] rounded-full text-xs">
                                        Brand: {filters.brandFilter}
                                        <button
                                            onClick={() => onFilterChange('brandFilter', 'all')}
                                            className="hover:bg-[#9a6a63]/20 rounded-full p-0.5"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                                {filters.colorFilter !== 'all' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#9a6a63]/10 text-[#9a6a63] rounded-full text-xs">
                                        Color: {filters.colorFilter}
                                        <button
                                            onClick={() => onFilterChange('colorFilter', 'all')}
                                            className="hover:bg-[#9a6a63]/20 rounded-full p-0.5"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                                {filters.materialFilter !== 'all' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#9a6a63]/10 text-[#9a6a63] rounded-full text-xs">
                                        Material: {filters.materialFilter}
                                        <button
                                            onClick={() => onFilterChange('materialFilter', 'all')}
                                            className="hover:bg-[#9a6a63]/20 rounded-full p-0.5"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                                {filters.discountFilter && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                        On Sale
                                        <button
                                            onClick={() => onFilterChange('discountFilter', false)}
                                            className="hover:bg-red-200 rounded-full p-0.5"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                                {filters.stockFilter !== 'all' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#9a6a63]/10 text-[#9a6a63] rounded-full text-xs">
                                        Stock: {filters.stockFilter}
                                        <button
                                            onClick={() => onFilterChange('stockFilter', 'all')}
                                            className="hover:bg-[#9a6a63]/20 rounded-full p-0.5"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                                {filters.ratingFilter > 0 && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                        {filters.ratingFilter}+ Stars
                                        <button
                                            onClick={() => onFilterChange('ratingFilter', 0)}
                                            className="hover:bg-yellow-200 rounded-full p-0.5"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
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
            <div className="text-sm text-[#9a6a63]/70">Total Items</div>
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

export default function StationeryPage() {
    // UI state
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const itemsPerPage = 12;

    // Local stationery-specific filters
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

    // Store state and actions
    const {
        allProducts,
        loading,
        error,
        initialized,
        fetchProducts
    } = useProductStore();

    // Get only stationery products
    const stationeryProducts = allProducts.filter(isStationaryProduct);

    // Fetch products only once when component mounts
    useEffect(() => {
        if (!initialized && !loading) {
            fetchProducts();
        }
    }, [initialized, loading, fetchProducts]);

    // Get unique values for filters
    const filterOptions = {
        types: [...new Set(stationeryProducts.map((item: StationaryProduct) => item.details.type).filter(Boolean))],
        brands: [...new Set(stationeryProducts.map((item: StationaryProduct) => item.details.brand).filter(Boolean))],
        colors: [...new Set(stationeryProducts.flatMap((item: StationaryProduct) => item.details.color || []).filter(Boolean))],
        materials: [...new Set(stationeryProducts.map((item: StationaryProduct) => item.details.material).filter(Boolean))]
    };

    // Filter stationery products
    const filteredProducts = stationeryProducts.filter((item: StationaryProduct) => {
        try {
            const matchesSearch = !search ||
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.details.brand.toLowerCase().includes(search.toLowerCase()) ||
                item.details.type.toLowerCase().includes(search.toLowerCase()) ||
                item.details.material.toLowerCase().includes(search.toLowerCase());

            const matchesType = typeFilter === 'all' || item.details.type === typeFilter;
            const matchesBrand = brandFilter === 'all' || item.details.brand === brandFilter;
            const matchesColor = colorFilter === 'all' || (item.details.color && item.details.color.includes(colorFilter));
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
        } catch (error) {
            console.error('Error filtering stationery:', item, error);
            return false;
        }
    });

    // Sort stationery products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        try {
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
        } catch (error) {
            console.error('Error sorting stationery:', error);
            return 0;
        }
    });

    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
    const paginatedProducts = sortedProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, typeFilter, brandFilter, colorFilter, materialFilter, priceRange, sortBy, ratingFilter, stockFilter, discountFilter]);

    // Filter update helpers
    const updateFilter = useCallback((key: string, value: any) => {
        switch (key) {
            case 'search':
                setSearch(value);
                break;
            case 'typeFilter':
                setTypeFilter(value);
                break;
            case 'brandFilter':
                setBrandFilter(value);
                break;
            case 'colorFilter':
                setColorFilter(value);
                break;
            case 'materialFilter':
                setMaterialFilter(value);
                break;
            case 'priceRange':
                setPriceRange(value);
                break;
            case 'sortBy':
                setSortBy(value);
                break;
            case 'ratingFilter':
                setRatingFilter(value);
                break;
            case 'stockFilter':
                setStockFilter(value);
                break;
            case 'discountFilter':
                setDiscountFilter(value);
                break;
            default:
                break;
        }
    }, []);

    // Clear all filters
    const clearAllFilters = useCallback(() => {
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
    }, []);

    // Pagination helper
    const getPaginationNumbers = useCallback(() => {
        const maxVisiblePages = 5;
        const pages = [];

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
        totalProducts: sortedProducts.length,
        inStock: sortedProducts.filter(p => p.stock > 0).length,
        outOfStock: sortedProducts.filter(p => p.stock === 0).length,
        onSale: sortedProducts.filter(p => p.discount > 0).length,
        averagePrice: sortedProducts.length > 0 ?
            sortedProducts.reduce((sum, p) => sum + p.price, 0) / sortedProducts.length : 0,
        averageRating: sortedProducts.length > 0 ?
            sortedProducts.reduce((sum, p) => sum + (p.averageRating || 0), 0) / sortedProducts.length : 0,
    };

    // Create filters object for component
    const filters = {
        search,
        typeFilter,
        brandFilter,
        colorFilter,
        materialFilter,
        priceRange,
        sortBy,
        ratingFilter,
        stockFilter,
        discountFilter
    };

    if (loading && !initialized) {
        return (
            <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f6eeec 0%, #fefdfc 50%, #f2ded9 100%)' }}>
                <Header />
                <main className="max-w-7xl mx-auto px-4 md:px-6 py-32">
                    <LoadingSpinner message="Loading amazing stationery..." />
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
                        <Pencil className="w-16 h-16 mx-auto mb-4 text-[#9a6a63]" />
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
                        <Pencil className="text-[#9a6a63]" size={48} />
                        Premium Stationery Collection
                    </h1>
                    <p className="text-[#9a6a63]/80 text-lg max-w-2xl mx-auto">
                        Discover high-quality stationery products for all your creative and professional needs
                    </p>
                </div>

                {/* Quick Statistics */}
                <QuickStats analytics={analytics} />

                {/* Search Component */}
                <StationerySearch
                    searchTerm={search}
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
                        <StationeryFilters
                            filters={filters}
                            onFilterChange={updateFilter}
                            onClearFilters={clearAllFilters}
                            showFilters={showFilters}
                            onToggleFilters={hideFilters}
                            totalResults={sortedProducts.length}
                            filterOptions={filterOptions}
                        />
                    </Suspense>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Results Summary */}
                        <div className="mb-8 flex items-center justify-between bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-[#c1a5a2]/20 shadow-lg">
                            <p className="text-[#9a6a63]/80">
                                Showing {paginatedProducts.length} of {sortedProducts.length} stationery products
                                {stationeryProducts.length !== sortedProducts.length && (
                                    <span className="text-gray-500 ml-2">
                                        (filtered from {stationeryProducts.length} total)
                                    </span>
                                )}
                            </p>
                            <div className="text-sm text-[#9a6a63]/60">
                                Page {currentPage} of {totalPages}
                            </div>
                        </div>

                        {/* Products Grid */}
                        {paginatedProducts.length === 0 ? (
                            <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl">
                                <Pencil className="w-16 h-16 mx-auto mb-4 text-[#9a6a63]/60" />
                                <h3 className="text-xl font-semibold text-[#9a6a63] mb-2">No stationery found</h3>
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
                                    Showing {Math.min((currentPage - 1) * itemsPerPage + 1, sortedProducts.length)} - {Math.min(currentPage * itemsPerPage, sortedProducts.length)} of {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''}
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