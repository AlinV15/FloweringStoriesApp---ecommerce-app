// /lib/auth.ts - Configurația NextAuth separată
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import bcrypt from "bcrypt";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import type { NextAuthOptions } from "next-auth";
import crypto from "crypto";

interface TokenWithId {
    id: string;
    [key: string]: any;
    role: string;
}

interface AppUser {
    id: string;
    email: string;
    name: string;
    role: "user" | "admin";
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            // ✅ FĂRĂ scope-uri suplimentare - doar cele de bază
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials): Promise<AppUser | null> {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required.");
                }

                await connectToDatabase();
                const user = await User.findOne({ email: credentials.email }).lean() as unknown as {
                    _id: string;
                    email: string;
                    password: string;
                    firstName?: string;
                    lastName?: string;
                    role?: "user" | "admin"
                };

                if (!user || !user.password) {
                    throw new Error("User not found.");
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) {
                    throw new Error("Invalid password.");
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
                    role: user.role || "user",
                };
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google" || account?.provider === "facebook") {
                await connectToDatabase();

                const existingUser = await User.findOne({ email: user.email });

                if (!existingUser) {
                    console.log('🔍 Google Profile Data:', profile);

                    // ✅ Doar datele de bază de la Google
                    const firstName = (profile as any)?.given_name || user.name?.split(" ")[0] || "";
                    const lastName = (profile as any)?.family_name || user.name?.split(" ").slice(1).join(" ") || "";

                    // Generate random password and hash it
                    const randomPassword = crypto.randomBytes(16).toString("hex");
                    const hashedPassword = await bcrypt.hash(randomPassword, 10);

                    await User.create({
                        email: user.email,
                        firstName,
                        lastName,
                        password: hashedPassword,
                        role: "user",
                        // ✅ Setează valorile default pentru câmpurile noi
                        birthDate: null,
                        genre: "",
                        phone: "",
                        newsletter: false,
                        emailVerified: true,
                        isActive: true
                    });

                    console.log('✅ User created successfully');
                } else {
                    console.log('👤 Existing user found, logging in');

                    // ✅ Migrație pentru utilizatori existenți
                    const updateFields: any = {};

                    if (existingUser.emailVerified === undefined) {
                        updateFields.emailVerified = true;
                    }
                    if (existingUser.isActive === undefined) {
                        updateFields.isActive = true;
                    }
                    if (existingUser.phone === undefined) {
                        updateFields.phone = "";
                    }
                    if (existingUser.newsletter === undefined) {
                        updateFields.newsletter = false;
                    }
                    if (existingUser.genre === undefined) {
                        updateFields.genre = "";
                    }

                    if (Object.keys(updateFields).length > 0) {
                        await User.findByIdAndUpdate(existingUser._id, updateFields);
                        console.log('✅ Updated existing user with missing fields');
                    }
                }
            }

            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.role = user.role;
            }

            if (!token.role && token.email) {
                await connectToDatabase();
                const dbUser = await User.findOne({ email: token.email });
                if (dbUser) {
                    token.role = dbUser.role;
                    token.id = dbUser._id.toString();
                }
            }

            return token;
        },

        async session({ session, token }) {
            if (token) {
                session.user.id = (token as TokenWithId).id;
                session.user.role = token.role;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};