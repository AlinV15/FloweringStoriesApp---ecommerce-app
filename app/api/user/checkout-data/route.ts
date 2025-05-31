// app/api/user/checkout-data/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        await connectToDatabase();

        // Get user with address
        const user = await User.findById(session.user.id)
            .populate('address')
            .select('firstName lastName email phone newsletter address')
            .lean() as any;

        if (!user) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        const checkoutData = {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            newsletter: user.newsletter || false,
            address: user.address ? {
                street: user.address.street || '',
                city: user.address.city || '',
                state: user.address.state || '',
                postalCode: user.address.postalCode || '',
                country: user.address.country || 'Romania',
                details: user.address.details || ''
            } : null
        };

        return NextResponse.json({
            success: true,
            data: checkoutData
        });

    } catch (error) {
        console.error("Error fetching checkout data:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Server error",
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}