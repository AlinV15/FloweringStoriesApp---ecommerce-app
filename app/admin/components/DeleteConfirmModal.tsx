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

        // Găsește refId-ul corect, exact ca în ProductFormModal
        let actualProductId = productId;

        // Dacă avem acces la store, încearcă să găsești refId-ul corect
        try {
            const { rawProducts } = useProductStore.getState();
            const rawProduct = rawProducts.find(p => p._id === productId);

            if (rawProduct?.refId) {
                actualProductId = rawProduct.refId;
                console.log('✅ Using refId from rawProduct:', actualProductId, 'instead of _id:', productId);
            } else {
                console.log('⚠️ No rawProduct found, using original productId:', productId);
            }
        } catch (storeError) {
            console.log('⚠️ Could not access store, using original productId:', productId);
        }

        // Debug: verifică ce ID trimiți
        console.log('🔍 DELETE DEBUG:', {
            originalProductId: productId,
            actualProductId,
            type,
            endpoint: `/api/product/${type}/${actualProductId}`,
            expectedRefId: '686bcc3b826c91526a9cc0db', // Pentru comparație
            receivedId: actualProductId === '686bcc3b826c91526a9cc0db' ? 'CORRECT refId' : 'WRONG _id'
        });

        // Loader/loading state
        const loadingToast = toast.loading('Deleting product...');

        try {
            switch (type) {
                case 'book':
                    res = await fetch(`/api/product/book/${actualProductId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    break;
                case 'flower':
                    res = await fetch(`/api/product/flower/${actualProductId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    break;
                case 'stationary':
                    res = await fetch(`/api/product/stationary/${actualProductId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    break;
                default:
                    throw new Error(`Invalid product type: ${type}`);
            }

            // Dismiss loading toast
            toast.dismiss(loadingToast);

            // Verifică statusul răspunsului
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
            }

            // Verifică dacă răspunsul este valid JSON
            const responseData = await res.json();
            console.log('Delete response:', responseData);
            console.log('Deleted product type:', type, 'with ID:', productId);

            toast.success('Product deleted successfully!');
            await fetchProducts(); // Așteaptă refresh-ul
            onClose();

        } catch (err) {
            // Dismiss loading toast în caz de eroare
            toast.dismiss(loadingToast);

            console.error("Error during deletion:", err);

            let errorMessage = 'An error occurred while deleting the product';

            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === 'string') {
                errorMessage = err;
            }

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