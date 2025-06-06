'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { useCartStore } from '@/app/stores/CartStore';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, ArrowRight, Package } from 'lucide-react';

export default function CartPage() {
    const {
        items,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        getTotalDiscount
    } = useCartStore();

    const [promoCode, setPromoCode] = useState('');
    const [promoDiscount, setPromoDiscount] = useState(0);

    const totalItems = getTotalItems();
    const subtotal = getTotalPrice();
    const totalDiscount = getTotalDiscount();
    const shipping = subtotal > 100 ? 0 : 15; // Free shipping over €100
    const finalTotal = subtotal - promoDiscount + shipping;

    const handleQuantityChange = (id: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        updateQuantity(id, newQuantity);
    };

    const handleApplyPromo = () => {
        // Simple promo code logic - you can enhance this
        const validCodes: { [key: string]: number } = {
            'SAVE10': 10,
            'WELCOME15': 15,
            'STUDENT20': 20
        };

        if (validCodes[promoCode.toUpperCase()]) {
            setPromoDiscount(validCodes[promoCode.toUpperCase()]);
        } else {
            alert('Invalid promo code');
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f6eeec] via-[#fefdfc] to-[#f2ded9]">
                <Header />
                <main className="max-w-4xl mx-auto px-4 md:px-6 py-32">
                    <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl">
                        <ShoppingCart className="w-24 h-24 mx-auto mb-6 text-[#9a6a63]/50" />
                        <h1 className="text-3xl font-bold text-[#9a6a63] mb-4">Your cart is empty</h1>
                        <p className="text-[#9a6a63]/70 mb-8 text-lg">Add some beautiful products to get started!</p>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-3 px-8 py-4 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg font-medium"
                            style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}
                        >
                            <ArrowLeft size={20} />
                            Continue Shopping
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f6eeec] via-[#fefdfc] to-[#f2ded9]">
            <Header />
            <main className="max-w-7xl mx-auto px-4 md:px-6 py-32">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 text-[#9a6a63] hover:text-[#9a6a63]/80 transition-colors mb-4"
                    >
                        <ArrowLeft size={16} />
                        <span className="text-sm">Continue Shopping</span>
                    </Link>
                    <h1 className="text-4xl font-bold text-[#9a6a63] mb-2">Shopping Cart</h1>
                    <p className="text-[#9a6a63]/70">{totalItems} item{totalItems !== 1 ? 's' : ''} in your cart</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl overflow-hidden">
                            <div className="p-6 border-b border-[#c1a5a2]/20">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-[#9a6a63]">Cart Items</h2>
                                    <button
                                        onClick={() => clearCart()}
                                        className="text-sm text-red-500 hover:text-red-700 transition"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>

                            <div className="divide-y divide-[#c1a5a2]/20">
                                {items.map((item) => (
                                    <div key={item.id} className="p-6 hover:bg-[#9a6a63]/5 transition-colors">
                                        <div className="flex gap-6">
                                            {/* Product Image */}
                                            <div className="relative w-24 h-24 flex-shrink-0">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover rounded-xl"
                                                />
                                                {item.discount > 0 && (
                                                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                                        -{item.discount}%
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Details */}
                                            <div className="flex-1 min-w-0">
                                                <Link href={`/products/${item.id}`} className="group">
                                                    <h3 className="font-semibold text-[#9a6a63] group-hover:text-[#9a6a63]/80 transition truncate">
                                                        {item.name}
                                                    </h3>
                                                </Link>
                                                <p className="text-sm text-[#9a6a63]/70 capitalize mb-2">{item.type}</p>

                                                {/* Price */}
                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className="text-lg font-bold text-[#9a6a63]">
                                                        €{(item.discount > 0
                                                            ? item.price * (1 - item.discount / 100)
                                                            : item.price
                                                        ).toFixed(2)}
                                                    </span>
                                                    {item.discount > 0 && (
                                                        <span className="text-sm text-gray-500 line-through">
                                                            €{item.price.toFixed(2)}
                                                        </span>
                                                    )}
                                                    <span className="text-sm text-[#9a6a63]/70">each</span>
                                                </div>

                                                {/* Quantity and Actions */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <label className="text-sm font-medium text-[#9a6a63]">Qty:</label>
                                                        <div className="flex items-center border border-[#c1a5a2]/30 rounded-xl">
                                                            <button
                                                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                                className="px-3 py-2 hover:bg-[#9a6a63]/10 transition-colors text-[#9a6a63] disabled:opacity-50"
                                                                disabled={item.quantity <= 1}
                                                            >
                                                                <Minus size={16} />
                                                            </button>
                                                            <span className="px-4 py-2 border-x border-[#c1a5a2]/30 text-[#9a6a63] font-medium min-w-[60px] text-center">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                                className="px-3 py-2 hover:bg-[#9a6a63]/10 transition-colors text-[#9a6a63] disabled:opacity-50"
                                                                disabled={item.quantity >= item.maxStock}
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                        </div>
                                                        <span className="text-sm text-[#9a6a63]/70">
                                                            ({item.maxStock - item.quantity} available)
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <span className="text-lg font-bold text-[#9a6a63]">
                                                            €{((item.discount > 0
                                                                ? item.price * (1 - item.discount / 100)
                                                                : item.price
                                                            ) * item.quantity).toFixed(2)}
                                                        </span>
                                                        <button
                                                            onClick={() => removeItem(item.id)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-6">
                        {/* Promo Code */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl p-6">
                            <h3 className="font-semibold text-[#9a6a63] mb-4">Promo Code</h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter promo code"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-[#c1a5a2]/30 focus:border-[#9a6a63] focus:ring-2 focus:ring-[#9a6a63]/20 bg-white text-neutral-700"
                                />
                                <button
                                    onClick={handleApplyPromo}
                                    className="px-6 py-3 bg-[#9a6a63] hover:bg-[#9a6a63]/80 text-white rounded-xl transition font-medium"
                                >
                                    Apply
                                </button>
                            </div>
                            {promoDiscount > 0 && (
                                <p className="text-sm text-green-600 mt-2">
                                    Promo code applied! -€{promoDiscount.toFixed(2)}
                                </p>
                            )}
                        </div>

                        {/* Order Summary */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#c1a5a2]/20 shadow-xl p-6">
                            <h3 className="font-semibold text-[#9a6a63] mb-6">Order Summary</h3>

                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-[#9a6a63]/70">Subtotal ({totalItems} items)</span>
                                    <span className="font-medium text-[#9a6a63]">€{subtotal.toFixed(2)}</span>
                                </div>

                                {totalDiscount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Product discounts</span>
                                        <span>-€{totalDiscount.toFixed(2)}</span>
                                    </div>
                                )}

                                {promoDiscount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Promo code discount</span>
                                        <span>-€{promoDiscount.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <span className="text-[#9a6a63]/70">Shipping</span>
                                    <span className={`font-medium ${shipping === 0 ? 'text-green-600' : 'text-[#9a6a63]'}`}>
                                        {shipping === 0 ? 'FREE' : `€${shipping.toFixed(2)}`}
                                    </span>
                                </div>

                                {shipping > 0 && (
                                    <p className="text-xs text-[#9a6a63]/70">
                                        Free shipping on orders over €100
                                    </p>
                                )}

                                <hr className="border-[#c1a5a2]/30" />

                                <div className="flex justify-between text-lg font-semibold">
                                    <span className="text-[#9a6a63]">Total</span>
                                    <span className="text-[#9a6a63]">€{finalTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <Link
                                href="/checkout"
                                className="w-full mt-6 flex items-center justify-center gap-3 px-6 py-4 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg font-medium"
                                style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}
                            >
                                <Package size={20} />
                                Proceed to Checkout
                                <ArrowRight size={20} />
                            </Link>
                        </div>

                        {/* Security Info */}
                        <div className="bg-green-50/80 backdrop-blur-sm rounded-2xl border border-green-200/50 shadow-lg p-6">
                            <h4 className="font-medium text-green-800 mb-2">Secure Checkout</h4>
                            <p className="text-sm text-green-700">
                                Your payment information is encrypted and secure. We accept all major credit cards.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}