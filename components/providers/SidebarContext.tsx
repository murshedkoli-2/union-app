'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    toggleSidebar: () => void;
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
    toggleMobile: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        const savedState = localStorage.getItem('sidebarCollapsed');
        if (savedState) {
            setCollapsed(JSON.parse(savedState));
        }
    }, [mounted]);

    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
    }, [collapsed, mounted]);

    const toggleSidebar = () => setCollapsed(!collapsed);
    const toggleMobile = () => setMobileOpen(!mobileOpen);

    return (
        <SidebarContext.Provider value={{
            collapsed,
            setCollapsed,
            toggleSidebar,
            mobileOpen,
            setMobileOpen,
            toggleMobile
        }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
}
