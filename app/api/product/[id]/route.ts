// pages/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/lib/models/Product";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
    try {

        await connectToDatabase();
        const id = await params.id;
        const product = await Product.findById(id); // Optionally: `.populate('refId')`
        return NextResponse.json({ product });
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}
