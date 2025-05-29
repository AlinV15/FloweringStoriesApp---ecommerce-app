// stores/cartStore.ts
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

    // Actions
    addItem: (product: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    toggleCart: () => void;
    closeCart: () => void;

    // Getters

    getTotalItems: () => number;
    getTotalPrice: () => number;
    getTotalDiscount: () => number;
    getOriginalTotal: () => number;
    getDiscountPercentage: () => number;
    getItemById: (id: string) => CartItem | undefined;
    openCart: () => void;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            addItem: (product) => {
                const items = get().items;
                const existingItem = items.find(item => item.id === product.id);

                if (existingItem) {
                    // Verifică dacă nu depășește stocul
                    const newQuantity = existingItem.quantity + 1;
                    if (newQuantity <= product.maxStock) {
                        set({
                            items: items.map(item =>
                                item.id === product.id
                                    ? { ...item, quantity: newQuantity }
                                    : item
                            )
                        });
                        return { success: true, message: 'Product quantity updated!' };
                    } else {
                        return { success: false, message: 'Not enough stock available!' };
                    }
                } else {
                    // Adaugă produs nou
                    if (product.stock > 0) {
                        set({
                            items: [...items, { ...product, quantity: 1 }]
                        });
                        return { success: true, message: 'Product added to cart!' };
                    } else {
                        return { success: false, message: 'Product out of stock!' };
                    }
                }
            },

            removeItem: (id) => {
                set({
                    items: get().items.filter(item => item.id !== id)
                });
            },

            updateQuantity: (id, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(id);
                    return;
                }

                const item = get().getItemById(id);
                if (item && quantity <= item.maxStock) {
                    set({
                        items: get().items.map(item =>
                            item.id === id ? { ...item, quantity } : item
                        )
                    });
                    return { success: true };
                }
                return { success: false, message: 'Not enough stock available!' };
            },

            clearCart: () => {
                set({ items: [] });
            },

            toggleCart: () => {
                set({ isOpen: !get().isOpen });
            },

            closeCart: () => {
                set({ isOpen: false });
            },

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

            openCart: () => {
                set({ isOpen: true });
            },
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);