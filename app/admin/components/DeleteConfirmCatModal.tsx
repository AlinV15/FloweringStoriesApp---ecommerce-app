'use client';

import { useState } from 'react';
import { useProductStore } from '@/app/stores/ProductStore';
import useSubcategoryStore from '@/app/stores/SubcategoryStore';
import { AlertCircle, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
    categoryId: string;
    categoryName: string;
    type: string;
    onClose: () => void;
    onDeleted: () => void;
}

const DeleteConfirmCatModal = ({ categoryId, categoryName, type, onClose, onDeleted }: Props) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');
    const { deleteSubcategory } = useSubcategoryStore();
    const { products, updateProduct, fetchProducts } = useProductStore();

    const handleDelete = async () => {
        setIsDeleting(true);
        setError('');

        try {
            // 1. Delete the subcategory
            const success = await deleteSubcategory(categoryId);

            if (!success) {
                throw new Error("Failed to delete category");
            }

            // 2. Find and update products that reference this category
            const productsToUpdate = products.filter(product =>
                product.subcategories && product.subcategories.some(subCat => subCat._id === categoryId)
            );

            // Process all product updates
            if (productsToUpdate.length > 0) {
                await Promise.all(productsToUpdate.map(async (product) => {
                    // Filter out the deleted category ID
                    const updatedSubcategories = product.subcategories.filter(
                        subCatId => subCatId._id !== categoryId
                    );

                    // Update the product with the filtered subcategories
                    await fetch(`/api/product/${product._id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ subcategories: updatedSubcategories }),
                    });
                }));

                // Refresh products list to get the updated data
                await fetchProducts();
            }

            toast.success(`Category "${categoryName}" deleted successfully!`);
            onDeleted();
        } catch (err: any) {
            console.error("Error during deletion:", err);
            setError(err.message || 'An error occurred while deleting');
            toast.error(err.message || 'An error occurred while deleting');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
            role="dialog"
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
        >
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative border border-neutral-200">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-neutral-500 hover:text-black transition"
                    aria-label="Close dialog"
                >
                    <X size={20} />
                </button>
                <div className="mb-4">
                    <h3 id="delete-dialog-title" className="text-xl font-semibold text-neutral-800 mb-2">
                        Delete "{categoryName}"?
                    </h3>
                    <p id="delete-dialog-description" className="text-sm text-neutral-600">
                        Are you sure you want to delete this category? This action cannot be undone. Any products using this category will be updated.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                        <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition"
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition shadow-sm flex items-center justify-center min-w-24"
                        aria-busy={isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 size={16} className="animate-spin mr-2" />
                                Deleting...
                            </>
                        ) : (
                            'Delete'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmCatModal;