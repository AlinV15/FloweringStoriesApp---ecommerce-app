// stores/cartStore.ts - User-specific cart management
import React from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useSession } from 'next-auth/react';
import { showToast } from '../hooks/useUserCart';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    type: string;
    stock: number;
    discount: number;
    quantity: number;
    maxStock: number;
}

interface CartStore {
    items: CartItem[];
    isOpen: boolean;
    isUpdatingStock: boolean;
    currentUserId: string | null;

    // Actions
    addItem: (product: Omit<CartItem, 'quantity'>) => Promise<{ success: boolean; message: string }>;
    removeItem: (id: string) => Promise<void>;
    updateQuantity: (id: string, quantity: number) => Promise<{ success: boolean; message?: string }>;
    clearCart: (isPurchase?: boolean) => Promise<void>;
    toggleCart: () => void;
    closeCart: () => void;
    openCart: () => void;

    // User management
    setCurrentUser: (userId: string | null) => void;
    loadUserCart: (userId: string | null) => void;
    saveUserCart: () => void;

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
    completePurchase: () => Promise<void>;
    markItemsAsPurchased: (itemIds: string[]) => Promise<void>;
}

// Utility functions pentru user-specific storage
const getUserCartKey = (userId: string | null) => {
    return userId ? `cart-user-${userId}` : 'cart-guest';
};

const getUserCartFromStorage = (userId: string | null): CartItem[] => {
    if (typeof window === 'undefined') return [];

    try {
        const key = getUserCartKey(userId);
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading user cart:', error);
        return [];
    }
};

const saveUserCartToStorage = (userId: string | null, items: CartItem[]) => {
    if (typeof window === 'undefined') return;

    try {
        const key = getUserCartKey(userId);
        localStorage.setItem(key, JSON.stringify(items));
    } catch (error) {
        console.error('Error saving user cart:', error);
    }
};

export const useCartStore = create<CartStore>()(
    (set, get) => ({
        items: [],
        isOpen: false,
        isUpdatingStock: false,
        currentUserId: null,

        // User management
        setCurrentUser: (userId: string | null) => {
            const currentUserId = get().currentUserId;

            // Salvează cart-ul utilizatorului curent înainte de a schimba
            if (currentUserId !== userId) {
                get().saveUserCart();

                // Încarcă cart-ul noului utilizator
                const newUserItems = getUserCartFromStorage(userId);

                set({
                    currentUserId: userId,
                    items: newUserItems
                });

                // Sync stock pentru noul utilizator
                setTimeout(() => {
                    get().syncStockWithServer();
                }, 500);
            }
        },

        loadUserCart: (userId: string | null) => {
            const items = getUserCartFromStorage(userId);
            set({
                items,
                currentUserId: userId
            });
        },

        saveUserCart: () => {
            const { items, currentUserId } = get();
            saveUserCartToStorage(currentUserId, items);
        },

        // Enhanced addItem with user-specific storage
        addItem: async (product) => {
            try {
                set({ isUpdatingStock: true });

                const items = get().items;
                const existingItem = items.find(item => item.id === product.id);

                if (existingItem) {
                    const newQuantity = existingItem.quantity + 1;
                    if (newQuantity <= product.maxStock) {
                        const stockReserved = await get().reserveStock(product.id, 1);

                        if (stockReserved) {
                            const newItems = items.map(item =>
                                item.id === product.id
                                    ? { ...item, quantity: newQuantity, stock: item.stock - 1 }
                                    : item
                            );

                            set({ items: newItems });
                            get().saveUserCart(); // Salvează specific pentru user

                            showToast(`${product.name} quantity updated!`, 'success');
                            return { success: true, message: 'Product quantity updated!' };
                        } else {
                            return { success: false, message: 'Failed to reserve stock. Please try again.' };
                        }
                    } else {
                        return { success: false, message: 'Not enough stock available!' };
                    }
                } else {
                    if (product.stock > 0) {
                        const stockReserved = await get().reserveStock(product.id, 1);

                        if (stockReserved) {
                            const newItems = [...items, {
                                ...product,
                                quantity: 1,
                                stock: product.stock - 1,
                                maxStock: product.stock - 1
                            }];

                            set({ items: newItems });
                            get().saveUserCart(); // Salvează specific pentru user

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

        removeItem: async (id) => {
            try {
                set({ isUpdatingStock: true });

                const item = get().getItemById(id);
                if (item) {
                    await get().releaseStock(item.id, item.quantity);

                    const newItems = get().items.filter(item => item.id !== id);
                    set({ items: newItems });
                    get().saveUserCart(); // Salvează specific pentru user

                    showToast(`${item.name} removed from cart`, 'info');
                }
            } catch (error) {
                console.error('Error removing item from cart:', error);
                showToast('Failed to remove item. Please try again.', 'error');
            } finally {
                set({ isUpdatingStock: false });
            }
        },

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
                    if (quantity <= item.maxStock) {
                        const stockReserved = await get().reserveStock(id, quantityDiff);

                        if (stockReserved) {
                            const newItems = get().items.map(cartItem =>
                                cartItem.id === id
                                    ? { ...cartItem, quantity, stock: cartItem.stock - quantityDiff }
                                    : cartItem
                            );

                            set({ items: newItems });
                            get().saveUserCart(); // Salvează specific pentru user
                            return { success: true };
                        } else {
                            return { success: false, message: 'Not enough stock available!' };
                        }
                    } else {
                        return { success: false, message: 'Not enough stock available!' };
                    }
                } else {
                    await get().releaseStock(id, Math.abs(quantityDiff));

                    const newItems = get().items.map(cartItem =>
                        cartItem.id === id
                            ? { ...cartItem, quantity, stock: cartItem.stock + Math.abs(quantityDiff) }
                            : cartItem
                    );

                    set({ items: newItems });
                    get().saveUserCart(); // Salvează specific pentru user
                    return { success: true };
                }
            } catch (error) {
                console.error('Error updating quantity:', error);
                return { success: false, message: 'Failed to update quantity. Please try again.' };
            } finally {
                set({ isUpdatingStock: false });
            }
        },

        clearCart: async (isPurchase: boolean = false) => {
            try {
                set({ isUpdatingStock: true });

                const items = get().items;

                if (!isPurchase) {
                    for (const item of items) {
                        await get().releaseStock(item.id, item.quantity);
                    }
                    showToast('Cart cleared', 'info');
                } else {
                    showToast('Order completed!', 'success');
                }

                set({ items: [] });
                get().saveUserCart(); // Salvează cart-ul gol specific pentru user

            } catch (error) {
                if (!isPurchase) {
                    showToast('Failed to clear cart. Please try again.', 'error');
                }
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

        // Stock management functions (rămân la fel)
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
                    const newItems = get().items.map(item =>
                        item.id === productId
                            ? { ...item, stock: newStock, maxStock: newStock + item.quantity }
                            : item
                    );

                    set({ items: newItems });
                    get().saveUserCart();
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

                    const newItems = get().items.map(item => {
                        const serverProduct = products.find((p: any) => p._id === item.id);
                        if (serverProduct) {
                            return {
                                ...item,
                                stock: serverProduct.stock,
                                maxStock: serverProduct.stock + item.quantity
                            };
                        }
                        return item;
                    });

                    set({ items: newItems });
                    get().saveUserCart();
                }
            } catch (error) {
                console.error('Error syncing stock with server:', error);
            }
        },

        // Getters (rămân la fel)
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

        completePurchase: async () => {
            set({ items: [] });
            get().saveUserCart();
            showToast('Order completed! Thank you for your purchase!', 'success');
        },

        markItemsAsPurchased: async (itemIds: string[]) => {
            const newItems = get().items.filter(item => !itemIds.includes(item.id));
            set({ items: newItems });
            get().saveUserCart();
        },
    })
);