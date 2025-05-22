import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import { productSchema, stationarySchema } from "@/lib/validators";
import { z } from "zod";
import Stationary from "@/lib/models/Stationary";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// combinăm schema: validăm book și product (fără refId!)
const stnyProductSchema = z.object({
    stationary: stationarySchema,
    product: productSchema.omit({ refId: true, type: true, typeRef: true })
});

export async function GET() {
    try {
        await connectToDatabase()
        const stationaries = await Stationary.find()
        const productStationary = await Product.find(
            { type: "stationary" }
        )

        const data = { stationaries, productStationary }

        return NextResponse.json(data)
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Error from server" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Doar adminii pot crea produse" }, { status: 403 });
    }
    await connectToDatabase();
    const body = await req.json();


    const parsed = stnyProductSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
    }

    const { stationary, product } = parsed.data;

    try {
        const createdStny = await Stationary.create(stationary);

        const createdProduct = await Product.create({
            ...product,
            refId: createdStny._id,
            type: "stationary",
            typeRef: "Stationary"
        });

        return NextResponse.json({ createdStny, product: createdProduct }, { status: 201 });
    } catch (error) {
        console.error("Error in creating the product or stationary", error);
        return NextResponse.json({ message: "Server error", error }, { status: 500 });
    }
}