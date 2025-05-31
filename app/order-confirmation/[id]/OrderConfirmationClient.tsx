'use client';

import { useState } from 'react';
import {
    Calendar,
    Mail,
    MapPin,
    Copy,
    Check
} from 'lucide-react';

interface OrderConfirmationClientProps {
    order: any;
    orderId: string;
}

export function OrderConfirmationClient({ order, orderId }: OrderConfirmationClientProps) {
    const [copied, setCopied] = useState(false);

    const copyOrderNumber = () => {
        navigator.clipboard.writeText(orderId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl p-6 sticky top-4">
                <h3 className="font-semibold text-[#9a6a63] mb-6">Order Summary</h3>

                <div className="space-y-4 text-sm mb-6">
                    <div className="flex justify-between items-center">
                        <span className="text-[#9a6a63]/70">Order Number</span>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-[#9a6a63] text-xs">
                                #{orderId.slice(-8)}
                            </span>
                            <button
                                onClick={copyOrderNumber}
                                className="p-1 hover:bg-[#9a6a63]/10 rounded transition-colors"
                                title="Copy order number"
                            >
                                {copied ? (
                                    <Check size={12} className="text-green-600" />
                                ) : (
                                    <Copy size={12} className="text-[#9a6a63]/70" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-[#9a6a63]/70">Order Date</span>
                        <span className="font-medium text-[#9a6a63]">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-[#9a6a63]/70">Payment Status</span>
                        <span className={`font-medium capitalize ${order.payment?.status === 'succeeded' ? 'text-green-600' : 'text-orange-600'}`}>
                            {order.payment?.status === 'succeeded' ? 'Paid' : 'Processing'}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-[#9a6a63]/70">Order Status</span>
                        <span className="font-medium text-[#9a6a63] capitalize">
                            {order.status}
                        </span>
                    </div>

                    <hr className="border-[#c1a5a2]/30" />

                    <div className="flex justify-between text-lg font-semibold">
                        <span className="text-[#9a6a63]">Total</span>
                        <span className="text-[#9a6a63]">€{order.totalAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                </div>

                {/* Contact Support */}
                <div className="border-t border-[#c1a5a2]/30 pt-4">
                    <h4 className="font-medium text-[#9a6a63] mb-3">Need Help?</h4>
                    <a
                        href={`mailto:support@floweringstories.com?subject=Order ${orderId}`}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[#9a6a63] border border-[#9a6a63] rounded-xl hover:bg-[#9a6a63]/5 transition-colors font-medium text-sm"
                    >
                        <Mail size={16} />
                        Contact Support
                    </a>
                </div>
            </div>

            {/* Estimated Delivery */}
            {order.deliveryMethod === 'courier' && order.payment?.status === 'succeeded' && (
                <div className="bg-blue-50/80 backdrop-blur-sm rounded-2xl border border-blue-200/50 shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <Calendar className="text-blue-600" size={20} />
                        <h4 className="font-medium text-blue-800">Estimated Delivery</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                        Your order will be delivered within 3-5 business days. You'll receive tracking information once your order ships.
                    </p>
                </div>
            )}

            {/* Store Pickup Info */}
            {order.deliveryMethod === 'pickup' && order.payment?.status === 'succeeded' && (
                <div className="bg-green-50/80 backdrop-blur-sm rounded-2xl border border-green-200/50 shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <MapPin className="text-green-600" size={20} />
                        <h4 className="font-medium text-green-800">Store Pickup</h4>
                    </div>
                    <p className="text-sm text-green-700 mb-2">
                        Your order will be ready for pickup within 24 hours. You'll receive a notification when it's ready.
                    </p>
                    <p className="text-xs text-green-600 font-medium">
                        Store Hours: Mon-Fri 9AM-6PM, Sat 10AM-4PM
                    </p>
                </div>
            )}
        </div>
    );
}