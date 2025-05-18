'use client';

import { useState } from 'react';
import Image from 'next/image';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Link from 'next/link';

const mockFlowers = [
    { id: 'flower1', title: 'Lavender Grace', subcategory: 'lavender', price: 30.0, type: 'dried', image: '/product-floral1.jpg' },
    { id: 'flower2', title: 'Romantic Roses', subcategory: 'roses', price: 32.0, type: 'fresh', image: '/product-floral2.jpg' },
    { id: 'flower3', title: 'Wildflower Basket', subcategory: 'wildflowers', price: 28.0, type: 'dried', image: '/product-floral3.jpg' },
];

const subcategories = ['lavender', 'roses', 'wildflowers'];

export default function FlowersPage() {
    const [search, setSearch] = useState('');
    const [subFilters, setSubFilters] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const toggleSubFilter = (sub: string) => {
        setSubFilters((prev) =>
            prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
        );
    };

    const filteredFlowers = mockFlowers.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
        const matchesSub = subFilters.length === 0 || subFilters.includes(item.subcategory);
        return matchesSearch && matchesSub;
    });

    const paginatedItems = filteredFlowers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredFlowers.length / itemsPerPage);

    return (
        <div className="min-h-screen bg-[#fdf8f6]">
            <Header />

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-32">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filter */}
                    <aside className="w-full lg:w-1/4 bg-white p-6 rounded-lg border border-[#e5d4ce] shadow-sm h-fit">
                        <h2 className="text-lg font-semibold text-[#9c6b63] mb-4">Filter by Type</h2>
                        <div className="flex flex-col gap-2">
                            {subcategories.map((sub) => (
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

                        <div className="mt-6">
                            <h2 className="text-lg font-semibold text-[#9c6b63] mb-2">Form</h2>
                            {[...new Set(mockFlowers.map(item => item.type))].map(type => (
                                <p key={type} className="text-sm text-[#9c6b63] ml-1">- {type}</p>
                            ))}
                        </div>
                    </aside>

                    {/* Products + Search */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
                            <h1 className="text-2xl font-medium text-[#9c6b63]">Flowers</h1>
                            <input
                                type="text"
                                placeholder="Search flowers..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full sm:w-64 px-4 py-2 rounded border border-[#e5d4ce] focus:outline-none focus:ring-2 focus:ring-[#9c6b63]"
                            />
                        </div>

                        {paginatedItems.length === 0 ? (
                            <p className="text-center text-neutral-500">No flowers found.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {paginatedItems.map(item => (
                                    <Link
                                        key={item.id}
                                        href={`/products/${item.id}`}
                                        className="group rounded-lg overflow-hidden bg-white shadow hover:shadow-md transition block"
                                    >
                                        <div className="relative aspect-square">
                                            <Image src={item.image} alt={item.title} fill className="object-cover group-hover:scale-105 transition" />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-neutral-800 font-medium mb-1">{item.title}</h3>
                                            <p className="text-[#9c6b63] font-semibold">{item.price.toFixed(2)} RON</p>
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
