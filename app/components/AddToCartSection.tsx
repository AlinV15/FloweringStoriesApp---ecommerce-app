// components/AddToCartSection.tsx
'use client';

import { useState } from 'react';
import { useCartStore } from '@/app/stores/CartStore';
import { ShoppingCart, Plus, Minus, Loader2 } from 'lucide-react';

interface AddToCartSectionProps {
    product: {
        _id: string;
        name: string;
        price: number;
        image: string;
        type: string;
        stock: number;
        discount: number;
    };
}

export default function AddToCartSection({ product }: AddToCartSectionProps) {
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);

    const {
        addItem,
        getItemById,
        isUpdatingStock
    } = useCartStore();

    // Verifică dacă produsul este deja în coș
    const cartItem = getItemById(product._id);
    const availableStock = product.stock - (cartItem?.quantity || 0);

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity >= 1 && newQuantity <= availableStock) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = async () => {
        if (availableStock === 0) return;

        setLoading(true);

        try {
            const cartProduct = {
                id: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                type: product.type,
                stock: product.stock,
                discount: product.discount,
                maxStock: product.stock
            };

            // ✅ Folosește noul addItem cu stock management
            for (let i = 0; i < quantity; i++) {
                const result = await addItem(cartProduct);

                if (!result.success) {
                    console.error('Failed to add item:', result.message);
                    break; // Oprește dacă nu poate adăuga
                }
            }

            // Reset quantity după adăugare cu succes
            setQuantity(1);

        } catch (error) {
            console.error('Error adding to cart:', error);

            // Show error toast
            const toast = document.createElement('div');
            toast.className = 'fixed top-20 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
            toast.textContent = 'Failed to add to cart. Please try again.';
            document.body.appendChild(toast);
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 3000);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                    <label className="text-sm font-medium text-[#9a6a63]">Quantity:</label>
                    <div className="flex items-center border border-[#c1a5a2]/30 rounded-xl">
                        <button
                            onClick={() => handleQuantityChange(quantity - 1)}
                            className="px-4 py-2 hover:bg-[#9a6a63]/10 transition-colors text-[#9a6a63] font-medium disabled:opacity-50"
                            disabled={quantity <= 1 || loading || isUpdatingStock}
                        >
                            <Minus size={16} />
                        </button>
                        <span className="px-4 py-2 border-x border-[#c1a5a2]/30 text-[#9a6a63] font-medium min-w-[60px] text-center">
                            {quantity}
                        </span>
                        <button
                            onClick={() => handleQuantityChange(quantity + 1)}
                            className="px-4 py-2 hover:bg-[#9a6a63]/10 transition-colors text-[#9a6a63] font-medium disabled:opacity-50"
                            disabled={quantity >= availableStock || loading || isUpdatingStock}
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>


                <button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}
                    disabled={availableStock === 0 || loading || isUpdatingStock}
                >
                    {loading || isUpdatingStock ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Adding...
                        </>
                    ) : (
                        <>
                            <ShoppingCart size={20} />
                            {availableStock > 0 ? `Add ${quantity} to Cart` : 'Out of Stock'}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}