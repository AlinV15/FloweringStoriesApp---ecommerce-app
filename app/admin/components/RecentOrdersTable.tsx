'use client'

import { useEffect, useState } from 'react'
import { Clock, Package, AlertCircle, CheckCircle } from 'lucide-react'

interface Order {
    _id: string
    clientName: string
    status: string
    total: number
}

export const RecentOrdersTable = () => {
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setIsLoading(true)
                const res = await fetch('/api/admin/recent-orders')
                const data = await res.json()
                setOrders(data)
            } catch (error) {
                console.error('Failed to fetch orders:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchOrders()
    }, [])

    // Function to get appropriate status badge
    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 font-medium text-xs">
                        <CheckCircle className="h-3 w-3" />
                        Completed
                    </span>
                )
            case 'pending':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-50 text-yellow-700 font-medium text-xs">
                        <Clock className="h-3 w-3" />
                        Pending
                    </span>
                )
            case 'processing':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium text-xs">
                        <Package className="h-3 w-3" />
                        Processing
                    </span>
                )
            default:
                return (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-50 text-gray-700 font-medium text-xs">
                        {status}
                    </span>
                )
        }
    }

    // Function to format the order ID to be shorter
    const formatOrderId = (id: string) => {
        return id.length > 8 ? `#${id.substring(0, 8)}...` : id
    }

    // Function to format the total with currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'RON',
            minimumFractionDigits: 2
        }).format(amount)
    }

    if (isLoading) {
        return (
            <div className="bg-white shadow rounded-lg p-8 flex justify-center items-center h-64">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
                    <p className="mt-4 text-pink-600 font-medium">Loading orders...</p>
                </div>
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className="bg-white shadow rounded-lg p-8 flex justify-center items-center h-64">
                <div className="flex flex-col items-center text-gray-500">
                    <AlertCircle className="h-12 w-12 text-gray-400" />
                    <p className="mt-2 font-medium">No recent orders found</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
            <div className="px-6 py-4 bg-gradient-to-r from-pink-50 to-pink-100 border-b border-gray-100">
                <h3 className="font-semibold text-lg text-pink-800">Recent Orders</h3>
                <p className="text-pink-600 text-sm">Latest customer transactions</p>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Order ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Client
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr
                                key={order._id}
                                className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {formatOrderId(order._id)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {order.clientName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(order.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {formatCurrency(order.total)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-right">
                <button className="text-pink-600 hover:text-pink-800 text-sm font-medium transition-colors">
                    View All Orders →
                </button>
            </div>
        </div>
    )
}