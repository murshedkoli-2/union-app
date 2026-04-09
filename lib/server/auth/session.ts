import { cookies } from 'next/headers';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import type { NextResponse } from 'next/server';

import type { AuthSession, AuthUser } from '@/types';
import { AUTH_COOKIE_MAX_AGE, AUTH_COOKIE_NAME, parseAuthSessionValue } from '@/lib/server/auth/cookie';

const authCookieOptions: Partial<ResponseCookie> = {
    httpOnly: true,
    maxAge: AUTH_COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
};

export async function getAuthSession(): Promise<AuthSession | null> {
    const cookieStore = await cookies();
    return parseAuthSessionValue(cookieStore.get(AUTH_COOKIE_NAME)?.value);
}

export async function setAuthSession(session: AuthSession) {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, JSON.stringify(session), authCookieOptions);
}

export function clearAuthSession(response: NextResponse) {
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
}

export async function getAuthenticatedUser(): Promise<AuthUser | null> {
    const session = await getAuthSession();

    if (!session) {
        return null;
    }

    try {
        const [{ default: dbConnect }, { default: User }] = await Promise.all([
            import('@/lib/mongodb'),
            import('@/models/User'),
        ]);
        await dbConnect();
        const user = await User.findById(session.id).select('-password').lean();

        if (!user) {
            return null;
        }

        const normalizedUser = user as {
            _id?: { toString?: () => string } | string;
            email?: string;
            name?: string;
            role?: string;
            username?: string;
        };
        const userId =
            typeof normalizedUser._id === 'string'
                ? normalizedUser._id
                : normalizedUser._id?.toString?.();

        return {
            _id: userId,
            email: normalizedUser.email,
            id: userId,
            name: normalizedUser.name,
            role: normalizedUser.role,
            username: normalizedUser.username,
        };
    } catch {
        return null;
    }
}
