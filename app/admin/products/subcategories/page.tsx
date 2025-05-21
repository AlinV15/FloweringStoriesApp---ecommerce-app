'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import SubcategoryFormModal from '../../components/SubcategoryFormModal';
import DeleteConfirmCatModal from '../../components/DeleteConfirmCatModal';
import { Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useSubcategoryStore from '@/app/stores/SubcategoryStore';
import { Subcategory } from '@/app/types';

export default function CategoriesPage() {
    const { subcategories, loading, error, fetchSubcategories, setSubcategories } = useSubcategoryStore();
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editData, setEditData] = useState<Subcategory | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<Subcategory | null>(null);

    useEffect(() => {
        fetchSubcategories();
    }, [fetchSubcategories]);

    const handleEditClick = (category: Subcategory) => {
        setEditData(category);
        setShowFormModal(true);
    };

    const handleDeleteClick = (category: Subcategory) => {
        setCategoryToDelete(category);
        setShowDeleteModal(true);
    };

    const handleCloseModals = () => {
        setShowFormModal(false);
        setShowDeleteModal(false);
        setEditData(null);
        setCategoryToDelete(null);
    };

    const handleCategoryDeleted = () => {
        // Refresh category list after deletion
        fetchSubcategories();
        handleCloseModals();
    };

    return (
        <div className="min-h-screen bg-[#fefaf9] px-6 py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-[#3f3f3f]">Manage Categories</h1>
                <button
                    onClick={() => setShowFormModal(true)}
                    className="flex items-center gap-2 bg-[#9c6b63] hover:bg-[#835852] text-white px-5 py-2 rounded-full shadow-md transition duration-200 ease-in-out"
                    aria-label="Add new category"
                >
                    + Add Category
                </button>
            </div>

            {loading && (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#9c6b63]"></div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {!loading && subcategories.length === 0 && (
                <div className="text-center py-12 text-neutral-500">
                    No categories found. Click the button above to add your first category.
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {subcategories.map((cat) => (
                    <div
                        key={cat._id}
                        className="border border-[#f1e4df] rounded-2xl p-4 bg-white shadow-sm hover:shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1"
                    >
                        {cat.image && (
                            <div className="relative w-full h-36 mb-3 overflow-hidden rounded-xl">
                                <Image
                                    src={cat.image}
                                    alt={cat.name}
                                    fill
                                    className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                                />
                            </div>
                        )}
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="font-semibold text-[#3f3f3f]">{cat.name}</h3>
                            <span className="text-xs bg-[#f5e1dd] text-[#9c6b63] px-2 py-0.5 rounded-full font-medium capitalize">
                                {cat.type}
                            </span>
                        </div>
                        <p className="text-sm text-neutral-500 mb-4">{cat.description}</p>
                        <div className="flex gap-2 mt-auto">
                            <button
                                onClick={() => handleEditClick(cat)}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#9c6b63] bg-[#f5e1dd] hover:bg-[#ecd3c9] transition rounded-full border border-[#e0c4bd] shadow-sm"
                                aria-label={`Edit ${cat.name}`}
                            >
                                <Pencil size={16} className="text-[#9c6b63]" />
                                Edit
                            </button>
                            <button
                                onClick={() => handleDeleteClick(cat)}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-500 bg-red-100 hover:bg-red-200 transition rounded-full border border-red-200 shadow-sm"
                                aria-label={`Delete ${cat.name}`}
                            >
                                <Trash2 size={16} className="text-red-500" />
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showFormModal && (
                <SubcategoryFormModal
                    onClose={handleCloseModals}
                    onCategoryAdded={fetchSubcategories}
                    initialData={editData || undefined}
                />
            )}

            {showDeleteModal && categoryToDelete && (
                <DeleteConfirmCatModal
                    categoryId={categoryToDelete._id}
                    categoryName={categoryToDelete.name}
                    type={categoryToDelete.type}
                    onClose={handleCloseModals}
                    onDeleted={handleCategoryDeleted}
                />
            )}
        </div>
    );
}