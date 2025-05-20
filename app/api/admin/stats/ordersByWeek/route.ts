// app/api/admin/stats/ordersByWeek/route.ts
import connectToDatabase from '@/lib/mongodb'
import Order from '@/lib/models/Order'
import { NextResponse } from 'next/server'
import { format, subDays } from 'date-fns'

export async function GET() {
    try {
        await connectToDatabase()

        const today = new Date()
        const sevenDaysAgo = subDays(today, 6)

        const results = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo, $lte: today }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    total: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ])

        const data = Array.from({ length: 7 }).map((_, i) => {
            const date = format(subDays(today, 6 - i), 'yyyy-MM-dd')
            const label = format(subDays(today, 6 - i), 'EEE')
            const found = results.find(r => r._id === date)
            return {
                label,
                total: found?.total || 0
            }
        })

        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch weekly data' }, { status: 500 })
    }
}
