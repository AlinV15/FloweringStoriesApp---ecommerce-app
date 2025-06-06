'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
    LogOut,
    Package,
    Settings,
    ShoppingCart,
    User,
    LayoutDashboard,
    ChevronDown,
    CircleArrowLeft,
    Users
} from 'lucide-react';

const Sidebar = () => {
    const pathname = usePathname();
    const [productMenuOpen, setProductMenuOpen] = useState(false);

    // Automatically open products submenu when on a products page
    useEffect(() => {
        if (pathname?.includes('/admin/products')) {
            setProductMenuOpen(true);
        }
    }, [pathname]);

    const handleLogout = () => {
        signOut({ callbackUrl: "/" });
    };

    type NavLinkProps = {
        href: string;
        icon: React.ReactNode;
        children: React.ReactNode;
        className?: string;
    };

    const NavLink: React.FC<NavLinkProps> = ({ href, icon, children, className = '' }) => {
        const isActive = pathname === href;

        return (
            <Link
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                    ? 'bg-[#f5e1dd] text-[#9c6b63] font-medium shadow-sm'
                    : 'hover:bg-[#f5e1dd]/60 text-[#9c6b63]/80 hover:text-[#9c6b63]'
                    } ${className}`}
            >
                {icon && <div className="w-5 h-5 flex items-center justify-center">{icon}</div>}
                <span className="text-sm">{children}</span>
            </Link>
        );
    };

    const SubNavLink: React.FC<NavLinkProps> = ({ href, children }) => {
        const isActive = pathname === href;

        return (
            <Link
                href={href}
                className={`flex items-center py-2 pl-2 rounded-md transition-all duration-200 text-sm ${isActive
                    ? 'text-[#9c6b63] font-medium bg-[#f5e1dd]/50'
                    : 'text-[#9c6b63]/70 hover:text-[#9c6b63] hover:bg-[#f5e1dd]/30'
                    }`}
            >
                <div className="w-1 h-1 rounded-full bg-[#9c6b63] mr-2"></div>
                {children}
            </Link>
        );
    };

    // Check if it's a products page
    const isProductsPage = pathname?.includes('/admin/products');

    return (
        <aside className="relative md:fixed md:top-0 md:left-0 md:h-screen md:w-64 bg-gradient-to-b from-[#fdf8f6] to-[#f7eae6] shadow-lg flex flex-col justify-between p-6 text-sm z-10">
            <div className="space-y-6">
                <div className="flex items-center gap-2 px-2">
                    <div className="p-2 bg-[#9c6b63] text-white rounded-lg">
                        <Package className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold text-[#9c6b63]">Admin Panel</h2>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-[#e3d1cc] to-transparent my-2"></div>

                <nav className="flex flex-col gap-2">
                    <NavLink href="/admin" icon={<LayoutDashboard className="h-4 w-4" />}>Dashboard</NavLink>
                    <NavLink href="/admin/orders" icon={<ShoppingCart className="h-4 w-4" />}>Orders</NavLink>


                    <div className="mt-1">
                        <button
                            onClick={() => setProductMenuOpen(!productMenuOpen)}
                            className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-200 text-left ${isProductsPage
                                ? 'bg-[#f5e1dd] text-[#9c6b63] font-medium shadow-sm'
                                : 'hover:bg-[#f5e1dd]/60 text-[#9c6b63]/80 hover:text-[#9c6b63]'
                                }`}
                        >
                            <span className="flex items-center gap-3">
                                <div className="w-5 h-5 flex items-center justify-center">
                                    <Package className="h-4 w-4" />
                                </div>
                                <span className="text-sm">Products</span>
                            </span>
                            <ChevronDown
                                className={`h-4 w-4 transition-transform duration-200 ${productMenuOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {productMenuOpen && (
                            <div className="mt-1 ml-10 flex flex-col gap-1 border-l border-[#e3d1cc] pl-2 py-1">
                                <SubNavLink href="/admin/products" icon={null}>All Products</SubNavLink>

                                <SubNavLink href="/admin/products/subcategories" icon={null}>Categories</SubNavLink>

                            </div>
                        )}
                    </div>

                    <NavLink href="/admin/users" icon={<Users className="h-4 w-4" />}>Users</NavLink>
                </nav>
            </div>

            <div className="flex flex-col gap-2 border-t border-[#e3d1cc] pt-4 mt-6">
                <div className="flex items-center gap-3 px-2 py-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#9c6b63]/20 flex items-center justify-center text-[#9c6b63]">
                        <User className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-[#9c6b63]/70">Logged in as</span>
                        <span className="text-sm font-medium text-[#9c6b63]">Admin User</span>
                    </div>
                </div>

                <NavLink href="/admin/settings" icon={<Settings className="h-4 w-4" />}>Settings</NavLink>
                <NavLink href="/" icon={<CircleArrowLeft className="h-4 w-4" />}>Back to store</NavLink>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 mt-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                    <div className="w-5 h-5 flex items-center justify-center">
                        <LogOut className="h-4 w-4" />
                    </div>
                    <span className="text-sm">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;