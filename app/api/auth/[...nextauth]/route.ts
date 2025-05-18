import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import bcrypt from "bcrypt";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import type { NextAuthOptions } from "next-auth";
import crypto from "crypto"

interface TokenWithId {
    id: string;
    [key: string]: any;
    role: string;
}

interface AppUser {
    id: string;
    email: string;
    name: string;
    role: "user" | "admin"; // ✅ explicit, conform NextAuth types
}


export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
                    throw new Error("Email și parolă lipsă.");
                }

                await connectToDatabase();
                const user = await User.findOne({ email: credentials.email }).lean() as unknown as {
                    _id: string;
                    email: string;
                    password: string;
                    name?: string;
                    role?: "user" | "admin"
                };

                if (!user || !user.password) {
                    throw new Error("Utilizator inexistent.");
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) {
                    throw new Error("Parolă incorectă.");
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name || user.email,
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
                    const firstName = (profile as any)?.given_name || user.name?.split(" ")[0] || "";
                    const lastName = (profile as any)?.family_name || user.name?.split(" ").slice(1).join(" ") || "";

                    // Generează parolă random și o hash-uiește
                    const randomPassword = crypto.randomBytes(16).toString("hex");
                    const hashedPassword = await bcrypt.hash(randomPassword, 10);

                    await User.create({
                        email: user.email,
                        firstName,
                        lastName,
                        password: hashedPassword, // acum e mereu prezent
                        role: user.role,
                        image: user.image,
                    });
                }
            }

            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                console.log(user.role)
                token.id = user.id;
                token.email = user.email; // ✅ adaugă această linie
                token.role = user.role;
            }

            // Dacă token.role lipsește (ex: la refresh), extrage-l din DB
            if (!token.role && token.email) {
                await connectToDatabase();
                const dbUser = await User.findOne({ email: token.email });
                if (dbUser) {
                    token.role = dbUser.role;
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

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
