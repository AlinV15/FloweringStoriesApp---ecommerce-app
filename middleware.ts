// middleware.ts (root)
import { withAuth } from "next-auth/middleware"
import { NextRequest, NextResponse } from "next/server";
// Funcție separată pentru verificarea maintenance mode
async function checkMaintenanceMode(request: NextRequest) {
    // Skip verificarea pentru admin și API routes
    if (request.nextUrl.pathname.startsWith('/admin') ||
        request.nextUrl.pathname.startsWith('/api') ||
        request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname === '/maintenance') {
        return null;
    }

    try {
        // Fetch shop settings pentru a verifica maintenance mode
        const settingsResponse = await fetch(`${request.nextUrl.origin}/api/shop-settings`, {
            headers: {
                'Cache-Control': 'no-cache',
                'User-Agent': 'NextJS-Middleware'
            }
        });

        if (settingsResponse.ok) {
            const settings = await settingsResponse.json();

            if (settings.features?.maintenanceMode) {
                // Redirect către pagina de maintenance
                return NextResponse.redirect(new URL('/maintenance', request.url));
            }
        }
    } catch (error) {
        console.error('Middleware maintenance check error:', error);
        // În caz de eroare, permite accesul normal
    }

    return null;
}

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
    // Extinde matcher-ul pentru a include toate rutele
    matcher: [
        // Admin routes (autentificare necesară)
        "/admin/:path*",
        // Toate celelalte rute publice (pentru maintenance check)
        "/((?!api|_next/static|_next/image|favicon.ico|maintenance).*)"
    ]
}