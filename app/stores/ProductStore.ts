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

// Îmbunătățit: adăugat discountRange
export interface DiscountRange {
    min: number;
    max: number;
}

export interface ProductFilters {
    search: string;
    categoryFilter: string;
    priceRange: PriceRange;
    sortBy: string;
    ratingFilter: number;
    stockFilter: string;
    discountFilter: boolean;
    discountRange?: DiscountRange;
    createdDateRange?: string; // ADĂUGAT: support pentru date range

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
    createdDateRange: '', // ADĂUGAT

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
    initialized: boolean;

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
    setProducts: (product: Product[]) => void;

    // Id
    getProductById: (id: string) => Product | null;
    getProductByIdWithRefresh: (id: string) => Promise<Product | null>;
    forceRefresh: () => void;
}

// HELPER: Calculate date range pentru filtering
const getDateThreshold = (range: string): Date | null => {
    const now = new Date();
    switch (range) {
        case '7d':
            return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case '30d':
            return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case '3m':
            return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        case '6m':
            return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        case '1y':
            return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        default:
            return null;
    }
};

export const useProductStore = create<ProductStore>((set, get) => ({
    rawProducts: [],
    products: [],
    allProducts: [],
    filteredProducts: [],
    filters: defaultFilters,
    loading: false,
    error: null,
    initialized: false,

    setProducts: (newProducts: Product[]) => {
        set(state => ({
            products: newProducts,
            allProducts: newProducts,
            filteredProducts: newProducts
        }));

        // Reapply filters
        setTimeout(() => {
            get().applyFilters();
        }, 0);
    },

    fetchProducts: async (forceRefresh = false) => {
        const { loading, initialized } = get();

        // If force refresh, ignore initialized state
        if (!forceRefresh && (loading || initialized)) return;

        set({ loading: true, error: null });

        try {
            console.log('🔄 Fetching products from API...');

            const res = await fetch('/api/product', {
                // Add cache busting to ensure fresh data
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                }
            });

            if (!res.ok) throw new Error("Failed to fetch products");
            const data = await res.json();

            console.log("✅ Fetched raw products:", data.products?.length || 0);

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

            console.log("✅ Converted products:", convertedProducts.length);

            set({
                rawProducts: data.products,
                allProducts: convertedProducts,
                products: convertedProducts,
                filteredProducts: convertedProducts,
                loading: false,
                initialized: true
            });

            // Apply filters after a short delay to ensure state is updated
            setTimeout(() => {
                get().applyFilters();
            }, 50);

        } catch (err: any) {
            console.error('❌ Error fetching products:', err);
            set({ error: err.message, loading: false });
        }
    },

    forceRefresh: async () => {
        console.log('🔄 FORCE REFRESH initiated...');

        // Reset state
        set({
            rawProducts: [],
            allProducts: [],
            products: [],
            filteredProducts: [],
            initialized: false,
            loading: false,
            error: null
        });

        // Wait a moment for state to clear
        await new Promise(resolve => setTimeout(resolve, 100));

        // Fetch fresh data
        await get().fetchProducts();

        console.log('✅ FORCE REFRESH completed');
    },

    setFilters: (newFilters: Partial<ProductFilters>) => {
        console.log('🔧 Setting filters:', newFilters);
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

        console.log('🔍 Applying filters:', filters);
        console.log('📦 Total products:', allProducts.length);

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

                    // ÎMBUNĂTĂȚIT: Stock filter cu opțiuni noi
                    const matchesStock = filters.stockFilter === 'all' ||
                        (filters.stockFilter === 'in-stock' && product.stock > 0) ||
                        (filters.stockFilter === 'out-of-stock' && product.stock === 0) ||
                        (filters.stockFilter === 'low-stock' && product.stock > 0 && product.stock <= 5);

                    // ÎMBUNĂTĂȚIT: Discount filter cu logica simplificată
                    const matchesDiscount = !filters.discountFilter || (product.discount > 0);

                    // ÎMBUNĂTĂȚIT: Discount range filter
                    const matchesDiscountRange = !filters.discountRange ||
                        (product.discount >= (filters.discountRange.min || 0) &&
                            product.discount <= (filters.discountRange.max || 100));

                    // ADĂUGAT: Date range filter
                    let matchesDateRange = true;
                    if (filters.createdDateRange && filters.createdDateRange !== '') {
                        const threshold = getDateThreshold(filters.createdDateRange);
                        if (threshold) {
                            const productDate = new Date(product.createdAt);
                            matchesDateRange = productDate >= threshold;
                        }
                    }

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
                        matchesRating && matchesStock && matchesDiscount && matchesDiscountRange &&
                        matchesDateRange && // ADĂUGAT
                        matchesBookFilters && matchesStationaryFilters && matchesFlowerFilters;
                } catch (productError) {
                    console.error('Error filtering product:', product, productError);
                    return false;
                }
            });

            console.log('🔍 Filtered products count:', filtered.length);

            // ÎMBUNĂTĂȚIT: Apply sorting cu toate opțiunile noi
            filtered = filtered.sort((a, b) => {
                try {
                    switch (filters.sortBy) {
                        case 'price-low':
                            return a.price - b.price;
                        case 'price-high':
                            return b.price - a.price;
                        case 'rating':
                            return (b.averageRating || 0) - (a.averageRating || 0);
                        case 'rating-desc':
                            return (a.averageRating || 0) - (b.averageRating || 0);
                        case 'newest':
                            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                        case 'oldest':
                            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                        case 'discount-desc':
                            return (b.discount || 0) - (a.discount || 0);
                        case 'discount-asc':
                            return (a.discount || 0) - (b.discount || 0);
                        case 'stock-desc':
                            return b.stock - a.stock;
                        case 'stock-asc':
                            return a.stock - b.stock;
                        case 'name-desc':
                            return b.name.localeCompare(a.name);
                        case 'name':
                        default:
                            return a.name.localeCompare(b.name);
                    }
                } catch (sortError) {
                    console.error('Error sorting products:', sortError);
                    return 0;
                }
            });

            console.log('✅ Final filtered and sorted products:', filtered.length);
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

    getProductById: (id: string) => {
        const { allProducts } = get();

        console.log('=== SEARCH PRODUCT BY ID IN STORE ===');
        console.log('Looking for product with ID:', id);
        console.log('Available products in store:', allProducts.length);

        const foundProduct = allProducts.find(product => product._id === id);

        if (foundProduct) {
            console.log('✅ Found product in store:', {
                _id: foundProduct._id,
                name: foundProduct.name,
                type: foundProduct.type,
                typeRef: foundProduct.typeRef
            });
        } else {
            console.log('❌ Product not found in store');
            console.log('Available product IDs:', allProducts.map(p => p._id));
        }

        console.log('=== END SEARCH PRODUCT BY ID ===');

        return foundProduct || null;
    },

    getProductByIdWithRefresh: async (id: string) => {
        const { initialized, loading, fetchProducts, getProductById } = get();

        console.log('=== GET PRODUCT BY ID WITH REFRESH ===');
        console.log('Product ID:', id);
        console.log('Store initialized:', initialized);
        console.log('Store loading:', loading);

        // Dacă store-ul nu e încărcat, îl încărcăm
        if (!initialized && !loading) {
            console.log('Store not initialized, fetching products...');
            await fetchProducts();
        }

        // Așteaptă să se termine încărcarea dacă e în progres
        if (loading) {
            console.log('Store is loading, waiting...');
            return new Promise((resolve) => {
                const checkLoading = () => {
                    const { loading: currentLoading } = get();
                    if (!currentLoading) {
                        const product = getProductById(id);
                        resolve(product);
                    } else {
                        setTimeout(checkLoading, 100);
                    }
                };
                checkLoading();
            });
        }

        // Încearcă să găsești produsul în store
        const product = getProductById(id);

        console.log('=== END GET PRODUCT BY ID WITH REFRESH ===');

        return product;
    },
}));