import type { NextRequest } from 'next/server';

import type { AuthSession } from '@/types';

export const AUTH_COOKIE_NAME = 'auth_token';
export const AUTH_COOKIE_MAX_AGE = 24 * 60 * 60 * 1000;

export function parseAuthSessionValue(value?: string | null): AuthSession | null {
    if (!value) {
        return null;
    }

    try {
        const parsed = JSON.parse(value) as Partial<AuthSession>;

        if (typeof parsed.id !== 'string' || typeof parsed.role !== 'string') {
            return null;
        }

        return {
            id: parsed.id,
            role: parsed.role,
        };
    } catch {
        return null;
    }
}

export function getRequestAuthSession(request: NextRequest): AuthSession | null {
    return parseAuthSessionValue(request.cookies.get(AUTH_COOKIE_NAME)?.value);
}
