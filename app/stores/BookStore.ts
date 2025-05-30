import { create } from 'zustand';

export interface BookProduct {
    _id: string;
    name: string;
    typeRef: string;
    price: number;
    image: string;
    stock: number;
    discount: number;
    Description?: string;
    details: {
        author: string;
        pages: number;
        isbn: string;
        publisher: string;
        genre: string;
        language: string;
        publicationDate: Date;
    };
    reviews?: Review[];
    averageRating?: number;
    createdAt: string;
    updatedAt: string;
}

export interface Review {
    _id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

interface FiltersState {
    search: string;
    genreFilter: string;
    authorFilter: string;
    languageFilter: string;
    publisherFilter: string;
    yearFilter: { from: string; to: string };
    pagesFilter: { min: string; max: string };
    priceRange: { min: string; max: string };
    sortBy: string;
    ratingFilter: number;
    stockFilter: string;
    discountFilter: boolean;
    currentPage: number;
    showFilters: boolean;
}

interface BooksStore extends FiltersState {
    // Books data
    books: BookProduct[];
    loading: boolean;
    error: string | null;
    itemsPerPage: number;

    // Computed values
    filteredBooks: BookProduct[];
    sortedBooks: BookProduct[];
    paginatedBooks: BookProduct[];
    totalPages: number;
    uniqueGenres: string[];
    uniqueAuthors: string[];
    uniqueLanguages: string[];
    uniquePublishers: string[];

    // Actions
    fetchBooks: () => Promise<void>;
    setSearch: (search: string) => void;
    setGenreFilter: (genre: string) => void;
    setAuthorFilter: (author: string) => void;
    setLanguageFilter: (language: string) => void;
    setPublisherFilter: (publisher: string) => void;
    setYearFilter: (yearFilter: { from: string; to: string }) => void;
    setPagesFilter: (pagesFilter: { min: string; max: string }) => void;
    setPriceRange: (priceRange: { min: string; max: string }) => void;
    setSortBy: (sortBy: string) => void;
    setRatingFilter: (rating: number) => void;
    setStockFilter: (stock: string) => void;
    setDiscountFilter: (discount: boolean) => void;
    setCurrentPage: (page: number) => void;
    setShowFilters: (show: boolean) => void;
    clearAllFilters: () => void;

    // Private methods for computing derived state
    _computeFilteredBooks: () => void;
    _computeSortedBooks: () => void;
    _computePaginatedBooks: () => void;
    _computeUniqueValues: () => void;
}

const initialFilters: FiltersState = {
    search: '',
    genreFilter: 'all',
    authorFilter: '',
    languageFilter: 'all',
    publisherFilter: 'all',
    yearFilter: { from: '', to: '' },
    pagesFilter: { min: '', max: '' },
    priceRange: { min: '', max: '' },
    sortBy: 'name',
    ratingFilter: 0,
    stockFilter: 'all',
    discountFilter: false,
    currentPage: 1,
    showFilters: false,
};

/* Removed duplicate useBooksStore definition to resolve redeclaration error. */

export interface Review {
    _id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface BookDetails {
    author: string;
    pages: number;
    isbn: string;
    publisher: string;
    genre: string;
    language: string;
    publicationDate: Date;
}

export interface BookProduct {
    _id: string;
    name: string;
    price: number;
    typeRef: string;
    image: string;
    stock: number;
    discount: number;
    Description?: string;
    details: BookDetails;
    reviews?: Review[];
    averageRating?: number;
    createdAt: string;
    updatedAt: string;
}

interface YearFilter {
    from: string;
    to: string;
}

interface PagesFilter {
    min: string;
    max: string;
}

interface PriceRange {
    min: string;
    max: string;
}

interface BooksState {
    // Data
    books: BookProduct[];
    loading: boolean;
    error: string | null;

    // Computed data
    filteredBooks: BookProduct[];
    sortedBooks: BookProduct[];
    paginatedBooks: BookProduct[];
    totalPages: number;
    uniqueGenres: string[];
    uniqueLanguages: string[];
    uniquePublishers: string[];

    // Filters
    search: string;
    genreFilter: string;
    authorFilter: string;
    languageFilter: string;
    publisherFilter: string;
    yearFilter: YearFilter;
    pagesFilter: PagesFilter;
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
    fetchBooks: () => Promise<void>;
    setSearch: (search: string) => void;
    setGenreFilter: (genre: string) => void;
    setAuthorFilter: (author: string) => void;
    setLanguageFilter: (language: string) => void;
    setPublisherFilter: (publisher: string) => void;
    setYearFilter: (yearFilter: YearFilter) => void;
    setPagesFilter: (pagesFilter: PagesFilter) => void;
    setPriceRange: (priceRange: PriceRange) => void;
    setSortBy: (sortBy: string) => void;
    setRatingFilter: (rating: number) => void;
    setStockFilter: (stock: string) => void;
    setDiscountFilter: (discount: boolean) => void;
    setCurrentPage: (page: number) => void;
    setShowFilters: (show: boolean) => void;
    clearAllFilters: () => void;

    // Filtering and sorting methods
    applyFilters: () => void;
    applySorting: () => void;
    applyPagination: () => void;
}

export const useBooksStore = create<BooksState>((set, get) => ({
    // Initial state
    books: [],
    loading: false,
    error: null,
    filteredBooks: [],
    sortedBooks: [],
    paginatedBooks: [],
    totalPages: 0,
    uniqueGenres: [],
    uniqueLanguages: [],
    uniquePublishers: [],
    search: '',
    genreFilter: 'all',
    authorFilter: '',
    languageFilter: 'all',
    publisherFilter: 'all',
    yearFilter: { from: '', to: '' },
    pagesFilter: { min: '', max: '' },
    priceRange: { min: '', max: '' },
    sortBy: 'name',
    ratingFilter: 0,
    stockFilter: 'all',
    discountFilter: false,
    currentPage: 1,
    itemsPerPage: 12,
    showFilters: false,

    // Actions
    fetchBooks: async () => {
        set({ loading: true, error: null });
        try {
            const response = await fetch('/api/product?type=book');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const bookProducts = (data.products || [])
                .filter((product: BookProduct) => product.typeRef === 'Book' && product.details)
                .map((product: BookProduct) => ({
                    ...product,
                    details: product.details,
                    averageRating: (product.reviews?.length ?? 0) > 0
                        ? product.reviews!.reduce((acc, review) => acc + review.rating, 0) / (product.reviews?.length ?? 1)
                        : 0
                }));

            // Calculate unique values
            const uniqueGenres = Array.from(new Set(bookProducts.map((book: BookProduct) => book.details.genre).filter(Boolean))) as string[];
            const uniqueLanguages = Array.from(new Set(bookProducts.map((book: BookProduct) => book.details.language).filter(Boolean))) as string[];
            const uniquePublishers = Array.from(new Set(bookProducts.map((book: BookProduct) => book.details.publisher).filter(Boolean))) as string[];

            set({
                books: bookProducts,
                uniqueGenres,
                uniqueLanguages,
                uniquePublishers,
                loading: false
            });

            // Trigger filtering and pagination
            get().applyFilters();
        } catch (err) {
            console.error('Fetch error:', err);
            set({
                error: err instanceof Error ? err.message : 'Failed to fetch books',
                loading: false
            });
        }
    },

    applyFilters: () => {
        const state = get();
        const { books, search, genreFilter, authorFilter, languageFilter, publisherFilter,
            yearFilter, pagesFilter, priceRange, ratingFilter, stockFilter, discountFilter } = state;

        const filtered = books.filter(book => {
            // Search filter
            const matchesSearch = book.name.toLowerCase().includes(search.toLowerCase()) ||
                book.details.author.toLowerCase().includes(search.toLowerCase()) ||
                book.details.genre.toLowerCase().includes(search.toLowerCase());

            // Category filters
            const matchesGenre = genreFilter === 'all' || book.details.genre === genreFilter;
            const matchesAuthor = !authorFilter || book.details.author.toLowerCase().includes(authorFilter.toLowerCase());
            const matchesLanguage = languageFilter === 'all' || book.details.language === languageFilter;
            const matchesPublisher = publisherFilter === 'all' || book.details.publisher === publisherFilter;

            // Year filter
            const bookYear = new Date(book.details.publicationDate).getFullYear();
            const matchesYear = (!yearFilter.from || bookYear >= parseInt(yearFilter.from)) &&
                (!yearFilter.to || bookYear <= parseInt(yearFilter.to));

            // Pages filter
            const matchesPages = (!pagesFilter.min || book.details.pages >= parseInt(pagesFilter.min)) &&
                (!pagesFilter.max || book.details.pages <= parseInt(pagesFilter.max));

            // Price filter
            const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
            const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
            const matchesPrice = book.price >= minPrice && book.price <= maxPrice;

            // Other filters
            const matchesRating = ratingFilter === 0 || (book.averageRating || 0) >= ratingFilter;
            const matchesStock = stockFilter === 'all' ||
                (stockFilter === 'in-stock' && book.stock > 0) ||
                (stockFilter === 'out-of-stock' && book.stock === 0);
            const matchesDiscount = !discountFilter || book.discount > 0;

            return matchesSearch && matchesGenre && matchesAuthor && matchesLanguage &&
                matchesPublisher && matchesYear && matchesPages && matchesPrice &&
                matchesRating && matchesStock && matchesDiscount;
        });

        set({ filteredBooks: filtered });
        get().applySorting();
    },

    applySorting: () => {
        const { filteredBooks, sortBy } = get();

        const sorted = [...filteredBooks].sort((a, b) => {
            switch (sortBy) {
                case 'author':
                    return a.details.author.localeCompare(b.details.author);
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'rating':
                    return (b.averageRating || 0) - (a.averageRating || 0);
                case 'publication-date':
                    return new Date(b.details.publicationDate).getTime() - new Date(a.details.publicationDate).getTime();
                case 'pages-low':
                    return a.details.pages - b.details.pages;
                case 'pages-high':
                    return b.details.pages - a.details.pages;
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'name':
                default:
                    return a.name.localeCompare(b.name);
            }
        });

        set({ sortedBooks: sorted });
        get().applyPagination();
    },

    applyPagination: () => {
        const { sortedBooks, currentPage, itemsPerPage } = get();
        const totalPages = Math.ceil(sortedBooks.length / itemsPerPage);
        const paginatedBooks = sortedBooks.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );

        set({ paginatedBooks, totalPages });
    },

    setSearch: (search: string) => {
        set({ search, currentPage: 1 });
        get().applyFilters();
    },

    setGenreFilter: (genre: string) => {
        set({ genreFilter: genre, currentPage: 1 });
        get().applyFilters();
    },

    setAuthorFilter: (author: string) => {
        set({ authorFilter: author, currentPage: 1 });
        get().applyFilters();
    },

    setLanguageFilter: (language: string) => {
        set({ languageFilter: language, currentPage: 1 });
        get().applyFilters();
    },

    setPublisherFilter: (publisher: string) => {
        set({ publisherFilter: publisher, currentPage: 1 });
        get().applyFilters();
    },

    setYearFilter: (yearFilter: YearFilter) => {
        set({ yearFilter, currentPage: 1 });
        get().applyFilters();
    },

    setPagesFilter: (pagesFilter: PagesFilter) => {
        set({ pagesFilter, currentPage: 1 });
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
            genreFilter: 'all',
            authorFilter: '',
            languageFilter: 'all',
            publisherFilter: 'all',
            yearFilter: { from: '', to: '' },
            pagesFilter: { min: '', max: '' },
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
