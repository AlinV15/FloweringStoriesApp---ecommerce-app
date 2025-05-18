import Address from "@/lib/models/Address";
import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";


export async function GET() {
    try {
        await connectToDatabase();

        const adr = await Address.find()
        return NextResponse.json(adr, { status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Server error: " + error }, { status: 500 })
    }
}


export async function POST(req: NextRequest) {
    try {

        await connectToDatabase();

        const data = await req.json()
        const adr = await Address.create(data);
        return NextResponse.json(adr, { status: 201 })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Server error: " + error }, { status: 500 })
    }
}