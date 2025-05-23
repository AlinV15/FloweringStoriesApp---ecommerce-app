'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Award, Loader2, PackageX } from 'lucide-react'

interface Product {
    _id: string
    name: string
    sold: number
}

export const TopProductsList = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchTop = async () => {
            try {
                setIsLoading(true)
                const res = await fetch('/api/admin/top-products')
                const data = await res.json()
                setProducts(data)
            } catch (error) {
                console.error('Failed to fetch top products:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchTop()
    }, [])

    const maxSales = products.length > 0 ? Math.max(...products.map(p => p.sold)) : 0

    const getRankBadge = (index: number) => {
        if (index === 0) return <span className="absolute -left-1 -top-1 bg-yellow-400 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md">1</span>
        if (index === 1) return <span className="absolute -left-1 -top-1 bg-neutral-400 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md">2</span>
        if (index === 2) return <span className="absolute -left-1 -top-1 bg-orange-600 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md">3</span>
        return null
    }

    if (isLoading) {
        return (
            <div className="bg-white shadow-lg rounded-xl p-8 flex justify-center items-center h-64">
                <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 text-[#9c6b63] animate-spin" />
                    <p className="mt-4 text-[#9c6b63] font-medium">Loading top products...</p>
                </div>
            </div>
        )
    }

    if (products.length === 0) {
        return (
            <div className="bg-white shadow-lg rounded-xl p-8 flex justify-center items-center h-64">
                <div className="flex flex-col items-center text-gray-500">
                    <PackageX className="h-12 w-12 text-gray-400" />
                    <p className="mt-2 font-medium">No product sales data available</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white shadow-md rounded-2xl overflow-hidden border border-gray-100">
            <div className="px-6 py-4 bg-gradient-to-r from-[#f5e1dd] to-[#f3d9d3] border-b border-gray-100 flex items-center justify-between ">
                <div>
                    <h3 className="font-semibold text-lg text-[#9c6b63] flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Top Products
                    </h3>
                    <p className="text-[#b4877b] text-sm">Best selling items this month</p>
                </div>
                <TrendingUp className="h-5 w-5 text-[#9c6b63]" />
            </div>

            <ul className="divide-y divide-gray-100 px-4 text-neutral-700">
                {products.map((product, index) => {
                    const progressWidth = maxSales > 0 ? (product.sold / maxSales) * 100 : 0

                    return (
                        <li
                            key={product._id}
                            className="py-4 relative hover:bg-[#fdf4f1] px-2 rounded-md transition-colors duration-200"
                        >
                            {getRankBadge(index)}

                            <div className="flex justify-between items-center mb-1">
                                <span className={`font-medium ${index < 3 ? 'pl-6' : ''}`}>
                                    {product.name}
                                </span>
                                <span className="text-[#9c6b63] font-semibold">
                                    {product.sold} {product.sold === 1 ? 'sale' : 'sales'}
                                </span>
                            </div>

                            <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                                <div
                                    className={`h-2 rounded-full ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-[#9c6b63]'}`}
                                    style={{ width: `${progressWidth}%` }}
                                ></div>
                            </div>
                        </li>
                    )
                })}
            </ul>

            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-right">
                <button className="text-[#9c6b63] hover:text-[#7c544f] text-sm font-medium transition-colors">
                    View All Products →
                </button>
            </div>
        </div>
    )
}
