// hooks/useStockSync.ts - Hook for automatic stock synchronization
import { useEffect, useRef, useCallback } from 'react';
import { useCartStore } from '@/app/stores/CartStore';

interface UseStockSyncOptions {
    /** Interval in milliseconds for periodic sync (default: 30000ms = 30s) */
    syncInterval?: number;
    /** Whether to sync immediately on mount (default: true) */
    syncOnMount?: boolean;
    /** Whether to sync when the window gains focus (default: true) */
    syncOnFocus?: boolean;
    /** Whether to sync when the window becomes visible (default: true) */
    syncOnVisible?: boolean;
}

export const useStockSync = (options: UseStockSyncOptions = {}) => {
    const {
        syncInterval = 30000, // 30 seconds
        syncOnMount = true,
        syncOnFocus = true,
        syncOnVisible = true
    } = options;

    const { syncStockWithServer, items } = useCartStore();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastSyncRef = useRef<number>(0);

    // Throttled sync function to prevent too frequent calls
    const throttledSync = useCallback(async () => {
        const now = Date.now();
        // Don't sync more than once every 5 seconds
        if (now - lastSyncRef.current < 5000) return;

        lastSyncRef.current = now;

        if (items.length > 0) {
            try {
                await syncStockWithServer();

            } catch (error) {
                console.error('❌ Failed to sync stock:', error);
            }
        }
    }, [syncStockWithServer, items.length]);

    // Set up periodic sync
    useEffect(() => {
        if (items.length === 0) {
            // Clear interval if no items in cart
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Set up interval for periodic sync
        intervalRef.current = setInterval(throttledSync, syncInterval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [throttledSync, syncInterval, items.length]);

    // Sync on mount
    useEffect(() => {
        if (syncOnMount && items.length > 0) {
            throttledSync();
        }
    }, [syncOnMount, throttledSync, items.length]);

    // Sync when window gains focus
    useEffect(() => {
        if (!syncOnFocus) return;

        const handleFocus = () => {
            throttledSync();
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [syncOnFocus, throttledSync]);

    // Sync when page becomes visible (Page Visibility API)
    useEffect(() => {
        if (!syncOnVisible) return;

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                throttledSync();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [syncOnVisible, throttledSync]);

    // Manual sync function that can be called by components
    const manualSync = useCallback(async () => {
        await throttledSync();
    }, [throttledSync]);

    return {
        manualSync,
        isActive: items.length > 0,
        lastSync: lastSyncRef.current
    };
};

// Hook specifically for individual product stock checking
export const useProductStockSync = (productId: string, initialStock: number) => {
    const [currentStock, setCurrentStock] = useState(initialStock);
    const [isLoading, setIsLoading] = useState(false);
    const lastCheckRef = useRef<number>(0);

    // Throttled stock check function
    const checkStock = useCallback(async () => {
        const now = Date.now();
        // Don't check more than once every 10 seconds per product
        if (now - lastCheckRef.current < 10000) return currentStock;

        lastCheckRef.current = now;
        setIsLoading(true);

        try {
            const response = await fetch(`/api/product/${productId}/check-stock`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setCurrentStock(data.product.stock);
                    return data.product.stock;
                }
            }
            return currentStock;
        } catch (error) {
            console.error('Error checking product stock:', error);
            return currentStock;
        } finally {
            setIsLoading(false);
        }
    }, [productId, currentStock]);

    // Auto-check stock on mount and periodically
    useEffect(() => {
        // Check stock on mount
        checkStock();

        // Set up periodic checking every 60 seconds
        const interval = setInterval(checkStock, 60000);

        return () => clearInterval(interval);
    }, [checkStock]);

    // Check stock when window gains focus
    useEffect(() => {
        const handleFocus = () => {
            checkStock();
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [checkStock]);

    return {
        currentStock,
        isLoading,
        checkStock,
        isLowStock: currentStock > 0 && currentStock <= 5,
        isOutOfStock: currentStock === 0
    };
};

// Hook for monitoring cart item stock status
export const useCartStockMonitor = () => {
    const { items, updateQuantity, removeItem } = useCartStore();
    const [stockIssues, setStockIssues] = useState<Array<{
        productId: string;
        productName: string;
        requestedQuantity: number;
        availableStock: number;
        issue: 'out_of_stock' | 'insufficient_stock';
    }>>([]);

    // Check all cart items for stock issues
    const checkCartStock = useCallback(async () => {
        if (items.length === 0) {
            setStockIssues([]);
            return;
        }

        const productIds = items.map(item => item.id);

        try {
            const response = await fetch('/api/product/stock-sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productIds }),
            });

            if (response.ok) {
                const { products } = await response.json();
                const issues: typeof stockIssues = [];

                items.forEach(cartItem => {
                    const serverProduct = products.find((p: any) => p._id === cartItem.id);
                    if (serverProduct) {
                        if (serverProduct.stock === 0) {
                            issues.push({
                                productId: cartItem.id,
                                productName: cartItem.name,
                                requestedQuantity: cartItem.quantity,
                                availableStock: 0,
                                issue: 'out_of_stock'
                            });
                        } else if (serverProduct.stock < cartItem.quantity) {
                            issues.push({
                                productId: cartItem.id,
                                productName: cartItem.name,
                                requestedQuantity: cartItem.quantity,
                                availableStock: serverProduct.stock,
                                issue: 'insufficient_stock'
                            });
                        }
                    }
                });

                setStockIssues(issues);
            }
        } catch (error) {
            console.error('Error checking cart stock:', error);
        }
    }, [items]);

    // Auto-resolve stock issues
    const autoResolveStockIssues = useCallback(async () => {
        for (const issue of stockIssues) {
            if (issue.issue === 'out_of_stock') {
                // Remove item if completely out of stock
                await removeItem(issue.productId);
                showStockIssueToast(
                    `${issue.productName} was removed from your cart (out of stock)`,
                    'warning'
                );
            } else if (issue.issue === 'insufficient_stock') {
                // Update quantity to available stock
                await updateQuantity(issue.productId, issue.availableStock);
                showStockIssueToast(
                    `${issue.productName} quantity updated to ${issue.availableStock} (limited stock)`,
                    'info'
                );
            }
        }
        setStockIssues([]);
    }, [stockIssues, removeItem, updateQuantity]);

    // Manual resolve function for user control
    const resolveStockIssue = useCallback(async (productId: string, action: 'remove' | 'update' | 'keep') => {
        const issue = stockIssues.find(i => i.productId === productId);
        if (!issue) return;

        switch (action) {
            case 'remove':
                await removeItem(productId);
                break;
            case 'update':
                await updateQuantity(productId, issue.availableStock);
                break;
            case 'keep':
                // Do nothing, keep current quantity (user's choice)
                break;
        }

        setStockIssues(prev => prev.filter(i => i.productId !== productId));
    }, [stockIssues, removeItem, updateQuantity]);

    // Check stock periodically
    useEffect(() => {
        checkCartStock();
        const interval = setInterval(checkCartStock, 45000); // Every 45 seconds
        return () => clearInterval(interval);
    }, [checkCartStock]);

    return {
        stockIssues,
        hasStockIssues: stockIssues.length > 0,
        checkCartStock,
        autoResolveStockIssues,
        resolveStockIssue
    };
};

// Utility function for stock issue notifications
const showStockIssueToast = (message: string, type: 'info' | 'warning' | 'error') => {
    const bgColor = type === 'info' ? 'bg-blue-500' :
        type === 'warning' ? 'bg-orange-500' : 'bg-red-500';

    const toast = document.createElement('div');
    toast.className = `fixed top-20 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm`;
    toast.innerHTML = `
        <div class="flex items-start gap-2">
            <div class="flex-shrink-0 mt-0.5">
                ${type === 'info' ? '🔄' : type === 'warning' ? '⚠️' : '❌'}
            </div>
            <div class="text-sm">${message}</div>
        </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 5000);
};

// Re-export useState for the useProductStockSync hook
import { useState } from 'react';