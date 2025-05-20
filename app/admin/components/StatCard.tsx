// components/admin/StatCard.tsx
import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Package, Clock } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: number | string;
    change?: number;
    prefix?: string;
    suffix?: string;
    icon?: React.ReactNode;
    gradient?: string;
    textColor?: string;
    type?: 'revenue' | 'orders' | 'users' | 'products' | 'pending' | 'default';
}

const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    change,
    prefix = '',
    suffix = '',
    icon,
    gradient = 'from-white to-white',
    textColor = 'text-gray-800',
    type
}) => {
    const getIcon = () => {
        switch (type) {
            case 'revenue': return <DollarSign className="h-6 w-6" />;
            case 'orders': return <ShoppingBag className="h-6 w-6" />;
            case 'users': return <Users className="h-6 w-6" />;
            case 'products': return <Package className="h-6 w-6" />;
            case 'pending': return <Clock className="h-6 w-6" />;
            default: return <Clock className="h-6 w-6" />;
        }
    };

    return (
        <div className={`rounded-2xl p-6 shadow-md border border-gray-100 bg-gradient-to-br ${gradient} hover:shadow-lg transition-all duration-300 h-full`}>
            <div className="flex items-start justify-between">
                <div className={`rounded-xl p-3 bg-white bg-opacity-80 shadow-inner ${textColor}`}>
                    {icon || getIcon()}
                </div>
                {typeof change !== 'undefined' && (
                    <div className={`flex items-center space-x-1 text-sm font-medium rounded-full px-2 py-1 ${change >= 0
                        ? 'text-green-700 bg-green-100'
                        : 'text-red-700 bg-red-100'}`}>
                        {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        <span>{Math.abs(change)}%</span>
                    </div>
                )}
            </div>

            <div className="mt-4">
                <p className={`text-sm font-medium opacity-80 ${textColor}`}>{label}</p>
                <p className={`text-3xl font-bold mt-1 ${textColor}`}>{prefix}{value}{suffix}</p>
            </div>

            <div className="mt-4 pt-4 border-t border-white/30">
                <p className={`text-xs ${textColor} opacity-70`}>Compared to the previous period</p>
            </div>
        </div>
    );
};

export default StatCard;
