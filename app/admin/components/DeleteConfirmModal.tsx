'use client';
import { useProductStore } from '@/app/stores/ProductStore';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
    productId: string;
    type: string;
    onClose: () => void;
}

const DeleteConfirmModal = ({ productId, onClose, type }: Props) => {
    const { fetchProducts } = useProductStore();

    const handleDelete = async () => {
        let res;
        try {
            switch (type) {
                case 'book':
                    res = await fetch(`/api/product/book/${productId}`, {
                        method: 'DELETE',
                    });
                    break;
                case 'flower':
                    res = await fetch(`/api/product/flower/${productId}`, {
                        method: 'DELETE',
                    });
                    break;
                case 'stationary':
                    res = await fetch(`/api/product/stationary/${productId}`, {
                        method: 'DELETE',
                    });
                    break;
                default: res = null
            }
            if (res) {
                toast.success('Product deleted successfully!');
                fetchProducts();
                onClose();
            } else {
                throw new Error();
            }
        } catch (err) {
            console.error("Error during deletion:", err);
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting';
            toast.error(errorMessage);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative border border-neutral-200">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-neutral-500 hover:text-black transition"
                >
                    <X size={20} />
                </button>
                <div className="mb-4">
                    <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                        Confirm Deletion
                    </h3>
                    <p className="text-sm text-neutral-600">
                        Are you sure you want to delete this product? This action cannot be undone.
                    </p>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition shadow-sm"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
