// middleware.ts (root)
import { withAuth } from "next-auth/middleware"

export default withAuth(
    function middleware(req) {
        // Logic suplimentar dacă e necesar
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // Doar admin poate accesa /admin
                if (req.nextUrl.pathname.startsWith("/admin")) {
                    return token?.role === "admin"
                }
                return !!token
            },
        },
    }
)

export const config = {
    matcher: ["/admin/:path*"]
}