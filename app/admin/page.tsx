'use client'
import { useEffect } from "react";
import { OrdersChart } from "./components/OrderCharts";
import { RecentOrdersTable } from "./components/RecentOrdersTable";
import StatCard from "./components/StatCard";
import { TopProductsList } from "./components/TopProductsList";
import { useAdminStore } from "../stores/AdminStore";


// app/admin/page.tsx
export default function AdminDashboardPage() {
    const { totalOrders, pendingOrders, totalProducts, totalUsers, setStats } = useAdminStore();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/admin/stats');
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error('Eroare la obținerea statisticilor:', error);
            }
        };

        fetchStats();
    }, [setStats]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-semibold text-sky-900">Admin Dashboard</h1>

            {/* Statistic Cards */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Comenzi" value={totalOrders} />
                <StatCard label="Comenzi în Așteptare" value={pendingOrders} />
                <StatCard label="Produse" value={totalProducts} />
                <StatCard label="Utilizatori" value={totalUsers} />
            </section>

            {/* Activity Graph */}
            <section>
                <h2 className="text-xl font-medium text-neutral-700 mb-4">Orders Overview</h2>
                {/* Componente chart aici */}
                <OrdersChart />
            </section>

            {/* Recent Orders */}
            <section>
                <h2 className="text-xl font-medium text-neutral-700 mb-4">Recent Orders</h2>
                <RecentOrdersTable />
            </section>

            {/* Top Products */}
            <section>
                <h2 className="text-xl font-medium text-neutral-700 mb-4">Top Products</h2>
                <TopProductsList />
            </section>
        </div>
    )
}

