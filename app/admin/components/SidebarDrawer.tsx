'use client'

import { Menu } from 'lucide-react'
import { useState } from 'react'
import Sidebar from './Sidebar'

const SidebarDrawer = () => {
    const [open, setOpen] = useState(false)

    return (
        <div className='flex flex-col justify-center items-center'>
            {/* Buton vizibil DOAR pe mobil */}
            <button
                className="md:hidden p-4 text-sky-800 fixed top-0 right-0 z-50"
                onClick={() => setOpen(true)}
            >
                <Menu className="h-6 w-6" />
            </button>

            {/* Overlay + Drawer */}
            {open && (
                <div className="fixed inset-0 z-40 flex">
                    {/* Overlay semi-transparent */}
                    <div
                        className="bg-black/30 w-full"
                        onClick={() => setOpen(!open)}
                    ></div>

                    {/* Sidebar actual */}
                    <div className="w-72 bg-gradient-to-b from-blue-50 to-blue-100 p-6 min-h-screen shadow-lg z-50 flex flex-col pt-16">
                        <Sidebar />
                        <button
                            onClick={() => setOpen(false)}
                            className="mt-4 text-red-600 text-sm hover:underline"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SidebarDrawer
