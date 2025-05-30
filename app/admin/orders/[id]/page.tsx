// pages/admin/orders/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit3, Package, CreditCard, Truck, User, Mail, MapPin, Phone, Calendar, FileText } from 'lucide-react';
import { useShopSettings } from '@/contexts/ShopSettingsContext';
import { useCurrency } from '@/app/hooks/useCurrency';

interface OrderItem {
    _id: string;
    product: {
        _id: string;
        name: string;
        image?: string;
        price: number;
    };
    quantity: number;
    lineAmount: number;
}

interface Address {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
}

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
    items: OrderItem[];
    address?: Address;
    totalAmount: number;
    status: 'pending' | 'shipped' | 'delivered';
    payment?: {
        status?: string;
        amount?: number;
        currency?: string;
        method?: string;
        stripePaymentIntentId?: string;
    };
    deliveryMethod?: 'courier' | 'pickup';
    paymentMethod?: string;
    note?: string;
    createdAt: string;
    updatedAt: string;
}

const OrderViewPage = () => {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const params = useParams();
    const { settings } = useShopSettings();
    const { formatPrice } = useCurrency();

    const primaryColor = settings?.colors?.primary || '#9c6b63';
    const secondaryColor = settings?.colors?.secondary || '#f5e1dd';
    const accentColor = settings?.colors?.accent || '#fdf4f1';

    useEffect(() => {
        const fetchOrder = async () => {
            if (!params?.id) return;

            try {
                setLoading(true);
                const res = await fetch(`/api/order/${params.id}`);

                if (!res.ok) {
                    throw new Error('Failed to fetch order');
                }

                const orderData = await res.json();
                setOrder(orderData);

            } catch (error) {
                console.error('Error fetching order:', error);
                setError(error instanceof Error ? error.message : 'Failed to fetch order');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [params?.id]);

    const getCustomerName = (order: Order) => {
        if (order.clientName) return order.clientName;
        if (order.user?.firstName || order.user?.lastName) {
            return `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim();
        }
        if (order.guestName) return order.guestName;
        return order.user?.email || order.guestEmail || 'Anonymous';
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
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
                <span className="mr-2">{config.icon}</span>
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
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
                <span className="mr-2">{config.icon}</span>
                {config.label}
            </span>
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
                        Loading order details...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="p-6">
                <div className="max-w-md mx-auto text-center">
                    <Package className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || 'The order you are looking for does not exist.'}</p>
                    <button
                        onClick={() => router.push('/admin/orders')}
                        className="px-6 py-3 text-white rounded-lg transition flex items-center gap-2 mx-auto"
                        style={{ backgroundColor: primaryColor }}
                        onMouseEnter={(e) => (e.target as HTMLElement).style.opacity = '0.9'}
                        onMouseLeave={(e) => (e.target as HTMLElement).style.opacity = '1'}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/admin/orders')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1
                            className="text-3xl font-bold"
                            style={{ color: primaryColor }}
                        >
                            Order #{order._id.substring(0, 8)}...
                        </h1>
                        <p className="text-gray-600">
                            Order details and management
                        </p>
                    </div>
                </div>

                <Link
                    href={`/admin/orders/${order._id}/edit`}
                    className="px-6 py-3 text-white rounded-lg transition flex items-center gap-2"
                    style={{ backgroundColor: primaryColor }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.opacity = '0.9'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.opacity = '1'}
                >
                    <Edit3 className="w-4 h-4" />
                    Edit Order
                </Link>
            </div>

            {/* Status Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Order Status</h3>
                        {getStatusBadge(order.status)}
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Payment Status</h3>
                        {getPaymentBadge(order.payment) || (
                            <span className="text-sm text-gray-400">Unknown</span>
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Total Amount</h3>
                        <p className="text-xl font-bold" style={{ color: primaryColor }}>
                            {formatPrice(order.payment?.amount || order.totalAmount)}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Delivery Method</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.deliveryMethod === 'pickup'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-indigo-100 text-indigo-800'
                            }`}>
                            {order.deliveryMethod === 'pickup' ? '📦 Store Pickup' : '🚚 Courier Delivery'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customer & Shipping Information */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            {order.user ? <User className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                            Customer Information
                        </h3>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Name</label>
                                <p className="text-gray-900 font-medium">{getCustomerName(order)}</p>
                                {order.user && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                                        ✓ Registered User
                                    </span>
                                )}
                            </div>

                            {getCustomerEmail(order) && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Email</label>
                                    <p className="text-gray-900">{getCustomerEmail(order)}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    {order.address && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Shipping Address
                            </h3>

                            <div className="text-gray-900">
                                {order.address.street && <p>{order.address.street}</p>}
                                <p>
                                    {order.address.city && `${order.address.city}, `}
                                    {order.address.state && `${order.address.state} `}
                                    {order.address.postalCode}
                                </p>
                                {order.address.country && <p>{order.address.country}</p>}
                            </div>
                        </div>
                    )}

                    {/* Payment Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Payment Information
                        </h3>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Amount</label>
                                <p className="text-xl font-bold" style={{ color: primaryColor }}>
                                    {formatPrice(order.payment?.amount || order.totalAmount)}
                                </p>
                            </div>

                            {order.payment?.method && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Payment Method</label>
                                    <p className="text-gray-900 capitalize">{order.payment.method}</p>
                                </div>
                            )}

                            {order.paymentMethod && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Selected Method</label>
                                    <p className="text-gray-900 capitalize">{order.paymentMethod}</p>
                                </div>
                            )}

                            {order.payment?.stripePaymentIntentId && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Payment ID</label>
                                    <p className="text-gray-900 font-mono text-sm">{order.payment.stripePaymentIntentId}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Dates */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Timeline
                        </h3>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Order Created</label>
                                <p className="text-gray-900">
                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Last Updated</label>
                                <p className="text-gray-900">
                                    {new Date(order.updatedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Order Notes */}
                    {order.note && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Internal Notes
                            </h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-700 whitespace-pre-wrap">{order.note}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Order Items */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                Order Items ({order.items.length} item{order.items.length !== 1 ? 's' : ''})
                            </h3>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {order.items.map((item) => (
                                <div key={item._id} className="p-6 flex items-center gap-4">
                                    {/* Product Image */}
                                    <div className="flex-shrink-0">
                                        {item.product.image ? (
                                            <img
                                                src={item.product.image}
                                                alt={item.product.name}
                                                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                <Package className="w-6 h-6 text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-lg font-medium text-gray-900 mb-1">
                                            {item.product.name}
                                        </h4>
                                        <p className="text-sm text-gray-500">
                                            Product ID: {item.product._id}
                                        </p>
                                        <div className="mt-2 flex items-center gap-4">
                                            <span className="text-sm font-medium text-gray-700">
                                                Unit Price: {formatPrice(item.product.price)}
                                            </span>
                                            <span className="text-sm font-medium text-gray-700">
                                                Quantity: {item.quantity}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Line Total */}
                                    <div className="text-right">
                                        <p className="text-lg font-bold" style={{ color: primaryColor }}>
                                            {formatPrice(item.lineAmount)}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Line Total
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="p-6 border-t border-gray-200" style={{ backgroundColor: accentColor }}>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700">Subtotal:</span>
                                    <span className="font-medium">
                                        {formatPrice(order.items.reduce((sum, item) => sum + item.lineAmount, 0))}
                                    </span>
                                </div>

                                {/* Calculate potential shipping/fees if different from total */}
                                {order.totalAmount !== order.items.reduce((sum, item) => sum + item.lineAmount, 0) && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Shipping & Fees:</span>
                                        <span className="font-medium">
                                            {formatPrice(order.totalAmount - order.items.reduce((sum, item) => sum + item.lineAmount, 0))}
                                        </span>
                                    </div>
                                )}

                                <hr className="border-gray-300" />
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span style={{ color: primaryColor }}>Total:</span>
                                    <span style={{ color: primaryColor }}>
                                        {formatPrice(order.payment?.amount || order.totalAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6 p-6">
                        <h3 className="text-lg font-semibold mb-6">Order Progress</h3>

                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gray-200"></div>

                            <div className="space-y-6">
                                {/* Order Placed */}
                                <div className="relative flex items-start">
                                    <div
                                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        ✓
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-sm font-medium text-gray-900">Order Placed</h4>
                                        <p className="text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Payment Status */}
                                <div className="relative flex items-start">
                                    <div
                                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${order.payment?.status === 'succeeded' ? 'bg-green-500' :
                                            order.payment?.status === 'processing' ? 'bg-blue-500' :
                                                'bg-gray-400'
                                            }`}
                                    >
                                        {order.payment?.status === 'succeeded' ? '✓' :
                                            order.payment?.status === 'processing' ? '⏳' : '○'}
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-sm font-medium text-gray-900">Payment</h4>
                                        <p className="text-sm text-gray-500">
                                            {order.payment?.status === 'succeeded' ? 'Payment received' :
                                                order.payment?.status === 'processing' ? 'Payment processing' :
                                                    'Payment pending'}
                                        </p>
                                    </div>
                                </div>

                                {/* Order Processing */}
                                <div className="relative flex items-start">
                                    <div
                                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${['shipped', 'delivered'].includes(order.status) ? 'bg-blue-500' :
                                            order.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'
                                            }`}
                                    >
                                        {['shipped', 'delivered'].includes(order.status) ? '✓' :
                                            order.status === 'pending' ? '⏳' : '○'}
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-sm font-medium text-gray-900">Processing</h4>
                                        <p className="text-sm text-gray-500">
                                            {['shipped', 'delivered'].includes(order.status) ? 'Order processed' :
                                                order.status === 'pending' ? 'Processing order' :
                                                    'Awaiting processing'}
                                        </p>
                                    </div>
                                </div>

                                {/* Shipped */}
                                <div className="relative flex items-start">
                                    <div
                                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${['shipped', 'delivered'].includes(order.status) ? 'bg-blue-500' : 'bg-gray-400'
                                            }`}
                                    >
                                        {['shipped', 'delivered'].includes(order.status) ? '✓' : '○'}
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-sm font-medium text-gray-900">
                                            {order.deliveryMethod === 'pickup' ? 'Ready for Pickup' : 'Shipped'}
                                        </h4>
                                        <p className="text-sm text-gray-500">
                                            {['shipped', 'delivered'].includes(order.status) ?
                                                (order.deliveryMethod === 'pickup' ? 'Ready for customer pickup' : 'Order shipped') :
                                                (order.deliveryMethod === 'pickup' ? 'Preparing for pickup' : 'Preparing for shipment')
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* Delivered */}
                                <div className="relative flex items-start">
                                    <div
                                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-400'
                                            }`}
                                    >
                                        {order.status === 'delivered' ? '✓' : '○'}
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-sm font-medium text-gray-900">
                                            {order.deliveryMethod === 'pickup' ? 'Picked Up' : 'Delivered'}
                                        </h4>
                                        <p className="text-sm text-gray-500">
                                            {order.status === 'delivered' ?
                                                (order.deliveryMethod === 'pickup' ? 'Order picked up by customer' : 'Order delivered') :
                                                (order.deliveryMethod === 'pickup' ? 'Awaiting customer pickup' : 'Awaiting delivery')
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 flex justify-between items-center">
                <button
                    onClick={() => router.push('/admin/orders')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Orders
                </button>

                <div className="flex gap-3">
                    <Link
                        href={`/admin/orders/${order._id}/edit`}
                        className="px-6 py-3 border text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                        style={{ borderColor: primaryColor, color: primaryColor }}
                    >
                        <Edit3 className="w-4 h-4" />
                        Edit Order
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderViewPage;