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

// Register Chart.js components
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
                // Adjust endpoint based on selected timeframe
                const endpoint = `/api/admin/stats/ordersBy${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}`;
                const res = await fetch(endpoint);
                const data = await res.json();
                setChartData(data);

                // Calculate trend
                if (data.length >= 2) {
                    const currentValue = data[data.length - 1].total;
                    const previousValue = data[data.length - 2].total;

                    if (previousValue === 0) {
                        setTrend({ percentage: 100, direction: 'up' });
                    } else {
                        const percentChange = ((currentValue - previousValue) / previousValue) * 100;
                        setTrend({
                            percentage: Math.abs(Math.round(percentChange)),
                            direction: percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'flat'
                        });
                    }
                }
            } catch (err) {
                console.error('Error fetching chart data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [timeframe]);

    // Custom chart options with more masculine styling
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.08)',
                    lineWidth: 1,
                },
                ticks: {
                    font: {
                        size: 12,
                        weight: 'bold' as const,
                    },
                    color: '#444',
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 12,
                        weight: 'bold' as const,
                    },
                    color: '#444',
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(40, 40, 40, 0.9)',
                titleColor: '#fff',
                bodyColor: '#eee',
                titleFont: {
                    size: 14,
                    weight: "bold" as const,
                },
                bodyFont: {
                    size: 13,
                },
                padding: 12,
                borderColor: 'rgba(80, 80, 80, 0.3)',
                borderWidth: 1,
                displayColors: false,
                callbacks: {
                    label: function (context: any) {
                        return `${context.parsed.y} comenzi`;
                    }
                }
            },
        },
    };

    // Prepare chart data with more masculine styling
    const data = {
        labels: chartData.map((item) => item.label),
        datasets: [
            {
                label: 'Comenzi',
                data: chartData.map((item) => item.total),
                fill: true,
                backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, 'rgba(39, 55, 77, 0.5)');
                    gradient.addColorStop(1, 'rgba(39, 55, 77, 0)');
                    return gradient;
                },
                borderColor: '#27374D',
                borderWidth: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#27374D',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.2,
            },
        ],
    };

    // Calculate total orders
    const totalOrders = chartData.reduce((sum, item) => sum + item.total, 0);

    // Loading state
    if (isLoading) {
        return (
            <div className="bg-gray-800 shadow-lg rounded p-8 flex justify-center items-center h-80">
                <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    <p className="mt-4 text-gray-300 font-medium">Loading chart data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-lg rounded overflow-hidden border border-gray-200">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-800 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        <BarChart2 className="h-5 w-5" />
                        ORDER ANALYTICS
                    </h3>
                    <p className="text-gray-300 text-sm">Total: {totalOrders} orders</p>
                </div>

                {trend.direction !== 'flat' && (
                    <div className={`flex items-center gap-1 px-3 py-1 rounded ${trend.direction === 'up'
                        ? 'bg-green-700 text-white'
                        : 'bg-red-700 text-white'
                        }`}>
                        {trend.direction === 'up' ? (
                            <TrendingUp className="h-4 w-4" />
                        ) : (
                            <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="text-sm font-bold">{trend.percentage}%</span>
                    </div>
                )}
            </div>

            <div className="px-6 pt-4 flex justify-end space-x-2">
                <TimeframeButton
                    active={timeframe === 'week'}
                    onClick={() => setTimeframe('week')}
                >
                    WEEKLY
                </TimeframeButton>
                <TimeframeButton
                    active={timeframe === 'month'}
                    onClick={() => setTimeframe('month')}
                >
                    MONTHLY
                </TimeframeButton>
                <TimeframeButton
                    active={timeframe === 'year'}
                    onClick={() => setTimeframe('year')}
                >
                    YEARLY
                </TimeframeButton>
            </div>

            <div className="p-6 h-64">
                <Line data={data} options={options} />
            </div>
        </div>
    );
};

// Helper component for timeframe buttons with more masculine styling
const TimeframeButton = ({
    children,
    active,
    onClick
}: {
    children: React.ReactNode;
    active: boolean;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-xs font-bold rounded transition-colors ${active
            ? 'bg-blue-700 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
    >
        {children}
    </button>
);