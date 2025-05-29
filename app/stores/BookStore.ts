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

export const useBooksStore = create<BooksStore>((set, get) => ({
    // Initial state
    books: [],
    loading: false,
    error: null,
    itemsPerPage: 12,
    filteredBooks: [],
    sortedBooks: [],
    paginatedBooks: [],
    totalPages: 0,
    uniqueGenres: [],
    uniqueAuthors: [],
    uniqueLanguages: [],
    uniquePublishers: [],
    ...initialFilters,

    // Fetch books from API
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

            set({ books: bookProducts, loading: false });

            // Compute derived state
            get()._computeUniqueValues();
            get()._computeFilteredBooks();
            get()._computeSortedBooks();
            get()._computePaginatedBooks();
        } catch (err) {
            console.error('Fetch error:', err);
            set({
                error: err instanceof Error ? err.message : 'Failed to fetch books',
                loading: false
            });
        }
    },

    // Filter actions
    setSearch: (search) => {
        set({ search, currentPage: 1 });
        get()._computeFilteredBooks();
        get()._computeSortedBooks();
        get()._computePaginatedBooks();
    },

    setGenreFilter: (genreFilter) => {
        set({ genreFilter, currentPage: 1 });
        get()._computeFilteredBooks();
        get()._computeSortedBooks();
        get()._computePaginatedBooks();
    },

    setAuthorFilter: (authorFilter) => {
        set({ authorFilter, currentPage: 1 });
        get()._computeFilteredBooks();
        get()._computeSortedBooks();
        get()._computePaginatedBooks();
    },

    setLanguageFilter: (languageFilter) => {
        set({ languageFilter, currentPage: 1 });
        get()._computeFilteredBooks();
        get()._computeSortedBooks();
        get()._computePaginatedBooks();
    },

    setPublisherFilter: (publisherFilter) => {
        set({ publisherFilter, currentPage: 1 });
        get()._computeFilteredBooks();
        get()._computeSortedBooks();
        get()._computePaginatedBooks();
    },

    setYearFilter: (yearFilter) => {
        set({ yearFilter, currentPage: 1 });
        get()._computeFilteredBooks();
        get()._computeSortedBooks();
        get()._computePaginatedBooks();
    },

    setPagesFilter: (pagesFilter) => {
        set({ pagesFilter, currentPage: 1 });
        get()._computeFilteredBooks();
        get()._computeSortedBooks();
        get()._computePaginatedBooks();
    },

    setPriceRange: (priceRange) => {
        set({ priceRange, currentPage: 1 });
        get()._computeFilteredBooks();
        get()._computeSortedBooks();
        get()._computePaginatedBooks();
    },

    setSortBy: (sortBy) => {
        set({ sortBy, currentPage: 1 });
        get()._computeSortedBooks();
        get()._computePaginatedBooks();
    },

    setRatingFilter: (ratingFilter) => {
        set({ ratingFilter, currentPage: 1 });
        get()._computeFilteredBooks();
        get()._computeSortedBooks();
        get()._computePaginatedBooks();
    },

    setStockFilter: (stockFilter) => {
        set({ stockFilter, currentPage: 1 });
        get()._computeFilteredBooks();
        get()._computeSortedBooks();
        get()._computePaginatedBooks();
    },

    setDiscountFilter: (discountFilter) => {
        set({ discountFilter, currentPage: 1 });
        get()._computeFilteredBooks();
        get()._computeSortedBooks();
        get()._computePaginatedBooks();
    },

    setCurrentPage: (currentPage) => {
        set({ currentPage });
        get()._computePaginatedBooks();
    },

    setShowFilters: (showFilters) => {
        set({ showFilters });
    },

    clearAllFilters: () => {
        set({ ...initialFilters });
        get()._computeFilteredBooks();
        get()._computeSortedBooks();
        get()._computePaginatedBooks();
    },

    // Private computation methods
    _computeUniqueValues: () => {
        const { books } = get();
        set({
            uniqueGenres: [...new Set(books.map(book => book.details.genre).filter(Boolean))],
            uniqueAuthors: [...new Set(books.map(book => book.details.author).filter(Boolean))],
            uniqueLanguages: [...new Set(books.map(book => book.details.language).filter(Boolean))],
            uniquePublishers: [...new Set(books.map(book => book.details.publisher).filter(Boolean))],
        });
    },

    _computeFilteredBooks: () => {
        const {
            books, search, genreFilter, authorFilter, languageFilter, publisherFilter,
            yearFilter, pagesFilter, priceRange, ratingFilter, stockFilter, discountFilter
        } = get();

        const filtered = books.filter(book => {
            const matchesSearch = book.name.toLowerCase().includes(search.toLowerCase()) ||
                book.details.author.toLowerCase().includes(search.toLowerCase()) ||
                book.details.genre.toLowerCase().includes(search.toLowerCase());

            const matchesGenre = genreFilter === 'all' || book.details.genre === genreFilter;
            const matchesAuthor = !authorFilter || book.details.author.toLowerCase().includes(authorFilter.toLowerCase());
            const matchesLanguage = languageFilter === 'all' || book.details.language === languageFilter;
            const matchesPublisher = publisherFilter === 'all' || book.details.publisher === publisherFilter;

            const bookYear = new Date(book.details.publicationDate).getFullYear();
            const matchesYear = (!yearFilter.from || bookYear >= parseInt(yearFilter.from)) &&
                (!yearFilter.to || bookYear <= parseInt(yearFilter.to));

            const matchesPages = (!pagesFilter.min || book.details.pages >= parseInt(pagesFilter.min)) &&
                (!pagesFilter.max || book.details.pages <= parseInt(pagesFilter.max));

            const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
            const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
            const matchesPrice = book.price >= minPrice && book.price <= maxPrice;

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
    },

    _computeSortedBooks: () => {
        const { filteredBooks, sortBy } = get();

        const sorted = [...filteredBooks].sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'rating':
                    return (b.averageRating || 0) - (a.averageRating || 0);
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'pages-low':
                    return a.details.pages - b.details.pages;
                case 'pages-high':
                    return b.details.pages - a.details.pages;
                case 'publication-date':
                    return new Date(b.details.publicationDate).getTime() - new Date(a.details.publicationDate).getTime();
                case 'author':
                    return a.details.author.localeCompare(b.details.author);
                case 'name':
                default:
                    return a.name.localeCompare(b.name);
            }
        });

        set({ sortedBooks: sorted });
    },

    _computePaginatedBooks: () => {
        const { sortedBooks, currentPage, itemsPerPage } = get();

        const paginated = sortedBooks.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );

        const totalPages = Math.ceil(sortedBooks.length / itemsPerPage);

        set({
            paginatedBooks: paginated,
            totalPages
        });
    },
}));