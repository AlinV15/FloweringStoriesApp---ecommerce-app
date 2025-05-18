'use client';

import Image from 'next/image';
import Link from 'next/link';

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
    const product = await getProductBySlug(params.slug);

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                Product not found.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fdf8f6] py-24 px-4 md:px-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-12">
                <div className="flex-1">
                    <div className="relative aspect-square rounded-lg overflow-hidden shadow-md">
                        <Image src={product.image} alt={product.title} fill className="object-cover" />
                    </div>
                </div>

                <div className="flex-1 space-y-6">
                    <h1 className="text-3xl font-semibold text-[#9c6b63]">{product.title}</h1>
                    <p className="text-[#9c6b63] text-lg font-medium">{product.price.toFixed(2)} RON</p>

                    <div className="text-neutral-700 leading-relaxed space-y-4">
                        <p>{product.description}</p>

                        <ul className="list-disc list-inside text-sm text-neutral-600">
                            <li><strong>Category:</strong> {product.category}</li>
                            {product.subcategory && <li><strong>Subcategory:</strong> {product.subcategory}</li>}
                            {product.author && <li><strong>Author:</strong> {product.author}</li>}
                            {product.brand && <li><strong>Brand:</strong> {product.brand}</li>}
                            {product.type && <li><strong>Type:</strong> {product.type}</li>}
                            <li><strong>Availability:</strong> In stock</li>
                            <li><strong>Shipping:</strong> 2-5 business days</li>
                        </ul>
                    </div>

                    <button className="mt-4 px-6 py-3 bg-[#9c6b63] hover:bg-[#875a53] text-white rounded-lg transition">
                        Add to Cart
                    </button>

                    <Link href="/products" className="inline-block mt-4 text-sm text-[#9c6b63] underline">
                        ← Back to products
                    </Link>
                </div>
            </div>
        </div>
    );
}

async function getProductBySlug(slug: string) {
    const products = [
        {
            id: 'book1',
            slug: 'book1',
            title: 'The Blooming Mind',
            price: 25.99,
            image: '/product-book1.jpg',
            description: 'A romantic journey through pages of blooming ideas.',
            category: 'Books',
            subcategory: 'Romance',
            author: 'Jane Doe'
        },
        {
            id: 'flower2',
            slug: 'flower2',
            title: 'Romantic Roses',
            price: 32.0,
            image: '/product-floral2.jpg',
            description: 'Fresh roses infused with poetic grace.',
            category: 'Flowers',
            subcategory: 'Roses',
            type: 'Fresh'
        },
        {
            id: 'stationery1',
            slug: 'stationery1',
            title: 'Botanical Notebook',
            price: 12.5,
            image: '/product-stationery1.jpg',
            description: 'Elegant pages for blooming thoughts.',
            category: 'Stationery',
            subcategory: 'Notebooks',
            brand: 'PaperBloom'
        }
    ];

    return products.find(p => p.slug === slug);
}
