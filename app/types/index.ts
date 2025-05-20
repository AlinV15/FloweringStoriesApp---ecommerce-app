//interfate pentru diferitele tipuri de colectii
export interface Subcategory {
    _id: string;
    description: string;
    image: string;
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
    type: string;
    refId: string;
    createdAt: string;
    updatedAt: string;
    subcategories: Subcategory[];
    reviews: Review[];
    discount: number;
}