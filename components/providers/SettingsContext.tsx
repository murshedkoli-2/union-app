'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { SettingsData } from '@/types';
import { defaultSettings } from '@/lib/mockData';

interface SettingsContextType {
    settings: SettingsData;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({
    children,
    initialSettings
}: {
    children: ReactNode;
    initialSettings: SettingsData;
}) {
    // We use the initial settings passed from the server
    // In a real-time app, we might also want to refetch or sync these,
    // but for this requirement, server-passed data is sufficient and efficient.

    return (
        <SettingsContext.Provider value={{ settings: initialSettings || defaultSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
