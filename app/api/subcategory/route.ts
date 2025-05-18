// app/api/subcategory/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import Subcategory from "@/lib/models/Subcategory";
import { subcategorySchema } from "@/lib/validators";



// GET /api/subcategory
export async function GET() {
    await connectToDatabase();
    const items = await Subcategory.find();
    return NextResponse.json(items);
}

// POST /api/subcategory
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Doar adminii pot crea subcategorii" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = subcategorySchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await connectToDatabase();
    const existing = await Subcategory.findOne({ name: parsed.data.name });
    if (existing) {
        return NextResponse.json({ error: "Subcategoria există deja" }, { status: 409 });
    }

    const newItem = await Subcategory.create(parsed.data);
    return NextResponse.json(newItem, { status: 201 });
}
