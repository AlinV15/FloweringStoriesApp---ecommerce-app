'use client';

import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import Sidebar from './Sidebar';

const SidebarDrawer = () => {
    const [open, setOpen] = useState(false);

    return (
        <div className="md:hidden">
            {/* Mobile Menu Button */}
            <button
                className="p-3 text-[#9c6b63] fixed top-4 right-4 z-50 bg-white/90 rounded-full shadow-lg hover:bg-[#f5e1dd] transition"
                onClick={() => setOpen(true)}
                aria-label="Open sidebar"
            >
                <Menu className="h-6 w-6" />
            </button>

            {/* Overlay + Drawer */}
            {open && (
                <div className="fixed inset-0 z-40 flex">
                    {/* Overlay */}
                    <div
                        className="bg-black/30 w-full backdrop-blur-sm"
                        onClick={() => setOpen(false)}
                    ></div>

                    {/* Sidebar */}
                    <div className="w-72 bg-gradient-to-b from-[#fdf8f6] to-[#f7eae6] p-6 min-h-screen shadow-lg z-50 flex flex-col relative animate-slide-in">
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute top-4 right-4 text-[#9c6b63] hover:text-[#8a5b53]"
                            aria-label="Close sidebar"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <Sidebar />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SidebarDrawer;
