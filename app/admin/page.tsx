'use client'

import { useEffect } from "react";
import { OrdersChart } from "./components/OrderCharts";
import { RecentOrdersTable } from "./components/RecentOrdersTable";
import StatCard from "./components/StatCard";
import { TopProductsList } from "./components/TopProductsList";
import { useAdminStore } from "../stores/AdminStore";

export default function AdminDashboardPage() {
    const { totalOrders, pendingOrders, totalProducts, totalUsers, setStats } = useAdminStore();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/admin/stats');
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
    }, [setStats]);

    return (
        <div className="space-y-10 p-6 md:p-8 bg-[#fefcfa] min-h-screen">
            <h1 className="text-3xl md:text-4xl font-bold text-[#9c6b63] tracking-tight mb-6">Admin Dashboard</h1>

            {/* Statistic Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Orders" value={totalOrders} type="orders" gradient="from-[#e8e4e2] to-[#f3f0ef]" textColor="text-[#6b4f4f]" />
                <StatCard label="Pending Orders" value={pendingOrders} type="default" gradient="from-[#fef4f1] to-[#fdf0ec]" textColor="text-[#9c6b63]" />
                <StatCard label="Products" value={totalProducts} type="products" gradient="from-[#fdf2e9] to-[#fcebdd]" textColor="text-[#a35836]" />
                <StatCard label="Users" value={totalUsers} type="users" gradient="from-[#e6f1f4] to-[#dceff4]" textColor="text-[#557086]" />
            </section>

            {/* Orders Chart */}
            <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-[#9c6b63] mb-4">Orders Overview</h2>
                <OrdersChart />
            </section>

            {/* Recent Orders */}
            <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-[#9c6b63] mb-4">Recent Orders</h2>
                <RecentOrdersTable />
            </section>

            {/* Top Products */}
            <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-[#9c6b63] mb-4">Top Products</h2>
                <TopProductsList />
            </section>
        </div>
    )
}
