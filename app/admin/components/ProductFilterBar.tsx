'use client';

import React, { useEffect, useState, Fragment, useMemo } from 'react';
import { useProductStore } from '@/app/stores/ProductStore';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react';
import {
    ChevronUpDownIcon,
    FunnelIcon,
    XMarkIcon,
    AdjustmentsHorizontalIcon,
    MagnifyingGlassIcon,
    StarIcon
} from '@heroicons/react/20/solid';

interface FilterState {
    search: string;
    type: string;
    sortBy: string;
    priceRange: [number, number];
    stockStatus: string;
    discountRange: [number, number];
    ratingFilter: number;
    createdDateRange: string;
}

interface Option {
    label: string;
    value: string;
}

const ProductFilterBar = () => {
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        type: '',
        sortBy: 'createdAt',
        priceRange: [0, 1000],
        stockStatus: '',
        discountRange: [0, 100],
        ratingFilter: 0,
        createdDateRange: '',
    });

    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);

    const { allProducts, setProducts } = useProductStore();

    // Calculate price range from all products
    const priceRange: number[] = useMemo(() => {
        if (allProducts.length === 0) return [0, 1000];
        const prices = allProducts.map(p => p.price || 0);
        return [Math.min(...prices), Math.max(...prices)];
    }, [allProducts]);

    // Filter options
    const typeOptions: Option[] = [
        { label: 'All Types', value: '' },
        { label: 'Books', value: 'book' },
        { label: 'Stationary', value: 'stationary' },
        { label: 'Flowers', value: 'flower' },
    ];

    const sortOptions: Option[] = [
        { label: 'Newest First', value: 'createdAt' },
        { label: 'Oldest First', value: '-createdAt' },
        { label: 'Price: Low to High', value: 'price' },
        { label: 'Price: High to Low', value: '-price' },
        { label: 'Name: A to Z', value: 'name' },
        { label: 'Name: Z to A', value: '-name' },
        { label: 'Highest Rated', value: 'rating' },
        { label: 'Most Discounted', value: 'discount' },
        { label: 'Stock: High to Low', value: '-stock' },
    ];

    const stockStatusOptions: Option[] = [
        { label: 'All Stock Levels', value: '' },
        { label: 'In Stock', value: 'inStock' },
        { label: 'Low Stock (< 10)', value: 'lowStock' },
        { label: 'Out of Stock', value: 'outOfStock' },
    ];

    const dateRangeOptions: Option[] = [
        { label: 'All Time', value: '' },
        { label: 'Last 7 Days', value: '7d' },
        { label: 'Last 30 Days', value: '30d' },
        { label: 'Last 3 Months', value: '3m' },
        { label: 'Last 6 Months', value: '6m' },
        { label: 'Last Year', value: '1y' },
    ];

    // Calculate average rating for a product
    const calculateAverageRating = (product: any) => {
        if (!product.reviews || product.reviews.length === 0) return 0;
        // This assumes reviews have a rating field - adjust based on your Review model
        const totalRating = product.reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0);
        return totalRating / product.reviews.length;
    };

    // Filter and sort products
    useEffect(() => {
        let filtered = [...allProducts];

        // Text search
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter((p) =>
                p.name?.toLowerCase().includes(searchLower) ||
                p.description?.toLowerCase().includes(searchLower)
            );
        }

        // Type filter
        if (filters.type) {
            filtered = filtered.filter((p) => p.type === filters.type);
        }

        // Price range filter
        filtered = filtered.filter((p) => {
            const price = p.price || 0;
            return price >= filters.priceRange[0] && price <= filters.priceRange[1];
        });

        // Stock status filter
        if (filters.stockStatus) {
            filtered = filtered.filter((p) => {
                const stock = p.stock || 0;
                switch (filters.stockStatus) {
                    case 'inStock':
                        return stock > 0;
                    case 'lowStock':
                        return stock > 0 && stock < 10;
                    case 'outOfStock':
                        return stock === 0;
                    default:
                        return true;
                }
            });
        }

        // Discount range filter
        filtered = filtered.filter((p) => {
            const discount = p.discount || 0;
            return discount >= filters.discountRange[0] && discount <= filters.discountRange[1];
        });

        // Rating filter
        if (filters.ratingFilter > 0) {
            filtered = filtered.filter((p) => {
                const avgRating = calculateAverageRating(p);
                return avgRating >= filters.ratingFilter;
            });
        }

        // Date range filter
        if (filters.createdDateRange) {
            const now = new Date();
            const cutoffDate = new Date();

            switch (filters.createdDateRange) {
                case '7d':
                    cutoffDate.setDate(now.getDate() - 7);
                    break;
                case '30d':
                    cutoffDate.setDate(now.getDate() - 30);
                    break;
                case '3m':
                    cutoffDate.setMonth(now.getMonth() - 3);
                    break;
                case '6m':
                    cutoffDate.setMonth(now.getMonth() - 6);
                    break;
                case '1y':
                    cutoffDate.setFullYear(now.getFullYear() - 1);
                    break;
            }

            if (filters.createdDateRange !== '') {
                filtered = filtered.filter((p) => new Date(p.createdAt) >= cutoffDate);
            }
        }

        // Sorting
        filtered.sort((a, b) => {
            switch (filters.sortBy) {
                case 'price':
                    return (a.price || 0) - (b.price || 0);
                case '-price':
                    return (b.price || 0) - (a.price || 0);
                case 'name':
                    return (a.name || '').localeCompare(b.name || '');
                case '-name':
                    return (b.name || '').localeCompare(a.name || '');
                case 'rating':
                    return calculateAverageRating(b) - calculateAverageRating(a);
                case 'discount':
                    return (b.discount || 0) - (a.discount || 0);
                case '-stock':
                    return (b.stock || 0) - (a.stock || 0);
                case '-createdAt':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'createdAt':
                default:
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });

        setProducts(filtered);
    }, [filters, allProducts, setProducts]);

    // Count active filters
    useEffect(() => {
        let count = 0;
        if (filters.search) count++;
        if (filters.type) count++;
        if (filters.priceRange[0] !== priceRange[0] || filters.priceRange[1] !== priceRange[1]) count++;
        if (filters.stockStatus) count++;
        if (filters.discountRange[0] !== 0 || filters.discountRange[1] !== 100) count++;
        if (filters.ratingFilter > 0) count++;
        if (filters.createdDateRange) count++;
        setActiveFiltersCount(count);
    }, [filters, priceRange]);

    const updateFilter = (key: keyof FilterState, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearAllFilters = () => {
        setFilters({
            search: '',
            type: '',
            sortBy: 'createdAt',
            priceRange: priceRange.slice(0, 2) as [number, number],
            stockStatus: '',
            discountRange: [0, 100],
            ratingFilter: 0,
            createdDateRange: '',
        });
    };

    const renderListbox = (
        options: Option[],
        selected: string,
        setSelected: (value: string) => void,
        placeholder: string
    ): React.ReactElement => (
        <Listbox value={selected} onChange={setSelected}>
            <div className="relative w-full md:w-48">
                <ListboxButton className="border px-3 py-2 rounded text-sm w-full text-left bg-white text-[#9c6b63] shadow-sm hover:shadow-md transition">
                    {options.find((o) => o.value === selected)?.label || placeholder}
                    <ChevronUpDownIcon className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-[#9c6b63]" />
                </ListboxButton>
                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <ListboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded bg-white border border-gray-200 shadow-md text-sm z-10">
                        {options.map((option) => (
                            <ListboxOption
                                key={option.value}
                                value={option.value}
                                className={({ active }: { active: boolean }) =>
                                    `cursor-pointer px-4 py-2 transition-colors duration-100 ${active ? 'bg-[#f5e1dd] text-[#9c6b63]' : 'text-neutral-700'
                                    }`
                                }
                            >
                                {option.label}
                            </ListboxOption>
                        ))}
                    </ListboxOptions>
                </Transition>
            </div>
        </Listbox>
    );

    const renderRangeSlider = (
        label: string,
        value: [number, number],
        onChange: (value: [number, number]) => void,
        min: number,
        max: number,
        step: number = 1,
        prefix: string = ''
    ) => (
        <div className="space-y-2">
            <label className="text-sm font-medium text-[#9c6b63]">{label}</label>
            <div className="px-3">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value[0]}
                    onChange={(e) => onChange([Number(e.target.value), value[1]])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value[1]}
                    onChange={(e) => onChange([value[0], Number(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider -mt-2"
                />
            </div>
            <div className="flex justify-between text-xs text-gray-600">
                <span>{prefix}{value[0]}</span>
                <span>{prefix}{value[1]}</span>
            </div>
        </div>
    );

    const renderStarRating = (rating: number, onChange: (rating: number) => void) => (
        <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    onClick={() => onChange(star === rating ? 0 : star)}
                    className={`transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                >
                    <StarIcon className="w-5 h-5" />
                </button>
            ))}
            <span className="text-sm text-gray-600 ml-2">
                {rating > 0 ? `${rating}+ stars` : 'Any rating'}
            </span>
        </div>
    );

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            {/* Main Filter Row */}
            <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
                <div className="relative flex-1 min-w-64">
                    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or description..."
                        value={filters.search}
                        onChange={(e) => updateFilter('search', e.target.value)}
                        className="border px-9 py-2 rounded w-full text-sm text-[#9c6b63] transition ease-in-out duration-300 focus:outline-none focus:ring-2 focus:ring-[#9c6b63] focus:border-transparent shadow-sm hover:shadow-md"
                    />
                </div>

                {renderListbox(typeOptions, filters.type, (value) => updateFilter('type', value), 'All Types')}
                {renderListbox(sortOptions, filters.sortBy, (value) => updateFilter('sortBy', value), 'Sort by')}

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${showAdvancedFilters
                            ? 'bg-[#9c6b63] text-white'
                            : 'bg-gray-100 text-[#9c6b63] hover:bg-gray-200'
                            }`}
                    >
                        <AdjustmentsHorizontalIcon className="w-4 h-4" />
                        Advanced
                        {activeFiltersCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 ml-1">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>

                    {activeFiltersCount > 0 && (
                        <button
                            onClick={clearAllFilters}
                            className="flex items-center gap-2 px-3 py-2 rounded text-sm bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                        >
                            <XMarkIcon className="w-4 h-4" />
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Advanced Filters */}
            <Transition
                show={showAdvancedFilters}
                as={Fragment}
                enter="transition-all duration-300 ease-out"
                enterFrom="opacity-0 max-h-0"
                enterTo="opacity-100 max-h-96"
                leave="transition-all duration-300 ease-in"
                leaveFrom="opacity-100 max-h-96"
                leaveTo="opacity-0 max-h-0"
            >
                <div className="border-t pt-4 mt-4 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Price Range */}
                        <div>
                            {renderRangeSlider(
                                'Price Range',
                                filters.priceRange,
                                (value) => updateFilter('priceRange', value),
                                priceRange[0],
                                priceRange[1],
                                1,
                                '$'
                            )}
                        </div>

                        {/* Stock Status */}
                        <div>
                            <label className="text-sm font-medium text-[#9c6b63] block mb-2">Stock Status</label>
                            {renderListbox(
                                stockStatusOptions,
                                filters.stockStatus,
                                (value) => updateFilter('stockStatus', value),
                                'All Stock Levels'
                            )}
                        </div>

                        {/* Discount Range */}
                        <div>
                            {renderRangeSlider(
                                'Discount Range',
                                filters.discountRange,
                                (value) => updateFilter('discountRange', value),
                                0,
                                100,
                                5,
                                '%'
                            )}
                        </div>

                        {/* Rating Filter */}
                        <div>
                            <label className="text-sm font-medium text-[#9c6b63] block mb-2">Minimum Rating</label>
                            {renderStarRating(filters.ratingFilter, (rating) => updateFilter('ratingFilter', rating))}
                        </div>

                        {/* Date Range */}
                        <div>
                            <label className="text-sm font-medium text-[#9c6b63] block mb-2">Created Date</label>
                            {renderListbox(
                                dateRangeOptions,
                                filters.createdDateRange,
                                (value) => updateFilter('createdDateRange', value),
                                'All Time'
                            )}
                        </div>
                    </div>
                </div>
            </Transition>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                    <span className="text-sm font-medium text-gray-600">Active filters:</span>
                    {filters.search && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center gap-1">
                            Search: "{filters.search}"
                            <button onClick={() => updateFilter('search', '')}>
                                <XMarkIcon className="w-3 h-3" />
                            </button>
                        </span>
                    )}
                    {filters.type && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs flex items-center gap-1">
                            Type: {typeOptions.find(o => o.value === filters.type)?.label}
                            <button onClick={() => updateFilter('type', '')}>
                                <XMarkIcon className="w-3 h-3" />
                            </button>
                        </span>
                    )}
                    {filters.ratingFilter > 0 && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs flex items-center gap-1">
                            Rating: {filters.ratingFilter}+ stars
                            <button onClick={() => updateFilter('ratingFilter', 0)}>
                                <XMarkIcon className="w-3 h-3" />
                            </button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductFilterBar;