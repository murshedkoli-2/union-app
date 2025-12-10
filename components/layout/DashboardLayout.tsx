'use client';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useSidebar } from '@/components/providers/SidebarContext';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { collapsed } = useSidebar();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch by only rendering sidebar dependent styles after mount
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="flex min-h-screen bg-background font-sans antialiased text-foreground">
            <Sidebar />
            <div
                className={cn(
                    "flex-1 flex flex-col transition-all duration-300 ease-in-out min-h-screen",
                    mounted ? (collapsed ? "ml-[80px]" : "ml-[260px]") : "ml-[260px]"
                )}
            >
                <Header />
                <main className="flex-1 overflow-y-auto bg-muted/30">
                    <div className="container mx-auto px-4 py-8 md:px-8 md:py-10 max-w-7xl space-y-8 animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
