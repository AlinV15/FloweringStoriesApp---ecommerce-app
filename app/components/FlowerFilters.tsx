// components/FlowerFilters.tsx - Advanced filtering component
'use client';

import { memo } from 'react';
import {
    Filter,
    X,
    Sun,
    Droplets,
    Clock,
    Calendar,
    Star,
    DollarSign,
    Palette,
    ChevronDown,
    RotateCcw,
    Package
} from 'lucide-react';
import { FlowerFilterState } from '../hooks/useFlowerFilters';

interface FlowerFiltersProps {
    filters: FlowerFilterState;
    filterOptions: {
        colors: string[];
        seasons: string[];
    };
    onFilterChange: (key: keyof FlowerFilterState, value: any) => void;
    onClearFilters: () => void;
    showFilters: boolean;
    onToggleFilters: () => void;
    totalResults: number;
    className?: string;
}

// Individual filter section component
const FilterSection = memo(({
    title,
    icon,
    children,
    collapsible = false
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    collapsible?: boolean;
}) => (
    <div className="mb-6">
        <h3 className="font-semibold text-[#9c6b63] mb-3 flex items-center gap-2">
            {icon}
            {title}
        </h3>
        {children}
    </div>
));

FilterSection.displayName = 'FilterSection';

// Range input component
const RangeInput = memo(({
    min,
    max,
    onMinChange,
    onMaxChange,
    placeholder = { min: 'Min', max: 'Max' },
    type = 'number'
}: {
    min: string;
    max: string;
    onMinChange: (value: string) => void;
    onMaxChange: (value: string) => void;
    placeholder?: { min: string; max: string };
    type?: string;
}) => (
    <div className="grid grid-cols-2 gap-2">
        <input
            type={type}
            placeholder={placeholder.min}
            value={min}
            onChange={(e) => onMinChange(e.target.value)}
            className="px-3 py-2 text-sm border border-[#e5d4ce]/30 rounded-lg focus:border-[#9c6b63] focus:ring-1 focus:ring-[#9c6b63]/20 text-neutral-700 transition-all"
        />
        <input
            type={type}
            placeholder={placeholder.max}
            value={max}
            onChange={(e) => onMaxChange(e.target.value)}
            className="px-3 py-2 text-sm border border-[#e5d4ce]/30 rounded-lg focus:border-[#9c6b63] focus:ring-1 focus:ring-[#9c6b63]/20 text-neutral-700 transition-all"
        />
    </div>
));

RangeInput.displayName = 'RangeInput';

// Select component
const CustomSelect = memo(({
    value,
    onChange,
    options,
    placeholder = 'Select...',
    className = ''
}: {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
    className?: string;
}) => (
    <div className="relative">
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border border-[#e5d4ce]/30 focus:border-[#9c6b63] focus:ring-2 focus:ring-[#9c6b63]/20 bg-white text-neutral-700 appearance-none cursor-pointer transition-all ${className}`}
        >
            <option value="all">{placeholder}</option>
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#9c6b63]/60 pointer-events-none" size={20} />
    </div>
));

CustomSelect.displayName = 'CustomSelect';

// Color picker component
const ColorPicker = memo(({
    colors,
    selectedColor,
    onColorChange
}: {
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
                        ? 'border-[#9c6b63] ring-2 ring-[#9c6b63]/20'
                        : 'border-gray-300 hover:border-[#9c6b63]/50'
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
                            ? 'border-[#9c6b63] ring-2 ring-[#9c6b63]/20 scale-110'
                            : 'border-white shadow-md hover:border-[#9c6b63]/50'
                        }`}
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                />
            ))}
        </div>
    </div>
));

ColorPicker.displayName = 'ColorPicker';

// Main filters component
const FlowerFilters = memo(({
    filters,
    filterOptions,
    onFilterChange,
    onClearFilters,
    showFilters,
    onToggleFilters,
    totalResults,
    className = ''
}: FlowerFiltersProps) => {
    const sortOptions = [
        { value: 'name', label: 'Name (A-Z)' },
        { value: 'color', label: 'Color (A-Z)' },
        { value: 'price-low', label: 'Price (Low to High)' },
        { value: 'price-high', label: 'Price (High to Low)' },
        { value: 'rating', label: 'Highest Rated' },
        { value: 'freshness-high', label: 'Freshness (High to Low)' },
        { value: 'freshness-low', label: 'Freshness (Low to High)' },
        { value: 'lifespan-high', label: 'Lifespan (High to Low)' },
        { value: 'lifespan-low', label: 'Lifespan (Low to High)' },
        { value: 'expiry-date', label: 'Expiry Date (Soonest)' },
        { value: 'newest', label: 'Recently Added' }
    ];

    const ratingOptions = [
        { value: 0, label: 'All Ratings' },
        { value: 1, label: '1+ Stars' },
        { value: 2, label: '2+ Stars' },
        { value: 3, label: '3+ Stars' },
        { value: 4, label: '4+ Stars' },
        { value: 5, label: '5 Stars' }
    ];

    const stockOptions = [
        { value: 'all', label: 'All Items' },
        { value: 'in-stock', label: 'In Stock' },
        { value: 'out-of-stock', label: 'Out of Stock' }
    ];

    const expiryOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'fresh', label: 'Fresh (7+ days)' },
        { value: 'expiring-soon', label: 'Expiring Soon (1-7 days)' },
        { value: 'expired', label: 'Expired' }
    ];

    const seasonOptions = filterOptions.seasons.map(season => ({
        value: season,
        label: season
    }));

    return (
        <aside className={`w-full lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'} ${className}`}>
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-[#e5d4ce]/20 shadow-xl sticky top-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-[#9c6b63] flex items-center gap-2">
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
                <FilterSection
                    title="Sort By"
                    icon={<Filter size={16} />}
                >
                    <CustomSelect
                        value={filters.sortBy}
                        onChange={(value) => onFilterChange('sortBy', value)}
                        options={sortOptions}
                        placeholder="Sort by..."
                        className="shadow-sm"
                    />
                </FilterSection>

                {/* Color Filter */}
                <FilterSection
                    title="Color"
                    icon={<Palette size={16} />}
                >
                    <ColorPicker
                        colors={filterOptions.colors}
                        selectedColor={filters.colorFilter}
                        onColorChange={(color) => onFilterChange('colorFilter', color)}
                    />
                </FilterSection>

                {/* Season Filter */}
                <FilterSection
                    title="Season"
                    icon={<Sun size={16} />}
                >
                    <CustomSelect
                        value={filters.seasonFilter}
                        onChange={(value) => onFilterChange('seasonFilter', value)}
                        options={seasonOptions}
                        placeholder="All Seasons"
                    />
                </FilterSection>

                {/* Freshness Filter */}
                <FilterSection
                    title="Freshness Level"
                    icon={<Droplets size={16} />}
                >
                    <RangeInput
                        min={filters.freshnessFilter.min}
                        max={filters.freshnessFilter.max}
                        onMinChange={(value) => onFilterChange('freshnessFilter', { ...filters.freshnessFilter, min: value })}
                        onMaxChange={(value) => onFilterChange('freshnessFilter', { ...filters.freshnessFilter, max: value })}
                        placeholder={{ min: 'Min (1-100)', max: 'Max (1-100)' }}
                    />
                    <div className="mt-2 text-xs text-[#9c6b63]/70">
                        Range: 1 (Poor) to 100 (Excellent)
                    </div>
                </FilterSection>

                {/* Lifespan Filter */}
                <FilterSection
                    title="Lifespan (Days)"
                    icon={<Clock size={16} />}
                >
                    <RangeInput
                        min={filters.lifespanFilter.min}
                        max={filters.lifespanFilter.max}
                        onMinChange={(value) => onFilterChange('lifespanFilter', { ...filters.lifespanFilter, min: value })}
                        onMaxChange={(value) => onFilterChange('lifespanFilter', { ...filters.lifespanFilter, max: value })}
                        placeholder={{ min: 'Min days', max: 'Max days' }}
                    />
                </FilterSection>

                {/* Expiry Status Filter */}
                <FilterSection
                    title="Expiry Status"
                    icon={<Calendar size={16} />}
                >
                    <CustomSelect
                        value={filters.expiryFilter}
                        onChange={(value) => onFilterChange('expiryFilter', value)}
                        options={expiryOptions}
                        placeholder="All Status"
                    />
                </FilterSection>

                {/* Price Range Filter */}
                <FilterSection
                    title="Price Range (€)"
                    icon={<DollarSign size={16} />}
                >
                    <RangeInput
                        min={filters.priceRange.min}
                        max={filters.priceRange.max}
                        onMinChange={(value) => onFilterChange('priceRange', { ...filters.priceRange, min: value })}
                        onMaxChange={(value) => onFilterChange('priceRange', { ...filters.priceRange, max: value })}
                        placeholder={{ min: 'Min €', max: 'Max €' }}
                    />
                </FilterSection>

                {/* Rating Filter */}
                <FilterSection
                    title="Minimum Rating"
                    icon={<Star size={16} />}
                >
                    <CustomSelect
                        value={filters.ratingFilter.toString()}
                        onChange={(value) => onFilterChange('ratingFilter', parseInt(value))}
                        options={ratingOptions.map(opt => ({ value: opt.value.toString(), label: opt.label }))}
                        placeholder="All Ratings"
                    />
                </FilterSection>

                {/* Stock Filter */}
                <FilterSection
                    title="Availability"
                    icon={<Package size={16} />}
                >
                    <CustomSelect
                        value={filters.stockFilter}
                        onChange={(value) => onFilterChange('stockFilter', value)}
                        options={stockOptions}
                        placeholder="All Items"
                    />
                </FilterSection>

                {/* Discount Filter */}
                <FilterSection
                    title="Special Offers"
                    icon={<DollarSign size={16} />}
                >
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-[#f8f6f3] transition-colors">
                        <input
                            type="checkbox"
                            checked={filters.discountFilter}
                            onChange={(e) => onFilterChange('discountFilter', e.target.checked)}
                            className="w-5 h-5 text-[#9c6b63] rounded focus:ring-[#9c6b63] focus:ring-2"
                        />
                        <span className="text-[#9c6b63] font-medium">On Sale Only</span>
                        {filters.discountFilter && (
                            <span className="ml-auto bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                                Active
                            </span>
                        )}
                    </label>
                </FilterSection>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4 border-t border-[#e5d4ce]/30">
                    <button
                        onClick={onClearFilters}
                        className="w-full px-6 py-3 text-[#9c6b63] bg-white border border-[#9c6b63] rounded-xl hover:bg-[#9c6b63] hover:text-white transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 font-medium"
                    >
                        <RotateCcw size={16} />
                        Clear All Filters
                    </button>
                </div>

                {/* Results Summary */}
                <div className="mt-6 pt-4 border-t border-[#e5d4ce]/30 text-center">
                    <p className="text-sm text-[#9c6b63]/80">
                        <span className="font-semibold text-[#9c6b63] text-lg">{totalResults}</span>
                        <br />
                        <span className="text-xs">flower{totalResults !== 1 ? 's' : ''} found</span>
                    </p>
                </div>

                {/* Filter Tags - Active Filters Summary */}
                {(filters.search || filters.colorFilter !== 'all' || filters.seasonFilter !== 'all' ||
                    filters.discountFilter || filters.stockFilter !== 'all' || filters.ratingFilter > 0) && (
                        <div className="mt-4 pt-4 border-t border-[#e5d4ce]/30">
                            <h4 className="text-sm font-medium text-[#9c6b63] mb-2">Active Filters:</h4>
                            <div className="flex flex-wrap gap-1">
                                {filters.search && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#9c6b63]/10 text-[#9c6b63] rounded-full text-xs">
                                        Search: "{filters.search}"
                                        <button
                                            onClick={() => onFilterChange('search', '')}
                                            className="hover:bg-[#9c6b63]/20 rounded-full p-0.5"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                                {filters.colorFilter !== 'all' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#9c6b63]/10 text-[#9c6b63] rounded-full text-xs">
                                        Color: {filters.colorFilter}
                                        <button
                                            onClick={() => onFilterChange('colorFilter', 'all')}
                                            className="hover:bg-[#9c6b63]/20 rounded-full p-0.5"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                )}
                                {filters.seasonFilter !== 'all' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#9c6b63]/10 text-[#9c6b63] rounded-full text-xs">
                                        Season: {filters.seasonFilter}
                                        <button
                                            onClick={() => onFilterChange('seasonFilter', 'all')}
                                            className="hover:bg-[#9c6b63]/20 rounded-full p-0.5"
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
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#9c6b63]/10 text-[#9c6b63] rounded-full text-xs">
                                        Stock: {filters.stockFilter}
                                        <button
                                            onClick={() => onFilterChange('stockFilter', 'all')}
                                            className="hover:bg-[#9c6b63]/20 rounded-full p-0.5"
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
});

FlowerFilters.displayName = 'FlowerFilters';

export default FlowerFilters;