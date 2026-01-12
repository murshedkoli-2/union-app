'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { SettingsData } from '@/types';
import { defaultSettings } from '@/lib/mockData';

interface SettingsContextType {
    settings: SettingsData;
    updateSettings: (newSettings: Partial<SettingsData>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({
    children,
    initialSettings
}: {
    children: ReactNode;
    initialSettings: SettingsData;
}) {
    const [settings, setSettings] = React.useState<SettingsData>(initialSettings || defaultSettings);

    const updateSettings = async (newSettings: Partial<SettingsData>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
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
