'use client';

import React, { useEffect, useState, Fragment } from 'react';
import { useProductStore } from '@/app/stores/ProductStore';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';

const ProductFilterBar = () => {
    const [search, setSearch] = useState('');
    const [type, setType] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');

    const { allProducts, setProducts } = useProductStore();

    const typeOptions = [
        { label: 'All types', value: '' },
        { label: 'Books', value: 'book' },
        { label: 'Stationary', value: 'stationary' },
        { label: 'Flowers', value: 'flower' },
    ];

    const sortOptions = [
        { label: 'Newest', value: 'createdAt' },
        { label: 'Price: Low to High', value: 'price' },
        { label: 'Price: High to Low', value: '-price' },
    ];

    useEffect(() => {
        let filtered = [...allProducts];

        if (search) {
            filtered = filtered.filter((p) =>
                p.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (type) {
            filtered = filtered.filter((p) => p.type === type);
        }

        if (sortBy === 'price') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === '-price') {
            filtered.sort((a, b) => b.price - a.price);
        } else {
            filtered.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            );
        }

        setProducts(filtered);
    }, [search, type, sortBy]);

    interface Option {
        label: string;
        value: string;
    }

    interface RenderListboxProps {
        options: Option[];
        selected: string;
        setSelected: (value: string) => void;
        placeholder: string;
    }

    const renderListbox = (
        options: Option[],
        selected: string,
        setSelected: (value: string) => void,
        placeholder: string
    ): React.ReactElement => (
        <Listbox value={selected} onChange={setSelected}>
            <div className="relative w-full md:w-48">
                <Listbox.Button className="border px-3 py-2 rounded text-sm w-full text-left bg-white text-[#9c6b63] shadow-sm hover:shadow-md transition">
                    {options.find((o) => o.value === selected)?.label || placeholder}
                    <ChevronUpDownIcon className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-[#9c6b63]" />
                </Listbox.Button>
                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded bg-white border border-gray-200 shadow-md text-sm z-10">
                        {options.map((option) => (
                            <Listbox.Option
                                key={option.value}
                                value={option.value}
                                className={({ active }: { active: boolean }) =>
                                    `cursor-pointer px-4 py-2 transition-colors duration-100 ${active ? 'bg-[#f5e1dd] text-[#9c6b63]' : 'text-neutral-700'
                                    }`
                                }
                            >
                                {option.label}
                            </Listbox.Option>
                        ))}
                    </Listbox.Options>
                </Transition>
            </div>
        </Listbox>
    );

    return (
        <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
            <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border px-3 py-2 rounded w-full md:w-1/3 text-sm text-[#9c6b63] transition ease-in-out duration-300 focus:outline-none focus:ring-2 focus:ring-[#9c6b63] focus:border-transparent shadow-sm hover:shadow-md"
            />
            {renderListbox(typeOptions, type, setType, 'Select type')}
            {renderListbox(sortOptions, sortBy, setSortBy, 'Sort by')}
        </div>
    );
};

export default ProductFilterBar;
