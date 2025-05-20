'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Loader2, TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

interface ChartDataPoint {
    label: string;
    total: number;
}

export const OrdersChart = () => {
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [timeframe, setTimeframe] = useState<'month' | 'week' | 'year'>('month');
    const [trend, setTrend] = useState<{ percentage: number; direction: 'up' | 'down' | 'flat' }>({
        percentage: 0,
        direction: 'flat'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const endpoint = `/api/admin/stats/ordersBy${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}`;
                const res = await fetch(endpoint);
                const data = await res.json();
                setChartData(data);

                if (data.length >= 2) {
                    const currentValue = data[data.length - 1].total;
                    const previousValue = data[data.length - 2].total;
                    const percentChange = previousValue === 0 ? 100 : ((currentValue - previousValue) / previousValue) * 100;
                    setTrend({
                        percentage: Math.abs(Math.round(percentChange)),
                        direction: percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'flat'
                    });
                }
            } catch (err) {
                console.error('Error fetching chart data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [timeframe]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0, 0, 0, 0.08)' },
                ticks: { font: { size: 12, weight: 'bold' as const }, color: '#444' },
            },
            x: {
                grid: { display: false },
                ticks: { font: { size: 12, weight: 'bold' as const }, color: '#444' },
            },
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(40, 40, 40, 0.9)',
                titleColor: '#fff',
                bodyColor: '#eee',
                padding: 12,
                borderColor: 'rgba(80, 80, 80, 0.3)',
                borderWidth: 1,
                displayColors: false,
                callbacks: {
                    label: (context: any) => `${context.parsed.y} orders`,
                },
            },
        },
    };

    const data = {
        labels: chartData.map((item) => item.label),
        datasets: [
            {
                label: 'Orders',
                data: chartData.map((item) => item.total),
                fill: true,
                backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, 'rgba(156, 107, 99, 0.4)');
                    gradient.addColorStop(1, 'rgba(156, 107, 99, 0)');
                    return gradient;
                },
                borderColor: '#9c6b63',
                borderWidth: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#9c6b63',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.3,
            },
        ],
    };

    const totalOrders = chartData.reduce((sum, item) => sum + item.total, 0);

    if (isLoading) {
        return (
            <div className="bg-white shadow-lg rounded-xl p-8 flex justify-center items-center h-80">
                <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 text-[#9c6b63] animate-spin" />
                    <p className="mt-4 text-[#9c6b63] font-medium">Loading chart data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-md rounded-2xl overflow-hidden border border-gray-100">
            <div className="px-6 py-4 bg-gradient-to-r from-[#f5e1dd] to-[#f3d9d3] border-b border-gray-100 flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-lg text-[#9c6b63] flex items-center gap-2">
                        <BarChart2 className="h-5 w-5" />
                        Order Analytics
                    </h3>
                    <p className="text-[#b4877b] text-sm">Total: {totalOrders} orders</p>
                </div>

                {trend.direction !== 'flat' && (
                    <div className={`flex items-center gap-1 px-3 py-1 rounded text-white text-sm font-semibold ${trend.direction === 'up' ? 'bg-green-600' : 'bg-red-600'}`}>
                        {trend.direction === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        <span>{trend.percentage}%</span>
                    </div>
                )}
            </div>

            <div className="px-6 pt-4 flex justify-end space-x-2">
                <TimeframeButton active={timeframe === 'week'} onClick={() => setTimeframe('week')}>WEEKLY</TimeframeButton>
                <TimeframeButton active={timeframe === 'month'} onClick={() => setTimeframe('month')}>MONTHLY</TimeframeButton>
                <TimeframeButton active={timeframe === 'year'} onClick={() => setTimeframe('year')}>YEARLY</TimeframeButton>
            </div>

            <div className="p-6 h-64">
                <Line data={data} options={options} />
            </div>
        </div>
    );
};

const TimeframeButton = ({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors border ${active ? 'bg-[#9c6b63] text-white' : 'bg-white text-[#9c6b63] border-[#9c6b63] hover:bg-[#fdf4f1]'}`}
    >
        {children}
    </button>
);
