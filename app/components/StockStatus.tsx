// components/StockStatus.tsx
'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/app/stores/CartStore';
import { Package } from 'lucide-react';

interface StockStatusProps {
    productId: string;
    initialStock: number;
}

export default function StockStatus({ productId, initialStock }: StockStatusProps) {
    const { getItemById } = useCartStore();
    const [currentStock, setCurrentStock] = useState(initialStock);
    const [isLoading, setIsLoading] = useState(false);

    // Calculează stocul disponibil CORECT
    const cartItem = getItemById(productId);
    const reservedInCart = cartItem?.quantity || 0;

    // ✅ CORECT: currentStock e stocul rămas în DB (deja scăzut)
    // Nu mai scădem reservedInCart pentru că e deja scăzut!
    const availableStock = currentStock;

    // Sync cu stocul din server
    useEffect(() => {
        const fetchCurrentStock = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/product/${productId}/check-stock`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.product) {
                        setCurrentStock(data.product.stock);
                    }
                }
            } catch (error) {
                console.error('Error fetching current stock:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCurrentStock();
        const interval = setInterval(fetchCurrentStock, 10000);

        return () => clearInterval(interval);
    }, [productId]);

    return (
        <div className="flex items-center gap-2 p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-[#c1a5a2]/20 shadow-lg">
            <Package
                size={20}
                className={`${availableStock > 0 ? "text-green-600" : "text-red-600"} ${isLoading ? 'animate-pulse' : ''}`}
            />
            <div className="flex-1">
                <span className={`font-medium ${availableStock > 0 ? "text-green-600" : "text-red-600"}`}>
                    {availableStock > 0 ? (
                        <>In Stock ({availableStock} available)</>
                    ) : (
                        'Out of Stock'
                    )}
                </span>

                {/* Afișează info suplimentare */}
                <div className="text-xs text-gray-500 mt-1 space-y-1">
                    {reservedInCart > 0 && (
                        <div className="text-orange-600">
                            • {reservedInCart} in your cart
                        </div>
                    )}

                    {currentStock !== initialStock && (
                        <div className="text-blue-600">
                            • Stock updated: {currentStock} (was {initialStock})
                        </div>
                    )}

                    {isLoading && (
                        <div className="text-gray-400">
                            • Checking stock...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}