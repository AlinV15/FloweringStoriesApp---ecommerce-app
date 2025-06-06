// /app/api/auth/[...nextauth]/route.ts - VERSIUNEA CURATĂ
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // ✅ Import din fișierul separat

const handler = NextAuth(authOptions);

// ✅ Exportă doar handler-ele pentru GET și POST
export { handler as GET, handler as POST };
