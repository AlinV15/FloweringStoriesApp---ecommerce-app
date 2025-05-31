'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { useCartStore } from '@/app/stores/CartStore';
import {
    CheckCircle,
    Package,
    ArrowRight,
    Loader2,
    AlertCircle
} from 'lucide-react';

export default function SuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { completePurchase } = useCartStore();

    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const sessionId = searchParams.get('session_id');
    const orderId = searchParams.get('order');

    useEffect(() => {
        if (sessionId && orderId) {
            loadOrderAndClearCart();
        } else {
            setError("Missing payment information");
            router.push('/');
        }
    }, [sessionId, orderId]);

    const loadOrderAndClearCart = async () => {
        try {
            await fetchOrderDetails();

            if (completePurchase) {
                await completePurchase();
            }
        } catch (error) {
            setError('Failed to load order details.');

            if (completePurchase) {
                await completePurchase();
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderDetails = async () => {
        const response = await fetch(`/api/order/${orderId}`);
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                setOrder(data.order);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f6eeec] via-[#fefdfc] to-[#f2ded9]">
                <Header />
                <main className="max-w-4xl mx-auto px-4 md:px-6 py-32">
                    <div className="text-center py-16">
                        <Loader2 className="w-12 h-12 mx-auto mb-4 text-[#9a6a63] animate-spin" />
                        <p className="text-[#9a6a63]/70">Processing your order...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f6eeec] via-[#fefdfc] to-[#f2ded9]">
                <Header />
                <main className="max-w-4xl mx-auto px-4 md:px-6 py-32">
                    <div className="text-center py-16">
                        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                        <h1 className="text-2xl font-bold text-[#9a6a63] mb-4">Something went wrong</h1>
                        <p className="text-[#9a6a63]/70 mb-6">We couldn't load your order details.</p>
                        <button
                            onClick={() => router.push('/products')}
                            className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg font-medium"
                            style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}
                        >
                            Continue Shopping
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f6eeec] via-[#fefdfc] to-[#f2ded9]">
            <Header />
            <main className="max-w-4xl mx-auto px-4 md:px-6 py-32">
                {/* Success Message */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <h1 className="text-4xl font-bold text-[#9a6a63] mb-4">Payment Successful!</h1>
                    <p className="text-xl text-[#9a6a63]/70 mb-6">
                        Thank you for your purchase. Your order has been confirmed!
                    </p>

                    {/* Order Information Card */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl p-6 mb-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Package className="text-[#9a6a63]" size={24} />
                            <h2 className="text-xl font-semibold text-[#9a6a63]">Order Details</h2>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-[#9a6a63]/70">Order Number:</span>
                                <span className="font-medium text-[#9a6a63] font-mono">
                                    #{orderId?.slice(-8)}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-[#9a6a63]/70">Payment Status:</span>
                                <span className="font-medium text-green-600 flex items-center gap-1">
                                    <CheckCircle size={14} />
                                    Confirmed
                                </span>
                            </div>

                            {order && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-[#9a6a63]/70">Total Amount:</span>
                                        <span className="font-medium text-[#9a6a63]">
                                            €{order.totalAmount?.toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-[#9a6a63]/70">Delivery Method:</span>
                                        <span className="font-medium text-[#9a6a63] capitalize">
                                            {order.deliveryMethod === 'courier' ? 'Courier Delivery' : 'Store Pickup'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-[#9a6a63]/70">Order Date:</span>
                                        <span className="font-medium text-[#9a6a63]">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* What's Next */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl p-8 mb-8">
                    <h2 className="text-2xl font-semibold text-[#9a6a63] mb-6 text-center">What's Next?</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div className="space-y-3">
                            <div className="w-12 h-12 bg-[#9a6a63] text-white rounded-full flex items-center justify-center mx-auto font-semibold">
                                1
                            </div>
                            <h3 className="font-semibold text-[#9a6a63]">Email Confirmation</h3>
                            <p className="text-sm text-[#9a6a63]/70">
                                You'll receive an email confirmation with your order details shortly.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="w-12 h-12 bg-[#9a6a63] text-white rounded-full flex items-center justify-center mx-auto font-semibold">
                                2
                            </div>
                            <h3 className="font-semibold text-[#9a6a63]">Order Processing</h3>
                            <p className="text-sm text-[#9a6a63]/70">
                                We'll prepare your items and notify you when they're ready.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="w-12 h-12 bg-[#9a6a63] text-white rounded-full flex items-center justify-center mx-auto font-semibold">
                                3
                            </div>
                            <h3 className="font-semibold text-[#9a6a63]">Delivery/Pickup</h3>
                            <p className="text-sm text-[#9a6a63]/70">
                                Your order will be delivered or ready for pickup as selected.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {orderId && (
                        <button
                            onClick={() => router.push(`/order-confirmation/${orderId}`)}
                            className="flex items-center justify-center gap-3 px-8 py-4 border border-[#9a6a63] text-[#9a6a63] rounded-xl hover:bg-[#9a6a63] hover:text-white transition-all font-medium"
                        >
                            <Package size={20} />
                            View Order Details
                        </button>
                    )}

                    <button
                        onClick={() => router.push('/products')}
                        className="flex items-center justify-center gap-3 px-8 py-4 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg font-medium"
                        style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}
                    >
                        Continue Shopping
                        <ArrowRight size={20} />
                    </button>
                </div>

                {/* Thank you message */}
                <div className="text-center mt-8">
                    <p className="text-sm text-[#9a6a63]/70 mb-3">
                        Thank you for shopping with us!
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="text-sm text-[#9a6a63] hover:underline"
                    >
                        Return to Homepage
                    </button>
                </div>
            </main>
            <Footer />
        </div>
    );
}