// app/api/admin/stats/ordersByYear/route.ts
import connectToDatabase from '@/lib/mongodb'
import Order from '@/lib/models/Order'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        await connectToDatabase()

        const currentYear = new Date().getFullYear()

        const results = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(`${currentYear}-01-01`),
                        $lte: new Date(`${currentYear}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    total: { $sum: 1 }
                }
            },
            {
                $sort: { "_id": 1 }
            }
        ])

        const monthlyLabels = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ]

        const data = monthlyLabels.map((label, index) => {
            const found = results.find(r => r._id === index + 1)
            return {
                label,
                total: found?.total || 0
            }
        })

        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch yearly data' }, { status: 500 })
    }
}
