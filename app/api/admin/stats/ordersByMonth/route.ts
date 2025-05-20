// app/api/admin/stats/ordersByMonth/route.ts
import connectToDatabase from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await connectToDatabase();

        const pipeline = [
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    total: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 as 1 | -1 },
            },
        ];

        const result = await Order.aggregate(pipeline);

        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        const data = months.map((label, i) => {
            const found = result.find((r) => r._id === i + 1);
            return { label, total: found?.total || 0 };
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 });
    }
}
