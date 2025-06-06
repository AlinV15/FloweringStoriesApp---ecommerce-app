'use client';

import { useState, useCallback, useEffect } from 'react';
import { ProductEntry, Review } from '@/app/types/index';
import ProductRow from './ProductRow';
import ProductFormModal from './ProductFormModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import ManageSubcategoriesModal from './ManageSubcategoriesModal';
import { Plus, RefreshCw } from 'lucide-react';
import { useProductStore } from '@/app/stores/ProductStore';

interface Props {
    onAddProduct?: () => void;
    className?: string;
    showAddButton?: boolean;
    showRefreshButton?: boolean;
}

export const ProductTable = ({
    onAddProduct,
    className = '',
    showAddButton = true,
    showRefreshButton = true
}: Props) => {
    // Modal states
    const [selectedProduct, setSelectedProduct] = useState<ProductEntry | null>(null);
    const [deleteProduct, setDeleteProduct] = useState<ProductEntry | null>(null);
    const [subcategoryProduct, setSubcategoryProduct] = useState<ProductEntry | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Get filtered products from store
    const { filteredProducts, allProducts, fetchProducts } = useProductStore();

    useEffect(() => {
        if (!allProducts.length) {
            fetchProducts();
        }
    }, [fetchProducts, allProducts.length]);

    // Event handlers
    const handleEdit = useCallback((product: ProductEntry) => {
        setSelectedProduct(product);
    }, []);

    const handleDelete = useCallback((product: ProductEntry) => {
        setDeleteProduct(product);
    }, []);

    const handleManageSubcategories = useCallback((product: ProductEntry) => {
        setSubcategoryProduct(product);
    }, []);

    // SIMPLIFIED: Remove auto-refresh on modal close since handleSubmit handles it
    const handleCloseEditModal = useCallback(() => {
        setSelectedProduct(null);
    }, []);

    const handleCloseDeleteModal = useCallback(() => {
        setDeleteProduct(null);
        // Refresh after delete
        setTimeout(() => {
            handleRefresh();
        }, 100);
    }, []);

    const handleCloseSubcategoryModal = useCallback(() => {
        setSubcategoryProduct(null);
    }, []);

    // SIMPLIFIED: Basic refresh function
    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            // Reset store and force fresh fetch
            useProductStore.setState({
                rawProducts: [],
                allProducts: [],
                products: [],
                filteredProducts: [],
                initialized: false
            });

            await fetchProducts();

            // Wait and reapply filters
            setTimeout(() => {
                const store = useProductStore.getState();
                store.applyFilters();
            }, 200);

        } catch (error) {
            console.error('Failed to refresh products:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, [fetchProducts]);

    const refreshProducts = useCallback(async () => {
        await handleRefresh();
    }, [handleRefresh]);

    const displayProducts = filteredProducts || [];
    const totalProducts = allProducts.length;
    const isDisplayLoading = isRefreshing;

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Header with controls */}
            <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                    Showing {displayProducts.length} of {totalProducts} products
                </div>

                <div className="flex gap-2">
                    {showRefreshButton && (
                        <button
                            onClick={handleRefresh}
                            disabled={isDisplayLoading}
                            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Refresh products"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                    )}

                    {showAddButton && onAddProduct && (
                        <button
                            onClick={onAddProduct}
                            className="flex items-center gap-2 px-4 py-2 bg-[#9c6b63] text-white rounded-md hover:bg-[#8a5a52] transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Product
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 bg-white shadow-md rounded-xl">
                    <thead className="bg-[#fdf4f1]">
                        <tr>
                            <th className="p-3 text-left text-[#9c6b63] font-medium">Image</th>
                            <th className="p-3 text-left text-[#9c6b63] font-medium">Name</th>
                            <th className="p-3 text-left text-[#9c6b63] font-medium">Type</th>
                            <th className="p-3 text-left text-[#9c6b63] font-medium">Price</th>
                            <th className="p-3 text-left text-[#9c6b63] font-medium">Stock</th>
                            <th className="p-3 text-left text-[#9c6b63] font-medium">Subcategories</th>
                            <th className="p-3 text-left text-[#9c6b63] font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isDisplayLoading ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-500">
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-[#9c6b63] rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-[#9c6b63] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-[#9c6b63] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                        <span className="text-sm">Loading products</span>
                                    </div>
                                </td>
                            </tr>
                        ) : displayProducts.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-500">
                                    {totalProducts === 0
                                        ? 'No products found. Add your first product to get started.'
                                        : 'No products match your current filters. Try adjusting your search criteria.'
                                    }
                                </td>
                            </tr>
                        ) : (
                            displayProducts.map((product) => (
                                <ProductRow
                                    key={product._id}
                                    product={{
                                        ...product,
                                        refId: (product as any).refId ?? product._id,
                                        reviews: (product.reviews ?? []) as unknown as Review[]
                                    }}
                                    onEdit={() => handleEdit({
                                        ...product,
                                        refId: (product as any).refId ?? product._id,
                                        subcategories: (product as any).subcategories ?? [],
                                        reviews: (product.reviews ?? []) as unknown as Review[]
                                    })}
                                    onDelete={() => handleDelete({
                                        ...product,
                                        refId: (product as any).refId ?? product._id,
                                        subcategories: (product as any).subcategories ?? [],
                                        reviews: (product.reviews ?? []) as unknown as Review[]
                                    })}
                                    onManageSubcategories={() => handleManageSubcategories({
                                        ...product,
                                        refId: (product as any).refId ?? product._id,
                                        subcategories: (product as any).subcategories ?? [],
                                        reviews: (product.reviews ?? []) as unknown as Review[]
                                    })}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            {selectedProduct && (
                <ProductFormModal
                    mode="edit"
                    initialData={selectedProduct}
                    onClose={handleCloseEditModal}
                />
            )}

            {deleteProduct && (
                <DeleteConfirmModal
                    productId={deleteProduct.refId}
                    type={deleteProduct.type}
                    onClose={handleCloseDeleteModal}
                />
            )}

            {subcategoryProduct && (
                <ManageSubcategoriesModal
                    productId={subcategoryProduct._id}
                    currentType={subcategoryProduct.type}
                    currentSubcategories={subcategoryProduct.subcategories}
                    onClose={handleCloseSubcategoryModal}
                    onUpdated={refreshProducts}
                />
            )}
        </div>
    );
};