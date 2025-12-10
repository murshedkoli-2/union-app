import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Define public paths that don't require auth
    const isPublicPath =
        path === '/login' ||
        path.startsWith('/api/auth') ||
        path.startsWith('/api/public') ||
        path.startsWith('/api/verify') ||
        path.startsWith('/verify') ||
        path.startsWith('/api/certificate-types') || // Keep types public for form 
        path === '/';

    // Protect all other routes starting with /admin or /api (excluding public ones)
    if ((path.startsWith('/admin') || path.startsWith('/api')) && !isPublicPath) {
        const token = request.cookies.get('auth_token');

        if (!token) {
            // API requests return JSON 401, Pages redirect to Login
            if (path.startsWith('/api')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Redirect /login to dashboard if already logged in
    if (path === '/login') {
        const token = request.cookies.get('auth_token');
        if (token) {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/api/:path*',
        '/login'
    ],
};
