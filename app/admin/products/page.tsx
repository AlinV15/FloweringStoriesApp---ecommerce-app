'use client';

import { useProductStore } from '@/app/stores/ProductStore';
import { useEffect, useState } from 'react';
import ProductFilterBar from '../components/ProductFilterBar';
import { ProductTable } from '../components/ProductTable';
import ProductFormModal from '../components/ProductFormModal';
import { Plus } from 'lucide-react';

const AdminAllProductsPage = () => {
    const { fetchProducts } = useProductStore();
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    //console.log('Products:', products);

    return (
        <div className="p-6 bg-[#fffaf7] min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-extrabold text-[#9c6b63] tracking-tight">Manage Products</h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-[#9c6b63] hover:bg-[#8a5b53] text-white px-5 py-2.5 rounded-lg shadow transition"
                >
                    <Plus className="w-5 h-5" />
                    Add Product
                </button>
            </div>

            <div className="bg-white shadow rounded-lg p-4 mb-4">
                <ProductFilterBar />
            </div>

            <ProductTable />

            {showAddModal && (
                <ProductFormModal
                    mode="create"
                    onClose={() => setShowAddModal(false)}
                />
            )}
        </div>

    );
};

export default AdminAllProductsPage;
