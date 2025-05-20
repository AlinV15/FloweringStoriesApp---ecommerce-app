'use client'
import React from 'react'
import { LogOut, Package, Settings, ShoppingCart, User, LayoutDashboard, ChevronDown, StepBack } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'


const Sidebar = () => {
    const [productMenuOpen, setProductMenuOpen] = useState(false)
    const [activePage, setActivePage] = useState("/admin")

    // Set active page based on current path
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setActivePage(window.location.pathname)
        }
    }, [])

    const handleLogout = () => {
        signOut({ callbackUrl: "/" })
    }

    type NavLinkProps = {
        href: string;
        icon: React.ReactNode;
        children: React.ReactNode;
    };

    const NavLink: React.FC<NavLinkProps> = ({ href, icon, children }) => {
        const isActive = activePage === href
        return (
            <Link
                href={href}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 z-[1000] ${isActive
                    ? "bg-blue-200 text-sky-800 font-semibold"
                    : "hover:bg-blue-100 text-sky-800"
                    } }`}
            >
                {icon}
                <span>{children}</span>
            </Link>
        )
    }

    return (
        <aside className="  relative md:fixed md:top-0 md:left-0 md:h-screen md:w-1/5 md:z-50  bg-gradient-to-b from-blue-50 to-blue-100 shadow-lg md:flex md:flex-col md:justify-between md:p-6">

            <div>
                <h2 className="text-2xl font-bold mb-10 text-sky-800 flex items-center gap-2">
                    <Package className="h-6 w-6" />
                    Admin Panel
                </h2>

                <nav className="flex flex-col gap-2 text-base">
                    <NavLink href="/admin" icon={<LayoutDashboard className="h-5 w-5" />}>
                        Dashboard
                    </NavLink>

                    <NavLink href="/admin/orders" icon={<ShoppingCart className="h-5 w-5" />}>
                        Orders
                    </NavLink>

                    <div className="relative">
                        <button
                            className={`flex items-center justify-between w-full p-3 rounded-lg transition-all duration-200 ${productMenuOpen ? "bg-blue-200 text-sky-800" : "hover:bg-blue-100 text-sky-800"
                                }`}
                            onClick={() => setProductMenuOpen(!productMenuOpen)}
                        >
                            <div className="flex items-center gap-3">
                                <Package className="h-5 w-5" />
                                <span>Products</span>
                            </div>
                            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${productMenuOpen ? "transform rotate-180" : ""}`} />
                        </button>

                        {productMenuOpen && (
                            <div className="ml-6 mt-1 flex flex-col gap-1 overflow-hidden transition-all duration-300 ease-in-out">
                                {[
                                    { href: "/admin/products/book", label: "Books" },
                                    { href: "/admin/products/stationery", label: "Stationery" },
                                    { href: "/admin/products/flower", label: "Flowers" },
                                    { href: "/admin/products/categories", label: "Categories" }
                                ].map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`p-2 pl-10 rounded-md transition-colors duration-200 ${activePage === item.href
                                            ? "bg-blue-200 text-sky-800 font-medium"
                                            : "hover:bg-blue-100 text-sky-700"
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <NavLink href="/admin/users" icon={<User className="h-5 w-5" />}>
                        Users
                    </NavLink>
                </nav>
            </div>

            <div className="flex flex-col gap-2 border-t border-blue-200 pt-4 mt-6">
                <NavLink href="/admin/settings" icon={<Settings className="h-5 w-5" />}>
                    Settings
                </NavLink>

                <NavLink
                    href="/" icon={<StepBack className="h-5 w-5" />}>
                    Back to store
                </NavLink>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    )
}

export default Sidebar