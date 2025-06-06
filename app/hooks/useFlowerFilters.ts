// hooks/useFlowerFilters.ts - Custom hooks for flower page functionality
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Product, isFlowerProduct } from '@/app/types/product';

// Filter interfaces
export interface FlowerFilterState {
    search: string;
    colorFilter: string;
    seasonFilter: string;
    freshnessFilter: { min: string; max: string };
    lifespanFilter: { min: string; max: string };
    priceRange: { min: string; max: string };
    sortBy: string;
    ratingFilter: number;
    stockFilter: string;
    discountFilter: boolean;
    expiryFilter: string;
}

const defaultFilters: FlowerFilterState = {
    search: '',
    colorFilter: 'all',
    seasonFilter: 'all',
    freshnessFilter: { min: '', max: '' },
    lifespanFilter: { min: '', max: '' },
    priceRange: { min: '', max: '' },
    sortBy: 'name',
    ratingFilter: 0,
    stockFilter: 'all',
    discountFilter: false,
    expiryFilter: 'all',
};

// Custom hook for flower filtering
export const useFlowerFilters = (flowers: Product[]) => {
    const [filters, setFilters] = useState<FlowerFilterState>(defaultFilters);

    // Get unique filter values
    const filterOptions = useMemo(() => {
        const flowerProducts = flowers.filter(isFlowerProduct);
        return {
            colors: [...new Set(flowerProducts.map(flower => flower.details.color).filter(Boolean))],
            seasons: [...new Set(flowerProducts.map(flower => flower.details.season).filter(Boolean))],
        };
    }, [flowers]);

    // Apply filters to flowers
    const filteredFlowers = useMemo(() => {
        return flowers.filter(isFlowerProduct).filter(flower => {
            try {
                // Search filter
                const matchesSearch = !filters.search ||
                    flower.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                    flower.details.color.toLowerCase().includes(filters.search.toLowerCase()) ||
                    flower.details.season.toLowerCase().includes(filters.search.toLowerCase());

                // Color filter
                const matchesColor = filters.colorFilter === 'all' ||
                    flower.details.color === filters.colorFilter;

                // Season filter
                const matchesSeason = filters.seasonFilter === 'all' ||
                    flower.details.season === filters.seasonFilter;

                // Freshness filter
                const matchesFreshness = (!filters.freshnessFilter.min ||
                    flower.details.freshness >= parseInt(filters.freshnessFilter.min)) &&
                    (!filters.freshnessFilter.max ||
                        flower.details.freshness <= parseInt(filters.freshnessFilter.max));

                // Lifespan filter
                const matchesLifespan = (!filters.lifespanFilter.min ||
                    flower.details.lifespan >= parseInt(filters.lifespanFilter.min)) &&
                    (!filters.lifespanFilter.max ||
                        flower.details.lifespan <= parseInt(filters.lifespanFilter.max));

                // Price filter
                const minPrice = filters.priceRange.min ? parseFloat(filters.priceRange.min) : 0;
                const maxPrice = filters.priceRange.max ? parseFloat(filters.priceRange.max) : Infinity;
                const matchesPrice = flower.price >= minPrice && flower.price <= maxPrice;

                // Rating filter
                const matchesRating = filters.ratingFilter === 0 ||
                    (flower.averageRating || 0) >= filters.ratingFilter;

                // Stock filter
                const matchesStock = filters.stockFilter === 'all' ||
                    (filters.stockFilter === 'in-stock' && flower.stock > 0) ||
                    (filters.stockFilter === 'out-of-stock' && flower.stock === 0);

                // Discount filter
                const matchesDiscount = !filters.discountFilter || flower.discount > 0;

                // Expiry filter
                const now = new Date();
                const expiryDate = new Date(flower.details.expiryDate);
                const matchesExpiry = filters.expiryFilter === 'all' ||
                    (filters.expiryFilter === 'fresh' && expiryDate > now) ||
                    (filters.expiryFilter === 'expiring-soon' && expiryDate > now &&
                        expiryDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) ||
                    (filters.expiryFilter === 'expired' && expiryDate <= now);

                return matchesSearch && matchesColor && matchesSeason && matchesFreshness &&
                    matchesLifespan && matchesPrice && matchesRating && matchesStock &&
                    matchesDiscount && matchesExpiry;
            } catch (error) {
                console.error('Error filtering flower:', flower, error);
                return false;
            }
        });
    }, [flowers, filters]);

    // Sort filtered flowers
    const sortedFlowers = useMemo(() => {
        return [...filteredFlowers].sort((a, b) => {
            try {
                switch (filters.sortBy) {
                    case 'price-low':
                        return a.price - b.price;
                    case 'price-high':
                        return b.price - a.price;
                    case 'rating':
                        return (b.averageRating || 0) - (a.averageRating || 0);
                    case 'newest':
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    case 'freshness-high':
                        return b.details.freshness - a.details.freshness;
                    case 'freshness-low':
                        return a.details.freshness - b.details.freshness;
                    case 'lifespan-high':
                        return b.details.lifespan - a.details.lifespan;
                    case 'lifespan-low':
                        return a.details.lifespan - b.details.lifespan;
                    case 'expiry-date':
                        return new Date(a.details.expiryDate).getTime() -
                            new Date(b.details.expiryDate).getTime();
                    case 'color':
                        return a.details.color.localeCompare(b.details.color);
                    case 'name':
                    default:
                        return a.name.localeCompare(b.name);
                }
            } catch (error) {
                console.error('Error sorting flowers:', error);
                return 0;
            }
        });
    }, [filteredFlowers, filters.sortBy]);

    // Update specific filter
    const updateFilter = useCallback((key: keyof FlowerFilterState, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    // Clear all filters
    const clearAllFilters = useCallback(() => {
        setFilters(defaultFilters);
    }, []);

    return {
        filters,
        filteredFlowers,
        sortedFlowers,
        filterOptions,
        updateFilter,
        clearAllFilters,
        setFilters,
    };
};

// Custom hook for pagination
export const usePagination = (items: any[], itemsPerPage: number = 12) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(items.length / itemsPerPage);

    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return items.slice(startIndex, endIndex);
    }, [items, currentPage, itemsPerPage]);

    // Reset to first page when items change
    useEffect(() => {
        setCurrentPage(1);
    }, [items.length]);

    // Get pagination numbers for display
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

    const goToPage = useCallback((page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }, [totalPages]);

    const goToNextPage = useCallback(() => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    }, [totalPages]);

    const goToPreviousPage = useCallback(() => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    }, []);

    return {
        currentPage,
        totalPages,
        paginatedItems,
        getPaginationNumbers,
        goToPage,
        goToNextPage,
        goToPreviousPage,
        setCurrentPage,
    };
};

// Custom hook for mobile filter toggle
export const useMobileFilters = () => {
    const [showFilters, setShowFilters] = useState(false);

    const toggleFilters = useCallback(() => {
        setShowFilters(prev => !prev);
    }, []);

    const hideFilters = useCallback(() => {
        setShowFilters(false);
    }, []);

    const showFiltersMobile = useCallback(() => {
        setShowFilters(true);
    }, []);

    // Close filters when clicking outside (for mobile)
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) { // lg breakpoint
                setShowFilters(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return {
        showFilters,
        toggleFilters,
        hideFilters,
        showFiltersMobile,
    };
};

// Custom hook for flower analytics
export const useFlowerAnalytics = (flowers: Product[]) => {
    const analytics = useMemo(() => {
        const flowerProducts = flowers.filter(isFlowerProduct);

        if (flowerProducts.length === 0) {
            return {
                totalFlowers: 0,
                inStock: 0,
                outOfStock: 0,
                onSale: 0,
                averagePrice: 0,
                averageRating: 0,
                freshnessDistribution: {},
                colorDistribution: {},
                seasonDistribution: {},
            };
        }

        const inStock = flowerProducts.filter(f => f.stock > 0).length;
        const outOfStock = flowerProducts.filter(f => f.stock === 0).length;
        const onSale = flowerProducts.filter(f => f.discount > 0).length;

        const totalPrice = flowerProducts.reduce((sum, f) => sum + f.price, 0);
        const averagePrice = totalPrice / flowerProducts.length;

        const ratingsSum = flowerProducts.reduce((sum, f) => sum + (f.averageRating || 0), 0);
        const averageRating = ratingsSum / flowerProducts.length;

        // Distribution analysis
        const freshnessDistribution = flowerProducts.reduce((acc, f) => {
            const range = f.details.freshness >= 80 ? 'High (80-100)' :
                f.details.freshness >= 60 ? 'Medium (60-79)' :
                    'Low (0-59)';
            acc[range] = (acc[range] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const colorDistribution = flowerProducts.reduce((acc, f) => {
            acc[f.details.color] = (acc[f.details.color] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const seasonDistribution = flowerProducts.reduce((acc, f) => {
            acc[f.details.season] = (acc[f.details.season] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalFlowers: flowerProducts.length,
            inStock,
            outOfStock,
            onSale,
            averagePrice,
            averageRating,
            freshnessDistribution,
            colorDistribution,
            seasonDistribution,
        };
    }, [flowers]);

    return analytics;
};

// Custom hook for search suggestions
export const useFlowerSearchSuggestions = (flowers: Product[], searchTerm: string) => {
    const suggestions = useMemo(() => {
        if (!searchTerm || searchTerm.length < 2) return [];

        const flowerProducts = flowers.filter(isFlowerProduct);
        const term = searchTerm.toLowerCase();

        const matches = new Set<string>();

        flowerProducts.forEach(flower => {
            // Name matches
            if (flower.name.toLowerCase().includes(term)) {
                matches.add(flower.name);
            }

            // Color matches
            if (flower.details.color.toLowerCase().includes(term)) {
                matches.add(flower.details.color);
            }

            // Season matches
            if (flower.details.season.toLowerCase().includes(term)) {
                matches.add(flower.details.season);
            }
        });

        return Array.from(matches).slice(0, 5); // Limit to 5 suggestions
    }, [flowers, searchTerm]);

    return suggestions;
};