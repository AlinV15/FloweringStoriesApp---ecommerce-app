// stores/cartStore.ts - Enhanced with real-time stock management
import React from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    type: string;
    stock: number;
    discount: number;
    quantity: number;
    maxStock: number; // Pentru a preveni adăugarea peste stoc
}

interface CartStore {
    items: CartItem[];
    isOpen: boolean;
    isUpdatingStock: boolean;

    // Actions
    addItem: (product: Omit<CartItem, 'quantity'>) => Promise<{ success: boolean; message: string }>;
    removeItem: (id: string) => Promise<void>;
    updateQuantity: (id: string, quantity: number) => Promise<{ success: boolean; message?: string }>;
    clearCart: () => Promise<void>;
    toggleCart: () => void;
    closeCart: () => void;
    openCart: () => void;

    // Stock management
    updateProductStock: (productId: string, newStock: number) => Promise<boolean>;
    reserveStock: (productId: string, quantity: number) => Promise<boolean>;
    releaseStock: (productId: string, quantity: number) => Promise<boolean>;
    syncStockWithServer: () => Promise<void>;

    // Getters
    getTotalItems: () => number;
    getTotalPrice: () => number;
    getTotalDiscount: () => number;
    getOriginalTotal: () => number;
    getDiscountPercentage: () => number;
    getItemById: (id: string) => CartItem | undefined;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            isUpdatingStock: false,

            // Enhanced addItem with stock management
            addItem: async (product) => {
                try {
                    set({ isUpdatingStock: true });

                    const items = get().items;
                    const existingItem = items.find(item => item.id === product.id);

                    if (existingItem) {
                        // Verifică dacă nu depășește stocul
                        const newQuantity = existingItem.quantity + 1;
                        if (newQuantity <= product.maxStock) {
                            // Rezervă stocul pe server
                            const stockReserved = await get().reserveStock(product.id, 1);

                            if (stockReserved) {
                                set({
                                    items: items.map(item =>
                                        item.id === product.id
                                            ? { ...item, quantity: newQuantity, stock: item.stock - 1 }
                                            : item
                                    )
                                });

                                // Show success toast
                                showToast(`${product.name} quantity updated!`, 'success');
                                return { success: true, message: 'Product quantity updated!' };
                            } else {
                                return { success: false, message: 'Failed to reserve stock. Please try again.' };
                            }
                        } else {
                            return { success: false, message: 'Not enough stock available!' };
                        }
                    } else {
                        // Adaugă produs nou
                        if (product.stock > 0) {
                            // Rezervă stocul pe server
                            const stockReserved = await get().reserveStock(product.id, 1);

                            if (stockReserved) {
                                set({
                                    items: [...items, {
                                        ...product,
                                        quantity: 1,
                                        stock: product.stock - 1,
                                        maxStock: product.stock - 1
                                    }]
                                });

                                // Show success toast
                                showToast(`${product.name} added to cart!`, 'success');
                                return { success: true, message: 'Product added to cart!' };
                            } else {
                                return { success: false, message: 'Failed to reserve stock. Please try again.' };
                            }
                        } else {
                            return { success: false, message: 'Product out of stock!' };
                        }
                    }
                } catch (error) {
                    console.error('Error adding item to cart:', error);
                    return { success: false, message: 'An error occurred. Please try again.' };
                } finally {
                    set({ isUpdatingStock: false });
                }
            },

            // Enhanced removeItem with stock release
            removeItem: async (id) => {
                try {
                    set({ isUpdatingStock: true });

                    const item = get().getItemById(id);
                    if (item) {
                        // Eliberează stocul pe server
                        await get().releaseStock(item.id, item.quantity);

                        set({
                            items: get().items.filter(item => item.id !== id)
                        });

                        showToast(`${item.name} removed from cart`, 'info');
                    }
                } catch (error) {
                    console.error('Error removing item from cart:', error);
                    showToast('Failed to remove item. Please try again.', 'error');
                } finally {
                    set({ isUpdatingStock: false });
                }
            },

            // Enhanced updateQuantity with stock management
            updateQuantity: async (id, quantity) => {
                try {
                    set({ isUpdatingStock: true });

                    if (quantity <= 0) {
                        await get().removeItem(id);
                        return { success: true };
                    }

                    const item = get().getItemById(id);
                    if (!item) {
                        return { success: false, message: 'Item not found in cart' };
                    }

                    const quantityDiff = quantity - item.quantity;

                    if (quantityDiff > 0) {
                        // Increasing quantity - need to reserve more stock
                        if (quantity <= item.maxStock) {
                            const stockReserved = await get().reserveStock(id, quantityDiff);

                            if (stockReserved) {
                                set({
                                    items: get().items.map(cartItem =>
                                        cartItem.id === id
                                            ? { ...cartItem, quantity, stock: cartItem.stock - quantityDiff }
                                            : cartItem
                                    )
                                });
                                return { success: true };
                            } else {
                                return { success: false, message: 'Not enough stock available!' };
                            }
                        } else {
                            return { success: false, message: 'Not enough stock available!' };
                        }
                    } else {
                        // Decreasing quantity - release stock
                        await get().releaseStock(id, Math.abs(quantityDiff));

                        set({
                            items: get().items.map(cartItem =>
                                cartItem.id === id
                                    ? { ...cartItem, quantity, stock: cartItem.stock + Math.abs(quantityDiff) }
                                    : cartItem
                            )
                        });
                        return { success: true };
                    }
                } catch (error) {
                    console.error('Error updating quantity:', error);
                    return { success: false, message: 'Failed to update quantity. Please try again.' };
                } finally {
                    set({ isUpdatingStock: false });
                }
            },

            // Enhanced clearCart with stock release
            clearCart: async () => {
                try {
                    set({ isUpdatingStock: true });

                    const items = get().items;

                    // Release all reserved stock
                    for (const item of items) {
                        await get().releaseStock(item.id, item.quantity);
                    }

                    set({ items: [] });
                    showToast('Cart cleared', 'info');
                } catch (error) {
                    console.error('Error clearing cart:', error);
                    showToast('Failed to clear cart. Please try again.', 'error');
                } finally {
                    set({ isUpdatingStock: false });
                }
            },

            toggleCart: () => {
                set({ isOpen: !get().isOpen });
            },

            closeCart: () => {
                set({ isOpen: false });
            },

            openCart: () => {
                set({ isOpen: true });
            },

            // Stock management functions
            updateProductStock: async (productId: string, newStock: number) => {
                try {
                    const response = await fetch(`/api/product/${productId}/stock`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ stock: newStock }),
                    });

                    if (response.ok) {
                        // Update local cart item stock
                        set({
                            items: get().items.map(item =>
                                item.id === productId
                                    ? { ...item, stock: newStock, maxStock: newStock + item.quantity }
                                    : item
                            )
                        });
                        return true;
                    }
                    return false;
                } catch (error) {
                    console.error('Error updating product stock:', error);
                    return false;
                }
            },

            reserveStock: async (productId: string, quantity: number) => {
                try {
                    const response = await fetch(`/api/product/${productId}/reserve-stock`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ quantity }),
                    });

                    const data = await response.json();

                    if (response.ok && data.success) {
                        return true;
                    }

                    if (data.message) {
                        showToast(data.message, 'error');
                    }
                    return false;
                } catch (error) {
                    console.error('Error reserving stock:', error);
                    return false;
                }
            },

            releaseStock: async (productId: string, quantity: number) => {
                try {
                    const response = await fetch(`/api/product/${productId}/release-stock`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ quantity }),
                    });

                    const data = await response.json();
                    return response.ok && data.success;
                } catch (error) {
                    console.error('Error releasing stock:', error);
                    return false;
                }
            },

            syncStockWithServer: async () => {
                try {
                    const items = get().items;
                    if (items.length === 0) return;

                    const productIds = items.map(item => item.id);

                    const response = await fetch('/api/product/stock-sync', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ productIds }),
                    });

                    if (response.ok) {
                        const { products } = await response.json();

                        // Update cart items with latest stock info
                        set({
                            items: get().items.map(item => {
                                const serverProduct = products.find((p: any) => p._id === item.id);
                                if (serverProduct) {
                                    return {
                                        ...item,
                                        stock: serverProduct.stock,
                                        maxStock: serverProduct.stock + item.quantity
                                    };
                                }
                                return item;
                            })
                        });
                    }
                } catch (error) {
                    console.error('Error syncing stock with server:', error);
                }
            },

            // Getters
            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },

            getTotalPrice: () => {
                return get().items.reduce((total, item) => {
                    const itemPrice = item.discount > 0
                        ? item.price * (1 - item.discount / 100)
                        : item.price;
                    return total + (itemPrice * item.quantity);
                }, 0);
            },

            getItemById: (id) => {
                return get().items.find(item => item.id === id);
            },

            getTotalDiscount: () => {
                return get().items.reduce((total, item) => {
                    if (item.discount > 0) {
                        const originalItemTotal = item.price * item.quantity;
                        const discountedItemTotal = (item.price * (1 - item.discount / 100)) * item.quantity;
                        return total + (originalItemTotal - discountedItemTotal);
                    }
                    return total;
                }, 0);
            },

            getOriginalTotal: () => {
                return get().items.reduce((total, item) => {
                    return total + (item.price * item.quantity);
                }, 0);
            },

            getDiscountPercentage: () => {
                const originalTotal = get().getOriginalTotal();
                const totalDiscount = get().getTotalDiscount();
                return originalTotal > 0 ? (totalDiscount / originalTotal) * 100 : 0;
            },
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
            // Sync stock when store is rehydrated
            onRehydrateStorage: () => (state) => {
                if (state) {
                    // Sync stock with server when app loads
                    setTimeout(() => {
                        state.syncStockWithServer();
                    }, 1000);
                }
            }
        }
    )
);

// Toast notification utility
const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' : 'bg-blue-500';

    toast.className = `fixed top-20 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all transform translate-x-0`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);

    // Animate out and remove
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
};

// Hook for periodic stock sync
export const useStockSync = (intervalMs: number = 30000) => {
    const syncStockWithServer = useCartStore(state => state.syncStockWithServer);

    React.useEffect(() => {
        const interval = setInterval(() => {
            syncStockWithServer();
        }, intervalMs);

        return () => clearInterval(interval);
    }, [syncStockWithServer, intervalMs]);
};