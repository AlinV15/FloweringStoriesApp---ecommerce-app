'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Award, Loader2, PackageX, ExternalLink, BookOpen, PenTool, Flower2, Package } from 'lucide-react'
import { useShopSettings } from '@/contexts/ShopSettingsContext'
import Link from 'next/link'

interface Product {
    _id: string
    name: string
    totalSold: number
    totalRevenue: number
    price: number
    image?: string
    type: string
}

export const TopProductsList = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const { settings } = useShopSettings()

    // Get colors from settings
    const primaryColor = settings?.colors?.primary || '#9c6b63'
    const secondaryColor = settings?.colors?.secondary || '#b4877b'
    const accentColor = settings?.colors?.accent || '#f5e1dd'

    useEffect(() => {
        const fetchTop = async () => {
            try {
                setIsLoading(true)
                setError(null)
                const res = await fetch('/api/admin/top-products')

                if (!res.ok) {
                    throw new Error('Failed to fetch top products')
                }

                const data = await res.json()
                setProducts(Array.isArray(data) ? data : [])
            } catch (error) {
                console.error('Failed to fetch top products:', error)
                setError(error instanceof Error ? error.message : 'Failed to fetch top products')
                setProducts([])
            } finally {
                setIsLoading(false)
            }
        }
        fetchTop()
    }, [])

    const maxSales = products.length > 0 ? Math.max(...products.map(p => p.totalSold)) : 0

    const getRankBadge = (index: number) => {
        const badges = [
            { bg: 'bg-yellow-400', text: 'text-yellow-900' },
            { bg: 'bg-gray-400', text: 'text-gray-900' },
            { bg: 'bg-orange-500', text: 'text-orange-900' }
        ]

        const badge = badges[index]
        if (!badge) return null

        return (
            <span className={`absolute -left-1 -top-1 ${badge.bg} ${badge.text} text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md z-10`}>
                {index + 1}
            </span>
        )
    }

    const getTypeIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'book': return <BookOpen size={16} className="text-blue-600" />
            case 'stationary': return <PenTool size={16} className="text-emerald-600" />
            case 'flower': return <Flower2 size={16} className="text-pink-600" />
            default: return <Package size={16} className="text-gray-600" />
        }
    }

    const formatCurrency = (amount: number) => {
        if (!settings?.currency) return `€${amount.toFixed(2)}`

        const currency = settings.currency
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount)
    }

    if (isLoading) {
        return (
            <div className="bg-white shadow-sm rounded-lg p-8 flex justify-center items-center h-64 border border-gray-200">
                <div className="flex flex-col items-center">
                    <div
                        className="h-8 w-8 animate-spin rounded-full border-4 border-t-4"
                        style={{
                            borderColor: accentColor,
                            borderTopColor: primaryColor
                        }}
                    ></div>
                    <p
                        className="mt-4 font-medium"
                        style={{ color: primaryColor }}
                    >
                        Loading top products...
                    </p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-white shadow-sm rounded-lg p-8 flex justify-center items-center h-64 border border-gray-200">
                <div className="flex flex-col items-center text-center">
                    <PackageX className="h-12 w-12 text-red-400 mb-4" />
                    <p className="font-medium text-gray-700 mb-2">Error loading top products</p>
                    <p className="text-sm text-gray-500 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 text-white rounded-lg transition"
                        style={{ backgroundColor: primaryColor }}
                        onMouseEnter={(e) => (e.target as HTMLElement).style.opacity = '0.9'}
                        onMouseLeave={(e) => (e.target as HTMLElement).style.opacity = '1'}
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    if (products.length === 0) {
        return (
            <div className="bg-white shadow-sm rounded-lg p-8 flex justify-center items-center h-64 border border-gray-200">
                <div className="flex flex-col items-center text-gray-500 text-center">
                    <PackageX className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="font-medium mb-2">No product sales data available</p>
                    <p className="text-sm text-gray-400">Sales data will appear here once products are sold</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
            <div
                className="px-6 py-4 border-b border-gray-200 flex items-center justify-between"
                style={{ backgroundColor: accentColor }}
            >
                <div>
                    <h3
                        className="font-semibold text-lg flex items-center gap-2"
                        style={{ color: primaryColor }}
                    >
                        <Award className="h-5 w-5" />
                        Top Products
                    </h3>
                    <p
                        className="text-sm"
                        style={{ color: secondaryColor }}
                    >
                        Best selling items ({products.length} products)
                    </p>
                </div>
                <TrendingUp
                    className="h-5 w-5"
                    style={{ color: primaryColor }}
                />
            </div>

            <div className="divide-y divide-gray-100">
                {products.map((product, index) => {
                    const progressWidth = maxSales > 0 ? (product.totalSold / maxSales) * 100 : 0

                    return (
                        <div
                            key={product._id}
                            className="p-4 relative transition-colors duration-200"
                            style={{ backgroundColor: 'white' }}
                            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = accentColor}
                            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'white'}
                        >
                            {getRankBadge(index)}

                            <div className="flex items-start gap-4">
                                {/* Product Image/Icon */}
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200"
                                    style={{ backgroundColor: accentColor }}
                                >
                                    {product.image ? (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    ) : (
                                        getTypeIcon(product.type)
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className={`${index < 3 ? 'pl-6' : ''} flex-1`}>
                                            <h4 className="font-medium text-gray-900 truncate">
                                                {product.name}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                {getTypeIcon(product.type)}
                                                <span className="text-sm text-gray-500 capitalize">
                                                    {product.type}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p
                                                className="font-semibold"
                                                style={{ color: primaryColor }}
                                            >
                                                {product.totalSold} {product.totalSold === 1 ? 'sale' : 'sales'}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {formatCurrency(product.totalRevenue)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${index === 0 ? 'bg-yellow-400' :
                                                    index === 1 ? 'bg-gray-400' :
                                                        index === 2 ? 'bg-orange-500' : ''
                                                }`}
                                            style={{
                                                width: `${progressWidth}%`,
                                                backgroundColor: index > 2 ? primaryColor : undefined
                                            }}
                                        ></div>
                                    </div>

                                    {/* Additional Stats */}
                                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                                        <span>Unit price: {formatCurrency(product.price)}</span>
                                        <span>{((product.totalSold / maxSales) * 100).toFixed(0)}% of top seller</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div
                className="px-6 py-3 border-t border-gray-200 text-right"
                style={{ backgroundColor: 'rgb(249, 250, 251)' }}
            >
                <Link
                    href="/admin/products"
                    className="text-sm font-medium transition-colors inline-flex items-center gap-1"
                    style={{ color: primaryColor }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.opacity = '0.8'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.opacity = '1'}
                >
                    View All Products
                    <ExternalLink size={14} />
                </Link>
            </div>
        </div>
    )
}