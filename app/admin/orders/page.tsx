// pages/admin/orders.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Search, Eye, Edit3, Package, User, Mail, RefreshCcw } from 'lucide-react';
import { useShopSettings } from '@/contexts/ShopSettingsContext';
import { useCurrency } from '@/app/hooks/useCurrency';

interface Order {
    _id: string;
    user?: {
        _id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
    } | null;
    guestName?: string;
    guestEmail?: string;
    clientName?: string;
    totalAmount: number;
    status: 'pending' | 'shipped' | 'delivered';
    payment?: {
        status?: string;
        amount?: number;
        currency?: string;
    };
    deliveryMethod?: 'courier' | 'pickup';
    createdAt: string;
    updatedAt: string;
}

const OrdersPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');
    const [filter, setFilter] = useState<string>('all');
    const [paymentFilter, setPaymentFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('newest');
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

    const router = useRouter();
    const { settings } = useShopSettings();
    const { formatPrice } = useCurrency();

    // Get colors from settings
    const primaryColor = settings?.colors?.primary || '#9c6b63';
    // const secondaryColor = settings?.colors?.secondary || '#f5e1dd';
    const accentColor = settings?.colors?.accent || '#fdf4f1';

    // Fetch orders on load
    // Updated fetchOrders function in your OrdersPage component
    useEffect(() => {
        const fetchOrders = async () => {
            console.log('🔍 Starting to fetch orders...');
            setLoading(true);

            try {
                console.log('📡 Making request to /api/order');

                // Add cache busting and explicit headers
                const res = await fetch('/api/order', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    },
                    // Add timestamp to prevent caching
                    cache: 'no-store'
                });

                console.log('📊 Response status:', res.status);
                console.log('📊 Response ok:', res.ok);
                console.log('📊 Response headers:', Object.fromEntries(res.headers.entries()));

                if (res.ok) {
                    const data = await res.json();
                    console.log('✅ Raw API Response:', data);
                    console.log('✅ Response type:', typeof data);
                    console.log('✅ Is array?', Array.isArray(data));

                    if (data.success) {
                        console.log('✅ Success flag is true');
                        console.log('✅ Orders data:', data.orders);
                        console.log('✅ Orders is array?', Array.isArray(data.orders));
                        console.log('✅ Orders length:', data.orders?.length);

                        if (Array.isArray(data.orders)) {
                            console.log('✅ Setting orders:', data.orders);
                            setOrders(data.orders);
                        } else {
                            console.log('❌ Orders is not an array:', data.orders);
                            setOrders([]);
                        }
                    } else {
                        console.log('❌ Success flag is false or missing');
                        console.log('❌ Full response:', data);
                        setOrders([]);
                    }
                } else {
                    console.error('❌ Request failed with status:', res.status);
                    const errorText = await res.text();
                    console.error('❌ Error response:', errorText);
                    setOrders([]);
                }
            } catch (error) {
                console.error("❌ Exception during fetch:", error);
                if (error instanceof Error) {
                    console.error("❌ Error stack:", error.stack);
                }
                setOrders([]);
            } finally {
                console.log('🏁 Fetch completed, setting loading to false');
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const refreshOrders = async () => {
        console.log('🔄 Manual refresh triggered');
        setLoading(true);

        // Force a fresh fetch by adding timestamp
        const timestamp = new Date().getTime();
        try {
            const res = await fetch(`/api/order?t=${timestamp}`, {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                },
                cache: 'no-store'
            });

            if (res.ok) {
                const data = await res.json();
                console.log('🔄 Refresh response:', data);
                if (data.success && Array.isArray(data.orders)) {
                    setOrders(data.orders);
                }
            }
        } catch (error) {
            console.error('🔄 Refresh failed:', error);
        }
        setLoading(false);
    };
    // Filter and sort orders
    const filteredOrders = orders.filter(order => {
        // Status filter
        if (filter !== 'all' && order.status !== filter) return false;

        // Payment filter
        if (paymentFilter !== 'all') {
            if (paymentFilter === 'paid' && order.payment?.status !== 'succeeded') return false;
            if (paymentFilter === 'unpaid' && order.payment?.status === 'succeeded') return false;
        }

        // Search filter
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            const customerName = getCustomerName(order).toLowerCase();
            const orderId = order._id.toLowerCase();
            const email = getCustomerEmail(order).toLowerCase();

            return customerName.includes(searchLower) ||
                orderId.includes(searchLower) ||
                email.includes(searchLower);
        }

        return true;
    }).sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'oldest':
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case 'amount_high':
                return (b.payment?.amount || b.totalAmount) - (a.payment?.amount || a.totalAmount);
            case 'amount_low':
                return (a.payment?.amount || a.totalAmount) - (b.payment?.amount || b.totalAmount);
            default:
                return 0;
        }
    });

    const getCustomerName = (order: Order) => {
        if (order.clientName) return order.clientName;
        if (order.user?.firstName || order.user?.lastName) {
            return `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim();
        }
        if (order.guestName) return order.guestName;
        return getCustomerEmail(order) || 'Anonymous';
    };

    const getCustomerEmail = (order: Order) => {
        return order.user?.email || order.guestEmail || '';
    };

    const getStatusBadge = (status: string) => {
        const configs = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳' },
            shipped: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '🚚' },
            delivered: { bg: 'bg-green-100', text: 'text-green-800', icon: '✅' }
        };

        const config = configs[status as keyof typeof configs] || configs.pending;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                <span className="mr-1">{config.icon}</span>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getPaymentBadge = (payment?: Order['payment']) => {
        if (!payment?.status) return null;

        const configs = {
            succeeded: { bg: 'bg-green-100', text: 'text-green-800', icon: '✓', label: 'Paid' },
            processing: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '⏳', label: 'Processing' },
            requires_payment_method: { bg: 'bg-orange-100', text: 'text-orange-800', icon: '⚠', label: 'Payment Required' },
            canceled: { bg: 'bg-red-100', text: 'text-red-800', icon: '✗', label: 'Canceled' }
        };

        const config = configs[payment.status as keyof typeof configs];
        if (!config) return null;

        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
                <span className="mr-1">{config.icon}</span>
                {config.label}
            </span>
        );
    };

    // Delete order
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            return;
        }

        try {
            const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setOrders(orders.filter(order => order._id !== id));
                setSelectedOrders(selectedOrders.filter(orderId => orderId !== id));
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to delete order');
            }
        } catch (error) {
            console.error("Failed to delete order:", error);
            alert('Failed to delete order');
        }
    };

    // Bulk delete
    const handleBulkDelete = async () => {
        if (selectedOrders.length === 0) return;

        if (!confirm(`Are you sure you want to delete ${selectedOrders.length} orders? This action cannot be undone.`)) {
            return;
        }

        try {
            const deletePromises = selectedOrders.map(id =>
                fetch(`/api/orders/${id}`, { method: 'DELETE' })
            );

            await Promise.all(deletePromises);
            setOrders(orders.filter(order => !selectedOrders.includes(order._id)));
            setSelectedOrders([]);
        } catch (error) {
            console.error("Failed to bulk delete orders:", error);
            alert('Failed to delete some orders');
        }
    };

    // Select/deselect orders
    const toggleOrderSelection = (orderId: string) => {
        setSelectedOrders(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
    };

    const selectAllOrders = () => {
        setSelectedOrders(
            selectedOrders.length === filteredOrders.length
                ? []
                : filteredOrders.map(order => order._id)
        );
    };

    if (loading) {
        return (
            <div className="p-6 text-center">
                <div className="flex flex-col items-center">
                    <div
                        className="w-12 h-12 border-4 border-t-4 rounded-full animate-spin mb-4"
                        style={{
                            borderColor: accentColor,
                            borderTopColor: primaryColor
                        }}
                    ></div>
                    <p
                        className="font-bold text-lg"
                        style={{ color: primaryColor }}
                    >
                        Loading orders...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1
                        className="text-3xl font-bold mb-2"
                        style={{ color: primaryColor }}
                    >
                        Orders Management
                    </h1>
                    <p className="text-gray-600">
                        Manage and track all customer orders ({filteredOrders.length} of {orders.length} orders)
                    </p>
                    <button
                        onClick={refreshOrders}
                        className="ml-4 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : <RefreshCcw />}
                    </button>
                </div>

                {selectedOrders.length > 0 && (
                    <button
                        onClick={handleBulkDelete}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete {selectedOrders.length} orders
                    </button>
                )}
            </div>

            {/* Filters and Search */}
            <div className="mb-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by customer name, email, or order ID..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                            style={{
                                '--tw-ring-color': primaryColor
                            } as React.CSSProperties}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onFocus={(e) => (e.target as HTMLElement).style.borderColor = primaryColor}
                            onBlur={(e) => (e.target as HTMLElement).style.borderColor = '#d1d5db'}
                        />
                    </div>

                    <div className="flex gap-3">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                            style={{
                                '--tw-ring-color': primaryColor
                            } as React.CSSProperties}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                        </select>

                        <select
                            value={paymentFilter}
                            onChange={(e) => setPaymentFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                            style={{
                                '--tw-ring-color': primaryColor
                            } as React.CSSProperties}
                        >
                            <option value="all">All Payments</option>
                            <option value="paid">Paid</option>
                            <option value="unpaid">Unpaid</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                            style={{
                                '--tw-ring-color': primaryColor
                            } as React.CSSProperties}
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="amount_high">Highest Amount</option>
                            <option value="amount_low">Lowest Amount</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead style={{ backgroundColor: primaryColor }}>
                            <tr className="text-white">
                                <th className="px-6 py-4 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                                        onChange={selectAllOrders}
                                        className="rounded"
                                    />
                                </th>
                                <th className="px-6 py-4 text-left font-semibold">Order ID</th>
                                <th className="px-6 py-4 text-left font-semibold">Customer</th>
                                <th className="px-6 py-4 text-left font-semibold">Status</th>
                                <th className="px-6 py-4 text-left font-semibold">Payment</th>
                                <th className="px-6 py-4 text-left font-semibold">Total</th>
                                <th className="px-6 py-4 text-left font-semibold">Date</th>
                                <th className="px-6 py-4 text-left font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                        <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                        <p className="text-lg font-medium mb-2">No orders found</p>
                                        <p className="text-sm">
                                            {search || filter !== 'all' || paymentFilter !== 'all'
                                                ? 'Try adjusting your filters or search terms'
                                                : 'Orders will appear here when customers make purchases'
                                            }
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map(order => (
                                    <tr
                                        key={order._id}
                                        className="hover:bg-gray-50 transition-colors"
                                        style={{
                                            backgroundColor: selectedOrders.includes(order._id) ? accentColor : 'white'
                                        }}
                                    >
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.includes(order._id)}
                                                onChange={() => toggleOrderSelection(order._id)}
                                                className="rounded"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm font-medium">
                                                #{order._id.substring(0, 8)}...
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 mr-3">
                                                    <div
                                                        className="h-8 w-8 rounded-full flex items-center justify-center text-white"
                                                        style={{ backgroundColor: primaryColor }}
                                                    >
                                                        {order.user ? <User className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {getCustomerName(order)}
                                                        {order.user && <span className="ml-1 text-green-600">✓</span>}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {getCustomerEmail(order)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getPaymentBadge(order.payment)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatPrice(order.payment?.amount || order.totalAmount)}
                                            </div>
                                            {order.deliveryMethod && (
                                                <div className="text-xs text-gray-500">
                                                    {order.deliveryMethod === 'pickup' ? '📦 Pickup' : '🚚 Courier'}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/orders/${order._id}`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/admin/orders/${order._id}/edit`}
                                                    className="p-2 hover:bg-gray-50 rounded-lg transition"
                                                    style={{ color: primaryColor }}
                                                    title="Edit Order"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(order._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete Order"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Stats Summary */}
            {orders.length > 0 && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-sm text-gray-500">Total Orders</div>
                        <div className="text-2xl font-bold" style={{ color: primaryColor }}>
                            {orders.length}
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-sm text-gray-500">Pending</div>
                        <div className="text-2xl font-bold text-yellow-600">
                            {orders.filter(o => o.status === 'pending').length}
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-sm text-gray-500">Shipped</div>
                        <div className="text-2xl font-bold text-blue-600">
                            {orders.filter(o => o.status === 'shipped').length}
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-sm text-gray-500">Delivered</div>
                        <div className="text-2xl font-bold text-green-600">
                            {orders.filter(o => o.status === 'delivered').length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;