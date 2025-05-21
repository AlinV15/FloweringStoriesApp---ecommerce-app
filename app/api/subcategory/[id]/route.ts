// app/api/subcategory/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import Subcategory from "@/lib/models/Subcategory";
import { subcategorySchema } from "@/lib/validators";

// PATCH /api/subcategory/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Doar adminii pot modifica" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = subcategorySchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const id = await params.id;
    await connectToDatabase();
    const updated = await Subcategory.findByIdAndUpdate(id, parsed.data, { new: true });
    if (!updated) {
        return NextResponse.json({ error: "Subcategoria nu există" }, { status: 404 });
    }

    return NextResponse.json(updated);
}

// DELETE /api/subcategory/[id]
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    const id = await params.id;
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Doar adminii pot șterge" }, { status: 403 });
    }

    await connectToDatabase();
    const deleted = await Subcategory.findByIdAndDelete(id);
    if (!deleted) {
        return NextResponse.json({ error: "Subcategoria nu a fost găsită" }, { status: 404 });
    }

    return NextResponse.json({ message: "Subcategorie ștearsă cu succes" });
}
