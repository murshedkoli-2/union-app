import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { getRequestAuthSession } from '@/lib/server/auth/cookie';
import { getRouteAccess } from '@/lib/server/route-access';

export function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const access = getRouteAccess(pathname, request.method);
    const session = getRequestAuthSession(request);

    if (pathname === '/login' && session) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    if (access?.access === 'protected' && !session) {
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/',
        '/apply/:path*',
        '/verify/:path*',
        '/admin/:path*',
        '/api/:path*',
        '/login',
    ],
};
