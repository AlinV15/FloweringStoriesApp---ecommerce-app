// stores/ProductStore.ts - Fixed to prevent infinite loops
import { create } from 'zustand';
import { ProductEntry } from '@/app/types/index';
import {
    Product,
    convertProductEntryToProduct,
    isBookProduct,
    isStationaryProduct,
    isFlowerProduct
} from '@/app/types/product';
import { getBestseller, getFeaturedProductsBayesian, getNewestProduct } from '@/lib/utils/rating';

// Filter interfaces
export interface PriceRange {
    min: string;
    max: string;
}

export interface YearRange {
    from: string;
    to: string;
}

export interface NumberRange {
    min: string;
    max: string;
}

export interface ProductFilters {
    search: string;
    categoryFilter: string;
    priceRange: PriceRange;
    sortBy: string;
    ratingFilter: number;
    stockFilter: string;
    discountFilter: boolean;

    // Book filters
    genreFilter: string;
    authorFilter: string;
    languageFilter: string;
    publisherFilter: string;
    yearFilter: YearRange;
    pagesFilter: NumberRange;

    // Stationary filters
    brandFilter: string;
    colorFilter: string;
    materialFilter: string;
    stationaryTypeFilter: string;

    // Flower filters
    flowerColorFilter: string;
    seasonFilter: string;
    freshnessFilter: NumberRange;
    lifespanFilter: NumberRange;
}

const defaultFilters: ProductFilters = {
    search: '',
    categoryFilter: 'all',
    priceRange: { min: '', max: '' },
    sortBy: 'name',
    ratingFilter: 0,
    stockFilter: 'all',
    discountFilter: false,

    // Book filters
    genreFilter: 'all',
    authorFilter: '',
    languageFilter: 'all',
    publisherFilter: 'all',
    yearFilter: { from: '', to: '' },
    pagesFilter: { min: '', max: '' },

    // Stationary filters
    brandFilter: 'all',
    colorFilter: 'all',
    materialFilter: 'all',
    stationaryTypeFilter: 'all',

    // Flower filters
    flowerColorFilter: 'all',
    seasonFilter: 'all',
    freshnessFilter: { min: '', max: '' },
    lifespanFilter: { min: '', max: '' }
};

interface ProductStore {
    // Raw API data
    rawProducts: ProductEntry[];

    // Converted unified products
    products: Product[];
    allProducts: Product[];

    // Filtered and sorted products
    filteredProducts: Product[];

    // Current filters
    filters: ProductFilters;

    // State
    loading: boolean;
    error: string | null;
    initialized: boolean; // Add this to track if we've fetched data

    // Actions
    fetchProducts: () => Promise<void>;
    setFilters: (filters: Partial<ProductFilters>) => void;
    clearFilters: () => void;
    applyFilters: () => void;

    // Getters
    getFeatured: () => Product[];
    getBestseller: () => Product | null;
    getNewest: () => Product | null;

    // Filter options getters
    getUniqueGenres: () => string[];
    getUniqueAuthors: () => string[];
    getUniqueLanguages: () => string[];
    getUniquePublishers: () => string[];
    getUniqueBrands: () => string[];
    getUniqueColors: () => string[];
    getUniqueMaterials: () => string[];
    getUniqueStationaryTypes: () => string[];
    getUniqueFlowerColors: () => string[];
    getUniqueSeasons: () => string[];

    // Update
    updateProduct: (id: string, data: Partial<ProductEntry>) => Promise<Product | null>;
}

export const useProductStore = create<ProductStore>((set, get) => ({
    rawProducts: [],
    products: [],
    allProducts: [],
    filteredProducts: [],
    filters: defaultFilters,
    loading: false,
    error: null,
    initialized: false,

    fetchProducts: async () => {
        const { loading, initialized } = get();

        // Prevent multiple simultaneous fetches
        if (loading || initialized) return;

        set({ loading: true, error: null });

        try {
            const res = await fetch('/api/product');
            if (!res.ok) throw new Error("Failed to fetch products");
            const data = await res.json();
            console.log("Fetched raw products:", data.products);

            // Convert ProductEntry to unified Product types
            const convertedProducts: Product[] = (data.products || [])
                .map((apiProduct: ProductEntry): Product | null => {
                    try {
                        return convertProductEntryToProduct(apiProduct);
                    } catch (conversionError: unknown) {
                        console.error('Error converting product:', apiProduct, conversionError);
                        return null;
                    }
                })
                .filter((product: Product | null): product is Product => product !== null);

            console.log("Converted products:", convertedProducts);

            set({
                rawProducts: data.products,
                allProducts: convertedProducts,
                products: convertedProducts,
                filteredProducts: convertedProducts, // Set initial filtered products
                loading: false,
                initialized: true
            });

            // Apply filters only once after initial load
            setTimeout(() => {
                get().applyFilters();
            }, 0);

        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    setFilters: (newFilters: Partial<ProductFilters>) => {
        set(state => ({
            filters: { ...state.filters, ...newFilters }
        }));

        // Debounce filter application to prevent excessive calls
        const applyFilters = get().applyFilters;
        setTimeout(() => {
            applyFilters();
        }, 100);
    },

    clearFilters: () => {
        set({ filters: defaultFilters });
        setTimeout(() => {
            get().applyFilters();
        }, 0);
    },

    applyFilters: () => {
        const { allProducts, filters } = get();

        if (!allProducts.length) {
            set({ filteredProducts: [] });
            return;
        }

        try {
            // Apply filters
            let filtered = allProducts.filter(product => {
                try {
                    // Category filter
                    const matchesCategory = filters.categoryFilter === 'all' || product.type === filters.categoryFilter;

                    // Search filter
                    const matchesSearch = !filters.search ||
                        product.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
                        (isBookProduct(product) && product.details.author?.toLowerCase().includes(filters.search.toLowerCase())) ||
                        (isStationaryProduct(product) && product.details.brand?.toLowerCase().includes(filters.search.toLowerCase())) ||
                        (isFlowerProduct(product) && product.details.color?.toLowerCase().includes(filters.search.toLowerCase()));

                    // Price range filter
                    const minPrice = filters.priceRange.min ? Math.max(0, parseFloat(filters.priceRange.min)) : 0;
                    const maxPrice = filters.priceRange.max ? Math.max(0, parseFloat(filters.priceRange.max)) : Infinity;
                    const productPrice = typeof product.price === 'number' ? product.price : 0;
                    const matchesPrice = productPrice >= minPrice && productPrice <= maxPrice;

                    // Rating filter
                    const matchesRating = filters.ratingFilter === 0 || (product.averageRating || 0) >= filters.ratingFilter;

                    // Stock filter
                    const matchesStock = filters.stockFilter === 'all' ||
                        (filters.stockFilter === 'in-stock' && product.stock > 0) ||
                        (filters.stockFilter === 'out-of-stock' && product.stock === 0);

                    // Discount filter
                    const matchesDiscount = !filters.discountFilter || product.discount > 0;

                    // Book specific filters
                    let matchesBookFilters = true;
                    if (isBookProduct(product)) {
                        const matchesGenre = filters.genreFilter === 'all' || product.details.genre === filters.genreFilter;
                        const matchesAuthor = !filters.authorFilter || product.details.author?.toLowerCase().includes(filters.authorFilter.toLowerCase());
                        const matchesLanguage = filters.languageFilter === 'all' || product.details.language === filters.languageFilter;
                        const matchesPublisher = filters.publisherFilter === 'all' || product.details.publisher === filters.publisherFilter;

                        const bookYear = new Date(product.details.publicationDate).getFullYear();
                        const matchesYear = (!filters.yearFilter.from || bookYear >= parseInt(filters.yearFilter.from)) &&
                            (!filters.yearFilter.to || bookYear <= parseInt(filters.yearFilter.to));

                        const matchesPages = (!filters.pagesFilter.min || product.details.pages >= parseInt(filters.pagesFilter.min)) &&
                            (!filters.pagesFilter.max || product.details.pages <= parseInt(filters.pagesFilter.max));

                        matchesBookFilters = matchesGenre && matchesAuthor && matchesLanguage &&
                            matchesPublisher && matchesYear && matchesPages;
                    }

                    // Stationary specific filters
                    let matchesStationaryFilters = true;
                    if (isStationaryProduct(product)) {
                        const matchesBrand = filters.brandFilter === 'all' || product.details.brand === filters.brandFilter;
                        const matchesColor = filters.colorFilter === 'all' || (product.details.color && product.details.color.includes(filters.colorFilter));
                        const matchesMaterial = filters.materialFilter === 'all' || product.details.material === filters.materialFilter;
                        const matchesStType = filters.stationaryTypeFilter === 'all' || product.details.type === filters.stationaryTypeFilter;

                        matchesStationaryFilters = matchesBrand && matchesColor && matchesMaterial && matchesStType;
                    }

                    // Flower specific filters
                    let matchesFlowerFilters = true;
                    if (isFlowerProduct(product)) {
                        const matchesFlowerColor = filters.flowerColorFilter === 'all' || product.details.color === filters.flowerColorFilter;
                        const matchesSeason = filters.seasonFilter === 'all' || product.details.season === filters.seasonFilter;

                        const matchesFreshness = (!filters.freshnessFilter.min || product.details.freshness >= parseInt(filters.freshnessFilter.min)) &&
                            (!filters.freshnessFilter.max || product.details.freshness <= parseInt(filters.freshnessFilter.max));

                        const matchesLifespan = (!filters.lifespanFilter.min || product.details.lifespan >= parseInt(filters.lifespanFilter.min)) &&
                            (!filters.lifespanFilter.max || product.details.lifespan <= parseInt(filters.lifespanFilter.max));

                        matchesFlowerFilters = matchesFlowerColor && matchesSeason && matchesFreshness && matchesLifespan;
                    }

                    return matchesCategory && matchesSearch && matchesPrice &&
                        matchesRating && matchesStock && matchesDiscount && matchesBookFilters &&
                        matchesStationaryFilters && matchesFlowerFilters;
                } catch (productError) {
                    console.error('Error filtering product:', product, productError);
                    return false;
                }
            });

            // Apply sorting
            filtered = filtered.sort((a, b) => {
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
                        case 'name':
                        default:
                            return a.name.localeCompare(b.name);
                    }
                } catch (sortError) {
                    console.error('Error sorting products:', sortError);
                    return 0;
                }
            });

            set({ filteredProducts: filtered });

        } catch (error) {
            console.error('Error applying filters:', error);
            set({ filteredProducts: allProducts });
        }
    },

    getFeatured: () => {
        const { rawProducts } = get();
        if (!rawProducts.length) return [];

        try {
            const featured = getFeaturedProductsBayesian(rawProducts, 4, 0);
            return featured.map(item => convertProductEntryToProduct(item)).filter(Boolean) as Product[];
        } catch (error) {
            console.error('Error getting featured products:', error);
            return [];
        }
    },

    getBestseller: () => {
        const { rawProducts } = get();
        if (!rawProducts.length) return null;

        try {
            const bestseller = getBestseller(rawProducts);
            return bestseller ? convertProductEntryToProduct(bestseller) : null;
        } catch (error) {
            console.error('Error getting bestseller:', error);
            return null;
        }
    },

    getNewest: () => {
        const { rawProducts } = get();
        if (!rawProducts.length) return null;

        try {
            const newest = getNewestProduct(rawProducts);
            return newest ? convertProductEntryToProduct(newest) : null;
        } catch (error) {
            console.error('Error getting newest product:', error);
            return null;
        }
    },

    // Filter options getters with safe error handling
    getUniqueGenres: () => {
        try {
            const { allProducts } = get();
            const books = allProducts.filter(isBookProduct);
            return [...new Set(books.map(book => book.details.genre).filter(Boolean))];
        } catch (error) {
            console.error('Error getting unique genres:', error);
            return [];
        }
    },

    getUniqueAuthors: () => {
        try {
            const { allProducts } = get();
            const books = allProducts.filter(isBookProduct);
            return [...new Set(books.map(book => book.details.author).filter(Boolean))];
        } catch (error) {
            console.error('Error getting unique authors:', error);
            return [];
        }
    },

    getUniqueLanguages: () => {
        try {
            const { allProducts } = get();
            const books = allProducts.filter(isBookProduct);
            return [...new Set(books.map(book => book.details.language).filter(Boolean))];
        } catch (error) {
            console.error('Error getting unique languages:', error);
            return [];
        }
    },

    getUniquePublishers: () => {
        try {
            const { allProducts } = get();
            const books = allProducts.filter(isBookProduct);
            return [...new Set(books.map(book => book.details.publisher).filter(Boolean))];
        } catch (error) {
            console.error('Error getting unique publishers:', error);
            return [];
        }
    },

    getUniqueBrands: () => {
        try {
            const { allProducts } = get();
            const stationaries = allProducts.filter(isStationaryProduct);
            return [...new Set(stationaries.map(item => item.details.brand).filter(Boolean))];
        } catch (error) {
            console.error('Error getting unique brands:', error);
            return [];
        }
    },

    getUniqueColors: () => {
        try {
            const { allProducts } = get();
            const stationaries = allProducts.filter(isStationaryProduct);
            const allColors = stationaries.flatMap(item => item.details.color || []);
            return [...new Set(allColors)].filter(Boolean);
        } catch (error) {
            console.error('Error getting unique colors:', error);
            return [];
        }
    },

    getUniqueMaterials: () => {
        try {
            const { allProducts } = get();
            const stationaries = allProducts.filter(isStationaryProduct);
            return [...new Set(stationaries.map(item => item.details.material).filter(Boolean))];
        } catch (error) {
            console.error('Error getting unique materials:', error);
            return [];
        }
    },

    getUniqueStationaryTypes: () => {
        try {
            const { allProducts } = get();
            const stationaries = allProducts.filter(isStationaryProduct);
            return [...new Set(stationaries.map(item => item.details.type).filter(Boolean))];
        } catch (error) {
            console.error('Error getting unique stationary types:', error);
            return [];
        }
    },

    getUniqueFlowerColors: () => {
        try {
            const { allProducts } = get();
            const flowers = allProducts.filter(isFlowerProduct);
            return [...new Set(flowers.map(flower => flower.details.color).filter(Boolean))];
        } catch (error) {
            console.error('Error getting unique flower colors:', error);
            return [];
        }
    },

    getUniqueSeasons: () => {
        try {
            const { allProducts } = get();
            const flowers = allProducts.filter(isFlowerProduct);
            return [...new Set(flowers.map(flower => flower.details.season).filter(Boolean))];
        } catch (error) {
            console.error('Error getting unique seasons:', error);
            return [];
        }
    },

    updateProduct: async (id: string, data: Partial<ProductEntry>) => {
        try {
            const res = await fetch(`/api/product/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to update product");

            const updatedProductEntry = await res.json();
            const updatedProduct = convertProductEntryToProduct(updatedProductEntry.product);

            if (updatedProduct) {
                set(state => ({
                    rawProducts: state.rawProducts.map(p =>
                        p._id === id ? { ...p, ...updatedProductEntry.product } : p
                    ),
                    allProducts: state.allProducts.map(p =>
                        p._id === id ? updatedProduct : p
                    ),
                    products: state.products.map(p =>
                        p._id === id ? updatedProduct : p
                    )
                }));

                // Re-apply filters
                setTimeout(() => {
                    get().applyFilters();
                }, 0);
            }

            return updatedProduct;
        } catch (err: any) {
            set({ error: err.message });
            return null;
        }
    },
}));