// middleware.ts (root) - VERSIUNEA CORECTATĂ
import { withAuth } from "next-auth/middleware"
import { NextRequest, NextResponse } from "next/server";

// Funcție separată pentru verificarea maintenance mode
async function checkMaintenanceMode(request: NextRequest) {
    // Skip verificarea pentru admin, API routes, auth routes și static files
    if (request.nextUrl.pathname.startsWith('/admin') ||
        request.nextUrl.pathname.startsWith('/api') ||
        request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.startsWith('/auth') ||  // ✅ Adăugat
        request.nextUrl.pathname === '/maintenance' ||
        request.nextUrl.pathname === '/login' ||         // ✅ Adăugat
        request.nextUrl.pathname === '/register' ||      // ✅ Adăugat
        request.nextUrl.pathname === '/forgot-password' ||  // ✅ Adăugat
        request.nextUrl.pathname === '/reset-password') {   // ✅ Adăugat
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
    async function middleware(req) {
        // Verifică maintenance mode pentru rutele publice
        const maintenanceResponse = await checkMaintenanceMode(req);
        if (maintenanceResponse) {
            return maintenanceResponse;
        }

        // Permite accesul pentru admin routes (withAuth se ocupă de autentificare)
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // ✅ DOAR pentru admin routes verifică autentificarea
                if (req.nextUrl.pathname.startsWith("/admin")) {
                    return token?.role === "admin";
                }

                // ✅ Pentru toate celelalte rute, permite accesul (public)
                return true;
            },
        },
    }
)

export const config = {
    // ✅ MATCHER CORECT - doar admin routes trebuie protejate
    matcher: [
        // Doar admin routes (autentificare necesară)
        "/admin/:path*"
        // ❌ NU include toate rutele publice aici!
    ]
}