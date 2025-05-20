// components/admin/StatCard.tsx
import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Package } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: number | string;
    change?: number;
    type?: 'revenue' | 'orders' | 'users' | 'products' | 'default';
    prefix?: string;
    suffix?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    change,
    type = 'default',
    prefix = '',
    suffix = ''
}) => {
    // Determine icon based on type
    const getIcon = () => {
        switch (type) {
            case 'revenue':
                return <DollarSign className="h-6 w-6" />;
            case 'orders':
                return <ShoppingBag className="h-6 w-6" />;
            case 'users':
                return <Users className="h-6 w-6" />;
            case 'products':
                return <Package className="h-6 w-6" />;
            default:
                return null;
        }
    };

    // Determine gradient based on type
    const getGradient = () => {
        switch (type) {
            case 'revenue':
                return 'from-green-50 to-green-100';
            case 'orders':
                return 'from-blue-50 to-blue-100';
            case 'users':
                return 'from-sky-50 to-sky-100';
            case 'products':
                return 'from-amber-50 to-amber-100';
            default:
                return 'from-blue-50 to-blue-100';
        }
    };

    // Determine text color based on type
    const getTextColor = () => {
        switch (type) {
            case 'revenue':
                return 'text-green-700';
            case 'orders':
                return 'text-cyan-700';
            case 'users':
                return 'text-blue-700';
            case 'products':
                return 'text-amber-700';
            default:
                return 'text-sky-700';
        }
    };

    return (
        <div
            className={`rounded-xl p-6 shadow-lg border border-gray-100 bg-gradient-to-br ${getGradient()} hover:shadow-xl transition-all duration-300 h-full`}
        >
            <div className="flex items-start justify-between">
                <div className={`rounded-full p-3 ${getTextColor()} bg-white bg-opacity-70`}>
                    {getIcon()}
                </div>

                {typeof change !== 'undefined' && (
                    <div className={`flex items-center space-x-1 text-sm font-medium rounded-full px-2 py-1 ${change >= 0
                        ? 'text-green-700 bg-green-50'
                        : 'text-red-700 bg-red-50'
                        }`}>
                        {change >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                        ) : (
                            <TrendingDown className="h-3 w-3" />
                        )}
                        <span>{Math.abs(change)}%</span>
                    </div>
                )}
            </div>

            <div className="mt-4">
                <p className={`text-sm font-medium opacity-80 ${getTextColor()}`}>{label}</p>
                <p className={`text-3xl font-bold mt-1 ${getTextColor()}`}>
                    {prefix}{value}{suffix}
                </p>
            </div>

            <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                <p className={`text-xs ${getTextColor()} opacity-70`}>
                    Compared to last period
                </p>
            </div>
        </div>
    );
};

export default StatCard;