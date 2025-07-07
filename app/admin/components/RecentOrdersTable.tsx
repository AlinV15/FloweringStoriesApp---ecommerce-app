'use client';

import { useEffect, useState } from 'react';
import { Clock, Package, AlertCircle, CheckCircle, User, Mail } from 'lucide-react';
import { useShopSettings } from '@/contexts/ShopSettingsContext';
import { useCurrency } from '@/app/hooks/useCurrency';

interface Order {
    _id: string;
    clientName?: string;
    guestName?: string;
    user?: {
        firstName?: string;
        lastName?: string;
        email?: string;
    } | null;
    guestEmail?: string;
    status: string;
    totalAmount: number;
    payment?: {
        status?: string;
        amount?: number;
        currency?: string;
    } | null;
    deliveryMethod?: string;
    createdAt?: string;
}

export const RecentOrdersTable = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { settings } = useShopSettings();
    const { formatPrice } = useCurrency();

    // Get colors from settings with fallbacks
    const primaryColor = settings?.colors?.primary || '#9c6b63';
    const secondaryColor = settings?.colors?.secondary || '#b4877b';
    const accentColor = settings?.colors?.accent || '#fdf4f1';

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const res = await fetch('/api/admin/recent-orders');

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();

                if (data.error) {
                    throw new Error(data.error);
                }

                setOrders(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch orders:', error);
                setError(error instanceof Error ? error.message : 'Failed to fetch orders');
                setOrders([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'delivered':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium text-xs">
                        <CheckCircle className="h-3 w-3" />
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                );
            case 'pending':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium text-xs">
                        <Clock className="h-3 w-3" /> Pending
                    </span>
                );
            case 'processing':
            case 'shipped':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium text-xs">
                        <Package className="h-3 w-3" />
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                );
            case 'canceled':
            case 'cancelled':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-800 font-medium text-xs">
                        <AlertCircle className="h-3 w-3" /> Canceled
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-medium text-xs">
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                );
        }
    };

    const getPaymentStatusBadge = (paymentStatus?: string) => {
        if (!paymentStatus) return null;

        switch (paymentStatus.toLowerCase()) {
            case 'succeeded':
                return (
                    <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-700 font-medium">
                        ✓ Paid
                    </span>
                );
            case 'processing':
                return (
                    <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700 font-medium">
                        ⏳ Processing
                    </span>
                );
            case 'requires_payment_method':
                return (
                    <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-orange-100 text-orange-700 font-medium">
                        ⚠ Payment Required
                    </span>
                );
            case 'canceled':
                return (
                    <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-red-100 text-red-700 font-medium">
                        ✗ Canceled
                    </span>
                );
            default:
                return (
                    <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700 font-medium">
                        {paymentStatus}
                    </span>
                );
        }
    };

    const formatOrderId = (id: string) => (id.length > 8 ? `#${id.substring(0, 8)}...` : `#${id}`);

    const getClientInfo = (order: Order) => {
        // Priority: explicit clientName > user name > guest name > email
        let displayName = 'Anonymous Customer';
        let email = '';
        let isRegistered = false;

        if (order.clientName) {
            displayName = order.clientName;
        } else if (order.user?.firstName || order.user?.lastName) {
            displayName = `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim();
            isRegistered = true;
        } else if (order.guestName) {
            displayName = order.guestName;
        }

        // Get email
        if (order.user?.email) {
            email = order.user.email;
            isRegistered = true;
        } else if (order.guestEmail) {
            email = order.guestEmail;
        }

        // If no name found, use email as name
        if (displayName === 'Anonymous Customer' && email) {
            displayName = email;
        }

        return { displayName, email, isRegistered };
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays === 0) {
            if (diffHours === 0) {
                const diffMinutes = Math.floor(diffMs / (1000 * 60));
                return diffMinutes < 1 ? 'Just now' : `${diffMinutes}m ago`;
            }
            return `${diffHours}h ago`;
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays}d ago`;
        } else {
            return new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                year: diffDays > 365 ? 'numeric' : undefined
            }).format(date);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white shadow rounded-xl p-8 flex justify-center items-center h-64">
                <div className="flex flex-col items-center">
                    <div
                        className="w-12 h-12 border-4 border-t-4 rounded-full animate-spin"
                        style={{
                            borderColor: `${accentColor}`,
                            borderTopColor: primaryColor
                        }}
                    ></div>
                    <p
                        className="mt-4 font-medium"
                        style={{ color: primaryColor }}
                    >
                        Loading orders...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white shadow rounded-xl p-8 flex justify-center items-center h-64">
                <div className="flex flex-col items-center text-center">
                    <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
                    <p className="text-red-600 font-medium mb-2">Error loading orders</p>
                    <p className="text-sm text-gray-500 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 text-white rounded-lg transition"
                        style={{ backgroundColor: primaryColor }}
                        onMouseEnter={(e) => (e.target as HTMLElement).style.opacity = '0.9'}
                        onMouseLeave={(e) => (e.target as HTMLElement).style.opacity = '1'}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="bg-white shadow rounded-xl p-8 flex justify-center items-center h-64">
                <div className="flex flex-col items-center text-gray-500 text-center">
                    <Package className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="font-medium mb-2">No recent orders found</p>
                    <p className="text-sm text-gray-400">Orders will appear here once customers start purchasing</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-md rounded-2xl overflow-hidden border border-gray-100">
            <div
                className="px-6 py-4 border-b border-gray-100"
                style={{
                    background: `linear-gradient(to right, ${accentColor}, ${settings?.colors?.accent || '#fceae6'})`
                }}
            >
                <h3
                    className="font-semibold text-lg"
                    style={{ color: primaryColor }}
                >
                    Recent Orders
                </h3>
                <p
                    className="text-sm"
                    style={{ color: secondaryColor }}
                >
                    Latest customer transactions ({orders.length} orders)
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Order ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Total
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Delivery
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {orders.map((order) => {
                            const clientInfo = getClientInfo(order);
                            return (
                                <tr
                                    key={order._id}
                                    className="transition-colors duration-200 cursor-pointer"
                                    style={{ backgroundColor: 'white' }}
                                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = accentColor}
                                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'white'}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-semibold text-gray-800">
                                            {formatOrderId(order._id)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8">
                                                <div
                                                    className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium text-white"
                                                    style={{ backgroundColor: primaryColor }}
                                                >
                                                    {clientInfo.isRegistered ? (
                                                        <User className="h-4 w-4" />
                                                    ) : (
                                                        <Mail className="h-4 w-4" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {clientInfo.displayName}
                                                    {clientInfo.isRegistered && (
                                                        <span className="ml-1 text-xs text-green-600 font-medium">✓</span>
                                                    )}
                                                </div>
                                                {clientInfo.email && clientInfo.email !== clientInfo.displayName && (
                                                    <div className="text-xs text-gray-500">{clientInfo.email}</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            {getStatusBadge(order.status)}
                                            {getPaymentStatusBadge(order.payment?.status)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        <div className="flex flex-col">
                                            <span>{formatPrice(order.payment?.amount || order.totalAmount || 0)}</span>
                                            {order.payment?.currency && order.payment.currency !== (settings?.currency?.toLowerCase() || 'eur') && (
                                                <span className="text-xs text-gray-500">
                                                    Original: {order.payment.currency.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(order.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.deliveryMethod === 'pickup'
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'bg-indigo-100 text-indigo-800'
                                            }`}>
                                            {order.deliveryMethod === 'pickup' ? '📦 Pickup' : '🚚 Courier'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-right">
                <button
                    className="text-sm font-medium transition-colors"
                    style={{ color: primaryColor }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.opacity = '0.8'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.opacity = '1'}
                >
                    View All Orders →
                </button>
            </div>
        </div>
    );
};