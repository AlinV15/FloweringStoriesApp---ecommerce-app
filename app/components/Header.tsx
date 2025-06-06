'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { ShoppingCart, Menu, X, Plus, Minus, Trash2 } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useCartStore } from "@/app/stores/CartStore";
import { CartItem } from "../stores/CartStore";
import { useShopSettings } from "@/contexts/ShopSettingsContext";
import { useCurrency } from "@/app/hooks/useCurrency";

export default function Header() {
    const [mobileMenu, setMobileMenu] = useState(false);
    const [mounted, setMounted] = useState(false);
    const cartRef = useRef(null);

    // Shop Settings
    const { settings } = useShopSettings();
    const { formatPrice } = useCurrency();

    // Zustand cart store
    const {
        items,
        isOpen,
        toggleCart,
        closeCart,
        removeItem,
        updateQuantity,
        getTotalItems,
        getTotalPrice
    } = useCartStore();

    const toggleMobileMenu = () => setMobileMenu(!mobileMenu);

    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';

    // Fix hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle clicks outside the cart
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isOpen &&
                cartRef.current &&
                !(cartRef.current as HTMLDivElement).contains(event.target as Node)
            ) {
                closeCart();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, closeCart]);

    const handleQuantityChange = (id: string, newQuantity: number) => {
        updateQuantity(id, newQuantity);
    };

    const totalItems = mounted ? getTotalItems() : 0;
    const totalPrice = mounted ? getTotalPrice() : 0;

    // Get logo and shop name from settings, fallback to defaults
    const logoSrc = settings?.logo?.headerLogo || "/flowering_stories_logo.png";
    const shopName = settings?.shopName || "Flowering Stories";
    const primaryColor = settings?.colors?.primary || "#9c6b63";
    const accentColor = settings?.colors?.accent || "#f5e1dd";

    return (
        <>
            <header className="bg-[#fdf8f6] sticky top-0 z-40 border-b text-neutral-500 border-[#f0e4e0]">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-4">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src={logoSrc}
                            alt={shopName}
                            width={48}
                            height={48}
                            className="rounded-full shadow-sm"
                        />
                        <span className="text-xl font-light tracking-wide hidden md:block">
                            <span className="font-semibold">{shopName.split(' ')[0]}</span> {shopName.split(' ').slice(1).join(' ')}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-8 text-sm">
                        <Link href="/products" className="relative group py-2">
                            <span>All Products</span>
                            <span
                                className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                                style={{ backgroundColor: primaryColor }}
                            ></span>
                        </Link>
                        <Link href="/products/books" className="relative group py-2">
                            <span>Books</span>
                            <span
                                className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                                style={{ backgroundColor: primaryColor }}
                            ></span>
                        </Link>
                        <Link href="/products/stationery" className="relative group py-2">
                            <span>Stationery</span>
                            <span
                                className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                                style={{ backgroundColor: primaryColor }}
                            ></span>
                        </Link>
                        <Link href="/products/flowers" className="relative group py-2">
                            <span>Flowers</span>
                            <span
                                className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                                style={{ backgroundColor: primaryColor }}
                            ></span>
                        </Link>
                        {isAdmin && (
                            <Link href="/admin" className="relative group py-2 cursor-pointer">
                                <span>Admin</span>
                                <span
                                    className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                                    style={{ backgroundColor: primaryColor }}
                                ></span>
                            </Link>
                        )}
                    </nav>

                    <div className="flex items-center space-x-6">
                        <div className="hidden md:flex items-center space-x-6 text-sm">
                            {!session && (
                                <div className="hidden md:flex items-center space-x-6 text-sm">
                                    <Link
                                        href="/login"
                                        className="transition"
                                        style={{ color: `${primaryColor}` }}
                                        onMouseEnter={(e) => (e.target as HTMLElement).style.opacity = '0.8'}
                                        onMouseLeave={(e) => (e.target as HTMLElement).style.opacity = '1'}
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="px-4 py-2 rounded-full transition"
                                        style={{
                                            backgroundColor: accentColor,
                                            color: primaryColor
                                        }}
                                        onMouseEnter={(e) => (e.target as HTMLElement).style.opacity = '0.9'}
                                        onMouseLeave={(e) => (e.target as HTMLElement).style.opacity = '1'}
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                            {session && (
                                <button
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="transition cursor-pointer"
                                    style={{ color: primaryColor }}
                                    onMouseEnter={(e) => (e.target as HTMLElement).style.opacity = '0.8'}
                                    onMouseLeave={(e) => (e.target as HTMLElement).style.opacity = '1'}
                                >
                                    Sign out
                                </button>
                            )}
                        </div>

                        <button
                            onClick={toggleCart}
                            className="relative p-2 rounded-full transition"
                            style={{ backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = accentColor}
                            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                        >
                            <ShoppingCart className="w-5 h-5" />
                            <span
                                className={`absolute -top-1 -right-1 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pulse transition-opacity ${mounted && totalItems > 0 ? 'opacity-100' : 'opacity-0'
                                    }`}
                                style={{ backgroundColor: primaryColor }}
                            >
                                {totalItems}
                            </span>
                        </button>

                        <button
                            onClick={toggleMobileMenu}
                            className="md:hidden p-2 rounded-full transition"
                            style={{ backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = accentColor}
                            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenu && (
                    <div className="md:hidden bg-white border-t border-[#f0e4e0] py-4 px-6 shadow-md">
                        <nav className="flex flex-col space-y-4">
                            <Link
                                href="/products"
                                className="py-2 transition"
                                style={{ color: 'inherit' }}
                                onMouseEnter={(e) => (e.target as HTMLElement).style.color = primaryColor}
                                onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'inherit'}
                            >
                                All Products
                            </Link>
                            <Link
                                href="/products/books"
                                className="py-2 transition"
                                onMouseEnter={(e) => (e.target as HTMLElement).style.color = primaryColor}
                                onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'inherit'}
                            >
                                Books
                            </Link>
                            <Link
                                href="/products/stationaries"
                                className="py-2 transition"
                                onMouseEnter={(e) => (e.target as HTMLElement).style.color = primaryColor}
                                onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'inherit'}
                            >
                                Stationery
                            </Link>
                            <Link
                                href="/products/flowers"
                                className="py-2 transition"
                                onMouseEnter={(e) => (e.target as HTMLElement).style.color = primaryColor}
                                onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'inherit'}
                            >
                                Flowers
                            </Link>
                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    className="py-2 transition"
                                    onMouseEnter={(e) => (e.target as HTMLElement).style.color = primaryColor}
                                    onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'inherit'}
                                >
                                    Admin
                                </Link>
                            )}
                            <div className="border-t border-[#f0e4e0] pt-4 mt-2 flex justify-between">
                                {!session ? (
                                    <>
                                        <Link
                                            href="/login"
                                            className="py-2 transition"
                                            onMouseEnter={(e) => (e.target as HTMLElement).style.color = primaryColor}
                                            onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'inherit'}
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="px-4 py-2 rounded-full transition"
                                            style={{
                                                backgroundColor: accentColor,
                                                color: primaryColor
                                            }}
                                        >
                                            Register
                                        </Link>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => signOut({ callbackUrl: "/" })}
                                        className="py-2 transition"
                                        onMouseEnter={(e) => (e.target as HTMLElement).style.color = primaryColor}
                                        onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'inherit'}
                                    >
                                        Sign out
                                    </button>
                                )}
                            </div>
                        </nav>
                    </div>
                )}
            </header>

            {/* Cart Overlay and Sidebar */}
            {isOpen && (
                <div className="fixed top-0 right-0 w-full max-w-sm bg-white h-full shadow-lg z-[60] text-neutral-500">
                    {/* Backdrop overlay */}
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
                        onClick={closeCart}
                    ></div>

                    {/* Cart sidebar */}
                    <div
                        ref={cartRef}
                        className="relative w-full max-w-md bg-white h-full shadow-2xl transform transition-transform duration-300 flex flex-col"
                    >
                        {/* Header */}
                        <div
                            className="flex items-center justify-between px-6 py-4 border-b border-[#f0e4e0]"
                            style={{ backgroundColor: settings?.colors?.accent || '#fdf8f6' }}
                        >
                            <h2
                                className="text-xl font-semibold"
                                style={{ color: primaryColor }}
                            >
                                Shopping Cart
                            </h2>
                            <button
                                onClick={closeCart}
                                className="p-2 rounded-full transition"
                                onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = accentColor}
                                onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Cart Content */}
                        <div className="flex-1 overflow-y-auto">
                            {!mounted || items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                    <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-600 mb-2">Your cart is empty</h3>
                                    <p className="text-gray-500 mb-6">Add some products to get started!</p>
                                    <Link
                                        href="/products"
                                        onClick={closeCart}
                                        className="px-6 py-3 text-white rounded-lg transition"
                                        style={{ backgroundColor: primaryColor }}
                                        onMouseEnter={(e) => (e.target as HTMLElement).style.opacity = '0.9'}
                                        onMouseLeave={(e) => (e.target as HTMLElement).style.opacity = '1'}
                                    >
                                        Start Shopping
                                    </Link>
                                </div>
                            ) : (
                                <div className="p-4 space-y-4">
                                    {items.map((item: CartItem) => (
                                        <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                                            <div className="relative w-16 h-16 flex-shrink-0">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover rounded-md"
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                                                <p className="text-sm text-gray-600 capitalize">{item.type}</p>

                                                {/* Price */}
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span
                                                        className="font-semibold"
                                                        style={{ color: primaryColor }}
                                                    >
                                                        {formatPrice(item.discount > 0
                                                            ? item.price * (1 - item.discount / 100)
                                                            : item.price
                                                        )}
                                                    </span>
                                                    {item.discount > 0 && (
                                                        <span className="text-sm text-gray-500 line-through">
                                                            {formatPrice(item.price)}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="flex items-center border border-gray-300 rounded-md">
                                                        <button
                                                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                            className="p-1 hover:bg-gray-100 transition"
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                                                        <button
                                                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                            className="p-1 hover:bg-gray-100 transition"
                                                            disabled={item.quantity >= item.maxStock}
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-md transition"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {mounted && items.length > 0 && (
                            <div
                                className="border-t border-[#f0e4e0] p-6 space-y-4"
                                style={{ backgroundColor: settings?.colors?.accent || '#fdf8f6' }}
                            >
                                {/* Total */}
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                                    <span
                                        className="text-xl font-bold"
                                        style={{ color: primaryColor }}
                                    >
                                        {formatPrice(totalPrice)}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="space-y-3">
                                    <Link
                                        href="/cart"
                                        onClick={closeCart}
                                        className="w-full block text-center px-6 py-3 border rounded-lg transition"
                                        style={{
                                            borderColor: primaryColor,
                                            color: primaryColor
                                        }}
                                        onMouseEnter={(e) => {
                                            (e.target as HTMLElement).style.backgroundColor = primaryColor;
                                            (e.target as HTMLElement).style.color = 'white';
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.target as HTMLElement).style.backgroundColor = 'transparent';
                                            (e.target as HTMLElement).style.color = primaryColor;
                                        }}
                                    >
                                        View Cart
                                    </Link>
                                    <Link
                                        href="/checkout"
                                        onClick={closeCart}
                                        className="w-full block text-center px-6 py-3 text-white rounded-lg transition"
                                        style={{ backgroundColor: primaryColor }}
                                        onMouseEnter={(e) => (e.target as HTMLElement).style.opacity = '0.9'}
                                        onMouseLeave={(e) => (e.target as HTMLElement).style.opacity = '1'}
                                    >
                                        Checkout
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}