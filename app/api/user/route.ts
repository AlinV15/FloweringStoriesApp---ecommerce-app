// app/api/user/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import { z } from "zod";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';


export async function POST(req: NextRequest) {
    try {
        // Rate limiting
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
        const rateLimit = checkRateLimit(ip, 5, 15 * 60 * 1000); // 5 attempts in 15 min

        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: "Too many attempts. Please try again later." },
                { status: 429 }
            );
        }

        await connectToDatabase();
        const body = await req.json();


        const registerSchema = z.object({
            email: z.string().email().max(255),
            password: z.string()
                .min(8, "Password must be at least 8 characters")
                .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase and numbers"),
            firstName: z.string().min(1).max(50).trim(),
            lastName: z.string().min(1).max(50).trim(),
        });

        const parsed = registerSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({
                error: "Invalid data",
                details: parsed.error.flatten()
            }, { status: 400 });
        }

        const { email, password, firstName, lastName } = parsed.data;

        // Check email case-insensitive
        const existingUser = await User.findOne({
            email: { $regex: new RegExp(`^${email}$`, 'i') }
        });

        if (existingUser) {
            return NextResponse.json({ error: "Email already in use" }, { status: 409 });
        }

        // Hash password with higher cost for security
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            email: email.toLowerCase(), // Normalize email
            password: hashedPassword,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            role: "user",
        });

        return NextResponse.json({
            message: "User created successfully",
            userId: user._id
        });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
// În GET route pentru users
// In GET route for users
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Only admin can see user list
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        await connectToDatabase();

        // Exclude sensitive information
        const users = await User.find({}, {
            password: 0,
            __v: 0
        }).sort({ createdAt: -1 });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Get users error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}