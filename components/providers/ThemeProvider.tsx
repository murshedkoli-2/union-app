'use client';

import React, { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';

type Theme = 'dark' | 'light';
type ThemeMode = 'manual' | 'system-only';

interface ThemeContextType {
    mode: ThemeMode;
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
    mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
    children,
    mode = 'manual',
}: {
    children: React.ReactNode;
    mode?: ThemeMode;
}) {
    const mounted = useSyncExternalStore(
        () => () => undefined,
        () => true,
        () => false
    );
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window === 'undefined') return 'light';
        if (mode === 'system-only') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        if (mode === 'system-only') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const syncTheme = () => {
                setThemeState(mediaQuery.matches ? 'dark' : 'light');
            };

            mediaQuery.addEventListener('change', syncTheme);

            return () => mediaQuery.removeEventListener('change', syncTheme);
        }
    }, [mode]);

    useEffect(() => {
        const root = window.document.documentElement;
        root.setAttribute('data-theme', theme);
        if (mode === 'manual') {
            localStorage.setItem('theme', theme);
        }
    }, [mode, theme]);

    const toggleTheme = () => {
        if (mode === 'system-only') {
            return;
        }
        setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    const setTheme = (newTheme: Theme) => {
        if (mode === 'system-only') {
            return;
        }
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ mode, theme, toggleTheme, setTheme, mounted }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
