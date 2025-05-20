'use client';

import { useState } from 'react';
import { ProductEntry } from '@/app/types/index';
import ProductRow from './ProductRow';
import ProductFormModal from './ProductFormModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
    products: ProductEntry[];
}

const ProductTable = ({ products }: Props) => {
    const [selectedProduct, setSelectedProduct] = useState<ProductEntry | null>(null);
    const [deleteProduct, setDeleteProduct] = useState<ProductEntry | null>(null);
    const [sortKey, setSortKey] = useState<'name' | 'type' | 'price' | 'stock'>('name');
    const [sortAsc, setSortAsc] = useState(true);

    const sortedProducts = [...products].sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];

        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortAsc ? aValue - bValue : bValue - aValue;
        } else {
            return sortAsc
                ? String(aValue).localeCompare(String(bValue))
                : String(bValue).localeCompare(String(aValue));
        }
    });

    const toggleSort = (key: 'name' | 'type' | 'price' | 'stock') => {
        if (key === sortKey) {
            setSortAsc(!sortAsc);
        } else {
            setSortKey(key);
            setSortAsc(true);
        }
    };

    const renderHeader = (label: string, key: 'name' | 'type' | 'price' | 'stock') => (
        <th
            className={`p-3 text-left cursor-pointer select-none transition-colors duration-200 ${sortKey === key ? 'bg-[#fcefe9] text-[#9c6b63] font-semibold' : 'text-neutral-600'
                } hover:bg-[#fcefe9]`}
            onClick={() => toggleSort(key)}
        >
            <div className="flex items-center gap-1">
                {label}
                {sortKey === key ? (
                    sortAsc ? <ChevronUp className="w-4 h-4 text-[#9c6b63]" /> : <ChevronDown className="w-4 h-4 text-[#9c6b63]" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-gray-300" />
                )}
            </div>
        </th>
    );

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 bg-white shadow-md rounded-xl">
                <thead className="bg-[#fdf4f1]">
                    <tr>
                        <th className="p-3 text-left text-[#9c6b63]">Image</th>
                        {renderHeader('Name', 'name')}
                        {renderHeader('Type', 'type')}
                        {renderHeader('Price', 'price')}
                        {renderHeader('Stock', 'stock')}
                        <th className="p-3 text-left text-[#9c6b63]">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {sortedProducts.map((prod) => (
                        <ProductRow
                            key={prod._id}
                            product={prod}
                            onEdit={() => setSelectedProduct(prod)}
                            onDelete={() => setDeleteProduct(prod)}
                        />
                    ))}
                </tbody>
            </table>

            {selectedProduct && (
                <ProductFormModal
                    mode="edit"
                    initialData={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}

            {deleteProduct && (
                <DeleteConfirmModal
                    productId={deleteProduct._id}
                    type={deleteProduct.type}
                    onClose={() => setDeleteProduct(null)}
                />
            )}
        </div>
    );
};

export default ProductTable;