'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import {
    XCircle,
    ArrowLeft,
    ShoppingCart,
    Home,
    RefreshCcw
} from 'lucide-react';

export default function CancelPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f6eeec] via-[#fefdfc] to-[#f2ded9]">
            <Header />
            <main className="max-w-4xl mx-auto px-4 md:px-6 py-32">
                {/* Cancel Message */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                        <XCircle className="w-12 h-12 text-red-500" />
                    </div>
                    <h1 className="text-4xl font-bold text-[#9a6a63] mb-4">Payment Cancelled</h1>
                    <p className="text-xl text-[#9a6a63]/70 mb-6">
                        Your payment was cancelled. No charges were made to your account.
                    </p>
                </div>

                {/* Information Card */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl p-8 mb-8">
                    <h2 className="text-2xl font-semibold text-[#9a6a63] mb-6 text-center">What happened?</h2>

                    <div className="space-y-4 text-[#9a6a63]/80 mb-8">
                        <p className="flex items-start gap-3">
                            <span className="w-2 h-2 bg-[#9a6a63]/50 rounded-full mt-2 flex-shrink-0"></span>
                            You cancelled the payment process before completion
                        </p>
                        <p className="flex items-start gap-3">
                            <span className="w-2 h-2 bg-[#9a6a63]/50 rounded-full mt-2 flex-shrink-0"></span>
                            Your order has not been placed and no payment was processed
                        </p>
                        <p className="flex items-start gap-3">
                            <span className="w-2 h-2 bg-[#9a6a63]/50 rounded-full mt-2 flex-shrink-0"></span>
                            Your cart items are still saved and ready for checkout
                        </p>
                    </div>

                    <div className="text-center">
                        <p className="text-[#9a6a63]/70 mb-6">
                            Don't worry! You can try again or continue shopping.
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link
                        href="/cart"
                        className="flex items-center justify-center gap-3 px-6 py-4 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg font-medium"
                        style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}
                    >
                        <ShoppingCart size={20} />
                        Return to Cart
                    </Link>

                    <Link
                        href="/checkout"
                        className="flex items-center justify-center gap-3 px-6 py-4 border border-[#9a6a63] text-[#9a6a63] rounded-xl hover:bg-[#9a6a63] hover:text-white transition-all font-medium"
                    >
                        <RefreshCcw size={20} />
                        Try Again
                    </Link>

                    <Link
                        href="/products"
                        className="flex items-center justify-center gap-3 px-6 py-4 border border-[#9a6a63] text-[#9a6a63] rounded-xl hover:bg-[#9a6a63] hover:text-white transition-all font-medium"
                    >
                        <ArrowLeft size={20} />
                        Continue Shopping
                    </Link>
                </div>

                {/* Help Section */}
                <div className="mt-12 bg-blue-50/80 backdrop-blur-sm rounded-2xl border border-blue-200/50 shadow-lg p-6 text-center">
                    <h3 className="font-semibold text-blue-800 mb-3">Need Help?</h3>
                    <p className="text-sm text-blue-700 mb-4">
                        If you're experiencing issues with checkout or have questions about our products,
                        our support team is here to help.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
                        <a
                            href="mailto:support@floweringstories.com"
                            className="text-blue-600 hover:text-blue-800 underline"
                        >
                            support@floweringstories.com
                        </a>
                        <span className="hidden sm:inline text-blue-600">•</span>
                        <a
                            href="tel:+40123456789"
                            className="text-blue-600 hover:text-blue-800 underline"
                        >
                            +40 123 456 789
                        </a>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-[#9a6a63] hover:text-[#9a6a63]/80 transition-colors"
                    >
                        <Home size={16} />
                        <span className="text-sm">Back to Homepage</span>
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    );
}