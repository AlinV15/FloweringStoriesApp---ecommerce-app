// pages/api/products/route.ts
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/lib/models/Product";

export async function GET() {
    try {
        await connectToDatabase();
        const products = await Product.find(); // Optionally: `.populate('refId')`
        return NextResponse.json({ products });
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}
