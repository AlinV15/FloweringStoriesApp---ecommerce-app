// app/api/admin/stats/route.ts
import connectToDatabase from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import User from '@/lib/models/User';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await connectToDatabase();

        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const totalProducts = await Product.countDocuments();
        const totalUsers = await User.countDocuments();

        return NextResponse.json({
            totalOrders,
            pendingOrders,
            totalProducts,
            totalUsers,
        });
    } catch (error) {
        return NextResponse.json({ error: 'Eroare la obținerea statisticilor' }, { status: 500 });
    }
}
