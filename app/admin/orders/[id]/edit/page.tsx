// pages/admin/orders/[id]/edit.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Save, ArrowLeft, Package, CreditCard, User, Mail } from 'lucide-react';
import { useShopSettings } from '@/contexts/ShopSettingsContext';
import { useCurrency } from '@/app/hooks/useCurrency';
import toast from 'react-hot-toast';

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
        method?: string;
    };
    deliveryMethod?: 'courier' | 'pickup';
    note?: string;
    createdAt: string;
    updatedAt: string;
}

const OrderEditPage = () => {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [status, setStatus] = useState<'pending' | 'shipped' | 'delivered'>('pending');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState<'courier' | 'pickup'>('courier');
    const [note, setNote] = useState('');

    const router = useRouter();
    const params = useParams();
    const { settings } = useShopSettings();
    const { formatPrice } = useCurrency();

    const primaryColor = settings?.colors?.primary || '#9c6b63';
    //const secondaryColor = settings?.colors?.secondary || '#f5e1dd';
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

                // Set form initial values
                setStatus(orderData.status || 'pending');
                setPaymentStatus(orderData.payment?.status || '');
                setDeliveryMethod(orderData.deliveryMethod || 'courier');
                setNote(orderData.note || '');

            } catch (error) {
                console.error('Error fetching order:', error);
                const errorMessage = error instanceof Error ? error.message : 'Failed to fetch order';
                setError(errorMessage);
                toast.error('Failed to load order', {
                    duration: 4000,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [params?.id]);

    const handleSave = async () => {
        if (!order) return;

        // Show loading toast
        const loadingToast = toast.loading('Saving order changes...', {
            style: {
                borderRadius: '8px',
                background: '#333',
                color: '#fff',
            },
        });

        try {
            setSaving(true);
            setError(null);

            const updateData = {
                status,
                deliveryMethod,
                note: note.trim() || undefined,
                // Only include payment status if it has changed
                ...(paymentStatus && paymentStatus !== order.payment?.status && {
                    payment: {
                        ...order.payment,
                        status: paymentStatus
                    }
                })
            };

            const res = await fetch(`/api/order/${order._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to update order');
            }

            const updatedOrder = await res.json();
            setOrder(updatedOrder);

            // Dismiss loading toast and show success
            toast.dismiss(loadingToast);
            toast.success('Order updated successfully!', {
                duration: 4000,
                style: {
                    borderRadius: '8px',
                    background: '#10b981',
                    color: '#fff',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#10b981',
                },
            });

            // Redirect after a short delay to allow user to see the success message
            setTimeout(() => {
                router.push('/admin/orders');
            }, 1500);

        } catch (error) {
            console.error('Error updating order:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to update order';
            setError(errorMessage);

            // Dismiss loading toast and show error
            toast.dismiss(loadingToast);
            toast.error('Failed to update order', {
                duration: 6000,
                style: {
                    borderRadius: '8px',
                    background: '#ef4444',
                    color: '#fff',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#ef4444',
                },
            });
        } finally {
            setSaving(false);
        }
    };

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

    // Quick action handlers with toast feedback
    const handleQuickAction = (newStatus: 'shipped' | 'delivered', newPaymentStatus: string) => {
        setStatus(newStatus);
        setPaymentStatus(newPaymentStatus);

        toast.success(`Order marked as ${newStatus} & paid`, {
            duration: 2000,
            style: {
                borderRadius: '8px',
                background: primaryColor,
                color: '#fff',
            },
        });
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
                        Loading order...
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
        <div className="p-6 max-w-4xl mx-auto">
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
                            Edit Order #{order._id.substring(0, 8)}...
                        </h1>
                        <p className="text-gray-600">
                            Update order status and delivery information
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 text-white rounded-lg transition flex items-center gap-2 disabled:opacity-50"
                    style={{ backgroundColor: primaryColor }}
                    onMouseEnter={(e) => !saving && ((e.target as HTMLElement).style.opacity = '0.9')}
                    onMouseLeave={(e) => !saving && ((e.target as HTMLElement).style.opacity = '1')}
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customer Information */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            {order.user ? <User className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                            Customer Information
                        </h3>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Name</label>
                                <p className="text-gray-900">{getCustomerName(order)}</p>
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

                            <div>
                                <label className="text-sm font-medium text-gray-700">Order Date</label>
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

                    {/* Payment Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Payment Information
                        </h3>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Total Amount</label>
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

                            <div>
                                <label className="text-sm font-medium text-gray-700">Current Payment Status</label>
                                <p className="text-gray-900 capitalize">
                                    {order.payment?.status || 'Unknown'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Management */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Order Management
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Order Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Order Status
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => {
                                        const newStatus = e.target.value as 'pending' | 'shipped' | 'delivered';
                                        setStatus(newStatus);
                                        toast.success(`Status changed to ${newStatus}`, {
                                            duration: 2000,
                                            style: { borderRadius: '8px' },
                                        });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                                    style={{
                                        '--tw-ring-color': primaryColor
                                    } as React.CSSProperties}
                                >
                                    <option value="pending">📦 Pending</option>
                                    <option value="shipped">🚚 Shipped</option>
                                    <option value="delivered">✅ Delivered</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Current: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </p>
                            </div>

                            {/* Payment Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Status
                                </label>
                                <select
                                    value={paymentStatus}
                                    onChange={(e) => {
                                        setPaymentStatus(e.target.value);
                                        if (e.target.value) {
                                            toast.success(`Payment status changed to ${e.target.value}`, {
                                                duration: 2000,
                                                style: { borderRadius: '8px' },
                                            });
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                                    style={{
                                        '--tw-ring-color': primaryColor
                                    } as React.CSSProperties}
                                >
                                    <option value="">Keep Current</option>
                                    <option value="succeeded">✓ Succeeded</option>
                                    <option value="processing">⏳ Processing</option>
                                    <option value="requires_payment_method">⚠ Requires Payment Method</option>
                                    <option value="canceled">✗ Canceled</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Current: {order.payment?.status || 'Unknown'}
                                </p>
                            </div>

                            {/* Delivery Method */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Delivery Method
                                </label>
                                <select
                                    value={deliveryMethod}
                                    onChange={(e) => {
                                        const newMethod = e.target.value as 'courier' | 'pickup';
                                        setDeliveryMethod(newMethod);
                                        toast.success(`Delivery method changed to ${newMethod}`, {
                                            duration: 2000,
                                            style: { borderRadius: '8px' },
                                        });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                                    style={{
                                        '--tw-ring-color': primaryColor
                                    } as React.CSSProperties}
                                >
                                    <option value="courier">🚚 Courier Delivery</option>
                                    <option value="pickup">📦 Store Pickup</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Current: {order.deliveryMethod === 'pickup' ? 'Store Pickup' : 'Courier Delivery'}
                                </p>
                            </div>

                            {/* Quick Actions */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quick Actions
                                </label>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => handleQuickAction('shipped', 'succeeded')}
                                        className="w-full px-3 py-2 text-sm border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition"
                                    >
                                        Mark as Shipped & Paid
                                    </button>
                                    <button
                                        onClick={() => handleQuickAction('delivered', 'succeeded')}
                                        className="w-full px-3 py-2 text-sm border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition"
                                    >
                                        Mark as Delivered & Paid
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Order Notes */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Order Notes (Internal)
                            </label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Add internal notes about this order (not visible to customer)..."
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition resize-none"
                                style={{
                                    '--tw-ring-color': primaryColor
                                } as React.CSSProperties}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                These notes are for internal use only and will not be shown to the customer.
                            </p>
                        </div>

                        {/* Status Timeline */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Status Timeline</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${order.status === 'pending' ? 'bg-yellow-400' : 'bg-gray-300'
                                        }`}></div>
                                    <span className="text-sm text-gray-600">Order Pending</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${['shipped', 'delivered'].includes(order.status) ? 'bg-blue-400' : 'bg-gray-300'
                                        }`}></div>
                                    <span className="text-sm text-gray-600">Order Shipped</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${order.status === 'delivered' ? 'bg-green-400' : 'bg-gray-300'
                                        }`}></div>
                                    <span className="text-sm text-gray-600">Order Delivered</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end gap-4">
                <button
                    onClick={() => {
                        toast.success('Changes discarded', { duration: 2000 });
                        router.push('/admin/orders');
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 text-white rounded-lg transition flex items-center gap-2 disabled:opacity-50"
                    style={{ backgroundColor: primaryColor }}
                    onMouseEnter={(e) => !saving && ((e.target as HTMLElement).style.opacity = '0.9')}
                    onMouseLeave={(e) => !saving && ((e.target as HTMLElement).style.opacity = '1')}
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving Changes...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

export default OrderEditPage;