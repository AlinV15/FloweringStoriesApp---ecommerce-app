// components/StockNotifications.tsx - Component for handling stock issues
'use client';

import { useState } from 'react';
import { X, AlertTriangle, Package, ShoppingCart, RefreshCw } from 'lucide-react';
import { useCartStockMonitor } from '@/app/hooks/useStockSync';

const StockNotifications = () => {
    const {
        stockIssues,
        hasStockIssues,
        autoResolveStockIssues,
        resolveStockIssue,
        checkCartStock
    } = useCartStockMonitor();

    const [isVisible, setIsVisible] = useState(true);
    const [isResolving, setIsResolving] = useState(false);

    if (!hasStockIssues || !isVisible) {
        return null;
    }

    const handleAutoResolve = async () => {
        setIsResolving(true);
        try {
            await autoResolveStockIssues();
        } finally {
            setIsResolving(false);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        // Show again after 30 seconds if issues still exist
        setTimeout(() => {
            setIsVisible(true);
        }, 30000);
    };

    const handleRefresh = async () => {
        await checkCartStock();
    };

    return (
        <div className="fixed top-20 right-4 max-w-md z-50">
            <div className="bg-white border-l-4 border-orange-500 rounded-lg shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-orange-50 px-4 py-3 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="text-orange-500" size={20} />
                            <h3 className="font-semibold text-orange-800">
                                Stock Issues in Cart
                            </h3>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="text-orange-600 hover:text-orange-800 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Issues List */}
                <div className="max-h-64 overflow-y-auto">
                    {stockIssues.map((issue) => (
                        <div key={issue.productId} className="p-4 border-b border-gray-100 last:border-b-0">
                            <div className="flex items-start gap-3">
                                <Package className="text-gray-400 mt-1 flex-shrink-0" size={16} />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">
                                        {issue.productName}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {issue.issue === 'out_of_stock' ? (
                                            <span className="text-red-600">
                                                Currently out of stock
                                            </span>
                                        ) : (
                                            <span className="text-orange-600">
                                                Only {issue.availableStock} available
                                                (you have {issue.requestedQuantity} in cart)
                                            </span>
                                        )}
                                    </p>

                                    {/* Individual Actions */}
                                    <div className="flex gap-2 mt-2">
                                        {issue.issue === 'insufficient_stock' && (
                                            <button
                                                onClick={() => resolveStockIssue(issue.productId, 'update')}
                                                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                            >
                                                Update to {issue.availableStock}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => resolveStockIssue(issue.productId, 'remove')}
                                            className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                        >
                                            Remove
                                        </button>
                                        <button
                                            onClick={() => resolveStockIssue(issue.productId, 'keep')}
                                            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                        >
                                            Keep
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="bg-gray-50 px-4 py-3">
                    <div className="flex gap-2">
                        <button
                            onClick={handleAutoResolve}
                            disabled={isResolving}
                            className="flex-1 px-3 py-2 bg-orange-500 text-white text-sm font-medium rounded hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isResolving ? (
                                <>
                                    <RefreshCw className="animate-spin" size={14} />
                                    Resolving...
                                </>
                            ) : (
                                <>
                                    <ShoppingCart size={14} />
                                    Auto-Resolve All
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleRefresh}
                            className="px-3 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw size={14} />
                            Refresh
                        </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                        Auto-resolve will update quantities to available stock or remove out-of-stock items.
                    </p>
                </div>
            </div>
        </div>
    );
};

// Mini stock status indicator for cart icon
export const CartStockIndicator = () => {
    const { hasStockIssues, stockIssues } = useCartStockMonitor();

    if (!hasStockIssues) return null;

    const outOfStockCount = stockIssues.filter(issue => issue.issue === 'out_of_stock').length;
    const lowStockCount = stockIssues.filter(issue => issue.issue === 'insufficient_stock').length;

    return (
        <div className="absolute -top-1 -right-1">
            <div className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                !
            </div>
            <div className="absolute top-6 right-0 bg-black text-white text-xs p-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {outOfStockCount > 0 && `${outOfStockCount} out of stock`}
                {outOfStockCount > 0 && lowStockCount > 0 && ', '}
                {lowStockCount > 0 && `${lowStockCount} low stock`}
            </div>
        </div>
    );
};

// Hook to integrate with main layout
export const useStockNotifications = () => {
    const { hasStockIssues, stockIssues } = useCartStockMonitor();

    return {
        hasStockIssues,
        issueCount: stockIssues.length,
        outOfStockCount: stockIssues.filter(issue => issue.issue === 'out_of_stock').length,
        lowStockCount: stockIssues.filter(issue => issue.issue === 'insufficient_stock').length
    };
};

export default StockNotifications;