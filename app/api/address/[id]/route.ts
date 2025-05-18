import Address from "@/lib/models/Address";
import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    await connectToDatabase();
    const data = await request.json();

    const updated = await Address.findByIdAndUpdate(params.id, data, { new: true });
    return NextResponse.json(updated);
}

// DELETE /api/address/[id]
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
    await connectToDatabase();
    await Address.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Deleted successfully' });
}