'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import {
    LogOut,
    Package,
    Settings,
    ShoppingCart,
    User,
    LayoutDashboard,
    ChevronDown,
    CircleArrowLeft
} from 'lucide-react';

const Sidebar = () => {
    const [productMenuOpen, setProductMenuOpen] = useState(false);
    const [activePage, setActivePage] = useState("/admin");

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setActivePage(window.location.pathname);
        }
    }, []);

    const handleLogout = () => {
        signOut({ callbackUrl: "/" });
    };

    type NavLinkProps = {
        href: string;
        icon: React.ReactNode;
        children: React.ReactNode;
    };

    const NavLink: React.FC<NavLinkProps> = ({ href, icon, children }) => {
        const isActive = activePage === href;
        return (
            <Link
                href={href}
                className={`flex items-center  gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                    ? 'bg-[#f5e1dd] text-[#9c6b63] font-semibold'
                    : 'hover:bg-[#f5e1dd]/60 text-[#9c6b63]'
                    }`}
            >
                {icon}
                <span>{children}</span>
            </Link>
        );
    };

    return (
        <aside className="relative md:fixed md:top-0 md:left-0 md:h-screen md:w-60 bg-gradient-to-b from-[#fdf8f6] to-[#f7eae6] shadow-md flex flex-col justify-between p-6 text-sm">
            <div>
                <h2 className="text-xl font-bold mb-8 text-[#9c6b63] flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Admin Panel
                </h2>

                <nav className="flex flex-col gap-2">
                    <NavLink href="/admin" icon={<LayoutDashboard className="h-4 w-4" />}>Dashboard</NavLink>
                    <NavLink href="/admin/orders" icon={<ShoppingCart className="h-4 w-4" />}>Orders</NavLink>

                    <div>
                        <button
                            onClick={() => setProductMenuOpen(!productMenuOpen)}
                            className={`flex items-center justify-between w-full px-4 py-2 rounded-lg transition-all duration-200 text-left ${productMenuOpen ? 'bg-[#f5e1dd] text-[#9c6b63]' : 'hover:bg-[#f5e1dd]/60 text-[#9c6b63]'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <Package className="h-4 w-4" /> Products
                            </span>
                            <ChevronDown className={`h-4 w-4 transition-transform ${productMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {productMenuOpen && (
                            <div className="mt-1 ml-6 flex flex-col gap-1 border-l border-[#e3d1cc] pl-4">
                                <NavLink href="/admin/products" icon={null}>All Products</NavLink>
                                <NavLink href="/admin/products/categories" icon={null}>Categories</NavLink>
                            </div>
                        )}
                    </div>

                    <NavLink href="/admin/users" icon={<User className="h-4 w-4" />}>Users</NavLink>
                </nav>
            </div>

            <div className="flex flex-col gap-2 border-t border-[#e3d1cc] pt-4 mt-6">
                <NavLink href="/admin/settings" icon={<Settings className="h-4 w-4" />}>Settings</NavLink>
                <NavLink href="/" icon={<CircleArrowLeft className="h-4 w-4" />}>Back to store</NavLink>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
