import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import { flowerSchema, productSchema } from "@/lib/validators";
import { z } from "zod";
import Flower from "@/lib/models/Flower";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// combinăm schema: validăm book și product (fără refId!)
const flowerProductSchema = z.object({
    flower: flowerSchema,
    product: productSchema.omit({ refId: true, type: true, typeRef: true })
});

export async function GET() {
    await connectToDatabase()
    const flowers = await Flower.find()
    const productsFlower = await Product.find(
        { type: "flower" }
    )

    const data = { flowers, productsFlower }

    return NextResponse.json({ data }, { status: 200 })
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Doar adminii pot crea produse" }, { status: 403 });
    }
    await connectToDatabase();
    const body = await req.json();

    const parsed = flowerProductSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
    }

    const { flower, product } = parsed.data;

    try {
        const createdFlower = await Flower.create(flower);

        const createdProduct = await Product.create({
            ...product,
            refId: createdFlower._id,
            type: "flower",
            typeRef: "Flower"
        });

        return NextResponse.json({ book: createdFlower, product: createdProduct }, { status: 201 });
    } catch (error) {
        console.error("Eroare la creare carte + produs:", error);
        return NextResponse.json({ message: "Server error", error }, { status: 500 });
    }
}