//interfate pentru diferitele tipuri de colectii
export interface Subcategory {
    _id: string;
    name: string;
    description: string;
    image: string;
    type: string;
}

export interface Review {
    user: String,
    product: String,
    rating: Number,
    comment: String,
}
export interface ProductEntry {
    _id: string;
    name: string;
    description: string;
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
}
export interface Book {
    author: String,
    pages: Number,
    isbn: String,
    publisher: String,
    genre: String,
    language: String,
    publicationDate: Date
};

export interface Flower {
    color: String,
    freshness: Number,
    lifespan: Number,
    season: String,
    careInstructions: String,
    expiryDate: Date
};

export interface Stationary {
    brand: String,
    color: [String],
    type: String,
    price: Number,
    dimensions: {
        height: Number,
        width: Number,
        depth: Number
    },
    material: String
};

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