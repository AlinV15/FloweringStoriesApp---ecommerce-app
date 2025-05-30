// types/product.ts - Unified product types

// Import existing types from main types file to avoid conflicts
import { ProductEntry as APIProductEntry, Review as APIReview, Book, Stationary, Flower } from '@/app/types';

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

export interface FlowerDetails {
    color: string;
    freshness: number;
    lifespan: number;
    season: string;
    careInstructions: string;
    expiryDate: Date;
}

// Base product interface
export interface BaseProduct {
    _id: string;
    name: string;
    price: number;
    image: string;
    stock: number;
    discount: number;
    Description?: string;
    reviews?: Review[];
    averageRating?: number;
    createdAt: string;
    updatedAt: string;
}

// Specific product types
export interface BookProduct extends BaseProduct {
    typeRef: 'Book';
    type: 'book';
    details: BookDetails;
}

export interface StationaryProduct extends BaseProduct {
    typeRef: 'Stationary';
    type: 'stationary';
    details: StationaryDetails;
}

export interface FlowerProduct extends BaseProduct {
    typeRef: 'Flower';
    type: 'flower';
    details: FlowerDetails;
}

// Union type for all products
export type Product = BookProduct | StationaryProduct | FlowerProduct;

// Type guards for better type safety
export function isBookProduct(product: Product | APIProductEntry): product is BookProduct {
    return product.typeRef === 'Book';
}

export function isStationaryProduct(product: Product | APIProductEntry): product is StationaryProduct {
    return product.typeRef === 'Stationary';
}

export function isFlowerProduct(product: Product | APIProductEntry): product is FlowerProduct {
    return product.typeRef === 'Flower';
}

// Converter function from API ProductEntry to Product
export function convertProductEntryToProduct(entry: APIProductEntry): Product | null {
    if (!entry.details) return null;

    // Convert API Review to our Review format
    const convertedReviews: Review[] = entry.reviews?.map(apiReview => ({
        _id: apiReview.user || '', // Map user to _id if needed
        userId: apiReview.user || '',
        userName: apiReview.user || 'Anonymous',
        rating: apiReview.rating,
        comment: apiReview.comment,
        createdAt: new Date().toISOString() // Add missing createdAt
    })) || [];

    const baseProduct = {
        _id: entry._id,
        name: entry.name,
        price: entry.price,
        image: entry.image,
        stock: entry.stock,
        discount: entry.discount,
        Description: entry.Description,
        reviews: convertedReviews,
        averageRating: entry.reviews?.length ?
            entry.reviews.reduce((acc, review) => acc + review.rating, 0) / entry.reviews.length : 0,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
    };

    switch (entry.typeRef) {
        case 'Book':
            const bookDetails = entry.details as Book;
            return {
                ...baseProduct,
                typeRef: 'Book',
                type: 'book',
                details: {
                    author: bookDetails.author,
                    pages: bookDetails.pages,
                    isbn: bookDetails.isbn,
                    publisher: bookDetails.publisher,
                    genre: bookDetails.genre,
                    language: bookDetails.language,
                    publicationDate: bookDetails.publicationDate
                } as BookDetails
            } as BookProduct;

        case 'Stationary':
            const stationaryDetails = entry.details as Stationary;
            return {
                ...baseProduct,
                typeRef: 'Stationary',
                type: 'stationary',
                details: {
                    brand: stationaryDetails.brand,
                    color: stationaryDetails.color,
                    type: stationaryDetails.type,
                    dimensions: stationaryDetails.dimensions,
                    material: stationaryDetails.material
                } as StationaryDetails
            } as StationaryProduct;

        case 'Flower':
            const flowerDetails = entry.details as Flower;
            return {
                ...baseProduct,
                typeRef: 'Flower',
                type: 'flower',
                details: {
                    color: flowerDetails.color,
                    freshness: flowerDetails.freshness,
                    lifespan: flowerDetails.lifespan,
                    season: flowerDetails.season,
                    careInstructions: flowerDetails.careInstructions,
                    expiryDate: flowerDetails.expiryDate
                } as FlowerDetails
            } as FlowerProduct;

        default:
            return null;
    }
}