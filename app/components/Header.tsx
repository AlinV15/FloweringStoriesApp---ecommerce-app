'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { ShoppingCart, Menu, X, Divide } from "lucide-react";
import { signOut, useSession } from "next-auth/react";


export default function Header() {
    const [showCart, setShowCart] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);
    const cartRef = useRef(null);


    const toggleCart = () => setShowCart(!showCart);
    const toggleMobileMenu = () => setMobileMenu(!mobileMenu);
    const closeCart = () => setShowCart(false);

    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';



    // Handle clicks outside the cart
    useEffect(() => {

        const handleClickOutside = (event: MouseEvent) => {
            if (
                showCart &&
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
    }, [showCart]);

    // Mock cart items
    const cartItems = [
        { name: "Red Tulip Bouquet", price: 89.99 },
        { name: "The Garden Journal", price: 42.5 }
    ];

    const total = cartItems.reduce((acc, item) => acc + item.price, 0);

    return (
        <>
            <header className="bg-[#fdf8f6] sticky top-0 z-40 border-b text-neutral-500 border-[#f0e4e0]">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-4">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/flowering_stories_logo.png"
                            alt="Flowering Stories"
                            width={48}
                            height={48}
                            className="rounded-full shadow-sm"
                        />
                        <span className="text-xl font-light tracking-wide hidden md:block">
                            <span className="font-semibold">Flowering</span> Stories
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-8 text-sm">
                        <Link href="/products" className="relative group py-2">
                            <span>All Products</span>
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pink-400 group-hover:w-full transition-all duration-300"></span>
                        </Link>
                        <Link href="/products/books" className="relative group py-2">
                            <span>Books</span>
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pink-400 group-hover:w-full transition-all duration-300"></span>
                        </Link>
                        <Link href="/products/stationaries" className="relative group py-2">
                            <span>Stationery</span>
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pink-400 group-hover:w-full transition-all duration-300"></span>
                        </Link>
                        <Link href="/products/flowers" className="relative group py-2">
                            <span>Flowers</span>
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pink-400 group-hover:w-full transition-all duration-300"></span>
                        </Link>
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className="relative group py-2 cursor-pointer"
                            >
                                <span>Admin</span>
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pink-400 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                        )}
                    </nav>

                    <div className="flex items-center space-x-6">
                        <div className="hidden md:flex items-center space-x-6 text-sm">
                            {
                                !session && <div className="hidden md:flex items-center space-x-6 text-sm"><Link href="/login" className="hover:text-pink-600 transition">Sign In</Link>
                                    <Link href="/register" className="px-4 py-2 bg-[#f5e1dd] hover:bg-[#f0d1cc] text-[#9c6b63] rounded-full transition">Register</Link></div>
                            }
                            {session && <button onClick={() => signOut({ callbackUrl: "/" })} className="hover:text-pink-600 transition cursor-pointer">Sign out</button>}
                        </div>

                        <button onClick={toggleCart} className="relative p-2 hover:bg-[#f5e1dd] rounded-full transition">
                            <ShoppingCart className="w-5 h-5" />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                    {cartItems.length}
                                </span>
                            )}
                        </button>

                        <button onClick={toggleMobileMenu} className="md:hidden p-2 hover:bg-[#f5e1dd] rounded-full transition">
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenu && (
                    <div className="md:hidden bg-white border-t border-[#f0e4e0] py-4 px-6 shadow-md">
                        <nav className="flex flex-col space-y-4">
                            <Link href="/products" className="py-2 hover:text-pink-600 transition">All Products</Link>
                            <Link href="/products/books" className="py-2 hover:text-pink-600 transition">Books</Link>
                            <Link href="/products/stationaries" className="py-2 hover:text-pink-600 transition">Stationery</Link>
                            <Link href="/products/flowers" className="py-2 hover:text-pink-600 transition">Flowers</Link>
                            <div className="border-t border-[#f0e4e0] pt-4 mt-2 flex justify-between">
                                <Link href="/login" className="py-2 hover:text-pink-600 transition">Sign In</Link>
                                <Link href="/register" className="px-4 py-2 bg-[#f5e1dd] hover:bg-[#f0d1cc] text-[#9c6b63] rounded-full transition">Register</Link>
                            </div>
                        </nav>
                    </div>
                )}
            </header>

            {/* Cart Overlay and Sidebar */}
            {showCart && (
                <div className="fixed top-0 right-0 w-full max-w-sm bg-white h-full shadow-lg z-[60] text-neutral-500">
                    {/* Backdrop overlay */}
                    <div
                        className="absolute inset-0 bg-black bg-opacity-20"
                        onClick={closeCart}
                    ></div>

                    {/* Cart sidebar */}
                    <div
                        ref={cartRef}
                        className="absolute top-0 right-0 w-full max-w-sm bg-white h-full shadow-lg transform transition-transform duration-300"
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0e4e0]">
                            <h2 className="text-lg font-medium">Your Cart</h2>
                            <button onClick={closeCart} className="p-2 hover:bg-[#f5e1dd] rounded-full transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 h-[calc(100vh-180px)] overflow-y-auto">
                            {cartItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
                                    <p className="text-gray-500">Your cart is empty.</p>
                                </div>
                            ) : (
                                <ul className="space-y-4 divide-y divide-[#f0e4e0]">
                                    {cartItems.map((item, idx) => (
                                        <li key={idx} className="flex justify-between py-3">
                                            <span className="font-medium">{item.name}</span>
                                            <span className="text-[#9c6b63]">{item.price.toFixed(2)} RON</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[#f0e4e0] bg-white">
                            <div className="flex justify-between font-medium mb-4">
                                <span>Total:</span>
                                <span className="text-lg">{total.toFixed(2)} RON</span>
                            </div>
                            <button className="w-full bg-[#9c6b63] hover:bg-[#875a53] text-white py-3 rounded-lg transition">
                                Checkout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}