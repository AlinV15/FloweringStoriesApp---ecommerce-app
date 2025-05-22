// pages/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Book from "@/lib/models/Book";
import Stationary from "@/lib/models/Stationary";
import Flower from "@/lib/models/Flower";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
    try {

        await connectToDatabase();
        const id = await params.id;
        const product = await Product.findById(id);
        let prodType;
        switch (product.typeRef) {
            case "Book": prodType = await Book.findById(product.refId); break;
            case "Stationary": prodType = await Stationary.findById(product.refId); break;
            case "Flower": prodType = await Flower.findById(product.refId); break;

        } // Optionally: `.populate('refId')`
        return NextResponse.json({ product, prodType });
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}


export async function PUT(_: NextRequest, { params }: { params: { id: string } }) {
    try {
        const body = await _.json();
        await connectToDatabase();
        const par = await params
        const id = par.id;
        const product = await Product.findByIdAndUpdate(id, {
            $set: {
                subcategories: body.subcategories,
            },
        }, {
            new: true
        }); // Optionally: `.populate('refId')`
        return NextResponse.json({ product });
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}