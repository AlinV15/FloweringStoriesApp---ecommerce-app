'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    CardElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { useCartStore } from '@/app/stores/CartStore';
import {
    Lock,
    CreditCard,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
    Loader2
} from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
    clientSecret: string;
    orderId: string;
    onSuccess: () => void;
    onError: (error: string) => void;
}

function PaymentForm({ clientSecret, orderId, onSuccess, onError }: PaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [cardComplete, setCardComplete] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
            return;
        }

        setLoading(true);

        try {
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                }
            });

            if (error) {
                onError(error.message || 'Payment failed');
            } else if (paymentIntent.status === 'succeeded') {
                // Confirm payment on backend
                const confirmResponse = await fetch('/api/payments/confirm', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        paymentIntentId: paymentIntent.id,
                        orderId: orderId
                    }),
                });

                if (confirmResponse.ok) {
                    onSuccess();
                } else {
                    onError('Payment confirmation failed');
                }
            }
        } catch (err) {
            onError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const cardElementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#9a6a63',
                fontFamily: '"Inter", sans-serif',
                '::placeholder': {
                    color: '#9a6a63',
                    opacity: '0.6'
                },
                iconColor: '#9a6a63',
            },
            invalid: {
                color: '#dc2626',
                iconColor: '#dc2626',
            },
        },
        hidePostalCode: false,
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-[#9a6a63]/10 rounded-lg">
                        <CreditCard className="text-[#9a6a63]" size={20} />
                    </div>
                    <h2 className="text-xl font-semibold text-[#9a6a63]">Payment Details</h2>
                </div>

                <div className="p-4 border border-[#c1a5a2]/30 rounded-xl bg-white">
                    <CardElement
                        options={cardElementOptions}
                        onChange={(event: any) => {
                            setCardComplete(event.complete);
                        }}
                    />
                </div>

                <div className="mt-6 p-4 bg-blue-50/80 backdrop-blur-sm rounded-xl border border-blue-200/50">
                    <div className="flex items-center gap-2 text-blue-800 mb-2">
                        <Lock size={16} />
                        <span className="font-medium">Secure Payment</span>
                    </div>
                    <p className="text-sm text-blue-700">
                        Your payment information is encrypted and processed securely through Stripe.
                    </p>
                </div>
            </div>

            <button
                type="submit"
                disabled={!stripe || loading || !cardComplete}
                className={`w-full flex items-center justify-center gap-3 px-6 py-4 text-white rounded-xl font-medium transition-all ${loading || !cardComplete
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'transform hover:scale-105 shadow-lg'
                    }`}
                style={!loading && cardComplete ? { background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' } : {}}
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        Processing Payment...
                    </>
                ) : (
                    <>
                        <Lock size={20} />
                        Complete Payment
                    </>
                )}
            </button>
        </form>
    );
}

export default function PaymentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { clearCart } = useCartStore();

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    const orderId = searchParams.get('order_id');
    const clientSecret = searchParams.get('client_secret');

    useEffect(() => {
        if (!orderId || !clientSecret) {
            router.push('/cart');
            return;
        }

        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            const response = await fetch(`/api/orders?id=${orderId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch order');
            }
            const data = await response.json();
            setOrder(data.order);
        } catch (err) {
            setError('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = () => {
        setPaymentSuccess(true);
        clearCart(); // Clear cart after successful payment

        // Redirect to success page after 3 seconds
        setTimeout(() => {
            router.push(`/order-confirmation/${orderId}`);
        }, 3000);
    };

    const handlePaymentError = (errorMessage: string) => {
        setPaymentError(errorMessage);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f6eeec] via-[#fefdfc] to-[#f2ded9]">
                <Header />
                <main className="max-w-4xl mx-auto px-4 md:px-6 py-32">
                    <div className="text-center py-16">
                        <Loader2 className="w-12 h-12 mx-auto mb-4 text-[#9a6a63] animate-spin" />
                        <p className="text-[#9a6a63]/70">Loading payment details...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f6eeec] via-[#fefdfc] to-[#f2ded9]">
                <Header />
                <main className="max-w-4xl mx-auto px-4 md:px-6 py-32">
                    <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl">
                        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                        <h1 className="text-2xl font-bold text-[#9a6a63] mb-4">Payment Error</h1>
                        <p className="text-[#9a6a63]/70 mb-6">{error || 'Order not found'}</p>
                        <button
                            onClick={() => router.push('/cart')}
                            className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg font-medium"
                            style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}
                        >
                            <ArrowLeft size={16} />
                            Back to Cart
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (paymentSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f6eeec] via-[#fefdfc] to-[#f2ded9]">
                <Header />
                <main className="max-w-4xl mx-auto px-4 md:px-6 py-32">
                    <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl">
                        <CheckCircle className="w-20 h-20 mx-auto mb-6 text-green-500" />
                        <h1 className="text-3xl font-bold text-[#9a6a63] mb-4">Payment Successful!</h1>
                        <p className="text-[#9a6a63]/70 mb-6">
                            Your order has been confirmed. You will receive an email confirmation shortly.
                        </p>
                        <div className="text-sm text-[#9a6a63]/70">
                            Redirecting to order confirmation...
                        </div>
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
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-[#9a6a63] hover:text-[#9a6a63]/80 transition-colors mb-4"
                    >
                        <ArrowLeft size={16} />
                        <span className="text-sm">Back</span>
                    </button>
                    <h1 className="text-4xl font-bold text-[#9a6a63] mb-2">Complete Payment</h1>
                    <p className="text-[#9a6a63]/70">Order #{order._id.slice(-8)}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Payment Form */}
                    <div className="lg:col-span-2">
                        {paymentError && (
                            <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm rounded-xl border border-red-200/50">
                                <div className="flex items-center gap-2 text-red-800 mb-2">
                                    <AlertCircle size={16} />
                                    <span className="font-medium">Payment Failed</span>
                                </div>
                                <p className="text-sm text-red-700">{paymentError}</p>
                            </div>
                        )}

                        <Elements stripe={stripePromise}>
                            <PaymentForm
                                clientSecret={clientSecret!}
                                orderId={orderId!}
                                onSuccess={handlePaymentSuccess}
                                onError={handlePaymentError}
                            />
                        </Elements>
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-6">
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl p-6 sticky top-4">
                            <h3 className="font-semibold text-[#9a6a63] mb-6">Order Summary</h3>

                            {/* Order Items */}
                            <div className="space-y-4 mb-6">
                                {order.items?.map((orderItem: any) => (
                                    <div key={orderItem._id} className="flex gap-3">
                                        <div className="relative w-12 h-12 flex-shrink-0">
                                            <img
                                                src={orderItem.product?.image || '/placeholder.jpg'}
                                                alt={orderItem.product?.name || 'Product'}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                            <div className="absolute -top-2 -right-2 bg-[#9a6a63] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                {orderItem.quantity}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-[#9a6a63] truncate">
                                                {orderItem.product?.name || 'Product'}
                                            </h4>
                                            <p className="text-xs text-[#9a6a63]/70 capitalize">
                                                {orderItem.product?.type || 'Item'}
                                            </p>
                                            <div className="text-sm font-semibold text-[#9a6a63] mt-1">
                                                €{orderItem.lineAmount?.toFixed(2) || '0.00'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <hr className="border-[#c1a5a2]/30 mb-4" />

                            {/* Order Details */}
                            <div className="space-y-2 text-sm mb-4">
                                <div className="flex justify-between">
                                    <span className="text-[#9a6a63]/70">Delivery Method</span>
                                    <span className="font-medium text-[#9a6a63] capitalize">
                                        {order.deliveryMethod === 'courier' ? 'Courier Delivery' : 'Store Pickup'}
                                    </span>
                                </div>

                                {order.address && (
                                    <div className="text-xs text-[#9a6a63]/70 mt-2">
                                        <div>{order.address.street}</div>
                                        <div>{order.address.city}, {order.address.postalCode}</div>
                                        <div>{order.address.country}</div>
                                    </div>
                                )}
                            </div>

                            <hr className="border-[#c1a5a2]/30 mb-4" />

                            {/* Total */}
                            <div className="flex justify-between text-lg font-semibold">
                                <span className="text-[#9a6a63]">Total</span>
                                <span className="text-[#9a6a63]">€{order.totalAmount?.toFixed(2) || '0.00'}</span>
                            </div>
                        </div>

                        {/* Support Info */}
                        <div className="bg-blue-50/80 backdrop-blur-sm rounded-2xl border border-blue-200/50 shadow-lg p-6">
                            <h4 className="font-medium text-blue-800 mb-2">Need Help?</h4>
                            <p className="text-sm text-blue-700 mb-3">
                                If you're experiencing issues with payment, please contact our support team.
                            </p>
                            <a
                                href="mailto:support@floweringstories.com"
                                className="text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                                support@floweringstories.com
                            </a>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}