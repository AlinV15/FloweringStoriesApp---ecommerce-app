'use client';

import { useState, useCallback, useMemo, use, useEffect } from 'react';
import { ProductEntry } from '@/app/types/index';
import ProductRow from './ProductRow';
import ProductFormModal from './ProductFormModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { ChevronUp, ChevronDown } from 'lucide-react';
import SubcategoryFormModal from './SubcategoryFormModal';
import ManageSubcategoriesModal from './ManageSubcategoriesModal';

interface Props {
    products: ProductEntry[];
}

type SortableKey = 'name' | 'type' | 'price' | 'stock';

export const ProductTable = ({ products: initialProducts }: Props) => {
    const [selectedProduct, setSelectedProduct] = useState<ProductEntry | null>(null);
    const [deleteProduct, setDeleteProduct] = useState<ProductEntry | null>(null);
    const [sortKey, setSortKey] = useState<SortableKey>('name');
    const [sortAsc, setSortAsc] = useState(true);
    const [subcategoryProduct, setSubcategoryProduct] = useState<ProductEntry | null>(null);
    const [products, setProducts] = useState<ProductEntry[]>(initialProducts || []);


    // Memoize the sorted products to prevent unnecessary recalculations
    const sortedProducts = useMemo(() => {
        return [...products].sort((a, b) => {
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
    }, [products, sortKey, sortAsc]);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/product');
            const data = await res.json();
            //console.log('Fetched products:', data);
            setProducts(data.products);
        } catch (err) {
            console.error('Failed to fetch products:', err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }
        , []);

    //console.log('Products:', products);


    // Memoize event handlers to prevent unnecessary rerenders of child components
    const handleEdit = useCallback((product: ProductEntry) => {
        setSelectedProduct(product);
    }, []);

    const handleDelete = useCallback((product: ProductEntry) => {
        setDeleteProduct(product);
    }, []);

    const handleManageSubcategories = useCallback((product: ProductEntry) => {
        setSubcategoryProduct(product);
    }, []);

    const handleCloseEditModal = useCallback(() => {
        setSelectedProduct(null);
    }, []);

    const handleCloseDeleteModal = useCallback(() => {
        setDeleteProduct(null);
    }, []);

    const handleCloseSubcategoryModal = useCallback(() => {
        setSubcategoryProduct(null);
    }, []);

    const toggleSort = useCallback((key: SortableKey) => {
        setSortKey(prevKey => {
            if (prevKey === key) {
                setSortAsc(prev => !prev);
                return prevKey;
            } else {
                setSortAsc(true);
                return key;
            }
        });
    }, []);

    // Memoize the header renderer to improve readability
    const renderHeader = useCallback((label: string, key: SortableKey) => (
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
    ), [sortKey, sortAsc, toggleSort]);

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
                        <th className="p-3 text-left text-[#9c6b63]">Subcategories</th>
                        <th className="p-3 text-left text-[#9c6b63]">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {sortedProducts.map((product) => (
                        <ProductRow
                            key={product._id}
                            product={product}
                            onEdit={() => handleEdit(product)}
                            onDelete={() => handleDelete(product)}
                            onManageSubcategories={() => handleManageSubcategories(product)}
                        />
                    ))}
                </tbody>
            </table>

            {selectedProduct && (
                <ProductFormModal
                    mode="edit"
                    initialData={selectedProduct}
                    onClose={handleCloseEditModal}
                />
            )}

            {deleteProduct && (
                <DeleteConfirmModal
                    productId={deleteProduct._id}
                    type={deleteProduct.type}
                    onClose={handleCloseDeleteModal}
                />
            )}

            {/* You would need to implement a SubcategoryModal component */}
            {subcategoryProduct && (
                <ManageSubcategoriesModal
                    productId={subcategoryProduct._id}
                    currentType={subcategoryProduct.type}
                    currentSubcategories={subcategoryProduct.subcategories}
                    onClose={handleCloseSubcategoryModal}
                    onUpdated={async () => {
                        await fetchProducts();
                        handleCloseSubcategoryModal();
                    }}
                />
            )}
        </div>
    );
};

