// app/api/user/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import { z } from "zod";

// Schema de validare a datelor pentru înregistrare
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
});

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const body = await req.json();

        const parsed = registerSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
        }

        const { email, password, firstName, lastName } = parsed.data;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "Email deja folosit" }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: "user",
        });

        return NextResponse.json({ message: "Utilizator creat cu succes", userId: user._id });
    } catch (error) {
        return NextResponse.json({ error: "Eroare internă" }, { status: 500 });
    }
}

