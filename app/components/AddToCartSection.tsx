// Pentru Product Detail Page, creează o componentă client separată:

'use client';

import { useState } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/app/stores/CartStore';

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
    const addItem = useCartStore(state => state.addItem);
    const getItemById = useCartStore(state => state.getItemById);

    // Verifică dacă produsul este deja în coș
    const cartItem = getItemById(product._id);
    const availableStock = product.stock - (cartItem?.quantity || 0);

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity >= 1 && newQuantity <= availableStock) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            addItem({
                id: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                type: product.type,
                stock: product.stock,
                discount: product.discount,
                maxStock: product.stock
            });
        }

        // Afișează mesaj de succes
        const toast = document.createElement('div');
        toast.className = 'fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        toast.textContent = `${quantity} item(s) added to cart!`;
        document.body.appendChild(toast);
        setTimeout(() => document.body.removeChild(toast), 3000);

        setQuantity(1); // Reset quantity
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
                            disabled={quantity <= 1}
                        >
                            <Minus size={16} />
                        </button>
                        <span className="px-4 py-2 border-x border-[#c1a5a2]/30 text-[#9a6a63] font-medium min-w-[60px] text-center">
                            {quantity}
                        </span>
                        <button
                            onClick={() => handleQuantityChange(quantity + 1)}
                            className="px-4 py-2 hover:bg-[#9a6a63]/10 transition-colors text-[#9a6a63] font-medium disabled:opacity-50"
                            disabled={quantity >= availableStock}
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>

                {/* Stock info */}
                <div className="mb-4 text-sm text-[#9a6a63]/70">
                    {availableStock > 0 ? (
                        <span>{availableStock} available {cartItem && `(${cartItem.quantity} in cart)`}</span>
                    ) : (
                        <span className="text-red-600">No more stock available</span>
                    )}
                </div>

                <button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}
                    disabled={availableStock === 0}
                >
                    <ShoppingCart size={20} />
                    {availableStock > 0 ? `Add ${quantity} to Cart` : 'Out of Stock'}
                </button>
            </div>
        </div>
    );
}