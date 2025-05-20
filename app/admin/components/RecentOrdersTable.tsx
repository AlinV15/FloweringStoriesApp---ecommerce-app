'use client';

import { useEffect, useState } from 'react';
import { Clock, Package, AlertCircle, CheckCircle } from 'lucide-react';

interface Order {
    _id: string;
    clientName: string;
    status: string;
    total: number;
}

export const RecentOrdersTable = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setIsLoading(true);
                const res = await fetch('/api/admin/recent-orders');
                const data = await res.json();
                setOrders(data);
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium text-xs">
                        <CheckCircle className="h-4 w-4" /> Completed
                    </span>
                );
            case 'pending':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium text-xs">
                        <Clock className="h-4 w-4" /> Pending
                    </span>
                );
            case 'processing':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium text-xs">
                        <Package className="h-4 w-4" /> Processing
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-medium text-xs">
                        {status}
                    </span>
                );
        }
    };

    const formatOrderId = (id: string) => (id.length > 8 ? `#${id.substring(0, 8)}...` : id);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-RO', {
            style: 'currency',
            currency: 'RON',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="bg-white shadow rounded-xl p-8 flex justify-center items-center h-64">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
                    <p className="mt-4 text-pink-600 font-medium">Loading orders...</p>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="bg-white shadow rounded-xl p-8 flex justify-center items-center h-64">
                <div className="flex flex-col items-center text-gray-500">
                    <AlertCircle className="h-12 w-12 text-gray-400" />
                    <p className="mt-2 font-medium">No recent orders found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-md rounded-2xl overflow-hidden border border-gray-100">
            <div className="px-6 py-4 bg-gradient-to-r from-[#fdf4f1] to-[#fceae6] border-b border-gray-100">
                <h3 className="font-semibold text-lg text-[#9c6b63]">Recent Orders</h3>
                <p className="text-[#b4877b] text-sm">Latest customer transactions</p>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Order ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Client
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Total
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {orders.map((order) => (
                            <tr
                                key={order._id}
                                className="hover:bg-[#fff6f2] transition-colors duration-200"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
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
                <button className="text-[#9c6b63] hover:text-[#7e524a] text-sm font-medium transition-colors">
                    View All Orders →
                </button>
            </div>
        </div>
    );
};