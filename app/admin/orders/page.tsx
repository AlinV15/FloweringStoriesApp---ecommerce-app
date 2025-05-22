// pages/admin/orders.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Order } from '@/app/types'; // Definim tipul Order pentru TS
import { Trash2 } from 'lucide-react';

const OrdersPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');
    const [filter, setFilter] = useState<string>('all');
    const router = useRouter();

    // Fetch orders on load or when filter/search change
    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/order`);
                const data = await res.json();
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            }
            setLoading(false);
        };

        fetchOrders();
    }, [search, filter]);

    // Handle changing filters
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilter(e.target.value);
    };

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    // Delete order
    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
            const result = await res.json();
            if (res.status === 200) {
                setOrders(orders.filter(order => order._id !== id));
            } else {
                alert(result.error || 'Failed to delete order');
            }
        } catch (error) {
            console.error("Failed to delete order:", error);
        }
    };

    // Loading State
    if (loading) {
        return <div className="text-center text-[#9c6b63] font-bold">Loading...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-[#9c6b63] mb-6">Orders Management</h1>

            {/* Filters and Search */}
            <div className="my-4 flex justify-between items-center text-neutral-700">
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Search Orders..."
                        className="px-3 py-2 border rounded-md shadow-md focus:ring-[#9c6b63] focus:border-[#9c6b63]"
                        value={search}
                        onChange={handleSearchChange}
                    />
                    <select
                        value={filter}
                        onChange={handleFilterChange}
                        className="px-3 py-2 border rounded-md shadow-md focus:ring-[#9c6b63] focus:border-[#9c6b63]"
                    >
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <table className="w-full border-collapse mt-6">
                <thead className="bg-[#9c6b63] text-white">
                    <tr>
                        <th className="px-6 py-3 text-left">Order ID</th>
                        <th className="px-6 py-3 text-left">User</th>
                        <th className="px-6 py-3 text-left">Total</th>
                        <th className="px-6 py-3 text-left">Status</th>
                        <th className="px-6 py-3 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order._id} className="border-b hover:bg-[#f5e1dd]">
                            <td className="px-6 py-3">{order._id}</td>
                            <td className="px-6 py-3">{(order.user?.firstName + ' ' + order.user?.lastName) || 'Guest'}</td>
                            <td className="px-6 py-3">{order.totalAmount} RON</td>
                            <td className="px-6 py-3">{order.status}</td>
                            <td className="px-6 py-3">
                                <Link
                                    href={`/admin/orders/${order._id}`}
                                    className="text-blue-500 hover:underline mr-4"
                                >
                                    View
                                </Link>
                                <button
                                    onClick={() => handleDelete(order._id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrdersPage;
