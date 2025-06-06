// app/api/user/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
// Update the import path below to the actual location of your [...nextauth].ts file
// Update the path below to the correct location of your [...nextauth].ts file
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import { z } from "zod";
import bcrypt from "bcrypt";


export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const { id } = await params
    if (!session || session.user.id !== id) {
        return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    await connectToDatabase();
    const user = await User.findById(id).select("-password");
    if (!user) return NextResponse.json({ error: "Utilizatorul nu există" }, { status: 404 });

    return NextResponse.json(user);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);



    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    await connectToDatabase();
    const prms = await params
    const id = await prms.id
    const body = await req.json();
    const updateUserSchema = z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        birthDate: z.string().optional(),
        genre: z.enum(["man", "woman", "other"]).optional(),
        role: z.enum(["user", "admin"]).optional(),
    });

    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const updates: any = parsed.data;
    if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true }).select("-password");
    if (!updatedUser) return NextResponse.json({ error: "Utilizatorul nu a fost găsit" }, { status: 404 });

    return NextResponse.json(updatedUser);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    await connectToDatabase();
    const prms = await params
    const id = await prms.id
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
        return NextResponse.json({ error: "Utilizator inexistent" }, { status: 404 });
    }

    return NextResponse.json({ message: "Utilizator șters cu succes" });
}
