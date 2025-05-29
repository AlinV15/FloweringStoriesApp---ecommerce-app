// types/index.ts

// Interfaces for different collection types
export interface Subcategory {
    _id: string;
    name: string;
    description: string;
    image: string;
    type: string;
}

export interface Review {
    user: string;
    product: string;
    rating: number;
    comment: string;
}

export interface ProductEntry {
    _id: string;
    name: string;
    Description?: string; // Note: matches your schema with capital D
    price: number;
    image: string;
    stock: number;
    type: "book" | "stationary" | "flower";
    typeObject?: Book | Stationary | Flower;
    typeRef: "Book" | "Stationary" | "Flower";
    refId: string;
    createdAt: string;
    updatedAt: string;
    subcategories: Subcategory[];
    reviews: Review[];
    discount: number;
    details?: Book | Stationary | Flower; // Added for API response
}

export interface Book {
    _id?: string;
    author: string;
    pages: number;
    isbn: string;
    publisher: string;
    genre: string;
    language: string;
    publicationDate: Date;
}

export interface Flower {
    _id?: string;
    color: string;
    freshness: number;
    lifespan: number;
    season: string;
    careInstructions: string;
    expiryDate: Date;
}

export interface Stationary {
    _id?: string;
    brand: string;
    color: string[];
    type: string;
    price?: number; // Optional since main price is in ProductEntry
    dimensions: {
        height: number;
        width: number;
        depth: number;
    };
    material: string;
}

export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    product: ProductEntry;
    quantity: number;
}

export interface Address {
    _id: string;
    user: string;
    name: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
}

export interface Order {
    _id: string;
    user: User;
    items: OrderItem[];
    address: Address;
    totalAmount: number;
    guestEmail?: string;
    guestName?: string;
    paymentMethod: string;
    payment: {
        stripePaymentIntentId: string;
        amount: number;
        currency: string;
        status: string;
        method: string;
    };
    status: string;
    deliveryMethod: string;
    note?: string;
}
export interface ShopSettings {
    _id?: string;
    shopName: string;
    description: string;
    tagline?: string;
    logo: {
        favicon?: string;
        headerLogo?: string;
        footerLogo?: string;
    };
    colors: {
        primary: string;
        secondary: string;
        accent: string;
    };
    currency: 'RON' | 'USD' | 'EUR' | 'GBP';
    timezone: string;
    paymentMethods: ('stripe' | 'paypal' | 'bank' | 'cod')[];
    shippingSettings: {
        freeShippingThreshold: number;
        defaultShippingCost: number;
        enableLocalPickup: boolean;
    };
    contact?: {
        email?: string;
        phone?: string;
        address?: {
            street?: string;
            city?: string;
            state?: string;
            postalCode?: string;
            country: string;
        };
    };
    socialMedia?: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
        tiktok?: string;
    };
    businessHours: {
        day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
        isOpen: boolean;
        openTime: string;
        closeTime: string;
    }[];
    features: {
        enableReviews: boolean;
        enableWishlist: boolean;
        enableNewsletter: boolean;
        enableNotifications: boolean;
        maintenanceMode: boolean;
    };
    seo?: {
        metaTitle?: string;
        metaDescription?: string;
        keywords?: string[];
        googleAnalytics?: string;
        facebookPixel?: string;
    };
    createdAt: string;
    updatedAt: string;
    updatedBy?: string;
}