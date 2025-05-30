import { create } from 'zustand';

export interface FlowerDetails {
    color: string;
    freshness: number;
    lifespan: number;
    season: string;
    careInstructions: string;
    expiryDate: Date;
}

export interface Review {
    _id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface FlowerProduct {
    _id: string;
    name: string;
    price: number;
    typeRef: 'Flower';
    image: string;
    stock: number;
    discount: number;
    Description?: string;
    details: FlowerDetails;
    reviews?: Review[];
    averageRating?: number;
    createdAt: string;
    updatedAt: string;
}

interface RangeFilter {
    min: string;
    max: string;
}

interface FlowersState {
    // Data
    flowers: FlowerProduct[];
    loading: boolean;
    error: string | null;

    // Computed data
    filteredFlowers: FlowerProduct[];
    sortedFlowers: FlowerProduct[];
    paginatedFlowers: FlowerProduct[];
    totalPages: number;
    uniqueColors: string[];
    uniqueSeasons: string[];

    // Filters
    search: string;
    colorFilter: string;
    seasonFilter: string;
    freshnessFilter: RangeFilter;
    lifespanFilter: RangeFilter;
    priceRange: RangeFilter;
    sortBy: string;
    ratingFilter: number;
    stockFilter: string;
    discountFilter: boolean;
    expiryFilter: string;

    // Pagination
    currentPage: number;
    itemsPerPage: number;
    showFilters: boolean;

    // Actions
    fetchFlowers: () => Promise<void>;
    setSearch: (search: string) => void;
    setColorFilter: (color: string) => void;
    setSeasonFilter: (season: string) => void;
    setFreshnessFilter: (freshnessFilter: RangeFilter) => void;
    setLifespanFilter: (lifespanFilter: RangeFilter) => void;
    setPriceRange: (priceRange: RangeFilter) => void;
    setSortBy: (sortBy: string) => void;
    setRatingFilter: (rating: number) => void;
    setStockFilter: (stock: string) => void;
    setDiscountFilter: (discount: boolean) => void;
    setExpiryFilter: (expiry: string) => void;
    setCurrentPage: (page: number) => void;
    setShowFilters: (show: boolean) => void;
    clearAllFilters: () => void;

    // Missing methods
    applyFilters: () => void;
    applySorting: () => void;
    applyPagination: () => void;
}

export const useFlowersStore = create<FlowersState>((set, get) => ({
    // Initial state
    flowers: [],
    loading: false,
    error: null,
    filteredFlowers: [],
    sortedFlowers: [],
    paginatedFlowers: [],
    totalPages: 0,
    uniqueColors: [],
    uniqueSeasons: [],
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
    currentPage: 1,
    itemsPerPage: 12,
    showFilters: false,

    // Actions
    fetchFlowers: async () => {
        set({ loading: true, error: null });
        try {
            const response = await fetch('/api/product?type=flower');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const flowerProducts = (data.products || [])
                .filter((product: FlowerProduct) => product.typeRef === 'Flower' && product.details)
                .map((product: FlowerProduct) => ({
                    ...product,
                    details: product.details,
                    averageRating: (product.reviews?.length ?? 0) > 0
                        ? product.reviews!.reduce((acc, review) => acc + review.rating, 0) / (product.reviews?.length ?? 1)
                        : 0
                }));

            // Calculate unique values
            const uniqueColors = Array.from(new Set(flowerProducts.map((flower: FlowerProduct) => flower.details.color).filter(Boolean))) as string[];
            const uniqueSeasons = Array.from(new Set(flowerProducts.map((flower: FlowerProduct) => flower.details.season).filter(Boolean))) as string[];

            set({
                flowers: flowerProducts,
                uniqueColors,
                uniqueSeasons,
                loading: false
            });

            // Trigger filtering and pagination
            get().applyFilters();
        } catch (err) {
            console.error('Fetch error:', err);
            set({
                error: err instanceof Error ? err.message : 'Failed to fetch flowers',
                loading: false
            });
        }
    },

    applyFilters: () => {
        const state = get();
        const { flowers, search, colorFilter, seasonFilter, freshnessFilter, lifespanFilter,
            priceRange, ratingFilter, stockFilter, discountFilter, expiryFilter } = state;

        const filtered = flowers.filter(flower => {
            // Search filter
            const matchesSearch = flower.name.toLowerCase().includes(search.toLowerCase()) ||
                flower.details.color.toLowerCase().includes(search.toLowerCase()) ||
                flower.details.season.toLowerCase().includes(search.toLowerCase());

            // Category filters
            const matchesColor = colorFilter === 'all' || flower.details.color === colorFilter;
            const matchesSeason = seasonFilter === 'all' || flower.details.season === seasonFilter;

            // Range filters
            const matchesFreshness = (!freshnessFilter.min || flower.details.freshness >= parseInt(freshnessFilter.min)) &&
                (!freshnessFilter.max || flower.details.freshness <= parseInt(freshnessFilter.max));

            const matchesLifespan = (!lifespanFilter.min || flower.details.lifespan >= parseInt(lifespanFilter.min)) &&
                (!lifespanFilter.max || flower.details.lifespan <= parseInt(lifespanFilter.max));

            // Price filter
            const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
            const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
            const matchesPrice = flower.price >= minPrice && flower.price <= maxPrice;

            // Other filters
            const matchesRating = ratingFilter === 0 || (flower.averageRating || 0) >= ratingFilter;
            const matchesStock = stockFilter === 'all' ||
                (stockFilter === 'in-stock' && flower.stock > 0) ||
                (stockFilter === 'out-of-stock' && flower.stock === 0);
            const matchesDiscount = !discountFilter || flower.discount > 0;

            // Expiry filter
            const now = new Date();
            const expiryDate = new Date(flower.details.expiryDate);
            const matchesExpiry = expiryFilter === 'all' ||
                (expiryFilter === 'fresh' && expiryDate > now) ||
                (expiryFilter === 'expiring-soon' && expiryDate > now && expiryDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) ||
                (expiryFilter === 'expired' && expiryDate <= now);

            return matchesSearch && matchesColor && matchesSeason && matchesFreshness &&
                matchesLifespan && matchesPrice && matchesRating && matchesStock &&
                matchesDiscount && matchesExpiry;
        });

        set({ filteredFlowers: filtered });
        get().applySorting();
    },

    applySorting: () => {
        const { filteredFlowers, sortBy } = get();

        const sorted = [...filteredFlowers].sort((a, b) => {
            switch (sortBy) {
                case 'color':
                    return a.details.color.localeCompare(b.details.color);
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'rating':
                    return (b.averageRating || 0) - (a.averageRating || 0);
                case 'freshness-high':
                    return b.details.freshness - a.details.freshness;
                case 'freshness-low':
                    return a.details.freshness - b.details.freshness;
                case 'lifespan-high':
                    return b.details.lifespan - a.details.lifespan;
                case 'lifespan-low':
                    return a.details.lifespan - b.details.lifespan;
                case 'expiry-date':
                    return new Date(a.details.expiryDate).getTime() - new Date(b.details.expiryDate).getTime();
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'name':
                default:
                    return a.name.localeCompare(b.name);
            }
        });

        set({ sortedFlowers: sorted });
        get().applyPagination();
    },

    applyPagination: () => {
        const { sortedFlowers, currentPage, itemsPerPage } = get();
        const totalPages = Math.ceil(sortedFlowers.length / itemsPerPage);
        const paginatedFlowers = sortedFlowers.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );

        set({ paginatedFlowers, totalPages });
    },

    setSearch: (search: string) => {
        set({ search, currentPage: 1 });
        get().applyFilters();
    },

    setColorFilter: (color: string) => {
        set({ colorFilter: color, currentPage: 1 });
        get().applyFilters();
    },

    setSeasonFilter: (season: string) => {
        set({ seasonFilter: season, currentPage: 1 });
        get().applyFilters();
    },

    setFreshnessFilter: (freshnessFilter: RangeFilter) => {
        set({ freshnessFilter, currentPage: 1 });
        get().applyFilters();
    },

    setLifespanFilter: (lifespanFilter: RangeFilter) => {
        set({ lifespanFilter, currentPage: 1 });
        get().applyFilters();
    },

    setPriceRange: (priceRange: RangeFilter) => {
        set({ priceRange, currentPage: 1 });
        get().applyFilters();
    },

    setSortBy: (sortBy: string) => {
        set({ sortBy });
        get().applySorting();
    },

    setRatingFilter: (rating: number) => {
        set({ ratingFilter: rating, currentPage: 1 });
        get().applyFilters();
    },

    setStockFilter: (stock: string) => {
        set({ stockFilter: stock, currentPage: 1 });
        get().applyFilters();
    },

    setDiscountFilter: (discount: boolean) => {
        set({ discountFilter: discount, currentPage: 1 });
        get().applyFilters();
    },

    setExpiryFilter: (expiry: string) => {
        set({ expiryFilter: expiry, currentPage: 1 });
        get().applyFilters();
    },

    setCurrentPage: (page: number) => {
        set({ currentPage: page });
        get().applyPagination();
    },

    setShowFilters: (show: boolean) => {
        set({ showFilters: show });
    },

    clearAllFilters: () => {
        set({
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
            currentPage: 1
        });
        get().applyFilters();
    }
}));