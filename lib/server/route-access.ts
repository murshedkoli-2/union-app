import type { RouteAccessRule } from '@/types';

type RouteAccessMatch = {
    access: RouteAccessRule['access'];
    rule: RouteAccessRule;
};

const routeAccessRules: RouteAccessRule[] = [
    { access: 'public', methods: ['GET'], pattern: '/' },
    { access: 'public', methods: ['GET'], pattern: '/apply/:path*' },
    { access: 'public', methods: ['GET'], pattern: '/verify/:path*' },
    { access: 'public', methods: ['GET'], pattern: '/login' },
    { access: 'public', methods: ['GET'], pattern: '/api/team' },
    { access: 'public', methods: ['GET'], pattern: '/api/dashboard/stats' },
    { access: 'public', methods: ['GET'], pattern: '/api/settings' },
    { access: 'public', methods: ['GET'], pattern: '/api/certificate-types/:path*' },
    { access: 'public', methods: ['GET'], pattern: '/api/verify' },
    { access: 'public', methods: ['POST'], pattern: '/api/auth/login' },
    { access: 'public', methods: ['POST'], pattern: '/api/auth/login/verify' },
    { access: 'public', pattern: '/api/public/:path*' },
    { access: 'protected', pattern: '/admin/:path*' },
    { access: 'protected', methods: ['GET', 'PUT'], pattern: '/api/auth/profile' },
    { access: 'protected', methods: ['POST'], pattern: '/api/auth/logout' },
    { access: 'protected', methods: ['POST'], pattern: '/api/auth/change-password' },
    { access: 'protected', methods: ['POST'], pattern: '/api/auth/otp/:path*' },
    { access: 'protected', methods: ['POST', 'PUT', 'DELETE', 'PATCH'], pattern: '/api/team' },
    { access: 'protected', pattern: '/api/:path*' },
];

function normalizePathname(pathname: string) {
    if (pathname.length > 1 && pathname.endsWith('/')) {
        return pathname.slice(0, -1);
    }

    return pathname;
}

function escapePatternSegment(segment: string) {
    return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesPattern(pathname: string, pattern: string) {
    const normalizedPath = normalizePathname(pathname);
    const normalizedPattern = normalizePathname(pattern);

    if (normalizedPattern === '/') {
        return normalizedPath === '/';
    }

    if (normalizedPattern.endsWith('/:path*')) {
        const basePattern = normalizedPattern.slice(0, -'/:path*'.length);
        return normalizedPath === basePattern || normalizedPath.startsWith(`${basePattern}/`);
    }

    return new RegExp(`^${escapePatternSegment(normalizedPattern)}$`).test(normalizedPath);
}

export function getRouteAccess(pathname: string, method: string): RouteAccessMatch | null {
    const normalizedMethod = method.toUpperCase();

    for (const rule of routeAccessRules) {
        if (rule.methods && !rule.methods.includes(normalizedMethod)) {
            continue;
        }

        if (matchesPattern(pathname, rule.pattern)) {
            return {
                access: rule.access,
                rule,
            };
        }
    }

    return null;
}

export function isProtectedRoute(pathname: string, method: string) {
    return getRouteAccess(pathname, method)?.access === 'protected';
}

export function isPublicRoute(pathname: string, method: string) {
    return getRouteAccess(pathname, method)?.access === 'public';
}
