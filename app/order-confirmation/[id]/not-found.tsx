// app/order-confirmation/[id]/not-found.tsx
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { AlertCircle, ArrowLeft } from 'lucide-react';

// This MUST be the default export for Next.js not-found pages
export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f6eeec] via-[#fefdfc] to-[#f2ded9]">
            <Header />
            <main className="max-w-4xl mx-auto px-4 md:px-6 py-32">
                <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <h1 className="text-2xl font-bold text-[#9a6a63] mb-4">Order Not Found</h1>
                    <p className="text-[#9a6a63]/70 mb-6">
                        We couldn't find the order you're looking for. It may have been removed or the link is incorrect.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg font-medium"
                            style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}
                        >
                            Continue Shopping
                        </Link>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 text-[#9a6a63] border border-[#9a6a63] rounded-xl hover:bg-[#9a6a63]/5 transition-colors font-medium"
                        >
                            <ArrowLeft size={16} />
                            Back to Home
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}