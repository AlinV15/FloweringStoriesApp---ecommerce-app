// components/FlowerSearch.tsx - Advanced search with autocomplete
'use client';

import { useState, useRef, useEffect, memo } from 'react';
import { Search, X, Filter, Sparkles, Clock, TrendingUp } from 'lucide-react';
import { useFlowerSearchSuggestions } from '../hooks/useFlowerFilters';
import { Product } from '@/app/types/product';

interface FlowerSearchProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    flowers: Product[];
    onShowFilters: () => void;
    showFiltersButton?: boolean;
    placeholder?: string;
    className?: string;
}

interface SearchSuggestion {
    text: string;
    type: 'name' | 'color' | 'season' | 'recent';
    icon?: React.ReactNode;
}

// Recent searches storage key
const RECENT_SEARCHES_KEY = 'flower_recent_searches';
const MAX_RECENT_SEARCHES = 5;

// Get recent searches from localStorage
const getRecentSearches = (): string[] => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

// Save search to recent searches
const saveToRecentSearches = (search: string) => {
    if (typeof window === 'undefined' || !search.trim()) return;

    try {
        const recent = getRecentSearches();
        const filtered = recent.filter(item => item.toLowerCase() !== search.toLowerCase());
        const updated = [search, ...filtered].slice(0, MAX_RECENT_SEARCHES);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
        // Ignore localStorage errors
    }
};

const FlowerSearch = memo(({
    searchTerm,
    onSearchChange,
    flowers,
    onShowFilters,
    showFiltersButton = true,
    placeholder = "Search flowers, colors, seasons...",
    className = ""
}: FlowerSearchProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Get search suggestions using the custom hook
    const autocompleteSuggestions = useFlowerSearchSuggestions(flowers, searchTerm);

    // Load recent searches on mount
    useEffect(() => {
        setRecentSearches(getRecentSearches());
    }, []);

    // Handle clicking outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
                setIsFocused(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle search input change
    const handleSearchChange = (value: string) => {
        onSearchChange(value);
        setShowSuggestions(value.length > 0 || isFocused);
    };

    // Handle search submission
    const handleSearchSubmit = (searchValue: string) => {
        if (searchValue.trim()) {
            saveToRecentSearches(searchValue.trim());
            setRecentSearches(getRecentSearches());
            onSearchChange(searchValue.trim());
        }
        setShowSuggestions(false);
        inputRef.current?.blur();
    };

    // Handle suggestion click
    const handleSuggestionClick = (suggestion: string) => {
        handleSearchSubmit(suggestion);
    };

    // Clear search
    const clearSearch = () => {
        onSearchChange('');
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    // Handle focus
    const handleFocus = () => {
        setIsFocused(true);
        setShowSuggestions(true);
    };

    // Prepare suggestions to show
    const suggestions: SearchSuggestion[] = [];

    // Add recent searches if no search term
    if (!searchTerm.trim() && recentSearches.length > 0) {
        suggestions.push(
            ...recentSearches.map(search => ({
                text: search,
                type: 'recent' as const,
                icon: <Clock size={14} className="text-gray-400" />
            }))
        );
    }

    // Add autocomplete suggestions if there's a search term
    if (searchTerm.trim() && autocompleteSuggestions.length > 0) {
        suggestions.push(
            ...autocompleteSuggestions.map(suggestion => ({
                text: suggestion,
                type: 'name' as const,
                icon: <Sparkles size={14} className="text-[#9c6b63]" />
            }))
        );
    }

    // Popular searches (could be dynamic based on analytics)
    const popularSearches = ['Roses', 'Tulips', 'Red', 'Spring', 'Fresh'];
    if (!searchTerm.trim() && suggestions.length === 0) {
        suggestions.push(
            ...popularSearches.map(search => ({
                text: search,
                type: 'name' as const,
                icon: <TrendingUp size={14} className="text-green-500" />
            }))
        );
    }

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {/* Search Input Container */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                {/* Search Input */}
                <div className={`relative flex-1 transition-all duration-200 ${isFocused ? 'transform scale-[1.02]' : ''
                    }`}>
                    <div className={`relative overflow-hidden rounded-xl border transition-all duration-200 ${isFocused
                            ? 'border-[#9c6b63] ring-2 ring-[#9c6b63]/20 shadow-lg'
                            : 'border-[#e5d4ce]/30 shadow-md hover:border-[#9c6b63]/50'
                        }`}>
                        <Search
                            className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${isFocused ? 'text-[#9c6b63]' : 'text-[#9c6b63]/60'
                                }`}
                            size={20}
                        />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder={placeholder}
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            onFocus={handleFocus}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearchSubmit(searchTerm);
                                } else if (e.key === 'Escape') {
                                    setShowSuggestions(false);
                                    inputRef.current?.blur();
                                }
                            }}
                            className="w-full pl-12 pr-12 py-4 bg-white/90 backdrop-blur-sm text-neutral-700 placeholder:text-gray-400 focus:outline-none transition-all duration-200"
                        />
                        {searchTerm && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                                aria-label="Clear search"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile Filter Button */}
                {showFiltersButton && (
                    <button
                        onClick={onShowFilters}
                        className="lg:hidden px-6 py-4 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 min-w-max"
                        style={{ background: 'linear-gradient(135deg, #9c6b63 0%, #c1a5a2 100%)' }}
                    >
                        <Filter size={20} />
                        Filters
                    </button>
                )}
            </div>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm border border-[#e5d4ce]/30 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-[#e5d4ce]/20">
                        <h3 className="text-sm font-semibold text-[#9c6b63] flex items-center gap-2">
                            {!searchTerm.trim() ? (
                                recentSearches.length > 0 ? (
                                    <>
                                        <Clock size={14} />
                                        Recent Searches
                                    </>
                                ) : (
                                    <>
                                        <TrendingUp size={14} />
                                        Popular Searches
                                    </>
                                )
                            ) : (
                                <>
                                    <Sparkles size={14} />
                                    Suggestions
                                </>
                            )}
                        </h3>
                    </div>

                    {/* Suggestions List */}
                    <div className="py-2">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={`${suggestion.type}-${suggestion.text}-${index}`}
                                onClick={() => handleSuggestionClick(suggestion.text)}
                                className="w-full px-4 py-3 text-left hover:bg-[#f8f6f3] transition-colors flex items-center gap-3 group"
                            >
                                {suggestion.icon}
                                <span className="flex-1 text-gray-700 group-hover:text-[#9c6b63] transition-colors">
                                    {suggestion.text}
                                </span>
                                {suggestion.type === 'recent' && (
                                    <span className="text-xs text-gray-400">Recent</span>
                                )}
                                {suggestion.type === 'name' && searchTerm && (
                                    <span className="text-xs text-[#9c6b63]">Suggested</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Clear Recent Searches */}
                    {!searchTerm.trim() && recentSearches.length > 0 && (
                        <div className="px-4 py-3 border-t border-[#e5d4ce]/20">
                            <button
                                onClick={() => {
                                    localStorage.removeItem(RECENT_SEARCHES_KEY);
                                    setRecentSearches([]);
                                }}
                                className="text-sm text-gray-500 hover:text-[#9c6b63] transition-colors flex items-center gap-2"
                            >
                                <X size={12} />
                                Clear recent searches
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

FlowerSearch.displayName = 'FlowerSearch';

export default FlowerSearch;