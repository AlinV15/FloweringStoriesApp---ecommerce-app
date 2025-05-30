import { create } from 'zustand';

export interface StationaryDetails {
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

export interface Review {
    _id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface StationaryProduct {
    _id: string;
    name: string;
    price: number;
    typeRef: 'Stationary';
    image: string;
    stock: number;
    discount: number;
    Description?: string;
    details: StationaryDetails;
    reviews?: Review[];
    averageRating?: number;
    createdAt: string;
    updatedAt: string;
}

interface PriceRange {
    min: string;
    max: string;
}

interface StationaryState {
    // Data
    stationary: StationaryProduct[];
    loading: boolean;
    error: string | null;

    // Computed data
    filteredStationary: StationaryProduct[];
    sortedStationary: StationaryProduct[];
    paginatedStationary: StationaryProduct[];
    totalPages: number;
    uniqueTypes: string[];
    uniqueBrands: string[];
    uniqueColors: string[];
    uniqueMaterials: string[];

    // Filters
    search: string;
    typeFilter: string;
    brandFilter: string;
    colorFilter: string;
    materialFilter: string;
    priceRange: PriceRange;
    sortBy: string;
    ratingFilter: number;
    stockFilter: string;
    discountFilter: boolean;

    // Pagination
    currentPage: number;
    itemsPerPage: number;
    showFilters: boolean;

    // Actions
    fetchStationary: () => Promise<void>;
    setSearch: (search: string) => void;
    setTypeFilter: (type: string) => void;
    setBrandFilter: (brand: string) => void;
    setColorFilter: (color: string) => void;
    setMaterialFilter: (material: string) => void;
    setPriceRange: (priceRange: PriceRange) => void;
    setSortBy: (sortBy: string) => void;
    setRatingFilter: (rating: number) => void;
    setStockFilter: (stock: string) => void;
    setDiscountFilter: (discount: boolean) => void;
    setCurrentPage: (page: number) => void;
    setShowFilters: (show: boolean) => void;
    clearAllFilters: () => void;

    // Internal methods for filtering, sorting, and pagination
    applyFilters: () => void;
    applySorting: () => void;
    applyPagination: () => void;
}

export const useStationaryStore = create<StationaryState>((set, get) => ({
    // Initial state
    stationary: [],
    loading: false,
    error: null,
    filteredStationary: [],
    sortedStationary: [],
    paginatedStationary: [],
    totalPages: 0,
    uniqueTypes: [],
    uniqueBrands: [],
    uniqueColors: [],
    uniqueMaterials: [],
    search: '',
    typeFilter: 'all',
    brandFilter: 'all',
    colorFilter: 'all',
    materialFilter: 'all',
    priceRange: { min: '', max: '' },
    sortBy: 'name',
    ratingFilter: 0,
    stockFilter: 'all',
    discountFilter: false,
    currentPage: 1,
    itemsPerPage: 12,
    showFilters: false,

    // Actions
    fetchStationary: async () => {
        set({ loading: true, error: null });
        try {
            const response = await fetch('/api/product?type=stationary');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const stationaryProducts = (data.products || [])
                .filter((product: StationaryProduct) => product.typeRef === 'Stationary' && product.details)
                .map((product: StationaryProduct) => ({
                    ...product,
                    details: product.details,
                    averageRating: (product.reviews?.length ?? 0) > 0
                        ? product.reviews!.reduce((acc, review) => acc + review.rating, 0) / (product.reviews?.length ?? 1)
                        : 0
                }));

            // Calculate unique values
            const uniqueTypes = [...new Set(stationaryProducts.map((item: StationaryProduct) => item.details.type).filter(Boolean) as string[])];
            const uniqueBrands = [...new Set(stationaryProducts.map((item: StationaryProduct) => item.details.brand).filter(Boolean) as string[])];
            const uniqueColors = [...new Set(stationaryProducts.flatMap((item: StationaryProduct) => item.details.color).filter(Boolean) as string[])];
            const uniqueMaterials = [...new Set(stationaryProducts.map((item: StationaryProduct) => item.details.material).filter(Boolean) as string[])];

            set({
                stationary: stationaryProducts,
                uniqueTypes,
                uniqueBrands,
                uniqueColors,
                uniqueMaterials,
                loading: false
            });

            // Trigger filtering and pagination
            get().applyFilters();
        } catch (err) {
            console.error('Fetch error:', err);
            set({
                error: err instanceof Error ? err.message : 'Failed to fetch stationary products',
                loading: false
            });
        }
    },

    applyFilters: () => {
        const state = get();
        const { stationary, search, typeFilter, brandFilter, colorFilter, materialFilter,
            priceRange, ratingFilter, stockFilter, discountFilter } = state;

        const filtered = stationary.filter(item => {
            // Search filter
            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.details.brand.toLowerCase().includes(search.toLowerCase()) ||
                item.details.type.toLowerCase().includes(search.toLowerCase()) ||
                item.details.material.toLowerCase().includes(search.toLowerCase());

            // Category filters
            const matchesType = typeFilter === 'all' || item.details.type === typeFilter;
            const matchesBrand = brandFilter === 'all' || item.details.brand === brandFilter;
            const matchesColor = colorFilter === 'all' || item.details.color.includes(colorFilter);
            const matchesMaterial = materialFilter === 'all' || item.details.material === materialFilter;

            // Price filter
            const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
            const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
            const matchesPrice = item.price >= minPrice && item.price <= maxPrice;

            // Other filters
            const matchesRating = ratingFilter === 0 || (item.averageRating || 0) >= ratingFilter;
            const matchesStock = stockFilter === 'all' ||
                (stockFilter === 'in-stock' && item.stock > 0) ||
                (stockFilter === 'out-of-stock' && item.stock === 0);
            const matchesDiscount = !discountFilter || item.discount > 0;

            return matchesSearch && matchesType && matchesBrand && matchesColor &&
                matchesMaterial && matchesPrice && matchesRating && matchesStock && matchesDiscount;
        });

        set({ filteredStationary: filtered });
        get().applySorting();
    },

    applySorting: () => {
        const { filteredStationary, sortBy } = get();

        const sorted = [...filteredStationary].sort((a, b) => {
            switch (sortBy) {
                case 'brand':
                    return a.details.brand.localeCompare(b.details.brand);
                case 'type':
                    return a.details.type.localeCompare(b.details.type);
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

        set({ sortedStationary: sorted });
        get().applyPagination();
    },

    applyPagination: () => {
        const { sortedStationary, currentPage, itemsPerPage } = get();
        const totalPages = Math.ceil(sortedStationary.length / itemsPerPage);
        const paginatedStationary = sortedStationary.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );

        set({ paginatedStationary, totalPages });
    },

    setSearch: (search: string) => {
        set({ search, currentPage: 1 });
        get().applyFilters();
    },

    setTypeFilter: (type: string) => {
        set({ typeFilter: type, currentPage: 1 });
        get().applyFilters();
    },

    setBrandFilter: (brand: string) => {
        set({ brandFilter: brand, currentPage: 1 });
        get().applyFilters();
    },

    setColorFilter: (color: string) => {
        set({ colorFilter: color, currentPage: 1 });
        get().applyFilters();
    },

    setMaterialFilter: (material: string) => {
        set({ materialFilter: material, currentPage: 1 });
        get().applyFilters();
    },

    setPriceRange: (priceRange: PriceRange) => {
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
            typeFilter: 'all',
            brandFilter: 'all',
            colorFilter: 'all',
            materialFilter: 'all',
            priceRange: { min: '', max: '' },
            sortBy: 'name',
            ratingFilter: 0,
            stockFilter: 'all',
            discountFilter: false,
            currentPage: 1
        });
        get().applyFilters();
    }
}));