import Address from "@/lib/models/Address";
import connectToDatabase from "@/lib/mongodb";
import { NextResponse } from "next/server";

// ✅ SOLUȚIA CORECTĂ - doar Promise, nu union type
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // ✅ Doar Promise
) {
    const { id } = await params; // ✅ Direct destructuring

    await connectToDatabase();
    const data = await request.json();

    const updated = await Address.findByIdAndUpdate(id, data, { new: true });
    return NextResponse.json(updated);
}

export async function DELETE(
    _: Request,
    { params }: { params: Promise<{ id: string }> } // ✅ Doar Promise
) {
    const { id } = await params; // ✅ Direct destructuring

    await connectToDatabase();
    await Address.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted successfully' });
}