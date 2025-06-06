import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { OrderConfirmationClient } from './OrderConfirmationClient';
import {

    Package,
    Truck,
    MapPin,

    Mail,
    Phone,
    ArrowLeft,
    Clock,
} from 'lucide-react';

// Fetch order data on server
// Fetch order data on server - FIXED
async function getOrder(orderId: string) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/order/${orderId}`, {
            cache: 'no-store', // Always fetch fresh data for orders
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('API Error:', response.status, response.statusText);
            return null;
        }

        const data = await response.json();


        return data;
    } catch (error) {
        console.error('Error fetching order:', error);
        return null;
    }
}
// Updated OrderConfirmationPage component and generateMetadata function

// Server component
export default async function OrderConfirmationPage({
    params
}: {
    params: Promise<{ id: string }> // Change this type
}) {
    // Await params before using
    const { id } = await params;
    const order = await getOrder(id);

    if (!order) {
        notFound();
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'succeeded':
                return 'text-green-600 bg-green-50';
            case 'pending':
                return 'text-orange-600 bg-orange-50';
            case 'shipped':
                return 'text-blue-600 bg-blue-50';
            case 'delivered':
                return 'text-green-600 bg-green-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusText = (paymentStatus: string, orderStatus: string) => {
        if (paymentStatus === 'succeeded') {
            switch (orderStatus) {
                case 'pending':
                    return 'Order Confirmed';
                case 'shipped':
                    return 'Order Shipped';
                case 'delivered':
                    return 'Order Delivered';
                default:
                    return 'Order Confirmed';
            }
        } else {
            return 'Payment Processing';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f6eeec] via-[#fefdfc] to-[#f2ded9]">
            <Header />
            <main className="max-w-6xl mx-auto px-4 md:px-6 py-32">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 text-[#9a6a63] hover:text-[#9a6a63]/80 transition-colors mb-4"
                    >
                        <ArrowLeft size={16} />
                        <span className="text-sm">Continue Shopping</span>
                    </Link>
                    <div className="flex items-center gap-4 mb-4">
                        <h1 className="text-4xl font-bold text-[#9a6a63]">Order Details</h1>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.payment?.status)}`}>
                            {getStatusText(order.payment?.status, order.status)}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Order Items */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-[#9a6a63]/10 rounded-lg">
                                    <Package className="text-[#9a6a63]" size={20} />
                                </div>
                                <h2 className="text-xl font-semibold text-[#9a6a63]">Items Ordered</h2>
                            </div>

                            <div className="space-y-4">
                                {order.items?.map((orderItem: any) => (
                                    <div key={orderItem._id} className="flex gap-4 p-4 border border-[#c1a5a2]/20 rounded-xl hover:bg-[#9a6a63]/5 transition-colors">
                                        <div className="relative w-20 h-20 flex-shrink-0">
                                            <Image
                                                src={orderItem.product?.image || '/placeholder.jpg'}
                                                alt={orderItem.product?.name || 'Product'}
                                                fill
                                                className="object-cover rounded-lg"
                                                priority={false}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-[#9a6a63] mb-1">
                                                {orderItem.product?.name || 'Product'}
                                            </h3>
                                            <p className="text-sm text-[#9a6a63]/70 capitalize mb-2">
                                                {orderItem.product?.type || 'Item'}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-[#9a6a63]/70">
                                                    Quantity: {orderItem.quantity}
                                                </span>
                                                <span className="font-semibold text-[#9a6a63] text-lg">
                                                    €{orderItem.lineAmount?.toFixed(2) || '0.00'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-[#9a6a63]/10 rounded-lg">
                                    <Mail className="text-[#9a6a63]" size={20} />
                                </div>
                                <h2 className="text-xl font-semibold text-[#9a6a63]">Contact Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-medium text-[#9a6a63] mb-3">Customer Details</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-[#9a6a63]">Name:</span>
                                            <span className="text-[#9a6a63]/70">
                                                {order.customer?.firstName} {order.customer?.lastName}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail size={14} className="text-[#9a6a63]/70" />
                                            <span className="text-[#9a6a63]/70">
                                                {order.customer?.email || order.guestEmail}
                                            </span>
                                        </div>
                                        {order.customer?.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone size={14} className="text-[#9a6a63]/70" />
                                                <span className="text-[#9a6a63]/70">{order.customer.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium text-[#9a6a63] mb-3">Delivery Method</h3>
                                    <div className="flex items-center gap-2 text-sm">
                                        {order.deliveryMethod === 'courier' ? (
                                            <>
                                                <Truck size={14} className="text-[#9a6a63]/70" />
                                                <span className="text-[#9a6a63]/70">Courier Delivery</span>
                                            </>
                                        ) : (
                                            <>
                                                <MapPin size={14} className="text-[#9a6a63]/70" />
                                                <span className="text-[#9a6a63]/70">Store Pickup</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Address */}
                        {order.address && order.deliveryMethod === 'courier' && (
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-[#9a6a63]/10 rounded-lg">
                                        <MapPin className="text-[#9a6a63]" size={20} />
                                    </div>
                                    <h2 className="text-xl font-semibold text-[#9a6a63]">Delivery Address</h2>
                                </div>

                                <div className="bg-[#9a6a63]/5 rounded-xl p-4">
                                    <div className="text-[#9a6a63]/70 space-y-1">
                                        <div className="font-medium text-[#9a6a63]">
                                            {order.customer?.firstName} {order.customer?.lastName}
                                        </div>
                                        <div>{order.address.street}</div>
                                        {order.address.details && <div>{order.address.details}</div>}
                                        <div>{order.address.city}, {order.address.postalCode}</div>
                                        {order.address.state && <div>{order.address.state}</div>}
                                        <div>{order.address.country}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Order Notes */}
                        {order.note && (
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl p-6">
                                <h3 className="font-semibold text-[#9a6a63] mb-3 flex items-center gap-2">
                                    <Clock size={18} />
                                    Order Notes
                                </h3>
                                <p className="text-[#9a6a63]/70 text-sm bg-[#9a6a63]/5 p-4 rounded-xl">
                                    {order.note}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Order Summary Sidebar - Client Component for interactive features */}
                    <Suspense fallback={
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl p-6">
                            <div className="animate-pulse space-y-4">
                                <div className="h-6 bg-gray-200 rounded"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        </div>
                    }>
                        <OrderConfirmationClient order={order} orderId={id} />
                    </Suspense>
                </div>
            </main>
            <Footer />
        </div>
    );
}

// Generate metadata for SEO - ALSO needs to await params
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params; // Await params here too
    const order = await getOrder(id);

    if (!order) {
        return {
            title: 'Order Not Found | Flowering Stories',
            description: 'The order you are looking for could not be found.',
        };
    }

    return {
        title: `Order #${id.slice(-8)} | Flowering Stories`,
        description: `Order confirmation for your purchase on ${new Date(order.createdAt).toLocaleDateString()}`,
        robots: 'noindex, nofollow', // Don't index order pages for privacy
    };
}