// app/api/review/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectToDatabase from "@/lib/mongodb";
import Review from "@/lib/models/Review";

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

    await connectToDatabase();
    const review = await Review.findById(params.id);

    if (!review) {
        return NextResponse.json({ error: "Recenzie inexistentă" }, { status: 404 });
    }

    const isOwner = review.user.toString() === session.user.id;
    const isAdmin = (session.user as any).role === "admin";

    if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: "Nu ai permisiune" }, { status: 403 });
    }

    await Review.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Recenzie ștearsă" });
}
