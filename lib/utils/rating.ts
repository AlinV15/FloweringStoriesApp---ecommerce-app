// lib/utils/rating.ts

import { ProductEntry } from "@/app/types";


export function getFeaturedProductsBayesian(
    products: ProductEntry[],
    topN = 4,
    minReviews = 5
) {
    // 1. Media generală C
    const allRatings = products.flatMap(p => p.reviews.map(r => Number(r.rating)));
    const C = allRatings.reduce((a, b) => a + b, 0) / (allRatings.length || 1);

    // 2. Calculează scorul bayesian pentru fiecare produs
    const scoredProducts = products.map(product => {
        const v = product.reviews.length;
        const R =
            product.reviews.reduce((sum, r) => sum + Number(r.rating), 0) / (v || 1);

        const score = ((v / (v + minReviews)) * R) + ((minReviews / (v + minReviews)) * C);

        return { ...product, bayesianScore: score };
    });

    // 3. Sortează descrescător și returnează top N
    return scoredProducts
        .sort((a, b) => b.bayesianScore - a.bayesianScore)
        .slice(0, topN);
}

export function getBestseller(products: ProductEntry[]): ProductEntry {
    return products
        .filter(p => p.reviews?.length)
        .sort((a, b) => (b.reviews.length || 0) - (a.reviews.length || 0))[0] || null;
}

export function getNewestProduct(products: ProductEntry[]): ProductEntry | null {
    return products
        .filter(p => p.createdAt)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || null;
}


export function getAverageRating(product: ProductEntry): number {
    const reviews = product.reviews || [];
    if (reviews.length === 0) return 0;

    const total = reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
    return total / reviews.length;
}