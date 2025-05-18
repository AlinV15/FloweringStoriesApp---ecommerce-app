'use client';

import { useState } from 'react';
import Image from 'next/image';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Link from 'next/link';

const mockProducts = [
    { id: 'book1', title: 'The Blooming Mind', category: 'books', subcategory: 'romance', price: 25.99, author: 'Jane Doe', image: '/product-book1.jpg' },
    { id: 'flower1', title: 'Lavender Grace', category: 'flowers', subcategory: 'lavender', price: 30.0, image: '/product-floral1.jpg' },
    { id: 'stationery1', title: 'Botanical Notebook', category: 'stationaries', subcategory: 'notebooks', price: 12.5, image: '/product-stationery1.jpg' },
    { id: 'book2', title: 'Poetry of Petals', category: 'books', subcategory: 'romance', price: 19.99, author: 'Lily Rose', image: '/product-book2.jpg' },
    { id: 'flower2', title: 'Romantic Roses', category: 'flowers', subcategory: 'roses', price: 32.0, image: '/product-floral2.jpg' },
    { id: 'book3', title: 'Dark Forest Tales', category: 'books', subcategory: 'thriller', price: 22.0, author: 'John Pine', image: '/product-book3.jpg' },
];

const categoryMap: { [key: string]: string[] } = {
    books: ['romance', 'thriller'],
    stationaries: ['notebooks'],
    flowers: ['lavender', 'roses']
};

export default function ProductsPage() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [subFilters, setSubFilters] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const toggleSubFilter = (sub: string) => {
        setSubFilters((prev) =>
            prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
        );
    };

    const filteredProducts = mockProducts.filter(product => {
        const matchesCategory = filter === 'all' || product.category === filter;
        const matchesSearch = product.title.toLowerCase().includes(search.toLowerCase());
        const matchesSub = subFilters.length === 0 || subFilters.includes(product.subcategory);
        return matchesCategory && matchesSearch && matchesSub;
    });

    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    return (
        <div className="min-h-screen bg-[#fdf8f6]">
            <Header />

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-32">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filter */}
                    <aside className="w-full lg:w-1/4 bg-white p-6 rounded-lg border border-[#e5d4ce] shadow-sm h-fit">
                        <h2 className="text-lg font-semibold text-[#9c6b63] mb-4">Filter by Category</h2>
                        <div className="flex flex-col gap-3 mb-6">
                            {['all', ...Object.keys(categoryMap)].map(cat => (
                                <details key={cat} open={filter === cat || cat === 'all'}>
                                    <summary
                                        onClick={() => setFilter(cat)}
                                        className={`cursor-pointer px-4 py-2 rounded-lg border text-sm mb-1 transition ${filter === cat
                                            ? 'bg-[#9c6b63] text-white border-[#9c6b63]'
                                            : 'bg-white text-[#9c6b63] border-[#e5d4ce] hover:bg-[#f5e1dd]'
                                            }`}
                                    >
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </summary>
                                    {cat !== 'all' && (
                                        <div className="ml-4 mt-2 flex flex-col gap-2">
                                            {categoryMap[cat].map((sub: string) => (
                                                <label key={sub} className="flex items-center gap-2 text-sm text-[#9c6b63]">
                                                    <input
                                                        type="checkbox"
                                                        checked={subFilters.includes(sub)}
                                                        onChange={() => toggleSubFilter(sub)}
                                                        className="accent-[#9c6b63]"
                                                    />
                                                    {sub.charAt(0).toUpperCase() + sub.slice(1)}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </details>
                            ))}
                        </div>

                        <div className="mt-6">
                            <h2 className="text-lg font-semibold text-[#9c6b63] mb-2">Price Filter</h2>
                            <p className="text-sm text-[#9c6b63] italic">(placeholder for min/max price)</p>
                        </div>

                        {filter === 'books' && (
                            <div className="mt-6">
                                <h2 className="text-lg font-semibold text-[#9c6b63] mb-2">Authors</h2>
                                {[...new Set(mockProducts.filter(p => p.category === 'books').map(p => p.author))].map(author => (
                                    <p key={author} className="text-sm text-[#9c6b63] ml-1">- {author}</p>
                                ))}
                            </div>
                        )}
                    </aside>

                    {/* Products + Search */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
                            <h1 className="text-2xl font-medium text-[#9c6b63]">All Products</h1>
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full sm:w-64 px-4 py-2 rounded border border-[#e5d4ce] focus:outline-none focus:ring-2 focus:ring-[#9c6b63]"
                            />
                        </div>

                        {paginatedProducts.length === 0 ? (
                            <p className="text-center text-neutral-500">No products found.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {paginatedProducts.map(product => (
                                    <Link
                                        key={product.id}
                                        href={`/products/${product.id}`}
                                        className="group rounded-lg overflow-hidden bg-white shadow hover:shadow-md transition block"
                                    >
                                        <div className="relative aspect-square">
                                            <Image src={product.image} alt={product.title} fill className="object-cover group-hover:scale-105 transition" />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-neutral-800 font-medium mb-1">{product.title}</h3>
                                            <p className="text-[#9c6b63] font-semibold">{product.price.toFixed(2)} RON</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-10 space-x-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-4 py-2 text-sm rounded border transition font-medium ${page === currentPage
                                            ? 'bg-[#9c6b63] text-white border-[#9c6b63]'
                                            : 'border-[#e5d4ce] text-[#9c6b63] hover:bg-[#f5e1dd]'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
