'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { AuthContextValue, AuthSession, AuthUser } from '@/types';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({
    children,
    initialSession = null,
    initialUser = null,
}: {
    children: React.ReactNode;
    initialSession?: AuthSession | null;
    initialUser?: AuthUser | null;
}) {
    const [session, setSession] = useState<AuthSession | null>(initialSession);
    const [user, setUser] = useState<AuthUser | null>(initialUser);
    const [status, setStatus] = useState<AuthContextValue['status']>(() => {
        if (!initialSession) {
            return 'unauthenticated';
        }

        return initialUser ? 'authenticated' : 'loading';
    });

    const refreshProfile = useCallback(async () => {
        if (!session) {
            setUser(null);
            setStatus('unauthenticated');
            return null;
        }

        setStatus('loading');

        try {
            const response = await fetch('/api/auth/profile', {
                cache: 'no-store',
            });

            if (!response.ok) {
                setSession(null);
                setUser(null);
                setStatus('unauthenticated');
                return null;
            }

            const profile = (await response.json()) as AuthUser;
            setUser(profile);
            setStatus('authenticated');
            return profile;
        } catch {
            setStatus('unauthenticated');
            return null;
        }
    }, [session]);

    const logout = useCallback(async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
            });
        } finally {
            setSession(null);
            setUser(null);
            setStatus('unauthenticated');
            window.location.href = '/login';
        }
    }, []);

    useEffect(() => {
        if (session && !user) {
            void refreshProfile();
        }
    }, [refreshProfile, session, user]);

    const value = useMemo<AuthContextValue>(
        () => ({
            logout,
            refreshProfile,
            session,
            status,
            user,
        }),
        [logout, refreshProfile, session, status, user]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}
