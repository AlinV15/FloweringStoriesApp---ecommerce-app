// app/api/review/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectToDatabase from "@/lib/mongodb";
import Review from "@/lib/models/Review";
import { reviewSchema } from "@/lib/validators";



// POST /api/review
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await connectToDatabase();

    const review = await Review.create({
        ...parsed.data,
        user: session.user.id
    });

    return NextResponse.json(review, { status: 201 });
}

// GET /api/review?productId=...
export async function GET(req: NextRequest) {
    const productId = req.nextUrl.searchParams.get("productId");
    if (!productId) {
        return NextResponse.json({ error: "productId lipsă" }, { status: 400 });
    }

    await connectToDatabase();
    const reviews = await Review.find({ product: productId }).populate("user", "firstName lastName");

    return NextResponse.json(reviews);
}
